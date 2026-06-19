// api/turn.js
//
// [2단계: 대화] — 사용자의 한 턴을 받아 응답 + 상태(ongoing/success/fail) + 점수를 반환한다.
//
// 요청 body:
//   {
//     systemPrompt: string,         // /api/setup이 돌려준 systemPrompt 그대로
//     messages: [{role, content}],  // 지금까지의 전체 대화 기록 (사용자가 방금 보낸 메시지 포함)
//     previousScore?: number,       // 직전 턴의 점수 (모델이 SCORE를 누락했을 때 fallback용)
//     forceEnd?: boolean            // true면 "조기 종료" 버튼을 눌렀다는 뜻
//   }
// 응답 body:
//   { reply: string, status: 'ongoing'|'success'|'fail', score: number, messages: [...] }
//
// 종료 판정의 단일 권위는 SCORE다 (모델의 자의적 텍스트 선언이 아님):
//   score <= 0   → 서버가 'fail'로 강제 종료
//   score >= 100 → 서버가 'success'로 강제 종료
//   그 외        → 'ongoing'
// 이 규칙은 lib/responseParser.js의 deriveStatusFromScore()에 있다.
//
// forceEnd 처리:
// - 모델에게 "0 또는 100 중 하나로 맞춰서 답하라"는 트리거 문구를 보낸다 (promptBuilder.js의
//   안내문과 반드시 짝이 맞아야 함 — 문구를 바꾸면 두 파일을 함께 바꿀 것).
// - 그래도 모델이 1~99 사이 점수를 내려보내면(드물지만 가능), 서버가 안전하게
//   0 또는 100으로 스냅(snap)한다. 기준은 직전 점수(previousScore) 대비 더 가까운 쪽.

const { callClaude } = require('./lib/claudeClient');
const { parseTurnResponse, deriveStatusFromScore } = require('./lib/responseParser');

const FORCE_END_TRIGGER =
  '(지금까지의 대화를 기준으로 점수를 0 또는 100 중 하나로 명확히 맞추고, 역할 속 인물로서 마무리 멘트를 하세요)';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { systemPrompt, messages, previousScore, forceEnd } = req.body;

    if (!systemPrompt || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'systemPrompt and non-empty messages are required' });
    }

    const outgoingMessages = forceEnd
      ? [...messages, { role: 'user', content: FORCE_END_TRIGGER }]
      : messages;

    const raw = await callClaude(systemPrompt, outgoingMessages);
    const parsed = parseTurnResponse(raw);

    // 모델이 SCORE를 깜빡했을 경우, 직전 점수를 유지해서 흐름이 깨지지 않게 한다.
    // (대화 시작 첫 턴이라 previousScore 자체가 없으면 50점에서 시작)
    const fallbackScore = typeof previousScore === 'number' ? previousScore : 50;
    let score = parsed.score !== null ? parsed.score : fallbackScore;

    // forceEnd인데 모델이 0/100을 안 줬다면, 직전 점수 기준으로 더 가까운 쪽으로 스냅
    if (forceEnd && score !== 0 && score !== 100) {
      score = score >= fallbackScore ? 100 : 0;
    }

    const status = deriveStatusFromScore(score);
    const updatedMessages = [...outgoingMessages, { role: 'assistant', content: parsed.reply }];

    res.status(200).json({ reply: parsed.reply, status, score, messages: updatedMessages });
  } catch (error) {
    console.error('[/api/turn] error:', error);
    res.status(500).json({ error: error.message });
  }
};