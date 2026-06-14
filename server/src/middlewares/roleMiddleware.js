const ApiError = require('../utils/apiError');

/**
 * Restrict route access to specific user roles
 * @param {...string} roles - List of allowed roles (e.g. 'student', 'instructor', 'admin')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required to access this resource.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role "${req.user.role}" is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};

module.exports = { restrictTo };
