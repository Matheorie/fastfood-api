const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  const headerValue = req.headers.authorization ?? req.headers.Authorization;
  if (!headerValue) return res.sendStatus(401);

  const [type, token] = headerValue.split(/\s+/);
  if (type !== "Bearer") return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(payload.id);
    
    if (!req.user) return res.sendStatus(401);
    if (!req.user.active) return res.sendStatus(403); // Changed from activated to active
    
    next();
  } catch (e) {
    console.error('Auth error:', e);
    return res.sendStatus(401);
  }
};