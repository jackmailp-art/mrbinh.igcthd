import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  School
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { authService } from '../services/authService';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  defaultRole?: UserRole;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  defaultRole = 'teacher'
}) => {
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>(defaultRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Switch role tabs
  const handleRoleTabChange = (role: UserRole) => {
    setActiveRoleTab(role);
    setErrorMessage('');
    setIdentifier('');
    setPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = authService.login(identifier, password, activeRoleTab);
      setIsLoading(false);
      if (res.success && res.user) {
        authService.setStoredUser(res.user);
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-blue-500/30">
            ⚡
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Hệ Thống Trợ Lý AI Tiếng Anh
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Phân quyền truy cập Giáo viên & Học sinh (RBAC)
            </p>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center mb-6 border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleRoleTabChange('teacher')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeRoleTab === 'teacher'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Giáo viên (Teacher)</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('student')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeRoleTab === 'student'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Học sinh (Student)</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tài khoản ({activeRoleTab === 'teacher' ? 'Email hoặc SĐT Giáo viên' : 'Email hoặc SĐT Học sinh'})
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Nhập email hoặc SĐT..."
                className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-98 ${
              activeRoleTab === 'teacher'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
            }`}
          >
            <span>{isLoading ? 'Đang xác thực...' : `Xác thực vai trò ${activeRoleTab === 'teacher' ? 'Giáo viên' : 'Học sinh'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security Note */}
        <div className="mt-5 text-center flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Bảo mật RBAC: Học sinh tuyệt đối không thể truy cập menu quản trị</span>
        </div>

      </div>
    </div>
  );
};
