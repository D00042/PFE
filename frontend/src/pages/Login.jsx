import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import Logo from '../components/Logo';
import '../styles/AnimatedBackground.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    token: '' // Added for reset logic
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.login(formData);
      localStorage.setItem('token', response.data.access_token);
      const userToSave = {
        full_name: response.data.full_name || "User",
        email: response.data.email || formData.email,
        role: response.data.role || "Member"
      };
      localStorage.setItem('user', JSON.stringify(userToSave));
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.forgotPassword({ email: formData.email });
      setMessage(res.data.message);
      setTimeout(() => { setView('reset'); setMessage(''); }, 2000);
    } catch (err) { 
      setError("Email not found or server error."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword({ token: formData.token, new_password: formData.password });
      setMessage("Password updated! Switching to login...");
      setTimeout(() => { setView('login'); setMessage(''); }, 2000);
    } catch (err) { 
      setError("Invalid or expired token."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animated-bg-container">
      <div className="wave-container">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      <div className="max-w-md w-full py-12 relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
          
          <div className="px-8 pt-10 pb-8 text-center" style={{ backgroundColor: '#092A5E' }}>
            <div className="mb-6 flex justify-center animate-slide-down">
              <Logo size="large" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 animate-slide-down">
              {view === 'login' ? 'Welcome Back' : view === 'forgot' ? 'Reset Request' : 'Set New Password'}
            </h1>
            <p className="text-sm animate-slide-down" style={{ color: '#70CBF4' }}>
              Financial Decision Support System
            </p>
          </div>

          <div className="px-8 py-8">
            {/* Success Message */}
            {message && (
              <div className="mb-6 p-4 rounded-xl border-l-4 bg-green-50 border-green-600 text-green-700 text-sm animate-fade-in">
                {message}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl border-l-4 flex items-start animate-shake" style={{ backgroundColor: '#fee2e2', borderLeftColor: '#D40E14' }}>
                <span style={{ color: '#D40E14' }} className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* --- VIEW SWAP LOGIC --- */}
            {view === 'login' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#092A5E' }}>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-[#70CBF4]" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#092A5E' }}>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-[#70CBF4]" required />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: '#70CBF4' }} />
                    <span className="ml-2 text-gray-600">Remember me</span>
                  </label>
                  <button type="button" onClick={() => setView('forgot')} className="font-semibold hover:underline" style={{ color: '#70CBF4' }}>
                    Forgot password?
                  </button>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl text-white font-bold shadow-xl transition-all" style={{ backgroundColor: loading ? '#a3d9f0' : '#70CBF4' }}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : view === 'forgot' ? (
              <form onSubmit={handleForgot} className="space-y-6 animate-slide-up">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#092A5E' }}>Enter Registered Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-[#70CBF4]" required />
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl text-white font-bold" style={{ backgroundColor: '#70CBF4' }}>
                  {loading ? 'Processing...' : 'Send Reset Token'}
                </button>
                <button type="button" onClick={() => setView('login')} className="w-full text-center text-gray-500 text-sm">Back to Login</button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-6 animate-slide-up">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#092A5E' }}>Reset Token</label>
                  <input type="text" name="token" value={formData.token} onChange={handleChange} placeholder="Paste token from email" className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-[#70CBF4]" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#092A5E' }}>New Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-[#70CBF4]" required />
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl text-white font-bold" style={{ backgroundColor: '#70CBF4' }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">or</span></div>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold hover:underline" style={{ color: '#092A5E' }}>Create account</Link>
              </p>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-white drop-shadow-md mt-6 bg-black/20 backdrop-blur-sm w-fit mx-auto px-4 py-1 rounded-full">
          © 2025 TUI Financial Decision Support System
        </p>
      </div>
    </div>
  );
}

export default Login;