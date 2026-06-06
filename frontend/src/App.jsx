import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Rfqs from './pages/Rfqs';
import Quotations from './pages/Quotations';
import Approvals from './pages/Approvals';
import PurchaseOrders from './pages/PurchaseOrders';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Activity from './pages/Activity';
import { ALL_ROLES, BUYER_ROLES, INTERNAL_REVIEW_ROLES, ROLES } from './constants/roles';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const RoleRoute = ({ children, roles }) => {
  const { hasRole, user } = useContext(AuthContext);
  
  // Skip role check during initial load or if user is somehow null here
  if (!user) return <Navigate to="/login" replace />;
  
  if (!hasRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<RoleRoute roles={ALL_ROLES}><Dashboard /></RoleRoute>} />
        <Route path="vendors" element={<RoleRoute roles={BUYER_ROLES}><Vendors /></RoleRoute>} />
        <Route path="rfqs" element={<RoleRoute roles={BUYER_ROLES}><Rfqs /></RoleRoute>} />
        <Route path="quotations" element={<RoleRoute roles={[...INTERNAL_REVIEW_ROLES, ROLES.VENDOR_USER]}><Quotations /></RoleRoute>} />
        <Route path="approvals" element={<RoleRoute roles={ALL_ROLES}><Approvals /></RoleRoute>} />
        <Route path="purchase-orders" element={<RoleRoute roles={ALL_ROLES}><PurchaseOrders /></RoleRoute>} />
        <Route path="invoices" element={<RoleRoute roles={ALL_ROLES}><Invoices /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute roles={[ROLES.ADMIN, ROLES.MANAGER]}><Reports /></RoleRoute>} />
        <Route path="activity" element={<RoleRoute roles={[ROLES.ADMIN]}><Activity /></RoleRoute>} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
