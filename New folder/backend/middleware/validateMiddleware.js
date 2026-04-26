/**
 * Input validation middleware helpers.
 * Use these as route-level middleware to validate req.body before hitting controllers.
 */

/**
 * Throws a 400 error if any required field is missing/empty.
 */
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

/**
 * Sanitizes string fields: trims whitespace, prevents prototype pollution.
 */
export const sanitizeBody = (req, res, next) => {
  const forbidden = ["__proto__", "constructor", "prototype"];
  for (const key of forbidden) {
    delete req.body[key];
  }

  // Trim all top-level string values
  for (const [key, val] of Object.entries(req.body)) {
    if (typeof val === "string") req.body[key] = val.trim();
  }

  next();
};