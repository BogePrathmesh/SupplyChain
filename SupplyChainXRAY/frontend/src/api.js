import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export const fetchSuppliers = () => axios.get(`${BASE_URL}/suppliers`);
export const fetchRiskScore = (id) => axios.get(`${BASE_URL}/risk-score/${id}`);
export const simulateDisruption = (supplier_id) =>
  axios.post(`${BASE_URL}/simulate-disruption`, { supplier_id });
export const fetchCriticalNodes = () => axios.get(`${BASE_URL}/critical-nodes`);
export const fetchAlternatives = (supplier_id) =>
  axios.get(`${BASE_URL}/alternative-suppliers/${supplier_id}`);
export const simulateWeakSignals = (data) =>
  axios.post(`${BASE_URL}/simulate-weak-signals`, data);
