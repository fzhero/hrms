import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import NavigationBar from '../../components/NavigationBar'
import { isAdmin, getUser } from '../../utils/roles'
import SalaryInfo from '../../components/SalaryInfo'
import EmployeeSalaryInfo from '../../components/EmployeeSalaryInfo'

const Profile = () => {
  const navigate = useNavigate()
  const { id } = useParams() // For admin viewing employee profile
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const user = getUser()
  const isAdminUser = isAdmin()
  const isViewingOtherProfile = isAdminUser && id && id !== user?.id
  const [activeTab, setActiveTab] = useState(!isAdminUser ? 'private' : 'resume') // 'resume', 'private', 'salary', 'security'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    department: '',
    designation: '',
    about: '',
    interests: '',
    job_love: '',
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const endpoint = isViewingOtherProfile 
        ? `/admin/employees/${id}` 
        : '/employee/profile'
      const response = await api.get(endpoint)
      if (response.data.status) {
        const data = response.data.data
        setProfile(data)
        setFormData({
          name: data.name || '',
          phone: data.profile?.phone || '',
          address: data.profile?.address || '',
          department: data.profile?.department || '',
          designation: data.profile?.designation || '',
          about: data.profile?.about || '',
          interests: data.profile?.interests || '',
          job_love: data.profile?.job_love || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    try {
      const endpoint = isViewingOtherProfile
        ? `/admin/employees/${id}`
        : '/employee/profile'
      const response = await api.put(endpoint, formData)
      if (response.data.status) {
        setSuccessMessage('Profile updated successfully!')
        setEditing(false)
        fetchProfile()
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to update profile' })
      }
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <NavigationBar />
        <div className="loader-container" style={{ padding: '40px' }}>
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <NavigationBar activeTab="employees" />
      
      <div className="profile-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Left Panel - Profile Info */}
          <div style={{ flex: '0 0 400px' }}>
            <div className="profile-card" style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '24px'
            }}>
              {/* Profile Picture */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  margin: '0 auto',
                  position: 'relative',
                  border: '4px solid #e5e7eb'
                }}>
                  {profile?.profile_photo || profile?.employee_profile?.profile_photo ? (
                    <img 
                      src={profile.profile_photo || profile.employee_profile.profile_photo} 
                      alt={profile.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    getInitials(profile?.name || 'U')
                  )}
                  {editing && (
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#4F46E5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      <span style={{ color: 'white', fontSize: '16px' }}>✏️</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                {editing ? (
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Name"
                    noWrapper={true}
                    style={{ textAlign: 'center', fontSize: '20px', fontWeight: '600' }}
                  />
                ) : (
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                    {profile?.name || 'My Name'}
                  </h2>
                )}
              </div>

              {/* Profile Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', display: 'block' }}>Login ID</label>
                  <Input
                    type="text"
                    value={profile?.employee_id || profile?.email || '-'}
                    disabled
                    noWrapper={true}
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', display: 'block' }}>Email</label>
                  <Input
                    type="email"
                    value={profile?.email || '-'}
                    disabled
                    noWrapper={true}
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', display: 'block' }}>Mobile</label>
                  {editing ? (
                    <Input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      noWrapper={true}
                      style={{ fontSize: '14px' }}
                    />
                  ) : (
                    <Input
                      type="text"
                      value={profile?.profile?.phone || profile?.employee_profile?.phone || '-'}
                      disabled
                      noWrapper={true}
                      style={{ fontSize: '14px' }}
                    />
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', display: 'block' }}>Company</label>
                  <Input
                    type="text"
                    value="Company Name"
                    disabled
                    noWrapper={true}
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', display: 'block' }}>Department</label>
                  {editing ? (
                    <Input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      noWrapper={true}
                      style={{ fontSize: '14px' }}
                    />
                  ) : (
                    <Input
                      type="text"
                      value={profile?.profile?.department || profile?.employee_profile?.department || '-'}
                      disabled
                      noWrapper={true}
                      style={{ fontSize: '14px' }}
                    />
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', display: 'block' }}>Manager</label>
                  <Input
                    type="text"
                    value={profile?.profile?.manager || profile?.employee_profile?.manager || '-'}
                    disabled
                    noWrapper={true}
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', display: 'block' }}>Location</label>
                  {editing ? (
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      noWrapper={true}
                      style={{ fontSize: '14px' }}
                    />
                  ) : (
                    <Input
                      type="text"
                      value={profile?.profile?.address || profile?.employee_profile?.address || '-'}
                      disabled
                      noWrapper={true}
                      style={{ fontSize: '14px' }}
                    />
                  )}
                </div>
              </div>

              {/* Profile Tabs */}
              {/* Tabs - Different for Admin and Employee */}
              {!isAdminUser ? (
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginTop: '24px',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '16px'
                }}>
                  <button
                    onClick={() => setActiveTab('private')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: activeTab === 'private' ? '#4F46E5' : 'transparent',
                      color: activeTab === 'private' ? '#fff' : '#6B7280',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: activeTab === 'private' ? '600' : '500'
                    }}
                  >
                    Private Info
                  </button>
                  <button
                    onClick={() => setActiveTab('salary')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: activeTab === 'salary' ? '#4F46E5' : 'transparent',
                      color: activeTab === 'salary' ? '#fff' : '#6B7280',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: activeTab === 'salary' ? '600' : '500'
                    }}
                  >
                    Salary Info
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: activeTab === 'security' ? '#4F46E5' : 'transparent',
                      color: activeTab === 'security' ? '#fff' : '#6B7280',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: activeTab === 'security' ? '600' : '500'
                    }}
                  >
                    Security
                  </button>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginTop: '24px',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '16px'
                }}>
                  <button
                    onClick={() => setActiveTab('resume')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: activeTab === 'resume' ? '#4F46E5' : 'transparent',
                      color: activeTab === 'resume' ? '#fff' : '#6B7280',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: activeTab === 'resume' ? '600' : '500'
                    }}
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => setActiveTab('private')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: activeTab === 'private' ? '#4F46E5' : 'transparent',
                      color: activeTab === 'private' ? '#fff' : '#6B7280',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: activeTab === 'private' ? '600' : '500'
                    }}
                  >
                    Private Info
                  </button>
                  <button
                    onClick={() => setActiveTab('salary')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: activeTab === 'salary' ? '#4F46E5' : 'transparent',
                      color: activeTab === 'salary' ? '#fff' : '#6B7280',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: activeTab === 'salary' ? '600' : '500'
                    }}
                  >
                    Salary Info
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {!editing ? (
                <Button 
                  onClick={() => setEditing(true)} 
                  variant="primary"
                  style={{ flex: 1 }}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => {
                      setEditing(false)
                      fetchProfile()
                    }} 
                    variant="secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdate} 
                    variant="primary"
                    style={{ flex: 1 }}
                  >
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Tab Content */}
          <div style={{ flex: 1 }}>
            {successMessage && (
              <div className="alert alert-success" style={{ marginBottom: '20px', padding: '12px', background: '#d1fae5', color: '#065f46', borderRadius: '6px' }}>
                {successMessage}
              </div>
            )}

            {activeTab === 'resume' && (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ marginTop: 0 }}>Resume</h3>
                <p style={{ color: '#6B7280' }}>Resume content will be displayed here.</p>
              </div>
            )}

            {activeTab === 'private' && (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {!isAdminUser ? (
                  // Employee view - Personal Details and Bank Details (Read-only)
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Personal Details Column */}
                    <div>
                      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                        Personal Details
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            Date of Birth
                          </label>
                          <Input
                            type="date"
                            value={profile?.profile?.date_of_birth || profile?.employee_profile?.date_of_birth || ''}
                            disabled
                            noWrapper={true}
                            style={{ fontSize: '14px', background: '#f9fafb' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            Residing Address
                          </label>
                          <Input
                            type="text"
                            value={profile?.profile?.address || profile?.employee_profile?.address || '-'}
                            disabled
                            noWrapper={true}
                            style={{ fontSize: '14px', background: '#f9fafb' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            Nationality
                          </label>
                          <Input
                            type="text"
                            value={profile?.profile?.nationality || profile?.employee_profile?.nationality || '-'}
                            disabled
                            noWrapper={true}
                            style={{ fontSize: '14px', background: '#f9fafb' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            Personal Email
                          </label>
                          <Input
                            type="email"
                            value={profile?.profile?.personal_email || profile?.employee_profile?.personal_email || '-'}
                            disabled
                            noWrapper={true}
                            style={{ fontSize: '14px', background: '#f9fafb' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            Gender
                          </label>
                          <Input
                            type="text"
                            value={profile?.profile?.gender || profile?.employee_profile?.gender || '-'}
                            disabled
                            noWrapper={true}
                            style={{ fontSize: '14px', background: '#f9fafb' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            Marital Status
                          </label>
                          <Input
                            type="text"
                            value={profile?.profile?.marital_status || profile?.employee_profile?.marital_status || '-'}
                            disabled
                            noWrapper={true}
                            style={{ fontSize: '14px', background: '#f9fafb' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            Date of Joining
                          </label>
                          <Input
                            type="date"
                            value={profile?.profile?.joining_date || profile?.employee_profile?.joining_date || ''}
                            disabled
                            noWrapper={true}
                            style={{ fontSize: '14px', background: '#f9fafb' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bank Details Column */}
                    <div>
                      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                        Bank Details
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            Account Number
                          </label>
                          <Input
                            type="text"
                            value={profile?.profile?.account_number || profile?.employee_profile?.account_number || '-'}
                            disabled
                            noWrapper={true}
                            style={{ fontSize: '14px', background: '#f9fafb' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            Bank Name
                          </label>
                          <Input
                            type="text"
                            value={profile?.profile?.bank_name || profile?.employee_profile?.bank_name || '-'}
                            disabled
                            noWrapper={true}
                            style={{ fontSize: '14px', background: '#f9fafb' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            IFSC Code
                          </label>
                          <Input
                            type="text"
                            value={profile?.profile?.ifsc_code || profile?.employee_profile?.ifsc_code || '-'}
                            disabled
                            noWrapper={true}
                            style={{ fontSize: '14px', background: '#f9fafb' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            PAN NO
                          </label>
                          <Input
                            type="text"
                            value={profile?.profile?.pan_no || profile?.employee_profile?.pan_no || '-'}
                            disabled
                            noWrapper={true}
                            style={{ fontSize: '14px', background: '#f9fafb' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            UAN NO
                          </label>
                          <Input
                            type="text"
                            value={profile?.profile?.uan_no || profile?.employee_profile?.uan_no || '-'}
                            disabled
                            noWrapper={true}
                            style={{ fontSize: '14px', background: '#f9fafb' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            Emp Code
                          </label>
                          <Input
                            type="text"
                            value={profile?.profile?.emp_code || profile?.employee_profile?.emp_code || profile?.employee_id || '-'}
                            disabled
                            noWrapper={true}
                            style={{ fontSize: '14px', background: '#f9fafb' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Admin view - Editable
                  <>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0 }}>About</h3>
                        {editing && <span style={{ cursor: 'pointer', fontSize: '18px' }}>✏️</span>}
                      </div>
                      {editing ? (
                        <textarea
                          value={formData.about}
                          onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                          placeholder="Tell us about yourself..."
                          style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'inherit'
                          }}
                        />
                      ) : (
                        <p style={{ color: '#6B7280', margin: 0 }}>
                          {profile?.profile?.about || profile?.employee_profile?.about || 'No information provided.'}
                        </p>
                      )}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0 }}>What I love about my job</h3>
                        {editing && <span style={{ cursor: 'pointer', fontSize: '18px' }}>✏️</span>}
                      </div>
                      {editing ? (
                        <textarea
                          value={formData.job_love}
                          onChange={(e) => setFormData({ ...formData, job_love: e.target.value })}
                          placeholder="What do you love about your job?"
                          style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'inherit'
                          }}
                        />
                      ) : (
                        <p style={{ color: '#6B7280', margin: 0 }}>
                          {profile?.profile?.job_love || profile?.employee_profile?.job_love || 'No information provided.'}
                        </p>
                      )}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0 }}>My interests and hobbies</h3>
                        {editing && <span style={{ cursor: 'pointer', fontSize: '18px' }}>✏️</span>}
                      </div>
                      {editing ? (
                        <textarea
                          value={formData.interests}
                          onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                          placeholder="Share your interests and hobbies..."
                          style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'inherit'
                          }}
                        />
                      ) : (
                        <p style={{ color: '#6B7280', margin: 0 }}>
                          {profile?.profile?.interests || profile?.employee_profile?.interests || 'No information provided.'}
                        </p>
                      )}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ marginBottom: '16px' }}>Skills</h3>
                      <div style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '16px',
                        minHeight: '100px'
                      }}>
                        <p style={{ color: '#6B7280', margin: 0, marginBottom: '12px' }}>No skills added yet.</p>
                        <Button variant="secondary" style={{ fontSize: '14px' }}>
                          + Add Skills
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 style={{ marginBottom: '16px' }}>Certification</h3>
                      <div style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '16px',
                        minHeight: '100px'
                      }}>
                        <p style={{ color: '#6B7280', margin: 0, marginBottom: '12px' }}>No certifications added yet.</p>
                        <Button variant="secondary" style={{ fontSize: '14px' }}>
                          + Add Certification
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'salary' && (
              <>
                {isAdminUser ? (
                  <SalaryInfo employeeId={isViewingOtherProfile ? id : user?.id} />
                ) : !isAdminUser ? (
                  <EmployeeSalaryInfo employeeId={user?.id} profile={profile} />
                ) : null}
              </>
            )}

            {activeTab === 'security' && !isAdminUser && (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                  Security
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                      Email
                    </label>
                    <Input
                      type="email"
                      value={profile?.email || '-'}
                      disabled
                      noWrapper={true}
                      style={{ fontSize: '14px', background: '#f9fafb' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                      Password
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Input
                        type="password"
                        value="••••••••"
                        disabled
                        noWrapper={true}
                        style={{ flex: 1, fontSize: '14px', background: '#f9fafb' }}
                      />
                      <Button
                        variant="secondary"
                        onClick={() => navigate('/change-password')}
                        style={{ padding: '10px 20px', fontSize: '14px' }}
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                      Two-Factor Authentication
                    </label>
                    <div style={{
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      background: '#f9fafb'
                    }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
                        Two-factor authentication is not enabled.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                      Login History
                    </label>
                    <div style={{
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      background: '#f9fafb'
                    }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
                        No login history available.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
