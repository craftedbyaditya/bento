import React, { useState, useMemo, useEffect } from 'react';
import { BiPlus, BiSearch, BiChevronLeft, BiChevronDown } from 'react-icons/bi';
import { RiMagicFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../hooks/useProject';
import { useLanguages } from '../../hooks/useLanguages';
import TextField from '../../components/TextField';
import AppBar from '../../components/AppBar';
import { apiService } from '../../services/apiService';
import { AddKeyRequest, AddKeyResponse, ApiResponse } from '../../types/api';
import { formatLocalDateTime } from '../../utils/dateUtils';

interface Language {
  language_code: string;
  language_name: string;
}

interface FormData {
  key: string;
  tag: string;
  english: string;
  translations: {
    [key: string]: string;
  };
}

const SAMPLE_TAGS = ['Production', 'Development', 'Staging', 'Testing', 'Documentation'];

const AddKey: React.FC = () => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const { languages, getCachedLanguages } = useLanguages();
  
  // Initialize translations with cached languages
  const cachedLanguages = getCachedLanguages();
  const initialTranslations: { [key: string]: string } = {
    en: '' // Always include English
  };
  cachedLanguages.forEach(lang => {
    initialTranslations[lang.language_code] = '';
  });

  const [formData, setFormData] = useState<FormData>({
    key: '',
    tag: '',
    english: '',
    translations: initialTranslations
  });

  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    'en',
    ...cachedLanguages.map(lang => lang.language_code)
  ]);
  const [tempSelectedLanguages, setTempSelectedLanguages] = useState<string[]>([
    'en',
    ...cachedLanguages.map(lang => lang.language_code)
  ]);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [availableTags, setAvailableTags] = useState(SAMPLE_TAGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLanguageDisplayName = (langCode: string): string => {
    const lang = languages.find(l => l.language_code === langCode);
    if (!lang || typeof lang.language_name !== 'string') {
      return langCode;
    }
    return lang.language_name;
  };

  const filteredLanguages = useMemo(() => {
    if (!Array.isArray(languages)) return [];
    
    return languages.filter(lang => {
      if (!lang || typeof lang.language_code !== 'string') return false;
      
      const displayName = getLanguageDisplayName(lang.language_code);
      const searchLower = searchQuery.toLowerCase();
      
      return displayName.toLowerCase().includes(searchLower) &&
        !selectedLanguages.includes(lang.language_code);
    });
  }, [searchQuery, selectedLanguages, languages]);

  useEffect(() => {
    // Update selected languages when languages are loaded
    const cachedLanguages = getCachedLanguages();
    if (cachedLanguages.length > 0) {
      const languageCodes = ['en', ...cachedLanguages.map(lang => lang.language_code)];
      setSelectedLanguages(languageCodes);
      setTempSelectedLanguages(languageCodes);
      
      // Update translations object with new languages
      const newTranslations = { ...formData.translations };
      languageCodes.forEach(code => {
        if (!newTranslations[code]) {
          newTranslations[code] = '';
        }
      });
      setFormData(prev => ({
        ...prev,
        translations: newTranslations
      }));
    }
  }, [languages]);

  const handleInputChange = (field: string, value: string) => {
    if (field === 'english') {
      setFormData(prev => ({
        ...prev,
        english: value
      }));
    } else if (field.startsWith('translation_')) {
      const langCode = field.replace('translation_', '');
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [langCode]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleLanguageSelect = (language: Language) => {
    setTempSelectedLanguages(prev => 
      prev.includes(language.language_code)
        ? prev.filter(code => code !== language.language_code)
        : [...prev, language.language_code]
    );
  };

  const handleApplyLanguages = () => {
    setSelectedLanguages(tempSelectedLanguages);
    
    // Add new languages to translations object
    const newTranslations = { ...formData.translations };
    tempSelectedLanguages.forEach(langCode => {
      if (!newTranslations[langCode] && langCode !== 'en') {
        newTranslations[langCode] = '';
      }
    });
    
    // Remove unselected languages
    Object.keys(newTranslations).forEach(langCode => {
      if (!tempSelectedLanguages.includes(langCode) && langCode !== 'en') {
        delete newTranslations[langCode];
      }
    });
    
    setFormData(prev => ({
      ...prev,
      translations: newTranslations
    }));
    
    setShowLanguageSelector(false);
  };

  const handleAddNewTag = () => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags(prev => [...prev, newTag]);
      setFormData(prev => ({ ...prev, tag: newTag }));
      setNewTag('');
      setShowNewTagInput(false);
    }
  };

  const handleBatchTranslate = async () => {
    setIsTranslating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const englishText = formData.translations.en;
      const newTranslations = { ...formData.translations };
      
      selectedLanguages.forEach(langCode => {
        if (langCode !== 'en') {
          newTranslations[langCode] = `AI Translated: ${englishText} (${langCode})`;
        }
      });

      setFormData(prev => ({
        ...prev,
        translations: newTranslations
      }));
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (data: typeof formData & { status: 'Draft' | 'Published' }) => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate required fields
      if (!data.key || !data.english) {
        throw new Error('Key and English translation are required');
      }

      // Check authentication
      if (!apiService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Prepare translations array
      const translations = Object.entries(data.translations)
        .filter(([code]) => code !== 'en' && selectedLanguages.includes(code))
        .map(([code, translation]) => {
          const lang = languages.find(l => l.language_code === code);
          return {
            language_code: code,
            language_name: lang?.language_name || code,
            translation
          };
        });

      const requestData: AddKeyRequest = {
        key: data.key.trim(),
        tag: data.tag?.trim() || 'default',
        english: data.english.trim(),
        status: data.status,
        translations
      };

      const axiosResponse = await apiService.post<ApiResponse<AddKeyResponse>>('/translations/v1/addKey', requestData);
      const response = axiosResponse.data;
      console.log('API Response:', {
        ...response.data,
        created_at: formatLocalDateTime(response.data.created_at),
        updated_at: formatLocalDateTime(response.data.updated_at)
      });
      // Navigate back to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create key';
      console.error('Error in handleSubmit:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar 
        projectName={currentProject?.project_name || 'Select Project'} 
        isProjectSelectable={false}
      />
      <div className="w-screen px-4 py-8">
      <div className="bg-white rounded-lg shadow w-full">
          <div className="px-8 py-5 border-b border-gray-200">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <BiChevronLeft className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">Add New Key</h2>
            </div>
          </div>

          <form onSubmit={(e) => handleSubmit({ ...formData, status: 'Draft' })} className="p-8 space-y-10">
            {/* Section 1: Key and Tag */}
            <div className="space-y-8">
              <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <TextField
                    label="Key *"
                    name="key"
                    value={formData.key}
                    onChange={(e) => handleInputChange('key', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                      className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <span className="block truncate">
                        {formData.tag || 'Select a tag'}
                      </span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <BiChevronDown className="h-5 w-5 text-gray-400" />
                      </span>
                    </button>

                    {showTagsDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        <div className="sticky top-0 z-10 bg-white px-2 py-1.5">
                          <div className="relative">
                            <input
                              type="text"
                              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm sm:leading-6"
                              placeholder="Search tags..."
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="pt-1">
                          {availableTags
                            .filter(tag => tag.toLowerCase().includes(newTag.toLowerCase()))
                            .map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                className={`relative select-none w-full py-2 pl-3 pr-9 text-left hover:bg-gray-50 ${
                                  formData.tag === tag ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                                }`}
                                onClick={() => {
                                  handleInputChange('tag', tag);
                                  setShowTagsDropdown(false);
                                  setNewTag('');
                                }}
                              >
                                <span className="block truncate">{tag}</span>
                                {formData.tag === tag && (
                                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
                              </button>
                            ))}
                          
                          {newTag && !availableTags.includes(newTag) && (
                            <button
                              type="button"
                              className="relative select-none w-full py-2 pl-3 pr-9 text-left text-blue-600 hover:bg-gray-50"
                              onClick={() => {
                                handleAddNewTag();
                                setShowTagsDropdown(false);
                              }}
                            >
                              <span className="flex items-center">
                                <BiPlus className="mr-2 h-4 w-4" />
                                Add "{newTag}"
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Translations */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wider">Translations</h3>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleBatchTranslate}
                    disabled={isTranslating || !formData.translations.en}
                    className={`group relative inline-flex items-center px-4 py-2 border border-purple-300 shadow-sm text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                      isTranslating ? 'animate-pulse' : ''
                    }`}
                  >
                    <RiMagicFill className={`h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12 ${
                      isTranslating ? 'animate-spin' : ''
                    }`} />
                    <span className="relative">
                      <span className="relative z-10">Batch AI Translate</span>
                      <span className="absolute inset-0 z-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-200 rounded"></span>
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* English Translation Field */}
                <div className="relative">
                  <TextField
                    label="English Translation *"
                    name="english"
                    value={formData.english}
                    onChange={(e) => handleInputChange('english', e.target.value)}
                  />
                </div>

                {/* Other Language Translation Fields */}
                {selectedLanguages
                  .filter(langCode => langCode !== 'en')
                  .map((langCode) => (
                    <div key={langCode} className="relative">
                      <TextField
                        label={`${getLanguageDisplayName(langCode)} Translation`}
                        name={`translation_${langCode}`}
                        value={formData.translations[langCode] || ''}
                        onChange={(e) => handleInputChange(`translation_${langCode}`, e.target.value)}
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit({ ...formData, status: 'Draft' })}
                disabled={isLoading || !formData.key || !formData.english}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit({ ...formData, status: 'Published' })}
                disabled={isLoading || !formData.key || !formData.english}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Publishing...' : 'Save and Publish'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddKey;
