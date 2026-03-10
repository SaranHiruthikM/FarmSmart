import { useState, useEffect } from 'react';
import TranslationService from '../services/translation.service';
import { useTranslation } from 'react-i18next';

/**
 * Hook to translate dynamic content on the fly
 * @param {string} text - The text to translate
 * @param {string} sourceLang - The source language (default 'en')
 * @returns {string} - The translated text (or original while loading)
 */
export const useDynamicTranslation = (text, sourceLang = 'en') => {
  const { i18n } = useTranslation();
  
  // Try to get cached value immediately for initial state
  const getInitialState = () => {
    const cached = TranslationService.getCached(text, i18n.language, sourceLang);
    return cached || text; // Return cached if available, else original text
  };

  const [translatedText, setTranslatedText] = useState(getInitialState);
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // Update effect to handle language changes or text changes
  useEffect(() => {
    let isMounted = true;

    const translate = async () => {
      // 1. Check if language matches or text empty
      if (!text || i18n.language === sourceLang) {
        if (isMounted) setTranslatedText(text);
        return;
      }

      // 2. Check cache first (synchronous check again to be sure)
      const cached = TranslationService.getCached(text, i18n.language, sourceLang);
      if (cached) {
         if (isMounted) setTranslatedText(cached);
         return;
      }

      // 3. Perform async translation
      try {
        const result = await TranslationService.translate(text, i18n.language, sourceLang);
        if (isMounted) setTranslatedText(result);
      } catch (err) {
        if (isMounted) setTranslatedText(text);
      }
    };

    translate();

    return () => {
      isMounted = false;
    };
  }, [text, i18n.language, sourceLang]);

  return translatedText;
};

export default useDynamicTranslation;
