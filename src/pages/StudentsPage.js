import React, { useEffect, useState, useMemo } from "react";
// Students Page - Create and manage student accounts
import { useLocation } from "react-router-dom";
import { useData } from "../context/DataContext";
import "../css/AdminForms.css";

function StudentsPage() {
  const { 
    students, subjects, addStudent, updateStudent, deleteStudent,
    courses, yearLevels, sections, schoolYears, semesters
  } = useData();
  const location = useLocation();
  const [localStudents, setLocalStudents] = useState(students);
  const [localSubjects, setLocalSubjects] = useState(subjects);

  const activeSY = useMemo(() => schoolYears.find(sy => sy.isActive)?.name || "", [schoolYears]);
  const activeSem = useMemo(() => semesters.find(s => s.isActive)?.name || "", [semesters]);

  const [form, setForm] = useState({
    id: "",
    firstName: "",
    lastName: "",
    middleName: "",
    gender: "",
    dob: "",
    age: "",
    address: "",
    course: "",
    year: "",
    section: "",
    schoolYear: activeSY,
    semester: activeSem,
    studentStatus: "Regular",
    email: "",
    contactNumber: "",
    guardianName: "",
    relationship: "",
    guardianContact: "",
    username: "",
    password: "",
    accountStatus: "Active",
    subjects: []
  });

  // Update form defaults when active SY/Sem change
  useEffect(() => {
    if (!form.id) { // Only for new student forms
      setForm(prev => ({
        ...prev,
        schoolYear: activeSY,
        semester: activeSem
      }));
    }
  }, [activeSY, activeSem, form.id]);

  const [editingIndex, setEditingIndex] = useState(null);

  // Check for edit student from location state
  useEffect(() => {
    if (location.state && location.state.editStudent) {
      const student = location.state.editStudent;
      setForm({
        ...student,
        subjects: student.subjects || []
      });
      // Find the index of the student being edited
      const index = students.findIndex(s => s.id === student.id);
      setEditingIndex(index !== -1 ? index : null);
    }
  }, [location.state, students]);

  // Age auto-calculation
  useEffect(() => {
    if (form.dob) {
      const birthDate = new Date(form.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setForm(prev => ({ ...prev, age: age >= 0 ? age : "" }));
    }
  }, [form.dob]);

  useEffect(() => {
    setLocalStudents(students);
  }, [students]);

  useEffect(() => {
    setLocalSubjects(subjects);
  }, [subjects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddOrUpdate = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.username || !form.password)
      return alert("Please complete all required fields (Name, Email, Username, Password).");

    if (editingIndex !== null) {
      updateStudent({
        ...form,
        subjects: form.subjects || []
      });
      alert("Student account updated successfully!");
    } else {
      addStudent({
        ...form,
        subjects: form.subjects || []
      });
      alert("Student account created successfully!");
    }

    setForm({
      id: "", firstName: "", lastName: "", middleName: "", gender: "", dob: "", age: "", address: "",
      course: "", year: "", section: "", schoolYear: "2025-2026", semester: "1st Semester",
      studentStatus: "Regular", email: "", contactNumber: "", guardianName: "", relationship: "",
      guardianContact: "", username: "", password: "", accountStatus: "Active", subjects: []
    });
    setEditingIndex(null);
  };

  return (
    <div className="admin-page-container">
      <div className="admin-form-container admin-form-wide">
        <h2 style={{ marginBottom: '24px', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
          {editingIndex !== null ? "Edit Student Account" : "Create Student Account"}
        </h2>

        <div className="admin-form admin-form-wide">
          {/* Student Basic Information */}
          <div className="admin-form-section">
            <h3 className="section-title">👤 Student Basic Information</h3>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Student ID (Auto-generated if empty)</label>
                <input name="id" placeholder="ID will be auto-generated" value={form.id} onChange={handleChange} disabled={editingIndex !== null} />
              </div>
              <div className="admin-form-group">
                <label>First Name *</label>
                <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="admin-form-group">
                <label>Middle Name</label>
                <input name="middleName" placeholder="Middle Name" value={form.middleName} onChange={handleChange} />
              </div>
              <div className="admin-form-group">
                <label>Last Name *</label>
                <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={form.dob} onChange={handleChange} />
              </div>
              <div className="admin-form-group">
                <label>Age (Auto-calculated)</label>
                <input name="age" value={form.age} readOnly style={{ backgroundColor: '#f8f9fa' }} />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group" style={{ flex: 2 }}>
                <label>Address</label>
                <input name="address" placeholder="Complete Address" value={form.address} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="admin-form-section">
            <h3 className="section-title">🏫 Academic Information</h3>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Course / Program</label>
                <select name="course" value={form.course} onChange={handleChange}>
                  <option value="">Select Course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Year Level</label>
                <select name="year" value={form.year} onChange={handleChange}>
                  <option value="">Select Year</option>
                  {yearLevels.map(y => (
                    <option key={y.id} value={y.name}>{y.name}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Section</label>
                <select name="section" value={form.section} onChange={handleChange}>
                  <option value="">Select Section</option>
                  {sections
                    .filter(s => {
                      const courseMatch = !form.course || s.courseId === courses.find(c => c.code === form.course)?.id;
                      const yearMatch = !form.year || s.yearLevelId === yearLevels.find(y => y.name === form.year)?.id;
                      return courseMatch && yearMatch;
                    })
                    .map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                </select>
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>School Year</label>
                <select name="schoolYear" value={form.schoolYear} onChange={handleChange}>
                  {schoolYears.map(sy => (
                    <option key={sy.id} value={sy.name}>{sy.name} {sy.isActive ? "(Active)" : ""}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Semester</label>
                <select name="semester" value={form.semester} onChange={handleChange}>
                  {semesters.map(sem => (
                    <option key={sem.id} value={sem.name}>{sem.name} {sem.isActive ? "(Active)" : ""}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Student Status</label>
                <select name="studentStatus" value={form.studentStatus} onChange={handleChange}>
                  <option value="Regular">Regular</option>
                  <option value="Irregular">Irregular</option>
                  <option value="Transferee">Transferee</option>
                  <option value="Returning">Returning</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="admin-form-section">
            <h3 className="section-title">📞 Contact Information</h3>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Email Address *</label>
                <input type="email" name="email" placeholder="email@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="admin-form-group">
                <label>Contact Number</label>
                <input name="contactNumber" placeholder="Phone Number" value={form.contactNumber} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="admin-form-section">
            <h3 className="section-title">👨‍👩‍👧 Guardian Information (Optional)</h3>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Guardian Name</label>
                <input name="guardianName" placeholder="Full Name" value={form.guardianName} onChange={handleChange} />
              </div>
              <div className="admin-form-group">
                <label>Relationship</label>
                <input name="relationship" placeholder="e.g., Mother, Father" value={form.relationship} onChange={handleChange} />
              </div>
              <div className="admin-form-group">
                <label>Guardian Contact</label>
                <input name="guardianContact" placeholder="Phone Number" value={form.guardianContact} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Account Login */}
          <div className="admin-form-section">
            <h3 className="section-title">🔐 Account Login</h3>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Username *</label>
                <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
              </div>
              <div className="admin-form-group">
                <label>Password *</label>
                <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
              </div>
              <div className="admin-form-group">
                <label>Role</label>
                <input value="Student (Auto-assigned)" disabled style={{ backgroundColor: '#f8f9fa' }} />
              </div>
            </div>
          </div>

          {/* System Fields Info */}
          <div className="admin-form-section">
            <h3 className="section-title">⚙️ System Information</h3>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Account Status</label>
                <select name="accountStatus" value={form.accountStatus} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              {editingIndex !== null && (
                <>
                  <div className="admin-form-group">
                    <label>Date Created</label>
                    <input value={new Date(form.dateCreated).toLocaleString()} disabled style={{ backgroundColor: '#f8f9fa' }} />
                  </div>
                  <div className="admin-form-group">
                    <label>Created By</label>
                    <input value={form.createdBy} disabled style={{ backgroundColor: '#f8f9fa' }} />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="admin-form-row" style={{ marginTop: '30px' }}>
            <button type="button" className="admin-form-button primary" onClick={handleAddOrUpdate} style={{ padding: '12px 24px', fontSize: '16px' }}>
              {editingIndex !== null ? "💾 Update Student Account" : "➕ Create Student Account"}
            </button>
            {editingIndex !== null && (
              <button type="button" className="admin-form-button secondary" onClick={() => {
                setEditingIndex(null);
                setForm({
                  id: "", firstName: "", lastName: "", middleName: "", gender: "", dob: "", age: "", address: "",
                  course: "", year: "", section: "", schoolYear: "2025-2026", semester: "1st Semester",
                  studentStatus: "Regular", email: "", contactNumber: "", guardianName: "", relationship: "",
                  guardianContact: "", username: "", password: "", accountStatus: "Active", subjects: []
                });
              }}>Cancel</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentsPage;
