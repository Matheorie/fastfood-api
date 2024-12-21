const User = require("../models/user");

module.exports = {
  getAllUsers: async () => {
    return User.findAll({ attributes: { exclude: ['motDePasse'] } });
  },
  getUserById: async (id) => {
    return User.findByPk(id, { attributes: { exclude: ['motDePasse'] } });
  },
  createUser: async (data) => {
    return User.create(data);
  },
  updateUser: async (id, data) => {
    const user = await User.findByPk(id);
    if (!user) {
      const err = new Error("Utilisateur non trouvé");
      err.statusCode = 404;
      throw err;
    }
    await user.update(data);
    return User.findByPk(id, { attributes: { exclude: ['motDePasse'] } });
  },
  deleteUser: async (id, currentUser) => {
    // Seul l'utilisateur lui-même ou un ADMIN peut le supprimer 
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      const err = new Error("Non autorisé");
      err.statusCode = 403;
      throw err;
    }

    const nbDeleted = await User.destroy({ where: { id } });
    if (nbDeleted === 0) {
      const err = new Error("Utilisateur non trouvé");
      err.statusCode = 404;
      throw err;
    }
    return true;
  }
};