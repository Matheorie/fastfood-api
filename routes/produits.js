const express = require("express");
const router = express.Router();
const produitController = require("../controllers/produits");
const checkAuth = require("../middlewares/checkAuth");

// Routes publiques
router.get("/", produitController.getAll);
router.get("/:id", produitController.getOne);

// Routes protégées (nécessitent une authentification)
router.post("/", checkAuth, produitController.create);
router.put("/:id", checkAuth, produitController.update);
router.delete("/:id", checkAuth, produitController.delete);

module.exports = router;