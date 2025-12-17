import React, { useState } from "react";
import { useData } from "../context/DataContext";

function AdminRoleManagementPage() {
  const { users, updateUserRole } = useData();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRoleChange = (e) => {
    setNewRole(e.target.value);
  };

  const handleUserSelect = (e) => {
    setSelectedUserId(e.target.value);
    setError("");
    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!selectedUserId) {
      setError("Please select a user.");
      return;
    }
    try {
      updateUserRole(selectedUserId, newRole);
      setMessage(`Role for user ${selectedUserId} updated to ${newRole} successfully!`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '500px',
      margin: '0 auto',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Role Management</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Select User:</label>
          <select
            onChange={handleUserSelect}
            value={selectedUserId}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            <option value="">-- Select a User --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>New Role:</label>
          <select
            onChange={handleRoleChange}
            value={newRole}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >Update Role</button>
      </form>

      {message && <p style={{ color: 'green', textAlign: 'center', marginTop: '15px' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '15px' }}>{error}</p>}
    </div>
  );
}

export default AdminRoleManagementPage;