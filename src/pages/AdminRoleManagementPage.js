import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import "../css/AdminForms.css";

// Reusable Modal Component (Consistent with AcademicSetupPage)
function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
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

function AdminRoleManagementPage() {
  const { roles, users, addRole, updateRole, toggleRoleStatus } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({ name: "", isFullAccess: false, permissions: [] });

  const availablePermissions = [
    { id: "view_students", label: "View Students", icon: "👥" },
    { id: "encode_grades", label: "Encode Grades", icon: "📝" },
    { id: "edit_submitted_grades", label: "Edit Submitted Grades", icon: "⛔", danger: true },
    { id: "manage_teachers", label: "Manage Teachers", icon: "⛔", danger: true },
    { id: "academic_setup", label: "Academic Setup", icon: "⛔", danger: true },
    { id: "manage_roles", label: "Manage Roles", icon: "🛡️", danger: true },
    { id: "view_dashboard", label: "View Dashboard", icon: "📊" }
  ];

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setForm({ ...role });
    } else {
      setEditingRole(null);
      setForm({ name: "", isFullAccess: false, permissions: [] });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name) return alert("Please provide a role name.");
    
    if (editingRole) {
      updateRole(editingRole.id, form);
    } else {
      addRole({ ...form, status: "Active" });
    }
    setIsModalOpen(false);
  };

  const togglePermission = (permId) => {
    setForm(prev => {
      const perms = prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: perms };
    });
  };

  const getRoleUserCount = (roleName) => {
    return users.filter(u => u.role?.toLowerCase() === roleName.toLowerCase()).length;
  };

  return (
    <div className="admin-page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Role Management</h2>
        <button 
          className="admin-form-button primary" 
          onClick={() => handleOpenModal()}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>➕</span> Create Role
        </button>
      </div>

      <div className="admin-form-container" style={{ maxWidth: "100%", border: "1px solid #ddd", backgroundColor: "white", padding: 0, overflow: "hidden" }}>
        <div style={{ backgroundColor: "#f2f2f2", padding: "15px 20px", borderBottom: "1px solid #ddd" }}>
          <h3 style={{ margin: 0 }}>System Roles</h3>
        </div>
        
        <div style={{ padding: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Role Name</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Users</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Permissions</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#495057", fontWeight: "bold" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "center", color: "#495057", fontWeight: "bold" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px", fontWeight: "600" }}>{role.name}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ backgroundColor: '#e9ecef', padding: '4px 10px', borderRadius: '20px', fontSize: '0.9rem' }}>
                      {getRoleUserCount(role.name)} Users
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      color: role.isFullAccess ? '#2e7d32' : '#1976d2',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      {role.isFullAccess ? "Full Access" : "Limited Access"}
                    </span>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                      {role.permissions.length} Permissions defined
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "12px", 
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      backgroundColor: role.status === "Active" ? "#e8f5e9" : "#ffebee",
                      color: role.status === "Active" ? "#2e7d32" : "#c62828"
                    }}>
                      {role.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button 
                        className="admin-form-button" 
                        style={{ padding: '5px 10px', backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600", display: 'flex', alignItems: 'center', gap: '4px' }} 
                        onClick={() => handleOpenModal(role)}
                      >
                        ✏️ Edit
                      </button>
                      {role.id !== 'role-admin' && (
                        <button 
                          className="admin-form-button" 
                          style={{ 
                            padding: '5px 10px', 
                            backgroundColor: role.status === "Active" ? '#6c757d' : '#28a745', 
                            color: 'white', 
                            border: "none", 
                            borderRadius: "4px", 
                            cursor: "pointer", 
                            fontWeight: "600",
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }} 
                          onClick={() => toggleRoleStatus(role.id)}
                        >
                          {role.status === "Active" ? "🚫 Disable" : "✅ Enable"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Editor Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingRole ? `Edit Role: ${editingRole.name}` : "Create New Role"}
        footer={(
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button className="admin-form-button secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
            <button className="admin-form-button primary" onClick={handleSave} style={{ flex: 1 }}>{editingRole ? "Update Role" : "Create Role"}</button>
          </div>
        )}
      >
        <div className="admin-form">
          <div className="admin-form-group">
            <label>Role Name</label>
            <input 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              placeholder="e.g. Teacher, Coordinator"
              disabled={editingRole && (editingRole.id === 'role-admin' || editingRole.id === 'role-teacher' || editingRole.id === 'role-student')}
            />
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h4 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🧠 Permission Editor
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {availablePermissions.map(perm => (
                <div 
                  key={perm.id}
                  onClick={() => togglePermission(perm.id)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    backgroundColor: form.permissions.includes(perm.id) ? '#f0f7ff' : '#f8f9fa',
                    border: `1px solid ${form.permissions.includes(perm.id) ? '#007bff' : '#eee'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{perm.icon}</span>
                    <span style={{ fontWeight: '500', color: perm.danger ? '#c62828' : '#2c3e50' }}>{perm.label}</span>
                  </div>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '4px', 
                    border: '2px solid #ddd',
                    backgroundColor: form.permissions.includes(perm.id) ? '#007bff' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px'
                  }}>
                    {form.permissions.includes(perm.id) && "✓"}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff8e1', borderRadius: '8px', border: '1px solid #ffe082' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="isFullAccess"
                checked={form.isFullAccess} 
                onChange={e => setForm({ ...form, isFullAccess: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="isFullAccess" style={{ fontWeight: 'bold', margin: 0 }}>Grant Full Access (Administrator Privileges)</label>
            </div>
            <p style={{ margin: '5px 0 0 28px', fontSize: '0.8rem', color: '#856404' }}>
              Warning: Full access roles can perform all system actions regardless of individual permissions.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminRoleManagementPage;
