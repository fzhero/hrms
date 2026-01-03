import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/common/Button'
import api from '../api/axios'
import '../styles/verify-email.css'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      // Check if token and email are present
      if (!token || !email) {
        setStatus('error')
        setMessage('Invalid verification link. Please check your email and try again.')
        setLoading(false)
        return
      }

      try {
        const response = await api.post('/verify-email', {
          email: email,
          token: token,
        })

        if (response.data.status) {
          setStatus('success')
          setMessage(response.data.message || 'Email verified successfully! You can now login.')
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Email verified successfully! You can now login.',
                verified: true 
              } 
            })
          }, 3000)
        } else {
          setStatus('error')
          setMessage(response.data.message || 'Failed to verify email.')
        }
      } catch (error) {
        setStatus('error')
        if (error.response?.data) {
          setMessage(error.response.data.message || 'Failed to verify email. Please try again.')
        } else {
          setMessage('Network error. Please check your connection and try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams, navigate])

  const handleGoToLogin = () => {
    navigate('/login', { 
      state: { 
        message: status === 'success' ? 'Email verified successfully! You can now login.' : null,
        verified: status === 'success'
      } 
    })
  }

  const handleResendVerification = () => {
    const email = searchParams.get('email')
    if (email) {
      navigate('/login', { 
        state: { 
          resendEmail: email 
        } 
      })
    } else {
      navigate('/login')
    }
  }

  return (
    <AuthLayout showLogo={true}>
      <div className="verify-email-container">
        {status === 'verifying' && (
          <div className="verify-email-content">
            <div className="verify-email-icon verifying">
              <div className="spinner-large"></div>
            </div>
            <h2 className="verify-email-title">Verifying Your Email</h2>
            <p className="verify-email-message">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="verify-email-content">
            <div className="verify-email-icon success">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#10B981"/>
              </svg>
            </div>
            <h2 className="verify-email-title">Email Verified Successfully!</h2>
            <p className="verify-email-message">{message}</p>
            <div className="verify-email-actions">
              <Button
                type="button"
                onClick={handleGoToLogin}
                variant="primary"
              >
                Go to Login
              </Button>
            </div>
            <p className="verify-email-redirect">Redirecting to login page in 3 seconds...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="verify-email-content">
            <div className="verify-email-icon error">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#EF4444"/>
              </svg>
            </div>
            <h2 className="verify-email-title">Verification Failed</h2>
            <p className="verify-email-message">{message}</p>
            <div className="verify-email-actions">
              <Button
                type="button"
                onClick={handleResendVerification}
                variant="primary"
                style={{ marginRight: '12px' }}
              >
                Resend Verification Email
              </Button>
              <Button
                type="button"
                onClick={handleGoToLogin}
                variant="secondary"
              >
                Go to Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}

export default VerifyEmail

