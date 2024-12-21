const menuService = require("../services/menuService");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      // Passez req.user || null
      const menus = await menuService.getAll(req.query, req.user || null);
      res.json(menus);
    } catch (error) {
      next(error);
    }
  },

  getOne: async (req, res, next) => {
    try {
      const menu = await menuService.getOne(parseInt(req.params.id), req.user || null);
      res.json(menu);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const menu = await menuService.create(req.body, req.user);
      res.status(201).json(menu);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const updatedMenu = await menuService.update(parseInt(req.params.id), req.body, req.user);
      res.json(updatedMenu);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      await menuService.delete(parseInt(req.params.id), req.user);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
};