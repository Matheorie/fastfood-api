const Utilisateur = require('./user');
const Restaurant = require('./restaurant');
const Produit = require('./produit');
const Menu = require('./menu');
const Commande = require('./commande');

// Cela mettra le champ idRestaurant à NULL si on supprime le restaurant
Restaurant.hasMany(Utilisateur, {
  foreignKey: 'idRestaurant',
  as: 'employes',
  onDelete: 'SET NULL',
  hooks: true
});

Utilisateur.belongsTo(Restaurant, {
  foreignKey: 'idRestaurant',
  as: 'restaurant',
  onDelete: 'SET NULL',
  hooks: true
});

// Association Utilisateur - Restaurant (Gérant)
Utilisateur.hasOne(Restaurant, {
  foreignKey: 'idGerant',
  as: 'restaurantGere'
});
Restaurant.belongsTo(Utilisateur, {
  foreignKey: 'idGerant',
  as: 'gerant'
});

// Association Utilisateur - Commande (Client)
Utilisateur.hasMany(Commande, {
  foreignKey: 'idClient',
  as: 'commandesClient'
});
Commande.belongsTo(Utilisateur, {
  foreignKey: 'idClient',
  as: 'client'
});

// Association Utilisateur - Commande (Employé)
Utilisateur.hasMany(Commande, {
  foreignKey: 'idEmploye',
  as: 'commandesEmploye'
});
Commande.belongsTo(Utilisateur, {
  foreignKey: 'idEmploye',
  as: 'employe'
});

// Association Restaurant - Commande
Restaurant.hasMany(Commande, {
  foreignKey: 'idRestaurant',
  as: 'commandes'
});
Commande.belongsTo(Restaurant, {
  foreignKey: 'idRestaurant',
  as: 'restaurant'
});

module.exports = {
  Utilisateur,
  Restaurant,
  Produit,
  Menu,
  Commande
};