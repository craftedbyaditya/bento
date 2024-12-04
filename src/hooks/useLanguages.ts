import { useState, useEffect } from 'react';
import { Language } from '../types/api';
import { cacheInstance } from '../utils/cache';

const CACHE_KEY = 'supported_languages';

export const useLanguages = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get languages from cache first
    const cachedLanguages = cacheInstance.get(CACHE_KEY);
    if (Array.isArray(cachedLanguages)) {
      setLanguages(cachedLanguages);
    }
    setLoading(false);
  }, []);

  const updateLanguages = (newLanguages: Language[]) => {
    if (!Array.isArray(newLanguages)) {
      return;
    }

    // Simply replace the languages with the new ones from API
    setLanguages(newLanguages);
    // Update cache
    cacheInstance.set(CACHE_KEY, newLanguages);
  };

  const getCachedLanguages = (): Language[] => {
    const cachedLanguages = cacheInstance.get(CACHE_KEY);
    return Array.isArray(cachedLanguages) ? cachedLanguages : [];
  };

  return {
    languages,
    loading,
    updateLanguages,
    getCachedLanguages
  };
};
