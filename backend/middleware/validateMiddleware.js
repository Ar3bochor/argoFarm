// Path: backend/middleware/validateMiddleware.js
// Description: Provides reusable middleware for checking 
// required fields and sanitizing request body data.

// Checks that all required fields are present in req.body.
export const requireFields = (fields) => (req, res, next) => {
  const missing = fields.filter(
    (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ""
  );

  if (missing.length) {
    res.status(400);
    return next(new Error(`Missing required fields: ${missing.join(", ")}`));
  }

  next();
};

// Removes unsafe keys and trims top-level string values from req.body.
export const sanitizeBody = (req, res, next) => {
  const forbidden = ["__proto__", "constructor", "prototype"];

  for (const key of forbidden) {
    delete req.body[key];
  }

  for (const [key, val] of Object.entries(req.body)) {
    if (typeof val === "string") req.body[key] = val.trim();
  }

  next();
};