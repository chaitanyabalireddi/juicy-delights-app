import twilio from 'twilio';
import { config } from '@/config';

let client: ReturnType<typeof twilio> | null = null;
const hasValidTwilioConfig =
  config.twilio.accountSid?.startsWith('AC') &&
  !!config.twilio.authToken &&
  !!config.twilio.phoneNumber;

if (hasValidTwilioConfig) {
  client = twilio(config.twilio.accountSid, config.twilio.authToken);
} else {
  console.warn('⚠️ Twilio credentials missing or invalid; SMS features disabled.');
}

export const sendSMS = async (to: string, message: string) => {
  if (!client || !hasValidTwilioConfig) {
    console.warn('SMS skipped: Twilio not configured.');
    return null;
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: config.twilio.phoneNumber,
      to
    });

    console.log('SMS sent:', result.sid);
    return result;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

export const sendOTP = async (phone: string, otp: string) => {
  const message = `Your Juicy Delights OTP is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;
  return sendSMS(phone, message);
};

export const sendOrderConfirmationSMS = async (phone: string, orderNumber: string, total: number) => {
  const message = `Your order ${orderNumber} has been confirmed! Total: ₹${total}. We'll notify you when it's out for delivery. - Juicy Delights`;
  return sendSMS(phone, message);
};

export const sendDeliveryUpdateSMS = async (phone: string, orderNumber: string, status: string) => {
  const statusMessages = {
    'preparing': 'Your order is being prepared',
    'ready': 'Your order is ready for pickup',
    'out-for-delivery': 'Your order is out for delivery',
    'delivered': 'Your order has been delivered'
  };

  const message = `Order ${orderNumber}: ${statusMessages[status as keyof typeof statusMessages] || 'Status updated'}. - Juicy Delights`;
  return sendSMS(phone, message);
};

export const sendDeliveryPersonAssignedSMS = async (phone: string, orderNumber: string, deliveryPersonName: string, phoneNumber: string) => {
  const message = `Your order ${orderNumber} has been assigned to ${deliveryPersonName}. Contact: ${phoneNumber}. - Juicy Delights`;
  return sendSMS(phone, message);
};
