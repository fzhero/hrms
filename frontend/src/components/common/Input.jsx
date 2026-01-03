import { useState } from 'react'

/**
 * Reusable Input Component
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} name - Input name attribute
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required
 */
const Input = ({ 
  type = 'text', 
  name, 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false 
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className="input-group">
      <input
        type={inputType}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={error ? 'input-error' : ''}
      />
      {type === 'password' && (
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      )}
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}

export default Input

