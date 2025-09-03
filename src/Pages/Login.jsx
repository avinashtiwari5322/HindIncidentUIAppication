import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { User, Lock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const { login } = useAuth();
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setErrors(prev => ({
      ...prev,
      [field]: '',
    }));
    setLoginError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  try {
    const response = await fetch("https://hindincidentapiapplication.onrender.com/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.userId,
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setLoginError(data.message || "Login failed");
      return;
    }

  // ✅ Save userId, username, role & location to localStorage
  localStorage.setItem("userId", data.user?.userId);
  localStorage.setItem("username", data.user?.username || formData.userId);
  localStorage.setItem("role", data.user?.role);
  localStorage.setItem("location", JSON.stringify(data.location));
  login(); // Set isAuthenticated in AuthContext

    // ✅ Navigate based on role
    const role = data.user?.role?.toLowerCase();
    if (role ==="admin") {
      navigate("/about");
    } else if (role === "user") {
      navigate("/home");
      } else if (role === "assign") {
        navigate("/assign");
    } else {
      console.warn("Unknown role:", role);
      navigate("/"); // fallback
    }

  } catch (error) {
    console.error("Error logging in:", error);
    setLoginError("An error occurred. Please try again.");
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
        </div>

        <div className="space-y-6">
          {loginError && (
            <div className="flex items-center text-red-600 mb-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {loginError}
            </div>
          )}

          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              User ID
            </label>
            <input
              type="text"
              value={formData.userId}
              onChange={(e) => handleInputChange('userId', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.userId ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter your User ID"
            />
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="mt-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Location <span className="text-red-500">*</span>
  </label>
  <select
    value={formData.location}
    onChange={(e) => handleInputChange('location', e.target.value)}
    className={`w-full px-3 py-2 border ${
      errors.location ? 'border-red-300' : 'border-gray-300'
    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
  >
    <option value="">----Select Location----</option>
    <option value="Delhi">Delhi</option>
    <option value="Palwal">Palwal</option>
    <option value="Faridabad">Faridabad</option>
    <option value="Gurugram">Gurugram</option>
  </select>
  {errors.location && (
    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
  )}
</div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </button>
        </div>

        {/* Forgot Password */}
        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
