const { Model, DataTypes } = require('sequelize');
const connection = require('./db');

class Menu extends Model {}

Menu.init({
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: "Un menu avec ce nom existe déjà."
    },
    validate: {
      notEmpty: {
        msg: "Le nom ne peut pas être vide"
      },
      isString(value) {
        if (typeof value !== 'string') {
          throw new Error("Le nom du menu doit être une chaîne de caractères.");
        }
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isString(value) {
        if (typeof value !== 'string') {
          throw new Error("La description du menu doit être une chaîne de caractères.");
        }
      }
    }
  },
  prix: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: "Le prix doit être un nombre décimal valide."
      },
      min: {
        args: [0],
        msg: "Le prix ne peut pas être négatif."
      }
    }
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: {
        msg: "L'URL de l'image doit être valide."
      },
      isString(value) {
        if (typeof value !== 'string') {
          throw new Error("L'URL de l'image doit être une chaîne de caractères.");
        }
      }
    }
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
          if (
            !rest.idRestaurant ||
            typeof rest.prix !== 'number' ||
            typeof rest.disponible !== 'boolean'
          ) {
            throw new Error('Structure restaurant invalide');
          }
        });
      }
    }
  }
}, {
  sequelize: connection,
  modelName: 'Menu',
  hooks: {
    beforeValidate: (menu) => {
      // Convertir les champs si nécessaire (optionnel)
      if (menu.nom && typeof menu.nom !== 'string') {
        menu.nom = String(menu.nom);
      }
      if (menu.description && typeof menu.description !== 'string') {
        menu.description = String(menu.description);
      }
      if (menu.imageUrl && typeof menu.imageUrl !== 'string') {
        menu.imageUrl = String(menu.imageUrl);
      }
    }
  }
});

module.exports = Menu;
