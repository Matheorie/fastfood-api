const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menus");
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");

// Routes publiques
router.get("/", menuController.getAll);
router.get("/:id", menuController.getOne);

// Routes protégées : création, modification, suppression réservées à ADMIN/GERANT
router.post("/", checkAuth, checkRole('ADMIN', 'GERANT'), menuController.create);
router.put("/:id", checkAuth, checkRole('ADMIN', 'GERANT'), menuController.update);
router.delete("/:id", checkAuth, checkRole('ADMIN', 'GERANT'), menuController.delete);

module.exports = router;
