import React from 'react';
import {
  Sparkles,
  Plus,
  Brain,
  Upload,
  Headphones,
  Video,
  Users,
  Send,
  GraduationCap,
  ClipboardCheck,
  ChevronRight,
  BookOpen,
  FolderOpen
} from 'lucide-react';

export interface HeroBannerProps {
  onOpenAiModal: () => void;
  onOpenManualModal?: () => void;
  onOpenClassModal: () => void;
  onOpenLiveVoice?: () => void;
  onOpenMediaStudio?: () => void;
  onOpenClassList?: () => void;
  onOpenAssignModal?: () => void;
  onOpenThptHub?: () => void;
  onOpenTasks?: () => void;
  onOpenExams?: () => void;
  onOpenAnalytics?: () => void;
  onOpenParentReport?: () => void;
}

interface ControlCardItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  badge?: string;
  badgeColor?: string;
  actionText: string;
  actionBg: string;
  actionColor: string;
  onClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenAiModal,
  onOpenManualModal,
  onOpenClassModal,
  onOpenLiveVoice,
  onOpenMediaStudio,
  onOpenClassList,
  onOpenAssignModal,
  onOpenThptHub,
  onOpenTasks,
  onOpenExams,
  onOpenAnalytics,
  onOpenParentReport,
}) => {
  // 9 Cards for the 3x3 Control Center Grid
  const controlCards: ControlCardItem[] = [
    {
      id: 'ai-exam',
      title: 'Tạo Đề Bằng AI',
      subtitle: 'Tự động sinh đề kiểm tra chuẩn cấu trúc Bộ GD&ĐT từ ma trận',
      icon: <Sparkles className="w-5 h-5" />,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/80',
      badge: 'HOT AI',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      actionText: 'Tạo đề ngay',
      actionBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
      actionColor: 'text-white',
      onClick: onOpenAiModal,
    },
    {
      id: 'manual-import',
      title: 'Tạo Đề Thủ Công / Nhập File',
      subtitle: 'Tải file Word/PDF hoặc nhập ngân hàng câu hỏi trực tiếp',
      icon: <Upload className="w-5 h-5" />,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80',
      badge: '.docx .xlsx .pdf',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      actionText: 'Nhập file ngay',
      actionBg: 'bg-emerald-600 hover:bg-emerald-700',
      actionColor: 'text-white',
      onClick: onOpenManualModal || onOpenAiModal,
    },
    {
      id: 'ai-voice',
      title: 'Trợ Lý AI & Luyện Nói',
      subtitle: 'Chatbot luyện giao tiếp & giải đáp thắc mắc chuyên môn',
      icon: <Headphones className="w-5 h-5" />,
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/80',
      badge: 'LIVE AUDIO',
      badgeColor: 'bg-rose-500 text-white animate-pulse',
      actionText: 'Bắt đầu',
      actionBg: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700',
      actionColor: 'text-white',
      onClick: onOpenLiveVoice || (() => {}),
    },
    {
      id: 'media-studio',
      title: 'Studio Video & Media AI',
      subtitle: 'Dựng bài giảng video AI, tạo thuyết minh tự động',
      icon: <Video className="w-5 h-5" />,
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/80',
      badge: 'VEO 3',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      actionText: 'Mở Studio',
      actionBg: 'bg-purple-600 hover:bg-purple-700',
      actionColor: 'text-white',
      onClick: onOpenMediaStudio || (() => {}),
    },
    {
      id: 'class-management',
      title: 'Quản Lý Lớp Học',
      subtitle: 'Danh sách học sinh, điểm danh, nề nếp thi đua các lớp',
      icon: <Users className="w-5 h-5" />,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/80',
      badge: '4 Lớp',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      actionText: 'Xem chi tiết',
      actionBg: 'bg-blue-600 hover:bg-blue-700',
      actionColor: 'text-white',
      onClick: onOpenClassList || (() => {}),
    },
    {
      id: 'assign-task',
      title: 'Giao Bài Tập',
      subtitle: 'Giao bài luyện tập, bài tập về nhà và đặt hạn chót nộp bài',
      icon: <Send className="w-5 h-5" />,
      iconBg: 'bg-sky-50 text-sky-600 border border-sky-200/80',
      badge: 'Giao nhanh',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
      actionText: 'Giao bài',
      actionBg: 'bg-sky-600 hover:bg-sky-700',
      actionColor: 'text-white',
      onClick: onOpenAssignModal || (() => {}),
    },
    {
      id: 'thpt-hub',
      title: 'Luyện Thi THPT',
      subtitle: 'Ngân hàng đề thi tốt nghiệp THPT chuẩn hóa và phân loại mức độ',
      icon: <GraduationCap className="w-5 h-5" />,
      iconBg: 'bg-teal-50 text-teal-600 border border-teal-200/80',
      badge: 'Chuẩn Bộ',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
      actionText: 'Luyện đề',
      actionBg: 'bg-teal-600 hover:bg-teal-700',
      actionColor: 'text-white',
      onClick: onOpenThptHub || (() => {}),
    },
    {
      id: 'tasks-management',
      title: 'Quản Lý Nhiệm Vụ',
      subtitle: 'Sổ báo giảng, lịch công tác chuyên môn và nhắc nhở việc cần làm',
      icon: <ClipboardCheck className="w-5 h-5" />,
      iconBg: 'bg-orange-50 text-orange-600 border border-orange-200/80',
      badge: 'NHẮC NHỞ',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      actionText: 'Mở lịch',
      actionBg: 'bg-orange-600 hover:bg-orange-700',
      actionColor: 'text-white',
      onClick: onOpenTasks || (() => {}),
    },
    {
      id: 'exam-repository',
      title: 'Kho Bài Tập & Đề Thi',
      subtitle: 'Lưu trữ, phân loại đề kiểm tra, ngân hàng câu hỏi và bài tập theo khối lớp, bài học.',
      icon: <FolderOpen className="w-5 h-5" />,
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/80',
      badge: 'TÀI NGUYÊN',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      actionText: 'Vào kho đề >',
      actionBg: 'bg-indigo-600 hover:bg-indigo-700',
      actionColor: 'text-white',
      onClick: onOpenExams || (() => {}),
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1D4ED8] via-[#2563EB] to-[#1E40AF] p-6 sm:p-7 md:p-8 text-white shadow-xl shadow-blue-900/20 border border-blue-400/30">
      {/* Background Decorative Vectors & Brain Pattern */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none flex items-center justify-end select-none overflow-hidden">
        <Brain className="w-96 h-96 text-white transform translate-x-16 -translate-y-8 select-none" />
      </div>
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none select-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none select-none" />

      {/* Main Top Header Area */}
      <div className="relative z-10 mb-7">
        <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider bg-white/15 text-amber-300 px-3.5 py-1 rounded-full backdrop-blur-md mb-2.5 border border-white/20 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>+ TRUNG TÂM ĐIỀU KHIỂN</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Xin chào, T. Bình – AV</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-blue-100/95 text-xs sm:text-sm leading-relaxed mt-1 max-w-2xl font-normal">
              Quản lý lớp, tạo đề, giao nhiệm vụ và theo dõi tiến bộ học sinh trong một không gian gọn gàng.
            </p>
          </div>

          {/* Quick Header Action Buttons with scale-down feedback */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenAiModal}
              className="inline-flex items-center gap-1.5 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all duration-150 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>+ Tạo đề bằng AI</span>
            </button>

            <button
              type="button"
              onClick={onOpenManualModal || onOpenAiModal}
              className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all duration-150 cursor-pointer active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Nhập file / Đề mẫu</span>
            </button>

            <button
              type="button"
              onClick={onOpenClassModal}
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-3 py-2 rounded-xl border border-white/20 transition-all duration-150 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm lớp</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3x3 Grid of 9 Quick Action Cards (No Tooltips, No Info icons, Clean & Modern) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {controlCards.map((card) => (
          <div
            key={card.id}
            onClick={card.onClick}
            className="group relative bg-white text-slate-800 rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Top row: Icon + Badges (Info icon removed) */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform ${card.iconBg}`}>
                    {card.icon}
                  </div>
                  {card.badge && (
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                {card.title}
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed font-normal">
                {card.subtitle}
              </p>
            </div>

            {/* Bottom Action Button with subtle scale-down feedback */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <span>Nhấn để mở</span>
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  card.onClick();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer active:scale-95 ${card.actionBg} ${card.actionColor}`}
              >
                <span>{card.actionText}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
