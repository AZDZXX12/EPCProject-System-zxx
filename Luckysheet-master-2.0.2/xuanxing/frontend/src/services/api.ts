import axios from 'axios';
import { CableParams, CableResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

export const cableApi = {
  /**
   * 计算电缆选型
   */
  async calculateCable(params: CableParams): Promise<CableResult[]> {
    try {
      const response = await withRetry(() => apiClient.post<CableResult[]>('/calculate/', params));
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
      const response = await withRetry(() => apiClient.get('/cables/'));
      const data = response.data as any;
      if (data && Array.isArray(data.results)) {
        return data.results;
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

export default apiClient;

