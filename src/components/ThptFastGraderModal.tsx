import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Target,
  Brain,
  HelpCircle,
  Lightbulb,
  FileText,
  User,
  X,
  Share2
} from 'lucide-react';
import { ExamItem, ExamQuestion } from '../types';

interface ThptFastGraderModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExam: ExamItem;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

interface GradedResult {
  studentName: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  part1Score: number; // /12
  part2Score: number; // /5
  part3Score: number; // /5
  part4Score: number; // /8
  part5Score: number; // /10
  weakestSkill: string;
  trapType: string;
  mistakes: Array<{
    num: number;
    question: string;
    chosen: string;
    correct: string;
    whyWrong: string;
    evidence: string;
    grammarPoint: string;
  }>;
  reviewTopics: string[];
  remedialDrills: Array<{
    id: string;
    question: string;
    options: string[];
    answer: string;
    explanation: string;
    userSelected?: string;
    isCorrect?: boolean;
  }>;
}

export const ThptFastGraderModal: React.FC<ThptFastGraderModalProps> = ({
  isOpen,
  onClose,
  activeExam,
  onShowToast,
}) => {
  const [studentName, setStudentName] = useState('');
  const [answerString, setAnswerString] = useState('');
  const [result, setResult] = useState<GradedResult | null>(null);
  const [remedialAnswers, setRemedialAnswers] = useState<Record<string, string>>({});
  const [copiedReport, setCopiedReport] = useState(false);

  if (!isOpen) return null;

  // Load sample student submission string for testing
  const loadSampleAnswers = (type: 'good' | 'medium' | 'weak' = 'medium') => {
    const list = activeExam.questions || [];
    const tokens: string[] = [];

    list.forEach((q, idx) => {
      const correctLetter = (q.answer || 'A').trim().slice(0, 1).toUpperCase();
      const allLetters = ['A', 'B', 'C', 'D'];
      const wrongLetters = allLetters.filter(l => l !== correctLetter);

      let chosen = correctLetter;
      if (type === 'weak') {
        chosen = idx % 2 === 0 ? wrongLetters[idx % wrongLetters.length] : correctLetter;
      } else if (type === 'medium') {
        chosen = (idx + 1) % 4 === 0 || idx === 13 || idx === 20 || idx === 31 || idx === 36
          ? wrongLetters[idx % wrongLetters.length]
          : correctLetter;
      } else {
        chosen = idx === 35 ? wrongLetters[0] : correctLetter;
      }

      tokens.push(`${q.num}${chosen}`);
    });

    setAnswerString(tokens.join(', '));
    onShowToast(`Đã nạp chuỗi đáp án mẫu (${tokens.length} câu)!`, 'info');
  };

  // Grade student answers & generate personalized diagnosis
  const handleGradeAndDiagnose = () => {
    if (!answerString.trim()) {
      onShowToast('Vui lòng dán hoặc nhập chuỗi đáp án học sinh!', 'info');
      return;
    }

    const questions = activeExam.questions || [];
    if (questions.length === 0) {
      onShowToast('Đề thi chưa có câu hỏi!', 'info');
      return;
    }

    // Parse answers from string: e.g. "1A, 2B, 3D" or "1.A 2.B" or "1A 2B 3D"
    const parsedMap: Record<number, string> = {};
    const regex = /(\d+)[\.\s:\-]*([A-D])/gi;
    let match;
    while ((match = regex.exec(answerString)) !== null) {
      const qNum = parseInt(match[1], 10);
      const chosenLetter = match[2].toUpperCase();
      parsedMap[qNum] = chosenLetter;
    }

    // If student just typed sequence of letters without numbers (e.g. "A B D C A B...")
    if (Object.keys(parsedMap).length < 5) {
      const letterSeq = answerString.replace(/[^A-Za-z]/g, '').toUpperCase().split('');
      if (letterSeq.length >= 10) {
        letterSeq.forEach((letter, i) => {
          if (['A', 'B', 'C', 'D'].includes(letter)) {
            parsedMap[i + 1] = letter;
          }
        });
      }
    }

    if (Object.keys(parsedMap).length === 0) {
      onShowToast('Không nhận diện được định dạng đáp án. Ví dụ hợp lệ: 1A, 2B, 3D, 4C...', 'info');
      return;
    }

    let correctCount = 0;
    let part1Score = 0; // Q1-12
    let part2Score = 0; // Q13-17
    let part3Score = 0; // Q18-22
    let part4Score = 0; // Q23-30
    let part5Score = 0; // Q31-40

    const mistakes: GradedResult['mistakes'] = [];

    questions.forEach((q) => {
      const correctLetter = (q.answer || 'A').trim().slice(0, 1).toUpperCase();
      const chosenLetter = parsedMap[q.num] || 'CHƯA LÀM';
      const isCorrect = chosenLetter === correctLetter;

      if (isCorrect) {
        correctCount++;
        if (q.num >= 1 && q.num <= 12) part1Score++;
        else if (q.num >= 13 && q.num <= 17) part2Score++;
        else if (q.num >= 18 && q.num <= 22) part3Score++;
        else if (q.num >= 23 && q.num <= 30) part4Score++;
        else if (q.num >= 31 && q.num <= 40) part5Score++;
      } else {
        // Detailed mistake diagnostics
        const chosenFull = q.options?.find(o => o.startsWith(chosenLetter)) || `Phương án ${chosenLetter}`;
        const correctFull = q.options?.find(o => o.startsWith(correctLetter)) || q.answer;

        let whyWrong = `Học sinh chọn (${chosenLetter}) do nhầm lẫn ngữ cảnh hoặc bẫy từ đồng nghĩa chưa trọn vẹn so với đáp án đúng.`;
        if (q.num >= 13 && q.num <= 17) {
          whyWrong = `Học sinh chọn (${chosenLetter}) do chưa nhận diện được đại từ liên kết mở đầu (First, Secondly) hoặc trật tự logic của câu chào/kết thư.`;
        } else if (q.num >= 18 && q.num <= 22) {
          whyWrong = `Học sinh chọn (${chosenLetter}) do vi phạm cấu trúc ngữ pháp rút gọn mệnh đề phân từ (V-ing / V3) hoặc giới từ đi kèm.`;
        } else if (q.num >= 31 && q.num <= 40) {
          whyWrong = `Học sinh chọn (${chosenLetter}) do đọc lướt qua bẫy suy luận hoặc bỏ sót manh mối tương phản quan trọng (However, Although) trong đoạn văn 2.`;
        }

        const evidence = q.passage
          ? `Trích dẫn đoạn văn: "...${q.passage.slice(0, 160).replace(/\n/g, ' ')}..."`
          : `Đối chiếu ngữ cảnh câu: "${q.question}"`;

        mistakes.push({
          num: q.num,
          question: q.question,
          chosen: `${chosenLetter}. (${chosenFull.replace(/^[A-D][\.\:\)]\s*/, '')})`,
          correct: `${correctLetter}. (${correctFull.replace(/^[A-D][\.\:\)]\s*/, '')})`,
          whyWrong,
          evidence,
          grammarPoint: q.grammarPoint || q.sectionTitle || 'Ngữ pháp & Từ vựng'
        });
      }
    });

    const totalQ = questions.length || 40;
    const score = +((correctCount / totalQ) * 10).toFixed(2);

    // AI Diagnosis on Weakest Pillar & Trap
    let weakestSkill = 'Kỹ năng Đọc hiểu suy luận & Vị trí chèn câu [I]-[IV]';
    let trapType = 'Bẫy từ đồng nghĩa gần đúng & đọc lướt bỏ qua chi tiết phủ định';

    const partPercentages = [
      { name: 'Điền từ văn bản ngắn (Leaflet/Ad)', pct: (part1Score / 12) * 100 },
      { name: 'Sắp xếp hội thoại/văn bản', pct: (part2Score / 5) * 100 },
      { name: 'Điền cụm từ/mệnh đề', pct: (part3Score / 5) * 100 },
      { name: 'Đọc hiểu văn bản 1 (8 câu)', pct: (part4Score / 8) * 100 },
      { name: 'Đọc hiểu văn bản 2 (10 câu phân hóa)', pct: (part5Score / 10) * 100 },
    ];
    partPercentages.sort((a, b) => a.pct - b.pct);
    weakestSkill = partPercentages[0].name;

    if (weakestSkill.includes('Sắp xếp')) {
      trapType = 'Tư duy liên kết câu: Nhầm lẫn câu mở đầu chủ đề với câu phân tích chi tiết';
    } else if (weakestSkill.includes('Điền cụm từ')) {
      trapType = 'Bẫy ngữ pháp: Nhầm lẫn giữa mệnh đề độc lập và mệnh đề phụ thuộc rút gọn';
    } else if (weakestSkill.includes('Điền từ')) {
      trapType = 'Collocations & Từ loại: Dịch thô từng từ thay vì nhận diện cụm cố định trong SGK';
    }

    // Action plan topics
    const reviewTopics = [
      `Chuyên đề 1: Củng cố "${weakestSkill}" trong SGK Global Success 12`,
      `Chuyên đề 2: Kỹ năng phân tích bẫy ${trapType.toLowerCase()}`,
      `Chuyên đề 3: Luyện tập 2 bài đọc phân hóa 10 câu có vị trí chèn [I]-[IV] trước ngày thi`
    ];

    // Generate 2 Remedial Drill Questions immediately for the student
    const remedialDrills = [
      {
        id: 'drill-1',
        question: 'Mark the letter A, B, C, or D to indicate the correct word for the blank: "Secondary students should actively participate in campus projects to _______ their awareness of environmental preservation."',
        options: ['A. raise', 'B. rise', 'C. increase', 'D. lift'],
        answer: 'A. raise',
        explanation: 'Collocation chuẩn: "raise awareness of sth" (nâng cao nhận thức). "Rise" là nội động từ không có tân ngữ phía sau.'
      },
      {
        id: 'drill-2',
        question: 'Mark the letter A, B, C, or D to indicate the correct arrangement to make a meaningful letter:\na. First, working in teams improves our problem-solving skills.\nb. Dear Nam, I hope you are having a productive week.\nc. Consequently, I highly recommend joining the Green Youth Club.',
        options: ['A. a - b - c', 'B. b - a - c', 'C. c - b - a', 'D. b - c - a'],
        answer: 'B. b - a - c',
        explanation: 'Trật tự chuẩn: Lời chào mở đầu (b) -> Ý dẫn chứng đầu tiên "First" (a) -> Kết luận "Consequently" (c).'
      }
    ];

    setResult({
      studentName: studentName.trim() || 'Học sinh',
      score,
      correctCount,
      totalQuestions: totalQ,
      part1Score,
      part2Score,
      part3Score,
      part4Score,
      part5Score,
      weakestSkill,
      trapType,
      mistakes,
      reviewTopics,
      remedialDrills
    });

    onShowToast(`Đã chấm điểm & chẩn đoán AI xong cho ${studentName}: ${score}/10 điểm!`, 'success');
  };

  const handleSelectDrillOption = (drillId: string, opt: string) => {
    setRemedialAnswers(prev => ({ ...prev, [drillId]: opt }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-t-3xl flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  AI Chẩn Đoán & Chấm Điểm Nhanh
                </span>
                <span className="text-[10px] font-bold text-amber-300">Chuỗi 40 câu • 0.25đ/câu</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                Chấm Điểm & AI Phân Tích Cá Nhân Hóa Bài Làm Học Sinh
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {/* 1. INPUT FORM */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block font-bold text-slate-800 mb-1">Tên học sinh / Mã định danh:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An (Lớp 12A1)..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <span className="text-[11px] font-bold text-slate-500">Nạp mẫu nhanh:</span>
                <button
                  type="button"
                  onClick={() => loadSampleAnswers('good')}
                  className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg transition"
                >
                  Giỏi (9.5đ)
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleAnswers('medium')}
                  className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-lg transition"
                >
                  Khá (7.5đ)
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleAnswers('weak')}
                  className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg transition"
                >
                  Yếu (4.5đ)
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800">
                  Chuỗi đáp án học sinh làm bài (Dán chuỗi câu trả lời dạng <code>1A, 2B, 3D...</code> hoặc <code>1A 2B 3D...</code>):
                </label>
                <span className="text-[11px] text-slate-400">
                  Đối chiếu với đề: <strong>{activeExam.title}</strong>
                </span>
              </div>
              <textarea
                rows={3}
                value={answerString}
                onChange={(e) => setAnswerString(e.target.value)}
                placeholder="Ví dụ: 1A, 2B, 3C, 4A, 5C, 6B, 7A, 8B, 9B, 10B, 11A, 12A, 13B, 14B, 15A, 16A, 17B, 18A, 19A, 20B, 21A, 22A, 23A, 24B, 25B, 26C, 27C, 28D, 29A, 30C, 31C, 32B, 33A, 34B, 35C, 36B, 37A, 38A, 39A, 40A..."
                className="w-full p-3 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGradeAndDiagnose}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Chấm Điểm & Xuất Báo Cáo AI Chẩn Đoán Ngay</span>
              </button>
            </div>
          </div>

          {/* 2. GRADED RESULT & AI DIAGNOSTIC REPORT */}
          {result && (
            <div className="space-y-6 animate-in fade-in">
              {/* SECTION 1: TỔNG QUAN KẾT QUẢ */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-emerald-50/50 p-5 rounded-3xl border border-blue-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-blue-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                      {result.score}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                        1. TỔNG QUAN KẾT QUẢ BÀI LÀM
                      </div>
                      <h3 className="text-base font-black text-slate-900">
                        {result.studentName}
                      </h3>
                      <div className="text-[11px] text-slate-500">
                        Số câu đúng: <strong className="text-emerald-700 font-extrabold">{result.correctCount}/{result.totalQuestions} câu</strong> • Điểm chuẩn: <strong className="text-blue-700 font-extrabold">{result.score}/10 điểm</strong> (0.25đ/câu)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-xl font-black text-xs border ${
                      result.score >= 8.0
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : result.score >= 6.5
                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                        : result.score >= 5.0
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}>
                      {result.score >= 8.0 ? '🌟 Nhóm Giỏi - Xuất sắc' : result.score >= 6.5 ? '👍 Nhóm Khá' : result.score >= 5.0 ? '⚡ Nhóm Trung bình' : '⚠️ Nhóm Cần bồi dưỡng'}
                    </span>
                  </div>
                </div>

                {/* Phân bố điểm theo 5 dạng bài chuẩn Bộ GD&ĐT */}
                <div>
                  <div className="text-[11px] font-bold text-slate-600 mb-2">
                    Phân bố điểm theo 5 dạng bài ma trận chuẩn Bộ GD&ĐT:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-500 font-semibold truncate">Phần 1: Điền từ</div>
                      <div className="font-black text-sm text-slate-900 mt-0.5">{result.part1Score} / 12</div>
                      <div className="text-[10px] text-emerald-600 font-bold">{Math.round((result.part1Score / 12) * 100)}%</div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-500 font-semibold truncate">Phần 2: Sắp xếp</div>
                      <div className="font-black text-sm text-slate-900 mt-0.5">{result.part2Score} / 5</div>
                      <div className="text-[10px] text-emerald-600 font-bold">{Math.round((result.part2Score / 5) * 100)}%</div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-500 font-semibold truncate">Phần 3: Mệnh đề</div>
                      <div className="font-black text-sm text-slate-900 mt-0.5">{result.part3Score} / 5</div>
                      <div className="text-[10px] text-emerald-600 font-bold">{Math.round((result.part3Score / 5) * 100)}%</div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-500 font-semibold truncate">Phần 4: Đọc hiểu 1</div>
                      <div className="font-black text-sm text-slate-900 mt-0.5">{result.part4Score} / 8</div>
                      <div className="text-[10px] text-emerald-600 font-bold">{Math.round((result.part4Score / 8) * 100)}%</div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-500 font-semibold truncate">Phần 5: Đọc hiểu 2</div>
                      <div className="font-black text-sm text-slate-900 mt-0.5">{result.part5Score} / 10</div>
                      <div className="text-[10px] text-purple-600 font-bold">{Math.round((result.part5Score / 10) * 100)}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CHẨN ĐOÁN LỖ HỔNG (AI DIAGNOSIS) */}
              <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-200/90 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                  <Brain className="w-4 h-4 text-amber-600" />
                  <span>2. CHẨN ĐOÁN LỖ HỔNG KIẾN THỨC (AI DIAGNOSIS)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-2xl border border-amber-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Kỹ năng / Chủ điểm học sinh yếu nhất:</span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">{result.weakestSkill}</div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Tỷ lệ làm đúng ở phần này thấp hơn các phần còn lại, cho thấy học sinh còn lúng túng trong việc kết nối nghĩa logic của câu văn.
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-amber-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-amber-800 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-amber-600" />
                      <span>Bẫy tư duy thường mắc phải:</span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">{result.trapType}</div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Học sinh có thói quen đọc lướt qua cụm từ khóa hoặc nhầm lẫn giữa các phương án có mặt chữ gần giống nhau thay vì xét trọn vẹn ngữ cảnh.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: GIẢI THÍCH CHI TIẾT CÂU SAI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>3. GIẢI THÍCH CHI TIẾT CÁC CÂU CHỌN SAI ({result.mistakes.length} câu)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Phân tích nguyên nhân & trích dẫn dẫn chứng cụ thể
                  </span>
                </div>

                {result.mistakes.length === 0 ? (
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div className="font-bold text-emerald-900 text-sm">Tuyệt đối xuất sắc! Không có câu nào làm sai (40/40 câu đúng).</div>
                    <div className="text-xs text-emerald-700">Học sinh nắm vững trọn vẹn ma trận đề thi THPT Quốc gia 2026.</div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {result.mistakes.map((m) => (
                      <div key={m.num} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 text-xs">
                            Câu {m.num}: {m.grammarPoint}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                              Em chọn: {m.chosen}
                            </span>
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-black text-[11px]">
                              Đáp án đúng: {m.correct}
                            </span>
                          </div>
                        </div>

                        <div className="font-medium text-slate-800 text-xs">{m.question}</div>

                        <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80 space-y-1">
                          <div className="font-bold text-rose-900 text-[11px]">Lý do sai & bẫy tư duy:</div>
                          <p className="text-slate-700 text-xs leading-relaxed">{m.whyWrong}</p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-600">
                          <div className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                            <span>Dẫn chứng & Manh mối bài làm:</span>
                          </div>
                          <p className="text-xs font-mono text-slate-800 italic leading-relaxed">{m.evidence}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 4: KẾ HOẠCH CẢI THIỆN CÁ NHÂN (ACTION PLAN) */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-3xl border border-emerald-200/80 space-y-4">
                <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-xs uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  <span>4. KẾ HOẠCH CẢI THIỆN CÁ NHÂN & CÂU HỎI THỰC HÀNH KHẮC PHỤC NGAY</span>
                </div>

                {/* 2-3 topics */}
                <div className="space-y-1.5">
                  <div className="font-bold text-slate-700 text-xs">Đề xuất 3 chủ điểm kiến thức cần ôn tập lại:</div>
                  <div className="space-y-1">
                    {result.reviewTopics.map((top, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs font-semibold text-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{top}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2 Remedial Practice Questions */}
                <div className="space-y-3 pt-2">
                  <div className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Làm ngay 2 câu hỏi rèn luyện tương tự cùng cấu trúc để khắc phục lỗ hổng:</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.remedialDrills.map((drill, dIdx) => {
                      const selectedOpt = remedialAnswers[drill.id];
                      const isAnswered = Boolean(selectedOpt);
                      const isCorrect = selectedOpt && drill.answer.startsWith(selectedOpt.slice(0, 1));

                      return (
                        <div key={drill.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              Bài tập khắc phục #{dIdx + 1}
                            </span>
                            {isAnswered && (
                              <span className={`font-bold px-2 py-0.5 rounded ${
                                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {isCorrect ? '✓ Chính xác!' : '✗ Chưa đúng'}
                              </span>
                            )}
                          </div>

                          <div className="font-medium text-slate-800 text-xs leading-relaxed">{drill.question}</div>

                          <div className="grid grid-cols-2 gap-1.5">
                            {drill.options.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleSelectDrillOption(drill.id, opt)}
                                className={`p-2 rounded-xl text-left border text-xs font-medium transition cursor-pointer ${
                                  selectedOpt === opt
                                    ? opt.startsWith(drill.answer.slice(0, 1))
                                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                                      : 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>

                          {isAnswered && (
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                              <span className="font-bold text-slate-800">Giải thích: </span>
                              <span>{drill.explanation}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Action: Copy Report */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const reportText = `BÁO CÁO AI CHẨN ĐOÁN & CHẤM ĐIỂM BÀI LÀM THPT 2026
Học sinh: ${result.studentName}
Đề thi: ${activeExam.title}
Điểm số: ${result.score} / 10 điểm (Đúng: ${result.correctCount}/${result.totalQuestions} câu)
- Điền từ ngắn (Leaflet/Ad): ${result.part1Score}/12 câu
- Sắp xếp hội thoại/thư: ${result.part2Score}/5 câu
- Điền cụm từ/mệnh đề: ${result.part3Score}/5 câu
- Đọc hiểu 1: ${result.part4Score}/8 câu
- Đọc hiểu 2 (Phân hóa cao): ${result.part5Score}/10 câu

CHẨN ĐOÁN LỖ HỔNG (AI DIAGNOSIS):
- Kỹ năng yếu nhất: ${result.weakestSkill}
- Bẫy tư duy: ${result.trapType}

KẾ HOẠCH CẢI THIỆN:
${result.reviewTopics.map(t => `- ${t}`).join('\n')}`;

                    navigator.clipboard.writeText(reportText);
                    setCopiedReport(true);
                    setTimeout(() => setCopiedReport(false), 2000);
                    onShowToast('Đã sao chép toàn bộ báo cáo AI Chẩn đoán vào clipboard!', 'success');
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedReport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedReport ? 'Đã sao chép báo cáo' : 'Sao chép báo cáo gửi Zalo / SMS'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
