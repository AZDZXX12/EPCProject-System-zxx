import axios from 'axios';
import { CableParams, CableResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cableApi = {
  /**
   * 计算电缆选型
   */
  async calculateCable(params: CableParams): Promise<CableResult[]> {
    try {
      const response = await apiClient.post<CableResult[]>('/calculate/', params);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * 获取电缆规格列表
   */
  async getCableSpecs(): Promise<any[]> {
    try {
      const response = await apiClient.get('/cables/');
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

export default apiClient;

