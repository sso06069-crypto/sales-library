const REACTION_RE = /\[REACTION:\s*(positive|neutral|negative)\]/i;

function deriveStatusFromScore(score) {
  if (score === 0) return 'fail';
  if (score === 100) return 'success';
  return 'ongoing';
}

function parseTurnResponse(rawText) {
  const match = rawText.match(REACTION_RE);
  const reaction = match ? match[1].toLowerCase() : null;
  const reply = rawText.replace(REACTION_RE, '').trim();
  return { reply, reaction };
}

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
    return { result: 'unknown', score: null, strengths: [], improvements: [], keyTakeaway: '', raw: rawText };
  }
}

function clampScore(n) {
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(100, n));
}

module.exports = { parseTurnResponse, parseDebriefResponse, deriveStatusFromScore };