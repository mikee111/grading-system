import React, { useState } from "react";
import { useData } from "../context/DataContext";
import "../css/AdminForms.css";

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
    <div className="admin-form-container">
      <h2>Role Management</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-group">
          <label>Select User:</label>
          <select
            onChange={handleUserSelect}
            value={selectedUserId}
          >
            <option value="">-- Select a User --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <div className="admin-form-group">
          <label>New Role:</label>
          <select
            onChange={handleRoleChange}
            value={newRole}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Update Role</button>
      </form>

      {message && <p className="admin-message">{message}</p>}
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}

export default AdminRoleManagementPage;