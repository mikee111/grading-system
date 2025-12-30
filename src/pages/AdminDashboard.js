import React, { useState, useEffect } from "react"; 
 import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom"; 
 import { useData } from "../context/DataContext"; 
 import StudentsPage from "./StudentsPage"; 
 import SubjectsPage from "./SubjectsPage"; 
 import GradesPage from "./GradesPage"; 
 import AdminProfilePage from "./AdminProfilePage"; 
 import AdminRoleManagementPage from "./AdminRoleManagementPage"; 
 import OverviewPage from "./OverviewPage"; 
 
 function AdminDashboard() { 
   const { currentUser } = useData(); 
   const [showProfileDropdown, setShowProfileDropdown] = useState(false); 
   const navigate = useNavigate(); 
 
   useEffect(() => { 
     if (!currentUser || currentUser.role !== "admin") { 
       navigate("/login", { replace: true }); 
     } 
   }, [currentUser, navigate]); 
 
 
   return ( 
     <div style={{ display: "flex", minHeight: "100vh" }}> 
       <aside style={{ width: 260, background: "#d6f5d6", padding: 20, minHeight: "100vh", display: "flex", flexDirection: "column" }}> 
         <h3 style={{ marginTop: 0, fontSize: 22 }}>Admin</h3> 
         <nav style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 18 }}>
           <Link to="overview">Overview</Link>
           <Link to="students">Students</Link>
           <Link to="subjects">Subjects</Link>
           <Link to="grades">Grades</Link>
         </nav>
         <div style={{ position: 'relative', marginTop: 'auto' }}> 
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
       </aside> 
       <main style={{ flex: 1, padding: 20 }}> 
         <Routes> 
           <Route path="students" element={<StudentsPage />} /> 
           <Route path="subjects" element={<SubjectsPage />} /> 
           <Route path="grades" element={<GradesPage />} /> 
           <Route path="overview" element={<OverviewPage />} /> 
           <Route path="profile/view-edit" element={<AdminProfilePage />} /> 
           <Route path="profile/change-password" element={<AdminProfilePage />} /> 
           {currentUser.role === "admin" && ( 
             <Route path="profile/role-management" element={<AdminRoleManagementPage />} /> 
           )} 
           <Route path="*" element={<Navigate to="overview" replace />} /> 
         </Routes> 
       </main> 
     </div> 
   ); 
 } 
 
 
 export default AdminDashboard;