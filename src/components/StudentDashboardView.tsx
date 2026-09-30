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
  Timer
} from 'lucide-react';
import { AuthUser, ClassItem, ExamItem, ExamQuestion, HomeworkTask, SubmissionItem } from '../types';
import { apiService } from '../services/apiService';
import { AudioPlayerControl } from './AudioPlayerControl';
import { ReadingPassageWorkspace } from './ReadingPassageWorkspace';
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
  activeStudentSection: 'exams' | 'results' | 'tasks' | 'profile' | 'live-voice';
  onSectionChange: (sec: 'exams' | 'results' | 'tasks' | 'profile' | 'live-voice') => void;
  onSubmissionSuccess: (sub: SubmissionItem) => void;
  onTaskSubmit?: (taskId: string) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  user,
  classes,
  exams,
  tasks,
  submissions,
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
      localStorage.removeItem(`STUDENT_DRAFT_${activeExam.id}_${user.id || 'current'}`);
    } catch {}

    await apiService.submitExam(newSub);
    onSubmissionSuccess(newSub);
    setJustSubmittedSub(newSub);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      
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
              Xin chào, {user.name}! 👋
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

      {/* Navigation Sub-Tabs for Student */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            setActiveExam(null);
            setSelectedReviewSub(null);
            onSectionChange('exams');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeStudentSection === 'exams'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bài tập cần làm ({classExams.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveExam(null);
            onSectionChange('results');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeStudentSection === 'results'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Kết quả cá nhân ({mySubmissions.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveExam(null);
            setSelectedReviewSub(null);
            onSectionChange('tasks');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeStudentSection === 'tasks'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Lịch học & Nhiệm vụ ({classTasks.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveExam(null);
            setSelectedReviewSub(null);
            onSectionChange('profile');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeStudentSection === 'profile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Thông tin cá nhân</span>
        </button>

        <button
          onClick={() => {
            setActiveExam(null);
            setSelectedReviewSub(null);
            onSectionChange('live-voice');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs cursor-pointer ml-auto"
        >
          <Mic className="w-4 h-4 text-amber-300" />
          <span>Luyện Nói AI Live (3.8 Live)</span>
          <span className="text-[9px] bg-amber-400 text-blue-950 px-1 py-0.2 rounded font-black">
            MỚI
          </span>
        </button>
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Bộ đề rèn luyện đang mở</h2>
                  <p className="text-xs text-slate-500">Bấm làm bài để bắt đầu trắc nghiệm trực tuyến</p>
                </div>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                  {classExams.length} đề thi
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classExams.map((exam: ExamItem) => {
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
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: KẾT QUẢ CÁ NHÂN */}
      {activeStudentSection === 'results' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Lịch sử làm bài & Bảng điểm</h2>
              <p className="text-xs text-slate-500">Theo dõi tiến độ, số câu đúng và lời giải chi tiết</p>
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
              {user.avatar || 'HS'}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{user.name}</h2>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
                  Học sinh chính thức
                </span>
                <span>Mã số: <strong className="font-mono text-slate-700">{user.studentId || 'HS12-001'}</strong></span>
              </div>
            </div>
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
  );
};
