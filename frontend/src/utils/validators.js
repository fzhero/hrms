/**
 * Form validation utilities
 */

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate required field
export const validateRequired = (value) => {
  return value && value.trim().length > 0
}

// Validate password length (minimum 8 characters)
export const validatePassword = (password) => {
  return password && password.length >= 8
}

// Validate password confirmation match
export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword
}

// Validate name (min 3 characters)
export const validateName = (name) => {
  return name && name.trim().length >= 3
}

// Validate employee ID
export const validateEmployeeId = (employeeId) => {
  return employeeId && employeeId.trim().length > 0
}

// Get validation error message
export const getValidationError = (field, value, additionalData = {}) => {
  switch (field) {
    case 'employee_id':
      if (!validateRequired(value)) return 'Employee ID is required'
      break
    case 'name':
      if (!validateRequired(value)) return 'Name is required'
      if (!validateName(value)) return 'Name must be at least 3 characters'
      break
    case 'email':
      if (!validateRequired(value)) return 'Email is required'
      if (!validateEmail(value)) return 'Please enter a valid email address'
      break
    case 'password':
      if (!validateRequired(value)) return 'Password is required'
      if (!validatePassword(value)) return 'Password must be at least 8 characters'
      break
    case 'password_confirmation':
      if (!validateRequired(value)) return 'Please confirm your password'
      if (!validatePasswordMatch(additionalData.password, value)) {
        return 'Passwords do not match'
      }
      break
    default:
      return ''
  }
  return ''
}
