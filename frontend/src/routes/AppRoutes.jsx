import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Dashboard from '../pages/Dashboard'

// Route Guards (Security-critical)
import AdminRoute from './guards/AdminRoute'
import EmployeeRoute from './guards/EmployeeRoute'
import SharedRoute from './guards/SharedRoute'

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * @deprecated - Use EmployeeRoute, AdminRoute, or SharedRoute instead
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? <Navigate to="/dashboard" replace /> : children
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } 
      />
      {/* Dashboard accessible by both Admin and Employee */}
      <Route 
        path="/dashboard" 
        element={
          <SharedRoute>
            <Dashboard />
          </SharedRoute>
        } 
      />
      
      {/* Example: Admin-only routes */}
      {/* <Route 
        path="/admin/settings" 
        element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        } 
      /> */}
      
      {/* Example: Employee-only routes */}
      {/* <Route 
        path="/employee/profile" 
        element={
          <EmployeeRoute>
            <EmployeeProfile />
          </EmployeeRoute>
        } 
      /> */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes

