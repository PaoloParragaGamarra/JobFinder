import React, { useState } from 'react';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Github, Chrome, AlertCircle } from 'lucide-react';
import { auth } from '../lib/supabase';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setAuthError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        // Sign in with Supabase
        const { data, error } = await auth.signIn(formData.email, formData.password);
        
        if (error) {
          setAuthError(error.message);
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const user = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
            email: data.user.email,
            initials: (data.user.user_metadata?.full_name || data.user.email).slice(0, 2).toUpperCase()
          };
          onLogin(user);
        }
      } else {
        // Sign up with Supabase
        const { data, error } = await auth.signUp(formData.email, formData.password, formData.name);
        
        if (error) {
          setAuthError(error.message);
          setIsLoading(false);
          return;
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
          setSuccessMessage('Please check your email to confirm your account before signing in.');
          setIsLogin(true);
          setFormData({ name: '', email: formData.email, password: '', confirmPassword: '' });
        } else if (data.user && data.session) {
          // Auto-login if email confirmation is disabled
          const user = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || formData.name || data.user.email.split('@')[0],
            email: data.user.email,
            initials: (formData.name || data.user.email).slice(0, 2).toUpperCase()
          };
          onLogin(user);
        }
      }
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setAuthError(null);
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await auth.signInWithOAuth(provider);
      
      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
      }
      // OAuth redirects, so we don't need to handle success here
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setErrors({ email: 'Please enter your email address first' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await auth.resetPassword(formData.email);
      
      if (error) {
        setAuthError(error.message);
      } else {
        setSuccessMessage('Password reset email sent! Please check your inbox.');
      }
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <Zap className="text-slate-900" size={36} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">JobStream</h1>
              <p className="text-slate-400 text-lg">Find your dream job</p>
            </div>
          </div>
          
          {/* Features */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Aggregated Job Listings</h3>
                <p className="text-slate-400">Access jobs from LinkedIn, Indeed, Glassdoor, and more in one place</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Quick Apply</h3>
                <p className="text-slate-400">Apply to multiple jobs with one profile, save time and effort</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Track Applications</h3>
                <p className="text-slate-400">Monitor your application status and stay organized</p>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-16 flex gap-12">
            <div>
              <p className="text-4xl font-bold text-amber-400">50K+</p>
              <p className="text-slate-400">Active Jobs</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-amber-400">10K+</p>
              <p className="text-slate-400">Companies</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-amber-400">100K+</p>
              <p className="text-slate-400">Job Seekers</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Zap className="text-slate-900" size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">JobStream</h1>
              <p className="text-xs text-slate-400">Find your dream job</p>
            </div>
          </div>
          
          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-slate-400">
              {isLogin 
                ? 'Sign in to continue your job search' 
                : 'Start your journey to find the perfect job'}
            </p>
          </div>
          
          {/* Error Message */}
          {authError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
              <p className="text-red-400 text-sm">{authError}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="flex gap-3 mb-6">
            <button 
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Chrome size={20} />
              <span>Google</span>
            </button>
            <button 
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github size={20} />
              <span>GitHub</span>
            </button>
          </div>
          
          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-slate-500 text-sm">or continue with email</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full pl-11 pr-4 py-3 bg-slate-800/50 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 placeholder-slate-500 transition-all ${
                      errors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-amber-500/50'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
            )}
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-800/50 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 placeholder-slate-500 transition-all ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-amber-500/50'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>
            
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3 bg-slate-800/50 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 placeholder-slate-500 transition-all ${
                    errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-amber-500/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>
            
            {/* Confirm Password Field (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-4 py-3 bg-slate-800/50 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 placeholder-slate-500 transition-all ${
                      errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-amber-500/50'
                    }`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}
            
            {/* Remember Me / Forgot Password */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/20"
                  />
                  <span className="text-sm text-slate-400">Remember me</span>
                </label>
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>
            )}
            
            {/* Terms (Register only) */}
            {!isLogin && (
              <label className="flex items-start gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/20"
                />
                <span className="text-sm text-slate-400">
                  I agree to the <a href="#" className="text-amber-400 hover:text-amber-300">Terms of Service</a> and <a href="#" className="text-amber-400 hover:text-amber-300">Privacy Policy</a>
                </span>
              </label>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          {/* Toggle Auth Mode */}
          <p className="text-center text-slate-400 mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setAuthError(null);
                setSuccessMessage(null);
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              }}
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
