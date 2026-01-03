import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Dashboard from '../pages/Dashboard'
import ChangePassword from '../pages/ChangePassword'
import VerifyEmail from '../pages/VerifyEmail'

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin'
import AdminSignup from '../pages/admin/AdminSignup'
import AdminDashboard from '../pages/admin/AdminDashboard'
import EmployeeManagement from '../pages/admin/EmployeeManagement'
import AttendanceManagement from '../pages/admin/AttendanceManagement'
import LeaveManagement from '../pages/admin/LeaveManagement'
import PayrollManagement from '../pages/admin/PayrollManagement'

// Employee Pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard'
import Profile from '../pages/employee/Profile'
import Attendance from '../pages/employee/Attendance'
import LeaveRequests from '../pages/employee/LeaveRequests'
import ViewEmployee from '../pages/employee/ViewEmployee'

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
      {/* Employee Login */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Employee Signup */}
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } 
      />
      
      {/* Email Verification */}
      <Route 
        path="/verify-email" 
        element={<VerifyEmail />} 
      />
      
      {/* Admin Login */}
      <Route 
        path="/admin/login" 
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        } 
      />
      
      {/* Admin Signup */}
      <Route 
        path="/admin/signup" 
        element={
          <PublicRoute>
            <AdminSignup />
          </PublicRoute>
        } 
      />
      
      {/* Change Password - Protected route */}
      <Route 
        path="/change-password" 
        element={
          <SharedRoute>
            <ChangePassword />
          </SharedRoute>
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
      
      {/* Admin-only routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/employees" 
        element={
          <AdminRoute>
            <Navigate to="/admin/dashboard" replace />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/attendance" 
        element={
          <AdminRoute>
            <AttendanceManagement />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/leaves" 
        element={
          <AdminRoute>
            <LeaveManagement />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/payroll" 
        element={
          <AdminRoute>
            <PayrollManagement />
          </AdminRoute>
        } 
      />
      
      {/* Employee-only routes */}
      <Route 
        path="/employee/dashboard" 
        element={
          <EmployeeRoute>
            <EmployeeDashboard />
          </EmployeeRoute>
        } 
      />
      <Route 
        path="/employee/profile" 
        element={
          <EmployeeRoute>
            <Profile />
          </EmployeeRoute>
        } 
      />
      <Route 
        path="/employee/attendance" 
        element={
          <EmployeeRoute>
            <Attendance />
          </EmployeeRoute>
        } 
      />
      <Route 
        path="/employee/leaves" 
        element={
          <EmployeeRoute>
            <LeaveRequests />
          </EmployeeRoute>
        } 
      />
      <Route 
        path="/employee/view/:id" 
        element={
          <EmployeeRoute>
            <ViewEmployee />
          </EmployeeRoute>
        } 
      />
      <Route 
        path="/admin/profile" 
        element={
          <AdminRoute>
            <Profile />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/profile/:id" 
        element={
          <AdminRoute>
            <Profile />
          </AdminRoute>
        } 
      />
      
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes

