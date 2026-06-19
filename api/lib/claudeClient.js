// api/lib/claudeClient.js
//
// Claude API 호출을 한 곳으로 모은다. setup/turn/debrief 세 엔드포인트가
// 각자 fetch 옵션, 모델명, 에러 처리를 중복 작성하지 않게 한다.
// 모델을 바꾸거나 재시도 로직을 넣을 때 여기 한 곳만 고치면 된다.

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1000;

/**
 * @param {string} systemPrompt
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages
 * @returns {Promise<string>} 모델 응답의 텍스트 본문
 */
async function callClaude(systemPrompt, messages) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages
    })
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Claude API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find(block => block.type === 'text');

  if (!textBlock) {
    throw new Error('Claude API returned no text content');
  }

  return textBlock.text;
}

module.exports = { callClaude };