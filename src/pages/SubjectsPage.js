import React, { useState, useEffect } from "react";

function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ id: "", name: "", gradeLevel: "" });
  const [editingIndex, setEditingIndex] = useState(null);


  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("subjectsData")) || [];
    setSubjects(saved);
  }, []);


  useEffect(() => {
    localStorage.setItem("subjectsData", JSON.stringify(subjects));
  }, [subjects]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = () => {
    if (!form.id || !form.name || !form.gradeLevel)
      return alert("Please complete all fields.");

    let updated;

    if (editingIndex !== null) {

      updated = [...subjects];
      updated[editingIndex] = form;
      setEditingIndex(null);
    } else {

      updated = [...subjects, form];
    }

    setSubjects(updated);
    setForm({ id: "", name: "", gradeLevel: "" });
  };

  const handleEdit = (index) => {
    setForm(subjects[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Subjects Page</h2>

      <div style={{ marginBottom: "20px" }}>
        <input name="id" placeholder="Subject ID" value={form.id} onChange={handleChange} />
        <input name="name" placeholder="Subject Name" value={form.name} onChange={handleChange} />
        <input name="gradeLevel" placeholder="Grade Level" value={form.gradeLevel} onChange={handleChange} />

        <button onClick={handleAddOrUpdate}>
          {editingIndex !== null ? "Update Subject" : "Add Subject"}
        </button>
      </div>

      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Grade Level</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {subjects.map((subj, index) => (
            <tr key={index}>
              <td>{subj.id}</td>
              <td>{subj.name}</td>
              <td>{subj.gradeLevel}</td>
              <td>
                <button onClick={() => handleEdit(index)}>Edit</button>
                <button onClick={() => handleDelete(index)}>Delete</button>
              </td>
            </tr>
          ))}

          {subjects.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>No subjects added.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SubjectsPage;

