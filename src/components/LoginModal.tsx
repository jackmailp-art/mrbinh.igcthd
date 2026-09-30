import React, { useState } from 'react';
import {
  X,
  School,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  User,
  KeyRound,
  ShieldCheck,
  UserPlus,
  LogIn,
  BookOpen,
  Building
} from 'lucide-react';
import { AuthUser, UserRole, ClassItem, StudentItem } from '../types';
import { authService } from '../services/authService';

interface LoginModalProps {
  initialRole: UserRole;
  initialMode?: 'login' | 'register';
  classes?: ClassItem[];
  students?: StudentItem[];
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  initialRole,
  initialMode = 'login',
  classes = [],
  students = [],
  onClose,
  onLoginSuccess
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);

  // Student 2-Factor Authentication States (Class PIN + Personal Phone)
  const [studentPin, setStudentPin] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentLoginType, setStudentLoginType] = useState<'pin_phone' | 'password'>('pin_phone');

  // Common Login Form States - strictly empty initially (no hardcoded credentials)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Teacher Register States
  const [regTeacherName, setRegTeacherName] = useState('');
  const [regTeacherIdentifier, setRegTeacherIdentifier] = useState('');
  const [regTeacherSubject, setRegTeacherSubject] = useState('Tiếng Anh THPT');
  const [regTeacherSchool, setRegTeacherSchool] = useState('');
  const [regTeacherPassword, setRegTeacherPassword] = useState('');
  const [regTeacherConfirmPassword, setRegTeacherConfirmPassword] = useState('');
  const [showRegTeacherPassword, setShowRegTeacherPassword] = useState(false);

  // Student Register States
  const [regStudentName, setRegStudentName] = useState('');
  const [regStudentIdentifier, setRegStudentIdentifier] = useState('');
  const [regStudentClass, setRegStudentClass] = useState('Lớp 12G09');
  const [regStudentPassword, setRegStudentPassword] = useState('');
  const [regStudentConfirmPassword, setRegStudentConfirmPassword] = useState('');
  const [showRegStudentPassword, setShowRegStudentPassword] = useState(false);

  // Feedback States
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setError('');
    setSuccessMessage('');
  };

  const handleStudent2FactorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = authService.verifyStudentByPinAndPhone({
        pin: studentPin,
        phone: studentPhone,
        classesList: classes,
        studentsList: students
      });
      setIsLoading(false);

      if (res.success && res.user) {
        setSuccessMessage(res.message);
        authService.setStoredUser(res.user);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 500);
      } else {
        setError(res.message || 'Xác thực không thành công.');
      }
    }, 300);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = authService.login(identifier, password, role);
      setIsLoading(false);

      if (res.success && res.user) {
        authService.setStoredUser(res.user);
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    }, 300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (role === 'teacher') {
      // Teacher Registration Validation
      if (regTeacherPassword !== regTeacherConfirmPassword) {
        setError('Mật khẩu và Xác nhận mật khẩu không trùng khớp.');
        return;
      }
      if (regTeacherPassword.length < 6) {
        setError('Mật khẩu giáo viên phải có ít nhất 6 ký tự để đảm bảo an toàn.');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        const res = authService.registerTeacher({
          name: regTeacherName,
          identifier: regTeacherIdentifier,
          subject: regTeacherSubject,
          schoolName: regTeacherSchool,
          password: regTeacherPassword
        });
        setIsLoading(false);

        if (res.success && res.user) {
          authService.setStoredUser(res.user);
          onLoginSuccess(res.user);
          onClose();
        } else {
          setError(res.message);
        }
      }, 350);
    } else {
      // Student Registration Validation
      if (regStudentPassword !== regStudentConfirmPassword) {
        setError('Mật khẩu và Xác nhận mật khẩu không trùng khớp.');
        return;
      }
      if (regStudentPassword.length < 6) {
        setError('Mật khẩu học sinh phải có ít nhất 6 ký tự để đảm bảo an toàn.');
        return;
      }

      // Security check: ensure class cannot contain password or sensitive characters
      if (
        regStudentClass.includes('@') ||
        /phucbinh/i.test(regStudentClass) ||
        regStudentClass === regStudentPassword
      ) {
        setError('Lớp học không hợp lệ. Vui lòng chọn lớp học từ danh sách.');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        const res = authService.registerStudent({
          name: regStudentName,
          identifier: regStudentIdentifier,
          selectedClass: regStudentClass,
          password: regStudentPassword
        });
        setIsLoading(false);

        if (res.success && res.user) {
          authService.setStoredUser(res.user);
          onLoginSuccess(res.user);
          onClose();
        } else {
          setError(res.message);
        }
      }, 350);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition z-20 cursor-pointer"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className={`p-6 pb-5 shrink-0 ${
          role === 'teacher'
            ? 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white'
            : 'bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shrink-0">
              {role === 'teacher' ? (
                <School className="w-6 h-6" />
              ) : (
                <GraduationCap className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                {role === 'teacher'
                  ? authMode === 'register'
                    ? 'Đăng ký tài khoản Giáo viên'
                    : 'Đăng nhập Giáo viên'
                  : authMode === 'register'
                  ? 'Đăng ký tài khoản Học sinh'
                  : 'Đăng nhập Học sinh'}
              </h2>
              <p className="text-xs text-white/90 mt-1 leading-relaxed">
                {role === 'teacher'
                  ? authMode === 'register'
                    ? 'Tạo tài khoản quản trị mới để khởi tạo lớp học, tạo đề thi AI và quản lý học sinh.'
                    : 'Chỉ dành cho Giáo viên quản trị hệ thống (Teacher Studio / EduAdmin).'
                  : authMode === 'register'
                  ? 'Tạo tài khoản học tập mới để tự động gán vào lớp và làm bài kiểm tra.'
                  : 'Xác thực để vào Cổng làm bài tập và theo dõi tiến độ học tập cá nhân.'}
              </p>
            </div>
          </div>

          {/* Role Switching Tabs */}
          <div className="mt-5 bg-black/20 p-1 rounded-2xl flex items-center gap-1 border border-white/15">
            <button
              type="button"
              onClick={() => handleRoleChange('teacher')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'teacher'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Cổng Giáo Viên</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'student'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Cổng Học Sinh</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Sub-tabs (Login vs Register) for both Teacher and Student */}
          <div className="flex border-b border-slate-200 gap-4 mb-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError('');
              }}
              className={`pb-2 text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
                authMode === 'login'
                  ? role === 'teacher'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setError('');
              }}
              className={`pb-2 text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
                authMode === 'register'
                  ? role === 'teacher'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng ký tài khoản mới</span>
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-700 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FORM A: LOGIN (For Teacher or Student) */}
          {authMode === 'login' ? (
            role === 'student' && studentLoginType === 'pin_phone' ? (
              /* STUDENT FORM: 2-FACTOR ENTRY (PIN + PHONE) */
              <form onSubmit={handleStudent2FactorSubmit} className="space-y-4">
                {/* 2FA Explainer Banner */}
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">Xác thực kép chính chủ (Mã PIN + Số điện thoại):</span>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                      Nhập đúng Mã PIN lớp và Số điện thoại đã được Thầy Bình thêm vào lớp để nhận diện chính xác danh tính của em, chống chọn nhầm hoặc làm hộ bài.
                    </p>
                  </div>
                </div>

                {/* Field 1: Mã PIN lớp học */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Mã PIN lớp học <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">4 chữ số do Thầy Bình cấp</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                    </div>
                    <input
                      type="text"
                      required
                      value={studentPin}
                      onChange={(e) => {
                        setStudentPin(e.target.value.trim());
                        setError('');
                      }}
                      placeholder="Nhập mã PIN lớp (VD: 4324, 4827...)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold tracking-wider text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Field 2: Số điện thoại học sinh */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Số điện thoại học sinh <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">Số đã đăng ký với Thầy Bình</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={studentPhone}
                      onChange={(e) => {
                        setStudentPhone(e.target.value);
                        setError('');
                      }}
                      placeholder="Nhập số điện thoại của em (VD: 0839050211, 0987654321...)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Submit Button: Xác nhận vào làm bài */}
                <button
                  type="submit"
                  disabled={isLoading || !studentPin || !studentPhone}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang đối soát danh sách lớp...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác nhận vào làm bài</span>
                    </>
                  )}
                </button>

                {/* Auxiliary links for student */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      setStudentLoginType('password');
                      setError('');
                    }}
                    className="text-slate-600 hover:text-emerald-700 font-medium underline cursor-pointer"
                  >
                    Đăng nhập bằng Mật khẩu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setError('');
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                  >
                    Đăng ký tài khoản mới
                  </button>
                </div>
              </form>
            ) : (
              /* STANDARD ACCOUNT + PASSWORD FORM (For Teacher OR Student who chose password mode) */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Back to 2FA button if student is in password mode */}
                {role === 'student' && studentLoginType === 'password' && (
                  <button
                    type="button"
                    onClick={() => {
                      setStudentLoginType('pin_phone');
                      setError('');
                    }}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>← Chuyển sang Vào lớp bằng Mã PIN & SĐT (Khuyên dùng)</span>
                  </button>
                )}

                {/* Teacher Security Reminder */}
                {role === 'teacher' && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-blue-800">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Khu vực bảo mật Giáo viên:</span>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        Vui lòng nhập tài khoản và mật khẩu quản trị đã được cấp hoặc đăng ký để truy cập trang quản trị.
                      </p>
                    </div>
                  </div>
                )}

                {/* Account Input (Email or Phone) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Tài khoản (Email hoặc Số điện thoại) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        role === 'teacher'
                          ? 'Nhập email hoặc SĐT giáo viên'
                          : 'Nhập email hoặc SĐT học sinh'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Mật khẩu <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98 ${
                    role === 'teacher'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {role === 'teacher' ? 'Xác thực & Vào Quản trị' : 'Đăng nhập Học sinh'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to Register link */}
                <div className="text-center pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    {role === 'teacher' ? 'Chưa có tài khoản Giáo viên? ' : 'Chưa có tài khoản học sinh? '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setError('');
                      }}
                      className={`font-bold underline cursor-pointer ${
                        role === 'teacher' ? 'text-blue-600 hover:text-blue-700' : 'text-emerald-600 hover:text-emerald-700'
                      }`}
                    >
                      Đăng ký tài khoản mới ngay
                    </button>
                  </p>
                </div>
              </form>
            )
          ) : role === 'teacher' ? (
            /* FORM B1: TEACHER REGISTRATION (SIGN UP) */
            <div className="space-y-4">
              {/* Quick Google Registration Option */}
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    const googleUser: AuthUser = {
                      id: `teach-google-${Date.now()}`,
                      name: regTeacherName.trim() || 'Thầy Giáo Viên (Google Workspace)',
                      email: regTeacherIdentifier.includes('@') ? regTeacherIdentifier : 'giaovien.tienganh@gmail.com',
                      role: 'teacher',
                      title: 'Giáo viên Tiếng Anh - Google Certified Educator',
                      schoolName: regTeacherSchool.trim() || 'Tổ Ngoại Ngữ THPT'
                    };
                    authService.setStoredUser(googleUser);
                    onLoginSuccess(googleUser);
                    setIsLoading(false);
                    onClose();
                  }, 400);
                }}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer active:scale-98 bg-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Đăng ký nhanh bằng tài khoản Google (Khuyên dùng)</span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[11px] text-slate-400 font-medium">hoặc đăng ký bằng biểu mẫu</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Teacher Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Họ và tên giáo viên <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regTeacherName}
                      onChange={(e) => setRegTeacherName(e.target.value)}
                      placeholder="VD: Thầy Nguyễn Văn Hoàng hoặc Cô Lê Thị Thu"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

              {/* Teacher Identifier (Phone or Email) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Email hoặc Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regTeacherIdentifier}
                    onChange={(e) => setRegTeacherIdentifier(e.target.value)}
                    placeholder="VD: giaovien@gmail.com hoặc 0912345678"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Môn học phụ trách
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regTeacherSubject}
                    onChange={(e) => setRegTeacherSubject(e.target.value)}
                    placeholder="VD: Tiếng Anh THPT, Luyện thi TN THPT, IELTS"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* School / Center */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Trường / Đơn vị công tác
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regTeacherSchool}
                    onChange={(e) => setRegTeacherSchool(e.target.value)}
                    placeholder="VD: THPT Chuyên, Trung tâm Ngoại ngữ..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Mật khẩu <span className="text-rose-500">*</span> (Tối thiểu 6 ký tự)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegTeacherPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regTeacherPassword}
                    onChange={(e) => setRegTeacherPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegTeacherPassword(!showRegTeacherPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Xác nhận lại mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegTeacherPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regTeacherConfirmPassword}
                    onChange={(e) => setRegTeacherConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu để xác nhận"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Submit Register */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Hoàn tất Đăng ký & Vào Quản trị ngay</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Đã có tài khoản giáo viên?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setError('');
                    }}
                    className="font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  >
                    Quay lại Đăng nhập
                  </button>
                </p>
              </div>
            </form>
          </div>
          ) : (
            /* FORM B2: STUDENT REGISTRATION (SIGN UP) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regStudentName}
                    onChange={(e) => setRegStudentName(e.target.value)}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Identifier (Phone or Email) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Số điện thoại hoặc Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regStudentIdentifier}
                    onChange={(e) => setRegStudentIdentifier(e.target.value)}
                    placeholder="VD: 0987654321 hoặc student@gmail.com"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Class Selection */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Lớp học trực thuộc <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <select
                    value={regStudentClass}
                    onChange={(e) => setRegStudentClass(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer font-medium"
                  >
                    <option value="Lớp 12G09">Lớp 12G09 (Lớp chính thức Thầy Bình)</option>
                    <option value="Lớp 12A1">Lớp 12A1 (Lớp Luyện thi THPTQG)</option>
                    <option value="Lớp 11A1">Lớp 11A1 (Lớp Tiếng Anh Nâng Cao)</option>
                    <option value="Lớp 10A1">Lớp 10A1 (Lớp Tiếng Anh Nền Tảng)</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-400">
                  Học sinh được phân công vào lớp để làm bài kiểm tra và nhận nhiệm vụ.
                </p>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Mật khẩu <span className="text-rose-500">*</span> (Tối thiểu 6 ký tự)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegStudentPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regStudentPassword}
                    onChange={(e) => setRegStudentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegStudentPassword(!showRegStudentPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Xác nhận lại mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegStudentPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regStudentConfirmPassword}
                    onChange={(e) => setRegStudentConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu để xác nhận"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Submit Register */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Hoàn tất Đăng ký & Vào học ngay</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Đã có tài khoản học sinh?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setError('');
                    }}
                    className="font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                  >
                    Quay lại Đăng nhập
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
