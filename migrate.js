require('dotenv').config();
const connection = require("./models/db");
require("./models/user");
require("./models/restaurant");
require("./models/produit");
require("./models/menu");
require("./models/commande");
require("./models/associations");

connection
  .sync({
    alter: true,
  })
  .then(() => console.log("Base de données synchronisée"))
  .catch((error) => {
    console.error("Erreur lors de la synchronisation :", error);
  })
  .finally(() => connection.close());