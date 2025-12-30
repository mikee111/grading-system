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

  const handleEditClick = (user) => {
    if (user.id === "admin1") {
      setError("Default admin role cannot be changed.");
      setMessage("");
      return;
    }
    setSelectedUserId(user.id);
    setNewRole(user.role === "admin" || user.role === "teacher" ? user.role : "teacher");
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
      setMessage(`Role for user ${selectedUserId} updated to ${newRole} successfully!`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Role Management</h2>
      <div className="admin-form">
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {user.id === "admin1" ? (
                    <span>Default admin (locked)</span>
                  ) : (
                    <button type="button" onClick={() => handleEditClick(user)}>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {selectedUserId && (
          <form onSubmit={handleSubmit} style={{ marginTop: "16px", display: "flex", gap: 12, alignItems: "center" }}>
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label style={{ marginRight: 8 }}>New Role:</label>
              <select onChange={handleRoleChange} value={newRole}>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <button type="submit">Update Role</button>
          </form>
        )}
      </div>

      {message && <p className="admin-message">{message}</p>}
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}

export default AdminRoleManagementPage;
