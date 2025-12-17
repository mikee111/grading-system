import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import "../css/Header.css";

const Header = () => {
  const { currentUser, logout } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
            <button onClick={handleLogout} className="logout-button">Logout</button>
          ) : null}
        </nav>
      </header>
    </>
  );
};

export default Header;
