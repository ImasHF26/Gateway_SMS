import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Contacts from '../views/Contacts.vue'
import SendSMS from '../views/SendSMS.vue'
import History from '../views/History.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: Contacts
  },
  {
    path: '/send-sms',
    name: 'SendSMS',
    component: SendSMS
  },
  {
    path: '/history',
    name: 'History',
    component: History
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
