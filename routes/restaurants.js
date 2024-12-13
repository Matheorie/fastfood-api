const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurants");
const checkAuth = require("../middlewares/checkAuth");

// Ajout de checkAuth pour sécuriser les routes
router.get("/", restaurantController.getAll);
router.get("/:id", restaurantController.getOne);
router.post("/", checkAuth, restaurantController.create);
router.put("/:id", checkAuth, restaurantController.update);
router.delete("/:id", checkAuth, restaurantController.delete);

module.exports = router;