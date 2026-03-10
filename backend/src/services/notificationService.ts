import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const getClient = () => {
    if (accountSid && authToken) {
        return twilio(accountSid, authToken);
    }
    console.warn("Twilio Client Init Failed: Missing SID or Token", { 
        hasSid: !!accountSid, 
        hasToken: !!authToken,
        sidFirst4: accountSid ? accountSid.substring(0,4) : 'null'
    });
    return null;
};

export const sendSMS = async (to: string, body: string): Promise<boolean> => {
    const client = getClient();
    if (!client) {
        console.warn('Twilio credentials not configured. SMS not sent.');
        console.log(`[SMS SIMULATION] To: ${to}, Body: ${body}`);
        return false;
    }

    // Basic formatting for Indian numbers if standard 10-digit
    // 1. Remove all whitespace and non-numeric chars except '+'
    let formattedTo = to.replace(/[\s-]/g, '');

    // 2. If it's a simple 10-digit number (e.g. 9876543210), assume +91
    if (/^\d{10}$/.test(formattedTo)) {
        formattedTo = `+91${formattedTo}`;
    } 
    // 3. If it starts with 91 and is 12 digits long (e.g. 919876543210), ensure it has +
    else if (/^91\d{10}$/.test(formattedTo)) {
        formattedTo = `+${formattedTo}`;
    }
    // 4. Ensure it starts with + if it's missing (general case)
    else if (!formattedTo.startsWith('+')) {
        formattedTo = `+${formattedTo}`;
    }

    try {
        const message = await client.messages.create({
            body: body,
            from: fromPhoneNumber,
            to: formattedTo
        });
        console.log(`SMS sent successfully. SID: ${message.sid} | To: ${formattedTo}`);
        return true;
    } catch (error: any) {
        console.error('Error sending SMS:', error.message);
        if (error.code === 21211) {
             console.error(`[Twilio Error 21211] Invalid Phone Number: '${formattedTo}'. \nTip: If you are on a Twilio Trial account, you can ONLY send SMS to Verified Caller IDs. Verify your number here: https://console.twilio.com/us1/develop/phone-numbers/manage/verified`);
        }
        return false;
    }
};

export const sendWelcomeMessage = async (to: string, name: string) => {
    const message = `Welcome to FarmSmart, ${name}! Your account has been successfully created. We are excited to have you on board.`;
    return sendSMS(to, message);
};

export const sendLoginAlert = async (to: string, name: string) => {
    const time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    const message = `Login Alert: Hello ${name}, your FarmSmart account was accessed at ${time}. If this wasn't you, please secure your account.`;
    return sendSMS(to, message);
};

export const sendNegotiationAlert = async (to: string, type: 'NEW_OFFER' | 'COUNTER_OFFER' | 'ACCEPTED' | 'REJECTED', details: { name: string, crop: string, price: number }) => {
    let message = '';
    switch (type) {
        case 'NEW_OFFER':
            message = `FarmSmart: New Offer! ${details.name} has placed a bid of ₹${details.price} on your ${details.crop}.`;
            break;
        case 'COUNTER_OFFER':
            message = `FarmSmart: Counter Offer! ${details.name} has countered your offer for ${details.crop} to ₹${details.price}.`;
            break;
        case 'ACCEPTED':
            message = `FarmSmart: Deal Accepted! Your negotiation for ${details.crop} with ${details.name} has been finalized @ ₹${details.price}.`;
            break;
        case 'REJECTED':
            message = `FarmSmart: Deal Rejected. Your offer for ${details.crop} was declined by ${details.name}.`;
            break;
    }
    return sendSMS(to, message);
};

export const sendNewOrderAlert = async (to: string, details: { buyerName: string, crop: string, quantity: number, unit: string }) => {
    const message = `FarmSmart: New Order! ${details.buyerName} has placed an order for ${details.quantity} ${details.unit} of ${details.crop}. Check dashboard for details.`;
    return sendSMS(to, message);
};

export const sendOrderStatusAlert = async (to: string, details: { orderId: string, status: string, crop: string }) => {
    const message = `FarmSmart: Order Update! Your order for ${details.crop} (ID: ...${details.orderId.slice(-4)}) is now ${details.status}.`;
    return sendSMS(to, message);
};

export const sendAdvisoryAlert = async (to: string, details: { type: string, title: string, state?: string }) => {
    let message = `FarmSmart Advisory: ${details.type.toUpperCase()}`;
    if (details.state) message += ` for ${details.state}`;
    message += ` - ${details.title}. Check app for details.`;
    return sendSMS(to, message);
};
