import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    console.error('Erreur API:', error)
    return Promise.reject(error)
  }
)

export default {
  // Contacts
  getContacts() {
    return apiClient.get('/contacts')
  },
  
  getContact(id) {
    return apiClient.get(`/contacts/${id}`)
  },
  
  addContact(contact) {
    return apiClient.post('/contacts', contact)
  },
  
  updateContact(id, contact) {
    return apiClient.put(`/contacts/${id}`, contact)
  },
  
  deleteContact(id) {
    return apiClient.delete(`/contacts/${id}`)
  },

  addContactsFromCsv(file) {
    const formData = new FormData();
    formData.append('csvFile', file);
    return apiClient.post('/contacts/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // SMS
  sendSms(data) {
    return apiClient.post('/sms/send', data)
  },

  sendVonageSms(data) {
    return apiClient.post('/vonage-sms/send', data)
  },
  
  sendSmsToContact(contactId, message) {
    return apiClient.post(`/sms/send-to-contact/${contactId}`, { message })
  },
  
  getSmsHistory() {
    return apiClient.get('/sms/history')
  },

  // Test
  testConnection() {
    return apiClient.get('/test')
  }
}
