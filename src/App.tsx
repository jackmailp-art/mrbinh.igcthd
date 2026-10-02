import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Plus,
  Sparkles,
  Layers,
  Send,
  Eye,
  CheckCircle2,
  Users,
  Brain,
  GraduationCap,
  ClipboardList,
  Trophy,
  Gamepad2,
  BarChart3,
  MailCheck,
  ChevronRight,
  Shield,
  Upload,
  Calendar,
  Clock,
  ArrowRight,
  Check,
  Copy,
  Share2,
  ExternalLink,
  School,
  UserPlus
} from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { HeroBanner } from './components/HeroBanner';
import { StatsCards } from './components/StatsCards';
import { AiExamModal } from './components/AiExamModal';
import { ExamPreviewModal } from './components/ExamPreviewModal';
import { AssignModal } from './components/AssignModal';
import { ClassModal } from './components/ClassModal';
import { StudentsView } from './components/StudentsView';
import { ExamsView } from './components/ExamsView';
import { AnalyticsView } from './components/AnalyticsView';
import { ThptExamHubView } from './components/ThptExamHubView';
import { AiVoiceConversationView } from './components/AiVoiceConversationView';
import { TasksManagementView } from './components/TasksManagementView';
import { AiMediaStudioView } from './components/AiMediaStudioView';
import { EnglishSkillsView } from './components/EnglishSkillsView';
import { AssignedExamResultsModal } from './components/AssignedExamResultsModal';

import {
  INITIAL_CLASSES,
  INITIAL_EXAMS,
  INITIAL_STUDENTS,
  INITIAL_TASKS,
  INITIAL_SUBMISSIONS
} from './data/mockData';
import { THPT_INITIAL_EXAMS } from './data/thptMockBank';

import { ClassItem, ExamItem, StudentItem, HomeworkTask, AiQuota, SubmissionItem, AuthUser, UserRole, AssignmentConfig } from './types';
import {
  apiService,
  loadLocalState,
  saveLocalState,
  markExamAsDeleted,
  getDeletedExamIds,
  markClassAsDeleted,
  unmarkClassAsDeleted,
  getDeletedClassIds,
  markStudentAsDeleted,
  unmarkStudentAsDeleted,
  getDeletedStudentIds
} from './services/apiService';
import { authService, runSecurityStorageCleanup } from './services/authService';
import { LoginModal } from './components/LoginModal';
import { StudentDashboardView } from './components/StudentDashboardView';
import { Forbidden403View } from './components/Forbidden403View';
import { SecurityAlertModal } from './components/SecurityAlertModal';

// Run security cleanup immediately on app load to sanitize local storage and eliminate leaked strings
runSecurityStorageCleanup();

export default function App() {
  // Authentication & RBAC User State
  const [user, setUser] = useState<AuthUser | null>(() => authService.getStoredUser());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalRole, setLoginModalRole] = useState<UserRole>('teacher');
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register'>('login');
  const [securityAlert, setSecurityAlert] = useState<{ isOpen: boolean; message?: string } | null>(null);

  // Navigation State: default to 'dashboard' for teacher, 'student-exams' for student
  const [activeMenu, setActiveMenu] = useState<string>(() => {
    const stored = authService.getStoredUser();
    return stored?.role === 'student' ? 'student-exams' : 'dashboard';
  });
  const [isStudentMode, setIsStudentMode] = useState(false);

  // Collapsible Sidebar State with localStorage persistence
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isSidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('isSidebarCollapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Cached Local Hydration
  const local = useMemo(() => loadLocalState(), []);

  // Core Data State - with robust fallback so arrays are NEVER blanked out
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    if (local.classes && Array.isArray(local.classes) && local.classes.length > 0) {
      return local.classes;
    }
    try {
      const backup = localStorage.getItem('eng_classes_backup_v1');
      if (backup && backup !== '[]' && backup !== 'null') {
        const parsed = JSON.parse(backup);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CLASSES;
  });

  const [exams, setExams] = useState<ExamItem[]>(() => {
    const baseExams = (local.exams && local.exams.length > 0) ? local.exams : INITIAL_EXAMS;
    const map = new Map(baseExams.map(e => [e.id, e]));
    THPT_INITIAL_EXAMS.forEach(te => {
      if (!map.has(te.id)) {
        map.set(te.id, te);
      }
    });
    return Array.from(map.values());
  });

  const [students, setStudents] = useState<StudentItem[]>(() => {
    if (local.students && Array.isArray(local.students) && local.students.length > 0) {
      return local.students;
    }
    try {
      const backup = localStorage.getItem('eng_students_backup_v1') || localStorage.getItem('eng_students_latest_backup');
      if (backup && backup !== '[]' && backup !== 'null') {
        const parsed = JSON.parse(backup);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_STUDENTS;
  });

  const [tasks, setTasks] = useState<HomeworkTask[]>(() => (local.tasks && local.tasks.length > 0) ? local.tasks : INITIAL_TASKS);
  const [aiUsage, setAiUsage] = useState<AiQuota>(() => local.aiUsage || { used: 0, limit: 5 });
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(() => 
    (local.submissions && local.submissions.length > 0) ? local.submissions : INITIAL_SUBMISSIONS
  );

  // Modals State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiModalTab, setAiModalTab] = useState<'ai' | 'manual'>('ai');
  const [showClassModal, setShowClassModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedExamForPreview, setSelectedExamForPreview] = useState<ExamItem | null>(null);
  const [selectedExamForAssign, setSelectedExamForAssign] = useState<ExamItem | null>(null);
  const [selectedExamForResults, setSelectedExamForResults] = useState<ExamItem | null>(null);

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Synchronize with Central Server Database
  useEffect(() => {
    // Check URL parameters for direct student access (?mode=student or ?pin=...)
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'student' || params.get('pin')) {
      setIsStudentMode(true);
    }

    const fetchServerData = async () => {
      const serverData = await apiService.getFullDatabase();
      if (!serverData) return;

      // 1. Synchronously resolve current local classes
      let localClassesList: ClassItem[] = [];
      try {
        const stored = localStorage.getItem('eng_classes_v1') || localStorage.getItem('eng_classes_backup_v1');
        if (stored && stored !== '[]' && stored !== 'null') {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) localClassesList = parsed;
        }
      } catch {}
      if (localClassesList.length === 0) {
        localClassesList = classes.length > 0 ? classes : INITIAL_CLASSES;
      }

      const deletedClassIds = getDeletedClassIds();
      const classMap = new Map(localClassesList.map(c => [c.id, c]));
      if (Array.isArray(serverData.classes)) {
        serverData.classes.forEach(sc => {
          if (!deletedClassIds.has(sc.id)) {
            if (!classMap.has(sc.id)) {
              classMap.set(sc.id, sc);
            } else {
              const current = classMap.get(sc.id)!;
              classMap.set(sc.id, { ...current, ...sc });
            }
          }
        });
      }
      const finalClasses = Array.from(classMap.values()).filter(c => !deletedClassIds.has(c.id));

      // 2. Synchronously resolve current local students
      let localStudentsList: StudentItem[] = [];
      try {
        const stored = localStorage.getItem('eng_students_v1') || localStorage.getItem('eng_students_backup_v1') || localStorage.getItem('eng_students_latest_backup');
        if (stored && stored !== '[]' && stored !== 'null') {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) localStudentsList = parsed;
        }
      } catch {}
      if (localStudentsList.length === 0) {
        localStudentsList = students.length > 0 ? students : INITIAL_STUDENTS;
      }

      const deletedStudentIds = getDeletedStudentIds();
      const studentMap = new Map(localStudentsList.map(s => [s.id, s]));
      if (Array.isArray(serverData.students)) {
        serverData.students.forEach(ss => {
          if (!deletedStudentIds.has(ss.id)) {
            if (!studentMap.has(ss.id)) {
              studentMap.set(ss.id, ss);
            } else {
              const current = studentMap.get(ss.id)!;
              studentMap.set(ss.id, { ...current, ...ss });
            }
          }
        });
      }
      let finalStudents = Array.from(studentMap.values()).filter(s => !deletedStudentIds.has(s.id));

      // Synchronize classId & className mappings
      const classIdSet = new Set(finalClasses.map(c => c.id));
      const classMapByName = new Map(finalClasses.map(c => [c.name.toLowerCase().trim(), c.id]));
      finalStudents = finalStudents.map(st => {
        if (classIdSet.has(st.classId)) return st;
        const normName = (st.className || '').toLowerCase().trim();
        const matchedId = classMapByName.get(normName);
        if (matchedId) {
          const clsObj = finalClasses.find(c => c.id === matchedId);
          return { ...st, classId: matchedId, className: clsObj ? clsObj.name : st.className };
        }
        // Auto-preserve class if missing so students are never lost or orphaned
        const targetName = st.className && st.className.trim() ? st.className.trim() : `Lớp ${st.classId}`;
        const autoClsId = st.classId || `c-auto-${Date.now()}`;
        const autoGrade = targetName.includes('10') ? 'Lớp 10' : targetName.includes('11') ? 'Lớp 11' : targetName.includes('12') ? 'Lớp 12' : 'Toàn trường';
        const newClass: ClassItem = {
          id: autoClsId,
          name: targetName.toLowerCase().startsWith('lớp') ? targetName : `Lớp ${targetName}`,
          grade: autoGrade,
          code: `LH-${Math.floor(100 + Math.random() * 900)}`,
          studentsCount: 1,
          activeExams: 0,
          pin: String(Math.floor(1000 + Math.random() * 9000)),
          description: 'Lớp học được bảo toàn tự động từ danh sách học sinh'
        };
        finalClasses.push(newClass);
        classIdSet.add(autoClsId);
        classMapByName.set(newClass.name.toLowerCase().trim(), autoClsId);
        return {
          ...st,
          classId: autoClsId,
          className: newClass.name
        };
      });

      // Recalculate studentsCount on all classes accurately
      finalClasses.forEach(c => {
        const count = finalStudents.filter(s => s.classId === c.id || (s.className && s.className.toLowerCase() === c.name.toLowerCase())).length;
        c.studentsCount = count;
      });

      setClasses(finalClasses);
      setStudents(finalStudents);
      saveLocalState({ classes: finalClasses, students: finalStudents });

      // Merge Exams
      if (serverData.exams && serverData.exams.length > 0) {
        setExams(prevExams => {
          let localList = prevExams;
          try {
            const localStored = localStorage.getItem('EDUADMIN_EXAM_BANK');
            if (localStored) {
              const parsed = JSON.parse(localStored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                localList = parsed;
              }
            }
          } catch {}

          const deletedIds = getDeletedExamIds();
          const existingIds = new Set(localList.map(e => e.id));
          const merged = [...localList].filter(e => !deletedIds.has(e.id));
          serverData.exams.forEach(se => {
            if (!existingIds.has(se.id) && !deletedIds.has(se.id)) {
              merged.push(se);
              existingIds.add(se.id);
            }
          });
          try {
            localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      // Sync upward to server if server was missing any classes or students
      if (finalClasses.length > (serverData.classes?.length || 0) || finalStudents.length > (serverData.students?.length || 0)) {
        apiService.syncToServer({ classes: finalClasses, students: finalStudents });
      }

      if (serverData.tasks && serverData.tasks.length > 0) {
        setTasks(serverData.tasks);
      }
      if (serverData.submissions && serverData.submissions.length > 0) {
        setSubmissions(serverData.submissions);
      }
      if (serverData.aiUsage) {
        setAiUsage(serverData.aiUsage);
      }
    };

    fetchServerData();
    const interval = setInterval(fetchServerData, 7000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleSaveExam = (newExam: ExamItem) => {
    const updated = [newExam, ...exams.filter(e => e.id !== newExam.id)];
    setExams(updated);
    saveLocalState({ exams: updated });
    try {
      localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(updated));
    } catch {}
    apiService.createOrUpdateExam(newExam);
    showToast(`Đã lưu bền vững bộ đề "${newExam.title}" vào kho bài tập!`);
  };

  const handleAddClass = (newCls: ClassItem) => {
    unmarkClassAsDeleted(newCls.id);
    const updated = [...classes.filter(c => c.id !== newCls.id), newCls];
    setClasses(updated);
    saveLocalState({ classes: updated });
    try {
      localStorage.setItem('eng_classes_backup_v1', JSON.stringify(updated));
    } catch {}
    apiService.createOrUpdateClass(newCls);
    apiService.syncToServer({ classes: updated });
    showToast(`Tạo thành công lớp "${newCls.name}" (Mã PIN: ${newCls.pin})`);
  };

  const handleAddStudent = (newStudent: StudentItem) => {
    unmarkStudentAsDeleted(newStudent.id);
    const updatedStudents = [newStudent, ...students.filter(s => s.id !== newStudent.id)];
    setStudents(updatedStudents);

    const updatedClasses = classes.map(c => {
      const count = updatedStudents.filter(s => s.classId === c.id || (s.className && s.className.toLowerCase() === c.name.toLowerCase())).length;
      return { ...c, studentsCount: count };
    });
    setClasses(updatedClasses);

    saveLocalState({ students: updatedStudents, classes: updatedClasses });
    try {
      localStorage.setItem('eng_students_backup_v1', JSON.stringify(updatedStudents));
      localStorage.setItem('eng_students_latest_backup', JSON.stringify(updatedStudents));
      localStorage.setItem('eng_classes_backup_v1', JSON.stringify(updatedClasses));
    } catch {}
    apiService.createOrUpdateStudent(newStudent);
    apiService.syncToServer({ students: updatedStudents, classes: updatedClasses });
    showToast(`Đã thêm học sinh ${newStudent.name} vào hệ thống!`);
  };

  const handleImportBatchStudents = (newStudentsList: StudentItem[], autoCreatedClasses: ClassItem[]) => {
    newStudentsList.forEach(s => unmarkStudentAsDeleted(s.id));
    if (autoCreatedClasses && autoCreatedClasses.length > 0) {
      autoCreatedClasses.forEach(c => unmarkClassAsDeleted(c.id));
    }

    const updatedStudents = [...newStudentsList, ...students.filter(s => !newStudentsList.some(ns => ns.id === s.id))];
    setStudents(updatedStudents);

    const combined = [...classes];
    if (autoCreatedClasses && autoCreatedClasses.length > 0) {
      autoCreatedClasses.forEach(nc => {
        if (!combined.some(c => c.id === nc.id || c.name.toLowerCase() === nc.name.toLowerCase())) {
          combined.push(nc);
        }
      });
    }

    const updatedClasses = combined.map(c => {
      const count = updatedStudents.filter(s => s.classId === c.id || (s.className && s.className.toLowerCase() === c.name.toLowerCase())).length;
      return { ...c, studentsCount: count };
    });

    setClasses(updatedClasses);
    saveLocalState({ students: updatedStudents, classes: updatedClasses });
    try {
      localStorage.setItem('eng_students_backup_v1', JSON.stringify(updatedStudents));
      localStorage.setItem('eng_students_latest_backup', JSON.stringify(updatedStudents));
      localStorage.setItem('eng_classes_backup_v1', JSON.stringify(updatedClasses));
    } catch {}
    apiService.batchAddStudents(newStudentsList, autoCreatedClasses);
    apiService.syncToServer({ students: updatedStudents, classes: updatedClasses });
    showToast(`Đã lưu bền vững ${newStudentsList.length} học sinh từ file Excel vào hệ thống!`);
  };

  const handleUpdateStudent = (updatedStudent: StudentItem) => {
    const updatedStudents = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudents(updatedStudents);
    saveLocalState({ students: updatedStudents });
    try {
      localStorage.setItem('eng_students_backup_v1', JSON.stringify(updatedStudents));
      localStorage.setItem('eng_students_latest_backup', JSON.stringify(updatedStudents));
    } catch {}
    apiService.createOrUpdateStudent(updatedStudent);
    apiService.syncToServer({ students: updatedStudents });
    showToast(`Đã cập nhật thông tin học sinh ${updatedStudent.name}!`, 'success');
  };

  const handleDeleteStudent = (studentId: string) => {
    markStudentAsDeleted(studentId);
    const targetStudent = students.find(s => s.id === studentId);
    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);

    const updatedClasses = classes.map(c => {
      const count = updatedStudents.filter(s => s.classId === c.id || (s.className && s.className.toLowerCase() === c.name.toLowerCase())).length;
      return { ...c, studentsCount: count };
    });
    setClasses(updatedClasses);

    saveLocalState({ students: updatedStudents, classes: updatedClasses });
    try {
      localStorage.setItem('eng_students_backup_v1', JSON.stringify(updatedStudents));
      localStorage.setItem('eng_students_latest_backup', JSON.stringify(updatedStudents));
      localStorage.setItem('eng_classes_backup_v1', JSON.stringify(updatedClasses));
    } catch {}
    apiService.deleteStudent(studentId);
    apiService.syncToServer({ students: updatedStudents, classes: updatedClasses });
    showToast(`Đã xóa học sinh khỏi danh sách lớp!`, 'info');
  };

  const handleDeleteClass = (classId: string) => {
    markClassAsDeleted(classId);
    const targetClass = classes.find(c => c.id === classId);
    const updatedClasses = classes.filter(c => c.id !== classId);
    setClasses(updatedClasses);
    saveLocalState({ classes: updatedClasses });
    apiService.deleteClass(classId);
    apiService.syncToServer({ classes: updatedClasses });
    showToast(`Đã xóa lớp "${targetClass?.name || classId}"!`, 'info');
  };

  const handleAssignSuccess = (details: AssignmentConfig) => {
    // 1. Update the target exam with new assignment settings
    let found = false;
    let updatedExams = exams.map(e => {
      if (e.id === details.examId) {
        found = true;
        return {
          ...e,
          assignedClasses: details.classNames,
          assignedClassIds: details.classIds,
          deadline: `${details.deadline} ${details.deadlineTime || '23:59'}`,
          deadlineTime: details.deadlineTime,
          duration: details.durationLimit !== 'Không giới hạn' ? details.durationLimit : e.duration,
          durationLimit: details.durationLimit,
          maxAttempts: details.maxAttempts,
          scoringMethod: details.scoringMethod,
          shuffleQuestions: details.shuffleQuestions,
          shuffleOptions: details.shuffleOptions,
          preventCheating: details.preventCheating,
          showSolutions: details.showSolutions,
        };
      }
      return e;
    });

    if (!found && selectedExamForAssign) {
      const assignedNew: ExamItem = {
        ...selectedExamForAssign,
        assignedClasses: details.classNames,
        assignedClassIds: details.classIds,
        deadline: `${details.deadline} ${details.deadlineTime || '23:59'}`,
        deadlineTime: details.deadlineTime,
        duration: details.durationLimit !== 'Không giới hạn' ? details.durationLimit : selectedExamForAssign.duration,
        durationLimit: details.durationLimit,
        maxAttempts: details.maxAttempts,
        scoringMethod: details.scoringMethod,
        shuffleQuestions: details.shuffleQuestions,
        shuffleOptions: details.shuffleOptions,
        preventCheating: details.preventCheating,
        showSolutions: details.showSolutions,
      };
      updatedExams = [assignedNew, ...updatedExams];
      apiService.createOrUpdateExam(assignedNew);
    }

    setExams(updatedExams);

    // 2. Increment active exams count for assigned classes
    const updatedClasses = classes.map(c => {
      if (details.classNames.includes(c.name) || details.classIds.includes(c.id)) {
        return { ...c, activeExams: c.activeExams + 1 };
      }
      return c;
    });
    setClasses(updatedClasses);

    // 3. Persist and sync
    saveLocalState({ exams: updatedExams, classes: updatedClasses });
    apiService.syncToServer({ exams: updatedExams, classes: updatedClasses });

    const attemptsLabel = details.maxAttempts === 1
      ? 'Chỉ làm 1 lần (Kiểm tra)'
      : details.maxAttempts === 0
      ? 'Không giới hạn số lần làm'
      : `Tối đa ${details.maxAttempts} lần làm`;

    showToast(`Đã phát hành "${details.examTitle}" tới ${details.classNames.join(', ')} (${attemptsLabel})!`);
  };

  // Instant state update for an exam (shuffle toggle, content edits)
  const handleUpdateExam = (updatedExam: ExamItem) => {
    setExams(prev => {
      const next = prev.map(e => (e.id === updatedExam.id ? updatedExam : e));
      saveLocalState({ exams: next });
      try {
        localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(next));
        localStorage.setItem('eng_exams_v1', JSON.stringify(next));
      } catch {}
      return next;
    });

    setSelectedExamForPreview(prev => (prev && prev.id === updatedExam.id ? updatedExam : prev));
    apiService.createOrUpdateExam(updatedExam);
  };

  // Direct assignment from THPT Exam Hub (syncs seamlessly to Student Portal)
  const handleAssignThptExamDirectly = (assignedExam: ExamItem) => {
    // 1. Update or prepend in central exams state
    setExams(prevExams => {
      const exists = prevExams.some(e => e.id === assignedExam.id);
      const updated = exists
        ? prevExams.map(e => e.id === assignedExam.id ? assignedExam : e)
        : [assignedExam, ...prevExams];

      saveLocalState({ exams: updated });
      try {
        localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(updated));
      } catch {}
      apiService.createOrUpdateExam(assignedExam);
      apiService.syncToServer({ exams: updated });
      return updated;
    });

    // 2. Also keep THPT_SAVED_EXAMS_BANK in sync in localStorage
    try {
      const stored = localStorage.getItem('THPT_SAVED_EXAMS_BANK');
      let thptList: ExamItem[] = stored ? JSON.parse(stored) : [];
      const thptExists = thptList.some(e => e.id === assignedExam.id);
      const updatedThpt = thptExists
        ? thptList.map(e => e.id === assignedExam.id ? assignedExam : e)
        : [assignedExam, ...thptList];
      localStorage.setItem('THPT_SAVED_EXAMS_BANK', JSON.stringify(updatedThpt));
    } catch {}

    // 3. Increment active exams count for assigned classes if assigned
    const hasAssignments = Boolean(
      (assignedExam.assignedClasses && assignedExam.assignedClasses.length > 0) ||
      (assignedExam.assignedClassIds && assignedExam.assignedClassIds.length > 0)
    );

    if (hasAssignments) {
      setClasses(prevClasses => {
        const updatedClasses = prevClasses.map(c => {
          const isTarget =
            assignedExam.assignedClassIds?.includes(c.id) ||
            assignedExam.assignedClasses?.some(cn =>
              cn.toLowerCase().trim() === c.name.toLowerCase().trim() ||
              cn.toLowerCase().replace(/^lớp\s+/i, '').trim() === c.name.toLowerCase().replace(/^lớp\s+/i, '').trim()
            );
          if (isTarget) {
            return { ...c, activeExams: Math.max(1, (c.activeExams || 0) + 1) };
          }
          return c;
        });
        saveLocalState({ classes: updatedClasses });
        apiService.syncToServer({ classes: updatedClasses });
        return updatedClasses;
      });
    }
  };

  const handleIncrementAiUsage = () => {
    setAiUsage(prev => {
      const next = { ...prev, used: Math.min(prev.used + 1, prev.limit) };
      saveLocalState({ aiUsage: next });
      apiService.syncToServer({ aiUsage: next });
      return next;
    });
  };

  const handleCopyClassLink = (cls: ClassItem) => {
    const link = `${window.location.origin}?mode=student&pin=${cls.pin}`;
    navigator.clipboard.writeText(link);
    showToast(`Đã sao chép link làm bài lớp "${cls.name}" (Mã PIN: ${cls.pin})!`);
  };

  // Handlers
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setSecurityAlert(null);
    showToast('Đã đăng xuất an toàn khỏi hệ thống.');
  };

  const handleOpenLoginModal = (targetRole: UserRole, mode: 'login' | 'register' = 'login') => {
    // STRICT RBAC ROUTE GUARD:
    // If an active student attempts to switch or access teacher admin login
    if (user?.role === 'student' && targetRole === 'teacher') {
      setSecurityAlert({
        isOpen: true,
        message: `Bạn đang đăng nhập bằng tài khoản Học sinh (${user.name}). Theo chính sách kiểm soát phân quyền (RBAC), tài khoản học sinh bị chặn truy cập Cổng Quản Trị Giáo Viên. Vui lòng bấm Đăng xuất tài khoản học sinh trước khi xác thực tài khoản Giáo viên!`
      });
      return;
    }

    setLoginModalRole(targetRole);
    setLoginModalMode(mode);
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (loggedInUser: AuthUser) => {
    setShowLoginModal(false);
    setUser(loggedInUser);
    setSecurityAlert(null);
    setActiveMenu(loggedInUser.role === 'teacher' ? 'dashboard' : 'student-exams');

    // Automatically sync newly registered student with teacher's student roster
    if (loggedInUser.role === 'student') {
      setStudents(prev => {
        const exists = prev.some(s => s.name === loggedInUser.name || (s.studentId && s.studentId === loggedInUser.studentId));
        if (!exists) {
          const newStudentItem: StudentItem = {
            id: loggedInUser.id,
            name: loggedInUser.name,
            studentId: loggedInUser.studentId || `HS-${Math.floor(1000 + Math.random() * 9000)}`,
            classId: loggedInUser.classId || 'cls-1',
            className: loggedInUser.className || 'Lớp 12A1',
            avatar: loggedInUser.avatar || 'HS',
            progress: 0,
            lastScore: 0,
            status: 'Chưa làm',
            completedExams: 0
          };
          const updated = [newStudentItem, ...prev];
          saveLocalState({ students: updated });
          return updated;
        }
        return prev;
      });
    }

    showToast(`Xin chào ${loggedInUser.name} (${loggedInUser.role === 'teacher' ? 'Giáo viên Quản trị' : 'Học sinh'})!`);
  };

  const totalStudents = useMemo(() => {
    return students.length;
  }, [students]);

  const totalSubmissions = useMemo(() => {
    return exams.reduce((sum, e) => sum + e.submissions, 0);
  }, [exams]);

  // SCREEN 1: UNORIENTED / LOGGED-OUT STATE (When no user session exists)
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans antialiased flex flex-col">
        {/* Toast Pop-up */}
        {toast && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Top Navigation Bar: Unauthenticated state per Requirement 1 */}
        <TopHeader
          user={null}
          onOpenLoginModal={(role, mode) => handleOpenLoginModal(role, mode || 'login')}
          onLogout={handleLogout}
        />

        {/* Portal Gateway Body */}
        <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 md:p-10 max-w-5xl w-full mx-auto space-y-8 my-auto">
          {/* Welcome Text */}
          <div className="text-center space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Nền Tảng Trợ Lý Khảo Thí & Ôn Thi Tiếng Anh AI</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Chào mừng đến với Hệ thống Giáo dục <span className="text-blue-600">Thầy Dương Văn Bình</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
              Hệ thống khảo thí thông minh hỗ trợ giáo viên tạo đề thi trắc nghiệm theo cấu trúc ma trận của Bộ GD&ĐT, đồng thời cung cấp cổng luyện thi cá nhân hóa cho học sinh.
            </p>
          </div>

          {/* 2 Portal Gateway Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Teacher Gateway Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center font-bold">
                  <School className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 mb-1">
                    DÀNH CHO GIÁO VIÊN
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    Cổng Quản Trị Giáo Viên
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Truy cập Studio soạn đề AI, duyệt ngân hàng câu hỏi chuẩn Bộ GD&ĐT, quản lý danh sách lớp học và theo dõi bảng điểm học sinh.
                  </p>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Tạo đề AI 3 bước chuẩn ma trận & xuất bản tức thì</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Quản lý danh sách học sinh và tạo lớp học bằng mã PIN</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Giao đề trắc nghiệm và xem bảng xếp hạng lớp học</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenLoginModal('teacher', 'login')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <School className="w-4 h-4" />
                  <span>Đăng nhập Giáo viên</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenLoginModal('teacher', 'register')}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition border border-blue-200 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Đăng ký tài khoản giáo viên mới</span>
                </button>
              </div>
            </div>

            {/* Student Gateway Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center font-bold">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 mb-1">
                    DÀNH CHO HỌC SINH
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    Cổng Học Tập Học Sinh
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Vào không gian làm bài trắc nghiệm trực tuyến được Thầy Bình giao, nộp ảnh chụp vở học và nhận phân tích chẩn đoán lỗi sai AI.
                  </p>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Làm bài kiểm tra trắc nghiệm bấm giờ theo lớp trực thuộc</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Xem điểm ngay kèm giải thích chi tiết & chẩn đoán lỗi sai AI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Theo dõi lịch nộp bài tập và lịch sử rèn luyện cá nhân</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenLoginModal('student', 'login')}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Đăng nhập Học sinh</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenLoginModal('student', 'register')}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đăng ký tài khoản học sinh mới</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Login Modal */}
        {showLoginModal && (
          <LoginModal
            initialRole={loginModalRole}
            initialMode={loginModalMode}
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    );
  }

  // Active Role Flags (Role-Based Access Control)
  const isTeacher = user.role === 'teacher';
  const isStudent = user.role === 'student';

  // Resolved Student Class for perfect synchronization between TopHeader & Dashboard View
  const currentStudentClass = classes.find(c => 
    (user.classId && c.id === user.classId) || 
    (user.className && c.name.toLowerCase() === user.className.toLowerCase())
  ) || classes[0];
  const studentDisplayClassName = currentStudentClass?.name || 'Lớp 12G09';

  // SCREEN 2: STUDENT PORTAL (Strictly Isolated - Zero Sidebar per Requirement 3)
  if (isStudent) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans antialiased flex flex-col">
        {/* Toast Pop-up */}
        {toast && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Top Header: Authenticated Student */}
        <TopHeader
          user={user}
          currentClassName={studentDisplayClassName}
          onOpenLoginModal={(role, mode) => handleOpenLoginModal(role, mode || 'login')}
          onLogout={handleLogout}
        />

        {/* Main Body: Zero Sidebar, Full Student Space */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto space-y-6">
          {activeMenu === 'student-live-voice' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-700">
                    Phòng Luyện Nói Tiếng Anh với Gemini 3.8 Live (Live API)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMenu('student-exams')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  ← Quay lại trang học sinh
                </button>
              </div>
              <AiVoiceConversationView
                user={user}
                onShowToast={(msg, type) => showToast(msg, type)}
              />
            </div>
          ) : (
            <StudentDashboardView
              user={user}
              classes={classes}
              exams={exams}
              tasks={tasks}
              submissions={submissions}
              students={students}
              activeStudentSection={
                activeMenu === 'english-skills' || activeMenu === 'student-skills'
                  ? 'skills'
                  : activeMenu === 'student-results'
                  ? 'results'
                  : activeMenu === 'student-tasks'
                  ? 'tasks'
                  : activeMenu === 'student-profile'
                  ? 'profile'
                  : 'exams'
              }
              onSectionChange={(sec) => {
                if (sec === 'skills') {
                  setActiveMenu('english-skills');
                } else if (sec === 'exams') {
                  setActiveMenu('student-exams');
                } else if (sec === 'live-voice') {
                  setActiveMenu('student-live-voice');
                } else {
                  setActiveMenu(`student-${sec}`);
                }
              }}
              onSubmissionSuccess={(newSub) => {
                const updatedSubs = [newSub, ...submissions];
                setSubmissions(updatedSubs);
                const updatedExams = exams.map(e => e.id === newSub.examId ? { ...e, submissions: e.submissions + 1 } : e);
                setExams(updatedExams);
                saveLocalState({ submissions: updatedSubs, exams: updatedExams });
                showToast(`Đã nộp bài thi thành công! Điểm số: ${newSub.score}/10`);
              }}
              onTaskSubmit={(taskId) => {
                const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, submittedCount: t.submittedCount + 1 } : t);
                setTasks(updatedTasks);
                saveLocalState({ tasks: updatedTasks });
                showToast(`Đã nộp bài tập thành công!`);
              }}
            />
          )}
        </main>

        {/* Security Alert Modal when student tries to access teacher role */}
        {securityAlert?.isOpen && user && (
          <SecurityAlertModal
            user={user}
            isOpen={securityAlert.isOpen}
            message={securityAlert.message}
            onClose={() => setSecurityAlert(null)}
            onLogoutAndSwitch={() => {
              setSecurityAlert(null);
              handleLogout();
              handleOpenLoginModal('teacher', 'login');
            }}
          />
        )}

        {/* Login Modal for switching roles */}
        {showLoginModal && (
          <LoginModal
            initialRole={loginModalRole}
            initialMode={loginModalMode}
            classes={classes}
            students={students}
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    );
  }

  // SCREEN 3: TEACHER STUDIO (Full EduAdmin with Sidebar and Management Tools)
  return (
    <div className="flex h-screen w-full bg-[#f4f7fb] text-slate-800 font-sans overflow-hidden antialiased">
      
      {/* Toast Pop-up */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* LEFT SIDEBAR - Teacher Studio Navigation (Collapsible) */}
      <Sidebar
        user={user}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onOpenAiModal={() => setShowAiModal(true)}
        onOpenAssignModal={() => {
          setSelectedExamForAssign(exams[0]);
          setShowAssignModal(true);
        }}
        onLogout={handleLogout}
      />

      {/* MAIN CONTAINER (Responsive & Expands smoothly when sidebar collapsed) */}
      <div className="flex-1 flex flex-col overflow-y-auto transition-all duration-300 ease-in-out min-w-0">
        
        {/* Sticky Top Header: Authenticated Teacher */}
        <TopHeader
          user={user}
          onOpenLoginModal={(role, mode) => handleOpenLoginModal(role, mode || 'login')}
          onLogout={handleLogout}
        />

        {/* Dynamic Main Body: Auto-expands up to 1680px for widescreen comfort when collapsed */}
        <main className={`p-4 sm:p-6 md:p-8 w-full mx-auto space-y-6 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'max-w-[1680px]' : 'max-w-7xl'
        }`}>

          {/* VIEW: DASHBOARD (MAIN OVERVIEW) */}
          {activeMenu === 'dashboard' && (
                <>
                  {/* 1. Gradient Hero Banner - Trung tâm điều khiển (3x3 Grid) */}
                  <HeroBanner
                    onOpenAiModal={() => {
                      setAiModalTab('ai');
                      setShowAiModal(true);
                    }}
                    onOpenManualModal={() => {
                      setAiModalTab('manual');
                      setShowAiModal(true);
                    }}
                    onOpenClassModal={() => setShowClassModal(true)}
                    onOpenLiveVoice={() => setActiveMenu('ai-train')}
                    onOpenMediaStudio={() => setActiveMenu('media-studio')}
                    onOpenClassList={() => setActiveMenu('students')}
                    onOpenAssignModal={() => {
                      if (exams.length > 0) {
                        setSelectedExamForAssign(exams[0]);
                        setShowAssignModal(true);
                      } else {
                        showToast('Bạn chưa có đề thi nào để giao. Vui lòng tạo đề trước!', 'info');
                        setAiModalTab('ai');
                        setShowAiModal(true);
                      }
                    }}
                    onOpenThptHub={() => setActiveMenu('thpt')}
                    onOpenTasks={() => setActiveMenu('tasks')}
                    onOpenExams={() => setActiveMenu('exams')}
                    onOpenAnalytics={() => setActiveMenu('analytics')}
                    onOpenParentReport={() => {
                      showToast('Chuyển tới danh sách lớp & học sinh để xuất báo cáo phụ huynh.', 'info');
                      setActiveMenu('students');
                    }}
                  />

              {/* 2. 4 Stats Cards */}
              <StatsCards
                classesCount={classes.length}
                studentsCount={totalStudents}
                examsCount={exams.length}
                totalSubmissions={totalSubmissions}
                aiUsage={aiUsage}
              />
            </>
          )}

          {/* VIEW: STUDENTS & CLASSES (QUẢN LÝ LỚP HỌC & BÁO CÁO PHỤ HUYNH) */}
          {(activeMenu === 'students' || activeMenu === 'parents') && (
            <StudentsView
              students={students}
              classes={classes}
              exams={exams}
              submissions={submissions}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddClass={handleAddClass}
              onDeleteClass={handleDeleteClass}
              onOpenClassModal={() => setShowClassModal(true)}
              onImportBatchStudents={handleImportBatchStudents}
              onSendParentReport={(student) => {
                showToast(`Đã xuất báo cáo học tập của em ${student.name} gửi tới ${student.parentPhone}!`);
              }}
              onShowToast={(msg, type) => showToast(msg, type)}
              onSyncToServer={() => {
                apiService.syncToServer({ classes, students });
                showToast('Đã lưu & đồng bộ toàn bộ danh sách lớp và học sinh lên máy chủ!', 'success');
              }}
            />
          )}

          {/* VIEW: EXAMS CATALOG */}
          {activeMenu === 'exams' && (
            <ExamsView
              exams={exams}
              onOpenAiModal={() => {
                setAiModalTab('ai');
                setShowAiModal(true);
              }}
              onOpenManualModal={() => {
                setAiModalTab('manual');
                setShowAiModal(true);
              }}
              onPreviewExam={(exam) => setSelectedExamForPreview(exam)}
              onAssignExam={(exam) => {
                setSelectedExamForAssign(exam);
                setShowAssignModal(true);
              }}
              onUpdateExam={handleUpdateExam}
              onDeleteExam={(examId) => {
                markExamAsDeleted(examId);
                const updated = exams.filter(e => e.id !== examId);
                setExams(updated);
                saveLocalState({ exams: updated });
                try {
                  localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(updated));
                  localStorage.setItem('eng_exams_v1', JSON.stringify(updated));
                } catch {}
                apiService.deleteExam(examId);
                apiService.syncToServer({ exams: updated });
                showToast('Đã xóa vĩnh viễn đề thi khỏi bộ nhớ & hệ thống!', 'info');
              }}
              onRestoreExams={(importedExams) => {
                setExams(importedExams);
                saveLocalState({ exams: importedExams });
                try {
                  localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(importedExams));
                } catch {}
              }}
              onViewExamResults={(exam) => setSelectedExamForResults(exam)}
              onShowToast={(msg, type) => showToast(msg, type)}
            />
          )}

          {/* VIEW: ENGLISH SKILLS (LEXICO & GRAMMAR THEO GLOBAL SUCCESS + 4 KỸ NĂNG) */}
          {activeMenu === 'english-skills' && (
            <EnglishSkillsView
              classes={classes}
              students={students}
              user={user}
              onSaveExam={(newExam) => {
                const updated = [newExam, ...exams];
                setExams(updated);
                saveLocalState({ exams: updated });
                try {
                  localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(updated));
                  localStorage.setItem('eng_exams_v1', JSON.stringify(updated));
                } catch {}
                apiService.createOrUpdateExam(newExam);
                apiService.syncToServer({ exams: updated });
                showToast(`Đã lưu đề "${newExam.title}" vào ngân hàng đề thi!`, 'success');
              }}
              onAssignExam={(exam) => {
                setSelectedExamForAssign(exam);
                setShowAssignModal(true);
              }}
              onStartPractice={(exam) => {
                setSelectedExamForPreview(exam);
              }}
              onShowToast={(msg, type) => showToast(msg, type)}
            />
          )}

          {/* VIEW: TRỢ LÝ AI & LUYỆN NÓI LIVE (GEMINI 3.8 LIVE & FLASH SUITE) */}
          {activeMenu === 'ai-train' && (
            <AiVoiceConversationView
              user={user}
              onOpenAiModal={() => {
                setAiModalTab('ai');
                setShowAiModal(true);
              }}
              onShowToast={(msg, type) => showToast(msg, type)}
            />
          )}

          {/* VIEW: STUDIO VIDEO VEO 3, AUDIO TRANSCRIBE & GOOGLE SEARCH GROUNDING */}
          {activeMenu === 'media-studio' && (
            <AiMediaStudioView
              onShowToast={(msg, type) => showToast(msg, type)}
              onOpenAiExamWithTopic={(topic) => {
                setAiModalTab('ai');
                setShowAiModal(true);
              }}
            />
          )}

          {/* VIEW: ANALYTICS & AI RESULTS */}
          {activeMenu === 'analytics' && (
            <AnalyticsView
              classes={classes}
              exams={exams}
              students={students}
              submissions={submissions}
              onOpenAiModalWithTopic={(topic) => {
                setShowAiModal(true);
              }}
            />
          )}

          {/* VIEW: LUYỆN THI THPT CHUẨN 2026 */}
          {(activeMenu === 'thpt' || activeMenu === 'thpt-hub') && (
            <ThptExamHubView
              classes={classes}
              submissions={submissions}
              students={students}
              allExams={exams}
              onAssignExam={handleAssignThptExamDirectly}
              onSaveSubmissions={(newSubs) => {
                setSubmissions(newSubs);
                saveLocalState({ submissions: newSubs });
              }}
              onShowToast={(msg, type) => showToast(msg, type)}
              onOpenAiModal={() => {
                setAiModalTab('ai');
                setShowAiModal(true);
              }}
              onOpenManualModal={() => {
                setAiModalTab('manual');
                setShowAiModal(true);
              }}
            />
          )}

          {/* VIEW: GIAO NHIỆM VỤ & QUẢN LÝ NHẮC NHỞ HỌC TẬP (PUSH NOTIFICATION SIMULATION) */}
          {activeMenu === 'tasks' && (
            <TasksManagementView
              tasks={tasks}
              exams={exams}
              students={students}
              classes={classes}
              onAddTask={(newTask) => {
                const updatedTasks = [newTask, ...tasks];
                setTasks(updatedTasks);
                saveLocalState({ tasks: updatedTasks });
                apiService.syncToServer({ tasks: updatedTasks });
              }}
              onUpdateTasks={(updatedTasks) => {
                setTasks(updatedTasks);
                saveLocalState({ tasks: updatedTasks });
                apiService.syncToServer({ tasks: updatedTasks });
              }}
              onDeleteTask={(taskId) => {
                const updatedTasks = tasks.filter(t => t.id !== taskId);
                setTasks(updatedTasks);
                saveLocalState({ tasks: updatedTasks });
                apiService.syncToServer({ tasks: updatedTasks });
              }}
              onUpdateExam={handleUpdateExam}
              onViewExamResults={(exam) => setSelectedExamForResults(exam)}
              onShowToast={(msg, type) => showToast(msg, type)}
            />
          )}

          {/* VIEW: THI ĐUA LỚP / LEADERBOARD */}
          {activeMenu === 'leaderboard' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                <span>Bảng thi đua học sinh xuất sắc</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">
                Top học sinh có điểm số và tiến độ hoàn thành cao nhất
              </h2>
              <div className="divide-y divide-slate-100">
                {students
                  .slice()
                  .sort((a, b) => b.lastScore - a.lastScore)
                  .map((s, index) => (
                    <div key={s.id} className="py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full font-extrabold flex items-center justify-center text-xs ${
                          index === 0 ? 'bg-amber-400 text-amber-950' :
                          index === 1 ? 'bg-slate-300 text-slate-800' :
                          index === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">{s.name}</div>
                          <div className="text-xs text-slate-400">{s.className}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm text-blue-700">{s.lastScore.toFixed(1)} điểm</div>
                        <div className="text-[11px] text-slate-400">{s.completedExams} đề đã làm</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* TEACHER-ONLY ADMINISTRATIVE MODALS (Strictly unmounted when role === 'student') */}
      {isTeacher && showAiModal && (
        <AiExamModal
          isOpen={showAiModal}
          defaultTab={aiModalTab}
          onClose={() => setShowAiModal(false)}
          onSaveExam={handleSaveExam}
          aiUsage={aiUsage}
          onIncrementUsage={handleIncrementAiUsage}
          onAssignExamDirectly={(exam) => {
            setSelectedExamForAssign(exam);
            setShowAssignModal(true);
          }}
        />
      )}

      {isTeacher && selectedExamForPreview && (
        <ExamPreviewModal
          exam={selectedExamForPreview}
          onClose={() => setSelectedExamForPreview(null)}
          onAssignExam={(exam) => {
            setSelectedExamForAssign(exam);
            setShowAssignModal(true);
          }}
          onUpdateExam={handleUpdateExam}
          onViewExamResults={(exam) => {
            setSelectedExamForPreview(null);
            setSelectedExamForResults(exam);
          }}
        />
      )}

      {/* MODAL KẾT QUẢ ĐỀ THI ĐÃ GIAO - DANH SÁCH HỌC SINH TỪNG LỚP & XUẤT EXCEL CHUẨN */}
      {isTeacher && selectedExamForResults && (
        <AssignedExamResultsModal
          isOpen={Boolean(selectedExamForResults)}
          onClose={() => setSelectedExamForResults(null)}
          exam={selectedExamForResults}
          classes={classes}
          students={students}
          submissions={submissions}
          onShowToast={(msg, type) => showToast(msg, type)}
        />
      )}

      {isTeacher && showAssignModal && (
        <AssignModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          classes={classes}
          exams={exams}
          selectedExam={selectedExamForAssign}
          onAssignSuccess={handleAssignSuccess}
        />
      )}

      {isTeacher && showClassModal && (
        <ClassModal
          isOpen={showClassModal}
          onClose={() => setShowClassModal(false)}
          onAddClass={handleAddClass}
        />
      )}

      {/* Login Modal for switching or re-authenticating roles */}
      {showLoginModal && (
        <LoginModal
          initialRole={loginModalRole}
          initialMode={loginModalMode}
          classes={classes}
          students={students}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

    </div>
  );
}
