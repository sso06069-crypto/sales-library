// api/debrief.js
//
// [3단계: 최종 판단] — 전체 대화를 종합해 평가 리포트(JSON)를 생성한다.
// (마지막 턴에서 status가 success/fail로 확정된 직후, 또는 조기 종료 직후 1회 호출)
//
// 요청 body:
//   { systemPrompt: string, messages: [{role, content}] }  // 종료 시점까지의 전체 대화 기록
// 응답 body:
//   { result: 'success'|'fail'|'unknown', score: number|null, strengths: [...], improvements: [...], keyTakeaway: string, raw?: string }
//
// raw 필드는 result가 'unknown'일 때만 존재 — 모델이 JSON 형식을 안 지켰을 때
// 프론트가 "재시도" 버튼과 함께 원문을 보여줄 수 있게 한다 (ChatBot.jsx의 기존 패턴 유지).

const { callClaude } = require('./lib/claudeClient');
const { parseDebriefResponse } = require('./lib/responseParser');

const DEBRIEF_TRIGGER =
  '(아래는 지금까지의 전체 롤플레잉 대화입니다. 이 대화를 종합 평가하세요)';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { systemPrompt, messages } = req.body;

    if (!systemPrompt || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'systemPrompt and non-empty messages are required' });
    }

    const raw = await callClaude(systemPrompt, [
      ...messages,
      { role: 'user', content: DEBRIEF_TRIGGER }
    ]);

    const debrief = parseDebriefResponse(raw);
    res.status(200).json(debrief);
  } catch (error) {
    console.error('[/api/debrief] error:', error);
    res.status(500).json({
      result: 'unknown',
      score: null,
      strengths: [],
      improvements: [],
      keyTakeaway: '',
      raw: '디브리핑 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};