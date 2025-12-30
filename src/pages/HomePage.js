

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useFormVisibility } from '../context/FormVisibilityContext';
import MultiStepSignupPage from './MultiStepSignupPage';
import LoginPage from './LoginPage';
import '../css/HomePage.css';


function HomePage() {

  const { showSignup, setShowSignup, showLogin, setShowLogin } = useFormVisibility();


  const handleShowSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
  };


  const handleShowLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
  };


  const handleCloseForms = () => {
    setShowSignup(false);
    setShowLogin(false);
  };

  return (
    <div className="homepage-container">

      <header className="homepage-header">
        <nav className="homepage-nav">
          <Link to="/" className="nav-link" onClick={handleCloseForms}>Home</Link>
          <a href="#" className="nav-link" onClick={handleShowSignup}>Sign Up</a>
          <a href="#" className="nav-link" onClick={handleShowLogin}>Login</a>
          <Link to="/contacts" className="nav-link" onClick={handleCloseForms}>Contacts</Link>
          <Link to="/about" className="nav-link" onClick={handleCloseForms}>About</Link>
        </nav>
      </header>


      {(showSignup || showLogin) ? (

        <div className="form-overlay">
          {showSignup && <MultiStepSignupPage />} 
          {showLogin && <LoginPage />} 
          <button className="close-form-button" onClick={handleCloseForms}>X</button>
        </div>
      ) : (

        <>

          <section className="hero-section">
            <div className="hero-content">
              <h1>BACK TO School</h1>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <div className="hero-buttons">
                <button className="start-now-button">START NOW</button>
                <button className="read-more-button">READ MORE</button>
              </div>
            </div>
            <div className="hero-image">
              <img src="https://images.esquiremag.ph/esquiremagph/images/2020/11/24/dlsu-1-1606113347.jpg" alt="School Desk" />
            </div>
          </section>


          <section className="vision-mission-section">
            <div className="vision-mission-content">
              <h2>Our Vision</h2>
              <p>
                “St. Michael Academy envisions a nurturing and dynamic learning community that cultivates academic excellence, moral integrity, and holistic development, preparing students to become responsible, compassionate, and innovative leaders in society.”
              </p>
              <h2>Our Mission</h2>
              <p>
                “St. Michael Academy is committed to providing quality education that fosters intellectual growth, spiritual enrichment, and character formation. We aim to empower students with knowledge, skills, and values that enable them to achieve their full potential, contribute meaningfully to their communities, and embrace lifelong learning.”
              </p>
            </div>
            <div className="vision-mission-image">
              <img src="https://images.candymag.com/candy/images/2022/09/16/best-courses-adamson-university.jpg" alt="Adamson University" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default HomePage;
