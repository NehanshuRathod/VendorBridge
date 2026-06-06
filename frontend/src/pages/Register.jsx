import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'VENDOR_USER'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const payload = { ...formData };
    const result = await register(payload);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-slide-up">
        <div className="auth-header">
          <div className="logo-icon">
            <UserPlus size={28} />
          </div>
          <h1>VendorBridge</h1>
          <p>Create a new account</p>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group stagger-1">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <input 
              type="text" 
              id="fullName" 
              name="fullName" 
              className="form-control" 
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group stagger-1">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="form-control" 
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group stagger-2">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="form-control" 
              placeholder="Password123!"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <p className="password-hint">Must contain at least 8 characters, one uppercase, one lowercase, one number and one special character.</p>
          </div>

          <div className="form-group stagger-2">
            <label className="form-label" htmlFor="role">Register as</label>
            <select
              id="role"
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="VENDOR_USER">Vendor</option>
              <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
              <option value="MANAGER">Manager</option>
            </select>
            <p className="password-hint">Vendor accounts are created by default; choose Procurement Officer or Manager if you need buyer access.</p>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full mt-4 stagger-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="spinner"></span> : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer stagger-4 mt-6">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
      
      <style>{`
        /* Reuse auth styles from Login */
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, var(--bg-dark) 0%, #1e1b4b 100%);
        }
        
        .auth-card {
          width: 100%;
          max-width: 480px;
          padding: 2.5rem;
        }
        
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .logo-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem auto;
          color: white;
          box-shadow: var(--shadow-glow);
        }
        
        .auth-header h1 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        
        .alert {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }
        
        .alert-danger {
          background-color: var(--danger-light);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        
        .password-hint {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
        }
        
        .w-full {
          width: 100%;
        }
        
        .auth-footer {
          text-align: center;
          font-size: 0.875rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1.5rem;
        }
        
        .auth-footer a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
        }
        
        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Register;
