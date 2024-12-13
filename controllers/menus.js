const Menu = require("../models/menu");

module.exports = {
  // Récupérer tous les menus
  getAll: async (req, res) => {
    try {
      const menus = await Menu.findAll();
      res.json(menus);
    } catch (error) {
      console.error("Erreur getAll menus:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des menus" });
    }
  },

  // Récupérer un menu par son ID
  getOne: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menu = await Menu.findByPk(id);
      
      if (!menu) {
        return res.status(404).json({ message: "Menu non trouvé" });
      }
      
      res.json(menu);
    } catch (error) {
      console.error("Erreur getOne menu:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du menu" });
    }
  },

  // Créer un nouveau menu
  create: async (req, res) => {
    try {
      // Validation des données requises
      const { nom, prix, categorie, composition } = req.body;
      
      if (!nom || !prix || !categorie || !composition) {
        return res.status(400).json({ message: "Données manquantes" });
      }

      // Vérification du rôle (seuls ADMIN et GERANT peuvent créer des menus)
      if (!['ADMIN', 'GERANT'].includes(req.user.role)) {
        return res.status(403).json({ message: "Non autorisé" });
      }

      const menu = await Menu.create({
        nom,
        description: req.body.description,
        prix,
        categorie,
        imageUrl: req.body.imageUrl,
        disponible: req.body.disponible !== undefined ? req.body.disponible : true,
        composition,
        restaurants: req.body.restaurants || { restaurants: [] }
      });

      res.status(201).json(menu);
    } catch (error) {
      console.error("Erreur create menu:", error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Erreur lors de la création du menu" });
    }
  },

  // Mettre à jour un menu
  update: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menu = await Menu.findByPk(id);
      
      if (!menu) {
        return res.status(404).json({ message: "Menu non trouvé" });
      }

      // Vérification du rôle (seuls ADMIN et GERANT peuvent modifier des menus)
      if (!['ADMIN', 'GERANT'].includes(req.user.role)) {
        return res.status(403).json({ message: "Non autorisé" });
      }

      await menu.update(req.body);
      const updatedMenu = await Menu.findByPk(id);
      res.json(updatedMenu);
    } catch (error) {
      console.error("Erreur update menu:", error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Erreur lors de la mise à jour du menu" });
    }
  },

  // Supprimer un menu
  delete: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menu = await Menu.findByPk(id);
      
      if (!menu) {
        return res.status(404).json({ message: "Menu non trouvé" });
      }

      // Vérification du rôle (seuls ADMIN et GERANT peuvent supprimer des menus)
      if (!['ADMIN', 'GERANT'].includes(req.user.role)) {
        return res.status(403).json({ message: "Non autorisé" });
      }

      await menu.destroy();
      res.status(204).send();
    } catch (error) {
      console.error("Erreur delete menu:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du menu" });
    }
  }
};