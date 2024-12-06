import React, { useEffect, useState } from 'react';
import { BiChevronLeft, BiFullscreen, BiExitFullscreen, BiPencil, BiCheck, BiX, BiChevronDown, BiPlus } from 'react-icons/bi';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import AppBar from '../../components/AppBar';
import TextField from '../../components/TextField';
import { useProject } from '../../hooks/useProject';

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
  project_id: number;
}

const SAMPLE_TAGS = ['Production', 'Development', 'Staging', 'Testing', 'Documentation'];
const STATUS_VALUES = ['draft', 'published', 'archive'];

const KeyDetailsView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentProject } = useProject();
  const [keyDetails, setKeyDetails] = useState<KeyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<Partial<KeyDetails>>({
    key: '',
    tag: '',
    status: '',
    translations: []
  });
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState(SAMPLE_TAGS);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);

  // Update these to match your actual values
  const PROJECT_ID = '17';
  const USER_ID = '14';

  useEffect(() => {
    const fetchKeyDetails = async () => {
      try {
        const response = await axios.post(
          `http://localhost:3000/translations/v1/getKeyDetails/${id}`,
          {},
          {
            headers: {
              'x-project-id': PROJECT_ID,
              'x-user-id': USER_ID,
            },
          }
        );
        
        console.log('Fetch response:', response.data);
        
        if (!response.data.data || response.data.data.length === 0) {
          throw new Error('No key details found');
        }

        const keyData = response.data.data[0];
        setKeyDetails(keyData);
        setEditedDetails({
          key: keyData.key,
          tag: keyData.tag,
          status: keyData.status,
          translations: keyData.translations
        });
        
        // Store the project ID from the successful fetch
        setProjectId(keyData.project_id?.toString() || PROJECT_ID);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch key details';
        setError(errorMessage);
        console.error('Error fetching key details:', {
          error: err,
          response: err.response?.data,
          status: err.response?.status
        });
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
      <AppBar 
        projectName={currentProject?.project_name || 'Loading...'}
        isProjectSelectable={false}
      />
      
      <div className="px-6 py-6">
        <div className="flex gap-3">
          {/* Main Content Card (70%) */}
          <div className={`flex-[7] ${isFullScreen ? 'hidden' : ''}`}>
            {/* Key Details Card */}
            <div className="bg-white rounded-lg shadow-sm mb-3">
              {/* Back Button and Edit Button Row */}
              <div className="p-4 flex justify-between items-center border-b border-gray-200">
                <div className="flex items-center">
                  <button
                    onClick={() => navigate(-1)}
                    className="text-gray-600 hover:text-gray-900 flex items-center"
                  >
                    <BiChevronLeft className="w-6 h-6" />
                  </button>
        
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedDetails({
                            key: '',
                            tag: '',
                            status: '',
                            translations: []
                          });
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <BiX className="w-4 h-4 mr-1.5" />
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            if (!keyDetails) {
                              throw new Error('No key details available');
                            }

                            // Debug logs for current state
                            console.log('Current key details:', {
                              keyId: keyDetails.key_id,
                              currentKey: keyDetails.key,
                              editedKey: editedDetails?.key,
                              projectId: PROJECT_ID
                            });

                            // Validate required fields
                            if (!editedDetails?.key?.trim()) {
                              setError('Key name is required');
                              return;
                            }

                            if (!editedDetails?.tag?.trim()) {
                              setError('Tag is required');
                              return;
                            }

                            if (!editedDetails?.status) {
                              setError('Status is required');
                              return;
                            }

                            const updatedTranslations = (keyDetails.translations || [])
                              .filter(t => t.translation !== null) // Remove null translations
                              .map(t => ({
                                language_code: t.language_code,
                                translation_text: t.translation || '' // Convert null to empty string
                              }));

                            // Format status to match the expected case
                            const status = (editedDetails?.status || keyDetails.status || '')
                              .charAt(0).toUpperCase() + 
                              (editedDetails?.status || keyDetails.status || '').slice(1).toLowerCase();

                            const requestPayload = {
                              key_id: Number(keyDetails.key_id),
                              key: editedDetails?.key?.trim() || keyDetails.key,
                              tag: editedDetails?.tag?.trim() || keyDetails.tag,
                              status: status, // Using properly cased status
                              translations: updatedTranslations,
                              project_id: Number(PROJECT_ID) // Add project_id to payload
                            };
                            
                            // Debug logs for request
                            console.log('Update request details:', {
                              url: 'http://localhost:3000/translations/v1/updateKey',
                              headers: {
                                'x-project-id': PROJECT_ID,
                                'x-user-id': USER_ID,
                                'Content-Type': 'application/json'
                              },
                              payload: requestPayload
                            });

                            // First verify the key exists
                            const verifyResponse = await axios.post(
                              `http://localhost:3000/translations/v1/getKeyDetails/${keyDetails.key_id}`,
                              {},
                              {
                                headers: {
                                  'x-project-id': PROJECT_ID,
                                  'x-user-id': USER_ID,
                                }
                              }
                            );

                            if (!verifyResponse.data.data || verifyResponse.data.data.length === 0) {
                              throw new Error('Key not found in the specified project');
                            }

                            const response = await axios.put(
                              'http://localhost:3000/translations/v1/updateKey',
                              requestPayload,
                              {
                                headers: {
                                  'x-project-id': PROJECT_ID,
                                  'x-user-id': USER_ID,
                                  'Content-Type': 'application/json'
                                }
                              }
                            );

                            // Log successful response
                            console.log('API Response:', response.data);

                            if (response.data && response.data.data) {
                              // Update the keyDetails state with the new response format
                              const updatedKeyDetails: KeyDetails = {
                                key_id: response.data.data.id,
                                project_id: response.data.data.project_id,
                                key: response.data.data.key,
                                tag: response.data.data.tag,
                                status: response.data.data.status,
                                last_updated_by: response.data.data.last_updated_by.full_name,
                                last_updated_by_role: '',
                                last_updated_at: response.data.data.updated_at,
                                created_by: response.data.data.created_by.full_name,
                                created_by_role: '',
                                created_at: response.data.data.created_at,
                                translations: keyDetails.translations.map(t => ({
                                  ...t,
                                  translation: t.translation || '' // Ensure no null translations
                                }))
                              };

                              setKeyDetails(updatedKeyDetails);
                              setIsEditing(false);
                              setEditedDetails({
                                key: '',
                                tag: '',
                                status: '',
                                translations: []
                              });
                              setError(null);
                            } else {
                              throw new Error('Invalid response format from server');
                            }
                          } catch (err: any) {
                            // Enhanced error logging
                            console.error('Error updating key:', {
                              error: err,
                              response: err.response?.data,
                              status: err.response?.status,
                              headers: err.response?.headers,
                              requestConfig: err.config
                            });

                            const errorMessage = err.response?.data?.message 
                              || err.message 
                              || 'Failed to update key details';
                            setError(errorMessage);
                          }
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
                        setEditedDetails({
                          key: keyDetails.key,
                          tag: keyDetails.tag,
                          status: keyDetails.status,
                          translations: keyDetails.translations
                        });
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
                            value={String(editedDetails?.key || keyDetails?.key || '')}
                            onChange={(e) => setEditedDetails(prev => ({ ...prev, key: e.target.value }))}
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
                                {editedDetails?.tag || keyDetails?.tag || 'Select a tag'}
                              </span>
                              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <BiChevronDown className="h-5 w-5 text-gray-400" />
                              </span>
                            </button>

                            {showTagsDropdown && (
                              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                {availableTags.map((tag) => (
                                  <div
                                    key={tag}
                                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 ${
                                      editedDetails?.tag === tag ? 'bg-gray-50' : ''
                                    }`}
                                    onClick={() => {
                                      setEditedDetails(prev => ({ ...prev, tag }));
                                      setShowTagsDropdown(false);
                                    }}
                                  >
                                    <span className="block truncate">{tag}</span>
                                  </div>
                                ))}
                                <div className="relative">
                                  <div className="flex items-center px-3 py-2 border-t border-gray-100">
                                    <input
                                      type="text"
                                      value={newTag}
                                      onChange={(e) => setNewTag(e.target.value)}
                                      placeholder="Add new tag"
                                      className="flex-1 text-sm border-0 focus:ring-0 p-0"
                                    />
                                    <button
                                      onClick={handleAddNewTag}
                                      className="ml-2 p-1 text-gray-400 hover:text-gray-500"
                                    >
                                      <BiPlus className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-gray-900">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {keyDetails.tag}
                            </span>
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
                                  <div
                                    key={status}
                                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 ${
                                      editedDetails?.status === status ? 'bg-gray-50' : ''
                                    }`}
                                    onClick={() => {
                                      setEditedDetails(prev => ({ ...prev, status }));
                                      setShowStatusDropdown(false);
                                    }}
                                  >
                                    <span className="block truncate capitalize">{status}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                              ${keyDetails.status.toLowerCase() === 'published' ? 'bg-green-100 text-green-800' : ''}
                              ${keyDetails.status.toLowerCase() === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                              ${keyDetails.status.toLowerCase() === 'archive' ? 'bg-red-100 text-red-800' : ''}
                            `}>
                              {keyDetails.status}
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
                                  value={String(editedDetails?.translations?.find(t => t.language_code === translation.language_code)?.translation || translation.translation)}
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
                                  value={String(editedDetails?.translations?.find(t => t.language_code === translation.language_code)?.translation || translation.translation)}
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
