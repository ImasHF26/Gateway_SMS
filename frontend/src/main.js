import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import FontAwesome
import '@fortawesome/fontawesome-free/css/all.min.css'

createApp(App).use(store).use(router).mount('#app')
