import dotenv from 'dotenv';
import { createHttpMandiPriceProvider } from './src/services/mandiPriceIngestion';

dotenv.config();

async function test() {
    console.log('Testing Mandi Provider...');
    console.log('API KEY present:', !!process.env.MANDI_API_KEY);
    
    // Check if provider is created
    const provider = createHttpMandiPriceProvider();
    if (!provider) {
        console.error('Provider could not be created (missing key?)');
        return;
    }

    try {
        console.log('Fetching states...');
        const states = await provider.getStates();
        console.log('States found:', states.length);
        
        if (states.length > 0) {
            const firstState = states[0];
            console.log(`First state found: "${firstState}". Fetching districts...`);
            
            const districts = await provider.getDistricts(firstState);
            console.log(`Districts in ${firstState}:`, districts.length);
            
            if (districts.length > 0) {
                const firstDistrict = districts[0];
                console.log(`First district found: "${firstDistrict}". Fetching crops...`);
                
                const crops = await provider.getAvailableCrops(firstDistrict);
                console.log(`Crops in ${firstDistrict}:`, crops.length);
                if (crops.length > 0) {
                     console.log('First 5 crops:', crops.slice(0, 5));
                } else {
                     console.warn('No crops found in this district.');
                }
            } else {
                console.warn('No districts returned.');
            }
        } else {
            console.warn('No states returned from API.');
        }
    } catch (e: any) {
        console.error('Error fetching states:', e.message);
        if (e.response) {
             console.error('Response status:', e.response.status);
             console.error('Response data:', e.response.data);
        }
    }
}

test();