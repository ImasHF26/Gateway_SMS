# SMS Service Web Application

Une application complète de gestion de contacts et d'envoi de SMS via la passerelle SMSGate.

## Architecture

```
sms_service_web/
├── backend/           # Serveur Node.js avec Express
│   ├── server.js      # Point d'entrée principal
│   ├── database.js    # Gestion de la base SQLite
│   ├── smsService.js  # Service d'envoi SMS
│   ├── package.json   # Dépendances backend
│   └── .env          # Configuration environnement
└── frontend/          # Application Vue.js 3
    ├── src/
    │   ├── views/     # Pages principales
    │   ├── store/     # Gestion d'état Vuex
    │   ├── services/  # Services API
    │   └── router/    # Configuration des routes
    └── package.json   # Dépendances frontend
```

## Fonctionnalités

### Backend (Node.js + Express)
- **API REST** pour la gestion des contacts
- **Base de données SQLite** pour stocker les contacts et l'historique
- **Intégration SMSGate** pour l'envoi de SMS
- **Historique complet** des SMS envoyés
- **Gestion des erreurs** et validation des données

### Frontend (Vue.js 3)
- **Interface moderne** avec Bootstrap 5
- **Gestion des contacts** (CRUD complet)
- **Envoi de SMS** individuel ou en masse
- **Historique détaillé** avec filtres et pagination
- **Design responsive** et convivial

## Installation et Configuration

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn
- Application SMSGate configurée sur votre smartphone

### 1. Configuration du Backend

```bash
cd backend
npm install
```

Modifiez le fichier `.env` avec vos paramètres SMSGate :
```env
PORT=3000
DB_PATH=./database.sqlite

# Configuration SMSGate
SMSGATE_URL=http://192.168.1.2:8080
SMSGATE_USERNAME=sms
SMSGATE_PASSWORD=h5IOlzo7
SMSGATE_AUTH_HEADER=Basic c21zOmg1SU9sem83
```

### 2. Configuration du Frontend

```bash
cd frontend
npm install
```

## Démarrage de l'application

### Mode développement

1. **Démarrer le backend** :
```bash
cd backend
npm run dev
```
Le serveur sera accessible à `http://localhost:3000`

2. **Démarrer le frontend** :
```bash
cd frontend
npm run serve
```
L'interface sera accessible à `http://localhost:8080`

### Mode production

1. **Build du frontend** :
```bash
cd frontend
npm run build
```

2. **Démarrer le backend** :
```bash
cd backend
npm start
```

## Configuration de SMSGate

1. **Installer SMSGate** sur votre smartphone Android
2. **Configurer l'authentification** (nom d'utilisateur/mot de passe)
3. **Activer le serveur** dans l'application
4. **Noter l'adresse IP** affichée dans l'application
5. **Mettre à jour** le fichier `.env` avec vos paramètres

### Exemple de configuration SMSGate
- URL : `http://192.168.1.2:8080`
- Utilisateur : `sms`
- Mot de passe : `h5IOlzo7`
- Header d'autorisation : `Basic c21zOmg1SU9sem83`

## API Endpoints

### Contacts
- `GET /api/contacts` - Liste tous les contacts
- `GET /api/contacts/:id` - Récupère un contact
- `POST /api/contacts` - Ajoute un nouveau contact
- `PUT /api/contacts/:id` - Met à jour un contact
- `DELETE /api/contacts/:id` - Supprime un contact

### SMS
- `POST /api/sms/send` - Envoie un SMS à plusieurs destinataires
- `POST /api/sms/send-to-contact/:id` - Envoie un SMS à un contact
- `GET /api/sms/history` - Récupère l'historique des SMS

### Test
- `GET /api/test` - Test de connexion au backend

## Base de Données

L'application utilise SQLite avec deux tables principales :

### Table `contacts`
- `id` : Identifiant unique
- `name` : Nom du contact
- `phone` : Numéro de téléphone
- `email` : Adresse email (optionnel)
- `created_at` : Date de création
- `updated_at` : Date de modification

### Table `sms_history`
- `id` : Identifiant unique
- `contact_id` : Référence vers le contact (optionnel)
- `phone_number` : Numéro du destinataire
- `message` : Contenu du message
- `status` : Statut (sent, failed, pending)
- `sent_at` : Date d'envoi

## Utilisation

### 1. Ajouter des contacts
- Accédez à la page "Contacts"
- Cliquez sur "Ajouter un contact"
- Remplissez les informations (nom et téléphone obligatoires)
- Sauvegardez

### 2. Envoyer des SMS
- Accédez à la page "Envoyer SMS"
- Choisissez le mode d'envoi :
  - **Contacts** : Sélectionnez dans votre liste
  - **Numéros** : Saisissez directement les numéros
- Rédigez votre message
- Cliquez sur "Envoyer le SMS"

### 3. Consulter l'historique
- Accédez à la page "Historique"
- Utilisez les filtres pour rechercher
- Exportez en CSV si nécessaire
- Consultez les détails de chaque SMS

## Dépannage

### Problèmes de connexion SMSGate
1. Vérifiez que votre smartphone et votre ordinateur sont sur le même réseau
2. Contrôlez l'adresse IP dans l'application SMSGate
3. Assurez-vous que le serveur SMSGate est démarré
4. Testez la connexion avec curl :
```bash
curl -X GET http://192.168.1.2:8080/
```

### Erreurs de base de données
- La base SQLite est créée automatiquement au premier démarrage
- Les tables sont créées automatiquement
- Vérifiez les permissions d'écriture dans le dossier backend

### Problèmes de CORS
- Le backend est configuré pour accepter toutes les origines en développement
- En production, configurez les origines autorisées

## Développement

### Structure du code
- **Backend** : Architecture MVC simple avec séparation des responsabilités
- **Frontend** : Composants Vue.js avec Vuex pour la gestion d'état
- **API** : RESTful avec gestion d'erreurs cohérente

### Extensions possibles
- Authentification utilisateur
- Groupes de contacts
- Modèles de messages
- Programmation d'envoi
- Notifications push
- Interface d'administration

## Licence

Ce projet est fourni à des fins éducatives et de démonstration.

## Support

Pour toute question ou problème, consultez :
1. La documentation de SMSGate
2. Les logs du serveur backend
3. La console développeur du navigateur
