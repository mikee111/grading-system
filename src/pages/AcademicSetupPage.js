import React, { useState, useMemo, useEffect } from "react";
// Academic Setup Page - Manages subjects, courses, sections, etc.
import { useData } from "../context/DataContext";
import "../css/AdminForms.css";

// Reusable Modal Component
function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// Sub-component for Subjects Tab
function SubjectsTab({ subjects, teachers, addSubject, updateSubject, deleteSubject, assignTeacherToSubject, removeTeacherFromSubject, teacherAssignments }) {
  const [form, setForm] = useState({ id: "", name: "", gradeLevel: "", section: "", teacherName: "" });
  const [editForm, setEditForm] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const [isManual, setIsManual] = useState(false);

  const handleChange = (e, targetForm = "add") => {
    const { name, value } = e.target;
    const currentForm = targetForm === "add" ? form : editForm;
    const setter = targetForm === "add" ? setForm : setEditForm;

    if (name === "teacherName" && value === "CUSTOM_NAME") {
      setIsManual(true);
      setter({ ...currentForm, teacherName: "" });
    } else {
      setter({ ...currentForm, [name]: value });
      if (name === "teacherName" && !isManual) setIsManual(false);
    }
  };

  const handleAdd = () => {
    if (!form.id || !form.name) return alert("Please fill in ID and Name");
    
    // 1. Add the subject
    addSubject(form);
    
    // 2. If a teacher was selected from the list, also assign them explicitly
    if (form.teacherName && !isManual) {
      const selectedTeacher = teachers.find(t => (t.username || t.email) === form.teacherName);
      if (selectedTeacher) {
        assignTeacherToSubject(selectedTeacher.id, form.id);
      }
    }

    setNewlyAddedId(form.id);
    setForm({ id: "", name: "", gradeLevel: "", section: "", teacherName: "" });
    setIsManual(false);
    setTimeout(() => setNewlyAddedId(null), 3000);
  };

  const handleUpdate = () => {
    if (!editForm.id || !editForm.name) return alert("Please fill in ID and Name");
    
    const index = subjects.findIndex(s => s.id === editForm.id);
    const oldSubject = subjects[index];
    
    // 1. Update the subject
    updateSubject(index, editForm);
    
    // 2. Handle teacher assignment change
    // Find previous teacher ID
    const oldTeacherId = Object.keys(teacherAssignments || {}).find(tId => 
      (teacherAssignments[tId] || []).includes(oldSubject.id)
    );

    // If teacher changed
    if (editForm.teacherName && !isManual) {
      const newTeacher = teachers.find(t => (t.username || t.email) === editForm.teacherName);
      if (newTeacher) {
        if (oldTeacherId && oldTeacherId !== newTeacher.id) {
          removeTeacherFromSubject(oldTeacherId, oldSubject.id);
        }
        assignTeacherToSubject(newTeacher.id, editForm.id);
      }
    } else if (oldTeacherId) {
      // If changed to manual or unassigned, remove old assignment
      removeTeacherFromSubject(oldTeacherId, oldSubject.id);
    }

    setIsEditModalOpen(false);
    setEditForm(null);
  };

  const handleDelete = () => {
    const index = subjects.findIndex(s => s.id === itemToDelete.id);
    const subjectId = itemToDelete.id;

    // 1. Clean up teacher assignments
    Object.keys(teacherAssignments || {}).forEach(tId => {
      if ((teacherAssignments[tId] || []).includes(subjectId)) {
        removeTeacherFromSubject(tId, subjectId);
      }
    });

    // 2. Delete the subject
    deleteSubject(index);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return subjects;
    const query = searchQuery.toLowerCase();
    return subjects.filter(s => 
      (s.id || "").toLowerCase().includes(query) || 
      (s.name || "").toLowerCase().includes(query) ||
      (s.teacherName || "").toLowerCase().includes(query)
    );
  }, [subjects, searchQuery]);

  return (
    <div className="admin-page-container">
      <h2>Manage Subjects</h2>
      
      {/* Create New Subject Section */}
      <div className="admin-form-container" style={{ marginBottom: "30px", maxWidth: "100%", border: "1px solid #ddd", backgroundColor: "white", padding: 0, overflow: "hidden" }}>
        <div style={{ backgroundColor: "#f2f2f2", padding: "15px 20px", borderBottom: "1px solid #ddd" }}>
          <h3 style={{ margin: 0 }}>Create New Subject</h3>
        </div>
        <div style={{ padding: "20px" }}>
          <div className="admin-form">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Subject ID*</label>
                <input name="id" value={form.id} onChange={e => handleChange(e, "add")} placeholder="e.g. SUB101" required />
              </div>
              <div className="admin-form-group">
                <label>Subject Name*</label>
                <input name="name" value={form.name} onChange={e => handleChange(e, "add")} placeholder="e.g. Mathematics" required />
              </div>
            </div>
            
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Level</label>
                <input name="gradeLevel" value={form.gradeLevel} onChange={e => handleChange(e, "add")} placeholder="e.g. Grade 10" />
              </div>
              <div className="admin-form-group">
                <label>Section</label>
                <input name="section" value={form.section} onChange={e => handleChange(e, "add")} placeholder="e.g. Section A" />
              </div>
              <div className="admin-form-group">
                <label>Teacher</label>
                {!isManual ? (
                  <select name="teacherName" value={form.teacherName} onChange={e => handleChange(e, "add")}>
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.username || t.email}>
                        {t.firstName} {t.lastName} ({t.username || t.email})
                      </option>
                    ))}
                    <option value="CUSTOM_NAME">+ Custom Name</option>
                  </select>
                ) : (
                  <input name="teacherName" value={form.teacherName} onChange={e => handleChange(e, "add")} placeholder="Teacher Name" />
                )}
              </div>
            </div>
            
            <button className="admin-form-button primary" onClick={handleAdd}>Create Subject Account</button>
          </div>
        </div>
      </div>

      {/* Existing Subjects Section */}
      <div className="admin-form-container" style={{ maxWidth: "100%", border: "1px solid #ddd", backgroundColor: "white", padding: 0, overflow: "hidden" }}>
        <div style={{ backgroundColor: "#f2f2f2", padding: "15px 20px", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Existing Subjects</h3>
          <div style={{ width: "300px" }}>
            <input 
              style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #ddd", width: "100%" }} 
              placeholder="Search subjects..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div style={{ padding: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>ID</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Level</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Section</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Teacher</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((s) => (
                <tr key={s.id} className={newlyAddedId === s.id ? "highlight-row" : ""} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{s.id}</td>
                  <td style={{ padding: "12px" }}>{s.name}</td>
                  <td style={{ padding: "12px" }}>{s.gradeLevel}</td>
                  <td style={{ padding: "12px" }}>{s.section}</td>
                  <td style={{ padding: "12px" }}>{s.teacherName}</td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        className="admin-form-button" 
                        style={{ padding: '5px 10px', backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }} 
                        onClick={() => { setEditForm(s); setIsEditModalOpen(true); }}
                      >
                        Edit
                      </button>
                      <button 
                        className="admin-form-button" 
                        style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }} 
                        onClick={() => { setItemToDelete(s); setIsDeleteModalOpen(true); }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#666" }}>No subjects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Subject"
        footer={(
          <>
            <button className="admin-form-button secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button className="admin-form-button primary" onClick={handleUpdate}>Update Subject</button>
          </>
        )}
      >
        {editForm && (
          <div className="admin-form">
            <div className="admin-form-group">
              <label>Subject ID</label>
              <input name="id" value={editForm.id} disabled />
            </div>
            <div className="admin-form-group">
              <label>Name</label>
              <input name="name" value={editForm.name} onChange={e => handleChange(e, "edit")} />
            </div>
            <div className="admin-form-group">
              <label>Level</label>
              <input name="gradeLevel" value={editForm.gradeLevel} onChange={e => handleChange(e, "edit")} />
            </div>
            <div className="admin-form-group">
              <label>Section</label>
              <input name="section" value={editForm.section} onChange={e => handleChange(e, "edit")} />
            </div>
            <div className="admin-form-group">
              <label>Teacher</label>
              {!isManual ? (
                <select name="teacherName" value={editForm.teacherName} onChange={e => handleChange(e, "edit")}>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.username || t.email}>
                      {t.firstName} {t.lastName} ({t.username || t.email})
                    </option>
                  ))}
                  <option value="CUSTOM_NAME">+ Custom Name</option>
                </select>
              ) : (
                <input name="teacherName" value={editForm.teacherName} onChange={e => handleChange(e, "edit")} placeholder="Teacher Name" />
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Delete"
        footer={(
          <>
            <button className="admin-form-button secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            <button className="admin-form-button danger" style={{ backgroundColor: '#dc3545', color: 'white' }} onClick={handleDelete}>Delete Subject</button>
          </>
        )}
      >
        <p>Are you sure you want to delete subject <strong>{itemToDelete?.name}</strong> ({itemToDelete?.id})? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}

// Generic Tab for Courses, Sections, etc.
function GenericTab({ title, items, addItem, updateItem, deleteItem, fields }) {
  const [form, setForm] = useState(fields.reduce((acc, f) => ({ ...acc, [f.name]: f.type === 'checkbox' ? false : "" }), {}));
  const [editForm, setEditForm] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newlyAddedId, setNewlyAddedId] = useState(null);

  const handleAdd = () => {
    const id = `item-${Date.now()}`;
    const newItem = { ...form, id };
    addItem(newItem);
    setNewlyAddedId(id);
    setForm(fields.reduce((acc, f) => ({ ...acc, [f.name]: f.type === 'checkbox' ? false : "" }), {}));
    setTimeout(() => setNewlyAddedId(null), 3000);
  };

  const handleUpdate = () => {
    updateItem(editForm.id, editForm);
    setIsEditModalOpen(false);
    setEditForm(null);
  };

  const handleDelete = () => {
    deleteItem(itemToDelete.id);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      fields.some(f => String(item[f.name] || "").toLowerCase().includes(query))
    );
  }, [items, searchQuery, fields]);

  return (
    <div className="admin-page-container">
      <h2>Manage {title}</h2>
      
      {/* Create New Section */}
      <div className="admin-form-container" style={{ marginBottom: "30px", maxWidth: "100%", border: "1px solid #ddd", backgroundColor: "white", padding: 0, overflow: "hidden" }}>
        <div style={{ backgroundColor: "#f2f2f2", padding: "15px 20px", borderBottom: "1px solid #ddd" }}>
          <h3 style={{ margin: 0 }}>Create New {title.slice(0, -1)}</h3>
        </div>
        <div style={{ padding: "20px" }}>
          <div className="admin-form">
            <div className="admin-form-row">
              {fields.map(f => (
                <div className="admin-form-group" key={f.name}>
                  <label>{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })}>
                      <option value="">Select {f.label}</option>
                      {f.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  ) : f.type === 'checkbox' ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                      <input type="checkbox" checked={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.checked })} style={{ width: "20px", height: "20px" }} />
                      <span>{f.label}</span>
                    </div>
                  ) : (
                    <input 
                      type={f.type || "text"} 
                      value={form[f.name]} 
                      onChange={e => setForm({ ...form, [f.name]: e.target.value })} 
                      placeholder={f.placeholder} 
                    />
                  )}
                </div>
              ))}
            </div>
            <button className="admin-form-button primary" onClick={handleAdd}>Create {title.slice(0, -1)} Account</button>
          </div>
        </div>
      </div>

      {/* Existing Items Section */}
      <div className="admin-form-container" style={{ maxWidth: "100%", border: "1px solid #ddd", backgroundColor: "white", padding: 0, overflow: "hidden" }}>
        <div style={{ backgroundColor: "#f2f2f2", padding: "15px 20px", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Existing {title}</h3>
          <div style={{ width: "300px" }}>
            <input 
              style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #ddd", width: "100%" }} 
              placeholder={`Search ${title.toLowerCase()}...`} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div style={{ padding: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                {fields.map(f => (
                  <th key={f.name} style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>{f.label}</th>
                ))}
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className={newlyAddedId === item.id ? "highlight-row" : ""} style={{ borderBottom: "1px solid #eee" }}>
                  {fields.map(f => (
                    <td key={f.name} style={{ padding: "12px" }}>
                      {f.type === 'checkbox' ? (
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: "12px", 
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          backgroundColor: item[f.name] ? "#e8f5e9" : "#ffebee",
                          color: item[f.name] ? "#2e7d32" : "#c62828"
                        }}>
                          {item[f.name] ? "Active" : "Inactive"}
                        </span>
                      ) : item[f.name]}
                    </td>
                  ))}
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        className="admin-form-button" 
                        style={{ padding: '5px 10px', backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }} 
                        onClick={() => { setEditForm(item); setIsEditModalOpen(true); }}
                      >
                        Edit
                      </button>
                      <button 
                        className="admin-form-button" 
                        style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }} 
                        onClick={() => { setItemToDelete(item); setIsDeleteModalOpen(true); }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={fields.length + 1} style={{ textAlign: "center", padding: "20px", color: "#666" }}>No {title.toLowerCase()} found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title={`Edit ${title.slice(0, -1)}`}
        footer={(
          <>
            <button className="admin-form-button secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button className="admin-form-button primary" onClick={handleUpdate}>Update {title.slice(0, -1)}</button>
          </>
        )}
      >
        {editForm && (
          <div className="admin-form">
            {fields.map(f => (
              <div className="admin-form-group" key={f.name}>
                <label>{f.label}</label>
                {f.type === 'select' ? (
                  <select value={editForm[f.name]} onChange={e => setEditForm({ ...editForm, [f.name]: e.target.value })}>
                    <option value="">Select {f.label}</option>
                    {f.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                ) : f.type === 'checkbox' ? (
                  <input type="checkbox" checked={editForm[f.name]} onChange={e => setEditForm({ ...editForm, [f.name]: e.target.checked })} />
                ) : (
                  <input 
                    type={f.type || "text"} 
                    value={editForm[f.name]} 
                    onChange={e => setEditForm({ ...editForm, [f.name]: e.target.value })} 
                    placeholder={f.placeholder} 
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Delete"
        footer={(
          <>
            <button className="admin-form-button secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            <button className="admin-form-button danger" style={{ backgroundColor: '#dc3545', color: 'white' }} onClick={handleDelete}>Delete {title.slice(0, -1)}</button>
          </>
        )}
      >
        <p>Are you sure you want to delete this {title.slice(0, -1).toLowerCase()}? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}

function AcademicSetupPage({ initialTab = "subjects" }) {
  const {
    subjects, addSubject, updateSubject, deleteSubject,
    courses, addCourse, updateCourse, deleteCourse,
    sections, addSection, updateSection, deleteSection,
    yearLevels, addYearLevel, updateYearLevel, deleteYearLevel,
    schoolYears, addSchoolYear, updateSchoolYear, deleteSchoolYear,
    semesters, addSemester, updateSemester, deleteSemester,
    users, assignTeacherToSubject, removeTeacherFromSubject, teacherAssignments
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

  return (
    <div className="admin-page-container">
      <div className="setup-content">
        {initialTab === "subjects" && (
          <SubjectsTab 
            subjects={subjects} 
            teachers={teachers} 
            addSubject={addSubject} 
            updateSubject={updateSubject} 
            deleteSubject={deleteSubject} 
            assignTeacherToSubject={assignTeacherToSubject}
            removeTeacherFromSubject={removeTeacherFromSubject}
            teacherAssignments={teacherAssignments}
          />
        )}
        {initialTab === "courses" && (
          <GenericTab 
            title="Courses"
            items={courses}
            addItem={addCourse}
            updateItem={updateCourse}
            deleteItem={deleteCourse}
            fields={[
              { name: "code", label: "Course Code", placeholder: "e.g. BSCS" },
              { name: "name", label: "Course Name", placeholder: "e.g. Bachelor of Science in Computer Science" }
            ]}
          />
        )}
        {initialTab === "sections" && (
          <GenericTab 
            title="Sections"
            items={sections}
            addItem={addSection}
            updateItem={updateSection}
            deleteItem={deleteSection}
            fields={[
              { name: "name", label: "Section Name", placeholder: "e.g. Section A" },
              { name: "course", label: "Course", type: "select", options: courses.map(c => ({ value: c.code, label: c.name })) },
              { name: "yearLevel", label: "Year Level", type: "select", options: yearLevels.map(y => ({ value: y.name, label: y.name })) }
            ]}
          />
        )}
        {initialTab === "year-levels" && (
          <GenericTab 
            title="Year Levels"
            items={yearLevels}
            addItem={addYearLevel}
            updateItem={updateYearLevel}
            deleteItem={deleteYearLevel}
            fields={[
              { name: "name", label: "Year Level Name", placeholder: "e.g. 1st Year" },
              { name: "level", label: "Numerical Level", type: "number", placeholder: "e.g. 1" }
            ]}
          />
        )}
        {initialTab === "school-years" && (
          <GenericTab 
            title="School Years"
            items={schoolYears}
            addItem={addSchoolYear}
            updateItem={updateSchoolYear}
            deleteItem={deleteSchoolYear}
            fields={[
              { name: "name", label: "School Year", placeholder: "e.g. 2023-2024" },
              { name: "isActive", label: "Set as Active", type: "checkbox" }
            ]}
          />
        )}
        {initialTab === "semesters" && (
          <GenericTab 
            title="Semesters"
            items={semesters}
            addItem={addSemester}
            updateItem={updateSemester}
            deleteItem={deleteSemester}
            fields={[
              { name: "name", label: "Semester Name", placeholder: "e.g. 1st Semester" },
              { name: "isActive", label: "Set as Active", type: "checkbox" }
            ]}
          />
        )}
      </div>
    </div>
  );
}

export default AcademicSetupPage;
