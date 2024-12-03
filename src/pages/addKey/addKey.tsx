import React, { useState, useMemo } from 'react';
import { BiPlus, BiSearch, BiX, BiChevronLeft, BiChevronDown } from 'react-icons/bi';
import { RiMagicFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../hooks/useProject';
import { useLanguages } from '../../hooks/useLanguages';
import TextField from '../../components/TextField';
import AppBar from '../../components/AppBar';

interface Language {
  language_code: string;
  language_name: string;
}

interface FormData {
  key: string;
  tag: string;
  translations: {
    [key: string]: string;
  };
}

const SAMPLE_TAGS = ['Production', 'Development', 'Staging', 'Testing', 'Documentation'];

const AddKey: React.FC = () => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const { languages } = useLanguages();
  const [formData, setFormData] = useState<FormData>({
    key: '',
    tag: '',
    translations: {
      en: ''
    }
  });

  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [tempSelectedLanguages, setTempSelectedLanguages] = useState<string[]>(['en']);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [availableTags, setAvailableTags] = useState(SAMPLE_TAGS);
  const [searchQuery, setSearchQuery] = useState('');

  const [isTranslating, setIsTranslating] = useState(false);

  const filteredLanguages = useMemo(() => {
    return languages.filter(lang => 
      lang.language_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedLanguages.includes(lang.language_code)
    );
  }, [searchQuery, selectedLanguages, languages]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('translation_')) {
      const language = field.replace('translation_', '');
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [language]: value
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
    const newTranslations = { ...formData.translations };
    
    // Add new languages
    tempSelectedLanguages.forEach(langCode => {
      if (!formData.translations[langCode]) {
        newTranslations[langCode] = '';
      }
    });
    
    // Remove unselected languages
    Object.keys(formData.translations).forEach(langCode => {
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

          <form className="p-8 space-y-10">
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
                              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
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
                  <button
                    type="button"
                    onClick={() => {
                      setTempSelectedLanguages(selectedLanguages);
                      setShowLanguageSelector(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <BiPlus className="h-4 w-4 mr-2" />
                    Add Language
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {selectedLanguages.map((langCode) => (
                  <div key={langCode} className="flex items-center space-x-2 bg-gray-100 rounded-md px-3 py-1">
                    <span className="text-sm">
                      {`${langCode === 'en' ? 'English *' : languages.find(l => l.language_code === langCode)?.language_name || ''}`}
                    </span>
                    {langCode !== 'en' && (
                      <button
                        onClick={() => setSelectedLanguages(prev => prev.filter(code => code !== langCode))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <BiX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Language Selector Modal */}
            {showLanguageSelector && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Add Languages</h3>
                      <button
                        type="button"
                        onClick={() => setShowLanguageSelector(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <BiX className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BiSearch className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search languages..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 gap-4">
                      {filteredLanguages.map((language) => (
                        <div
                          key={language.language_code}
                          className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${
                            tempSelectedLanguages.includes(language.language_code)
                              ? 'bg-gray-50'
                              : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            checked={tempSelectedLanguages.includes(language.language_code)}
                            onChange={() => handleLanguageSelect(language)}
                          />
                          <label className="ml-3">
                            <span className="block text-sm font-medium text-gray-700">
                              {language.language_name}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowLanguageSelector(false)}
                      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyLanguages}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  // Add draft saving logic here
                  console.log('Saving as draft:', formData);
                }}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (!formData.translations.en) {
                    alert('English translation is required');
                    return;
                  }
                  // Add publish logic here
                  console.log('Publishing:', formData);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save and Publish
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddKey;
