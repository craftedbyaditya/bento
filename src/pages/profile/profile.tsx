import React, { useState, ChangeEvent } from 'react';
import TextField from '../../components/TextField';
import Button from '../../components/Button';

interface Project {
  project_id: number;
  project_name: string;
  role_id: number;
  role_name: string;
}

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  projects: Project[];
}

const Profile: React.FC = () => {
  // Mock data - replace with actual API call
  const [profile, setProfile] = useState<UserProfile>({
    id: 1,
    firstName: "Aditya",
    lastName: "R",
    email: "adityaranaworks@gmail.com",
    imageUrl: "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
    projects: [
      {
        project_id: 3,
        project_name: "Refactored Project",
        role_id: 1,
        role_name: "Admin"
      }
    ]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Add API call to save profile changes
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 w-auto"
              >
                Edit Profile
              </Button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <img
                  src={profile.imageUrl}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                />
                {isEditing && (
                  <button
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
                    title="Change profile picture"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Details Section */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label="First Name"
                  name="firstName"
                  value={isEditing ? editedProfile.firstName : profile.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your first name"
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={isEditing ? editedProfile.lastName : profile.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your last name"
                />
              </div>

              <TextField
                label="Email"
                name="email"
                type="email"
                value={isEditing ? editedProfile.email : profile.email}
                onChange={handleChange}
                disabled={true} // Email should not be editable
                placeholder="Enter your email"
              />

              {/* Projects Section */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Projects</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  {profile.projects.map((project) => (
                    <div
                      key={project.project_id}
                      className="flex justify-between items-center py-3 px-4 bg-white rounded-lg mb-2 last:mb-0 shadow-sm"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {project.project_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Role: {project.role_name}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-4 mt-8">
                  <Button
                    onClick={handleCancel}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 w-auto px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="w-auto px-6"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
