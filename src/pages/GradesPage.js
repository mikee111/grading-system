import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../context/DataContext";
import "./GradesPage.css";


function GradesPage() {
  const { students, subjects, enrollments, saveGradeRecord, currentUser, toEquivalent, users } = useData();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [midterm, setMidterm] = useState("");
  const [finals, setFinals] = useState("");
  const [localGrades, setLocalGrades] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const isTeacher = currentUser && currentUser.role === "teacher";
  const isAdmin = currentUser && currentUser.role === "admin";

  // Logic to identify teacher's subjects (same as in TeacherDashboard)
   const teacherSubjects = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return subjects; // Admins can see all subjects

    const firstName = (currentUser.firstName || "").toLowerCase().trim();
    const lastName = (currentUser.lastName || "").toLowerCase().trim();
    const email = (currentUser.email || "").toLowerCase().trim();
    const username = (currentUser.username || "").toLowerCase().trim();
    const fullName = `${firstName} ${lastName}`.trim();

    const normalize = (str) => (str || "").toString().toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const normalizedFullName = normalize(fullName);

    return subjects.filter((s) => {
      const assignedName = (s.teacherName || "").toString().trim();
      if (!assignedName) return false;

      const normalizedAssignedName = normalize(assignedName);
      const lowerAssigned = assignedName.toLowerCase();
      
      // Exact and partial matching
      return (
        lowerAssigned === fullName.toLowerCase() ||
        lowerAssigned === email ||
        lowerAssigned === username ||
        normalizedAssignedName === normalizedFullName ||
        (fullName && lowerAssigned.includes(fullName.toLowerCase())) ||
        (normalizedFullName && normalizedAssignedName.includes(normalizedFullName))
      );
    });
  }, [subjects, currentUser, isAdmin]);

  // Initialize localGrades with enrollment data
  useEffect(() => {
    const gradesArray = [];
    Object.keys(enrollments || {}).forEach(studentId => {
      const studentEnrollments = enrollments[studentId] || [];
      studentEnrollments.forEach(subject => {
        gradesArray.push({
          studentId: studentId,
          subject: subject.name,
          midterm: subject.midtermScore || '',
          midtermEq: subject.midtermEq || '',
          finals: subject.finalScore || '',
          finalsEq: subject.finalEq || '',
          rating: subject.rating || '',
          status: subject.status || ''
        });
      });
    });
    setLocalGrades(gradesArray);
  }, [enrollments]);

  /**
   * Handles the selection of a .   * @param {Object} e - The event object from the select input.
   */
  const handleSelectStudent = (e) => {
    const id = e.target.value;
    const stud = students.find((s) => s.id === id) || null;
    setSelectedStudent(stud);
    setSelectedSubject(""); // Reset selected subject when student changes
    
    if (stud) {
      setSelectedCourse(stud.course || "");
      setSelectedYear(stud.year || "");
    } else {
      setSelectedCourse("");
      setSelectedYear("");
    }
  };

  /**
   * Handles adding a new subject to the selected student's record.
   * Updates student data in `localStorage` and adds an initial grade entry for the new subject.
   */
  const handleAddSubject = () => {
    if (!selectedStudent) return alert("Select a student first.");
    if (!newSubject.trim()) return alert("Enter subject name.");

    // Find the subject in the subjects array
    const subject = subjects.find(s => s.name === newSubject);
    if (!subject) return alert("Subject not found in system.");

    // Check if already enrolled
    if (enrollments[selectedStudent.id]?.some(e => e.name === newSubject)) {
      return alert("Subject already assigned to student.");
    }

    // Enroll the subject with empty grades
    saveGradeRecord(selectedStudent.id, subject, "", "");
    setNewSubject(""); // Clear new subject input
  };

  /**
   * Handles adding or updating a midterm grade for the selected student and subject.
   * Updates the `grades` state and `localStorage`.
   */
  const addMidterm = () => {
    if (!selectedStudent) return alert("Select student.");
    if (!selectedSubject) return alert("Select subject.");
    if (midterm === "") return alert("Enter midterm.");

    const subject = subjects.find(s => s.name === selectedSubject);
    if (!subject) return alert("Subject not found.");

    toEquivalent(midterm); // Calculate equivalent but not used
    saveGradeRecord(selectedStudent.id, subject, midterm, finals || "");
    setMidterm(""); // Clear midterm input
  };

  /**
   * Handles adding or updating a final grade for the selected student and subject.
   * Updates the `grades` state and `localStorage`.
   */
  const addFinals = () => {
    if (!selectedStudent) return alert("Select student.");
    if (!selectedSubject) return alert("Select subject.");
    if (finals === "") return alert("Enter finals.");

    const subject = subjects.find(s => s.name === selectedSubject);
    if (!subject) return alert("Subject not found.");

    toEquivalent(finals); // Calculate equivalent but not used
    saveGradeRecord(selectedStudent.id, subject, midterm || "", finals);
    setFinals(""); // Clear finals input
  };

  /**
   * Computes the final equivalent grade based on midterm and finals equivalents.
   * @param {number} mEq - Midterm equivalent grade.
   * @param {number} fEq - Finals equivalent grade.
   * @returns {string} The computed final equivalent grade, formatted to two decimal places, or empty string if inputs are missing.
   */
  const computeFinalEquivalent = (mEq, fEq) => {
    if (!mEq || !fEq) return "";
    return ((Number(mEq) + Number(fEq)) / 2).toFixed(2);
  };

  /**
   * Determines the pass/fail status based on the final equivalent grade.
   * @param {number} finEq - The final equivalent grade.
   * @returns {string} "Passed", "Failed", or empty string if final equivalent is missing.
   */
  const computeStatus = (finEq) => {
    if (!finEq) return "";
    return finEq <= 3.0 ? "Passed" : "Failed";
  };

  // UI rendering
  return (
    <div className="grades-page-container">
      <h2>Grades</h2>

      {/* Student, School Year, Semester selection */}
      <div className="grades-input-group">
        Student:{" "}
        <select
          onChange={handleSelectStudent}
          value={selectedStudent?.id || ""}
        >
          <option value="">Select Student</option>
          {students.map((s, i) => (
            <option key={i} value={s.id}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>
        {" "}
        School Year:{" "}
        <select>
          <option value="">2024-2025</option>
          <option value="">2023-2024</option>
        </select>
        {" "}
        Semester:{" "}
        <select>
          <option value="">1st</option>
          <option value="">2nd</option>
        </select>
        {" "}
        Course:{" "}
        <select 
          value={selectedCourse} 
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">Select Course</option>
          {Array.from(new Set(students.map(s => s.course).filter(Boolean))).map((course, idx) => (
            <option key={idx} value={course}>{course}</option>
          ))}
        </select>
        {" "}
        Year Level:{" "}
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>
      </div>

      {selectedStudent && isTeacher && (
        <div className="conditional-student-content">
          {/* ADD SUBJECT */}
          <div className="grades-input-group">
            <label style={{ marginRight: "10px", fontWeight: "bold" }}>Add Subject to Student:</label>
            <select
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="">-- Select Subject to Add --</option>
              {teacherSubjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
            <button 
              onClick={handleAddSubject}
              style={{ marginLeft: "10px", padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Add Subject
            </button>
          </div>

          {/* SUBJECT DROPDOWN */}
          <div className="grades-input-group">
            <label style={{ marginRight: "10px", fontWeight: "bold" }}>Grade for Subject:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="">-- Select Subject to Grade --</option>
              {(enrollments[selectedStudent.id] || [])
                .filter(enrolledSub => isAdmin || teacherSubjects.some(ts => ts.name === enrolledSub.name))
                .map((subj, i) => (
                  <option key={i} value={subj.name}>
                    {subj.name}
                  </option>
                ))}
            </select>
          </div>

          {/* MIDTERM AND FINALS */}
          <div className="grades-input-group">
            <input
              type="number"
              placeholder="Midterm"
              value={midterm}
              onChange={(e) => setMidterm(e.target.value)}
            />
            <button onClick={addMidterm}>Add Midterm</button>
            <input
              type="number"
              placeholder="Finals"
              value={finals}
              onChange={(e) => setFinals(e.target.value)}
            />
            <button onClick={addFinals}>Add Finals</button>
          </div>
        </div>
      )}

      {/* GRADES TABLE */}
      <table className="grades-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Midterm</th>
            <th>Mid Eq</th>
            <th>Finals</th>
            <th>Final Eq</th>
            <th>Rating</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {localGrades
            .filter(
              (g) =>
                selectedStudent &&
                g.studentId === selectedStudent.id
            )
            .map((g, i) => {
              const finalRating = computeFinalEquivalent(g.midtermEq, g.finalsEq);
              const status = computeStatus(finalRating);
              const statusClassName = status === "Passed" ? "status-pass" : "status-fail";

              return (
                <tr key={i}>
                  <td>{g.subject}</td>
                  <td>{g.midterm}</td>
                  <td>{g.midtermEq}</td>
                  <td>{g.finals}</td>
                  <td>{g.finalsEq}</td>
                  <td>{finalRating}</td>
                  <td className={statusClassName}>{status}</td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <div className="grades-actions">
        <button onClick={() => window.print()}>Print Grades</button>
        <button>Export PDF</button>
      </div>
    </div>
  );
}

export default GradesPage;
