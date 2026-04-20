const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.role || req.user.role.toLowerCase() !== "admin") {
    console.log('Admin access denied for user:', req.user);
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

module.exports = adminMiddleware;
