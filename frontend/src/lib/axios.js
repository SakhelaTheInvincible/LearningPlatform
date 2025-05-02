import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Using 127.0.0.1 instead of localhost
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for CORS
    timeout: 2000, // 10 second timeout
});

// Add a request interceptor to handle CSRF token
api.interceptors.request.use((config) => {
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    
    if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout');
        } else if (!error.response) {
            console.error('Network error - is the backend server running?');
        }
        return Promise.reject(error);
    }
);

export default api; 