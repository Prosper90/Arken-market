/**
 * AI Oracle Service
 *
 * Resolves prediction markets automatically using an AI model.
 * The AI is given the market question, the possible outcomes, and the end date,
 * and returns a verdict + confidence score.
 *
 * Provider: Anthropic (Claude) — set AI_ORACLE_PROVIDER=anthropic in .env
 * Fallback: OpenAI — set AI_ORACLE_PROVIDER=openai in .env
 *
 * Required env vars:
 *   AI_ORACLE_PROVIDER   = "anthropic" | "openai"
 *   ANTHROPIC_API_KEY    = sk-ant-...   (if using anthropic)
 *   OPENAI_API_KEY       = sk-...       (if using openai)
 *   AI_ORACLE_CONFIDENCE_THRESHOLD = 0.85  (default)
 */

const axios = require("axios");

const CONFIDENCE_THRESHOLD = parseFloat(process.env.AI_ORACLE_CONFIDENCE_THRESHOLD || "0.85");
const PROVIDER = process.env.AI_ORACLE_PROVIDER || "anthropic";

/**
 * Build the prompt for the AI oracle.
 */
function buildPrompt(question, outcomes, endDate) {
  const endDateStr = new Date(endDate).toISOString().split("T")[0];
  const outcomeList = outcomes.map((o, i) => `${i + 1}. ${o}`).join("\n");

  return `You are a factual market resolution oracle. Your job is to determine the correct outcome of a prediction market based on publicly available information.

Market Question: "${question}"
Market End Date: ${endDateStr}
Possible Outcomes:
${outcomeList}

Today's Date: ${new Date().toISOString().split("T")[0]}

Instructions:
- Based on verifiable, publicly available information, determine which outcome is correct.
- Respond ONLY with a valid JSON object, no markdown, no explanation outside the JSON.
- Format: { "verdict": "<exact outcome text>", "confidence": <0.0 to 1.0>, "reasoning": "<1 sentence>" }
- If you cannot determine the outcome with reasonable certainty, set confidence below 0.7.
- verdict must exactly match one of the outcomes listed above.`;
}

/**
 * Call Anthropic Claude API.
 */
async function callAnthropic(prompt) {
  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
    }
  );

  const text = response.data.content[0].text.trim();
  return JSON.parse(text);
}

/**
 * Call OpenAI API.
 */
async function callOpenAI(prompt) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
      temperature: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "content-type": "application/json",
      },
    }
  );

  const text = response.data.choices[0].message.content.trim();
  return JSON.parse(text);
}

/**
 * Resolve a market using AI.
 *
 * @param {object} market - Mongoose market document
 * @returns {{ verdict: string, confidence: number, reasoning: string, shouldAutoResolve: boolean }}
 */
async function resolveMarketWithAI(market) {
  const { question, outcomes, endDate } = market;

  if (!question || !outcomes || outcomes.length < 2) {
    throw new Error("Market is missing question or outcomes");
  }

  const prompt = buildPrompt(question, outcomes, endDate);

  let result;
  if (PROVIDER === "openai") {
    result = await callOpenAI(prompt);
  } else {
    result = await callAnthropic(prompt);
  }

  // Validate that the verdict matches one of the outcomes
  const matchedOutcome = outcomes.find(
    (o) => o.toLowerCase() === result.verdict.toLowerCase()
  );

  if (!matchedOutcome) {
    throw new Error(`AI returned verdict "${result.verdict}" which doesn't match any outcome`);
  }

  return {
    verdict: matchedOutcome,
    confidence: result.confidence,
    reasoning: result.reasoning || "",
    shouldAutoResolve: result.confidence >= CONFIDENCE_THRESHOLD,
  };
}

module.exports = { resolveMarketWithAI, CONFIDENCE_THRESHOLD };
