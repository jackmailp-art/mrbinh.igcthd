import React from 'react';
import {
  LogOut,
  School,
  GraduationCap,
  UserPlus
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';

interface TopHeaderProps {
  user: AuthUser | null;
  currentClassName?: string;
  onOpenLoginModal?: (role: UserRole, mode?: 'login' | 'register') => void;
  onLogout: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  currentClassName,
  onOpenLoginModal,
  onLogout
}) => {
  // Resolve class name securely, preventing any sensitive leaks or compromised strings
  const resolvedClassDisplay = (() => {
    const raw = currentClassName || user?.className;
    if (!raw) return 'Lớp 12G09';
    const clean = raw.trim();
    if (
      clean.includes('@') ||
      /[!#$%^&*()+=\[\]{};':"\\|,.<>\/?]/.test(clean) ||
      /phucbinh/i.test(clean) ||
      /@123/i.test(clean) ||
      clean.length > 15
    ) {
      return 'Lớp 12G09';
    }
    return clean.startsWith('Lớp ') ? clean : `Lớp ${clean}`;
  })();

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.03)] font-sans">
      {/* Brand Logo / Left Section */}
      <div className="flex items-center gap-3">
        {!user && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-500/20">
              ⚡
            </div>
            <span className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
              Trợ Lý AI Thầy Bình
            </span>
          </div>
        )}
        {user?.role === 'student' && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-black text-base shadow-xs">
              🎓
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-800 block">
                Cổng Học Sinh
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {resolvedClassDisplay} • Thầy Dương Văn Bình
              </span>
            </div>
          </div>
        )}
        {user?.role === 'teacher' && (
          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-sm font-bold text-slate-800">
              Cổng Quản Trị Giáo Viên
            </span>
            <span className="text-xs text-slate-400 font-medium hidden md:inline">
              (Teacher Studio / EduAdmin)
            </span>
          </div>
        )}
      </div>

      {/* Right Controls: Prominently feature Đăng nhập & Đăng ký cho cả Giáo viên & Học sinh */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Nút Giáo viên: Đăng nhập & Đăng ký */}
        <div className="inline-flex items-center rounded-xl bg-blue-50 border border-blue-200 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => onOpenLoginModal?.('teacher', 'login')}
            title="Xác thực tài khoản giáo viên để chuyển đến trang Quản trị (Teacher Studio/EduAdmin)"
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              user?.role === 'teacher'
                ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-400/40'
                : 'text-blue-700 hover:bg-blue-100/80'
            }`}
          >
            <School className={`w-3.5 h-3.5 ${user?.role === 'teacher' ? 'text-white' : 'text-blue-600'}`} />
            <span>Đăng nhập Giáo viên</span>
            {user?.role === 'teacher' && (
              <span className="text-[10px] bg-blue-500/90 text-white px-1.5 py-0.5 rounded font-semibold ml-0.5">
                Đang dùng
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onOpenLoginModal?.('teacher', 'register')}
            title="Đăng ký tài khoản Giáo viên mới bằng Google"
            className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-200/60 transition flex items-center gap-1.5 cursor-pointer border-l border-blue-200/80"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="hidden sm:inline">Đăng ký Google</span>
            <span className="sm:hidden">Google</span>
          </button>
        </div>

        {/* Nút Học sinh: Đăng nhập & Đăng ký */}
        <div className="inline-flex items-center rounded-xl bg-emerald-50 border border-emerald-200 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => onOpenLoginModal?.('student', 'login')}
            title="Xác thực tài khoản học sinh và chỉ mở giao diện Cổng học tập học sinh (Student Portal)"
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              user?.role === 'student'
                ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400/40'
                : 'text-emerald-700 hover:bg-emerald-100/80'
            }`}
          >
            <GraduationCap className={`w-3.5 h-3.5 ${user?.role === 'student' ? 'text-white' : 'text-emerald-600'}`} />
            <span>Đăng nhập Học sinh</span>
            {user?.role === 'student' && (
              <span className="text-[10px] bg-emerald-500/90 text-white px-1.5 py-0.5 rounded font-semibold ml-0.5">
                Đang dùng
              </span>
            )}
          </button>

          {!user && (
            <button
              type="button"
              onClick={() => onOpenLoginModal?.('student', 'register')}
              title="Đăng ký tài khoản Học sinh mới"
              className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-200/60 transition flex items-center gap-1 cursor-pointer border-l border-emerald-200/80"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Đăng ký</span>
            </button>
          )}
        </div>

        {/* When User is Logged In: Logout */}
        {user && (
          <button
            type="button"
            onClick={onLogout}
            title="Đăng xuất khỏi hệ thống"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-xs font-bold transition active:scale-95 cursor-pointer ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        )}
      </div>
    </header>
  );
};
