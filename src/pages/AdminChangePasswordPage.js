import React, { useState } from "react";
import { useData } from "../context/DataContext";
import "../css/AdminForms.css";

function AdminChangePasswordPage() {
  const { currentUser, changePassword } = useData();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      changePassword(currentUser.id, currentPassword, newPassword);
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { label: "", color: "" };
    if (password.length < 6) return { label: "Weak", color: "#f44336" };
    if (password.length < 10) return { label: "Medium", color: "#ff9800" };
    return { label: "Strong", color: "#4caf50" };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="admin-form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>🔐 Security Settings</h2>
        <p style={{ color: '#7f8c8d', margin: '5px 0' }}>Update your password to keep your account secure.</p>
      </div>

      <div style={{ 
        background: '#fff', 
        padding: '30px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #edf2f7'
      }}>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label style={{ fontWeight: '600', color: '#4a5568' }}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', marginTop: '5px' }}
            />
          </div>

          <div className="admin-form-group" style={{ marginTop: '20px' }}>
            <label style={{ fontWeight: '600', color: '#4a5568' }}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', marginTop: '5px' }}
            />
            {newPassword && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '4px', background: '#edf2f7', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: strength.label === 'Weak' ? '33%' : strength.label === 'Medium' ? '66%' : '100%', 
                    height: '100%', 
                    background: strength.color 
                  }}></div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>

          <div className="admin-form-group" style={{ marginTop: '20px' }}>
            <label style={{ fontWeight: '600', color: '#4a5568' }}>Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Re-type new password"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginTop: '35px' }}>
            <button 
              type="submit" 
              style={{ 
                background: '#007bff', 
                color: '#fff', 
                border: 'none', 
                padding: '14px', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                width: '100%',
                fontSize: '16px'
              }}
            >
              Update Password
            </button>
          </div>
        </form>

        {message && (
          <div style={{ marginTop: '25px', padding: '15px', background: '#f0fff4', color: '#2f855a', borderRadius: '8px', fontSize: '14px', border: '1px solid #c6f6d5', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>✓</span> {message}
          </div>
        )}
        {error && (
          <div style={{ marginTop: '25px', padding: '15px', background: '#fff5f5', color: '#c53030', borderRadius: '8px', fontSize: '14px', border: '1px solid #fed7d7', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⚠</span> {error}
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#fff9db', borderRadius: '12px', border: '1px solid #fff3bf' }}>
        <h4 style={{ margin: '0 0 10px', color: '#856404' }}>Password Requirements:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404', fontSize: '14px' }}>
          <li>At least 8 characters long</li>
          <li>Must be different from your current password</li>
          <li>Include numbers and special characters for better security</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminChangePasswordPage;
