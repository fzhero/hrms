/**
 * Role utility functions
 * Helper functions to check user roles and permissions
 */

/**
 * Get user role from localStorage
 * @returns {string|null} User role or null if not found
 */
export const getUserRole = () => {
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      return user.role || null
    }
    return null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * Get user data from localStorage
 * @returns {object|null} User object or null
 */
export const getUser = () => {
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      return JSON.parse(userData)
    }
    return null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Check if user is Admin
 * @returns {boolean}
 */
export const isAdmin = () => {
  return getUserRole() === 'admin'
}

/**
 * Check if user is HR
 * @returns {boolean}
 */
export const isHR = () => {
  return getUserRole() === 'hr'
}

/**
 * Check if user is Employee (strict check)
 * @returns {boolean}
 */
export const isEmployee = () => {
  const role = getUserRole()
  return role === 'employee'
}

/**
 * Check if user is strictly Employee (not Admin)
 * @returns {boolean}
 */
export const isEmployeeOnly = () => {
  return isEmployee() && !isAdmin()
}

/**
 * Check if user is Admin or HR
 * @returns {boolean}
 */
export const isAdminOrHR = () => {
  const role = getUserRole()
  return role === 'admin' || role === 'hr'
}

/**
 * Check if user has any of the specified roles
 * @param {string|string[]} roles - Single role or array of roles
 * @returns {boolean}
 */
export const hasRole = (roles) => {
  const userRole = getUserRole()
  if (!userRole) return false
  
  if (Array.isArray(roles)) {
    return roles.includes(userRole)
  }
  return userRole === roles
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  const user = getUser()
  return !!(token && user)
}

