/**
 * Reusable Button Component
 * @param {string} type - Button type (button, submit, reset)
 * @param {string} children - Button text/content
 * @param {function} onClick - Click handler
 * @param {boolean} loading - Loading state
 * @param {boolean} disabled - Disabled state
 * @param {string} variant - Button variant (primary, secondary)
 */
const Button = ({ 
  type = 'button', 
  children, 
  onClick, 
  loading = false, 
  disabled = false,
  variant = 'primary'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant}`}
    >
      {loading ? (
        <>
          <span className="spinner"></span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button

