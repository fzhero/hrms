import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { getUser } from '../../utils/roles'
import NavigationBar from '../../components/NavigationBar'
import EmployeeCard from '../../components/EmployeeCard'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

const EmployeeDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [employees, setEmployees] = useState([])
  const [todayStatus, setTodayStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [employeeStatuses, setEmployeeStatuses] = useState({})

  useEffect(() => {
    const userData = getUser()
    setUser(userData)
    fetchDashboardData()
  }, [searchTerm])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all employees
      const params = searchTerm ? { search: searchTerm } : {}
      const employeesRes = await api.get('/employee/employees', { params })
      if (employeesRes.data.status) {
        const employeesList = employeesRes.data.data.data || employeesRes.data.data || []
        setEmployees(employeesList)
        
        // Fetch status for each employee
        await fetchEmployeeStatuses(employeesList)
      }

      // Fetch today's attendance status for current user
      const statusRes = await api.get('/employee/attendances/today')
      if (statusRes.data.status) {
        setTodayStatus(statusRes.data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployeeStatuses = async (employeesList) => {
    try {
      // Use employee endpoint to get statuses
      const response = await api.get('/employee/employees/statuses/today')
      if (response.data.status) {
        setEmployeeStatuses(response.data.data)
      } else {
        // Fallback: set all as absent
        const statuses = {}
        employeesList.forEach(emp => {
          statuses[emp.id] = 'absent'
        })
        setEmployeeStatuses(statuses)
      }
    } catch (error) {
      console.error('Error fetching employee statuses:', error)
      // Fallback: set all as absent
      const statuses = {}
      employeesList.forEach(emp => {
        statuses[emp.id] = 'absent'
      })
      setEmployeeStatuses(statuses)
    }
  }

  const handleCheckIn = async () => {
    try {
      const response = await api.post('/employee/attendances/check-in')
      if (response.data.status) {
        // Update today's status
        setTodayStatus({
          checked_in: true,
          checked_out: false,
          check_in_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          check_out_time: null,
          status: 'present'
        })
        // Refresh employee statuses
        fetchDashboardData()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check in')
    }
  }

  const handleCheckOut = async () => {
    try {
      const response = await api.post('/employee/attendances/check-out')
      if (response.data.status) {
        // Update today's status
        setTodayStatus({
          checked_in: true,
          checked_out: true,
          check_in_time: todayStatus?.check_in_time,
          check_out_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: 'present'
        })
        // Refresh employee statuses
        fetchDashboardData()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check out')
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return null
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getTimeSince = (timeString) => {
    if (!timeString) return null
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `Since ${hour12}:${minutes} ${ampm}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <NavigationBar activeTab="employees" onTabChange={(tab) => {
        if (tab === 'attendance') navigate('/employee/attendance')
        if (tab === 'leaves') navigate('/employee/leaves')
      }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Controls Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '16px'
        }}>
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <Input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              noWrapper={true}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Employee Cards Grid */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div className="loader-container" style={{ padding: '40px' }}>
                <div className="spinner"></div>
              </div>
            ) : employees.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <p style={{ color: '#6B7280', fontSize: '16px' }}>No employees found</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                {employees.map((employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    status={employeeStatuses[employee.id] || 'absent'}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Attendance Check In/Out Panel */}
          <div style={{
            width: '320px',
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            height: 'fit-content',
            position: 'sticky',
            top: '88px'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827'
            }}>
              Attendance
            </h3>

            {todayStatus?.checked_in && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                background: '#f0fdf4',
                borderRadius: '8px',
                border: '1px solid #bbf7d0'
              }}>
                <p style={{
                  margin: '0',
                  fontSize: '14px',
                  color: '#166534',
                  fontWeight: '500'
                }}>
                  {getTimeSince(todayStatus.check_in_time)}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!todayStatus?.checked_in ? (
                <Button
                  onClick={handleCheckIn}
                  variant="success"
                  style={{ width: '100%', padding: '12px' }}
                >
                  Check IN →
                </Button>
              ) : !todayStatus?.checked_out ? (
                <>
                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <p style={{ margin: '0', fontSize: '12px', color: '#6B7280' }}>
                      Checked in at
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                      {formatTime(todayStatus.check_in_time) || todayStatus.check_in_time}
                    </p>
                  </div>
                  <Button
                    onClick={handleCheckOut}
                    variant="danger"
                    style={{ width: '100%', padding: '12px' }}
                  >
                    Check Out →
                  </Button>
                </>
              ) : (
                <div style={{
                  padding: '12px',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0', fontSize: '14px', color: '#166534', fontWeight: '500' }}>
                    ✓ Attendance Complete
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                    {formatTime(todayStatus.check_in_time)} - {formatTime(todayStatus.check_out_time)}
                  </p>
                </div>
              )}
            </div>

            {/* Status Legend */}
            <div style={{
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6B7280',
                textTransform: 'uppercase'
              }}>
                Status Indicators
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    border: '2px solid white',
                    boxShadow: '0 0 0 2px #10B981'
                  }} />
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Present</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>✈️</span>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>On Leave</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#F59E0B',
                    border: '2px solid white',
                    boxShadow: '0 0 0 2px #F59E0B'
                  }} />
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Absent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard
