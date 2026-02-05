import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useFormVisibility } from "../context/FormVisibilityContext";
import "../styles/Auth.css";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login, users } = useData();
  const { setShowLogin } = useFormVisibility();
  const navigate = useNavigate();

  const showDebugInfo = () => {
    const info = (users || []).map(u => `• ${u.username} (${u.role})`).join('\n');
    alert(`Registered Users:\n\n${info || 'No users found'}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const result = login(formData.email, formData.password);
    
    // Check if result is an object with success property (for inactive accounts)
    if (result && result.success === false) {
      setError(result.message);
      return;
    }

    const user = result;
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "teacher") {
        navigate("/teacher");
      } else if (user.role === "student") {
        navigate("/student");
      } else {
        setShowLogin(false);
      }
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="admin-form-group">
          <label>Email or Username:</label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="admin-form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <span className="admin-error">{error}</span>}
        <button type="submit" className="admin-form-button">
          Login
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={showDebugInfo}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#888', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            Need help with your credentials?
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
