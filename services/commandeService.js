const Commande = require("../models/commande");
const RestaurantService = require("./restaurantService");
const MenuService = require("./menuService");
const ProduitService = require("./produitService");
const Restaurant = require("../models/restaurant");
const User = require("../models/user");
const EmailService = require("./emailService");
const { Sequelize } = require("sequelize");
const { getUserRestaurantId } = require("../utils/roleAccess");

module.exports = {
  getAll: async (currentUser) => {
    const options = {
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'nom', 'email']
        },
        {
          model: Restaurant,
          as: 'restaurant'
        },
        {
          model: User,
          as: 'employe',
          attributes: ['id', 'nom']
        }
      ]
    };

    if (currentUser.role === 'CLIENT') {
      options.where = { idClient: currentUser.id };
    } else if (currentUser.role === 'EMPLOYE' || currentUser.role === 'GERANT') {
      const userRestaurantId = await getUserRestaurantId(currentUser);
      options.where = { idRestaurant: userRestaurantId };
    }

    // ADMIN voit tout
    const commandes = await Commande.findAll(options);
    return commandes;
  },

  getOne: async (id, currentUser) => {
    const commande = await Commande.findByPk(id, {
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'nom', 'email']
        },
        {
          model: Restaurant,
          as: 'restaurant'
        },
        {
          model: User,
          as: 'employe',
          attributes: ['id', 'nom']
        }
      ]
    });

    if (!commande) {
      const err = new Error("Commande non trouvée");
      err.statusCode = 404;
      throw err;
    }

    if (currentUser.role === 'CLIENT' && commande.idClient !== currentUser.id) {
      const err = new Error("Accès non autorisé");
      err.statusCode = 403;
      throw err;
    }

    if (currentUser.role === 'EMPLOYE' || currentUser.role === 'GERANT') {
      const userRestaurantId = await getUserRestaurantId(currentUser);
      if (commande.idRestaurant !== userRestaurantId) {
        const err = new Error("Accès non autorisé à cette commande");
        err.statusCode = 403;
        throw err;
      }
    }

    return commande;
  },

  create: async (data, currentUser) => {
    const { idRestaurant, typeCommande, contenu, codePromo } = data;

    if (!idRestaurant || !typeCommande || !contenu) {
      const err = new Error("Données manquantes");
      err.statusCode = 400;
      throw err;
    }

    const restaurant = await Restaurant.findByPk(idRestaurant);
    if (!restaurant) {
      const err = new Error("Restaurant non trouvé");
      err.statusCode = 404;
      throw err;
    }

    if (!await RestaurantService.isRestaurantOpen(restaurant)) {
      const err = new Error("Le restaurant est fermé ou en pause");
      err.statusCode = 400;
      throw err;
    }

    let prixTotal = 0;

    // Calcul du prix des menus
    if (contenu.menus && contenu.menus.length > 0) {
      for (const m of contenu.menus) {
        const menu = await MenuService.getOne(m.idMenu, currentUser);
        if (!menu.disponible) {
          const err = new Error(`Menu ${menu.nom} indisponible`);
          err.statusCode = 400;
          throw err;
        }

        // Trouver le restInfo
        const restInfo = menu.restaurants?.restaurants?.find(r => r.idRestaurant === idRestaurant && r.disponible);
        if (!restInfo) {
          const err = new Error(`Menu ${menu.nom} non disponible dans ce restaurant`);
          err.statusCode = 400;
          throw err;
        }

        // Vérifier la composition
        for (const comp of menu.composition.compositions) {
          for (const opt of comp.options) {
            const produit = await ProduitService.getOne(opt.idProduit, currentUser);
            const produitRestInfo = produit.restaurants?.restaurants?.find(r => r.idRestaurant === idRestaurant);
            if (!produit || !produit.disponible || !produitRestInfo?.disponible || produitRestInfo.stock < m.quantite) {
              const err = new Error(`Produit ${produit.nom} indisponible ou stock insuffisant pour le menu`);
              err.statusCode = 400;
              throw err;
            }
          }
        }

        prixTotal += restInfo.prix * m.quantite;
      }
    }

    // Calcul du prix des produits individuels
    if (contenu.produitsIndividuels && contenu.produitsIndividuels.length > 0) {
      for (const p of contenu.produitsIndividuels) {
        const produit = await ProduitService.getOne(p.idProduit, currentUser);
        const produitRestInfo = produit.restaurants?.restaurants?.find(r => r.idRestaurant === idRestaurant);
        if (!produit || !produit.disponible || !produitRestInfo?.disponible || produitRestInfo.stock < p.quantite) {
          const err = new Error(`Produit ${produit.nom} indisponible ou stock insuffisant`);
          err.statusCode = 400;
          throw err;
        }
        prixTotal += produitRestInfo.prix * p.quantite;
      }
    }

    // Code promo
    if (codePromo === "REDUC10") {
      prixTotal = prixTotal * 0.9; 
    }

    const commande = await Commande.create({
      idClient: currentUser.id,
      idRestaurant,
      typeCommande,
      contenu,
      prixTotal,
      statut: 'EN_ATTENTE'
    });

    await decrementerStocks(idRestaurant, contenu);

    const nouvelleCommande = await Commande.findByPk(commande.id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'nom', 'email'] },
        { model: Restaurant, as: 'restaurant' }
      ]
    });

    await EmailService.sendConfirmationEmail(nouvelleCommande.client.email, nouvelleCommande);

    return nouvelleCommande;
  },

  updateStatus: async (id, statut, currentUser) => {
    const commande = await Commande.findByPk(id);
    if (!commande) {
      const err = new Error("Commande non trouvée");
      err.statusCode = 404;
      throw err;
    }

    if (!['ADMIN', 'GERANT', 'EMPLOYE'].includes(currentUser.role)) {
      const err = new Error("Non autorisé à modifier le statut");
      err.statusCode = 403;
      throw err;
    }

    // Vérifier accès si GERANT/EMPLOYE
    if (currentUser.role === 'GERANT' || currentUser.role === 'EMPLOYE') {
      const userRestaurantId = await getUserRestaurantId(currentUser);
      if (commande.idRestaurant !== userRestaurantId) {
        const err = new Error("Non autorisé à modifier le statut de cette commande");
        err.statusCode = 403;
        throw err;
      }
    }

    const transitionsValides = {
      'EN_ATTENTE': ['EN_PREPARATION', 'ANNULEE'],
      'EN_PREPARATION': ['PRETE', 'ANNULEE'],
      'PRETE': ['LIVREE', 'ANNULEE'],
      'LIVREE': [],
      'ANNULEE': []
    };

    if (!transitionsValides[commande.statut]?.includes(statut)) {
      const err = new Error("Transition de statut invalide");
      err.statusCode = 400;
      err.details = {
        statutActuel: commande.statut,
        transitionsPossibles: transitionsValides[commande.statut]
      };
      throw err;
    }

    if (statut === 'EN_PREPARATION') {
      commande.idEmploye = currentUser.id;
    }

    await commande.update({
      statut,
      idEmploye: commande.idEmploye
    });

    return Commande.findByPk(id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'nom', 'email'] },
        { model: Restaurant, as: 'restaurant' },
        { model: User, as: 'employe', attributes: ['id', 'nom'] }
      ]
    });
  },

  cancel: async (id, currentUser) => {
    const commande = await Commande.findByPk(id);
    if (!commande) {
      const err = new Error("Commande non trouvée");
      err.statusCode = 404;
      throw err;
    }

    if (currentUser.role === 'CLIENT' && commande.idClient !== currentUser.id) {
      const err = new Error("Non autorisé à annuler cette commande");
      err.statusCode = 403;
      throw err;
    }
    if (['GERANT', 'EMPLOYE'].includes(currentUser.role)) {
      const userRestaurantId = await getUserRestaurantId(currentUser);
      if (commande.idRestaurant !== userRestaurantId) {
        const err = new Error("Non autorisé à annuler cette commande");
        err.statusCode = 403;
        throw err;
      }
    }

    if (!['EN_ATTENTE', 'EN_PREPARATION'].includes(commande.statut)) {
      const err = new Error("Impossible d'annuler la commande dans son état actuel");
      err.statusCode = 400;
      err.details = { statut: commande.statut };
      throw err;
    }

    await commande.update({ statut: 'ANNULEE' });

    return Commande.findByPk(id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'nom', 'email'] },
        { model: Restaurant, as: 'restaurant' },
        { model: User, as: 'employe', attributes: ['id', 'nom'] }
      ]
    });
  }
};

// Fonction pour décrémenter les stocks
async function decrementerStocks(idRestaurant, contenu) {
  const Menu = require("../models/menu");
  const Produit = require("../models/produit");

  // Menus
  if (contenu.menus) {
    for (const m of contenu.menus) {
      const menu = await Menu.findByPk(m.idMenu);
      for (const comp of menu.composition.compositions) {
        for (const opt of comp.options) {
          const produit = await Produit.findByPk(opt.idProduit);
          const restInfo = produit.restaurants?.restaurants?.find(r => r.idRestaurant === idRestaurant);
          if (restInfo) {
            restInfo.stock -= m.quantite;
            if (restInfo.stock < 0) restInfo.stock = 0;
            await produit.update({ restaurants: produit.restaurants });
          }
        }
      }
    }
  }

  // Produits individuels
  if (contenu.produitsIndividuels) {
    for (const p of contenu.produitsIndividuels) {
      const produit = await Produit.findByPk(p.idProduit);
      const restInfo = produit.restaurants?.restaurants?.find(r => r.idRestaurant === idRestaurant);
      if (restInfo) {
        restInfo.stock -= p.quantite;
        if (restInfo.stock < 0) restInfo.stock = 0;
        await produit.update({ restaurants: produit.restaurants });
      }
    }
  }
}