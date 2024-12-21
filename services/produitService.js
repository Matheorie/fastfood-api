const Produit = require("../models/produit");
const Restaurant = require("../models/restaurant");
const { Sequelize, Op } = require("sequelize");
const { getUserRestaurantId } = require("../utils/roleAccess");
const RestaurantModel = require("../models/restaurant");

module.exports = {
  getAll: async (query, currentUser) => {
    const where = {};
    if (query.categorie) {
      where.categorie = query.categorie;
    }
    if (query.disponible !== undefined) {
      where.disponible = query.disponible === 'true';
    }

    let order = [];
    if (query.sort) {
      const direction = query.order === 'desc' ? 'DESC' : 'ASC';
      order.push([query.sort, direction]);
    }

    let produits = await Produit.findAll({ where, order });

    // Si aucun utilisateur (route publique non authentifiée) => pas de filtrage
    if (!currentUser) {
      return produits;
    }

    // Sinon, on filtre en fonction du rôle
    const userRestaurantId = await getUserRestaurantId(currentUser);
    if (currentUser.role === 'GERANT' || currentUser.role === 'EMPLOYE') {
      produits = produits.filter(prod => {
        // prod.restaurants peut être null en DB => on sécurise
        const restArray = prod.restaurants?.restaurants || [];
        return restArray.some(r => r.idRestaurant === userRestaurantId);
      });
    }

    // CLIENT => on autorise l’affichage de tous les produits ? 
    // (selon votre cahier des charges ; ou bien on peut filtrer un restaurant unique)
    // On laisse comme cela.

    return produits;
  },

  getOne: async (id, currentUser) => {
    const produit = await Produit.findByPk(id);
    if (!produit) {
      const err = new Error("Produit non trouvé");
      err.statusCode = 404;
      throw err;
    }

    // Sécurisation si "restaurants" est null
    if (!produit.restaurants) {
      // On force la structure JSON si jamais la colonne est NULL en base
      produit.restaurants = { restaurants: [] };
    }

    // Si pas d'utilisateur (public), on renvoie directement le produit
    if (!currentUser) {
      return produit;
    }

    // Filtrage si GERANT/EMPLOYE
    const userRestaurantId = await getUserRestaurantId(currentUser);
    if (currentUser.role === 'GERANT' || currentUser.role === 'EMPLOYE') {
      const restArray = produit.restaurants?.restaurants || [];
      const found = restArray.some(r => r.idRestaurant === userRestaurantId);
      if (!found) {
        const err = new Error("Accès interdit à ce produit");
        err.statusCode = 403;
        throw err;
      }
    }

    return produit;
  },


  create: async (data, currentUser) => {
    if (!['ADMIN', 'GERANT'].includes(currentUser.role)) {
      const err = new Error("Non autorisé");
      err.statusCode = 403;
      throw err;
    }

    const existing = await Produit.findOne({ where: { nom: data.nom } });
    if (existing) {
      const err = new Error("Un produit avec ce nom existe déjà.");
      err.statusCode = 400;
      throw err;
    }

    if (!data.restaurants || !data.restaurants.restaurants || data.restaurants.restaurants.length === 0) {
      const err = new Error("Vous devez spécifier au moins un restaurant pour ce produit.");
      err.statusCode = 400;
      throw err;
    }

    // Vérifier accès aux restaurants indiqués
    for (const rest of data.restaurants.restaurants) {
      const restaurant = await RestaurantModel.findByPk(rest.idRestaurant);
      if (!restaurant) {
        const err = new Error(`Restaurant avec l'id ${rest.idRestaurant} n'existe pas.`);
        err.statusCode = 400;
        throw err;
      }

      if (currentUser.role === 'GERANT' && restaurant.idGerant !== currentUser.id) {
        const err = new Error(`Vous n'avez pas accès au restaurant avec l'id ${rest.idRestaurant}.`);
        err.statusCode = 403;
        throw err;
      }

      // Un EMPLOYE ne peut pas créer, donc pas besoin d'ajouter ce cas
    }

    return Produit.create(data);
  },

  update: async (id, data, currentUser) => {
    const produit = await Produit.findByPk(id);
    if (!produit) {
      const err = new Error("Produit non trouvé");
      err.statusCode = 404;
      throw err;
    }

    if (!['ADMIN', 'GERANT'].includes(currentUser.role)) {
      const err = new Error("Non autorisé");
      err.statusCode = 403;
      throw err;
    }

    if (data.nom && data.nom !== produit.nom) {
      const existing = await Produit.findOne({ where: { nom: data.nom } });
      if (existing) {
        const err = new Error("Un produit avec ce nom existe déjà.");
        err.statusCode = 400;
        throw err;
      }
    }

    if (data.restaurants && data.restaurants.restaurants) {
      for (const rest of data.restaurants.restaurants) {
        const restaurant = await RestaurantModel.findByPk(rest.idRestaurant);
        if (!restaurant) {
          const err = new Error(`Restaurant avec l'id ${rest.idRestaurant} n'existe pas.`);
          err.statusCode = 400;
          throw err;
        }
        if (currentUser.role === 'GERANT' && restaurant.idGerant !== currentUser.id) {
          const err = new Error(`Vous n'avez pas accès au restaurant avec l'id ${rest.idRestaurant}.`);
          err.statusCode = 403;
          throw err;
        }
      }
    }

    await produit.update(data);
    return Produit.findByPk(id);
  },

  delete: async (id, currentUser) => {
    const produit = await Produit.findByPk(id);
    if (!produit) {
      const err = new Error("Produit non trouvé");
      err.statusCode = 404;
      throw err;
    }

    if (!['ADMIN', 'GERANT'].includes(currentUser.role)) {
      const err = new Error("Non autorisé");
      err.statusCode = 403;
      throw err;
    }

    // Vérifier accès si GERANT
    if (currentUser.role === 'GERANT') {
      const restArray = produit.restaurants?.restaurants || [];
      // Vérifier si le gérant gère au moins un de ces restaurants
      let hasAccess = false;
      for (const r of restArray) {
        const restaurant = await RestaurantModel.findByPk(r.idRestaurant);
        if (restaurant && restaurant.idGerant === currentUser.id) {
          hasAccess = true;
          break;
        }
      }
      if (!hasAccess) {
        const err = new Error("Vous n'avez pas accès à ce produit.");
        err.statusCode = 403;
        throw err;
      }
    }

    await produit.destroy();
    return true;
  }
};