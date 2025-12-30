import React, { useEffect, useState } from "react";

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [form, setForm] = useState({
    id: "",
    firstName: "",
    lastName: "",
    course: "",
    year: "",
    subjects: []
  });
  const [newAssigned, setNewAssigned] = useState("");

  const [editingIndex, setEditingIndex] = useState(null);


  const [assignIndex, setAssignIndex] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);


  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("studentsData")) || [];
    setStudents(saved);
  }, []);


  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("subjectsData")) || [];
    setSubjects(saved);
  }, []);


  useEffect(() => {
    localStorage.setItem("studentsData", JSON.stringify(students));
  }, [students]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = () => {
    if (!form.id || !form.firstName || !form.lastName)
      return alert("Please complete all fields.");

    let updated = [...students];

    if (editingIndex !== null) {
      updated[editingIndex] = {
        ...form,
        subjects: form.subjects || []
      };
      setEditingIndex(null);
    } else {
      updated.push({
        ...form,
        subjects: form.subjects || []
      });
    }

    setStudents(updated);

    setForm({
      id: "",
      firstName: "",
      lastName: "",
      course: "",
      year: "",
      subjects: []
    });
  };

  const handleEdit = (index) => {
    setForm({
      ...students[index],
      subjects: students[index].subjects || []
    });
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  // -------------------------------
  // OPEN ASSIGN SUBJECTS MODAL
  // -------------------------------
  const openAssignModal = (index) => {
    setAssignIndex(index);
    setShowAssignModal(true);
  };

  // -------------------------------
  // ASSIGN OR REMOVE SUBJECT
  // -------------------------------
  const toggleSubject = (subjectName) => {
    const updated = [...students];
    const student = updated[assignIndex];

    if (!student.subjects) student.subjects = [];

    if (student.subjects.includes(subjectName)) {
      student.subjects = student.subjects.filter((s) => s !== subjectName);
    } else {
      student.subjects.push(subjectName);
    }

    setStudents(updated);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto" }}>
      <h2>Students Page</h2>

      {/* FORM */}
      <div style={{ marginBottom: "20px" }}>
        <input name="id" placeholder="Student ID" value={form.id} onChange={handleChange} />
        <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} />
        <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
        <input name="course" placeholder="Course" value={form.course} onChange={handleChange} />
        <input name="year" placeholder="Year" value={form.year} onChange={handleChange} />

        <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
          <select value={newAssigned} onChange={(e) => setNewAssigned(e.target.value)}>
            <option value="">Select subject to assign</option>
            {subjects.map((s, i) => (
              <option key={i} value={s.name}>{s.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              if (!newAssigned) return;
              if (form.subjects?.includes(newAssigned)) return;
              setForm({ ...form, subjects: [...(form.subjects || []), newAssigned] });
              setNewAssigned("");
            }}
          >Assign</button>
        </div>

        <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(form.subjects || []).map((name, idx) => (
            <span key={idx} style={{ background: "#eef", border: "1px solid #ccd", borderRadius: 14, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 6 }}>
              {name}
              <button type="button" onClick={() => setForm({ ...form, subjects: (form.subjects || []).filter((n) => n !== name) })} style={{ border: 0, background: "transparent", cursor: "pointer" }}>×</button>
            </span>
          ))}
        </div>

        <button onClick={handleAddOrUpdate}>
          {editingIndex !== null ? "Update Student" : "Add Student"}
        </button>
      </div>

      {/* TABLE */}
      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Course</th>
            <th>Year</th>
            <th>Assigned Subjects</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((stud, index) => (
            <tr key={index}>
              <td>{stud.id}</td>
              <td>{stud.firstName} {stud.lastName}</td>
              <td>{stud.course}</td>
              <td>{stud.year}</td>
              <td>{stud.subjects?.join(", ") || "None"}</td>

              <td>
                <button onClick={() => handleEdit(index)}>Edit</button>
                <button onClick={() => handleDelete(index)}>Delete</button>
                <button onClick={() => openAssignModal(index)}>Assign Subject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ASSIGN SUBJECT MODAL */}
      {showAssignModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ background: "white", padding: "20px", width: "400px" }}>
            <h3>Assign Subjects</h3>

            {subjects.map((s, i) => (
              <div key={i}>
                <input
                  type="checkbox"
                  checked={students[assignIndex]?.subjects?.includes(s.name)}
                  onChange={() => toggleSubject(s.name)}
                />
                {s.name}
              </div>
            ))}

            <button onClick={() => setShowAssignModal(false)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default StudentsPage;
