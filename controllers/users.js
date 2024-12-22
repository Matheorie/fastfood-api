const userService = require("../services/userService");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      // Passer l’utilisateur courant
      const users = await userService.getAllUsers(req.user);
      res.json(users);
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },
  getOne: async (req, res, next) => {
    try {
      const user = await userService.getUserById(parseInt(req.params.id));
      if (!user) return res.sendStatus(404);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const updatedUser = await userService.updateUser(parseInt(req.params.id), req.body);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      await userService.deleteUser(parseInt(req.params.id), req.user);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
};