const { Model, DataTypes } = require('sequelize');
const connection = require('./db');

class Produit extends Model {}

Produit.init({
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: "Un produit avec ce nom existe déjà."
    },
    validate: {
      notEmpty: {
        msg: "Le nom ne peut pas être vide"
      },
      isString(value) {
        if (typeof value !== 'string') {
          throw new Error("Le nom doit être une chaîne de caractères.");
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
          throw new Error("La description doit être une chaîne de caractères.");
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
  categorie: {
    type: DataTypes.ENUM('BURGER', 'BOISSON', 'DESSERT', 'ACCOMPAGNEMENT'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['BURGER', 'BOISSON', 'DESSERT', 'ACCOMPAGNEMENT']],
        msg: "La catégorie doit être l'une des suivantes : BURGER, BOISSON, DESSERT, ACCOMPAGNEMENT."
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
  allergenes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    validate: {
      isArrayOfStrings(value) {
        if (!Array.isArray(value)) {
          throw new Error("Les allergènes doivent être un tableau.");
        }
        for (const allergene of value) {
          if (typeof allergene !== 'string') {
            throw new Error("Chaque allergène doit être une chaîne de caractères.");
          }
        }
      }
    }
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tempsPreparation: {
    type: DataTypes.INTEGER, // en minutes
    allowNull: false,
    validate: {
      isInt: {
        msg: "Le temps de préparation doit être un entier."
      },
      min: {
        args: [0],
        msg: "Le temps de préparation ne peut pas être négatif."
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
            typeof rest.disponible !== 'boolean' ||
            typeof rest.stock !== 'number'
          ) {
            throw new Error('Structure restaurant invalide');
          }
        });
      }
    }
  }
}, {
  sequelize: connection,
  modelName: 'Produit',
  hooks: {
    beforeValidate: (produit) => {
      // Convertir les champs si nécessaire
      if (produit.nom && typeof produit.nom !== 'string') {
        produit.nom = String(produit.nom);
      }
      if (produit.description && typeof produit.description !== 'string') {
        produit.description = String(produit.description);
      }
      if (produit.imageUrl && typeof produit.imageUrl !== 'string') {
        produit.imageUrl = String(produit.imageUrl);
      }
    }
  }
});

module.exports = Produit;