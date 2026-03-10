import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: "en", label: "English", icon: "🇬🇧" },
    { code: "hi", label: "हिन्दी (Hindi)", icon: "🇮🇳" },
    { code: "ta", label: "தமிழ் (Tamil)", icon: "🇮🇳" },
    { code: "te", label: "తెలుగు (Telugu)", icon: "🇮🇳" },
    { code: "kn", label: "ಕನ್ನಡ (Kannada)", icon: "🇮🇳" },
    { code: "ml", label: "മലയാളം (Malayalam)", icon: "🇮🇳" },
  ];

  const currentLang = languages.find(l => l.code === i18n?.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 hover:bg-black/5 rounded-xl transition-colors outline-none"
      >
        <div className="p-1.5 bg-nature-100/50 rounded-lg text-nature-700">
           <Globe className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <span className="hidden md:block text-sm font-bold text-gray-700">
            {currentLang.label.split(' ')[0]}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-xl overflow-hidden z-50 origin-top-right"
          >
            <div className="p-1 max-h-60 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    currentLang.code === lang.code
                      ? "bg-nature-50 text-nature-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.icon}</span>
                    <span className="truncate">{lang.label.split(' ')[0]}</span>
                  </span>
                  {currentLang.code === lang.code && <Check className="w-3 h-3 text-nature-600" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LanguageSelector;
