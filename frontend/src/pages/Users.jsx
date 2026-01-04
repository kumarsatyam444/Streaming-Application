/**
 * Users Management Page
 * Admin only - manage organization users
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI } from '../api/users.js';
import styles from '../styles/Users.module.css';

export const UsersPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    // Check if user is admin
    if (currentUser?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [page, currentUser, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers(page, 10);
      setUsers(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await userAPI.updateRole(userId, role);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role } : user
        )
      );
      setSelectedUser(null);
      setNewRole('');
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleDeactivate = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await userAPI.deactivateUser(userId);
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, isActive: false } : user
          )
        );
      } catch (err) {
        setError('Failed to deactivate user');
      }
    }
  };

  const handleActivate = async (userId) => {
    try {
      await userAPI.activateUser(userId);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isActive: true } : user
        )
      );
    } catch (err) {
      setError('Failed to activate user');
    }
  };

  if (loading && users.length === 0) {
    return <div className={styles.loading}>Loading users...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>User Management</h1>

      {error && <div className={styles.error}>{error}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <React.Fragment key={user._id}>
              <tr className={!user.isActive ? styles.inactive : ''}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={styles.role}>{user.role}</span>
                </td>
                <td>
                  <span
                    className={styles.status}
                    style={{
                      backgroundColor: user.isActive ? '#10b981' : '#ef4444',
                    }}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className={styles.date}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                      className={styles.detailsBtn}
                      title="View details"
                    >
                      ⋮
                    </button>
                  </div>
                </td>
              </tr>
              {expandedUser === user._id && (
                <tr className={styles.expandedRow}>
                  <td colSpan="6">
                    <div className={styles.userDetails}>
                      <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                          <label>User ID:</label>
                          <span>{user._id}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <label>Created:</label>
                          <span>{new Date(user.createdAt).toLocaleString()}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <label>Updated:</label>
                          <span>{new Date(user.updatedAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className={styles.manageSection}>
                        <div className={styles.roleManage}>
                          <label>Change Role:</label>
                          <select
                            value={selectedUser === user._id ? newRole : user.role}
                            onChange={(e) => {
                              setSelectedUser(user._id);
                              setNewRole(e.target.value);
                              handleRoleChange(user._id, e.target.value);
                            }}
                            className={styles.roleSelect}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>

                        <div className={styles.statusManage}>
                          {user.isActive ? (
                            <button
                              onClick={() => handleDeactivate(user._id)}
                              className={styles.deactivateBtn}
                            >
                              Deactivate User
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user._id)}
                              className={styles.activateBtn}
                            >
                              Activate User
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={styles.paginationBtn}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={styles.paginationBtn}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
