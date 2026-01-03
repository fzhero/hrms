import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import NavigationBar from '../../components/NavigationBar'
import { isAdmin } from '../../utils/roles'

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([])
  const [filteredLeaves, setFilteredLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('timeOff') // 'timeOff' or 'allocation'
  const [filters, setFilters] = useState({
    status: '',
    type: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [adminComment, setAdminComment] = useState('')
  const [action, setAction] = useState('')
  const [leaveBalances, setLeaveBalances] = useState({
    paidTimeOff: 24,
    sickTimeOff: 7
  })

  useEffect(() => {
    fetchLeaves()
    fetchLeaveBalances()
  }, [filters])

  // Filter leaves based on search term and type filter
  useEffect(() => {
    let filtered = leaves

    // Apply type filter
    if (filters.type) {
      if (filters.type === 'paid') {
        // Filter for paid leave types: paid, annual, casual
        filtered = filtered.filter(leave => 
          ['paid', 'annual', 'casual'].includes(leave.type)
        )
      } else if (filters.type === 'unpaid') {
        // Filter for unpaid leave type
        filtered = filtered.filter(leave => leave.type === 'unpaid')
      } else if (filters.type === 'sick') {
        // Filter for sick leave type
        filtered = filtered.filter(leave => leave.type === 'sick')
      } else {
        // Filter for specific type
        filtered = filtered.filter(leave => leave.type === filters.type)
      }
    }

    // Apply search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(leave => {
        const name = leave.user?.name || ''
        const employeeId = leave.user?.employee_id || ''
        const search = searchTerm.toLowerCase()
        return name.toLowerCase().includes(search) || 
               employeeId.toLowerCase().includes(search)
      })
    }

    setFilteredLeaves(filtered)
  }, [searchTerm, leaves, filters.type])

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.status) params.status = filters.status
      // Only send specific type filters to backend, not grouped ones (paid, unpaid, sick)
      // Grouped types will be filtered on the frontend
      if (filters.type && !['paid', 'unpaid', 'sick'].includes(filters.type)) {
        params.type = filters.type
      }
      
      const response = await api.get('/admin/leaves', { params })
      if (response.data.status) {
        const data = response.data.data.data || response.data.data
        setLeaves(data)
        // Filtered leaves will be set by the useEffect hook
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
      const response = await api.get('/admin/leaves', { params: { status: 'approved' } })
      if (response.data.status) {
        const data = response.data.data.data || response.data.data
        let paidDays = 0
        let sickDays = 0
        
        data.forEach(leave => {
          const days = Math.ceil(
            (new Date(leave.to_date) - new Date(leave.from_date)) / (1000 * 60 * 60 * 24)
          ) + 1
          
          if (leave.type === 'annual' || leave.type === 'casual') {
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

  const handleStatusUpdate = async () => {
    if (!selectedLeave || !action) return

    try {
      const response = await api.put(`/admin/leaves/${selectedLeave.id}/status`, {
        status: action,
        admin_comment: adminComment,
      })
      if (response.data.status) {
        setShowModal(false)
        setSelectedLeave(null)
        setAdminComment('')
        setAction('')
        fetchLeaves()
        fetchLeaveBalances()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update leave status')
    }
  }

  const openModal = (leave, actionType) => {
    setSelectedLeave(leave)
    setAction(actionType)
    setShowModal(true)
  }

  const getTimeOffTypeLabel = (type) => {
    const typeMap = {
      annual: 'Paid time Off',
      casual: 'Paid time Off',
      sick: 'Sick time off',
      emergency: 'Emergency',
      other: 'Other'
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
      <NavigationBar activeTab="leaves" />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Sub-navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <button
            onClick={() => setActiveTab('timeOff')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'timeOff' ? '#EC4899' : 'transparent',
              color: activeTab === 'timeOff' ? '#fff' : '#6B7280',
              fontWeight: activeTab === 'timeOff' ? '600' : '500',
              fontSize: '14px',
              cursor: 'pointer',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              transition: 'all 0.2s'
            }}
          >
            Time Off
          </button>
          <button
            onClick={() => setActiveTab('allocation')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'allocation' ? '#EC4899' : 'transparent',
              color: activeTab === 'allocation' ? '#fff' : '#6B7280',
              fontWeight: activeTab === 'allocation' ? '600' : '500',
              fontSize: '14px',
              cursor: 'pointer',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              transition: 'all 0.2s'
            }}
          >
            Allocation
          </button>
        </div>

        {/* Action and Search Area */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          gap: '16px'
        }}>
          <Button
            variant="primary"
            onClick={() => {
              // Handle NEW button click - could open a modal to create new leave allocation
              alert('New Time Off Allocation feature coming soon')
            }}
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

        {/* Summary Statistics */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            flex: 1,
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
            flex: 1,
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

        {/* Filters */}
        {activeTab === 'timeOff' && (
          <div className="filters" style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#374151' }}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#374151' }}>Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
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
              >
                <option value="">All Types</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="sick">Sick</option>
                <option value="annual">Annual</option>
                <option value="casual">Casual</option>
                <option value="emergency">Emergency</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* Time Off Table */}
        {activeTab === 'timeOff' && (
          <>
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
                      {filteredLeaves.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ 
                            padding: '40px', 
                            textAlign: 'center', 
                            color: '#6B7280' 
                          }}>
                            {searchTerm ? 'No leave requests found matching your search' : 'No leave requests found'}
                          </td>
                        </tr>
                      ) : (
                        filteredLeaves.map((leave) => {
                          return (
                            <tr key={leave.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                                {leave.user?.name || '[Emp Name]'}
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
                                {leave.status === 'pending' && isAdmin() ? (
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                      onClick={() => openModal(leave, 'approved')}
                                      style={{
                                        padding: '6px 12px',
                                        background: '#10B981',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.target.style.background = '#059669'}
                                      onMouseLeave={(e) => e.target.style.background = '#10B981'}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => openModal(leave, 'rejected')}
                                      style={{
                                        padding: '6px 12px',
                                        background: '#EF4444',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.target.style.background = '#DC2626'}
                                      onMouseLeave={(e) => e.target.style.background = '#EF4444'}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
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
                                )}
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
          </>
        )}

        {/* Allocation Tab Content */}
        {activeTab === 'allocation' && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ color: '#6B7280', fontSize: '16px' }}>Allocation management coming soon</p>
          </div>
        )}

      {/* Modal for Approve/Reject */}
      {showModal && selectedLeave && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{action === 'approved' ? 'Approve' : 'Reject'} Leave Request</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Employee:</strong> {selectedLeave.user?.name}</p>
              <p><strong>Type:</strong> {getTimeOffTypeLabel(selectedLeave.type)}</p>
              <p><strong>From:</strong> {formatDate(selectedLeave.from_date)}</p>
              <p><strong>To:</strong> {formatDate(selectedLeave.to_date)}</p>
              <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Admin Comment (Optional)</label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  rows="3"
                  placeholder="Add a comment..."
                  style={{
                    width: '100%',
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
                    resize: 'vertical',
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

              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant={action === 'approved' ? 'success' : 'danger'}
                  onClick={handleStatusUpdate}
                >
                  {action === 'approved' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default LeaveManagement
