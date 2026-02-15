import React, { useMemo, useState } from "react";
import { useData } from "../context/DataContext";

function StudentDashboard() {
  const { 
    currentUser, 
    enrollments, 
    schoolYears, 
    semesters,
    students,
    subjects,
    users,
    enlistmentStatuses,
    updateUserProfile
  } = useData();

  const activeSY = useMemo(() => schoolYears.find(sy => sy.isActive)?.name || "N/A", [schoolYears]);
  const activeSem = useMemo(() => semesters.find(s => s.isActive)?.name || "N/A", [semesters]);
  const [activeView, setActiveView] = useState("overview");

  const studentEnrollments = useMemo(() => {
    if (!currentUser) return [];
    return enrollments[currentUser.id] || [];
  }, [currentUser, enrollments]);

  const mySubjects = useMemo(() => {
    return studentEnrollments.map(enrollment => {
      const subject = subjects.find(s => s.id === enrollment.id) || {};
      const teacher = users.find(u => u.username === subject.teacherName);
      return {
        id: enrollment.id,
        code: subject.code || "N/A",
        name: subject.name || enrollment.name || "N/A",
        schedule: subject.schedule || "TBA",
        teacher: teacher ? `${teacher.firstName} ${teacher.lastName}` : (subject.teacherName || "TBA")
      };
    });
  }, [studentEnrollments, subjects, users]);

  const myGrades = useMemo(() => {
    return studentEnrollments.map(enrollment => {
      const subject = subjects.find(s => s.id === enrollment.id) || {};
      const teacher = users.find(u => u.username === subject.teacherName);
      
      const mid = Number(enrollment.midtermEq || 0);
      const fin = Number(enrollment.finalEq || 0);
      
      let equivalent = "—";
      let status = "Enrolled";
      let statusColor = "#6b7280"; // gray
      let statusBg = "#f3f4f6";

      if (enrollment.midtermEq && enrollment.finalEq) {
        const avg = (mid + fin) / 2;
        equivalent = avg.toFixed(2);
        if (avg <= 3.0) {
          status = "Passed";
          statusColor = "#065f46"; // green
          statusBg = "#ecfdf5";
        } else {
          status = "Failed";
          statusColor = "#991b1b"; // red
          statusBg = "#fef2f2";
        }
      } else if (enrollment.midtermEq || enrollment.finalEq) {
        status = "In Progress";
        statusColor = "#d97706"; // amber
        statusBg = "#fffbeb";
      }

      return {
        id: enrollment.id,
        code: subject.code || "N/A",
        name: subject.name || enrollment.name || "N/A",
        teacher: teacher ? `${teacher.firstName} ${teacher.lastName}` : (subject.teacherName || "TBA"),
        semester: enrollment.semester || "—",
        midterm: enrollment.midtermEq || "—",
        finals: enrollment.finalEq || "—",
        equivalent,
        status,
        statusColor,
        statusBg
      };
    });
  }, [studentEnrollments, subjects, users]);

  const stats = useMemo(() => {
    const total = studentEnrollments.length;
    const completed = studentEnrollments.filter(e => e.midtermScore && e.finalScore).length;
    const anyGrades = studentEnrollments.some(e => e.midtermScore || e.finalScore);
    const gwa = studentEnrollments.reduce((acc, e) => {
      const mid = Number(e.midtermEq || 0);
      const fin = Number(e.finalEq || 0);
      const avg = ((mid || 0) + (fin || 0)) / 2;
      return acc + (avg || 0);
    }, 0) / (completed || 1 || 1);
    let status = "Enrolled";
    if (total === 0) status = "Enrolled";
    else if (completed === total) status = "Completed";
    else if (anyGrades) status = "In Progress";
    else status = "Enrolled";
    return { total, completed, gwa: isFinite(gwa) ? gwa.toFixed(2) : "0.00", status };
  }, [studentEnrollments]);

  const subjectsCount = useMemo(() => mySubjects.length, [mySubjects]);
  const gradesCompleted = useMemo(() => studentEnrollments.filter(e => e.midtermEq && e.finalEq).length, [studentEnrollments]);
  const gradesTotal = useMemo(() => studentEnrollments.length, [studentEnrollments]);
  const [hoveredItem, setHoveredItem] = useState(null);

  const [email, setEmail] = useState(currentUser?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || "");
  const [address, setAddress] = useState(currentUser?.address || "");
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.profilePhoto || "");
  const [saving, setSaving] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setProfilePhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      updateUserProfile(currentUser.id, {
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: email || "",
        phoneNumber,
        address,
        profilePhoto
      });
    } finally {
      setSaving(false);
    }
  };

  // ----- Enlistment state & helpers -----
  const [selectedSubjects, setSelectedSubjects] = useState(() => new Set());

  const enlistmentSubjects = useMemo(() => {
    const byCode = Object.fromEntries(subjects.map(s => [String(s.code || "").toUpperCase().trim(), s]));
    const it301 = byCode["IT301"] || { id: "sub-it301", code: "IT301", name: "Web Systems", units: 3, schedule: "MWF 9:00AM - 10:00AM", capacity: 30, course: "BSIT", yearLevel: "3rd Year" };
    const it302 = byCode["IT302"] || { id: "sub-it302", code: "IT302", name: "Data Analytics", units: 3, schedule: "TTH 1:00PM - 3:00PM", capacity: 30, course: "BSIT", yearLevel: "3rd Year" };
    return [it301, it302];
  }, [subjects]);

  const subjectEnrolledCount = useMemo(() => {
    const counts = {};
    Object.values(enrollments || {}).forEach(list => {
      (list || []).forEach(rec => {
        const sid = String(rec.id);
        counts[sid] = (counts[sid] || 0) + 1;
      });
    });
    return counts;
  }, [enrollments]);

  const enlistmentRows = useMemo(() => {
    return enlistmentSubjects.map(s => {
      const capacity = Number(s.capacity || 0);
      const enrolledCount = subjectEnrolledCount[String(s.id)] || 0;
      const available = capacity > 0 ? Math.max(0, capacity - enrolledCount) : null;
      const isFull = capacity > 0 ? available === 0 : false;
      return {
        id: s.id,
        code: s.code || "N/A",
        name: s.name || "N/A",
        units: Number(s.units || 0),
        schedule: s.schedule || "TBA",
        capacity: capacity || null,
        available,
        isFull
      };
    });
  }, [enlistmentSubjects, subjectEnrolledCount]);

  const totalUnits = useMemo(() => {
    let sum = 0;
    enlistmentRows.forEach(row => {
      if (selectedSubjects.has(row.id)) sum += row.units;
    });
    return sum;
  }, [selectedSubjects, enlistmentRows]);

  const toggleSubject = (id, disabled) => {
    if (disabled) return;
    setSelectedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const SummaryItem = ({ label, value, icon, accent }) => (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "16px",
      borderRadius: "14px",
      border: "1px solid #d1fae5",
      background: "#ffffff"
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        color: accent || "#065f46",
        background: "#ecfdf5"
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 12,
          color: "#065f46",
          opacity: 0.75,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.5
        }}>{label}</div>
        <div style={{ fontSize: 18, color: "#064e3b", fontWeight: 700 }}>{value || "—"}</div>
      </div>
    </div>
  );

  const renderActiveView = () => {
    if (activeView === "subjects") {
      return (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #065f46", textAlign: "left" }}>
                <th style={{ padding: "12px", color: "#065f46", fontSize: 14 }}>Subject Code</th>
                <th style={{ padding: "12px", color: "#065f46", fontSize: 14 }}>Subject Name</th>
                <th style={{ padding: "12px", color: "#065f46", fontSize: 14 }}>Teachers</th>
                <th style={{ padding: "12px", color: "#065f46", fontSize: 14 }}>Schedule</th>
              </tr>
            </thead>
            <tbody>
              {mySubjects.length > 0 ? (
                mySubjects.map(sub => (
                  <tr key={sub.id} style={{ borderBottom: "1px solid #cbd5e1" }}>
                    <td style={{ padding: "12px", fontSize: 14, fontWeight: 600 }}>{sub.code}</td>
                    <td style={{ padding: "12px", fontSize: 14 }}>{sub.name}</td>
                    <td style={{ padding: "12px", fontSize: 14 }}>{sub.teacher}</td>
                    <td style={{ padding: "12px", fontSize: 14 }}>{sub.schedule}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: "24px", textAlign: "center", opacity: 0.7 }}>
                    No subjects enrolled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeView === "viewGrades") {
      return (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #065f46", textAlign: "left" }}>
                <th style={{ padding: "12px", color: "#065f46", fontSize: 14 }}>Subject</th>
                <th style={{ padding: "12px", color: "#065f46", fontSize: 14 }}>Teachers</th>
                <th style={{ padding: "12px", color: "#065f46", fontSize: 14 }}>Semester</th>
                <th style={{ padding: "12px", color: "#065f46", fontSize: 14, textAlign: "center" }}>Midterm</th>
                <th style={{ padding: "12px", color: "#065f46", fontSize: 14, textAlign: "center" }}>Finals</th>
                <th style={{ padding: "12px", color: "#065f46", fontSize: 14, textAlign: "center" }}>Equivalent</th>
                <th style={{ padding: "12px", color: "#065f46", fontSize: 14, textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {myGrades.length > 0 ? (
                myGrades.map(grade => (
                  <tr key={grade.id} style={{ borderBottom: "1px solid #cbd5e1" }}>
                    <td style={{ padding: "12px", fontSize: 14 }}>
                      <div style={{ fontWeight: 600 }}>{grade.code}</div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>{grade.name}</div>
                    </td>
                    <td style={{ padding: "12px", fontSize: 14 }}>{grade.teacher}</td>
                    <td style={{ padding: "12px", fontSize: 14 }}>{grade.semester}</td>
                    <td style={{ padding: "12px", fontSize: 14, textAlign: "center", fontWeight: 600 }}>{grade.midterm}</td>
                    <td style={{ padding: "12px", fontSize: 14, textAlign: "center", fontWeight: 600 }}>{grade.finals}</td>
                    <td style={{ padding: "12px", fontSize: 14, textAlign: "center", fontWeight: 700, color: "#065f46" }}>{grade.equivalent}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        backgroundColor: grade.statusBg,
                        color: grade.statusColor
                      }}>
                        {grade.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "24px", textAlign: "center", opacity: 0.7 }}>
                    No grades available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeView === "enlistment") {
      const status = enlistmentStatuses && currentUser ? (enlistmentStatuses[currentUser.id] || "Pending") : "Pending";
      const map = {
        Pending: { text: "🟡 Pending", bg: "#fffbeb", color: "#92400e", border: "#f59e0b" },
        Approved: { text: "🟢 Approved", bg: "#ecfdf5", color: "#065f46", border: "#10b981" },
        Rejected: { text: "🔴 Rejected", bg: "#fef2f2", color: "#991b1b", border: "#ef4444" }
      };
      const s = map[status] || map.Pending;

      return (
        <div>
          <div style={{ position: "absolute", top: 12, right: 12 }}>
            <span style={{
              padding: "6px 12px",
              borderRadius: 16,
              fontSize: 12,
              fontWeight: 800,
              background: s.bg,
              color: s.color,
              border: `1px solid ${s.border}`
            }}>
              {s.text}
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 16,
            border: "1px solid #065f46",
            borderRadius: 10,
            padding: 16,
            background: "#ffffff"
          }}>
            <div><strong>Student Name:</strong> {`${currentUser?.firstName || "Clarenz"} ${currentUser?.lastName || "User"}`}</div>
            <div><strong>Student ID:</strong> {currentUser?.studentNumber || "2025-00123"}</div>
            <div><strong>Course:</strong> {currentUser?.course || "BSIT"}</div>
            <div><strong>Year Level:</strong> {currentUser?.year || "3rd Year"}</div>
            <div><strong>School Year:</strong> {activeSY || "2025–2026"}</div>
            <div><strong>Semester:</strong> {activeSem || "1st Semester"}</div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #065f46", textAlign: "left" }}>
                  <th style={{ padding: "12px", color: "#065f46", fontSize: 14 }}>Select</th>
                  <th style={{ padding: "12px", color: "#065f46", fontSize: 14 }}>Subject Code</th>
                  <th style={{ padding: "12px", color: "#065f46", fontSize: 14 }}>Subject Name</th>
                  <th style={{ padding: "12px", color: "#065f46", fontSize: 14, textAlign: "center" }}>Units</th>
                  <th style={{ padding: "12px", color: "#065f46", fontSize: 14 }}>Schedule</th>
                  <th style={{ padding: "12px", color: "#065f46", fontSize: 14, textAlign: "center" }}>Slots</th>
                </tr>
              </thead>
              <tbody>
                {enlistmentRows.map(row => {
                  const disabled = row.isFull;
                  return (
                    <tr key={row.id} style={{ borderBottom: "1px solid #cbd5e1" }}>
                      <td style={{ padding: "12px" }}>
                        <input
                          type="checkbox"
                          checked={selectedSubjects.has(row.id)}
                          onChange={() => toggleSubject(row.id, disabled)}
                          disabled={disabled}
                        />
                      </td>
                      <td style={{ padding: "12px", fontWeight: 600 }}>{row.code}</td>
                      <td style={{ padding: "12px" }}>{row.name}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>{row.units}</td>
                      <td style={{ padding: "12px" }}>{row.schedule}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {row.available !== null ? (
                          <span style={{
                            padding: "2px 10px",
                            borderRadius: 14,
                            fontSize: 12,
                            fontWeight: 700,
                            background: disabled ? "#fef2f2" : "#ecfdf5",
                            color: disabled ? "#991b1b" : "#065f46",
                            border: `1px solid ${disabled ? "#991b1b" : "#065f46"}`
                          }}>
                            {disabled ? "Full" : `${row.available}/${row.capacity}`}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #cbd5e1",
            paddingTop: 12
          }}>
            <div style={{ fontWeight: 800, color: "#065f46" }}>
              Total Units: {totalUnits}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setSelectedSubjects(new Set())}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#065f46",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Clear
              </button>
              <button
                type="button"
                disabled={selectedSubjects.size === 0}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: selectedSubjects.size === 0 ? "#9ca3af" : "#10b981",
                  color: selectedSubjects.size === 0 ? "#ffffff" : "#064e3b",
                  fontWeight: 800,
                  cursor: selectedSubjects.size === 0 ? "not-allowed" : "pointer"
                }}
              >
                Enlist Selected
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeView === "profile") {
      return (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
            <div style={{
              border: "1px solid #065f46",
              borderRadius: 12,
              padding: 16,
              background: "#ffffff",
              textAlign: "center"
            }}>
              <div style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                margin: "0 auto 12px",
                overflow: "hidden",
                border: "2px solid #065f46",
                background: "#ecfdf5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ fontSize: 54, color: "#065f46", fontWeight: 800 }}>
                    {(currentUser?.firstName || "S").slice(0, 1)}
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ border: "1px solid #065f46", borderRadius: 12, padding: 16, background: "#ffffff" }}>
                <div style={{ fontWeight: 800, marginBottom: 12, color: "#065f46" }}>Academic Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#065f46", opacity: 0.75, fontWeight: 700 }}>Student ID</div>
                    <input
                      value={currentUser?.id || ""}
                      disabled
                      style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", background: "#f9fafb" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#065f46", opacity: 0.75, fontWeight: 700 }}>Full Name</div>
                    <input
                      value={`${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim()}
                      disabled
                      style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", background: "#f9fafb" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#065f46", opacity: 0.75, fontWeight: 700 }}>Course and Year Level</div>
                    <input
                      value={`${currentUser?.course || ""} ${currentUser?.year || ""}`.trim()}
                      disabled
                      style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", background: "#f9fafb" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ border: "1px solid #065f46", borderRadius: 12, padding: 16, background: "#ffffff" }}>
                <div style={{ fontWeight: 800, marginBottom: 12, color: "#065f46" }}>Contact Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#065f46", opacity: 0.75, fontWeight: 700 }}>Email Address</div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#065f46", opacity: 0.75, fontWeight: 700 }}>Contact Number</div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: "#065f46", opacity: 0.75, fontWeight: 700 }}>Address</div>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(currentUser?.email || "");
                      setPhoneNumber(currentUser?.phoneNumber || "");
                      setAddress(currentUser?.address || "");
                      setProfilePhoto(currentUser?.profilePhoto || "");
                    }}
                    style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#ffffff", color: "#065f46", fontWeight: 700, cursor: "pointer" }}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: saving ? "#9ca3af" : "#10b981", color: saving ? "#ffffff" : "#064e3b", fontWeight: 800, cursor: saving ? "not-allowed" : "pointer" }}
                  >
                    {saving ? "Saving..." : "Save / Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ fontSize: 14, opacity: 0.8 }}>
        Content planned. No forms here. This section will be implemented later.
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      <aside style={{
        width: 240,
        background: "#064e3b",
        color: "#ecfdf5",
        display: "flex",
        flexDirection: "column",
        padding: 16,
        gap: 12,
        borderRight: "1px solid #065f46"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 10px",
          borderRadius: 10,
          background: "#065f46",
          fontWeight: 700
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#10b981",
            color: "#064e3b"
          }}>🎓</div>
          <div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>{currentUser?.username}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{currentUser?.firstName} {currentUser?.lastName}</div>
          </div>
        </div>

        {[
          { key: "overview", label: "Home / Overview", icon: "🏠" },
          { key: "subjects", label: "My Subjects", icon: "📚" },
          { key: "viewGrades", label: "View Grades", icon: "🧾" },
          { key: "enlistment", label: "My Enlistment", icon: "📈" },
          { key: "profile", label: "Profile Information", icon: "👤" },
          { key: "notifications", label: "Notification", icon: "🔔" },
          { key: "changePassword", label: "Change Password", icon: "🔒" }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setActiveView(item.key)}
            onMouseEnter={() => setHoveredItem(item.key)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: activeView === item.key ? "#10b981" : (hoveredItem === item.key ? "rgba(255,255,255,0.08)" : "transparent"),
              color: activeView === item.key ? "#064e3b" : "#ecfdf5",
              fontWeight: 600,
              textAlign: "left",
              borderLeft: activeView === item.key ? "4px solid #34d399" : (hoveredItem === item.key ? "4px solid #10b98155" : "4px solid transparent")
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </span>
            {item.key === "subjects" && (
              <span style={{
                padding: "2px 8px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 800,
                background: activeView === item.key ? "#064e3b" : "#065f46",
                color: "#ecfdf5",
                border: "1px solid #10b981"
              }}>
                {subjectsCount}
              </span>
            )}
            {item.key === "viewGrades" && (
              <span style={{
                padding: "2px 8px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 800,
                background: activeView === item.key ? "#064e3b" : "#065f46",
                color: "#ecfdf5",
                border: "1px solid #10b981",
                minWidth: 42,
                textAlign: "center"
              }}>
                {gradesCompleted}/{gradesTotal || 0}
              </span>
            )}
          </button>
        ))}
      </aside>

      <main style={{ flex: 1, background: "#f0fdf4", padding: 24 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        }}>
          <div>
            <div style={{ fontSize: 26, color: "#065f46", fontWeight: 800 }}>Student Dashboard</div>
            <div style={{ fontSize: 14, color: "#065f46", opacity: 0.8 }}>Welcome back, {currentUser?.firstName}!</div>
          </div>
          <div style={{
            display: "flex",
            gap: 12,
            background: "#ffffff",
            padding: "8px 14px",
            borderRadius: 12,
            border: "1px solid #d1fae5"
          }}>
            <span style={{ color: "#065f46", fontWeight: 700 }}>{activeSem}</span>
            <span style={{ color: "#065f46" }}>AY {activeSY}</span>
          </div>
        </div>

        {activeView === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <SummaryItem
              label="Student Name"
              value={`${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim()}
              icon="👤"
            />
            <SummaryItem label="Student ID" value={currentUser?.id} icon="🆔" />
            {(() => {
              const profile = students.find(s => s.id === currentUser?.id);
              const course = currentUser?.course || profile?.course || "";
              const year = currentUser?.year || profile?.year || "";
              const section = currentUser?.section || profile?.section || "";
              return (
                <>
                  <SummaryItem label="Course & Year Level" value={`${course} ${year}`.trim()} icon="🎓" />
                  <SummaryItem label="Section" value={section} icon="🏫" />
                </>
              );
            })()}
            <SummaryItem label="School Year & Semester" value={`AY ${activeSY} • ${activeSem}`} icon="📅" />
            <SummaryItem label="Overall Academic Status" value={stats.status} icon="📊" />
          </div>
        )}

        {activeView !== "overview" && (
          <div style={{
            background: "#ffffff",
            border: "1px solid #065f46",
            borderRadius: 12,
            padding: 24,
            color: "#065f46",
            position: "relative"
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
              {activeView === "subjects" && "My Subjects"}
              {activeView === "viewGrades" && "View Grades"}
              {activeView === "enlistment" && "My Enlistment"}
              {activeView === "profile" && "Profile Information"}
              {activeView === "notifications" && "Notification"}
              {activeView === "changePassword" && "Change Password"}
            </div>

            {renderActiveView()}
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;
