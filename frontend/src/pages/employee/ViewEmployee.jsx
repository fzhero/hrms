import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import NavigationBar from '../../components/NavigationBar'

const ViewEmployee = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployee()
  }, [id])

  const fetchEmployee = async () => {
    try {
      setLoading(true)
      // Use employee endpoint to view other employees
      const response = await api.get(`/employee/employees/${id}`)
      if (response.data.status) {
        setEmployee(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching employee:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <NavigationBar activeTab="employees" />
        <div className="loader-container" style={{ padding: '40px' }}>
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <NavigationBar activeTab="employees" />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Employee not found</h2>
          <button onClick={() => navigate('/employee/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <NavigationBar activeTab="employees" />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '48px',
              fontWeight: 'bold',
              border: '4px solid #e5e7eb'
            }}>
              {employee.profile?.profile_photo ? (
                <img 
                  src={employee.profile.profile_photo} 
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
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#111827' }}>
                {employee.name}
              </h1>
              <p style={{ margin: '0', fontSize: '16px', color: '#6B7280' }}>
                {employee.employee_id || 'N/A'}
              </p>
              {employee.profile?.designation && (
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#9CA3AF' }}>
                  {employee.profile.designation}
                </p>
              )}
            </div>
          </div>

          {/* Employee Information */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#111827' }}>Personal Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Email</label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#111827' }}>{employee.email}</p>
                </div>
                {employee.profile?.phone && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Phone</label>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#111827' }}>{employee.profile.phone}</p>
                  </div>
                )}
                {employee.profile?.address && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Address</label>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#111827' }}>{employee.profile.address}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#111827' }}>Job Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {employee.profile?.department && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Department</label>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#111827' }}>{employee.profile.department}</p>
                  </div>
                )}
                {employee.profile?.designation && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Designation</label>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#111827' }}>{employee.profile.designation}</p>
                  </div>
                )}
                {employee.profile?.joining_date && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Joining Date</label>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#111827' }}>
                      {new Date(employee.profile.joining_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={() => navigate('/employee/dashboard')}
              className="btn btn-secondary"
            >
              Back to Employees
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewEmployee

