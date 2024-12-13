const Commande = require("../models/commande");
const Restaurant = require("../models/restaurant");
const Utilisateur = require("../models/user");

module.exports = {
  // Récupérer toutes les commandes (avec filtres optionnels)
  getAll: async (req, res) => {
    try {
      const options = {
        include: [
          {
            model: Utilisateur,
            as: 'client',
            attributes: ['id', 'nom', 'email']
          },
          {
            model: Restaurant,
            as: 'restaurant'
          },
          {
            model: Utilisateur,
            as: 'employe',
            attributes: ['id', 'nom']
          }
        ]
      };

      // Filtres basés sur le rôle
      if (req.user.role === 'CLIENT') {
        options.where = { idClient: req.user.id };
      } else if (req.user.role === 'EMPLOYE') {
        const restaurant = await Restaurant.findOne({ where: { idGerant: req.user.id } });
        if (restaurant) {
          options.where = { idRestaurant: restaurant.id };
        }
      }
      // Les ADMIN voient toutes les commandes

      const commandes = await Commande.findAll(options);
      res.json(commandes);
    } catch (error) {
      console.error("Erreur getAll commandes:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
    }
  },

  // Récupérer une commande spécifique
  getOne: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const commande = await Commande.findByPk(id, {
        include: [
          {
            model: Utilisateur,
            as: 'client',
            attributes: ['id', 'nom', 'email']
          },
          {
            model: Restaurant,
            as: 'restaurant'
          },
          {
            model: Utilisateur,
            as: 'employe',
            attributes: ['id', 'nom']
          }
        ]
      });

      if (!commande) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }

      // Vérification des droits d'accès
      if (req.user.role === 'CLIENT' && commande.idClient !== req.user.id) {
        return res.status(403).json({ message: "Accès non autorisé" });
      }

      res.json(commande);
    } catch (error) {
      console.error("Erreur getOne commande:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de la commande" });
    }
  },

  // Créer une nouvelle commande
  create: async (req, res) => {
    try {
      // Validation des données requises
      const { idRestaurant, typeCommande, contenu } = req.body;
      
      if (!idRestaurant || !typeCommande || !contenu) {
        return res.status(400).json({ message: "Données manquantes" });
      }

      // Vérification du restaurant
      const restaurant = await Restaurant.findByPk(idRestaurant);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant non trouvé" });
      }
      if (restaurant.statut !== 'OUVERT') {
        return res.status(400).json({ message: "Le restaurant est fermé" });
      }

      // Calcul du prix total
      let prixTotal = 0;
      if (contenu.menus) {
        prixTotal += contenu.menus.reduce((sum, menu) => sum + (menu.prix * menu.quantite), 0);
      }
      if (contenu.produitsIndividuels) {
        prixTotal += contenu.produitsIndividuels.reduce((sum, produit) => 
          sum + (produit.prix * produit.quantite), 0);
      }

      const commande = await Commande.create({
        idClient: req.user.id,
        idRestaurant,
        typeCommande,
        contenu,
        prixTotal,
        statut: 'EN_ATTENTE'
      });

      const nouvelleCommande = await Commande.findByPk(commande.id, {
        include: [
          {
            model: Utilisateur,
            as: 'client',
            attributes: ['id', 'nom', 'email']
          },
          {
            model: Restaurant,
            as: 'restaurant'
          }
        ]
      });

      res.status(201).json(nouvelleCommande);
    } catch (error) {
      console.error("Erreur create commande:", error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Erreur lors de la création de la commande" });
    }
  },

  // Mettre à jour le statut d'une commande
  updateStatus: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { statut } = req.body;

      if (!statut) {
        return res.status(400).json({ message: "Statut manquant" });
      }

      const commande = await Commande.findByPk(id);
      if (!commande) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }

      // Vérification des droits
      if (!['ADMIN', 'GERANT', 'EMPLOYE'].includes(req.user.role)) {
        return res.status(403).json({ message: "Non autorisé à modifier le statut" });
      }

      // Validation des transitions de statut
      const transitionsValides = {
        'EN_ATTENTE': ['EN_PREPARATION', 'ANNULEE'],
        'EN_PREPARATION': ['PRETE', 'ANNULEE'],
        'PRETE': ['LIVREE', 'ANNULEE']
      };

      if (!transitionsValides[commande.statut]?.includes(statut)) {
        return res.status(400).json({ 
          message: "Transition de statut invalide",
          statutActuel: commande.statut,
          transitionsPossibles: transitionsValides[commande.statut]
        });
      }

      // Si la commande passe en préparation, associer l'employé
      if (statut === 'EN_PREPARATION') {
        commande.idEmploye = req.user.id;
      }

      await commande.update({ 
        statut,
        idEmploye: commande.idEmploye
      });

      const updatedCommande = await Commande.findByPk(id, {
        include: [
          {
            model: Utilisateur,
            as: 'client',
            attributes: ['id', 'nom', 'email']
          },
          {
            model: Restaurant,
            as: 'restaurant'
          },
          {
            model: Utilisateur,
            as: 'employe',
            attributes: ['id', 'nom']
          }
        ]
      });

      res.json(updatedCommande);
    } catch (error) {
      console.error("Erreur updateStatus commande:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
    }
  },

  // Annuler une commande
  cancel: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const commande = await Commande.findByPk(id);

      if (!commande) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }

      // Seul le client qui a passé la commande peut l'annuler
      // Les ADMIN et GERANT peuvent aussi annuler les commandes
      if (req.user.role === 'CLIENT' && commande.idClient !== req.user.id) {
        return res.status(403).json({ message: "Non autorisé à annuler cette commande" });
      }

      // On ne peut annuler que les commandes en attente ou en préparation
      if (!['EN_ATTENTE', 'EN_PREPARATION'].includes(commande.statut)) {
        return res.status(400).json({ 
          message: "Impossible d'annuler la commande dans son état actuel",
          statut: commande.statut
        });
      }

      await commande.update({ statut: 'ANNULEE' });
      
      const commandeAnnulee = await Commande.findByPk(id, {
        include: [
          {
            model: Utilisateur,
            as: 'client',
            attributes: ['id', 'nom', 'email']
          },
          {
            model: Restaurant,
            as: 'restaurant'
          },
          {
            model: Utilisateur,
            as: 'employe',
            attributes: ['id', 'nom']
          }
        ]
      });

      res.json(commandeAnnulee);
    } catch (error) {
      console.error("Erreur cancel commande:", error);
      res.status(500).json({ message: "Erreur lors de l'annulation de la commande" });
    }
  }
};