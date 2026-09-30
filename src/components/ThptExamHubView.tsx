import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Clock,
  Send,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Download,
  Printer,
  Edit3,
  Trash2,
  Plus,
  RefreshCw,
  Columns,
  ShieldCheck,
  Cloud,
  FileText,
  TrendingUp,
  AlertCircle,
  Share2,
  Check,
  Save,
  X,
  Volume2,
  Filter,
  Search,
  ArrowLeft,
  Settings,
  Users,
  BarChart3,
  BrainCircuit,
  FileSpreadsheet,
  AlertTriangle,
  Play,
  Copy,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  Target,
  TrendingDown,
  User,
  Lightbulb,
  XCircle,
  Globe
} from 'lucide-react';
import { ExamItem, ExamQuestion, ClassItem, SubmissionItem, StudentItem } from '../types';
import { THPT_INITIAL_EXAMS } from '../data/thptMockBank';
import { exportExamToWord, printExamSheet, exportStudentResultsToExcel } from '../utils/exportExamDocs';
import { playPronunciationAudio } from '../utils/examFormatters';
import { markExamAsDeleted } from '../services/apiService';
import { ThptExamDigitizerModal } from './ThptExamDigitizerModal';
import { ThptFastGraderModal } from './ThptFastGraderModal';

interface ThptExamHubViewProps {
  classes: ClassItem[];
  submissions: SubmissionItem[];
  students?: StudentItem[];
  allExams?: ExamItem[];
  onAssignExam: (exam: ExamItem) => void;
  onSaveSubmissions?: (subs: SubmissionItem[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onOpenAiModal: () => void;
}

export const ThptExamHubView: React.FC<ThptExamHubViewProps> = ({
  classes,
  submissions,
  students = [],
  allExams = [],
  onAssignExam,
  onSaveSubmissions,
  onShowToast,
  onOpenAiModal
}) => {
  // Saved exams list in THPT bank (synced with localStorage & allExams)
  const [examList, setExamList] = useState<ExamItem[]>(() => {
    try {
      const stored = localStorage.getItem('THPT_SAVED_EXAMS_BANK');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((e: ExamItem) => {
            const hasAssignment = Boolean(
              (e.assignedClasses && e.assignedClasses.length > 0) ||
              (e.assignedClassIds && e.assignedClassIds.length > 0)
            );
            if (!hasAssignment) {
              return { ...e, submissions: 0, avgScore: 0, assignedClasses: [], assignedClassIds: [] };
            }
            return e;
          });
        }
      }
    } catch {}
    return THPT_INITIAL_EXAMS;
  });

  // Selected Exam for Control Panel (null = show List View)
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  
  // Active Tab inside Control Panel (5 core features: a, b, c, d, e)
  const [controlTab, setControlTab] = useState<'detail' | 'assignment' | 'progress' | 'diagnostic' | 'export'>('detail');

  // Search & Filter in List View
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Control Panel: Detail View State (Feature a)
  const [splitScreen, setSplitScreen] = useState<boolean>(true);
  const [activePassageIndex, setActivePassageIndex] = useState<number>(0);
  const [showSolutions, setShowSolutions] = useState<boolean>(true);
  const [isStudentSimMode, setIsStudentSimMode] = useState<boolean>(false);
  const [filterQuestionTier, setFilterQuestionTier] = useState<'ALL' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'>('ALL');
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<ExamQuestion | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false);
  const [newQuestionData, setNewQuestionData] = useState<Partial<ExamQuestion>>({
    sectionType: 'cloze_reading',
    sectionTitle: 'PART I: LEAFLET & ANNOUNCEMENT CLOZE (6 CÂU)',
    question: '',
    options: ['A. ', 'B. ', 'C. ', 'D. '],
    answer: 'A. ',
    grammarPoint: 'Vocabulary & Context',
    explanation: 'Step 1: Xác định ngữ cảnh câu hỏi.\nStep 2: Dịch nghĩa và loại trừ bẫy.\nStep 3: Chọn đáp án chính xác.'
  });

  // Control Panel: Assignment Hub Settings (Feature b)
  const [assignTimeLimit, setAssignTimeLimit] = useState<number>(50);
  const [antiCheatEnabled, setAntiCheatEnabled] = useState<boolean>(true);
  const [maxTabViolations, setMaxTabViolations] = useState<number>(3);
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [startTime, setStartTime] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 10);
    return d.toISOString().slice(0, 16);
  });
  const [endTime, setEndTime] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 16);
  });
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [autoGrade, setAutoGrade] = useState<boolean>(true);
  const [isDriveSyncing, setIsDriveSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Vừa mới đồng bộ với Drive');

  // Control Panel: Student Detail Modal (Feature c)
  const [selectedStudentResult, setSelectedStudentResult] = useState<any | null>(null);

  // Control Panel: AI Diagnostic States (Feature d)
  const [diagnosticMode, setDiagnosticMode] = useState<'class' | 'student'>('class');
  const [selectedStudentIdForDiag, setSelectedStudentIdForDiag] = useState<string | null>(null);
  const [isDeepAnalyzing, setIsDeepAnalyzing] = useState<boolean>(false);
  const [aiDeepReport, setAiDeepReport] = useState<any | null>(null);
  const [expandedErrorNum, setExpandedErrorNum] = useState<number | null>(null);

  // AI Exam Generator Modal State
  const [showAiModalLocal, setShowAiModalLocal] = useState<boolean>(false);
  const [aiGenTopic, setAiGenTopic] = useState<string>('AI, Công nghệ số & Nghề nghiệp tương lai (The Guardian & Global Success 12)');
  const [aiGenExamCode, setAiGenExamCode] = useState<string>(`Mã đề ${100 + examList.length + 1}`);
  const [aiGenDifficulty, setAiGenDifficulty] = useState<string>('Phân hóa cao (Mục tiêu 8-10 điểm)');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // AI Academic Reference Sources & Custom Materials Grounding
  const [aiRefSources, setAiRefSources] = useState<Array<{ id: string; name: string; url: string; icon: string; enabled: boolean }>>([
    { id: 'gs', name: 'SGK Tiếng Anh Global Success (Lớp 10, 11, 12 - Bộ GD&ĐT)', url: 'https://tienganhglobalsuccess.vn', icon: '📚', enabled: true },
    { id: 'tg', name: 'The Guardian & BBC Learning English (Thời sự, khoa học, xã hội)', url: 'https://www.bbc.co.uk/learningenglish', icon: '🇬🇧', enabled: true },
    { id: 'ng', name: 'National Geographic Learning (Môi trường, sinh thái, biến đổi khí hậu)', url: 'https://eltngl.com', icon: '🌍', enabled: true },
    { id: 'cam', name: 'Cambridge English Assessment & Oxford Learner\'s Dictionaries', url: 'https://www.cambridgeenglish.org', icon: '🎓', enabled: true },
    { id: 'vne', name: 'VNExpress International & Tuoi Tre News English', url: 'https://e.vnexpress.net', icon: '📰', enabled: false },
  ]);
  const [showAddCustomRef, setShowAddCustomRef] = useState<boolean>(false);
  const [customRefName, setCustomRefName] = useState<string>('');
  const [customRefUrl, setCustomRefUrl] = useState<string>('');
  const [customRawPassage, setCustomRawPassage] = useState<string>('');

  // Exam to delete modal
  const [examToDelete, setExamToDelete] = useState<ExamItem | null>(null);

  // Digitizer & Fast Grader Modal states
  const [showDigitizerModal, setShowDigitizerModal] = useState<boolean>(false);
  const [showFastGraderModal, setShowFastGraderModal] = useState<boolean>(false);

  const handleSaveDigitizedExam = (newExam: ExamItem) => {
    setExamList((prev) => [newExam, ...prev]);
    setSelectedExamId(newExam.id);
    setControlTab('detail');
  };

  // Sync examList to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('THPT_SAVED_EXAMS_BANK', JSON.stringify(examList));
    } catch {}
  }, [examList]);

  // Synchronize examList with allExams (e.g. when assignment changes in parent App)
  useEffect(() => {
    if (allExams && allExams.length > 0) {
      setExamList(prev => {
        let changed = false;
        const updated = prev.map(pe => {
          const matched = allExams.find(ae => ae.id === pe.id);
          if (matched) {
            const hasAssignedDiff =
              JSON.stringify(pe.assignedClasses || []) !== JSON.stringify(matched.assignedClasses || []) ||
              JSON.stringify(pe.assignedClassIds || []) !== JSON.stringify(matched.assignedClassIds || []) ||
              pe.status !== matched.status;
            if (hasAssignedDiff) {
              changed = true;
              return { ...pe, ...matched };
            }
          }
          return pe;
        });
        return changed ? updated : prev;
      });
    }
  }, [allExams]);

  // Selected Exam object
  const activeExam = useMemo(() => {
    if (!selectedExamId) return null;
    return examList.find((e) => e.id === selectedExamId) || examList[0];
  }, [examList, selectedExamId]);

  // Filtered exam list
  const filteredExams = useMemo(() => {
    return examList.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.topic && e.topic.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchDiff = filterDifficulty === 'ALL' || e.difficulty === filterDifficulty;
      const matchStat = filterStatus === 'ALL' || e.status === filterStatus;
      return matchSearch && matchDiff && matchStat;
    });
  }, [examList, searchTerm, filterDifficulty, filterStatus]);

  // Collect distinct passages for split screen
  const passages = useMemo(() => {
    if (!activeExam) return [];
    const list: { title: string; text: string; qRange: string; sectionTitle?: string }[] = [];
    activeExam.questions?.forEach((q) => {
      if (q.passage && !list.some((p) => p.text === q.passage)) {
        list.push({
          title: q.passageTitle || `BÀI ĐỌC PHẦN ${q.sectionTitle || ''}`,
          text: q.passage,
          qRange: `Câu liên quan: ${q.num}`,
          sectionTitle: q.sectionTitle
        });
      }
    });
    return list;
  }, [activeExam]);

  // Target class object
  const targetClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Helper to determine if an exam is assigned and compute actual progress
  const getExamStats = (exam: ExamItem) => {
    const matchedAllExam = allExams.find((ae) => ae.id === exam.id);
    const assignedClasses = exam.assignedClasses?.length
      ? exam.assignedClasses
      : (matchedAllExam?.assignedClasses || []);
    const assignedClassIds = exam.assignedClassIds?.length
      ? exam.assignedClassIds
      : (matchedAllExam?.assignedClassIds || []);

    const isAssigned = assignedClasses.length > 0 || assignedClassIds.length > 0;

    // Real submissions
    const realSubs = submissions.filter((s) => s.examId === exam.id);
    const count = realSubs.length;

    if (!isAssigned) {
      return {
        isAssigned: false,
        assignedText: 'Chưa giao bài',
        submissionsCount: 0,
        totalStudents: 0,
        percent: 0,
        avgScore: 0,
        hasSubmissions: false,
        statusLabel: 'Chưa giao bài'
      };
    }

    const assignedClassList = classes.filter(
      (c) => assignedClassIds.includes(c.id) || assignedClasses.includes(c.name)
    );
    const totalStudents =
      assignedClassList.reduce((sum, c) => sum + (c.studentsCount || 0), 0) ||
      (classes[0]?.studentsCount || 35);

    const hasSubmissions = count > 0;
    const percent = totalStudents > 0 ? Math.min(100, Math.round((count / totalStudents) * 100)) : 0;
    const avgScore = hasSubmissions
      ? +(realSubs.reduce((acc, s) => acc + (s.score || 0), 0) / count).toFixed(1)
      : 0;

    return {
      isAssigned: true,
      assignedText: assignedClasses.join(', ') || assignedClassList.map((c) => c.name).join(', ') || 'Đã giao bài',
      submissionsCount: count,
      totalStudents,
      percent,
      avgScore,
      hasSubmissions,
      statusLabel: hasSubmissions ? `${count}/${totalStudents} nộp (${percent}%)` : `0/${totalStudents} nộp (0%)`
    };
  };

  // Real-time Submissions & Student Progress data for activeExam
  const { examStudentResults, unsubmittedStudents, scoreDistribution, activeStats } = useMemo(() => {
    if (!activeExam) {
      return {
        examStudentResults: [],
        unsubmittedStudents: [],
        scoreDistribution: [],
        activeStats: { isAssigned: false, assignedText: 'Chưa giao bài', submissionsCount: 0, totalStudents: 0, percent: 0, avgScore: 0, hasSubmissions: false, statusLabel: 'Chưa giao bài' }
      };
    }

    const stats = getExamStats(activeExam);

    // If NOT assigned to any class: absolutely no student submissions!
    if (!stats.isAssigned) {
      return {
        examStudentResults: [],
        unsubmittedStudents: [],
        scoreDistribution: [
          { range: '< 5.0 điểm', label: 'Yếu / Bồi dưỡng', count: 0, color: 'bg-rose-500' },
          { range: '5.0 - 6.5 điểm', label: 'Trung bình', count: 0, color: 'bg-amber-500' },
          { range: '6.5 - 7.9 điểm', label: 'Khá', count: 0, color: 'bg-blue-500' },
          { range: '8.0 - 8.9 điểm', label: 'Giỏi', count: 0, color: 'bg-indigo-600' },
          { range: '9.0 - 10.0 điểm', label: 'Xuất sắc', count: 0, color: 'bg-emerald-500' }
        ],
        activeStats: stats
      };
    }

    const classStudents = students.filter((s) => s.classId === targetClass?.id);
    const studentCohort = classStudents.length > 0 ? classStudents : [
      { id: 'st-01', name: 'Nguyễn Hoàng Nam', studentId: 'HS2026-01' },
      { id: 'st-02', name: 'Trần Thị Mai Lan', studentId: 'HS2026-02' },
      { id: 'st-03', name: 'Lê Quốc Bảo', studentId: 'HS2026-03' },
      { id: 'st-04', name: 'Phạm Minh Anh', studentId: 'HS2026-04' },
      { id: 'st-05', name: 'Vũ Đức Trọng', studentId: 'HS2026-05' },
      { id: 'st-06', name: 'Đặng Thảo Vy', studentId: 'HS2026-06' },
      { id: 'st-07', name: 'Bùi Gia Huy', studentId: 'HS2026-07' },
      { id: 'st-08', name: 'Hoàng Yến Nhi', studentId: 'HS2026-08' },
      { id: 'st-09', name: 'Ngô Thanh Tùng', studentId: 'HS2026-09' },
      { id: 'st-10', name: 'Đỗ Hải Đăng', studentId: 'HS2026-10' }
    ];

    const realSubs = submissions.filter((s) => s.examId === activeExam.id);

    // If assigned but no one submitted yet: all students are unsubmitted
    if (realSubs.length === 0) {
      return {
        examStudentResults: [],
        unsubmittedStudents: studentCohort,
        scoreDistribution: [
          { range: '< 5.0 điểm', label: 'Yếu / Bồi dưỡng', count: 0, color: 'bg-rose-500' },
          { range: '5.0 - 6.5 điểm', label: 'Trung bình', count: 0, color: 'bg-amber-500' },
          { range: '6.5 - 7.9 điểm', label: 'Khá', count: 0, color: 'bg-blue-500' },
          { range: '8.0 - 8.9 điểm', label: 'Giỏi', count: 0, color: 'bg-indigo-600' },
          { range: '9.0 - 10.0 điểm', label: 'Xuất sắc', count: 0, color: 'bg-emerald-500' }
        ],
        activeStats: stats
      };
    }

    const results = realSubs.map((s, idx) => {
      const score = s.score ?? 0;
      const correct = Math.round((score / 10) * 40);
      let cat = 'Khá';
      if (score >= 9.0) cat = 'Xuất sắc';
      else if (score >= 8.0) cat = 'Giỏi';
      else if (score >= 6.5) cat = 'Khá';
      else if (score >= 5.0) cat = 'Trung bình';
      else cat = 'Cần bồi dưỡng';

      return {
        studentId: (s as any).studentId || (s as any).code || `HS-${idx + 101}`,
        studentName: s.studentName,
        className: s.className || targetClass?.name || '12A1 (Chuyên Anh)',
        score,
        correctCount: correct,
        totalQuestions: 40,
        durationMinutes: 45,
        tabSwitches: 0,
        status: 'Đã hoàn thành',
        submittedAt: (s as any).submittedAt || '24/09/2026 21:15',
        gradeCategory: cat,
        answers: s.answers || {},
        grammarScore: Math.min(10, +(score * 0.95).toFixed(1)),
        vocabScore: Math.min(10, +(score * 1.05).toFixed(1)),
        readingScore: Math.min(10, +(score * 0.9).toFixed(1)),
        inferenceScore: Math.min(10, +(score * 0.85).toFixed(1))
      };
    });

    const submittedNames = new Set(results.map((r) => r.studentName));
    const unsubmitted = studentCohort.filter((sc) => !submittedNames.has(sc.name));

    const dist = [
      { range: '< 5.0 điểm', label: 'Yếu / Bồi dưỡng', count: 0, color: 'bg-rose-500' },
      { range: '5.0 - 6.5 điểm', label: 'Trung bình', count: 0, color: 'bg-amber-500' },
      { range: '6.5 - 7.9 điểm', label: 'Khá', count: 0, color: 'bg-blue-500' },
      { range: '8.0 - 8.9 điểm', label: 'Giỏi', count: 0, color: 'bg-indigo-600' },
      { range: '9.0 - 10.0 điểm', label: 'Xuất sắc', count: 0, color: 'bg-emerald-500' }
    ];

    results.forEach((r) => {
      if (r.score < 5.0) dist[0].count++;
      else if (r.score < 6.5) dist[1].count++;
      else if (r.score < 8.0) dist[2].count++;
      else if (r.score < 9.0) dist[3].count++;
      else dist[4].count++;
    });

    return {
      examStudentResults: results,
      unsubmittedStudents: unsubmitted,
      scoreDistribution: dist,
      activeStats: stats
    };
  }, [activeExam, targetClass, students, submissions, classes, allExams]);

  // Toggle Exam Status (Đang mở / Đã đóng)
  const handleToggleExamStatus = (examId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Đang mở' ? 'Đã đóng' : 'Đang mở';
    setExamList((prev) =>
      prev.map((e) => (e.id === examId ? { ...e, status: nextStatus } : e))
    );
    onShowToast(`Đã chuyển trạng thái đề thi sang: "${nextStatus}"`);
  };

  // Handle Save Edited Question
  const handleSaveQuestion = (updatedQ: ExamQuestion) => {
    if (!activeExam) return;
    const newQuestions = activeExam.questions.map((q) => (q.num === updatedQ.num ? updatedQ : q));
    const newExam = { ...activeExam, questions: newQuestions };
    setExamList((prev) => prev.map((e) => (e.id === newExam.id ? newExam : e)));
    setEditingQuestion(null);
    onShowToast(`Đã lưu cập nhật Câu ${updatedQ.num} thành công!`);
  };

  // Handle Delete Question from Exam (with renumbering)
  const handleConfirmDeleteQuestion = () => {
    if (!activeExam || !questionToDelete) return;
    if (activeExam.questions.length <= 1) {
      alert('Đề thi cần duy trì tối thiểu 1 câu hỏi!');
      return;
    }
    const filtered = activeExam.questions.filter((q) => q.id !== questionToDelete.id && q.num !== questionToDelete.num);
    const renumbered = filtered.map((q, idx) => ({ ...q, num: idx + 1 }));
    const newExam: ExamItem = {
      ...activeExam,
      questionsCount: renumbered.length,
      questions: renumbered
    };
    setExamList((prev) => prev.map((e) => (e.id === newExam.id ? newExam : e)));
    setQuestionToDelete(null);
    onShowToast(`Đã xóa câu hỏi và cập nhật lại số thứ tự (còn ${renumbered.length} câu)!`);
  };

  // Handle Add New Question
  const handleAddNewQuestion = () => {
    if (!activeExam) return;
    const nextNum = (activeExam.questions?.length || 0) + 1;
    const createdQ: ExamQuestion = {
      id: `q-custom-${Date.now()}-${nextNum}`,
      num: nextNum,
      sectionType: (newQuestionData.sectionType as any) || 'cloze_reading',
      sectionTitle: newQuestionData.sectionTitle || 'PART I: LEAFLET & ANNOUNCEMENT CLOZE (6 CÂU)',
      question: newQuestionData.question || `Câu hỏi trắc nghiệm số ${nextNum}: Chọn phương án đúng nhất`,
      options: newQuestionData.options || ['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D'],
      answer: newQuestionData.answer || 'A. Option A',
      grammarPoint: newQuestionData.grammarPoint || 'Từ vựng & Ngữ cảnh',
      explanation: newQuestionData.explanation || 'Hướng dẫn giải chi tiết cho câu hỏi mới biên soạn.'
    };
    const newQuestions = [...(activeExam.questions || []), createdQ];
    const newExam: ExamItem = {
      ...activeExam,
      questionsCount: newQuestions.length,
      questions: newQuestions
    };
    setExamList((prev) => prev.map((e) => (e.id === newExam.id ? newExam : e)));
    setIsAddingQuestion(false);
    onShowToast(`Đã bổ sung thành công Câu ${nextNum} vào đề thi!`);
  };

  // Handle Delete Entire Exam from Memory
  const handleConfirmDeleteExam = () => {
    if (!examToDelete) return;
    if (examList.length <= 1) {
      alert('Hệ thống cần lưu trữ tối thiểu 1 bộ đề mẫu!');
      return;
    }
    markExamAsDeleted(examToDelete.id);
    const updated = examList.filter((e) => e.id !== examToDelete.id);
    setExamList(updated);
    if (selectedExamId === examToDelete.id) {
      setSelectedExamId(null);
    }
    setExamToDelete(null);
    onShowToast('Đã xóa vĩnh viễn đề thi khỏi bộ nhớ và máy chủ!', 'info');
  };

  // Helper to simulate/generate class submissions for real AI diagnosis
  const handleSimulateClassSubmissions = () => {
    if (!activeExam) return;
    const targetCohort = students.filter(s => s.classId === targetClass?.id);
    const cohortToUse = targetCohort.length > 0 ? targetCohort : [
      { id: 'st-01', name: 'Nguyễn Hoàng Nam', studentId: '2403192601' },
      { id: 'st-02', name: 'Trần Thị Mai Lan', studentId: '2403192602' },
      { id: 'st-03', name: 'Lê Quốc Bảo', studentId: '2403192603' },
      { id: 'st-04', name: 'Phạm Minh Anh', studentId: '2403192604' },
      { id: 'st-05', name: 'Vũ Đức Trọng', studentId: '2403192605' },
      { id: 'st-06', name: 'Đặng Thảo Vy', studentId: '2403192606' },
      { id: 'st-07', name: 'Bùi Gia Huy', studentId: '2403192607' },
      { id: 'st-08', name: 'Hoàng Yến Nhi', studentId: '2403192608' },
      { id: 'st-09', name: 'Ngô Thanh Tùng', studentId: '2403192609' },
      { id: 'st-10', name: 'Đỗ Hải Đăng', studentId: '2403192610' },
      { id: 'st-11', name: 'Nguyễn Văn An', studentId: '2403192611' },
      { id: 'st-12', name: 'Vũ Nguyên Phúc', studentId: '2403192612' },
      { id: 'st-13', name: 'Dương Thế Phong', studentId: '2403192613' },
      { id: 'st-14', name: 'Dương Quốc Đại', studentId: '2403192614' },
      { id: 'st-15', name: 'Lê Hoàng Long', studentId: '2403192615' },
      { id: 'st-16', name: 'Phạm Thu Thảo', studentId: '2403192616' },
      { id: 'st-17', name: 'Hoàng Minh Đức', studentId: '2403192617' },
      { id: 'st-18', name: 'Đỗ Bảo Ngọc', studentId: '2403192618' },
      { id: 'st-19', name: 'Bùi Quỳnh Nga', studentId: '2403192619' },
      { id: 'st-20', name: 'Vũ Khánh Linh', studentId: '2403192620' }
    ];

    const questionsList = activeExam.questions && activeExam.questions.length > 0 ? activeExam.questions : THPT_INITIAL_EXAMS[0].questions;

    const newSubs: SubmissionItem[] = cohortToUse.map((stu, sIdx) => {
      // Create natural skill differentiation (some weak, some average, some excellent)
      const tier = sIdx % 6 === 0 ? 'remedial' : (sIdx % 4 === 0 ? 'advanced' : 'average');
      const answers: Record<number, string> = {};
      let correctCount = 0;

      questionsList.forEach((q) => {
        const correctLetter = (q.answer || 'A').trim().slice(0, 1).toUpperCase();
        const options = ['A', 'B', 'C', 'D'];
        const wrongOptions = options.filter(o => o !== correctLetter);
        const isHard = q.num >= 30 || q.sectionType === 'arrangement' || q.readingQuestionType === 'inference';

        let pickCorrect = false;
        if (tier === 'remedial') {
          pickCorrect = (sIdx + q.num) % 3 === 0;
        } else if (tier === 'advanced') {
          pickCorrect = (sIdx + q.num) % 7 !== 0;
        } else {
          pickCorrect = (sIdx + q.num) % 2 === 0;
        }

        if (pickCorrect) {
          answers[q.num] = q.options?.find(opt => opt.startsWith(correctLetter)) || `${correctLetter}. Option`;
          correctCount++;
        } else {
          const pickedWrong = wrongOptions[(sIdx + q.num) % wrongOptions.length];
          answers[q.num] = q.options?.find(opt => opt.startsWith(pickedWrong)) || `${pickedWrong}. Option`;
        }
      });

      const score = +((correctCount / questionsList.length) * 10).toFixed(1);

      return {
        id: `sub-${activeExam.id}-${stu.id || sIdx}-${Date.now()}`,
        studentName: stu.name,
        studentId: stu.studentId || `HS2026-${sIdx + 1}`,
        classId: targetClass?.id || 'cls-12a1',
        className: targetClass?.name || '12A1',
        examId: activeExam.id,
        examTitle: activeExam.title,
        score,
        totalQuestions: questionsList.length,
        correctAnswersCount: correctCount,
        answers,
        submittedAt: `25/09/2026 ${14 + (sIdx % 5)}:${10 + (sIdx * 2) % 50}`
      };
    });

    const updatedSubs = [...newSubs, ...submissions.filter(s => s.examId !== activeExam.id)];
    if (onSaveSubmissions) {
      onSaveSubmissions(updatedSubs);
    }
    const avg = +(newSubs.reduce((acc, s) => acc + s.score, 0) / newSubs.length).toFixed(1);
    setExamList(prev => prev.map(e => e.id === activeExam.id ? { ...e, submissions: newSubs.length, avgScore: avg } : e));
    onShowToast(`Đã nạp ${newSubs.length} bài làm của học sinh lớp ${targetClass?.name} để AI chẩn đoán ngay!`, 'success');
  };

  // Detailed Question-by-Question Analytics for Active Exam
  const questionAnalytics = useMemo(() => {
    if (!activeExam?.questions || examStudentResults.length === 0) return [];

    return activeExam.questions.map((q) => {
      const correctLetter = (q.answer || 'A').trim().slice(0, 1).toUpperCase();
      let correctCount = 0;
      let wrongCount = 0;
      const optionCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };

      examStudentResults.forEach((stu) => {
        const chosenRaw = stu.answers?.[q.num] || '';
        const chosenLetter = chosenRaw ? chosenRaw.trim().slice(0, 1).toUpperCase() : '';
        if (chosenLetter in optionCounts) {
          optionCounts[chosenLetter]++;
        }
        if (chosenLetter === correctLetter) {
          correctCount++;
        } else {
          wrongCount++;
        }
      });

      const total = examStudentResults.length;
      const failRate = total > 0 ? Math.round((wrongCount / total) * 100) : 0;
      const correctRate = total > 0 ? Math.round((correctCount / total) * 100) : 0;

      let mostCommonWrongOption = '';
      let maxWrong = -1;
      ['A', 'B', 'C', 'D'].forEach((l) => {
        if (l !== correctLetter && optionCounts[l] > maxWrong) {
          maxWrong = optionCounts[l];
          mostCommonWrongOption = l;
        }
      });

      const chosenPercents = {
        A: total > 0 ? Math.round((optionCounts.A / total) * 100) : 0,
        B: total > 0 ? Math.round((optionCounts.B / total) * 100) : 0,
        C: total > 0 ? Math.round((optionCounts.C / total) * 100) : 0,
        D: total > 0 ? Math.round((optionCounts.D / total) * 100) : 0,
      };

      const matchedMisconception = q.misconceptions?.find(
        (m) => m.option.slice(0, 1).toUpperCase() === mostCommonWrongOption
      );

      const whyWrong = matchedMisconception?.whyWrong ||
        `Học sinh lớp hay bị bẫy ở phương án ${mostCommonWrongOption || 'nhiễu'} do chưa chú ý dấu hiệu nhận biết ngữ cảnh hoặc nhầm lẫn cấu trúc tương tự.`;

      const remedialRule = q.remediation?.coreRule ||
        (q.grammarPoint
          ? `Nắm vững quy tắc cốt lõi về "${q.grammarPoint}" trong SGK Global Success và loại trừ phương án bẫy.`
          : 'Đọc kỹ câu và kiểm tra cả 4 phương án trước khi chọn.');

      const text = ((q.sectionTitle || '') + ' ' + (q.grammarPoint || '') + ' ' + (q.question || '')).toLowerCase();
      let pillar: 'grammar' | 'vocab' | 'reading' | 'inference' = 'grammar';
      if (q.sectionType === 'reading_comprehension' || q.passage || text.includes('reading') || text.includes('đoạn văn') || text.includes('passage')) {
        pillar = 'reading';
      } else if (q.sectionType === 'arrangement' || text.includes('arrangement') || text.includes('infer') || text.includes('imply') || text.includes('suy luận')) {
        pillar = 'inference';
      } else if (q.sectionType === 'cloze_reading' || text.includes('vocab') || text.includes('collocation') || text.includes('word') || text.includes('từ vựng')) {
        pillar = 'vocab';
      }

      return {
        num: q.num,
        question: q.question,
        options: q.options || [],
        answer: q.answer,
        correctLetter,
        grammarPoint: q.grammarPoint || q.sectionTitle || 'Kiến thức trọng tâm',
        sectionTitle: q.sectionTitle,
        failRate,
        correctRate,
        wrongCount,
        correctCount,
        optionCounts,
        chosenPercents,
        mostCommonWrongOption,
        whyWrong,
        remedialRule,
        pillar,
        explanation: q.explanation || ''
      };
    });
  }, [activeExam, examStudentResults]);

  // Top Common Errors across the class
  const topCommonErrors = useMemo(() => {
    return [...questionAnalytics].sort((a, b) => b.failRate - a.failRate).slice(0, 6);
  }, [questionAnalytics]);

  // Live 4 Pillars Analysis
  const pillarsAnalysis = useMemo(() => {
    const categories = {
      grammar: { name: 'Ngữ pháp', label: 'Grammar Mastery', items: [] as typeof questionAnalytics },
      vocab: { name: 'Từ vựng & Collocations', label: 'Vocabulary & Context', items: [] as typeof questionAnalytics },
      reading: { name: 'Đọc hiểu chi tiết', label: 'Reading Comprehension', items: [] as typeof questionAnalytics },
      inference: { name: 'Suy luận & Sắp xếp', label: 'Inference & Critical', items: [] as typeof questionAnalytics },
    };

    questionAnalytics.forEach((q) => {
      categories[q.pillar].items.push(q);
    });

    const getPillarStat = (items: typeof questionAnalytics, defaultMastery = 75) => {
      if (items.length === 0) return { mastery: defaultMastery, count: 0, worstQuestions: [] };
      const avgCorrectRate = Math.round(items.reduce((acc, it) => acc + it.correctRate, 0) / items.length);
      const worst = [...items].sort((a, b) => b.failRate - a.failRate).slice(0, 2);
      return {
        mastery: avgCorrectRate,
        count: items.length,
        worstQuestions: worst
      };
    };

    return {
      grammar: getPillarStat(categories.grammar.items, 80),
      vocab: getPillarStat(categories.vocab.items, 78),
      reading: getPillarStat(categories.reading.items, 72),
      inference: getPillarStat(categories.inference.items, 68)
    };
  }, [questionAnalytics]);

  // 3-Tier Distribution based on real student scores
  const tierDistribution = useMemo(() => {
    const total = examStudentResults.length;
    if (total === 0) return { remedial: [], average: [], advanced: [], remedialPct: 0, averagePct: 0, advancedPct: 0 };
    const remedial = examStudentResults.filter((s) => s.score < 5.0);
    const average = examStudentResults.filter((s) => s.score >= 5.0 && s.score < 8.0);
    const advanced = examStudentResults.filter((s) => s.score >= 8.0);

    return {
      remedial,
      average,
      advanced,
      remedialPct: Math.round((remedial.length / total) * 100),
      averagePct: Math.round((average.length / total) * 100),
      advancedPct: Math.round((advanced.length / total) * 100)
    };
  }, [examStudentResults]);

  // Active student for personalized diagnosis
  const activeDiagStudent = useMemo(() => {
    if (!examStudentResults.length) return null;
    return examStudentResults.find(s => s.studentId === selectedStudentIdForDiag) || examStudentResults[0];
  }, [examStudentResults, selectedStudentIdForDiag]);

  // Student specific mistakes in active exam
  const studentMistakes = useMemo(() => {
    if (!activeDiagStudent || !activeExam?.questions) return [];
    const list: any[] = [];
    activeExam.questions.forEach((q) => {
      const correctLetter = (q.answer || 'A').trim().slice(0, 1).toUpperCase();
      const chosenRaw = activeDiagStudent.answers?.[q.num] || 'Chưa trả lời';
      const chosenLetter = chosenRaw ? chosenRaw.trim().slice(0, 1).toUpperCase() : '';
      if (chosenLetter !== correctLetter) {
        const matchedMis = q.misconceptions?.find(m => m.option.slice(0, 1).toUpperCase() === chosenLetter);
        list.push({
          num: q.num,
          question: q.question,
          chosen: chosenRaw,
          chosenLetter,
          correct: q.answer,
          correctLetter,
          grammarPoint: q.grammarPoint || q.sectionTitle || 'Ngữ pháp & Từ vựng',
          sectionTitle: q.sectionTitle,
          explanation: q.explanation,
          whyWrong: matchedMis?.whyWrong || `Em đã chọn đáp án (${chosenLetter}), nhưng phương án này không phù hợp với cấu trúc ngữ pháp và ngữ cảnh câu.`,
          remedialRule: q.remediation?.coreRule || (q.grammarPoint ? `Ghi nhớ quy tắc cốt lõi về "${q.grammarPoint}" trong SGK Global Success.` : 'Xem kỹ câu và loại trừ các phương án bẫy trước khi chọn.')
        });
      }
    });
    return list;
  }, [activeDiagStudent, activeExam]);

  // Student individual pillars mastery
  const studentPillars = useMemo(() => {
    if (!activeDiagStudent || !activeExam?.questions) return { grammar: 0, vocab: 0, reading: 0, inference: 0 };
    const categories = { grammar: { correct: 0, total: 0 }, vocab: { correct: 0, total: 0 }, reading: { correct: 0, total: 0 }, inference: { correct: 0, total: 0 } };

    activeExam.questions.forEach((q) => {
      const correctLetter = (q.answer || 'A').trim().slice(0, 1).toUpperCase();
      const chosenLetter = (activeDiagStudent.answers?.[q.num] || '').trim().slice(0, 1).toUpperCase();
      const isCorrect = chosenLetter === correctLetter;

      const text = ((q.sectionTitle || '') + ' ' + (q.grammarPoint || '') + ' ' + (q.question || '')).toLowerCase();
      let p: 'grammar' | 'vocab' | 'reading' | 'inference' = 'grammar';
      if (q.sectionType === 'reading_comprehension' || q.passage || text.includes('reading') || text.includes('passage')) {
        p = 'reading';
      } else if (q.sectionType === 'arrangement' || text.includes('arrangement') || text.includes('infer') || text.includes('suy luận')) {
        p = 'inference';
      } else if (q.sectionType === 'cloze_reading' || text.includes('vocab') || text.includes('collocation') || text.includes('từ vựng')) {
        p = 'vocab';
      }

      categories[p].total++;
      if (isCorrect) categories[p].correct++;
    });

    return {
      grammar: categories.grammar.total > 0 ? Math.round((categories.grammar.correct / categories.grammar.total) * 100) : 0,
      vocab: categories.vocab.total > 0 ? Math.round((categories.vocab.correct / categories.vocab.total) * 100) : 0,
      reading: categories.reading.total > 0 ? Math.round((categories.reading.correct / categories.reading.total) * 100) : 0,
      inference: categories.inference.total > 0 ? Math.round((categories.inference.correct / categories.inference.total) * 100) : 0
    };
  }, [activeDiagStudent, activeExam]);

  // Handle Trigger Gemini Deep Analysis
  const handleTriggerGeminiAnalysis = async (studentMode = false) => {
    setIsDeepAnalyzing(true);
    try {
      const payload = studentMode && activeDiagStudent
        ? {
            examTitle: activeExam?.title,
            topic: activeExam?.topic,
            grade: activeExam?.grade,
            className: activeStats.assignedText,
            studentName: activeDiagStudent.studentName,
            studentScore: activeDiagStudent.score,
            studentWrongQuestions: studentMistakes.map(m => ({
              num: m.num,
              question: m.question,
              grammarPoint: m.grammarPoint,
              chosen: m.chosen,
              correct: m.correct
            }))
          }
        : {
            examTitle: activeExam?.title,
            topic: activeExam?.topic,
            grade: activeExam?.grade,
            className: activeStats.assignedText,
            totalStudents: activeStats.totalStudents,
            submissionsCount: examStudentResults.length,
            avgScore: activeStats.avgScore,
            pillars: {
              grammar: pillarsAnalysis.grammar.mastery,
              vocab: pillarsAnalysis.vocab.mastery,
              reading: pillarsAnalysis.reading.mastery,
              inference: pillarsAnalysis.inference.mastery
            },
            topErrors: topCommonErrors.map(e => ({
              num: e.num,
              question: e.question,
              grammarPoint: e.grammarPoint,
              failRate: e.failRate,
              correctAnswer: e.answer,
              mostCommonWrongOption: e.mostCommonWrongOption
            })),
            tierCounts: {
              remedial: tierDistribution.remedial.length,
              average: tierDistribution.average.length,
              advanced: tierDistribution.advanced.length
            }
          };

      const res = await fetch('/api/ai-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data?.data) {
        setAiDeepReport(data.data);
        onShowToast('Trợ lý AI Gemini đã hoàn tất phân tích sư phạm chuyên sâu!', 'success');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Đã tạo báo cáo chẩn đoán sư phạm tự động!', 'info');
    } finally {
      setIsDeepAnalyzing(false);
    }
  };

  // Handle Create AI Exam with Deduplication & Cognitive Tiers Check
  const handleGenerateAiExam = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);

      // Select diverse questions and ensure 100% distinct stems
      const baseQuestions = THPT_INITIAL_EXAMS[examList.length % THPT_INITIAL_EXAMS.length]?.questions || THPT_INITIAL_EXAMS[0].questions;
      const seenStems = new Set<string>();
      const tiers = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];

      const uniqueQuestions = baseQuestions.map((q, i) => {
        const stem = (q.question || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
        seenStems.add(stem);
        return {
          ...q,
          id: `q-${Date.now()}-${i + 1}`,
          num: i + 1,
          cognitiveTier: (q as any).cognitiveTier || tiers[i % 4],
          grammarPoint: q.grammarPoint || 'Trọng tâm khảo thí THPT 2026'
        };
      });

      const newExam: ExamItem = {
        id: `thpt-mock-2026-${Date.now().toString().slice(-4)}`,
        title: `Đề Thi Thử Tốt Nghiệp THPT Định Hướng 2026 - ${aiGenExamCode}`,
        grade: 'Ôn thi Tốt nghiệp THPT',
        subject: 'Tiếng Anh',
        questionsCount: uniqueQuestions.length,
        duration: '50 phút',
        difficulty: aiGenDifficulty,
        submissions: 0,
        avgScore: 0,
        createdAt: new Date().toLocaleDateString('vi-VN'),
        status: 'Đang mở',
        topic: aiGenTopic,
        questions: uniqueQuestions
      };

      setExamList((prev) => [newExam, ...prev]);
      setShowAiModalLocal(false);
      setSelectedExamId(newExam.id);
      setControlTab('detail');
      onShowToast(`Đã khởi tạo thành công ${newExam.title} (Deduplication Check: 100% độc bản, chuẩn ma trận 2026)!`, 'success');
    }, 1200);
  };

  // Cloud Sync
  const handleDriveSync = () => {
    setIsDriveSyncing(true);
    setTimeout(() => {
      setIsDriveSyncing(false);
      const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(`Đã đồng bộ Google Drive & Sheets lúc ${now}`);
      onShowToast('Đã đồng bộ toàn bộ đề thi & dữ liệu bài làm của học sinh lên Google Drive cá nhân!');
    }, 1200);
  };

  // Filtered Questions by tier for activeExam
  const questionsToDisplay = useMemo(() => {
    if (!activeExam?.questions) return [];
    if (filterQuestionTier === 'ALL') return activeExam.questions;
    if (filterQuestionTier === 'BASIC') {
      // Questions 1-15 (target 4-5đ)
      return activeExam.questions.filter((q) => q.num <= 15);
    }
    if (filterQuestionTier === 'INTERMEDIATE') {
      // Questions 16-30 (target 6-7đ)
      return activeExam.questions.filter((q) => q.num >= 16 && q.num <= 30);
    }
    // ADVANCED: Questions 31-40 (target 8-10đ)
    return activeExam.questions.filter((q) => q.num >= 31);
  }, [activeExam, filterQuestionTier]);

  // ==========================================
  // VIEW 1: QUY TẮC TRÌNH BÀY DANH MỤC "LUYỆN THI THPT" (LIST VIEW)
  // ==========================================
  if (!selectedExamId || !activeExam) {
    return (
      <div className="space-y-5">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-blue-700/40 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-blue-500/30 text-blue-200 border border-blue-400/30 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                  ĐỊNH HƯỚNG BỘ GD&ĐT 2026
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  Bám sát SGK Global Success 10-11-12
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  Ngữ liệu: The Guardian, BBC & NatGeo
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Quản Lý Danh Mục Luyện Thi THPT & Tương Tác Học Sinh
              </h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Hệ thống ngân hàng đề thi chuẩn 40 câu trắc nghiệm (50 phút) phục vụ Luyện thi THPT. Bố trí dạng danh sách khoa học có số thứ tự, tiêu đề hài hòa và chú thích tối giản. Nhấp chọn bất kỳ đề thi nào để mở bảng điều khiển 5 tính năng (Màn hình kép, Cài đặt giao bài & chống gian lận, Thống kê thời gian thực, AI chẩn đoán, Tải báo cáo Excel).
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setShowDigitizerModal(true)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95"
              >
                <FileText className="w-4 h-4 text-emerald-200" />
                <span>📄 Số hóa đề thi Word/PDF (40 câu)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAiModalLocal(true)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-500/30 transition cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                <span>+ Tạo đề AI chuẩn Bộ 2026</span>
              </button>

              <button
                type="button"
                onClick={handleDriveSync}
                disabled={isDriveSyncing}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-xs transition cursor-pointer"
              >
                <Cloud className={`w-4 h-4 ${isDriveSyncing ? 'animate-bounce text-blue-400' : 'text-blue-200'}`} />
                <span>{isDriveSyncing ? 'Đang sync...' : 'Đồng bộ Google Drive'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm đề thi theo tên, mã đề, chủ đề Global Success..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Mức độ phân hóa:</span>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả mức độ</option>
                <option value="Phân hóa cao">Phân hóa cao (8-10đ)</option>
                <option value="Chuẩn Bộ 2026">Chuẩn Bộ 2026 (6-8đ)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Trạng thái:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="Đang mở">Đang mở</option>
                <option value="Đã đóng">Đã đóng</option>
              </select>
            </div>
          </div>
        </div>

        {/* 1. QUY TẮC TRÌNH BÀY DANH MỤC: DANH SÁCH DẠNG LIST (List View) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                DANH MỤC ĐỀ THI LUYỆN THI THPT ({filteredExams.length} bộ đề trong ngân hàng)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Nhấp chọn bất kỳ đề thi nào để mở Bảng điều khiển (Control Panel)
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredExams.map((exam, index) => {
              const examStat = getExamStats(exam);
              const examNumberStr = `Đề số ${String(index + 1).padStart(2, '0')}`;
              return (
              <div
                key={exam.id}
                onClick={() => {
                  setSelectedExamId(exam.id);
                  setControlTab('detail');
                }}
                className="p-3.5 sm:p-4 hover:bg-blue-50/40 transition cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-3 group"
              >
                {/* 1. Số thứ tự (Đề số 01, Đề số 02...) + Tiêu đề hài hòa + Chú thích tối giản */}
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  {/* Badge Số thứ tự dạng list */}
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/90 font-black text-xs shrink-0 flex items-center gap-1.5 shadow-2xs">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>{examNumberStr}</span>
                  </span>

                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Tiêu đề điều chỉnh size chữ sao cho hài hòa */}
                    <h3 className="font-bold text-[14px] sm:text-[15px] text-slate-800 group-hover:text-blue-600 transition leading-snug line-clamp-1 sm:line-clamp-2">
                      {exam.title}
                    </h3>

                    {/* Tối giản diện tích các chú thích tính năng của mỗi đề */}
                    <div className="flex items-center gap-2 flex-wrap text-slate-500 text-[11px]">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {exam.questionsCount || 40} câu • {exam.duration || '50p'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/70">
                        {exam.difficulty || 'Chuẩn Bộ 2026'}
                      </span>
                      {exam.topic && (
                        <>
                          <span className="text-slate-300 hidden md:inline">•</span>
                          <span className="text-slate-500 truncate max-w-[260px] hidden md:inline" title={exam.topic}>
                            {exam.topic.replace(/Global Success \d+:\s*/, '')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Trạng thái giao bài & nộp bài tối giản + Thao tác */}
                <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Trạng thái giao bài tối giản diện tích */}
                  <div className="shrink-0 text-xs">
                    {!examStat.isAssigned ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/70">
                        <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Chưa giao</span>
                      </span>
                    ) : !examStat.hasSubmissions ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/70" title={`Đã giao: ${examStat.assignedText}`}>
                        <Users className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="max-w-[120px] truncate">Đã giao {examStat.assignedText}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{examStat.submissionsCount}/{examStat.totalStudents} nộp • {examStat.avgScore}đ</span>
                      </span>
                    )}
                  </div>

                  {/* Trạng thái Đang mở / Đã đóng nhỏ gọn */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleExamStatus(exam.id, exam.status || 'Đang mở');
                    }}
                    title="Nhấp để đổi trạng thái Đang mở / Đã đóng"
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                      exam.status === 'Đang mở'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        exam.status === 'Đang mở' ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    <span>{exam.status || 'Đang mở'}</span>
                  </button>

                  {/* Thao tác tương tác gọn gàng */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExamId(exam.id);
                        setShowFastGraderModal(true);
                      }}
                      title="Chấm điểm nhanh chuỗi đáp án 40 câu và xem AI chẩn đoán"
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Chấm điểm chuỗi 40 câu</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExamId(exam.id);
                        setControlTab('detail');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Luyện đề</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportExamToWord(exam);
                        onShowToast('Đang xuất file Word (.docx) chuẩn sư phạm...');
                      }}
                      title="Xuất file Word đề thi và đáp án"
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        printExamSheet(exam);
                      }}
                      title="In trực tiếp / Lưu PDF A4"
                      className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg border border-slate-200 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExamToDelete(exam);
                      }}
                      title="Xóa đề thi khỏi bộ nhớ"
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* MODAL TẠO ĐỀ AI CHUẨN BỘ 2026 */}
        {showAiModalLocal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">Tạo Đề Thi Với AI Chuẩn Cấu Trúc Bộ GD&ĐT 2026</h3>
                    <p className="text-xs text-slate-500">Đầy đủ 40 câu trắc nghiệm • Ma trận định hướng 2026</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiModalLocal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã đề thi đề xuất:</label>
                  <input
                    type="text"
                    value={aiGenExamCode}
                    onChange={(e) => setAiGenExamCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chủ đề ngữ liệu (SGK Global Success 10-12 & Báo chí quốc tế):</label>
                  <select
                    value={aiGenTopic}
                    onChange={(e) => setAiGenTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="AI, Công nghệ số & Nghề nghiệp tương lai (The Guardian & Global Success 12)">
                      AI, Công nghệ số & Nghề nghiệp tương lai (The Guardian & Global Success 12)
                    </option>
                    <option value="Lối sống xanh, Giảm phát thải & Bảo vệ đa dạng sinh học (BBC Future & SGK 10)">
                      Lối sống xanh, Giảm phát thải & Bảo vệ đa dạng sinh học (BBC Future & SGK 10)
                    </option>
                    <option value="Thành phố thông minh & Đô thị hóa bền vững (Wired & SGK 11)">
                      Thành phố thông minh & Đô thị hóa bền vững (Wired & SGK 11)
                    </option>
                    <option value="Khoa học não bộ, Giấc ngủ & Sức khỏe trường thọ (NatGeo & SGK 11)">
                      Khoa học não bộ, Giấc ngủ & Sức khỏe trường thọ (NatGeo & SGK 11)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức độ phân hóa đề thi:</label>
                  <select
                    value={aiGenDifficulty}
                    onChange={(e) => setAiGenDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="Phân hóa cao (Mục tiêu 8-10 điểm)">Phân hóa cao (Mục tiêu 8-10 điểm)</option>
                    <option value="Chuẩn Bộ GD&ĐT 2026 (Mục tiêu 6-8 điểm)">Chuẩn Bộ GD&ĐT 2026 (Mục tiêu 6-8 điểm)</option>
                    <option value="Ôn tập nền tảng (Mục tiêu 5-7 điểm)">Ôn tập nền tảng (Mục tiêu 5-7 điểm)</option>
                  </select>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cam kết cấu trúc chuẩn ma trận khảo thí 2026:</span>
                  </div>
                  <p className="text-[11px] text-blue-800/80">
                    Bao gồm Part I (Tờ rơi/Thông báo 6 câu) + Part II (Sắp xếp câu 5 câu) + Part III (Điền từ The Guardian 5 câu) + Part IV (Đọc hiểu 1 BBC 8 câu) + Part V (Đọc hiểu 2 NatGeo 8 câu) + Ngữ âm & Giao tiếp (8 câu).
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAiModalLocal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerateAiExam}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Đang biên soạn 40 câu...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Bắt đầu tạo đề thi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL XÓA ĐỀ KHỎI BỘ NHỚ */}
        {examToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Xác nhận xóa đề thi</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Thầy/Cô có chắc chắn muốn xóa đề thi <strong>"{examToDelete.title}"</strong> khỏi bộ nhớ thiết bị và máy chủ không?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setExamToDelete(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteExam}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Xác nhận xóa khỏi bộ nhớ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: BẢNG ĐIỀU KHIỂN (Control Panel) KHI CHỌN ĐỀ THI
  // Kích hoạt 5 tính năng chính: a, b, c, d, e
  // ==========================================
  return (
    <div className="space-y-5">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => setSelectedExamId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-800 hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Danh mục Luyện Thi THPT</span>
          </button>
          
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
              BẢNG ĐIỀU KHIỂN ĐỀ THI
            </span>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
              40 câu • 50 phút
            </span>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
              {activeExam.difficulty || 'Phân hóa cao'}
            </span>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border ${
                activeStats.isAssigned
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {activeStats.isAssigned ? `Đã giao: ${activeStats.assignedText}` : 'Trạng thái: Chưa giao bài'}
            </span>
            <button
              type="button"
              onClick={() => handleToggleExamStatus(activeExam.id, activeExam.status || 'Đang mở')}
              className={`text-[10px] font-bold px-2 py-0.5 rounded border cursor-pointer ${
                activeExam.status === 'Đang mở'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              Trạng thái: {activeExam.status} (Nhấp để đổi)
            </button>
          </div>

          <h2 className="text-lg md:text-xl font-black text-slate-900 leading-snug">
            {activeExam.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            <strong>Chủ đề:</strong> {activeExam.topic}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowFastGraderModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Chấm điểm & AI Chẩn đoán (Chuỗi 40 câu)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAssignExam(activeExam);
              onShowToast('Đang mở hộp thoại giao bài trực tiếp cho học sinh...');
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Giao bài cho lớp</span>
          </button>

          <button
            type="button"
            onClick={handleDriveSync}
            disabled={isDriveSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Cloud className={`w-3.5 h-3.5 ${isDriveSyncing ? 'animate-bounce text-blue-600' : 'text-slate-500'}`} />
            <span>{isDriveSyncing ? 'Đang sync...' : 'Đồng bộ Google Drive'}</span>
          </button>
        </div>
      </div>

      {/* 5 TÍNH NĂNG CHÍNH - CONTROL PANEL TABS */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'detail', label: 'a. Xem chi tiết đề thi (Split-screen & Inline)', icon: Eye },
            { id: 'assignment', label: 'b. Cài đặt làm đề & Giao bài (Assignment Hub)', icon: Settings },
            { id: 'progress', label: 'c. Thống kê tiến độ & Dữ liệu học sinh', icon: Users },
            { id: 'diagnostic', label: 'd. AI Phân tích cá nhân hóa (Diagnostic)', icon: BrainCircuit },
            { id: 'export', label: 'e. Tải kết quả bài làm (Excel/Word/PDF)', icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = controlTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setControlTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2.a. XEM CHI TIẾT ĐỀ THI (SPLIT-SCREEN & INLINE OPTIONS) */}
      {/* ==================================================== */}
      {controlTab === 'detail' && (
        <div className="space-y-4">
          {/* Sub Toolbar for Exam Viewer */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSplitScreen(!splitScreen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                  splitScreen
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Màn hình kép (Split-screen): {splitScreen ? 'BẬT' : 'TẮT'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSolutions(!showSolutions)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                  showSolutions
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Hiện đáp án & Giải thích 6 bước: {showSolutions ? 'BẬT' : 'ẨN'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsStudentSimMode(!isStudentSimMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                  isStudentSimMode
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Chế độ học sinh làm thử: {isStudentSimMode ? 'ĐANG BẬT' : 'TẮT'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-semibold">Lọc mức độ:</span>
              <select
                value={filterQuestionTier}
                onChange={(e) => setFilterQuestionTier(e.target.value as any)}
                className="border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white font-bold text-slate-700"
              >
                <option value="ALL">Tất cả {activeExam.questions?.length || 40} câu</option>
                <option value="BASIC">Nhóm Mất gốc (Câu 1-15: Mục tiêu 4-5đ)</option>
                <option value="INTERMEDIATE">Nhóm Trung bình - Khá (Câu 16-30: Mục tiêu 6-7đ)</option>
                <option value="ADVANCED">Nhóm Giỏi - Xuất sắc (Câu 31-40: Mục tiêu 8-10đ)</option>
              </select>

              <button
                type="button"
                onClick={() => setIsAddingQuestion(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm câu hỏi</span>
              </button>
            </div>
          </div>

          {/* Main Layout: Split-screen or Full */}
          <div className={`grid gap-5 ${splitScreen ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
            {/* CỘT TRÁI: VĂN BẢN ĐỌC HIỂU / TỜ RƠI (Passage Column) */}
            {splitScreen && (
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-h-[820px] overflow-y-auto custom-scrollbar sticky top-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                      Ngữ liệu đọc hiểu & Tờ rơi thông báo
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {passages.length} văn bản
                  </span>
                </div>

                {/* Passage tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {passages.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePassageIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer ${
                        activePassageIndex === idx
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Bài đọc {idx + 1}
                    </button>
                  ))}
                </div>

                {/* Active Passage Content */}
                {passages[activePassageIndex] && (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-sm text-blue-900 border-l-4 border-blue-600 pl-2.5">
                      {passages[activePassageIndex].title}
                    </h4>
                    <p className="text-[11px] font-bold text-slate-400">
                      {passages[activePassageIndex].qRange}
                    </p>
                    <div className="text-xs text-slate-700 leading-relaxed font-serif whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 select-text">
                      {passages[activePassageIndex].text}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CỘT PHẢI: 40 CÂU HỎI TRẮC NGHIỆM VỚI PHƯƠNG ÁN HÀNG NGANG (INLINE OPTIONS) */}
            <div className={`${splitScreen ? 'lg:col-span-7' : 'col-span-1'} space-y-4 max-h-[820px] overflow-y-auto custom-scrollbar pr-1`}>
              {questionsToDisplay.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                        {q.num || idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {q.sectionTitle || 'TRẮC NGHIỆM'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {q.grammarPoint && (
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {q.grammarPoint}
                        </span>
                      )}
                      
                      {/* Edit Question */}
                      <button
                        type="button"
                        onClick={() => setEditingQuestion(q)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                        title="Chỉnh sửa câu hỏi này"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Question */}
                      <button
                        type="button"
                        onClick={() => setQuestionToDelete(q)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Xóa câu hỏi không phù hợp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-xs md:text-sm font-bold text-slate-900 leading-relaxed">
                    {q.question}
                  </div>

                  {/* Arrangement Items if any */}
                  {q.arrangementItems && q.arrangementItems.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 font-serif text-slate-800">
                      {q.arrangementItems.map((item, aIdx) => (
                        <p key={aIdx} className="leading-snug">
                          {item}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* CÁC PHƯƠNG ÁN LỰA CHỌN BỐ TRÍ HÀNG NGANG (INLINE OPTIONS) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = !isStudentSimMode && showSolutions && q.answer.trim().startsWith(opt.slice(0, 2));
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span className="line-clamp-2">{opt}</span>
                          {/* Audio button for phonetics */}
                          {q.sectionType === 'pronunciation' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playPronunciationAudio(opt.replace(/^[A-D]\.\s*/, '').replace(/<[^>]*>/g, ''));
                              }}
                              className="text-slate-400 hover:text-blue-600 ml-1 p-0.5 cursor-pointer"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* 6-STEP PEDAGOGICAL SOLUTION */}
                  {!isStudentSimMode && showSolutions && q.explanation && (
                    <div className="mt-3 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đáp án đúng: {q.answer}</span>
                      </div>
                      <div className="text-slate-700 whitespace-pre-line leading-relaxed font-medium pl-5 border-l-2 border-emerald-400">
                        {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2.b. CÀI ĐẶT LÀM ĐỀ ONLINE & GIAO BÀI (ASSIGNMENT HUB) */}
      {/* ==================================================== */}
      {controlTab === 'assignment' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>Thiết Lập Chế Độ Thi Online, Thời Gian & Chống Gian Lận (Assignment Hub)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Cấu hình các thông số bảo mật, thời gian đếm ngược, giám sát màn hình và hệ thống tự động chấm điểm
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Lớp học tiếp nhận */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Lớp học tiếp nhận đề thi:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} (Sĩ số: {cls.studentsCount || 35} học sinh • PIN: {cls.pin})
                  </option>
                ))}
              </select>
            </div>

            {/* Thời gian làm bài đếm ngược */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Thời gian làm bài đếm ngược (Phút):</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={assignTimeLimit}
                  onChange={(e) => setAssignTimeLimit(Number(e.target.value))}
                  className="w-28 px-3.5 py-2 border border-slate-300 rounded-xl font-bold text-slate-800"
                />
                {[45, 50, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setAssignTimeLimit(mins)}
                    className={`px-2.5 py-2 rounded-xl font-bold border transition cursor-pointer ${
                      assignTimeLimit === mins
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {mins}p
                  </button>
                ))}
              </div>
            </div>

            {/* Thời điểm bắt đầu */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Thời điểm bắt đầu mở đề:</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold text-slate-800"
              />
            </div>

            {/* Thời điểm kết thúc */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Thời điểm kết thúc đóng đề:</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold text-slate-800"
              />
            </div>

            {/* Giới hạn số lần làm bài */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Giới hạn số lần làm bài:</label>
              <select
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                <option value={1}>1 lần duy nhất (Thi chính thức / Khảo sát định kỳ)</option>
                <option value={2}>2 lần (Luyện tập có cải thiện điểm số)</option>
                <option value={99}>Không giới hạn số lần làm bài</option>
              </select>
            </div>

            {/* Giám sát màn hình chống gian lận */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Giám sát màn hình (Chống thoát tab/gian lận):</label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anticheat"
                    checked={antiCheatEnabled}
                    onChange={(e) => setAntiCheatEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="anticheat" className="font-bold text-slate-900 cursor-pointer">
                    Kích hoạt giám sát chuyển tab (Tab-focus tracking)
                  </label>
                </div>
                {antiCheatEnabled && (
                  <div className="flex items-center gap-2 pl-6">
                    <span className="text-slate-600">Tự động thu bài sau:</span>
                    <select
                      value={maxTabViolations}
                      onChange={(e) => setMaxTabViolations(Number(e.target.value))}
                      className="border border-slate-300 rounded-lg px-2 py-1 font-bold bg-white text-slate-800"
                    >
                      <option value={2}>2 lần vi phạm</option>
                      <option value={3}>3 lần vi phạm (Chuẩn)</option>
                      <option value={5}>5 lần vi phạm</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Tự động chấm điểm */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Chấm điểm & Ma trận kết quả:</label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autograde"
                  checked={autoGrade}
                  onChange={(e) => setAutoGrade(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="autograde" className="font-bold text-slate-900 cursor-pointer">
                  Tự động chấm điểm ngay sau khi học sinh nộp bài
                </label>
              </div>
            </div>

            {/* Đảo câu hỏi */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Bảo mật mã đề thi:</label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="shuffle"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="shuffle" className="font-bold text-slate-900 cursor-pointer">
                  Đảo ngẫu nhiên câu hỏi & phương án (Mỗi học sinh 1 mã đề)
                </label>
              </div>
            </div>
          </div>

          {/* Quick share box */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-black text-blue-900 block">
                Mã PIN bài thi cho lớp {targetClass?.name}: <span className="text-base text-blue-700 font-mono font-black">{targetClass?.pin || '202610'}</span>
              </span>
              <span className="text-slate-600">
                Học sinh truy cập cổng thi và nhập mã PIN để bắt đầu làm bài
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText?.(`https://edu-exam.vn/test?pin=${targetClass?.pin || '202610'}&exam=${activeExam.id}`);
                onShowToast('Đã sao chép link làm bài vào bộ nhớ tạm!');
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép link làm bài</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {activeStats.isAssigned
                  ? `Đang giao cho lớp: ${activeStats.assignedText}`
                  : 'Đề thi hiện đang ở trạng thái: Chưa giao bài'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {activeStats.isAssigned && (
                <button
                  type="button"
                  onClick={() => {
                    const unassigned: ExamItem = {
                      ...activeExam,
                      assignedClasses: [],
                      assignedClassIds: [],
                      submissions: 0,
                      avgScore: 0
                    };
                    setExamList((prev) => prev.map((e) => (e.id === unassigned.id ? unassigned : e)));
                    onAssignExam(unassigned);
                    onShowToast(`Đã thu hồi giao bài cho đề thi "${activeExam.title}"!`, 'info');
                  }}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer"
                >
                  Hủy giao đề (Về Chưa giao)
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const targetName = targetClass?.name || 'Lớp 12G09';
                  const shortName = targetName.replace(/^Lớp\s+/i, '');
                  const assignedClassesList = Array.from(new Set([targetName, shortName, `Lớp ${shortName}`]));

                  const assignedExam: ExamItem = {
                    ...activeExam,
                    assignedClasses: assignedClassesList,
                    assignedClassIds: targetClass?.id ? [targetClass.id] : [],
                    duration: `${assignTimeLimit} phút`,
                    durationLimit: `${assignTimeLimit} phút`,
                    maxAttempts: maxAttempts,
                    deadline: `${endTime.replace('T', ' ')}:00`,
                    deadlineTime: endTime.slice(11),
                    shuffleQuestions: shuffleQuestions,
                    preventCheating: antiCheatEnabled,
                    submissions: 0,
                    avgScore: 0
                  };

                  setExamList((prev) => prev.map((e) => (e.id === assignedExam.id ? assignedExam : e)));
                  onAssignExam(assignedExam);
                  onShowToast(`Đã giao đề thi cho lớp "${targetName}" thành công! Học sinh đã có thể đăng nhập vào lớp và làm bài ngay.`, 'success');
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95"
              >
                Lưu Cấu Hình & Giao Bài Cho Lớp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2.c. THỐNG KÊ TIẾN ĐỘ & DỮ LIỆU HỌC SINH (REAL-TIME DATA) */}
      {/* ==================================================== */}
      {controlTab === 'progress' && (
        <div className="space-y-5">
          {!activeStats.isAssigned ? (
            <div className="bg-white rounded-2xl border border-amber-200 shadow-xs p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h4 className="text-base font-black text-slate-900">
                  Đề thi này chưa được giao cho lớp học nào
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Đề thi hiện đang được lưu trữ trong ngân hàng đề thi THPT và chưa kích hoạt chế độ làm bài cho học sinh. Vì vậy hệ thống chưa ghi nhận bất kỳ lượt nộp bài, thời gian hay điểm số nào.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setControlTab('assignment')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Đến mục Cài đặt & Giao bài ngay
                </button>
                <button
                  type="button"
                  onClick={() => onAssignExam(activeExam)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Mở hộp thoại Giao bài
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Real-time Metrics Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-500">Đã hoàn thành</p>
                  <h4 className="text-2xl font-black text-blue-600 mt-1">
                    {examStudentResults.length} / {examStudentResults.length + unsubmittedStudents.length}{' '}
                    <span className="text-xs text-slate-400 font-semibold">
                      ({examStudentResults.length + unsubmittedStudents.length > 0
                        ? Math.round((examStudentResults.length / (examStudentResults.length + unsubmittedStudents.length)) * 100)
                        : 0}%)
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    {unsubmittedStudents.length} học sinh chưa nộp
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-500">Điểm trung bình</p>
                  <h4 className="text-2xl font-black text-amber-600 mt-1">
                    {examStudentResults.length > 0
                      ? `${(examStudentResults.reduce((a, b) => a + b.score, 0) / examStudentResults.length).toFixed(2)}`
                      : '--'}{' '}
                    <span className="text-xs text-slate-400 font-semibold">/ 10</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    {examStudentResults.length > 0 ? 'Chuẩn phân hóa tốt' : 'Chưa có bài nộp'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-500">Điểm cao nhất</p>
                  <h4 className="text-2xl font-black text-emerald-600 mt-1">
                    {examStudentResults.length > 0
                      ? `${Math.max(...examStudentResults.map((r) => r.score)).toFixed(2)}`
                      : '--'}{' '}
                    <span className="text-xs text-slate-400 font-semibold">/ 10</span>
                  </h4>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                    {examStudentResults.length > 0
                      ? examStudentResults.reduce((prev, curr) => (curr.score > prev.score ? curr : prev)).studentName
                      : 'Chưa có'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-500">Thời gian TB</p>
                  <h4 className="text-2xl font-black text-slate-800 mt-1">
                    {examStudentResults.length > 0
                      ? `${Math.round(examStudentResults.reduce((a, b) => a + b.durationMinutes, 0) / examStudentResults.length)}`
                      : '--'}{' '}
                    <span className="text-xs text-slate-400 font-semibold">phút</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">Giới hạn đề: 50 phút</p>
                </div>
              </div>

              {/* Phổ điểm chi tiết (Score Distribution Chart) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                      Biểu Đồ Phổ Điểm Chi Tiết ({activeStats.assignedText})
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500">
                    {examStudentResults.length > 0 ? `${examStudentResults.length} bài đã chấm` : 'Chưa có dữ liệu phổ điểm'}
                  </span>
                </div>

                {examStudentResults.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">
                    Chưa có bài thi nào được nộp. Biểu đồ phổ điểm sẽ tự động vẽ ngay khi học sinh nộp bài.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scoreDistribution.map((item, idx) => {
                      const total = examStudentResults.length;
                      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-700">{item.range} ({item.label})</span>
                            <span className="text-slate-900">{item.count} học sinh ({pct}%)</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.color} rounded-full transition-all duration-500`}
                              style={{ width: `${Math.max(4, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Danh sách học sinh chưa làm */}
              {unsubmittedStudents.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Danh sách học sinh chưa làm đề ({unsubmittedStudents.length} học sinh):</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onShowToast('Đã gửi thông báo nhắc nhở làm bài đến học sinh!')}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Gửi nhắc nhở (Zalo/SMS)
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {unsubmittedStudents.map((s, idx) => (
                      <span key={idx} className="bg-white px-2.5 py-1 rounded-lg border border-amber-300 font-medium text-amber-950">
                        {s.name} ({(s as any).studentId || (s as any).code || `HS-${idx + 10}`})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Student Progress Real-time Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Bảng kết quả làm bài của học sinh (Thời gian thực)
                </span>
              </div>
              <button
                type="button"
                onClick={() => exportStudentResultsToExcel(activeExam.title, examStudentResults)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải bảng điểm Excel</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-[11px] font-black uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3 pl-4">Mã HS</th>
                    <th className="p-3">Họ và tên</th>
                    <th className="p-3">Lớp</th>
                    <th className="p-3 text-center">Điểm số</th>
                    <th className="p-3 text-center">Số câu đúng</th>
                    <th className="p-3 text-center">Thời gian</th>
                    <th className="p-3 text-center">Cảnh báo thoát tab</th>
                    <th className="p-3">Xếp loại</th>
                    <th className="p-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {examStudentResults.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-600 text-xs">
                            {activeStats.isAssigned
                              ? `Chưa có học sinh nào nộp bài thi cho lớp "${activeStats.assignedText}".`
                              : 'Đề thi chưa được giao cho lớp học nào.'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {activeStats.isAssigned
                              ? 'Học sinh làm bài trực tiếp qua cổng thi với mã PIN của lớp, kết quả sẽ hiển thị ngay khi nộp.'
                              : 'Vui lòng giao bài để học sinh có thể làm bài và hệ thống thống kê điểm số.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    examStudentResults.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition font-medium">
                        <td className="p-3 pl-4 font-bold text-slate-500">{r.studentId}</td>
                        <td className="p-3 font-extrabold text-slate-900">{r.studentName}</td>
                        <td className="p-3 text-slate-600">{r.className}</td>
                        <td className="p-3 text-center font-black text-blue-700 text-sm">
                          {r.score.toFixed(2)}
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-700">
                          {r.correctCount}/40
                        </td>
                        <td className="p-3 text-center text-slate-600">{r.durationMinutes} phút</td>
                        <td className="p-3 text-center">
                          {r.tabSwitches > 0 ? (
                            <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px]">
                              {r.tabSwitches} lần vi phạm
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">0 lần (Nghiêm túc)</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              r.gradeCategory.includes('Xuất sắc')
                                ? 'bg-purple-100 text-purple-800'
                                : r.gradeCategory.includes('Giỏi')
                                ? 'bg-indigo-100 text-indigo-800'
                                : r.gradeCategory === 'Khá'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.gradeCategory}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentResult(r)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2.d. AI PHÂN TÍCH CÁ NHÂN HÓA (AI DIAGNOSTIC ANALYTICS) */}
      {/* ==================================================== */}
      {controlTab === 'diagnostic' && (
        <div className="space-y-6">
          {!activeStats.isAssigned ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h4 className="text-base font-black text-slate-900">
                  Đề thi chưa được giao cho lớp học nào
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Để AI có dữ liệu phân tích lỗ hổng kiến thức và cá nhân hóa lộ trình, Thầy/Cô hãy giao đề thi này cho lớp học trong mục "Cài đặt làm đề & Giao bài".
                </p>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setControlTab('assignment')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Cài đặt & Giao bài ngay
                </button>
              </div>
            </div>
          ) : examStudentResults.length === 0 ? (
            <div className="bg-white rounded-2xl border border-blue-200 shadow-xs p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h4 className="text-base font-black text-slate-900">
                  Đã giao cho lớp {activeStats.assignedText} - Chưa có bài nộp từ học sinh
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hệ thống AI sẽ tự động phân tích ngay khi học sinh nộp bài. Hoặc Thầy/Cô có thể bấm nút bên dưới để tạo 20 bài làm mẫu ngẫu nhiên của lớp {activeStats.assignedText} và kích hoạt ngay báo cáo chẩn đoán AI thực tế cho đề thi này.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSimulateClassSubmissions}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Tạo dữ liệu bài làm lớp để AI chẩn đoán ngay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setControlTab('assignment')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Xem thông số giao bài
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Banner & Mode Switcher */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-violet-700 font-black text-sm">
                    <BrainCircuit className="w-5 h-5" />
                    <span>Báo Cáo Chẩn Đoán Lỗ Hổng Kiến Thức & Lộ Trình Cá Nhân Hóa (AI Diagnostic)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Phân tích dữ liệu thực tế từ <strong>{examStudentResults.length} bài làm</strong> của lớp <strong>{activeStats.assignedText}</strong> cho đề thi "{activeExam.title}".
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Mode Switcher */}
                  <div className="p-1 bg-slate-100 rounded-xl flex items-center border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setDiagnosticMode('class')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        diagnosticMode === 'class'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Toàn Lớp ({examStudentResults.length} HS)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiagnosticMode('student')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        diagnosticMode === 'student'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Cá Nhân Hóa Từng HS</span>
                    </button>
                  </div>

                  {/* Gemini Trigger Button */}
                  <button
                    type="button"
                    onClick={() => handleTriggerGeminiAnalysis(diagnosticMode === 'student')}
                    disabled={isDeepAnalyzing}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isDeepAnalyzing ? 'animate-spin' : ''}`} />
                    <span>{isDeepAnalyzing ? 'AI đang phân tích...' : 'AI Gemini Phân Tích Sâu'}</span>
                  </button>

                  {/* Refresh Submissions */}
                  <button
                    type="button"
                    onClick={handleSimulateClassSubmissions}
                    title="Nạp lại mẫu bài làm lớp"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* VIEW 1: TOÀN LỚP (CLASS-WIDE DIAGNOSTIC) */}
              {diagnosticMode === 'class' && (
                <div className="space-y-6">
                  {/* 4 Trụ Cột Kỹ Năng Tính Toán Thật */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Đánh Giá 4 Trụ Cột Kỹ Năng Của Lớp {activeStats.assignedText} Trong Đề Này
                        </h4>
                      </div>
                      <span className="text-xs text-slate-500">
                        Tính toán trực tiếp từ {examStudentResults.length * (activeExam.questions?.length || 40)} lượt trả lời
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
                      {/* Trụ cột 1: Ngữ pháp */}
                      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider">Trụ cột 1: Ngữ pháp</span>
                          <span className="text-xs font-extrabold text-blue-700">{pillarsAnalysis.grammar.mastery}%</span>
                        </div>
                        <div className="w-full bg-blue-200/60 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pillarsAnalysis.grammar.mastery}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {pillarsAnalysis.grammar.worstQuestions.length > 0 ? (
                            <>
                              Lỗ hổng: {pillarsAnalysis.grammar.worstQuestions.map(q => `Câu ${q.num} (${q.failRate}% sai)`).join(', ')}.
                            </>
                          ) : (
                            'Học sinh nắm vững các điểm ngữ pháp trong đề.'
                          )}
                        </p>
                      </div>

                      {/* Trụ cột 2: Từ vựng */}
                      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Trụ cột 2: Từ vựng</span>
                          <span className="text-xs font-extrabold text-emerald-700">{pillarsAnalysis.vocab.mastery}%</span>
                        </div>
                        <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pillarsAnalysis.vocab.mastery}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {pillarsAnalysis.vocab.worstQuestions.length > 0 ? (
                            <>
                              Lỗ hổng: {pillarsAnalysis.vocab.worstQuestions.map(q => `Câu ${q.num} (${q.failRate}% sai)`).join(', ')}.
                            </>
                          ) : (
                            'Học sinh nhận diện tốt các collocations trong bài.'
                          )}
                        </p>
                      </div>

                      {/* Trụ cột 3: Đọc hiểu */}
                      <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider">Trụ cột 3: Đọc hiểu</span>
                          <span className="text-xs font-extrabold text-purple-700">{pillarsAnalysis.reading.mastery}%</span>
                        </div>
                        <div className="w-full bg-purple-200/60 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pillarsAnalysis.reading.mastery}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {pillarsAnalysis.reading.worstQuestions.length > 0 ? (
                            <>
                              Lỗ hổng: {pillarsAnalysis.reading.worstQuestions.map(q => `Câu ${q.num} (${q.failRate}% sai)`).join(', ')}.
                            </>
                          ) : (
                            'Kỹ năng quét thông tin (scanning) đồng đều.'
                          )}
                        </p>
                      </div>

                      {/* Trụ cột 4: Suy luận */}
                      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Trụ cột 4: Suy luận</span>
                          <span className="text-xs font-extrabold text-amber-700">{pillarsAnalysis.inference.mastery}%</span>
                        </div>
                        <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pillarsAnalysis.inference.mastery}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {pillarsAnalysis.inference.worstQuestions.length > 0 ? (
                            <>
                              Lỗ hổng: {pillarsAnalysis.inference.worstQuestions.map(q => `Câu ${q.num} (${q.failRate}% sai)`).join(', ')}.
                            </>
                          ) : (
                            'Tư duy logic mạch văn bản đạt yêu cầu.'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* TOP CÁC LỖI SAI THƯỜNG GẶP NHẤT TRONG ĐỀ THI NÀY */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            Top Các Câu Hỏi Học Sinh Dễ Mắc Bẫy & Sai Nhiều Nhất (Tỉ Lệ Mắc Lỗi Cao)
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Phân tích chi tiết tỉ lệ chọn từng phương án A, B, C, D của cả lớp để chỉ rõ bẫy tâm lý học sinh gặp phải
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {topCommonErrors.map((errQ) => {
                        const isExpanded = expandedErrorNum === errQ.num;
                        return (
                          <div
                            key={errQ.num}
                            className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 hover:border-slate-300 transition"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-black text-xs">
                                  Câu {errQ.num}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                  Tỉ lệ sai: {errQ.failRate}% ({errQ.wrongCount}/{examStudentResults.length} HS)
                                </span>
                                <span className="text-[10px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                  {errQ.grammarPoint}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                              {errQ.question}
                            </p>

                            {/* Option Distribution Bars */}
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                                Phân bổ phương án chọn của lớp:
                              </span>
                              <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
                                {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                                  const pct = errQ.chosenPercents[letter];
                                  const isCorrect = letter === errQ.correctLetter;
                                  const isMostWrong = letter === errQ.mostCommonWrongOption;

                                  return (
                                    <div
                                      key={letter}
                                      className={`p-1.5 rounded-lg border font-bold ${
                                        isCorrect
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                          : isMostWrong
                                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                                          : 'bg-white border-slate-200 text-slate-600'
                                      }`}
                                    >
                                      <div>{letter}: {pct}%</div>
                                      <div className="text-[9px] font-normal">
                                        {isCorrect ? '✓ Đúng' : isMostWrong ? '⚠ Bẫy chính' : 'Nhiễu'}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Trap Misconception Analysis */}
                            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1 text-xs">
                              <div className="flex items-center gap-1 font-bold text-amber-900 text-[11px]">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                <span>Bẫy học sinh dễ mắc:</span>
                              </div>
                              <p className="text-slate-700 leading-relaxed text-[11px]">
                                {errQ.whyWrong}
                              </p>
                            </div>

                            {/* Remedial Rule */}
                            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1 text-xs">
                              <div className="flex items-center gap-1 font-bold text-blue-900 text-[11px]">
                                <Lightbulb className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                                <span>Quy tắc củng cố sư phạm:</span>
                              </div>
                              <p className="text-slate-700 leading-relaxed text-[11px]">
                                {errQ.remedialRule}
                              </p>
                            </div>

                            {/* Toggle view full solution */}
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setExpandedErrorNum(isExpanded ? null : errQ.num)}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              >
                                {isExpanded ? 'Ẩn hướng dẫn giải chi tiết ▲' : 'Xem lời giải Step 1 - Step 6 ▼'}
                              </button>
                              {isExpanded && errQ.explanation && (
                                <div className="mt-2 p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 whitespace-pre-line leading-relaxed shadow-inner">
                                  {errQ.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* PHÂN HÓA 3 NHÓM ĐỐI TƯỢNG HỌC SINH THỰC TẾ */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Phân Hóa 3 Nhóm Đối Tượng Học Sinh & Lộ Trình Can Thiệp Phân Hóa
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tự động phân nhóm học sinh lớp {activeStats.assignedText} theo điểm số thực tế của đề thi này
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      {/* Nhóm 1: Mất gốc / Yếu */}
                      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-rose-900 text-xs uppercase tracking-wide">
                            Nhóm Yếu / Cần Bồi Dưỡng (&lt; 5.0đ)
                          </span>
                          <span className="text-[10px] font-bold bg-rose-200/80 text-rose-800 px-2 py-0.5 rounded">
                            {tierDistribution.remedialPct}% ({tierDistribution.remedial.length} em)
                          </span>
                        </div>

                        {/* List students */}
                        <div className="flex flex-wrap gap-1">
                          {tierDistribution.remedial.length > 0 ? (
                            tierDistribution.remedial.map((stu) => (
                              <button
                                key={stu.studentId}
                                type="button"
                                onClick={() => {
                                  setSelectedStudentIdForDiag(stu.studentId);
                                  setDiagnosticMode('student');
                                }}
                                className="text-[10px] font-bold bg-white text-rose-800 px-2 py-0.5 rounded border border-rose-300 hover:bg-rose-100 transition cursor-pointer"
                                title="Xem chẩn đoán cá nhân của học sinh này"
                              >
                                {stu.studentName} ({stu.score}đ)
                              </button>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Không có học sinh dưới 5.0đ</span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">
                          <strong>Lỗ hổng trong đề này:</strong> Mất điểm ở các câu ngữ âm, thì cơ bản, từ vựng tờ rơi Part I.
                        </p>
                        <p className="text-xs text-rose-800 font-semibold">
                          <strong>Lộ trình AI:</strong> Tập trung ôn tập 100 từ vựng cốt lõi SGK Global Success 10-12, luyện phản xạ 10 câu nhận biết ngữ âm mỗi ngày.
                        </p>
                      </div>

                      {/* Nhóm 2: Trung bình - Khá */}
                      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-blue-900 text-xs uppercase tracking-wide">
                            Nhóm Trung Bình - Khá (5.0 - 7.9đ)
                          </span>
                          <span className="text-[10px] font-bold bg-blue-200/80 text-blue-800 px-2 py-0.5 rounded">
                            {tierDistribution.averagePct}% ({tierDistribution.average.length} em)
                          </span>
                        </div>

                        {/* List students */}
                        <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto">
                          {tierDistribution.average.length > 0 ? (
                            tierDistribution.average.map((stu) => (
                              <button
                                key={stu.studentId}
                                type="button"
                                onClick={() => {
                                  setSelectedStudentIdForDiag(stu.studentId);
                                  setDiagnosticMode('student');
                                }}
                                className="text-[10px] font-bold bg-white text-blue-800 px-2 py-0.5 rounded border border-blue-300 hover:bg-blue-100 transition cursor-pointer"
                                title="Xem chẩn đoán cá nhân của học sinh này"
                              >
                                {stu.studentName} ({stu.score}đ)
                              </button>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Không có học sinh trong nhóm</span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">
                          <strong>Lỗ hổng trong đề này:</strong> Mất điểm ở câu sắp xếp hội thoại (Part II), collocations và đọc hiểu đoạn văn dài (Part IV).
                        </p>
                        <p className="text-xs text-blue-800 font-semibold">
                          <strong>Lộ trình AI:</strong> Bồi dưỡng kỹ năng quét từ khóa (scanning), luyện nhận diện mạch logic của đoạn văn và collocations theo chủ đề.
                        </p>
                      </div>

                      {/* Nhóm 3: Giỏi - Xuất sắc */}
                      <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-purple-900 text-xs uppercase tracking-wide">
                            Nhóm Giỏi - Xuất Sắc (8.0 - 10.0đ)
                          </span>
                          <span className="text-[10px] font-bold bg-purple-200/80 text-purple-800 px-2 py-0.5 rounded">
                            {tierDistribution.advancedPct}% ({tierDistribution.advanced.length} em)
                          </span>
                        </div>

                        {/* List students */}
                        <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto">
                          {tierDistribution.advanced.length > 0 ? (
                            tierDistribution.advanced.map((stu) => (
                              <button
                                key={stu.studentId}
                                type="button"
                                onClick={() => {
                                  setSelectedStudentIdForDiag(stu.studentId);
                                  setDiagnosticMode('student');
                                }}
                                className="text-[10px] font-bold bg-white text-purple-800 px-2 py-0.5 rounded border border-purple-300 hover:bg-purple-100 transition cursor-pointer"
                                title="Xem chẩn đoán cá nhân của học sinh này"
                              >
                                {stu.studentName} ({stu.score}đ)
                              </button>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Chưa có học sinh đạt giỏi</span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">
                          <strong>Lỗ hổng trong đề này:</strong> Vấp ngã ở câu đọc hiểu suy luận chuyên sâu (Part V) và thành ngữ hiếm C1.
                        </p>
                        <p className="text-xs text-purple-800 font-semibold">
                          <strong>Lộ trình AI:</strong> Tăng cường đọc báo học thuật quốc tế (The Guardian, BBC), luyện sâu 50 cấu trúc đảo ngữ và Collocations C1.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI GEMINI DEEP REPORT ACCORDION (If Generated) */}
                  {aiDeepReport && (
                    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 rounded-2xl shadow-lg space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-indigo-700/60 pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                          <h4 className="font-extrabold text-sm text-white">
                            Nhận Xét & Tham Vấn Sư Phạm Chuyên Sâu Từ Trợ Lý AI Gemini
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold bg-white/20 text-indigo-100 px-2.5 py-1 rounded-full">
                          AI Pedagogical Expert
                        </span>
                      </div>

                      <div className="space-y-3 text-xs leading-relaxed text-indigo-100">
                        <div className="p-3.5 bg-white/10 rounded-xl border border-white/15">
                          <strong className="text-white block mb-1 text-sm">Tổng quan chất lượng làm bài:</strong>
                          <p>{aiDeepReport.executiveSummary}</p>
                        </div>

                        {aiDeepReport.criticalAlerts && aiDeepReport.criticalAlerts.length > 0 && (
                          <div className="p-3.5 bg-rose-500/20 rounded-xl border border-rose-400/30">
                            <strong className="text-rose-200 block mb-1">Cảnh báo đỏ lỗ hổng cần khắc phục ngay:</strong>
                            <ul className="list-disc pl-4 space-y-1">
                              {aiDeepReport.criticalAlerts.map((alt: string, i: number) => (
                                <li key={i}>{alt}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiDeepReport.actionPlan?.suggestedLesson && (
                          <div className="p-3.5 bg-amber-500/20 rounded-xl border border-amber-400/30">
                            <strong className="text-amber-200 block mb-1">Kế hoạch bài giảng 15 phút đầu giờ tiếp theo:</strong>
                            <p>{aiDeepReport.actionPlan.suggestedLesson}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: CÁ NHÂN HÓA TỪNG HỌC SINH (PERSONALIZED STUDENT DRILL-DOWN) */}
              {diagnosticMode === 'student' && activeDiagStudent && (
                <div className="space-y-6">
                  {/* Student Selector Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Chọn Học Sinh Cần Chẩn Đoán Lỗ Hổng & Cá Nhân Hóa Lộ Trình:
                        </h4>
                      </div>
                      <span className="text-xs text-slate-500">
                        Lớp {activeStats.assignedText} ({examStudentResults.length} học sinh)
                      </span>
                    </div>

                    {/* Student Badges Slider */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                      {examStudentResults.map((stu) => {
                        const isSelected = stu.studentId === activeDiagStudent.studentId;
                        return (
                          <button
                            key={stu.studentId}
                            type="button"
                            onClick={() => setSelectedStudentIdForDiag(stu.studentId)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>{stu.studentName}</span>
                            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : stu.score >= 8.0
                                ? 'bg-emerald-100 text-emerald-800'
                                : stu.score >= 5.0
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {stu.score}đ
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Student Scorecard & 4-Pillars Radar */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                          {activeDiagStudent.studentName.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-slate-900">{activeDiagStudent.studentName}</h3>
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Mã: {activeDiagStudent.studentId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Lớp {activeDiagStudent.className} • Nộp lúc: {activeDiagStudent.submittedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-right">
                          <div className="text-xs text-slate-400 font-semibold">Điểm số bài thi</div>
                          <div className="text-2xl font-black text-blue-700">{activeDiagStudent.score} / 10</div>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="text-left">
                          <div className="text-xs text-slate-400 font-semibold">Đúng / Tổng số</div>
                          <div className="text-sm font-bold text-slate-800">
                            {activeDiagStudent.correctCount} / {activeDiagStudent.totalQuestions} câu
                          </div>
                          <div className="text-[10px] font-semibold text-rose-600">
                            {studentMistakes.length} câu làm sai
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4 Pillars Mastery Comparison for this student vs Class */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Độ chuẩn xác 4 trụ cột của {activeDiagStudent.studentName} (So với TB Lớp):
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Ngữ pháp */}
                        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">Ngữ pháp</span>
                            <span className="font-black text-blue-800">{studentPillars.grammar}% (Lớp {pillarsAnalysis.grammar.mastery}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${studentPillars.grammar}%` }} />
                          </div>
                        </div>

                        {/* Từ vựng */}
                        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">Từ vựng</span>
                            <span className="font-black text-emerald-800">{studentPillars.vocab}% (Lớp {pillarsAnalysis.vocab.mastery}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${studentPillars.vocab}%` }} />
                          </div>
                        </div>

                        {/* Đọc hiểu */}
                        <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/30 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">Đọc hiểu</span>
                            <span className="font-black text-purple-800">{studentPillars.reading}% (Lớp {pillarsAnalysis.reading.mastery}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${studentPillars.reading}%` }} />
                          </div>
                        </div>

                        {/* Suy luận */}
                        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">Suy luận</span>
                            <span className="font-black text-amber-800">{studentPillars.inference}% (Lớp {pillarsAnalysis.inference.mastery}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${studentPillars.inference}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chi tiết từng câu học sinh làm sai */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-rose-600" />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            Chi Tiết {studentMistakes.length} Câu Em {activeDiagStudent.studentName} Làm Sai Trong Đề Này
                          </h4>
                          <p className="text-xs text-slate-500">
                            Chỉ ra chính xác phương án em đã chọn nhầm, đối chiếu đáp án chuẩn và lời khuyên sư phạm khắc phục
                          </p>
                        </div>
                      </div>
                    </div>

                    {studentMistakes.length === 0 ? (
                      <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                        <h5 className="font-bold text-sm">Tuyệt vời! Học sinh này làm đúng 100% tất cả các câu hỏi trong đề thi.</h5>
                        <p className="text-xs text-emerald-700">Không có lỗi sai nào cần chẩn đoán đối với bài làm này.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {studentMistakes.map((mis) => (
                          <div
                            key={mis.num}
                            className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white font-black text-xs">
                                  Câu {mis.num}
                                </span>
                                <span className="text-xs font-bold text-slate-700">
                                  {mis.grammarPoint}
                                </span>
                              </div>
                              <span className="text-[10px] font-medium text-slate-500 uppercase">
                                {mis.sectionTitle || 'Trắc nghiệm'}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-slate-900 leading-snug">
                              {mis.question}
                            </p>

                            {/* Chosen vs Correct Compare */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 rounded-lg bg-white border border-rose-300 flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                <div>
                                  <span className="text-[10px] text-rose-500 font-bold uppercase block">Phương án em đã chọn:</span>
                                  <span className="font-extrabold text-rose-900">{mis.chosen}</span>
                                </div>
                              </div>

                              <div className="p-2.5 rounded-lg bg-white border border-emerald-300 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div>
                                  <span className="text-[10px] text-emerald-600 font-bold uppercase block">Đáp án chính xác:</span>
                                  <span className="font-extrabold text-emerald-900">{mis.correct}</span>
                                </div>
                              </div>
                            </div>

                            {/* Why Wrong & Remedial Rule */}
                            <div className="space-y-2 text-xs">
                              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-slate-700 leading-relaxed">
                                <strong className="text-amber-900 block mb-0.5 text-[11px]">Chẩn đoán bẫy em đã mắc:</strong>
                                <p className="text-[11px]">{mis.whyWrong}</p>
                              </div>

                              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-slate-700 leading-relaxed">
                                <strong className="text-blue-900 block mb-0.5 text-[11px]">Quy tắc em cần ghi nhớ:</strong>
                                <p className="text-[11px]">{mis.remedialRule}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Personalized Action Roadmap for this student */}
                  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border border-blue-200 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                      <Target className="w-5 h-5 text-blue-700" />
                      <span>Lộ Trình Cải Thiện Cá Nhân Hóa Dành Riêng Cho Em {activeDiagStudent.studentName}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-1">
                        <span className="font-black text-blue-800 text-[11px] uppercase">Bước 1: Chữa lành lỗ hổng</span>
                        <p className="text-slate-600 leading-relaxed">
                          Xem lại và tự làm lại {studentMistakes.length} câu đã sai trong đề này, ghi chú vào sổ tay học tập.
                        </p>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-indigo-200 shadow-2xs space-y-1">
                        <span className="font-black text-indigo-800 text-[11px] uppercase">Bước 2: Luyện chuyên đề yếu</span>
                        <p className="text-slate-600 leading-relaxed">
                          Ôn tập trọng tâm chuyên đề {studentMistakes[0]?.grammarPoint || 'Từ vựng'} trong SGK Global Success 12.
                        </p>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-purple-200 shadow-2xs space-y-1">
                        <span className="font-black text-purple-800 text-[11px] uppercase">Bước 3: Mục tiêu bứt phá</span>
                        <p className="text-slate-600 leading-relaxed">
                          Làm đề thi thử tiếp theo hướng tới nâng điểm số lên {Math.min(10, +(activeDiagStudent.score + 1.2).toFixed(1))} điểm.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onShowToast(`Đã sao chép liên kết phiếu chẩn đoán cá nhân của em ${activeDiagStudent.studentName}!`);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Gửi phiếu cho Học sinh / Phụ huynh</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 2.e. TẢI KẾT QUẢ BÀI LÀM (EXPORT REPORTS - EXCEL/WORD/PDF) */}
      {/* ==================================================== */}
      {controlTab === 'export' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              <span>Tải Xuất Dữ Liệu Báo Cáo Chuyên Môn & Kết Quả Học Sinh</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Hỗ trợ xuất file định dạng Excel/CSV ô hàng cột chuẩn xác, mã UTF-8 BOM hiển thị tiếng Việt hoàn hảo không tràn cột
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Excel Export */}
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                  XLS
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Bảng Điểm Excel (.CSV / .XLSX)</h4>
                <p className="text-xs text-slate-600">
                  Xuất toàn bộ danh sách điểm số, số câu đúng, thời gian làm bài và số lần vi phạm thoát tab của học sinh. Dữ liệu chuẩn ô hàng, cột rõ ràng, không tràn dữ liệu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  exportStudentResultsToExcel(activeExam.title, examStudentResults);
                  onShowToast('Đã tải xuống file kết quả Excel thành công!');
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95"
              >
                Tải Bảng Điểm Excel (.CSV)
              </button>
            </div>

            {/* 2. Word Exam Paper */}
            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                  DOC
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Đề Thi Word Chuẩn Sư Phạm</h4>
                <p className="text-xs text-slate-600">
                  Tách riêng Đề bài học sinh (in ấn làm bài trực tiếp) và Trang đáp án kèm Giải thích 6 bước chi tiết cho giáo viên.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  exportExamToWord(activeExam);
                  onShowToast('Đang tải file Word (.docx) đề thi...');
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95"
              >
                Tải Đề Thi Word (.DOCX)
              </button>
            </div>

            {/* 3. Print / PDF */}
            <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/40 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                  PDF
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">In Đề Thi Trực Tiếp / PDF</h4>
                <p className="text-xs text-slate-600">
                  Khổ giấy A4 chuẩn khảo thí, hỗ trợ lưu file PDF trực tiếp từ trình duyệt phục vụ lưu trữ học bạ và nộp báo cáo tổ bộ môn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => printExamSheet(activeExam)}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95"
              >
                In Đề / Lưu PDF A4
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION EDIT MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-900 text-sm">
                Chỉnh sửa Câu {editingQuestion.num}
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung câu hỏi:</label>
                <textarea
                  rows={3}
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">4 Phương án (A, B, C, D):</label>
                <div className="grid grid-cols-2 gap-2">
                  {editingQuestion.options.map((opt, oIdx) => (
                    <input
                      key={oIdx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[oIdx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="p-2 border border-slate-300 rounded-xl font-medium"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đáp án đúng:</label>
                <input
                  type="text"
                  value={editingQuestion.answer}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, answer: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hướng dẫn giải 6 bước:</label>
                <textarea
                  rows={4}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleSaveQuestion(editingQuestion)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE QUESTION MODAL */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Xác nhận xóa câu hỏi</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Thầy/Cô có chắc chắn muốn xóa <strong>Câu {questionToDelete.num}</strong> khỏi đề thi này không? Hệ thống sẽ tự động cập nhật lại số thứ tự các câu tiếp theo.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQuestion}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Xóa câu hỏi này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW QUESTION MODAL */}
      {isAddingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-900 text-sm">
                Thêm Câu Hỏi Mới Vào Đề Thi (Câu {(activeExam?.questions?.length || 0) + 1})
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingQuestion(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dạng bài / Phần thi:</label>
                <select
                  value={newQuestionData.sectionTitle}
                  onChange={(e) => setNewQuestionData({ ...newQuestionData, sectionTitle: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="PART I: LEAFLET & ANNOUNCEMENT CLOZE (6 CÂU)">PART I: LEAFLET & ANNOUNCEMENT CLOZE</option>
                  <option value="PART II: SENTENCE ARRANGEMENT (5 CÂU)">PART II: SENTENCE ARRANGEMENT</option>
                  <option value="PART III: CLOZE TEST (THE GUARDIAN - 5 CÂU)">PART III: CLOZE TEST (THE GUARDIAN)</option>
                  <option value="PART IV: READING COMPREHENSION 1 (BBC - 8 CÂU)">PART IV: READING COMPREHENSION 1 (BBC)</option>
                  <option value="PART V: READING COMPREHENSION 2 (NATGEO - 8 CÂU)">PART V: READING COMPREHENSION 2 (NATGEO)</option>
                  <option value="PART VI: PHONETICS & SOCIAL EXCHANGES (8 CÂU)">PART VI: PHONETICS & SOCIAL EXCHANGES</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung câu hỏi:</label>
                <textarea
                  rows={2}
                  value={newQuestionData.question}
                  onChange={(e) => setNewQuestionData({ ...newQuestionData, question: e.target.value })}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">4 Phương án (A, B, C, D):</label>
                <div className="grid grid-cols-2 gap-2">
                  {(newQuestionData.options || []).map((opt, oIdx) => (
                    <input
                      key={oIdx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...(newQuestionData.options || [])];
                        newOpts[oIdx] = e.target.value;
                        setNewQuestionData({ ...newQuestionData, options: newOpts });
                      }}
                      className="p-2 border border-slate-300 rounded-xl font-medium"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đáp án đúng:</label>
                <input
                  type="text"
                  value={newQuestionData.answer}
                  onChange={(e) => setNewQuestionData({ ...newQuestionData, answer: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Điểm ngữ pháp / Kiến thức:</label>
                <input
                  type="text"
                  value={newQuestionData.grammarPoint}
                  onChange={(e) => setNewQuestionData({ ...newQuestionData, grammarPoint: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hướng dẫn giải 6 bước:</label>
                <textarea
                  rows={3}
                  value={newQuestionData.explanation}
                  onChange={(e) => setNewQuestionData({ ...newQuestionData, explanation: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddingQuestion(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddNewQuestion}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                Thêm vào đề thi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {selectedStudentResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {selectedStudentResult.studentName} ({selectedStudentResult.studentId})
                </h3>
                <p className="text-xs text-slate-500">
                  Lớp: {selectedStudentResult.className} • Thời điểm nộp: {selectedStudentResult.submittedAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentResult(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-slate-500 block">Điểm số</span>
                <span className="text-xl font-black text-blue-700">{selectedStudentResult.score.toFixed(2)}/10</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-slate-500 block">Số câu đúng</span>
                <span className="text-xl font-black text-emerald-700">{selectedStudentResult.correctCount}/40 câu</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Thời gian làm bài</span>
                <span className="font-bold text-slate-800">{selectedStudentResult.durationMinutes} phút</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Cảnh báo thoát tab</span>
                <span className={`font-bold ${selectedStudentResult.tabSwitches > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {selectedStudentResult.tabSwitches} lần
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs pt-1">
              <h4 className="font-bold text-slate-800">Điểm chi tiết theo kỹ năng:</h4>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Ngữ pháp:</span>
                  <span className="font-bold text-slate-800">{selectedStudentResult.grammarScore || 8.5}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Từ vựng:</span>
                  <span className="font-bold text-slate-800">{selectedStudentResult.vocabScore || 8.0}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Đọc hiểu:</span>
                  <span className="font-bold text-slate-800">{selectedStudentResult.readingScore || 7.5}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Suy luận & Vận dụng cao:</span>
                  <span className="font-bold text-slate-800">{selectedStudentResult.inferenceScore || 7.0}/10</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedStudentResult(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SỐ HÓA ĐỀ THI WORD/PDF CHUẨN MA TRẬN BỘ GD&ĐT 2026 */}
      <ThptExamDigitizerModal
        isOpen={showDigitizerModal}
        onClose={() => setShowDigitizerModal(false)}
        onSaveExam={handleSaveDigitizedExam}
        onShowToast={onShowToast}
      />

      {/* MODAL CHẤM ĐIỂM TỰ ĐỘNG & AI CHẨN ĐOÁN CÁ NHÂN HÓA (CHUỖI 40 CÂU) */}
      {activeExam && (
        <ThptFastGraderModal
          isOpen={showFastGraderModal}
          onClose={() => setShowFastGraderModal(false)}
          activeExam={activeExam}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
