import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import cropService from '../services/crop.service';

const routesMap = {
    // Dashboard & Home
    dashboard: '/dashboard',
    home: '/dashboard',

    // Marketplace & Crops
    'crop listing': '/dashboard/marketplace',
    market: '/dashboard/marketplace',
    marketplace: '/dashboard/marketplace',
    crops: '/dashboard/marketplace',
    buy: '/dashboard/marketplace',

    // Insights & Forecast
    insights: '/dashboard/insights',
    price: '/dashboard/insights',
    prices: '/dashboard/insights',
    forecast: '/dashboard/forecast',
    demand: '/dashboard/forecast',

    // Quality & Pricing
    quality: '/dashboard/pricing',
    pricing: '/dashboard/pricing',

    // Negotiation
    negotiation: '/dashboard/negotiations',
    negotiations: '/dashboard/negotiations',
    bidding: '/dashboard/negotiations',
    bid: '/dashboard/negotiations',

    // Orders & Transactions
    orders: '/dashboard/orders',
    order: '/dashboard/orders',
    transactions: '/dashboard/orders',
    logistics: '/dashboard/orders',
    location: '/dashboard/orders',

    // Selling & Cropping
    sell: '/dashboard/add-crop',
    'add crop': '/dashboard/add-crop',
    'list crop': '/dashboard/add-crop',

    // Ratings & Reviews
    ratings: '/dashboard/reviews',
    reviews: '/dashboard/reviews',
    trust: '/dashboard/reviews',

    // Disputes
    dispute: '/dashboard/disputes',
    disputes: '/dashboard/disputes',
    resolution: '/dashboard/disputes',
    'admin disputes': '/dashboard/admin/disputes',
    'manage disputes': '/dashboard/admin/disputes',

    // Sales & Revenue
    sales: '/dashboard/sales',
    revenue: '/dashboard/sales',

    // government Schemes
    schemes: '/dashboard/schemes',
    scheme: '/dashboard/schemes',
    government: '/dashboard/schemes',
    advisory: '/dashboard/schemes',

    // User paths
    profile: '/dashboard/profile',
    settings: '/dashboard/settings',
    notification: '/dashboard/notifications',
    notifications: '/dashboard/notifications',

    // === TAMIL COMMANDS ===
    // Dashboard
    'முகப்பு': '/dashboard',

    // Marketplace
    'பயிர் பட்டியல்': '/dashboard/marketplace',
    'சந்தை': '/dashboard/marketplace',
    'வாங்கு': '/dashboard/marketplace',

    // Insights
    'விலை நிலவரம்': '/dashboard/insights',
    'விலை': '/dashboard/insights',
    'முன்கணிப்பு': '/dashboard/forecast',
    'தேவை': '/dashboard/forecast',

    // Quality
    'தரம்': '/dashboard/pricing',

    // Negotiation
    'பேச்சுவார்த்தை': '/dashboard/negotiations',
    'ஏலம்': '/dashboard/negotiations',

    // Orders
    'ஆர்டர்கள்': '/dashboard/orders',
    'பரிவர்த்தனை': '/dashboard/orders',
    'போக்குவரத்து': '/dashboard/orders',

    // Sell Crop
    'விற்க': '/dashboard/add-crop',
    'பயிர் சேர்': '/dashboard/add-crop',

    // Reviews & Disputes
    'மதிப்பீடு': '/dashboard/reviews',
    'நம்பிக்கை': '/dashboard/reviews',
    'சர்ச்சை': '/dashboard/disputes',
    'தீர்வு': '/dashboard/disputes',

    // Schemes
    'திட்டங்கள்': '/dashboard/schemes',
    'அரசு': '/dashboard/schemes',
    'ஆலோசனை': '/dashboard/schemes',

    // Settings
    'சுயவிவரம்': '/dashboard/profile',
    'அமைப்பு': '/dashboard/settings',
    'அறிவிப்பு': '/dashboard/notifications',

    // === HINDI COMMANDS ===
    'डैशबोर्ड': '/dashboard',
    'होम': '/dashboard',
    'फसल सूची': '/dashboard/marketplace',
    'बाजार': '/dashboard/marketplace',
    'खरीदें': '/dashboard/marketplace',
    'कीमत': '/dashboard/insights',
    'पूर्वानुमान': '/dashboard/forecast',
    'मांग': '/dashboard/forecast',
    'गुणवत्ता': '/dashboard/pricing',
    'बातचीत': '/dashboard/negotiations',
    'बोली': '/dashboard/negotiations',
    'आदेश': '/dashboard/orders',
    'लेनदेन': '/dashboard/orders',
    'परिवहन': '/dashboard/orders',
    'बेचें': '/dashboard/add-crop',
    'फसल जोड़ें': '/dashboard/add-crop',
    'समीक्षा': '/dashboard/reviews',
    'विश्वास': '/dashboard/reviews',
    'विवाद': '/dashboard/disputes',
    'समाधान': '/dashboard/disputes',
    'योजनाएं': '/dashboard/schemes',
    'सरकार': '/dashboard/schemes',
    'सलाह': '/dashboard/schemes',
    'प्रोफ़ाइल': '/dashboard/profile',
    'सेटिंग्स': '/dashboard/settings',
    'अधिसूचना': '/dashboard/notifications',

    // === TELUGU COMMANDS ===
    'డాష్బోర్డ్': '/dashboard',
    'హోమ్': '/dashboard',
    'పంట జాబితా': '/dashboard/marketplace',
    'మార్కెట్': '/dashboard/marketplace',
    'కొనుగోలు': '/dashboard/marketplace',
    'ధర': '/dashboard/insights',
    'అంచనా': '/dashboard/forecast',
    'డిమాండ్': '/dashboard/forecast',
    'నాణ్యత': '/dashboard/pricing',
    'చర్చలు': '/dashboard/negotiations',
    'వేలం': '/dashboard/negotiations',
    'ఆర్డర్లు': '/dashboard/orders',
    'లావాదేవీలు': '/dashboard/orders',
    'రవాణా': '/dashboard/orders',
    'అమ్మండి': '/dashboard/add-crop',
    'పంట జోడించండి': '/dashboard/add-crop',
    'సమీక్షలు': '/dashboard/reviews',
    'నమ్మకం': '/dashboard/reviews',
    'వివాదం': '/dashboard/disputes',
    'పరిష్కారం': '/dashboard/disputes',
    'పథకాలు': '/dashboard/schemes',
    'ప్రభుత్వం': '/dashboard/schemes',
    'సలహా': '/dashboard/schemes',
    'ప్రొఫైల్': '/dashboard/profile',
    'సెట్టింగులు': '/dashboard/settings',
    'నోటిఫికేషన్': '/dashboard/notifications',

    // === KANNADA COMMANDS ===
    'ಡ್ಯಾಶ್ಬೋರ್ಡ್': '/dashboard',
    'ಮುಖಪುಟ': '/dashboard',
    'ಬೆಳೆ ಪಟ್ಟಿ': '/dashboard/marketplace',
    'ಮಾರುಕಟ್ಟೆ': '/dashboard/marketplace',
    'ಖರೀದಿ': '/dashboard/marketplace',
    'ಬೆಲೆ': '/dashboard/insights',
    'ಮುನ್ಸೂಚನೆ': '/dashboard/forecast',
    'ಬೇಡಿಕೆ': '/dashboard/forecast',
    'ಗುಣಮಟ್ಟ': '/dashboard/pricing',
    'ಮಾತುಕತೆ': '/dashboard/negotiations',
    'ಹರಾಜು': '/dashboard/negotiations',
    'ಆದೇಶಗಳು': '/dashboard/orders',
    'ವಹಿವಾಟು': '/dashboard/orders',
    'ಸಾರಿಗೆ': '/dashboard/orders',
    'ಮಾರಾಟ': '/dashboard/add-crop',
    'ಬೆಳೆ ಸೇರಿಸಿ': '/dashboard/add-crop',
    'ವಿಮರ್ಶೆಗಳು': '/dashboard/reviews',
    'ನಂಬಿಕೆ': '/dashboard/reviews',
    'ವಿವಾದ': '/dashboard/disputes',
    'ಪರಿಹಾರ': '/dashboard/disputes',
    'ಯೋಜನೆಗಳು': '/dashboard/schemes',
    'ಸರ್ಕಾರ': '/dashboard/schemes',
    'ಸಲಹೆ': '/dashboard/schemes',
    'ಪ್ರೊಫೈಲ್': '/dashboard/profile',
    'ಸೆಟ್ಟಿಂಗ್ಗಳು': '/dashboard/settings',
    'ಅಧಿಸೂಚನೆ': '/dashboard/notifications',

    // === MALAYALAM COMMANDS ===
    'ഡാഷ്ബോർഡ്': '/dashboard',
    'ഹോം': '/dashboard',
    'വിള പട്ടിക': '/dashboard/marketplace',
    'മാർക്കറ്റ്': '/dashboard/marketplace',
    'വാങ്ങുക': '/dashboard/marketplace',
    'വില': '/dashboard/insights',
    'പ്രവചനം': '/dashboard/forecast',
    'ആവശ്യം': '/dashboard/forecast',
    'ഗുണനിലവാരം': '/dashboard/pricing',
    'ചർച്ച': '/dashboard/negotiations',
    'ലേലം': '/dashboard/negotiations',
    'ഓർഡറുകൾ': '/dashboard/orders',
    'ഇടപാട്': '/dashboard/orders',
    'ഗതാഗതം': '/dashboard/orders',
    'വിൽക്കുക': '/dashboard/add-crop',
    'വിള ചേർക്കുക': '/dashboard/add-crop',
    'അവലോകനങ്ങൾ': '/dashboard/reviews',
    'വിശ്വാസം': '/dashboard/reviews',
    'തർക്കം': '/dashboard/disputes',
    'പരിഹാരം': '/dashboard/disputes',
    'പദ്ധതികൾ': '/dashboard/schemes',
    'സർക്കാർ': '/dashboard/schemes',
    'ഉപദേശം': '/dashboard/schemes',
    'പ്രൊഫൈൽ': '/dashboard/profile',
    'ക്രമീകരണങ്ങൾ': '/dashboard/settings',
    'അറിയിപ്പ്': '/dashboard/notifications',
};

const useVoiceNavigation = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const { i18n } = useTranslation();

    // Auto-clear error after 3 seconds
    // Moved these effects to be unconditionally called to satisfy React Hooks rules.
    // They were already unconditional, but ensures stability.
    
    useEffect(() => {
        let timer;
        if (error) {
            timer = setTimeout(() => {
                setError(null);
            }, 3000);
        }
        return () => {
            if(timer) clearTimeout(timer);
        };
    }, [error]);

    useEffect(() => {
        let timer;
        if (transcript) {
            timer = setTimeout(() => {
                setTranscript('');
            }, 3000);
        }
        return () => {
            if(timer) clearTimeout(timer);
        };
    }, [transcript]);

    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const startListening = useCallback(() => {
        setError(null);

        if (!SpeechRecognition) {
            setError('Browser does not support Speech Recognition.');
            return;
        }

        const recognition = new SpeechRecognition();

        // Define language code mapping based on active i18n locale
        const determineLangCode = (locale) => {
            switch (locale) {
                case 'ta': return 'ta-IN';
                case 'hi': return 'hi-IN';
                case 'te': return 'te-IN';
                case 'kn': return 'kn-IN';
                case 'ml': return 'ml-IN';
                default: return 'en-US';
            }
        };

        recognition.lang = determineLangCode(i18n.language);
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
            setError(null);
        };

        recognition.onresult = async (event) => {
            const currentTranscript = event.results[0][0].transcript.toLowerCase().trim();
            setTranscript(currentTranscript);

            // Clean the transcript: remove punctuation and extra spaces
            const cleanTranscript = currentTranscript.replace(/[.,!?]/g, '').trim();

            let matchedRoute = null;

            // 1. Direct command match from routesMap
            const commandVariations = [
                cleanTranscript,
                cleanTranscript.replace(/^(go to|show me|open|navigate to|view) /, ''),
            ];

            for (const variation of commandVariations) {
                if (routesMap[variation]) {
                    matchedRoute = routesMap[variation];
                    break;
                }
                // Partial match check
                for (const [key, route] of Object.entries(routesMap)) {
                    if (variation === key || variation.includes(key)) {
                        matchedRoute = route;
                        break;
                    }
                }
                if (matchedRoute) break;
            }

            if (matchedRoute) {
                navigate(matchedRoute);
                return;
            }

            // 2. Dynamic Commands

            // Complex Command: "Change price of Rice to 50"
            // Matches: "change price of wheat to 25", "set quantity for corn to 100"
            const complexCropEditMatch = cleanTranscript.match(/(?:set|change|update|edit) (?:the )?(price|quantity|cost|amount) (?:of|for) (.+) (?:to|as) (.+)/);
            if (complexCropEditMatch) {
                const fieldRaw = complexCropEditMatch[1];
                const cropName = complexCropEditMatch[2];
                const value = complexCropEditMatch[3];
                
                let targetField = (fieldRaw === 'quantity' || fieldRaw === 'amount') ? 'quantity' : 'basePrice';

                try {
                    const myCrops = await cropService.getMyCrops();
                    const targetCrop = myCrops.find(c => c.name.toLowerCase().includes(cropName));
                    
                    if (targetCrop) {
                        // Store the action for the next page
                        sessionStorage.setItem('pendingVoiceAction', JSON.stringify({
                            type: 'fill-form',
                            field: targetField,
                            value: value,
                            timestamp: Date.now()
                        }));

                        navigate(`/dashboard/my-crops/edit/${targetCrop._id}`);
                        return;
                    } else {
                        setError(`Could not find crop "${cropName}" in your listings.`);
                        return;
                    }
                } catch (e) {
                    setError("Failed to access your crops.");
                    // Fallthrough to generic handler maybe? No, return.
                    return;
                }
            }

            // Generic "Set [Field] to [Value]" Handler
            // Matches: "set price to 500", "change name to rice", "update quantity to 100"
            const setFieldMatch = cleanTranscript.match(/(?:set|change|update|edit) (?:my )?(name|email|phone|state|district|village|address|language|price|cost|quantity|amount|variety|grade) (?:to|as) (.+)/);
            
            if (setFieldMatch) {
                const rawField = setFieldMatch[1];
                const value = setFieldMatch[2];
                let targetField = rawField;
                let scope = 'generic';

                // Map spoken fields to actual form fields
                const fieldMappings = {
                    // Profile fields
                    'name': 'fullName', // or 'name' for crop
                    'email': 'email',
                    'phone': 'phoneNumber',
                    'address': 'address',
                    'language': 'preferredLanguage',
                    
                    // Crop fields
                    'price': 'basePrice',
                    'cost': 'basePrice',
                    'quantity': 'quantity',
                    'amount': 'quantity',
                    'variety': 'variety',
                    'grade': 'qualityGrade',
                    
                    // Common Location fields
                    'state': 'state', // or location.state
                    'district': 'district', // or location.district
                    'village': 'village' // crop location
                };

                targetField = fieldMappings[rawField] || rawField;

                // Dispatch event for any active form to pick up
                const event = new CustomEvent('voice-fill-form', { 
                    detail: { field: targetField, value, rawField } 
                });
                window.dispatchEvent(event);
                
                // Also store in session storage
                sessionStorage.setItem('pendingVoiceAction', JSON.stringify({
                    type: 'fill-form',
                    field: targetField,
                    value: value,
                    timestamp: Date.now()
                }));

                // Smart Navigation for Profile Fields
                // If we are NOT on a form page, facilitate navigation to Profile for profile-related fields.
                const isFormPage = window.location.pathname.includes('/add-crop') || window.location.pathname.includes('/edit/');
                const isProfilePage = window.location.pathname.includes('/profile');

                if (!isFormPage && !isProfilePage) {
                    const profileFields = ['fullName', 'email', 'phoneNumber', 'address', 'preferredLanguage', 'state', 'district'];
                    if (profileFields.includes(targetField)) {
                        navigate('/dashboard/profile');
                    }
                }

                return;
            }

            // Regex for "Edit crop [name]" -> Navigates to edit page
            const editCropMatch = cleanTranscript.match(/edit (?:my )?(?:crop|listing) (.+)/);
            if (editCropMatch) {
                const cropName = editCropMatch[1];
                try {
                    const myCrops = await cropService.getMyCrops();
                    const targetCrop = myCrops.find(c => c.name.toLowerCase().includes(cropName));
                    if (targetCrop) {
                        navigate(`/dashboard/my-crops/edit/${targetCrop._id}`);
                        return;
                    } else {
                        setError(`Could not find crop "${cropName}" in your listings.`);
                        return;
                    }
                } catch (err) {
                    console.error(err);
                    setError("Failed to fetch your crops.");
                    return;
                }
            }
            
            // Regex for "Edit Profile" (Only if no specific field is mentioned)
            const plainEditProfile = cleanTranscript.match(/^(?:edit|update) profile$/);
            if (plainEditProfile || cleanTranscript === 'edit profile') {
                navigate('/dashboard/profile');
                return;
            }

            // Regex for "Open/Show [Crop Name] in Market"
            // Matches: "open wheat", "show rice details", "search for corn"
            const searchMatch = cleanTranscript.match(/(?:open|show|search|find) (.+)/);
            if (searchMatch) {
                const query = searchMatch[1].replace(/ (details|price|listing|in market)/g, '').trim();
                // Avoid capturing generic words if user just said "open market" which is handled above
                if (query.length > 2 && !['market', 'marketplace', 'dashboard'].includes(query)) {
                    // Try to find exact match first
                    try {
                        const crops = await cropService.getAllCrops({ name: query });
                        if (crops.length === 1) {
                            navigate(`/dashboard/marketplace/${crops[0]._id}`);
                            return;
                        } 
                    } catch (e) {
                        console.error("Voice search error", e);
                    }
                    
                    navigate(`/dashboard/marketplace?name=${encodeURIComponent(query)}`);
                    return;
                }
            }

            setError(`Command "${currentTranscript}" not recognized.`);
        };

        recognition.onerror = (event) => {
            if (event.error === 'no-speech' || event.error === 'aborted') {
                // Ignore empty speech or manual aborts
                setIsListening(false);
                return;
            }
            if (event.error === 'not-allowed') {
                setError('Microphone access denied.');
            } else {
                setError(`Recognition error: ${event.error}`);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (e) {
            console.error('Speech recognition error:', e);
            setIsListening(false);
        }
    }, [navigate, i18n.language]);

    const stopListening = useCallback(() => {
        setIsListening(false);
    }, []);

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
    };
};

export default useVoiceNavigation;
