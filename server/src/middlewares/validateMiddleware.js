const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * Middleware that checks validation results from express-validator.
 * Throws a formatted ApiError if there are validation errors.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().map((err) => {
    return {
      field: err.path || err.param,
      message: err.msg
    };
  });

  return next(new ApiError(400, 'Validation constraints failed.', formattedErrors));
};

module.exports = validate;
