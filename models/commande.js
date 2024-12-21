const { Model, DataTypes } = require('sequelize');
const connection = require('./db');

class Commande extends Model {}

Commande.init({
  dateCommande: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('EN_ATTENTE', 'EN_PREPARATION', 'PRETE', 'LIVREE', 'ANNULEE'),
    defaultValue: 'EN_ATTENTE'
  },
  prixTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: "Le prix total ne peut pas être négatif."
      }
    }
  },
  typeCommande: {
    type: DataTypes.ENUM('SUR_PLACE', 'A_EMPORTER'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['SUR_PLACE', 'A_EMPORTER']],
        msg: "Le type de commande doit être 'SUR_PLACE' ou 'A_EMPORTER'."
      }
    }
  },
  idClient: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Utilisateurs',
      key: 'id'
    }
  },
  idRestaurant: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Restaurants',
      key: 'id'
    }
  },
  idEmploye: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Utilisateurs',
      key: 'id'
    }
  },
  contenu: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidContenu(value) {
        if (!value.menus && !value.produitsIndividuels) {
          throw new Error('La commande doit contenir au moins un menu ou un produit individuel.');
        }

        if (value.menus) {
          if (!Array.isArray(value.menus)) {
            throw new Error('Le champ "menus" doit être un tableau.');
          }
          value.menus.forEach(menu => {
            if (!menu.idMenu || !menu.quantite) {
              throw new Error('Structure menu invalide.');
            }
          });
        }

        if (value.produitsIndividuels) {
          if (!Array.isArray(value.produitsIndividuels)) {
            throw new Error('Le champ "produitsIndividuels" doit être un tableau.');
          }
          value.produitsIndividuels.forEach(produit => {
            if (!produit.idProduit || !produit.quantite) {
              throw new Error('Structure produit invalide.');
            }
          });
        }
      }
    }
  }
}, {
  sequelize: connection,
  modelName: 'Commande',
  tableName: 'Commandes'
});

module.exports = Commande;