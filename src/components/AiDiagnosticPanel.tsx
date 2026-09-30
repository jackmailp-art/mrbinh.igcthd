import React from 'react';
import {
  Brain,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { ExamQuestion } from '../types';

interface AiDiagnosticPanelProps {
  questions: ExamQuestion[];
  answers: Record<number, string>;
  score: number;
  studentName?: string;
}

interface GroupedError {
  topic: string;
  trapType: string;
  questionNumbers: number[];
  questions: {
    question: ExamQuestion;
    chosenOption: string;
    correctOption: string;
    whyWrong: string;
    explanation: string;
    remedialRule: string;
  }[];
}

export const AiDiagnosticPanel: React.FC<AiDiagnosticPanelProps> = ({
  questions,
  answers,
  score,
  studentName = 'Học sinh',
}) => {
  // Analyze wrong questions
  const wrongQuestionsData: {
    question: ExamQuestion;
    chosenOption: string;
    correctOption: string;
    whyWrong: string;
    explanation: string;
    remedialRule: string;
    topic: string;
    trapType: string;
  }[] = [];

  questions.forEach((q) => {
    const chosen = answers[q.num];
    const isCorrect = chosen && q.answer && q.answer.trim().startsWith(chosen.slice(0, 2));

    if (!isCorrect) {
      // Find misconception explanation
      const chosenLetter = chosen ? chosen.slice(0, 2) : 'Chưa chọn';
      const matchedMisconception = q.misconceptions?.find(
        (m) => m.option.slice(0, 2) === chosenLetter
      );

      const whyWrong = matchedMisconception?.whyWrong ||
        (chosen
          ? `Em đã chọn đáp án (${chosenLetter}), nhưng phương án này không phù hợp với cấu trúc ngữ pháp và ngữ cảnh câu.`
          : 'Em đã bỏ trống câu này, chưa chọn đáp án.');

      const remedialRule = q.remediation?.coreRule ||
        (q.grammarPoint
          ? `Ghi nhớ quy tắc cốt lõi về "${q.grammarPoint}": Luôn kiểm tra chủ ngữ chính, dấu hiệu nhận biết thì và các đại từ bổ trợ.`
          : 'Xem lại dấu hiệu nhận biết và cấu trúc câu trước khi chọn phương án trắc nghiệm.');

      const topic = q.grammarPoint ||
        (q.question.toLowerCase().includes('pronounced') || q.question.toLowerCase().includes('stress')
          ? 'Quy tắc Ngữ âm & Trọng âm'
          : q.question.toLowerCase().includes('which') || q.question.toLowerCase().includes('who') || q.question.toLowerCase().includes('whom') || q.question.toLowerCase().includes('whose')
          ? 'Mệnh đề quan hệ & Đại từ quan hệ'
          : 'Cấu trúc Thì & Hòa hợp Chủ - Vị');

      const trapType = matchedMisconception?.trapType || 'Bẫy cấu trúc ngữ pháp';

      wrongQuestionsData.push({
        question: q,
        chosenOption: chosen || 'Chưa trả lời',
        correctOption: q.answer,
        whyWrong,
        explanation: q.explanation || 'Đáp án đúng dựa trên quy tắc ngữ pháp tiêu chuẩn.',
        remedialRule,
        topic,
        trapType,
      });
    }
  });

  // Group by topic
  const groupedErrors: Record<string, GroupedError> = {};
  wrongQuestionsData.forEach((item) => {
    if (!groupedErrors[item.topic]) {
      groupedErrors[item.topic] = {
        topic: item.topic,
        trapType: item.trapType,
        questionNumbers: [],
        questions: [],
      };
    }
    groupedErrors[item.topic].questionNumbers.push(item.question.num);
    groupedErrors[item.topic].questions.push({
      question: item.question,
      chosenOption: item.chosenOption,
      correctOption: item.correctOption,
      whyWrong: item.whyWrong,
      explanation: item.explanation,
      remedialRule: item.remedialRule,
    });
  });

  const errorGroups = Object.values(groupedErrors);
  const correctCount = questions.length - wrongQuestionsData.length;

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <Brain className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 bg-white/10 px-2 py-0.5 rounded-md">
                  Chẩn đoán AI sư phạm
                </span>
                <span className="text-xs text-indigo-200">
                  Phân tích bài làm của {studentName}
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight mt-0.5">
                Báo Cáo Điểm Mù Kiến Thức & Giải Pháp Củng Cố
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-indigo-200 uppercase font-semibold">Điểm số</div>
              <div className="text-lg font-black text-white">{score.toFixed(1)} / 10</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-indigo-200 uppercase font-semibold">Đúng / Tổng</div>
              <div className="text-lg font-black text-emerald-300">
                {correctCount} / {questions.length}
              </div>
            </div>
          </div>
        </div>

        {/* AI Performance Evaluation */}
        <div className="mt-4 pt-3.5 border-t border-white/10 flex items-start gap-2.5 text-xs text-indigo-100 leading-relaxed">
          <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
          <div>
            {score >= 9.0 ? (
              <p>
                <strong className="text-amber-300 font-bold">Xuất sắc:</strong> Học sinh nắm rất vững các chủ điểm ngữ pháp trọng tâm, phản xạ từ vựng và cấu trúc tốt. Tiếp tục duy trì phong độ và thử sức với các bộ đề phân loại nâng cao!
              </p>
            ) : score >= 7.0 ? (
              <p>
                <strong className="text-amber-300 font-bold">Khá tốt:</strong> Học sinh nắm được nền tảng cơ bản, nhưng vẫn còn mắc bẫy ở các câu hỏi phân hóa hoặc các thì hoàn thành. Hãy tập trung ôn các câu sai bên dưới.
              </p>
            ) : score >= 5.0 ? (
              <p>
                <strong className="text-amber-300 font-bold">Cần bổ trợ trọng tâm:</strong> Học sinh có lỗ hổng ngữ pháp ở các dạng câu phức và quy tắc biến đổi. Cần xem kỹ từng lời giải thích và quy tắc ghi nhớ bên dưới.
              </p>
            ) : (
              <p>
                <strong className="text-rose-300 font-bold">Cảnh báo hổng kiến thức:</strong> Học sinh chưa nắm chắc các quy tắc cơ bản. Khuyến nghị ôn tập lại toàn bộ lý thuyết theo từng nhóm chủ điểm đã phân tích.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Body: Grouped Errors Breakdown */}
      <div className="p-5 md:p-6 space-y-6">
        {errorGroups.length === 0 ? (
          <div className="text-center py-10 space-y-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-emerald-900">
              Hoàn hảo! Không có câu trả lời sai nào!
            </h4>
            <p className="text-xs text-emerald-700 max-w-md mx-auto">
              Em đã hoàn thành chính xác 100% tất cả các câu hỏi trong bài kiểm tra này. Hãy tiếp tục phát huy ở các bài thi tiếp theo!
            </p>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Phát hiện {errorGroups.length} nhóm chủ điểm cần củng cố ngay:
                  </h4>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {wrongQuestionsData.length} câu làm sai
                </span>
              </div>

              {/* Grouped Topics Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {errorGroups.map((grp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-rose-200/90 bg-rose-50/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-100 px-2 py-0.5 rounded">
                        Lỗi: {grp.trapType}
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-800">
                        {grp.questionNumbers.map(n => `Câu ${n}`).join(', ')}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-800">
                      {grp.topic}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {grp.questions[0].whyWrong}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Question-by-Question Diagnostic */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Chi tiết phân tích sư phạm từng câu làm sai:</span>
              </h4>

              <div className="space-y-4">
                {wrongQuestionsData.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 md:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3.5 transition hover:border-slate-300"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                            Câu {item.question.num}
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            Chủ điểm: {item.topic}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-slate-900 mt-1 leading-snug">
                          {item.question.question}
                        </p>
                      </div>
                    </div>

                    {/* Answer Comparison Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Student's Choice */}
                      <div className="p-3 rounded-xl border border-rose-300 bg-rose-50/80 text-rose-950 flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-rose-800 text-[11px]">
                            Phương án em đã chọn (Sai):
                          </span>
                          <span className="font-semibold">{item.chosenOption}</span>
                        </div>
                      </div>

                      {/* Correct Choice */}
                      <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/80 text-emerald-950 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-emerald-800 text-[11px]">
                            Đáp án đúng của Thầy Bình:
                          </span>
                          <span className="font-bold">{item.correctOption}</span>
                        </div>
                      </div>
                    </div>

                    {/* Misconception Analysis */}
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-950">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Tại sao phương án em chọn chưa chính xác? (Misconception):</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900/90 pl-5">
                        {item.whyWrong}
                      </p>
                    </div>

                    {/* Pedagogical Explanation */}
                    <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-950">
                      <div className="font-bold text-blue-900 flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-blue-600" />
                        <span>Lời giải thích sư phạm chi tiết:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-blue-900/90 pl-5">
                        {item.explanation}
                      </p>
                    </div>

                    {/* Micro-Remediation Rule */}
                    <div className="p-3 bg-emerald-50/90 border border-emerald-300/80 rounded-xl text-xs space-y-1 text-emerald-950">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Quy tắc ghi nhớ nhanh để không tái phạm (Remedial Rule):</span>
                      </div>
                      <p className="text-[11px] font-semibold leading-relaxed text-emerald-900 pl-5">
                        {item.remedialRule}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
