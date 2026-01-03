/**
 * Loader Component
 * Simple loading spinner
 */
const Loader = ({ size = 'medium' }) => {
  const sizeStyles = {
    small: { width: '20px', height: '20px', borderWidth: '2px' },
    medium: { width: '40px', height: '40px', borderWidth: '4px' },
    large: { width: '60px', height: '60px', borderWidth: '5px' }
  }

  const style = sizeStyles[size] || sizeStyles.medium

  return (
    <div className={`loader loader-${size}`}>
      <div className="spinner" style={style}></div>
    </div>
  )
}

export default Loader

