import { useState } from 'react'

/**
 * Reusable Input Component with Professional Styling
 * @param {string} type - Input type (text, email, password, date, etc.)
 * @param {string} name - Input name attribute
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required
 * @param {boolean} noWrapper - Don't wrap in input-group div
 * @param {object} style - Additional inline styles
 */
const Input = ({ 
  type = 'text', 
  name,
  id,
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  noWrapper = false,
  style = {}
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type

  // Professional input styling
  const baseInputStyle = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#111827',
    backgroundColor: '#fff',
    border: error ? '1px solid #EF4444' : '1px solid #D1D5DB',
    borderRadius: '8px',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    ...style
  }

  // Hover and focus styles
  const inputHoverStyle = {
    borderColor: error ? '#EF4444' : '#9CA3AF'
  }

  const inputFocusStyle = {
    borderColor: error ? '#EF4444' : '#4F46E5',
    boxShadow: error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(79, 70, 229, 0.1)'
  }

  const inputElement = (
    <div style={{ position: 'relative' }}>
      <input
        type={inputType}
        name={name}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={error ? 'input-error' : ''}
        style={baseInputStyle}
        onMouseEnter={(e) => {
          if (!e.target.matches(':focus')) {
            Object.assign(e.target.style, inputHoverStyle)
          }
        }}
        onMouseLeave={(e) => {
          if (!e.target.matches(':focus')) {
            e.target.style.borderColor = error ? '#EF4444' : '#D1D5DB'
            e.target.style.boxShadow = 'none'
          }
        }}
        onFocus={(e) => {
          Object.assign(e.target.style, inputFocusStyle)
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#EF4444' : '#D1D5DB'
          e.target.style.boxShadow = 'none'
        }}
      />
      {type === 'password' && (
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '18px',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      )}
    </div>
  )

  if (noWrapper) {
    return inputElement
  }

  return (
    <div className="input-group" style={{ marginBottom: '16px' }}>
      {inputElement}
      {error && (
        <span className="error-message" style={{
          display: 'block',
          marginTop: '6px',
          fontSize: '12px',
          color: '#EF4444',
          fontWeight: '500'
        }}>
          {error}
        </span>
      )}
    </div>
  )
}

export default Input
