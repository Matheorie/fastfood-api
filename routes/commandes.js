const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/commandes");
const checkAuth = require("../middlewares/checkAuth");

// Toutes les routes de commandes nécessitent une authentification
router.use(checkAuth);

// Routes pour la gestion des commandes
router.get("/", commandeController.getAll);
router.get("/:id", commandeController.getOne);
router.post("/", commandeController.create);
router.patch("/:id/status", commandeController.updateStatus);
router.post("/:id/cancel", commandeController.cancel);

module.exports = router;