import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';
import { AuthUser } from '../types';

interface SecurityAlertModalProps {
  user: AuthUser;
  isOpen: boolean;
  message?: string;
  onClose: () => void;
  onLogoutAndSwitch: () => void;
}

export const SecurityAlertModal: React.FC<SecurityAlertModalProps> = ({
  user,
  isOpen,
  message,
  onClose,
  onLogoutAndSwitch
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 p-6 sm:p-8 space-y-5 text-center relative overflow-hidden">
        {/* Top Warning Badge */}
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-extrabold uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            <span>Chặn Quyền Truy Cập (RBAC Guard)</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Bạn không có quyền truy cập trang quản trị này!
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {message || (
              <>
                Tài khoản của bạn hiện tại là <strong>Học sinh ({user.name})</strong>. Theo chính sách phân quyền bảo mật nghiêm ngặt, học sinh tuyệt đối không được phép truy cập vào khu vực Quản trị & Soạn đề của Giáo viên.
              </>
            )}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
            Hướng dẫn tiếp tục:
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            • Nếu bạn là học sinh, hãy tiếp tục ở <strong>Cổng Học Sinh</strong> để làm bài thi được giao.
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            • Nếu bạn là Giáo viên quản trị, vui lòng <strong>Đăng xuất</strong> tài khoản học sinh trước khi tiến hành xác thực tài khoản Giáo viên.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ở lại Cổng Học Sinh</span>
          </button>

          <button
            type="button"
            onClick={onLogoutAndSwitch}
            className="py-2.5 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-200 hover:border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
};
