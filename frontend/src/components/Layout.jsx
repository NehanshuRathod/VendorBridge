import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const location = useLocation();
  
  // Create a page title based on the path
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    
    // Capitalize first letter and replace hyphens
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title={getPageTitle()} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }

        .main-wrapper {
          flex: 1;
          margin-left: 260px; /* Width of the sidebar */
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, var(--bg-dark) 0%, #1e1b4b 100%);
          min-height: 100vh;
        }

        .main-content {
          padding: 0 2rem 2rem 2rem;
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default Layout;
