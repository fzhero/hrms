import { useState, useEffect } from 'react'
import api from '../api/axios'
import Input from './common/Input'

const EmployeeSalaryInfo = ({ employeeId, profile }) => {
  const [salaryData, setSalaryData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSalaryInfo()
  }, [employeeId])

  const fetchSalaryInfo = async () => {
    try {
      setLoading(true)
      const response = await api.get('/employee/payroll')
      if (response.data.status) {
        setSalaryData(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching salary info:', error)
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

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  const data = salaryData || {
    monthly_wage: profile?.employee_profile?.salary || 50000,
    yearly_wage: (profile?.employee_profile?.salary || 50000) * 12,
    working_days_per_week: 5,
    break_time_hours: 1.0,
  }
  const components = calculateSalaryComponents(data.monthly_wage || 50000)

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '600', color: '#111827' }}>
        Salary Info
      </h2>

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
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              ₹{data.monthly_wage?.toLocaleString('en-IN') || '50,000'} / Month
            </p>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
              Yearly wage
            </label>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              ₹{data.yearly_wage?.toLocaleString('en-IN') || '6,00,000'} / Yearly
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
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              {data.working_days_per_week || '5'}
            </p>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
              Break Time:
            </label>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              {data.break_time_hours || '1'} /hrs
            </p>
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
      <div style={{ marginBottom: '24px' }}>
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

export default EmployeeSalaryInfo

