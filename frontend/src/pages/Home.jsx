/**
 * Home Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from '../styles/Home.module.css';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>📹 StreamApp</h1>
        <p className={styles.subtitle}>
          Upload, Process, and Stream Videos with Sensitivity Analysis
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>⬆️</div>
            <h3>Secure Upload</h3>
            <p>Upload videos securely with file type and size validation</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔍</div>
            <h3>Sensitivity Analysis</h3>
            <p>Automatic content analysis to flag sensitive videos</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Real-time Progress</h3>
            <p>Live processing updates through Socket.io</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>🎬</div>
            <h3>HD Streaming</h3>
            <p>Stream videos with range request support</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>👥</div>
            <h3>Multi-tenant</h3>
            <p>Isolated workspaces for different organizations</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔐</div>
            <h3>Role-based Access</h3>
            <p>Viewer, Editor, and Admin roles with fine-grained permissions</p>
          </div>
        </div>

        <div className={styles.cta}>
          {isAuthenticated ? (
            <Link to="/dashboard" className={styles.ctaBtn}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className={styles.ctaBtn}>
                Login
              </Link>
              <Link to="/register" className={styles.ctaBtnSecondary}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <div className={styles.tech}>
        <h2>Tech Stack</h2>
        <div className={styles.techList}>
          <div className={styles.techItem}>
            <strong>Backend:</strong> Node.js, Express, MongoDB, Socket.io
          </div>
          <div className={styles.techItem}>
            <strong>Frontend:</strong> React, Vite, Socket.io-client
          </div>
          <div className={styles.techItem}>
            <strong>Features:</strong> JWT Auth, RBAC, Multer, FFmpeg, Range Streaming
          </div>
        </div>
      </div>
    </div>
  );
};
