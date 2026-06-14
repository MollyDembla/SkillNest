const config = require('../config/env');

const AI_URL = config.aiServiceUrl;
const HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': config.aiServiceApiKey,
};
const TIMEOUT_MS = 5000;

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal, headers: { ...HEADERS, ...options.headers } });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

/**
 * Get AI-powered recommendations for a student.
 * Returns null if the AI service is unreachable (caller should fall back).
 */
const getRecommendations = async (studentId, limit = 8) => {
  try {
    const res = await fetchWithTimeout(`${AI_URL}/recommendations/${studentId}?limit=${limit}`);
    if (!res.ok) {
      console.warn(`[AI Bridge] Non-OK response: ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json.data?.recommendations || null;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[AI Bridge] Request timed out');
    } else {
      console.warn('[AI Bridge] AI service unreachable:', err.message);
    }
    return null;
  }
};

/**
 * Get progress stats for a student from the AI service.
 */
const getProgressStats = async (studentId) => {
  try {
    const res = await fetchWithTimeout(`${AI_URL}/progress/${studentId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
};

/**
 * Check AI service health.
 */
const ping = async () => {
  try {
    const res = await fetchWithTimeout(`${AI_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
};

module.exports = { getRecommendations, getProgressStats, ping };
