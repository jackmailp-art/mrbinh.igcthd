import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Award,
  ChevronLeft,
  Check,
  AlertCircle,
  Lightbulb,
  Loader2,
  UserCheck,
  KeyRound,
  Phone,
  ShieldCheck,
  Headphones,
  FileText,
  Layers,
  Volume2,
  PenTool,
  ListOrdered
} from 'lucide-react';
import { ClassItem, ExamItem, StudentItem, SubmissionItem } from '../types';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';
import { AiDiagnosticPanel } from './AiDiagnosticPanel';
import { AudioPlayerControl } from './AudioPlayerControl';
import { ReadingPassageWorkspace } from './ReadingPassageWorkspace';
import {
  formatQuestionHtml,
  formatOptionHtml,
  formatPassageHtml,
  isOptionMatchingAnswer,
  inferUnderlinedPart,
  playPronunciationAudio,
  cleanQuestionContent
} from '../utils/examFormatters';

interface StudentPortalViewProps {
  classes: ClassItem[];
  exams: ExamItem[];
  students?: StudentItem[];
  onExitStudentMode: () => void;
  onSubmissionComplete?: (submission: SubmissionItem) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  classes,
  exams: propExams,
  students: propStudents = [],
  onExitStudentMode,
  onSubmissionComplete,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verifiedClass, setVerifiedClass] = useState<ClassItem | null>(null);
  const [availableExams, setAvailableExams] = useState<ExamItem[]>(propExams);
  
  // Authenticated Student Identity from 2FA
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentPhone, setStudentPhone] = useState('');

  const [activeExam, setActiveExam] = useState<ExamItem | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submittedEssayEvaluation, setSubmittedEssayEvaluation] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedPassageId, setExpandedPassageId] = useState<number | null>(null);
  const [passageFontSize, setPassageFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [passageHighlightKeywords, setPassageHighlightKeywords] = useState<boolean>(true);

  // Auto-fill URL pin if present (e.g. ?pin=1234)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pinParam = params.get('pin');
    if (pinParam) {
      setPinInput(pinParam.trim());
    }
  }, []);

  const handleVerify2Factor = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    const cleanPhone = phoneInput.trim().replace(/\D/g, '');

    if (!cleanPin) {
      setErrorMessage('Vui lòng nhập Mã PIN lớp học do Thầy Bình cung cấp.');
      return;
    }
    if (!cleanPhone) {
      setErrorMessage('Vui lòng nhập Số điện thoại học sinh.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    // Verification via authService
    setTimeout(async () => {
      const res = authService.verifyStudentByPinAndPhone({
        pin: cleanPin,
        phone: cleanPhone,
        classesList: classes,
        studentsList: propStudents
      });

      if (res.success && res.user && res.matchedClass) {
        setVerifiedClass(res.matchedClass);
        setStudentName(res.user.name);
        setStudentId(res.user.studentId || `HS-${cleanPhone.slice(-4)}`);
        setStudentPhone(cleanPhone);

        // Fetch exams for this class or use propExams
        const serverResult = await apiService.verifyPin(cleanPin);
        if (serverResult.valid && serverResult.exams && serverResult.exams.length > 0) {
          setAvailableExams(serverResult.exams);
        } else {
          setAvailableExams(propExams);
        }
        setIsVerifying(false);
      } else {
        setErrorMessage(res.message);
        setIsVerifying(false);
      }
    }, 300);
  };

  const handleSelectOption = (qNum: number, opt: string) => {
    if (submittedScore !== null) return;
    setSelectedAnswers(prev => ({ ...prev, [qNum]: opt }));
  };

  const handleSubmitExam = async () => {
    if (!activeExam || !verifiedClass) return;
    setIsSubmitting(true);

    // Identify essay question if present
    const essayQuestion = activeExam.questions.find(q =>
      q.questionType === 'essay' ||
      q.sectionType === 'essay_writing' ||
      !!q.essayPrompt ||
      (q.sectionTitle && q.sectionTitle.toLowerCase().includes('essay'))
    );

    let correct = 0;
    let objectiveTotal = 0;

    activeExam.questions.forEach(q => {
      const isEssay = q.questionType === 'essay' ||
        q.sectionType === 'essay_writing' ||
        !!q.essayPrompt ||
        (q.sectionTitle && q.sectionTitle.toLowerCase().includes('essay'));

      if (isEssay) return; // Graded separately by teacher rubric
      objectiveTotal++;

      const chosen = selectedAnswers[q.num];
      if (!chosen) return;

      const isShortAnswer = q.questionType === 'short_answer' ||
        q.sectionType === 'writing_short' ||
        (!isEssay && (!q.options || q.options.length === 0));

      if (isShortAnswer) {
        const cleanChosen = chosen.trim().toLowerCase().replace(/[.,!?;:]/g, '');
        const cleanAns = (q.answer || '').trim().toLowerCase().replace(/[.,!?;:]/g, '');
        const isMatch = cleanChosen === cleanAns || (q.alternativeAnswers && q.alternativeAnswers.some(alt => alt.trim().toLowerCase().replace(/[.,!?;:]/g, '') === cleanChosen));
        if (isMatch) correct++;
      } else if (q.options && q.options.length > 0) {
        if (isOptionMatchingAnswer(chosen, q.answer)) {
          correct++;
        }
      } else {
        if (q.answer && chosen.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
          correct++;
        }
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
        console.warn('Teacher essay grading error:', e);
      }
    }

    // Overall exam score combining objective questions and teacher-graded essay
    let totalScore = 0;
    const totalQuestionsCount = activeExam.questions.length || 1;

    if (essayQuestion && essayEvaluationResult) {
      const essayWeightMax = totalQuestionsCount <= 6 ? (10 / totalQuestionsCount) : 2.0;
      const objectiveWeightMax = 10 - essayWeightMax;
      const objectiveEarned = objectiveTotal > 0 ? (correct / objectiveTotal) * objectiveWeightMax : 0;
      const essayEarned = (essayEvaluationResult.totalScore / 10) * essayWeightMax;
      totalScore = Number(Math.min(10, Math.max(0, objectiveEarned + essayEarned)).toFixed(1));
    } else {
      totalScore = Number(((correct / totalQuestionsCount) * 10).toFixed(1));
    }

    setSubmittedScore(totalScore);
    setSubmittedEssayEvaluation(essayEvaluationResult);

    const submission: SubmissionItem = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentName: studentName.trim() || 'Học sinh ẩn danh',
      studentId: studentId.trim() || undefined,
      studentPhone: studentPhone.trim() || undefined,
      classId: verifiedClass.id,
      className: verifiedClass.name,
      examId: activeExam.id,
      examTitle: activeExam.title,
      score: totalScore,
      totalQuestions: activeExam.questions.length,
      correctAnswersCount: correct + (essayEvaluationResult && essayEvaluationResult.totalScore >= 5 ? 1 : 0),
      answers: selectedAnswers,
      submittedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      essayEvaluation: essayEvaluationResult || undefined
    };

    // Save to central server & local storage
    await apiService.submitExam(submission);
    if (onSubmissionComplete) {
      onSubmissionComplete(submission);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 flex flex-col items-center justify-start font-sans">
      
      {/* Student Portal Header Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onExitStudentMode}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-100 px-3 py-1.5 rounded-xl transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại giao diện Giáo viên</span>
          </button>
          <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
            Chế độ Học sinh làm bài
          </span>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Trợ lý học tập thông minh Tiếng Anh
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-6">
        
        {/* Step 1: 2-Factor Authentication (PIN + Phone) */}
        {!verifiedClass ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Xác thực kép 2FA
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">Vào lớp làm bài</h2>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Nhập Mã PIN lớp và Số điện thoại của em để xác thực danh tính chính chủ và nhận đề thi trắc nghiệm.
              </p>
            </div>

            {/* Hint for existing classes or contact */}
            {classes.length > 0 && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-emerald-900 text-left space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Mã PIN các lớp đang mở thi:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {classes.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setPinInput(c.pin);
                        setErrorMessage('');
                      }}
                      className="bg-white hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-lg border border-emerald-200 shadow-2xs text-[11px] transition cursor-pointer"
                    >
                      {c.name}: <span className="font-mono">{c.pin}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerify2Factor} className="space-y-3.5 pt-2 text-left">
              {/* Field 1: Mã PIN lớp học */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  1. Mã PIN lớp học <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                  </div>
                  <input
                    type="text"
                    required
                    value={pinInput}
                    disabled={isVerifying}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Nhập mã PIN 4 số (VD: 4324, 4827...)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold tracking-wider text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Field 2: Số điện thoại học sinh */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  2. Số điện thoại học sinh <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    disabled={isVerifying}
                    onChange={(e) => {
                      setPhoneInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Nhập số điện thoại của em (VD: 0839050211...)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifying || !pinInput.trim() || !phoneInput.trim()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang đối soát danh sách lớp...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác nhận vào làm bài</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : !activeExam ? (
          /* Step 2: Choose exam to practice with authenticated student identity */
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            {/* Authenticated Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã xác thực chính chủ
                  </span>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{verifiedClass.name}</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  Xin chào, {studentName}!
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lớp trực thuộc: <span className="font-semibold text-slate-700">{verifiedClass.name}</span> • Giáo viên phụ trách: <span className="font-semibold text-slate-700">Thầy Dương Văn Bình</span> • Mã số: <span className="font-mono font-semibold">{studentId}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setVerifiedClass(null);
                  setStudentName('');
                  setStudentId('');
                  setStudentPhone('');
                  setPhoneInput('');
                  setErrorMessage('');
                }}
                className="self-start sm:self-center text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 px-3 py-2 rounded-xl transition cursor-pointer"
              >
                Đăng xuất / Đổi lớp
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Danh sách bài tập cần hoàn thành:</h3>
              {availableExams.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500">Lớp hiện chưa có bộ đề nào đang mở.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableExams.map(ex => (
                    <div
                      key={ex.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {ex.grade} • {ex.questionsCount} câu ({ex.duration})
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-2">{ex.title}</h4>
                      </div>

                      <button
                        onClick={() => {
                          setActiveExam(ex);
                          setSelectedAnswers({});
                          setSubmittedScore(null);
                        }}
                        className="mt-4 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                      >
                        <span>Bắt đầu làm bài</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Step 3: Taking Exam & Result */
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{verifiedClass.name}</span>
                <h2 className="text-lg font-extrabold text-slate-900">{activeExam.title}</h2>
              </div>
              <button
                onClick={() => setActiveExam(null)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Trở về danh sách
              </button>
            </div>

            {submittedScore !== null && (
              <>
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <Award className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-2xl font-black text-emerald-800">
                    Điểm của em: {submittedScore.toFixed(1)} / 10
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium">
                    Kết quả đã được tự động lưu và gửi về hệ thống của Thầy Bình! Em hãy xem lời nhận xét chấm bài chi tiết của giáo viên và chẩn đoán sư phạm bên dưới.
                  </p>
                </div>

                {/* Teacher's Essay Evaluation Card */}
                {submittedEssayEvaluation && (
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
                        <span className="text-emerald-700 text-base font-black">{submittedEssayEvaluation.totalScore} / 10đ</span>
                      </div>
                    </div>

                    {/* 4 Rubric Criteria Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Criterion 1 */}
                      <div className="bg-white/95 p-3.5 rounded-xl border border-emerald-200 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">1. Task Achievement (Mục tiêu đề bài):</span>
                          <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {submittedEssayEvaluation.criteria.taskAchievement.score} / 2.5đ
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {submittedEssayEvaluation.criteria.taskAchievement.feedback}
                        </p>
                      </div>

                      {/* Criterion 2 */}
                      <div className="bg-white/95 p-3.5 rounded-xl border border-emerald-200 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">2. Coherence & Cohesion (Tính mạch lạc & Từ nối):</span>
                          <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {submittedEssayEvaluation.criteria.coherence.score} / 2.5đ
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {submittedEssayEvaluation.criteria.coherence.feedback}
                        </p>
                      </div>

                      {/* Criterion 3 */}
                      <div className="bg-white/95 p-3.5 rounded-xl border border-emerald-200 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">3. Lexical Resource (Vốn từ vựng & Collocations):</span>
                          <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {submittedEssayEvaluation.criteria.lexical.score} / 2.5đ
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {submittedEssayEvaluation.criteria.lexical.feedback}
                        </p>
                      </div>

                      {/* Criterion 4 */}
                      <div className="bg-white/95 p-3.5 rounded-xl border border-emerald-200 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">4. Grammatical Range & Accuracy (Ngữ pháp & Câu):</span>
                          <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {submittedEssayEvaluation.criteria.grammar.score} / 2.5đ
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {submittedEssayEvaluation.criteria.grammar.feedback}
                        </p>
                      </div>
                    </div>

                    {/* Teacher's General Heartfelt Comment */}
                    {submittedEssayEvaluation.teacherGeneralComment && (
                      <div className="bg-white/95 p-3.5 rounded-xl border border-emerald-200 space-y-1">
                        <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                          <span>👨‍🏫 Lời phê tổng quát của Giáo viên:</span>
                        </span>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed italic bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                          "{submittedEssayEvaluation.teacherGeneralComment}"
                        </p>
                      </div>
                    )}

                    {/* Strengths & Areas to Improve */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {submittedEssayEvaluation.strengths && submittedEssayEvaluation.strengths.length > 0 && (
                        <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 space-y-1">
                          <span className="font-bold text-emerald-900 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Điểm sáng của bài viết:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                            {submittedEssayEvaluation.strengths.map((str: string, sIdx: number) => (
                              <li key={sIdx}>{str}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {submittedEssayEvaluation.areasToImprove && submittedEssayEvaluation.areasToImprove.length > 0 && (
                        <div className="p-3 bg-white/90 rounded-xl border border-amber-200 space-y-1">
                          <span className="font-bold text-amber-900 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Lời khuyên nâng band điểm:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                            {submittedEssayEvaluation.areasToImprove.map((imp: string, iIdx: number) => (
                              <li key={iIdx}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Suggested Revision */}
                    {submittedEssayEvaluation.suggestedRevision && (
                      <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                        <span className="font-bold text-blue-900 flex items-center gap-1.5">
                          <span>📝 Đoạn văn viết lại mẫu nâng cấp (Model Paragraph):</span>
                        </span>
                        <p className="text-slate-800 font-serif leading-relaxed italic bg-white/80 p-3 rounded-lg border border-blue-100 text-[12px]">
                          {submittedEssayEvaluation.suggestedRevision}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Pedagogical Diagnostic Panel */}
                <AiDiagnosticPanel
                  questions={activeExam.questions}
                  answers={selectedAnswers}
                  score={submittedScore}
                  studentName={studentName}
                />
              </>
            )}

            {/* Audio Players for Listening Sections (Track 1 & Track 2) */}
            {(activeExam.audioScript || activeExam.audioScriptTask2 || activeExam.audioUrl || activeExam.audioUrlTask2 || activeExam.questions.some(q => q.sectionType === 'listening' || q.audioScript || q.audioUrl)) && (
              <div className="mb-4 space-y-2.5">
                {(activeExam.audioScript || activeExam.audioUrl) && (
                  <AudioPlayerControl
                    audioScript={activeExam.audioScript || ''}
                    audioUrl={activeExam.audioUrl}
                    audioTitle={activeExam.audioTitle || 'Track 1 - Bài nghe hiểu (Task 1: True / False)'}
                    maxPlays={activeExam.listeningMaxPlays || 2}
                    isTeacher={false}
                    isSubmitted={submittedScore !== null}
                  />
                )}
                {(activeExam.audioScriptTask2 || activeExam.audioUrlTask2) && (
                  <AudioPlayerControl
                    audioScript={activeExam.audioScriptTask2 || ''}
                    audioUrl={activeExam.audioUrlTask2}
                    audioTitle={activeExam.audioTitleTask2 || 'Track 2 - Bài nghe hiểu (Part 2 / Task 2)'}
                    maxPlays={activeExam.listeningMaxPlays || 2}
                    isTeacher={false}
                    isSubmitted={submittedScore !== null}
                  />
                )}
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {activeExam.questions.map((q, idx) => {
                const prevQ = idx > 0 ? activeExam.questions[idx - 1] : null;
                const showSectionHeader = !prevQ || prevQ.sectionTitle !== q.sectionTitle;
                const rawPassage = q.passage || (q as any).readingText || (q as any).passageText;
                const prevPassage = prevQ ? (prevQ.passage || (prevQ as any).readingText || (prevQ as any).passageText) : null;
                const showPassage = rawPassage && (!prevQ || prevPassage !== rawPassage);

                const isEssay = q.questionType === 'essay' ||
                  q.sectionType === 'essay_writing' ||
                  !!q.essayPrompt ||
                  (q.sectionTitle && q.sectionTitle.toLowerCase().includes('essay'));

                const isShortAnswer = q.questionType === 'short_answer' ||
                  q.sectionType === 'writing_short' ||
                  (!isEssay && (!q.options || q.options.length === 0));

                const arrangementItems = q.arrangementItems || (q as any).scrambledItems || (q as any).sentences || (q as any).items || [];

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
                  <div key={q.id || idx} className="space-y-3">
                    {/* Section Header */}
                    {shouldShowHeader && effectiveSectionTitle && (
                      <div className="space-y-2.5">
                        <div className="pt-3 pb-1 border-b border-slate-100 flex items-center justify-between">
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100/80 text-blue-950 rounded-xl text-xs font-black tracking-wide border border-blue-200">
                            <Layers className="w-3.5 h-3.5 text-blue-700" />
                            <span>{effectiveSectionTitle}</span>
                          </div>
                          {q.sectionType === 'reading_comprehension' && (
                            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                              Đọc bài khóa bên dưới và trả lời các câu hỏi
                            </span>
                          )}
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
                              isSubmitted={submittedScore !== null}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Passage for Cloze or Reading Comprehension */}
                    {showPassage && (
                      <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/95 via-amber-100/40 to-amber-50/90 border border-amber-200/90 rounded-2xl space-y-3 text-xs shadow-xs">
                        <div className="font-extrabold text-amber-950 flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-amber-200/70">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-amber-700" />
                            <span className="text-sm font-black">
                              {q.passageTitle ? `Đoạn văn đọc: ${q.passageTitle}` : 'Nội dung bài đọc (Reading Passage):'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Zoom controls */}
                            <div className="inline-flex items-center bg-white/90 rounded-lg p-0.5 border border-amber-200 shadow-2xs">
                              <button
                                type="button"
                                title="Giảm cỡ chữ"
                                onClick={() => setPassageFontSize(passageFontSize === 'lg' ? 'base' : 'sm')}
                                className="px-1.5 py-0.5 text-[10px] font-bold text-amber-900 hover:bg-amber-100 rounded"
                              >
                                A-
                              </button>
                              <button
                                type="button"
                                title="Tăng cỡ chữ"
                                onClick={() => setPassageFontSize(passageFontSize === 'sm' ? 'base' : 'lg')}
                                className="px-1.5 py-0.5 text-[10px] font-bold text-amber-900 hover:bg-amber-100 rounded"
                              >
                                A+
                              </button>
                            </div>

                            {/* Highlight toggle */}
                            <button
                              type="button"
                              onClick={() => setPassageHighlightKeywords(!passageHighlightKeywords)}
                              className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition ${
                                passageHighlightKeywords
                                  ? 'bg-amber-200/90 border-amber-400 text-amber-950 shadow-2xs'
                                  : 'bg-white/80 border-amber-200 text-slate-600'
                              }`}
                            >
                              <Sparkles className="w-3 h-3 text-amber-700" />
                              <span>{passageHighlightKeywords ? 'Đã tô đậm từ khóa' : 'Bật tô đậm từ khóa'}</span>
                            </button>

                            {/* Reading passage completion indicator */}
                            {(() => {
                              const related = activeExam.questions.filter(
                                (it) => (it.passage || (it as any).readingText || (it as any).passageText) === rawPassage
                              );
                              const answered = related.filter(it => (selectedAnswers[it.num] || '').trim().length > 0).length;
                              const pct = related.length > 0 ? Math.round((answered / related.length) * 100) : 0;
                              return (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/95 rounded-lg border border-amber-200 text-[10px] font-bold">
                                  <span className="text-amber-800">Tiến độ bài đọc:</span>
                                  <span className="text-amber-950 font-black">{answered}/{related.length} ({pct}%)</span>
                                </div>
                              );
                            })()}

                            <span className="text-[10px] font-bold uppercase bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                              Bài đọc dùng chung
                            </span>
                          </div>
                        </div>

                        <div
                          className={`text-slate-800 leading-relaxed font-serif bg-white/95 p-4 sm:p-5 rounded-xl border border-amber-200/80 whitespace-pre-line shadow-inner max-h-[380px] overflow-y-auto reading-passage-scroll ${
                            passageFontSize === 'sm' ? 'text-xs' : passageFontSize === 'lg' ? 'text-base' : 'text-sm'
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: formatPassageHtml(
                              rawPassage,
                              activeExam.questions.filter(
                                (it) => (it.passage || (it as any).readingText || (it as any).passageText) === rawPassage
                              ),
                              passageHighlightKeywords
                            ),
                          }}
                        />

                        <div className="flex items-center justify-between text-[11px] text-amber-800/80">
                          <span>💡 Cuộn khung văn bản trên để đối chiếu chi tiết khi trả lời câu hỏi.</span>
                          <span className="font-semibold text-amber-900">Các từ khóa & chỗ trống đã được làm nổi bật</span>
                        </div>
                      </div>
                    )}

                    {/* Secondary persistent reading bar for subsequent questions of the same passage */}
                    {!showPassage && rawPassage && (
                      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-amber-900 font-bold">
                          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                          <span>Đối chiếu bài đọc: {q.passageTitle || 'Reading Passage'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedPassageId(expandedPassageId === q.num ? null : q.num)}
                          className="px-2.5 py-1 bg-amber-200/90 hover:bg-amber-300 text-amber-950 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                        >
                          {expandedPassageId === q.num ? 'Thu gọn bài đọc' : '📖 Xem lại bài đọc tại đây'}
                        </button>
                      </div>
                    )}

                    {/* Inline expanded passage if student toggles it */}
                    {!showPassage && rawPassage && expandedPassageId === q.num && (
                      <div className="p-4 bg-white/95 border border-amber-300 rounded-xl font-serif text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-inner max-h-[320px] overflow-y-auto reading-passage-scroll animate-in fade-in duration-150"
                        dangerouslySetInnerHTML={{
                          __html: formatPassageHtml(
                            rawPassage,
                            activeExam.questions.filter(
                              (it) => (it.passage || (it as any).readingText || (it as any).passageText) === rawPassage
                            ),
                            passageHighlightKeywords
                          ),
                        }}
                      />
                    )}

                    <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3.5 shadow-2xs">
                      {/* Question Text */}
                      <div className="font-bold text-sm text-slate-900 flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <strong className="text-slate-900 mr-2 font-black tracking-tight">Question {q.num || idx + 1}:</strong>
                          <span dangerouslySetInnerHTML={{ __html: formatQuestionHtml(cleanQuestionContent(q.question, submittedScore === null)) }} />
                        </div>
                        {submittedScore !== null && q.grammarPoint && (
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200 shrink-0">
                            {q.grammarPoint}
                          </span>
                        )}
                      </div>

                      {/* 1. Arrangement Items Display */}
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

                      {/* 2. Original Sentence for transformation & Base word */}
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
                            <span>
                              {q.essayPrompt?.topic || 'Đề bài viết luận / Paragraph Writing'}
                            </span>
                            <span className="text-[11px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                              {q.essayPrompt ? `${q.essayPrompt.minWords}-${q.essayPrompt.maxWords} từ` : '80-140 từ'}
                            </span>
                          </div>

                          {q.essayPrompt?.suggestedPoints && q.essayPrompt.suggestedPoints.length > 0 && (
                            <div className="text-[11px] text-emerald-900 space-y-1 pt-1 border-t border-emerald-200/60">
                              <span className="font-bold">Gợi ý phát triển ý (Suggested ideas):</span>
                              {q.essayPrompt.suggestedPoints.map((pt, pIdx) => (
                                <div key={pIdx} className="pl-2">• {pt}</div>
                              ))}
                            </div>
                          )}

                          {/* 4 Standard Criteria Rubric */}
                          <div className="mt-2 pt-2 border-t border-emerald-200/70 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                            <div className="bg-white/90 p-2 rounded border border-emerald-200 text-slate-700">
                              <strong className="text-emerald-900 block">1. Task Achievement (2.5đ)</strong>
                              Trả lời đúng, đủ yêu cầu đề
                            </div>
                            <div className="bg-white/90 p-2 rounded border border-emerald-200 text-slate-700">
                              <strong className="text-emerald-900 block">2. Coherence (2.5đ)</strong>
                              Liên kết, bố cục, từ nối
                            </div>
                            <div className="bg-white/90 p-2 rounded border border-emerald-200 text-slate-700">
                              <strong className="text-emerald-900 block">3. Lexical (2.5đ)</strong>
                              Vốn từ & độ chuẩn xác
                            </div>
                            <div className="bg-white/90 p-2 rounded border border-emerald-200 text-slate-700">
                              <strong className="text-emerald-900 block">4. Grammar (2.5đ)</strong>
                              Ngữ pháp & thì chuẩn
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 1. Multiple Choice Options */}
                      {!isEssay && !isShortAnswer && q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isChosen = isOptionMatchingAnswer(opt, selectedAnswers[q.num]);
                            const isCorrect = submittedScore !== null && isOptionMatchingAnswer(opt, q.answer);
                            const isWrongChosen = submittedScore !== null && isChosen && !isCorrect;

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={submittedScore !== null}
                                onClick={() => handleSelectOption(q.num, opt)}
                                className={`p-3 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between gap-2 cursor-pointer ${
                                  isCorrect
                                    ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold shadow-xs'
                                    : isWrongChosen
                                    ? 'bg-rose-100 border-rose-300 text-rose-950 shadow-xs'
                                    : isChosen
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <span dangerouslySetInnerHTML={{ __html: formatOptionHtml(opt, q) }} />
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* Pronunciation audio helper */}
                                  <span
                                    role="button"
                                    tabIndex={0}
                                    title="Bấm để nghe phát âm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playPronunciationAudio(opt);
                                    }}
                                    className={`w-6 h-6 rounded-md flex items-center justify-center transition ${
                                      isChosen ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-800'
                                    }`}
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </span>
                                  {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                                  {isWrongChosen && <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-bold">Lựa chọn sai</span>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. Short Answer Input */}
                      {isShortAnswer && (
                        <div className="space-y-1.5 pt-1">
                          <label className="block text-xs font-bold text-slate-700">
                            Nhập câu trả lời của em tại đây:
                          </label>
                          <input
                            type="text"
                            disabled={submittedScore !== null}
                            value={selectedAnswers[q.num] || ''}
                            onChange={(e) => handleSelectOption(q.num, e.target.value)}
                            placeholder="Gõ từ hoặc viết lại câu hoàn chỉnh tại đây..."
                            className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                          />
                        </div>
                      )}

                      {/* 3. Essay Textarea */}
                      {isEssay && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center text-xs">
                            <label className="font-bold text-slate-700">Khung viết bài luận của em:</label>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Số từ: {(selectedAnswers[q.num] || '').trim().split(/\s+/).filter(Boolean).length} từ
                            </span>
                          </div>
                          <textarea
                            rows={6}
                            disabled={submittedScore !== null}
                            value={selectedAnswers[q.num] || ''}
                            onChange={(e) => handleSelectOption(q.num, e.target.value)}
                            placeholder="Viết đoạn văn tiếng Anh của em tại đây (nội dung được tự động lưu vào máy)..."
                            className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed shadow-2xs"
                          />

                          {submittedScore !== null && submittedEssayEvaluation && (
                            <div className="p-3 bg-emerald-50/90 border border-emerald-300 rounded-xl space-y-1 text-xs">
                              <div className="flex items-center justify-between font-extrabold text-emerald-950">
                                <span className="flex items-center gap-1.5">
                                  <PenTool className="w-4 h-4 text-emerald-700" />
                                  <span>Kết quả Giáo viên chấm bài viết của em:</span>
                                </span>
                                <span className="text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-lg border border-emerald-300 font-black">
                                  {submittedEssayEvaluation.totalScore} / 10đ
                                </span>
                              </div>
                              <p className="text-[11px] text-emerald-800 italic leading-relaxed">
                                "{submittedEssayEvaluation.teacherGeneralComment}"
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                  {submittedScore !== null && (
                    <div className="space-y-2 mt-3">
                      {/* Step-by-step Pedagogical Explanation */}
                      {q.explanation && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 leading-relaxed">
                          <strong className="text-emerald-900">Lời giải thích sư phạm:</strong> {q.explanation}
                        </div>
                      )}

                      {/* Targeted Misconception Diagnosis if Student chose wrong option */}
                      {(() => {
                        const chosenOpt = selectedAnswers[q.num];
                        const isStudentWrong = chosenOpt && q.answer && !q.answer.trim().startsWith(chosenOpt.slice(0, 2));
                        if (!isStudentWrong) return null;

                        const matchedMisconception = q.misconceptions?.find(
                          (m) => m.option.slice(0, 2) === chosenOpt.slice(0, 2)
                        );

                        return (
                          <div className="p-3 bg-amber-50/90 border border-amber-300/80 rounded-xl text-xs space-y-1.5 text-amber-950">
                            <div className="font-bold text-amber-900 flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span>Chẩn đoán Điểm mù Kiến thức & Lỗi nhầm lẫn (Misconception):</span>
                            </div>
                            <div className="text-[11px] leading-relaxed pl-1">
                              {matchedMisconception ? (
                                <>
                                  <span className="font-semibold text-amber-900">Khi bạn chọn {matchedMisconception.option}:</span> {matchedMisconception.whyWrong}
                                </>
                              ) : (
                                <>Bạn đã nhầm lẫn cấu trúc hoặc thời thì của câu. Hãy đối chiếu lại dấu hiệu nhận biết thời gian và chủ ngữ chính.</>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Instant Remediation Suggestions */}
                      {q.remediation && (
                        <div className="p-3 bg-indigo-50/90 border border-indigo-200 rounded-xl text-xs space-y-1 text-indigo-950">
                          <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-indigo-600" />
                            <span>Gợi ý củng cố tức thì (Micro-remediation):</span>
                          </div>
                          {q.remediation.coreRule && (
                            <div className="text-[11px] pl-1">
                              • <strong>Quy tắc cốt lõi:</strong> {q.remediation.coreRule}
                            </div>
                          )}
                          {q.remediation.counterExample && (
                            <div className="text-[11px] pl-1">
                              • <strong>Ví dụ phản chứng / tương đương:</strong> {q.remediation.counterExample}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

            {submittedScore === null ? (
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? 'Đang nộp bài...' : 'Nộp bài thi'}</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setActiveExam(null)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition"
                >
                  Hoàn tất và đóng bài
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
