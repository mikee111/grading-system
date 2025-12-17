import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

function SignupPage() {
  const { signUp } = useData();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
      setError("Please complete all fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }
    if (!form.email.includes("@")) {
      setError("Invalid email address");
      return;
    }
    const ok = signUp(form.firstName, form.lastName, form.email, form.password, "student");
    if (!ok) {
      setError("Email already exists");
      return;
    }
    setSuccess("Admin account created. Redirecting to login...");
    setError("");
    setTimeout(() => navigate("/login"), 900);
  };

  return (
    <div className="auth-container">
      <form className="card-green signup-horizontal" onSubmit={onSubmit}>
        <h2 className="section-title">Create Student</h2>
        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="firstName">First Name</label>
            <input id="firstName" className="input input-large" name="firstName" placeholder="First Name" value={form.firstName} onChange={onChange} />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="lastName">Last Name</label>
            <input id="lastName" className="input input-large" name="lastName" placeholder="Last Name" value={form.lastName} onChange={onChange} />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" className="input input-large" name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" className="input input-large" name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" className="input input-large" name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={onChange} />
          </div>
        </div>
        {error && <div className="form-alert error">{error}</div>}
        {success && <div className="form-alert success">{success}</div>}
        <div className="form-actions">
          <button className="btn btn-primary btn-large btn-block" type="submit">Create Student</button>
        </div>
      </form>
    </div>
  );
}

export default SignupPage;
