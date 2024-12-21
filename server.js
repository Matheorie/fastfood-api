require("dotenv").config();
const express = require("express");
require("./models/associations");

const userRouter = require("./routes/users");
const restaurantRoutes = require("./routes/restaurants");
const produitRoutes = require("./routes/produits");
const menuRoutes = require("./routes/menus");
const commandeRoutes = require("./routes/commandes");

const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.use(express.json());

// Route de test
app.get("/", (request, response) => {
  response.send("Hello world !!");
});

app.use(require("./routes/security"));
app.use(userRouter);
app.use("/restaurants", restaurantRoutes);
app.use("/produits", produitRoutes);
app.use("/menus", menuRoutes);
app.use("/commandes", commandeRoutes);

// Middleware global de gestion des erreurs
app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log("Serveur en écoute sur le port " + process.env.PORT)
);