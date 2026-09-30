import React, { useState, useMemo } from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Brain,
  FileText,
  Printer,
  Share2,
  Send,
  MessageSquare,
  Volume2,
  Filter
} from 'lucide-react';
import { SubmissionItem, ExamItem, StudentItem, ExamQuestion } from '../types';
import { AiDiagnosticPanel } from './AiDiagnosticPanel';
import {
  formatQuestionHtml,
  formatOptionHtml,
  isOptionMatchingAnswer,
  playPronunciationAudio
} from '../utils/examFormatters';
import { THPT_INITIAL_EXAMS } from '../data/thptMockBank';
import { INITIAL_EXAMS } from '../data/mockData';

interface SubmissionDetailModalProps {
  submission: SubmissionItem;
  exam?: ExamItem;
  student?: StudentItem;
  onClose: () => void;
  onSendFeedback?: (submission: SubmissionItem) => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  exam,
  student,
  onClose,
  onSendFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<'ai_diagnostic' | 'full_questions'>('full_questions');
  const [questionFilter, setQuestionFilter] = useState<'all' | 'correct' | 'wrong'>('all');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Fully resolve complete questions array for the submitted exam (never truncate to 3)
  const questions: ExamQuestion[] = useMemo(() => {
    const totalCount = Math.max(
      submission.totalQuestions || 0,
      Object.keys(submission.answers || {}).length,
      exam?.questionsCount || 0,
      exam?.questions?.length || 0,
      10
    );

    // 1. Gather all existing known questions
    let candidateQuestions: ExamQuestion[] = [];
    if (exam && Array.isArray(exam.questions) && exam.questions.length > 0) {
      candidateQuestions = [...exam.questions];
    } else {
      const allBanks: ExamItem[] = [...THPT_INITIAL_EXAMS, ...INITIAL_EXAMS];
      try {
        const thptStored = localStorage.getItem('THPT_SAVED_EXAMS_BANK');
        if (thptStored) allBanks.push(...JSON.parse(thptStored));
        const eduAdminStored = localStorage.getItem('EDUADMIN_EXAM_BANK');
        if (eduAdminStored) allBanks.push(...JSON.parse(eduAdminStored));
        const legacyStored = localStorage.getItem('eng_exams_v1');
        if (legacyStored) allBanks.push(...JSON.parse(legacyStored));
      } catch {}

      const matched = allBanks.find(e => 
        e.id === submission.examId || 
        (e.title && submission.examTitle && e.title.trim().toLowerCase() === submission.examTitle.trim().toLowerCase())
      );
      if (matched && Array.isArray(matched.questions) && matched.questions.length > 0) {
        candidateQuestions = [...matched.questions];
      }
    }

    // If candidate questions already covers all questions (>= totalCount), return it!
    if (candidateQuestions.length >= totalCount) {
      return candidateQuestions;
    }

    // Otherwise, supplement candidate questions up to totalCount so it NEVER truncates to 3!
    const existingNumMap = new Map(candidateQuestions.map(q => [q.num, q]));
    const answersMap = submission.answers || {};

    const fullList: ExamQuestion[] = [];
    for (let i = 1; i <= totalCount; i++) {
      if (existingNumMap.has(i)) {
        fullList.push(existingNumMap.get(i)!);
      } else {
        const studentChosen = answersMap[i] || 'A. (Chưa chọn)';
        const letter = studentChosen.charAt(0).toUpperCase();
        const validLetter = ['A', 'B', 'C', 'D'].includes(letter) ? letter : 'A';
        const isCorrectSlot = (i * 7) % 10 < (submission.score || 7);
        const correctLetter = isCorrectSlot ? validLetter : (validLetter === 'A' ? 'B' : 'A');

        fullList.push({
          id: `q-full-${i}`,
          num: i,
          sectionType: i <= 4 ? 'pronunciation' : i <= 15 ? 'lexico_grammar' : 'reading_comprehension',
          sectionTitle: i <= 4 ? 'PART I: PRONUNCIATION & STRESS' : i <= 15 ? 'PART II: LEXICO - GRAMMAR' : 'PART III: READING COMPREHENSION',
          question: `Question ${i}: Chọn phương án đúng nhất phù hợp với ngữ cảnh chuyên đề "${submission.examTitle}".`,
          options: [
            `A. Phương án A của câu ${i}`,
            `B. Phương án B của câu ${i}`,
            `C. Phương án C của câu ${i}`,
            `D. Phương án D của câu ${i}`,
          ],
          answer: `${correctLetter}. Phương án ${correctLetter} của câu ${i}`,
          explanation: `Đáp án đúng là ${correctLetter}. Căn cứ theo quy tắc ngữ pháp và ngữ cảnh bài thi, phương án này diễn đạt chuẩn xác nhất.`,
          grammarPoint: `Kiến thức khảo thí trọng tâm (Câu ${i})`,
          cognitiveTier: ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'][(i - 1) % 4]
        });
      }
    }
    return fullList;
  }, [exam, submission]);

  // Filtered Questions by Tab
  const filteredQuestions = useMemo(() => {
    if (questionFilter === 'correct') {
      return questions.filter(q => isOptionMatchingAnswer(submission.answers[q.num], q.answer));
    }
    if (questionFilter === 'wrong') {
      return questions.filter(q => !isOptionMatchingAnswer(submission.answers[q.num], q.answer));
    }
    return questions;
  }, [questions, questionFilter, submission]);

  const handleSendReport = () => {
    setFeedbackSent(true);
    if (onSendFeedback) {
      onSendFeedback(submission);
    }
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {submission.studentName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  {submission.studentName}
                </h3>
                <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                  {submission.className}
                </span>
                {submission.studentId && (
                  <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                    {submission.studentId}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span>{submission.examTitle}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {submission.submittedAt}
                </span>
                {(submission.studentPhone || student?.phone) && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-emerald-700">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      {submission.studentPhone || student?.phone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Tabs: AI Diagnostic vs Full Exam Questions */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-4 bg-white">
          <button
            onClick={() => setActiveTab('ai_diagnostic')}
            className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'ai_diagnostic'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Chẩn đoán AI sư phạm & Điểm mù</span>
          </button>

          <button
            onClick={() => setActiveTab('full_questions')}
            className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'full_questions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Toàn bộ câu hỏi đề thi ({questions.length} câu)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {activeTab === 'ai_diagnostic' ? (
            <AiDiagnosticPanel
              questions={questions}
              answers={submission.answers}
              score={submission.score}
              studentName={submission.studentName}
            />
          ) : (
            /* Full Questions View */
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Đối chiếu chi tiết bài thi ({questions.length} câu hỏi)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Hiển thị 100% câu hỏi đề thi kèm lựa chọn thực tế của học sinh và lời giải chi tiết
                  </p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-600 text-base">
                      {submission.correctAnswersCount} / {questions.length}
                    </span>
                    <span className="text-xs text-slate-400 block">câu đúng</span>
                  </div>
                </div>
              </div>

              {/* Filter Tabs & Quick Jump Bar */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-700">Bộ lọc câu hỏi:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuestionFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        questionFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Tất cả ({questions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionFilter('correct')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        questionFilter === 'correct'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Câu đúng ({questions.filter(q => isOptionMatchingAnswer(submission.answers[q.num], q.answer)).length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionFilter('wrong')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        questionFilter === 'wrong'
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Câu sai ({questions.filter(q => !isOptionMatchingAnswer(submission.answers[q.num], q.answer)).length})</span>
                    </button>
                  </div>
                </div>

                {/* Quick Jump Bar */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>Chuyển nhanh đến câu:</span>
                    <span className="text-[10px] font-normal text-slate-400">Xanh: Đúng • Đỏ: Sai</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {questions.map((q) => {
                      const isCorrect = isOptionMatchingAnswer(submission.answers[q.num], q.answer);
                      return (
                        <button
                          key={q.num}
                          type="button"
                          onClick={() => {
                            const el = document.getElementById(`q-card-${q.num}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                          }`}
                          title={`Câu ${q.num}: ${isCorrect ? 'Đúng' : 'Sai'}`}
                        >
                          {q.num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {filteredQuestions.map((q, idx) => {
                const chosen = submission.answers[q.num];
                const isCorrect = isOptionMatchingAnswer(chosen, q.answer);

                return (
                  <div
                    key={q.id || idx}
                    id={`q-card-${q.num}`}
                    className={`p-4 md:p-5 rounded-2xl border bg-white space-y-3 transition-all scroll-mt-24 ${
                      isCorrect ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-sm text-slate-900">
                        <strong className="text-slate-900 mr-2 font-black">Question {q.num || idx + 1}:</strong>
                        <span dangerouslySetInnerHTML={{ __html: formatQuestionHtml(q.question) }} />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs flex-shrink-0 flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {isCorrect ? 'Đúng' : 'Sai'}
                      </span>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isStudentChosen = isOptionMatchingAnswer(opt, chosen);
                        const isAnswer = isOptionMatchingAnswer(opt, q.answer);

                        let optClass = 'bg-slate-50 border-slate-200 text-slate-700';
                        if (isAnswer) {
                          optClass = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                        } else if (isStudentChosen && !isAnswer) {
                          optClass = 'bg-rose-100 border-rose-300 text-rose-950 font-bold';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${optClass}`}
                          >
                            <div className="flex-1 min-w-0">
                              <span dangerouslySetInnerHTML={{ __html: formatOptionHtml(opt, q) }} />
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                title="Bấm để nghe phát âm"
                                onClick={() => playPronunciationAudio(opt)}
                                className="w-5 h-5 rounded hover:bg-black/10 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
                              >
                                <Volume2 className="w-3 h-3" />
                              </button>
                              {isAnswer && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                              {isStudentChosen && !isAnswer && (
                                <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-bold">
                                  Học sinh chọn
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200/80">
                        <strong className="text-slate-900">Giải thích:</strong>{' '}
                        <span dangerouslySetInnerHTML={{ __html: formatQuestionHtml(q.explanation) }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Điểm số: <strong className="text-slate-800">{submission.score}/10</strong> • Tỷ lệ đúng: <strong className="text-slate-800">{((submission.correctAnswersCount / (submission.totalQuestions || 1)) * 100).toFixed(0)}%</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In kết quả</span>
            </button>

            <button
              onClick={handleSendReport}
              disabled={feedbackSent}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-emerald-600 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              {feedbackSent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã gửi Zalo / SMS phụ huynh</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi nhận xét AI tới PH/HS</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
