<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <i class="fas fa-sms me-2"></i>
          SMS Service
        </router-link>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/" active-class="active">
                <i class="fas fa-home me-1"></i>
                Accueil
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/contacts" active-class="active">
                <i class="fas fa-address-book me-1"></i>
                Contacts
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/send-sms" active-class="active">
                <i class="fas fa-paper-plane me-1"></i>
                Envoyer SMS
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/history" active-class="active">
                <i class="fas fa-history me-1"></i>
                Historique
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="container mt-4">
      <router-view/>
    </main>

    <footer class="bg-light mt-5 py-4">
      <div class="container text-center">
        <p class="mb-0 text-muted">
          © 2025 SMS Service - Gestion de contacts et envoi de SMS via SMSGate
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    // Initialiser la connexion au store
    this.$store.dispatch('contacts/loadContacts')
  }
}
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}

.nav-link.router-link-exact-active {
  color: #fff !important;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
}

.btn {
  border-radius: 0.375rem;
}

.card {
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table {
  border-radius: 0.5rem;
  overflow: hidden;
}

.alert {
  border-radius: 0.5rem;
}

.form-control, .form-select {
  border-radius: 0.375rem;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
