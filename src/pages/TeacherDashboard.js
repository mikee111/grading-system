import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";

function TeacherDashboard() {
  const { currentUser } = useData();
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [teacherSubjectIds, setTeacherSubjectIds] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [enterSubjectId, setEnterSubjectId] = useState("");
  const [enterStudentId, setEnterStudentId] = useState("");
  const [enterMidterm, setEnterMidterm] = useState("");
  const [enterFinals, setEnterFinals] = useState("");
  const [enterMessage, setEnterMessage] = useState("");

  useEffect(() => {
    const savedStudents = JSON.parse(localStorage.getItem("studentsData")) || [];
    const savedGrades = JSON.parse(localStorage.getItem("gradesData")) || [];
    const savedSubjects = JSON.parse(localStorage.getItem("subjectsData")) || [];
    setStudents(savedStudents);
    setGrades(savedGrades);
    setAllSubjects(savedSubjects);
  }, []);

  useEffect(() => {
    if (!currentUser || !currentUser.id) return;
    const raw = JSON.parse(localStorage.getItem("teacherSubjectsData")) || {};
    const ids = Array.isArray(raw[currentUser.id]) ? raw[currentUser.id] : [];
    setTeacherSubjectIds(ids);
  }, [currentUser]);

  const persistTeacherSubjects = (updatedIds) => {
    if (!currentUser || !currentUser.id) return;
    setTeacherSubjectIds(updatedIds);
    const raw = JSON.parse(localStorage.getItem("teacherSubjectsData")) || {};
    const next = { ...raw, [currentUser.id]: updatedIds };
    localStorage.setItem("teacherSubjectsData", JSON.stringify(next));
  };

  const handleAddTeacherSubject = () => {
    if (!selectedSubjectId) return;
    if (teacherSubjectIds.includes(selectedSubjectId)) return;
    const updated = [...teacherSubjectIds, selectedSubjectId];
    persistTeacherSubjects(updated);
    setSelectedSubjectId("");
  };

  const handleRemoveTeacherSubject = (id) => {
    const updated = teacherSubjectIds.filter((sId) => sId !== id);
    persistTeacherSubjects(updated);
  };

  const studentMap = useMemo(() => {
    const map = new Map();
    students.forEach((s) => {
      map.set(s.id, s);
    });
    return map;
  }, [students]);

  const subjectStats = useMemo(() => {
    const bySubject = new Map();

    grades.forEach((g) => {
      if (!g.subject) return;
      if (!bySubject.has(g.subject)) {
        bySubject.set(g.subject, {
          subject: g.subject,
          studentIds: new Set(),
          records: [],
        });
      }
      const entry = bySubject.get(g.subject);
      entry.studentIds.add(g.studentId);
      entry.records.push(g);
    });

    const result = [];

    bySubject.forEach((value) => {
      const pendingCount = value.records.filter(
        (r) => r.midterm === "" || r.finals === ""
      ).length;

      const completed = value.records.filter(
        (r) => r.midterm !== "" && r.finals !== ""
      );

      let avg = 0;
      if (completed.length > 0) {
        const sum = completed.reduce((acc, r) => {
          const m = Number(r.midterm);
          const f = Number(r.finals);
          if (Number.isNaN(m) || Number.isNaN(f)) return acc;
          return acc + (m + f) / 2;
        }, 0);
        avg = sum / completed.length;
      }

      result.push({
        subject: value.subject,
        studentsCount: value.studentIds.size,
        pending: pendingCount,
        average: avg,
      });
    });

    return result;
  }, [grades]);

  const totalPending = useMemo(() => {
    return grades.filter((g) => g.midterm === "" || g.finals === "").length;
  }, [grades]);

  const recentActivity = useMemo(() => {
    const copy = [...grades];
    copy.reverse();
    return copy.slice(0, 5).map((g, index) => {
      const s = studentMap.get(g.studentId);
      const name = s ? `${s.firstName} ${s.lastName}` : g.studentId || "Unknown";
      let action = "Updated";
      if (g.midterm && !g.finals) action = "Recorded midterm";
      else if (!g.midterm && g.finals) action = "Recorded finals";
      else if (g.midterm && g.finals) action = "Recorded midterm and finals";
      return {
        id: `${g.studentId}-${g.subject}-${index}`,
        text: `${action} for ${name} in ${g.subject}`,
      };
    });
  }, [grades, studentMap]);

  const totalSubjectsTaught = subjectStats.length;
  const totalStudentsCovered = useMemo(() => {
    const ids = new Set();
    grades.forEach((g) => {
      if (g.studentId) ids.add(g.studentId);
    });
    return ids.size;
  }, [grades]);

  const overallAverage = useMemo(() => {
    const completed = grades.filter((g) => g.midterm !== "" && g.finals !== "");
    if (completed.length === 0) return 0;
    const sum = completed.reduce((acc, r) => {
      const m = Number(r.midterm);
      const f = Number(r.finals);
      if (Number.isNaN(m) || Number.isNaN(f)) return acc;
      return acc + (m + f) / 2;
    }, 0);
    return sum / completed.length;
  }, [grades]);

  const teacherSubjects = useMemo(() => {
    if (!teacherSubjectIds || teacherSubjectIds.length === 0) return [];
    return allSubjects.filter((s) => teacherSubjectIds.includes(s.id));
  }, [allSubjects, teacherSubjectIds]);

  const subjectsWithStudents = useMemo(() => {
    const map = new Map();

    students.forEach((stu) => {
      const subjectList = Array.isArray(stu.subjects) ? stu.subjects : [];
      subjectList.forEach((subjectName) => {
        if (!map.has(subjectName)) {
          map.set(subjectName, []);
        }
        map.get(subjectName).push({
          id: stu.id,
          name: `${stu.firstName} ${stu.lastName}`,
        });
      });
    });

    grades.forEach((g) => {
      if (!g.subject || !g.studentId) return;
      if (!map.has(g.subject)) {
        map.set(g.subject, []);
      }
      const list = map.get(g.subject);
      if (!list.some((s) => s.id === g.studentId)) {
        const stu = students.find((s) => s.id === g.studentId);
        const name = stu ? `${stu.firstName} ${stu.lastName}` : g.studentId;
        list.push({ id: g.studentId, name });
      }
    });

    let entries = [];

    map.forEach((value, subjectName) => {
      const metaSubject =
        teacherSubjects.find((s) => s.name === subjectName) ||
        allSubjects.find((s) => s.name === subjectName) ||
        {};

      const id = metaSubject.id || subjectName;
      const gradeLevel = metaSubject.gradeLevel || "";

      entries.push({
        id,
        name: subjectName,
        gradeLevel,
        students: value,
      });
    });

    if (teacherSubjects.length > 0) {
      const allowed = new Set(teacherSubjects.map((s) => s.name));
      entries = entries.filter((entry) => allowed.has(entry.name));
    }

    return entries;
  }, [students, grades, teacherSubjects, allSubjects]);

  const toEquivalent = (raw) => {
    const n = Number(raw);
    if (Number.isNaN(n)) return "";
    if (n >= 96) return 1.0;
    if (n >= 94) return 1.25;
    if (n >= 92) return 1.5;
    if (n >= 89) return 1.75;
    if (n >= 86) return 2.0;
    if (n >= 83) return 2.25;
    if (n >= 80) return 2.5;
    if (n >= 77) return 2.75;
    if (n >= 75) return 3.0;
    return 5.0;
  };

  const gradeSummary = useMemo(() => {
    if (!grades || grades.length === 0) return [];

    const bySubject = new Map();

    grades.forEach((g) => {
      if (!g.subject) return;
      if (!bySubject.has(g.subject)) {
        bySubject.set(g.subject, {
          subject: g.subject,
          records: [],
        });
      }
      bySubject.get(g.subject).records.push(g);
    });

    const teacherNames = new Set(teacherSubjects.map((s) => s.name));

    const result = [];

    bySubject.forEach((value, subjectName) => {
      if (teacherNames.size > 0 && !teacherNames.has(subjectName)) return;

      const completed = value.records.filter(
        (r) => r.midterm !== "" && r.finals !== ""
      );

      let avg = 0;
      if (completed.length > 0) {
        let sum = 0;
        let count = 0;
        completed.forEach((r) => {
          const m = Number(r.midterm);
          const f = Number(r.finals);
          if (!Number.isNaN(m) && !Number.isNaN(f)) {
            sum += (m + f) / 2;
            count += 1;
          }
        });
        avg = count ? sum / count : 0;
      }

      const metaSubject =
        teacherSubjects.find((s) => s.name === subjectName) ||
        allSubjects.find((s) => s.name === subjectName) ||
        {};

      const status = avg === 0 ? "" : avg >= 75 ? "Pass" : "Fail";

      result.push({
        subject: subjectName,
        gradeLevel: metaSubject.gradeLevel || "",
        average: avg,
        status,
      });
    });

    return result;
  }, [grades, teacherSubjects, allSubjects]);

  const availableStudentsForSubject = useMemo(() => {
    if (!enterSubjectId) return [];
    const subj = teacherSubjects.find((s) => s.id === enterSubjectId);
    if (!subj) return [];
    const entry = subjectsWithStudents.find((s) => s.id === enterSubjectId);
    if (entry) return entry.students;
    return students
      .filter((stu) => {
        const inSubjects = Array.isArray(stu.subjects) && stu.subjects.includes(subj.name);
        const inGrades = grades.some(
          (g) => g.studentId === stu.id && g.subject === subj.name
        );
        return inSubjects || inGrades;
      })
      .map((stu) => ({ id: stu.id, name: `${stu.firstName} ${stu.lastName}` }));
  }, [enterSubjectId, teacherSubjects, subjectsWithStudents, students, grades]);

  const handleSaveEnteredGrades = () => {
    setEnterMessage("");
    if (!enterSubjectId || !enterStudentId) {
      return;
    }
    if (enterMidterm === "" && enterFinals === "") {
      return;
    }
    const subj = teacherSubjects.find((s) => s.id === enterSubjectId);
    if (!subj) return;
    const subjectName = subj.name;
    const newGrades = [...grades];
    let record = newGrades.find(
      (g) => g.studentId === enterStudentId && g.subject === subjectName
    );
    if (!record) {
      record = {
        studentId: enterStudentId,
        subject: subjectName,
        midterm: "",
        midtermEq: "",
        finals: "",
        finalsEq: "",
      };
      newGrades.push(record);
    }
    if (enterMidterm !== "") {
      record.midterm = enterMidterm;
      record.midtermEq = toEquivalent(enterMidterm);
    }
    if (enterFinals !== "") {
      record.finals = enterFinals;
      record.finalsEq = toEquivalent(enterFinals);
    }
    setGrades(newGrades);
    localStorage.setItem("gradesData", JSON.stringify(newGrades));
    setEnterMidterm("");
    setEnterFinals("");
    setEnterMessage("Grades saved.");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 260,
          background: "#d6f5d6",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #ccc",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            fontSize: 22,
            padding: "20px 20px 0 20px",
          }}
      >
          Teacher
        </h3>
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            fontSize: 18,
            padding: 20,
            flexGrow: 1,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveView("overview")}
            style={{
              textAlign: "left",
              background: "transparent",
              border: 0,
              padding: 0,
              cursor: "pointer",
              fontSize: "inherit",
              color: activeView === "overview" ? "#007bff" : "inherit",
              fontWeight: activeView === "overview" ? "bold" : "normal",
            }}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveView("subjects")}
            style={{
              textAlign: "left",
              background: "transparent",
              border: 0,
              padding: 0,
              cursor: "pointer",
              fontSize: "inherit",
              color: activeView === "subjects" ? "#007bff" : "inherit",
              fontWeight: activeView === "subjects" ? "bold" : "normal",
            }}
          >
            My Subjects
          </button>
          <button
            type="button"
            onClick={() => setActiveView("students")}
            style={{
              textAlign: "left",
              background: "transparent",
              border: 0,
              padding: 0,
              cursor: "pointer",
              fontSize: "inherit",
              color: activeView === "students" ? "#007bff" : "inherit",
              fontWeight: activeView === "students" ? "bold" : "normal",
            }}
          >
            My Students
          </button>
          <button
            type="button"
            onClick={() => setActiveView("enterGrades")}
            style={{
              textAlign: "left",
              background: "transparent",
              border: 0,
              padding: 0,
              cursor: "pointer",
              fontSize: "inherit",
              color: activeView === "enterGrades" ? "#007bff" : "inherit",
              fontWeight: activeView === "enterGrades" ? "bold" : "normal",
            }}
          >
            Enter Grades
          </button>
          <button
            type="button"
            onClick={() => setActiveView("summary")}
            style={{
              textAlign: "left",
              background: "transparent",
              border: 0,
              padding: 0,
              cursor: "pointer",
              fontSize: "inherit",
              color: activeView === "summary" ? "#007bff" : "inherit",
              fontWeight: activeView === "summary" ? "bold" : "normal",
            }}
          >
            Grade Summary
          </button>
          <Link to="/grades">Full Grades Page</Link>
        </nav>
      </aside>

      <main style={{ flex: 1 }}>
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ color: "#333", marginBottom: "24px" }}>Teacher Dashboard</h1>
          {activeView === "overview" && (
            <>
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "32px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
          	flex: 1,
            minWidth: "220px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "16px 20px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#666" }}>Subjects</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#007bff" }}>
            {totalSubjectsTaught}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: "220px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "16px 20px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#666" }}>Students</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#28a745" }}>
            {totalStudentsCovered}
          </div>
        </div>

        <div
          id="pending-section"
          style={{
            flex: 1,
            minWidth: "220px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "16px 20px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#666" }}>Pending grades</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#ffc107" }}>
            {totalPending}
          </div>
        </div>

        <div
          id="average-section"
          style={{
            flex: 1,
            minWidth: "220px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "16px 20px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#666" }}>Average grade</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#17a2b8" }}>
            {overallAverage.toFixed(1)}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "24px", textAlign: "right" }}>
        <Link
          to="/grades"
          style={{
            padding: "10px 18px",
            backgroundColor: "#007bff",
            color: "#fff",
            borderRadius: "4px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Add / Update Grades
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "32px",
        }}
      >
        <div
          id="subjects-section"
          style={{
            flex: 1,
            minWidth: "320px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            padding: "16px 20px",
          }}
        >
          <h2 style={{ margin: 0, marginBottom: "12px", fontSize: "1.2rem" }}>
            Subjects and classes
          </h2>
          {subjectStats.length === 0 && <div>No grade records yet.</div>}
          {subjectStats.map((s) => (
            <div
              key={s.subject}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold" }}>{s.subject}</div>
                <div style={{ fontSize: "0.85rem", color: "#666" }}>
                  {s.studentsCount} students
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.85rem" }}>
                <div>Pending: {s.pending}</div>
                <div>Average: {s.average.toFixed(1)}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          id="activity-section"
          style={{
            flex: 1,
            minWidth: "320px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            padding: "16px 20px",
          }}
        >
          <h2 style={{ margin: 0, marginBottom: "12px", fontSize: "1.2rem" }}>
            Recent grading activity
          </h2>
          {recentActivity.length === 0 && <div>No grading activity yet.</div>}
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {recentActivity.map((item) => (
              <li
                key={item.id}
                style={{
                  padding: "6px 0",
                  borderBottom: "1px solid #f0f0f0",
                  fontSize: "0.95rem",
                }}
              >
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
            </>
          )}

          {activeView === "subjects" && (
            <div style={{ maxWidth: "900px" }}>
              <h2 style={{ marginBottom: "16px" }}>Subjects you teach</h2>
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  style={{ flex: 1, padding: 8 }}
                >
                  <option value="">Select subject to add</option>
                  {allSubjects
                    .filter((s) => !teacherSubjectIds.includes(s.id))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
                <button type="button" onClick={handleAddTeacherSubject}>
                  Add subject
                </button>
              </div>

              <table
                border="1"
                cellPadding="10"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Grade level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherSubjects.map((subj) => (
                    <tr key={subj.id}>
                      <td>{subj.id}</td>
                      <td>{subj.name}</td>
                      <td>{subj.gradeLevel}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeacherSubject(subj.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {teacherSubjects.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        style={{ textAlign: "center", fontSize: "0.9rem", color: "#666" }}
                      >
                        No subjects assigned yet. Use the selector above to add
                        subjects.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {activeView === "students" && (
            <div style={{ maxWidth: "1000px" }}>
              <h2 style={{ marginBottom: "16px" }}>My Students</h2>
              {subjectsWithStudents.length === 0 && (
                <div>No subjects or students found for you yet.</div>
              )}
              {subjectsWithStudents.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {subjectsWithStudents.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 10,
                        border: "1px solid #e0e0e0",
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ fontWeight: "bold" }}>{entry.name}</div>
                        {entry.gradeLevel && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              padding: "3px 8px",
                              borderRadius: 999,
                              backgroundColor: "#e9f7ef",
                              color: "#1e7e34",
                              fontWeight: 600,
                            }}
                          >
                            {entry.gradeLevel}
                          </div>
                        )}
                      </div>
                      {entry.students.length === 0 && (
                        <div style={{ fontSize: "0.9rem", color: "#666" }}>
                          No students assigned.
                        </div>
                      )}
                      {entry.students.length > 0 && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              fontSize: "0.8rem",
                              color: "#888",
                              padding: "4px 0",
                              borderBottom: "1px solid #f0f0f0",
                              fontWeight: 600,
                            }}
                          >
                            <div style={{ width: 110 }}>Student ID</div>
                            <div style={{ flex: 1 }}>Name</div>
                          </div>
                          <div
                            style={{
                              maxHeight: 220,
                              overflowY: "auto",
                              marginTop: 4,
                            }}
                          >
                            {entry.students.map((stu) => (
                              <div
                                key={stu.id}
                                style={{
                                  display: "flex",
                                  padding: "6px 0",
                                  borderBottom: "1px solid #f8f8f8",
                                  fontSize: "0.9rem",
                                }}
                              >
                                <div style={{ width: 110, color: "#555" }}>
                                  {stu.id}
                                </div>
                                <div style={{ flex: 1, color: "#333" }}>
                                  {stu.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === "enterGrades" && (
            <div style={{ maxWidth: "700px" }}>
              <h2 style={{ marginBottom: "16px" }}>Enter Grades</h2>
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <label style={{ minWidth: 90 }}>Subject:</label>
                <select
                  value={enterSubjectId}
                  onChange={(e) => {
                    setEnterSubjectId(e.target.value);
                    setEnterStudentId("");
                  }}
                  style={{ flex: 1, padding: 8 }}
                >
                  <option value="">Select subject</option>
                  {teacherSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.gradeLevel && `(${s.gradeLevel})`}
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <label style={{ minWidth: 90 }}>Student:</label>
                <select
                  value={enterStudentId}
                  onChange={(e) => setEnterStudentId(e.target.value)}
                  style={{ flex: 1, padding: 8 }}
                  disabled={!enterSubjectId}
                >
                  <option value="">Select student</option>
                  {availableStudentsForSubject.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.id} - {stu.name}
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <label style={{ minWidth: 90 }}>Midterm:</label>
                <input
                  type="number"
                  value={enterMidterm}
                  onChange={(e) => setEnterMidterm(e.target.value)}
                  style={{ flex: 1, padding: 8 }}
                />
              </div>
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <label style={{ minWidth: 90 }}>Finals:</label>
                <input
                  type="number"
                  value={enterFinals}
                  onChange={(e) => setEnterFinals(e.target.value)}
                  style={{ flex: 1, padding: 8 }}
                />
              </div>
              <button type="button" onClick={handleSaveEnteredGrades}>
                Save grades
              </button>
              {enterMessage && (
                <div style={{ marginTop: 8, color: "#28a745" }}>{enterMessage}</div>
              )}
            </div>
          )}

          {activeView === "summary" && (
            <div style={{ maxWidth: "900px" }}>
              <h2 style={{ marginBottom: "16px" }}>Grade Summary</h2>
              {gradeSummary.length === 0 && <div>No subjects with grades yet.</div>}
              {gradeSummary.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 8,
                    border: "1px solid #e0e0e0",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.95rem",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: "#f8f9fa",
                          textAlign: "left",
                        }}
                      >
                        <th style={{ padding: "10px 12px" }}>Subject</th>
                        <th style={{ padding: "10px 12px" }}>Grade level</th>
                        <th style={{ padding: "10px 12px" }}>Average grade</th>
                        <th style={{ padding: "10px 12px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradeSummary.map((row) => (
                        <tr
                          key={row.subject}
                          style={{ borderTop: "1px solid #f0f0f0" }}
                        >
                          <td style={{ padding: "8px 12px" }}>{row.subject}</td>
                          <td style={{ padding: "8px 12px", color: "#555" }}>
                            {row.gradeLevel}
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            {row.average ? row.average.toFixed(1) : "-"}
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 10px",
                                borderRadius: 999,
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                backgroundColor:
                                  row.status === "Pass"
                                    ? "rgba(40,167,69,0.12)"
                                    : row.status === "Fail"
                                    ? "rgba(220,53,69,0.12)"
                                    : "rgba(108,117,125,0.08)",
                                color:
                                  row.status === "Pass"
                                    ? "#28a745"
                                    : row.status === "Fail"
                                    ? "#dc3545"
                                    : "#6c757d",
                              }}
                            >
                              {row.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TeacherDashboard;
