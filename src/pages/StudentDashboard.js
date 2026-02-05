import React, { useMemo, useState } from "react";
import { useData } from "../context/DataContext";

function StudentDashboard() {
  const { 
    currentUser, 
    enrollments, 
    schoolYears, 
    semesters,
    students
  } = useData();

  const activeSY = useMemo(() => schoolYears.find(sy => sy.isActive)?.name || "N/A", [schoolYears]);
  const activeSem = useMemo(() => semesters.find(s => s.isActive)?.name || "N/A", [semesters]);
  const [activeView, setActiveView] = useState("overview");

  const studentEnrollments = useMemo(() => {
    if (!currentUser) return [];
    return enrollments[currentUser.id] || [];
  }, [currentUser, enrollments]);

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
        <div style={{ fontSize: 12, color: "#065f46", opacity: 0.75, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 18, color: "#064e3b", fontWeight: 700 }}>{value || "—"}</div>
      </div>
    </div>
  );

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
            width: 36, height: 36, borderRadius: 8, 
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#10b981", color: "#064e3b"
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
          { key: "changePassword", label: "Change Password", icon: "🔒" },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setActiveView(item.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: activeView === item.key ? "#10b981" : "transparent",
              color: activeView === item.key ? "#064e3b" : "#ecfdf5",
              fontWeight: 600,
              textAlign: "left"
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
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
            <SummaryItem label="Student Name" value={`${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim()} icon="👤" />
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
            border: "1px solid #d1fae5", 
            borderRadius: 12, 
            padding: 24,
            color: "#065f46"
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
              {activeView === "subjects" && "My Subjects"}
              {activeView === "viewGrades" && "View Grades"}
              {activeView === "enlistment" && "My Enlistment"}
              {activeView === "profile" && "Profile Information"}
              {activeView === "notifications" && "Notification"}
              {activeView === "changePassword" && "Change Password"}
            </div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              Content planned. No forms here. This section will be implemented later.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;
