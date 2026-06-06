import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await login(formData);
    
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
            <LogIn size={28} />
          </div>
          <h1>VendorBridge</h1>
          <p>Sign in to your account</p>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
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
            <div className="flex justify-between items-center mb-2">
              <label className="form-label mb-0" htmlFor="password">Password</label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="form-control" 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full mt-4 stagger-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="spinner"></span> : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer stagger-4 mt-6">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
      
      <style>{`
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
          max-width: 420px;
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
        
        .forgot-link {
          font-size: 0.75rem;
          color: var(--primary);
          text-decoration: none;
        }
        
        .forgot-link:hover {
          text-decoration: underline;
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

export default Login;
