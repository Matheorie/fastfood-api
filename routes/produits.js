const express = require("express");
const router = express.Router();
const produitController = require("../controllers/produits");
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");

// Routes publiques
router.get("/", produitController.getAll);
router.get("/:id", produitController.getOne);

// Routes protégées : création, modification, suppression réservées à ADMIN/GERANT
router.post("/", checkAuth, checkRole('ADMIN', 'GERANT'), produitController.create);
router.put("/:id", checkAuth, checkRole('ADMIN', 'GERANT'), produitController.update);
router.delete("/:id", checkAuth, checkRole('ADMIN', 'GERANT'), produitController.delete);

module.exports = router;