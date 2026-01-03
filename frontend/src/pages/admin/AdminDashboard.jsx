import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { getUser } from '../../utils/roles'
import NavigationBar from '../../components/NavigationBar'
import EmployeeCard from '../../components/EmployeeCard'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [employeeStatuses, setEmployeeStatuses] = useState({})
  const [activeView, setActiveView] = useState('employees') // 'employees', 'attendance', or 'table'
  const [employeeViewMode, setEmployeeViewMode] = useState('cards') // 'cards' or 'table'
  
  // Attendance List View State
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [attendanceList, setAttendanceList] = useState([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceSearch, setAttendanceSearch] = useState('')

  // Employee Management State
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    phone: '',
    department: '',
    designation: '',
    joining_date: '',
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const userData = getUser()
    setUser(userData)
    fetchDashboardData()
  }, [searchTerm])

  useEffect(() => {
    if (activeView === 'attendance') {
      fetchTodayAttendance()
    }
  }, [selectedDate, activeView])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all employees
      const params = searchTerm ? { search: searchTerm } : {}
      const employeesRes = await api.get('/admin/employees', { params })
      if (employeesRes.data.status) {
        const employeesList = employeesRes.data.data.data || employeesRes.data.data || []
        setEmployees(employeesList)
        
        // Fetch status for each employee
        await fetchEmployeeStatuses(employeesList)
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
        const statuses = {}
        employeesList.forEach(emp => {
          statuses[emp.id] = 'absent'
        })
        setEmployeeStatuses(statuses)
      }
    } catch (error) {
      console.error('Error fetching employee statuses:', error)
      const statuses = {}
      employeesList.forEach(emp => {
        statuses[emp.id] = 'absent'
      })
      setEmployeeStatuses(statuses)
    }
  }

  const fetchTodayAttendance = async () => {
    try {
      setAttendanceLoading(true)
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await api.get('/admin/attendances', {
        params: {
          from_date: dateStr,
          to_date: dateStr
        }
      })
      if (response.data.status) {
        const data = response.data.data.data || response.data.data || []
        setAttendanceList(data)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setAttendanceLoading(false)
    }
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    try {
      const response = await api.post('/admin/employees', formData)
      if (response.data.status) {
        setSuccessMessage('Employee created successfully!')
        setShowAddModal(false)
        setFormData({
          name: '',
          email: '',
          role: 'employee',
          phone: '',
          department: '',
          designation: '',
          joining_date: '',
        })
        fetchDashboardData()
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to create employee' })
      }
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return

    try {
      const response = await api.delete(`/admin/employees/${id}`)
      if (response.data.status) {
        setSuccessMessage('Employee deleted successfully!')
        fetchDashboardData()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete employee')
    }
  }

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut || checkIn === '-' || checkOut === '-') return '-'
    try {
      // Handle 12-hour format (e.g., "10:00 AM") or 24-hour format (e.g., "10:00" or "10:00:00")
      let inHour, inMin, inSec, outHour, outMin, outSec
      
      // Parse check-in time
      if (checkIn.includes('AM') || checkIn.includes('PM')) {
        // 12-hour format (e.g., "10:00 AM" or "10:00:00 AM")
        const inTime = checkIn.replace(/\s*(AM|PM)/i, '').trim()
        const inParts = inTime.split(':')
        inHour = parseInt(inParts[0], 10) || 0
        inMin = parseInt(inParts[1] || 0, 10) || 0
        inSec = parseInt(inParts[2] || 0, 10) || 0
        if (checkIn.toUpperCase().includes('PM') && inHour !== 12) inHour += 12
        if (checkIn.toUpperCase().includes('AM') && inHour === 12) inHour = 0
      } else {
        // 24-hour format (handles both HH:MM and HH:MM:SS)
        const inParts = checkIn.split(':')
        inHour = parseInt(inParts[0], 10) || 0
        inMin = parseInt(inParts[1] || 0, 10) || 0
        inSec = parseInt(inParts[2] || 0, 10) || 0
      }
      
      // Parse check-out time
      if (checkOut.includes('AM') || checkOut.includes('PM')) {
        // 12-hour format (e.g., "19:00 PM" or "07:00:00 PM")
        const outTime = checkOut.replace(/\s*(AM|PM)/i, '').trim()
        const outParts = outTime.split(':')
        outHour = parseInt(outParts[0], 10) || 0
        outMin = parseInt(outParts[1] || 0, 10) || 0
        outSec = parseInt(outParts[2] || 0, 10) || 0
        if (checkOut.toUpperCase().includes('PM') && outHour !== 12) outHour += 12
        if (checkOut.toUpperCase().includes('AM') && outHour === 12) outHour = 0
      } else {
        // 24-hour format (handles both HH:MM and HH:MM:SS)
        const outParts = checkOut.split(':')
        outHour = parseInt(outParts[0], 10) || 0
        outMin = parseInt(outParts[1] || 0, 10) || 0
        outSec = parseInt(outParts[2] || 0, 10) || 0
      }
      
      // Validate parsed values
      if (isNaN(inHour) || isNaN(inMin) || isNaN(outHour) || isNaN(outMin)) {
        console.warn('Invalid time values:', { checkIn, checkOut, inHour, inMin, outHour, outMin })
        return '-'
      }
      
      // Calculate difference in total seconds, then convert to minutes
      const inTotalSeconds = (inHour * 3600) + (inMin * 60) + (inSec || 0)
      const outTotalSeconds = (outHour * 3600) + (outMin * 60) + (outSec || 0)
      const diffSeconds = outTotalSeconds - inTotalSeconds
      
      if (diffSeconds < 0) {
        console.warn('Check-out time is before check-in time:', { checkIn, checkOut })
        return '-'
      }
      
      // Convert seconds to minutes (rounding up if there are seconds)
      const diffMinutes = Math.ceil(diffSeconds / 60)
      
      // Calculate hours and minutes
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      
      // Format as HH:MM
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    } catch (error) {
      console.error('Error calculating work hours:', error, { checkIn, checkOut })
      return '-'
    }
  }

  const calculateExtraHours = (workHours, standardHours = 8.5) => {
    if (workHours === '-') return '-'
    try {
      const [hours, minutes] = workHours.split(':').map(Number)
      const totalMinutes = hours * 60 + minutes
      const standardMinutes = standardHours * 60 // 8.5 hours = 510 minutes
      const extraMinutes = totalMinutes - standardMinutes
      if (extraMinutes <= 0) return '00:00'
      const extraHours = Math.floor(extraMinutes / 60)
      const extraMins = extraMinutes % 60
      return `${extraHours.toString().padStart(2, '0')}:${extraMins.toString().padStart(2, '0')}`
    } catch (error) {
      return '-'
    }
  }

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + direction)
    setSelectedDate(newDate)
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const filteredAttendance = attendanceList.filter(att => {
    if (!attendanceSearch) return true
    const searchLower = attendanceSearch.toLowerCase()
    const empName = att.user?.name?.toLowerCase() || ''
    const empId = att.user?.employee_id?.toLowerCase() || ''
    return empName.includes(searchLower) || empId.includes(searchLower)
  })

  const filteredEmployees = employees.filter(emp => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const name = emp.name?.toLowerCase() || ''
    const empId = emp.employee_id?.toLowerCase() || ''
    return name.includes(searchLower) || empId.includes(searchLower)
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <NavigationBar activeTab="employees" onTabChange={(tab) => {
        if (tab === 'attendance') {
          setActiveView('attendance')
          navigate('/admin/attendance')
        } else if (tab === 'employees') {
          setActiveView('employees')
        } else if (tab === 'leaves') {
          navigate('/admin/leaves')
        }
      }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            {successMessage}
          </div>
        )}

        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '600', color: '#111827' }}>Admin Dashboard</h1>
          {activeView === 'employees' && (
            <Button onClick={() => setShowAddModal(true)} variant="primary">
              Add Employee
            </Button>
          )}
        </div>

        {/* View Toggle */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '24px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '12px'
        }}>
          <button
            onClick={() => setActiveView('employees')}
            style={{
              padding: '8px 16px',
              background: activeView === 'employees' ? '#4F46E5' : 'transparent',
              color: activeView === 'employees' ? '#fff' : '#6B7280',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeView === 'employees' ? '600' : '500'
            }}
          >
            Employees
          </button>
          <button
            onClick={() => setActiveView('attendance')}
            style={{
              padding: '8px 16px',
              background: activeView === 'attendance' ? '#4F46E5' : 'transparent',
              color: activeView === 'attendance' ? '#fff' : '#6B7280',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeView === 'attendance' ? '600' : '500'
            }}
          >
            Attendance List
          </button>
        </div>

        {/* Employees View */}
        {activeView === 'employees' && (
          <>
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setEmployeeViewMode('cards')}
                  style={{
                    padding: '8px 16px',
                    background: employeeViewMode === 'cards' ? '#4F46E5' : '#fff',
                    color: employeeViewMode === 'cards' ? '#fff' : '#6B7280',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: employeeViewMode === 'cards' ? '600' : '500'
                  }}
                >
                  Cards
                </button>
                <button
                  onClick={() => setEmployeeViewMode('table')}
                  style={{
                    padding: '8px 16px',
                    background: employeeViewMode === 'table' ? '#4F46E5' : '#fff',
                    color: employeeViewMode === 'table' ? '#fff' : '#6B7280',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: employeeViewMode === 'table' ? '600' : '500'
                  }}
                >
                  Table
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loader-container" style={{ padding: '40px' }}>
                <div className="spinner"></div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <p style={{ color: '#6B7280', fontSize: '16px' }}>No employees found</p>
              </div>
            ) : employeeViewMode === 'cards' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                {filteredEmployees.map((employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    status={employeeStatuses[employee.id] || 'absent'}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#6B7280',
                          fontSize: '14px'
                        }}>Employee ID</th>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#6B7280',
                          fontSize: '14px'
                        }}>Name</th>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#6B7280',
                          fontSize: '14px'
                        }}>Email</th>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#6B7280',
                          fontSize: '14px'
                        }}>Department</th>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#6B7280',
                          fontSize: '14px'
                        }}>Designation</th>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#6B7280',
                          fontSize: '14px'
                        }}>Role</th>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#6B7280',
                          fontSize: '14px'
                        }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((emp) => (
                        <tr key={emp.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {emp.employee_id || '-'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {emp.name || '-'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {emp.email || '-'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                            {emp.employee_profile?.department || '-'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                            {emp.employee_profile?.designation || '-'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              background: emp.role === 'admin' ? '#DBEAFE' : '#E0E7FF',
                              color: emp.role === 'admin' ? '#1E40AF' : '#3730A3'
                            }}>
                              {emp.role}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => navigate(`/admin/profile/${emp.id}`)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#4F46E5',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer'
                                }}
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(emp.id)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#EF4444',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer'
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Attendance List View */}
        {activeView === 'attendance' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>Attendance</h2>
              
              {/* Search and Date Controls */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: '16px'
              }}>
                <Input
                  type="text"
                  placeholder="Searchbar"
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  noWrapper={true}
                  style={{ flex: '1', minWidth: '200px' }}
                />
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => navigateDate(-1)}
                    style={{
                      padding: '8px 12px',
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ←
                  </button>
                  
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    style={{
                      padding: '10px 14px',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      color: '#111827',
                      backgroundColor: '#fff',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease-in-out',
                      outline: 'none',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4F46E5'
                      e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  
                  <button
                    onClick={() => navigateDate(1)}
                    style={{
                      padding: '8px 12px',
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    →
                  </button>
                  
                  <button
                    style={{
                      padding: '8px 16px',
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Day
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            {attendanceLoading ? (
              <div className="loader-container" style={{ padding: '40px' }}>
                <div className="spinner"></div>
              </div>
            ) : (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                  {formatDate(selectedDate)}
                </h3>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#6B7280',
                          fontSize: '14px'
                        }}>Emp</th>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#6B7280',
                          fontSize: '14px'
                        }}>Check In</th>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#6B7280',
                          fontSize: '14px'
                        }}>Check Out</th>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#6B7280',
                          fontSize: '14px'
                        }}>Work Hours</th>
                        <th style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          fontWeight: '600',
                          color: '#6B7280',
                          fontSize: '14px'
                        }}>Extra hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendance.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ 
                            padding: '40px', 
                            textAlign: 'center', 
                            color: '#6B7280' 
                          }}>
                            No attendance records found for this date
                          </td>
                        </tr>
                      ) : (
                        filteredAttendance.map((att) => {
                          const workHours = calculateWorkHours(att.check_in, att.check_out)
                          const extraHours = calculateExtraHours(workHours)
                          return (
                            <tr key={att.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <td style={{ padding: '12px' }}>
                                {att.user?.name || '[Employee]'} ({att.user?.employee_id || '-'})
                              </td>
                              <td style={{ padding: '12px' }}>{att.check_in || '-'}</td>
                              <td style={{ padding: '12px' }}>{att.check_out || '-'}</td>
                              <td style={{ padding: '12px' }}>{workHours}</td>
                              <td style={{ padding: '12px' }}>{extraHours}</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Employee</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddEmployee} className="modal-body">
              {errors.general && (
                <div className="alert alert-error">{errors.general}</div>
              )}
              
              <div className="form-group">
                <label>Name *</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  noWrapper={true}
                />
                {errors.name && <span className="error-message">{errors.name[0]}</span>}
              </div>

              <div className="form-group">
                <label>Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  noWrapper={true}
                />
                {errors.email && <span className="error-message">{errors.email[0]}</span>}
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="form-control"
                  style={{
                    padding: '10px 14px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    color: '#111827',
                    backgroundColor: '#fff',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease-in-out',
                    outline: 'none',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    width: '100%'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4F46E5'
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Phone</label>
                <Input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  noWrapper={true}
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <Input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  noWrapper={true}
                />
              </div>

              <div className="form-group">
                <label>Designation</label>
                <Input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  noWrapper={true}
                />
              </div>

              <div className="form-group">
                <label>Joining Date</label>
                <Input
                  type="date"
                  value={formData.joining_date}
                  onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                  noWrapper={true}
                />
              </div>

              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => {
                  setShowAddModal(false)
                  setFormData({
                    name: '',
                    email: '',
                    role: 'employee',
                    phone: '',
                    department: '',
                    designation: '',
                    joining_date: '',
                  })
                  setErrors({})
                }}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create Employee
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
