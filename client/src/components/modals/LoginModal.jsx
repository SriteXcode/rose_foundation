import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Eye, EyeOff, LogIn } from 'lucide-react';

const LoginModal = ({ 
  showLogin, 
  setShowLogin, 
  setShowRegister, 
  loginForm, 
  setLoginForm, 
  handleLogin, 
  isLoading 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  if (!showLogin) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }
    await handleLogin(e);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLogin(false)}>
      <div 
        className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 max-w-md w-full border border-gray-100 dark:border-zinc-800 shadow-2xl text-left"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Welcome Back</span>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Login</h2>
          </div>
          <button
            onClick={() => setShowLogin(false)}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="jane@email.com"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3.5 rounded-full font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Logging in...' : 'Login'}</span>
            <LogIn className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500">
          <span>Don't have an account? </span>
          <button
            onClick={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
            className="text-zinc-900 dark:text-white font-bold hover:underline cursor-pointer ml-1"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;