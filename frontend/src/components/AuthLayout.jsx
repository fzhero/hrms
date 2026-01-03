/**
 * Common Layout for Login and Signup pages
 * Provides consistent styling and structure
 */
const AuthLayout = ({ title, subtitle, children, showLogo = true }) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        {showLogo && (
          <div className="auth-logo">
            <div className="logo-placeholder">
              <span>App/Web Logo</span>
            </div>
          </div>
        )}
        <div className="auth-header">
          {title && <h1 className="auth-title">{title}</h1>}
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

