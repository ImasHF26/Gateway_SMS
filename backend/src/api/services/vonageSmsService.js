const { Vonage } = require('@vonage/server-sdk');

class VonageSmsService {
  constructor(credentials) {
    this.vonage = new Vonage(credentials);
  }

  async sendSms(to, text) {
    const from = process.env.VONAGE_BRAND_NAME || 'University';
    try {
      const responseData = await this.vonage.sms.send({ to, from, text });
      console.log('Message sent successfully', responseData);
      return { success: true, data: responseData };
    } catch (err) {
      console.error('Error sending SMS via Vonage:', err);
      return { success: false, error: err.message || 'Failed to send SMS' };
    }
  }
}

module.exports = VonageSmsService;
