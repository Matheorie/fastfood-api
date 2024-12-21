const produitService = require("../services/produitService");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      // Passez req.user ou null
      const produits = await produitService.getAll(req.query, req.user || null);
      res.json(produits);
    } catch (error) {
      next(error);
    }
  },

  getOne: async (req, res, next) => {
    try {
      const produit = await produitService.getOne(
        parseInt(req.params.id),
        req.user || null
      );
      res.json(produit);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const produit = await produitService.create(req.body, req.user);
      res.status(201).json(produit);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const updatedProduit = await produitService.update(
        parseInt(req.params.id),
        req.body,
        req.user
      );
      res.json(updatedProduit);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      await produitService.delete(parseInt(req.params.id), req.user);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
};
