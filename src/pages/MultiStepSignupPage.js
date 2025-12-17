import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './MultiStepSignupPage.css';

function MultiStepSignupPage() {
  const { signUp } = useData();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    address: '',
    phoneNumber: '',
    role: 'student',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && (!form.firstName || !form.lastName || !form.email)) {
      setError('Please fill out all required fields in Personal Information.');
      return;
    }
    if (step === 2 && (!form.username || !form.password || form.password !== form.confirmPassword)) {
      setError('Please ensure all Account Details are correct and passwords match.');
      return;
    }
    setStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const success = signUp(
      form.firstName,
      form.lastName,
      form.email,
      form.username,
      form.password,
      form.address,
      form.phoneNumber,
      form.role
    );
    if (success) {
      navigate('/login');
    } else {
      setError('An error occurred during sign-up. Please try again.');
    }
  };

  return (
    <div className="multi-step-signup-container">
      <form className="multi-step-signup-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {step === 1 && (
          <div>
            <h3>Step 1: Personal Information</h3>
            <label>
              First Name:
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Last Name:
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3>Step 2: Account Details</h3>
            <label>
              Username:
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Password:
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Confirm Password:
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>
          </div>
        )}
        {step === 3 && (
          <div>
            <h3>Step 3: Additional Information</h3>
            <label>
              Address:
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </label>
            <label>
              Phone Number:
              <input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
              />
            </label>
            <label>
              Role:
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </label>
          </div>
        )}
        {error && <p className="error-message">{error}</p>}
        <div className="form-navigation-buttons">
          {step > 1 && <button type="button" onClick={handleBack}>Back</button>}
          {step < 3 && <button type="button" onClick={handleNext}>Next</button>}
          {step === 3 && <button type="submit">Submit</button>}
        </div>
      </form>
    </div>
  );
}

export default MultiStepSignupPage;