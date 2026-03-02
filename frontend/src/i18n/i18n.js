import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        login: "Login",
        register: "Register",
        voice: {
          listening: "Listening...",
          prompt: "Speak a page name...",
          recognized: "Recognized",
          error: "Microphone access denied or error."
        }
      },
    },
    ta: {
      translation: {
        login: "உள்நுழை",
        register: "பதிவு",
        voice: {
          listening: "கவனிப்பதாக...",
          prompt: "பக்கத்தின் பெயரை கூறவும்...",
          recognized: "அங்கீகரிக்கப்பட்டது",
          error: "ஒலிவாங்கி அணுகல் மறுக்கப்பட்டது அல்லது பிழை."
        }
      },
    },
    hi: {
      translation: {
        voice: {
          listening: "सुन रहा है...",
          prompt: "पृष्ठ का नाम बोलें...",
          recognized: "पहचाना गया",
          error: "माइक्रोफ़ोन पहुंच अस्वीकृत या त्रुटि।"
        }
      }
    },
    te: {
      translation: {
        voice: {
          listening: "వింటూ ఉంది...",
          prompt: "పేజీ పేరు చెప్పండి...",
          recognized: "గుర్తించారు",
          error: "మైక్రోఫోన్ యాక్సెస్ తిరస్కరించబడింది లేదా లోపం."
        }
      }
    },
    kn: {
      translation: {
        voice: {
          listening: "ಆಲಿಸುತ್ತಿದೆ...",
          prompt: "ಪುಟದ ಹೆಸರನ್ನು ಹೇಳಿ...",
          recognized: "ಗುರುತಿಸಲಾಗಿದೆ",
          error: "ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶ ನಿರಾಕರಿಸಲಾಗಿದೆ ಅಥವಾ ದೋಷ."
        }
      }
    },
    ml: {
      translation: {
        voice: {
          listening: "കേൾക്കുന്നു...",
          prompt: "പേജിന്റെ പേര് പറയുക...",
          recognized: "തിരിച്ചറിഞ്ഞു",
          error: "മൈക്രോഫോൺ ആക്സസ് നിരസിച്ചു അല്ലെങ്കിൽ പിശക്."
        }
      }
    },
  },
  lng: "en",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
