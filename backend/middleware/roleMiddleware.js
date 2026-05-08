// Path: backend/middleware/roleMiddleware.js
// Description: Provides reusable role-based authorization 
// middleware and common role guards.

// Allows access only if the authenticated user's role is included in the allowed roles.
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error("Access denied: insufficient permissions");
    }

    next();
  };
};

// Allows only admin users.
export const adminOnly = authorizeRoles("admin");

// Allows farmers and admins.
export const farmerOrAdmin = authorizeRoles("farmer", "admin");