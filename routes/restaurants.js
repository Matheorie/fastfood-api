const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurants");
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");

// Routes publiques
router.get("/", restaurantController.getAll);
router.get("/:id", restaurantController.getOne);

// Routes protégées : création, modification, suppression réservées à ADMIN/GERANT
router.post("/", checkAuth, checkRole('ADMIN', 'GERANT'), restaurantController.create);
router.put("/:id", checkAuth, checkRole('ADMIN', 'GERANT'), restaurantController.update);
router.delete("/:id", checkAuth, checkRole('ADMIN', 'GERANT'), restaurantController.delete);

module.exports = router;
