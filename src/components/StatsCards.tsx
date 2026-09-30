import React from 'react';
import { Layers, Users, FileText, Brain } from 'lucide-react';
import { AiQuota } from '../types';

interface StatsCardsProps {
  classesCount: number;
  studentsCount: number;
  examsCount: number;
  totalSubmissions: number;
  aiUsage: AiQuota;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  classesCount,
  studentsCount,
  examsCount,
  totalSubmissions,
  aiUsage,
}) => {
  const usagePercent = Math.min(100, Math.round((aiUsage.used / aiUsage.limit) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      
      {/* Stat 1: Lớp đang quản lý */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
              classesCount > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {classesCount > 0 ? 'Đang hoạt động' : 'Chưa có lớp'}
            </span>
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Lớp đang quản lý
          </div>

          <div className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">
            {classesCount}
          </div>
        </div>
      </div>

      {/* Stat 2: Học sinh */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
              studentsCount > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {studentsCount > 0 ? `+${studentsCount} học sinh` : 'Chưa có'}
            </span>
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Học sinh
          </div>

          <div className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">
            {studentsCount}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 mt-2">
          Trong toàn bộ lớp của thầy/cô
        </div>
      </div>

      {/* Stat 3: Bộ đề */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200/60">
              Đã lưu trữ
            </span>
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Bộ đề
          </div>

          <div className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">
            {examsCount}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 mt-2">
          {totalSubmissions} lượt làm bài đã ghi nhận
        </div>
      </div>

      {/* Stat 4: Hạn mức AI */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200/60">
              Miễn phí thử nghiệm
            </span>
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Hạn mức AI
          </div>

          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight mb-1">
            Không giới hạn
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 mt-2">
          Thầy Bình đang miễn phí trong thời gian thử nghiệm.
        </div>
      </div>

    </div>
  );
};
