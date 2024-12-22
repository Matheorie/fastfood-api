const { Model, DataTypes } = require('sequelize');
const connection = require('./db');

class Restaurant extends Model {}

Restaurant.init({
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: "Un restaurant avec ce nom existe déjà."
    },
    validate: {
      notEmpty: {
        msg: "Le nom ne peut pas être vide"
      }
    }
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: "Un restaurant avec cette adresse existe déjà."
    },
    validate: {
      notEmpty: {
        msg: "L'adresse ne peut pas être vide"
      }
    }
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: "Un restaurant avec ce numéro de téléphone existe déjà."
    },
    validate: {
      is: {
        args: /^(\+[0-9]{2}|0)[0-9]{9}$/,
        msg: "Format de téléphone invalide"
      }
    }
  },
  heureOuverture: {
    type: DataTypes.TIME,
    allowNull: false
  },
  heureFermeture: {
    type: DataTypes.TIME,
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('OUVERT', 'FERME', 'EN_PAUSE'),
    defaultValue: 'FERME'
  },
  idGerant: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Utilisateurs',
      key: 'id'
    }
  }
}, {
  sequelize: connection,
  modelName: 'Restaurant',
  validate: {
    heuresValides() {
      if (this.heureOuverture >= this.heureFermeture) {
        throw new Error("L'heure d'ouverture doit être antérieure à l'heure de fermeture");
      }
    }
  }
});

module.exports = Restaurant;
