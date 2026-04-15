import axios from 'axios';
import { Platform } from 'react-native';

// For Android Emulator, localhost is 127.0.0.1. For iOS, it's localhost.
// Replace with your actual local IP if testing on real device (e.g., http://192.168.1.5:8888)
const BASE_URL = Platform.OS === 'android'
    ? 'http://127.0.0.1:9400/wp-json/wp-erp/v1'
    : 'http://127.0.0.1:9400/wp-json/wp-erp/v1';

console.log('API Configured with BASE_URL:', BASE_URL);

// Create axios instance
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add cache/auth interceptors if needed later
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error?.response?.status, error?.response?.data);
        return Promise.reject(error);
    }
);

export default api;
