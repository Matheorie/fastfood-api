# FastFood API

## Description

FastFood API est une application backend RESTful conçue pour gérer les opérations essentielles d'un système de restauration rapide. Elle permet la gestion des restaurants, des utilisateurs, des produits et des commandes, tout en assurant une sécurité robuste grâce à l'authentification par JWT. Cette API facilite l'administration et l'interaction entre les différentes entités, offrant une solution complète pour un service de fast-food moderne et efficace.

## Membres
- **Mathéo JUDENNE** (@Matheorie): Responsable de la gestion des restaurants, des utilisateurs et des tests de toutes les fonctionnalités.
- **Alban GUERET** (@4bann) : Responsable de la gestion des commandes et de la sécurité de l'application.
- **Roméo CARECCHIO** (@RomiEnTongues) : Responsable de la gestion des produits et des menus.

## Fonctionnalités

- **Gestion des Restaurants**  
  Création, modification, suppression et consultation des restaurants. Permet aux gérants d'ajouter et de gérer leurs établissements. *(Responsable : Mathéo JUDENNE)*

- **Gestion des Utilisateurs**  
  Inscription, authentification, gestion des rôles (ADMIN, GERANT, EMPLOYE, CLIENT) et des droits d'accès. Assure que chaque utilisateur dispose des permissions appropriées. *(Responsable : Mathéo JUDENNE)*

- **Gestion des Produits et Menus**  
  Ajout, modification, suppression et affichage des produits disponibles dans les restaurants. Permet de maintenir un catalogue de produits à jour. *(Responsable : Roméo CARECCHIO)*

- **Gestion des Commandes**  
  Création, mise à jour, annulation et suivi des commandes passées par les clients. Gère le cycle de vie complet des commandes. *(Responsable : Alban GUERET)*

- **Sécurité et Authentification**  
  Mise en place de l'authentification via JWT, gestion des rôles et des permissions pour sécuriser l'accès aux différentes fonctionnalités de l'API. *(Responsable : Alban GUERET)*

- **Tests et Validation**  
  Mise en place de tests pour assurer la fiabilité et la robustesse de l'API. *(Responsable : Mathéo JUDENNE)*

## Technologies Utilisées

- **Node.js & Express.js** : Pour le développement du serveur backend.
- **Sequelize** : ORM pour la gestion de la base de données MySQL.
- **MySQL** : Système de gestion de base de données relationnelle.
- **JWT** : Pour l'authentification et la sécurisation des routes.
- **Docker** : Pour la containerisation de l'application et de la base de données.

## Installation

1. **Cloner le dépôt**
   git clone https://github.com/Matheorie/fastfood-api
   cd fastfood-api

2. **Installer les dépendances**
   npm install

3. **Configurer les variables d'environnement**
   - Renommez le fichier `.env.example` en `.env` et remplissez les valeurs nécessaires.

4. **Lancer la base de données avec Docker**
   docker-compose up -d

5. **Initialiser la base de données avec les données de test**
   node donnees_db.js

6. **Démarrer le serveur**
   npm run dev

## Utilisation

Une fois le serveur démarré, vous pouvez interagir avec l'API via des outils comme **Postman** ou **VSCode REST Client** en utilisant le fichier `request.http` fourni. Voici quelques opérations de base :

- **Authentification**
  - **Login** : Obtenir un token JWT pour accéder aux routes protégées.
  
- **Gestion des Restaurants**
  - **Créer un restaurant** : Accessible uniquement aux ADMIN et GERANT.
  - **Modifier un restaurant** : Accessible uniquement aux ADMIN et GERANT du restaurant.
  - **Supprimer un restaurant** : Accessible uniquement aux ADMIN et GERANT du restaurant.

- **Gestion des Utilisateurs**
  - **Créer un utilisateur** : Accessible uniquement aux ADMIN et GERANT.
  - **Modifier un utilisateur** : Accessible uniquement aux ADMIN et l'utilisateur lui-même.
  - **Supprimer un utilisateur** : Accessible uniquement aux ADMIN et l'utilisateur lui-même.

- **Gestion des Produits**
  - **Créer un produit** : Accessible uniquement aux ADMIN et GERANT.
  - **Modifier un produit** : Accessible uniquement aux ADMIN et GERANT.
  - **Supprimer un produit** : Accessible uniquement aux ADMIN et GERANT.

- **Gestion des Commandes**
  - **Créer une commande** : Accessible uniquement aux CLIENT.
  - **Modifier une commande** : Accessible uniquement aux ADMIN, GERANT et EMPLOYE du restaurant.
  - **Annuler une commande** : Accessible uniquement aux CLIENT propriétaires ou ADMIN.