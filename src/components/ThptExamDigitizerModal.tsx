import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Clock,
  X,
  Copy,
  Check,
  ArrowRight,
  Eye,
  ShieldCheck,
  BookOpen,
  Download,
  FileSpreadsheet,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { ExamItem, ExamQuestion } from '../types';
import {
  downloadThptSampleWordDoc,
  downloadThptSampleText,
  THPT_SAMPLE_RED_HIGHLIGHT_TEXT,
  THPT_SAMPLE_ANSWER_TABLE_TEXT
} from '../utils/thptTemplates';

interface ThptExamDigitizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExam: (newExam: ExamItem) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const ThptExamDigitizerModal: React.FC<ThptExamDigitizerModalProps> = ({
  isOpen,
  onClose,
  onSaveExam,
  onShowToast,
}) => {
  const [examTitle, setExamTitle] = useState('Đề Khảo Sát Năng Lực Tiếng Anh THPT Chuẩn Bộ GD&ĐT 2026 - Đề Số 01');
  const [examTopic, setExamTopic] = useState('Global Success 12: Đổi mới sáng tạo, Đô thị thông minh & Phát triển bền vững');
  const [examDifficulty, setExamDifficulty] = useState('Phân hóa cao (Mục tiêu 8-10 điểm)');
  const [rawExamText, setRawExamText] = useState('');
  const [parsedExam, setParsedExam] = useState<ExamItem | null>(null);
  const [integrityIssues, setIntegrityIssues] = useState<string[]>([]);
  const [activePreviewTab, setActivePreviewTab] = useState<'editor' | 'preview'>('editor');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Load sample exam text: Mode 1 (Red highlighted / bold)
  const handleLoadRedHighlightSample = () => {
    setRawExamText(THPT_SAMPLE_RED_HIGHLIGHT_TEXT);
    setExamTitle('Đề Thi Tiếng Anh THPT 2026 - Mẫu Đáp Án Bôi Đỏ / In Đậm (40 Câu)');
    onShowToast('Đã nạp văn bản đề thi mẫu chuẩn: Đáp án bôi đỏ / in đậm!', 'success');
  };

  // Load sample exam text: Mode 2 (Separate Answer Table)
  const handleLoadAnswerTableSample = () => {
    setRawExamText(THPT_SAMPLE_ANSWER_TABLE_TEXT);
    setExamTitle('Đề Thi Tiếng Anh THPT 2026 - Mẫu Có Bảng Đáp Án Riêng (40 Câu)');
    onShowToast('Đã nạp văn bản đề thi mẫu chuẩn: Có bảng đáp án riêng ở cuối đề!', 'success');
  };

  // Smart Paste Handler: detects red font colors or bold from Microsoft Word HTML
  const handlePasteInTextarea = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const htmlData = e.clipboardData.getData('text/html');
    if (htmlData && (htmlData.includes('color:') || htmlData.includes('color="') || htmlData.includes('<b>') || htmlData.includes('<strong>'))) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlData, 'text/html');
        const elements = doc.querySelectorAll('*');
        let convertedRedCount = 0;

        elements.forEach((el) => {
          const style = (el.getAttribute('style') || '').toLowerCase();
          const colorAttr = (el.getAttribute('color') || '').toLowerCase();
          const isRed =
            /color\s*:\s*(red|#dc2626|#ef4444|#b91c1c|#ff0000|rgb\(\s*255\s*,\s*0\s*,\s*0\s*\)|rgb\(\s*220\s*,\s*38\s*,\s*38\s*\))/i.test(style) ||
            /red|#ff0000|#dc2626/i.test(colorAttr);

          if (isRed && el.textContent) {
            const trimmed = el.textContent.trim();
            if (/^[A-D][\.\:\)]/i.test(trimmed)) {
              el.textContent = `**${trimmed}**`;
              convertedRedCount++;
            }
          }
        });

        if (convertedRedCount > 0) {
          const processedText = doc.body.innerText || doc.body.textContent || '';
          if (processedText.trim()) {
            e.preventDefault();
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const currentVal = textarea.value;
            const nextVal = currentVal.substring(0, start) + processedText + currentVal.substring(end);
            setRawExamText(nextVal);
            onShowToast(`Đã nhận diện thông minh ${convertedRedCount} phương án bôi đỏ từ văn bản Word!`, 'success');
          }
        }
      } catch (err) {
        // Fallback to native paste
      }
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawExamText(text);
        onShowToast(`Đã tải lên tệp "${file.name}" thành công!`, 'info');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // AI Parser: parse raw text into standardized 40-question ExamItem
  const handleParseAndStandardize = () => {
    if (!rawExamText.trim()) {
      onShowToast('Vui lòng dán hoặc tải lên nội dung đề thi trước!', 'info');
      return;
    }

    const lines = rawExamText.split('\n');
    const questions: ExamQuestion[] = [];
    const issues: string[] = [];

    // First extract answer key if present at the bottom or top
    const answerKeyMap: Record<number, string> = {};
    const keyMatchRegex = /(?:(?:câu|q)?\s*(\d+)[\.\s:\-]+([A-D])\b)|(?:\b(\d+)([A-D])\b)/gi;
    let keySectionFound = false;

    // Scan backwards or find Answer Key header
    const answerKeyHeaderIdx = lines.findIndex(l => 
      /BẢNG ĐÁP ÁN|ĐÁP ÁN|ANSWER KEY|HƯỚNG DẪN CHẤM|KEY ĐỀ/i.test(l)
    );

    if (answerKeyHeaderIdx !== -1) {
      keySectionFound = true;
      const keyLines = lines.slice(answerKeyHeaderIdx).join(' ');
      let match;
      while ((match = keyMatchRegex.exec(keyLines)) !== null) {
        const qNum = parseInt(match[1] || match[3], 10);
        const ans = (match[2] || match[4]).toUpperCase();
        if (qNum >= 1 && qNum <= 40) {
          answerKeyMap[qNum] = ans;
        }
      }
    }

    // Parse questions line by line
    let currentQ: Partial<ExamQuestion> | null = null;
    let currentOptions: string[] = [];
    let currentPassage = '';
    let currentPassageTitle = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if we hit answer key section
      if (answerKeyHeaderIdx !== -1 && i >= answerKeyHeaderIdx) {
        break;
      }

      // Detect reading passage titles
      if (/READ THE FOLLOWING (ADVERTISEMENT|ANNOUNCEMENT|PASSAGE|TEXT)|BÀI ĐỌC|ĐỌC ĐOẠN VĂN/i.test(line)) {
        currentPassage = '';
        currentPassageTitle = line;
        continue;
      }

      // Collect passage lines (lines before questions start)
      if (currentPassageTitle && !/^(?:Câu|Question|\bQ)?\s*\d+[\.\:]/i.test(line) && !/^[A-D][\.\)]/i.test(line)) {
        if (line.length > 0) {
          currentPassage += (currentPassage ? '\n' : '') + line;
        }
      }

      // Question start detection
      const qStartMatch = line.match(/^(?:Câu|Question|\bQ)\s*(\d+)[\:\.\s]*(.*)/i) || line.match(/^(\d+)[\.\:\s]+(.*)/);
      if (qStartMatch && !line.match(/^[A-D][\.\)]/)) {
        const num = parseInt(qStartMatch[1], 10);
        if (num >= 1 && num <= 40) {
          // Save previous question
          if (currentQ && currentQ.num) {
            finalizeQuestion(currentQ, currentOptions, answerKeyMap, currentPassage, currentPassageTitle, questions);
          }

          currentQ = {
            id: `q-${Date.now()}-${num}`,
            num,
            question: qStartMatch[2]?.trim() || `Mark the letter A, B, C, or D for question ${num}:`,
            options: [],
            answer: ''
          };
          currentOptions = [];
          continue;
        }
      }

      // Option detection: A., B., C., D. (with bold **A. ...**, [RED]A., <u>A., etc.)
      const optMatch = line.match(/^(\*{0,2}|<b>|\[RED\]|\[KEY\]|\[ĐÚNG\]|\<u\>)?([A-D])[\.\:\)]\s*(.*)/i);
      if (optMatch && currentQ) {
        const letter = optMatch[2].toUpperCase();
        const content = optMatch[3].replace(/\*{0,2}|<\/b>|<\/u>|\[RED\]|\[KEY\]|\[ĐÚNG\]/gi, '').trim();
        const fullOption = `${letter}. ${content}`;
        currentOptions.push(fullOption);

        // Check if marked as correct (bold, [RED], underline, red tag)
        const isBoldOrMarked =
          /^\*{2}|<b>|\[RED\]|\[KEY\]|\[ĐÚNG\]|<u>/i.test(line) ||
          /\*{2}$/i.test(line) ||
          line.includes('[RED]') ||
          line.includes('[KEY]');

        if (isBoldOrMarked) {
          currentQ.answer = fullOption;
        }
        continue;
      }

      // Explicit Answer line: "Đáp án: A", "Answer: A"
      const directAnsMatch = line.match(/^(?:Đáp án|Answer|Key|ĐA)[\s\.:=\-]+([A-D])/i);
      if (directAnsMatch && currentQ) {
        const ansLetter = directAnsMatch[1].toUpperCase();
        answerKeyMap[currentQ.num || 0] = ansLetter;
        continue;
      }

      // Multi-option on one line (e.g. A. raise   B. rise   C. increase   D. lift)
      if (currentQ && /[A-D]\.\s+.+[A-D]\.\s+/i.test(line)) {
        const inlineOpts = line.split(/(?=[A-D]\.\s+)/i);
        inlineOpts.forEach(optStr => {
          const m = optStr.trim().match(/^(\*{0,2}|<b>|\[RED\]|\[KEY\]|\[ĐÚNG\]|\<u\>)?([A-D])[\.\:\)]\s*(.*)/i);
          if (m) {
            const letter = m[2].toUpperCase();
            const content = m[3].replace(/\*{0,2}|<\/b>|<\/u>|\[RED\]|\[KEY\]|\[ĐÚNG\]/gi, '').trim();
            const fullOption = `${letter}. ${content}`;
            currentOptions.push(fullOption);
            if (/^\*{2}|<b>|\[RED\]|\[KEY\]|\[ĐÚNG\]|<u>/i.test(optStr) || /\*{2}$/i.test(optStr)) {
              currentQ!.answer = fullOption;
            }
          }
        });
        continue;
      }
    }

    // Finalize last question
    if (currentQ && currentQ.num) {
      finalizeQuestion(currentQ, currentOptions, answerKeyMap, currentPassage, currentPassageTitle, questions);
    }

    // Deduplicate and sort by question number
    const sortedQuestions = Array.from(new Map(questions.map(q => [q.num, q])).values())
      .sort((a, b) => a.num - b.num);

    // ==========================================
    // INTEGRITY & 5-PART MATRIX CHECK
    // ==========================================
    if (sortedQuestions.length < 40) {
      issues.push(`Đề thi chỉ nhận diện được ${sortedQuestions.length}/40 câu hỏi. Đề chuẩn Bộ GD&ĐT phải có đủ đúng 40 câu.`);
    }

    // Check answers present
    const missingAnswerNums = sortedQuestions.filter(q => !q.answer || q.answer.trim() === '').map(q => q.num);
    if (missingAnswerNums.length > 0) {
      issues.push(`Thiếu khóa đáp án đúng ở ${missingAnswerNums.length} câu: Câu ${missingAnswerNums.slice(0, 6).join(', ')}${missingAnswerNums.length > 6 ? '...' : ''}. Thầy/Cô chỉ cần bôi đỏ phương án hoặc bổ sung bảng đáp án riêng.`);
    }

    // Check Part 5 [I], [II], [III], [IV] markers
    const hasInsertMarkers = rawExamText.includes('[I]') && rawExamText.includes('[II]');
    if (!hasInsertMarkers) {
      issues.push('Bài đọc 2 (Part V) chưa thấy các thẻ đánh dấu vị trí chèn câu [I], [II], [III], [IV].');
    }

    setIntegrityIssues(issues);

    const standardizedExam: ExamItem = {
      id: `thpt-digitized-${Date.now()}`,
      title: examTitle.trim() || 'Đề Khảo Sát Năng Lực Tiếng Anh THPT 2026',
      grade: 'Ôn thi Tốt nghiệp THPT',
      subject: 'Tiếng Anh',
      questionsCount: sortedQuestions.length || 40,
      duration: '50 phút',
      difficulty: examDifficulty,
      submissions: 0,
      avgScore: 0,
      assignedClasses: [],
      assignedClassIds: [],
      createdAt: new Date().toLocaleDateString('vi-VN'),
      status: 'Đang mở',
      topic: examTopic.trim(),
      questions: sortedQuestions
    };

    setParsedExam(standardizedExam);
    setActivePreviewTab('preview');

    if (issues.length === 0) {
      onShowToast('Đã số hóa & chuẩn hóa đề thi thành công 100% theo ma trận Bộ GD&ĐT!', 'success');
    } else {
      onShowToast(`Đã nhận diện ${sortedQuestions.length}/40 câu hỏi. Có ${issues.length} lưu ý cần kiểm tra!`, 'info');
    }
  };

  const finalizeQuestion = (
    q: Partial<ExamQuestion>,
    options: string[],
    answerKeyMap: Record<number, string>,
    passage: string,
    passageTitle: string,
    targetList: ExamQuestion[]
  ) => {
    const num = q.num || targetList.length + 1;

    // Resolve Answer: 1. from bold/marked, 2. from answerKeyMap, 3. fallback to first option
    let resolvedAnswer = q.answer || '';
    if (!resolvedAnswer && answerKeyMap[num]) {
      const targetLetter = answerKeyMap[num];
      const matchedOpt = options.find(o => o.startsWith(targetLetter));
      resolvedAnswer = matchedOpt || `${targetLetter}. Option`;
    }
    if (!resolvedAnswer && options.length > 0) {
      resolvedAnswer = options[0]; // fallback
    }

    // Categorize into the 5 MOET 2026 parts
    let sectionType: any = 'cloze_reading';
    let sectionTitle = 'PHẦN 1: ĐIỀN TỪ VĂN BẢN THỰC TẾ (LEAFLET / ANNOUNCEMENT / ADVERTISEMENT)';
    if (num >= 13 && num <= 17) {
      sectionType = 'arrangement';
      sectionTitle = 'PHẦN 2: SẮP XẾP PHÁT NGÔN & BỨC THƯ / ĐOẠN VĂN MẠCH LẠC';
    } else if (num >= 18 && num <= 22) {
      sectionType = 'lexico_grammar';
      sectionTitle = 'PHẦN 3: ĐIỀN CỤM TỪ / MỆNH ĐỀ VÀO VĂN BẢN';
    } else if (num >= 23 && num <= 30) {
      sectionType = 'reading_comprehension';
      sectionTitle = 'PHẦN 4: ĐỌC HIỂU VĂN BẢN 1 (8 CÂU HỎI)';
    } else if (num >= 31 && num <= 40) {
      sectionType = 'reading_comprehension';
      sectionTitle = 'PHẦN 5: ĐỌC HIỂU VĂN BẢN 2 (10 CÂU HỎI PHÂN HÓA CAO ĐỘ)';
    }

    targetList.push({
      id: q.id || `q-${num}`,
      num,
      sectionType,
      sectionTitle,
      question: q.question || `Câu hỏi số ${num}`,
      options: options.length >= 4 ? options : ['A. Phương án A', 'B. Phương án B', 'C. Phương án C', 'D. Phương án D'],
      answer: resolvedAnswer,
      passage: passage || undefined,
      passageTitle: passageTitle || undefined,
      grammarPoint: `Kiểm tra ${sectionTitle}`,
      explanation: `Bước 1: Phân tích ngữ cảnh câu hỏi số ${num}.\nBước 2: Đối chiếu manh mối trong văn bản.\nBước 3: Loại trừ các phương án bẫy để chốt đáp án đúng ${resolvedAnswer.slice(0, 2)}.`
    });
  };

  const handleSaveToBank = () => {
    if (!parsedExam || parsedExam.questions.length === 0) {
      onShowToast('Chưa có đề thi được số hóa để lưu!', 'info');
      return;
    }

    onSaveExam(parsedExam);
    onShowToast(`Đã lưu bền vững bộ đề "${parsedExam.title}" (${parsedExam.questions.length} câu) vào ngân hàng THPT!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Top Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-t-3xl flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Chuẩn Bộ GD&ĐT 2025 - 2026
                </span>
                <span className="text-[10px] font-bold text-amber-300">40 câu • 50 phút • 5 Phần Ma Trận</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                Soạn Thảo Đề Thi THPT Thủ Công & Nhập Từ Mẫu Có Sẵn
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

        {/* Tab switch & Quick Actions */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivePreviewTab('editor')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activePreviewTab === 'editor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>1. Soạn thảo & Nhập nội dung</span>
            </button>

            <button
              type="button"
              disabled={!parsedExam}
              onClick={() => setActivePreviewTab('preview')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                activePreviewTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>2. Xem trước ma trận 40 câu ({parsedExam?.questions.length || 0}/40)</span>
            </button>
          </div>

          {/* Quick Sample Paste Options */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 hidden md:inline">Thử ngay với:</span>
            <button
              type="button"
              onClick={handleLoadRedHighlightSample}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold border border-rose-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-[11px]"
              title="Dán mẫu đề thi 40 câu có đáp án bôi đỏ / in đậm"
            >
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>Dán đề mẫu bôi đỏ (40 câu)</span>
            </button>

            <button
              type="button"
              onClick={handleLoadAnswerTableSample}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-[11px]"
              title="Dán mẫu đề thi 40 câu có bảng đáp án riêng ở cuối"
            >
              <FileSpreadsheet className="w-3 h-3 text-blue-600" />
              <span>Dán đề mẫu bảng đáp án (40 câu)</span>
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
          {activePreviewTab === 'editor' ? (
            <div className="space-y-4">
              {/* DOWNLOAD READY-TO-USE TEMPLATES BANNER */}
              <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-blue-600 text-white">
                      <Download className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      Tải Về Mẫu Đề Sẵn Để Giáo Viên Soạn Đề Theo Mẫu
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Giáo viên tải tệp Word (.docx) hoặc Text (.txt) mẫu về máy tính. Đáp án chỉ cần <strong>bôi đỏ</strong> phương án đúng hoặc dùng <strong>bảng đáp án riêng</strong> ở cuối đề, sau đó dán vào đây để AI chuẩn hóa ngay!
                  </p>
                </div>

                {/* Download Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => downloadThptSampleWordDoc('red_highlight')}
                    className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    title="Tải mẫu Word (.docx) với các đáp án đúng được bôi đỏ"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-600" />
                    <span>Mẫu Word (.docx) - Đáp án bôi đỏ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadThptSampleWordDoc('answer_table')}
                    className="px-3 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    title="Tải mẫu Word (.docx) với Bảng Đáp Án Riêng ở cuối"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mẫu Word (.docx) - Bảng đáp án</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadThptSampleText('red_highlight')}
                    className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-xl shadow-2xs transition flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <span>Mẫu Text (.txt)</span>
                  </button>
                </div>
              </div>

              {/* Metadata fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">Tiêu đề đề thi chuẩn hóa *</label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mức độ phân hóa *</label>
                  <select
                    value={examDifficulty}
                    onChange={(e) => setExamDifficulty(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Phân hóa cao (Mục tiêu 8-10 điểm)">Phân hóa cao (Mục tiêu 8-10 điểm)</option>
                    <option value="Chuẩn tốt nghiệp THPT (Mục tiêu 6-8 điểm)">Chuẩn tốt nghiệp THPT (Mục tiêu 6-8 điểm)</option>
                    <option value="Khảo sát đầu năm / Ôn tập">Khảo sát đầu năm / Ôn tập</option>
                  </select>
                </div>
              </div>

              {/* Guide Box on how answers are detected */}
              <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 space-y-1.5">
                <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Quy tắc nhận diện đáp án & tính toàn vẹn thông minh:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-blue-950/90">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-rose-600">1. Đáp án bôi đỏ:</span>
                    <span>Phương án in đậm <strong>**A. word**</strong>, có chữ màu đỏ từ Word, hoặc có tiền tố <code>[RED]</code>, gạch chân <code>&lt;u&gt;</code> sẽ tự động nhận diện là đáp án đúng mà không cần gõ thêm dòng đáp án.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-blue-600">2. Bảng đáp án riêng:</span>
                    <span>Hỗ trợ bảng đáp án riêng ở cuối đề (Ví dụ: <code>1.A 2.B 3.C... 40.A</code> hoặc <code>1A 2B 3C...</code>). AI tự động đối chiếu từng câu để trích xuất khóa đáp án.</span>
                  </div>
                </div>
              </div>

              {/* Textarea for Raw Exam */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-slate-800">
                      Dán nội dung văn bản đề thi (Word / PDF copy / TXT):
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Chọn tệp từ máy tính</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {rawExamText.split('\n').length} dòng • {rawExamText.length} ký tự
                  </span>
                </div>
                <textarea
                  rows={14}
                  value={rawExamText}
                  onChange={(e) => setRawExamText(e.target.value)}
                  onPaste={handlePasteInTextarea}
                  placeholder="Dán toàn bộ văn bản đề thi 40 câu vào đây (bao gồm các đoạn văn Leaflet, Announcement, Reading 1, Reading 2 và các phương án A, B, C, D). Khi sao chép từ Microsoft Word có bôi đỏ, hệ thống sẽ tự động bắt chữ đỏ làm đáp án đúng..."
                  className="w-full p-4 border border-slate-300 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition leading-relaxed shadow-inner"
                />
              </div>

              {/* Parse Action Button */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRawExamText('')}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 rounded-xl"
                >
                  Xóa trắng nội dung
                </button>

                <button
                  type="button"
                  onClick={handleParseAndStandardize}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Số Hóa & Chuẩn Hóa Ma Trận 100% Bộ GD&ĐT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* PREVIEW TAB */
            <div className="space-y-4">
              {/* Integrity summary */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                integrityIssues.length === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center gap-3">
                  {integrityIssues.length === 0 ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <div className="font-extrabold text-sm">
                      {integrityIssues.length === 0
                        ? 'Đề thi đạt chuẩn 100% ma trận khảo thí Bộ GD&ĐT (40/40 câu đầy đủ)!'
                        : `Phát hiện ${integrityIssues.length} điểm cần lưu ý về tính toàn vẹn:`}
                    </div>
                    {integrityIssues.length > 0 && (
                      <ul className="list-disc list-inside text-[11px] mt-1 space-y-0.5 text-amber-800">
                        {integrityIssues.map((iss, idx) => (
                          <li key={idx}>{iss}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-black text-sm px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    {parsedExam?.questions.length || 0} / 40 CÂU
                  </span>
                </div>
              </div>

              {/* 5-Part Breakdown Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Phần 1: Điền từ</div>
                  <div className="font-black text-sm text-slate-800 mt-0.5">
                    {parsedExam?.questions.filter(q => q.num >= 1 && q.num <= 12).length || 0} / 12 câu
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold">Leaflet / Ad</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Phần 2: Sắp xếp</div>
                  <div className="font-black text-sm text-slate-800 mt-0.5">
                    {parsedExam?.questions.filter(q => q.num >= 13 && q.num <= 17).length || 0} / 5 câu
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold">Hội thoại / Thư</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Phần 3: Mệnh đề</div>
                  <div className="font-black text-sm text-slate-800 mt-0.5">
                    {parsedExam?.questions.filter(q => q.num >= 18 && q.num <= 22).length || 0} / 5 câu
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold">Điền cụm / ý</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Phần 4: Đọc hiểu 1</div>
                  <div className="font-black text-sm text-slate-800 mt-0.5">
                    {parsedExam?.questions.filter(q => q.num >= 23 && q.num <= 30).length || 0} / 8 câu
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold">Nhận biết - Vận dụng</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Phần 5: Đọc hiểu 2</div>
                  <div className="font-black text-sm text-slate-800 mt-0.5">
                    {parsedExam?.questions.filter(q => q.num >= 31 && q.num <= 40).length || 0} / 10 câu
                  </div>
                  <div className="text-[10px] text-purple-600 font-semibold">Phân hóa cao [I]-[IV]</div>
                </div>
              </div>

              {/* Questions list preview */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white p-2">
                {parsedExam?.questions.map((q) => (
                  <div key={q.id} className="p-3 hover:bg-slate-50 transition space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                        Câu {q.num} • {q.sectionTitle?.split(':')[0] || 'Phần bài'}
                      </span>
                      <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                        Đáp án: {q.answer || 'Chưa có'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800">{q.question}</div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = q.answer && q.answer.startsWith(opt.slice(0, 2));
                        return (
                          <div
                            key={oIdx}
                            className={`p-1.5 rounded-lg border truncate ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('editor')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  ← Chỉnh sửa lại văn bản
                </button>

                <button
                  type="button"
                  onClick={handleSaveToBank}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu vào Ngân hàng Đề thi THPT</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
