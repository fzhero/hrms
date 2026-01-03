import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import api from '../../api/axios'
import { validateEmail, validateRequired, validatePassword, getValidationError } from '../../utils/validators'

const AdminSignup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    company_name: '',
    company_logo: null,
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [logoPreview, setLogoPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, files } = e.target
    
    if (name === 'company_logo' && files && files[0]) {
      const file = files[0]
      setFormData(prev => ({ ...prev, [name]: file }))
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (apiError) setApiError('')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!validateRequired(formData.company_name)) {
      newErrors.company_name = 'Company Name is required'
    }

    if (!validateRequired(formData.name)) {
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
      newErrors.password_confirmation = 'Please confirm your password'
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match'
    }

    // Validate logo file if provided
    if (formData.company_logo) {
      const file = formData.company_logo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      const maxSize = 2 * 1024 * 1024 // 2MB
      
      if (!validTypes.includes(file.type)) {
        newErrors.company_logo = 'Logo must be a JPG, PNG, or GIF image'
      } else if (file.size > maxSize) {
        newErrors.company_logo = 'Logo size must be less than 2MB'
      }
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
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('email', formData.email)
      submitData.append('password', formData.password)
      submitData.append('password_confirmation', formData.password_confirmation)
      submitData.append('company_name', formData.company_name)
      if (formData.company_logo) {
        submitData.append('company_logo', formData.company_logo)
      }
      submitData.append('role', 'admin')

      const response = await api.post('/admin/register', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.status) {
        // Save token and user data
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        // Check if password change is required
        if (response.data.requires_password_change) {
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
    <AuthLayout showLogo={true}>
      <div className="page-title">Admin Sign Up</div>
      <form onSubmit={handleSubmit} className="auth-form">
        {apiError && <div className="alert alert-error">{apiError}</div>}

        <div className="input-group">
          <label htmlFor="company_name">Company Name:-</label>
          <div className="company-logo-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Input
              type="text"
              name="company_name"
              id="company_name"
              placeholder="Enter Company Name"
              value={formData.company_name}
              onChange={handleChange}
              error={errors.company_name}
              required
              noWrapper={true}
              style={{ flex: 1 }}
            />
            <label htmlFor="company_logo_upload" className="logo-upload-btn" style={{
              padding: '10px 15px',
              background: '#4F46E5',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap'
            }}>
              <input
                type="file"
                id="company_logo_upload"
                name="company_logo"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              📤 Upload Logo
            </label>
          </div>
          {logoPreview && (
            <div className="logo-preview" style={{ marginTop: '10px', marginBottom: '10px' }}>
              <img 
                src={logoPreview} 
                alt="Logo preview" 
                style={{ maxWidth: '150px', maxHeight: '80px', border: '1px solid #dee2e6', borderRadius: '4px', padding: '5px' }}
              />
            </div>
          )}
          {errors.company_name && <span className="error-message">{errors.company_name}</span>}
          {errors.company_logo && <span className="error-message">{errors.company_logo}</span>}
          <small className="text-muted" style={{ display: 'block', marginTop: '5px' }}>
            Upload company logo (JPG, PNG, GIF - Max 2MB)
          </small>
        </div>

        <div className="input-group">
          <label htmlFor="name">Full Name:-</label>
          <Input
            type="text"
            name="name"
            id="name"
            placeholder="Enter Full Name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            noWrapper={true}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="email">Email Address:-</label>
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="Enter Email"
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
          <small className="text-muted" style={{ display: 'block', marginTop: '5px' }}>
            Must be 8+ characters with uppercase, lowercase, number, and special character
          </small>
        </div>

        <div className="input-group">
          <label htmlFor="password_confirmation">Confirm Password:-</label>
          <Input
            type="password"
            name="password_confirmation"
            id="password_confirmation"
            placeholder="Confirm Password"
            value={formData.password_confirmation}
            onChange={handleChange}
            error={errors.password_confirmation}
            required
            noWrapper={true}
          />
          {errors.password_confirmation && <span className="error-message">{errors.password_confirmation}</span>}
        </div>

        <Button type="submit" loading={loading} variant="primary" className="signup-btn">
          ADMIN SIGN UP
        </Button>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/admin/login" className="auth-link">
              Admin Login
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

export default AdminSignup

