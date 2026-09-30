import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Check, 
  Calendar, 
  Clock, 
  Shuffle, 
  ShieldCheck, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  Layers, 
  AlertCircle 
} from 'lucide-react';
import { ClassItem, ExamItem, AssignmentConfig } from '../types';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  exams: ExamItem[];
  selectedExam?: ExamItem | null;
  onAssignSuccess: (config: AssignmentConfig) => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  isOpen,
  onClose,
  classes,
  exams,
  selectedExam,
  onAssignSuccess,
}) => {
  const [examId, setExamId] = useState<string>(selectedExam?.id || (exams[0]?.id || ''));
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(classes.map(c => c.id));
  
  // Schedule settings
  const [deadlineDate, setDeadlineDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [deadlineTime, setDeadlineTime] = useState<string>('23:59');
  const [durationLimit, setDurationLimit] = useState<string>('45 phút');

  // Attempt limit settings: 0 = unlimited, 1 = once, 2 = twice, 3 = 3 times, or custom
  const [attemptPreset, setAttemptPreset] = useState<'1' | '2' | '3' | 'unlimited' | 'custom'>('1');
  const [customAttempts, setCustomAttempts] = useState<number>(5);
  const [scoringMethod, setScoringMethod] = useState<'highest' | 'latest' | 'first'>('highest');

  // Anti-cheating & security
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);
  const [preventCheating, setPreventCheating] = useState<boolean>(true);
  const [showSolutions, setShowSolutions] = useState<'always' | 'after_deadline' | 'score_only'>('always');

  // Sync when selectedExam changes
  useEffect(() => {
    if (selectedExam) {
      setExamId(selectedExam.id);
      if (selectedExam.maxAttempts !== undefined) {
        if (selectedExam.maxAttempts === 0) setAttemptPreset('unlimited');
        else if (selectedExam.maxAttempts === 1) setAttemptPreset('1');
        else if (selectedExam.maxAttempts === 2) setAttemptPreset('2');
        else if (selectedExam.maxAttempts === 3) setAttemptPreset('3');
        else {
          setAttemptPreset('custom');
          setCustomAttempts(selectedExam.maxAttempts);
        }
      }
      if (selectedExam.scoringMethod) {
        setScoringMethod(selectedExam.scoringMethod);
      }
      if (selectedExam.durationLimit) {
        setDurationLimit(selectedExam.durationLimit);
      } else if (selectedExam.duration) {
        setDurationLimit(selectedExam.duration);
      }
      if (selectedExam.preventCheating !== undefined) {
        setPreventCheating(selectedExam.preventCheating);
      }
      if (selectedExam.shuffleQuestions !== undefined) {
        setShuffleQuestions(selectedExam.shuffleQuestions);
      }
      if (selectedExam.shuffleOptions !== undefined) {
        setShuffleOptions(selectedExam.shuffleOptions);
      }
    }
  }, [selectedExam, isOpen]);

  if (!isOpen) return null;

  const currentExam = exams.find(e => e.id === examId) || selectedExam || exams[0];

  const calculatedMaxAttempts = 
    attemptPreset === 'unlimited' ? 0 :
    attemptPreset === '1' ? 1 :
    attemptPreset === '2' ? 2 :
    attemptPreset === '3' ? 3 :
    Math.max(1, customAttempts || 1);

  const toggleClass = (id: string) => {
    if (selectedClassIds.includes(id)) {
      if (selectedClassIds.length === 1) return; // Keep at least one
      setSelectedClassIds(selectedClassIds.filter(cId => cId !== id));
    } else {
      setSelectedClassIds([...selectedClassIds, id]);
    }
  };

  const handleSelectAllClasses = () => {
    if (selectedClassIds.length === classes.length) {
      setSelectedClassIds(classes.length > 0 ? [classes[0].id] : []);
    } else {
      setSelectedClassIds(classes.map(c => c.id));
    }
  };

  const handleConfirm = () => {
    const chosenClassNames = classes
      .filter(c => selectedClassIds.includes(c.id))
      .map(c => c.name);

    onAssignSuccess({
      examId: currentExam?.id || examId,
      examTitle: currentExam?.title || 'Bộ đề tiếng Anh',
      classIds: selectedClassIds,
      classNames: chosenClassNames,
      deadline: deadlineDate,
      deadlineTime: deadlineTime,
      durationLimit: durationLimit,
      maxAttempts: calculatedMaxAttempts,
      scoringMethod: scoringMethod,
      shuffleQuestions: shuffleQuestions,
      shuffleOptions: shuffleOptions,
      preventCheating: preventCheating,
      showSolutions: showSolutions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Giao bài tập & Đề thi cho học sinh</h3>
              <p className="text-xs text-slate-500 font-normal">Thiết lập lớp nhận bài, số lần làm bài và quy định kiểm tra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs overflow-y-auto scrollbar-thin">
          
          {/* Exam Selection Card */}
          <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Bộ đề kiểm tra được phát hành</span>
              </label>
              {currentExam && (
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                  {currentExam.grade} • {currentExam.questionsCount || currentExam.questions?.length || 0} câu
                </span>
              )}
            </div>

            <select
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} — ({ex.grade} • {ex.questionsCount || ex.questions?.length || 0} câu • {ex.duration})
                </option>
              ))}
            </select>
          </div>

          {/* Classes Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lớp nhận bài ({selectedClassIds.length}/{classes.length} lớp được chọn)</span>
              </label>
              {classes.length > 1 && (
                <button
                  type="button"
                  onClick={handleSelectAllClasses}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  {selectedClassIds.length === classes.length ? 'Bỏ chọn bớt' : 'Chọn tất cả'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {classes.length === 0 ? (
                <div className="col-span-2 text-center py-4 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  Chưa có lớp học nào. Vui lòng tạo lớp học trước khi giao bài.
                </div>
              ) : (
                classes.map(cls => {
                  const checked = selectedClassIds.includes(cls.id);
                  return (
                    <label
                      key={cls.id}
                      onClick={() => toggleClass(cls.id)}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition select-none ${
                        checked
                          ? 'border-blue-500 bg-blue-50/70 shadow-2xs text-blue-950 ring-1 ring-blue-400'
                          : 'border-slate-200 bg-white hover:bg-slate-50/90 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{cls.name}</div>
                          <div className="text-slate-500 text-[11px] truncate">
                            {cls.studentsCount} học sinh • PIN: <span className="font-mono font-bold text-blue-700">{cls.pin}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 flex-shrink-0">
                        {cls.grade}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* CÀI ĐẶT SỐ LẦN HỌC SINH ĐƯỢC LÀM BÀI (ATTEMPTS SETTING)       */}
          {/* ============================================================== */}
          <div className="p-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/40 via-white to-slate-50/50 space-y-3.5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-blue-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-blue-950 uppercase tracking-wide">
                    Số lần học sinh được làm bài (Lượt làm bài)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Quyết định số lượt nộp bài tối đa của mỗi học sinh cho bộ đề này
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                {calculatedMaxAttempts === 0
                  ? 'Luyện tập tự do (∞)'
                  : calculatedMaxAttempts === 1
                  ? 'Chế độ Thi / Kiểm tra (1 lần)'
                  : `Tối đa ${calculatedMaxAttempts} lần`}
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* Option 1: 1 Lần */}
              <button
                type="button"
                onClick={() => setAttemptPreset('1')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  attemptPreset === '1'
                    ? 'border-amber-500 bg-amber-50/90 ring-2 ring-amber-400 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">1 lần duy nhất</span>
                  {attemptPreset === '1' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  )}
                </div>
                <div className="text-[10px] text-amber-800 font-semibold mt-1">
                  Kiểm tra / Thi chính thức
                </div>
              </button>

              {/* Option 2: 2 Lần */}
              <button
                type="button"
                onClick={() => setAttemptPreset('2')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  attemptPreset === '2'
                    ? 'border-blue-500 bg-blue-50/90 ring-2 ring-blue-400 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">Tối đa 2 lần</span>
                  {attemptPreset === '2' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Cho phép sửa sai 1 lần
                </div>
              </button>

              {/* Option 3: 3 Lần */}
              <button
                type="button"
                onClick={() => setAttemptPreset('3')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  attemptPreset === '3'
                    ? 'border-blue-500 bg-blue-50/90 ring-2 ring-blue-400 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">Tối đa 3 lần</span>
                  {attemptPreset === '3' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Củng cố & nâng điểm
                </div>
              </button>

              {/* Option 4: Không giới hạn */}
              <button
                type="button"
                onClick={() => setAttemptPreset('unlimited')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  attemptPreset === 'unlimited'
                    ? 'border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-400 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">Không giới hạn</span>
                  {attemptPreset === 'unlimited' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                  Luyện tập tự do (∞)
                </div>
              </button>

              {/* Option 5: Tùy chỉnh */}
              <button
                type="button"
                onClick={() => setAttemptPreset('custom')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  attemptPreset === 'custom'
                    ? 'border-purple-500 bg-purple-50/90 ring-2 ring-purple-400 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">Tùy chỉnh số lần</span>
                  {attemptPreset === 'custom' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  )}
                </div>
                <div className="text-[10px] text-purple-700 font-semibold mt-1">
                  Nhập số cụ thể
                </div>
              </button>
            </div>

            {/* Custom Attempts Input (if custom chosen) */}
            {attemptPreset === 'custom' && (
              <div className="flex items-center gap-3 bg-purple-50/70 p-3 rounded-xl border border-purple-200 animate-in fade-in duration-100">
                <span className="text-purple-900 font-bold text-xs">Số lần học sinh được làm:</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={customAttempts}
                  onChange={(e) => setCustomAttempts(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-center font-black text-sm bg-white border border-purple-300 rounded-lg p-1.5 text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-purple-700 font-medium text-xs">lần nộp bài</span>
              </div>
            )}

            {/* Notice / Banner according to Attempt selection */}
            {attemptPreset === '1' ? (
              <div className="p-3 bg-amber-50/90 border border-amber-300/80 rounded-xl flex items-start gap-2.5 text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="font-bold">Chế độ thi cử / Kiểm tra 1 lần:</strong> Học sinh chỉ được nộp bài <strong>1 lần duy nhất</strong>. Sau khi nộp, hệ thống sẽ tự động khóa nút làm lại và ghi nhận điểm số chính thức vào sổ điểm lớp.
                </div>
              </div>
            ) : (
              /* Scoring Method Selection when multiple attempts allowed */
              <div className="p-3 bg-white/90 rounded-xl border border-slate-200/90 space-y-2">
                <label className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                  Quy tắc ghi nhận điểm số khi học sinh làm nhiều lần:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    onClick={() => setScoringMethod('highest')}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 transition ${
                      scoringMethod === 'highest'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scoringMethod"
                      checked={scoringMethod === 'highest'}
                      onChange={() => {}}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-[11px]">
                      <div className="font-bold">Điểm cao nhất</div>
                      <div className="text-[10px] text-slate-500 font-normal">Khuyên dùng (động viên)</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setScoringMethod('latest')}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 transition ${
                      scoringMethod === 'latest'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scoringMethod"
                      checked={scoringMethod === 'latest'}
                      onChange={() => {}}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-[11px]">
                      <div className="font-bold">Lần làm cuối cùng</div>
                      <div className="text-[10px] text-slate-500 font-normal">Ghi nhận tiến độ mới nhất</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setScoringMethod('first')}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 transition ${
                      scoringMethod === 'first'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scoringMethod"
                      checked={scoringMethod === 'first'}
                      onChange={() => {}}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-[11px]">
                      <div className="font-bold">Lần làm đầu tiên</div>
                      <div className="text-[10px] text-slate-500 font-normal">Tính điểm thực chất lần 1</div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Deadline & Duration Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Hạn chót hoàn thành</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="col-span-3 text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="col-span-2 text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Thời gian đếm ngược làm bài</span>
              </label>
              <select
                value={durationLimit}
                onChange={(e) => setDurationLimit(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="15 phút">15 phút (Kiểm tra 15p nhanh)</option>
                <option value="20 phút">20 phút (Kiểm tra giữa tiết)</option>
                <option value="30 phút">30 phút (Luyện tập)</option>
                <option value="45 phút">45 phút (Kiểm tra 1 tiết)</option>
                <option value="50 phút">50 phút (Chuẩn đề TN THPT)</option>
                <option value="60 phút">60 phút (Đề thi thử THPT)</option>
                <option value="90 phút">90 phút (Kiểm tra học kỳ / Đề chuyên)</option>
                <option value="Không giới hạn">Không giới hạn thời gian</option>
              </select>
            </div>
          </div>

          {/* Options: Anti-cheating & Solutions visibility */}
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quy định giám sát & Hiển thị kết quả</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-800 font-semibold text-xs">Đảo thứ tự câu hỏi</span>
                </div>
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-purple-600" />
                  <span className="text-slate-800 font-semibold text-xs">Đảo đáp án A-D</span>
                </div>
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-800 font-semibold text-xs">Giám sát rời tab thi</span>
                </div>
                <input
                  type="checkbox"
                  checked={preventCheating}
                  onChange={(e) => setPreventCheating(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            <div>
              <label className="block text-slate-600 font-medium text-[11px] mb-1">
                Hiển thị đáp án & lời giải chi tiết:
              </label>
              <select
                value={showSolutions}
                onChange={(e) => setShowSolutions(e.target.value as any)}
                className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="always">Hiển thị điểm số & lời giải chi tiết ngay sau khi nộp</option>
                <option value="after_deadline">Chỉ hiển thị điểm trước, mở lời giải sau khi hết hạn nộp</option>
                <option value="score_only">Chỉ hiển thị điểm số (giấu hoàn toàn lời giải để chống lộ đề)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            {selectedClassIds.length} lớp • {calculatedMaxAttempts === 1 ? 'Chỉ làm 1 lần' : calculatedMaxAttempts === 0 ? 'Không giới hạn' : `Tối đa ${calculatedMaxAttempts} lần`}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={classes.length === 0 || selectedClassIds.length === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
                classes.length === 0 || selectedClassIds.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-500/25'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Xác nhận phát hành đề</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
