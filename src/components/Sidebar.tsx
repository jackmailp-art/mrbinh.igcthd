import React from 'react';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Send,
  ClipboardList,
  Trophy,
  BarChart3,
  MailCheck,
  LogOut,
  FileText,
  Users,
  Award,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Radio,
  Video,
  Mic,
  Layers
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';

interface SidebarProps {
  user: AuthUser;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenAiModal?: () => void;
  onOpenAssignModal?: () => void;
  onLogout: () => void;
  onSwitchRole?: (role: UserRole) => void;
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  badge?: string;
  badgeColor?: string;
  onClick: () => void;
  isCollapsed: boolean;
  highlight?: boolean;
  isTeacher?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({
  icon,
  label,
  isActive,
  badge,
  badgeColor,
  onClick,
  isCollapsed,
  highlight,
  isTeacher = true
}) => {
  const activeBg = isTeacher ? 'bg-white text-[#234fe6]' : 'bg-white text-[#0f766e]';
  const defaultHover = 'text-white/85 hover:text-white hover:bg-white/10';

  return (
    <div className="relative group flex justify-center w-full">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
          isCollapsed ? 'justify-center p-2.5 h-11 w-11' : 'justify-between px-3 py-2.5'
        } ${
          isActive
            ? `${activeBg} shadow-sm font-bold`
            : highlight
            ? 'text-amber-200 hover:bg-white/10 font-bold'
            : defaultHover
        }`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
          <span className="flex-shrink-0 flex items-center justify-center">
            {icon}
          </span>
          {!isCollapsed && (
            <span className="truncate">{label}</span>
          )}
        </div>

        {!isCollapsed && badge && (
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs flex-shrink-0 ml-1 ${
            badgeColor || 'bg-amber-400 text-blue-950'
          }`}>
            {badge}
          </span>
        )}
      </button>

      {/* Floating Smart Tooltip in Collapsed State */}
      {isCollapsed && (
        <div
          style={{
            backgroundColor: '#1e293b',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap text-xs font-semibold opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-150 flex items-center gap-2 border border-slate-700/60"
        >
          <span>{label}</span>
          {badge && (
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
              badgeColor || 'bg-amber-400 text-blue-950'
            }`}>
              {badge}
            </span>
          )}
          {/* Arrow pointing to icon */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-[5px] border-transparent border-r-[#1e293b]" />
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeMenu,
  setActiveMenu,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  onOpenAiModal,
  onOpenAssignModal,
  onLogout
}) => {
  const isTeacher = user.role === 'teacher';
  const isStudent = user.role === 'student';

  // Internal state fallback if not controlled from parent
  const [internalCollapsed, setInternalCollapsed] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem('isSidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(prev => {
        const next = !prev;
        try {
          localStorage.setItem('isSidebarCollapsed', String(next));
        } catch {}
        return next;
      });
    }
  };

  return (
    <aside
      style={{ transition: 'all 0.25s ease-in-out' }}
      className={`flex flex-col flex-shrink-0 select-none shadow-xl z-20 text-white ${
        isCollapsed ? 'w-[72px]' : 'w-[270px]'
      } ${isTeacher ? 'bg-[#234fe6]' : 'bg-[#0f766e]'}`}
    >
      {/* 1. Header with App Logo & Collapse/Expand Toggle Button */}
      <div
        style={{ transition: 'all 0.25s ease-in-out' }}
        className={`p-3.5 flex items-center border-b border-white/10 ${
          isCollapsed ? 'flex-col gap-2.5 justify-center' : 'justify-between'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
          <div
            title="Trợ Lý AI Thầy Bình"
            className="w-10 h-10 rounded-xl bg-white/20 border border-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xl text-amber-300 shadow-inner flex-shrink-0 cursor-default"
          >
            {isTeacher ? '⚡' : '🎓'}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="font-extrabold text-sm tracking-tight text-white leading-tight truncate">
                {isTeacher ? 'Trợ Lý AI Thầy Bình' : 'Cổng Học Sinh Tiếng Anh'}
              </div>
              <div className="text-[11px] text-white/80 font-medium mt-0.5 flex items-center gap-1.5 truncate">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    isTeacher ? 'bg-amber-400' : 'bg-emerald-300'
                  }`}
                />
                <span className="truncate">
                  {isTeacher ? 'Teacher Studio (Giáo viên)' : 'Student Portal (Học sinh)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Nút chuyển đổi trạng thái (Toggle Collapse Button) */}
        <button
          type="button"
          onClick={handleToggle}
          title={isCollapsed ? 'Mở rộng thanh bên (Expand)' : 'Thu gọn thanh bên (Collapse)'}
          aria-label={isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 active:bg-white/30 text-white/90 hover:text-white transition cursor-pointer flex-shrink-0 shadow-xs flex items-center justify-center"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 2. Menu Navigation List */}
      <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'} py-4 space-y-5 scrollbar-thin scrollbar-thumb-white/20 overflow-x-hidden`}>
        
        {/* ================= TEACHER MENU (Strictly role === 'teacher') ================= */}
        {isTeacher && (
          <>
            {/* Nhóm 1: QUẢN LÝ GIẢNG DẠY */}
            <div className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-blue-200/70 mb-2 truncate">
                  QUẢN LÝ GIẢNG DẠY
                </div>
              ) : (
                <div className="my-1 border-t border-white/10 mx-2" />
              )}
              <nav className="space-y-1 flex flex-col items-center">
                {/* 1. Tổng quan & Bảng tin */}
                <NavButton
                  icon={<BookOpen className="w-4 h-4" />}
                  label="Tổng quan & Bảng tin"
                  isActive={activeMenu === 'dashboard'}
                  onClick={() => setActiveMenu('dashboard')}
                  isCollapsed={isCollapsed}
                  isTeacher={isTeacher}
                />

                {/* 2. Quản lý Lớp Học */}
                <NavButton
                  icon={<Users className="w-4 h-4" />}
                  label="Quản lý Lớp Học"
                  isActive={activeMenu === 'students'}
                  onClick={() => setActiveMenu('students')}
                  isCollapsed={isCollapsed}
                  isTeacher={isTeacher}
                />

                {/* 3. Bài tập & đề thi */}
                <NavButton
                  icon={<FileText className="w-4 h-4" />}
                  label="Bài tập & đề thi"
                  isActive={activeMenu === 'exams'}
                  onClick={() => setActiveMenu('exams')}
                  isCollapsed={isCollapsed}
                  isTeacher={isTeacher}
                />

                {/* 3.1. English Skills [Badge: 4 KỸ NĂNG] */}
                <NavButton
                  icon={<Layers className="w-4 h-4 text-emerald-300" />}
                  label="English Skills"
                  badge="4 KỸ NĂNG"
                  badgeColor="bg-emerald-400 text-emerald-950 font-black"
                  isActive={activeMenu === 'english-skills'}
                  onClick={() => setActiveMenu('english-skills')}
                  isCollapsed={isCollapsed}
                  isTeacher={isTeacher}
                />

                {/* 4. Tạo bằng AI [Badge: MỚI] */}
                <NavButton
                  icon={<Sparkles className="w-4 h-4 text-amber-300" />}
                  label="Tạo bằng AI"
                  badge="MỚI"
                  badgeColor="bg-amber-400 text-blue-950 font-black"
                  highlight
                  onClick={() => {
                    if (onOpenAiModal) onOpenAiModal();
                  }}
                  isCollapsed={isCollapsed}
                  isTeacher={isTeacher}
                />

                {/* 5. Trợ lý AI & Luyện nói [Badge: 3.8 LIVE] */}
                <NavButton
                  icon={<Radio className="w-4 h-4 text-amber-300" />}
                  label="Trợ lý AI & Luyện nói"
                  badge="3.8 LIVE"
                  badgeColor="bg-rose-500 text-white font-black animate-pulse"
                  isActive={activeMenu === 'ai-train'}
                  onClick={() => setActiveMenu('ai-train')}
                  isCollapsed={isCollapsed}
                  isTeacher={isTeacher}
                />

                {/* 6. Studio Video & Media [Badge: VEO 3] */}
                <NavButton
                  icon={<Video className="w-4 h-4 text-rose-300" />}
                  label="Studio Video & Media"
                  badge="VEO 3"
                  badgeColor="bg-purple-300 text-purple-950 font-black"
                  isActive={activeMenu === 'media-studio'}
                  onClick={() => setActiveMenu('media-studio')}
                  isCollapsed={isCollapsed}
                  isTeacher={isTeacher}
                />

                {/* 7. Luyện Thi THPT */}
                <NavButton
                  icon={<GraduationCap className="w-4 h-4" />}
                  label="Luyện Thi THPT"
                  isActive={activeMenu === 'thpt' || activeMenu === 'thpt-hub'}
                  onClick={() => setActiveMenu('thpt')}
                  isCollapsed={isCollapsed}
                  isTeacher={isTeacher}
                />

                {/* 8. Giao bài tập */}
                <NavButton
                  icon={<Send className="w-4 h-4" />}
                  label="Giao bài tập"
                  onClick={() => {
                    if (onOpenAssignModal) onOpenAssignModal();
                    else setActiveMenu('exams');
                  }}
                  isCollapsed={isCollapsed}
                  isTeacher={isTeacher}
                />

                {/* 9. Quản lý nhiệm vụ [Badge: NHẮC NHỞ] */}
                <NavButton
                  icon={<ClipboardList className="w-4 h-4" />}
                  label="Quản lý nhiệm vụ"
                  badge="NHẮC NHỞ"
                  badgeColor="bg-orange-400 text-orange-950 font-black"
                  isActive={activeMenu === 'tasks'}
                  onClick={() => setActiveMenu('tasks')}
                  isCollapsed={isCollapsed}
                  isTeacher={isTeacher}
                />

                {/* 10. Thi đua lớp */}
                <NavButton
                  icon={<Trophy className="w-4 h-4 text-amber-300" />}
                  label="Thi đua lớp"
                  isActive={activeMenu === 'leaderboard'}
                  onClick={() => setActiveMenu('leaderboard')}
                  isCollapsed={isCollapsed}
                  isTeacher={isTeacher}
                />
                {/* Mục "Công cụ vui" ĐÃ ĐƯỢC XÓA HOÀN TOÀN */}
              </nav>
            </div>

            {/* Nhóm 2: PHÂN TÍCH & KẾT NỐI */}
            <div className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-blue-200/70 mb-2 truncate">
                  PHÂN TÍCH & KẾT NỐI
                </div>
              ) : (
                <div className="my-1 border-t border-white/10 mx-2" />
              )}
              <nav className="space-y-1 flex flex-col items-center">
                {/* 11. Kết quả & AI */}
                <NavButton
                  icon={<BarChart3 className="w-4 h-4" />}
                  label="Kết quả & AI"
                  isActive={activeMenu === 'analytics'}
                  onClick={() => setActiveMenu('analytics')}
                  isCollapsed={isCollapsed}
                  isTeacher={isTeacher}
                />

                {/* 12. Báo cáo phụ huynh */}
                <NavButton
                  icon={<MailCheck className="w-4 h-4" />}
                  label="Báo cáo phụ huynh"
                  isActive={activeMenu === 'parents'}
                  onClick={() => setActiveMenu('parents')}
                  isCollapsed={isCollapsed}
                  isTeacher={isTeacher}
                />
              </nav>
            </div>
          </>
        )}

        {/* ================= STUDENT MENU (Strictly role === 'student') ================= */}
        {isStudent && (
          <div className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-teal-200/80 mb-2 truncate">
                KHU VỰC HỌC SINH
              </div>
            ) : (
              <div className="my-1 border-t border-white/10 mx-2" />
            )}
            <nav className="space-y-1.5 flex flex-col items-center">
              <NavButton
                icon={<Mic className="w-4 h-4 text-amber-300" />}
                label="Luyện Nói AI Trực Tiếp"
                badge="3.8 LIVE"
                badgeColor="bg-amber-400 text-blue-950 font-black"
                isActive={activeMenu === 'student-live-voice'}
                onClick={() => setActiveMenu('student-live-voice')}
                isCollapsed={isCollapsed}
                isTeacher={isTeacher}
              />

              <NavButton
                icon={<BookOpen className="w-4 h-4 text-emerald-300" />}
                label="My Exams (Bài tập & đề thi theo khối, lớp mã GV đã giao)"
                isActive={activeMenu === 'student-exams'}
                onClick={() => setActiveMenu('student-exams')}
                isCollapsed={isCollapsed}
                isTeacher={isTeacher}
              />

              <NavButton
                icon={<Layers className="w-4 h-4 text-teal-300" />}
                label="English Skills (Luyện Ngữ pháp & Từ vựng)"
                badge="4 KỸ NĂNG"
                badgeColor="bg-amber-400 text-teal-950 font-black"
                isActive={activeMenu === 'english-skills' || activeMenu === 'student-skills'}
                onClick={() => setActiveMenu('english-skills')}
                isCollapsed={isCollapsed}
                isTeacher={isTeacher}
              />

              <NavButton
                icon={<Award className="w-4 h-4 text-amber-300" />}
                label="Progress Reports (Phân tích Năng lực AI cá nhân hóa)"
                badge="AI"
                badgeColor="bg-indigo-400 text-indigo-950 font-black"
                isActive={activeMenu === 'student-results'}
                onClick={() => setActiveMenu('student-results')}
                isCollapsed={isCollapsed}
                isTeacher={isTeacher}
              />

              <NavButton
                icon={<Calendar className="w-4 h-4 text-cyan-300" />}
                label="Lịch học & Nhiệm vụ"
                isActive={activeMenu === 'student-tasks'}
                onClick={() => setActiveMenu('student-tasks')}
                isCollapsed={isCollapsed}
                isTeacher={isTeacher}
              />

              <NavButton
                icon={<User className="w-4 h-4 text-teal-200" />}
                label="Thông tin cá nhân"
                isActive={activeMenu === 'student-profile'}
                onClick={() => setActiveMenu('student-profile')}
                isCollapsed={isCollapsed}
                isTeacher={isTeacher}
              />
            </nav>
          </div>
        )}

      </div>

      {/* 3. Khu vực chân trang (Footer profile) */}
      <div
        style={{ transition: 'all 0.25s ease-in-out' }}
        className={`p-3 border-t border-white/10 bg-black/10 ${
          isCollapsed ? 'flex flex-col items-center gap-2.5' : ''
        }`}
      >
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-full font-black flex items-center justify-center text-xs shadow-sm flex-shrink-0 ${
                  isTeacher ? 'bg-amber-300 text-blue-950' : 'bg-emerald-300 text-teal-950'
                }`}
              >
                {user.avatar || (isTeacher ? 'TB' : 'HS')}
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold leading-tight truncate text-white">
                  {user.name}
                </div>
                <span className="text-[10px] text-white/70 block truncate">
                  {isTeacher ? 'Tài khoản Giáo viên' : `Học sinh • ${user.className || 'Lớp 12A1'}`}
                </span>
              </div>
            </div>

            <button
              title="Đăng xuất khỏi hệ thống"
              onClick={onLogout}
              className="text-white/70 hover:text-rose-300 transition p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0 cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 w-full">
            {/* Avatar TB with Hover Tooltip */}
            <div className="relative group flex justify-center">
              <div
                className={`w-9 h-9 rounded-full font-black flex items-center justify-center text-xs shadow-sm flex-shrink-0 cursor-pointer ${
                  isTeacher ? 'bg-amber-300 text-blue-950' : 'bg-emerald-300 text-teal-950'
                }`}
              >
                {user.avatar || (isTeacher ? 'TB' : 'HS')}
              </div>
              <div
                style={{
                  backgroundColor: '#1e293b',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
                className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap text-xs font-semibold opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-150 border border-slate-700/60"
              >
                <span className="block font-bold">{user.name}</span>
                <span className="block text-[10px] text-slate-300 font-normal">
                  {isTeacher ? 'Tài khoản Giáo viên' : `Học sinh • ${user.className || 'Lớp 12A1'}`}
                </span>
                <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-[5px] border-transparent border-r-[#1e293b]" />
              </div>
            </div>

            {/* Logout button with Hover Tooltip */}
            <div className="relative group flex justify-center">
              <button
                type="button"
                onClick={onLogout}
                aria-label="Đăng xuất khỏi hệ thống"
                className="text-white/70 hover:text-rose-300 transition p-2 rounded-xl hover:bg-white/10 flex-shrink-0 cursor-pointer flex items-center justify-center active:scale-95"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <div
                style={{
                  backgroundColor: '#1e293b',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
                className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap text-xs font-semibold opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-150 border border-slate-700/60"
              >
                <span>Đăng xuất khỏi hệ thống</span>
                <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-[5px] border-transparent border-r-[#1e293b]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
