import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";

function AdminProfilePage() {
  const { currentUser, updateUserProfile } = useData();
  const navigate = useNavigate();

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
    <div className="admin-profile-container">
      <h2>Admin Profile</h2>

      <div className="profile-section">
        <h3>Edit Profile</h3>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={profileData.firstName}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={profileData.lastName}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-group">
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

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default AdminProfilePage;