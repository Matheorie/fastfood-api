const { Router } = require("express");
const userController = require("../controllers/users.js");
const checkAuth = require("../middlewares/checkAuth.js");
const checkRole = require("../middlewares/checkRole.js");

const router = new Router();

// Liste des utilisateurs réservée aux ADMIN et GERANT
router.get("/users", checkAuth, checkRole('ADMIN', 'GERANT'), userController.getAll);

// Création d'un utilisateur accessible à tout le monde (ou restreindre selon votre logique)
router.post("/users", userController.create);

// Obtenir un utilisateur réservé aux ADMIN et GERANT
router.get("/users/:id", checkAuth, checkRole('ADMIN', 'GERANT'), userController.getOne);

// Modifier un utilisateur réservé aux ADMIN et GERANT
router.patch("/users/:id", checkAuth, checkRole('ADMIN', 'GERANT'), userController.update);

// Supprimer un utilisateur réservé aux ADMIN et GERANT
router.delete("/users/:id", checkAuth, checkRole('ADMIN', 'GERANT'), userController.delete);

module.exports = router;
