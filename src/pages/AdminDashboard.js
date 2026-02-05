import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useData } from "../context/DataContext";

const navItemStyle = (location, path) => {
  const isActive = location.pathname.includes(path);
  return {
    textDecoration: "none",
    color: isActive ? "#FFD700" : "#a0aec0",
    fontWeight: isActive ? "700" : "500",
    padding: "12px 16px",
    borderRadius: "10px",
    background: isActive ? "rgba(255, 215, 0, 0.12)" : "transparent",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    marginBottom: "4px",
    fontSize: "14px",
    border: isActive ? "1px solid rgba(255, 215, 0, 0.2)" : "1px solid transparent"
  };
};

function AdminDashboard() {
  const { currentUser, isLoading } = useData();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const location = useLocation();
  const [showRoleSubmenu, setShowRoleSubmenu] = useState(true);
  const [showStudentSubmenu, setShowStudentSubmenu] = useState(true);
  const [showAcademicSubmenu, setShowAcademicSubmenu] = useState(true);

  if (isLoading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  const isSuperAdmin = currentUser && currentUser.id === "admin1";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ 
        width: 280, 
        background: "#1a202c", 
        color: "#fff",
        padding: "24px 16px", 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column",
        boxShadow: "4px 0 10px rgba(0,0,0,0.1)",
        zIndex: 10,
        position: 'sticky',
        top: 0
      }}>
        <div style={{ marginBottom: 40, padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #FFD700, #DAA520)', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>🎓</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, color: '#fff', letterSpacing: '0.5px' }}>Michael Academy</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#FFD700', fontWeight: 'bold' }}>ADMINISTRATOR</p>
            </div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", flex: 1, gap: "4px" }}>
          <div style={{ fontSize: '11px', color: '#4a5568', fontWeight: 'bold', padding: '0 16px', marginBottom: '8px', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Main Navigation</div>
          
          <Link to="overview" style={navItemStyle(location, "overview")}>
            <span style={{ fontSize: '18px' }}>📊</span> Overview
          </Link>

          <div 
            onClick={() => setShowAcademicSubmenu(!showAcademicSubmenu)}
            style={{ 
              textDecoration: "none",
              color: "#a0aec0",
              fontWeight: "500",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              marginBottom: "4px",
              fontSize: "14px",
              border: "1px solid transparent",
              cursor: 'pointer',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '18px' }}>⚙️</span> Academic Setup
            </div>
            <span>{showAcademicSubmenu ? '▼' : '▶'}</span>
          </div>

          {showAcademicSubmenu && (
            <div style={{ paddingLeft: '20px' }}>
              <Link to="subjects" style={navItemStyle(location, "subjects")}>
                <span style={{ fontSize: '18px' }}>📚</span> Subjects
              </Link>
              <Link to="courses" style={navItemStyle(location, "courses")}>
                <span style={{ fontSize: '18px' }}>🎓</span> Courses
              </Link>
              <Link to="sections" style={navItemStyle(location, "sections")}>
                <span style={{ fontSize: '18px' }}>🏢</span> Sections
              </Link>
              <Link to="year-levels" style={navItemStyle(location, "year-levels")}>
                <span style={{ fontSize: '18px' }}>📈</span> Year Levels
              </Link>
              <Link to="school-years" style={navItemStyle(location, "school-years")}>
                <span style={{ fontSize: '18px' }}>📅</span> School Years
              </Link>
              <Link to="semesters" style={navItemStyle(location, "semesters")}>
                <span style={{ fontSize: '18px' }}>⏳</span> Semesters
              </Link>
            </div>
          )}

          <div 
            onClick={() => setShowStudentSubmenu(!showStudentSubmenu)}
            style={{ 
              textDecoration: "none",
              color: "#a0aec0",
              fontWeight: "500",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              marginBottom: "4px",
              fontSize: "14px",
              border: "1px solid transparent",
              cursor: 'pointer',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '18px' }}>👨‍🎓</span> Student Management
            </div>
            <span>{showStudentSubmenu ? '▼' : '▶'}</span>
          </div>

          {showStudentSubmenu && (
            <div style={{ paddingLeft: '20px' }}>
              <Link to="students" style={navItemStyle(location, "students")}>
                <span style={{ fontSize: '18px' }}>➕</span> Create Student Account
              </Link>
              <Link to="student-list" style={navItemStyle(location, "student-list")}>
                <span style={{ fontSize: '18px' }}>📋</span> Student List
              </Link>
            </div>
          )}

          <Link to="teachers" style={navItemStyle(location, "teachers")}>
            <span style={{ fontSize: '18px' }}>👨‍🏫</span> Teachers
          </Link>

          <div 
            onClick={() => setShowRoleSubmenu(!showRoleSubmenu)}
            style={{ 
              textDecoration: "none",
              color: "#a0aec0",
              fontWeight: "500",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              marginBottom: "4px",
              fontSize: "14px",
              border: "1px solid transparent",
              cursor: 'pointer',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '18px' }}>🛡️</span> Role Management
            </div>
            <span>{showRoleSubmenu ? '▼' : '▶'}</span>
          </div>

          {showRoleSubmenu && (
            <div style={{ paddingLeft: '20px' }}>
              <Link to="role-management" style={navItemStyle(location, "role-management")}>
                <span style={{ fontSize: '18px' }}>🛡️</span> Manage Roles
              </Link>
              <Link to="user-roles" style={navItemStyle(location, "user-roles")}>
                <span style={{ fontSize: '18px' }}>👥</span> Assign User Roles
              </Link>
              <Link to="profile/view-edit" style={navItemStyle(location, "profile/view-edit")}>
                <span style={{ fontSize: '18px' }}>👤</span> View Profile
              </Link>
              <Link to="profile/change-password" style={navItemStyle(location, "profile/change-password")}>
                <span style={{ fontSize: '18px' }}>🔑</span> Security
              </Link>
            </div>
          )}
        </nav>

        <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid #2d3748" }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              padding: '12px',
              borderRadius: '12px',
              background: '#2d3748',
              border: '1px solid #4a5568'
            }}
          >
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #FFD700, #DAA520)', 
              color: '#1a202c', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
                {currentUser.firstName} {currentUser.lastName}
              </div>
              <div style={{ fontSize: 11, color: '#a0aec0' }}>{isSuperAdmin ? 'Super Admin' : 'Administrator'}</div>
            </div>
            <button 
              onClick={() => {
                // Handle logout logic here (e.g., clear context/storage and navigate)
                window.location.href = '/login';
              }}
              title="Logout"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fc8181',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(252, 129, 129, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              🚪
            </button>
          </div>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminDashboard;
