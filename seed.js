require('dotenv').config();
const connection = require("./models/db");
const User = require("./models/user");
const Restaurant = require("./models/restaurant");
const Produit = require("./models/produit");
const Menu = require("./models/menu");
const Commande = require("./models/commande");
const { Op } = require("sequelize");
require("./models/associations"); // pour s'assurer que les associations sont chargées

async function seed() {
  try {
    // Force true : supprime et recrée les tables -> Attention aux données existantes !
    await connection.sync({ force: true });

    // Création d'utilisateurs
    const admin = await User.create({
      nom: "Admin User",
      email: "admin@example.com",
      motDePasse: "Admin@1234", // doit correspondre à request.http
      role: "ADMIN"
    });

    const gerant = await User.create({
      nom: "Gerant User",
      email: "gerant@example.com",
      motDePasse: "Gerant@1234",
      role: "GERANT"
    });

    const employe = await User.create({
      nom: "Employe User",
      email: "employe@example.com",
      motDePasse: "Employe@1234",
      role: "EMPLOYE"
    });

    const client = await User.create({
      nom: "Client User",
      email: "j@d.com",
      motDePasse: "12Az!3456",
      role: "CLIENT"
    });

    // Création d'un restaurant
    // Ce restaurant sera géré par "gerant"
    const restaurant = await Restaurant.create({
      nom: "FastFood Gourmet",
      adresse: "123 rue de la Dégustation",
      telephone: "0123456789",
      heureOuverture: "08:00:00",
      heureFermeture: "23:00:00",
      statut: "OUVERT",
      idGerant: gerant.id
    });

    // Affectation de l'employé à ce restaurant
    // (On stocke l'idRestaurant dans la table Users, si vous utilisez ce champ)
    await employe.update({
      idRestaurant: restaurant.id
    });

    // Produits initiaux (avec "restaurants" non nul)
    const burger = await Produit.create({
      nom: "Super Burger",
      description: "Un burger exceptionnel avec de la viande de qualité",
      prix: 8.99,
      categorie: "BURGER",
      imageUrl: "https://example.com/burger.jpg",
      allergenes: ["gluten", "sésame"],
      disponible: true,
      tempsPreparation: 10,
      restaurants: {
        restaurants: [
          {
            idRestaurant: restaurant.id,
            prix: 8.99,
            disponible: true,
            stock: 50
          }
        ]
      }
    });

    const boisson = await Produit.create({
      nom: "Coca-Cola",
      description: "Boisson gazeuse rafraîchissante",
      prix: 3.50,
      categorie: "BOISSON",
      imageUrl: "https://example.com/coca.jpg",
      allergenes: [],
      disponible: true,
      tempsPreparation: 2,
      restaurants: {
        restaurants: [
          {
            idRestaurant: restaurant.id,
            prix: 3.50,
            disponible: true,
            stock: 100
          }
        ]
      }
    });

    const frites = await Produit.create({
      nom: "Frites",
      description: "Frites croustillantes",
      prix: 2.50,
      categorie: "ACCOMPAGNEMENT",
      imageUrl: "https://example.com/frites.jpg",
      allergenes: ["gluten"],
      disponible: true,
      tempsPreparation: 5,
      restaurants: {
        restaurants: [
          {
            idRestaurant: restaurant.id,
            prix: 2.50,
            disponible: true,
            stock: 100
          }
        ]
      }
    });

    const dessert = await Produit.create({
      nom: "Glace Vanille",
      description: "Glace onctueuse à la vanille",
      prix: 4.00,
      categorie: "DESSERT",
      imageUrl: "https://example.com/glace.jpg",
      allergenes: ["lait"],
      disponible: true,
      tempsPreparation: 3,
      restaurants: {
        restaurants: [
          {
            idRestaurant: restaurant.id,
            prix: 4.00,
            disponible: true,
            stock: 30
          }
        ]
      }
    });

    // Création d'un menu
    const menuMaxi = await Menu.create({
      nom: "Menu Maxi Best Of",
      description: "Menu complet avec burger, boisson et frites",
      prix: 12.99,
      categorie: "MAXI",
      imageUrl: "https://example.com/menu-maxi.jpg",
      disponible: true,
      composition: {
        compositions: [
          {
            categorie: "BURGER",
            options: [{ idProduit: burger.id, obligatoire: true }]
          },
          {
            categorie: "BOISSON",
            options: [{ idProduit: boisson.id, obligatoire: true }]
          },
          {
            categorie: "ACCOMPAGNEMENT",
            options: [{ idProduit: frites.id, obligatoire: true }]
          }
        ]
      },
      restaurants: {
        restaurants: [
          {
            idRestaurant: restaurant.id,
            prix: 12.99,
            disponible: true
          }
        ]
      }
    });

    // Test d'une commande
    const commande = await Commande.create({
      idClient: client.id,
      idRestaurant: restaurant.id,
      typeCommande: 'SUR_PLACE',
      statut: 'EN_ATTENTE',
      prixTotal: 0, 
      contenu: {
        menus: [
          {
            idMenu: menuMaxi.id,
            quantite: 2
          }
        ],
        produitsIndividuels: [
          {
            idProduit: boisson.id,
            quantite: 2
          }
        ]
      }
    });

    console.log("Base de données remplie avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors du seed :", error);
    process.exit(1);
  }
}

seed();
