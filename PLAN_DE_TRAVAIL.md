# Plan de Travail & Feuille de Route : Amélioration de l'Application SMS Gateway (Backend & Frontend + Dataviz)

Ce document présente l'état des lieux, le diagnostic complet des dysfonctionnements, ainsi que la feuille de route détaillée pour transformer l'application de passerelle SMS en une solution robuste, résiliente et dotée d'un suivi d'état réel et d'une interface moderne enrichie en Dataviz.

---

## 1. Diagnostic de l'État Actuel

### A. Architecture et Flux de Données
- **Backend** : Node.js / Express avec persistance SQLite (`database.sqlite`).
- **Frontend** : Vue.js (v3 avec Vuex, Bootstrap, FontAwesome).
- **Passerelle (Gateway)** : Application mobile Android locale (`SMS-Gateway` sur `http://192.168.137.11:8080/`).

### B. Problèmes Identifiés
1. **Faux statuts de succès** : Le backend enregistre `sent` dès que l'application Android accepte la requête (HTTP 202/200), sans connaître l'état réel de délivrabilité (numéro invalide, hors de fonction, réseau indisponible).
2. **Manque de visibilité visuelle (Dataviz)** : Pas de graphiques interactifs pour analyser les taux de succès, d'échec ou les volumes d'envoi.
3. **Absence de surveillance temps réel de la passerelle** : Pas d'indicateur dynamique de la connexion du smartphone Android dans l'interface.

---

## 2. Feuille de Route & Étapes de Réalisation

### Phase 1 : Amélioration du Backend & Suivi des Statuts ✅ TERMINÉE
- [x] **Diagnostic et test de connexion en direct** (`http://192.168.137.11:8080/`).
- [x] **Mise à jour du contrôleur et du service SMS** pour récupérer l'identifiant du message (`gateway_message_id`) et permettre la synchronisation de son statut (`Pending` -> `Delivered` / `Failed`).
- [x] **Ajout de endpoints de synchronisation** des statuts de messages (`GET /sms/status/:messageId`).
- [x] **Migration BDD** : Ajout des colonnes `gateway_message_id`, `delivery_status`, `status_checked_at` à `sms_history`.
- [x] **Méthodes BDD** : `updateSmsDeliveryStatus()`, `getSmsById()` pour le suivi précis.

### Phase 2 : Modernisation du Frontend & Dataviz ✅ TERMINÉE
- [x] **Widget de statut de la passerelle** dans la barre de navigation (indicateur visuel de connexion).
- [x] **Intégration de composants de Dataviz** : KPI cards (Total, Réussis, Échoués, En attente), barres de progression colorées avec taux de délivrabilité.
- [x] **Système de filtres avancés** : Par statut, recherche textuelle, et filtre temporel.
- [x] **Bouton de vérification individuelle** 🔄 par SMS pour interroger la passerelle Android et obtenir le statut réel.
- [x] **Bouton « Vérifier statuts passerelle »** pour rafraîchir en masse les statuts de la page courante.
- [x] **Modal de détails amélioré** : Affichage double statut (App + Passerelle), date de dernière vérification, bouton de vérification intégré.
- [x] **Export CSV** de l'historique filtré.
- [x] **Correction des warnings de compilation** (`<tbody>` manquant dans les `<table>`).
- [x] **Pagination intelligente** avec navigation rapide.

### Phase 3 : Modèles Personnalisés & Variables Dynamiques ✅ TERMINÉE
- [x] **Table SQLite `templates`** : Stockage persistant des modèles avec `id`, `title`, `content`, `category`, `is_system`, `created_at`, `updated_at`.
- [x] **API REST Modèles** (`/api/templates`) : CRUD complet (GET tous, GET par ID, POST création, PUT modification, DELETE suppression).
- [x] **Interface Modèles Riches (`SendSMS.vue`)** :
  - Filtrage par catégories (Tous, Rappel, Marketing, Notification, Salutations, Personnalisé).
  - Boutons d'insertion rapide ("Utiliser" pour remplacer, "+" pour ajouter).
  - Bouton de suppression 🗑️ pour les modèles personnalisés utilisateur.
  - Bouton "+ Nouveau modèle" ouvrant une modale complète de création.
  - Bouton "Enregistrer comme modèle" en 1 clic pour sauvegarder le texte actuellement rédigé.
  - Boutons d'insertion de variables dynamiques (`{nom}`, `{prenom}`, `{date}`, `{heure}`) directement au curseur du texte.
- [x] **Interpolation automatique des variables** :
  - Remplacement de `{nom}` et `{prenom}` par les données réelles de chaque contact.
  - Remplacement de `{date}` et `{heure}` par l'horodatage courant formaté en français.
  - Détection automatique et dissociation par destinataire lors des envois en masse personnalisés.

### Phase 4 : Améliorations Futures & Optimisations
- [ ] **Polling automatique en arrière-plan** : Rafraîchissement automatique à intervalle régulier des statuts en attente (`Pending`).
- [ ] **Graphiques temporels** : Courbe d'envois par jour/semaine avec Chart.js.
- [ ] **Notifications toast** : Alertes visuelles flottantes lors d'échecs de distribution.
- [ ] **Validation des numéros** : Normalisation et validation E.164 avant l'envoi.
- [ ] **Compteur de caractères SMS** : Affichage précis du nombre de SMS (160 caractères standards / 70 caractères Unicode).

---

## 3. Tests de Validation
- [x] Test de connexion de la passerelle depuis le backend (HTTP 200, authentification OK).
- [x] Test d'envoi de SMS avec suivi d'état vers le numéro de test (`+212669908042`) — statut `Delivered` confirmé.
- [x] Validation de l'affichage des Dataviz (KPI, barres de progression) dans l'historique.
- [x] Frontend compile sans erreur ni warning (`DONE Compiled successfully`).
- [x] Test end-to-end complet du cycle d'envoi et de synchronisation des statuts (Pending -> Delivered).
- [x] Test CRUD complet de l'API des modèles personnalisés (Création, Lecture, Mise à jour, Suppression).
- [x] Validation de l'interpolation des tags `{date}` et `{heure}` en direct.

---

## 4. Résumé des Fichiers Modifiés

| Fichier | Modifications |
|---------|--------------|
| `backend/src/config/database.js` | Table `templates` + seed non-dupliqué, migrations auto, `updateSmsDeliveryStatus()`, `getSmsById()` |
| `backend/src/api/controllers/smsController.js` | Extraction `gateway_message_id`, extraction du statut initial (`Pending`), interpolation de variables `{nom}`, `{prenom}`, `{date}`, `{heure}`, synchronisation `checkSmsStatus` |
| `backend/src/api/controllers/templateController.js` | Contrôleur CRUD complet pour les modèles de messages |
| `backend/src/api/routes/templateRoutes.js` | Routes REST pour les modèles (`/api/templates`) |
| `backend/server.js` | Enregistrement de la route `/api/templates` |
| `backend/src/api/services/smsService.js` | `getMessageStatus(messageId)` pour interroger `/message/{id}` de la passerelle |
| `backend/src/api/routes/smsRoutes.js` | Route `GET /status/:messageId` |
| `frontend/src/views/History.vue` | Dataviz complète, filtres, polling statuts, modal enrichi, export CSV, fix Vue 3 réactivité |
| `frontend/src/views/SendSMS.vue` | Gestionnaire complet de modèles personnalisés, catégories, modal de création, tags dynamiques |
| `frontend/src/services/api.js` | Méthodes `checkSmsStatus` et CRUD `templates` |
| `frontend/src/App.vue` | Indicateur de connexion passerelle |
