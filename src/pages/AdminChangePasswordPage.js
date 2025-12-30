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

  const getPasswordStrength = (value) => {
    if (!value) return { label: "", color: "" };
    const lengthScore = value.length >= 10 ? 2 : value.length >= 8 ? 1 : 0;
    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    const bonus = [hasNumber, hasUpper, hasSpecial].filter(Boolean).length;
    const total = lengthScore + bonus;
    if (total >= 4) return { label: "Strong", color: "#28a745" };
    if (total >= 2) return { label: "Medium", color: "#ffc107" };
    return { label: "Weak", color: "#dc3545" };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirmation do not match.");
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

  return (
    <div className="admin-form-container">
      <h2>Change Password</h2>

      <div className="admin-form">
        <h3>Change Password</h3>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>Current Password:</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="admin-form-group">
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {newPassword && (
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "0.9rem",
                  color: getPasswordStrength(newPassword).color,
                }}
              >
                Password strength: {getPasswordStrength(newPassword).label}
              </div>
            )}
          </div>
          <div className="admin-form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Change Password</button>
        </form>
      </div>

      {message && <p className="admin-message">{message}</p>}
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}

export default AdminChangePasswordPage;
