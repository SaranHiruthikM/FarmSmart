const TranslationService = {
  // Cache to store translations and minimize API calls
  cache: new Map(),

  /**
   * Synchronously get cached translation if available
   */
  getCached(text, targetLang, sourceLang = 'en') {
    if (!text) return "";
    if (targetLang === sourceLang) return text;

    const cacheKey = `${sourceLang}_${targetLang}_${text}`;
    
    // Check memory cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Check localStorage cache
    const localCache = localStorage.getItem('translation_cache');
    const localMap = localCache ? JSON.parse(localCache) : {};
    if (localMap[cacheKey]) {
      this.cache.set(cacheKey, localMap[cacheKey]);
      return localMap[cacheKey];
    }
    
    return null;
  },

  /**
   * Translates text using a free API (MyMemory or Google Translate Unofficial)
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language code (e.g., 'ta', 'hi')
   * @param {string} sourceLang - Source language code (default 'en')
   * @returns {Promise<string>} - Translated text
   */
  async translate(text, targetLang, sourceLang = 'en') {
    if (!text) return "";
    if (targetLang === sourceLang) return text;

    // specific cache key
    const cacheKey = `${sourceLang}_${targetLang}_${text}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Check localStorage cache
    const localCache = localStorage.getItem('translation_cache');
    const localMap = localCache ? JSON.parse(localCache) : {};
    if (localMap[cacheKey]) {
      this.cache.set(cacheKey, localMap[cacheKey]);
      return localMap[cacheKey];
    }

    try {
      // Simplified MyMemory API Call - no pair splitting
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );
      
      const data = await response.json();
      
      if (data.responseStatus === 200 || data.responseStatus === '200') {
         // MyMemory sometimes returns matches
        const translatedText = data.responseData.translatedText;
        
        // Update caches
        this.cache.set(cacheKey, translatedText);
        localMap[cacheKey] = translatedText;
        localStorage.setItem('translation_cache', JSON.stringify(localMap));
        
        return translatedText;
      } else {
        console.warn("Translation API warning:", data.responseDetails);
        // Retry logic or fallback could go here
        return text; 
      }
    } catch (error) {
       console.error("Primary translation failed, trying backup...", error);
       return this.translateBackup(text, targetLang, sourceLang);
    }
  },

  /**
   * Backup translation using Google Translate unofficial API
   */
  async translateBackup(text, targetLang, sourceLang) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      return data[0][0][0];
    } catch (err) {
      console.error("Backup translation failed:", err);
      return text;
    }
  },

  /**
   * Batch translate an array of texts
   */
  async translateBatch(texts, targetLang, sourceLang = 'en') {
    return Promise.all(texts.map(text => this.translate(text, targetLang, sourceLang)));
  }
};

export default TranslationService;
