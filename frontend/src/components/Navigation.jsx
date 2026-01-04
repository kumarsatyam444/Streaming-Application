/**
 * Navigation Component
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from '../styles/Navigation.module.css';

export const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          📹 StreamApp
        </Link>

        {isAuthenticated ? (
          <div className={styles.navItems}>
            <Link to="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
            {user?.role === 'editor' || user?.role === 'admin' ? (
              <Link to="/upload" className={styles.navLink}>
                Upload
              </Link>
            ) : null}
            {user?.role === 'admin' ? (
              <Link to="/users" className={styles.navLink}>
                Users
              </Link>
            ) : null}

            <div className={styles.userMenu}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userRole}>({user?.role})</span>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.navItems}>
            <Link to="/login" className={styles.navLink}>
              Login
            </Link>
            <Link to="/register" className={styles.navLink}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
