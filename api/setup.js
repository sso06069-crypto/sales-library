// api/setup.js
//
// [1단계: 상황 설정] — 챗봇이 역할/상황을 인지하고 첫 대사를 던진다.
//
// 요청 body:
//   { botType: 'episode'|'main', episode: {...}, customerType?: string, situation?: string }
// 응답 body:
//   { reply: string, status: 'ongoing'|'success'|'fail', score: number, systemPrompt: string }
//
// score가 0 또는 100으로 도달하면 status도 즉시 success/fail로 확정된다 (이론상 첫 턴에
// 모델이 극단적 점수를 줄 수도 있으므로, 매 턴과 동일한 deriveStatusFromScore 규칙을 적용).
//
// systemPrompt를 응답에 함께 돌려주는 이유: 이후 /api/turn, /api/debrief 호출 때
// 프론트가 동일한 systemPrompt를 다시 보내야 대화 맥락(역할 설정)이 유지된다.
// (서버는 세션을 들고 있지 않는 stateless 구조이므로, 클라이언트가 systemPrompt를
//  대화 내내 들고 다니다가 매 요청에 동봉한다.)

const { buildSystemPrompt } = require('./lib/promptBuilder');
const { callClaude } = require('./lib/claudeClient');
const { parseTurnResponse, deriveStatusFromScore } = require('./lib/responseParser');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { botType, episode, customerType, situation } = req.body;

    if (botType !== 'episode' && botType !== 'main') {
      return res.status(400).json({ error: "botType must be 'episode' or 'main'" });
    }

    const systemPrompt = buildSystemPrompt(botType, { episode, customerType, situation });

    const raw = await callClaude(systemPrompt, [
      { role: 'user', content: '(대화를 시작하세요.)' }
    ]);

    const parsed = parseTurnResponse(raw);
    const score = 50; // 항상 50으로 시작, reaction은 첫 대사라 무시

    const status = deriveStatusFromScore(score);
    res.status(200).json({ reply: parsed.reply, status, score, systemPrompt });

    const status = deriveStatusFromScore(score);
    res.status(200).json({ reply: parsed.reply, status, score, systemPrompt });
  } catch (error) {
    console.error('[/api/setup] error:', error);
    res.status(500).json({ error: error.message });
  }
};