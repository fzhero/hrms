import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import api from '../api/axios'
import { validateRequired, validatePassword, validatePasswordMatch, getValidationError } from '../utils/validators'
import { isAuthenticated } from '../utils/roles'

const ChangePassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRequired, setIsRequired] = useState(false)

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    // Check if password change is required
    if (location.state?.required) {
      setIsRequired(true)
      setApiError(location.state.message || 'Please change your password.')
    }
  }, [navigate, location])

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

    // Current password required only if not first login
    if (!isRequired && !validateRequired(formData.current_password)) {
      newErrors.current_password = 'Current password is required'
    }

    // New password validation
    if (!validateRequired(formData.password)) {
      newErrors.password = getValidationError('password', formData.password)
    } else if (!validatePassword(formData.password)) {
      newErrors.password = getValidationError('password', formData.password)
    }

    // Password confirmation
    if (!validateRequired(formData.password_confirmation)) {
      newErrors.password_confirmation = getValidationError('password_confirmation', formData.password_confirmation, { password: formData.password })
    } else if (!validatePasswordMatch(formData.password, formData.password_confirmation)) {
      newErrors.password_confirmation = getValidationError('password_confirmation', formData.password_confirmation, { password: formData.password })
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
      // For first login, current_password is the system-generated password
      // For regular password change, current_password is required
      const payload = {
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      }

      // Only include current_password if this is not a required change
      if (!isRequired) {
        payload.current_password = formData.current_password
      } else {
        // For first login, we need to validate the system-generated password
        // This should be handled differently - user should have received it
        // For now, we'll still require it
        payload.current_password = formData.current_password
      }

      const response = await api.put('/user/password', payload)

      if (response.data.status) {
        // Password changed successfully
        const user = JSON.parse(localStorage.getItem('user'))
        const userRole = user.role

        // Redirect based on role
        if (userRole === 'admin') {
          navigate('/admin/dashboard', { 
            state: { message: 'Password changed successfully!' } 
          })
        } else {
          navigate('/employee/dashboard', { 
            state: { message: 'Password changed successfully!' } 
          })
        }
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
          setApiError(errorData.message || 'Failed to change password. Please try again.')
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
      <div className="page-title">
        {isRequired ? 'Change Your Password' : 'Update Password'}
      </div>
      <form onSubmit={handleSubmit} className="auth-form">
        {apiError && (
          <div className={`alert ${isRequired ? 'alert-warning' : 'alert-error'}`}>
            {apiError}
          </div>
        )}

        {isRequired && (
          <div className="info-box">
            <p>This is your first login. Please change your system-generated password for security.</p>
          </div>
        )}

        <div className="input-group">
          <label htmlFor="current_password">
            {isRequired ? 'System-Generated Password:-' : 'Current Password:-'}
          </label>
          <Input
            type="password"
            name="current_password"
            id="current_password"
            placeholder={isRequired ? 'Enter your system-generated password' : 'Enter current password'}
            value={formData.current_password}
            onChange={handleChange}
            error={errors.current_password}
            required
            noWrapper={true}
          />
          {errors.current_password && <span className="error-message">{errors.current_password}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="password">New Password:-</label>
          <Input
            type="password"
            name="password"
            id="password"
            placeholder="Enter new password (min 8 characters)"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            noWrapper={true}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="password_confirmation">Confirm New Password:-</label>
          <Input
            type="password"
            name="password_confirmation"
            id="password_confirmation"
            placeholder="Confirm new password"
            value={formData.password_confirmation}
            onChange={handleChange}
            error={errors.password_confirmation}
            required
            noWrapper={true}
          />
          {errors.password_confirmation && <span className="error-message">{errors.password_confirmation}</span>}
        </div>

        <Button type="submit" loading={loading} variant="primary" className="change-password-btn">
          {isRequired ? 'Change Password & Continue' : 'Update Password'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default ChangePassword


