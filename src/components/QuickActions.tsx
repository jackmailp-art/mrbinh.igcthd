import React from 'react';
import { Layers, Sparkles, Send, BarChart3, ChevronRight } from 'lucide-react';

interface QuickActionsProps {
  onOpenClassList: () => void;
  onOpenAiModal: () => void;
  onOpenAssignModal: () => void;
  onOpenAnalytics: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenClassList,
  onOpenAiModal,
  onOpenAssignModal,
  onOpenAnalytics,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Thao tác nhanh</h2>
        <p className="text-xs text-slate-500">Những việc giáo viên dùng thường xuyên nhất.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Lớp & học sinh */}
        <div
          onClick={onOpenClassList}
          className="group bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition">
              Lớp & học sinh
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-normal">
              Tạo lớp, nhập học sinh, mã PIN và bảng thi đua xếp hạng.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
            <span>Mở danh sách</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Tạo đề AI */}
        <div
          onClick={onOpenAiModal}
          className="group bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 group-hover:text-amber-600 transition">
              Tạo đề AI
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-normal">
              Từ Word/PDF/TXT với nhiều dạng câu hỏi & đáp án giải thích.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600">
            <span>Tạo ngay</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Giao nhiệm vụ */}
        <div
          onClick={onOpenAssignModal}
          className="group bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-xs">
              <Send className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 group-hover:text-emerald-600 transition">
              Giao nhiệm vụ
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-normal">
              Chụp vở, nộp file, ảnh, link, audio hoặc video kiểm tra.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
            <span>Giao bài tập</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Kết quả & AI */}
        <div
          onClick={onOpenAnalytics}
          className="group bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-xs">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition">
              Kết quả & AI
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-normal">
              Xem điểm, lỗi sai và phát hiện lỗ hổng kiến thức gần đây.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600">
            <span>Xem báo cáo</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>
    </div>
  );
};
