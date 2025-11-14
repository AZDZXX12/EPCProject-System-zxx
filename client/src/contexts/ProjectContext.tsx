import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { projectApi } from '../services/api';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'completed';
  created_at?: string;
  updated_at?: string;
  budget?: number;
  progress?: number;
  start_date?: string;
  end_date?: string;
  manager?: string;
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  loadProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      // 从 localStorage 加载缓存
      const cached = localStorage.getItem('projects_cache');
      if (cached) {
        const cachedProjects = JSON.parse(cached);
        setProjects(cachedProjects);
        if (cachedProjects.length > 0 && !currentProject) {
          setCurrentProject(cachedProjects[0]);
        }
      }

      const data = (await projectApi.getAll()) as Project[];
      if (Array.isArray(data)) {
        setProjects(data);
        localStorage.setItem('projects_cache', JSON.stringify(data));
        if (data.length > 0 && !currentProject) {
          setCurrentProject(data[0]);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load projects from backend, using cache:', error);
      }
    }
  }, [currentProject]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <ProjectContext.Provider value={{ projects, currentProject, setCurrentProject, loadProjects }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
