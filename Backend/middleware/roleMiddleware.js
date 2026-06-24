const roleMiddleware = (req, res, next) => {
  // If it acts as direct middleware: roleMiddleware(req, res, next)
  if (req && req.headers && typeof next === "function") {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin Access Only",
      });
    }
    return next();
  }

  // If acts as role generator: roleMiddleware("admin")
  const roles = typeof req === "string" ? [req] : Array.from(arguments);
  return (innerReq, innerRes, innerNext) => {
    if (!innerReq.user || !roles.includes(innerReq.user.role)) {
      return innerRes.status(403).json({
        success: false,
        message: "Access Denied: Insufficient permissions",
      });
    }
    innerNext();
  };
};

module.exports = roleMiddleware;