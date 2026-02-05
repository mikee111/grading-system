import React, { useState } from "react";
import { useData } from "../context/DataContext";
import "../css/AdminForms.css";

function AdminProfilePage() {
  const { currentUser, updateUserProfile } = useData();
  const [profileData, setProfileData] = useState({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      updateUserProfile(currentUser.id, profileData);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>👤 My Profile</h2>
        <p style={{ color: '#7f8c8d', margin: '5px 0' }}>Manage your account information and preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Left Column: Account Summary (Read-only) */}
        <div>
          <div style={{ 
            background: '#fff', 
            padding: '24px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #edf2f7',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: '#007bff', 
              color: '#fff', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '32px', 
              fontWeight: 'bold',
              margin: '0 auto 15px'
            }}>
              {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
            </div>
            <h3 style={{ margin: '0 0 5px' }}>{currentUser.firstName} {currentUser.lastName}</h3>
            <span style={{ 
              background: '#ebf8ff', 
              color: '#2b6cb0', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {currentUser.role}
            </span>

            <div style={{ marginTop: '25px', textAlign: 'left', fontSize: '14px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#a0aec0', display: 'block', fontSize: '12px', marginBottom: '4px' }}>ACCOUNT ROLE</label>
                <div style={{ fontWeight: '500', color: '#4a5568' }}>{currentUser.role === 'admin' ? 'Administrator' : 'Teacher'}</div>
              </div>
              <div>
                <label style={{ color: '#a0aec0', display: 'block', fontSize: '12px', marginBottom: '4px' }}>LAST LOGIN</label>
                <div style={{ fontWeight: '500', color: '#4a5568' }}>
                  {currentUser.lastLogin
                    ? new Date(currentUser.lastLogin).toLocaleString()
                    : "No login recorded yet"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile */}
        <div style={{ 
          background: '#fff', 
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #edf2f7'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid #edf2f7', paddingBottom: '10px' }}>
            Edit Personal Information
          </h3>
          
          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="admin-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                />
              </div>
              <div className="admin-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                />
              </div>
            </div>
            
            <div className="admin-form-group" style={{ marginTop: '15px' }}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
              />
            </div>

            <div style={{ marginTop: '30px' }}>
              <button 
                type="submit" 
                style={{ 
                  background: '#007bff', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '12px 24px', 
                  borderRadius: '6px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Save Changes
              </button>
            </div>
          </form>

          {message && (
            <div style={{ marginTop: '20px', padding: '12px', background: '#f0fff4', color: '#2f855a', borderRadius: '6px', fontSize: '14px', border: '1px solid #c6f6d5' }}>
              ✓ {message}
            </div>
          )}
          {error && (
            <div style={{ marginTop: '20px', padding: '12px', background: '#fff5f5', color: '#c53030', borderRadius: '6px', fontSize: '14px', border: '1px solid #fed7d7' }}>
              ⚠ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProfilePage;
