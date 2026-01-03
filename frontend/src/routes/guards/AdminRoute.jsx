import { Navigate } from 'react-router-dom'
import { isAdmin } from '../../utils/roles'

/**
 * Admin Route Guard
 * Only allows access if user is authenticated AND is Admin
 * Redirects to login if not authenticated
 * Redirects to dashboard if authenticated but not Admin
 */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  
  // Not authenticated - redirect to login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Authenticated but not Admin - redirect to dashboard
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  // Authenticated and is Admin - allow access
  return children
}

export default AdminRoute

