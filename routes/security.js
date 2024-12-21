const { Router } = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const router = new Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) {
      return res.status(400).json({ error: true, message: "Email et mot de passe requis" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: true, message: "Email ou mot de passe incorrect." });
    }

    const validPassword = await user.verifierMotDePasse(password);
    if (!validPassword) {
      return res.status(401).json({ error: true, message: "Email ou mot de passe incorrect." });
    }

    if(!user.active) {
      return res.status(403).json({ error: true, message: "Compte désactivé" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.nom,
        role: user.role
      },
      process.env.JWT_SECRET
    );

    res.json({ token });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ error: true, message: "Erreur serveur" });
  }
});

module.exports = router;