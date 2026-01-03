import { useNavigate } from 'react-router-dom'

const EmployeeCard = ({ employee, status }) => {
  const navigate = useNavigate()

  const handleCardClick = () => {
    // Navigate to employee view page (view-only mode)
    navigate(`/employee/view/${employee.id}`)
  }

  const getStatusIcon = () => {
    if (status === 'present') {
      return (
        <div style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: '#10B981',
          border: '2px solid white',
          boxShadow: '0 0 0 1px #10B981, 0 2px 4px rgba(0,0,0,0.2)'
        }} title="Present" />
      )
    } else if (status === 'on_leave') {
      return (
        <div style={{
          fontSize: '18px',
          lineHeight: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} title="On Leave">
          ✈️
        </div>
      )
    } else if (status === 'absent') {
      return (
        <div style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: '#F59E0B',
          border: '2px solid white',
          boxShadow: '0 0 0 1px #F59E0B, 0 2px 4px rgba(0,0,0,0.2)'
        }} title="Absent" />
      )
    }
    return null
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div 
      className="employee-card"
      onClick={handleCardClick}
      style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        border: '1px solid #e5e7eb',
        minHeight: '180px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* Status Indicator - Top Right */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '50%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {getStatusIcon()}
      </div>

      {/* Profile Picture */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#4F46E5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '15px',
        border: '3px solid #e5e7eb'
      }}>
        {(employee.employee_profile?.profile_photo || employee.profile_photo) ? (
          <img 
            src={employee.employee_profile?.profile_photo || employee.profile_photo} 
            alt={employee.name}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        ) : (
          getInitials(employee.name)
        )}
      </div>

      {/* Employee Name */}
      <h3 style={{
        margin: '0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
        marginBottom: '5px'
      }}>
        {employee.name}
      </h3>

      {/* Employee ID */}
      <p style={{
        margin: '0',
        fontSize: '12px',
        color: '#6B7280',
        textAlign: 'center'
      }}>
        {employee.employee_id || 'N/A'}
      </p>

      {/* Department/Designation */}
      {(employee.employee_profile?.department || employee.employee_profile?.designation) && (
        <p style={{
          margin: '5px 0 0 0',
          fontSize: '11px',
          color: '#9CA3AF',
          textAlign: 'center'
        }}>
          {employee.employee_profile?.designation || employee.employee_profile?.department}
        </p>
      )}
    </div>
  )
}

export default EmployeeCard

