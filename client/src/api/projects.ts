import request from '../utils/request';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}

export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await request.get('/api/v1/projects');
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await request.get(`/api/v1/projects/${id}`);
    return response.data;
  },

  create: async (project: Partial<Project>): Promise<Project> => {
    const response = await request.post('/api/v1/projects', project);
    return response.data;
  },

  update: async (id: string, project: Partial<Project>): Promise<Project> => {
    const response = await request.put(`/api/v1/projects/${id}`, project);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/api/v1/projects/${id}`);
  },
};
