const Restaurant = require("../models/restaurant");

module.exports = {
  getAll: async (req, res) => {
    try {
      const restaurants = await Restaurant.findAll();
      res.json(restaurants);
    } catch (error) {
      console.error("Erreur getAll:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des restaurants" });
    }
  },

  getOne: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const restaurant = await Restaurant.findByPk(id);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant non trouvé" });
      }
      
      res.json(restaurant);
    } catch (error) {
      console.error("Erreur getOne:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du restaurant" });
    }
  },

  create: async (req, res) => {
    try {
      // Validation des données requises
      const { nom, adresse, telephone, heureOuverture, heureFermeture, idGerant } = req.body;
      
      if (!nom || !adresse || !telephone || !heureOuverture || !heureFermeture || !idGerant) {
        return res.status(400).json({ message: "Données manquantes" });
      }

      const restaurant = await Restaurant.create({
        nom,
        adresse,
        telephone,
        heureOuverture,
        heureFermeture,
        statut: req.body.statut || 'FERME',
        idGerant
      });

      res.status(201).json(restaurant);
    } catch (error) {
      console.error("Erreur create:", error);
      res.status(400).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const restaurant = await Restaurant.findByPk(id);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant non trouvé" });
      }

      await restaurant.update(req.body);
      const updatedRestaurant = await Restaurant.findByPk(id);
      res.json(updatedRestaurant);
    } catch (error) {
      console.error("Erreur update:", error);
      res.status(400).json({ message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const restaurant = await Restaurant.findByPk(id);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant non trouvé" });
      }

      await restaurant.destroy();
      res.status(204).send();
    } catch (error) {
      console.error("Erreur delete:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du restaurant" });
    }
  }
};