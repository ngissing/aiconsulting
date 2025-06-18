const path = require('path');
// Load environment variables from .env file located in the same directory as this script
// or more robustly, point directly to backend/.env if script is always in backend/
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.error('SENDGRID_API_KEY is not set in your .env file. Please add it.');
  process.exit(1); // Exit if API key is not found
}

// sgMail.setDataResidency('eu'); 
// uncomment the above line if you are sending mail using a regional EU subuser

const msg = {
  to: 'info@nickgissing.com', // Recipient
  from: 'info@nickgissing.com', // Verified sender (ensure domain is authenticated in SendGrid)
  subject: 'Test: Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

console.log('Attempting to send email...');
console.log('To:', msg.to);
console.log('From:', msg.from);
console.log('Using API Key ending with:', process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.slice(-5) : 'NOT FOUND');


sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent successfully!');
  })
  .catch((error) => {
    console.error('Error sending email:');
    if (error.response) {
      console.error(error.response.body);
    } else {
      console.error(error);
    }
    process.exit(1); // Exit with error
  });