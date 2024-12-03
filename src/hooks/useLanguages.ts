import { useState, useEffect } from 'react';
import { Language } from '../types/api';
import { cacheInstance } from '../utils/cache';

const CACHE_KEY = 'supported_languages';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const useLanguages = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get languages from cache first
    const cachedLanguages = cacheInstance.get(CACHE_KEY);
    if (cachedLanguages) {
      setLanguages(cachedLanguages);
      setLoading(false);
      return;
    }
  }, []);

  const updateLanguages = (newLanguages: Language[]) => {
    // Don't update if the new languages array is empty
    if (!newLanguages?.length) {
      return;
    }

    // Merge new languages with existing ones, using language_code as unique identifier
    setLanguages(prevLanguages => {
      const mergedLanguages = [...prevLanguages];
      
      newLanguages.forEach(newLang => {
        const existingIndex = mergedLanguages.findIndex(
          lang => lang.language_code === newLang.language_code
        );
        
        if (existingIndex >= 0) {
          // Update existing language
          mergedLanguages[existingIndex] = newLang;
        } else {
          // Add new language
          mergedLanguages.push(newLang);
        }
      });

      // Sort languages by name for consistency
      mergedLanguages.sort((a, b) => 
        a.language_name.localeCompare(b.language_name)
      );

      // Update cache with merged languages
      cacheInstance.set(CACHE_KEY, mergedLanguages, CACHE_TTL);
      
      return mergedLanguages;
    });

    setLoading(false);
  };

  return {
    languages,
    updateLanguages,
    loading
  };
};
