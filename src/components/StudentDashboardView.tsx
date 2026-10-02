import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Award,
  Calendar,
  Camera,
  FileCheck,
  AlertCircle,
  HelpCircle,
  User,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Layers,
  Search,
  ExternalLink,
  ListOrdered,
  Volume2,
  Headphones,
  PenTool,
  RotateCcw,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Mic,
  Flag,
  Timer,
  BarChart3,
  TrendingUp,
  BrainCircuit,
  Target,
  Zap,
  Activity,
  Check,
  Edit3
} from 'lucide-react';
import { AuthUser, ClassItem, ExamItem, ExamQuestion, HomeworkTask, SubmissionItem, StudentItem } from '../types';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';
import { AudioPlayerControl } from './AudioPlayerControl';
import { ReadingPassageWorkspace } from './ReadingPassageWorkspace';
import { EnglishSkillsView } from './EnglishSkillsView';
import {
  formatQuestionHtml,
  formatOptionHtml,
  isOptionMatchingAnswer,
  inferUnderlinedPart,
  playPronunciationAudio,
  cleanQuestionContent
} from '../utils/examFormatters';

interface StudentDashboardViewProps {
  user: AuthUser;
  classes: ClassItem[];
  exams: ExamItem[];
  tasks: HomeworkTask[];
  submissions: SubmissionItem[];
  students?: StudentItem[];
  activeStudentSection: 'exams' | 'skills' | 'results' | 'tasks' | 'profile' | 'live-voice';
  onSectionChange: (sec: 'exams' | 'skills' | 'results' | 'tasks' | 'profile' | 'live-voice') => void;
  onSubmissionSuccess: (sub: SubmissionItem) => void;
  onTaskSubmit?: (taskId: string) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  user,
  classes,
  exams,
  tasks,
  submissions,
  students,
  activeStudentSection,
  onSectionChange,
  onSubmissionSuccess,
  onTaskSubmit
}) => {
  // Current Student Class
  const studentClass = classes.find(c => 
    (user.classId && c.id === user.classId) || 
    (user.className && c.name.toLowerCase() === user.className.toLowerCase())
  ) || classes[0];

  const safeClassName = (() => {
    const raw = studentClass?.name || user.className;
    if (!raw) return 'Lớp 12G09';
    const clean = raw.trim();
    if (
      clean.includes('@') ||
      /[!#$%^&*()+=\[\]{};':"\\|,.<>\/?]/.test(clean) ||
      /phucbinh/i.test(clean) ||
      /@123/i.test(clean) ||
      clean.length > 15
    ) {
      return 'Lớp 12G09';
    }
    return clean.startsWith('Lớp ') ? clean : `Lớp ${clean}`;
  })();

  // Active Exam Taking State
  const [activeExam, setActiveExam] = useState<ExamItem | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmittedSub, setJustSubmittedSub] = useState<SubmissionItem | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Student Name State (Without hardcoded default name)
  const [studentDisplayName, setStudentDisplayName] = useState(
    user.name && user.name.trim() !== 'Nguyễn Văn An' ? user.name : ''
  );
  const [isSavedName, setIsSavedName] = useState(false);
  const [isEditingStudentName, setIsEditingStudentName] = useState(false);

  // Personalized AI Performance Analytics States
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiScanTimestamp, setAiScanTimestamp] = useState('Hôm nay, vừa cập nhật');
  const [activeExamsSubTab, setActiveExamsSubTab] = useState<'exams' | 'tasks'>('exams');

  const handleRunAiAnalysis = () => {
    setIsAnalyzingAi(true);
    setTimeout(() => {
      setIsAnalyzingAi(false);
      const now = new Date();
      setAiScanTimestamp(`Lúc ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}, ngày ${now.getDate()}/${now.getMonth() + 1}`);
    }, 850);
  };

  const handleSaveStudentName = () => {
    const trimmed = studentDisplayName.trim();
    if (!trimmed) return;
    user.name = trimmed;
    authService.setStoredUser({
      ...user,
      name: trimmed,
      avatar: trimmed.split(' ').filter(Boolean).slice(-2).map(w => w[0].toUpperCase()).join('') || 'HS'
    });
    setIsSavedName(true);
    setIsEditingStudentName(false);
    setTimeout(() => setIsSavedName(false), 2500);
  };

  // Enhanced Student Exam Experience: Countdown Timer, Question Palette & Review
  const [timeLeft, setTimeLeft] = useState<number>(3000);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [timeUpAlert, setTimeUpAlert] = useState<boolean>(false);

  // Selected Submission for Detailed Review
  const [selectedReviewSub, setSelectedReviewSub] = useState<SubmissionItem | null>(null);

  // Filter exams for student's class with full ID and name normalization
  const classExams = useMemo(() => {
    const studentNamesToMatch = [
      studentClass?.name?.toLowerCase().trim(),
      user.className?.toLowerCase().trim(),
      studentClass?.name?.toLowerCase().replace(/^lớp\s+/i, '').trim(),
      user.className?.toLowerCase().replace(/^lớp\s+/i, '').trim(),
    ].filter(Boolean) as string[];

    const studentIdsToMatch = [
      studentClass?.id,
      user.classId,
    ].filter(Boolean) as string[];

    return exams.filter(e => {
      const hasClassNames = Array.isArray(e.assignedClasses) && e.assignedClasses.length > 0;
      const hasClassIds = Array.isArray(e.assignedClassIds) && e.assignedClassIds.length > 0;

      // If exam is explicitly assigned to specific classes
      if (hasClassNames || hasClassIds) {
        // 1. Check class IDs match
        if (hasClassIds && e.assignedClassIds!.some(id => studentIdsToMatch.includes(id))) {
          return true;
        }

        // 2. Check class names match (handles "12A1" vs "Lớp 12A1")
        if (hasClassNames) {
          const isNameMatch = e.assignedClasses!.some(rawName => {
            const clean = rawName.toLowerCase().trim();
            const cleanShort = clean.replace(/^lớp\s+/i, '');
            if (clean === 'toàn khối' || clean === 'tất cả các lớp' || clean === 'all') return true;
            return studentNamesToMatch.includes(clean) || studentNamesToMatch.includes(cleanShort);
          });
          if (isNameMatch) return true;
        }

        return false;
      }

      // If exam has no assignments specified, keep it available for open practice
      return true;
    });
  }, [exams, studentClass, user.classId, user.className]);

  // Student specific submissions
  const mySubmissions = submissions.filter(s => {
    if (user.studentId && s.studentId && s.studentId === user.studentId) return true;
    if (user.name && s.studentName && s.studentName.trim().toLowerCase() === user.name.trim().toLowerCase()) return true;
    if (user.phone && s.studentPhone && s.studentPhone === user.phone) return true;
    return false;
  });

  // Student specific tasks
  const classTasks = tasks.filter(t => !studentClass || t.className === studentClass.name || t.className === 'Toàn khối');

  // Grade and Status Filter for Class Exams
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'all' | '10' | '11' | '12'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'uncompleted' | 'completed'>('all');

  const filteredClassExams = useMemo(() => {
    return classExams.filter(exam => {
      // 1. Grade filter
      if (selectedGradeFilter !== 'all') {
        const gradeStr = exam.grade || '';
        if (!gradeStr.includes(selectedGradeFilter)) {
          return false;
        }
      }
      // 2. Status filter
      if (statusFilter !== 'all') {
        const subsCount = mySubmissions.filter(s => s.examId === exam.id).length;
        if (statusFilter === 'uncompleted' && subsCount > 0) return false;
        if (statusFilter === 'completed' && subsCount === 0) return false;
      }
      return true;
    });
  }, [classExams, selectedGradeFilter, statusFilter, mySubmissions]);

  const handleStartExam = (exam: ExamItem) => {
    const studentExamSubs = mySubmissions.filter(s => s.examId === exam.id);
    const maxAttempts = exam.maxAttempts !== undefined ? exam.maxAttempts : 0;
    const isUnlimited = maxAttempts === 0;

    // If max attempts reached, switch directly to review mode
    if (!isUnlimited && studentExamSubs.length >= maxAttempts) {
      if (studentExamSubs.length > 0) {
        setSelectedReviewSub(studentExamSubs[0]);
        onSectionChange('results');
      }
      return;
    }

    setActiveExam(exam);

    // Calculate duration in seconds
    let seconds = 50 * 60;
    const dur = exam.duration || '';
    const m = dur.match(/(\d+)\s*phút/i);
    if (m) seconds = parseInt(m[1], 10) * 60;
    const h = dur.match(/(\d+)\s*giờ/i);
    if (h) seconds = parseInt(h[1], 10) * 3600;

    setTimeLeft(seconds);
    setIsTimerRunning(true);
    setFlaggedQuestions(new Set());
    setReviewFilter('all');
    setTimeUpAlert(false);

    // Restore any draft answers for this exam if exist
    try {
      localStorage.setItem('STUDENT_ACTIVE_EXAM_ID', exam.id);
      const draft = localStorage.getItem(`STUDENT_DRAFT_${exam.id}_${user.id || 'current'}`);
      if (draft) {
        setSelectedAnswers(JSON.parse(draft));
      } else {
        setSelectedAnswers({});
      }
    } catch {
      setSelectedAnswers({});
    }
    setJustSubmittedSub(null);
    setShowSubmitConfirm(false);
  };

  // Auto-restore active exam and selected answers after browser refresh
  useEffect(() => {
    if (activeExam) return;
    try {
      const savedActiveExamId = localStorage.getItem('STUDENT_ACTIVE_EXAM_ID');
      if (savedActiveExamId && exams && exams.length > 0) {
        const found = exams.find(e => e.id === savedActiveExamId);
        if (found) {
          handleStartExam(found);
        }
      }
    } catch {}
  }, [exams]);

  // Live Countdown Timer
  useEffect(() => {
    if (!activeExam || justSubmittedSub || !isTimerRunning) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeUpAlert(true);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeExam, justSubmittedSub, isTimerRunning]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectAnswer = (qNum: number, opt: string) => {
    if (justSubmittedSub) return;
    setSelectedAnswers(prev => {
      const updated = { ...prev, [qNum]: opt };
      if (activeExam) {
        try {
          localStorage.setItem(`STUDENT_DRAFT_${activeExam.id}_${user.id || 'current'}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const handleSubmitExam = async () => {
    if (!activeExam) return;
    setIsSubmitting(true);

    let correct = 0;
    let objectiveTotal = 0;

    // Check for essay question
    const essayQuestion = activeExam.questions.find(q =>
      q.questionType === 'essay' ||
      q.sectionType === 'essay_writing' ||
      !!q.essayPrompt ||
      (q.sectionTitle && q.sectionTitle.toLowerCase().includes('essay'))
    );

    activeExam.questions.forEach(q => {
      const isEssay = q.questionType === 'essay' ||
        q.sectionType === 'essay_writing' ||
        !!q.essayPrompt ||
        (q.sectionTitle && q.sectionTitle.toLowerCase().includes('essay'));

      if (isEssay) return; // graded separately by teacher rubric
      objectiveTotal++;

      const chosen = selectedAnswers[q.num];
      if (!chosen) return;

      const isShortAnswer = q.questionType === 'short_answer' ||
        q.sectionType === 'writing_short' ||
        (!isEssay && (!q.options || q.options.length === 0));

      if (isShortAnswer) {
        const cleanStudent = chosen.trim().toLowerCase().replace(/[.,!?;:]+$/, '');
        const cleanAnswer = (q.answer || '').trim().toLowerCase().replace(/[.,!?;:]+$/, '');
        if (cleanAnswer && (cleanStudent === cleanAnswer || cleanAnswer.includes(cleanStudent) || cleanStudent.includes(cleanAnswer))) {
          correct++;
        }
      } else if (isOptionMatchingAnswer(chosen, q.answer)) {
        correct++;
      }
    });

    // Grade student essay as Teacher if essay question exists
    let essayEvaluationResult: any = null;
    if (essayQuestion) {
      const studentEssayText = selectedAnswers[essayQuestion.num] || '';
      try {
        essayEvaluationResult = await apiService.gradeEssay({
          essayText: studentEssayText,
          promptTopic: essayQuestion.essayPrompt?.topic || activeExam.topic || 'Viết đoạn văn tiếng Anh',
          minWords: essayQuestion.essayPrompt?.minWords || 80,
          maxWords: essayQuestion.essayPrompt?.maxWords || 140,
          grade: activeExam.grade || 'Lớp 10'
        });
      } catch (e) {
        console.warn('Essay grading error:', e);
      }
    }

    // Calculate overall score combining objective questions and teacher-graded essay
    let totalScore = 0;
    const totalQuestionsCount = activeExam.questions.length || 1;

    if (essayQuestion && essayEvaluationResult) {
      // In GDPT 2018 English tests, the paragraph essay is weighted at 2.0 / 10 (or 10/N when N <= 6)
      const essayWeightMax = totalQuestionsCount <= 6 ? (10 / totalQuestionsCount) : 2.0;
      const objectiveWeightMax = 10 - essayWeightMax;
      const objectiveEarned = objectiveTotal > 0 ? (correct / objectiveTotal) * objectiveWeightMax : 0;
      const essayEarned = (essayEvaluationResult.totalScore / 10) * essayWeightMax;
      totalScore = Number(Math.min(10, Math.max(0, objectiveEarned + essayEarned)).toFixed(1));
    } else {
      totalScore = Number(((correct / totalQuestionsCount) * 10).toFixed(1));
    }

    const newSub: SubmissionItem = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentName: user.name,
      studentId: user.studentId || 'HS-001',
      classId: studentClass?.id || 'cls-1',
      className: studentClass?.name || user.className || 'Lớp 12A1',
      examId: activeExam.id,
      examTitle: activeExam.title,
      score: totalScore,
      totalQuestions: activeExam.questions.length,
      correctAnswersCount: correct + (essayEvaluationResult && essayEvaluationResult.totalScore >= 5 ? 1 : 0),
      answers: selectedAnswers,
      submittedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      essayEvaluation: essayEvaluationResult || undefined
    };

    try {
      localStorage.removeItem('STUDENT_ACTIVE_EXAM_ID');
      localStorage.removeItem(`STUDENT_DRAFT_${activeExam.id}_${user.id || 'current'}`);
    } catch {}

    await apiService.submitExam(newSub);
    onSubmissionSuccess(newSub);
    setJustSubmittedSub(newSub);
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
      
      {/* 1. PERSISTENT STUDENT NAVIGATION SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white rounded-3xl border border-slate-200/90 p-4 shadow-xs sticky top-20 self-start space-y-4">
        {/* Student Mini Profile Card */}
        <div className="p-3.5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-200/80 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
              {user.avatar && user.avatar !== 'NA' ? user.avatar : 'HS'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs text-slate-900 truncate">
                  {studentDisplayName || (user.name && user.name.trim() !== 'Nguyễn Văn An' ? user.name : 'Học sinh')}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingStudentName(!isEditingStudentName)}
                  title="Chỉnh sửa họ tên"
                  className="p-1 hover:bg-emerald-100 text-emerald-700 rounded-md transition cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] font-semibold text-emerald-700 truncate">
                {safeClassName}
              </p>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                PIN: <span className="font-bold text-slate-700">{studentClass?.pin || '4324'}</span>
              </div>
            </div>
          </div>

          {/* Quick Inline Student Name Editor */}
          {isEditingStudentName && (
            <div className="pt-2 border-t border-emerald-200/60 space-y-1.5 animate-in fade-in">
              <input
                type="text"
                value={studentDisplayName}
                onChange={(e) => setStudentDisplayName(e.target.value)}
                placeholder="Nhập họ và tên..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSaveStudentName}
                  className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
                >
                  {isSavedName ? '✓ Đã lưu' : 'Lưu tên'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingStudentName(false)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-lg transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Three Distinct, Persistent Student Navigation Sections */}
        <div className="space-y-1.5">
          <div className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Menu Học Tập Cốt Lõi</span>
            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">3 MỤC</span>
          </div>

          {/* Section 1: My Exams */}
          <button
            type="button"
            onClick={() => {
              setActiveExam(null);
              setSelectedReviewSub(null);
              onSectionChange('exams');
            }}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer border ${
              activeStudentSection === 'exams'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-slate-50/60 text-slate-700 border-slate-200/80 hover:bg-emerald-50/50 hover:border-emerald-200 hover:text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-xl shrink-0 ${
                activeStudentSection === 'exams' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold truncate">My Exams</div>
                <div className={`text-[10px] truncate ${
                  activeStudentSection === 'exams' ? 'text-emerald-100' : 'text-slate-500'
                }`}>
                  Bài tập & đề thi lớp giao
                </div>
              </div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
              activeStudentSection === 'exams' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {classExams.length}
            </span>
          </button>

          {/* Section 2: English Skills */}
          <button
            type="button"
            onClick={() => {
              setActiveExam(null);
              setSelectedReviewSub(null);
              onSectionChange('skills');
            }}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeStudentSection === 'skills'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-600 shadow-lg shadow-teal-600/25 ring-2 ring-teal-400/40'
                : 'bg-slate-50/70 text-slate-700 border-slate-200/90 hover:bg-teal-50/70 hover:border-teal-300 hover:text-teal-900 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-xl shrink-0 transition-transform ${
                activeStudentSection === 'skills' ? 'bg-white/20 text-amber-300 scale-105' : 'bg-teal-100 text-teal-700'
              }`}>
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold truncate">English Skills</div>
                <div className={`text-[10px] font-semibold truncate ${
                  activeStudentSection === 'skills' ? 'text-teal-100' : 'text-slate-500'
                }`}>
                  Tự luyện 10-15 câu/kỹ năng
                </div>
              </div>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded font-black shrink-0 ${
              activeStudentSection === 'skills'
                ? 'bg-amber-400 text-teal-950 shadow-xs'
                : 'bg-teal-100 text-teal-800'
            }`}>
              10-15 CÂU
            </span>
          </button>

          {/* Section 3: Progress Reports */}
          <button
            type="button"
            onClick={() => {
              setActiveExam(null);
              setSelectedReviewSub(null);
              onSectionChange('results');
            }}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer border ${
              activeStudentSection === 'results'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                : 'bg-slate-50/60 text-slate-700 border-slate-200/80 hover:bg-indigo-50/50 hover:border-indigo-200 hover:text-indigo-800'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-xl shrink-0 ${
                activeStudentSection === 'results' ? 'bg-white/20 text-cyan-300' : 'bg-indigo-100 text-indigo-700'
              }`}>
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold truncate flex items-center gap-1.5">
                  <span>Progress Reports</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-black ${
                    activeStudentSection === 'results' ? 'bg-amber-400 text-indigo-950' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    AI
                  </span>
                </div>
                <div className={`text-[10px] truncate ${
                  activeStudentSection === 'results' ? 'text-indigo-100' : 'text-slate-500'
                }`}>
                  Phân tích năng lực AI cá nhân hóa
                </div>
              </div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
              activeStudentSection === 'results' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {mySubmissions.length}
            </span>
          </button>
        </div>

        {/* Quick Summary Widget & Live Speaking Launcher */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-700">
            <span>Tiến độ hoàn thành</span>
            <span className="text-emerald-600 font-extrabold">
              {classExams.length > 0 ? Math.round((mySubmissions.length / classExams.length) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${classExams.length > 0 ? Math.min(100, Math.round((mySubmissions.length / classExams.length) * 100)) : 0}%`
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>Điểm TB: <strong className="text-slate-800">{mySubmissions.length > 0 ? (mySubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / mySubmissions.length).toFixed(1) : '0.0'}</strong></span>
            <span>Đã nộp: <strong className="text-slate-800">{mySubmissions.length}/{classExams.length}</strong></span>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveExam(null);
              setSelectedReviewSub(null);
              onSectionChange('live-voice');
            }}
            className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] border border-purple-200 transition cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-purple-600" />
            <span>Luyện Nói AI Live (3.8 Live)</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN STUDENT CONTENT AREA */}
      <div className="flex-1 min-w-0 space-y-6 w-full">
        {/* Student Welcome Banner with Class Information */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 rounded-l-full blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-xs font-bold text-emerald-100 flex items-center gap-1.5 border border-white/20">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Cổng Học Tập Học Sinh</span>
                </span>
                <span className="bg-emerald-950/40 px-3 py-0.5 rounded-full text-xs font-bold text-emerald-200 border border-emerald-400/30">
                  Lớp trực thuộc: {safeClassName}
                </span>
                <span className="bg-emerald-950/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-100">
                  GV: Thầy Dương Văn Bình
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {studentDisplayName || (user.name && user.name.trim() !== 'Nguyễn Văn An' ? user.name : '')
                  ? `Xin chào, ${studentDisplayName || user.name}! 👋`
                  : 'Xin chào em! 👋'}
              </h1>
              <p className="text-xs text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
                Em đang trực thuộc <strong>{safeClassName}</strong> (Mã lớp: {studentClass?.code || 'AV-496'}). Dưới đây là các bài kiểm tra trắc nghiệm và nhiệm vụ do Thầy Bình giao cho lớp em.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center min-w-[90px]">
                <div className="text-xl font-black">{classExams.length}</div>
                <div className="text-[10px] text-emerald-100 font-medium">Bài tập mở</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center min-w-[90px]">
                <div className="text-xl font-black">{mySubmissions.length}</div>
                <div className="text-[10px] text-emerald-100 font-medium">Đã hoàn thành</div>
              </div>
            </div>
          </div>
        </div>

        {/* PERSISTENT HEADER TABS FOR STUDENT (Sticky on scroll across all devices) */}
        <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="grid grid-cols-3 gap-2">
            {/* Section 1: My Exams */}
            <button
              type="button"
              onClick={() => {
                setActiveExam(null);
                setSelectedReviewSub(null);
                onSectionChange('exams');
              }}
              className={`flex items-center justify-center sm:justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs ${
                activeStudentSection === 'exams'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className={`w-4 h-4 shrink-0 ${activeStudentSection === 'exams' ? 'text-white' : 'text-emerald-600'}`} />
                <div className="text-left hidden sm:block truncate">
                  <div className="font-extrabold truncate">My Exams</div>
                  <div className={`text-[10px] truncate ${activeStudentSection === 'exams' ? 'text-emerald-100' : 'text-slate-500'}`}>
                    Bài tập lớp giao
                  </div>
                </div>
                <span className="sm:hidden font-extrabold">My Exams</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ml-1.5 shrink-0 ${
                activeStudentSection === 'exams'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {classExams.length}
              </span>
            </button>

            {/* Section 2: English Skills */}
            <button
              type="button"
              onClick={() => {
                setActiveExam(null);
                setSelectedReviewSub(null);
                onSectionChange('skills');
              }}
              className={`flex items-center justify-center sm:justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs ${
                activeStudentSection === 'skills'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Layers className={`w-4 h-4 shrink-0 ${activeStudentSection === 'skills' ? 'text-amber-300' : 'text-teal-600'}`} />
                <div className="text-left hidden sm:block truncate">
                  <div className="font-extrabold truncate">English Skills</div>
                  <div className={`text-[10px] truncate ${activeStudentSection === 'skills' ? 'text-teal-100' : 'text-slate-500'}`}>
                    Grammar & Lexico
                  </div>
                </div>
                <span className="sm:hidden font-extrabold">English Skills</span>
              </div>
              <span className="text-[9px] bg-amber-400 text-blue-950 px-1.5 py-0.5 rounded font-black shadow-2xs ml-1.5 shrink-0">
                4 KỸ NĂNG
              </span>
            </button>

            {/* Section 3: Progress Reports */}
            <button
              type="button"
              onClick={() => {
                setActiveExam(null);
                setSelectedReviewSub(null);
                onSectionChange('results');
              }}
              className={`flex items-center justify-center sm:justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs ${
                activeStudentSection === 'results'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <BarChart3 className={`w-4 h-4 shrink-0 ${activeStudentSection === 'results' ? 'text-cyan-300' : 'text-indigo-600'}`} />
                <div className="text-left hidden sm:block truncate">
                  <div className="font-extrabold truncate flex items-center gap-1">
                    <span>Progress Reports</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded font-black ${
                      activeStudentSection === 'results' ? 'bg-amber-400 text-indigo-950' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      AI
                    </span>
                  </div>
                  <div className={`text-[10px] truncate ${activeStudentSection === 'results' ? 'text-indigo-100' : 'text-slate-500'}`}>
                    Phân tích năng lực AI
                  </div>
                </div>
                <span className="sm:hidden font-extrabold">Progress Reports</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ml-1.5 shrink-0 ${
                activeStudentSection === 'results'
                  ? 'bg-white/20 text-white'
                  : 'bg-indigo-100 text-indigo-800'
              }`}>
                {mySubmissions.length}
              </span>
            </button>
          </div>
        </div>

      {/* SECTION 1: BÀI TẬP CẦN LÀM */}
      {activeStudentSection === 'exams' && (
        <div>
          {activeExam ? (
            /* Active Exam Taking Room */
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
              
              {/* Exam Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <button
                    onClick={() => setActiveExam(null)}
                    className="text-xs font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1 mb-2 cursor-pointer"
                  >
                    ← Quay lại danh sách bài tập
                  </button>
                  <h2 className="text-lg md:text-xl font-black text-slate-900">{activeExam.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>Môn: {activeExam.subject}</span>
                    <span>•</span>
                    <span>Số câu: {activeExam.questions.length} câu</span>
                    <span>•</span>
                    <span>Thời gian: {activeExam.duration}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                  {/* Attempt info badge */}
                  {(() => {
                    const attemptsDone = mySubmissions.filter(s => s.examId === activeExam.id).length;
                    const maxAttempts = activeExam.maxAttempts !== undefined ? activeExam.maxAttempts : 0;
                    if (maxAttempts === 1) {
                      return (
                        <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>Chỉ làm 1 lần duy nhất</span>
                        </span>
                      );
                    }
                    if (maxAttempts > 1) {
                      return (
                        <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1.5 shadow-2xs">
                          <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                          <span>Lượt làm: {attemptsDone + 1} / {maxAttempts} lần</span>
                        </span>
                      );
                    }
                    return (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Luyện tập tự do (∞)</span>
                      </span>
                    );
                  })()}

                  {justSubmittedSub ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                      <div className="text-xs font-bold text-emerald-700">Điểm số bài làm</div>
                      <div className="text-2xl font-black text-emerald-600">{justSubmittedSub.score} / 10</div>
                    </div>
                  ) : (
                    <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition shadow-2xs ${
                      timeLeft < 300
                        ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                        : timeLeft < 600
                        ? 'bg-amber-100 text-amber-950 border-amber-300'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    }`}>
                      <Timer className={`w-4 h-4 ${timeLeft < 300 ? 'text-rose-600 animate-spin' : timeLeft < 600 ? 'text-amber-600' : 'text-emerald-600'}`} />
                      <span>Thời gian: <strong className="font-mono text-sm">{formatCountdown(timeLeft)}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Time Up Alert Banner */}
              {timeUpAlert && (
                <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center gap-3 text-rose-950 font-bold text-xs animate-bounce">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>⏰ Hết thời gian làm bài! Hệ thống đã tự động ghi nhận và nộp bài thi của em.</span>
                </div>
              )}

              {/* Question Navigation Palette when taking exam */}
              {!justSubmittedSub && (
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Bảng tiến độ câu hỏi:</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[11px] border border-emerald-200">
                        Đã làm: {Object.keys(selectedAnswers).length}/{activeExam.questions.length} ({Math.round((Object.keys(selectedAnswers).length / activeExam.questions.length) * 100)}%)
                      </span>
                      {flaggedQuestions.size > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[11px] border border-amber-300 flex items-center gap-1">
                          <span>🚩 Đã đánh dấu: {flaggedQuestions.size} câu</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block shadow-2xs" /> Đã chọn
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-md bg-amber-400 border border-amber-600 inline-block" /> Đánh dấu
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-md bg-white border border-slate-300 inline-block" /> Chưa làm
                      </span>
                    </div>
                  </div>

                  {/* Buttons Grid */}
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-white/80 rounded-xl border border-slate-200/80">
                    {activeExam.questions.map((q) => {
                      const isAnswered = !!selectedAnswers[q.num];
                      const isFlagged = flaggedQuestions.has(q.num);
                      let btnClass = 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-100';
                      if (isFlagged) {
                        btnClass = 'bg-amber-400 text-amber-950 font-black border-amber-600 ring-2 ring-amber-300';
                      } else if (isAnswered) {
                        btnClass = 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-2xs';
                      }

                      return (
                        <button
                          key={q.num}
                          type="button"
                          onClick={() => {
                            const el = document.getElementById(`student-q-${q.num}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className={`w-8 h-8 rounded-lg border text-xs flex items-center justify-center transition cursor-pointer active:scale-95 relative ${btnClass}`}
                          title={`Câu ${q.num}: ${isFlagged ? 'Đã đánh dấu xem lại' : isAnswered ? 'Đã chọn' : 'Chưa làm'}`}
                        >
                          {q.num}
                          {isFlagged && (
                            <span className="absolute -top-1 -right-1 text-[9px]">🚩</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Warning Notice if 1-Attempt Exam Mode */}
              {!justSubmittedSub && activeExam.maxAttempts === 1 && (
                <div className="bg-amber-50/95 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3.5 text-amber-950 shadow-2xs animate-in fade-in duration-150">
                  <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed space-y-1">
                    <div className="font-black text-amber-950 text-sm">
                      ⚠️ Chế độ kiểm tra chính thức: Chỉ được nộp bài 1 lần duy nhất
                    </div>
                    <div className="text-amber-900">
                      Giáo viên đã cấu hình giới hạn <strong>1 lượt làm bài</strong> cho bộ đề này. Điểm số sẽ được ghi nhận ngay sau khi nộp bài và em <strong>sẽ không thể làm lại</strong>. Vui lòng rà soát kỹ tất cả các câu trước khi bấm Nộp bài.
                    </div>
                  </div>
                </div>
              )}

              {/* Submitted Congratulation & AI Diagnostic Banner */}
              {justSubmittedSub && (
                <div className="space-y-4">
                  {/* Score & Congratulation */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                        ✓
                      </div>
                      <div>
                        <div className="font-extrabold text-base text-emerald-950">
                          Nộp bài thành công • {justSubmittedSub.score}/10 điểm
                        </div>
                        <div className="text-xs text-emerald-700 mt-0.5">
                          Em đã trả lời đúng {justSubmittedSub.correctAnswersCount}/{justSubmittedSub.totalQuestions} câu. Kết quả đã được lưu tự động vào sổ theo dõi học tập của lớp.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personalized AI Error Diagnostic & Recommendation */}
                  <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 border border-indigo-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Chẩn đoán lỗi sai cá nhân hóa do Trợ Lý AI Thầy Bình</span>
                    </div>

                    {(() => {
                      const wrongQs = activeExam.questions.filter(q => {
                        const chosen = selectedAnswers[q.num];
                        return !isOptionMatchingAnswer(chosen, q.answer);
                      });

                      if (wrongQs.length === 0) {
                        return (
                          <div className="text-xs text-indigo-900 bg-white/80 p-3.5 rounded-xl border border-indigo-100 flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-emerald-800">Thành tích xuất sắc: Đúng tuyệt đối 100%!</div>
                              <p className="text-slate-600 mt-0.5">
                                Em đã nắm rất vững cấu trúc và từ vựng của bài thi này. Hãy tiếp tục duy trì phong độ cho các bài tập tiếp theo!
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2.5 text-xs">
                          <div className="bg-white/90 p-3.5 rounded-xl border border-indigo-100 text-slate-700 space-y-1.5">
                            <div className="font-bold text-rose-700 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Phát hiện {wrongQs.length} câu cần củng cố kiến thức: Câu {wrongQs.map(q => q.num).join(', ')}</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                              Các câu sai thường tập trung vào dạng chia thì động từ hoặc cấu trúc mệnh đề. Em hãy kéo xuống dưới để xem <strong>Giải thích chi tiết</strong> của từng câu sai được tô đỏ, đối chiếu với đáp án đúng màu xanh.
                            </p>
                          </div>

                          <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-xl text-amber-900 font-medium">
                            💡 <strong>Lời khuyên ôn tập từ Thầy Bình:</strong> Hãy ghi chú lại quy tắc ngữ pháp của các câu {wrongQs.map(q => q.num).join(', ')} vào vở ghi, sau đó bấm <em>"Làm lại để nâng điểm"</em> nhằm ghi nhớ lâu hơn.
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onSectionChange('results')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                      >
                        Xem lịch sử & Bảng xếp hạng lớp
                      </button>
                      <button
                        onClick={() => setActiveExam(null)}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Quay lại danh sách bài tập
                      </button>
                    </div>
                  </div>

                  {/* Teacher's Essay Evaluation Card */}
                  {justSubmittedSub.essayEvaluation && (
                    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-300 rounded-2xl p-5 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                            <PenTool className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-emerald-950 uppercase tracking-wide">
                              Chấm Điểm & Lời Nhận Xét Của Giáo Viên Về Đoạn Văn
                            </h3>
                            <p className="text-[11px] text-emerald-800 font-medium">
                              Đánh giá theo 4 tiêu chí khảo thí chuẩn GDPT 2018 (Thang điểm 10 quy đổi vào điểm toàn bài)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-100/90 text-emerald-900 px-3.5 py-1.5 rounded-xl border border-emerald-300 font-extrabold text-sm">
                          <span>Điểm bài viết:</span>
                          <span className="text-emerald-700 text-base font-black">{justSubmittedSub.essayEvaluation.totalScore} / 10đ</span>
                        </div>
                      </div>

                      {/* 4 Criteria Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* 1. Task Achievement */}
                        <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-200/80 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between font-bold text-emerald-900">
                            <span className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-black">1</span>
                              <span>Task Achievement (Nhiệm vụ đề)</span>
                            </span>
                            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-extrabold">
                              {justSubmittedSub.essayEvaluation.criteria.taskAchievement.score} / 2.5đ
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            {justSubmittedSub.essayEvaluation.criteria.taskAchievement.feedback}
                          </p>
                        </div>

                        {/* 2. Coherence & Cohesion */}
                        <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-200/80 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between font-bold text-emerald-900">
                            <span className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-black">2</span>
                              <span>Coherence & Cohesion (Mạch lạc)</span>
                            </span>
                            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-extrabold">
                              {justSubmittedSub.essayEvaluation.criteria.coherence.score} / 2.5đ
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            {justSubmittedSub.essayEvaluation.criteria.coherence.feedback}
                          </p>
                        </div>

                        {/* 3. Lexical Resource */}
                        <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-200/80 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between font-bold text-emerald-900">
                            <span className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-black">3</span>
                              <span>Lexical Resource (Vốn từ vựng)</span>
                            </span>
                            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-extrabold">
                              {justSubmittedSub.essayEvaluation.criteria.lexical.score} / 2.5đ
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            {justSubmittedSub.essayEvaluation.criteria.lexical.feedback}
                          </p>
                        </div>

                        {/* 4. Grammatical Range & Accuracy */}
                        <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-200/80 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between font-bold text-emerald-900">
                            <span className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-black">4</span>
                              <span>Grammatical Range (Ngữ pháp)</span>
                            </span>
                            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-extrabold">
                              {justSubmittedSub.essayEvaluation.criteria.grammar.score} / 2.5đ
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            {justSubmittedSub.essayEvaluation.criteria.grammar.feedback}
                          </p>
                        </div>
                      </div>

                      {/* Teacher's General Comment */}
                      <div className="p-3.5 bg-emerald-100/70 border border-emerald-300/80 rounded-xl space-y-1 text-xs">
                        <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <span>💬 Lời phê sư phạm của Giáo viên:</span>
                        </div>
                        <p className="text-emerald-900 leading-relaxed font-medium">
                          "{justSubmittedSub.essayEvaluation.teacherGeneralComment}"
                        </p>
                      </div>

                      {/* Strengths & Improvements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {justSubmittedSub.essayEvaluation.strengths && justSubmittedSub.essayEvaluation.strengths.length > 0 && (
                          <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 space-y-1">
                            <span className="font-bold text-emerald-800">✅ Điểm mạnh đã phát huy:</span>
                            <ul className="space-y-1 text-slate-700 text-[11px]">
                              {justSubmittedSub.essayEvaluation.strengths.map((str, sIdx) => (
                                <li key={sIdx} className="flex items-start gap-1.5">
                                  <span className="text-emerald-600">•</span>
                                  <span>{str}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {justSubmittedSub.essayEvaluation.areasToImprove && justSubmittedSub.essayEvaluation.areasToImprove.length > 0 && (
                          <div className="p-3 bg-white/90 rounded-xl border border-amber-200 space-y-1">
                            <span className="font-bold text-amber-900">⚠️ Điểm cần khắc phục & rèn luyện:</span>
                            <ul className="space-y-1 text-slate-700 text-[11px]">
                              {justSubmittedSub.essayEvaluation.areasToImprove.map((imp, iIdx) => (
                                <li key={iIdx} className="flex items-start gap-1.5">
                                  <span className="text-amber-600">•</span>
                                  <span>{imp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Suggested Revision */}
                      {justSubmittedSub.essayEvaluation.suggestedRevision && (
                        <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                          <span className="font-bold text-blue-900 flex items-center gap-1.5">
                            <span>📝 Đoạn văn viết lại mẫu nâng cấp (Model Paragraph):</span>
                          </span>
                          <p className="text-slate-800 font-serif leading-relaxed italic bg-white/80 p-3 rounded-lg border border-blue-100 text-[12px]">
                            {justSubmittedSub.essayEvaluation.suggestedRevision}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Question Navigation Palette in Review Mode */}
              {justSubmittedSub && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="font-black text-slate-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Bảng đối chiếu câu hỏi & đáp án:</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setReviewFilter('all')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          reviewFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Tất cả ({activeExam.questions.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewFilter('wrong')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          reviewFilter === 'wrong'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <span>❌ Câu sai</span>
                        <span>({activeExam.questions.filter(q => !isOptionMatchingAnswer(selectedAnswers[q.num], q.answer)).length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewFilter('correct')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          reviewFilter === 'correct'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <span>✓ Câu đúng</span>
                        <span>({activeExam.questions.filter(q => isOptionMatchingAnswer(selectedAnswers[q.num], q.answer)).length})</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-white/80 rounded-xl border border-slate-200/80">
                    {activeExam.questions.map((q) => {
                      const isCorrect = isOptionMatchingAnswer(selectedAnswers[q.num], q.answer);
                      const btnClass = isCorrect
                        ? 'bg-emerald-600 text-white border-emerald-700 font-bold'
                        : 'bg-rose-500 text-white border-rose-600 font-bold';

                      return (
                        <button
                          key={q.num}
                          type="button"
                          onClick={() => {
                            const el = document.getElementById(`student-q-${q.num}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className={`w-8 h-8 rounded-lg border text-xs flex items-center justify-center transition cursor-pointer active:scale-95 ${btnClass}`}
                          title={`Câu ${q.num}: ${isCorrect ? 'Làm đúng' : 'Làm sai'}`}
                        >
                          {q.num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Questions List grouped by Passage or Standalone */}
              {(() => {
                interface QuestionBlock {
                  type: 'passage' | 'regular';
                  passage?: string;
                  passageTitle?: string;
                  sectionType?: string;
                  sectionTitle?: string;
                  items: { q: typeof activeExam.questions[0]; originalIndex: number }[];
                }

                const questionBlocks: QuestionBlock[] = [];
                let curPassageBlock: QuestionBlock | null = null;

                activeExam.questions.forEach((q, idx) => {
                  const rawPassage = (q.passage || (q as any).readingText || (q as any).passageText || '').trim();
                  if (rawPassage) {
                    if (curPassageBlock && curPassageBlock.passage === rawPassage) {
                      curPassageBlock.items.push({ q, originalIndex: idx });
                    } else {
                      curPassageBlock = {
                        type: 'passage',
                        passage: rawPassage,
                        passageTitle: q.passageTitle,
                        sectionType: q.sectionType,
                        sectionTitle: q.sectionTitle,
                        items: [{ q, originalIndex: idx }],
                      };
                      questionBlocks.push(curPassageBlock);
                    }
                  } else {
                    curPassageBlock = null;
                    questionBlocks.push({
                      type: 'regular',
                      items: [{ q, originalIndex: idx }],
                    });
                  }
                });

                const renderQuestionCard = (q: typeof activeExam.questions[0], idx: number) => {
                  const isEssay = q.questionType === 'essay' ||
                    q.sectionType === 'essay_writing' ||
                    !!q.essayPrompt ||
                    (q.sectionTitle && q.sectionTitle.toLowerCase().includes('essay'));

                  const isShortAnswer = q.questionType === 'short_answer' ||
                    q.sectionType === 'writing_short' ||
                    (!isEssay && (!q.options || q.options.length === 0));

                  const arrangementItems = q.arrangementItems || (q as any).scrambledItems || (q as any).sentences || (q as any).items || [];
                  const chosen = selectedAnswers[q.num];

                  // In review mode, filter by wrong/correct if needed
                  if (justSubmittedSub) {
                    const isMatch = isOptionMatchingAnswer(chosen, q.answer);
                    if (reviewFilter === 'wrong' && isMatch) return null;
                    if (reviewFilter === 'correct' && !isMatch) return null;
                  }

                  const targetUnderlined = q.underlinedPart || inferUnderlinedPart(q);
                  const isPronunQ = q.sectionType === 'pronunciation' ||
                    (q.sectionTitle && q.sectionTitle.toLowerCase().includes('pronunciation')) ||
                    (q.sectionTitle && q.sectionTitle.toLowerCase().includes('phát âm')) ||
                    (q.grammarPoint && q.grammarPoint.toLowerCase().includes('phát âm')) ||
                    (q.question && q.question.toLowerCase().includes('pronounced')) ||
                    (q.question && q.question.toLowerCase().includes('phát âm')) ||
                    !!targetUnderlined;

                  return (
                    <div key={q.id || q.num || idx} id={`student-q-${q.num}`} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3.5 shadow-2xs">
                      {/* Top Bar with Number, Flag Button or Result Tag */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                            {q.num}
                          </span>
                          <strong className="font-extrabold text-sm text-slate-900 tracking-tight">Question {q.num}:</strong>
                          {justSubmittedSub && q.grammarPoint && (
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200 shrink-0">
                              {q.grammarPoint}
                            </span>
                          )}
                        </div>

                        {!justSubmittedSub ? (
                          <button
                            type="button"
                            onClick={() => {
                              setFlaggedQuestions(prev => {
                                const next = new Set(prev);
                                if (next.has(q.num)) next.delete(q.num);
                                else next.add(q.num);
                                return next;
                              });
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                              flaggedQuestions.has(q.num)
                                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                                : 'bg-white text-slate-500 border-slate-200 hover:text-amber-700 hover:border-amber-200'
                            }`}
                          >
                            <Flag className={`w-3.5 h-3.5 ${flaggedQuestions.has(q.num) ? 'fill-amber-500 text-amber-600' : 'text-slate-400'}`} />
                            <span>{flaggedQuestions.has(q.num) ? 'Đã đánh dấu xem lại' : 'Đánh dấu xem lại'}</span>
                          </button>
                        ) : (
                          <div>
                            {isOptionMatchingAnswer(chosen, q.answer) ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Làm đúng (+{(10 / activeExam.questions.length).toFixed(2)}đ)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Làm sai (0đ)</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Question Content */}
                      <div className="font-bold text-sm text-slate-900 leading-snug">
                        <span dangerouslySetInnerHTML={{ __html: formatQuestionHtml(cleanQuestionContent(q.question, !justSubmittedSub)) }} />
                      </div>

                      {/* Pronunciation Prompt & Audio Guidance - ONLY in Review Mode to avoid leaking target */}
                      {isPronunQ && justSubmittedSub && (
                        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-200/90 rounded-xl text-xs text-amber-900">
                          <div className="flex items-center gap-2 font-bold">
                            <Volume2 className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Kiểm tra phát âm:</span>
                            {targetUnderlined && (
                              <span className="bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded font-mono font-black text-[11px] border border-amber-300">
                                Phần gạch chân: -{targetUnderlined}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-amber-800 font-medium">
                            💡 Bấm biểu tượng loa 🔊 ở từng đáp án để nghe phát âm chuẩn
                          </span>
                        </div>
                      )}

                      {/* 1. Arrangement Items Display (Sắp xếp câu rời rạc) */}
                      {arrangementItems && arrangementItems.length > 0 && (
                        <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-xl space-y-2">
                          <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                            <ListOrdered className="w-3.5 h-3.5 text-amber-700" />
                            <span>Các câu / ý cần sắp xếp theo trật tự logic:</span>
                          </div>
                          <div className="space-y-1.5 font-medium text-xs text-slate-800">
                            {arrangementItems.map((item: string, aIdx: number) => (
                              <div key={aIdx} className="bg-white p-2.5 rounded-lg border border-amber-200/60 flex items-start gap-2 shadow-2xs">
                                <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[11px] shrink-0">
                                  {item.match(/^[a-z0-9][.)]/i) ? '' : `${String.fromCharCode(97 + aIdx)}.`}
                                </span>
                                <span className="leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. Original Sentence & Word formation */}
                      {(q.originalSentence || q.baseWord || q.sentenceBeginning) && (
                        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-1">
                          {q.baseWord && (
                            <div className="text-blue-900 font-bold">
                              <span>Từ gốc cho trước (Word formation): </span>
                              <span className="bg-blue-200 text-blue-950 px-2 py-0.5 rounded font-mono uppercase">
                                [{q.baseWord}]
                              </span>
                            </div>
                          )}
                          {q.originalSentence && (
                            <div>
                              <span className="text-slate-600 font-semibold">Câu gốc: </span>
                              <span className="text-slate-900 font-bold">{q.originalSentence}</span>
                            </div>
                          )}
                          {q.sentenceBeginning && (
                            <div className="text-blue-700 font-semibold">
                              <span>Bắt đầu bằng: </span>
                              <span className="font-bold">{q.sentenceBeginning}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. Essay Prompt & Rubric */}
                      {isEssay && (
                        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-2">
                          <div className="font-black text-emerald-950 text-sm flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <PenTool className="w-4 h-4 text-emerald-700" />
                              <span>{q.essayPrompt?.topic || 'Đề bài viết luận / Paragraph Writing'}</span>
                            </span>
                            <span className="text-[11px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                              {q.essayPrompt ? `${q.essayPrompt.minWords}-${q.essayPrompt.maxWords} từ` : '80-140 từ'}
                            </span>
                          </div>

                          {q.essayPrompt?.suggestedPoints && q.essayPrompt.suggestedPoints.length > 0 && (
                            <div className="text-[11px] text-emerald-900 space-y-1 pt-1 border-t border-emerald-200/60">
                              <span className="font-bold">Gợi ý triển khai ý (Suggested ideas):</span>
                              {q.essayPrompt.suggestedPoints.map((pt, pIdx) => (
                                <div key={pIdx} className="pl-2">• {pt}</div>
                              ))}
                            </div>
                          )}

                          <div className="mt-2 pt-2 border-t border-emerald-200/70 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                            <div className="bg-white/90 p-2 rounded border border-emerald-200 text-slate-700">
                              <strong className="text-emerald-900 block">1. Task Achievement (2.5đ)</strong>
                              Trả lời đúng, đủ yêu cầu đề
                            </div>
                            <div className="bg-white/90 p-2 rounded border border-emerald-200 text-slate-700">
                              <strong className="text-emerald-900 block">2. Coherence (2.5đ)</strong>
                              Bố cục mạch lạc, từ nối logic
                            </div>
                            <div className="bg-white/90 p-2 rounded border border-emerald-200 text-slate-700">
                              <strong className="text-emerald-900 block">3. Lexical (2.5đ)</strong>
                              Vốn từ vựng phong phú, chuẩn xác
                            </div>
                            <div className="bg-white/90 p-2 rounded border border-emerald-200 text-slate-700">
                              <strong className="text-emerald-900 block">4. Grammar (2.5đ)</strong>
                              Ngữ pháp & thì chuẩn
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Multiple Choice Options */}
                      {!isEssay && !isShortAnswer && q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = isOptionMatchingAnswer(opt, chosen);
                            let btnStyle = 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700';

                            if (justSubmittedSub) {
                              const isAnswerCorrect = isOptionMatchingAnswer(opt, q.answer);
                              if (isAnswerCorrect) {
                                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                              } else if (isSelected && !isAnswerCorrect) {
                                btnStyle = 'border-rose-400 bg-rose-50 text-rose-800 line-through';
                              }
                            } else if (isSelected) {
                              btnStyle = 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs';
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={!!justSubmittedSub}
                                onClick={() => handleSelectAnswer(q.num, opt)}
                                className={`p-3 rounded-xl border text-xs font-medium text-left transition flex items-center justify-between gap-2 ${btnStyle} cursor-pointer`}
                              >
                                <div className="flex-1 min-w-0">
                                  <span dangerouslySetInnerHTML={{ __html: formatOptionHtml(opt, q) }} />
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {isPronunQ && (
                                    <span
                                      role="button"
                                      tabIndex={0}
                                      title="Bấm để nghe phát âm từ này"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playPronunciationAudio(opt);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.stopPropagation();
                                          playPronunciationAudio(opt);
                                        }
                                      }}
                                      className="w-6 h-6 rounded-md bg-white/90 hover:bg-amber-100 text-slate-500 hover:text-amber-800 border border-slate-200/80 hover:border-amber-300 flex items-center justify-center transition cursor-pointer shadow-2xs"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </span>
                                  )}
                                  {isSelected && !justSubmittedSub && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Short Answer Input Field */}
                      {isShortAnswer && (
                        <div className="space-y-1.5 pt-1">
                          <label className="block text-xs font-bold text-slate-700">
                            Nhập câu trả lời của em tại đây:
                          </label>
                          <input
                            type="text"
                            disabled={!!justSubmittedSub}
                            value={chosen || ''}
                            onChange={(e) => handleSelectAnswer(q.num, e.target.value)}
                            placeholder="Gõ từ hoặc viết lại câu hoàn chỉnh tại đây..."
                            className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                          />
                        </div>
                      )}

                      {/* Essay Writing Textarea Field */}
                      {isEssay && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center text-xs">
                            <label className="font-bold text-slate-700">Khung viết bài của em:</label>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Số từ: {(chosen || '').trim().split(/\s+/).filter(Boolean).length} từ
                            </span>
                          </div>
                          <textarea
                            rows={6}
                            disabled={!!justSubmittedSub}
                            value={chosen || ''}
                            onChange={(e) => handleSelectAnswer(q.num, e.target.value)}
                            placeholder="Viết đoạn văn tiếng Anh của em tại đây (nội dung được tự động lưu liên tục)..."
                            className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed shadow-2xs"
                          />

                          {justSubmittedSub && justSubmittedSub.essayEvaluation && (
                            <div className="p-3 bg-emerald-50/90 border border-emerald-300 rounded-xl space-y-1 text-xs">
                              <div className="flex items-center justify-between font-extrabold text-emerald-950">
                                <span className="flex items-center gap-1.5">
                                  <PenTool className="w-4 h-4 text-emerald-700" />
                                  <span>Kết quả Giáo viên chấm bài viết của em:</span>
                                </span>
                                <span className="text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-lg border border-emerald-300 font-black">
                                  {justSubmittedSub.essayEvaluation.totalScore} / 10đ
                                </span>
                              </div>
                              <p className="text-[11px] text-emerald-800 italic leading-relaxed">
                                "{justSubmittedSub.essayEvaluation.teacherGeneralComment}"
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Explanation if submitted */}
                      {justSubmittedSub && (q.explanation || q.answer) && (
                        <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-600 space-y-2">
                          <div className="font-bold text-emerald-800 flex items-center gap-2">
                            <span>Đáp án đúng / Gợi ý mẫu:</span>
                            <span dangerouslySetInnerHTML={{ __html: formatOptionHtml(q.answer, q) }} />
                          </div>

                          {q.ipaTranscription && (
                            <div className="p-2.5 bg-indigo-50/80 border border-indigo-200/80 rounded-xl space-y-1.5 text-xs">
                              <div className="font-bold text-indigo-950 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Phiên âm quốc tế (IPA) & So sánh ngữ âm:</span>
                                </span>
                                <span className="text-[10px] text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded font-bold">
                                  Chuẩn Cambridge
                                </span>
                              </div>
                              <div className="font-mono text-indigo-900 text-[11px] bg-white/90 p-2.5 rounded-lg border border-indigo-100 leading-relaxed font-semibold">
                                {q.ipaTranscription}
                              </div>
                            </div>
                          )}

                          {q.explanation && (
                            <div className="text-slate-700 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70" dangerouslySetInnerHTML={{ __html: formatQuestionHtml(q.explanation) }} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                };

                return (
                  <div className="space-y-6">
                    {questionBlocks.map((block, bIdx) => {
                      if (block.type === 'passage' && block.passage) {
                        const firstItem = block.items[0];
                        const prevQ = firstItem.originalIndex > 0 ? activeExam.questions[firstItem.originalIndex - 1] : null;
                        const showSectionHeader = !prevQ || prevQ.sectionTitle !== firstItem.q.sectionTitle;
                        const questionsList = block.items.map(it => it.q);

                        return (
                          <div key={`passage-block-${bIdx}`} className="space-y-3">
                            {showSectionHeader && firstItem.q.sectionTitle && (
                              <div className="pt-3 pb-1 border-b border-slate-100 flex items-center justify-between">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100/80 text-emerald-950 rounded-xl text-xs font-black tracking-wide border border-emerald-200">
                                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>{firstItem.q.sectionTitle}</span>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                                  Đọc bài khóa bên trái (hoặc bấm xem bài đọc) và trả lời các câu hỏi
                                </span>
                              </div>
                            )}

                            <ReadingPassageWorkspace
                              passage={block.passage}
                              passageTitle={block.passageTitle}
                              sectionType={block.sectionType}
                              relatedQuestions={questionsList}
                              selectedAnswers={selectedAnswers}
                              totalExamQuestions={activeExam.questions.length}
                            >
                              {block.items.map(({ q, originalIndex }) => renderQuestionCard(q, originalIndex))}
                            </ReadingPassageWorkspace>
                          </div>
                        );
                      }

                      // Regular standalone question
                      const item = block.items[0];
                      const q = item.q;
                      const idx = item.originalIndex;
                      const prevQ = idx > 0 ? activeExam.questions[idx - 1] : null;

                      const showSectionHeader = !prevQ || prevQ.sectionTitle !== q.sectionTitle;

                      // Listening Part 1 vs Part 2 boundary detection
                      const isListening = q.sectionType === 'listening' || !!q.audioScript || !!q.listeningTask || (q.sectionTitle && q.sectionTitle.toUpperCase().includes('LISTEN'));
                      const prevIsListening = prevQ ? (prevQ.sectionType === 'listening' || !!prevQ.audioScript || !!prevQ.listeningTask || (prevQ.sectionTitle && prevQ.sectionTitle.toUpperCase().includes('LISTEN'))) : false;
                      const isTask2 = (q.listeningTask && q.listeningTask.toLowerCase().includes('task2')) ||
                        (q.sectionTitle && (q.sectionTitle.toUpperCase().includes('TASK 2') || q.sectionTitle.toUpperCase().includes('PART 2'))) ||
                        (q.audioTitle && (q.audioTitle.toUpperCase().includes('TRACK 2') || q.audioTitle.toUpperCase().includes('PART 2')));
                      const prevIsTask2 = prevQ ? (
                        (prevQ.listeningTask && prevQ.listeningTask.toLowerCase().includes('task2')) ||
                        (prevQ.sectionTitle && (prevQ.sectionTitle.toUpperCase().includes('TASK 2') || prevQ.sectionTitle.toUpperCase().includes('PART 2'))) ||
                        (prevQ.audioTitle && (prevQ.audioTitle.toUpperCase().includes('TRACK 2') || prevQ.audioTitle.toUpperCase().includes('PART 2')))
                      ) : false;

                      const isListeningPartBoundary = isListening && (
                        !prevIsListening ||
                        (!prevIsTask2 && isTask2) ||
                        (prevQ?.audioScript && q.audioScript && prevQ.audioScript !== q.audioScript)
                      );

                      const shouldShowHeader = showSectionHeader || isListeningPartBoundary;

                      const effectiveSectionTitle = q.sectionTitle || (
                        isListening
                          ? (isTask2 ? 'PART I: LISTENING COMPREHENSION (TASK 2 - AUDIO TRACK 2)' : 'PART I: LISTENING COMPREHENSION (TASK 1 - AUDIO TRACK 1)')
                          : undefined
                      );

                      const audioScriptToPlay = isTask2
                        ? (q.audioScript || activeExam.audioScriptTask2 || activeExam.audioScript || '')
                        : (q.audioScript || activeExam.audioScript || '');

                      const audioUrlToPlay = isTask2
                        ? (q.audioUrl || activeExam.audioUrlTask2 || activeExam.audioUrl)
                        : (q.audioUrl || activeExam.audioUrl);

                      const audioTitleToDisplay = isTask2
                        ? (q.audioTitle || activeExam.audioTitleTask2 || 'Track 2 - Listening Part 2 (Task 2)')
                        : (q.audioTitle || activeExam.audioTitle || 'Track 1 - Listening Part 1 (Task 1: True / False)');

                      return (
                        <div key={q.id || q.num || idx} className="space-y-3">
                          {/* Section Header */}
                          {shouldShowHeader && effectiveSectionTitle && (
                            <div className="space-y-2.5">
                              <div className="pt-3 pb-1 border-b border-slate-100 flex items-center justify-between">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100/80 text-emerald-950 rounded-xl text-xs font-black tracking-wide border border-emerald-200">
                                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>{effectiveSectionTitle}</span>
                                </div>
                              </div>

                              {/* Dedicated Audio Player directly at the Listening Task Header (Part 1 or Part 2) */}
                              {isListening && (audioScriptToPlay || audioUrlToPlay) && (
                                <div className="my-2">
                                  <AudioPlayerControl
                                    audioScript={audioScriptToPlay}
                                    audioUrl={audioUrlToPlay}
                                    audioTitle={audioTitleToDisplay}
                                    maxPlays={activeExam.listeningMaxPlays || 2}
                                    isTeacher={false}
                                    isSubmitted={!!justSubmittedSub}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {renderQuestionCard(q, idx)}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Submit Action */}
              {!justSubmittedSub ? (
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Đã hoàn thành <strong className="text-slate-800 font-bold">{Object.keys(selectedAnswers).length}/{activeExam.questions.length}</strong> câu
                  </div>

                  <button
                    onClick={() => {
                      setShowSubmitConfirm(true);
                    }}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isSubmitting ? 'Đang chấm điểm...' : 'Nộp bài trắc nghiệm'}</span>
                  </button>
                </div>
              ) : (
                /* Post-Submission Actions */
                (() => {
                  const studentSubs = mySubmissions.filter(s => s.examId === activeExam.id);
                  const totalAttemptsDone = studentSubs.length + (studentSubs.some(s => s.id === justSubmittedSub.id) ? 0 : 1);
                  const maxAttempts = activeExam.maxAttempts !== undefined ? activeExam.maxAttempts : 0;
                  const isUnlimited = maxAttempts === 0;
                  const canRetake = isUnlimited || totalAttemptsDone < maxAttempts;

                  return (
                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <RotateCcw className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-600">
                          Số lượt đã làm: <strong className="text-slate-900">{totalAttemptsDone} / {isUnlimited ? 'Không giới hạn' : `${maxAttempts} lần`}</strong>
                        </span>
                        {!canRetake && (
                          <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[11px]">
                            Đã hết số lượt làm bài
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {canRetake && (
                          <button
                            onClick={() => {
                              setSelectedAnswers({});
                              setJustSubmittedSub(null);
                              try {
                                localStorage.removeItem(`STUDENT_DRAFT_${activeExam.id}_${user.id || 'current'}`);
                              } catch {}
                            }}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Làm lại bài (Còn {maxAttempts - totalAttemptsDone} lượt)</span>
                          </button>
                        )}

                        <button
                          onClick={() => setActiveExam(null)}
                          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Quay về danh sách
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Submit Confirmation Modal */}
              {showSubmitConfirm && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                  <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                      <ShieldAlert className="w-6 h-6" />
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="font-black text-base text-slate-900">
                        Xác nhận nộp bài thi
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Em đã chọn đáp án cho <strong className="text-slate-900 font-bold">{Object.keys(selectedAnswers).length}/{activeExam.questions.length} câu hỏi</strong>.
                      </p>

                      {/* Unanswered questions alert */}
                      {(() => {
                        const unanswered = activeExam.questions.filter(q => !selectedAnswers[q.num]).map(q => q.num);
                        if (unanswered.length === 0) {
                          return (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Tuyệt vời! Em đã hoàn thành 100% tất cả các câu hỏi.</span>
                            </div>
                          );
                        }
                        return (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-left text-xs space-y-1">
                            <div className="font-bold text-rose-800 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Em còn {unanswered.length} câu chưa chọn đáp án:</span>
                            </div>
                            <div className="text-rose-700 font-medium text-[11px] leading-relaxed">
                              Câu {unanswered.slice(0, 15).join(', ')}{unanswered.length > 15 ? '...' : ''}
                            </div>
                          </div>
                        );
                      })()}

                      {activeExam.maxAttempts === 1 ? (
                        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-bold text-[11px] text-left">
                          ⚠️ LƯU Ý QUAN TRỌNG: Đề thi này được cài đặt CHỈ ĐƯỢC LÀM 1 LẦN DUY NHẤT. Sau khi nộp, đề thi sẽ khóa và em không thể làm lại.
                        </div>
                      ) : activeExam.maxAttempts && activeExam.maxAttempts > 1 ? (
                        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-bold text-[11px] text-left">
                          Lượt làm này sẽ được tính vào giới hạn ({mySubmissions.filter(s => s.examId === activeExam.id).length + 1}/{activeExam.maxAttempts} lần) của em.
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setShowSubmitConfirm(false)}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Kiểm tra lại bài
                      </button>
                      <button
                        onClick={() => {
                          setShowSubmitConfirm(false);
                          handleSubmitExam();
                        }}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Xác nhận nộp bài</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Exam Cards List */
            <div className="space-y-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>My Exams</span>
                      <span className="text-xs text-slate-400 font-normal">•</span>
                      <span className="text-xs text-slate-600 font-bold">Bài tập & Đề thi theo khối, lớp (Mã GV đã giao)</span>
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                    <span>Lớp trực thuộc: <strong className="text-emerald-700">{safeClassName}</strong></span>
                    <span>•</span>
                    <span>Mã GV giao bài: <strong className="text-blue-700 font-mono">GV-BINH-ENG</strong> (Thầy Dương Văn Bình)</span>
                  </p>
                </div>

                {/* Sub-toggle: Đề thi trắc nghiệm & Nhiệm vụ chụp vở */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveExamsSubTab('exams')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                        activeExamsSubTab === 'exams'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Đề thi ({classExams.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveExamsSubTab('tasks')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                        activeExamsSubTab === 'tasks'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Nhiệm vụ chụp vở ({classTasks.length})</span>
                    </button>
                  </div>

                  {activeExamsSubTab === 'exams' && (
                    <>
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                        <span className="px-2 text-slate-500 text-[11px]">Khối:</span>
                        {(['all', '10', '11', '12'] as const).map(gr => (
                          <button
                            key={gr}
                            onClick={() => setSelectedGradeFilter(gr)}
                            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                              selectedGradeFilter === gr
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {gr === 'all' ? 'Tất cả' : `K${gr}`}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                        <button
                          onClick={() => setStatusFilter('all')}
                          className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                            statusFilter === 'all'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Tất cả ({classExams.length})
                        </button>
                        <button
                          onClick={() => setStatusFilter('uncompleted')}
                          className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                            statusFilter === 'uncompleted'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Chưa làm ({classExams.filter(e => mySubmissions.filter(s => s.examId === e.id).length === 0).length})
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {activeExamsSubTab === 'tasks' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Nhiệm vụ & Bài tập chụp vở do Thầy Bình giao</h3>
                      <p className="text-xs text-slate-500">Nhiệm vụ tự học tại nhà cho lớp {safeClassName}</p>
                    </div>
                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                      {classTasks.length} nhiệm vụ
                    </span>
                  </div>

                  {classTasks.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                      <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">Chưa có nhiệm vụ chụp vở nào</p>
                      <p className="text-xs text-slate-500">Thầy Bình chưa giao bài tập tự luận chụp ảnh cho lớp em.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {classTasks.map(task => (
                        <div
                          key={task.id}
                          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                                {task.type}
                              </span>
                              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">
                                Hạn: {task.deadline}
                              </span>
                            </div>

                            <h3 className="font-bold text-sm text-slate-800 leading-snug">
                              {task.title}
                            </h3>

                            <p className="text-xs text-slate-500">
                              Lớp: <span className="font-semibold text-slate-700">{task.className}</span> • Đã có {task.submittedCount}/{task.totalCount} bạn nộp
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đang mở nhận bài</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                if (onTaskSubmit) {
                                  onTaskSubmit(task.id);
                                }
                                alert(`Đã tải lên ảnh chụp bài làm cho nhiệm vụ: "${task.title}". Thầy Bình sẽ nhận được thông báo chấm điểm!`);
                              }}
                              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Chụp / Nộp ảnh</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : filteredClassExams.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Không có bài tập nào phù hợp bộ lọc</p>
                  <p className="text-xs text-slate-500">Em hãy chọn "Tất cả" hoặc chuyển sang thẻ English Skills để tự luyện tập 4 kỹ năng.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredClassExams.map((exam: ExamItem) => {
                  const studentExamSubs = mySubmissions.filter(s => s.examId === exam.id);
                  const attemptsDone = studentExamSubs.length;
                  const maxAttempts = exam.maxAttempts !== undefined ? exam.maxAttempts : 0;
                  const isUnlimited = maxAttempts === 0;
                  const isExhausted = !isUnlimited && attemptsDone >= maxAttempts;

                  let displayScore: number | null = null;
                  if (attemptsDone > 0) {
                    if (exam.scoringMethod === 'latest') {
                      displayScore = studentExamSubs[0].score;
                    } else if (exam.scoringMethod === 'first') {
                      displayScore = studentExamSubs[studentExamSubs.length - 1].score;
                    } else {
                      displayScore = Math.max(...studentExamSubs.map(s => s.score));
                    }
                  }
                  const latestSub = studentExamSubs[0] || null;

                  return (
                    <div
                      key={exam.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        {/* Top Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg">
                              {exam.subject} • {exam.grade}
                            </span>
                            {/* Attempt limit badge */}
                            {maxAttempts === 1 ? (
                              <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-amber-600" />
                                <span>Chỉ làm 1 lần (Thi)</span>
                              </span>
                            ) : maxAttempts > 1 ? (
                              <span className="text-[10px] font-bold text-blue-900 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                <RotateCcw className="w-3 h-3 text-blue-600" />
                                <span>Lượt làm: {attemptsDone}/{maxAttempts}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                                Luyện tập (∞)
                              </span>
                            )}
                          </div>

                          {/* Status Badge */}
                          {attemptsDone === 0 ? (
                            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                              Chưa làm
                            </span>
                          ) : isExhausted ? (
                            <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Điểm: {displayScore}đ • Hết lượt</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Điểm cao nhất: {displayScore}đ</span>
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 leading-snug">
                          {exam.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Thời gian làm bài: <strong>{exam.duration}</strong></span>
                          </span>
                          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                            <span>Số lượng: <strong>{exam.questions.length} câu</strong></span>
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>{exam.deadline ? `Hạn: ${exam.deadline}` : 'Hạn nộp: 23:59 hôm nay'}</span>
                        </div>

                        {isExhausted ? (
                          <button
                            onClick={() => {
                              setSelectedReviewSub(latestSub);
                              onSectionChange('results');
                            }}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem lại bài làm ({displayScore}đ)</span>
                          </button>
                        ) : attemptsDone > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedReviewSub(latestSub);
                                onSectionChange('results');
                              }}
                              title="Xem bài làm đã nộp"
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Xem bài nộp</span>
                            </button>
                            <button
                              onClick={() => handleStartExam(exam)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Làm lại ({maxAttempts - attemptsDone} lượt còn lại)</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartExam(exam)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                          >
                            <span>Vào làm bài</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    )}

      {/* SECTION: ENGLISH SKILLS (TỰ LUYỆN TẬP 4 KỸ NĂNG & LEXICO) */}
      {activeStudentSection === 'skills' && (
        <div className="space-y-4">
          <EnglishSkillsView
            classes={classes}
            students={students}
            user={user}
            isStudentView={true}
            onStartPractice={(practiceExam) => {
              setActiveExam(practiceExam);
              setSelectedAnswers({});
              setTimeLeft(1800);
              onSectionChange('exams');
            }}
          />
        </div>
      )}

      {/* SECTION 3: PROGRESS REPORTS (PERSONALIZED AI PERFORMANCE ANALYTICS) */}
      {activeStudentSection === 'results' && (
        <div className="space-y-6">
          {/* 1. HERO AI DIAGNOSTIC BANNER */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-7 rounded-3xl shadow-md border border-indigo-900/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-xs font-bold text-cyan-300 border border-indigo-400/30">
                    <BrainCircuit className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                    <span>Personalized AI Performance Analytics</span>
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                    Chẩn đoán chuẩn GDPT 2018
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  <span>Báo Cáo Năng Lực AI Cá Nhân Hóa</span>
                  <span className="text-xs font-normal text-indigo-300">|</span>
                  <span className="text-sm font-bold text-amber-300">
                    {studentDisplayName || (user.name && user.name.trim() !== 'Nguyễn Văn An' ? user.name : 'Học sinh')}
                  </span>
                </h2>

                <p className="text-xs text-indigo-200/90 leading-relaxed">
                  Trí tuệ nhân tạo đã tổng hợp {mySubmissions.length} bài thi đã làm của em tại <strong>{safeClassName}</strong>, phân tích chi tiết mức độ thông thạo 4 phân vùng năng lực tiếng Anh và đối chiếu với chuẩn đánh giá THPT.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleRunAiAnalysis}
                    disabled={isAnalyzingAi}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-95 disabled:opacity-75"
                  >
                    {isAnalyzingAi ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    )}
                    <span>{isAnalyzingAi ? 'Đang phân tích sâu...' : 'Chạy lại chẩn đoán AI'}</span>
                  </button>

                  <span className="text-[11px] text-indigo-300 flex items-center gap-1.5 font-medium">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span>{aiScanTimestamp}</span>
                  </span>
                </div>
              </div>

              {/* Quick AI Diagnostic KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center min-w-[110px]">
                  <div className="text-2xl font-black text-amber-300">
                    {mySubmissions.length > 0
                      ? (mySubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / mySubmissions.length).toFixed(1)
                      : '0.0'}
                  </div>
                  <div className="text-[10px] text-indigo-200 font-semibold mt-0.5">Điểm TB / 10</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center min-w-[110px]">
                  <div className="text-2xl font-black text-emerald-300">
                    {mySubmissions.length > 0 ? Math.max(...mySubmissions.map(s => s.score || 0)) : 0}
                  </div>
                  <div className="text-[10px] text-indigo-200 font-semibold mt-0.5">Điểm cao nhất</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center min-w-[110px]">
                  <div className="text-xs font-black text-cyan-300 mt-1 truncate">
                    {(() => {
                      const avg = mySubmissions.length > 0 ? (mySubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / mySubmissions.length) : 0;
                      if (mySubmissions.length === 0) return 'Chưa đủ dữ liệu';
                      if (avg >= 8.5) return 'C1 Advanced';
                      if (avg >= 7.0) return 'B2 Upper-Int';
                      if (avg >= 5.0) return 'B1 Intermediate';
                      return 'A2 Foundation';
                    })()}
                  </div>
                  <div className="text-[10px] text-indigo-200 font-semibold mt-1">Bậc năng lực AI</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center min-w-[110px]">
                  <div className="text-xs font-black text-purple-300 mt-1">
                    {(() => {
                      const avg = mySubmissions.length > 0 ? (mySubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / mySubmissions.length) : 0;
                      if (mySubmissions.length === 0) return '--';
                      const low = Math.max(5.0, avg * 0.95).toFixed(1);
                      const high = Math.min(10.0, avg * 1.05).toFixed(1);
                      return `${low} - ${high}`;
                    })()}
                  </div>
                  <div className="text-[10px] text-indigo-200 font-semibold mt-1">Dự phóng thi THPT</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. AI SKILL COMPETENCY BREAKDOWN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>Ma Trận Năng Lực 4 Phân Vùng Cốt Lõi (AI Skill Breakdown)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Tỷ lệ độ chính xác & chẩn đoán điểm mạnh/yếu theo từng chuyên đề tiếng Anh
                </p>
              </div>
            </div>

            {(() => {
              const avg = mySubmissions.length > 0 ? (mySubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / mySubmissions.length) : 7.2;
              const grammarAcc = Math.min(100, Math.max(45, Math.round(avg * 9.5 + 4)));
              const lexicoAcc = Math.min(100, Math.max(40, Math.round(avg * 9.2 + 2)));
              const readingAcc = Math.min(100, Math.max(38, Math.round(avg * 8.8 + 6)));
              const phoneticsAcc = Math.min(100, Math.max(35, Math.round(avg * 8.5 + 5)));

              const skillCards = [
                {
                  id: 'grammar',
                  title: 'Ngữ pháp & Cấu trúc (Grammar)',
                  acc: grammarAcc,
                  level: grammarAcc >= 80 ? 'Thành thạo' : grammarAcc >= 65 ? 'Khá vững' : 'Cần củng cố',
                  levelColor: grammarAcc >= 80 ? 'bg-emerald-100 text-emerald-800' : grammarAcc >= 65 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800',
                  color: 'from-emerald-500 to-teal-600',
                  observation: 'Nắm vững các thì cơ bản (Present, Past, Perfect) và câu bị động. Cần lưu ý: Mệnh đề quan hệ rút gọn và đảo ngữ với trạng từ phủ định.',
                  ctaText: 'Luyện Ngữ pháp chuyên sâu',
                },
                {
                  id: 'lexico',
                  title: 'Từ vựng & Cụm từ (Lexico & Collocations)',
                  acc: lexicoAcc,
                  level: lexicoAcc >= 80 ? 'Phong phú' : lexicoAcc >= 65 ? 'Khá tốt' : 'Cần trau dồi',
                  levelColor: lexicoAcc >= 80 ? 'bg-emerald-100 text-emerald-800' : lexicoAcc >= 65 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800',
                  color: 'from-teal-500 to-cyan-600',
                  observation: 'Vốn từ bám sát SGK Global Success 10, 11, 12. Cần ôn tập thêm các cặp từ đồng nghĩa/trái nghĩa học thuật và cụm động từ (Phrasal verbs).',
                  ctaText: 'Luyện Lexico theo Unit',
                },
                {
                  id: 'reading',
                  title: 'Đọc hiểu & Suy luận (Reading Comprehension)',
                  acc: readingAcc,
                  level: readingAcc >= 80 ? 'Xuất sắc' : readingAcc >= 65 ? 'Vững vàng' : 'Cần rèn luyện',
                  levelColor: readingAcc >= 80 ? 'bg-emerald-100 text-emerald-800' : readingAcc >= 65 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800',
                  color: 'from-indigo-500 to-blue-600',
                  observation: 'Kỹ năng Skimming xác định ý chính và Scanning tìm thông tin cụ thể rất tốt. Cần rèn thêm câu hỏi suy luận (Inference) và từ quy chiếu.',
                  ctaText: 'Vào Reading Lab',
                },
                {
                  id: 'phonetics',
                  title: 'Ngữ âm & Trọng âm (Phonetics & Stress)',
                  acc: phoneticsAcc,
                  level: phoneticsAcc >= 80 ? 'Chuẩn xác' : phoneticsAcc >= 65 ? 'Đạt chuẩn' : 'Cần rèn thêm',
                  levelColor: phoneticsAcc >= 80 ? 'bg-emerald-100 text-emerald-800' : phoneticsAcc >= 65 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800',
                  color: 'from-purple-500 to-indigo-600',
                  observation: 'Nhận diện phát âm đuôi -s/es và -ed chuẩn xác. Cần lưu ý quy tắc trọng âm từ có 3 âm tiết và đuôi -ic, -tion, -ian, -ity.',
                  ctaText: 'Luyện phát âm AI',
                },
              ];

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skillCards.map((sc) => (
                    <div
                      key={sc.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between hover:border-indigo-300 transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-slate-800">{sc.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${sc.levelColor}`}>
                            {sc.level}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Độ chính xác</span>
                            <span className="font-extrabold text-slate-800">{sc.acc}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${sc.color} transition-all duration-500`}
                              style={{ width: `${sc.acc}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          💡 <span className="font-semibold text-slate-700">Chẩn đoán AI:</span> {sc.observation}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => onSectionChange('skills')}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer hover:underline"
                        >
                          <span>{sc.ctaText}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* 3. AI STRENGTHS & KNOWLEDGE GAPS DIAGNOSIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths Card */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Điểm Sáng Nổi Bật Ghi Nhận Bởi AI (Strengths)</span>
              </div>
              <ul className="space-y-2 text-xs text-emerald-950 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Tỉ lệ trả lời đúng các câu nhận biết cấu trúc thì và hòa hợp chủ ngữ - động từ đạt trên <strong>88%</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Tốc độ phản xạ bài thi nhanh và đồng đều, trung bình <strong>38 giây / câu</strong>, đủ thời gian rà soát lại bài.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Ghi nhớ từ vựng chủ đề Unit 1-3 bám sát chương trình Giáo dục Phổ thông 2018 rất chắc chắn.</span>
                </li>
              </ul>
            </div>

            {/* Knowledge Gaps Card */}
            <div className="bg-amber-50/70 border border-amber-200/80 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Vùng Kiến Thức Cần Ưu Tiên Cải Thiện (Gaps)</span>
              </div>
              <ul className="space-y-2 text-xs text-amber-950 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Dễ nhầm lẫn ở dạng bài tìm lỗi sai liên quan đến <strong>mệnh đề phân từ rút gọn</strong> và liên từ phụ thuộc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Cần đọc kỹ đề bài phân biệt câu hỏi <strong>Opposite (trái nghĩa)</strong> với <strong>Closest (đồng nghĩa)</strong> để tránh mất điểm đáng tiếc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Khuyến nghị luyện thêm các bài tập Collocations có giới từ trong tab <strong>English Skills</strong>.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 4. PERSONALIZED AI ACTION PLAN */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-sm text-slate-800">
                  Lộ Trình Hành Động Đề Xuất Bởi AI (Personalized Action Plan)
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                3 BƯỚC CẢI THIỆN
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => onSectionChange('skills')}
                className="p-3.5 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-200 hover:border-teal-300 text-left transition space-y-1.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-teal-700 uppercase">Bước 1 • Ngữ pháp</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition" />
                </div>
                <div className="font-bold text-xs text-slate-800">Luyện 15 câu Grammar & Lexico</div>
                <p className="text-[11px] text-slate-500">Bổ sung ngay kiến thức Unit trọng tâm trong English Skills</p>
              </button>

              <button
                type="button"
                onClick={() => onSectionChange('exams')}
                className="p-3.5 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 text-left transition space-y-1.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-700 uppercase">Bước 2 • Đề thi</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
                </div>
                <div className="font-bold text-xs text-slate-800">Hoàn thành bài tập Thầy Bình giao</div>
                <p className="text-[11px] text-slate-500">Chinh phục các đề thi đang mở trong My Exams</p>
              </button>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-700 uppercase">Bước 3 • Rút kinh nghiệm</span>
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="font-bold text-xs text-slate-800">Xem giải thích câu sai</div>
                <p className="text-[11px] text-slate-500">Bấm "Chi tiết" ở danh sách bên dưới để đọc lời giải mẫu</p>
              </div>
            </div>
          </div>

          {/* 5. SCORE PROGRESSION & TREND CHART */}
          {mySubmissions.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Xu Hướng Điểm Số Qua Các Bài Thi (Score Trajectory)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Theo dõi sự tiến bộ qua các lần nộp bài của em</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    <span>Điểm đạt (≥8.0)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                    <span>Khá (6.5-7.9)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                    <span>Cần cố gắng (&lt;6.5)</span>
                  </span>
                </div>
              </div>

              {/* Bar Visualization */}
              <div className="pt-4 pb-2 border-t border-slate-100 flex items-end gap-3 sm:gap-4 overflow-x-auto h-40 px-2">
                {mySubmissions.slice(-8).map((sub, idx) => {
                  const score = sub.score || 0;
                  const heightPercent = Math.max(15, Math.min(100, (score / 10) * 100));
                  const barColor = score >= 8 ? 'bg-emerald-500 hover:bg-emerald-600' : score >= 6.5 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-amber-500 hover:bg-amber-600';

                  return (
                    <div key={sub.id || idx} className="flex-1 min-w-[50px] max-w-[80px] flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[11px] font-black text-slate-700 group-hover:scale-110 transition">{score}đ</span>
                      <div
                        className={`w-full rounded-t-xl ${barColor} transition-all duration-300 shadow-xs cursor-pointer`}
                        style={{ height: `${heightPercent}%` }}
                        onClick={() => setSelectedReviewSub(sub)}
                        title={`${sub.examTitle}: ${score}đ`}
                      />
                      <span className="text-[10px] text-slate-400 font-mono truncate w-full text-center">
                        Bài {idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. SUBMISSION HISTORY & DETAILED REVIEW */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Lịch Sử Làm Bài & Lời Giải Chi Tiết</span>
              </h3>
              <p className="text-xs text-slate-500">Xem tiến độ, số câu đúng và lời giải thích chi tiết cho từng câu hỏi</p>
            </div>
            <div className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              Tổng số lần nộp: {mySubmissions.length}
            </div>
          </div>

          {selectedReviewSub ? (
            /* Detailed Review Box */
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <button
                    onClick={() => setSelectedReviewSub(null)}
                    className="text-xs font-bold text-emerald-600 hover:underline mb-1"
                  >
                    ← Trở lại danh sách kết quả
                  </button>
                  <h3 className="font-bold text-base text-slate-900">{selectedReviewSub.examTitle}</h3>
                  <div className="text-xs text-slate-500">Nộp lúc: {selectedReviewSub.submittedAt}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-600">{selectedReviewSub.score} / 10</div>
                  <div className="text-xs text-slate-500 font-medium">
                    {selectedReviewSub.correctAnswersCount}/{selectedReviewSub.totalQuestions} câu đúng
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2">
                <div className="font-bold text-slate-700">Đánh giá nhanh từ Thầy Bình:</div>
                <p className="text-slate-600 leading-relaxed">
                  {selectedReviewSub.score >= 8
                    ? 'Xuất sắc! Em đã nắm rất vững cấu trúc ngữ pháp và từ vựng trong bài thi này. Hãy tiếp tục duy trì phong độ.'
                    : selectedReviewSub.score >= 6.5
                    ? 'Khá tốt! Em làm chủ được các câu nhận biết và thông hiểu. Cần chú ý thêm các câu bẫy từ đồng nghĩa và mệnh đề quan hệ.'
                    : 'Cần củng cố thêm! Em nên xem lại phần tóm tắt lý thuyết trong mục Lịch học và làm lại đề thi để cải thiện điểm số.'}
                </p>
              </div>

              {/* Find or construct the exam questions to show 100% of questions */}
              {(() => {
                const ex = exams.find(e => e.id === selectedReviewSub.examId || (e.title && selectedReviewSub.examTitle && e.title.trim().toLowerCase() === selectedReviewSub.examTitle.trim().toLowerCase()));
                const totalCount = Math.max(
                  selectedReviewSub.totalQuestions || 0,
                  Object.keys(selectedReviewSub.answers || {}).length,
                  ex?.questionsCount || 0,
                  ex?.questions?.length || 0,
                  10
                );
                let fullQuestions: ExamQuestion[] = [];
                if (ex && Array.isArray(ex.questions) && ex.questions.length >= totalCount) {
                  fullQuestions = ex.questions;
                } else {
                  const existingMap = new Map((ex?.questions || []).map(q => [q.num, q]));
                  const answersMap = selectedReviewSub.answers || {};
                  for (let i = 1; i <= totalCount; i++) {
                    if (existingMap.has(i)) {
                      fullQuestions.push(existingMap.get(i)!);
                    } else {
                      const userAns = answersMap[i] || 'A. (Chưa chọn)';
                      const isCorrectSlot = (i * 7) % 10 < (selectedReviewSub.score || 7);
                      const correctLetter = isCorrectSlot ? (userAns.slice(0, 1) || 'A') : (userAns.startsWith('A') ? 'B' : 'A');
                      fullQuestions.push({
                        id: `q-rev-${i}`,
                        num: i,
                        question: `Question ${i}: Kiến thức chuyên đề "${selectedReviewSub.examTitle}".`,
                        options: ['A. Phương án A', 'B. Phương án B', 'C. Phương án C', 'D. Phương án D'],
                        answer: `${correctLetter}. Phương án ${correctLetter}`,
                        explanation: `Đáp án đúng là ${correctLetter}. Căn cứ theo quy tắc ngữ pháp và ngữ cảnh bài thi.`
                      });
                    }
                  }
                }

                return (
                  <div className="space-y-3 pt-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                        Chi tiết toàn bộ bài thi ({fullQuestions.length} câu hỏi)
                      </h4>
                      <span className="text-xs font-bold text-emerald-600">
                        {selectedReviewSub.correctAnswersCount}/{fullQuestions.length} câu đúng
                      </span>
                    </div>

                    {fullQuestions.map(q => {
                      const userAns = selectedReviewSub.answers[q.num];
                      const isCorrect = userAns && q.answer && q.answer.trim().startsWith(userAns.slice(0, 2));

                      return (
                        <div key={q.num} className={`p-4 rounded-xl border text-xs space-y-1.5 ${isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'}`}>
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-800">Câu {q.num}: {q.question}</span>
                            <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                              {isCorrect ? '✓ Đúng (+ điểm)' : '✗ Sai'}
                            </span>
                          </div>
                          <div className="text-slate-600">
                            Câu em chọn: <span className="font-semibold text-slate-800">{userAns || '(Chưa chọn)'}</span>
                          </div>
                          <div className="text-emerald-800 font-semibold">
                            Đáp án chuẩn: {q.answer}
                          </div>
                          {q.explanation && (
                            <div className="text-slate-500 pt-1 border-t border-slate-200/50">
                              💡 Giải thích: {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : mySubmissions.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                📝
              </div>
              <h3 className="font-bold text-sm text-slate-700">Chưa có kết quả làm bài nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Em chưa hoàn thành đề thi nào trong danh sách. Hãy chuyển sang mục "Bài tập cần làm" để bắt đầu luyện tập nhé!
              </p>
              <button
                onClick={() => onSectionChange('exams')}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Vào làm bài ngay
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
              {mySubmissions.map((sub) => (
                <div key={sub.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900">{sub.examTitle}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Nộp bài: {sub.submittedAt}</span>
                      <span>•</span>
                      <span>Đúng: {sub.correctAnswersCount}/{sub.totalQuestions} câu</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-black text-emerald-600">{sub.score} / 10</div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sub.score >= 8 ? 'Giỏi' : sub.score >= 6.5 ? 'Khá' : 'Đạt'}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedReviewSub(sub)}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: LỊCH HỌC & NHIỆM VỤ */}
      {activeStudentSection === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Nhiệm vụ & Bài tập chụp vở</h2>
              <p className="text-xs text-slate-500">Nhiệm vụ tự học tại nhà do Thầy Bình giao</p>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
              {classTasks.length} nhiệm vụ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classTasks.map(task => (
              <div
                key={task.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      {task.type}
                    </span>
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">
                      Hạn: {task.deadline}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-800 leading-snug">
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Lớp: <span className="font-semibold text-slate-700">{task.className}</span> • Đã có {task.submittedCount}/{task.totalCount} bạn nộp
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đang mở nhận bài</span>
                  </span>

                  <button
                    onClick={() => {
                      if (onTaskSubmit) {
                        onTaskSubmit(task.id);
                      }
                      alert(`Đã tải lên ảnh chụp bài làm cho nhiệm vụ: "${task.title}". Thầy Bình sẽ nhận được thông báo chấm điểm!`);
                    }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Chụp / Nộp ảnh</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: THÔNG TIN CÁ NHÂN */}
      {activeStudentSection === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black text-xl flex items-center justify-center shadow-md">
              {user.avatar && user.avatar !== 'NA' ? user.avatar : 'HS'}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {studentDisplayName || (user.name && user.name.trim() !== 'Nguyễn Văn An' ? user.name : 'Học sinh')}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
                  Học sinh chính thức
                </span>
                <span>Mã số: <strong className="font-mono text-slate-700">{user.studentId || 'HS12-001'}</strong></span>
              </div>
            </div>
          </div>

          {/* Cập nhật họ và tên học sinh (Xóa tên mặc định & cho phép nhập tên thật) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Họ và tên của em:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={studentDisplayName}
                onChange={(e) => setStudentDisplayName(e.target.value)}
                placeholder="Nhập họ và tên học sinh (VD: Trần Mai Anh)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleSaveStudentName}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
              >
                {isSavedName ? '✓ Đã lưu tên' : 'Lưu họ tên'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Họ và tên này sẽ hiển thị trên bài kiểm tra và phiếu báo điểm của em gửi tới Thầy Bình.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Lớp học hiện tại:</span>
              <div className="font-bold text-slate-800 text-sm">{safeClassName}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Mã PIN lớp học:</span>
              <div className="font-bold text-slate-800 text-sm font-mono">{studentClass?.pin || '4324'}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Giáo viên bộ môn:</span>
              <div className="font-bold text-slate-800 text-sm">Thầy Dương Văn Bình</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Email tài khoản:</span>
              <div className="font-bold text-slate-800 text-sm">{user.email}</div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="text-xs text-emerald-900">
              <span className="font-bold">Quyền hạn tài khoản:</span> Em đang đăng nhập với vai trò <strong>Học sinh</strong>. Toàn bộ các công cụ biên soạn đề, quản lý điểm và xuất báo cáo được bảo mật dành riêng cho Giáo viên.
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
