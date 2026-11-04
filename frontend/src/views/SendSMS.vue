<template>
  <div class="send-sms">
    <div class="row">
      <div class="col-12">
        <h2 class="mb-4">
          <i class="fas fa-paper-plane me-2"></i>
          Envoyer des SMS
        </h2>
      </div>
    </div>

    <!-- Messages d'erreur/succès -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = ''"></button>
    </div>

    <div class="row">
      <!-- Formulaire d'envoi -->
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-edit me-2"></i>
              Composer un message
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSendSms">
              <!-- Sélection du service d'envoi -->
              <div class="mb-4">
                <label class="form-label">Service d'envoi</label>
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        name="smsService" 
                        id="smsGateway"
                        value="smsgateway"
                        v-model="selectedSmsService"
                      >
                      <label class="form-check-label" for="smsGateway">
                        <i class="fas fa-mobile-alt me-2"></i>
                        SMS-Gateway (Smartphone)
                      </label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        name="smsService" 
                        id="vonageService"
                        value="vonage"
                        v-model="selectedSmsService"
                      >
                      <label class="form-check-label" for="vonageService">
                        <i class="fas fa-cloud me-2"></i>
                        Service Vonage
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sélection du mode d'envoi -->
              <div class="mb-4">
                <label class="form-label">Mode d'envoi</label>
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        name="sendMode" 
                        id="sendToContacts"
                        value="contacts"
                        v-model="sendMode"
                      >
                      <label class="form-check-label" for="sendToContacts">
                        <i class="fas fa-address-book me-2"></i>
                        Envoyer à des contacts
                      </label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        name="sendMode" 
                        id="sendToNumbers"
                        value="numbers"
                        v-model="sendMode"
                      >
                      <label class="form-check-label" for="sendToNumbers">
                        <i class="fas fa-phone me-2"></i>
                        Envoyer à des numéros
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sélection des contacts -->
                <div v-if="sendMode === 'contacts'" class="mb-4">
                <label class="form-label">Sélectionner les contacts</label>
                <div v-if="allContacts.length === 0" class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  Aucun contact disponible. 
                  <router-link to="/contacts">Ajoutez des contacts</router-link> d'abord.
                </div>
                <div v-else>
                  <!-- Champ de recherche -->
                  <div class="mb-2">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Rechercher un contact par nom ou numéro..."
                    v-model="contactSearchQuery"
                  >
                  </div>

                  <div class="border rounded p-3" style="max-height: 250px; overflow-y: auto;">
                  <div class="form-check mb-2">
                    <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="selectAll"
                    @change="toggleSelectAll"
                    :checked="selectedContacts.length === allContacts.length && allContacts.length > 0"
                    :disabled="contactSearchQuery.length > 0"
                    >
                    <label class="form-check-label fw-bold" for="selectAll">
                    Sélectionner tout ({{ allContacts.length }} contacts)
                    </label>
                  </div>
                  <hr>
                  <div v-for="contact in filteredContacts" :key="contact.id" class="form-check">
                    <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :id="`contact-${contact.id}`"
                    :value="contact.id"
                    v-model="selectedContacts"
                    >
                    <label class="form-check-label" :for="`contact-${contact.id}`">
                    <i class="fas fa-user me-2 text-primary"></i>
                    {{ contact.name }} - {{ contact.phone }}
                    </label>
                  </div>
                  <div v-if="filteredContacts.length === 0" class="text-center text-muted">
                    Aucun contact ne correspond à votre recherche.
                  </div>
                  </div>
                </div>
                <div class="form-text mt-2">
                  {{ selectedContacts.length }} contact(s) sélectionné(s)
                </div>
                </div>

              <!-- Saisie des numéros -->
              <div v-if="sendMode === 'numbers'" class="mb-4">
                <label for="phoneNumbers" class="form-label">Numéros de téléphone</label>
                <textarea 
                  class="form-control" 
                  id="phoneNumbers"
                  rows="4"
                  v-model="phoneNumbersText"
                  placeholder="Entrez les numéros de téléphone, un par ligne ou séparés par des virgules
Exemple:
+212636103949
+212661234567
+33123456789"
                ></textarea>
                <div class="form-text">
                  Entrez un numéro par ligne ou séparez-les par des virgules. Format international recommandé.
                </div>
                <div v-if="parsedPhoneNumbers.length > 0" class="mt-2">
                  <small class="text-success">
                    {{ parsedPhoneNumbers.length }} numéro(s) détecté(s)
                  </small>
                </div>
              </div>

              <!-- Message -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label for="message" class="form-label mb-0 fw-bold">Message *</label>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    @click="openSaveAsTemplateModal"
                    :disabled="!message.trim()"
                    title="Enregistrer ce texte comme modèle réutilisable"
                  >
                    <i class="fas fa-bookmark me-1"></i>
                    Enregistrer comme modèle
                  </button>
                </div>

                <!-- Variables dynamiques rapides -->
                <div class="mb-2 d-flex flex-wrap align-items-center gap-1">
                  <small class="text-muted me-1">Variables :</small>
                  <button
                    type="button"
                    class="btn btn-sm btn-light border py-0 px-2"
                    @click="insertTag('{nom}')"
                    title="Insère le nom complet du contact"
                  >
                    <code>{nom}</code>
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-light border py-0 px-2"
                    @click="insertTag('{prenom}')"
                    title="Insère le prénom du contact"
                  >
                    <code>{prenom}</code>
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-light border py-0 px-2"
                    @click="insertTag('{date}')"
                    title="Insère la date du jour"
                  >
                    <code>{date}</code>
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-light border py-0 px-2"
                    @click="insertTag('{heure}')"
                    title="Insère l'heure courante"
                  >
                    <code>{heure}</code>
                  </button>
                </div>

                <textarea
                  class="form-control"
                  id="message"
                  ref="messageTextarea"
                  rows="4"
                  v-model="message"
                  placeholder="Tapez votre message ici ou choisissez un modèle rapide..."
                  required
                ></textarea>
                <div class="d-flex justify-content-between align-items-center form-text mt-1">
                  <div>
                    {{ message.length }} caractères
                    <span v-if="message.length > 160" class="text-warning">
                      ({{ Math.ceil(message.length / 160) }} SMS)
                    </span>
                    <span v-else class="text-muted">(1 SMS)</span>
                  </div>
                  <button
                    v-if="message.length > 0"
                    type="button"
                    class="btn btn-link btn-sm text-danger text-decoration-none p-0"
                    @click="message = ''"
                  >
                    <i class="fas fa-times me-1"></i>Effacer
                  </button>
                </div>
              </div>

              <!-- Bouton d'envoi -->
              <div class="d-grid">
                <button 
                  type="submit" 
                  class="btn btn-success btn-lg"
                  :disabled="!canSend || isSending"
                >
                  <span v-if="isSending" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-paper-plane me-2"></i>
                  {{ isSending ? 'Envoi en cours...' : 'Envoyer le SMS' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Aperçu et informations -->
      <div class="col-lg-4">
        <div class="card">
          <div class="card-header">
            <h6 class="mb-0">
              <i class="fas fa-eye me-2"></i>
              Aperçu de l'envoi
            </h6>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label fw-bold">Destinataires:</label>
              <div v-if="sendMode === 'contacts'">
                <span class="badge bg-primary">{{ selectedContacts.length }} contact(s)</span>
                <div v-if="selectedContacts.length > 0" class="mt-2">
                  <small class="text-muted">
                    <div v-for="contactId in selectedContacts.slice(0, 3)" :key="contactId">
                      {{ getContactName(contactId) }}
                    </div>
                    <div v-if="selectedContacts.length > 3">
                      et {{ selectedContacts.length - 3 }} autre(s)...
                    </div>
                  </small>
                </div>
              </div>
              <div v-else>
                <span class="badge bg-info">{{ parsedPhoneNumbers.length }} numéro(s)</span>
                <div v-if="parsedPhoneNumbers.length > 0" class="mt-2">
                  <small class="text-muted">
                    <div v-for="number in parsedPhoneNumbers.slice(0, 3)" :key="number">
                      {{ number }}
                    </div>
                    <div v-if="parsedPhoneNumbers.length > 3">
                      et {{ parsedPhoneNumbers.length - 3 }} autre(s)...
                    </div>
                  </small>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Message:</label>
              <div class="border rounded p-2 bg-light">
                <small>{{ message || 'Aucun message saisi' }}</small>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Statistiques:</label>
              <ul class="list-unstyled small">
                <li><i class="fas fa-users me-2"></i>{{ totalRecipients }} destinataire(s)</li>
                <li><i class="fas fa-font me-2"></i>{{ message.length }} caractères</li>
                <li><i class="fas fa-sms me-2"></i>{{ estimatedSmsCount }} SMS estimé(s)</li>
              </ul>
            </div>

            <div v-if="!canSend" class="alert alert-warning py-2">
              <small>
                <i class="fas fa-exclamation-triangle me-1"></i>
                Veuillez sélectionner des destinataires et saisir un message
              </small>
            </div>
          </div>
        </div>

        <!-- Modèles de messages personnalisables -->
        <div class="card mt-3">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">
              <i class="fas fa-clipboard-list me-2"></i>
              Modèles rapides
            </h6>
            <button
              class="btn btn-sm btn-outline-primary"
              @click="openNewTemplateModal"
              title="Créer un modèle personnalisé"
            >
              <i class="fas fa-plus me-1"></i>
              Nouveau
            </button>
          </div>
          <div class="card-body">
            <!-- Filtre catégories -->
            <div class="mb-2 d-flex flex-wrap gap-1">
              <button
                class="btn btn-xs py-0 px-2"
                :class="selectedCategory === '' ? 'btn-primary' : 'btn-outline-secondary'"
                @click="selectedCategory = ''"
              >
                Tous
              </button>
              <button
                v-for="cat in templateCategories"
                :key="cat"
                class="btn btn-xs py-0 px-2"
                :class="selectedCategory === cat ? 'btn-primary' : 'btn-outline-secondary'"
                @click="selectedCategory = cat"
              >
                {{ cat }}
              </button>
            </div>

            <!-- Liste des modèles -->
            <div v-if="loadingTemplates" class="text-center py-2">
              <span class="spinner-border spinner-border-sm text-primary"></span>
            </div>
            <div v-else-if="filteredTemplates.length === 0" class="text-center text-muted py-2 small">
              Aucun modèle dans cette catégorie.
            </div>
            <div v-else class="d-grid gap-2" style="max-height: 320px; overflow-y: auto;">
              <div
                v-for="tpl in filteredTemplates"
                :key="tpl.id"
                class="border rounded p-2 position-relative template-card"
                :class="{ 'border-primary': activeTemplateId === tpl.id }"
              >
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <span class="fw-bold small text-truncate" :title="tpl.title">
                    {{ tpl.title }}
                  </span>
                  <div>
                    <span class="badge bg-light text-dark border me-1" style="font-size: 0.7rem;">
                      {{ tpl.category || 'Général' }}
                    </span>
                    <button
                      v-if="!tpl.is_system"
                      class="btn btn-link text-danger p-0 ms-1 btn-delete-tpl"
                      @click.stop="confirmDeleteTemplate(tpl)"
                      title="Supprimer ce modèle"
                    >
                      <i class="fas fa-trash-alt fa-xs"></i>
                    </button>
                  </div>
                </div>
                <p class="text-muted small mb-2 text-truncate-2">
                  {{ tpl.content }}
                </p>
                <div class="d-flex gap-1">
                  <button
                    class="btn btn-outline-primary btn-sm py-0 px-2 flex-grow-1"
                    @click="applyTemplate(tpl)"
                    title="Remplacer le message"
                  >
                    <i class="fas fa-arrow-left me-1"></i> Utiliser
                  </button>
                  <button
                    class="btn btn-outline-secondary btn-sm py-0 px-2"
                    @click="appendTemplate(tpl)"
                    title="Ajouter à la suite du message actuel"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal : Créer / Modifier un modèle personnalisé -->
    <div
      class="modal fade"
      :class="{ show: showTemplateModal }"
      :style="{ display: showTemplateModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-magic me-2 text-primary"></i>
              {{ templateForm.id ? 'Modifier le modèle' : 'Nouveau modèle personnalisé' }}
            </h5>
            <button type="button" class="btn-close" @click="closeTemplateModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-bold">Titre du modèle *</label>
              <input
                type="text"
                class="form-control"
                v-model="templateForm.title"
                placeholder="Ex: Confirmation de commande, Relance client..."
                required
              >
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Catégorie</label>
              <div class="input-group">
                <select class="form-select" v-model="templateForm.category">
                  <option value="Général">Général</option>
                  <option value="Rappel">Rappel</option>
                  <option value="Marketing">Marketing / Offre</option>
                  <option value="Notification">Notification</option>
                  <option value="Salutations">Salutations</option>
                  <option value="Personnalisé">Personnalisé</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label fw-bold mb-0">Contenu du modèle *</label>
                <div class="d-flex gap-1">
                  <button
                    type="button"
                    class="btn btn-xs btn-light border py-0 px-1"
                    @click="insertTagInForm('{nom}')"
                  >
                    <code>{nom}</code>
                  </button>
                  <button
                    type="button"
                    class="btn btn-xs btn-light border py-0 px-1"
                    @click="insertTagInForm('{prenom}')"
                  >
                    <code>{prenom}</code>
                  </button>
                  <button
                    type="button"
                    class="btn btn-xs btn-light border py-0 px-1"
                    @click="insertTagInForm('{date}')"
                  >
                    <code>{date}</code>
                  </button>
                </div>
              </div>
              <textarea
                class="form-control"
                rows="4"
                v-model="templateForm.content"
                placeholder="Rédigez le texte de votre modèle personnalisé..."
                required
              ></textarea>
              <div class="form-text">
                {{ templateForm.content.length }} caractères
                <span class="text-muted ms-2">
                  (Les balises <code>{nom}</code> seront remplacées lors de l'envoi)
                </span>
              </div>
            </div>

            <div v-if="templateError" class="alert alert-danger py-2">
              <small>{{ templateError }}</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeTemplateModal">
              Annuler
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!templateForm.title.trim() || !templateForm.content.trim() || savingTemplate"
              @click="saveTemplate"
            >
              <span v-if="savingTemplate" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fas fa-save me-1"></i>
              Enregistrer le modèle
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Backdrop modal -->
    <div v-if="showTemplateModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import api from '@/services/api'

export default {
  name: 'SendSmsPage',
  data() {
    return {
      selectedSmsService: 'smsgateway', // 'smsgateway' or 'vonage'
      sendMode: 'contacts',
      selectedContacts: [],
      phoneNumbersText: '',
      message: '',
      successMessage: '',
      contactSearchQuery: '',
      // Modèles de messages
      templates: [],
      loadingTemplates: false,
      selectedCategory: '',
      activeTemplateId: null,
      showTemplateModal: false,
      savingTemplate: false,
      templateError: '',
      templateForm: {
        id: null,
        title: '',
        category: 'Général',
        content: ''
      }
    }
  },
  computed: {
    ...mapGetters('contacts', ['allContacts']),
    ...mapGetters('sms', { isSending: 'isSending', error: 'getError' }),

    templateCategories() {
      const cats = new Set(this.templates.map(t => t.category || 'Général'))
      return Array.from(cats)
    },

    filteredTemplates() {
      if (!this.selectedCategory) {
        return this.templates
      }
      return this.templates.filter(t => (t.category || 'Général') === this.selectedCategory)
    },

    filteredContacts() {
      if (!this.allContacts) {
        return [];
      }
      if (!this.contactSearchQuery) {
        return this.allContacts;
      }
      const query = this.contactSearchQuery.toLowerCase();
      return this.allContacts.filter(contact => {
        const name = contact.name ? contact.name.toLowerCase() : '';
        const phone = contact.phone ? contact.phone.toString().toLowerCase() : '';
        return name.includes(query) || phone.includes(query);
      });
    },

    parsedPhoneNumbers() {
      if (!this.phoneNumbersText.trim()) return []
      
      // Séparer par lignes et virgules, nettoyer les espaces
      const numbers = this.phoneNumbersText
        .split(/[\n,]/)
        .map(num => num.trim())
        .filter(num => num.length > 0)
        .filter(num => /^[+]?[\d\s-()]+$/.test(num)) // Validation basique
      
      return [...new Set(numbers)] // Supprimer les doublons
    },
    
    totalRecipients() {
      return this.sendMode === 'contacts' 
        ? this.selectedContacts.length 
        : this.parsedPhoneNumbers.length
    },
    
    estimatedSmsCount() {
      if (!this.message) return 0
      return Math.ceil(this.message.length / 160) * this.totalRecipients
    },
    
    canSend() {
      const hasRecipients = this.sendMode === 'contacts' 
        ? this.selectedContacts.length > 0
        : this.parsedPhoneNumbers.length > 0
      
      return hasRecipients && this.message.trim().length > 0
    }
  },
  
  methods: {
    ...mapActions('contacts', ['loadContacts']),
    ...mapActions('sms', ['sendSms']),
    
    toggleSelectAll() {
      if (this.selectedContacts.length === this.allContacts.length) {
        this.selectedContacts = []
      } else {
        this.selectedContacts = this.allContacts.map(c => c.id)
      }
    },
    
    getContactName(contactId) {
      const contact = this.allContacts.find(c => c.id === contactId)
      return contact ? contact.name : 'Contact inconnu'
    },
    
    async handleSendSms() {
      if (!this.canSend) return
      
      const payload = {
        message: this.message.trim(),
        service: this.selectedSmsService
      }
      
      if (this.sendMode === 'contacts') {
        payload.contactIds = this.selectedContacts
      } else {
        payload.phoneNumbers = this.parsedPhoneNumbers
      }
      
      const result = await this.sendSms(payload)
      
      if (result.success) {
        this.successMessage = `SMS envoyé avec succès à ${this.totalRecipients} destinataire(s)`
        
        // Réinitialiser le formulaire
        this.selectedContacts = []
        this.phoneNumbersText = ''
        this.message = ''
        
        // Rediriger vers l'historique après 2 secondes
        setTimeout(() => {
          this.$router.push('/history')
        }, 2000)
      }
    },
    
    clearError() {
      this.$store.commit('sms/SET_ERROR', null)
    },

    // Méthodes pour les modèles rapides
    async loadTemplates() {
      this.loadingTemplates = true
      try {
        const response = await api.getTemplates()
        if (response.success && response.data) {
          this.templates = response.data
        }
      } catch (err) {
        console.warn('Impossible de charger les modèles depuis l\'API, utilisation des modèles par défaut:', err)
        // Fallback par défaut si l'API n'est pas encore joignable
        if (this.templates.length === 0) {
          this.templates = [
            { id: 1, title: 'Message de test', content: 'Bonjour ! Ceci est un message de test envoyé depuis notre passerelle SMS.', category: 'Test', is_system: 1 },
            { id: 2, title: 'Rappel de rendez-vous', content: 'Bonjour {nom}, nous vous rappelons votre rendez-vous prévu demain à 14h00.', category: 'Rappel', is_system: 1 },
            { id: 3, title: 'Offre promotionnelle', content: 'Bonjour {nom} ! Profitez de notre offre exclusive valable jusqu\'à la fin de la semaine.', category: 'Marketing', is_system: 1 },
            { id: 4, title: 'Vœux & Salutations', content: 'Bonne année {nom} ! Toute notre équipe vous présente ses meilleurs vœux.', category: 'Salutations', is_system: 1 }
          ]
        }
      } finally {
        this.loadingTemplates = false
      }
    },

    openNewTemplateModal() {
      this.templateForm = {
        id: null,
        title: '',
        category: 'Personnalisé',
        content: ''
      }
      this.templateError = ''
      this.showTemplateModal = true
    },

    openSaveAsTemplateModal() {
      this.templateForm = {
        id: null,
        title: this.message.length > 25 ? this.message.substring(0, 25) + '...' : 'Nouveau modèle',
        category: 'Personnalisé',
        content: this.message.trim()
      }
      this.templateError = ''
      this.showTemplateModal = true
    },

    closeTemplateModal() {
      this.showTemplateModal = false
      this.templateError = ''
    },

    async saveTemplate() {
      if (!this.templateForm.title.trim() || !this.templateForm.content.trim()) {
        this.templateError = 'Le titre et le contenu sont obligatoires.'
        return
      }

      this.savingTemplate = true
      this.templateError = ''
      try {
        const res = await api.createTemplate({
          title: this.templateForm.title.trim(),
          category: this.templateForm.category || 'Personnalisé',
          content: this.templateForm.content.trim()
        })

        if (res.success && res.data) {
          this.templates.unshift(res.data)
          this.activeTemplateId = res.data.id
          this.closeTemplateModal()
          this.successMessage = `Modèle "${res.data.title}" enregistré avec succès !`
          setTimeout(() => {
            if (this.successMessage.includes('Modèle')) {
              this.successMessage = ''
            }
          }, 3000)
        }
      } catch (err) {
        this.templateError = err.response?.data?.error || err.message || 'Erreur lors de l\'enregistrement'
      } finally {
        this.savingTemplate = false
      }
    },

    async confirmDeleteTemplate(tpl) {
      if (!confirm(`Supprimer définitivement le modèle "${tpl.title}" ?`)) return
      try {
        await api.deleteTemplate(tpl.id)
        this.templates = this.templates.filter(t => t.id !== tpl.id)
        if (this.activeTemplateId === tpl.id) {
          this.activeTemplateId = null
        }
      } catch (err) {
        alert('Erreur lors de la suppression: ' + (err.message || 'inconnue'))
      }
    },

    applyTemplate(tpl) {
      this.activeTemplateId = tpl.id
      this.message = tpl.content
      // Focus sur le textarea
      if (this.$refs.messageTextarea) {
        this.$refs.messageTextarea.focus()
      }
    },

    appendTemplate(tpl) {
      if (this.message.trim()) {
        this.message = this.message.trim() + '\n' + tpl.content
      } else {
        this.message = tpl.content
      }
      if (this.$refs.messageTextarea) {
        this.$refs.messageTextarea.focus()
      }
    },

    insertTag(tag) {
      const textarea = this.$refs.messageTextarea
      if (!textarea) {
        this.message += tag
        return
      }
      const start = textarea.selectionStart || this.message.length
      const end = textarea.selectionEnd || this.message.length
      this.message = this.message.substring(0, start) + tag + this.message.substring(end)
      this.$nextTick(() => {
        textarea.focus()
        textarea.setSelectionRange(start + tag.length, start + tag.length)
      })
    },

    insertTagInForm(tag) {
      this.templateForm.content += tag
    }
  },

  mounted() {
    this.loadContacts()
    this.loadTemplates()
  }
}
</script>

<style scoped>
.form-check-label {
  cursor: pointer;
}

.border {
  border-color: #dee2e6 !important;
}

.alert {
  border-radius: 0.5rem;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.list-unstyled li {
  margin-bottom: 0.25rem;
}

.btn-outline-secondary:hover {
  color: #000;
}

.btn-xs {
  font-size: 0.75rem;
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
}

.template-card {
  transition: all 0.2s ease;
  background-color: #fafafa;
}

.template-card:hover {
  background-color: #f0f7ff;
  border-color: #b8daff !important;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
