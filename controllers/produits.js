const Produit = require("../models/produit");

module.exports = {
  // Récupérer tous les produits
  getAll: async (req, res) => {
    try {
      const produits = await Produit.findAll();
      res.json(produits);
    } catch (error) {
      console.error("Erreur getAll produits:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des produits" });
    }
  },

  // Récupérer un produit par son ID
  getOne: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const produit = await Produit.findByPk(id);
      
      if (!produit) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }
      
      res.json(produit);
    } catch (error) {
      console.error("Erreur getOne produit:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du produit" });
    }
  },

  // Créer un nouveau produit
  create: async (req, res) => {
    try {
      // Validation des données requises
      const { nom, prix, categorie, tempsPreparation } = req.body;
      
      if (!nom || !prix || !categorie || !tempsPreparation) {
        return res.status(400).json({ message: "Données manquantes" });
      }

      // Vérification du rôle (seuls ADMIN et GERANT peuvent créer des produits)
      if (!['ADMIN', 'GERANT'].includes(req.user.role)) {
        return res.status(403).json({ message: "Non autorisé" });
      }

      const produit = await Produit.create({
        nom,
        description: req.body.description,
        prix,
        categorie,
        imageUrl: req.body.imageUrl,
        allergenes: req.body.allergenes || [],
        disponible: req.body.disponible !== undefined ? req.body.disponible : true,
        tempsPreparation,
        restaurants: req.body.restaurants || { restaurants: [] }
      });

      res.status(201).json(produit);
    } catch (error) {
      console.error("Erreur create produit:", error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Erreur lors de la création du produit" });
    }
  },

  // Mettre à jour un produit
  update: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const produit = await Produit.findByPk(id);
      
      if (!produit) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      // Vérification du rôle (seuls ADMIN et GERANT peuvent modifier des produits)
      if (!['ADMIN', 'GERANT'].includes(req.user.role)) {
        return res.status(403).json({ message: "Non autorisé" });
      }

      await produit.update(req.body);
      const updatedProduit = await Produit.findByPk(id);
      res.json(updatedProduit);
    } catch (error) {
      console.error("Erreur update produit:", error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Erreur lors de la mise à jour du produit" });
    }
  },

  // Supprimer un produit
  delete: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const produit = await Produit.findByPk(id);
      
      if (!produit) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      // Vérification du rôle (seuls ADMIN et GERANT peuvent supprimer des produits)
      if (!['ADMIN', 'GERANT'].includes(req.user.role)) {
        return res.status(403).json({ message: "Non autorisé" });
      }

      await produit.destroy();
      res.status(204).send();
    } catch (error) {
      console.error("Erreur delete produit:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du produit" });
    }
  }
};