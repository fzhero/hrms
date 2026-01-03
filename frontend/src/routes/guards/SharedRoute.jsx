import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../../utils/roles'

/**
 * Shared Route Guard
 * Allows access if user is authenticated (any role: Admin or Employee)
 * Redirects to login if not authenticated
 * Use this for routes that both Admin and Employee can access
 */
const SharedRoute = ({ children }) => {
  // Not authenticated - redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  // Authenticated - allow access (both Admin and Employee)
  return children
}

export default SharedRoute

