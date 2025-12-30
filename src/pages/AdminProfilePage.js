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
    <div className="admin-form-container">
      <h2>Admin Profile</h2>

      <div
        style={{
          marginBottom: "20px",
          padding: "12px 16px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          backgroundColor: "#fff",
        }}
      >
        <p><strong>Name:</strong> {currentUser.firstName} {currentUser.lastName}</p>
        <p><strong>Role:</strong> {currentUser.role}</p>
        <p><strong>Email:</strong> {currentUser.email}</p>
        <p>
          <strong>Last login:</strong>{" "}
          {currentUser.lastLogin
            ? new Date(currentUser.lastLogin).toLocaleString()
            : "No login recorded yet"}
        </p>
      </div>

      <div className="admin-form">
        <h3>Edit Profile</h3>
        <form onSubmit={handleProfileSubmit}>
          <div className="admin-form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={profileData.firstName}
              onChange={handleProfileChange}
            />
          </div>
          <div className="admin-form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={profileData.lastName}
              onChange={handleProfileChange}
            />
          </div>
          <div className="admin-form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
            />
          </div>
          <button type="submit">Update Profile</button>
        </form>
      </div>

      {message && <p className="admin-message">{message}</p>}
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}

export default AdminProfilePage;
