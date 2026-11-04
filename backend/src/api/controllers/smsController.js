const SmsService = require('../services/smsService');
const Database = require('../../config/database');

const db = new Database();
const smsService = new SmsService({
  url: process.env.SMSGATE_URL,
  username: process.env.SMSGATE_USERNAME,
  password: process.env.SMSGATE_PASSWORD
});

/**
 * Extrait l'identifiant gateway d'une réponse SMSGate (objet unique ou tableau).
 */
function extractGatewayId(data, phone) {
  if (!data) return null;
  if (data.id) return String(data.id);
  if (Array.isArray(data)) {
    const found = data.find(m => m && (m.phoneNumber === phone || m.phone === phone));
    if (found && found.id) return String(found.id);
    if (data[0] && data[0].id) return String(data[0].id);
  }
  return null;
}

/**
 * Extrait l'état initial (Pending, etc.) de la réponse SMSGate.
 */
function extractInitialState(data, phone) {
  if (!data) return 'unknown';
  if (Array.isArray(data.recipients)) {
    const r = data.recipients.find(rec => rec.phoneNumber === phone);
    if (r && r.state) return r.state;
  }
  return data.state || 'Pending';
}
function interpolateMessage(text, contact = {}) {
  let res = text;
  const fullName = (contact.name || '').trim();
  const nameParts = fullName ? fullName.split(/\s+/) : [];
  const firstName = nameParts[0] || fullName;

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  res = res.replace(/\{nom\}/gi, fullName || contact.phone || '');
  res = res.replace(/\{prenom\}/gi, firstName || fullName || '');
  res = res.replace(/\{date\}/gi, dateStr);
  res = res.replace(/\{heure\}/gi, timeStr);
  res = res.replace(/\{telephone\}/gi, contact.phone || '');

  return res;
}

const sendSms = async (req, res) => {
  try {
    const { phoneNumbers, message, contactIds } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Le message est requis'
      });
    }

    let targetPhones = [];
    let contactData = [];

    if (contactIds && contactIds.length > 0) {
      for (const contactId of contactIds) {
        const contact = await db.getContactById(contactId);
        if (contact) {
          targetPhones.push(contact.phone);
          contactData.push(contact);
        }
      }
    }

    if (phoneNumbers && phoneNumbers.length > 0) {
      targetPhones = [...targetPhones, ...phoneNumbers];
    }

    if (targetPhones.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucun destinataire spécifié'
      });
    }

    // Détecter si le message contient des tags personnalisés par contact
    const hasPersonalTags = /\{(nom|prenom|telephone)\}/i.test(message);

    if (hasPersonalTags && contactData.length > 0) {
      // Envoi personnalisé par destinataire
      const results = [];
      for (const phone of targetPhones) {
        const contact = contactData.find(c => c.phone === phone);
        const personalizedMsg = interpolateMessage(message, contact || { phone });

        const smsResult = await smsService.sendSms([phone], personalizedMsg);
        const gtwId = extractGatewayId(smsResult.data, phone);
        const initState = extractInitialState(smsResult.data, phone);

        await db.addSmsHistory({
          contact_id: contact ? contact.id : null,
          phone_number: phone,
          message: personalizedMsg,
          status: smsResult.success ? 'sent' : 'failed',
          gateway_message_id: gtwId
        });

        if (gtwId && initState !== 'unknown') {
          // Si on a un ID et un état initial (ex. Pending), on met à jour delivery_status
          const lastInserted = await db.getSmsHistory();
          if (lastInserted && lastInserted[0]) {
            await db.updateSmsDeliveryStatus(lastInserted[0].id, initState, gtwId);
          }
        }

        results.push({
          phone,
          personalizedMsg,
          success: smsResult.success,
          gatewayId: gtwId,
          deliveryStatus: initState
        });
      }

      return res.json({
        success: true,
        data: {
          sentTo: targetPhones,
          isPersonalized: true,
          results
        }
      });
    }

    // Message standard (ou avec {date} et {heure} globaux)
    const formattedMessage = interpolateMessage(message);
    const smsResult = await smsService.sendSms(targetPhones, formattedMessage);

    const gtwId = extractGatewayId(smsResult.data, targetPhones[0]);

    for (const phone of targetPhones) {
      const contact = contactData.find(c => c.phone === phone);
      const initState = extractInitialState(smsResult.data, phone);

      await db.addSmsHistory({
        contact_id: contact ? contact.id : null,
        phone_number: phone,
        message: formattedMessage,
        status: smsResult.success ? 'sent' : 'failed',
        gateway_message_id: gtwId
      });

      if (gtwId && initState !== 'unknown') {
        const lastInserted = await db.getSmsHistory();
        if (lastInserted && lastInserted[0]) {
          await db.updateSmsDeliveryStatus(lastInserted[0].id, initState, gtwId);
        }
      }
    }

    res.json({
      success: smsResult.success,
      data: {
        sentTo: targetPhones,
        message: formattedMessage,
        gateway_message_id: gtwId,
        smsGateResponse: smsResult.data
      },
      error: smsResult.error
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const sendSmsToContact = async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Le message est requis'
        });
      }

      const contact = await db.getContactById(req.params.id);
      if (!contact) {
        return res.status(404).json({ success: false, error: 'Contact non trouvé' });
      }

      const personalizedMsg = interpolateMessage(message, contact);
      const smsResult = await smsService.sendSms([contact.phone], personalizedMsg);

      const gtwId = extractGatewayId(smsResult.data, contact.phone);
      const initState = extractInitialState(smsResult.data, contact.phone);

      await db.addSmsHistory({
        contact_id: contact.id,
        phone_number: contact.phone,
        message: personalizedMsg,
        status: smsResult.success ? 'sent' : 'failed',
        gateway_message_id: gtwId
      });

      if (gtwId && initState !== 'unknown') {
        const lastInserted = await db.getSmsHistory();
        if (lastInserted && lastInserted[0]) {
          await db.updateSmsDeliveryStatus(lastInserted[0].id, initState, gtwId);
        }
      }

      res.json({
        success: smsResult.success,
        data: {
          contact: contact,
          message: personalizedMsg,
          gateway_message_id: gtwId,
          delivery_status: initState,
          smsGateResponse: smsResult.data
        },
        error: smsResult.error
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

const getSmsHistory = async (req, res) => {
  try {
    const history = await db.getSmsHistory();
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const checkSmsStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!messageId) {
      return res.status(400).json({ success: false, error: 'ID de message requis' });
    }

    // Récupérer le SMS depuis la BDD
    const sms = await db.getSmsById(messageId);
    if (!sms) {
      return res.status(404).json({ success: false, error: 'SMS non trouvé' });
    }

    // Si on a un gateway_message_id, interroger la passerelle Android
    if (sms.gateway_message_id) {
      const statusResult = await smsService.getMessageStatus(sms.gateway_message_id);

      if (statusResult.success && statusResult.data) {
        // Extraire le delivery_status de la réponse gateway
        // La passerelle SMS-Gate retourne un objet avec state/status et un tableau recipients
        const gatewayData = statusResult.data;
        let deliveryStatus = 'unknown';

        if (Array.isArray(gatewayData.recipients)) {
          const rec = gatewayData.recipients.find(r => r.phoneNumber === sms.phone_number);
          if (rec && rec.state) {
            deliveryStatus = rec.state;
          }
        }

        if (deliveryStatus === 'unknown') {
          if (gatewayData.state) {
            deliveryStatus = gatewayData.state; // Pending, Processed, Sent, Delivered, Failed
          } else if (gatewayData.status) {
            deliveryStatus = gatewayData.status;
          }
        }

        // Mettre à jour en BDD
        await db.updateSmsDeliveryStatus(sms.id, deliveryStatus, sms.gateway_message_id);

        return res.json({
          success: true,
          data: {
            id: sms.id,
            phone_number: sms.phone_number,
            delivery_status: deliveryStatus,
            gateway_data: gatewayData,
            checked_at: new Date().toISOString()
          }
        });
      }
    }

    // Pas de gateway_message_id ou erreur de requête — retourner le status actuel BDD
    res.json({
      success: true,
      data: {
        id: sms.id,
        phone_number: sms.phone_number,
        delivery_status: sms.delivery_status || sms.status,
        checked_at: sms.status_checked_at || null,
        no_gateway_id: !sms.gateway_message_id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  sendSms,
  sendSmsToContact,
  getSmsHistory,
  checkSmsStatus,
};
