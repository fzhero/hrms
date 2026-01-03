import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import NavigationBar from '../../components/NavigationBar'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

const PayrollManagement = () => {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({
    monthly_wage: 0,
    working_days_per_week: 5,
    break_time_hours: 1.0,
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPayrolls()
  }, [searchTerm])

  const fetchPayrolls = async () => {
    try {
      setLoading(true)
      const params = searchTerm ? { search: searchTerm } : {}
      const response = await api.get('/admin/payrolls', { params })
      if (response.data.status) {
        const data = response.data.data.data || response.data.data || []
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching payrolls:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (employee) => {
    const salaryData = employee.salary_data || {}
    setSelectedEmployee(employee)
    setFormData({
      monthly_wage: salaryData.monthly_wage || employee.employee_profile?.salary || 0,
      working_days_per_week: salaryData.working_days_per_week || 5,
      break_time_hours: salaryData.break_time_hours || 1.0,
    })
    setShowEditModal(true)
    setErrors({})
    setSuccessMessage('')
  }

  const handleSave = async () => {
    if (!selectedEmployee) return

    try {
      setSaving(true)
      setErrors({})
      setSuccessMessage('')

      const response = await api.put(`/admin/payrolls/${selectedEmployee.id}`, formData)

      if (response.data.status) {
        setSuccessMessage('Salary structure updated successfully!')
        setTimeout(() => {
          setShowEditModal(false)
          setSelectedEmployee(null)
          fetchPayrolls()
        }, 1500)
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to update salary structure' })
      }
    } finally {
      setSaving(false)
    }
  }

  const calculateComponents = (monthlyWage) => {
    const basicSalary = monthlyWage * 0.50
    const hra = basicSalary * 0.50
    const standardAllowance = basicSalary * 0.1667
    const performanceBonus = basicSalary * 0.0833
    const lta = basicSalary * 0.0833
    const fixedAllowance = monthlyWage - (basicSalary + hra + standardAllowance + performanceBonus + lta)
    const pfEmployee = basicSalary * 0.12
    const pfEmployer = basicSalary * 0.12
    const professionalTax = 200.00

    return {
      basic_salary: basicSalary,
      hra,
      standard_allowance: standardAllowance,
      performance_bonus: performanceBonus,
      lta,
      fixed_allowance: fixedAllowance,
      pf_employee: pfEmployee,
      pf_employer: pfEmployer,
      professional_tax: professionalTax,
    }
  }

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <NavigationBar activeTab="payroll" onTabChange={(tab) => {
        if (tab === 'employees') navigate('/admin/dashboard')
        if (tab === 'attendance') navigate('/admin/attendance')
        if (tab === 'leaves') navigate('/admin/leaves')
      }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '600', color: '#111827' }}>
            Payroll Management
          </h1>
        </div>

        {successMessage && (
          <div className="alert alert-success" style={{ 
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: '#D1FAE5',
            color: '#065F46',
            border: '1px solid #10B981'
          }}>
            {successMessage}
          </div>
        )}

        {/* Search Bar */}
        <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
          <Input
            type="text"
            placeholder="Search by name, email, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            noWrapper={true}
            style={{ width: '100%' }}
          />
        </div>

        {/* Payroll Table */}
        {loading ? (
          <div className="loader-container" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner"></div>
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
                    }}>Employee</th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: '#6B7280',
                      fontSize: '14px'
                    }}>Employee ID</th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'right', 
                      fontWeight: '600',
                      color: '#6B7280',
                      fontSize: '14px'
                    }}>Monthly Wage</th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'right', 
                      fontWeight: '600',
                      color: '#6B7280',
                      fontSize: '14px'
                    }}>Yearly Wage</th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: '#6B7280',
                      fontSize: '14px'
                    }}>Department</th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      fontWeight: '600',
                      color: '#6B7280',
                      fontSize: '14px'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ 
                        padding: '40px', 
                        textAlign: 'center', 
                        color: '#6B7280' 
                      }}>
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => {
                      const salaryData = employee.salary_data || {}
                      const monthlyWage = salaryData.monthly_wage || employee.employee_profile?.salary || 0
                      const yearlyWage = salaryData.yearly_wage || monthlyWage * 12

                      return (
                        <tr key={employee.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {employee.name || '-'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                            {employee.employee_id || '-'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                            {formatCurrency(monthlyWage)}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                            {formatCurrency(yearlyWage)}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                            {employee.employee_profile?.department || '-'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => navigate(`/admin/profile/${employee.id}`)}
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
                                onClick={() => handleEdit(employee)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#10B981',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer'
                                }}
                              >
                                Edit
                              </button>
                            </div>
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

      {/* Edit Modal */}
      {showEditModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Update Salary Structure - {selectedEmployee.name}</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {errors.general && (
                <div className="alert alert-error">{errors.general}</div>
              )}

              <div className="form-group">
                <label>Monthly Wage *</label>
                <Input
                  type="number"
                  value={formData.monthly_wage}
                  onChange={(e) => {
                    const monthlyWage = parseFloat(e.target.value) || 0
                    setFormData({
                      ...formData,
                      monthly_wage: monthlyWage,
                    })
                  }}
                  required
                  noWrapper={true}
                />
                {errors.monthly_wage && (
                  <span className="error-message">{errors.monthly_wage[0]}</span>
                )}
              </div>

              <div className="form-group">
                <label>Working Days per Week</label>
                <Input
                  type="number"
                  min="1"
                  max="7"
                  value={formData.working_days_per_week}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    working_days_per_week: parseInt(e.target.value) || 5 
                  })}
                  noWrapper={true}
                />
              </div>

              <div className="form-group">
                <label>Break Time (hours)</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={formData.break_time_hours}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    break_time_hours: parseFloat(e.target.value) || 1.0 
                  })}
                  noWrapper={true}
                />
              </div>

              {/* Preview of calculated components */}
              {formData.monthly_wage > 0 && (
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginTop: '16px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                    Calculated Components Preview:
                  </h4>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    <p>Basic Salary: {formatCurrency(calculateComponents(formData.monthly_wage).basic_salary)}</p>
                    <p>HRA: {formatCurrency(calculateComponents(formData.monthly_wage).hra)}</p>
                    <p>Total Allowances: {formatCurrency(
                      calculateComponents(formData.monthly_wage).standard_allowance +
                      calculateComponents(formData.monthly_wage).performance_bonus +
                      calculateComponents(formData.monthly_wage).lta +
                      calculateComponents(formData.monthly_wage).fixed_allowance
                    )}</p>
                    <p>PF (Employee): {formatCurrency(calculateComponents(formData.monthly_wage).pf_employee)}</p>
                    <p>Yearly Wage: {formatCurrency(formData.monthly_wage * 12)}</p>
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedEmployee(null)
                    setErrors({})
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving || formData.monthly_wage <= 0}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PayrollManagement

