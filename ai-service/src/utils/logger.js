const logger = {
  info: (msg, data) => console.log(`[AI INFO] ${msg}`, data !== undefined ? data : ''),
  error: (msg, err) => console.error(`[AI ERROR] ${msg}`, err || ''),
  warn: (msg, data) => console.warn(`[AI WARN] ${msg}`, data !== undefined ? data : ''),
};

module.exports = logger;
