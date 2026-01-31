import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import Logo from '../components/Logo';
import '../styles/AnimatedBackground.css';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'MEMBER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await authAPI.register({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.status === 400) {
        setError('Email already registered');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 animated-bg-container">
      {/* Animated Background Waves */}
      <div className="wave-container">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
          
          {/* Header */}
          <div className="px-8 pt-10 pb-8 text-center" style={{ backgroundColor: '#092A5E' }}>
            <div className="mb-6 animate-slide-down">
              <Logo size="large" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 animate-slide-down" style={{ animationDelay: '0.1s' }}>Create Account</h1>
            <p className="text-sm animate-slide-down" style={{ color: '#70CBF4', animationDelay: '0.2s' }}>
              Join TUI Financial Decision Support System
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 rounded-xl border-l-4 flex items-start animate-bounce-in" style={{ 
                backgroundColor: '#d1fae5', 
                borderLeftColor: '#10b981'
              }}>
                <svg className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span style={{ color: '#10b981' }} className="text-sm font-medium">
                  Account created successfully! Redirecting to login...
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl border-l-4 flex items-start animate-shake" style={{ 
                backgroundColor: '#fee2e2', 
                borderLeftColor: '#D40E14'
              }}>
                <svg className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#D40E14' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span style={{ color: '#D40E14' }} className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Full Name */}
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#092A5E' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#70CBF4] focus:shadow-lg focus:shadow-[#70CBF4]/20"
                />
              </div>

              {/* Email */}
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#092A5E' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#70CBF4] focus:shadow-lg focus:shadow-[#70CBF4]/20"
                />
              </div>

              {/* Password */}
              <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#092A5E' }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#70CBF4] focus:shadow-lg focus:shadow-[#70CBF4]/20"
                />
                <p className="mt-1.5 text-xs text-gray-500">Must be at least 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#092A5E' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#70CBF4] focus:shadow-lg focus:shadow-[#70CBF4]/20"
                />
              </div>

              {/* Role Selection */}
              <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#092A5E' }}>
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#70CBF4] focus:shadow-lg focus:shadow-[#70CBF4]/20"
                  style={{ accentColor: '#70CBF4' }}
                >
                  <option value="MEMBER">Team Member</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] mt-6 animate-slide-up"
                style={{
                  backgroundColor: loading || success ? '#a3d9f0' : '#70CBF4',
                  cursor: loading || success ? 'not-allowed' : 'pointer',
                  animationDelay: '0.8s'
                }}
              >
                {loading ? 'Creating account...' : success ? '✓ Account created' : 'Create Account'}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center animate-slide-up" style={{ animationDelay: '0.9s' }}>
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-bold hover:underline transition"
                  style={{ color: '#092A5E' }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white drop-shadow-md mt-6 bg-black/20 backdrop-blur-sm w-fit mx-auto px-4 py-1 rounded-full animate-fade-in" style={{ animationDelay: '1s' }}>
          © 2025 TUI Financial Decision Support System
        </p>
      </div>
    </div>
  );
}

export default Register;