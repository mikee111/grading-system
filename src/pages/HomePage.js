import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <h1>Welcome to the Grading System</h1>
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </nav>
      </header>
      <main className="homepage-main">
        <section className="about-section">
          <h2>About Us</h2>
          <p>Our grading system is designed to simplify academic management and enhance learning experiences.</p>
        </section>
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>To provide a seamless and efficient platform for managing grades and academic records.</p>
        </section>
        <section className="vision-section">
          <h2>Our Vision</h2>
          <p>Empowering educators and students through innovative technology.</p>
        </section>
      </main>
      <footer className="homepage-footer">
        <p>&copy; 2025 Grading System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;