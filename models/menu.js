const { Model, DataTypes } = require('sequelize');
const connection = require('./db');

class Menu extends Model {}

Menu.init({
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
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  categorie: {
    type: DataTypes.ENUM('CLASSIQUE', 'MAXI', 'ENFANT', 'SPECIAL'),
    allowNull: false
  },
  composition: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      compositions: []
    },
    validate: {
      isValidComposition(value) {
        if (!value.compositions || !Array.isArray(value.compositions)) {
          throw new Error('Format composition invalide');
        }
        value.compositions.forEach(comp => {
          if (!comp.categorie || !comp.options || !Array.isArray(comp.options)) {
            throw new Error('Structure composition invalide');
          }
        });
      }
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
              typeof rest.disponible !== 'boolean') {
            throw new Error('Structure restaurant invalide');
          }
        });
      }
    }
  }
}, {
  sequelize: connection,
  modelName: 'Menu'
});

module.exports = Menu;