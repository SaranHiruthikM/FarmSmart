import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';

/**
 * Component to render text that is automatically translated
 * @param {string} text - The text to translate
 * @param {string} className - CSS classes
 * @param {string} as - Element type (p, span, div, h1, etc.)
 * @param {string} contextPrefix - Optional i18n key prefix to check first (e.g. "dynamic.crops")
 */
const DynamicText = ({ text, className = "", as: Component = "span", contextPrefix }) => {
  const { t, i18n } = useTranslation();
  
  // 1. Check static dictionary first if prefix provided
  let staticTranslation = null;
  if (contextPrefix && text) {
    const key = `${contextPrefix}.${text.toLowerCase()}`;
    if (i18n.exists(key)) {
      staticTranslation = t(key);
    }
  }

  // 2. Use hook for dynamic translation (only if static missing)
  const translated = useDynamicTranslation(staticTranslation ? "" : text, 'en');

  // Final text to display
  const displayText = staticTranslation || translated || text;

  return (
    <Component className={className}>
      {displayText}
    </Component>
  );
};

export default DynamicText;
