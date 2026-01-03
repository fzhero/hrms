import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Button from '../../components/common/Button'
import NavigationBar from '../../components/NavigationBar'

const Attendance = () => {
  const navigate = useNavigate()
  const [todayStatus, setTodayStatus] = useState(null)
  const [attendances, setAttendances] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [statistics, setStatistics] = useState({
    daysPresent: 0,
    leavesCount: 0,
    totalWorkingDays: 0
  })

  useEffect(() => {
    fetchTodayStatus()
    fetchMonthlyAttendance()
    fetchStatistics()
  }, [selectedMonth])

  // Listen for attendance updates from NavigationBar
  useEffect(() => {
    const handleAttendanceUpdate = (event) => {
      const { action, time, date } = event.detail
      const today = new Date().toISOString().split('T')[0]
      const selectedMonthStr = selectedMonth.toISOString().split('T')[0].substring(0, 7)
      const eventMonthStr = date.substring(0, 7)
      
      // Update today's status immediately without refetch
      if (date === today) {
        if (action === 'checkin') {
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
      
      // Update attendance table if viewing the same month
      if (eventMonthStr === selectedMonthStr) {
        fetchMonthlyAttendance()
        fetchStatistics()
      }
    }

    window.addEventListener('attendanceUpdated', handleAttendanceUpdate)
    return () => {
      window.removeEventListener('attendanceUpdated', handleAttendanceUpdate)
    }
  }, [selectedMonth])

  const fetchTodayStatus = async () => {
    try {
      const response = await api.get('/employee/attendances/today')
      if (response.data.status) {
        setTodayStatus(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching today status:', error)
    }
  }

  const fetchMonthlyAttendance = async () => {
    try {
      setLoading(true)
      const year = selectedMonth.getFullYear()
      const month = selectedMonth.getMonth() + 1
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]
      
      const response = await api.get('/employee/attendances', {
        params: { 
          from_date: startDate,
          to_date: endDate
        }
      })
      if (response.data.status) {
        const data = response.data.data.data || response.data.data || []
        setAttendances(data)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const year = selectedMonth.getFullYear()
      const month = selectedMonth.getMonth() + 1
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]
      
      // Fetch attendance for the month
      const attendanceRes = await api.get('/employee/attendances', {
        params: { 
          from_date: startDate,
          to_date: endDate
        }
      })
      
      // Fetch leaves for the month
      const leavesRes = await api.get('/employee/leaves', {
        params: {
          from_date: startDate,
          to_date: endDate
        }
      })
      
      let daysPresent = 0
      let leavesCount = 0
      
      if (attendanceRes.data.status) {
        const attendanceData = attendanceRes.data.data.data || attendanceRes.data.data || []
        daysPresent = attendanceData.filter(att => att.status === 'present' && att.check_in).length
      }
      
      if (leavesRes.data.status) {
        const leavesData = leavesRes.data.data.data || leavesRes.data.data || []
        // Count total leave days (approved leaves only)
        const approvedLeaves = leavesData.filter(leave => leave.status === 'approved')
        approvedLeaves.forEach(leave => {
          const fromDate = new Date(leave.from_date)
          const toDate = new Date(leave.to_date)
          const monthStart = new Date(year, month - 1, 1)
          const monthEnd = new Date(year, month, 0)
          
          // Calculate overlap with the selected month
          const overlapStart = fromDate < monthStart ? monthStart : fromDate
          const overlapEnd = toDate > monthEnd ? monthEnd : toDate
          
          if (overlapStart <= overlapEnd) {
            // Count working days in the overlap
            for (let d = new Date(overlapStart); d <= overlapEnd; d.setDate(d.getDate() + 1)) {
              const dayOfWeek = d.getDay()
              if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
                leavesCount++
              }
            }
          }
        })
      }
      
      // Calculate total working days (excluding weekends)
      const totalWorkingDays = calculateWorkingDays(year, month)
      
      setStatistics({
        daysPresent,
        leavesCount,
        totalWorkingDays
      })
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const calculateWorkingDays = (year, month) => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    let workingDays = 0
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month - 1, day)
      const dayOfWeek = date.getDay()
      // Count Monday to Friday (1-5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDays++
      }
    }
    
    return workingDays
  }

  const navigateMonth = (direction) => {
    const newMonth = new Date(selectedMonth)
    newMonth.setMonth(newMonth.getMonth() + direction)
    setSelectedMonth(newMonth)
  }

  const handleCheckIn = async () => {
    try {
      const response = await api.post('/employee/attendances/check-in')
      if (response.data.status) {
        const now = new Date()
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        const today = now.toISOString().split('T')[0]
        
        setTodayStatus({
          checked_in: true,
          checked_out: false,
          check_in_time: timeString,
          check_out_time: null,
          status: 'present'
        })
        
        // Refresh monthly data
        fetchMonthlyAttendance()
        fetchStatistics()
        
        window.dispatchEvent(new CustomEvent('attendanceUpdated', { 
          detail: { action: 'checkin', time: timeString, date: today } 
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
        const today = now.toISOString().split('T')[0]
        
        setTodayStatus(prev => ({
          ...prev,
          checked_out: true,
          check_out_time: timeString,
          status: 'present'
        }))
        
        // Refresh monthly data
        fetchMonthlyAttendance()
        fetchStatistics()
        
        window.dispatchEvent(new CustomEvent('attendanceUpdated', { 
          detail: { action: 'checkout', time: timeString, date: today } 
        }))
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check out')
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
      const standardMinutes = standardHours * 60
      const extraMinutes = totalMinutes - standardMinutes
      if (extraMinutes <= 0) return '00:00'
      const extraHours = Math.floor(extraMinutes / 60)
      const extraMins = extraMinutes % 60
      return `${extraHours.toString().padStart(2, '0')}:${extraMins.toString().padStart(2, '0')}`
    } catch (error) {
      return '-'
    }
  }

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getMonthOptions = () => {
    const months = []
    const currentDate = new Date()
    for (let i = -12; i <= 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
      months.push({
        value: date.toISOString().split('T')[0].substring(0, 7),
        label: formatMonthYear(date)
      })
    }
    return months
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <NavigationBar activeTab="attendance" onTabChange={(tab) => {
        if (tab === 'employees') navigate('/employee/dashboard')
        if (tab === 'leaves') navigate('/employee/leaves')
      }} />
      
      <div className="attendance-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <div className="attendance-header" style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '600', color: '#111827' }}>Attendance</h1>
        </div>

        {/* Month Navigation and Statistics */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Month Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigateMonth(-1)}
              style={{
                padding: '8px 12px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: '#6B7280'
              }}
            >
              ←
            </button>
            
            <select
              value={selectedMonth.toISOString().split('T')[0].substring(0, 7)}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-')
                setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1))
              }}
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
                minWidth: '150px',
                boxSizing: 'border-box',
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none'
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
              {getMonthOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => navigateMonth(1)}
              style={{
                padding: '8px 12px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: '#6B7280'
              }}
            >
              →
            </button>
          </div>

          {/* Statistics Boxes */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              background: '#fff',
              padding: '16px 20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              minWidth: '140px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Count of days present</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#10B981' }}>{statistics.daysPresent}</div>
            </div>
            <div style={{
              background: '#fff',
              padding: '16px 20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              minWidth: '140px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Leaves count</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#F59E0B' }}>{statistics.leavesCount}</div>
            </div>
            <div style={{
              background: '#fff',
              padding: '16px 20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              minWidth: '140px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Total working days</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#4F46E5' }}>{statistics.totalWorkingDays}</div>
            </div>
          </div>
        </div>

        {/* Today's Status Card */}
        <div className="today-status-card" style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Today's Status</h3>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '15px' }}>
            <div>
              <strong>Check In:</strong> {todayStatus?.check_in_time || 'Not checked in'}
            </div>
            <div>
              <strong>Check Out:</strong> {todayStatus?.check_out_time || 'Not checked out'}
            </div>
            <div style={{ marginLeft: 'auto' }}>
              {!todayStatus?.checked_in ? (
                <Button onClick={handleCheckIn} variant="success">
                  Check In
                </Button>
              ) : !todayStatus?.checked_out ? (
                <Button onClick={handleCheckOut} variant="danger">
                  Check Out
                </Button>
              ) : (
                <span className="badge badge-success">Completed</span>
              )}
            </div>
          </div>
        </div>

        {/* Current Date Display */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#111827' 
          }}>
            {formatDate(new Date())}
          </h2>
        </div>

        {/* Attendance Table */}
        {loading ? (
          <div className="loader-container" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="table-container" style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                    }}>Date</th>
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
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: '#6B7280',
                      fontSize: '14px'
                    }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ 
                        padding: '40px', 
                        textAlign: 'center', 
                        color: '#6B7280' 
                      }}>
                        No attendance records found for this month
                      </td>
                    </tr>
                  ) : (
                    attendances.map((att) => {
                      const workHours = calculateWorkHours(att.check_in, att.check_out)
                      const extraHours = calculateExtraHours(workHours)
                      return (
                        <tr key={att.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {new Date(att.date).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric' 
                            })}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {att.check_in || '-'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {att.check_out || '-'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {workHours}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {extraHours}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              background: att.status === 'present' ? '#d1fae5' : att.status === 'absent' ? '#fee2e2' : '#fef3c7',
                              color: att.status === 'present' ? '#065f46' : att.status === 'absent' ? '#991b1b' : '#92400e'
                            }}>
                              {att.status || 'Absent'}
                            </span>
                          </td>
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
    </div>
  )
}

export default Attendance
