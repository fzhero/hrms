import axios from 'axios'
import { showLoader, hideLoader } from '../services/loaderService'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor to add auth token and show loader
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Show loader for all API calls
    // Skip loader for specific endpoints if needed (e.g., check-in/check-out)
    const skipLoaderEndpoints = []
    if (!skipLoaderEndpoints.some(endpoint => config.url?.includes(endpoint))) {
      showLoader()
    }
    
    return config
  },
  (error) => {
    hideLoader()
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and hide loader
api.interceptors.response.use(
  (response) => {
    hideLoader()
    return response
  },
  (error) => {
    hideLoader()
    
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

