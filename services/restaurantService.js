const Restaurant = require("../models/restaurant");
const User = require("../models/user");
const { Sequelize } = require("sequelize");

module.exports = {
  getAll: async (query) => {
    const where = {};
    if (query.statut) {
      where.statut = query.statut;
    }

    let order = [];
    if (query.sort) {
      const direction = query.order === 'desc' ? 'DESC' : 'ASC';
      order.push([query.sort, direction]);
    }

    return Restaurant.findAll({ where, order });
  },
  getOne: async (id) => {
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      const err = new Error("Restaurant non trouvé");
      err.statusCode = 404;
      throw err;
    }
    return restaurant;
  },
  create: async (data, currentUser) => {
    if (!['ADMIN', 'GERANT'].includes(currentUser.role)) {
      const err = new Error("Non autorisé");
      err.statusCode = 403;
      throw err;
    }

    // Vérifier que l'utilisateur spécifié comme gérant est réellement GERANT ou ADMIN
    const gerantUser = await User.findByPk(data.idGerant);
    if (!gerantUser || !['GERANT', 'ADMIN'].includes(gerantUser.role)) {
      const err = new Error("L'idGerant doit correspondre à un utilisateur de rôle GERANT ou ADMIN.");
      err.statusCode = 400;
      throw err;
    }

    // Vérifier l'unicité des champs nom, adresse et téléphone
    const existingRestaurant = await Restaurant.findOne({
      where: {
        [Sequelize.Op.or]: [
          { nom: data.nom },
          { adresse: data.adresse },
          { telephone: data.telephone }
        ]
      }
    });

    if (existingRestaurant) {
      const err = new Error("Un restaurant avec le même nom, adresse ou numéro de téléphone existe déjà.");
      err.statusCode = 400;
      throw err;
    }

    return Restaurant.create(data);
  },
  update: async (id, data, currentUser) => {
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      const err = new Error("Restaurant non trouvé");
      err.statusCode = 404;
      throw err;
    }

    // Seuls ADMIN/GERANT peuvent modifier, et GERANT doit être le gérant du restaurant
    if (!['ADMIN', 'GERANT'].includes(currentUser.role) ||
        (currentUser.role === 'GERANT' && currentUser.id !== restaurant.idGerant)) {
      const err = new Error("Non autorisé");
      err.statusCode = 403;
      throw err;
    }

    // Si mise à jour du gérant, vérifier le rôle de l'utilisateur
    if (data.idGerant) {
      const gerantUser = await User.findByPk(data.idGerant);
      if (!gerantUser || !['GERANT', 'ADMIN'].includes(gerantUser.role)) {
        const err = new Error("L'idGerant doit correspondre à un utilisateur de rôle GERANT ou ADMIN.");
        err.statusCode = 400;
        throw err;
      }
    }

    // Vérifier l'unicité des champs nom, adresse et téléphone si mis à jour
    if (data.nom || data.adresse || data.telephone) {
      const where = {
        [Sequelize.Op.and]: [
          { id: { [Sequelize.Op.ne]: id } },
          {
            [Sequelize.Op.or]: [
              { nom: data.nom },
              { adresse: data.adresse },
              { telephone: data.telephone }
            ]
          }
        ]
      };
      const existingRestaurant = await Restaurant.findOne({ where });
      if (existingRestaurant) {
        const err = new Error("Un autre restaurant avec le même nom, adresse ou numéro de téléphone existe déjà.");
        err.statusCode = 400;
        throw err;
      }
    }

    await restaurant.update(data);
    return Restaurant.findByPk(id);
  },
  delete: async (id, currentUser) => {
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      const err = new Error("Restaurant non trouvé");
      err.statusCode = 404;
      throw err;
    }

    if (!['ADMIN', 'GERANT'].includes(currentUser.role) ||
       (currentUser.role === 'GERANT' && currentUser.id !== restaurant.idGerant)) {
      const err = new Error("Non autorisé");
      err.statusCode = 403;
      throw err;
    }

    await restaurant.destroy();
    return true;
  },
  isRestaurantOpen: (restaurant) => {
    return restaurant.statut === 'OUVERT';
  },
  updateStatusBasedOnTime: async (restaurant) => {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS

    if (currentTime >= restaurant.heureOuverture && currentTime < restaurant.heureFermeture) {
      if (restaurant.statut !== 'OUVERT') {
        await restaurant.update({ statut: 'OUVERT' });
      }
    } else {
      if (restaurant.statut !== 'FERME') {
        await restaurant.update({ statut: 'FERME' });
      }
    }
  },

  isRestaurantOpen: async (restaurant) => {
    await module.exports.updateStatusBasedOnTime(restaurant);
    return restaurant.statut === 'OUVERT';
  }
};