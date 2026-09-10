import axios from 'axios';
import {
  DataSummaryResponse,
  PerformanceResponse,
  ForecastResponse,
  BusinessInsightsResponse
} from '../types';

const API_BASE = '/api';

export const api = {
  // Health
  checkHealth: async () => {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },

  // Data
  getDataSummary: async (dateCol?: string, salesCol?: string): Promise<DataSummaryResponse> => {
    const params = new URLSearchParams();
    if (dateCol) params.append('date_col', dateCol);
    if (salesCol) params.append('sales_col', salesCol);
    const res = await axios.get(`${API_BASE}/data/summary?${params.toString()}`);
    return res.data;
  },

  uploadCSV: async (file: File): Promise<DataSummaryResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/data/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  loadDemoData: async (): Promise<DataSummaryResponse> => {
    const res = await axios.post(`${API_BASE}/data/load-demo`);
    return res.data;
  },

  // Model
  trainModel: async (dateCol?: string, salesCol?: string): Promise<PerformanceResponse> => {
    const params = new URLSearchParams();
    if (dateCol) params.append('date_col', dateCol);
    if (salesCol) params.append('sales_col', salesCol);
    const res = await axios.post(`${API_BASE}/model/train?${params.toString()}`);
    return res.data;
  },

  getPerformance: async (): Promise<PerformanceResponse> => {
    const res = await axios.get(`${API_BASE}/model/performance`);
    return res.data;
  },

  // Forecast
  getForecast: async (horizon: number = 30): Promise<ForecastResponse> => {
    const res = await axios.post(`${API_BASE}/forecast`, { horizon });
    return res.data;
  },

  // Business Insights
  getBusinessInsights: async (horizon: number = 30): Promise<BusinessInsightsResponse> => {
    const res = await axios.get(`${API_BASE}/business-insights?horizon=${horizon}`);
    return res.data;
  }
};
