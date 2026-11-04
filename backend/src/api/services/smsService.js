const axios = require('axios');

class SmsService {
  constructor(config) {
    this.baseUrl = config.url;
    this.username = config.username;
    this.password = config.password;
  }

  async sendSms(phoneNumbers, message) {
    try {
      console.log('Configuration SMS Service:');
      console.log('- URL:', this.baseUrl);
      console.log('- Username:', this.username ? 'Configuré' : 'Non configuré');
      console.log('- Password:', this.password ? 'Configuré' : 'Non configuré');
      console.log('- Destinataires:', phoneNumbers);
      console.log('- Message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

      const payload = {
        textMessage: {
          text: message
        },
        phoneNumbers: Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers]
      };

      console.log('Payload envoyé:', JSON.stringify(payload, null, 2));

      const response = await axios.post(`${this.baseUrl}/message`, payload, {
        auth: {
          username: this.username,
          password: this.password
        },
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        validateStatus: () => true
      });

      console.log('Réponse SMSGate:', response.status, response.data);

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          data: response.data,
          status: response.status
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS:', error.message);

      let errorMessage = error.message;
      let errorDetails = {};

      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        errorMessage = `Impossible de se connecter à SMSGate (${this.baseUrl}). Vérifiez que l'application SMSGate est démarrée sur votre smartphone et que l'adresse IP est correcte.`;
        errorDetails.connectionError = true;
      } else if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = `Erreur d'authentification (401). Vérifiez vos identifiants SMSGate (username/password)`;
            errorDetails.authError = true;
            break;
          case 403:
            errorMessage = `Accès refusé (403). Vérifiez les permissions de votre application SMSGate`;
            break;
          case 404:
            errorMessage = `Endpoint non trouvé (404). Vérifiez l'URL de votre SMSGate`;
            break;
          case 500:
            errorMessage = `Erreur serveur SMSGate (500). Consultez les logs de l'application SMSGate`;
            break;
          default:
            errorMessage = `Erreur HTTP ${error.response.status}: ${error.response.data?.message || error.message}`;
        }
        console.error('Détails de la réponse d\'erreur:', error.response.data);
      }

      return {
        success: false,
        error: errorMessage,
        status: error.response?.status || 500,
        details: errorDetails
      };
    }
  }

  async sendSmsToContact(contact, message) {
    return this.sendSms(contact.phone, message);
  }

  async sendSmsToMultipleContacts(contacts, message) {
    const phoneNumbers = contacts.map(contact => contact.phone);
    return this.sendSms(phoneNumbers, message);
  }

  async getMessageStatus(messageId) {
    try {
      const response = await axios.get(`${this.baseUrl}/message/${messageId}`, {
        auth: {
          username: this.username,
          password: this.password
        },
        timeout: 5000,
        validateStatus: () => true
      });

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          data: response.data,
          status: response.status
        };
      } else {
        return {
          success: false,
          status: response.status,
          error: `HTTP ${response.status}: ${JSON.stringify(response.data)}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testConnection() {
    try {
      console.log('Test de connexion à SMSGate:', this.baseUrl);

      const response = await axios.get(this.baseUrl, {
        auth: {
          username: this.username,
          password: this.password
        },
        timeout: 5000,
        validateStatus: () => true
      });

      console.log('Test de connexion SMSGate:', response.status);

      if (response.status >= 200 && response.status < 400) {
        return {
          success: true,
          status: response.status,
          message: 'Connexion à SMSGate réussie'
        };
      } else {
        return {
          success: false,
          status: response.status,
          error: `Erreur HTTP ${response.status}: ${JSON.stringify(response.data)}`
        };
      }
    } catch (error) {
      console.error('Échec du test de connexion SMSGate:', error.message);

      let errorMessage = error.message;
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        errorMessage = `Impossible de se connecter à SMSGate à l'adresse ${this.baseUrl}. Vérifiez que l'application est démarrée sur votre smartphone.`;
      } else if (error.response?.status === 401) {
        errorMessage = 'Erreur d\'authentification. Vérifiez vos identifiants SMSGate (username/password).';
      }

      return {
        success: false,
        error: errorMessage,
        status: error.response?.status || 500
      };
    }
  }
}

module.exports = SmsService;
