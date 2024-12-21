module.exports = (err, req, res, next) => {
  console.error("Erreur globale interceptÃ©e:", err);
  
  const status = err.statusCode || 500;
  const message = err.message || "Erreur interne du serveur";

  // Gestion des erreurs de validation Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => e.message);
    return res.status(400).json({
      error: true,
      message: "Validation Error",
      details: errors
    });
  }

  res.status(status).json({
    error: true,
    message,
    details: err.details || null
  });
};