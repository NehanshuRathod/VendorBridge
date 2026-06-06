import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Bell, User } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="navbar glass-panel">
      <div className="navbar-left">
        <h2>{title || 'Dashboard'}</h2>
      </div>
      <div className="navbar-right">
        <button className="icon-btn relative">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <span className="user-name">{user?.fullName || 'User'}</span>
        </div>
        <button className="btn btn-outline ml-4" onClick={logout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

      <style>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          margin-bottom: 2rem;
          border-radius: 0 0 1rem 1rem;
          margin-top: 0;
          border-top: none;
          border-left: none;
          border-right: none;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .navbar-left h2 {
          margin: 0;
          font-weight: 600;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          color: var(--text-main);
        }

        .notification-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background-color: var(--danger);
          border-radius: 50%;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-name {
          font-weight: 500;
          font-size: 0.875rem;
        }
        
        .ml-4 {
          margin-left: 1rem;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
