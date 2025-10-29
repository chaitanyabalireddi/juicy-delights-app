import nodemailer from 'nodemailer';
import { config } from '@/config';

const transporter = nodemailer.createTransporter({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const mailOptions = {
      from: `"Juicy Delights" <${config.email.user}>`,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ff6b35;">Welcome to Juicy Delights!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining Juicy Delights! We're excited to have you on board.</p>
      <p>Get ready to enjoy the freshest fruits delivered right to your doorstep!</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>What's next?</h3>
        <ul>
          <li>Browse our fresh fruit collection</li>
          <li>Place your first order</li>
          <li>Track your delivery in real-time</li>
        </ul>
      </div>
      <p>Happy shopping!</p>
      <p>The Juicy Delights Team</p>
    </div>
  `;

  return sendEmail(email, 'Welcome to Juicy Delights!', html);
};

export const sendOrderConfirmationEmail = async (email: string, name: string, orderNumber: string, total: number) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ff6b35;">Order Confirmed!</h1>
      <p>Hi ${name},</p>
      <p>Your order has been confirmed and we're preparing it for you.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Total Amount:</strong> ₹${total}</p>
        <p><strong>Status:</strong> Confirmed</p>
      </div>
      <p>We'll notify you when your order is out for delivery!</p>
      <p>Thank you for choosing Juicy Delights!</p>
    </div>
  `;

  return sendEmail(email, `Order Confirmed - ${orderNumber}`, html);
};

export const sendDeliveryUpdateEmail = async (email: string, name: string, orderNumber: string, status: string) => {
  const statusMessages = {
    'preparing': 'Your order is being prepared',
    'ready': 'Your order is ready for pickup',
    'out-for-delivery': 'Your order is out for delivery',
    'delivered': 'Your order has been delivered'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ff6b35;">Order Update</h1>
      <p>Hi ${name},</p>
      <p>${statusMessages[status as keyof typeof statusMessages] || 'Your order status has been updated'}.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Status:</strong> ${status.replace('-', ' ').toUpperCase()}</p>
      </div>
      <p>Thank you for choosing Juicy Delights!</p>
    </div>
  `;

  return sendEmail(email, `Order Update - ${orderNumber}`, html);
};
