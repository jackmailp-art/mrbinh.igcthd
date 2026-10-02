import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Search,
  Sparkles,
  Clock,
  Send,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Download,
  Trash2,
  Users,
  Printer,
  X,
  AlertTriangle,
  FolderOpen,
  BookOpen,
  Filter,
  Check,
  FileDown,
  CheckSquare,
  Square,
  Cloud,
  HardDrive,
  Upload,
  RefreshCw,
  Shuffle,
  RotateCcw,
  Edit,
  LayoutGrid,
  List,
  Plus,
  ChevronDown,
  Tag,
  Save,
  GraduationCap,
  FileSpreadsheet
} from 'lucide-react';
import { ExamItem, ExamQuestion } from '../types';
import { exportExamToWord, printExamSheet, exportExamToJson } from '../utils/exportExamDocs';
import {
  toggleShuffleQuestionOrder,
  toggleShuffleAnswerOptions,
  reshuffleExam,
  resetExamShuffle
} from '../services/examService';
import { ExamShufflerModal } from './ExamShufflerModal';

interface ExamsViewProps {
  exams: ExamItem[];
  onOpenAiModal: () => void;
  onOpenManualModal?: () => void;
  onPreviewExam: (exam: ExamItem) => void;
  onAssignExam: (exam: ExamItem) => void;
  onDeleteExam?: (examId: string) => void;
  onRestoreExams?: (importedExams: ExamItem[]) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info') => void;
  onUpdateExam?: (exam: ExamItem) => void;
  onViewExamResults?: (exam: ExamItem) => void;
}

type GradeTab = 'ALL' | '10' | '11' | '12' | 'THPT' | 'THCS';
type SemesterFilter = 'ALL' | 'HK1' | 'HK2';
type ExamTypeFilter = 'ALL' | '15p' | '1tiet' | 'giuaky' | 'cuoiky' | 'thpt';
type ViewMode = 'table' | 'cards';

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  onOpenAiModal,
  onOpenManualModal,
  onPreviewExam,
  onAssignExam,
  onDeleteExam,
  onRestoreExams,
  onShowToast,
  onUpdateExam,
  onViewExamResults
}) => {
  // View & Filter States
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<GradeTab>('ALL');
  const [semesterFilter, setSemesterFilter] = useState<SemesterFilter>('ALL');
  const [examTypeFilter, setExamTypeFilter] = useState<ExamTypeFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Đang mở' | 'Đã đóng'>('ALL');
  const [sortBy, setSortBy] = useState<'order' | 'grade' | 'questions' | 'submissions'>('order');
  const [selectedExamIds, setSelectedExamIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState<boolean>(false);

  // Popover & Modal States
  const [activeShufflePopoverExamId, setActiveShufflePopoverExamId] = useState<string | null>(null);
  const [examToShuffle, setExamToShuffle] = useState<ExamItem | null>(null);
  const [examToDelete, setExamToDelete] = useState<ExamItem | null>(null);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState<boolean>(false);
  const [examToExport, setExamToExport] = useState<ExamItem | null>(null);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    grade: string;
    duration: string;
    topic: string;
    difficulty: string;
    status: 'Đang mở' | 'Đã đóng';
  }>({
    title: '',
    grade: '',
    duration: '',
    topic: '',
    difficulty: 'Trung bình',
    status: 'Đang mở'
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cloud & Google Drive Persistence Handlers
  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    try {
      localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(exams));
      localStorage.setItem('eng_exams_v1', JSON.stringify(exams));
      const res = await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exams })
      });
      if (res.ok) {
        if (onShowToast) onShowToast('Đã đồng bộ thành công toàn bộ kho đề lên máy chủ đám mây!', 'success');
      }
    } catch {
      if (onShowToast) onShowToast('Đã lưu trữ an toàn trong bộ nhớ máy tính!', 'info');
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  const handleExportAllToGoogleDrive = () => {
    try {
      const payload = {
        backupSource: "EduAdmin AI Exam Studio",
        backupType: "Google_Drive_Cloud_Backup_Package",
        curriculum: "Global Success GDPT 2018",
        listeningAccent: "UK Female (British English)",
        syncedAt: new Date().toISOString(),
        totalExams: exams.length,
        exams: exams
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GoogleDrive_KhoDe_GlobalSuccess_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      if (onShowToast) onShowToast(`Đã tải xuống gói ${exams.length} đề thi sẵn sàng lưu giữ lên Google Drive!`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportSingleExamToGoogleDrive = (exam: ExamItem) => {
    try {
      const payload = {
        backupSource: "EduAdmin AI Exam Studio",
        targetCloud: "Google Drive",
        syncedAt: new Date().toISOString(),
        examId: exam.id,
        title: exam.title,
        grade: exam.grade,
        curriculum: "Global Success",
        listeningAccent: "UK Female",
        examData: exam
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = exam.title.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_').slice(0, 30);
      a.href = url;
      a.download = `GoogleDrive_${exam.grade}_${safeName}.json`;
      a.click();
      URL.revokeObjectURL(url);
      if (onShowToast) onShowToast(`Đã xuất tệp Google Drive cho "${exam.title}"!`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportFromJsonFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const importedExams: ExamItem[] = Array.isArray(parsed)
          ? parsed
          : (parsed.exams || (parsed.exam ? [parsed.exam] : (parsed.examData ? [parsed.examData] : [])));

        if (importedExams && importedExams.length > 0) {
          const merged = [...importedExams, ...exams.filter(ex => !importedExams.some(ie => ie.id === ex.id))];
          localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(merged));
          localStorage.setItem('eng_exams_v1', JSON.stringify(merged));
          fetch('/api/db/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exams: merged })
          }).catch(() => {});
          if (onRestoreExams) {
            onRestoreExams(merged);
          }
          if (onShowToast) onShowToast(`Đã khôi phục & nhập thành công ${importedExams.length} đề thi vào hệ thống!`, 'success');
        }
      } catch (err) {
        if (onShowToast) onShowToast('Tệp không đúng định dạng sao lưu đề thi JSON!', 'info');
      }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = '';
  };

  // Helper to determine exam semester
  const getExamSemesterLabel = (exam: ExamItem): 'Học kỳ 1' | 'Học kỳ 2' => {
    const t = (exam.title || '').toLowerCase();
    const top = (exam.topic || '').toLowerCase();
    const full = `${t} ${top}`;
    if (
      full.includes('kỳ 2') ||
      full.includes('kì 2') ||
      full.includes('hk2') ||
      full.includes('học kì ii') ||
      full.includes('học kỳ ii') ||
      full.includes('unit 6') ||
      full.includes('unit 7') ||
      full.includes('unit 8') ||
      full.includes('unit 9') ||
      full.includes('unit 10')
    ) {
      return 'Học kỳ 2';
    }
    return 'Học kỳ 1';
  };

  // Helper to determine exam type
  const getExamTypeLabel = (exam: ExamItem): string => {
    const t = (exam.title || '').toLowerCase();
    const d = (exam.duration || '').toLowerCase();
    const g = (exam.grade || '').toLowerCase();

    if (t.includes('tốt nghiệp') || t.includes('thpt') || g.includes('tốt nghiệp') || g.includes('thpt')) {
      return 'Ôn thi tốt nghiệp';
    }
    if (t.includes('giữa kỳ') || t.includes('giữa kì') || t.includes('midterm') || t.includes('khảo sát')) {
      return 'Giữa kỳ';
    }
    if (t.includes('cuối kỳ') || t.includes('cuối kì') || t.includes('học kỳ') || t.includes('final')) {
      return 'Cuối kỳ';
    }
    if (t.includes('15') || d.includes('15') || d.includes('20') || t.includes('ôn tập') || t.includes('nhanh')) {
      return '15 phút';
    }
    if (t.includes('1 tiết') || d.includes('45') || d.includes('50') || d.includes('30') || t.includes('chuyên đề')) {
      return '1 tiết';
    }
    return '1 tiết';
  };

  // Helper matching functions for filters
  const checkGradeMatch = (e: ExamItem, g: GradeTab): boolean => {
    if (g === 'ALL') return true;
    const eg = (e.grade || '').toLowerCase();
    const et = (e.title || '').toLowerCase();
    if (g === '10') return eg.includes('10') || et.includes('lớp 10') || et.includes('khối 10');
    if (g === '11') return eg.includes('11') || et.includes('lớp 11') || et.includes('khối 11');
    if (g === '12') return (eg.includes('12') || et.includes('lớp 12') || et.includes('khối 12')) && !et.includes('tốt nghiệp') && !eg.includes('tốt nghiệp');
    if (g === 'THPT') return eg.includes('tốt nghiệp') || et.includes('tốt nghiệp') || et.includes('thpt') || eg.includes('thpt');
    if (g === 'THCS') return eg.includes('thcs') || eg.includes('lớp 6') || eg.includes('lớp 7') || eg.includes('lớp 8') || eg.includes('lớp 9') || et.includes('thcs');
    return true;
  };

  const checkSemesterMatch = (e: ExamItem, s: SemesterFilter): boolean => {
    if (s === 'ALL') return true;
    const sem = getExamSemesterLabel(e);
    if (s === 'HK1') return sem === 'Học kỳ 1';
    if (s === 'HK2') return sem === 'Học kỳ 2';
    return true;
  };

  const checkTypeMatch = (e: ExamItem, tp: ExamTypeFilter): boolean => {
    if (tp === 'ALL') return true;
    const tLab = getExamTypeLabel(e);
    if (tp === '15p') return tLab === '15 phút';
    if (tp === '1tiet') return tLab === '1 tiết';
    if (tp === 'giuaky') return tLab === 'Giữa kỳ';
    if (tp === 'cuoiky') return tLab === 'Cuối kỳ';
    if (tp === 'thpt') return tLab === 'Ôn thi tốt nghiệp';
    return true;
  };

  // Filter exams based on grade tabs, semester, exam type, status, and search
  const filteredExams = useMemo(() => {
    const list = exams.filter(e => {
      const matchGrade = checkGradeMatch(e, activeTab);
      const matchSemester = checkSemesterMatch(e, semesterFilter);
      const matchType = checkTypeMatch(e, examTypeFilter);

      const t = (e.title || '').toLowerCase();
      const matchSearch =
        t.includes(searchTerm.toLowerCase()) ||
        (e.topic && e.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.grade && e.grade.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.difficulty && e.difficulty.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;

      return matchGrade && matchSemester && matchType && matchSearch && matchStatus;
    });

    if (sortBy === 'grade') {
      return [...list].sort((a, b) => (a.grade || '').localeCompare(b.grade || ''));
    }
    if (sortBy === 'questions') {
      return [...list].sort((a, b) => (b.questionsCount || b.questions?.length || 0) - (a.questionsCount || a.questions?.length || 0));
    }
    if (sortBy === 'submissions') {
      return [...list].sort((a, b) => (b.submissions || 0) - (a.submissions || 0));
    }
    return list;
  }, [exams, activeTab, semesterFilter, examTypeFilter, searchTerm, statusFilter, sortBy]);

  // Tab & Quick Filter counts
  const filterCounts = useMemo(() => {
    return {
      grade: {
        ALL: exams.length,
        '10': exams.filter(e => checkGradeMatch(e, '10')).length,
        '11': exams.filter(e => checkGradeMatch(e, '11')).length,
        '12': exams.filter(e => checkGradeMatch(e, '12')).length,
        THPT: exams.filter(e => checkGradeMatch(e, 'THPT')).length,
      },
      semester: {
        ALL: exams.length,
        HK1: exams.filter(e => checkSemesterMatch(e, 'HK1')).length,
        HK2: exams.filter(e => checkSemesterMatch(e, 'HK2')).length,
      },
      examType: {
        ALL: exams.length,
        '15p': exams.filter(e => checkTypeMatch(e, '15p')).length,
        '1tiet': exams.filter(e => checkTypeMatch(e, '1tiet')).length,
        giuaky: exams.filter(e => checkTypeMatch(e, 'giuaky')).length,
        cuoiky: exams.filter(e => checkTypeMatch(e, 'cuoiky')).length,
        thpt: exams.filter(e => checkTypeMatch(e, 'thpt')).length,
      }
    };
  }, [exams]);

  // Selection toggle
  const toggleSelectExam = (id: string) => {
    setSelectedExamIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedExamIds.size === filteredExams.length) {
      setSelectedExamIds(new Set());
    } else {
      setSelectedExamIds(new Set(filteredExams.map(e => e.id)));
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (exam: ExamItem) => {
    setEditingExam(exam);
    setEditForm({
      title: exam.title || '',
      grade: exam.grade || 'Lớp 10',
      duration: exam.duration || '45 phút',
      topic: exam.topic || '',
      difficulty: exam.difficulty || 'Trung bình',
      status: exam.status || 'Đang mở'
    });
  };

  // Save Edit Changes
  const handleSaveEdit = () => {
    if (!editingExam) return;
    const updated: ExamItem = {
      ...editingExam,
      title: editForm.title.trim() || editingExam.title,
      grade: editForm.grade,
      duration: editForm.duration,
      topic: editForm.topic.trim(),
      difficulty: editForm.difficulty,
      status: editForm.status
    };

    if (onUpdateExam) {
      onUpdateExam(updated);
    }

    // Persist to local storage
    try {
      const updatedList = exams.map(e => e.id === updated.id ? updated : e);
      localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(updatedList));
      localStorage.setItem('eng_exams_v1', JSON.stringify(updatedList));
    } catch {}

    if (onShowToast) onShowToast(`Đã cập nhật thông tin đề thi "${updated.title}"!`, 'success');
    setEditingExam(null);
  };

  // Handle Save 4 Shuffled Versions to Bank
  const handleSaveShuffledVersions = (versions: ExamItem[]) => {
    if (onRestoreExams) {
      onRestoreExams([...versions, ...exams]);
    }
    versions.forEach(v => {
      if (onUpdateExam) onUpdateExam(v);
    });
    try {
      const bankStr = localStorage.getItem('EDUADMIN_EXAM_BANK');
      let bank: ExamItem[] = bankStr ? JSON.parse(bankStr) : [];
      versions.forEach((newV) => {
        bank = bank.filter((e) => e.id !== newV.id);
        bank.unshift(newV);
      });
      localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(bank));
      localStorage.setItem('eng_exams_v1', JSON.stringify(bank));
    } catch {}

    if (onShowToast) {
      onShowToast(`Đã lưu thành công ${versions.length} mã đề hoán vị vào kho đề thi!`, 'success');
    }
  };

  // Handle confirm delete single exam
  const handleConfirmDelete = () => {
    if (!examToDelete) return;

    if (onDeleteExam) {
      onDeleteExam(examToDelete.id);
    } else {
      const updated = exams.filter(e => e.id !== examToDelete.id);
      try {
        localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(updated));
        localStorage.setItem('eng_exams_v1', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      if (onShowToast) onShowToast('Đã xóa vĩnh viễn đề thi khỏi bộ nhớ & hệ thống!', 'info');
    }

    setSelectedExamIds(prev => {
      const next = new Set(prev);
      next.delete(examToDelete.id);
      return next;
    });
    setExamToDelete(null);
  };

  // Handle confirm batch delete
  const handleConfirmBatchDelete = () => {
    if (selectedExamIds.size === 0) return;

    selectedExamIds.forEach(id => {
      if (onDeleteExam) {
        onDeleteExam(id);
      }
    });

    if (onShowToast) {
      onShowToast(`Đã xóa ${selectedExamIds.size} đề thi đã chọn vĩnh viễn khỏi bộ nhớ!`, 'info');
    }

    setSelectedExamIds(new Set());
    setShowBatchDeleteModal(false);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Banner - Kho Bài Tập & Đề Thi */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-wider mb-1.5">
            <FolderOpen className="w-4 h-4 text-indigo-600" />
            <span className="bg-indigo-100 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-full text-[10px] font-black">
              TÀI NGUYÊN / NGÂN HÀNG ĐỀ
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Kho Bài Tập & Đề Thi</span>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {filteredExams.length} / {exams.length} bộ đề
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed font-normal">
            Lưu trữ, phân loại đề kiểm tra, ngân hàng câu hỏi và bài tập theo khối lớp, bài học.
          </p>
        </div>

        {/* Action Toolbar & Nút Tạo mới / Thêm đề */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {/* View Mode Toggle: Table or Cards */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Hiển thị dạng bảng (Table)"
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Dạng bảng</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Hiển thị dạng thẻ (Cards)"
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Dạng thẻ</span>
            </button>
          </div>

          {/* Cloud Sync Button */}
          <button
            type="button"
            onClick={handleSyncToCloud}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 transition active:scale-95 cursor-pointer disabled:opacity-60"
            title="Đồng bộ lưu giữ kho đề thi lên máy chủ đám mây"
          >
            <Cloud className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}</span>
          </button>

          {/* Google Drive Package Export */}
          <button
            type="button"
            onClick={handleExportAllToGoogleDrive}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold px-3 py-2 rounded-xl border border-amber-300 transition active:scale-95 cursor-pointer"
            title="Lưu giữ toàn bộ ngân hàng đề thi sẵn sàng tải lên Google Drive dạng gói JSON"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden lg:inline">Sao lưu Drive</span>
          </button>

          {/* Exam Shuffler Button */}
          <button
            type="button"
            onClick={() => {
              const targetExam = selectedExamIds.size > 0 
                ? exams.find(e => selectedExamIds.has(e.id)) || exams[0]
                : exams[0];
              if (targetExam) {
                setExamToShuffle(targetExam);
              } else if (onShowToast) {
                onShowToast('Kho đề thi hiện đang trống, vui lòng tạo đề trước!', 'info');
              }
            }}
            className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold px-3 py-2 rounded-xl border border-purple-300 transition active:scale-95 cursor-pointer shadow-2xs"
            title="Trộn đề thi hoán vị câu hỏi và phương án A-D thành 4 mã đề độc lập"
          >
            <Shuffle className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden lg:inline">Trộn 4 Mã Đề</span>
          </button>

          {/* Hidden File Input for Backup Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFromJsonFile}
            className="hidden"
          />

          {/* NÚT TẠO MỚI / THÊM ĐỀ NHANH (Requirement 2) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>+ Tạo mới / Thêm đề</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {showCreateDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-40 text-left animate-in fade-in slide-in-from-top-2 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateDropdown(false);
                    onOpenAiModal();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-blue-50 text-left transition flex items-center gap-2.5 text-slate-800 hover:text-blue-700 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold">Tạo đề bằng AI</div>
                    <div className="text-[10px] text-slate-500 font-normal">Sinh ma trận & đề chuẩn Bộ</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateDropdown(false);
                    if (onOpenManualModal) onOpenManualModal();
                    else onOpenAiModal();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-emerald-50 text-left transition flex items-center gap-2.5 text-slate-800 hover:text-emerald-700 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                    <FileDown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold">Tạo thủ công / Nhập file</div>
                    <div className="text-[10px] text-slate-500 font-normal">Tải file Word, PDF hoặc Excel</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. BỘ LỌC NHANH ĐỀ THI (Quick Filters: Khối lớp 10-11-12, Học kỳ 1-2, Loại đề) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Header of Quick Filter Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Bộ lọc nhanh đề thi
                </h3>
                <span className="text-[11px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                  {filteredExams.length} / {exams.length} bộ đề
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal">
                Lọc nhanh một chạm theo Khối lớp, Học kỳ và Loại đề kiểm tra
              </p>
            </div>
          </div>

          {/* Reset button when filters are active */}
          {(activeTab !== 'ALL' || semesterFilter !== 'ALL' || examTypeFilter !== 'ALL' || searchTerm !== '' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('ALL');
                setSemesterFilter('ALL');
                setExamTypeFilter('ALL');
                setSearchTerm('');
                setStatusFilter('ALL');
                setSelectedExamIds(new Set());
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition cursor-pointer active:scale-95 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>

        {/* BỘ LỌC 1: KHỐI LỚP (10, 11, 12, ÔN THI TỐT NGHIỆP) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
          <div className="w-24 shrink-0 font-bold text-slate-700 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Khối lớp:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: 'Tất cả khối' },
              { id: '10', label: 'Lớp 10' },
              { id: '11', label: 'Lớp 11' },
              { id: '12', label: 'Lớp 12' },
              { id: 'THPT', label: 'Ôn thi tốt nghiệp' },
            ].map((item) => {
              const isActive = activeTab === item.id;
              const count = filterCounts.grade[item.id as keyof typeof filterCounts.grade] ?? 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id as GradeTab);
                    setSelectedExamIds(new Set());
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BỘ LỌC 2: HỌC KỲ (HỌC KỲ 1, HỌC KỲ 2) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
          <div className="w-24 shrink-0 font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Học kỳ:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: 'Tất cả học kỳ' },
              { id: 'HK1', label: 'Học kỳ 1 (Unit 1 - 5)' },
              { id: 'HK2', label: 'Học kỳ 2 (Unit 6 - 10)' },
            ].map((item) => {
              const isActive = semesterFilter === item.id;
              const count = filterCounts.semester[item.id as keyof typeof filterCounts.semester] ?? 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSemesterFilter(item.id as SemesterFilter);
                    setSelectedExamIds(new Set());
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BỘ LỌC 3: LOẠI ĐỀ (15 PHÚT, 1 TIẾT, GIỮA KỲ, CUỐI KỲ, ÔN THI TỐT NGHIỆP) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
          <div className="w-24 shrink-0 font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Loại đề:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: 'Tất cả loại đề' },
              { id: '15p', label: '15 phút' },
              { id: '1tiet', label: '1 tiết' },
              { id: 'giuaky', label: 'Giữa kỳ' },
              { id: 'cuoiky', label: 'Cuối kỳ' },
              { id: 'thpt', label: 'Ôn thi tốt nghiệp' },
            ].map((item) => {
              const isActive = examTypeFilter === item.id;
              const count = filterCounts.examType[item.id as keyof typeof filterCounts.examType] ?? 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setExamTypeFilter(item.id as ExamTypeFilter);
                    setSelectedExamIds(new Set());
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thanh tìm kiếm & Tùy chọn sắp xếp */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên đề thi, chuyên đề Global Success, bài học, ngữ pháp..."
              className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-xs"
              >
                <option value="ALL">Tất cả</option>
                <option value="Đang mở">Đang mở</option>
                <option value="Đã đóng">Đã đóng</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-xs"
              >
                <option value="order">Thứ tự Đề số</option>
                <option value="grade">Theo Khối lớp</option>
                <option value="questions">Số câu hỏi</option>
                <option value="submissions">Lượt nộp bài</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Batch Actions Bar (When items are selected) */}
      {selectedExamIds.size > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 px-5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
              {selectedExamIds.size}
            </div>
            <span className="text-xs font-bold text-rose-950">
              Đã chọn {selectedExamIds.size} bộ đề thi
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBatchDeleteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa khỏi bộ nhớ ({selectedExamIds.size})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedExamIds(new Set())}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer transition"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Content: DẠNG BẢNG (TABLE) hoặc DẠNG THẺ (CARDS) */}
      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400 space-y-3 shadow-xs">
          <FileText className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">
            Không tìm thấy bộ đề thi nào phù hợp với bộ lọc hiện tại.
          </p>
          <button
            onClick={() => {
              setActiveTab('ALL');
              setSemesterFilter('ALL');
              setExamTypeFilter('ALL');
              setSearchTerm('');
              setStatusFilter('ALL');
            }}
            className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
          >
            Đặt lại toàn bộ bộ lọc
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ================= DẠNG BẢNG (TABLE VIEW) ================= */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider items-center">
            <div className="col-span-5 flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                title={selectedExamIds.size === filteredExams.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              >
                {selectedExamIds.size === filteredExams.length && filteredExams.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <span>STT & Tên đề thi</span>
            </div>
            <div className="col-span-2">Thông số đề</div>
            <div className="col-span-2">Tiến độ nộp bài</div>
            <div className="col-span-1">Trạng thái</div>
            <div className="col-span-2 text-right">Thao tác nhanh</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredExams.map((exam, index) => {
              const examOrderNumber = String(index + 1).padStart(2, '0');
              const questionsCount = exam.questionsCount || exam.questions?.length || 0;
              const submissions = exam.submissions || 0;
              const avgScore = exam.avgScore || 0;
              const isSelected = selectedExamIds.has(exam.id);
              const typeLabel = getExamTypeLabel(exam);
              const semLabel = getExamSemesterLabel(exam);

              return (
                <div
                  key={exam.id}
                  className={`p-5 lg:px-6 hover:bg-slate-50/70 transition flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:items-center ${
                    isSelected ? 'bg-blue-50/40' : ''
                  }`}
                >
                  {/* Cột 1: STT Đề số & Tên & Chuyên đề & Tags */}
                  <div className="lg:col-span-5 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => toggleSelectExam(exam.id)}
                        className="text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                        title={isSelected ? 'Bỏ chọn đề này' : 'Chọn đề này'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-700 text-white font-black text-xs shadow-xs tracking-wide shrink-0">
                        Đề {examOrderNumber}
                      </span>

                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                        {exam.grade || 'Lớp 10'}
                      </span>

                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        {semLabel}
                      </span>

                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                        {typeLabel}
                      </span>

                      <span className="text-[10px] font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200/80">
                        Global Success
                      </span>

                      {exam.difficulty && (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {exam.difficulty}
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => {
                        const isAssigned = (exam.assignedClasses && exam.assignedClasses.length > 0) || (exam.assignedClassIds && exam.assignedClassIds.length > 0) || exam.submissions > 0;
                        if (isAssigned && onViewExamResults) {
                          onViewExamResults(exam);
                        } else {
                          onPreviewExam(exam);
                        }
                      }}
                      className="font-bold text-sm text-slate-900 hover:text-blue-600 transition cursor-pointer leading-snug line-clamp-2"
                      title={exam.title}
                    >
                      {exam.title}
                    </h3>

                    {exam.topic && (
                      <p className="text-xs text-slate-500 line-clamp-1 italic">
                        Chuyên đề: {exam.topic}
                      </p>
                    )}

                    {/* Active Shuffle Badges */}
                    {(exam.shuffleQuestions || exam.shuffleOptions) && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {exam.shuffleQuestions && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                            <Shuffle className="w-2.5 h-2.5 text-emerald-700" />
                            <span>Đảo câu: BẬT</span>
                          </span>
                        )}
                        {exam.shuffleOptions && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-300">
                            <Shuffle className="w-2.5 h-2.5 text-purple-700" />
                            <span>Đảo A-D: BẬT</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Assigned class notice - Clickable to view results */}
                    {exam.assignedClasses && exam.assignedClasses.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewExamResults) onViewExamResults(exam);
                        }}
                        className="text-[11px] text-blue-700 bg-blue-50/80 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200/80 inline-flex items-center gap-1.5 cursor-pointer transition shadow-2xs group/tag"
                        title="Bấm để xem danh sách học sinh từng lớp, bài làm & Xuất Excel"
                      >
                        <Users className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>Đã giao: <strong>{exam.assignedClasses.join(', ')}</strong></span>
                        <span className="text-[10px] bg-blue-600 group-hover/tag:bg-blue-700 text-white font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5 ml-1">
                          <FileSpreadsheet className="w-2.5 h-2.5" />
                          <span>DS Lớp & Excel</span>
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Cột 2: Thông số (Số câu, Thời gian, Ngày tạo) */}
                  <div className="lg:col-span-2 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-800">{questionsCount} câu hỏi</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{exam.duration || '45 phút'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>{exam.createdAt || '20/09/2026'}</span>
                    </div>
                  </div>

                  {/* Cột 3: Tiến độ (Lượt nộp bài, Điểm TB) */}
                  <div className="lg:col-span-2 text-xs space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-900">{submissions} lượt nộp</span>
                    </div>
                    {avgScore > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-bold text-blue-700">{avgScore.toFixed(1)} / 10đ TB</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Chưa có bài nộp</span>
                    )}
                  </div>

                  {/* Cột 4: Trạng thái */}
                  <div className="lg:col-span-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${
                        exam.status === 'Đang mở'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          exam.status === 'Đang mở' ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      <span>{exam.status || 'Đang mở'}</span>
                    </span>
                  </div>

                  {/* Cột 5: Cụm nút thao tác nhanh (Xem trước, Chỉnh sửa, Xuất, Giao bài, Xóa) */}
                  <div className="lg:col-span-2 flex items-center justify-end gap-1.5 flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Nút Xem trước (Preview) */}
                    <button
                      type="button"
                      onClick={() => onPreviewExam(exam)}
                      title="Xem trước toàn bộ câu hỏi và đáp án"
                      className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl border border-slate-200 transition cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Nút Chỉnh sửa (Edit - Requirement 2) */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(exam)}
                      title="Chỉnh sửa thông tin đề thi"
                      className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl border border-slate-200 transition cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Nút Trộn 4 mã đề (Exam Shuffler) */}
                    <button
                      type="button"
                      onClick={() => setExamToShuffle(exam)}
                      title="Trộn đề thi thành 4 mã đề hoán vị (101, 102, 103, 104) kèm bảng đáp án"
                      className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-xl border border-purple-200 hover:border-purple-300 transition cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>

                    {/* Nút Xem DS Lớp & Kết quả làm bài (Excel) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onViewExamResults) {
                          onViewExamResults(exam);
                        }
                      }}
                      title="Xem danh sách học sinh từng lớp, bài làm của các em & Xuất Excel (.xlsx)"
                      className="p-2 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-xl border border-indigo-200 hover:border-indigo-600 transition cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span className="text-[11px] font-bold hidden 2xl:inline">DS Lớp & KQ</span>
                    </button>

                    {/* Nút Xuất Word/PDF */}
                    <button
                      type="button"
                      onClick={() => setExamToExport(exam)}
                      title="Xuất file Word (.docx) hoặc In PDF tách riêng Đề và Lời giải"
                      className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Nút Giao bài cho lớp */}
                    <button
                      type="button"
                      onClick={() => onAssignExam(exam)}
                      title="Giao đề thi cho lớp học & cấp mã PIN"
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">Giao</span>
                    </button>

                    {/* Nút Xóa khỏi bộ nhớ */}
                    <button
                      type="button"
                      onClick={() => setExamToDelete(exam)}
                      title="Xóa vĩnh viễn đề thi này khỏi bộ nhớ và máy chủ"
                      className="p-2 text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl border border-rose-200 hover:border-rose-600 transition cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= DẠNG THẺ (CARDS VIEW) ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam, index) => {
            const examOrderNumber = String(index + 1).padStart(2, '0');
            const questionsCount = exam.questionsCount || exam.questions?.length || 0;
            const submissions = exam.submissions || 0;
            const avgScore = exam.avgScore || 0;
            const isSelected = selectedExamIds.has(exam.id);
            const typeLabel = getExamTypeLabel(exam);
            const semLabel = getExamSemesterLabel(exam);

            return (
              <div
                key={exam.id}
                className={`bg-white rounded-2xl border p-5 transition flex flex-col justify-between hover:shadow-lg hover:border-blue-400 group relative ${
                  isSelected ? 'border-blue-500 bg-blue-50/20 shadow-md' : 'border-slate-200/90 shadow-xs'
                }`}
              >
                <div>
                  {/* Top Header of Card */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-700 text-white font-black text-xs shadow-xs tracking-wide">
                        Đề {examOrderNumber}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                        {exam.grade || 'Lớp 10'}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        {semLabel}
                      </span>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                        {typeLabel}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        exam.status === 'Đang mở'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          exam.status === 'Đang mở' ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      <span>{exam.status || 'Đang mở'}</span>
                    </span>
                  </div>

                  {/* Title & Topic */}
                  <h3
                    onClick={() => {
                      const isAssigned = (exam.assignedClasses && exam.assignedClasses.length > 0) || (exam.assignedClassIds && exam.assignedClassIds.length > 0) || exam.submissions > 0;
                      if (isAssigned && onViewExamResults) {
                        onViewExamResults(exam);
                      } else {
                        onPreviewExam(exam);
                      }
                    }}
                    className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition cursor-pointer line-clamp-2 leading-snug"
                    title={exam.title}
                  >
                    {exam.title}
                  </h3>

                  {exam.topic && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                      {exam.topic}
                    </p>
                  )}

                  {/* Assigned Classes - Clickable to view class results & export Excel */}
                  {exam.assignedClasses && exam.assignedClasses.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewExamResults) onViewExamResults(exam);
                      }}
                      className="text-[11px] text-blue-700 bg-blue-50/80 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200/80 inline-flex items-center justify-between gap-1 mt-2 w-full cursor-pointer transition shadow-2xs group/cardtag"
                      title="Bấm để xem danh sách học sinh từng lớp, bài làm chi tiết & Xuất Excel"
                    >
                      <div className="flex items-center gap-1 truncate">
                        <Users className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="truncate">Đã giao: <strong>{exam.assignedClasses.join(', ')}</strong></span>
                      </div>
                      <span className="text-[10px] bg-blue-600 group-hover/cardtag:bg-blue-700 text-white font-black px-1.5 py-0.2 rounded-full shrink-0 flex items-center gap-0.5">
                        <FileSpreadsheet className="w-2.5 h-2.5" />
                        <span>Xem KQ & Excel</span>
                      </span>
                    </button>
                  )}

                  {/* Stats Mini Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-medium">Số câu</div>
                      <div className="text-xs font-black text-slate-800 mt-0.5">{questionsCount}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-medium">Thời gian</div>
                      <div className="text-xs font-black text-slate-800 mt-0.5">{exam.duration || '45p'}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-medium">Đã nộp</div>
                      <div className="text-xs font-black text-emerald-600 mt-0.5">{submissions}</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    {/* Xem trước */}
                    <button
                      type="button"
                      onClick={() => onPreviewExam(exam)}
                      title="Xem trước đề thi"
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 transition cursor-pointer active:scale-95"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Xem DS lớp & Kết quả thi (Excel) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onViewExamResults) onViewExamResults(exam);
                      }}
                      title="Xem danh sách học sinh từng lớp, bài làm của các em & Xuất Excel (.xlsx)"
                      className="p-1.5 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-lg border border-indigo-200 hover:border-indigo-600 transition cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>

                    {/* Sửa */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(exam)}
                      title="Chỉnh sửa thông tin"
                      className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-slate-200 transition cursor-pointer active:scale-95"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Trộn 4 mã đề (Exam Shuffler) */}
                    <button
                      type="button"
                      onClick={() => setExamToShuffle(exam)}
                      title="Trộn đề thi thành 4 mã đề (101, 102, 103, 104)"
                      className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-300 transition cursor-pointer active:scale-95"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>

                    {/* Xuất */}
                    <button
                      type="button"
                      onClick={() => setExamToExport(exam)}
                      title="Xuất Word / PDF"
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition cursor-pointer active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Xóa */}
                    <button
                      type="button"
                      onClick={() => setExamToDelete(exam)}
                      title="Xóa đề"
                      className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 hover:border-rose-600 transition cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Giao bài button */}
                  <button
                    type="button"
                    onClick={() => onAssignExam(exam)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Giao bài</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL CHỈNH SỬA ĐỀ THI (EDIT EXAM MODAL) ================= */}
      {editingExam && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Chỉnh sửa đề thi</h3>
                  <p className="text-xs text-slate-500">Cập nhật thông tin tiêu đề, thời gian và phân loại đề thi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingExam(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên đề thi / Tiêu đề:</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Ví dụ: Đề kiểm tra 15 phút Unit 4 Global Success"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp:</label>
                  <select
                    value={editForm.grade}
                    onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Lớp 10">Lớp 10</option>
                    <option value="Lớp 11">Lớp 11</option>
                    <option value="Lớp 12">Lớp 12</option>
                    <option value="Ôn thi TN THPT">Ôn thi TN THPT</option>
                    <option value="Khối THCS">Khối THCS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian làm bài:</label>
                  <select
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="15 phút">15 phút (Đề nhanh)</option>
                    <option value="45 phút">45 phút (1 tiết)</option>
                    <option value="50 phút">50 phút (Chuẩn Bộ)</option>
                    <option value="60 phút">60 phút</option>
                    <option value="90 phút">90 phút (Học kỳ / THPT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chuyên đề / Bài học:</label>
                <input
                  type="text"
                  value={editForm.topic}
                  onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                  placeholder="Ví dụ: For a Better Community - Past Simple vs Past Continuous"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức độ khó:</label>
                  <select
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cơ bản">Cơ bản (Nhận biết - Thông hiểu)</option>
                    <option value="Trung bình">Trung bình (Vận dụng 7 - 8 điểm)</option>
                    <option value="Nâng cao">Nâng cao (Phân hóa 9 - 10 điểm)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái làm bài:</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Đang mở">Đang mở (Học sinh có thể làm bài)</option>
                    <option value="Đã đóng">Đã đóng (Khóa nộp bài)</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                ℹ️ Đề thi hiện có <strong>{editingExam.questions?.length || editingExam.questionsCount} câu hỏi</strong> trắc nghiệm/tự luận. Nhấn <em>Xem trước</em> để tra cứu chi tiết lời giải chi tiết và ma trận kiến thức.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingExam(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XÁC NHẬN XÓA ĐỀ ĐƠN LẺ ================= */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Xóa đề thi vĩnh viễn khỏi bộ nhớ
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thầy/Cô có chắc chắn muốn xóa đề thi <strong>"{examToDelete.title}"</strong> này khỏi bộ nhớ thiết bị và máy chủ không?
                </p>
                <p className="text-[11px] text-rose-700 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100 mt-2 leading-relaxed">
                  ⚠️ <strong>Dọn dẹp triệt để:</strong> Toàn bộ câu hỏi, dữ liệu đề thi và mã PIN sẽ được dọn sạch vĩnh viễn khỏi LocalStorage và Máy chủ Database.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setExamToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xóa khỏi bộ nhớ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XÁC NHẬN XÓA NHIỀU ĐỀ ================= */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Xóa hàng loạt khỏi bộ nhớ
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thầy/Cô có chắc chắn muốn xóa vĩnh viễn <strong>{selectedExamIds.size} bộ đề thi đã chọn</strong> khỏi bộ nhớ thiết bị và máy chủ?
                </p>
                <p className="text-[11px] text-rose-700 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100 mt-2 leading-relaxed">
                  ⚠️ Hành động này sẽ không thể khôi phục sau khi xóa.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa {selectedExamIds.size} đề khỏi bộ nhớ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XUẤT ĐỀ THI WORD / PDF (EXPORT HUB) ================= */}
      {examToExport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Xuất đề thi chuẩn sư phạm</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{examToExport.title}</p>
                </div>
              </div>
              <button
                onClick={() => setExamToExport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Hệ thống tự động tách riêng <strong>Phần Đề bài (cho học sinh làm bài)</strong> và <strong>Phần Đáp án + Lời giải chi tiết (cho giáo viên)</strong>.
            </p>

            <div className="space-y-2.5">
              {/* Option 1: Word Document */}
              <button
                type="button"
                onClick={() => {
                  exportExamToWord(examToExport);
                  if (onShowToast) onShowToast('Đang tải file Word (.doc/.docx) chuẩn sư phạm...');
                  setExamToExport(null);
                }}
                className="w-full p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 transition flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    DOC
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-950 group-hover:text-blue-700">
                      Tải file Word (.docx / .doc)
                    </h4>
                    <p className="text-[11px] text-blue-800/80">
                      Tách riêng đề thi học sinh và trang đáp án + giải thích, dễ dàng chỉnh sửa trong MS Word
                    </p>
                  </div>
                </div>
                <FileDown className="w-5 h-5 text-blue-600 shrink-0" />
              </button>

              {/* Option 2: Print / PDF */}
              <button
                type="button"
                onClick={() => {
                  printExamSheet(examToExport);
                  setExamToExport(null);
                }}
                className="w-full p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 transition flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    PDF
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 group-hover:text-emerald-700">
                      In đề thi trực tiếp / Lưu PDF
                    </h4>
                    <p className="text-[11px] text-emerald-800/80">
                      Định dạng chuẩn khổ A4, tự động ngắt trang giữa đề thi và bảng đáp án
                    </p>
                  </div>
                </div>
                <Printer className="w-5 h-5 text-emerald-600 shrink-0" />
              </button>

              {/* Option 3: JSON Export */}
              <button
                type="button"
                onClick={() => {
                  exportExamToJson(examToExport);
                  if (onShowToast) onShowToast('Đã xuất file JSON đề thi thành công!');
                  setExamToExport(null);
                }}
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-700 text-white flex items-center justify-center font-black text-xs shrink-0">
                    JSON
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-700">
                      Xuất dữ liệu thô (File JSON)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Phục vụ sao lưu, tích hợp hệ thống LMS hoặc chuyển tiếp giữa các tài khoản
                    </p>
                  </div>
                </div>
                <FileDown className="w-5 h-5 text-slate-500 shrink-0" />
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setExamToExport(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Shuffler Modal (4 mã đề hoán vị & bảng ma trận đáp án) */}
      <ExamShufflerModal
        isOpen={!!examToShuffle}
        onClose={() => setExamToShuffle(null)}
        exam={examToShuffle}
        onSaveExamVersions={handleSaveShuffledVersions}
        onShowToast={onShowToast}
      />
    </div>
  );
};
