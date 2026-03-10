import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

import { sendWelcomeMessage, sendSMS } from './src/services/notificationService';

const runTest = async () => {
    console.log('Testing SMS functionality...');
    console.log('TWILIO_ACCOUNT_SID present:', !!process.env.TWILIO_ACCOUNT_SID);
    console.log('TWILIO_AUTH_TOKEN present:', !!process.env.TWILIO_AUTH_TOKEN);
    console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);


    // Use a hardcoded number for testing if you want, or just log what would happen
    const testPhone = process.argv[2]; 
    if (!testPhone) {
        console.error('Please provide a phone number as an argument. e.g., npx ts-node test_sms.ts +1234567890');
        return;
    }

    console.log(`Attempting to send SMS to: ${testPhone}`);
    
    // Test basic SMS
    const result = await sendSMS(testPhone, "Test message from FarmSmart Backend Debugger");
    console.log('Direct SMS Result:', result);

    if (result) {
        console.log('Direct SMS sent successfully!');
    } else {
        console.error('Direct SMS failed.');
    }
};

runTest();
