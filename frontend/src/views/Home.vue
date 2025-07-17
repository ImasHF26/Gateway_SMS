<template>
  <div class="home">
    <div class="row">
      <div class="col-12">
        <div class="jumbotron bg-primary text-white rounded p-5 mb-4">
          <h1 class="display-4">
            <i class="fas fa-sms me-3"></i>
            Bienvenue dans SMS Service
          </h1>
          <p class="lead">
            Gérez vos contacts et envoyez des SMS facilement via votre passerelle SMSGate
          </p>
          <hr class="my-4 border-light">
          <p>
            Une solution complète pour la gestion de contacts et l'envoi de SMS en masse ou individuels.
          </p>
          <router-link class="btn btn-light btn-lg" to="/contacts" role="button">
            <i class="fas fa-address-book me-2"></i>
            Commencer
          </router-link>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body text-center">
            <i class="fas fa-address-book fa-3x text-primary mb-3"></i>
            <h5 class="card-title">Gestion des Contacts</h5>
            <p class="card-text">
              Ajoutez, modifiez et organisez vos contacts avec leurs numéros de téléphone et emails.
            </p>
            <router-link to="/contacts" class="btn btn-primary">
              <i class="fas fa-users me-1"></i>
              Gérer les contacts
            </router-link>
          </div>
          <div class="card-footer text-muted text-center">
            {{ contactsCount }} contact(s) enregistré(s)
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body text-center">
            <i class="fas fa-paper-plane fa-3x text-success mb-3"></i>
            <h5 class="card-title">Envoi de SMS</h5>
            <p class="card-text">
              Envoyez des SMS individuels ou en masse à vos contacts via votre passerelle SMSGate.
            </p>
            <router-link to="/send-sms" class="btn btn-success">
              <i class="fas fa-sms me-1"></i>
              Envoyer un SMS
            </router-link>
          </div>
          <div class="card-footer text-muted text-center">
            Passerelle connectée
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body text-center">
            <i class="fas fa-history fa-3x text-info mb-3"></i>
            <h5 class="card-title">Historique</h5>
            <p class="card-text">
              Consultez l'historique de tous les SMS envoyés avec les détails et statuts.
            </p>
            <router-link to="/history" class="btn btn-info">
              <i class="fas fa-list me-1"></i>
              Voir l'historique
            </router-link>
          </div>
          <div class="card-footer text-muted text-center">
            Suivi complet des envois
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4" v-if="recentSms.length > 0">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-clock me-2"></i>
              SMS récents
            </h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Destinataire</th>
                    <th>Message</th>
                    <th>Statut</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sms in recentSms.slice(0, 5)" :key="sms.id">
                    <td>
                      <span v-if="sms.contact_name">{{ sms.contact_name }}</span>
                      <span v-else class="text-muted">{{ sms.phone_number }}</span>
                    </td>
                    <td>{{ sms.message.substring(0, 50) }}{{ sms.message.length > 50 ? '...' : '' }}</td>
                    <td>
                      <span :class="getStatusClass(sms.status)">
                        {{ getStatusText(sms.status) }}
                      </span>
                    </td>
                    <td>{{ formatDate(sms.sent_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="text-end">
              <router-link to="/history" class="btn btn-sm btn-outline-primary">
                Voir tout l'historique
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'HomePage',
  computed: {
    ...mapGetters('contacts', ['contactsCount']),
    ...mapGetters('sms', ['recentSms'])
  },
  methods: {
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
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  mounted() {
    // Charger les données récentes
    this.$store.dispatch('sms/loadHistory')
  }
}
</script>

<style scoped>
.jumbotron {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
}

.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
}

.fa-3x {
  margin-bottom: 1rem;
}
</style>
