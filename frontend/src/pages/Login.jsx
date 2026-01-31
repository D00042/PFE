import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import Logo from '../components/Logo';
import '../styles/AnimatedBackground.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      const { access_token, user } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/profile');

    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animated-bg-container">
      {/* Animated Background Waves */}
      <div className="wave-container">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      <div className="max-w-md w-full py-12 relative z-10">
        {/* Card Container - Added slight transparency and blur for a modern look */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
          
          {/* Header with TUI Dark Blue Background */}
          <div className="px-8 pt-10 pb-8 text-center" style={{ backgroundColor: '#092A5E' }}>
            <div className="mb-6 flex justify-center animate-slide-down">
              <Logo size="large" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 animate-slide-down" style={{ animationDelay: '0.1s' }}>Welcome Back</h1>
            <p className="text-sm animate-slide-down" style={{ color: '#70CBF4', animationDelay: '0.2s' }}>
              Sign in to Financial Decision Support System
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            
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

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Field */}
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#092A5E' }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#70CBF4] focus:shadow-lg focus:shadow-[#70CBF4]/20"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#092A5E' }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-xl outline-none transition-all duration-200 focus:border-[#70CBF4] focus:shadow-lg focus:shadow-[#70CBF4]/20"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 transition"
                    style={{ accentColor: '#70CBF4' }}
                  />
                  <span className="ml-2 text-gray-600 group-hover:text-gray-800 transition">
                    Remember me
                  </span>
                </label>
                <a 
                  href="#" 
                  className="font-semibold hover:underline transition"
                  style={{ color: '#70CBF4' }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
                style={{
                  backgroundColor: loading ? '#a3d9f0' : '#70CBF4',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  animationDelay: '0.6s'
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8 animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium rounded-full">or</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.8s' }}>
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-bold hover:underline transition"
                  style={{ color: '#092A5E' }}
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white drop-shadow-md mt-6 bg-black/20 backdrop-blur-sm w-fit mx-auto px-4 py-1 rounded-full animate-fade-in" style={{ animationDelay: '0.9s' }}>
          © 2025 TUI Financial Decision Support System
        </p>
      </div>
    </div>
  );
}

export default Login;