import { useState, useEffect } from 'react';
import { Language } from '../types/api';
import { cacheInstance } from '../utils/cache';

const CACHE_KEY = 'supported_languages';

// Clear existing cache to force refresh with new language codes
cacheInstance.remove(CACHE_KEY);

export const useLanguages = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get languages from cache first
    const cachedLanguages = cacheInstance.get(CACHE_KEY);
    if (Array.isArray(cachedLanguages)) {
      // Ensure language codes are in the new format
      const updatedLanguages = cachedLanguages.map(lang => ({
        ...lang,
        language_code: lang.language_code.split('-')[0] // Convert 'hi-IN' to 'hi'
      }));
      setLanguages(updatedLanguages);
      // Update cache with new format
      cacheInstance.set(CACHE_KEY, updatedLanguages);
    }
    setLoading(false);
  }, []);

  const updateLanguages = (newLanguages: Language[]) => {
    if (!Array.isArray(newLanguages)) {
      return;
    }

    // Ensure new languages use the simple code format
    const updatedLanguages = newLanguages.map(lang => ({
      ...lang,
      language_code: lang.language_code.split('-')[0] // Convert any remaining 'hi-IN' to 'hi'
    }));

    // Update state and cache with new format
    setLanguages(updatedLanguages);
    cacheInstance.set(CACHE_KEY, updatedLanguages);
  };

  const getCachedLanguages = (): Language[] => {
    const cachedLanguages = cacheInstance.get(CACHE_KEY);
    return Array.isArray(cachedLanguages) ? cachedLanguages.map(lang => ({
      ...lang,
      language_code: lang.language_code.split('-')[0] // Ensure consistent format
    })) : [];
  };

  return {
    languages,
    loading,
    updateLanguages,
    getCachedLanguages
  };
};
