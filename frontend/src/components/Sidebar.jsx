import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  FileCheck, 
  CheckCircle, 
  ShoppingCart, 
  Receipt, 
  BarChart3, 
  Activity
} from 'lucide-react';
import { ALL_ROLES, BUYER_ROLES, INTERNAL_REVIEW_ROLES, ROLES } from '../constants/roles';

const Sidebar = () => {
  const { hasRole } = useContext(AuthContext);

  const allNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ALL_ROLES },
    { name: 'Vendors', path: '/vendors', icon: <Users size={20} />, roles: BUYER_ROLES },
    { name: 'RFQs', path: '/rfqs', icon: <FileText size={20} />, roles: BUYER_ROLES },
    { name: 'Quotations', path: '/quotations', icon: <FileCheck size={20} />, roles: [...INTERNAL_REVIEW_ROLES, ROLES.VENDOR_USER] },
    { name: 'Approvals', path: '/approvals', icon: <CheckCircle size={20} />, roles: ALL_ROLES },
    { name: 'Purchase orders', path: '/purchase-orders', icon: <ShoppingCart size={20} />, roles: ALL_ROLES },
    { name: 'Invoices', path: '/invoices', icon: <Receipt size={20} />, roles: ALL_ROLES },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} />, roles: [ROLES.ADMIN, ROLES.MANAGER] },
    { name: 'Activity', path: '/activity', icon: <Activity size={20} />, roles: [ROLES.ADMIN] },
  ];

  const navItems = allNavItems.filter(item => hasRole(item.roles));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>VendorBridge</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <style>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background: var(--bg-card);
          backdrop-filter: var(--glass-blur);
          border-right: var(--glass-border);
          position: fixed;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }
        
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: var(--glass-border);
          display: flex;
          align-items: center;
        }
        
        .sidebar-header h2 {
          font-size: 1.5rem;
          background: linear-gradient(to right, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }
        
        .sidebar-nav {
          padding: 1rem 0;
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: all var(--transition-fast);
          gap: 1rem;
        }
        
        .nav-link:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .nav-link.active {
          color: white;
          background: var(--primary-light);
          border-right: 3px solid var(--primary);
        }
        
        .nav-icon {
          display: flex;
          align-items: center;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
