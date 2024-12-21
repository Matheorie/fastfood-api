const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  const headerValue = req.headers.authorization ?? req.headers.Authorization;
  if (!headerValue) {
    return res.status(401).json({ error: true, message: "Token manquant" });
  }

  const [type, token] = headerValue.split(/\s+/);
  if (type !== "Bearer") {
    return res.status(401).json({ error: true, message: "Type d'authentification invalide" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id);
    
    if (!user) {
      return res.status(401).json({ error: true, message: "Utilisateur non trouvé ou token invalide" });
    }
    if (!user.active) {
      return res.status(403).json({ error: true, message: "Compte utilisateur désactivé" });
    }
    req.user = user;
    next();
  } catch (e) {
    console.error('Auth error:', e);
    return res.status(401).json({ error: true, message: "Token invalide ou expiré" });
  }
};