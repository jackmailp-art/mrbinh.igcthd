import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, GraduationCap } from 'lucide-react';
import { AuthUser } from '../types';

interface Forbidden403ViewProps {
  attemptedRoute: string;
  user: AuthUser;
  onReturnToAllowed: () => void;
}

export const Forbidden403View: React.FC<Forbidden403ViewProps> = ({
  attemptedRoute,
  user,
  onReturnToAllowed
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 p-8 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-black text-2xl mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            HTTP 403 • Truy Cập Bị Từ Chối
          </span>
          <h2 className="text-xl font-black text-slate-900">
            Bạn không có quyền truy cập trang này
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Trang <span className="font-mono font-bold text-rose-600">/{attemptedRoute}</span> thuộc khu vực quản trị & biên soạn đề của <strong>Giáo viên</strong>. Tài khoản học sinh của bạn (<span className="font-semibold text-slate-700">{user.name}</span>) đã bị chặn theo chính sách kiểm soát truy cập (RBAC).
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs text-slate-600 space-y-1">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Quyền hạn được phép cho Học sinh:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-500">
            <li>Làm bài tập & đề trắc nghiệm được giao</li>
            <li>Xem kết quả làm bài cá nhân & lời giải chi tiết</li>
            <li>Theo dõi lịch học & nộp ảnh bài học/vở ghi chép</li>
            <li>Xem thông tin học sinh & mã PIN lớp học</li>
          </ul>
        </div>

        <button
          onClick={onReturnToAllowed}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-98"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại giao diện Học sinh</span>
        </button>
      </div>
    </div>
  );
};
