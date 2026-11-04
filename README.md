# 📱 Passerelle SMS & Plateforme de Campagnes (SMS Gateway Service)

Une application complète et moderne pour la gestion de contacts, la création de modèles personnalisés et l'envoi de SMS en masse ou individuels via une **passerelle Android locale (SMS-Gateway)** et **Vonage (Nexmo)**, avec suivi d'état réel de délivrabilité (**Delivered / Failed**) et tableau de bord **Dataviz**.

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vuedotjs)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite3-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.x-7952B3?logo=bootstrap)](https://getbootstrap.com/)

---

## 🚀 Fonctionnalités Clés

### 1. 📤 Envoi de SMS & Suivi d'État Réel (Anti-Faux Positifs)
- **Support multi-canaux** : Passerelle Android locale (`SMS-Gateway`) et Vonage API.
- **Suivi d'état réel à deux temps** :
  - Phase 1 : Prise en charge initiale par le smartphone (`Pending`).
  - Phase 2 : Réception des accusés de distribution de l'opérateur (`Processed` ➔ `Sent` ➔ **`Delivered`** ou **`Failed`**).
- **Synchronisation manuelle ou globale** : Bouton individuel de vérification par SMS ou bouton de rafraîchissement global en masse.
- **Envoi par lot ou ciblé** : Sélection dans la liste de contacts ou saisie directe de numéros.

### 2. 📝 Gestionnaire de Modèles Personnalisés à la Demande
- **Création et gestion en direct** : Créer, sauvegarder, modifier et supprimer des modèles réutilisables.
- **Catégorisation intelligente** : Filtrage par onglets (*Rappel*, *Marketing*, *Notification*, *Salutations*, *Personnalisé*).
- **Bouton 1-clic** : « Enregistrer comme modèle » directement depuis la zone de rédaction.
- **Variables dynamiques avec insertion au curseur** :
  - `{nom}` : Nom complet du destinataire.
  - `{prenom}` : Premier mot extrait du nom du contact.
  - `{date}` : Date courante formatée en français (ex. `04/11/2026`).
  - `{heure}` : Heure d'envoi (ex. `11:49`).
  - `{telephone}` : Numéro du destinataire.
- **Interpolation automatique par destinataire** : Chaque contact d'une campagne reçoit son message personnalisé avec son propre nom et prénom.

### 3. 📊 Tableau de Bord Dataviz & Historique
- **Cartes KPI en temps réel** :
  - Nombre total de SMS envoyés.
  - SMS livrés avec succès (`Delivered`).
  - SMS en cours / en attente (`Pending` / `Sent`).
  - SMS échoués (`Failed`).
- **Barre de progression tricolore** : Taux de délivrabilité en pourcentage calculé en direct.
- **Filtres multicritères** : Recherche par mot-clé, filtre temporel (Aujourd'hui, 7 jours, 30 jours, Tout) et filtre par statut.
- **Export CSV** : Export instantané des données filtrées.
- **Modal de détails complet** : Affichage côte à côte du statut applicatif et du statut réel de la passerelle.

### 4. 👥 Gestion des Contacts
- Carnet d'adresses complet (Création, consultation, modification, suppression).
- Import massif depuis des fichiers **CSV**.
- Détection des doublons et validation des numéros.

### 5. 📡 Indicateur de Statut Passerelle
- Pastille interactive dans la barre de navigation indiquant en direct si la passerelle Android est joignable.

---

## 🏗️ Architecture du Projet

```
sms_cateway_service/
├── backend/
│   ├── server.js                      # Point d'entrée de l'API Express
│   ├── .env.example                   # Gabarit des variables d'environnement
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   │   ├── contactController.js   # Contrôleur contacts & CSV
│   │   │   │   ├── smsController.js       # Contrôleur envoi & synchronisation statuts
│   │   │   │   ├── templateController.js  # Contrôleur CRUD modèles
│   │   │   │   └── vonageController.js    # Contrôleur Vonage SMS
│   │   │   ├── routes/
│   │   │   │   ├── contactRoutes.js       # Routes /api/contacts
│   │   │   │   ├── smsRoutes.js           # Routes /api/sms
│   │   │   │   ├── templateRoutes.js      # Routes /api/templates
│   │   │   │   ├── vonageRoutes.js        # Routes /api/vonage-sms
│   │   │   │   └── testRoutes.js          # Routes de diagnostic
│   │   │   └── services/
│   │   │       ├── smsService.js          # Client HTTP vers passerelle Android
│   │   │       └── vonageService.js       # Client SDK Vonage
│   │   └── config/
│   │       └── database.js            # Initialisation SQLite, migrations & DAO
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   │   ├── Contacts.vue           # Annuaire & import CSV
│   │   │   ├── SendSMS.vue            # Rédaction, modèles & tags dynamiques
│   │   │   ├── History.vue            # Dataviz KPI, filtres, sync statuts
│   │   │   └── Settings.vue           # Configuration
│   │   ├── services/
│   │   │   └── api.js                 # Client Axios centralisé
│   │   ├── App.vue                    # Layout & badge passerelle
│   │   ├── router/index.js            # Définition des routes Vue Router
│   │   └── store/index.js             # État global Vuex
│   └── package.json
│
├── .gitignore                         # Exclusion des secrets, BDD et uploads
├── PLAN_DE_TRAVAIL.md                 # Suivi de projet & diagnostic
└── README.md
```

---

## 🛠️ Installation et Démarrage

### Prérequis
- **Node.js** (v16 ou supérieur recommandé)
- **npm** ou **yarn**
- Smartphone Android connecté sur le même réseau Wi-Fi avec l'application **SMS-Gateway** installée et démarrée.

---

### 1. Configuration du Backend

```bash
cd backend
npm install
```

Créez le fichier de configuration `.env` à partir du gabarit `.env.example` :

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec l'adresse IP et les identifiants affichés sur votre application SMS-Gateway :

```env
PORT=3000
DB_PATH=./src/config/database.sqlite

# Passerelle Android locale
SMSGATE_URL=http://192.168.1.XX:8080/
SMSGATE_USERNAME=sms
SMSGATE_PASSWORD=votre_mot_de_passe

# Optionnel : Vonage
VONAGE_API_KEY=votre_cle_api
VONAGE_API_SECRET=votre_secret_api
VONAGE_BRAND_NAME=SMSGateway
```

Démarrer le backend :

```bash
# Mode développement avec rechargement automatique (Nodemon)
npm run dev

# Ou mode standard
npm start
```

Le serveur sera accessible sur `http://localhost:3000/api`.

---

### 2. Configuration du Frontend

```bash
cd frontend
npm install
```

Démarrer le serveur de développement :

```bash
npm run serve
```

L'application web sera accessible sur `http://localhost:8081` (ou `http://localhost:8080`).

---

## 📡 API Endpoints

### Contacts (`/api/contacts`)
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/contacts` | Récupère tous les contacts |
| `GET` | `/api/contacts/:id` | Récupère un contact par son ID |
| `POST` | `/api/contacts` | Ajoute un nouveau contact |
| `PUT` | `/api/contacts/:id` | Met à jour un contact existant |
| `DELETE` | `/api/contacts/:id` | Supprime un contact |
| `POST` | `/api/contacts/csv` | Importe des contacts via fichier CSV |

### SMS (`/api/sms`)
| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/sms/send` | Envoie un SMS à un ou plusieurs numéros/contacts |
| `POST` | `/api/sms/send-to-contact/:id` | Envoie un SMS personnalisé à un contact spécifique |
| `GET` | `/api/sms/history` | Historique complet des messages envoyés |
| `GET` | `/api/sms/status/:messageId` | **Interroge la passerelle Android et synchronise le statut réel** |

### Modèles de Messages (`/api/templates`)
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/templates` | Liste tous les modèles (système & personnalisés) |
| `GET` | `/api/templates/:id` | Détails d'un modèle |
| `POST` | `/api/templates` | Créer un modèle personnalisé |
| `PUT` | `/api/templates/:id` | Modifier un modèle |
| `DELETE` | `/api/templates/:id` | Supprimer un modèle personnalisé |

---

## 🔒 Sécurité & Git

Le fichier `.gitignore` est préconfiguré pour protéger l'ensemble des données sensibles :
- Les fichiers d'environnement (`.env`) contenant les identifiants et clés API.
- Les bases de données SQLite (`*.sqlite`).
- Les fichiers de contacts et imports CSV (`*.csv`, `uploads/`).
- Les dépendances (`node_modules/`).

Un fichier `.env.example` documente les variables requises sans exposer de secrets.

---

## 📤 Pousser le projet vers GitHub

Pour configurer et pousser le projet vers le dépôt GitHub cible :

```bash
# Vérifier l'état local
git status

# Ajouter les fichiers modifiés
git add .

# Créer le commit
git commit -m "Mise à jour majeure : passerelle SMS, Dataviz, synchronisation d'état réel et modèles personnalisés"

# Associer le dépôt distant GitHub
git remote set-url origin https://github.com/ImasHF26/Gateway_SMS.git
# (ou si nouveau remote : git remote add origin https://github.com/ImasHF26/Gateway_SMS.git)

# Pousser vers la branche principale
git branch -M main
git push -u origin main
```

---

## 📄 Licence
Ce projet est développé à des fins professionnelles et de démonstration. Tous droits réservés.
