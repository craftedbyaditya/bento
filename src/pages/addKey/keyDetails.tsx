import React, { useEffect, useState } from 'react';
import { BiChevronLeft, BiFullscreen, BiExitFullscreen, BiPencil, BiCheck, BiX, BiChevronDown, BiPlus } from 'react-icons/bi';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import AppBar from '../../components/AppBar';
import TextField from '../../components/TextField';

interface Translation {
  language_code: string;
  language_name: string;
  translation: string;
}

interface KeyDetails {
  key_id: number;
  key: string;
  tag: string;
  status: string;
  last_updated_by: string;
  last_updated_by_role: string;
  last_updated_at: string;
  created_by: string;
  created_by_role: string;
  created_at: string;
  translations: Translation[];
}

const SAMPLE_TAGS = ['Production', 'Development', 'Staging', 'Testing', 'Documentation'];
const STATUS_VALUES = ['draft', 'published', 'archive'];

const KeyDetailsView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [keyDetails, setKeyDetails] = useState<KeyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<Partial<KeyDetails> | null>(null);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState(SAMPLE_TAGS);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    const fetchKeyDetails = async () => {
      try {
        const response = await axios.post(
          `http://localhost:3000/translations/v1/getKeyDetails/${id}`,
          {},
          {
            headers: {
              'x-project-id': '3',
              'x-user-id': '1',
            },
          }
        );
        const keyData = response.data.data[0];
        setKeyDetails(keyData);
        setEditedDetails(keyData); // Initialize editedDetails with the fetched data
      } catch (err) {
        setError('Failed to fetch key details');
      } finally {
        setLoading(false);
      }
    };

    fetchKeyDetails();
  }, [id]);

  const handleAddNewTag = () => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags(prev => [...prev, newTag]);
      setEditedDetails(prev => ({ ...prev, tag: newTag }));
      setNewTag('');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-600">{error}</div>
    </div>
  );

  if (!keyDetails) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">No data found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar projectName="Key Details" />
      
      <div className="px-6 py-6">
        <div className="flex gap-3">
          {/* Main Content Card (70%) */}
          <div className={`flex-[7] ${isFullScreen ? 'hidden' : ''}`}>
            {/* Key Details Card */}
            <div className="bg-white rounded-lg shadow-sm mb-3">
              {/* Back Button and Edit Button Row */}
              <div className="p-4 flex justify-between items-center border-b border-gray-200">
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <BiChevronLeft className="w-6 h-6" />
                  <span className="text-sm font-medium">Back</span>
                </button>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedDetails(null);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <BiX className="w-4 h-4 mr-1.5" />
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          // TODO: Implement save functionality
                          setIsEditing(false);
                          setEditedDetails(null);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                      >
                        <BiCheck className="w-4 h-4 mr-1.5" />
                        Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditedDetails(keyDetails);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <BiPencil className="w-4 h-4 mr-1.5" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Key Details Section */}
              <div className="p-4">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-3">Key Details</h2>
                  
                  {/* Key ID and Key row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Key ID
                      </label>
                      <div className="mt-1 text-sm text-gray-900">
                        {keyDetails.key_id}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Key
                      </label>
                      <div className="mt-1">
                        {isEditing ? (
                          <TextField
                            label=""
                            name="key"
                            value={editedDetails?.key || keyDetails.key}
                            onChange={(e) => setEditedDetails({ ...editedDetails, key: e.target.value })}
                            inputProps={{ maxLength: 30 }}
                          />
                        ) : (
                          <div className="text-sm text-gray-900">
                            {keyDetails.key}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tag and Status row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tag
                      </label>
                      <div className="relative">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                              className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <span className="block truncate">
                                {editedDetails ? editedDetails.tag : 'Select a tag'}
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
                                          editedDetails?.tag === tag ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                                        }`}
                                        onClick={() => {
                                          setEditedDetails(prev => ({ ...prev, tag }));
                                          setShowTagsDropdown(false);
                                          setNewTag('');
                                        }}
                                      >
                                        <span className="block truncate">{tag}</span>
                                        {editedDetails?.tag === tag && (
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
                          </>
                        ) : (
                          <div className="mt-1 text-sm text-gray-900">
                            {keyDetails.tag}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="relative">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                              className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <span className="block truncate capitalize">
                                {editedDetails?.status || keyDetails?.status || 'Select a status'}
                              </span>
                              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <BiChevronDown className="h-5 w-5 text-gray-400" />
                              </span>
                            </button>
                            {showStatusDropdown && (
                              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                {STATUS_VALUES.map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    className={`relative select-none w-full py-2 pl-3 pr-9 text-left hover:bg-gray-50 ${
                                      editedDetails?.status === status ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                                    }`}
                                    onClick={() => {
                                      setEditedDetails(prev => ({ ...prev, status }));
                                      setShowStatusDropdown(false);
                                    }}
                                  >
                                    <span className="block truncate capitalize">{status}</span>
                                    {editedDetails?.status === status && (
                                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="py-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                              ${(editedDetails?.status || keyDetails?.status) === 'published' ? 'bg-green-100 text-green-800' : ''}
                              ${(editedDetails?.status || keyDetails?.status) === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                              ${(editedDetails?.status || keyDetails?.status) === 'archive' ? 'bg-red-100 text-red-800' : ''}
                            `}>
                              {editedDetails?.status || keyDetails?.status || 'No status'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Translations Card */}
            {!isFullScreen && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-semibold">Translations</h2>
                    <button
                      onClick={() => setIsFullScreen(true)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <BiFullscreen className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="overflow-auto max-h-[400px]">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Language
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Translation
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {keyDetails.translations.map((translation) => (
                          <tr key={translation.language_code}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {translation.language_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {translation.language_code}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {isEditing ? (
                                <TextField
                                  label=""
                                  name={`translation-${translation.language_code}`}
                                  value={editedDetails?.translations?.find(t => t.language_code === translation.language_code)?.translation || translation.translation}
                                  onChange={(e) => {
                                    const updatedTranslations = [...(editedDetails?.translations || keyDetails.translations)];
                                    const index = updatedTranslations.findIndex(t => t.language_code === translation.language_code);
                                    updatedTranslations[index] = {
                                      ...updatedTranslations[index],
                                      translation: e.target.value,
                                      language_code: translation.language_code,
                                      language_name: translation.language_name
                                    };
                                    setEditedDetails({
                                      ...editedDetails,
                                      translations: updatedTranslations
                                    });
                                  }}
                                  inputProps={{ maxLength: 30 }}
                                />
                              ) : (
                                <div className="text-sm text-gray-900">
                                  {translation.translation}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Card (30%) - History Timeline */}
          <div className={`flex-[3] ${isFullScreen ? 'hidden' : ''}`}>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-xl font-semibold mb-3">History</h2>
              <div className="space-y-8">
                {/* Timeline for Creation */}
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="absolute left-1.5 top-6 h-full w-0.5 bg-gray-200"></div>
                  <div>
                    <div className="flex items-center text-sm">
                      <div className="font-medium text-gray-900">Created</div>
                      <div className="ml-2 text-gray-500">by {keyDetails.created_by}</div>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">{keyDetails.created_by_role}</div>
                    <div className="mt-1 text-xs text-gray-400">
                      {keyDetails.created_at}
                    </div>
                  </div>
                </div>

                {/* Timeline for Last Update */}
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="flex items-center text-sm">
                      <div className="font-medium text-gray-900">Last Updated</div>
                      <div className="ml-2 text-gray-500">by {keyDetails.last_updated_by}</div>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">{keyDetails.last_updated_by_role}</div>
                    <div className="mt-1 text-xs text-gray-400">
                      {keyDetails.last_updated_at}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fullscreen Translations Card */}
          {isFullScreen && (
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setIsFullScreen(false)}
                        className="text-gray-600 hover:text-gray-900 flex items-center"
                      >
                        <BiChevronLeft className="w-6 h-6" />
                        <span className="text-sm font-medium">Back</span>
                      </button>
                      <h2 className="text-xl font-semibold">Translations</h2>
                    </div>
                    <button
                      onClick={() => setIsFullScreen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <BiExitFullscreen className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="overflow-auto max-h-[calc(100vh-250px)]">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Language
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Translation
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {keyDetails.translations.map((translation) => (
                          <tr key={translation.language_code}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {translation.language_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {translation.language_code}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {isEditing ? (
                                <TextField
                                  label=""
                                  name={`translation-${translation.language_code}`}
                                  value={editedDetails?.translations?.find(t => t.language_code === translation.language_code)?.translation || translation.translation}
                                  onChange={(e) => {
                                    const updatedTranslations = [...(editedDetails?.translations || keyDetails.translations)];
                                    const index = updatedTranslations.findIndex(t => t.language_code === translation.language_code);
                                    updatedTranslations[index] = {
                                      ...updatedTranslations[index],
                                      translation: e.target.value,
                                      language_code: translation.language_code,
                                      language_name: translation.language_name
                                    };
                                    setEditedDetails({
                                      ...editedDetails,
                                      translations: updatedTranslations
                                    });
                                  }}
                                  inputProps={{ maxLength: 30 }}
                                />
                              ) : (
                                <div className="text-sm text-gray-900">
                                  {translation.translation}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeyDetailsView;
