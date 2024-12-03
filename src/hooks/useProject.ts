import { useState, useEffect } from 'react';
import { cacheInstance } from '../utils/cache';

interface Project {
  project_id: number;
  project_name: string;
  role_id: number;
  role_name: string;
}

export function useProject() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    // Get cached project data
    const projectId = cacheInstance.get('project_id');
    const projectData = cacheInstance.get('project_data');
    
    if (projectId && projectData) {
      setCurrentProject(projectData);
    }
  }, []);

  const updateProject = (project: Project) => {
    cacheInstance.set('project_id', project.project_id);
    cacheInstance.set('project_data', project);
    setCurrentProject(project);
  };

  return {
    currentProject,
    updateProject,
  };
}
