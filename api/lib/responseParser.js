// api/lib/responseParser.js
//
// Claude 응답 텍스트에서 마커/JSON을 떼어내는 공유 파서.
// 프론트는 더 이상 직접 정규식을 돌리지 않고, 백엔드가 이미 파싱한
// 깔끔한 객체만 받는다. (이전: ChatBot.jsx의 parseStatus/parseDebriefJSON,
// RoleplayPanel.jsx의 [호감도]/[SESSION_END] 정규식 — 전부 여기로 통합)
//
// 종료 판정 방식 (중요):
// 모델이 텍스트로 "성공/실패"를 자의적으로 선언하는 방식([STATUS] 마커)은 더 이상 쓰지 않는다.
// 대신 모델은 매 턴 [SCORE: 0~100]만 내고, 종료 여부는 서버가 그 점수만 보고 객관적으로 결정한다.
//   - score === 0   → 서버가 'fail'로 확정
//   - score === 100 → 서버가 'success'로 확정
//   - 1~99          → 'ongoing'
// 이 규칙은 deriveStatusFromScore()에 있고, 모델의 텍스트 판단을 신뢰하지 않는다.

const REACTION_RE = /\[REACTION:\s*(positive|negative)\]/i;

/**
 * 점수만으로 종료 여부를 객관적으로 판정한다. (모델의 자의적 텍스트 판단을 배제)
 * @param {number|null} score
 * @returns {'ongoing'|'success'|'fail'}
 */
function deriveStatusFromScore(score) {
  if (score === 0) return 'fail';
  if (score === 100) return 'success';
  return 'ongoing';
}

/**
 * 매 턴(turn) 응답 파싱.
 * @param {string} rawText - Claude가 반환한 원문 텍스트
 * @returns {{ reply: string, status: 'ongoing'|'success'|'fail', score: number|null }}
 */
function parseTurnResponse(rawText) {
  const match = rawText.match(REACTION_RE);
  const reaction = match ? match[1].toLowerCase() : null; // 'positive' | 'negative' | null
  const reply = rawText.replace(REACTION_RE, '').trim();
  return { reply, reaction };
}

  const reply = rawText.replace(SCORE_RE, '').trim();
  const status = deriveStatusFromScore(score);

  return { reply, status, score };
}

/**
 * 디브리핑(최종 평가 리포트) 응답 파싱. 실패 시에도 절대 throw하지 않고
 * result: 'unknown'과 원문(raw)을 함께 돌려줘서 프론트가 안내 문구를 보여줄 수 있게 한다.
 * @param {string} rawText
 * @returns {{ result: 'success'|'fail'|'unknown', score: number|null, strengths: array, improvements: array, keyTakeaway: string, raw?: string }}
 */
function parseDebriefResponse(rawText) {
  try {
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const result = parsed.result === 'success' ? 'success' : parsed.result === 'fail' ? 'fail' : 'unknown';

    return {
      result,
      score: typeof parsed.score === 'number' ? clampScore(parsed.score) : null,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      keyTakeaway: typeof parsed.keyTakeaway === 'string' ? parsed.keyTakeaway : ''
    };
  } catch (e) {
    return {
      result: 'unknown',
      score: null,
      strengths: [],
      improvements: [],
      keyTakeaway: '',
      raw: rawText
    };
  }
}

function clampScore(n) {
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(100, n));
}

module.exports = { parseTurnResponse, parseDebriefResponse, deriveStatusFromScore };