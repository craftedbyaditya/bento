import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { cacheInstance } from '../../utils/cache';

interface ProjectSetupForm {
  name: string;
  description: string;
}

const ProjectSetup: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectSetupForm>({
    name: '',
    description: ''
  });
  const [error, setError] = useState<string>('');

  // Get user data from cache
  const userData = cacheInstance.get('user_data');
  const userName = userData?.data?.firstName || 'there';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Add API call to create project
      // For now, just navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              👋 Welcome, {userName}!
            </h1>
            <p className="text-gray-600">
              Let's get started by creating your first project
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <TextField
                label="Project Name"
                type="text"
                name="projectName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div>
              <TextField
                label="Project Description (Optional)"
                type="text"
                name="projectDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Project...' : 'Create Project'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectSetup;
