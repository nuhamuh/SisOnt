import axios from 'axios';
import { ApiResponse } from '../types';
import md5 from 'md5';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Buat instance axios dengan konfigurasi default
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export const fetchONTList = async () => {
  const response = await api.get<ApiResponse<any>>('/api/ont');
  return response.data;
};

export const refreshONT = async (serialNumber: string) => {
  const response = await api.post<ApiResponse<string>>(`/api/ont/${serialNumber}/refresh`);
  return response.data;
};

export const fetchAllONTHistory = async () => {
  const response = await api.get<ApiResponse<any>>('/api/ont/histori');
  return response.data;
};

export const addONT = async (data: any) => {
  const response = await api.post<ApiResponse<any>>('/api/ont', data);
  return response.data;
};

export const deleteONT = async (serialNumber: string) => {
  const response = await api.delete<ApiResponse<string>>(`/api/ont/${serialNumber}`);
  return response.data;
};

export const fetchFilterData = async (): Promise<{
  status: string;
  data: {
    olt_list: string[];
    offline_causes: string[];
    latest_date: string;
  };
}> => {
  const response = await api.get('/api/ont/filter-data');
  return response.data;
};

export const fetchONTHistory = async (params: {
  olt?: string;
  status?: string;
  offline_cause?: string;
  attenuation?: number;
  start?: string;
  end?: string;
}) => {
  const response = await api.get<ApiResponse<any>>('/api/ont/histori', { params });
  return response.data;
};

// Fungsi login
export const login = async (credentials: { username: string; password: string }) => {
  const hashedPassword = md5(credentials.password);
  const response = await api.post('/api/auth/login', {
    username: credentials.username,
    password: hashedPassword
  });
  return response.data;
};

// Fungsi logout
export const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};