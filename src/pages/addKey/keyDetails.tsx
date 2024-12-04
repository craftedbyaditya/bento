import React, { useEffect, useState } from 'react';
import { BiChevronLeft, BiFullscreen, BiExitFullscreen } from 'react-icons/bi';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import AppBar from '../../components/AppBar';
import { formatLocalDateTime } from '../../utils/dateUtils';

interface Translation {
  language_code: string;
  language_name: string;
  translation: string;
  status: string;
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

const KeyDetailsView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [keyDetails, setKeyDetails] = useState<KeyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

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
        setKeyDetails(response.data.data[0]);
      } catch (err) {
        setError('Failed to fetch key details');
      } finally {
        setLoading(false);
      }
    };

    fetchKeyDetails();
  }, [id]);

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
              {/* Back Button */}
              <div className="p-4">
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <BiChevronLeft className="w-6 h-6" />
                  <span className="text-sm font-medium">Back</span>
                </button>
              </div>

              {/* Key Details Section */}
              <div className="p-4">
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold mb-3">Key Details</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500">Key ID</div>
                        <div className="font-medium">{keyDetails.key_id}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Key</div>
                        <div className="font-medium">{keyDetails.key}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500">Tag</div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {keyDetails.tag}
                        </span>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Status</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                          ${keyDetails?.status?.toLowerCase().includes('publish') ? 'bg-green-100 text-green-800' : ''}
                          ${keyDetails?.status?.toLowerCase().includes('draft') ? 'bg-gray-100 text-gray-800' : ''}
                          ${keyDetails?.status?.toLowerCase().includes('archive') ? 'bg-yellow-100 text-yellow-800' : ''}`}
                        >
                          {keyDetails?.status || 'N/A'}
                        </span>
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
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
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
                              <div className="text-sm text-gray-900">
                                {translation.translation}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                ${translation?.status?.toLowerCase().includes('publish') ? 'bg-green-100 text-green-800' : ''}
                                ${translation?.status?.toLowerCase().includes('draft') ? 'bg-gray-100 text-gray-800' : ''}
                                ${translation?.status?.toLowerCase().includes('archive') ? 'bg-yellow-100 text-yellow-800' : ''}`}
                              >
                                {translation?.status || 'N/A'}
                              </span>
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
                      {formatLocalDateTime(keyDetails.created_at)}
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
                      {formatLocalDateTime(keyDetails.last_updated_at)}
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
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                            Status
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
                              <div className="text-sm text-gray-900">
                                {translation.translation}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                ${translation?.status?.toLowerCase().includes('publish') ? 'bg-green-100 text-green-800' : ''}
                                ${translation?.status?.toLowerCase().includes('draft') ? 'bg-gray-100 text-gray-800' : ''}
                                ${translation?.status?.toLowerCase().includes('archive') ? 'bg-yellow-100 text-yellow-800' : ''}`}
                              >
                                {translation?.status || 'N/A'}
                              </span>
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
