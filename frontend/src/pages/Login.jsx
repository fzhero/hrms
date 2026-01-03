import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import api from '../api/axios'
import { validateEmail, validateRequired, validatePassword, getValidationError } from '../utils/validators'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Check for success message from navigation state (e.g., after email verification)
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title)
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 5000)
    }
    
    // If resendEmail is in state, pre-fill email and show verification banner
    if (location.state?.resendEmail) {
      setFormData(prev => ({ ...prev, email: location.state.resendEmail }))
      setShowEmailVerification(true)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

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

    // Employee ID or Email - just check if required
    if (!validateRequired(formData.email)) {
      newErrors.email = 'Employee ID or Email is required'
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
        
        // Check if user is employee (not admin)
        if (userRole === 'admin') {
          setApiError('Access denied. Please use Admin Login page.')
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
        
        // Redirect to employee dashboard
        navigate('/employee/dashboard')
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
            setShowEmailVerification(true)
            setApiError('')
          } else {
            setApiError(errorData.message || 'Login failed. Please try again.')
            setShowEmailVerification(false)
          }
        }
      } else {
        setApiError('Network error. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    // Extract email from formData (could be email or employee_id)
    const emailToVerify = formData.email.includes('@') ? formData.email : null
    
    if (!emailToVerify) {
      setApiError('Please enter your email address to resend verification.')
      return
    }

    setResendLoading(true)
    setResendSuccess(false)
    setApiError('')

    try {
      const response = await api.post('/resend-verification', { email: emailToVerify })
      
      if (response.data.status) {
        setResendSuccess(true)
        setApiError('')
        // Hide success message after 5 seconds
        setTimeout(() => {
          setResendSuccess(false)
        }, 5000)
      }
    } catch (error) {
      if (error.response?.data) {
        setApiError(error.response.data.message || 'Failed to resend verification email.')
      } else {
        setApiError('Network error. Please check your connection.')
      }
    } finally {
      setResendLoading(false)
    }
  }

  const handleDismissVerification = () => {
    setShowEmailVerification(false)
    setResendSuccess(false)
    setApiError('')
  }

  return (
    <AuthLayout showLogo={true}>
      <div className="page-title">Employee Sign In</div>
      <form onSubmit={handleSubmit} className="auth-form">
        {successMessage && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            {successMessage}
          </div>
        )}
        {showEmailVerification && (
          <div className="email-verification-banner">
            <div className="email-verification-content">
              <div className="email-verification-icon">📧</div>
              <div className="email-verification-text">
                <h3>Email Verification Required</h3>
                <p>Please verify your email address before logging in. Check your inbox for the verification link.</p>
                {resendSuccess && (
                  <div className="alert alert-success" style={{ marginTop: '12px', marginBottom: '0' }}>
                    Verification email sent successfully! Please check your inbox.
                  </div>
                )}
              </div>
            </div>
            <div className="email-verification-actions">
              <Button
                type="button"
                onClick={handleResendVerification}
                loading={resendLoading}
                variant="secondary"
                style={{ marginRight: '8px' }}
              >
                Resend Email
              </Button>
              <button
                type="button"
                onClick={handleDismissVerification}
                className="btn-dismiss-verification"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        {apiError && !showEmailVerification && <div className="alert alert-error">{apiError}</div>}

        <div className="input-group">
          <label htmlFor="email">Employee ID / Email:-</label>
          <Input
            type="text"
            name="email"
            id="email"
            placeholder="Enter Employee ID or Email"
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
          SIGN IN
        </Button>

        <div className="auth-footer">
          <p>
            Don't have an Account?{' '}
            <Link to="/signup" className="auth-link">
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Login

