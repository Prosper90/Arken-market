const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const common = require("./common");
const key = require("../config/key");
const api_key = key.sendgrid_api;
const from_mail = process.env.FROM_EMAIL;
const axios = require('axios');

const transporter = nodemailer.createTransport({
  secure: false,
  port: process.env.EMAILPORT,
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.sendEMail = function (mailRequest) {
  return new Promise(function (resolve, reject) {
    transporter.sendMail(mailRequest, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve("The message was sent!");
      }
    });
  });
};


const sendSmsOtp = async () => {
  const apiKey = process.env.SENDINBLUE_API_KEY; // Set in .env
  const senderName = 'JD';
  const message = `Your OTP is: ${1234}`;
  const mobileNumber = 7010889149
  const data = {
    sender: senderName,
    recipient: mobileNumber,
    content: message,
    type: 'transactional'
  };

  try {
    const response = await axios.post('https://api.brevo.com/v3/transactionalSMS/sms', data, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    console.log('SMS sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending SMS:', error.response ? error.response.data : error.message);
  }
};


// Main function to send an email
const sendMail = async (options) => {
  // console.log(options,"dadsfasdfasdfasdfasdfas")
  try {
    const mailOptions = {
      from: { name: process.env.FROM_NAME, address: process.env.FROM_EMAIL }, // Sender address
      to: options.to, // List of recipients
      subject: options.subject, // Subject line
      html: options.html // HTML body
    };

    // Send email using the transporter
    const result = await transporter.sendMail(mailOptions);
    //console.log("Email sent: ", result);
    return result;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};





module.exports = {
  sendMail,
  sendSmsOtp,
  transporter
};
