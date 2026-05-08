// Path: backend/middleware/asyncHandler.js
// Description: Wraps async route handlers so errors are 
// automatically passed to Express error middleware.

// Catches rejected promises from async controllers and 
// forwards them to next().
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;