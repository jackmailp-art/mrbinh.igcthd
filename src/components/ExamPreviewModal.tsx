import React, { useState } from 'react';
import {
  X,
  FileText,
  Clock,
  Award,
  CheckCircle2,
  Share2,
  Printer,
  Send,
  Eye,
  Check,
  AlertCircle,
  Lightbulb,
  BookOpen,
  Layers,
  PenTool,
  Volume2,
  ListOrdered,
  Shuffle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ExamItem } from '../types';
import { AudioPlayerControl } from './AudioPlayerControl';
import { formatQuestionHtml, formatOptionHtml, formatPassageHtml } from '../utils/examFormatters';
import {
  toggleShuffleQuestionOrder,
  toggleShuffleAnswerOptions,
  reshuffleExam,
  resetExamShuffle
} from '../services/examService';

interface ExamPreviewModalProps {
  exam: ExamItem | null;
  onClose: () => void;
  onAssignExam: (exam: ExamItem) => void;
  onUpdateExam?: (exam: ExamItem) => void;
}

export const ExamPreviewModal: React.FC<ExamPreviewModalProps> = ({
  exam,
  onClose,
  onAssignExam,
  onUpdateExam,
}) => {
  const [showAnswers, setShowAnswers] = useState(true);
  const [copied, setCopied] = useState(false);
  const [currentExam, setCurrentExam] = useState<ExamItem | null>(exam);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    setCurrentExam(exam);
  }, [exam]);

  if (!currentExam) return null;

  const showQuickToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleShuffleQuestions = () => {
    if (!currentExam) return;
    const updated = toggleShuffleQuestionOrder(currentExam);
    setCurrentExam(updated);
    onUpdateExam?.(updated);
    showQuickToast(
      updated.shuffleQuestions
        ? '🔀 Đã bật xáo trộn thứ tự câu hỏi!'
        : '↩️ Đã khôi phục thứ tự câu gốc!'
    );
  };

  const handleToggleShuffleOptions = () => {
    if (!currentExam) return;
    const updated = toggleShuffleAnswerOptions(currentExam);
    setCurrentExam(updated);
    onUpdateExam?.(updated);
    showQuickToast(
      updated.shuffleOptions
        ? '🔀 Đã xáo trộn phương án đáp án A-B-C-D!'
        : '↩️ Đã khôi phục đáp án gốc!'
    );
  };

  const handleReshuffle = () => {
    if (!currentExam) return;
    const updated = reshuffleExam(currentExam);
    setCurrentExam(updated);
    onUpdateExam?.(updated);
    showQuickToast('🎲 Đã tạo biến thể xáo trộn ngẫu nhiên mới!');
  };

  const handleResetShuffle = () => {
    if (!currentExam) return;
    const updated = resetExamShuffle(currentExam);
    setCurrentExam(updated);
    onUpdateExam?.(updated);
    showQuickToast('🔄 Đã đưa đề thi về cấu trúc nguyên bản!');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {currentExam.grade}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {currentExam.questionsCount || currentExam.questions?.length || 0} câu • Thời gian: {currentExam.duration}
                </span>
                {currentExam.difficulty && (
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    {currentExam.difficulty}
                  </span>
                )}
                {/* Active Shuffle Badges */}
                {currentExam.shuffleQuestions && (
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                    <Shuffle className="w-2.5 h-2.5" /> Đảo câu hỏi: BẬT
                  </span>
                )}
                {currentExam.shuffleOptions && (
                  <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-300">
                    <Shuffle className="w-2.5 h-2.5" /> Đảo A-D: BẬT
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-base text-slate-900 mt-0.5">
                {currentExam.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar with Shuffle Controls */}
        <div className="px-5 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className={`px-3 py-1.5 rounded-xl border font-semibold transition cursor-pointer ${
                showAnswers
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {showAnswers ? 'Ẩn đáp án & giải thích' : 'Hiện đáp án & giải thích'}
            </button>

            {/* Visual separator */}
            <div className="h-5 w-px bg-slate-300 hidden sm:block" />

            {/* Shuffle Questions Toggle */}
            <button
              type="button"
              onClick={handleToggleShuffleQuestions}
              title="Bật/Tắt xáo trộn thứ tự các câu hỏi trong đề"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition cursor-pointer active:scale-95 ${
                currentExam.shuffleQuestions
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Đảo thứ tự câu</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider ${
                  currentExam.shuffleQuestions
                    ? 'bg-white text-emerald-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentExam.shuffleQuestions ? 'BẬT' : 'TẮT'}
              </span>
            </button>

            {/* Shuffle Answer Options Toggle */}
            <button
              type="button"
              onClick={handleToggleShuffleOptions}
              title="Bật/Tắt xáo trộn vị trí các phương án A-B-C-D"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition cursor-pointer active:scale-95 ${
                currentExam.shuffleOptions
                  ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Đảo đáp án A-D</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider ${
                  currentExam.shuffleOptions
                    ? 'bg-white text-purple-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentExam.shuffleOptions ? 'BẬT' : 'TẮT'}
              </span>
            </button>

            {/* Quick Reshuffle button if any shuffle is active */}
            {(currentExam.shuffleQuestions || currentExam.shuffleOptions) && (
              <button
                type="button"
                onClick={handleReshuffle}
                title="Tạo biến thể đảo ngẫu nhiên khác ngay lập tức"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold transition cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Đảo lại</span>
              </button>
            )}

            {/* Reset button if any shuffle is active */}
            {(currentExam.shuffleQuestions || currentExam.shuffleOptions) && (
              <button
                type="button"
                onClick={handleResetShuffle}
                title="Khôi phục thứ tự và đáp án nguyên bản"
                className="px-2 py-1.5 text-slate-500 hover:text-slate-800 text-[11px] underline underline-offset-2 transition cursor-pointer"
              >
                Khôi phục gốc
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép link' : 'Chia sẻ đề'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In đề</span>
            </button>
          </div>
        </div>

        {/* Live Toast banner inside modal */}
        {toastMessage && (
          <div className="mx-6 mt-3 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-1">
            <span>{toastMessage}</span>
            <span className="text-[10px] text-slate-400 font-normal">Cập nhật tức thì trên giao diện</span>
          </div>
        )}

        {/* Question List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Listening Audio Track Player (Teacher Preview) */}
          {(currentExam.audioScript || currentExam.questions?.some(q => q.sectionType === 'listening' || q.audioScript)) && (
            <div className="mb-2">
              <AudioPlayerControl
                audioScript={
                  currentExam.audioScript ||
                  currentExam.questions?.find(q => q.audioScript)?.audioScript ||
                  ''
                }
                audioUrl={currentExam.audioUrl || currentExam.questions?.find(q => q.audioUrl)?.audioUrl}
                audioTitle={currentExam.audioTitle || 'Phần nghe hiểu (Listening Track)'}
                maxPlays={currentExam.listeningMaxPlays || 2}
                isTeacher={true}
                isSubmitted={true}
              />
            </div>
          )}

          {currentExam.questions && currentExam.questions.length > 0 ? (
            currentExam.questions.map((q, idx) => {
              const prevQ = idx > 0 ? currentExam.questions[idx - 1] : null;
              const showSectionDivider = !prevQ || prevQ.sectionTitle !== q.sectionTitle;

              return (
                <div key={q.id || idx} className="space-y-2">
                  {/* Section Divider */}
                  {showSectionDivider && q.sectionTitle && (
                    <div className="pt-2 pb-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 rounded-lg text-xs font-bold border border-blue-200">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        <span>{q.sectionTitle}</span>
                      </div>
                    </div>
                  )}

                  {/* Passage if present */}
                  {q.passage && (!prevQ || prevQ.passage !== q.passage) && (
                    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs">
                      <div className="font-extrabold text-amber-950 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-700" />
                          <span>
                            {q.passageTitle ? `Đoạn văn đọc: ${q.passageTitle}` : 'Đoạn văn đọc (Passage):'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                          Từ khóa & từ in đậm đã được đánh dấu
                        </span>
                      </div>
                      <div
                        className="text-slate-800 leading-relaxed font-serif text-sm bg-white/90 p-4 rounded-xl border border-amber-200/60 whitespace-pre-line shadow-inner max-h-[300px] overflow-y-auto reading-passage-scroll"
                        dangerouslySetInnerHTML={{
                          __html: formatPassageHtml(
                            q.passage,
                            exam?.questions.filter((it) => it.passage === q.passage)
                          ),
                        }}
                      />
                    </div>
                  )}

                  {/* Question Container */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs">
                    <div className="font-bold text-slate-900 text-sm flex items-start justify-between">
                      <div>
                        <span className="text-blue-700 mr-1.5 font-bold">Câu {q.num || idx + 1}:</span>
                        <span dangerouslySetInnerHTML={{ __html: formatQuestionHtml(q.question) }} />
                      </div>
                      {q.grammarPoint && (
                        <span className="text-[10px] font-semibold bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
                          {q.grammarPoint}
                        </span>
                      )}
                    </div>

                    {/* Arrangement Items */}
                    {q.arrangementItems && q.arrangementItems.length > 0 && (
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-xs space-y-1">
                        {q.arrangementItems.map((item, aIdx) => (
                          <div key={aIdx} className="text-slate-700">{item}</div>
                        ))}
                      </div>
                    )}

                    {/* Original Sentence for transformation */}
                    {q.originalSentence && (
                      <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs">
                        <span className="text-slate-500 font-semibold">Câu gốc: </span>
                        <span className="text-slate-900 font-bold">{q.originalSentence}</span>
                        {q.sentenceBeginning && (
                          <div className="text-blue-700 font-semibold mt-0.5">
                            Bắt đầu bằng: {q.sentenceBeginning}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Essay Prompt */}
                    {q.essayPrompt && (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                        <div className="font-bold text-emerald-900">
                          Đề bài: {q.essayPrompt.topic} ({q.essayPrompt.minWords}-{q.essayPrompt.maxWords} từ)
                        </div>
                        {q.essayPrompt.suggestedPoints && (
                          <div className="text-[11px] text-emerald-800">
                            {q.essayPrompt.suggestedPoints.map((pt, pIdx) => (
                              <div key={pIdx}>• {pt}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Multiple-choice options if available */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = showAnswers && q.answer && q.answer.trim().startsWith(opt.slice(0, 2));
                          return (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg border font-medium ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <span dangerouslySetInnerHTML={{ __html: formatOptionHtml(opt, q) }} />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Answers and Pedagogy */}
                    {showAnswers && (
                      <div className="mt-2.5 space-y-2">
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-emerald-800 text-xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>Đáp án đúng: </span>
                            <span className="font-extrabold" dangerouslySetInnerHTML={{ __html: formatOptionHtml(q.answer, q) }} />
                          </div>

                          {q.alternativeAnswers && q.alternativeAnswers.length > 0 && (
                            <div className="text-[11px] text-emerald-900/90 pt-1">
                              <strong>Các đáp án tương đương hợp lệ: </strong>
                              {q.alternativeAnswers.join(' / ')}
                            </div>
                          )}

                          {q.ipaTranscription && (
                            <div className="text-[11px] font-mono text-indigo-900">
                              <strong>Phiên âm IPA: </strong> {q.ipaTranscription}
                            </div>
                          )}

                          {q.explanation && (
                            <div className="text-[11px] text-emerald-950/90 leading-relaxed">
                              <strong>Giải thích sư phạm: </strong> {q.explanation}
                            </div>
                          )}
                        </div>

                        {/* Essay Rubric */}
                        {q.rubric && (
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <PenTool className="w-3.5 h-3.5 text-blue-600" />
                              <span>AI Grading Rubric (Thang điểm {q.rubric.totalMaxScore}đ):</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {q.rubric.criteria.map((cr, cIdx) => (
                                <div key={cIdx} className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                                  <div className="font-bold text-slate-800 flex justify-between">
                                    <span>{cr.criterion}</span>
                                    <span className="text-blue-600">{cr.maxScore}đ</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500">{cr.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {q.misconceptions && q.misconceptions.length > 0 && (
                          <div className="p-2.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-[11px] space-y-1 text-amber-950">
                            <div className="font-bold text-amber-900 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Chẩn đoán Điểm mù & Lỗi nhầm lẫn (Misconceptions):</span>
                            </div>
                            <div className="space-y-0.5 pl-1">
                              {q.misconceptions.map((m, mIdx) => (
                                <div key={mIdx} className="leading-relaxed">
                                  <span className="font-semibold text-amber-800">• Khi chọn {m.option}:</span>{' '}
                                  <span className="text-slate-700">{m.whyWrong}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {q.remediation && (
                          <div className="p-2.5 bg-indigo-50/90 border border-indigo-200/80 rounded-xl text-[11px] space-y-0.5 text-indigo-950">
                            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Gợi ý củng cố tức thì (Micro-remediation):</span>
                            </div>
                            {q.remediation.coreRule && (
                              <div className="pl-1">
                                • <strong>Quy tắc cốt lõi:</strong> {q.remediation.coreRule}
                              </div>
                            )}
                            {q.remediation.counterExample && (
                              <div className="pl-1">
                                • <strong>Ví dụ phản chứng:</strong> {q.remediation.counterExample}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Đề thi chưa có câu hỏi chi tiết. Hãy sử dụng tính năng "Tạo đề bằng AI" để sinh câu hỏi tự động.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Đóng xem trước
          </button>

          <button
            onClick={() => {
              onAssignExam(currentExam);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-md active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Giao đề thi này cho lớp</span>
          </button>
        </div>

      </div>
    </div>
  );
};
