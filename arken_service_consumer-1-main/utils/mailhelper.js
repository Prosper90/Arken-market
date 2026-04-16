const axios = require('axios');

// Send email via Resend HTTP API (port 443 — no SMTP port issues)
const sendMail = async (options) => {
  try {
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: `${process.env.FROM_NAME || 'Arken'} <${process.env.FROM_EMAIL}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.EMAIL_PASSWORD}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending email: ", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.message || error.message);
  }
};


module.exports = { sendMail };
