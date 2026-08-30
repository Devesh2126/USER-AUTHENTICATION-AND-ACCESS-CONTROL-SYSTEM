const env = require('../config/env');

function sendError(res, status, message, code) {
  res.status(status).json({ success: false, message, code });
}

function notFoundHandler(req, res) {
  sendError(res, 404, 'Resource not found', 'NOT_FOUND');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Handle Body-Parser JSON syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'Invalid JSON payload provided', 'INVALID_JSON');
  }

  console.error(err);

  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message =
    status === 500 && env.nodeEnv === 'production'
      ? 'Something went wrong. Please try again later.'
      : err.message || 'Something went wrong. Please try again later.';

  sendError(res, status, message, code);
}

module.exports = { errorHandler, notFoundHandler };