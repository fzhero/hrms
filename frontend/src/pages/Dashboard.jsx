import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserRole } from '../utils/roles'

/**
 * Dashboard Redirect Page
 * Redirects to appropriate dashboard based on user role
 */
const Dashboard = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const role = getUserRole()
    
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true })
    } else if (role === 'employee') {
      navigate('/employee/dashboard', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  return (
    <div className="dashboard-container">
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    </div>
  )
}

export default Dashboard

