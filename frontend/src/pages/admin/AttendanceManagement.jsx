import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import NavigationBar from '../../components/NavigationBar'

const AttendanceManagement = () => {
  const navigate = useNavigate()
  const [attendances, setAttendances] = useState([])
  const [filteredAttendances, setFilteredAttendances] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('daily') // 'daily' or 'weekly'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (view === 'daily') {
      fetchDailyAttendance()
    } else {
      fetchWeeklyAttendance()
    }
  }, [view, selectedDate, selectedWeek])

  // Filter attendances based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAttendances(attendances)
    } else {
      const filtered = attendances.filter(att => {
        const name = att.user?.name || ''
        const employeeId = att.user?.employee_id || ''
        const search = searchTerm.toLowerCase()
        return name.toLowerCase().includes(search) || 
               employeeId.toLowerCase().includes(search)
      })
      setFilteredAttendances(filtered)
    }
  }, [searchTerm, attendances])

  const fetchDailyAttendance = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/attendances', {
        params: { 
          from_date: selectedDate,
          to_date: selectedDate
        }
      })
      if (response.data.status) {
        const data = response.data.data.data || response.data.data || []
        setAttendances(data)
        setFilteredAttendances(data)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeeklyAttendance = async () => {
    try {
      setLoading(true)
      // Calculate week start and end dates
      const date = new Date(selectedWeek)
      const day = date.getDay()
      const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
      const monday = new Date(date.setDate(diff))
      const sunday = new Date(date.setDate(diff + 6))
      
      const response = await api.get('/admin/attendances', {
        params: { 
          from_date: monday.toISOString().split('T')[0],
          to_date: sunday.toISOString().split('T')[0]
        }
      })
      if (response.data.status) {
        const data = response.data.data.data || response.data.data || []
        setAttendances(data)
        setFilteredAttendances(data)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekDates = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(date.setDate(diff))
    const sunday = new Date(date.setDate(diff + 6))
    return { monday, sunday }
  }

  const handlePrevDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
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

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <NavigationBar activeTab="attendance" onTabChange={(tab) => {
        if (tab === 'employees') navigate('/admin/dashboard')
        if (tab === 'leaves') navigate('/admin/leaves')
      }} />
      
      <div className="attendance-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Header with Title and Search */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '600', color: '#111827' }}>Attendance</h1>
          <div style={{ maxWidth: '300px', width: '100%' }}>
            <Input
              type="text"
              placeholder="Searchbar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              noWrapper={true}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Date Navigation and View Toggle */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Date Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handlePrevDay}
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
            
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
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
              onClick={handleNextDay}
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

            <button
              onClick={() => setView('daily')}
              style={{
                padding: '8px 16px',
                background: view === 'daily' ? '#4F46E5' : '#fff',
                color: view === 'daily' ? '#fff' : '#6B7280',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: view === 'daily' ? '600' : '500',
                marginLeft: '8px'
              }}
            >
              Day
            </button>
          </div>

          {/* View Toggle (Weekly) */}
          {view === 'weekly' && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Select Week:
              </label>
              <input
                type="date"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
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
                  maxWidth: '200px',
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
            </div>
          )}
        </div>

        {/* Date Display */}
        {view === 'daily' && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#111827' 
            }}>
              {formatDate(selectedDate)}
            </h2>
          </div>
        )}

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
                    {view === 'weekly' && (
                      <th style={{ 
                        padding: '12px', 
                        textAlign: 'left', 
                        fontWeight: '600',
                        color: '#6B7280',
                        fontSize: '14px'
                      }}>Date</th>
                    )}
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
                  {filteredAttendances.length === 0 ? (
                    <tr>
                      <td colSpan={view === 'weekly' ? 6 : 5} style={{ 
                        padding: '40px', 
                        textAlign: 'center', 
                        color: '#6B7280' 
                      }}>
                        {searchTerm ? 'No attendance records found matching your search' : 'No attendance records found'}
                      </td>
                    </tr>
                  ) : (
                    filteredAttendances.map((att) => {
                      const workHours = calculateWorkHours(att.check_in, att.check_out)
                      const extraHours = calculateExtraHours(workHours)
                      return (
                        <tr key={att.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          {view === 'weekly' && (
                            <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                              {new Date(att.date).toLocaleDateString()}
                            </td>
                          )}
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {att.user?.name || '[Employee]'}
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

export default AttendanceManagement
