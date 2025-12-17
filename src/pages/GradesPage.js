// ----------------------------------------------------
// GRADES PAGE (Midterm + Finals Only)
// Raw grade → equivalent → final rating → status
// ----------------------------------------------------

import React, { useState, useEffect } from "react";

function GradesPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [newSubject, setNewSubject] = useState("");

  const [midterm, setMidterm] = useState("");
  const [finals, setFinals] = useState("");

  const [grades, setGrades] = useState([]);

  // LOAD STUDENTS
  useEffect(() => {
    const studs = JSON.parse(localStorage.getItem("studentsData")) || [];
    setStudents(studs);
  }, []);

  // LOAD GRADES
  useEffect(() => {
    const g = JSON.parse(localStorage.getItem("gradesData")) || [];
    setGrades(g);
  }, []);

  const saveGrades = (g) =>
    localStorage.setItem("gradesData", JSON.stringify(g));

  // SELECT STUDENT
  const handleSelectStudent = (e) => {
    const name = e.target.value;
    const stud = students.find((s) => s.name === name) || null;
    setSelectedStudent(stud);
    setSelectedSubject("");
  };

  // ADD SUBJECT
  const handleAddSubject = () => {
    if (!selectedStudent) return alert("Select a student first.");
    if (!newSubject.trim()) return alert("Enter subject name.");

    const updatedStudents = [...students];
    const idx = updatedStudents.findIndex(
      (s) => s.name === selectedStudent.name
    );

    if (!updatedStudents[idx].subjects)
      updatedStudents[idx].subjects = [];

    if (updatedStudents[idx].subjects.includes(newSubject))
      return alert("Subject already exists.");

    updatedStudents[idx].subjects.push(newSubject);

    localStorage.setItem("studentsData", JSON.stringify(updatedStudents));
    setStudents(updatedStudents);
    setSelectedStudent(updatedStudents[idx]);
    setNewSubject("");
  };

  // GRADE → EQUIVALENT
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
    return 5.0; 
  };

  // ADD MIDTERM
  const addMidterm = () => {
    if (!selectedStudent) return alert("Select student.");
    if (!selectedSubject) return alert("Select subject.");
    if (midterm === "") return alert("Enter midterm.");

    const eq = toEquivalent(midterm);

    const newGrades = [...grades];
    let found = newGrades.find(
      (g) => g.student === selectedStudent.name && g.subject === selectedSubject
    );

    if (found) {
      found.midterm = midterm;
      found.midtermEq = eq;
    } else {
      newGrades.push({
        student: selectedStudent.name,
        subject: selectedSubject,
        midterm: midterm,
        midtermEq: eq,
        finals: "",
        finalsEq: "",
      });
    }

    setGrades(newGrades);
    saveGrades(newGrades);
    setMidterm("");
  };

  // ADD FINALS
  const addFinals = () => {
    if (!selectedStudent) return alert("Select student.");
    if (!selectedSubject) return alert("Select subject.");
    if (finals === "") return alert("Enter finals.");

    const eq = toEquivalent(finals);

    const newGrades = [...grades];
    let found = newGrades.find(
      (g) => g.student === selectedStudent.name && g.subject === selectedSubject
    );

    if (found) {
      found.finals = finals;
      found.finalsEq = eq;
    } else {
      newGrades.push({
        student: selectedStudent.name,
        subject: selectedSubject,
        midterm: "",
        midtermEq: "",
        finals: finals,
        finalsEq: eq,
      });
    }

    setGrades(newGrades);
    saveGrades(newGrades);
    setFinals("");
  };

  // FINAL GRADE
  const computeFinalEquivalent = (mEq, fEq) => {
    if (!mEq || !fEq) return "";
    return ((Number(mEq) + Number(fEq)) / 2).toFixed(2);
  };

  const computeStatus = (finEq) => {
    if (!finEq) return "";
    return finEq <= 3.0 ? "Passed" : "Failed";
  };

  // UI
  return (
    <div style={{ padding: "20px" }}>
      <h2>Grades Page</h2>

      {/* SELECT STUDENT */}
      <select
        onChange={handleSelectStudent}
        value={selectedStudent?.name || ""}
      >
        <option value="">Select Student</option>
        {students.map((s, i) => (
          <option key={i} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>

      {selectedStudent && (
        <>
          <h3>Student: {selectedStudent.name}</h3>

          {/* ADD SUBJECT */}
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Add subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
            <button onClick={handleAddSubject}>Add Subject</button>
          </div>

          {/* SUBJECT DROPDOWN */}
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

          {/* MIDTERM */}
          <input
            type="number"
            placeholder="Midterm"
            value={midterm}
            onChange={(e) => setMidterm(e.target.value)}
            style={{ marginLeft: 6 }}
          />
          <button style={{ marginLeft: 5 }} onClick={addMidterm}>
            Add Midterm
          </button>

          {/* FINALS */}
          <input
            type="number"
            placeholder="Finals"
            value={finals}
            onChange={(e) => setFinals(e.target.value)}
            style={{ marginLeft: 6 }}
          />
          <button style={{ marginLeft: 5 }} onClick={addFinals}>
            Add Finals
          </button>
        </>
      )}

      {/* GRADES TABLE */}
      <table border="1" cellPadding="10" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Midterm</th>
            <th>Mid Eq</th>
            <th>Finals</th>
            <th>Final Eq</th>
            <th>Final Rating</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {grades
            .filter(
              (g) =>
                selectedStudent &&
                g.student === selectedStudent.name
            )
            .map((g, i) => {
              const finalRating = computeFinalEquivalent(g.midtermEq, g.finalsEq);
              const status = computeStatus(finalRating);

              return (
                <tr key={i}>
                  <td>{g.subject}</td>
                  <td>{g.midterm}</td>
                  <td>{g.midtermEq}</td>
                  <td>{g.finals}</td>
                  <td>{g.finalsEq}</td>
                  <td>{finalRating}</td>
                  <td>{status}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default GradesPage;
