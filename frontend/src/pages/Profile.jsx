import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import Logo from '../components/Logo';
import '../styles/AnimatedBackground.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      
      // Check if it exists and isn't the literal string "undefined"
      if (storedUser && storedUser !== "undefined") {
        const currentUser = JSON.parse(storedUser);
        setUser(currentUser);
        setFormData({
          fullName: currentUser.full_name || '',
          email: currentUser.email || ''
        });
      } else {
        // If no data, send them back to login
        navigate('/login');
      }
    } catch (err) {
      console.error("LocalStorage Parse Error:", err);
      localStorage.removeItem('user'); // Clean up bad data
      navigate('/login');
    }
  }, [navigate]);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateProfile({
        full_name: formData.fullName,
        email: formData.email
      });

      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Update failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.full_name,
      email: user.email
    });
    setIsEditing(false);
    setError('');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg-container">
        <div className="wave-container">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>
        </div>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 relative z-10" style={{ borderColor: '#70CBF4' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg-container">
      {/* Animated Background Waves */}
      <div className="wave-container">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b-4 animate-slide-down" style={{ borderBottomColor: '#70CBF4' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Logo size="medium" />
              <div className="flex items-center gap-6">
                <div className="text-right animate-slide-left">
                  <p className="font-bold" style={{ color: '#092A5E' }}>{user.full_name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl text-white font-bold shadow-lg transition-all duration-200 transform hover:scale-105 animate-slide-left"
                  style={{ backgroundColor: '#D40E14', animationDelay: '0.1s' }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#b00c11';
                    e.target.style.boxShadow = '0 10px 25px rgba(212, 14, 20, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#D40E14';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-scale-in">
            
            {/* Header Banner with Animation */}
            <div className="h-32 w-full relative overflow-hidden" style={{ backgroundColor: '#70CBF4' }}>
              <div className="absolute inset-0 opacity-30">
                <div className="wave-pattern"></div>
              </div>
            </div>
            
            <div className="px-8 pb-8">
              <div className="relative flex justify-between items-end -mt-12 mb-8">
                {/* Profile Avatar Container */}
                <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-lg animate-bounce-in">
                  <div className="h-full w-full rounded-xl flex items-center justify-center text-3xl font-bold text-white" style={{ backgroundColor: '#092A5E' }}>
                    {user.full_name?.charAt(0).toUpperCase()}
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 rounded-xl font-bold transition-all border-2 hover:shadow-lg animate-slide-left"
                    style={{ borderColor: '#70CBF4', color: '#092A5E' }}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold animate-slide-up" style={{ color: '#092A5E' }}>Account Information</h2>
                
                {/* Notifications */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 font-medium animate-shake">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-4 rounded-xl bg-green-50 text-green-600 border border-green-100 font-medium animate-bounce-in">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                      <label className="text-sm font-semibold text-gray-600">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all ${
                          isEditing ? 'bg-white border-blue-200 focus:ring-2 focus:ring-blue-100 focus:border-[#70CBF4]' : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                      <label className="text-sm font-semibold text-gray-600">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all ${
                          isEditing ? 'bg-white border-blue-200 focus:ring-2 focus:ring-blue-100 focus:border-[#70CBF4]' : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Role Status */}
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-400">Account Role</p>
                      <p className="font-bold capitalize" style={{ color: '#092A5E' }}>{user.role || 'Member'}</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm animate-pulse-slow">
                      <span style={{ color: '#70CBF4' }}>🔒</span>
                    </div>
                  </div>

                  {/* Edit Controls */}
                  {isEditing && (
                    <div className="flex gap-4 pt-4 animate-slide-up">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-all hover:shadow-xl"
                        style={{ backgroundColor: '#70CBF4' }}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;