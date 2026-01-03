import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import NavigationBar from '../../components/NavigationBar'
import { getUser } from '../../utils/roles'

const LeaveRequests = () => {
  const navigate = useNavigate()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [leaveBalances, setLeaveBalances] = useState({
    paidTimeOff: 24,
    sickTimeOff: 7
  })
  const [formData, setFormData] = useState({
    type: 'paid',
    from_date: '',
    to_date: '',
    allocation: '',
    attachment: null,
    reason: '',
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const userData = getUser()
    setCurrentUser(userData)
    fetchLeaves()
    fetchLeaveBalances()
  }, [])

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      const response = await api.get('/employee/leaves')
      if (response.data.status) {
        setLeaves(response.data.data.data || response.data.data)
      }
    } catch (error) {
      console.error('Error fetching leaves:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveBalances = async () => {
    try {
      // Calculate leave balances from approved leaves
      const response = await api.get('/employee/leaves', { params: { status: 'approved' } })
      if (response.data.status) {
        const data = response.data.data.data || response.data.data
        let paidDays = 0
        let sickDays = 0
        
        data.forEach(leave => {
          const days = Math.ceil(
            (new Date(leave.to_date) - new Date(leave.from_date)) / (1000 * 60 * 60 * 24)
          ) + 1
          
          if (leave.type === 'paid' || leave.type === 'annual' || leave.type === 'casual') {
            paidDays += days
          } else if (leave.type === 'sick') {
            sickDays += days
          }
        })
        
        // Assuming default balances (this should come from backend in real app)
        setLeaveBalances({
          paidTimeOff: Math.max(0, 24 - paidDays),
          sickTimeOff: Math.max(0, 7 - sickDays)
        })
      }
    } catch (error) {
      console.error('Error fetching leave balances:', error)
    }
  }

  const calculateDays = () => {
    if (!formData.from_date || !formData.to_date) return 0
    const from = new Date(formData.from_date)
    const to = new Date(formData.to_date)
    const diffTime = Math.abs(to - from)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  useEffect(() => {
    const days = calculateDays()
    setFormData(prev => ({ ...prev, allocation: days > 0 ? days.toFixed(2) : '' }))
  }, [formData.from_date, formData.to_date])

  const handleSubmitLeave = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('type', formData.type)
      formDataToSend.append('from_date', formData.from_date)
      formDataToSend.append('to_date', formData.to_date)
      formDataToSend.append('reason', formData.reason)
      if (formData.attachment) {
        formDataToSend.append('attachment', formData.attachment)
      }

      const response = await api.post('/employee/leaves', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.status) {
        setSuccessMessage('Leave request submitted successfully!')
        setShowAddModal(false)
        setFormData({
          type: 'paid',
          from_date: '',
          to_date: '',
          allocation: '',
          attachment: null,
          reason: '',
        })
        fetchLeaves()
        fetchLeaveBalances()
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else if (error.response?.data?.message) {
        // Handle duplicate/overlapping leave errors
        const message = error.response.data.message
        if (message.includes('overlaps') || message.includes('already exists') || message.includes('duplicate')) {
          setErrors({ 
            general: message,
            from_date: ['This date range overlaps with an existing leave request.'],
            to_date: ['This date range overlaps with an existing leave request.']
          })
        } else {
          setErrors({ general: message })
        }
      } else {
        setErrors({ general: 'Failed to submit leave request' })
      }
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return

    try {
      const response = await api.post(`/employee/leaves/${id}/cancel`)
      if (response.data.status) {
        setSuccessMessage('Leave request cancelled successfully!')
        fetchLeaves()
        fetchLeaveBalances()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel leave request')
    }
  }

  const getTimeOffTypeLabel = (type) => {
    const typeMap = {
      paid: 'Paid Time off',
      sick: 'Sick Leave',
      unpaid: 'Unpaid Leaves',
      annual: 'Paid Time off',
      casual: 'Paid Time off',
      emergency: 'Paid Time off',
      other: 'Paid Time off'
    }
    return typeMap[type] || type
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <NavigationBar activeTab="leaves" onTabChange={(tab) => {
        if (tab === 'employees') navigate('/employee/dashboard')
        if (tab === 'attendance') navigate('/employee/attendance')
      }} />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Sub-navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <button
            style={{
              padding: '12px 24px',
              border: 'none',
              background: '#EC4899',
              color: '#fff',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              transition: 'all 0.2s'
            }}
          >
            Time Off
          </button>
        </div>

        {/* Action and Summary Area */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            style={{
              background: '#EC4899',
              borderColor: '#EC4899',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            NEW
          </Button>

          {/* Leave Balances */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              minWidth: '200px'
            }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                Paid time Off
              </div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                {leaveBalances.paidTimeOff} Days Available
              </div>
            </div>
            <div style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              minWidth: '200px'
            }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                Sick time off
              </div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                {leaveBalances.sickTimeOff} Days Available
              </div>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            {successMessage}
          </div>
        )}

        {/* Time Off Requests Table */}
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
                    }}>Start Date</th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: '#6B7280',
                      fontSize: '14px'
                    }}>End Date</th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: '#6B7280',
                      fontSize: '14px'
                    }}>Time off Type</th>
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
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ 
                        padding: '40px', 
                        textAlign: 'center', 
                        color: '#6B7280' 
                      }}>
                        No leave requests found
                      </td>
                    </tr>
                  ) : (
                    leaves.map((leave) => {
                      return (
                        <tr key={leave.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {currentUser?.name || '[Emp Name]'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {formatDate(leave.from_date)}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {formatDate(leave.to_date)}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {getTimeOffTypeLabel(leave.type)}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              background: leave.status === 'approved' ? '#d1fae5' : 
                                         leave.status === 'rejected' ? '#fee2e2' : 
                                         leave.status === 'pending' ? '#fef3c7' : '#f3f4f6',
                              color: leave.status === 'approved' ? '#065f46' : 
                                    leave.status === 'rejected' ? '#991b1b' : 
                                    leave.status === 'pending' ? '#b45309' : '#6B7280'
                            }}>
                              {leave.status}
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

        {/* Time off Type Request Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <h2>Time off Type Request</h2>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmitLeave} className="modal-body">
                {errors.general && (
                  <div className="alert alert-error">{errors.general}</div>
                )}

                {/* Employee (Read-only) */}
                <div className="form-group">
                  <label>Employee</label>
                  <input
                    type="text"
                    value={currentUser?.name || '[Employee]'}
                    readOnly
                    className="form-control"
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>

                {/* Time off Type */}
                <div className="form-group">
                  <label>Time off Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-control"
                    required
                  >
                    <option value="paid">Paid Time off</option>
                    <option value="sick">Sick Leave</option>
                    <option value="unpaid">Unpaid Leaves</option>
                  </select>
                  {errors.type && <span className="error-message">{errors.type[0]}</span>}
                </div>

                {/* Validity Period */}
                <div className="form-group">
                  <label>Validity Period *</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <Input
                        type="date"
                        value={formData.from_date}
                        onChange={(e) => {
                          setFormData({ ...formData, from_date: e.target.value })
                          setErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.from_date
                            return newErrors
                          })
                        }}
                        required
                        noWrapper={true}
                        style={{ 
                          flex: 1,
                          borderColor: errors.from_date ? '#EF4444' : undefined
                        }}
                      />
                      {errors.from_date && (
                        <span className="error-message" style={{ 
                          display: 'block', 
                          marginTop: '4px', 
                          fontSize: '12px',
                          color: '#EF4444'
                        }}>
                          {errors.from_date[0]}
                        </span>
                      )}
                    </div>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>To</span>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <Input
                        type="date"
                        value={formData.to_date}
                        onChange={(e) => {
                          setFormData({ ...formData, to_date: e.target.value })
                          setErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.to_date
                            return newErrors
                          })
                        }}
                        required
                        noWrapper={true}
                        style={{ 
                          flex: 1,
                          borderColor: errors.to_date ? '#EF4444' : undefined
                        }}
                      />
                      {errors.to_date && (
                        <span className="error-message" style={{ 
                          display: 'block', 
                          marginTop: '4px', 
                          fontSize: '12px',
                          color: '#EF4444'
                        }}>
                          {errors.to_date[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Allocation (Days) */}
                <div className="form-group">
                  <label>Allocation</label>
                  <Input
                    type="number"
                    value={formData.allocation}
                    onChange={(e) => setFormData({ ...formData, allocation: e.target.value })}
                    placeholder="01.00 Days"
                    step="0.01"
                    min="0"
                    noWrapper={true}
                    readOnly
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                  <small style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginTop: '4px' }}>
                    Automatically calculated from validity period
                  </small>
                </div>

                {/* Attachment (For sick leave) */}
                {formData.type === 'sick' && (
                  <div className="form-group">
                    <label>Attachment <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'normal' }}>(For sick leave certificate)</span></label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFormData({ ...formData, attachment: e.target.files[0] })}
                      className="form-control"
                      style={{
                        padding: '10px 14px',
                        fontSize: '14px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    />
                    {formData.attachment && (
                      <small style={{ fontSize: '12px', color: '#10B981', display: 'block', marginTop: '4px' }}>
                        ✓ {formData.attachment.name}
                      </small>
                    )}
                  </div>
                )}

                {/* Reason */}
                <div className="form-group">
                  <label>Reason * <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'normal' }}>(Minimum 10 characters)</span></label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="form-control"
                    rows="4"
                    required
                    minLength={10}
                    placeholder="Please provide a detailed reason for your leave request (minimum 10 characters)..."
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    {errors.reason && (
                      <span className="error-message" style={{ color: '#EF4444', fontSize: '12px' }}>
                        {errors.reason[0] === 'validation.min.string' 
                          ? 'Reason must be at least 10 characters long.' 
                          : errors.reason[0]}
                      </span>
                    )}
                    <span style={{ 
                      fontSize: '12px', 
                      color: formData.reason.length < 10 ? '#EF4444' : '#6B7280',
                      marginLeft: 'auto'
                    }}>
                      {formData.reason.length}/10 characters
                    </span>
                  </div>
                </div>

                {/* TimeOff Types Info Box */}
                <div style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                    TimeOff Types:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#6B7280', fontSize: '14px' }}>
                    <li>Paid Time off</li>
                    <li>Sick Leave</li>
                    <li>Unpaid Leaves</li>
                  </ul>
                </div>

                <div className="modal-footer">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setShowAddModal(false)
                      setFormData({
                        type: 'paid',
                        from_date: '',
                        to_date: '',
                        allocation: '',
                        attachment: null,
                        reason: '',
                      })
                      setErrors({})
                    }}
                  >
                    Discard
                  </Button>
                  <Button type="submit" variant="primary" style={{ background: '#EC4899', borderColor: '#EC4899' }}>
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaveRequests
