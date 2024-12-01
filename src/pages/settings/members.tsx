import React, { useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '../../components/AppBar';
import TextField from '../../components/TextField';
import Snackbar from '../../components/Snackbar';
import { BiChevronLeft, BiSearch, BiTrash, BiRefresh, BiChevronDown, BiFilterAlt, BiPlus, BiCheck, BiCopy, BiDownload } from 'react-icons/bi';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

const enum Role {
  Admin = 'Admin',
  Member = 'Member'
}

const enum Status {
  Active = 'active',
  Pending = 'pending'
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joinedAt: string;
}

interface Filters {
  status: Status[];
  role: Role[];
}

interface SnackbarState {
  isOpen: boolean;
  message: string;
  type: 'success' | 'error';
}

interface State {
  filters: Filters;
  isFilterDropdownOpen: boolean;
  activeRoleDropdown: string | null;
  showInviteModal: boolean;
  showRemoveModal: boolean;
  selectedMember: Member | null;
  isLoading: boolean;
  snackbar: SnackbarState;
}

type Action =
  | { type: 'SET_FILTER'; filterType: keyof Filters; value: Status | Role }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_FILTER_DROPDOWN'; isOpen: boolean }
  | { type: 'SET_ACTIVE_ROLE_DROPDOWN'; role: string | null }
  | { type: 'SET_INVITE_MODAL'; show: boolean }
  | { type: 'SET_REMOVE_MODAL'; show: boolean }
  | { type: 'SET_SELECTED_MEMBER'; member: Member | null }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_SNACKBAR'; snackbar: SnackbarState };

const initialState: State = {
  filters: {
    status: [],
    role: []
  },
  isFilterDropdownOpen: false,
  activeRoleDropdown: null,
  showInviteModal: false,
  showRemoveModal: false,
  selectedMember: null,
  isLoading: false,
  snackbar: {
    isOpen: false,
    message: '',
    type: 'success'
  }
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILTER':
      const currentValues = state.filters[action.filterType];
      const newValues = currentValues.includes(action.value as any)
        ? currentValues.filter(v => v !== action.value)
        : [...currentValues, action.value as any];
      
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.filterType]: newValues
        }
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters
      };
    
    case 'SET_FILTER_DROPDOWN':
      return {
        ...state,
        isFilterDropdownOpen: action.isOpen
      };
    
    case 'SET_ACTIVE_ROLE_DROPDOWN':
      return {
        ...state,
        activeRoleDropdown: action.role
      };
    
    case 'SET_INVITE_MODAL':
      return {
        ...state,
        showInviteModal: action.show
      };
    
    case 'SET_REMOVE_MODAL':
      return {
        ...state,
        showRemoveModal: action.show
      };
    
    case 'SET_SELECTED_MEMBER':
      return {
        ...state,
        selectedMember: action.member
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading
      };
    
    case 'SET_SNACKBAR':
      return {
        ...state,
        snackbar: action.snackbar
      };
    
    default:
      return state;
  }
}

const Members: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [state, dispatch] = useReducer(reducer, initialState);

  const [members] = useState<Member[]>([
    { id: '1', name: 'Ray Clarke', email: 'ray.c@acme.com', role: Role.Admin, status: Status.Active, joinedAt: '2023-01-15' },
    { id: '2', name: 'Jessica Taylor', email: 'jessica.t@acme.com', role: Role.Admin, status: Status.Active, joinedAt: '2023-02-20' },
    { id: '3', name: 'Nathan Foster', email: 'nathan.f@acme.com', role: Role.Member, status: Status.Pending, joinedAt: '2023-03-10' },
  ]);

  const handleFilterChange = async (filterType: keyof Filters, value: Status | Role): Promise<void> => {
    dispatch({ type: 'SET_FILTER', filterType, value });
    
    try {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      dispatch({
        type: 'SET_SNACKBAR',
        snackbar: {
          isOpen: true,
          message: 'Error applying filters. Please try again.',
          type: 'error'
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
      dispatch({ type: 'SET_FILTER_DROPDOWN', isOpen: false });
    }
  };

  const handleResetFilters = (): void => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters = (
      (state.filters.status.length === 0 || state.filters.status.includes(member.status)) &&
      (state.filters.role.length === 0 || state.filters.role.includes(member.role))
    );

    return matchesSearch && matchesFilters;
  });

  const handleInvite = (email: string, role: Role) => {
    // TODO: Implement invite functionality
    dispatch({ type: 'SET_INVITE_MODAL', show: false });
  };

  const handleChangeRole = (memberId: string, newRole: Role) => {
    // TODO: Implement role change functionality
    // dispatch({ type: 'SET_CHANGE_ROLE_MODAL', show: false });
  };

  const handleRemoveMember = (memberId: string) => {
    // TODO: Implement remove functionality
    dispatch({ type: 'SET_REMOVE_MODAL', show: false });
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
      'Joined Date': format(new Date(member.joinedAt), 'MMM d, yyyy')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, 'members.xlsx');
  };

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    dispatch({
      type: 'SET_SNACKBAR',
      snackbar: {
        isOpen: true,
        message,
        type
      }
    });
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email).then(
      () => showSnackbar('Email copied to clipboard', 'success'),
      () => showSnackbar('Failed to copy email', 'error')
    );
  };

  const InviteModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>(Role.Member);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInvite = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Add success notification
        // toast({
        //   title: "Invitation sent!",
        //   description: `An invitation has been sent to ${email}`,
        //   status: "success",
        //   duration: 3000,
        // });
        onClose();
      } catch (error) {
        console.error('Error sending invite:', error);
        // toast({
        //   title: "Error sending invitation",
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
                  {[Role.Admin, Role.Member].map((r) => (
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
              onClick={handleInvite}
              disabled={!email || isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (!email || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
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
              className={`px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
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
    const [isResending, setIsResending] = useState(false);

    const handleResendInvite = async () => {
      setIsResending(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        showSnackbar(`Invitation resent to ${member.email}`, 'success');
      } catch (error) {
        console.error('Error resending invite:', error);
        showSnackbar('Failed to resend invitation', 'error');
      } finally {
        setIsResending(false);
      }
    };

    return (
      <div className="flex items-center justify-between py-3 hover:bg-gray-50">
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">{member.name}</div>
              <div className="text-sm text-gray-500 flex items-center">
                {member.email}
                <button
                  onClick={() => handleCopyEmail(member.email)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                  title="Copy email"
                >
                  <BiCopy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {member.status === Status.Pending && (
            <button
              onClick={handleResendInvite}
              disabled={isResending}
              className={`p-2 rounded-full hover:bg-gray-100 ${isResending ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Resend invitation"
            >
              <BiRefresh className={`h-5 w-5 text-gray-400 ${isResending ? 'animate-spin' : ''}`} />
            </button>
          )}

          {member.status === Status.Pending ? (
            <div className="text-sm text-gray-500">
              Invitation sent {format(new Date(member.joinedAt), 'MMM d, yyyy')}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => dispatch({ type: 'SET_ACTIVE_ROLE_DROPDOWN', role: state.activeRoleDropdown === member.id ? null : member.id })}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {member.role}
              <BiChevronDown className="ml-2 h-5 w-5 text-gray-400" />
            </button>

            {state.activeRoleDropdown === member.id && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10">
                {[Role.Admin, Role.Member].map((role) => (
                  <div
                    key={role}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      // Handle role change
                      dispatch({ type: 'SET_ACTIVE_ROLE_DROPDOWN', role: null });
                    }}
                  >
                    {role}
                    {member.role === role && <BiCheck className="h-5 w-5 text-blue-500" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              dispatch({ type: 'SET_SELECTED_MEMBER', member });
              dispatch({ type: 'SET_REMOVE_MODAL', show: true });
            }}
            className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
            title="Remove member"
          >
            <BiTrash className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar projectName={''} />
      
      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Members Table */}
        <div className="bg-white rounded-lg shadow w-full">
          {/* Header */}
          <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <BiChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Members ({filteredMembers.length})</h1>
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
                  onClick={() => dispatch({ type: 'SET_FILTER_DROPDOWN', isOpen: !state.isFilterDropdownOpen })}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <BiFilterAlt className="h-5 w-5 text-gray-400 mr-2" />
                  Filters
                  {Object.values(state.filters).some(arr => arr.length > 0) && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {Object.values(state.filters).reduce((acc, arr) => acc + arr.length, 0)}
                    </span>
                  )}
                </button>

                {state.isFilterDropdownOpen && (
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
                            {[Status.Active, Status.Pending].map((status) => (
                              <label key={status} className="inline-flex items-center mr-4">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={state.filters.status.includes(status)}
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
                            {[Role.Admin, Role.Member].map((role) => (
                              <label key={role} className="inline-flex items-center mr-4">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={state.filters.role.includes(role)}
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
                          onClick={() => dispatch({ type: 'SET_FILTER_DROPDOWN', isOpen: false })}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleFilterChange}
                          disabled={state.isLoading}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            state.isLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {state.isLoading ? (
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
                onClick={() => dispatch({ type: 'SET_INVITE_MODAL', show: true })}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BiPlus className="mr-2 h-5 w-5" />
                Add Member
              </button>
            </div>
          </div>

          {/* Member List */}
          <div className="px-6 py-4">
            {filteredMembers.map(member => (
              <MemberRow key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {state.showInviteModal && <InviteModal onClose={() => dispatch({ type: 'SET_INVITE_MODAL', show: false })} />}
      {state.showRemoveModal && state.selectedMember && (
        <RemoveModal
          member={state.selectedMember}
          onClose={() => {
            dispatch({ type: 'SET_REMOVE_MODAL', show: false });
            dispatch({ type: 'SET_SELECTED_MEMBER', member: null });
          }}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        isOpen={state.snackbar.isOpen}
        message={state.snackbar.message}
        type={state.snackbar.type}
        onClose={() => dispatch({ type: 'SET_SNACKBAR', snackbar: { ...state.snackbar, isOpen: false } })}
      />
    </div>
  );
};

export default Members;
