import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import api from '../api/axios'
import { 
  validateEmail, 
  validateRequired, 
  validatePassword, 
  validateName,
  validatePasswordMatch,
  getValidationError 
} from '../utils/validators'

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
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

    if (!validateRequired(formData.name)) {
      newErrors.name = getValidationError('name', formData.name)
    } else if (!validateName(formData.name)) {
      newErrors.name = getValidationError('name', formData.name)
    }

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
      const response = await api.post('/register', formData)
      
      if (response.data.status) {
        // Save token and user data
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        // Redirect to dashboard
        navigate('/dashboard')
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
          setApiError(errorData.message || 'Registration failed. Please try again.')
        }
      } else {
        setApiError('Network error. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Sign up to get started"
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {apiError && <div className="alert alert-error">{apiError}</div>}

        <Input
          type="text"
          name="name"
          placeholder="Full name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <Input
          type="password"
          name="password_confirmation"
          placeholder="Confirm password"
          value={formData.password_confirmation}
          onChange={handleChange}
          error={errors.password_confirmation}
          required
        />

        <Button type="submit" loading={loading} variant="primary">
          Sign Up
        </Button>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Signup

