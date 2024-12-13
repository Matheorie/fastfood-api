const { Sequelize } = require("sequelize");

// Vérification de la présence des variables d'environnement requises
if (!process.env.DATABASE_NAME || !process.env.DATABASE_USER || !process.env.DATABASE_PASSWORD) {
  console.error('❌ Erreur: Variables d\'environnement manquantes. Vérifiez votre fichier .env');
  process.exit(1);
}

const connection = new Sequelize({
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 3306,
  dialect: process.env.DATABASE_DIALECT || 'mysql',
  logging: console.log
});

// Test de connexion
connection.authenticate()
  .then(() => {
    console.log('✅ Connexion à la base de données réussie !');
    console.log(`Base de données: ${process.env.DATABASE_NAME}`);
    console.log(`Utilisateur: ${process.env.DATABASE_USER}`);
    console.log(`Host: ${process.env.DATABASE_HOST || 'localhost'}`);
  })
  .catch((error) => {
    console.error('❌ Impossible de se connecter à la base de données :', error.message);
    console.error('Vérifiez vos variables d\'environnement dans le fichier .env');
  });

module.exports = connection;