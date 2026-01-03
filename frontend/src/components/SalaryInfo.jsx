import { useState, useEffect } from 'react'
import api from '../api/axios'
import { isAdmin, getUser } from '../utils/roles'
import Button from './common/Button'

const SalaryInfo = ({ employeeId }) => {
  const [salaryData, setSalaryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    monthly_wage: 50000,
    yearly_wage: 600000,
    working_days_per_week: 5,
    break_time_hours: 1,
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  
  const currentUser = getUser()
  const isAdminUser = isAdmin()
  const targetUserId = employeeId || currentUser?.id

  useEffect(() => {
    fetchSalaryInfo()
  }, [targetUserId])

  const fetchSalaryInfo = async () => {
    try {
      setLoading(true)
      const endpoint = isAdminUser && employeeId
        ? `/admin/payrolls/${employeeId}`
        : '/employee/payroll'
      
      const response = await api.get(endpoint)
      if (response.data.status) {
        const data = response.data.data
        setSalaryData(data)
        setFormData({
          monthly_wage: data.monthly_wage || 50000,
          yearly_wage: data.yearly_wage || 600000,
          working_days_per_week: data.working_days_per_week || 5,
          break_time_hours: data.break_time_hours || 1,
        })
      }
    } catch (error) {
      console.error('Error fetching salary info:', error)
      // Use default values if API fails
      const defaultData = {
        monthly_wage: 50000,
        yearly_wage: 600000,
        working_days_per_week: 5,
        break_time_hours: 1,
      }
      setSalaryData(defaultData)
      setFormData(defaultData)
    } finally {
      setLoading(false)
    }
  }

  const calculateSalaryComponents = (monthlyWage) => {
    const basicSalary = monthlyWage * 0.50 // 50%
    const hra = basicSalary * 0.50 // 50% of basic
    const standardAllowance = basicSalary * 0.1667 // 16.67%
    const performanceBonus = basicSalary * 0.0833 // 8.33%
    const lta = basicSalary * 0.0833 // 8.33%
    const fixedAllowance = monthlyWage - (basicSalary + hra + standardAllowance + performanceBonus + lta)
    const pfEmployee = basicSalary * 0.12 // 12%
    const pfEmployer = basicSalary * 0.12 // 12%
    const professionalTax = 200.00 // Fixed

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

  const handleMonthlyWageChange = (value) => {
    const monthlyWage = parseFloat(value) || 0
    const yearlyWage = monthlyWage * 12
    const components = calculateSalaryComponents(monthlyWage)
    
    setFormData({
      ...formData,
      monthly_wage: monthlyWage,
      yearly_wage: yearlyWage,
      ...components
    })
  }

  const handleSave = async () => {
    if (!isAdminUser) return

    try {
      setSaving(true)
      setErrors({})
      setSuccessMessage('')

      const response = await api.put(`/admin/payrolls/${targetUserId}`, {
        monthly_wage: formData.monthly_wage,
        working_days_per_week: formData.working_days_per_week,
        break_time_hours: formData.break_time_hours,
      })

      if (response.data.status) {
        setSuccessMessage('Salary structure updated successfully!')
        setEditing(false)
        fetchSalaryInfo() // Refresh data
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

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  const data = salaryData || formData
  const components = calculateSalaryComponents(data.monthly_wage || 50000)

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827' }}>
            Salary Info
          </h2>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
            {isAdminUser ? 'Admin can view and update salary structure' : 'Read-only for employees'}
          </p>
        </div>
        {isAdminUser && !editing && (
          <Button
            variant="primary"
            onClick={() => setEditing(true)}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Edit
          </Button>
        )}
        {isAdminUser && editing && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setEditing(false)
                setErrors({})
                setSuccessMessage('')
                fetchSalaryInfo() // Reset to original data
              }}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
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

      {errors.general && (
        <div className="alert alert-error" style={{ 
          marginBottom: '20px',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
          border: '1px solid #EF4444'
        }}>
          {errors.general}
        </div>
      )}

      {/* Wage Summary */}
      <div style={{
        background: '#f9fafb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Wage Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
              Month Wage
            </label>
            {editing && isAdminUser ? (
              <input
                type="number"
                value={formData.monthly_wage}
                onChange={(e) => handleMonthlyWageChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: errors.monthly_wage ? '1px solid #EF4444' : '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease-in-out',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4F46E5'
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.monthly_wage ? '#EF4444' : '#D1D5DB'
                  e.target.style.boxShadow = 'none'
                }}
              />
            ) : (
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                ₹{data.monthly_wage?.toLocaleString('en-IN') || '50,000'} / Month
              </p>
            )}
            {errors.monthly_wage && (
              <span className="error-message" style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                {errors.monthly_wage[0]}
              </span>
            )}
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
              Yearly wage
            </label>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              ₹{formData.yearly_wage?.toLocaleString('en-IN') || '6,00,000'} / Yearly
            </p>
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div style={{
        background: '#f9fafb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Working Hours Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
              No of working days in a week:
            </label>
            {editing && isAdminUser ? (
              <input
                type="number"
                min="1"
                max="7"
                value={formData.working_days_per_week}
                onChange={(e) => setFormData({ ...formData, working_days_per_week: parseInt(e.target.value) || 5 })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease-in-out',
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
            ) : (
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                {data.working_days_per_week || '5'}
              </p>
            )}
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
              Break Time:
            </label>
            {editing && isAdminUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={formData.break_time_hours}
                  onChange={(e) => setFormData({ ...formData, break_time_hours: parseFloat(e.target.value) || 1.0 })}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease-in-out',
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
                <span style={{ fontSize: '14px', color: '#6B7280' }}>/hrs</span>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                {data.break_time_hours || '1'} /hrs
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Salary Components */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Salary Components</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            {
              name: 'Basic Salary',
              amount: components.basic_salary,
              percentage: 50.00,
              description: 'Define Basic salary from company cost compute it based on monthly Wages'
            },
            {
              name: 'House Rent Allowance (HRA)',
              amount: components.hra,
              percentage: 50.00,
              description: 'HRA provided to employees 50% of the basic salary'
            },
            {
              name: 'Standard Allowance',
              amount: components.standard_allowance,
              percentage: 16.67,
              description: 'A standard allowance is a predetermined, fixed amount provided to employee as part of their salary'
            },
            {
              name: 'Performance Bonus',
              amount: components.performance_bonus,
              percentage: 8.33,
              description: 'Variable amount paid during payroll. The value defined by the company and calculated as a % of the basic salary'
            },
            {
              name: 'Leave Travel Allowance (LTA)',
              amount: components.lta,
              percentage: 8.33,
              description: 'LTA is paid by the company to employees to cover their travel expenses, and calculated as a % of the basic salary'
            },
            {
              name: 'Fixed Allowance',
              amount: components.fixed_allowance,
              percentage: ((components.fixed_allowance / (data.monthly_wage || 50000)) * 100).toFixed(2),
              description: 'fixed allowance portion of wages is determined after calculating all salary components'
            }
          ].map((component, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                background: '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    {component.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
                    {component.description}
                  </p>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    ₹{component.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
                    ({component.percentage}%)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provident Fund Contribution */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Provident Fund (PF) Contribution</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            {
              name: 'Employee',
              amount: components.pf_employee,
              percentage: 12.00,
              description: 'PF is calculated based on the basic salary'
            },
            {
              name: 'Employer',
              amount: components.pf_employer,
              percentage: 12.00,
              description: 'PF is calculated based on the basic salary'
            }
          ].map((pf, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                background: '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    {pf.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
                    {pf.description}
                  </p>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    ₹{pf.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
                    ({pf.percentage}%)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Deductions */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Tax Deductions</h3>
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            background: '#fff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                Professional Tax
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
                Professional Tax deducted from the Gross salary
              </p>
            </div>
            <div style={{ textAlign: 'right', marginLeft: '16px' }}>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                ₹{components.professional_tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalaryInfo
