import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BiSearch, BiTrash, BiDownload, BiDotsHorizontalRounded, BiFilterAlt, BiEditAlt, BiPlus } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import AppBar from '../../components/AppBar';
import { cacheInstance } from '../../utils/cache';
import { apiService } from '../../services/apiService';
import { useProject } from '../../hooks/useProject';
import { useLanguages } from '../../hooks/useLanguages';
import { ApiResponse, GetAllKeysResponse, Translation, Project, Language } from '../../types/api';
import { formatLocalDateTime } from '../../utils/dateUtils';

interface TableRow {
  id: string;
  key: string;
  english: string;
  updatedBy: string;
  modifiedAt: string;
  role: string;
  status: 'draft' | 'published' | 'archive';
  tag: string;
}

interface Filters {
  status: string[];
  role: string[];
  tag: string[];
  updatedBy: string[];
}

interface DashboardResponse {
  data: {
    translations: any[];
    projects: any[];
    notification_count: number;
    force_logout: boolean;
    under_maintenance: boolean;
    languages: string[];
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentProject, updateProject } = useProject();
  const { languages, updateLanguages } = useLanguages();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Separate states for temporary and applied filters
  const [tempFilters, setTempFilters] = useState<Filters>({
    status: [],
    role: [],
    tag: [],
    updatedBy: []
  });

  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    status: [],
    role: [],
    tag: [],
    updatedBy: []
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const userId = cacheInstance.get('user_id');
      const projectId = currentProject?.project_id || cacheInstance.get('project_id');

      if (!userId || !projectId) {
        console.error('Missing required values:', { userId, projectId });
        navigate('/login');
        return;
      }

      const response = await apiService.post<DashboardResponse>('/translations/v1/getAllKeys', {
        last_health_check_timestamp: Math.floor(Date.now() / 1000).toString()
      }, {
        headers: {
          'x-user-id': userId,
          'x-project-id': projectId.toString()
        }
      });

      const { 
        translations, 
        projects, 
        notification_count,
        force_logout,
        under_maintenance,
        languages: apiLanguages 
      } = response.data.data;

      // Handle force logout if needed
      if (force_logout) {
        cacheInstance.clear();
        navigate('/login', { replace: true });
        return;
      }

      setTranslations(translations);
      setProjects(projects);
      setNotificationCount(notification_count);
      
      // Handle project selection
      if (projects.length > 0 && !currentProject) {
        const cachedProjectId = cacheInstance.get('project_id');
        let projectToSelect;
        
        if (cachedProjectId) {
          // Try to find the cached project in the projects list
          projectToSelect = projects.find(p => p.project_id === cachedProjectId);
        }
        
        // If no cached project found or no cached ID exists, select the first project
        if (!projectToSelect) {
          projectToSelect = projects[0];
          cacheInstance.set('project_id', projectToSelect.project_id);
        }
        
        updateProject(projectToSelect);
      }
      
      // Process languages from API response
      if (Array.isArray(apiLanguages)) {
        try {
          const languageObjects = apiLanguages.reduce<Language[]>((acc, lang) => {
            if (lang !== null && typeof lang === 'object' && 'language_code' in lang && 'language_name' in lang) {
              acc.push(lang as Language);
            } else if (typeof lang === 'string' && lang.length === 2) {
              acc.push({
                language_code: lang,
                language_name: getLanguageName(lang)
              });
            }
            return acc;
          }, []);

          if (languageObjects.length > 0) {
            updateLanguages(languageObjects);
          }
        } catch (error) {
          console.error('Error processing languages:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (axios.isAxiosError(error)) {
        console.error('Server response:', error.response?.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentProject?.project_id]);

  const tableData: TableRow[] = translations.map((translation) => {
    console.log('Raw timestamp:', translation.last_updated_at);
    const formattedDate = formatLocalDateTime(translation.last_updated_at);
    console.log('Formatted date:', formattedDate);
    return {
      id: translation.key_id.toString(),
      key: translation.key,
      english: translation.english,
      updatedBy: translation.last_updated_by,
      modifiedAt: formattedDate,
      role: translation.last_updated_by_role,
      status: translation.status.toLowerCase() as 'draft' | 'published' | 'archive',
      tag: translation.tag
    };
  });

  const handleRowSelect = (rowId: string) => {
    setSelectedRows(prev =>
      prev.includes(rowId)
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }));
  };

  const handleApplyFilters = async () => {
    setIsLoading(true);
    setAppliedFilters(tempFilters);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Filters applied:', tempFilters);

    } catch (error) {
      console.error('Error fetching filtered data:', error);
    } finally {
      setIsLoading(false);
      setIsFilterDropdownOpen(false);
    }
  };

  const handleResetFilters = () => {
    setTempFilters({
      status: [],
      role: [],
      tag: [],
      updatedBy: []
    });
  };

  const getUniqueValues = (key: keyof TableRow) => {
    const values = new Set(tableData.map(row =>
      Array.isArray(row[key])
        ? (row[key] as string[]).map(v => v)
        : [row[key]]
    ).flat());
    return Array.from(values);
  };

  const filteredData = tableData.filter(row => {
    const matchesSearch = row.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.updatedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters = (
      (tempFilters.status.length === 0 || tempFilters.status.includes(row.status)) &&
      (tempFilters.role.length === 0 || tempFilters.role.includes(row.role)) &&
      (tempFilters.tag.length === 0 || tempFilters.tag.includes(row.tag)) &&
      (tempFilters.updatedBy.length === 0 || tempFilters.updatedBy.includes(row.updatedBy))
    );

    return matchesSearch && matchesFilters;
  });

  const handleEditRow = (rowId: string) => {
    console.log('Editing row:', rowId);
    setActiveActionMenu(null);
  };

  const handleDeleteRow = (rowId: string) => {
    console.log('Deleting row:', rowId);
    setActiveActionMenu(null);
  };

  const handleStatusChange = (rowId: string, newStatus: TableRow['status']) => {
    console.log('Changing status for row:', rowId, 'to:', newStatus);
    setActiveActionMenu(null);
  };

  const getAvailableStatuses = (currentStatus: TableRow['status']): TableRow['status'][] => {
    const allStatuses: TableRow['status'][] = ['draft', 'published', 'archive'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  // Helper function to get language names
  const getLanguageName = (code: string): string => {
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      // Add more mappings as needed
    };
    return languageNames[code] || code;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar
        projectName={currentProject?.project_name || 'Select Project'}
        isProjectSelectable={true}
        onProjectSelect={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
        notificationCount={notificationCount}
      />

      {isProjectDropdownOpen && (
        <div className="absolute z-10 mt-1 ml-6 w-56 bg-white border border-gray-200 rounded-md shadow-lg">
          {projects.map(project => (
            <div
              key={project.project_id}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                updateProject(project);
                cacheInstance.set('project_id', project.project_id);
                setIsProjectDropdownOpen(false);
              }}
            >
              {project.project_name}
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Table */}
        <div className="bg-white rounded-lg shadow w-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {/* Search Bar */}
            <div className="flex-1 flex items-center">
              <div className="w-96 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative ml-2">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <BiFilterAlt className="h-5 w-5 text-gray-400 mr-2" />
                  Filters
                  {Object.values(tempFilters).some(arr => arr.length > 0) && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {Object.values(tempFilters).reduce((acc, arr) => acc + arr.length, 0)}
                    </span>
                  )}
                </button>

                {isFilterDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                        <button
                          onClick={handleResetFilters}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Reset all
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                          <div className="space-y-2">
                            {getUniqueValues('status').map((status) => (
                              <label key={status} className="inline-flex items-center mr-4">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={tempFilters.status.includes(status)}
                                  onChange={() => handleFilterChange('status', status)}
                                />
                                <span className="ml-2 text-sm text-gray-700">{status}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Role</h4>
                          <div className="space-y-2">
                            {getUniqueValues('role').map((role) => (
                              <label key={role} className="inline-flex items-center mr-4">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={tempFilters.role.includes(role)}
                                  onChange={() => handleFilterChange('role', role)}
                                />
                                <span className="ml-2 text-sm text-gray-700">{role}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Tag</h4>
                          <div className="space-y-2">
                            {getUniqueValues('tag').map((tag) => (
                              <label key={tag} className="inline-flex items-center mr-4">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={tempFilters.tag.includes(tag)}
                                  onChange={() => handleFilterChange('tag', tag)}
                                />
                                <span className="ml-2 text-sm text-gray-700">{tag}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Updated By</h4>
                          <div className="space-y-2">
                            {getUniqueValues('updatedBy').map((user) => (
                              <label key={user} className="inline-flex items-center mr-4">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={tempFilters.updatedBy.includes(user)}
                                  onChange={() => handleFilterChange('updatedBy', user)}
                                />
                                <span className="ml-2 text-sm text-gray-700">{user}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setIsFilterDropdownOpen(false)}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleApplyFilters}
                          disabled={isLoading}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                          {isLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Applying...
                            </>
                          ) : (
                            'Apply Filters'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/add-key')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BiPlus className="mr-2 h-5 w-5" />
                Add New Key
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BiDownload className="mr-2 h-5 w-5" />
                Download
              </button>
              {selectedRows.length > 0 && (
                <button
                  onClick={() => console.log('Delete selected:', selectedRows)}
                  className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700"
                >
                  <BiTrash className="h-5 w-5 mr-1" />
                  Delete Selected
                </button>
              )}
            </div>
          </div>
          <table className="min-w-full">
            <thead>
              <tr>
                <th scope="col" className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={selectedRows.length === filteredData.length}
                    onChange={(e) => {
                      setSelectedRows(e.target.checked ? filteredData.map(row => row.id) : []);
                    }}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Key
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  English
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tag
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Updated By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Modified At
                </th>
                <th scope="col" className="w-20 px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredData.map((row) => (
                <tr
                  key={row.id}
                  className={`${selectedRows.includes(row.id)
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                    } transition-colors duration-150 ease-in-out cursor-pointer`}
                  onClick={(e) => {
                    // Prevent navigation if clicking on checkbox or action buttons
                    if (
                      (e.target as HTMLElement).closest('input[type="checkbox"]') ||
                      (e.target as HTMLElement).closest('button')
                    ) {
                      return;
                    }
                    navigate(`/key-details/${row.id}`);
                  }}
                >
                  <td className="px-6 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleRowSelect(row.id)}
                    />
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {row.key}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {row.english}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {row.role}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                      ${row.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                      ${row.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                      ${row.status === 'archive' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {row.tag}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                        {row.updatedBy.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {row.updatedBy}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(row.modifiedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(row.modifiedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-right">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          setActiveActionMenu(activeActionMenu === row.id ? null : row.id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <BiDotsHorizontalRounded className="h-5 w-5" />
                      </button>

                      {activeActionMenu === row.id && (
                        <div
                          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                          onMouseLeave={() => setActiveActionMenu(null)}
                        >
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => handleEditRow(row.id)}
                            >
                              <BiEditAlt className="mr-2 h-4 w-4" />
                              Edit
                            </button>
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={() => handleDeleteRow(row.id)}
                            >
                              <BiTrash className="mr-2 h-4 w-4" />
                              Delete
                            </button>

                            {getAvailableStatuses(row.status).length > 0 && (
                              <>
                                <div className="border-t border-gray-100 my-1"></div>
                                <div className="px-4 py-2 text-xs font-medium text-gray-500">
                                  Change Status
                                </div>
                                {getAvailableStatuses(row.status).map((status) => (
                                  <button
                                    key={status}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 capitalize"
                                    onClick={() => handleStatusChange(row.id, status)}
                                  >
                                    <span
                                      className={`mr-2 h-2 w-2 rounded-full ${status === 'draft' ? 'bg-yellow-400' :
                                        status === 'archive' ? 'bg-gray-400' : ''
                                         
                                        }`}
                                    />
                                    {status}
                                  </button>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
