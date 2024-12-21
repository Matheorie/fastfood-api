const commandeService = require("../services/commandeService");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const commandes = await commandeService.getAll(req.user);
      res.json(commandes);
    } catch (error) {
      next(error);
    }
  },

  getOne: async (req, res, next) => {
    try {
      const commande = await commandeService.getOne(parseInt(req.params.id), req.user);
      res.json(commande);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const commande = await commandeService.create(req.body, req.user);
      res.status(201).json(commande);
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const updatedCommande = await commandeService.updateStatus(parseInt(req.params.id), req.body.statut, req.user);
      res.json(updatedCommande);
    } catch (error) {
      next(error);
    }
  },

  cancel: async (req, res, next) => {
    try {
      const commandeAnnulee = await commandeService.cancel(parseInt(req.params.id), req.user);
      res.json(commandeAnnulee);
    } catch (error) {
      next(error);
    }
  }
};