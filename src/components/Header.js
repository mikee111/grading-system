import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import "../css/Header.css";

const Header = () => {
  const { currentUser, logout } = useData();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="header">
        <div className="left-logo">
          <img
            src="https://t4.ftcdn.net/jpg/04/91/76/63/360_F_491766301_yF6pxwvJnyY4I43PlU6zPEPoY5ZjJLEL.jpg"
            alt="School Logo"
            className="logo-img"
          />
        </div>

        <div className="center-info">
          <h1 className="system-name">Michael Academy Grading System</h1>
          <p className="established">Established 1985</p>
        </div>

        <nav className="nav-links">
          {currentUser ? (
            <div className="user-dropdown-container" ref={dropdownRef}>
              <div 
                className="user-profile-trigger" 
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="avatar">
                  {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                </div>
                <span className="user-name">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className={`arrow ${showDropdown ? 'up' : 'down'}`}>▼</span>
              </div>
              
              {showDropdown && (
                <div className="header-dropdown-menu">
                  <div className="dropdown-header">
                    <strong>{currentUser.firstName} {currentUser.lastName}</strong>
                    <span>{currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'teacher' ? 'Teacher' : 'Student'}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  
                  {currentUser.role === 'admin' && (
                    <>
                      <Link to="/admin/profile/view-edit" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        👤 View/Edit Profile
                      </Link>
                      <Link to="/admin/profile/change-password" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        🔑 Change Password
                      </Link>
                      <div className="dropdown-divider"></div>
                    </>
                  )}

                  {currentUser.role === 'student' && (
                    <>
                      <Link to="/student" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        🏠 Dashboard
                      </Link>
                      <div className="dropdown-divider"></div>
                    </>
                  )}
                  
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </nav>
      </header>
    </>
  );
};

export default Header;
