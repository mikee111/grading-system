import React, { useState } from "react";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import StudentsPage from "./StudentsPage";
import SubjectsPage from "./SubjectsPage";
import GradesPage from "./GradesPage";
import AdminProfilePage from "./AdminProfilePage";
import AdminRoleManagementPage from "./AdminRoleManagementPage";
import AdminChangePasswordPage from "./AdminChangePasswordPage";

function AdminDashboard() {
  const { currentUser } = useData();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  if (!currentUser || currentUser.role !== "admin") return <Navigate to="/login" replace />;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: 260, background: "#d6f5d6", height: "100%", display: "flex", flexDirection: "column", borderRight: "1px solid #ccc" }}>
        <h3 style={{ marginTop: 0, fontSize: 22, padding: "20px 20px 0 20px" }}>Admin</h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 18, padding: 20, flexGrow: 1 }}>
          <Link to="students">Students</Link>
          <Link to="subjects">Subjects</Link>
          <Link to="grades">Grades</Link>
        <div style={{ position: 'relative' }}>
          <div onClick={() => setShowProfileDropdown(!showProfileDropdown)} style={{ cursor: 'pointer' }}>
            {currentUser.firstName} {currentUser.lastName}
          </div>
          {showProfileDropdown && (
            <div style={{ position: 'absolute', background: '#d6f5d6', border: '1px solid #ccc', padding: '10px', zIndex: 100 }}>
              <Link to="profile/view-edit" style={{ display: 'block', marginBottom: '5px' }}>View/Edit Profile</Link>
              <Link to="profile/change-password" style={{ display: 'block', marginBottom: '5px' }}>Change Password</Link>
              {currentUser.role === "admin" && (
                <Link to="profile/role-management" style={{ display: 'block' }}>Role Management</Link>
              )}
            </div>
          )}
        </div>
        </nav>
      </aside>
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="students" element={<StudentsPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="grades" element={<GradesPage />} />
          <Route path="profile/view-edit" element={<AdminProfilePage />} />
          <Route path="profile/change-password" element={<AdminChangePasswordPage />} />
          {currentUser.role === "admin" && (
            <Route path="profile/role-management" element={<AdminRoleManagementPage />} />
          )}
          <Route path="*" element={<Navigate to="students" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard;
