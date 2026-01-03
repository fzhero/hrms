import { Navigate } from 'react-router-dom'
import { isHR, isAdmin } from '../../utils/roles'

/**
 * HR Route Guard
 * Only allows access if user is authenticated AND is HR or Admin
 * Redirects to login if not authenticated
 * Redirects to dashboard if authenticated but not HR/Admin
 */
const HRRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  
  // Not authenticated - redirect to login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Authenticated but not HR or Admin - redirect to dashboard
  if (!isHR() && !isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  // Authenticated and is HR or Admin - allow access
  return children
}

export default HRRoute

