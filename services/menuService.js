// services/menuService.js

const Menu = require("../models/menu");
const Produit = require("../models/produit");
const RestaurantModel = require("../models/restaurant");
const { getUserRestaurantId } = require("../utils/roleAccess");

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

    let menus = await Menu.findAll({ where, order });

    if (!currentUser) {
      // Pas d'utilisateur => pas de filtrage par restaurant
      return menus;
    }

    const userRestaurantId = await getUserRestaurantId(currentUser);
    if (currentUser.role === 'GERANT' || currentUser.role === 'EMPLOYE') {
      menus = menus.filter(menu => {
        const restArray = menu.restaurants?.restaurants || [];
        return restArray.some(r => r.idRestaurant === userRestaurantId);
      });
    }
    return menus;
  },

  getOne: async (id, currentUser) => {
    const menu = await Menu.findByPk(id);
    if (!menu) {
      const err = new Error("Menu non trouvé");
      err.statusCode = 404;
      throw err;
    }

    if (!currentUser) {
      // Route publique => on retourne le menu tel quel
      return menu;
    }

    const userRestaurantId = await getUserRestaurantId(currentUser);
    if (currentUser.role === 'GERANT' || currentUser.role === 'EMPLOYE') {
      const restArray = menu.restaurants?.restaurants || [];
      if (!restArray.some(r => r.idRestaurant === userRestaurantId)) {
        const err = new Error("Accès interdit à ce menu.");
        err.statusCode = 403;
        throw err;
      }
    }

    return menu;
  },

  create: async (data, currentUser) => {
    if (!['ADMIN', 'GERANT'].includes(currentUser.role)) {
      const err = new Error("Non autorisé");
      err.statusCode = 403;
      throw err;
    }

    // Vérifier l'unicité du nom
    const existingMenu = await Menu.findOne({ where: { nom: data.nom } });
    if (existingMenu) {
      const err = new Error("Un menu avec ce nom existe déjà.");
      err.statusCode = 400;
      throw err;
    }

    // Vérifier qu'au moins un restaurant est spécifié
    if (!data.restaurants 
      || !data.restaurants.restaurants 
      || data.restaurants.restaurants.length === 0) 
    {
      const err = new Error("Vous devez spécifier au moins un restaurant pour ce menu.");
      err.statusCode = 400;
      throw err;
    }

    // Vérifier accès aux restaurants indiqués (si GERANT)
    for (const rest of data.restaurants.restaurants) {
      const restaurant = await RestaurantModel.findByPk(rest.idRestaurant);
      if (!restaurant) {
        const err = new Error(`Le restaurant avec l'id ${rest.idRestaurant} n'existe pas.`);
        err.statusCode = 400;
        throw err;
      }
      if (currentUser.role === 'GERANT' && restaurant.idGerant !== currentUser.id) {
        const err = new Error(`Vous n'avez pas accès au restaurant avec l'id ${rest.idRestaurant}.`);
        err.statusCode = 403;
        throw err;
      }
    }

    // Vérifier la composition (produits, catégories, stock) si nécessaire
    if (data.composition) {
      await module.exports.verifyMenuComposition(
        data.composition,
        data.restaurants.restaurants[0].idRestaurant
      );
    }

    return Menu.create(data);
  },

  /**
   * NOUVELLE METHODE : Mise à jour d'un menu existant
   */
  update: async (id, data, currentUser) => {
    // Seuls ADMIN ou GERANT peuvent modifier
    if (!['ADMIN', 'GERANT'].includes(currentUser.role)) {
      const err = new Error("Non autorisé");
      err.statusCode = 403;
      throw err;
    }

    // Récupérer le menu
    const menu = await Menu.findByPk(id);
    if (!menu) {
      const err = new Error("Menu non trouvé");
      err.statusCode = 404;
      throw err;
    }

    // Si c'est un GERANT, vérifier l'accès (restaurants)
    if (currentUser.role === 'GERANT') {
      const userRestaurantId = await getUserRestaurantId(currentUser);

      // On vérifie si le menu est vendu dans son resto
      // (si le gérant veut modifier le menu dans un resto qu’il ne gère pas => refus)
      const restArray = menu.restaurants?.restaurants || [];
      const found = restArray.some(r => r.idRestaurant === userRestaurantId);
      if (!found) {
        const err = new Error("Vous n'avez pas accès à ce menu (autre restaurant).");
        err.statusCode = 403;
        throw err;
      }
    }

    // Vérifier unicité du nouveau nom si on en change
    if (data.nom && data.nom !== menu.nom) {
      const existingMenu = await Menu.findOne({ where: { nom: data.nom } });
      if (existingMenu) {
        const err = new Error("Un menu avec ce nom existe déjà.");
        err.statusCode = 400;
        throw err;
      }
    }

    // Si on modifie la composition, vérifier à nouveau la validité
    if (data.composition && data.restaurants && data.restaurants.restaurants) {
      await module.exports.verifyMenuComposition(
        data.composition,
        data.restaurants.restaurants[0].idRestaurant
      );
    }

    // Mettre à jour le menu
    await menu.update(data);

    // On retourne le menu mis à jour
    return menu;
  },

  delete: async (id, currentUser) => {
    const menu = await Menu.findByPk(id);
    if (!menu) {
      const err = new Error("Menu non trouvé");
      err.statusCode = 404;
      throw err;
    }

    if (!['ADMIN', 'GERANT'].includes(currentUser.role)) {
      const err = new Error("Non autorisé");
      err.statusCode = 403;
      throw err;
    }

    await menu.destroy();
    return true;
  },

  verifyMenuComposition: async (composition, idRestaurant) => {
    if (!composition || !composition.compositions || !Array.isArray(composition.compositions)) {
      const err = new Error("Format composition invalide");
      err.statusCode = 400;
      throw err;
    }
    if (!idRestaurant) {
      const err = new Error("idRestaurant non défini pour vérifier la composition du menu.");
      err.statusCode = 400;
      throw err;
    }

    for (const c of composition.compositions) {
      if (!c.categorie || !c.options || !Array.isArray(c.options)) {
        const err = new Error("La structure de la composition est invalide.");
        err.statusCode = 400;
        throw err;
      }
      for (const option of c.options) {
        const produit = await Produit.findByPk(option.idProduit);
        if (!produit || !produit.disponible) {
          const err = new Error(`Produit avec l'id ${option.idProduit} indisponible.`);
          err.statusCode = 400;
          throw err;
        }
        if (!produit.restaurants) {
          produit.restaurants = { restaurants: [] };
        }
        const restInfo = produit.restaurants.restaurants.find(r => r.idRestaurant === idRestaurant);
        if (!restInfo || !restInfo.disponible || restInfo.stock < 1) {
          const err = new Error(`Produit ${produit.nom} indisponible ou stock insuffisant dans le restaurant ${idRestaurant}.`);
          err.statusCode = 400;
          throw err;
        }
        if (produit.categorie !== c.categorie) {
          const err = new Error(
            `Le produit ${produit.nom} (catégorie ${produit.categorie}) ne correspond pas à la catégorie requise ${c.categorie}.`
          );
          err.statusCode = 400;
          throw err;
        }
      }
    }
    return true;
  }
};