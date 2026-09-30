import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Filter,
  Layers,
  GraduationCap,
  Users,
  Award,
  Sparkles,
  BarChart3,
  Calendar,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ClassItem, ExamItem, StudentItem, SubmissionItem } from '../types';
import { exportClassReportToExcel, ExportSummary } from '../utils/exportClassReportExcel';

interface ExportClassReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  students: StudentItem[];
  exams?: ExamItem[];
  submissions?: SubmissionItem[];
  initialClassId?: string | null;
  onSuccess?: (summary: ExportSummary) => void;
}

export const ExportClassReportModal: React.FC<ExportClassReportModalProps> = ({
  isOpen,
  onClose,
  classes,
  students,
  exams = [],
  submissions = [],
  initialClassId,
  onSuccess
}) => {
  // Target class: default to initialClassId if provided, otherwise 'ALL'
  const [selectedClassId, setSelectedClassId] = useState<string | 'ALL'>(
    initialClassId && initialClassId !== 'ALL' ? initialClassId : 'ALL'
  );

  // Report type
  const [reportType, setReportType] = useState<
    'full_multisheet' | 'roster_scores' | 'exam_matrix' | 'submissions_log'
  >('full_multisheet');

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Custom file name
  const [customFileName, setCustomFileName] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedResult, setExportedResult] = useState<ExportSummary | null>(null);

  if (!isOpen) return null;

  // Selected Class details
  const activeClass = selectedClassId === 'ALL' ? null : classes.find(c => c.id === selectedClassId) || null;

  // Filtered student count
  const targetStudents = students.filter(s => {
    if (selectedClassId === 'ALL') return true;
    if (s.classId === selectedClassId) return true;
    if (activeClass && s.className && s.className.trim().toLowerCase() === activeClass.name.trim().toLowerCase()) return true;
    return false;
  }).filter(s => {
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  // Calculate matching submissions count
  const studentIds = new Set(targetStudents.map(s => s.studentId).filter(Boolean));
  const relevantSubs = submissions.filter(sub => {
    if (sub.studentId && studentIds.has(sub.studentId)) return true;
    if (selectedClassId === 'ALL') return true;
    if (sub.classId === selectedClassId) return true;
    if (activeClass && sub.className && sub.className.trim().toLowerCase() === activeClass.name.trim().toLowerCase()) return true;
    return false;
  });

  const handleExport = () => {
    setIsExporting(true);

    try {
      const summary = exportClassReportToExcel({
        targetClassId: selectedClassId,
        classes,
        students,
        exams,
        submissions,
        reportType,
        statusFilter,
        customFileName: customFileName.trim() ? (customFileName.endsWith('.xlsx') ? customFileName : `${customFileName}.xlsx`) : undefined
      });

      setExportedResult(summary);
      if (onSuccess) {
        onSuccess(summary);
      }

      setTimeout(() => {
        setIsExporting(false);
      }, 500);
    } catch (err) {
      console.error('Export Excel failed:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 via-slate-50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-slate-800 tracking-tight">
                  Xuất Báo Cáo Danh Sách Lớp & Điểm Thi
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  File .XLSX
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Định dạng chuẩn Microsoft Excel (.xlsx), hỗ trợ mở trên Excel 2016 - 2026, Office 365, Google Sheets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Section 1: Choose Class Scope */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>1. Chọn Lớp Học Cần Xuất Báo Cáo</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedClassId('ALL')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                  selectedClassId === 'ALL'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    selectedClassId === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs">Toàn bộ các lớp (Toàn trường)</div>
                    <div className="text-[10px] text-slate-500">{students.length} học sinh • {classes.length} lớp</div>
                  </div>
                </div>
                {selectedClassId === 'ALL' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>

              <select
                value={selectedClassId === 'ALL' ? '' : selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value || 'ALL')}
                className={`border rounded-xl px-3 py-2.5 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                  selectedClassId !== 'ALL'
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <option value="" disabled={selectedClassId !== 'ALL'}>-- Hoặc chọn lớp cụ thể --</option>
                {classes.map(c => {
                  const count = students.filter(s => s.classId === c.id || (s.className && s.className.trim().toLowerCase() === c.name.trim().toLowerCase())).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({count} học sinh - PIN: {c.pin})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Section 2: Choose Report Type */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>2. Chọn Loại Báo Cáo Xuất Ra File Excel</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Type 1: Comprehensive Multi-Sheet */}
              <div
                onClick={() => setReportType('full_multisheet')}
                className={`p-3.5 rounded-xl border cursor-pointer transition select-none flex flex-col justify-between gap-2 ${
                  reportType === 'full_multisheet'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sổ Điểm & Hồ Sơ Toàn Diện</span>
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                      4 Sheets (Khuyên dùng)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Bao gồm 4 trang: 1. Danh sách lớp & Hồ sơ HS, 2. Bảng điểm ma trận các bài thi, 3. Lịch sử lượt nộp bài thi, 4. Thống kê & Phổ điểm học lực.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Chuẩn lưu trữ hồ sơ giảng dạy & in ấn
                </div>
              </div>

              {/* Type 2: Exam Matrix */}
              <div
                onClick={() => setReportType('exam_matrix')}
                className={`p-3.5 rounded-xl border cursor-pointer transition select-none flex flex-col justify-between gap-2 ${
                  reportType === 'exam_matrix'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Bảng Điểm Ma Trận Từng Đề</span>
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                      Sổ cái điểm
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Mỗi cột là một bài thi của lớp, ghi nhận chi tiết điểm số từng đề thi, điểm trung bình, điểm cao nhất và xếp loại.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-indigo-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Tiện nhập điểm vào vnEdu / SMAS
                </div>
              </div>

              {/* Type 3: Roster with Scores */}
              <div
                onClick={() => setReportType('roster_scores')}
                className={`p-3.5 rounded-xl border cursor-pointer transition select-none flex flex-col justify-between gap-2 ${
                  reportType === 'roster_scores'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Danh Sách Học Sinh & Liên Lạc</span>
                    </span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                      Danh sách lớp
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Danh sách học sinh kèm số điện thoại 2FA, SĐT phụ huynh, tiến độ làm bài, điểm thi gần nhất và ghi chú của giáo viên.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Phù hợp liên lạc phụ huynh & điểm danh
                </div>
              </div>

              {/* Type 4: Submissions Log */}
              <div
                onClick={() => setReportType('submissions_log')}
                className={`p-3.5 rounded-xl border cursor-pointer transition select-none flex flex-col justify-between gap-2 ${
                  reportType === 'submissions_log'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>Nhật Ký & Chi Tiết Lượt Nộp Bài</span>
                    </span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                      Chi tiết nộp
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Ghi lại từng lần học sinh bấm nộp bài thi, số câu đúng / sai, thời gian nộp bài và nhận xét chi tiết của AI / giáo viên.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Minh bạch đối chiếu kết quả khảo thí
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Filter & Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Lọc theo phân loại học lực</span>
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer text-xs"
              >
                <option value="ALL">Tất cả học sinh ({targetStudents.length} em)</option>
                <option value="Xuất sắc">Chỉ học sinh Xuất sắc (9+ điểm)</option>
                <option value="Hoàn thành">Chỉ học sinh Hoàn thành tốt</option>
                <option value="Cần bổ trợ">Chỉ học sinh Cần bổ trợ</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tên file xuất (.xlsx) - Tùy chọn
              </label>
              <input
                type="text"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                placeholder={`Bao_Cao_${activeClass ? activeClass.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Toan_Truong'}_${new Date().toISOString().slice(0, 10)}.xlsx`}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-800 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tóm tắt dữ liệu xuất</span>
              <div className="flex items-center gap-3 font-extrabold text-xs text-slate-800 flex-wrap">
                <span>🎯 Phạm vi: <span className="text-indigo-600">{activeClass ? activeClass.name : 'Toàn trường'}</span></span>
                <span>👥 Sĩ số: <span className="text-emerald-700">{targetStudents.length} học sinh</span></span>
                <span>📝 Bài thi: <span className="text-blue-700">{exams.length} đề thi</span></span>
                <span>📊 Lượt nộp: <span className="text-amber-700">{relevantSubs.length} bài</span></span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-700 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Định dạng .xlsx nguyên bản</span>
            </div>
          </div>

          {/* Success Banner if exported */}
          {exportedResult && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-bold text-xs">
                  Đã tải xuống thành công tệp Excel: <strong>{exportedResult.fileName}</strong> ({exportedResult.studentCount} học sinh)!
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Tự động tạo các sheet với công thức tính điểm & căn chỉnh độ rộng cột tối ưu.
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || targetStudents.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Đang tạo file Excel...' : 'Tải File Excel (.xlsx) Ngay'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
