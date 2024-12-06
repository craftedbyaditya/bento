import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiPlus, BiSearch, BiFilterAlt, BiDownload, BiRefresh, BiChevronLeft, BiCheck, BiChevronDown, BiTrash } from 'react-icons/bi';
import AppBar from '../../components/AppBar';
import { useProject } from '../../hooks/useProject';
import { apiService } from '../../services/apiService';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { cacheInstance } from '../../utils/cache';
import rolesData from '../../constants/roles.json';
import TextField from '../../components/TextField';
import Snackbar from '../../components/Snackbar';

// Define Role type based on the JSON data
type Role = typeof rolesData.roles[number]['name'];

// Get role names from JSON
const ROLES = rolesData.roles.map(role => role.name);

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending';
  joinedOn: string;
}

interface Filters {
  status: string[];
  role: string[];
}

interface SnackbarState {
  isOpen: boolean;
  message: string;
  type: 'success' | 'error';
}

interface Collaborator {
  name: string;
  email: string;
  joinedOn: string;
  role: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

const Members: React.FC = () => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [activeRoleDropdown, setActiveRoleDropdown] = useState<string | null>(null);
  const [tempFilters, setTempFilters] = useState<Filters>({
    status: [],
    role: []
  });
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    status: [],
    role: []
  });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const userId = cacheInstance.get('user_id');
        const projectId = currentProject?.project_id || cacheInstance.get('project_id');

        if (!userId || !projectId) {
          throw new Error('Missing required values');
        }

        const response = await apiService.get<ApiResponse<{ collaborators: { name: string; email: string; joinedOn: string; role: string; }[] }>>(`/setup/v1/collaborators/${projectId}`, {
          headers: {
            'x-user-id': userId,
            'Content-Type': 'application/json'
          }
        });

        console.log('Full API Response:', JSON.stringify(response, null, 2));
        console.log('Response data:', response.data);

        const apiResponse = response.data as ApiResponse<{ collaborators: { name: string; email: string; joinedOn: string; role: string; }[] }>;

        if (!apiResponse) {
          throw new Error('Failed to fetch members');
        }

        const collaborators = apiResponse.data.collaborators;
        
        if (collaborators && Array.isArray(collaborators)) {
          console.log('Processing collaborators:', collaborators);
          const formattedMembers: Member[] = collaborators.map((collaborator) => ({
            id: collaborator.email,
            name: collaborator.name,
            email: collaborator.email,
            role: collaborator.role,
            status: 'active',
            joinedOn: collaborator.joinedOn
          }));
          console.log('Formatted members:', formattedMembers);
          setMembers(formattedMembers);
        } else {
          console.error('Invalid response structure. Response:', response);
          console.error('Response.data:', response.data);
          console.error('Response.data.data:', response.data?.data);
          throw new Error('Invalid response structure from API');
        }
      } catch (err: any) {
        console.error('Error fetching members:', err);
        setError(err.message || 'Failed to fetch members');
        setSnackbar({
          isOpen: true,
          message: 'Failed to fetch members. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [currentProject]);

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Filters applied:', tempFilters);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setIsLoading(false);
      setIsFilterDropdownOpen(false);
    }
  };

  const handleResetFilters = () => {
    setTempFilters({
      status: [],
      role: []
    });
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters = (
      (tempFilters.status.length === 0 || tempFilters.status.includes(member.status)) &&
      (tempFilters.role.length === 0 || tempFilters.role.includes(member.role))
    );

    return matchesSearch && matchesFilters;
  });

  const handleInvite = async (email: string, role: Role) => {
    setIsLoading(true);
    try {
      const userId = cacheInstance.get('user_id');
      const projectId = currentProject?.project_id || cacheInstance.get('project_id');

      const response = await apiService.post<ApiResponse<{
        projectId: number;
        userId: number;
        email: string;
        roleId: number;
        roleName: string;
        status: string;
        isNewCollaborator: boolean;
      }>>('/setup/v1/addCollaborator', {
        projectId,
        email,
        roleName: role
      });

      const apiResponse = response.data;

      if (!apiResponse) {
        throw new Error('Failed to add collaborator');
      }

      // Update local state based on whether it's a new collaborator or role update
      if (apiResponse.data.isNewCollaborator) {
        // Add new member to the list
        setMembers(prevMembers => [...prevMembers, {
          id: email,
          name: email.split('@')[0], // Temporary name until user accepts invitation
          email: email,
          role: apiResponse.data.roleName,
          status: 'pending',
          joinedOn: new Date().toISOString()
        }]);

        setSnackbar({
          isOpen: true,
          message: `Invitation sent to ${email}`,
          type: 'success'
        });
      } else {
        // Update existing member's role
        setMembers(prevMembers =>
          prevMembers.map(m =>
            m.email === email
              ? { ...m, role: apiResponse.data.roleName }
              : m
          )
        );

        setSnackbar({
          isOpen: true,
          message: `Role updated for ${email}`,
          type: 'success'
        });
      }

      setShowInviteModal(false);
    } catch (error: any) {
      console.error('Error adding/updating collaborator:', error);
      let errorMessage = 'Failed to add/update collaborator';
      
      // Check for specific 404 "User not found" error
      if (error.response?.status === 404 && error.response?.data?.message === 'User not found') {
        errorMessage = 'This user does not exist. Please check the email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        isOpen: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (member: Member, newRole: Role) => {
    try {
      const userId = cacheInstance.get('user_id');
      const projectId = currentProject?.project_id || cacheInstance.get('project_id');

      const response = await apiService.post<ApiResponse<{
        projectId: number;
        userId: number;
        email: string;
        roleId: number;
        roleName: string;
        status: string;
        isNewCollaborator: boolean;
      }>>('/setup/v1/addCollaborator', {
        projectId,
        email: member.email,
        roleName: newRole
      });

      const apiResponse = response.data;

      if (!apiResponse) {
        throw new Error('Failed to update role');
      }

      // Update local state
      setMembers(prevMembers =>
        prevMembers.map(m =>
          m.email === member.email
            ? { ...m, role: apiResponse.data.roleName }
            : m
        )
      );

      setSnackbar({
        isOpen: true,
        message: `Role updated successfully for ${member.name}`,
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error updating role:', error);
      setSnackbar({
        isOpen: true,
        message: `Failed to update role: ${error.message}`,
        type: 'error'
      });
    } finally {
      setActiveRoleDropdown(null);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    // TODO: Implement remove functionality
    setShowRemoveModal(false);
  };

  const handleResendInvite = (memberId: string) => {
    // TODO: Implement resend invite functionality
    console.log('Resending invite to member:', memberId);
  };

  const handleDownloadExcel = () => {
    const data = members.map(member => ({
      Name: member.name,
      Email: member.email,
      Role: member.role,
      Status: member.status,
      'Joined Date': format(new Date(member.joinedOn), 'MMM d, yyyy')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, 'members.xlsx');
  };

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({
      isOpen: true,
      message,
      type
    });
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email).then(
      () => showSnackbar('Email copied to clipboard', 'success'),
      () => showSnackbar('Failed to copy email', 'error')
    );
  };

  const InviteModal: React.FC<{ onClose: () => void; handleInvite: (email: string, role: Role) => Promise<void> }> = ({ onClose, handleInvite }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('Member');
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInviteClick = async () => {
      if (!email) return;
      await handleInvite(email, role);
    };

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-xl font-semibold mb-4">Invite New Member</h2>

          <div className="space-y-4">
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <button
                type="button"
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              >
                <span className="flex items-center justify-between">
                  <span>{role}</span>
                  <BiChevronDown className="h-5 w-5 text-gray-400" />
                </span>
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md">
                  {ROLES.map((r) => (
                    <div
                      key={r}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setRole(r);
                        setIsRoleDropdownOpen(false);
                      }}
                    >
                      {r}
                      {role === r && <BiCheck className="h-5 w-5 text-blue-500" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleInviteClick}
              disabled={!email || isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(!email || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Invite'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const RemoveModal: React.FC<{ member: Member; onClose: () => void }> = ({ member, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleRemove = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Add success notification
        // toast({
        //   title: "Member removed",
        //   description: `${member.name} has been removed from the team`,
        //   status: "success",
        //   duration: 3000,
        // });
        onClose();
      } catch (error) {
        console.error('Error removing member:', error);
        // toast({
        //   title: "Error removing member",
        //   description: "Please try again later",
        //   status: "error",
        //   duration: 3000,
        // });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-xl font-semibold mb-4">Remove Member</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to remove {member.name}? This action cannot be undone.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleRemove}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Removing...
                </>
              ) : (
                'Remove Member'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const MemberRow: React.FC<{ member: Member }> = ({ member }) => {
    return (
      <div className="flex items-center py-3 px-6 hover:bg-gray-50">
        <div className="w-1/4">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-900">{member.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              {member.email}
            </div>
          </div>
        </div>

        <div className="w-1/4 text-sm text-gray-500">
          Joined {format(new Date(member.joinedOn), 'MMM d, yyyy')}
        </div>

        <div className="flex items-center justify-end gap-4 w-1/2">
          <div className="relative min-w-[120px]">
            <button
              onClick={() => setActiveRoleDropdown(activeRoleDropdown === member.id ? null : member.id)}
              className="w-full inline-flex items-center justify-between px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
            >
              {member.role}
              <BiChevronDown className="ml-2 h-5 w-5 text-gray-400" />
            </button>

            {activeRoleDropdown === member.id && (
              <div className="absolute right-0 mt-1 w-full bg-white rounded-md shadow-lg z-10">
                {ROLES.map((role) => (
                  <div
                    key={role}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                    onClick={() => handleRoleChange(member, role)}
                  >
                    {role}
                    {member.role === role && <BiCheck className="h-5 w-5 text-blue-500" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setSelectedMember(member);
                setShowRemoveModal(true);
              }}
              className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
              title="Remove member"
            >
              <BiTrash className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar
        projectName={currentProject?.project_name || 'Loading...'}
        isProjectSelectable={false}
      />

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Members Table */}
        <div className="bg-white rounded-lg shadow w-full">
          {/* Header */}
          <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <BiChevronLeft className="h-6 w-6" />
            </button>
          </div>

          {/* Search and Actions Bar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {/* Search and Filter */}
            <div className="flex-1 flex items-center">
              <div className="w-96 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search members..."
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
                            {['active', 'pending'].map((status) => (
                              <label key={status} className="inline-flex items-center mr-4">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={tempFilters.status.includes(status)}
                                  onChange={() => handleFilterChange('status', status)}
                                />
                                <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Role</h4>
                          <div className="space-y-2">
                            {ROLES.map((role) => (
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
                onClick={handleDownloadExcel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BiDownload className="mr-2 h-5 w-5" />
                Download List
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BiPlus className="mr-2 h-5 w-5" />
                Add Member
              </button>
            </div>
          </div>

          {/* Member List */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <BiRefresh className="w-5 h-5 mr-2" />
                  Retry
                </button>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No members found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map(member => (
                    <MemberRow key={member.id} member={member} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} handleInvite={handleInvite} />}
      {showRemoveModal && selectedMember && (
        <RemoveModal
          member={selectedMember}
          onClose={() => {
            setShowRemoveModal(false);
            setSelectedMember(null);
          }}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default Members;