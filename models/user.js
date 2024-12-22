const { Model, DataTypes } = require('sequelize');
const connection = require('./db');
const bcrypt = require('bcryptjs');

class User extends Model {}

User.init({
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Le nom ne peut pas être vide"
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    unique: {
      msg: "Cet email est déjà utilisé."
    },
    allowNull: false,
    validate: {
      isEmail: {
        msg: "L'email doit être valide."
      }
    }
  },
  motDePasse: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [8, 72],
        msg: "Le mot de passe doit contenir entre 8 et 72 caractères."
      },
      isStrongPassword(value) {
        const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!strongPasswordRegex.test(value)) {
          throw new Error("Le mot de passe doit contenir au moins une lettre, un chiffre et un caractère spécial.");
        }
      }
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  dateNaissance: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: "La date de naissance doit être une date valide."
      },
      isBefore: {
        args: new Date().toISOString().split('T')[0],
        msg: "La date de naissance doit être dans le passé."
      }
    }
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'GERANT', 'EMPLOYE', 'CLIENT'),
    defaultValue: 'CLIENT'
  },
  idRestaurant: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Restaurants',
      key: 'id'
    },
    validate: {
      isInt: {
        msg: "idRestaurant doit être un entier."
      }
    }
  }
}, {
  sequelize: connection,
  modelName: 'Utilisateur',
  hooks: {
    beforeCreate: async (utilisateur) => {
      if (utilisateur.motDePasse) {
        utilisateur.motDePasse = await bcrypt.hash(utilisateur.motDePasse, 10);
      }
    },
    beforeUpdate: async (utilisateur) => {
      if (utilisateur.changed('motDePasse')) {
        utilisateur.motDePasse = await bcrypt.hash(utilisateur.motDePasse, 10);
      }
    }
  }
});

// Méthode pour vérifier le mot de passe
User.prototype.verifierMotDePasse = async function(motDePasse) {
  return await bcrypt.compare(motDePasse, this.motDePasse);
};

module.exports = User;