import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";
import "../css/AdminForms.css";

function StudentListPage() {
  const {   
    students, 
    enrollments, 
    updateStudent, 
    deleteStudent, 
    subjects, 
    enrollSubject, 
    removeEnrollment, 
    availableSubjectsFor,
    users,
    teacherAssignments,
    assignTeacherToSubject,
    removeTeacherFromSubject,
    updateSubject
  } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [assignSearchTerm, setAssignSearchTerm] = useState("");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);

  const teachers = useMemo(() => {
    return users.filter(u => u.role === "teacher");
  }, [users]);

  const handleDoneAssignModal = () => {
    if (!assigningStudent) {
      setShowAssignModal(false);
      return;
    }
    const list = availableSubjectsFor(assigningStudent.id).filter(s => selectedSubjectIds.includes(s.id));
    list.forEach((s) => {
      const assignedTeacherId = Object.keys(teacherAssignments).find((tId) =>
        (teacherAssignments[tId] || []).includes(s.id)
      );
      if (assignedTeacherId) {
        enrollSubject(assigningStudent.id, s);
      }
    });
    setSelectedSubjectIds([]);
    setShowAssignModal(false);
  };
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'lastName', direction: 'asc' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getYearValue = (yearString) => {
    const yearMap = {
      '1st Year': 1,
      '2nd Year': 2,
      '3rd Year': 3,
      '4th Year': 4
    };
    return yearMap[yearString] || 0;
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (sortConfig.key === 'name') {
      const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
      const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
      if (nameA < nameB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    }
    
    if (sortConfig.key === 'year') {
      const valA = getYearValue(a.year);
      const valB = getYearValue(b.year);
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    }

    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredStudents = sortedStudents.filter(student => {
    const matchesSearch = 
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || student.accountStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDeactivate = (student) => {
    const newStatus = student.accountStatus === "Active" ? "Inactive" : "Active";
    const confirmMsg = `Are you sure you want to ${newStatus === "Inactive" ? "deactivate" : "activate"} this student?`;
    
    if (window.confirm(confirmMsg)) {
      updateStudent({
        ...student,
        accountStatus: newStatus,
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const handleEdit = (student) => {
    // Navigate to create account page with student data in state for editing
    navigate("/admin/students", { state: { editStudent: student } });
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleResetPassword = (student) => {
    const newPassword = prompt(`Enter new password for ${student.firstName} ${student.lastName}:`, "student123");
    if (newPassword) {
      updateStudent({
        ...student,
        password: newPassword,
        lastUpdated: new Date().toISOString()
      });
      alert("Password reset successfully!");
    }
  };

  // Summary stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.accountStatus === "Active" || !s.accountStatus).length;
  const inactiveStudents = students.filter(s => s.accountStatus === "Inactive").length;

  return (
    <div className="admin-page-container">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Quick Summary */}
        <div className="summary-cards">
          <div className="summary-card total">
            <h4>Total Students</h4>
            <div className="value">{totalStudents}</div>
          </div>
          <div className="summary-card active">
            <h4>Active Students</h4>
            <div className="value">{activeStudents}</div>
          </div>
          <div className="summary-card inactive">
            <h4>Inactive Students</h4>
            <div className="value">{inactiveStudents}</div>
          </div>
        </div>

        <div className="admin-table-container" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Student List</h2>
            <button className="add-student-btn" onClick={() => navigate("/admin/students")}>
              <span>➕</span> Add Student
            </button>
          </div>
          
          {/* Table Controls */}
        <div className="table-controls">
          <div style={{ flex: 1, display: 'flex', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
            />
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to page 1 on filter
              }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Show:</span>
            <select 
              className="filter-select" 
              style={{ minWidth: '80px' }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('id')}>
                Student ID 
                <span className={`sort-icon ${sortConfig.key === 'id' ? 'active' : ''}`}>
                  {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                </span>
              </th>
              <th className="sortable" onClick={() => handleSort('name')}>
                Full Name
                <span className={`sort-icon ${sortConfig.key === 'name' ? 'active' : ''}`}>
                  {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                </span>
              </th>
              <th>Course</th>
              <th className="sortable" onClick={() => handleSort('year')}>
                Year Level
                <span className={`sort-icon ${sortConfig.key === 'year' ? 'active' : ''}`}>
                  {sortConfig.key === 'year' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                </span>
              </th>
              <th>Section</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((student) => (
                <tr key={student.id}>
                  <td style={{ fontWeight: 'bold' }}>{student.id}</td>
                  <td>
                    <div>{student.firstName} {student.middleName ? student.middleName + ' ' : ''}{student.lastName}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>@{student.username}</div>
                  </td>
                  <td>{student.course}</td>
                  <td>{student.year}</td>
                  <td>{student.section}</td>
                  <td>
                    <span className={`status-badge ${student.accountStatus?.toLowerCase()}`}>
                      {student.accountStatus || "Active"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button 
                        className="action-btn assign" 
                        onClick={() => {
                          setAssigningStudent(student);
                          setSelectedSubjectIds([]);
                          setShowAssignModal(true);
                        }}
                        title="Assign Subjects"
                        style={{ backgroundColor: '#6366f1' }}
                      >
                        Assign
                      </button>
                      <button 
                        className="action-btn view" 
                        onClick={() => handleView(student)}
                        title="View Details"
                      >
                        View
                      </button>
                      <button 
                        className="action-btn edit" 
                        onClick={() => handleEdit(student)}
                        title="Edit Student"
                      >
                        Edit
                      </button>
                      <button 
                        className={`action-btn ${student.accountStatus === "Inactive" ? "assign" : "delete"}`} 
                        onClick={() => handleDeactivate(student)}
                        title={student.accountStatus === "Inactive" ? "Activate" : "Deactivate"}
                      >
                        {student.accountStatus === "Inactive" ? "Activate" : "Deactivate"}
                      </button>
                      <button 
                        className="action-btn reset" 
                        onClick={() => handleResetPassword(student)}
                        title="Reset Password"
                      >
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {filteredStudents.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} students
            </div>
            <div className="pagination-controls">
              <button 
                className="page-btn" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button 
                className="page-btn" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW STUDENT MODAL */}
      {showViewModal && selectedStudent && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{ 
            background: "white", padding: "30px", borderRadius: "12px", 
            width: "600px", maxHeight: "80vh", overflowY: "auto",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Student Details</h3>
              <button onClick={() => setShowViewModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p><strong>Student ID:</strong> {selectedStudent.id}</p>
                <p><strong>Full Name:</strong> {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}</p>
                <p><strong>Gender:</strong> {selectedStudent.gender}</p>
                <p><strong>Date of Birth:</strong> {selectedStudent.dob} ({selectedStudent.age} yrs old)</p>
                <p><strong>Address:</strong> {selectedStudent.address}</p>
              </div>
              <div>
                <p><strong>Course:</strong> {selectedStudent.course}</p>
                <p><strong>Year/Section:</strong> {selectedStudent.year} - {selectedStudent.section}</p>
                <p><strong>Status:</strong> <span className={`status-badge ${selectedStudent.accountStatus?.toLowerCase()}`}>{selectedStudent.accountStatus}</span></p>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Contact:</strong> {selectedStudent.contactNumber}</p>
              </div>
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <p><strong>Guardian:</strong> {selectedStudent.guardianName} ({selectedStudent.relationship})</p>
              <p><strong>Guardian Contact:</strong> {selectedStudent.guardianContact}</p>
            </div>

            {/* Grades Section */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <h4 style={{ marginBottom: '10px' }}>Academic Records</h4>
              {enrollments[selectedStudent.id] && enrollments[selectedStudent.id].length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>Subject</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>Midterm</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments[selectedStudent.id].map((grade, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{grade.name}</td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                          {grade.midtermScore || grade.grade || '-'} 
                          {grade.midtermEq && <span style={{ color: '#666', fontSize: '11px', marginLeft: '4px' }}>({grade.midtermEq})</span>}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                          {grade.finalScore || '-'}
                          {grade.finalEq && <span style={{ color: '#666', fontSize: '11px', marginLeft: '4px' }}>({grade.finalEq})</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ fontStyle: 'italic', color: '#666' }}>No academic records found for this student.</p>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="admin-form-button primary" 
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ASSIGN SUBJECT MODAL */}
      {showAssignModal && assigningStudent && (
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
              <h3 style={{ margin: 0 }}>Assign Subjects for {assigningStudent.firstName} {assigningStudent.lastName}</h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>&times;</button>
            </div>

            {/* Currently Enrolled Subjects */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Currently Enrolled</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {enrollments[assigningStudent.id] && enrollments[assigningStudent.id].length > 0 ? (
                  enrollments[assigningStudent.id].map(subj => {
                    const assignedTeacherId = Object.keys(teacherAssignments).find(tId => 
                      teacherAssignments[tId].includes(subj.id)
                    ) || "";
                    const teacher = teachers.find(t => t.id === assignedTeacherId);
                    const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "No teacher assigned";

                    return (
                      <div key={subj.id} style={{ 
                        backgroundColor: '#f0fdf4', 
                        color: '#16a34a', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '13px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        border: '1px solid #bbf7d0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600' }}>{subj.name}</span>
                          <span style={{ fontSize: '11px', opacity: 0.8 }}>{teacherName}</span>
                        </div>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Remove ${subj.name} from ${assigningStudent.firstName}'s subjects?`)) {
                              removeEnrollment(assigningStudent.id, subj.id);
                            }
                          }}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#16a34a', 
                            cursor: 'pointer', 
                            padding: 0,
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: '4px'
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No subjects enrolled yet.</span>
                )}
              </div>
            </div>

            {/* Available Subjects Search */}
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Subjects</h4>
              <input 
                type="text" 
                placeholder="Search available subjects..." 
                value={assignSearchTerm}
                onChange={(e) => setAssignSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
              />
            </div>

            <div style={{ flex: 1, overflowY: "auto", border: "1px solid #eee", borderRadius: "6px", marginBottom: "20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>Select</th>
                    <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>Subject Name</th>
                    <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>Year/Section</th>
                    <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>Assigned Teacher</th>
                    <th style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #eee" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableSubjectsFor(assigningStudent.id)
                    .filter(s => s.name.toLowerCase().includes(assignSearchTerm.toLowerCase()))
                    .map(s => {
                      const assignedTeacherId = Object.keys(teacherAssignments).find(tId => 
                        teacherAssignments[tId].includes(s.id)
                      ) || "";

                      return (
                        <tr key={s.id}>
                          <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                            <input
                              type="checkbox"
                              checked={selectedSubjectIds.includes(s.id)}
                              onChange={() => {
                                setSelectedSubjectIds(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]);
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{s.name}</td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{s.gradeLevel} - {s.section}</td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                            <select
                              value={assignedTeacherId}
                              onChange={(e) => {
                                const newTeacherId = e.target.value;
                                if (assignedTeacherId) {
                                  removeTeacherFromSubject(assignedTeacherId, s.id);
                                }
                                if (newTeacherId) {
                                  assignTeacherToSubject(newTeacherId, s.id);
                                  const t = teachers.find(te => te.id === newTeacherId);
                                  const idx = subjects.findIndex(sub => sub.id === s.id);
                                  if (t && idx !== -1) {
                                    const identifier = t.username || t.email || `${t.firstName} ${t.lastName}`;
                                    updateSubject(idx, { ...subjects[idx], teacherName: identifier });
                                  }
                                }
                                if (!newTeacherId) {
                                  const idx = subjects.findIndex(sub => sub.id === s.id);
                                  if (idx !== -1) {
                                    updateSubject(idx, { ...subjects[idx], teacherName: "" });
                                  }
                                }
                              }}
                              style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                border: '1px solid #cbd5e1',
                                fontSize: '13px',
                                width: '100%',
                                backgroundColor: assignedTeacherId ? '#f0f9ff' : 'white'
                              }}
                            >
                              <option value="">-- Unassigned --</option>
                              {teachers.map(t => (
                                <option key={t.id} value={t.id}>
                                  {t.firstName} {t.lastName}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                            <button 
                              onClick={() => enrollSubject(assigningStudent.id, s)}
                              className="action-btn assign"
                              style={{ padding: '4px 12px', fontSize: '12px' }}
                            >
                              Enroll
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {availableSubjectsFor(assigningStudent.id).length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#999" }}>All subjects assigned or no subjects available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                className="admin-form-button primary" 
                onClick={handleDoneAssignModal}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}

export default StudentListPage;
