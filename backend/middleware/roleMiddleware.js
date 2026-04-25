export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error("Access denied: insufficient permissions");
    }
    next();
  };
};

export const adminOnly = authorizeRoles("admin");
export const farmerOrAdmin = authorizeRoles("farmer", "admin");
