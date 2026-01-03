/**
 * Common Layout for Login and Signup pages
 * Provides consistent styling and structure
 */
const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>
        <div className="auth-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout

