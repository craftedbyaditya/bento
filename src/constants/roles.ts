import rolesData from './roles.json';

export interface Role {
  id: string;
  name: string;
  description: string;
}

export const roles: Role[] = rolesData.roles;

export type RoleName = Role['name'];

// Helper function to get role by ID
export const getRoleById = (id: string): Role | undefined => {
  return roles.find(role => role.id === id);
};

// Helper function to get role by name
export const getRoleByName = (name: string): Role | undefined => {
  return roles.find(role => role.name === name);
};

// Export role names as a readonly array
export const ROLE_NAMES = roles.map(role => role.name) as readonly string[];
