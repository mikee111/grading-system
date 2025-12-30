

import React, { useState, useEffect } from "react";
import "./GradesPage.css";


function GradesPage() {

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [newSubject, setNewSubject] = useState("");

  const [midterm, setMidterm] = useState("");
  const [finals, setFinals] = useState("");

  const [grades, setGrades] = useState([]);


  useEffect(() => {
    const studs = JSON.parse(localStorage.getItem("studentsData")) || [];
    setStudents(studs);
  }, []); 


  useEffect(() => {
    const g = JSON.parse(localStorage.getItem("gradesData")) || [];
    setGrades(g);
  }, []); 

  /**
   * Saves the current grades array to localStorage.
   * @param {Array} g - The grades array to be saved.
   */
  const saveGrades = (g) =>
    localStorage.setItem("gradesData", JSON.stringify(g));

  /**
   * Handles the selection of a .   * @param {Object} e - The event object from the select input.
   */
  const handleSelectStudent = (e) => {
    const id = e.target.value;
    const stud = students.find((s) => s.id === id) || null;
    setSelectedStudent(stud);
    setSelectedSubject(""); // Reset selected subject when student changes
  };

  /**
   * Handles adding a new subject to the selected student's record.
   * Updates student data in `localStorage` and adds an initial grade entry for the new subject.
   */
  const handleAddSubject = () => {
    if (!selectedStudent) return alert("Select a student first.");
    if (!newSubject.trim()) return alert("Enter subject name.");

    const updatedStudents = [...students];
    const idx = updatedStudents.findIndex(
      (s) => s.id === selectedStudent.id
    );

    // Initialize subjects array if it doesn't exist
    if (!updatedStudents[idx].subjects)
      updatedStudents[idx].subjects = [];

    // Prevent adding duplicate subjects
    if (updatedStudents[idx].subjects.includes(newSubject))
      return alert("Subject already exists.");

    updatedStudents[idx].subjects.push(newSubject);

    // Also create an initial grade entry for the new subject
    const newGrades = [...grades];
    newGrades.push({
      studentId: selectedStudent.id, // Use studentId for consistency
      subject: newSubject,
      midterm: "",
      midtermEq: "",
      finals: "",
      finalsEq: "",
    });
    setGrades(newGrades);
    saveGrades(newGrades);

    localStorage.setItem("studentsData", JSON.stringify(updatedStudents));
    setStudents(updatedStudents);
    setSelectedStudent(updatedStudents[idx]); // Update selected student to reflect new subjects
    setNewSubject(""); // Clear new subject input
  };

  /**
   * Converts a raw numerical grade to its equivalent numerical value (e.g., 96 -> 1.0).
   * @param {number} raw - The raw grade score.
   * @returns {number} The equivalent numerical grade.
   */
  const toEquivalent = (raw) => {
    raw = Number(raw);
    if (raw >= 96) return 1.0;
    if (raw >= 94) return 1.25;
    if (raw >= 92) return 1.5;
    if (raw >= 89) return 1.75;
    if (raw >= 86) return 2.0;
    if (raw >= 83) return 2.25;
    if (raw >= 80) return 2.5;
    if (raw >= 77) return 2.75;
    if (raw >= 75) return 3.0;
    return 5.0; // Failing grade
  };

  /**
   * Handles adding or updating a midterm grade for the selected student and subject.
   * Updates the `grades` state and `localStorage`.
   */
  const addMidterm = () => {
    if (!selectedStudent) return alert("Select student.");
    if (!selectedSubject) return alert("Select subject.");
    if (midterm === "") return alert("Enter midterm.");

    const eq = toEquivalent(midterm);

    const newGrades = [...grades];
    let found = newGrades.find(
      (g) => g.studentId === selectedStudent.id && g.subject === selectedSubject
    );

    if (found) {
      // Update existing grade entry
      found.midterm = midterm;
      found.midtermEq = eq;
    } else {
      // Create new grade entry if not found
      newGrades.push({
        studentId: selectedStudent.id,
        subject: selectedSubject,
        midterm: midterm,
        midtermEq: eq,
        finals: "", // Initialize finals as empty
        finalsEq: "", // Initialize finals equivalent as empty
      });
    }

    setGrades(newGrades);
    saveGrades(newGrades);
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

    const eq = toEquivalent(finals);

    const newGrades = [...grades];
    let found = newGrades.find(
      (g) => g.studentId === selectedStudent.id && g.subject === selectedSubject
    );

    if (found) {
      // Update existing grade entry
      found.finals = finals;
      found.finalsEq = eq;
    } else {
      // Create new grade entry if not found
      newGrades.push({
        studentId: selectedStudent.id,
        subject: selectedSubject,
        midterm: "", // Initialize midterm as empty
        midtermEq: "", // Initialize midterm equivalent as empty
        finals: finals,
        finalsEq: eq,
      });
    }

    setGrades(newGrades);
    saveGrades(newGrades);
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
      </div>

      {selectedStudent && (
        <div className="conditional-student-content">
          {/* ADD SUBJECT */}
          <div className="grades-input-group">
            <input
              type="text"
              placeholder="Add subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
            <button onClick={handleAddSubject}>Add Subject</button>
          </div>

          {/* SUBJECT DROPDOWN */}
          <div className="grades-input-group">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Select Subject</option>
              {(selectedStudent.subjects || []).map((subj, i) => (
                <option key={i} value={subj}>
                  {subj}
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
          {grades
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
