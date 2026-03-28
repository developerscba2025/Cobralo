import axios from 'axios';

/**
 * Shared axios instance for external services
 * Enforces a 10-second timeout by default
 */
export const externalServiceClient = axios.create({
    timeout: 10000, 
    headers: {
        'Accept': 'application/json',
        'User-Agent': 'Cobralo-Backend/1.0.0'
    }
});

// Generic interceptors for logging or standard error formatting can be added here
externalServiceClient.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timed out:', error.config.url);
        } else if (!error.response) {
            console.error('Network error or server unreachable:', error.config.url);
        }
        return Promise.reject(error);
    }
);
