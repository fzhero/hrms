import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import api from '../../api/axios'
import { validateEmail, validateRequired, validatePassword, getValidationError } from '../../utils/validators'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (apiError) setApiError('')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!validateRequired(formData.email)) {
      newErrors.email = getValidationError('email', formData.email)
    } else if (!validateEmail(formData.email)) {
      newErrors.email = getValidationError('email', formData.email)
    }

    if (!validateRequired(formData.password)) {
      newErrors.password = getValidationError('password', formData.password)
    } else if (!validatePassword(formData.password)) {
      newErrors.password = getValidationError('password', formData.password)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/login', formData)
      
      if (response.data.status) {
        const userRole = response.data.user.role
        
        // Check if user is admin
        if (userRole !== 'admin') {
          setApiError('Access denied. This is an admin-only login page.')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          return
        }
        
        // Save token and user data
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        // Check if password change is required (first login with system-generated password)
        if (response.data.requires_password_change) {
          // Redirect to password change page
          navigate('/change-password', { 
            state: { 
              message: 'Please change your system-generated password for security.',
              required: true 
            } 
          })
          return
        }
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard')
      }
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data
        
        if (errorData.errors) {
          // Validation errors from backend
          const backendErrors = {}
          Object.keys(errorData.errors).forEach(key => {
            backendErrors[key] = errorData.errors[key][0]
          })
          setErrors(backendErrors)
        } else {
          // Handle email verification error
          if (error.response?.status === 403 && errorData.email_verified === false) {
            setApiError(errorData.message || 'Please verify your email before logging in.')
          } else {
            setApiError(errorData.message || 'Login failed. Please try again.')
          }
        }
      } else {
        setApiError('Network error. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout showLogo={true}>
      <div className="page-title">Admin Sign In</div>
      <form onSubmit={handleSubmit} className="auth-form">
        {apiError && <div className="alert alert-error">{apiError}</div>}

        <div className="input-group">
          <label htmlFor="email">Email Address:-</label>
          <Input
            type="text"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            noWrapper={true}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="password">Password:-</label>
          <Input
            type="password"
            name="password"
            id="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            noWrapper={true}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <Button type="submit" loading={loading} variant="primary" className="signin-btn">
          ADMIN SIGN IN
        </Button>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/admin/signup" className="auth-link">
              Admin Sign Up
            </Link>
          </p>
          <p style={{ marginTop: '10px' }}>
            Are you an Employee?{' '}
            <Link to="/login" className="auth-link">
              Employee Login
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

export default AdminLogin

