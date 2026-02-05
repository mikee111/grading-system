import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { Navigate } from "react-router-dom";
import "../css/AdminForms.css";

function AdminUserRoleAssignmentPage() {
  const { users, currentUser, updateUserRole, roles } = useData();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isSuperAdmin = currentUser && currentUser.id === "admin1";

  if (!isSuperAdmin) {
    return <Navigate to="/admin/overview" replace />;
  }

  const handleRoleChange = (e) => {
    setNewRole(e.target.value);
  };

  const handleEditClick = (user) => {
    if (user.id === currentUser.id) {
      setError("You cannot change your own role.");
      setMessage("");
      return;
    }
    if (user.id === "admin1") {
      setError("Super Admin role cannot be changed.");
      setMessage("");
      return;
    }
    setSelectedUserId(user.id);
    setNewRole(user.role);
    setError("");
    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!selectedUserId) {
      setError("Please choose a user to edit.");
      return;
    }
    try {
      updateUserRole(selectedUserId, newRole);
      setMessage(`Role updated successfully!`);
      setSelectedUserId("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-page-container">
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>👥 User Role Assignment</h2>
        <p style={{ color: '#7f8c8d', margin: '5px 0' }}>Assign roles to users to control system access.</p>
      </div>

      <div className="admin-form-container" style={{ maxWidth: "100%", border: "1px solid #ddd", backgroundColor: "white", padding: 0, overflow: "hidden" }}>
        <div style={{ backgroundColor: "#f2f2f2", padding: "15px 20px", borderBottom: "1px solid #ddd" }}>
          <h3 style={{ margin: 0 }}>Active Users</h3>
        </div>
        
        <div style={{ padding: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #edf2f7', textAlign: 'left', color: '#718096', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold' }}>
                <th style={{ padding: '12px' }}>User Information</th>
                <th style={{ padding: '12px' }}>Current Role</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', background: '#edf2f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4a5568' }}>
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#2d3748' }}>{user.firstName} {user.lastName}</div>
                        <div style={{ fontSize: '12px', color: '#a0aec0' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      background: user.role === 'admin' ? '#fed7d7' : user.role === 'teacher' ? '#c6f6d5' : '#ebf8ff',
                      color: user.role === 'admin' ? '#c53030' : user.role === 'teacher' ? '#2f855a' : '#2b6cb0',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {user.id === "admin1" ? (
                      <span style={{ color: '#a0aec0', fontStyle: 'italic', fontSize: '12px' }}>System Protected</span>
                    ) : user.id === currentUser.id ? (
                      <span style={{ color: '#a0aec0', fontStyle: 'italic', fontSize: '12px' }}>Self (Locked)</span>
                    ) : (
                      <button 
                        type="button" 
                        className="admin-form-button"
                        onClick={() => handleEditClick(user)}
                        style={{ 
                          padding: '6px 16px', 
                          borderRadius: '6px', 
                          fontWeight: '600', 
                          cursor: 'pointer',
                        }}
                      >
                        Change Role
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedUserId && (
            <div style={{ marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0 }}>Update Role for: {users.find(u => u.id === selectedUserId)?.firstName}</h4>
                <button onClick={() => setSelectedUserId("")} style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer' }}>✕ Cancel</button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div className="admin-form-group" style={{ margin: 0, flex: 1 }}>
                  <select 
                    onChange={handleRoleChange} 
                    value={newRole}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0' }}
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.name.toLowerCase()}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  type="submit"
                  className="admin-form-button primary"
                  style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold' }}
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f0fff4', color: '#2f855a', borderRadius: '8px', border: '1px solid #c6f6d5' }}>
          ✓ {message}
        </div>
      )}
      {error && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#fff5f5', color: '#c53030', borderRadius: '8px', border: '1px solid #fed7d7' }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

export default AdminUserRoleAssignmentPage;
