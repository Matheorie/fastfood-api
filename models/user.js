const { Model, DataTypes } = require('sequelize');
const connection = require('./db');
const bcrypt = require('bcryptjs');

class User extends Model {}

User.init({
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  motDePasse: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, 72] // bcrypt limite à 72 caractères
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
      isDate: true,
      isBefore: new Date().toISOString() // Date de naissance doit être dans le passé
    }
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'GERANT', 'EMPLOYE', 'CLIENT'),
    defaultValue: 'CLIENT'
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