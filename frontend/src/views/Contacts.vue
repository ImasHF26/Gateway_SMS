<template>
  <div class="contacts">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>
        <i class="fas fa-address-book me-2"></i>
        Gestion des Contacts
      </h2>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="fas fa-plus me-2"></i>
        Ajouter un contact
      </button>
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

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <!-- Liste des contacts -->
    <div v-else class="card">
      <div class="card-header">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h5 class="mb-0">
              Liste des contacts ({{ contactsCount }})
            </h5>
          </div>
          <div class="col-md-6">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Rechercher un contact..."
              v-model="searchTerm"
            >
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div v-if="filteredContacts.length === 0" class="text-center p-4">
          <i class="fas fa-user-plus fa-3x text-muted mb-3"></i>
          <p class="text-muted">Aucun contact trouvé</p>
          <button class="btn btn-primary" @click="showAddModal = true">
            Ajouter votre premier contact
          </button>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Date création</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contact in filteredContacts" :key="contact.id">
                <td>
                  <i class="fas fa-user me-2 text-primary"></i>
                  {{ contact.name }}
                </td>
                <td>
                  <i class="fas fa-phone me-2 text-success"></i>
                  {{ contact.phone }}
                </td>
                <td>
                  <i class="fas fa-envelope me-2 text-info"></i>
                  {{ contact.email || '-' }}
                </td>
                <td>{{ formatDate(contact.created_at) }}</td>
                <td class="text-center">
                  <div class="btn-group" role="group">
                    <button 
                      class="btn btn-sm btn-outline-success"
                      @click="openSmsModal(contact)"
                      title="Envoyer SMS"
                    >
                      <i class="fas fa-sms"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-primary"
                      @click="editContact(contact)"
                      title="Modifier"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete(contact)"
                      title="Supprimer"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification de contact -->
    <div class="modal fade" :class="{ show: showAddModal }" :style="{ display: showAddModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingContact ? 'Modifier le contact' : 'Ajouter un contact' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveContact">
            <div class="modal-body">
              <div class="mb-3">
                <label for="name" class="form-label">Nom *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="name"
                  v-model="contactForm.name" 
                  required
                >
              </div>
              <div class="mb-3">
                <label for="phone" class="form-label">Téléphone *</label>
                <input 
                  type="tel" 
                  class="form-control" 
                  id="phone"
                  v-model="contactForm.phone" 
                  placeholder="+212624682689"
                  required
                >
                <div class="form-text">Format international recommandé (ex: +212624682689)</div>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email"
                  v-model="contactForm.email"
                >
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ editingContact ? 'Modifier' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal d'envoi SMS -->
    <div class="modal fade" :class="{ show: showSmsModal }" :style="{ display: showSmsModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Envoyer SMS à {{ selectedContact?.name }}
            </h5>
            <button type="button" class="btn-close" @click="closeSmsModal"></button>
          </div>
          <form @submit.prevent="sendSms">
            <div class="modal-body">
              <div class="mb-3">
                <label for="smsMessage" class="form-label">Message</label>
                <textarea 
                  class="form-control" 
                  id="smsMessage"
                  rows="3"
                  v-model="smsMessage"
                  placeholder="Tapez votre message ici..."
                  required
                ></textarea>
                <div class="form-text">{{ smsMessage.length }} caractères</div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeSmsModal">Annuler</button>
              <button type="submit" class="btn btn-success" :disabled="isSending">
                <span v-if="isSending" class="spinner-border spinner-border-sm me-2"></span>
                <i class="fas fa-paper-plane me-1"></i>
                Envoyer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div class="modal fade" :class="{ show: showDeleteModal }" :style="{ display: showDeleteModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer le contact <strong>{{ contactToDelete?.name }}</strong> ?</p>
            <p class="text-muted">Cette action est irréversible.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Annuler</button>
            <button type="button" class="btn btn-danger" @click="deleteContact" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop pour les modals -->
    <div v-if="showAddModal || showSmsModal || showDeleteModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ContactsPage',
  data() {
    return {
      showAddModal: false,
      showSmsModal: false,
      showDeleteModal: false,
      editingContact: null,
      contactToDelete: null,
      selectedContact: null,
      searchTerm: '',
      successMessage: '',
      smsMessage: '',
      contactForm: {
        name: '',
        phone: '',
        email: ''
      }
    }
  },
  computed: {
    ...mapGetters('contacts', ['allContacts', 'contactsCount', 'isLoading', 'getError']),
    ...mapGetters('sms', { isSending: 'isSending' }),
    loading() {
      return this.isLoading
    },
    error() {
      return this.getError
    },
    filteredContacts() {
      if (!this.searchTerm) return this.allContacts
      const search = this.searchTerm.toLowerCase()
      return this.allContacts.filter(contact => 
        contact.name.toLowerCase().includes(search) ||
        contact.phone.includes(search) ||
        (contact.email && contact.email.toLowerCase().includes(search))
      )
    }
  },
  methods: {
    ...mapActions('contacts', ['loadContacts', 'addContact', 'updateContact', 'deleteContact']),
    ...mapActions('sms', ['sendSmsToContact']),
    
    async saveContact() {
      let result
      if (this.editingContact) {
        result = await this.updateContact({
          id: this.editingContact.id,
          contact: this.contactForm
        })
      } else {
        result = await this.addContact(this.contactForm)
      }
      
      if (result.success) {
        this.successMessage = this.editingContact ? 
          'Contact modifié avec succès' : 
          'Contact ajouté avec succès'
        this.closeModal()
      }
    },
    
    editContact(contact) {
      this.editingContact = contact
      this.contactForm = { ...contact }
      this.showAddModal = true
    },
    
    confirmDelete(contact) {
      this.contactToDelete = contact
      this.showDeleteModal = true
    },
    
    async deleteContact() {
      const result = await this.deleteContact(this.contactToDelete.id)
      if (result.success) {
        this.successMessage = 'Contact supprimé avec succès'
        this.showDeleteModal = false
        this.contactToDelete = null
      }
    },
    
    openSmsModal(contact) {
      this.selectedContact = contact
      this.smsMessage = ''
      this.showSmsModal = true
    },
    
    async sendSms() {
      const result = await this.sendSmsToContact({
        contactId: this.selectedContact.id,
        message: this.smsMessage
      })
      
      if (result.success) {
        this.successMessage = `SMS envoyé avec succès à ${this.selectedContact.name}`
        this.closeSmsModal()
      }
    },
    
    closeModal() {
      this.showAddModal = false
      this.editingContact = null
      this.contactForm = { name: '', phone: '', email: '' }
    },
    
    closeSmsModal() {
      this.showSmsModal = false
      this.selectedContact = null
      this.smsMessage = ''
    },
    
    clearError() {
      this.$store.commit('contacts/SET_ERROR', null)
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  },
  
  mounted() {
    this.loadContacts()
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.table th {
  border-top: none;
}

.btn-group .btn {
  margin: 0 1px;
}

.fa-user, .fa-phone, .fa-envelope {
  width: 16px;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>
