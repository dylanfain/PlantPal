import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5001',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
});

instance.interceptors.request.use(
    config => {
        console.log('Making request:', config.url);
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    response => {
        console.log('Received response:', response.config.url);
        return response;
    },
    error => {
        console.error('Response error:', {
            url: error.config?.url,
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        return Promise.reject(error);
    }
);

export default instance; 