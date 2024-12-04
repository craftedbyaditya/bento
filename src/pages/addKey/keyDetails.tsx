import React, { useEffect, useState } from 'react';
import { BiChevronLeft } from 'react-icons/bi';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import AppBar from '../../components/AppBar';
import { formatLocalDateTime } from '../../utils/dateUtils';

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

const KeyDetailsView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [keyDetails, setKeyDetails] = useState<KeyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <BiChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-6">Key Details</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Key ID</div>
                  <div className="font-medium">{keyDetails.key_id}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Key</div>
                  <div className="font-medium">{keyDetails.key}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Tag</div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {keyDetails.tag}
                  </span>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    keyDetails.status === 'Published' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {keyDetails.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-6">History</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Created By</div>
                  <div className="font-medium">{keyDetails.created_by}</div>
                  <div className="text-sm text-gray-500">{keyDetails.created_by_role}</div>
                  <div className="text-xs text-gray-400">
                    {formatLocalDateTime(keyDetails.created_at)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Last Updated By</div>
                  <div className="font-medium">{keyDetails.last_updated_by}</div>
                  <div className="text-sm text-gray-500">{keyDetails.last_updated_by_role}</div>
                  <div className="text-xs text-gray-400">
                    {formatLocalDateTime(keyDetails.last_updated_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Translations</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
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
                      <div className="text-sm text-gray-900">
                        {translation.translation}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyDetailsView;
