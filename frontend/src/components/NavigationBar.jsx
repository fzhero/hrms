import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getUser, isAdmin } from '../utils/roles'
import api from '../api/axios'

const NavigationBar = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [user, setUser] = useState(null)
  const [todayStatus, setTodayStatus] = useState(null)
  const [statusDot, setStatusDot] = useState('absent') // 'present', 'absent', 'on_leave'
  const menuRef = useRef(null)

  useEffect(() => {
    setUser(getUser())
    if (!isAdmin()) {
      fetchTodayStatus()
      
      // Listen for attendance updates from Attendance page
      const handleAttendanceUpdate = (event) => {
        const { action, time } = event.detail
        if (action === 'checkin') {
          setStatusDot('present')
          setTodayStatus(prev => ({
            ...prev,
            checked_in: true,
            checked_out: false,
            check_in_time: time,
            check_out_time: null,
            status: 'present'
          }))
        } else if (action === 'checkout') {
          setTodayStatus(prev => ({
            ...prev,
            checked_out: true,
            check_out_time: time,
            status: 'present'
          }))
        }
      }
      
      window.addEventListener('attendanceUpdated', handleAttendanceUpdate)
      return () => {
        window.removeEventListener('attendanceUpdated', handleAttendanceUpdate)
      }
    }
  }, [])

  const fetchTodayStatus = async () => {
    try {
      const response = await api.get('/employee/attendances/today')
      if (response.data.status) {
        setTodayStatus(response.data.data)
        // Update status dot
        if (response.data.data.checked_in && !response.data.data.checked_out) {
          setStatusDot('present')
        } else if (response.data.data.checked_out) {
          setStatusDot('present')
        } else {
          setStatusDot('absent')
        }
      }
    } catch (error) {
      console.error('Error fetching today status:', error)
    }
  }

  const handleCheckIn = async () => {
    try {
      const response = await api.post('/employee/attendances/check-in')
      if (response.data.status) {
        const now = new Date()
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        
        setStatusDot('present')
        setTodayStatus({
          checked_in: true,
          checked_out: false,
          check_in_time: timeString,
          check_out_time: null,
          status: 'present'
        })
        
        // Trigger custom event to update attendance table
        window.dispatchEvent(new CustomEvent('attendanceUpdated', { 
          detail: { 
            action: 'checkin', 
            time: timeString,
            date: now.toISOString().split('T')[0]
          } 
        }))
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check in')
    }
  }

  const handleCheckOut = async () => {
    try {
      const response = await api.post('/employee/attendances/check-out')
      if (response.data.status) {
        const now = new Date()
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        
        setTodayStatus({
          ...todayStatus,
          checked_out: true,
          check_out_time: timeString,
          status: 'present'
        })
        
        // Trigger custom event to update attendance table
        window.dispatchEvent(new CustomEvent('attendanceUpdated', { 
          detail: { 
            action: 'checkout', 
            time: timeString,
            date: now.toISOString().split('T')[0]
          } 
        }))
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check out')
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return null
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const tabs = isAdmin() 
    ? [
        { id: 'employees', label: 'Employees', path: '/admin/dashboard' },
        { id: 'attendance', label: 'Attendance', path: '/admin/attendance' },
        { id: 'leaves', label: 'Time Off', path: '/admin/leaves' }
      ]
    : [
        { id: 'employees', label: 'Employees', path: '/employee/dashboard' },
        { id: 'attendance', label: 'Attendance', path: '/employee/attendance' },
        { id: 'leaves', label: 'Time Off', path: '/employee/leaves' }
      ]

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {/* Left Side - Logo and Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {/* Company Logo */}
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#4F46E5'
        }}>
          HRMS
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {tabs.map((tab) => {
            const isActive = location.pathname.includes(tab.path) || activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange?.(tab.id)
                  navigate(tab.path)
                }}
                style={{
                  padding: '8px 16px',
                  background: isActive ? '#4F46E5' : 'transparent',
                  color: isActive ? '#fff' : '#6B7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#f3f4f6'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right Side - Check In/Out and User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Check In/Out and Status Dot (for employees only) */}
        {!isAdmin() && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Check In/Out Section */}
            {!todayStatus?.checked_in ? (
              <button
                onClick={handleCheckIn}
                style={{
                  padding: '8px 16px',
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10B981'
                }}
              >
                Check IN →
              </button>
            ) : !todayStatus?.checked_out ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{
                  padding: '6px 12px',
                  background: '#f0fdf4',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#166534',
                  border: '1px solid #bbf7d0'
                }}>
                  {getTimeSince(todayStatus.check_in_time) || 'Since ' + formatTime(todayStatus.check_in_time)}
                </div>
                <button
                  onClick={handleCheckOut}
                  style={{
                    padding: '8px 16px',
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#DC2626'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#EF4444'
                  }}
                >
                  Check Out →
                </button>
              </div>
            ) : (
              <div style={{
                padding: '8px 12px',
                background: '#f0fdf4',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#166534',
                border: '1px solid #bbf7d0'
              }}>
                ✓ Complete
              </div>
            )}

            {/* Status Dot */}
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: statusDot === 'present' ? '#10B981' : '#EF4444',
              border: '2px solid white',
              boxShadow: '0 0 0 2px ' + (statusDot === 'present' ? '#10B981' : '#EF4444'),
              transition: 'all 0.3s ease'
            }} title={statusDot === 'present' ? 'Present' : 'Absent'} />
          </div>
        )}

        {/* User Profile */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#4F46E5',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {user?.profile_photo ? (
              <img 
                src={user.profile_photo} 
                alt={user.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              getInitials(user?.name || 'U')
            )}
          </button>

        {/* Dropdown Menu */}
        {showProfileMenu && (
          <div style={{
            position: 'absolute',
            top: '48px',
            right: '0',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '180px',
            border: '1px solid #e5e7eb',
            zIndex: 1000
          }}>
            <button
              onClick={() => {
                setShowProfileMenu(false)
                navigate(isAdmin() ? '/admin/profile' : '/employee/profile')
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#111827',
                borderBottom: '1px solid #e5e7eb'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              My Profile
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#EF4444'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Log Out
            </button>
          </div>
        )}
        </div>
      </div>
    </nav>
  )
}

export default NavigationBar

