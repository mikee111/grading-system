import React, { useState } from 'react';
import { useFormVisibility } from '../context/FormVisibilityContext';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './MultiStepSignupPage.css';

function MultiStepSignupPage() {
  const { signUp, courses, yearLevels, sections, roles } = useData();
  const { setShowSignup, setShowLogin } = useFormVisibility();
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
    course: '',
    yearLevel: '',
    section: ''
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
      form.password,
      form.role,
      form.username,
      {
        course: form.course,
        yearLevel: form.yearLevel,
        section: form.section
      }
    );
    if (success) {
      setShowSignup(false);
      setShowLogin(true);
    } else {
      setError('An error occurred during sign-up. Please try again.');
    }
  };

  return (
    <div className="multi-step-signup-container">
      <form className="multi-step-signup-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {step === 1 && (
          <div className="admin-form-group">
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
          <div className="admin-form-group">
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
          <div className="admin-form-group">
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
                {roles.filter(r => r.status === "Active").map(role => (
                  <option key={role.id} value={role.name.toLowerCase()}>{role.name}</option>
                ))}
              </select>
            </label>

            {form.role === 'student' && (
              <>
                <label>
                  Course:
                  <select name="course" value={form.course} onChange={handleChange}>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.code}>{c.name}</option>)}
                  </select>
                </label>
                <label>
                  Year Level:
                  <select name="yearLevel" value={form.yearLevel} onChange={handleChange}>
                    <option value="">Select Year Level</option>
                    {yearLevels.map(y => <option key={y.id} value={y.name}>{y.name}</option>)}
                  </select>
                </label>
                <label>
                  Section:
                  <select name="section" value={form.section} onChange={handleChange}>
                    <option value="">Select Section</option>
                    {sections
                      .filter(s => {
                        const courseMatch = !form.course || s.courseId === courses.find(c => c.code === form.course)?.id;
                        const yearMatch = !form.yearLevel || s.yearLevelId === yearLevels.find(y => y.name === form.yearLevel)?.id;
                        return courseMatch && yearMatch;
                      })
                      .map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </label>
              </>
            )}
          </div>
        )}
        {error && <p className="error-message">{error}</p>}
        <div className="form-navigation-buttons">
          {step > 1 && <button type="button" onClick={handleBack} className="admin-form-button">Back</button>}
          {step < 3 && <button type="button" onClick={handleNext} className="admin-form-button">Next</button>}
          {step === 3 && <button type="submit" className="admin-form-button">Submit</button>}
        </div>
      </form>
    </div>
  );
}

export default MultiStepSignupPage;
