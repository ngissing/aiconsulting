import { Request, Response } from 'express';
import sgMail from '@sendgrid/mail';

interface ContactRequestBody {
  name: string;
  email: string;
  school?: string;
  message: string;
}

// Set SendGrid API Key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.error('SENDGRID_API_KEY is not set. Email functionality will not work.');
}

export const handleContactForm = async (req: Request, res: Response) => {
  const { name, email, school, message } = req.body as ContactRequestBody;

  if (!process.env.SENDGRID_API_KEY) {
    console.error('Attempted to send email without SENDGRID_API_KEY.');
    return res.status(500).json({ message: 'Email service is not configured.' });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  if (!email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  const toEmail = process.env.SENDGRID_TO_EMAIL;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!toEmail || !fromEmail) {
    console.error('SENDGRID_TO_EMAIL or SENDGRID_FROM_EMAIL is not set.');
    return res.status(500).json({ message: 'Email recipient or sender is not configured.' });
  }

  const msg = {
    to: toEmail,
    from: {
      name: 'Website Contact Form', // You can customize this
      email: fromEmail, // Must be a verified sender in SendGrid
    },
    replyTo: {
        email: email,
        name: name,
    },
    subject: `New Contact Form Submission from ${name}` + (school ? ` (${school})` : ''),
    text: `Name: ${name}\nEmail: ${email}\nSchool/Institution: ${school || 'N/A'}\n\nMessage:\n${message}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>School/Institution:</strong> ${school || 'N/A'}</p>
      <hr>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error: any) {
    console.error('Error sending email with SendGrid:', error.response?.body || error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
};