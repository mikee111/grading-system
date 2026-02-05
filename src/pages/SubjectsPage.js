import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../context/DataContext";
import "../css/AdminForms.css";

function SubjectsPage() {
  const { 
    subjects, 
    addSubject, 
    updateSubject, 
    deleteSubject,
    users,
    students,
    teacherAssignments,
    assignTeacherToSubject,
    removeTeacherFromSubject,
    enrollStudentsInSubject
  } = useData();

  const teachers = useMemo(() => {
    return (users || [])
      .filter(u => {
        const role = (u.role || "").toLowerCase();
        return role === "teacher" || role === "admin";
      })
      .sort((a, b) => {
        const nameA = (a.firstName || a.username || "").toLowerCase();
        const nameB = (b.firstName || b.username || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [users]);
  const [localSubjects, setLocalSubjects] = useState(subjects);
  const [form, setForm] = useState({ id: "", name: "", gradeLevel: "", section: "", teacherId: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [enrollingSubject, setEnrollingSubject] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLocalSubjects(subjects);
  }, [subjects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddOrUpdate = () => {
    if (!form.id || !form.name || !form.gradeLevel)
      return alert("Please complete all fields.");

    const subjectData = { 
      id: form.id.trim(), 
      name: form.name.trim(), 
      gradeLevel: form.gradeLevel.trim(), 
      section: (form.section || "").trim()
    };

    if (editingIndex !== null) {
      const oldSubject = subjects[editingIndex];
      updateSubject(editingIndex, subjectData);
      
      // Update teacher assignment if changed
      if (form.teacherId) {
        // Find who was previously assigned to this subject and remove it
        Object.keys(teacherAssignments).forEach(tId => {
          if (teacherAssignments[tId].includes(oldSubject.id)) {
            removeTeacherFromSubject(tId, oldSubject.id);
          }
        });
        assignTeacherToSubject(form.teacherId, subjectData.id);
      } else {
        // Remove assignment if no teacher selected
        Object.keys(teacherAssignments).forEach(tId => {
          if (teacherAssignments[tId].includes(oldSubject.id)) {
            removeTeacherFromSubject(tId, oldSubject.id);
          }
        });
      }
      setEditingIndex(null);
    } else {
      addSubject(subjectData);
      if (form.teacherId) {
        assignTeacherToSubject(form.teacherId, subjectData.id);
      }
    }
    setForm({ id: "", name: "", gradeLevel: "", section: "", teacherId: "" });
  };

  const handleEdit = (index) => {
    const subj = localSubjects[index];
    // Find assigned teacher ID
    const teacherId = Object.keys(teacherAssignments).find(tId => 
      teacherAssignments[tId].includes(subj.id)
    ) || "";
    
    setForm({ 
      id: subj.id, 
      name: subj.name, 
      gradeLevel: subj.gradeLevel, 
      section: subj.section || "", 
      teacherId: teacherId
    });
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const subj = subjects[index];
    // Clean up assignments
    Object.keys(teacherAssignments).forEach(tId => {
      if (teacherAssignments[tId].includes(subj.id)) {
        removeTeacherFromSubject(tId, subj.id);
      }
    });
    deleteSubject(index);
  };

  const handleOpenEnrollment = (subj) => {
    setEnrollingSubject(subj);
    setSelectedStudents([]);
    setSearchTerm("");
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const handleEnrollSubmit = () => {
    if (selectedStudents.length === 0) return alert("Please select at least one student.");
    enrollStudentsInSubject(enrollingSubject.id, selectedStudents);
    alert(`Successfully enrolled ${selectedStudents.length} students to ${enrollingSubject.name}.`);
    setEnrollingSubject(null);
  };

  const filteredStudents = students.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="admin-page-container">
      <div className="admin-form-container admin-form-wide">
        <h2>Subjects Management</h2>

        <div className="admin-form admin-form-wide">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Subject ID</label>
              <input name="id" placeholder="e.g. IT-107" value={form.id} onChange={handleChange} />
            </div>
            <div className="admin-form-group">
              <label>Subject Name</label>
              <input name="name" placeholder="Subject Name" value={form.name} onChange={handleChange} />
            </div>
            <div className="admin-form-group">
              <label>Year Level / Section</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input name="gradeLevel" placeholder="e.g. BSIT 4" value={form.gradeLevel} onChange={handleChange} style={{ flex: 2 }} />
                <input name="section" placeholder="e.g. Section 3" value={form.section} onChange={handleChange} style={{ flex: 1 }} />
              </div>
            </div>
            <div className="admin-form-group">
              <label>Assign Teacher</label>
              <select 
                name="teacherId" 
                value={form.teacherId} 
                onChange={handleChange}
                className="admin-form-input"
              >
                <option value="">-- Unassigned --</option>
                {teachers.map(t => {
                  const displayName = [t.firstName, t.lastName].filter(Boolean).join(" ");
                  return (
                    <option key={t.id} value={t.id}>
                      {displayName || t.username}
                    </option>
                  );
                })}
              </select>
            </div>
            <button type="button" className="admin-form-button" onClick={handleAddOrUpdate} style={{ alignSelf: "flex-end", marginBottom: "5px" }}>
              {editingIndex !== null ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </div>

      <table className="admin-table" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Subject Name</th>
            <th>Year Level</th>
            <th>Section</th>
            <th>Assigned Teacher</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {localSubjects.map((subj, index) => {
            // Find teacher assigned to this subject
            const teacherId = Object.keys(teacherAssignments).find(tId => 
              teacherAssignments[tId].includes(subj.id)
            );
            const teacher = teachers.find(t => t.id === teacherId);

            return (
              <tr key={index}>
                <td><strong>{subj.id}</strong></td>
                <td>{subj.name}</td>
                <td>{subj.gradeLevel}</td>
                <td>{subj.section}</td>
                <td>
                  {teacher ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ 
                        width: "8px", 
                        height: "8px", 
                        borderRadius: "50%", 
                        backgroundColor: "#4caf50" 
                      }}></span>
                      {teacher.firstName} {teacher.lastName}
                    </div>
                  ) : (
                    <span style={{ 
                      color: "#f44336", 
                      fontSize: "0.85rem", 
                      fontWeight: "600",
                      backgroundColor: "#ffebee",
                      padding: "2px 8px",
                      borderRadius: "4px"
                    }}>
                      Not Assigned
                    </span>
                  )}
                </td>
                <td>
                  <div className="admin-actions">
                    <button type="button" className="admin-form-button" onClick={() => handleOpenEnrollment(subj)} style={{ backgroundColor: "#4caf50" }}>Enroll Students</button>
                    <button type="button" className="admin-form-button edit-btn" onClick={() => handleEdit(index)} style={{ backgroundColor: "#2196f3" }}>Edit</button>
                    <button type="button" className="admin-form-button delete-btn" onClick={() => handleDelete(index)} style={{ backgroundColor: "#f44336" }}>Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}

          {localSubjects.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                No subjects found. Add one above to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Enrollment Modal */}
      {enrollingSubject && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{ 
            background: "white", padding: "30px", borderRadius: "12px", 
            width: "600px", maxHeight: "80vh", display: "flex", flexDirection: "column",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Enroll Students in {enrollingSubject.name}</h3>
              <button onClick={() => setEnrollingSubject(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>&times;</button>
            </div>
            
            <div style={{ marginBottom: "15px" }}>
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
              />
            </div>

            <div style={{ flex: 1, overflowY: "auto", border: "1px solid #eee", borderRadius: "6px", marginBottom: "20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>
                      <input 
                        type="checkbox" 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(filteredStudents.map(s => s.id));
                          } else {
                            setSelectedStudents([]);
                          }
                        }}
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      />
                    </th>
                    <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>Student Name</th>
                    <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>ID</th>
                    <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>Year/Section</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => (
                    <tr 
                      key={s.id} 
                      onClick={() => toggleStudentSelection(s.id)}
                      style={{ 
                        cursor: "pointer", 
                        backgroundColor: selectedStudents.includes(s.id) ? "#e3f2fd" : "transparent"
                      }}
                    >
                      <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                        <input 
                          type="checkbox" 
                          checked={selectedStudents.includes(s.id)}
                          readOnly
                        />
                      </td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{s.firstName} {s.lastName}</td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{s.id}</td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{s.year} - {s.section}</td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#999" }}>No students found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                {selectedStudents.length} student(s) selected
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  className="admin-form-button secondary" 
                  onClick={() => setEnrollingSubject(null)}
                  style={{ backgroundColor: "#6c757d" }}
                >
                  Cancel
                </button>
                <button 
                  className="admin-form-button primary" 
                  onClick={handleEnrollSubmit}
                  disabled={selectedStudents.length === 0}
                >
                  Confirm Enrollment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubjectsPage;

