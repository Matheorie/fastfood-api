const { Router } = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const router = new Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.sendStatus(401);
    
    // Utiliser la méthode de vérification bcrypt
    const validPassword = await user.verifierMotDePasse(password);
    if (!validPassword) return res.sendStatus(401);

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
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;