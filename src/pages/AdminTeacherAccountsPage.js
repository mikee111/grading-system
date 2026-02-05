import React, { useState } from "react";
import { useData } from "../context/DataContext";
import "../css/AdminForms.css";

function AdminTeacherAccountsPage() {
  const { 
    users, signUp, deleteUser, updateUser, updateUserRole, 
    resetPasswordByAdmin, currentUser, roles,
    subjects, teacherAssignments, assignTeacherToSubject, removeTeacherFromSubject,
    updateSubject
  } = useData();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    role: "teacher",
    accountStatus: "Active"
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: user.role || "teacher",
      accountStatus: user.accountStatus || "Active"
    });
    setMessage("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // 1. Update basic info
      updateUser(editingUser.id, {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        username: editFormData.username,
        accountStatus: editFormData.accountStatus
      });

      // 2. Update role if changed
      if (editFormData.role !== editingUser.role) {
        updateUserRole(editingUser.id, editFormData.role);
      }

      // 3. Ensure subject assignments are synced with teacherName field in subjects for fallback matching
      const currentAssignedIds = teacherAssignments[editingUser.id] || [];
      subjects.forEach(s => {
        if (currentAssignedIds.includes(s.id)) {
          // If explicitly assigned, update the subject's teacherName field to match this teacher's identifier
          const index = subjects.findIndex(sub => sub.id === s.id);
          if (index !== -1 && s.teacherName !== (editFormData.username || editFormData.email)) {
            updateSubject(index, { ...s, teacherName: editFormData.username || editFormData.email });
          }
        }
      });

      setMessage("User profile updated successfully!");
      setEditingUser(null);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    }
  };

  const handleResetPassword = () => {
    if (!editingUser) return;
    const newPassword = prompt(`Enter new password for ${editingUser.firstName}:`, "teacher123");
    if (newPassword) {
      resetPasswordByAdmin(editingUser.id, newPassword);
      alert("Password has been reset successfully!");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    const success = signUp(
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.password,
      "teacher",
      formData.username || formData.email
    );

    if (success) {
      setMessage(`Teacher account for ${formData.firstName} ${formData.lastName} created successfully! You can now login with Username: "${formData.username || formData.email}"`);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
      });
    } else {
      setError("Email or Username already exists.");
    }
  };

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this teacher account?")) {
      deleteUser(userId);
    }
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.accountStatus === "Inactive" ? "Active" : "Inactive";
    const action = newStatus === "Inactive" ? "lock" : "unlock";
    const confirmMsg = `Are you sure you want to ${action} this account?`;
    
    if (window.confirm(confirmMsg)) {
      updateUser(user.id, { accountStatus: newStatus });
    }
  };

  const teachers = users.filter((u) => 
    u.role?.toLowerCase() === "teacher" || 
    u.role?.toLowerCase() === "admin"
  );

  return (
    <div className="admin-page-container">
      <h2>Teacher Account Management</h2>
      
      {editingUser ? (
        <div className="admin-form-container" style={{ marginBottom: "30px", maxWidth: "100%", border: "1px solid #ddd", backgroundColor: "white", padding: 0, overflow: "hidden" }}>
          <div style={{ backgroundColor: "#f2f2f2", padding: "15px 20px", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Edit Teacher Profile: {editingUser.firstName} {editingUser.lastName}</h3>
            <button onClick={cancelEdit} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
          </div>
          
          <div style={{ padding: "20px" }}>
            <form onSubmit={handleUpdate} className="admin-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>First Name*</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Last Name*</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Email Address*</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={editFormData.username}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Role</label>
                  <select name="role" value={editFormData.role} onChange={handleEditChange}>
                    {roles.map(role => (
                      <option key={role.id} value={role.name.toLowerCase()}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Account Status</label>
                  <select name="accountStatus" value={editFormData.accountStatus} onChange={handleEditChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Locked</option>
                  </select>
                </div>
              </div>

              {/* Subject Assignment Section */}
              <div style={{ marginTop: "25px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px solid #eee" }}>
                <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>📚 Assigned Subjects</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
                  {(teacherAssignments[editingUser.id] || []).map(subId => {
                    const subject = subjects.find(s => s.id === subId);
                    return (
                      <div key={subId} style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px", 
                        padding: "6px 12px", 
                        backgroundColor: "#e3f2fd", 
                        color: "#0d47a1", 
                        borderRadius: "20px",
                        fontSize: "0.9rem",
                        fontWeight: "600"
                      }}>
                        {subject ? `${subject.name} (${subject.gradeLevel} - ${subject.section})` : subId}
                        <button 
                          type="button"
                          onClick={() => removeTeacherFromSubject(editingUser.id, subId)}
                          style={{ background: "none", border: "none", color: "#d32f2f", cursor: "pointer", fontSize: "1rem", padding: 0 }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  {(teacherAssignments[editingUser.id] || []).length === 0 && (
                    <p style={{ margin: 0, color: "#999", fontSize: "0.9rem" }}>No subjects assigned yet.</p>
                  )}
                </div>
                
                <div style={{ display: "flex", gap: "10px" }}>
                  <select 
                    id="subjectSelect"
                    style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                    onChange={(e) => {
                      if (e.target.value) {
                        assignTeacherToSubject(editingUser.id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">+ Assign New Subject...</option>
                    {subjects
                      .filter(s => !(teacherAssignments[editingUser.id] || []).includes(s.id))
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} - {s.gradeLevel} ({s.section})
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="submit" className="admin-form-button" style={{ flex: 1 }}>Save Changes</button>
                <button 
                  type="button" 
                  onClick={handleResetPassword} 
                  className="admin-form-button" 
                  style={{ flex: 1, backgroundColor: "#6c757d" }}
                >
                  Reset Password
                </button>
                <button 
                  type="button" 
                  onClick={cancelEdit} 
                  className="admin-form-button" 
                  style={{ flex: 1, backgroundColor: "#dc3545" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="admin-form-container" style={{ marginBottom: "30px", maxWidth: "100%", border: "1px solid #ddd", backgroundColor: "white", padding: 0, overflow: "hidden" }}>
          <div style={{ backgroundColor: "#f2f2f2", padding: "15px 20px", borderBottom: "1px solid #ddd" }}>
            <h3 style={{ margin: 0 }}>Create New Teacher Account</h3>
          </div>
          <div style={{ padding: "20px" }}>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>First Name*</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Last Name*</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Email Address*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Username (Optional)</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username (defaults to email)"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Password*</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="admin-form-button">Create Teacher Account</button>
            </form>
          </div>
        </div>
      )}
      
      {message && <p className="admin-message" style={{ color: "green", fontWeight: "bold" }}>{message}</p>}
      {error && <p className="admin-error" style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      <div className="admin-form-container" style={{ maxWidth: "100%", border: "1px solid #ddd", backgroundColor: "white", padding: 0, overflow: "hidden" }}>
        <div style={{ backgroundColor: "#f2f2f2", padding: "15px 20px", borderBottom: "1px solid #ddd" }}>
          <h3 style={{ margin: 0 }}>Existing Teacher Accounts</h3>
        </div>
        <div style={{ padding: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Email</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Username</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Role</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Subjects</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Last Login</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{teacher.firstName} {teacher.lastName}</td>
                  <td style={{ padding: "12px" }}>{teacher.email}</td>
                  <td style={{ padding: "12px" }}>{teacher.username}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      textTransform: "capitalize",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      backgroundColor: teacher.role === "admin" ? "#e3f2fd" : "#f5f5f5",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: teacher.role === "admin" ? "#0d47a1" : "#616161"
                    }}>
                      {teacher.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {(teacherAssignments[teacher.id] || []).length > 0 ? (
                        (teacherAssignments[teacher.id] || []).map(subId => {
                          const subject = subjects.find(s => s.id === subId);
                          return (
                            <span key={subId} style={{ 
                              padding: "2px 8px", 
                              borderRadius: "10px", 
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              backgroundColor: "#f3e5f5",
                              color: "#7b1fa2",
                              whiteSpace: "nowrap"
                            }}>
                              {subject ? subject.name : subId}
                            </span>
                          );
                        })
                      ) : (
                        <span style={{ color: "#999", fontSize: "0.85rem", fontStyle: "italic" }}>No subjects</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "12px", 
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      backgroundColor: teacher.accountStatus === "Inactive" ? "#ffebee" : "#e8f5e9",
                      color: teacher.accountStatus === "Inactive" ? "#c62828" : "#2e7d32"
                    }}>
                      {teacher.accountStatus === "Inactive" ? "Locked" : "Active"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>{teacher.lastLogin ? new Date(teacher.lastLogin).toLocaleString() : "Never"}</td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => startEdit(teacher)}
                        style={{ backgroundColor: "#007bff", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(teacher)}
                        style={{ 
                          backgroundColor: teacher.accountStatus === "Inactive" ? "#28a745" : "#ffc107", 
                          color: teacher.accountStatus === "Inactive" ? "white" : "#212529", 
                          border: "none", 
                          padding: "5px 10px", 
                          borderRadius: "4px", 
                          cursor: "pointer",
                          minWidth: "85px",
                          fontWeight: "600"
                        }}
                      >
                        {teacher.accountStatus === "Inactive" ? "Unlock" : "Lock"}
                      </button>
                      <button 
                        onClick={() => handleDelete(teacher.id)}
                        style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#666" }}>No teacher accounts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminTeacherAccountsPage;
