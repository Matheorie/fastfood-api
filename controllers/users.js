const User = require("../models/user");

module.exports = {
  getAll: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['motDePasse'] } // Ne pas renvoyer les mots de passe
      });
      res.json(users);
    } catch (error) {
      console.error("Erreur getAll users:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  },
  create: async (req, res, next) => {
    res.status(201).json(await User.create(req.body));
  },
  getOne: async (req, res, next) => {
    const user = await User.findByPk(parseInt(req.params.id));
    if (user) {
      res.json(user);
    } else {
      res.sendStatus(404);
    }
  },
  update: async (req, res) => {
    try {
      // Vérifie d'abord si l'utilisateur existe
      const user = await User.findByPk(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
  
      // Mise à jour de l'utilisateur
      const [nbUpdated] = await User.update(req.body, {
        where: {
          id: parseInt(req.params.id),
        },
      });
  
      if (nbUpdated === 0) {
        return res.status(400).json({ message: "Aucune mise à jour effectuée" });
      }
  
      // Récupère et renvoie l'utilisateur mis à jour
      const updatedUser = await User.findByPk(parseInt(req.params.id), {
        attributes: { exclude: ['motDePasse'] } // Exclure le mot de passe de la réponse
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
    }
  },
  delete: async (req, res, next) => {
    if (req.user.id !== parseInt(req.params.id)) return res.sendStatus(403);

    const nbDeleted = await User.destroy({
      where: {
        id: parseInt(req.params.id),
      },
    });

    res.sendStatus(nbDeleted ? 204 : 404);
  },
};