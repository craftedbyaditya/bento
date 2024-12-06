import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '../../components/AppBar';
import { BiEdit, BiSave, BiX, BiChevronLeft, BiCopy, BiUser } from 'react-icons/bi';
import { useProject } from '../../hooks/useProject';

interface ProjectSettings {
  name: string;
  description: string;
  apiKeys: {
    dev: string;
    uat: string;
    prod: string;
  };
  webhookUrl: string;
  billing: {
    plan: 'Free' | 'Pro' | 'Enterprise';
    seats: number;
    usedSeats: number;
    billingCycle: 'monthly' | 'annual';
    nextBillingDate: string;
    amount: number;
  };
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [settings, setSettings] = useState<ProjectSettings>({
    name: 'Bento Dashboard',
    description: 'A comprehensive localization management platform',
    apiKeys: {
      dev: 'dev_key_xxxxxxxxxxxxx',
      uat: 'uat_key_xxxxxxxxxxxxx',
      prod: 'prod_key_xxxxxxxxxxxxx',
    },
    webhookUrl: 'https://api.example.com/webhook',
    billing: {
      plan: 'Pro',
      seats: 10,
      usedSeats: 7,
      billingCycle: 'annual',
      nextBillingDate: '2024-02-01',
      amount: 99,
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  const handleDeleteProject = () => {
    if (deleteConfirmText === settings.name) {
      // TODO: Implement project deletion
      navigate('/dashboard');
    }
  };

  const CopyableField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-500">{label}</label>
      <div className="flex items-center space-x-2">
        <div className="flex-1 font-mono text-sm bg-gray-50 p-2 rounded">
          {value}
        </div>
        <button
          onClick={() => handleCopy(value)}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <BiCopy className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar 
        projectName={currentProject?.project_name || 'Loading...'}
        isProjectSelectable={false}
      />
      
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="bg-white shadow rounded-lg">
            {/* Header with back button */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-600 hover:text-gray-900 flex items-center"
                  >
                    <BiChevronLeft className="h-6 w-6" />
                  </button>
              
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate('/settings/members')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <BiUser className="mr-2 h-5 w-5" />
                    Manage Members
                  </button>
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <BiSave className="mr-2 h-5 w-5" />
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <BiX className="mr-2 h-5 w-5" />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <BiEdit className="mr-2 h-5 w-5" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-6 space-y-8">
              {/* Basic Information */}
              <section className="pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project Name</label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={settings.description}
                        onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Project Name</label>
                      <div className="mt-1 text-sm text-gray-900">{settings.name}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Description</label>
                      <div className="mt-1 text-sm text-gray-900">{settings.description}</div>
                    </div>
                  </div>
                )}
              </section>

              <div className="border-t border-gray-100"></div>

              {/* API Keys */}
              <section className="py-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">API Keys</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(settings.apiKeys).map(([env, key]) => (
                    <CopyableField
                      key={env}
                      label={`${env.toUpperCase()} Environment`}
                      value={key}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <CopyableField
                    label="Webhook URL"
                    value={settings.webhookUrl}
                  />
                </div>
              </section>

              <div className="border-t border-gray-100"></div>

              {/* Billing */}
              <section className="py-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Billing</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {settings.billing.plan} Plan
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {settings.billing.billingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
                      </p>
                    </div>
                    <button
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Change plan
                    </button>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Seats</h5>
                      <p className="mt-1 text-sm text-gray-900">
                        {settings.billing.usedSeats} of {settings.billing.seats} seats used
                      </p>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(settings.billing.usedSeats / settings.billing.seats) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Next billing date</h5>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(settings.billing.nextBillingDate).toLocaleDateString()}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        ${settings.billing.amount}/{settings.billing.billingCycle === 'annual' ? 'year' : 'month'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-100"></div>

              {/* Delete Project */}
              <section className="pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Project</h3>
                <div className="bg-red-50 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-medium text-red-800">
                        Danger Zone
                      </h4>
                      <p className="mt-1 text-sm text-red-600">
                        Once you delete a project, there is no going back. Please be certain.
                      </p>
                    </div>
                    
                    {showDeleteConfirm ? (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-700">
                          To confirm deletion, please type <span className="font-medium">{settings.name}</span> below:
                        </p>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="Type project name to confirm"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        />
                        <div className="flex space-x-3">
                          <button
                            onClick={handleDeleteProject}
                            disabled={deleteConfirmText !== settings.name}
                            className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm
                              ${deleteConfirmText === settings.name 
                                ? 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                                : 'bg-red-300 cursor-not-allowed'}`}
                          >
                            Delete Project
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeleteConfirmText('');
                            }}
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Delete Project
                      </button>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
