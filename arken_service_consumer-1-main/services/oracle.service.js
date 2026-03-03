require("dotenv").config();
const axios = require("axios");

const OLYMPUS_AI_URL = process.env.OLYMPUS_AI_URL || "https://api.olympusai.io";
const OLYMPUS_API_KEY = process.env.OLYMPUS_API_KEY || "";

/**
 * Delphi — Oracle Layer
 * Fetches real-world facts about the market question from Olympus AI.
 * @param {string} question - The market question
 * @returns {Object} { facts, sources, timestamp }
 */
async function callDelphi(question) {
  try {
    const response = await axios.post(
      `${OLYMPUS_AI_URL}/delphi/query`,
      { question },
      {
        headers: {
          "x-api-key": OLYMPUS_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Delphi call failed:", error.message);
    throw new Error(`Delphi oracle unavailable: ${error.message}`);
  }
}

/**
 * Lex — Judgment Layer
 * Takes Delphi's facts and renders a Yes/No verdict.
 * @param {string} question - The market question
 * @param {string[]} outcomes - Array of possible outcomes
 * @param {Object} delphiData - Facts returned by Delphi
 * @returns {Object} { verdict, confidence, reasoning }
 */
async function callLex(question, outcomes, delphiData) {
  try {
    const response = await axios.post(
      `${OLYMPUS_AI_URL}/lex/judge`,
      { question, outcomes, facts: delphiData },
      {
        headers: {
          "x-api-key": OLYMPUS_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lex call failed:", error.message);
    throw new Error(`Lex judgment unavailable: ${error.message}`);
  }
}

/**
 * Ethos — Human Validation Layer
 * Submits a dispute to human validators who confirm or override Lex's verdict.
 * @param {string} marketId - MongoDB market ID
 * @param {string} verdict - The Lex verdict being disputed
 * @param {string} disputeReason - Why the user is disputing
 * @returns {Object} { disputeId, status, estimatedResolutionTime }
 */
async function callEthos(marketId, verdict, disputeReason) {
  try {
    const response = await axios.post(
      `${OLYMPUS_AI_URL}/ethos/dispute`,
      { marketId, verdict, reason: disputeReason },
      {
        headers: {
          "x-api-key": OLYMPUS_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Ethos call failed:", error.message);
    throw new Error(`Ethos validation unavailable: ${error.message}`);
  }
}

module.exports = { callDelphi, callLex, callEthos };
