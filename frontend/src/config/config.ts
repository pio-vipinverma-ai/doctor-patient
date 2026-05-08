/**
 * Application configuration
 * Centralizes environment variables for easy testing and maintenance
 */

export const config = {
  apiUrl: typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
    ? import.meta.env.VITE_API_URL 
    : 'http://localhost:5000',
  
  mode: typeof import.meta !== 'undefined' && import.meta.env?.MODE 
    ? import.meta.env.MODE 
    : 'development',
    
  isDev: typeof import.meta !== 'undefined' && import.meta.env?.DEV 
    ? import.meta.env.DEV 
    : true,
    
  isProd: typeof import.meta !== 'undefined' && import.meta.env?.PROD 
    ? import.meta.env.PROD 
    : false,
};

export default config;
