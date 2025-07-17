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
                <div v-else class="border rounded p-3" style="max-height: 300px; overflow-y: auto;">
                  <div class="form-check mb-2">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="selectAll"
                      @change="toggleSelectAll"
                      :checked="selectedContacts.length === allContacts.length && allContacts.length > 0"
                    >
                    <label class="form-check-label fw-bold" for="selectAll">
                      Sélectionner tout ({{ allContacts.length }} contacts)
                    </label>
                  </div>
                  <hr>
                  <div v-for="contact in allContacts" :key="contact.id" class="form-check">
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
                </div>
                <div class="form-text">
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
                <label for="message" class="form-label">Message *</label>
                <textarea 
                  class="form-control" 
                  id="message"
                  rows="4"
                  v-model="message"
                  placeholder="Tapez votre message ici..."
                  required
                ></textarea>
                <div class="form-text">
                  {{ message.length }} caractères
                  <span v-if="message.length > 160" class="text-warning">
                    (Plus de 160 caractères, peut être facturé comme plusieurs SMS)
                  </span>
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

        <!-- Modèles de messages -->
        <div class="card mt-3">
          <div class="card-header">
            <h6 class="mb-0">
              <i class="fas fa-clipboard me-2"></i>
              Modèles rapides
            </h6>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button 
                class="btn btn-outline-secondary btn-sm text-start"
                @click="message = 'Bonjour ! Ceci est un message de test.'"
              >
                Message de test
              </button>
              <button 
                class="btn btn-outline-secondary btn-sm text-start"
                @click="message = 'Rappel: Votre rendez-vous est prévu demain à 14h.'"
              >
                Rappel de rendez-vous
              </button>
              <button 
                class="btn btn-outline-secondary btn-sm text-start"
                @click="message = 'Bonne année ! Tous nos vœux de bonheur et de réussite.'"
              >
                Vœux
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SendSmsPage',
  data() {
    return {
      sendMode: 'contacts',
      selectedContacts: [],
      phoneNumbersText: '',
      message: '',
      successMessage: ''
    }
  },
  computed: {
    ...mapGetters('contacts', ['allContacts']),
    ...mapGetters('sms', { isSending: 'isSending', error: 'getError' }),
    
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
        message: this.message.trim()
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
    }
  },
  
  mounted() {
    this.loadContacts()
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
</style>
