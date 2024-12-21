const restaurantService = require("../services/restaurantService");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const restaurants = await restaurantService.getAll(req.query);
      res.json(restaurants);
    } catch (error) {
      next(error);
    }
  },

  getOne: async (req, res, next) => {
    try {
      const restaurant = await restaurantService.getOne(parseInt(req.params.id));
      res.json(restaurant);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const restaurant = await restaurantService.create(req.body, req.user);
      res.status(201).json(restaurant);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const updatedRestaurant = await restaurantService.update(parseInt(req.params.id), req.body, req.user);
      res.json(updatedRestaurant);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      await restaurantService.delete(parseInt(req.params.id), req.user);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
};
