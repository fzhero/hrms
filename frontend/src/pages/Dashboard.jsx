import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

/**
 * Protected Dashboard Page
 * Requires authentication to access
 */
const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
        
        <div className="dashboard-content">
          <div className="welcome-section">
            <h2>Welcome, {user.name}!</h2>
            <p className="user-email">{user.email}</p>
          </div>

          <div className="info-section">
            <h3>🎉 Authentication Successful!</h3>
            <p>You are now logged in and can access protected routes.</p>
            <p>This is a starter template for hackathons.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

