import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Brain,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BookOpen,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  Clock,
  UserCheck,
  UserX,
  Phone,
  Eye,
  Send,
  Copy,
  Check,
  Award,
  Layers
} from 'lucide-react';
import { ClassItem, ExamItem, StudentItem, SubmissionItem } from '../types';
import { SubmissionDetailModal } from './SubmissionDetailModal';
import { ClassScoreTrendChart, CLASS_COLORS } from './ClassScoreTrendChart';
import { PersonalizedExamDiagnosticSection } from './PersonalizedExamDiagnosticSection';

interface AnalyticsViewProps {
  classes: ClassItem[];
  exams: ExamItem[];
  students: StudentItem[];
  submissions: SubmissionItem[];
  onOpenAiModalWithTopic: (topic: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  classes,
  exams,
  students,
  submissions = [],
  onOpenAiModalWithTopic,
}) => {
  // Filters & Tabs State
  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(() => classes.map(c => c.id));
  const [activeTab, setActiveTab] = useState<'submitted' | 'pending'>('submitted');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubmissionForDetail, setSelectedSubmissionForDetail] = useState<SubmissionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Determine if all classes are currently active
  const isAllClasses = selectedClassIds.length === 0 || selectedClassIds.length === classes.length;

  // Toggle single class in/out of the comparison set
  const handleToggleClass = (classId: string) => {
    setSelectedClassIds(prev => {
      let next: string[];
      if (prev.includes(classId)) {
        if (prev.length === 1) return prev; // Keep at least 1 class selected
        next = prev.filter(id => id !== classId);
      } else {
        next = [...prev, classId];
      }
      setSelectedClassId(next.length === 1 ? next[0] : 'ALL');
      return next;
    });
  };

  // Select only this class (Focus Mode)
  const handleSelectOnlyClass = (classId: string) => {
    setSelectedClassIds([classId]);
    setSelectedClassId(classId);
  };

  // Select all classes
  const handleSelectAllClasses = () => {
    const all = classes.map(c => c.id);
    setSelectedClassIds(all);
    setSelectedClassId('ALL');
  };

  // Target Classes for analysis
  const targetClasses = useMemo(() => {
    if (isAllClasses) return classes;
    return classes.filter(c => selectedClassIds.includes(c.id));
  }, [classes, selectedClassIds, isAllClasses]);

  // Filter Submissions by Exam and Class
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const matchExam = selectedExamId === 'ALL' || sub.examId === selectedExamId;
      const matchClass = isAllClasses || selectedClassIds.includes(sub.classId) ||
        (sub.className && targetClasses.some(tc => tc.name.trim().toLowerCase() === sub.className.trim().toLowerCase()));
      return matchExam && matchClass;
    });
  }, [submissions, selectedExamId, selectedClassIds, isAllClasses, targetClasses]);

  // Relevant Students Roster for the selected Class(es)
  const rosterStudents = useMemo(() => {
    return students.filter(s => {
      if (isAllClasses) return true;
      return selectedClassIds.includes(s.classId) ||
        (s.className && targetClasses.some(tc => tc.name.trim().toLowerCase() === s.className.trim().toLowerCase()));
    });
  }, [students, selectedClassIds, isAllClasses, targetClasses]);

  // Total Students Roster Count
  const totalRosterCount = useMemo(() => {
    if (rosterStudents.length > 0) return rosterStudents.length;
    return targetClasses.reduce((sum, c) => sum + (c.studentsCount || 0), 0) || 1;
  }, [rosterStudents, targetClasses]);

  // Determine Submitted Students vs Pending Students
  const { submittedList, pendingList } = useMemo(() => {
    // Map submissions by student ID or phone or normalized name
    const submittedSet = new Set<string>();
    const submittedItems: {
      submission: SubmissionItem;
      student?: StudentItem;
    }[] = [];

    filteredSubmissions.forEach(sub => {
      const key = sub.studentId || sub.studentPhone || sub.studentName.toLowerCase().trim();
      submittedSet.add(key);

      const matchedStudent = rosterStudents.find(
        s => (sub.studentId && s.studentId === sub.studentId) ||
             (sub.studentPhone && s.phone === sub.studentPhone) ||
             s.name.toLowerCase().trim() === sub.studentName.toLowerCase().trim()
      );

      submittedItems.push({
        submission: sub,
        student: matchedStudent,
      });
    });

    const pendingItems: StudentItem[] = rosterStudents.filter(s => {
      const byId = s.studentId && submittedSet.has(s.studentId);
      const byPhone = s.phone && submittedSet.has(s.phone);
      const byName = submittedSet.has(s.name.toLowerCase().trim());
      return !byId && !byPhone && !byName;
    });

    return {
      submittedList: submittedItems,
      pendingList: pendingItems,
    };
  }, [filteredSubmissions, rosterStudents]);

  // Real Metric Calculations
  const submittedCount = submittedList.length;
  const pendingCount = pendingList.length;
  const submissionRate = totalRosterCount > 0 ? ((submittedCount / totalRosterCount) * 100) : 0;

  const totalScore = filteredSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const avgScore = submittedCount > 0 ? (totalScore / submittedCount).toFixed(1) : null;

  // Filter lists by Search Term
  const filteredSubmittedList = useMemo(() => {
    if (!searchTerm.trim()) return submittedList;
    const term = searchTerm.toLowerCase();
    return submittedList.filter(item =>
      item.submission.studentName.toLowerCase().includes(term) ||
      (item.submission.studentId && item.submission.studentId.toLowerCase().includes(term)) ||
      (item.submission.studentPhone && item.submission.studentPhone.includes(term)) ||
      (item.student?.phone && item.student.phone.includes(term))
    );
  }, [submittedList, searchTerm]);

  const filteredPendingList = useMemo(() => {
    if (!searchTerm.trim()) return pendingList;
    const term = searchTerm.toLowerCase();
    return pendingList.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.studentId.toLowerCase().includes(term) ||
      (s.phone && s.phone.includes(term)) ||
      (s.parentPhone && s.parentPhone.includes(term))
    );
  }, [pendingList, searchTerm]);

  // Selected Exam title for reports
  const currentExamTitle = useMemo(() => {
    if (selectedExamId === 'ALL') return 'Tất cả bài tập & đề thi';
    const found = exams.find(e => e.id === selectedExamId);
    return found ? found.title : 'Bài kiểm tra được chọn';
  }, [exams, selectedExamId]);

  // Selected Class name for reports & headings
  const currentClassName = useMemo(() => {
    if (isAllClasses) return 'Tất cả các lớp';
    if (selectedClassIds.length === 1) {
      const found = classes.find(c => c.id === selectedClassIds[0]);
      return found ? found.name : 'Lớp được chọn';
    }
    const names = classes.filter(c => selectedClassIds.includes(c.id)).map(c => c.name);
    return `So sánh: ${names.join(' vs ')}`;
  }, [classes, selectedClassIds, isAllClasses]);

  // Export CSV Report with UTF-8 BOM
  const handleExportCsv = () => {
    const BOM = '\uFEFF';
    const exportTime = new Date().toLocaleString('vi-VN');

    let csvContent = `${BOM}BÁO CÁO KẾT QUẢ BÀI KIỂM TRA - TRỢ LÝ AI THẦY BÌNH\n`;
    csvContent += `Bài kiểm tra:,"${currentExamTitle}"\n`;
    csvContent += `Lớp học:,"${currentClassName}"\n`;
    csvContent += `Thời gian xuất:,"${exportTime}"\n`;
    csvContent += `Tổng số học sinh:,${totalRosterCount}\n`;
    csvContent += `Đã nộp bài:,${submittedCount}\n`;
    csvContent += `Chưa nộp bài:,${pendingCount}\n`;
    csvContent += `Tỷ lệ nộp bài:,${submissionRate.toFixed(1)}%\n`;
    csvContent += `Điểm trung bình:,${avgScore !== null ? avgScore + '/10' : 'Chưa có dữ liệu'}\n\n`;

    // Table Header
    csvContent += `STT,Mã Học Sinh,Họ Và Tên,Lớp,Số Điện Thoại 2FA,Trạng Thái,Điểm Số,Số Câu Đúng,Số Câu Sai,Thời Gian Nộp\n`;

    let stt = 1;
    // 1. Submitted students
    submittedList.forEach(item => {
      const sub = item.submission;
      const phone = sub.studentPhone || item.student?.phone || 'Chưa cập nhật';
      const wrongCount = sub.totalQuestions - sub.correctAnswersCount;
      csvContent += `${stt++},"${sub.studentId || ''}","${sub.studentName}","${sub.className}","${phone}","Đã nộp bài",${sub.score},${sub.correctAnswersCount}/${sub.totalQuestions},${wrongCount},"${sub.submittedAt}"\n`;
    });

    // 2. Pending students
    pendingList.forEach(s => {
      csvContent += `${stt++},"${s.studentId}","${s.name}","${s.className}","${s.phone || 'Chưa cập nhật'}","Chưa nộp bài","--","--","--","--"\n`;
    });

    // Create Download Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = currentExamTitle.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_') || 'KetQua';
    link.setAttribute('href', url);
    link.setAttribute('download', `KetQua_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Đã xuất file báo cáo kết quả ${safeName}.csv thành công!`);
  };

  const handleCopyReminder = (student: StudentItem) => {
    const text = `[Nhắc nhở học tập Thầy Bình] Chào em ${student.name} (${student.className}), em vui lòng vào làm bài "${currentExamTitle}" trên Cổng Học Sinh để hoàn thành đúng hạn nhé!`;
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép nội dung tin nhắn nhắc nhở em ${student.name}!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4" />
            <span>Phân tích kết quả thực tế & Trợ lý AI</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Thống kê tiến độ làm bài & Chẩn đoán điểm mù kiến thức
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu đối soát tự động từ bài thi trắc nghiệm của học sinh — Không sử dụng dữ liệu ảo
          </p>
        </div>

        {/* Global Export Button */}
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition self-start md:self-center cursor-pointer active:scale-98"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất kết quả bài làm (Excel / CSV)</span>
        </button>
      </div>

      {/* Dynamic Filters Bar: Exam Selector, Class Comparison Filter & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
          {/* Filter 1: Exam Selector */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-700 whitespace-nowrap">Bài kiểm tra:</span>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 max-w-[280px] truncate"
            >
              <option value="ALL">-- Tất cả bài tập & đề thi ({exams.length}) --</option>
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.grade})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm học sinh, SĐT, mã HS trong lớp..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Filter 2: Interactive Class Filter & Multi-Class Comparison Chips */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bộ lọc so sánh lớp:</span>
            </span>

            {/* Quick Action: Select All Classes */}
            <button
              type="button"
              onClick={handleSelectAllClasses}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                isAllClasses
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              Tất cả các lớp ({classes.length})
            </button>

            {/* Class Toggle Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {classes.map((cls, idx) => {
                const isSelected = selectedClassIds.includes(cls.id);
                const color = CLASS_COLORS[idx % CLASS_COLORS.length];

                return (
                  <div
                    key={cls.id}
                    onClick={() => handleToggleClass(cls.id)}
                    className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer select-none active:scale-95 ${
                      isSelected
                        ? `${color.bg} ${color.text} ${color.border} ring-1 ring-current shadow-2xs`
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'
                    }`}
                    title={isSelected ? `Bỏ ${cls.name} khỏi so sánh` : `Thêm ${cls.name} vào so sánh trên biểu đồ`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${isSelected ? '' : 'opacity-40'}`}
                      style={{ backgroundColor: color.stroke }}
                    />
                    <span>{cls.name}</span>
                    {isSelected ? (
                      <Check className="w-3 h-3 text-current" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">({cls.studentsCount || 0})</span>
                    )}

                    {/* Quick Solo button on hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectOnlyClass(cls.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[10px] bg-white/90 hover:bg-white text-slate-700 px-1 py-0.2 rounded shadow-2xs transition cursor-pointer ml-0.5"
                      title={`Chỉ xem một mình ${cls.name}`}
                    >
                      Chỉ xem
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Comparison Status Indicator */}
          <div className="text-[11px] font-bold text-slate-500 whitespace-nowrap self-end sm:self-auto">
            {isAllClasses ? (
              <span className="text-indigo-600">Đang hiển thị toàn trường ({classes.length} lớp)</span>
            ) : selectedClassIds.length > 1 ? (
              <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đang so sánh đối đầu {selectedClassIds.length} lớp</span>
              </span>
            ) : (
              <span className="text-blue-700">Chỉ xem: {currentClassName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Real Statistics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students in Scope */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Tổng sĩ số lớp</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalRosterCount}</span>
            <span className="text-xs text-slate-500 font-medium">học sinh</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Theo danh sách quản lý {currentClassName}
          </div>
        </div>

        {/* Card 2: Submitted Count & Real Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Đã làm bài</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{submittedCount}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {submissionRate.toFixed(1)}%
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {submittedCount} / {totalRosterCount} học sinh đã bấm nộp bài
          </div>
        </div>

        {/* Card 3: Pending Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Chưa làm bài</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              {totalRosterCount > 0 ? ((pendingCount / totalRosterCount) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Cần nhắc nhở qua SĐT / Zalo
          </div>
        </div>

        {/* Card 4: Real Average Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Điểm trung bình</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            {avgScore !== null ? (
              <>
                <span className="text-2xl font-black text-indigo-700">{avgScore}</span>
                <span className="text-xs text-slate-500 font-bold">/ 10</span>
              </>
            ) : (
              <span className="text-lg font-bold text-slate-400">Chưa có dữ liệu</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            {submittedCount > 0
              ? `Tính từ ${submittedCount} lượt nộp thực tế`
              : 'Chưa có lượt nộp bài để tính điểm'}
          </div>
        </div>
      </div>

      {/* Visual Analytics: Score Trend Charts & Performance Distribution (Recharts) */}
      <ClassScoreTrendChart
        classes={classes}
        exams={exams}
        students={students}
        submissions={submissions}
        selectedClassIds={selectedClassIds}
        onSelectClassIds={(newIds) => {
          setSelectedClassIds(newIds);
          setSelectedClassId(newIds.length === 1 ? newIds[0] : 'ALL');
        }}
        selectedClassId={selectedClassId}
        onSelectClass={(clsId) => {
          setSelectedClassId(clsId);
          setSelectedClassIds(clsId === 'ALL' ? classes.map(c => c.id) : [clsId]);
        }}
      />

      {/* Real Class-by-Class Progress Breakdown (Replacing Hardcoded Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Class Progress Real */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-800">
              Tỷ lệ hoàn thành nhiệm vụ theo từng lớp
            </h3>
            <span className="text-[11px] text-slate-400">Dữ liệu thực tế</span>
          </div>

          {classes.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Chưa có dữ liệu lớp học để hiển thị thống kê.
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map(c => {
                const classSubs = filteredSubmissions.filter(s => s.classId === c.id);
                const classStudents = students.filter(s => s.classId === c.id);
                const totalInClass = c.studentsCount || classStudents.length || 1;
                const doneCount = classSubs.length;
                const percent = Number(((doneCount / totalInClass) * 100).toFixed(1));

                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">
                        {c.name} <span className="font-mono text-slate-400 font-normal">(PIN: {c.pin})</span>
                      </span>
                      <span className={`font-bold ${percent > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {doneCount}/{totalInClass} học sinh ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent > 0 ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real Class Average Score */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-800">
              Điểm trung bình bài nộp theo lớp
            </h3>
            <span className="text-[11px] text-slate-400">Thang điểm 10</span>
          </div>

          {classes.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Chưa có dữ liệu lớp học để hiển thị thống kê.
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map(c => {
                const classSubs = filteredSubmissions.filter(s => s.classId === c.id);
                const classAvg = classSubs.length > 0
                  ? (classSubs.reduce((sum, s) => sum + s.score, 0) / classSubs.length).toFixed(1)
                  : null;

                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">{c.name}</span>
                      {classAvg !== null ? (
                        <span className="font-bold text-indigo-700">
                          {classAvg} / 10 ({Number(classAvg) >= 8 ? 'Giỏi' : Number(classAvg) >= 6.5 ? 'Khá' : 'TB'})
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Chưa có dữ liệu</span>
                      )}
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          classAvg !== null ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                        style={{ width: classAvg !== null ? `${Math.min(Number(classAvg) * 10, 100)}%` : '0%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Table: 2 Tabs [Đã làm bài] & [Chưa làm bài] */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Header & Tabs */}
        <div className="p-4 px-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('submitted')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'submitted'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Đã làm bài ({filteredSubmittedList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <UserX className="w-4 h-4" />
              <span>Chưa làm bài ({filteredPendingList.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white border border-slate-200 hover:border-emerald-300 px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {activeTab === 'submitted' ? (
            /* Tab 1: Submitted Students Table */
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4 w-12 text-center">STT</th>
                  <th className="p-4">Học sinh</th>
                  <th className="p-4">Lớp</th>
                  <th className="p-4">SĐT Học sinh (2FA)</th>
                  <th className="p-4">Thời gian nộp</th>
                  <th className="p-4 text-center">Điểm số</th>
                  <th className="p-4 text-center">Đúng / Tổng</th>
                  <th className="p-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmittedList.map((item, idx) => {
                  const sub = item.submission;
                  const phone = sub.studentPhone || item.student?.phone || 'Chưa cập nhật';

                  return (
                    <tr key={sub.id || idx} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 text-center font-mono text-slate-400 font-semibold">
                        {idx + 1}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                            {sub.studentName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{sub.studentName}</div>
                            {sub.studentId && (
                              <div className="text-[10px] text-slate-400 font-mono">{sub.studentId}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-slate-700">
                        {sub.className}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md w-fit">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{phone}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{sub.submittedAt}</span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`inline-block font-extrabold text-sm px-2.5 py-1 rounded-lg ${
                          sub.score >= 8.5
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.score >= 7.0
                            ? 'bg-blue-100 text-blue-800'
                            : sub.score >= 5.0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {sub.score.toFixed(1)} / 10
                        </span>
                      </td>

                      <td className="p-4 text-center font-bold text-slate-700">
                        <span className="text-emerald-600">{sub.correctAnswersCount}</span> / {sub.totalQuestions} đúng
                        <span className="block text-[10px] text-slate-400 font-normal">
                          ({sub.totalQuestions - sub.correctAnswersCount} câu sai)
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedSubmissionForDetail(sub)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem chi tiết bài làm</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredSubmittedList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-400 text-xs">
                      Chưa có học sinh nào nộp bài cho tiêu chí đang chọn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            /* Tab 2: Pending Students Table */
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4 w-12 text-center">STT</th>
                  <th className="p-4">Học sinh</th>
                  <th className="p-4">Mã số HS</th>
                  <th className="p-4">Lớp trực thuộc</th>
                  <th className="p-4">Số điện thoại 2FA</th>
                  <th className="p-4">SĐT Phụ huynh</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Hành động nhắc nhở</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPendingList.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 text-center font-mono text-slate-400 font-semibold">
                      {idx + 1}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <div className="font-bold text-slate-800 text-sm">{student.name}</div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-500 font-semibold">
                      {student.studentId}
                    </td>

                    <td className="p-4 font-semibold text-slate-700">
                      {student.className}
                    </td>

                    <td className="p-4">
                      {student.phone && student.phone !== 'Chưa cập nhật' ? (
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{student.phone}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          Chưa cập nhật
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-500">
                      {student.parentPhone || 'Chưa cập nhật'}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Chưa tham gia làm bài
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleCopyReminder(student)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Nhắc nhở qua SĐT</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredPendingList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-emerald-600 text-xs font-bold">
                      Tuyệt vời! Toàn bộ học sinh trong danh sách đã hoàn thành bài tập.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Personalized AI Exam Diagnostics: Phân tích cá nhân hóa theo từng đối tượng học sinh dựa trên kết quả mỗi đề thi */}
      <PersonalizedExamDiagnosticSection
        exams={exams}
        classes={classes}
        students={students}
        submissions={submissions}
        selectedExamId={selectedExamId}
        selectedClassId={selectedClassId}
        onOpenAiModalWithTopic={onOpenAiModalWithTopic}
        onViewSubmissionDetail={(sub) => setSelectedSubmissionForDetail(sub)}
        onShowToast={(msg) => showToast(msg)}
      />

      {/* Modal: Submission Detail & AI Diagnostic */}
      {selectedSubmissionForDetail && (
        <SubmissionDetailModal
          submission={selectedSubmissionForDetail}
          exam={exams.find(e => e.id === selectedSubmissionForDetail.examId)}
          student={students.find(s => s.name === selectedSubmissionForDetail.studentName)}
          onClose={() => setSelectedSubmissionForDetail(null)}
          onSendFeedback={(sub) => {
            showToast(`Đã gửi nhận xét chi tiết bài làm của ${sub.studentName} tới phụ huynh!`);
          }}
        />
      )}

    </div>
  );
};
