const { Model, DataTypes } = require('sequelize');
const connection = require('./db');

class Produit extends Model {}

Produit.init({
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prix: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  categorie: {
    type: DataTypes.ENUM('BURGER', 'BOISSON', 'DESSERT', 'ACCOMPAGNEMENT'),
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  allergenes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tempsPreparation: {
    type: DataTypes.INTEGER, // en minutes
    allowNull: false,
    validate: {
      min: 0
    }
  },
  restaurants: {
    type: DataTypes.JSON,
    defaultValue: {
      restaurants: []
    },
    validate: {
      isValidRestaurantsFormat(value) {
        if (!value.restaurants || !Array.isArray(value.restaurants)) {
          throw new Error('Format restaurants invalide');
        }
        value.restaurants.forEach(rest => {
          if (!rest.idRestaurant || typeof rest.prix !== 'number' || 
              typeof rest.disponible !== 'boolean' || typeof rest.stock !== 'number') {
            throw new Error('Structure restaurant invalide');
          }
        });
      }
    }
  }
}, {
  sequelize: connection,
  modelName: 'Produit'
});

module.exports = Produit;