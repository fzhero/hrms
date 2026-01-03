import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

const EmployeeManagement = () => {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
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
    fetchEmployees()
  }, [searchTerm])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params = searchTerm ? { search: searchTerm } : {}
      const response = await api.get('/admin/employees', { params })
      if (response.data.status) {
        setEmployees(response.data.data.data || response.data.data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    try {
      const response = await api.post('/admin/employees', formData)
      if (response.data.status) {
        setSuccessMessage('Employee created successfully! Activation email sent.')
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
        fetchEmployees()
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
        fetchEmployees()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete employee')
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Employee Management</h1>
        <Button onClick={() => setShowAddModal(true)} variant="primary">
          Add Employee
        </Button>
      </div>

      {successMessage && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          {successMessage}
        </div>
      )}

      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <Input
          type="text"
          placeholder="Search by name, email, or employee ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          noWrapper={true}
        />
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No employees found</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.employee_id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.employee_profile?.department || '-'}</td>
                    <td>{emp.employee_profile?.designation || '-'}</td>
                    <td>
                      <span className={`badge badge-${emp.role}`}>{emp.role}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(emp.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

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
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
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

export default EmployeeManagement

