import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Award,
  Phone,
  AlertCircle,
  Mail,
  X,
  UserPlus,
  FileSpreadsheet,
  Download,
  FolderPlus,
  Edit3,
  Trash2,
  Key,
  School,
  GraduationCap,
  Check,
  Cloud,
  AlertTriangle,
  ArrowLeft,
  Copy,
  ChevronRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { StudentItem, ClassItem, ExamItem, SubmissionItem } from '../types';
import { ExcelImportModal } from './ExcelImportModal';
import { ClassModal } from './ClassModal';
import { ExportClassReportModal } from './ExportClassReportModal';
import { exportClassReportToExcel } from '../utils/exportClassReportExcel';

interface StudentsViewProps {
  students: StudentItem[];
  classes: ClassItem[];
  exams?: ExamItem[];
  submissions?: SubmissionItem[];
  onAddStudent: (newStudent: StudentItem) => void;
  onUpdateStudent?: (updatedStudent: StudentItem) => void;
  onDeleteStudent?: (studentId: string) => void;
  onAddClass?: (newClass: ClassItem) => void;
  onDeleteClass?: (classId: string) => void;
  onImportBatchStudents?: (importedStudents: StudentItem[], autoCreatedClasses: ClassItem[]) => void;
  onSendParentReport: (student: StudentItem) => void;
  onOpenClassModal?: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'info') => void;
  onSyncToServer?: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  classes,
  exams = [],
  submissions = [],
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddClass,
  onDeleteClass,
  onImportBatchStudents,
  onSendParentReport,
  onOpenClassModal,
  onShowToast,
  onSyncToServer,
}) => {
  // selectedClassId:
  // - null: Trang Danh sách các lớp học ("Danh Sách Lớp Học Trực Thuộc") - KHÔNG hiển thị danh sách học sinh bên dưới
  // - 'ALL': Trang Danh sách toàn bộ học sinh trường
  // - cls.id: Trang Danh sách học sinh của riêng lớp học được chọn
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportClassIdTarget, setExportClassIdTarget] = useState<string | 'ALL'>('ALL');

  // Student Edit & Delete States
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentItem | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // New Student Form State
  const [name, setName] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Edit Student Form State
  const [editName, setEditName] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<'Xuất sắc' | 'Hoàn thành' | 'Cần bổ trợ'>('Hoàn thành');

  const handleOpenClassModal = () => {
    if (onOpenClassModal) {
      onOpenClassModal();
    } else {
      setShowCreateClassModal(true);
    }
  };

  // Switch to class student list view
  const handleSelectClass = (clsId: string) => {
    setSelectedClassId(clsId);
    setSearchTerm('');
    setStatusFilter('ALL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to class list overview
  const handleBackToClassList = () => {
    setSelectedClassId(null);
    setSearchTerm('');
    setStatusFilter('ALL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active Selected Class Object
  const activeClass = useMemo(() => {
    if (!selectedClassId || selectedClassId === 'ALL') return null;
    return classes.find(c => c.id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // Students belonging to current selected class
  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    if (selectedClassId === 'ALL') return students;
    return students.filter(s => 
      s.classId === selectedClassId || 
      (activeClass && s.className && s.className.trim().toLowerCase() === activeClass.name.trim().toLowerCase())
    );
  }, [students, selectedClassId, activeClass]);

  // Filtered Students List within active class view
  const filteredStudents = useMemo(() => {
    return classStudents.filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.phone && s.phone.includes(searchTerm)) ||
        (s.parentPhone && s.parentPhone.includes(searchTerm));
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [classStudents, searchTerm, statusFilter]);

  // Statistics for current selected class
  const classStats = useMemo(() => {
    const total = classStudents.length;
    const excellent = classStudents.filter(s => s.status === 'Xuất sắc' || (s.lastScore && s.lastScore >= 8.5)).length;
    const good = classStudents.filter(s => s.status === 'Hoàn thành' || (s.lastScore && s.lastScore >= 6.5 && s.lastScore < 8.5)).length;
    const needHelp = classStudents.filter(s => s.status === 'Cần bổ trợ' || (s.lastScore && s.lastScore < 6.5)).length;
    return { total, excellent, good, needHelp };
  }, [classStudents]);

  // Copy PIN with visual feedback
  const handleCopyPin = (pin: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    if (onShowToast) onShowToast(`Đã sao chép mã PIN phòng thi: ${pin}`, 'success');
    setTimeout(() => {
      setCopiedPin(null);
    }, 2000);
  };

  // Open Edit Modal with selected student data
  const handleStartEdit = (student: StudentItem, focusPhone: boolean = false) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditClassId(student.classId);
    setEditPhone(student.phone && student.phone !== 'Chưa cập nhật' ? student.phone : '');
    setEditParentPhone(student.parentPhone && student.parentPhone !== 'Chưa cập nhật' ? student.parentPhone : '');
    setEditNotes(student.notes || '');
    setEditStatus((student.status as any) || 'Hoàn thành');
  };

  // Submit Edit Student
  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editName.trim()) return;

    const chosenClass = classes.find(c => c.id === editClassId) || classes.find(c => c.id === editingStudent.classId) || classes[0];

    const updated: StudentItem = {
      ...editingStudent,
      name: editName.trim(),
      classId: chosenClass ? chosenClass.id : editingStudent.classId,
      className: chosenClass ? chosenClass.name : editingStudent.className,
      phone: editPhone.trim() || 'Chưa cập nhật',
      parentPhone: editParentPhone.trim() || 'Chưa cập nhật',
      notes: editNotes.trim(),
      status: editStatus,
    };

    if (onUpdateStudent) {
      onUpdateStudent(updated);
    } else {
      const updatedList = students.map(s => s.id === updated.id ? updated : s);
      try {
        localStorage.setItem('eng_students_v1', JSON.stringify(updatedList));
      } catch {}
      if (onShowToast) onShowToast(`Đã lưu cập nhật cho học sinh ${updated.name}!`, 'success');
    }

    setEditingStudent(null);
  };

  // Confirm Delete Student
  const handleConfirmDeleteStudent = () => {
    if (!studentToDelete) return;

    if (onDeleteStudent) {
      onDeleteStudent(studentToDelete.id);
    } else {
      const updatedList = students.filter(s => s.id !== studentToDelete.id);
      try {
        localStorage.setItem('eng_students_v1', JSON.stringify(updatedList));
      } catch {}
      if (onShowToast) onShowToast(`Đã xóa học sinh khỏi danh sách lớp!`, 'info');
    }

    setStudentToDelete(null);
  };

  // Confirm Delete Class
  const handleConfirmDeleteClass = () => {
    if (!classToDelete) return;
    if (onDeleteClass) {
      onDeleteClass(classToDelete.id);
      if (selectedClassId === classToDelete.id) {
        setSelectedClassId(null);
      }
    }
    setClassToDelete(null);
  };

  // Create Student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const targetClassId = (selectedClassId && selectedClassId !== 'ALL') ? selectedClassId : classId;
    const chosenClass = classes.find(c => c.id === targetClassId) || classes[0];
    const newStud: StudentItem = {
      id: `s-${Date.now()}`,
      name: name.trim(),
      studentId: `HS-${Math.floor(1000 + Math.random() * 9000)}`,
      classId: chosenClass ? chosenClass.id : 'cls-default',
      className: chosenClass ? chosenClass.name : 'Lớp chung',
      progress: 0,
      lastScore: 0,
      status: 'Chưa làm',
      phone: phone.trim() || 'Chưa cập nhật',
      parentPhone: parentPhone.trim() || 'Chưa cập nhật',
      completedExams: 0,
      notes: notes.trim() || 'Học sinh mới nhập lớp',
    };

    onAddStudent(newStud);
    setName('');
    setPhone('');
    setParentPhone('');
    setNotes('');
    setShowAddModal(false);
  };

  // Manual Trigger Server Sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    if (onSyncToServer) {
      onSyncToServer();
    }
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  // Open Excel Export Modal with target class
  const handleOpenExportModal = (targetClsId?: string) => {
    setExportClassIdTarget(targetClsId || selectedClassId || 'ALL');
    setShowExportModal(true);
  };

  // Direct fast export to .xlsx
  const handleQuickExportExcel = (targetClsId?: string) => {
    try {
      const clsId = targetClsId || selectedClassId || 'ALL';
      const summary = exportClassReportToExcel({
        targetClassId: clsId,
        classes,
        students,
        exams,
        submissions,
        reportType: 'full_multisheet'
      });
      if (onShowToast) {
        onShowToast(`Đã xuất báo cáo danh sách lớp & điểm thi ra tệp ${summary.fileName}!`, 'success');
      }
    } catch (err) {
      console.error(err);
      if (onShowToast) {
        onShowToast('Có lỗi khi xuất file Excel, vui lòng thử lại!', 'info');
      }
    }
  };

  // =========================================================================
  // VIEW MODE 1: TRANG QUẢN LÝ LỚP HỌC (Hiển thị danh sách lớp, KHÔNG để DS học sinh bên dưới)
  // =========================================================================
  if (selectedClassId === null) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        
        {/* Top Header Banner: Quản Lý Lớp Học */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <School className="w-4 h-4" />
              <span>Quản Lý Lớp Học</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
              <span>Quản Lý Lớp Học</span>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                {classes.length} Lớp • {students.length} Học sinh
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Hệ sinh thái quản lý lớp học trực thuộc, tự động cấp mã PIN bảo mật 2FA, lưu trữ học sinh và theo dõi tiến độ luyện đề. Nhấp vào bất kỳ lớp nào để mở danh sách học sinh.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            {/* Cloud Sync Button */}
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-300 transition active:scale-95 cursor-pointer disabled:opacity-60"
              title="Đồng bộ lưu giữ an toàn danh sách lớp học và học sinh lên máy chủ đám mây"
            >
              <Cloud className={`w-4 h-4 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang lưu...' : 'Lưu & Đồng bộ'}</span>
            </button>

            {/* Export Roster & Scores to Excel (.xlsx) */}
            <button
              type="button"
              onClick={() => handleOpenExportModal('ALL')}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2.5 rounded-xl border border-emerald-300/80 transition active:scale-95 cursor-pointer shadow-2xs"
              title="Xuất báo cáo danh sách lớp và điểm thi dưới định dạng file Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Xuất Báo Cáo Excel (.xlsx)</span>
            </button>

            {/* Excel Import Button */}
            <button
              onClick={() => setShowExcelModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
              title="Thêm hàng loạt học sinh bằng file Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Nhập Excel</span>
            </button>

            {/* Add Class Button */}
            <button
              type="button"
              onClick={handleOpenClassModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
              title="Thêm lớp học mới và tự cấp mã PIN"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Thêm lớp học</span>
            </button>
          </div>
        </div>

        {/* 4 Thẻ Thống Kê Tổng Quan */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng số lớp học</p>
              <p className="text-xl font-black text-slate-800">{classes.length} <span className="text-xs font-semibold text-slate-500">lớp</span></p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng số học sinh</p>
              <p className="text-xl font-black text-slate-800">{students.length} <span className="text-xs font-semibold text-slate-500">em</span></p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Học sinh xuất sắc</p>
              <p className="text-xl font-black text-slate-800">
                {students.filter(s => s.status === 'Xuất sắc' || (s.lastScore && s.lastScore >= 8.5)).length} <span className="text-xs font-semibold text-slate-500">em</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bảo mật & Lưu trữ</p>
              <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Tự động lưu 100%
              </p>
            </div>
          </div>
        </div>

        {/* KHU VỰC DIV RIÊNG: DANH SÁCH LỚP HỌC TRỰC THUỘC (Biểu Tượng + Tên Lớp) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Danh Sách Lớp Học Trực Thuộc ({classes.length} Lớp)
                </h3>
                <p className="text-xs text-slate-500">
                  Nhấp vào biểu tượng bất kỳ lớp nào để chuyển trang và mở danh sách học sinh của lớp đó.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenClassModal}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200/80 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm lớp mới</span>
              </button>
            </div>
          </div>

          {/* Grid các lớp học: Biểu tượng ở trên + Tên lớp bên dưới */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 pt-1">
            
            {/* Tile 1: Tất Cả Học Sinh (Toàn Trường) */}
            <div
              onClick={() => handleSelectClass('ALL')}
              className="group p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/40 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between gap-3 select-none relative"
            >
              {/* Quick Export Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenExportModal('ALL');
                }}
                title="Xuất báo cáo toàn trường ra file Excel (.xlsx)"
                className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>

              {/* Biểu tượng */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 group-hover:border-blue-500 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center shadow-xs transition-all duration-200 group-hover:scale-105">
                <Users className="w-7 h-7" />
              </div>

              {/* Tên & Sĩ số bên dưới */}
              <div className="w-full">
                <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-blue-700 truncate">
                  Tất cả học sinh
                </h4>
                <p className="text-[11px] font-semibold text-blue-600 mt-0.5">
                  {students.length} em toàn trường
                </p>
              </div>

              {/* Nút hành động mở danh sách */}
              <div className="w-full pt-1.5 border-t border-slate-200/80 flex items-center justify-center">
                <span className="text-[11px] font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                  <span>Mở danh sách</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>

            {/* Tiles cho từng lớp học */}
            {classes.map((cls) => {
              const classCount = students.filter(s => 
                s.classId === cls.id || 
                (s.className && s.className.trim().toLowerCase() === cls.name.trim().toLowerCase())
              ).length;
              
              // Color themes according to grade
              const isGrade12 = cls.grade?.includes('12') || cls.name.includes('12');
              const isGrade11 = cls.grade?.includes('11') || cls.name.includes('11');
              const isGrade10 = cls.grade?.includes('10') || cls.name.includes('10');

              const iconStyle = isGrade12
                ? 'bg-violet-100 text-violet-700 border-violet-200 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600'
                : isGrade11
                ? 'bg-teal-100 text-teal-700 border-teal-200 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600'
                : isGrade10
                ? 'bg-sky-100 text-sky-700 border-sky-200 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600'
                : 'bg-indigo-100 text-indigo-700 border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600';

              return (
                <div
                  key={cls.id}
                  onClick={() => handleSelectClass(cls.id)}
                  className="group p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/30 hover:border-indigo-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between gap-3 select-none relative"
                >
                  {/* Top Action buttons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenExportModal(cls.id);
                      }}
                      title="Xuất báo cáo danh sách lớp & điểm thi ra file Excel (.xlsx)"
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setClassToDelete(cls);
                      }}
                      title="Xóa lớp học này"
                      className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Biểu tượng lớp học ở trên */}
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-xs transition-all duration-200 group-hover:scale-105 ${iconStyle}`}>
                    <GraduationCap className="w-7 h-7" />
                  </div>

                  {/* Tên lớp bên dưới biểu tượng */}
                  <div className="w-full">
                    <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-indigo-700 truncate" title={cls.name}>
                      {cls.name}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                      {classCount} học sinh
                    </p>

                    {/* Mã PIN badge */}
                    {cls.pin && (
                      <div
                        onClick={(e) => handleCopyPin(cls.pin, e)}
                        title="Nhấp để sao chép mã PIN vào lớp"
                        className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200/80 mt-1.5 inline-flex items-center gap-1 cursor-pointer transition active:scale-95"
                      >
                        <Key className="w-2.5 h-2.5 text-indigo-500" />
                        <span>PIN: {cls.pin}</span>
                        {copiedPin === cls.pin ? (
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 opacity-60" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer mở danh sách học sinh */}
                  <div className="w-full pt-1.5 border-t border-slate-200/80 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-indigo-600 group-hover:underline flex items-center gap-1">
                      <span>Mở danh sách</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Tile: + Thêm Lớp Mới */}
            <div
              onClick={handleOpenClassModal}
              className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/40 transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-center gap-2.5 select-none group min-h-[170px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 group-hover:border-indigo-400 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 flex items-center justify-center transition shadow-xs group-hover:scale-105">
                <Plus className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-indigo-900 group-hover:text-indigo-700">
                  + Thêm Lớp Mới
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Tự động cấp mã PIN
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* DELETE CLASS CONFIRMATION MODAL */}
        {classToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Xóa lớp học này?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bạn có chắc chắn muốn xóa lớp <strong>{classToDelete.name}</strong> (Mã PIN: {classToDelete.pin})?
                </p>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClassToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteClass}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition cursor-pointer"
                >
                  Xác nhận xóa lớp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CLASS MODAL */}
        {showCreateClassModal && (
          <ClassModal
            isOpen={showCreateClassModal}
            onClose={() => setShowCreateClassModal(false)}
            onAddClass={(newCls) => {
              if (onAddClass) {
                onAddClass(newCls);
              }
              setClassId(newCls.id);
              // Chuyển trang và mở ngay danh sách học sinh của lớp mới vừa tạo
              setSelectedClassId(newCls.id);
              setShowCreateClassModal(false);
            }}
          />
        )}

        {/* EXCEL IMPORT MODAL */}
        <ExcelImportModal
          isOpen={showExcelModal}
          onClose={() => setShowExcelModal(false)}
          classes={classes}
          onImportSuccess={(imported, newCls) => {
            if (onImportBatchStudents) {
              onImportBatchStudents(imported, newCls);
            }
          }}
        />

        {/* EXCEL EXPORT MODAL */}
        <ExportClassReportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          classes={classes}
          students={students}
          exams={exams}
          submissions={submissions}
          initialClassId={exportClassIdTarget}
          onSuccess={(summary) => {
            if (onShowToast) {
              onShowToast(`Đã xuất báo cáo ${summary.fileName} (${summary.studentCount} học sinh) ra file Excel (.xlsx)!`, 'success');
            }
          }}
        />

      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: TRANG CHI TIẾT LỚP HỌC & MỞ DANH SÁCH HỌC SINH CỦA LỚP ĐƯỢC CHỌN
  // (Đã chuyển trang hoàn toàn, KHÔNG còn khối danh sách các lớp học bên trên)
  // =========================================================================
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Navigation Breadcrumb & Back Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white px-5 py-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleBackToClassList}
            className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200/80 transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách lớp học</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-extrabold text-slate-800">
            {activeClass ? activeClass.name : 'Tất Cả Học Sinh Toàn Trường'}
          </span>
        </div>

        {/* Quick Class Switcher Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold hidden sm:inline">Chuyển nhanh lớp:</span>
          <select
            value={selectedClassId}
            onChange={(e) => {
              if (e.target.value === '__BACK__') {
                handleBackToClassList();
              } else if (e.target.value === '__ADD__') {
                handleOpenClassModal();
              } else {
                handleSelectClass(e.target.value);
              }
            }}
            className="border border-slate-300 rounded-xl px-3 py-1.5 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">Toàn trường ({students.length} học sinh)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} (PIN: {c.pin})
              </option>
            ))}
            <option value="__ADD__" className="text-indigo-600 font-bold">+ Thêm lớp mới...</option>
            <option value="__BACK__">← Quay về trang danh sách lớp</option>
          </select>
        </div>
      </div>

      {/* Class Banner Hero: Chi Tiết Lớp Được Chọn */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 flex-shrink-0">
            {activeClass ? <GraduationCap className="w-8 h-8" /> : <Users className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-slate-900">
                {activeClass ? activeClass.name : 'Danh Sách Học Sinh Toàn Trường'}
              </h2>
              {activeClass && (
                <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {activeClass.grade || 'Lớp học'}
                </span>
              )}
              {activeClass && activeClass.pin && (
                <button
                  type="button"
                  onClick={() => handleCopyPin(activeClass.pin)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 transition cursor-pointer"
                  title="Nhấp để sao chép mã PIN vào lớp"
                >
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mã PIN: {activeClass.pin}</span>
                  {copiedPin === activeClass.pin ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-amber-600" />
                  )}
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              {activeClass
                ? `Học sinh lớp ${activeClass.name} sử dụng Mã PIN ${activeClass.pin} kết hợp với Số điện thoại cá nhân (2FA) để đăng nhập làm bài kiểm tra trực tuyến.`
                : 'Đang hiển thị toàn bộ học sinh trực thuộc tất cả các lớp trong hệ thống trường.'}
            </p>

            {/* Class Stats Badges */}
            <div className="flex items-center gap-2 flex-wrap mt-3 text-xs">
              <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg">
                Sĩ số: {classStats.total} học sinh
              </span>
              <span className="bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-lg border border-purple-200/60">
                Xuất sắc: {classStats.excellent}
              </span>
              <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg border border-emerald-200/60">
                Hoàn thành: {classStats.good}
              </span>
              <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-lg border border-amber-200/60">
                Cần bổ trợ: {classStats.needHelp}
              </span>
            </div>
          </div>
        </div>

        {/* Class Actions Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
          {/* Cloud Sync Button */}
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-300 transition active:scale-95 cursor-pointer disabled:opacity-60"
            title="Đồng bộ lưu giữ an toàn danh sách lên máy chủ"
          >
            <Cloud className={`w-4 h-4 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang lưu...' : 'Lưu & Đồng bộ'}</span>
          </button>

          {/* Export Class Roster & Scores Button */}
          <button
            type="button"
            onClick={() => handleOpenExportModal(selectedClassId || 'ALL')}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2.5 rounded-xl border border-emerald-300/80 transition active:scale-95 cursor-pointer shadow-2xs"
            title="Xuất báo cáo danh sách lớp và điểm thi dưới định dạng file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Báo Cáo Excel (.xlsx)</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => setShowExcelModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            title="Nhập danh sách học sinh từ file Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Nhập Excel</span>
          </button>

          {/* Add Student Button */}
          <button
            onClick={() => {
              if (activeClass) setClassId(activeClass.id);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{activeClass ? `+ Thêm vào ${activeClass.name}` : '+ Thêm học sinh'}</span>
          </button>
        </div>
      </div>

      {/* Main Student List Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4 p-5">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên học sinh, số điện thoại, mã HS..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Năng lực:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Tất cả năng lực</option>
              <option value="Xuất sắc">Xuất sắc (9+ điểm)</option>
              <option value="Hoàn thành">Hoàn thành tốt</option>
              <option value="Cần bổ trợ">Cần bổ trợ ngữ pháp</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Học sinh</th>
                  <th className="p-3.5">Lớp</th>
                  <th className="p-3.5 text-center">Tiến độ làm bài</th>
                  <th className="p-3.5 text-center">Điểm TB</th>
                  <th className="p-3.5">Tình trạng</th>
                  <th className="p-3.5">SĐT Học sinh (2FA)</th>
                  <th className="p-3.5">SĐT Phụ huynh</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    {/* Name & Avatar */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{student.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{student.studentId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {student.className}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="p-3.5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-slate-800 mb-1">{student.progress || 0}%</span>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${student.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Last score */}
                    <td className="p-3.5 text-center">
                      <span className={`inline-block font-extrabold text-sm px-2.5 py-0.5 rounded-lg ${
                        student.lastScore >= 8.5
                          ? 'bg-emerald-100 text-emerald-800'
                          : student.lastScore >= 7.0
                          ? 'bg-blue-100 text-blue-800'
                          : student.lastScore >= 5.0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.lastScore > 0 ? student.lastScore.toFixed(1) : '—'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-md ${
                        student.status === 'Xuất sắc'
                          ? 'bg-purple-100 text-purple-700'
                          : student.status === 'Hoàn thành'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {student.status === 'Xuất sắc' && <Award className="w-3 h-3" />}
                        {student.status === 'Cần bổ trợ' && <AlertCircle className="w-3 h-3" />}
                        {student.status || 'Chưa làm'}
                      </span>
                    </td>

                    {/* Student Phone (Used for 2FA PIN + Phone login) */}
                    <td className="p-3.5">
                      {student.phone && student.phone !== 'Chưa cập nhật' ? (
                        <div className="inline-flex items-center gap-1.5 font-bold text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md group">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span className="font-mono">{student.phone}</span>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(student, true)}
                            title="Sửa số điện thoại này"
                            className="text-emerald-500 hover:text-emerald-800 transition cursor-pointer ml-0.5 opacity-70 group-hover:opacity-100"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(student, true)}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md transition cursor-pointer"
                          title="Nhấp để thêm số điện thoại 2FA cho học sinh"
                        >
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                          <span>+ Thêm SĐT 2FA</span>
                        </button>
                      )}
                    </td>

                    {/* Parent Contact */}
                    <td className="p-3.5 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{student.parentPhone || 'Chưa cập nhật'}</span>
                      </div>
                    </td>

                    {/* Actions: Edit, Report, Delete */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(student)}
                          title="Chỉnh sửa thông tin học sinh, số điện thoại hoặc đổi lớp"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-200 transition cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>

                        {/* Send Report */}
                        <button
                          type="button"
                          onClick={() => onSendParentReport(student)}
                          title="Gửi báo cáo học tập tới phụ huynh"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-200 transition cursor-pointer shadow-2xs"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline">Báo cáo</span>
                        </button>

                        {/* Delete Student Button */}
                        <button
                          type="button"
                          onClick={() => setStudentToDelete(student)}
                          title="Xóa học sinh này khỏi danh sách lớp"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-200 transition cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {filteredStudents.length === 0 && (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {activeClass ? `Lớp ${activeClass.name} hiện chưa có học sinh nào` : 'Chưa tìm thấy học sinh nào phù hợp'}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thầy/Cô có thể bấm nút thêm học sinh hoặc nhập hàng loạt từ file Excel để hoàn thiện danh sách cho lớp này.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                  <button
                    onClick={() => setShowExcelModal(true)}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Nhập file Excel</span>
                  </button>
                  <button
                    onClick={() => {
                      if (activeClass) setClassId(activeClass.id);
                      setShowAddModal(true);
                    }}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{activeClass ? `Thêm vào ${activeClass.name}` : 'Thêm học sinh mới'}</span>
                  </button>
                  <button
                    onClick={handleBackToClassList}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại danh sách lớp</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODALS: CHỈNH SỬA, XÓA & THÊM MỚI HỌC SINH */}
      {/* ======================================================== */}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Chỉnh sửa thông tin học sinh</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Mã HS: {editingStudent.studentId}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lớp học trực thuộc</label>
                <select
                  value={editClassId}
                  onChange={(e) => setEditClassId(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (PIN: {c.pin})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    SĐT học sinh (2FA)
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="VD: 0912345678"
                    className="w-full text-xs font-semibold border border-emerald-300 bg-emerald-50/20 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Dùng để vào phòng thi.</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    SĐT phụ huynh
                  </label>
                  <input
                    type="tel"
                    value={editParentPhone}
                    onChange={(e) => setEditParentPhone(e.target.value)}
                    placeholder="VD: 0987654321"
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Nhận báo cáo điểm.</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phân loại năng lực</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Xuất sắc">Xuất sắc (9+ điểm)</option>
                  <option value="Hoàn thành">Hoàn thành tốt</option>
                  <option value="Cần bổ trợ">Cần bổ trợ ngữ pháp</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú & Nhận xét</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ghi chú mục tiêu học tập, điểm cần bổ sung..."
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE STUDENT CONFIRMATION MODAL */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Xóa học sinh khỏi lớp?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn có chắc chắn muốn xóa học sinh <strong>{studentToDelete.name}</strong> ({studentToDelete.studentId}) khỏi lớp <strong>{studentToDelete.className}</strong>?
              </p>
              <div className="text-[11px] text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-left">
                ⚠️ Dữ liệu học sinh sẽ được gỡ khỏi danh sách lớp và sĩ số lớp học sẽ tự động được cập nhật lại.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <h3 className="font-extrabold text-base text-slate-800">
                Thêm học sinh mới {activeClass ? `vào ${activeClass.name}` : ''}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Minh Châu"
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Phân vào lớp học</label>
                  <button
                    type="button"
                    onClick={handleOpenClassModal}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm lớp</span>
                  </button>
                </div>
                <select
                  value={activeClass ? activeClass.id : classId}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_CLASS__') {
                      handleOpenClassModal();
                    } else {
                      setClassId(e.target.value);
                    }
                  }}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (PIN: {c.pin})</option>
                  ))}
                  <option value="__ADD_CLASS__" className="text-indigo-600 font-bold">+ Thêm lớp mới...</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">SĐT học sinh (2FA)</label>
                    <span className="text-[10px] text-emerald-600 font-bold">Dùng vào lớp</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0839050211..."
                    className="w-full text-xs font-semibold border border-emerald-300 bg-emerald-50/30 rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Dùng cùng PIN lớp để đăng nhập 2 bước.</p>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SĐT phụ huynh</label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="VD: 0988123456... (Mẹ)"
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Dùng để gửi báo cáo tiến độ học tập.</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú học lực</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mục tiêu điểm số, điểm ngữ pháp cần chú ý..."
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
                >
                  Thêm học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXCEL IMPORT MODAL */}
      <ExcelImportModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        classes={classes}
        onImportSuccess={(imported, newCls) => {
          if (onImportBatchStudents) {
            onImportBatchStudents(imported, newCls);
          }
        }}
      />

      {/* EXCEL EXPORT MODAL */}
      <ExportClassReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        classes={classes}
        students={students}
        exams={exams}
        submissions={submissions}
        initialClassId={exportClassIdTarget}
        onSuccess={(summary) => {
          if (onShowToast) {
            onShowToast(`Đã xuất báo cáo ${summary.fileName} (${summary.studentCount} học sinh) ra file Excel (.xlsx)!`, 'success');
          }
        }}
      />

      {/* CLASS MODAL */}
      {showCreateClassModal && (
        <ClassModal
          isOpen={showCreateClassModal}
          onClose={() => setShowCreateClassModal(false)}
          onAddClass={(newCls) => {
            if (onAddClass) {
              onAddClass(newCls);
            }
            setClassId(newCls.id);
            setSelectedClassId(newCls.id);
            setShowCreateClassModal(false);
          }}
        />
      )}

    </div>
  );
};
