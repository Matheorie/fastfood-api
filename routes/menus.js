const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menus");
const checkAuth = require("../middlewares/checkAuth");

// Routes publiques
router.get("/", menuController.getAll);
router.get("/:id", menuController.getOne);

// Routes protégées (nécessitent une authentification)
router.post("/", checkAuth, menuController.create);
router.put("/:id", checkAuth, menuController.update);
router.delete("/:id", checkAuth, menuController.delete);

module.exports = router;