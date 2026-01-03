import { Navigate } from 'react-router-dom'
import { isEmployee } from '../../utils/roles'

/**
 * Employee Route Guard (Strict)
 * Only allows access if user is authenticated AND is Employee
 * Redirects to login if not authenticated
 * Redirects to dashboard if authenticated but not Employee
 * SECURITY: Admin users are blocked from accessing employee-only routes
 */
const EmployeeRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  
  // Not authenticated - redirect to login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Authenticated but not Employee - redirect to dashboard
  if (!isEmployee()) {
    return <Navigate to="/dashboard" replace />
  }

  // Authenticated and is Employee - allow access
  return children
}

export default EmployeeRoute

