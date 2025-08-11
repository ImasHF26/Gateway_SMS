<template>
  <div class="history">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>
        <i class="fas fa-history me-2"></i>
        Historique des SMS Envoyés
      </h2>
      <button class="btn btn-outline-primary" @click="loadHistory">
        <i class="fas fa-sync-alt me-2"></i>
        Actualiser
      </button>
    </div>

    <!-- Messages d'erreur -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <!-- Statistiques -->
    <div v-else class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="fas fa-paper-plane fa-2x text-primary mb-2"></i>
            <h4 class="card-title">{{ totalSms }}</h4>
            <p class="card-text text-muted">SMS envoyés</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
            <h4 class="card-title">{{ successfulSms }}</h4>
            <p class="card-text text-muted">Réussis</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="fas fa-times-circle fa-2x text-danger mb-2"></i>
            <h4 class="card-title">{{ failedSms }}</h4>
            <p class="card-text text-muted">Échoués</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="fas fa-clock fa-2x text-warning mb-2"></i>
            <h4 class="card-title">{{ pendingSms }}</h4>
            <p class="card-text text-muted">En attente</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="card mb-4">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="fas fa-filter me-2"></i>
          Filtres
        </h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <label for="statusFilter" class="form-label">Statut</label>
            <select class="form-select" id="statusFilter" v-model="statusFilter">
              <option value="">Tous les statuts</option>
              <option value="sent">Envoyés</option>
              <option value="failed">Échoués</option>
              <option value="pending">En attente</option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="searchFilter" class="form-label">Rechercher</label>
            <input 
              type="text" 
              class="form-control" 
              id="searchFilter"
              placeholder="Nom, numéro ou message..."
              v-model="searchFilter"
            >
          </div>
          <div class="col-md-4">
            <label for="dateFilter" class="form-label">Date</label>
            <select class="form-select" id="dateFilter" v-model="dateFilter">
              <option value="">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="yesterday">Hier</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste de l'historique -->
    <div class="card">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <h6 class="mb-0">
            Historique complet ({{ filteredHistory.length }} résultat(s))
          </h6>
          <div>
            <button 
              class="btn btn-sm btn-outline-secondary me-2"
              @click="exportToCSV"
              :disabled="filteredHistory.length === 0"
            >
              <i class="fas fa-download me-1"></i>
              Exporter CSV
            </button>
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div v-if="filteredHistory.length === 0" class="text-center p-4">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">Aucun SMS dans l'historique</p>
          <router-link to="/send-sms" class="btn btn-primary">
            <i class="fas fa-paper-plane me-2"></i>
            Envoyer votre premier SMS
          </router-link>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Date/Heure</th>
                <th>Destinataire</th>
                <th>Message</th>
                <th>Statut</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sms in paginatedHistory" :key="sms.id">
                <td>
                  <small>{{ formatDate(sms.sent_at) }}</small>
                </td>
                <td>
                  <div v-if="sms.contact_name">
                    <i class="fas fa-user me-2 text-primary"></i>
                    <strong>{{ sms.contact_name }}</strong>
                    <br>
                    <small class="text-muted">{{ sms.phone_number }}</small>
                  </div>
                  <div v-else>
                    <i class="fas fa-phone me-2 text-info"></i>
                    {{ sms.phone_number }}
                  </div>
                </td>
                <td>
                  <div class="message-preview">
                    {{ sms.message.length > 50 ? sms.message.substring(0, 50) + '...' : sms.message }}
                  </div>
                  <small class="text-muted">{{ sms.message.length }} caractères</small>
                </td>
                <td>
                  <span :class="getStatusClass(sms.status)">
                    <i :class="getStatusIcon(sms.status)" class="me-1"></i>
                    {{ getStatusText(sms.status) }}
                  </span>
                </td>
                <td class="text-center">
                  <button 
                    class="btn btn-sm btn-outline-info"
                    @click="showSmsDetails(sms)"
                    title="Voir les détails"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="card-footer">
        <nav>
          <ul class="pagination justify-content-center mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                <i class="fas fa-angle-double-left"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                <i class="fas fa-angle-left"></i>
              </button>
            </li>
            
            <li 
              v-for="page in visiblePages" 
              :key="page" 
              class="page-item" 
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="currentPage = page">{{ page }}</button>
            </li>
            
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                <i class="fas fa-angle-right"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                <i class="fas fa-angle-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Modal des détails -->
    <div class="modal fade" :class="{ show: showDetailsModal }" :style="{ display: showDetailsModal ? 'block' : 'none' }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Détails du SMS</h5>
            <button type="button" class="btn-close" @click="showDetailsModal = false"></button>
          </div>
          <div class="modal-body" v-if="selectedSms">
            <div class="row">
              <div class="col-md-6">
                <h6>Informations générales</h6>
                <table class="table table-borderless table-sm">
                  <tr>
                    <td><strong>Date d'envoi:</strong></td>
                    <td>{{ formatDate(selectedSms.sent_at) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Destinataire:</strong></td>
                    <td>
                      {{ selectedSms.contact_name || 'Contact externe' }}
                      <br>
                      <small class="text-muted">{{ selectedSms.phone_number }}</small>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Statut:</strong></td>
                    <td>
                      <span :class="getStatusClass(selectedSms.status)">
                        <i :class="getStatusIcon(selectedSms.status)" class="me-1"></i>
                        {{ getStatusText(selectedSms.status) }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Longueur:</strong></td>
                    <td>{{ selectedSms.message.length }} caractères</td>
                  </tr>
                </table>
              </div>
              <div class="col-md-6">
                <h6>Message complet</h6>
                <div class="border rounded p-3 bg-light">
                  {{ selectedSms.message }}
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDetailsModal = false">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop pour le modal -->
    <div v-if="showDetailsModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'HistoryPage',
  data() {
    return {
      statusFilter: '',
      searchFilter: '',
      dateFilter: '',
      currentPage: 1,
      itemsPerPage: 10,
      showDetailsModal: false,
      selectedSms: null
    }
  },
  computed: {
    ...mapGetters('sms', ['smsHistory', 'isLoading', 'getError']),
    
    loading() {
      return this.isLoading
    },
    error() {
      return this.getError
    },
    
    totalSms() {
      return this.smsHistory.length
    },
    
    successfulSms() {
      return this.smsHistory.filter(sms => sms.status === 'sent').length
    },
    
    failedSms() {
      return this.smsHistory.filter(sms => sms.status === 'failed').length
    },
    
    pendingSms() {
      return this.smsHistory.filter(sms => sms.status === 'pending').length
    },
    
    filteredHistory() {
      let filtered = [...this.smsHistory]
      
      // Filtre par statut
      if (this.statusFilter) {
        filtered = filtered.filter(sms => sms.status === this.statusFilter)
      }
      
      // Filtre par recherche
      if (this.searchFilter) {
        const search = this.searchFilter.toLowerCase()
        filtered = filtered.filter(sms => 
          (sms.contact_name && sms.contact_name.toLowerCase().includes(search)) ||
          sms.phone_number.includes(search) ||
          sms.message.toLowerCase().includes(search)
        )
      }
      
      // Filtre par date
      if (this.dateFilter) {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        filtered = filtered.filter(sms => {
          const smsDate = new Date(sms.sent_at)
          
          switch (this.dateFilter) {
            case 'today':
              return smsDate >= today
            case 'yesterday': {
              const yesterday = new Date(today)
              yesterday.setDate(yesterday.getDate() - 1)
              return smsDate >= yesterday && smsDate < today
            }
            case 'week': {
              const weekStart = new Date(today)
              weekStart.setDate(weekStart.getDate() - weekStart.getDay())
              return smsDate >= weekStart
            }
            case 'month': {
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
              return smsDate >= monthStart
            }
            default:
              return true
          }
        })
      }
      
      return filtered
    },
    
    totalPages() {
      return Math.ceil(this.filteredHistory.length / this.itemsPerPage)
    },
    
    paginatedHistory() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredHistory.slice(start, end)
    },
    
    visiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  
  methods: {
    ...mapActions('sms', ['loadHistory']),
    
    getStatusClass(status) {
      switch (status) {
        case 'sent':
          return 'badge bg-success'
        case 'failed':
          return 'badge bg-danger'
        case 'pending':
          return 'badge bg-warning'
        default:
          return 'badge bg-secondary'
      }
    },
    
    getStatusIcon(status) {
      switch (status) {
        case 'sent':
          return 'fas fa-check'
        case 'failed':
          return 'fas fa-times'
        case 'pending':
          return 'fas fa-clock'
        default:
          return 'fas fa-question'
      }
    },
    
    getStatusText(status) {
      switch (status) {
        case 'sent':
          return 'Envoyé'
        case 'failed':
          return 'Échec'
        case 'pending':
          return 'En attente'
        default:
          return 'Inconnu'
      }
    },
    
    formatDate(date) {
      return new Date(date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    showSmsDetails(sms) {
      this.selectedSms = sms
      this.showDetailsModal = true
    },
    
    exportToCSV() {
      const headers = ['Date', 'Destinataire', 'Numéro', 'Message', 'Statut']
      const rows = this.filteredHistory.map(sms => [
        this.formatDate(sms.sent_at),
        sms.contact_name || '',
        sms.phone_number,
        sms.message.replace(/"/g, '""'), // Échapper les guillemets
        this.getStatusText(sms.status)
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `historique_sms_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    },
    
    clearError() {
      this.$store.commit('sms/SET_ERROR', null)
    }
  },
  
  watch: {
    statusFilter() {
      this.currentPage = 1
    },
    searchFilter() {
      this.currentPage = 1
    },
    dateFilter() {
      this.currentPage = 1
    }
  },
  
  mounted() {
    this.loadHistory()
  }
}
</script>

<style scoped>
.message-preview {
  font-family: monospace;
  font-size: 0.9em;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.pagination .page-link {
  color: #007bff;
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.table th {
  border-top: none;
}

.fa-2x {
  margin-bottom: 0.5rem;
}
</style>
