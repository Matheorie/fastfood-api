require("dotenv").config();
const express = require("express");

// Import des associations avant les routes
require("./models/associations");

const userRouter = require("./routes/users");
const restaurantRoutes = require("./routes/restaurants");
const produitRoutes = require("./routes/produits");
const menuRoutes = require("./routes/menus");
const commandeRoutes = require("./routes/commandes");

const app = express();

app.use(express.json());

app.get("/", (request, response, next) => {
  response.send("Hello world !!");
});

app.use(userRouter);
app.use(require("./routes/security"));
app.use("/restaurants", restaurantRoutes);
app.use("/produits", produitRoutes);
app.use("/menus", menuRoutes);
app.use("/commandes", commandeRoutes);

app.listen(process.env.PORT, () =>
  console.log("Serveur en écoute sur le port " + process.env.PORT)
);