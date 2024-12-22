require("dotenv").config();
const connection = require("./models/db");
const User = require("./models/user");
const Restaurant = require("./models/restaurant");
const Produit = require("./models/produit");
const Menu = require("./models/menu");
const Commande = require("./models/commande");
require("./models/associations");

async function initDb() {
  try {
    console.log("🔄 Synchronisation de la base de données...");
    // Force true : supprime et recrée toutes les tables
    await connection.sync({ force: true });
    console.log("✅ Tables recréées avec succès.");

    /************************************************************
     * 1) CREATION DES UTILISATEURS
     ************************************************************/
    console.log("👤 Création d'utilisateurs...");
    const admin = await User.create({
      nom: "Admin User",
      email: "admin@example.com",
      motDePasse: "Admin@1234",
      role: "ADMIN"
    });

    const gerant1 = await User.create({
      nom: "Gerant Un",
      email: "gerant1@example.com",
      motDePasse: "Gerant@1234",
      role: "GERANT"
    });

    const gerant2 = await User.create({
      nom: "Gerant Deux",
      email: "gerant2@example.com",
      motDePasse: "Gerant@1234",
      role: "GERANT"
    });

    const employe1 = await User.create({
      nom: "Employe Un",
      email: "employe1@example.com",
      motDePasse: "Employe@1234",
      role: "EMPLOYE"
    });

    const employe2 = await User.create({
      nom: "Employe Deux",
      email: "employe2@example.com",
      motDePasse: "Employe@1234",
      role: "EMPLOYE"
    });

    const client1 = await User.create({
      nom: "Client Un",
      email: "client1@example.com",
      motDePasse: "12Az!3456",
      role: "CLIENT"
    });

    const client2 = await User.create({
      nom: "Client Deux",
      email: "client2@example.com",
      motDePasse: "12Az!3456",
      role: "CLIENT"
    });

    const client3 = await User.create({
      nom: "Client Trois",
      email: "client3@example.com",
      motDePasse: "12Az!3456",
      role: "CLIENT"
    });

    /************************************************************
     * 2) CREATION DES RESTAURANTS
     ************************************************************/
    console.log("🏪 Création de restaurants...");

    const restaurant1 = await Restaurant.create({
      nom: "FastFood Gourmet",
      adresse: "123 rue de la Dégustation",
      telephone: "0123456789",
      heureOuverture: "08:00:00",
      heureFermeture: "23:00:00",
      statut: "OUVERT",
      idGerant: gerant1.id
    });

    const restaurant2 = await Restaurant.create({
      nom: "Burger Place",
      adresse: "20 avenue du Sandwich",
      telephone: "0145456789",
      heureOuverture: "09:00:00",
      heureFermeture: "22:00:00",
      statut: "FERME",
      idGerant: gerant2.id
    });

    // On affecte un employé au premier restaurant
    await employe1.update({ idRestaurant: restaurant1.id });
    // Et un autre employé au deuxième
    await employe2.update({ idRestaurant: restaurant2.id });

    /************************************************************
     * 3) CREATION DE PRODUITS
     ************************************************************/
    console.log("🍔 Création de produits...");

    const superBurger = await Produit.create({
      nom: "Super Burger",
      description: "Burger de qualité supérieure",
      prix: 8.99,
      categorie: "BURGER",
      imageUrl: "https://example.com/burger.jpg",
      allergenes: ["gluten", "sésame"],
      disponible: true,
      tempsPreparation: 10,
      restaurants: {
        restaurants: [
          {
            idRestaurant: restaurant1.id,
            prix: 8.99,
            disponible: true,
            stock: 50
          },
          {
            idRestaurant: restaurant2.id,
            prix: 9.49, // petit écart de prix
            disponible: true,
            stock: 30
          }
        ]
      }
    });

    const cheeseBurger = await Produit.create({
      nom: "Cheese Burger",
      description: "Burger classique avec fromage",
      prix: 7.50,
      categorie: "BURGER",
      imageUrl: "https://example.com/cheese.jpg",
      allergenes: ["gluten", "lait"],
      disponible: true,
      tempsPreparation: 8,
      restaurants: {
        restaurants: [
          {
            idRestaurant: restaurant1.id,
            prix: 7.50,
            disponible: true,
            stock: 60
          }
        ]
      }
    });

    const coca = await Produit.create({
      nom: "Coca-Cola",
      description: "Boisson gazeuse rafraîchissante",
      prix: 3.00,
      categorie: "BOISSON",
      imageUrl: "https://example.com/coca.jpg",
      allergenes: [],
      disponible: true,
      tempsPreparation: 2,
      restaurants: {
        restaurants: [
          {
            idRestaurant: restaurant1.id,
            prix: 3.00,
            disponible: true,
            stock: 100
          },
          {
            idRestaurant: restaurant2.id,
            prix: 3.20,
            disponible: true,
            stock: 50
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
            idRestaurant: restaurant1.id,
            prix: 2.50,
            disponible: true,
            stock: 120
          },
          {
            idRestaurant: restaurant2.id,
            prix: 2.70,
            disponible: true,
            stock: 80
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
            idRestaurant: restaurant1.id,
            prix: 4.00,
            disponible: true,
            stock: 30
          }
        ]
      }
    });

    const sprite = await Produit.create({
      nom: "Sprite",
      description: "Boisson gazeuse citron-lime",
      prix: 3.00,
      categorie: "BOISSON",
      imageUrl: "https://example.com/sprite.jpg",
      allergenes: [],
      disponible: true,
      tempsPreparation: 2,
      restaurants: {
        restaurants: [
          {
            idRestaurant: restaurant1.id,
            prix: 3.00,
            disponible: true,
            stock: 40
          }
        ]
      }
    });

    /************************************************************
     * 4) CREATION DE MENUS
     ************************************************************/
    console.log("📋 Création de menus...");

    const menuMaxi = await Menu.create({
      nom: "Menu Maxi Best Of",
      description: "Burger, boisson et frites",
      prix: 12.99,
      imageUrl: "https://example.com/menu-maxi.jpg",
      disponible: true,
      composition: {
        compositions: [
          {
            categorie: "BURGER",
            options: [{ idProduit: superBurger.id, obligatoire: true }]
          },
          {
            categorie: "BOISSON",
            options: [{ idProduit: coca.id, obligatoire: true }]
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
            idRestaurant: restaurant1.id,
            prix: 12.99,
            disponible: true
          }
        ]
      }
    });

    const menuCheese = await Menu.create({
      nom: "Menu Cheese & Co",
      description: "Cheese Burger + Boisson + Frites",
      prix: 11.99,
      imageUrl: "https://example.com/menu-cheese.jpg",
      disponible: true,
      composition: {
        compositions: [
          {
            categorie: "BURGER",
            options: [{ idProduit: cheeseBurger.id, obligatoire: true }]
          },
          {
            categorie: "BOISSON",
            options: [{ idProduit: coca.id, obligatoire: true }]
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
            idRestaurant: restaurant1.id,
            prix: 11.99,
            disponible: true
          }
        ]
      }
    });

    const menuEnfant = await Menu.create({
      nom: "Menu Enfant Gourmand",
      description: "Petit burger, frites, boisson",
      prix: 9.99,
      imageUrl: "https://example.com/menu-enfant.jpg",
      disponible: true,
      composition: {
        compositions: [
          {
            categorie: "BURGER",
            options: [{ idProduit: cheeseBurger.id, obligatoire: true }]
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
            idRestaurant: restaurant1.id,
            prix: 9.99,
            disponible: true
          }
        ]
      }
    });

    /************************************************************
     * 5) CREATION DE COMMANDES DE TEST
     ************************************************************/
    console.log("🛎️ Création de commandes...");

    // Commande #1 : Client1 dans restaurant1
    const commande1 = await Commande.create({
      idClient: client1.id,
      idRestaurant: restaurant1.id,
      typeCommande: "SUR_PLACE",
      statut: "EN_ATTENTE",
      prixTotal: 0,
      contenu: {
        menus: [
          {
            idMenu: menuMaxi.id,
            quantite: 1
          }
        ],
        produitsIndividuels: [
          {
            idProduit: frites.id,
            quantite: 1
          }
        ]
      }
    });

    // Commande #2 : Client2 dans restaurant1
    const commande2 = await Commande.create({
      idClient: client2.id,
      idRestaurant: restaurant1.id,
      typeCommande: "A_EMPORTER",
      statut: "LIVREE",
      prixTotal: 0,
      contenu: {
        menus: [],
        produitsIndividuels: [
          {
            idProduit: coca.id,
            quantite: 2
          },
          {
            idProduit: superBurger.id,
            quantite: 1
          }
        ]
      }
    });

    // Commande #3 : Client3 dans restaurant2 (FERME)
    const commande3 = await Commande.create({
      idClient: client3.id,
      idRestaurant: restaurant2.id,
      typeCommande: "SUR_PLACE",
      statut: "EN_ATTENTE",
      prixTotal: 0,
      contenu: {
        menus: [],
        produitsIndividuels: [
          {
            idProduit: superBurger.id, // dispo dans restaurant2
            quantite: 2
          }
        ]
      }
    });

    console.log("🔢 Mise à jour des prix totaux + décrémentation stock...");
    // Pour l'exemple, on va juste forcer un prix arbitraire :
    await commande1.update({ prixTotal: 15.99 });
    await commande2.update({ prixTotal: 15.00 });
    await commande3.update({ prixTotal: 18.00 });

    console.log("✅ Base de données initialisée avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la base :", error);
    process.exit(1);
  }
}

// Lancement du script
initDb();