# FastFood API

## Description

FastFood API est une application backend RESTful qui permet de gérer efficacement toutes les opérations d'un restaurant rapide. L'API offre des fonctionnalités pour créer, modifier et consulter les restaurants, gérer les utilisateurs avec différents rôles (ADMIN, GERANT, EMPLOYE, CLIENT), maintenir un catalogue de produits actualisés, construire des menus personnalisés en combinant plusieurs produits, et superviser le cycle complet des commandes clients (création, suivi, annulation). La sécurité des données est assurée par l'utilisation de tokens JWT pour contrôler l'accès aux différentes routes. L'objectif est d'optimiser les workflows internes tout en garantissant une expérience client fluide et sans erreurs.

## Membres de l'équipe

- **Mathéo JUDENNE** (@Matheorie) : Responsable de la gestion des restaurants, des utilisateurs et des tests de toutes les fonctionnalités.
- **Alban GUERET** (@4bann) : Responsable de la gestion des commandes et de la sécurité de l'application.
- **Roméo CARECCHIO** (@RomiEnTongues) : Responsable de la gestion des produits et des menus.

## Fonctionnalités

- **Gestion des Restaurants**\
  Création, modification, suppression et consultation des restaurants. Permet aux gérants d'ajouter et de gérer leurs établissements.

- **Gestion des Utilisateurs**\
  Inscription, authentification, gestion des rôles (ADMIN, GERANT, EMPLOYE, CLIENT) et des droits d'accès. Assure que chaque utilisateur dispose des permissions appropriées.

- **Gestion des Produits**\
  Ajout, modification, suppression et affichage des produits disponibles dans les restaurants. Permet de maintenir un catalogue de produits à jour.&#x20;

- **Gestion des Menus**\
  Ajout, modification, suppression et consultation des menus associés aux restaurants. Permet de créer des menus personnalisés avec des combinaisons de produits.

- **Gestion des Commandes**\
  Création, mise à jour, annulation et suivi des commandes passées par les clients. Gère le cycle de vie complet des commandes.

- **Sécurité et Authentification**\
  Mise en place de l'authentification via JWT, gestion des rôles et des permissions pour sécuriser l'accès aux différentes fonctionnalités de l'API.

- **Tests et Validation**\
  Mise en place de tests  pour assurer la fiabilité et la robustesse de l'API.

## Technologies Utilisées

- **Node.js & Express.js** : Pour le développement du serveur backend.
- **Sequelize** : ORM pour la gestion de la base de données MySQL.
- **MySQL** : Système de gestion de base de données relationnelle.
- **JWT** : Pour l'authentification et la sécurisation des routes.
- **Docker** : Pour la containerisation de l'application et de la base de données.

## Installation

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/Matheorie/fastfood-api
   cd fastfood-api
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**

   - Renommez le fichier `.env.example` en `.env` et remplissez les valeurs nécessaires.

4. **Lancer la base de données avec Docker**

   ```bash
   docker-compose up -d
   ```

5. **Initialiser la base de données avec des données de test**

   ```bash
   node donnees_db.js
   ```

6. **Démarrer le serveur**

   ```bash
   npm run dev
   ```

## Utilisation

Une fois le serveur démarré, vous pouvez interagir avec l'API via des outils comme **Postman** ou **VSCode REST Client** en utilisant le fichier `request.http` fourni.
