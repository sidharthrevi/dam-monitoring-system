import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auth
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Dams
export const getDams = () => API.get('/dams');
export const getDam = (id) => API.get(`/dams/${id}`);
export const createDam = (data) => API.post('/dams', data);
export const updateDam = (id, data) => API.put(`/dams/${id}`, data);
export const deleteDam = (id) => API.delete(`/dams/${id}`);

// Readings
export const getReadings = (dam_id) => API.get(`/readings?dam_id=${dam_id}`); 
export const getLatestReading = (dam_id) => API.get(`/readings/latest?dam_id=${dam_id}`);
export const createReading = (data) => API.post('/readings', data);
export const updateReading = (id, data) => API.put(`/readings/${id}`, data);
export const deleteReading = (id) => API.delete(`/readings/${id}`);

// Alerts
export const getAlert = (dam_id) => API.get(`/alerts/${dam_id}`);
export const updateAlert = (dam_id, data) => API.put(`/alerts/${dam_id}`, data);