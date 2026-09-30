import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  FileText,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Eye,
  Check,
  RefreshCw,
  Copy,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Shuffle,
  Save,
  Clock,
  FolderOpen,
  ArrowRight,
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Image as ImageIcon,
  Table as TableIcon,
  CheckSquare,
  Filter,
  FileDown,
  ShieldCheck,
  RotateCcw,
  GripVertical,
  Code,
  FileSpreadsheet,
  Wrench,
  AlertCircle,
  HelpCircle,
  CheckCheck,
  FileCheck,
  Info,
  FileType
} from 'lucide-react';
import { ExamItem, ExamQuestion, ExamSectionType } from '../types';
import {
  downloadExcelTemplate,
  downloadThptWordTemplate,
  downloadDinhKyWordTemplate,
  THPT_SAMPLE_MOET_STANDARDIZED_TEXT,
  PERIODIC_EXAM_STANDARDIZED_TEXT,
  SAMPLE_EXAM_TEXT,
  parseRawExamText,
  parseExcelExamFile,
  extractDocxText,
  validateExamQuestions,
  shuffleExamQuestions,
  shuffleQuestionOptions,
  ParseResult,
  ValidationSummary
} from '../utils/manualExamParser';
import { exportExamToWord } from '../utils/exportExamDocs';
import { formatQuestionHtml } from '../utils/examFormatters';

interface ManualExamTabProps {
  grade: string;
  topic: string;
  difficulty: string;
  onExamParsed: (exam: ExamItem) => void;
  onSaveToBankDirectly?: (exam: ExamItem) => void;
  initialMode?: 'visual' | 'text' | 'file';
  onModeChange?: (mode: 'visual' | 'text' | 'file') => void;
}

type InputMode = 'visual' | 'text' | 'file';
type Step = 'input' | 'preview';

interface VisualQuestionDraft {
  id: string;
  num: number;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'reading_comprehension';
  sectionType: ExamSectionType;
  sectionTitle: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  passage?: string;
  passageTitle?: string;
}

export const ManualExamTab: React.FC<ManualExamTabProps> = ({
  grade,
  topic,
  difficulty,
  onExamParsed,
  onSaveToBankDirectly,
  initialMode = 'visual',
  onModeChange,
}) => {
  // Step state: 'input' or 'preview'
  const [step, setStep] = useState<Step>('input');

  // Input Mode state: 3 distinct modes
  const [inputMode, setInputMode] = useState<InputMode>(initialMode);

  useEffect(() => {
    if (initialMode && initialMode !== inputMode) {
      setInputMode(initialMode);
    }
  }, [initialMode]);

  const switchMode = (mode: InputMode) => {
    setInputMode(mode);
    onModeChange?.(mode);
  };

  // Exam Meta Parameters
  const [selectedGrade, setSelectedGrade] = useState<string>(grade || 'Khối 12');
  const [examTitle, setExamTitle] = useState<string>(() => {
    const today = new Date().toLocaleDateString('vi-VN');
    return `Đề Khảo Sát Tiếng Anh ${grade || 'Khối 12'} - ${topic || 'Soạn thảo thủ công'} (${today})`;
  });
  const [durationMin, setDurationMin] = useState<number>(45);
  const [maxAttempts, setMaxAttempts] = useState<number>(0); // 0 = unlimited, 1 = strict
  const [showAnswerAfterSubmit, setShowAnswerAfterSubmit] = useState<boolean>(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(difficulty || 'Medium');

  // Mode 1: Visual Editor Questions
  const [visualQuestions, setVisualQuestions] = useState<VisualQuestionDraft[]>([
    {
      id: 'v-q-1',
      num: 1,
      questionType: 'multiple_choice',
      sectionType: 'pronunciation',
      sectionTitle: 'PRONUNCIATION & STRESS',
      question: 'Choose the word whose underlined part is pronounced differently from the others:',
      options: ['A. decid<u>ed</u>', 'B. wait<u>ed</u>', 'C. watch<u>ed</u>', 'D. invit<u>ed</u>'],
      answer: 'C. watch<u>ed</u>',
      explanation: "Đuôi '-ed' trong 'watched' /wɒtʃt/ phát âm là /t/. Các từ còn lại phát âm là /ɪd/.",
    },
    {
      id: 'v-q-2',
      num: 2,
      questionType: 'multiple_choice',
      sectionType: 'lexico_grammar',
      sectionTitle: 'LEXICO & GRAMMAR',
      question: 'If I _______ his phone number, I would have invited him to my party yesterday.',
      options: ['A. had known', 'B. knew', 'C. know', 'D. have known'],
      answer: 'A. had known',
      explanation: 'Câu điều kiện loại 3 (trái ngược với quá khứ): If + S + had + V3/ed.',
    },
    {
      id: 'v-q-3',
      num: 3,
      questionType: 'true_false',
      sectionType: 'lexico_grammar',
      sectionTitle: 'LEXICO & GRAMMAR',
      question: 'In English, adjectives usually precede the noun they modify.',
      options: ['A. Đúng (True)', 'B. Sai (False)'],
      answer: 'A. Đúng (True)',
      explanation: 'Tính từ thường đứng trước danh từ để bổ nghĩa (ví dụ: a beautiful city).',
    }
  ]);

  // Drag and Drop State for Visual Editor
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Live rich preview toggle map for questions
  const [previewHtmlMap, setPreviewHtmlMap] = useState<Record<string, boolean>>({});

  // Image insertion modal/prompt state
  const [imageModalQuestionId, setImageModalQuestionId] = useState<string | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');

  // Mode 2: Smart Text / Regex Parser state
  const [rawText, setRawText] = useState<string>('');
  const [isAiParsing, setIsAiParsing] = useState<boolean>(false);
  const [showFormatGuide, setShowFormatGuide] = useState<boolean>(false);
  const [copiedSample, setCopiedSample] = useState<boolean>(false);

  // Mode 3: File Upload state
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('');
  const [isFileReading, setIsFileReading] = useState<boolean>(false);
  const [isDragOverDropzone, setIsDragOverDropzone] = useState<boolean>(false);
  const [showSupportedFormatsTooltip, setShowSupportedFormatsTooltip] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common Preview / Batch Editing Questions State
  const [finalQuestions, setFinalQuestions] = useState<ExamQuestion[]>([]);
  const [validationFilter, setValidationFilter] = useState<'all' | 'issues'>('all');
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);
  const [activeFixQuestionId, setActiveFixQuestionId] = useState<string | null>(null);
  const [fixSuccessMessage, setFixSuccessMessage] = useState<string | null>(null);

  // Validation Summary
  const validationSummary: ValidationSummary = useMemo(() => {
    return validateExamQuestions(finalQuestions);
  }, [finalQuestions]);

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...visualQuestions];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);
    setVisualQuestions(updated.map((q, idx) => ({ ...q, num: idx + 1 })));
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle Quick Add Question in Visual Mode
  const handleAddVisualQuestion = (
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'reading_comprehension'
  ) => {
    const nextNum = visualQuestions.length + 1;
    let defOptions = ['A. ', 'B. ', 'C. ', 'D. '];
    let defAnswer = '';
    let defSec: ExamSectionType = 'lexico_grammar';
    let defTitle = 'LEXICO & GRAMMAR';

    if (type === 'true_false') {
      defOptions = ['A. Đúng (True)', 'B. Sai (False)'];
      defAnswer = 'A. Đúng (True)';
    } else if (type === 'short_answer') {
      defOptions = [];
      defSec = 'writing_short';
      defTitle = 'WRITING - SHORT ANSWER';
    } else if (type === 'reading_comprehension') {
      defSec = 'reading_comprehension';
      defTitle = 'READING COMPREHENSION';
    }

    const newQ: VisualQuestionDraft = {
      id: `v-q-${Date.now()}-${nextNum}`,
      num: nextNum,
      questionType: type,
      sectionType: defSec,
      sectionTitle: defTitle,
      question: '',
      options: defOptions,
      answer: defAnswer,
      explanation: '',
      passage: type === 'reading_comprehension' ? 'Eco-friendly living has become a prominent movement among young people worldwide. By adopting simple daily habits such as carrying reusable containers and avoiding single-use plastics, students can significantly reduce campus waste.' : undefined,
      passageTitle: type === 'reading_comprehension' ? 'Bài đọc hiểu (Reading Passage)' : undefined,
    };

    setVisualQuestions([...visualQuestions, newQ]);
  };

  // Quick 3 Sample Questions for Visual Mode
  const handleAddSampleVisualQuestions = () => {
    const sampleBatch: VisualQuestionDraft[] = [
      {
        id: `v-s-${Date.now()}-1`,
        num: visualQuestions.length + 1,
        questionType: 'multiple_choice',
        sectionType: 'pronunciation',
        sectionTitle: 'PRONUNCIATION & STRESS',
        question: 'Choose the word whose main stress is placed differently from the others:',
        options: ['A. preserve', 'B. protect', 'C. damage', 'D. pollute'],
        answer: 'C. damage',
        explanation: "'damage' trọng âm rơi vào âm tiết 1 /ˈdæm.ɪdʒ/. Các từ còn lại rơi vào âm tiết 2."
      },
      {
        id: `v-s-${Date.now()}-2`,
        num: visualQuestions.length + 2,
        questionType: 'multiple_choice',
        sectionType: 'lexico_grammar',
        sectionTitle: 'LEXICO & GRAMMAR',
        question: 'The teacher asked us to look _______ the new vocabulary in the Oxford dictionary.',
        options: ['A. after', 'B. for', 'C. up', 'D. into'],
        answer: 'C. up',
        explanation: "'Look up' có nghĩa là tra cứu thông tin hoặc từ vựng trong từ điển."
      },
      {
        id: `v-s-${Date.now()}-3`,
        num: visualQuestions.length + 3,
        questionType: 'multiple_choice',
        sectionType: 'cloze_reading',
        sectionTitle: 'CLOZE-READING',
        question: 'Students who participate in green activities can gain valuable (3) _______ for their future careers.',
        options: ['A. experience', 'B. experienced', 'C. experiencing', 'D. experiential'],
        answer: 'A. experience',
        explanation: "Cần một danh từ sau tính từ 'valuable'."
      }
    ];

    setVisualQuestions([...visualQuestions, ...sampleBatch]);
  };

  // Reorder visual question
  const moveVisualQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === visualQuestions.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const nextList = [...visualQuestions];
    const temp = nextList[index];
    nextList[index] = nextList[targetIdx];
    nextList[targetIdx] = temp;
    setVisualQuestions(nextList.map((q, idx) => ({ ...q, num: idx + 1 })));
  };

  // Delete visual question
  const deleteVisualQuestion = (id: string) => {
    const filtered = visualQuestions.filter((q) => q.id !== id);
    setVisualQuestions(filtered.map((q, idx) => ({ ...q, num: idx + 1 })));
  };

  // Duplicate visual question
  const duplicateVisualQuestion = (q: VisualQuestionDraft) => {
    const copy: VisualQuestionDraft = {
      ...q,
      id: `v-q-${Date.now()}`,
      num: visualQuestions.length + 1,
      question: `${q.question} (Bản sao)`
    };
    setVisualQuestions([...visualQuestions, copy]);
  };

  // Rich Text Insertion formatting
  const insertFormatting = (id: string, tag: 'b' | 'i' | 'u' | 'blank' | 'table' | 'image') => {
    if (tag === 'image') {
      setImageModalQuestionId(id);
      return;
    }

    setVisualQuestions(
      visualQuestions.map((q) => {
        if (q.id !== id) return q;
        let addition = '';
        if (tag === 'b') addition = ' <b>từ in đậm</b> ';
        if (tag === 'i') addition = ' <i>từ in nghiêng</i> ';
        if (tag === 'u') addition = ' <u>từ gạch chân</u> ';
        if (tag === 'blank') addition = ' _______ ';
        if (tag === 'table') {
          addition = '\n<table class="border border-slate-300 w-full my-2 text-xs text-left"><tr class="bg-slate-100 font-bold"><th class="p-1.5 border border-slate-300">Cột 1</th><th class="p-1.5 border border-slate-300">Cột 2</th></tr><tr><td class="p-1.5 border border-slate-300">Nội dung A</td><td class="p-1.5 border border-slate-300">Nội dung B</td></tr></table>\n';
        }
        return {
          ...q,
          question: (q.question + addition).trim()
        };
      })
    );
  };

  const handleConfirmInsertImage = (imgUrl: string) => {
    if (!imageModalQuestionId || !imgUrl.trim()) {
      setImageModalQuestionId(null);
      return;
    }

    const imageHtml = `\n<div class="my-2 text-center"><img src="${imgUrl.trim()}" alt="Illustration" class="max-h-48 inline-block rounded-xl border border-slate-300 shadow-sm" /><p class="text-[11px] text-slate-500 italic mt-1">(Hình minh họa câu hỏi)</p></div>\n`;

    setVisualQuestions(
      visualQuestions.map((q) => {
        if (q.id !== imageModalQuestionId) return q;
        return {
          ...q,
          question: (q.question + imageHtml).trim()
        };
      })
    );

    setImageModalQuestionId(null);
    setCustomImageUrl('');
  };

  // Mode 2: Smart Text / AI Parse Trigger
  const handleParseRawText = async () => {
    if (!rawText.trim()) return;

    setIsAiParsing(true);
    try {
      // 1. First attempt Gemini AI parser via server
      const res = await fetch('/api/digitize-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          grade: selectedGrade,
          topic: examTitle
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.questions?.length > 0) {
          if (json.data.title) setExamTitle(json.data.title);
          setFinalQuestions(json.data.questions);
          setStep('preview');
          setIsAiParsing(false);
          return;
        }
      }
    } catch {
      // fallback to local regex parser
    }

    // 2. Fallback to enhanced local Regex parser
    const localResult = parseRawExamText(rawText);
    if (localResult.questions.length > 0) {
      setFinalQuestions(localResult.questions);
      setStep('preview');
    } else {
      alert('Không nhận diện được câu hỏi nào từ văn bản. Vui lòng kiểm tra định dạng hoặc bấm vào nút "Hướng dẫn cú pháp" / "Dán mẫu".');
    }
    setIsAiParsing(false);
  };

  // Mode 3: File Upload Handler (.docx / .xlsx / .pdf / .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setIsFileReading(true);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isDocx = file.name.endsWith('.docx') || file.name.endsWith('.doc');
    const isPdf = file.name.endsWith('.pdf');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer;
          const result = parseExcelExamFile(buffer);
          if (result.questions.length > 0) {
            setFinalQuestions(result.questions);
            setStep('preview');
          } else {
            alert('Tệp Excel không chứa dữ liệu câu hỏi hợp lệ theo mẫu chuẩn! Bạn có thể tải file mẫu để xem cấu trúc.');
          }
        } catch (err: any) {
          alert(`Lỗi đọc tệp Excel: ${err.message}`);
        } finally {
          setIsFileReading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (isDocx) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer;
          const text = await extractDocxText(buffer);
          if (text && text.trim()) {
            setRawText(text);

            // Attempt AI digitization on extracted docx text
            try {
              const res = await fetch('/api/digitize-exam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText: text, grade: selectedGrade, topic: examTitle })
              });
              if (res.ok) {
                const json = await res.json();
                if (json.success && json.data && json.data.questions?.length > 0) {
                  if (json.data.title) setExamTitle(json.data.title);
                  setFinalQuestions(json.data.questions);
                  setStep('preview');
                  setIsFileReading(false);
                  return;
                }
              }
            } catch {}

            // Fallback to local regex parser
            const localResult = parseRawExamText(text);
            if (localResult.questions.length > 0) {
              setFinalQuestions(localResult.questions);
              setStep('preview');
            } else {
              switchMode('text');
              alert('Đã trích xuất nội dung từ tệp Word. Bạn có thể kiểm tra và bấm "⚡ Phân tích & Tự động số hóa" để hoàn tất.');
            }
          } else {
            alert('Tệp Word không có nội dung văn bản hợp lệ!');
          }
        } catch (err: any) {
          alert(`Lỗi đọc tệp Word (.docx): ${err.message}`);
        } finally {
          setIsFileReading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (isPdf) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer;
          const uint8 = new Uint8Array(buffer);
          const rawString = new TextDecoder('utf-8', { fatal: false }).decode(uint8);

          // Extract text chunks from PDF stream or ASCII text
          const textMatches: string[] = [];
          const regex = /\(([^()]{2,})\)\s*Tj/g;
          let match;
          while ((match = regex.exec(rawString)) !== null) {
            textMatches.push(match[1]);
          }
          let extractedPdfText = textMatches.join(' ');
          if (!extractedPdfText || extractedPdfText.length < 50) {
            extractedPdfText = rawString.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ');
          }

          if (extractedPdfText && extractedPdfText.trim().length > 20) {
            setRawText(extractedPdfText);
            try {
              const res = await fetch('/api/digitize-exam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText: extractedPdfText, grade: selectedGrade, topic: examTitle })
              });
              if (res.ok) {
                const json = await res.json();
                if (json.success && json.data && json.data.questions?.length > 0) {
                  if (json.data.title) setExamTitle(json.data.title);
                  setFinalQuestions(json.data.questions);
                  setStep('preview');
                  setIsFileReading(false);
                  return;
                }
              }
            } catch {}

            const localResult = parseRawExamText(extractedPdfText);
            if (localResult.questions.length > 0) {
              setFinalQuestions(localResult.questions);
              setStep('preview');
            } else {
              switchMode('text');
              alert('Đã trích xuất văn bản từ tệp PDF. Bạn có thể kiểm tra và bấm "⚡ Phân tích & Tự động số hóa" để hoàn tất.');
            }
          } else {
            alert('Không thể đọc nội dung văn bản từ tệp PDF này (có thể là file dạng ảnh scan). Vui lòng thử file Word (.docx) hoặc dán văn bản trực tiếp.');
          }
        } catch (err: any) {
          alert(`Lỗi đọc tệp PDF: ${err.message}`);
        } finally {
          setIsFileReading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Plain text or CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          if (content) {
            setRawText(content);
            const result = parseRawExamText(content);
            if (result.questions.length > 0) {
              setFinalQuestions(result.questions);
              setStep('preview');
            } else {
              switchMode('text');
            }
          }
        } catch (err: any) {
          alert(`Lỗi đọc tệp văn bản: ${err.message}`);
        } finally {
          setIsFileReading(false);
        }
      };
      reader.readAsText(file);
    }

    e.target.value = '';
  };

  // Transition from Visual Editor to Preview
  const handleProceedFromVisual = () => {
    const converted: ExamQuestion[] = visualQuestions.map((vq, idx) => ({
      id: vq.id,
      num: idx + 1,
      sectionType: vq.sectionType,
      sectionTitle: vq.sectionTitle,
      questionType: vq.questionType === 'reading_comprehension'
        ? 'multiple_choice'
        : vq.questionType,
      question: vq.question.trim() || `Câu hỏi số ${idx + 1}`,
      options: vq.options,
      answer: vq.answer,
      explanation: vq.explanation.trim() || 'Căn cứ theo quy tắc ngữ pháp chuẩn.',
      passage: vq.passage,
      passageTitle: vq.passageTitle
    }));

    setFinalQuestions(converted);
    setStep('preview');
  };

  // Batch action: Shuffle Questions
  const handleShuffleQuestions = () => {
    const shuffled = shuffleExamQuestions(finalQuestions);
    setFinalQuestions(shuffled);
  };

  // Batch action: Shuffle Options
  const handleShuffleOptions = () => {
    const shuffled = shuffleQuestionOptions(finalQuestions);
    setFinalQuestions(shuffled);
  };

  // Add question in Preview Mode
  const handleAddQuestionInPreview = () => {
    const nextNum = finalQuestions.length + 1;
    const newQ: ExamQuestion = {
      id: `manual-p-${Date.now()}`,
      num: nextNum,
      sectionType: 'lexico_grammar',
      sectionTitle: 'LEXICO & GRAMMAR',
      questionType: 'multiple_choice',
      question: `Câu hỏi ${nextNum}: Điền nội dung câu hỏi tại đây...`,
      options: ['A. Phương án A', 'B. Phương án B', 'C. Phương án C', 'D. Phương án D'],
      answer: 'A. Phương án A',
      explanation: 'Giải thích chi tiết cho câu hỏi.'
    };
    setFinalQuestions([...finalQuestions, newQ]);
  };

  // Quick edit question in Preview
  const updateQuestionInPreview = (id: string, updates: Partial<ExamQuestion>) => {
    setFinalQuestions(
      finalQuestions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  // Fix Now: Toggle quick-fix assistant & scroll to question
  const handleFixQuestionNow = (qId: string) => {
    setActiveFixQuestionId((prev) => (prev === qId ? null : qId));
    setTimeout(() => {
      const cardEl = document.getElementById(`preview-q-card-${qId}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      const inputEl = document.getElementById(`preview-q-input-${qId}`) as HTMLInputElement;
      if (inputEl) {
        inputEl.focus();
      }
    }, 60);
  };

  // Quick fix: Empty question content
  const handleQuickFixEmptyContent = (qId: string, customPrompt?: string) => {
    const qIndex = finalQuestions.findIndex((it) => it.id === qId);
    const qNum = qIndex >= 0 ? finalQuestions[qIndex].num || qIndex + 1 : 1;
    const promptText =
      customPrompt ||
      `Choose the best answer (A, B, C, or D) to complete the following sentence:`;
    updateQuestionInPreview(qId, { question: promptText });
    setFixSuccessMessage(`Đã điền nội dung câu hỏi số ${qNum}!`);
    setTimeout(() => setFixSuccessMessage(null), 3500);
  };

  // Quick fix: Missing answer key
  const handleQuickFixMissingAnswer = (qId: string, answerOption?: string) => {
    const q = finalQuestions.find((item) => item.id === qId);
    if (!q) return;
    let chosen = answerOption;
    if (!chosen) {
      if (q.options && q.options.length > 0) {
        chosen = q.options[0];
      } else {
        chosen = 'A. Phương án chuẩn';
      }
    }
    updateQuestionInPreview(qId, { answer: chosen });
    setFixSuccessMessage(`Đã chọn đáp án đúng: ${chosen.slice(0, 30)}...`);
    setTimeout(() => setFixSuccessMessage(null), 3500);
  };

  // Quick fix: Incomplete options (auto-complete to 4 choices A, B, C, D)
  const handleQuickFixIncompleteOptions = (qId: string) => {
    const q = finalQuestions.find((item) => item.id === qId);
    if (!q) return;
    const existing = q.options || [];
    const letters = ['A', 'B', 'C', 'D'];
    const newOptions: string[] = [];

    letters.forEach((l, idx) => {
      if (existing[idx] && existing[idx].trim()) {
        newOptions.push(existing[idx]);
      } else {
        newOptions.push(`${l}. Phương án ${l}`);
      }
    });

    const ans = q.answer && newOptions.includes(q.answer) ? q.answer : newOptions[0];
    updateQuestionInPreview(qId, {
      options: newOptions,
      answer: ans,
      questionType: 'multiple_choice'
    });
    setFixSuccessMessage(`Đã bổ sung đầy đủ 4 phương án A-B-C-D cho câu ${q.num}!`);
    setTimeout(() => setFixSuccessMessage(null), 3500);
  };

  // Quick fix: Convert to short answer
  const handleQuickConvertToShortAnswer = (qId: string) => {
    const q = finalQuestions.find((item) => item.id === qId);
    if (!q) return;
    updateQuestionInPreview(qId, {
      questionType: 'short_answer',
      options: [],
      answer: q.answer || 'Đáp án mẫu'
    });
    setFixSuccessMessage(`Đã chuyển câu ${q.num} sang dạng Tự luận / Trả lời ngắn!`);
    setTimeout(() => setFixSuccessMessage(null), 3500);
  };

  // Auto-Fix All Issues in 1 click
  const handleAutoFixAll = () => {
    const letters = ['A', 'B', 'C', 'D'];
    let fixedCount = 0;

    const updated = finalQuestions.map((q, idx) => {
      let isModified = false;
      const newQ = { ...q };

      // 1. Empty Content
      if (!newQ.question || !newQ.question.trim()) {
        newQ.question = `Choose the best answer (A, B, C, or D) to complete the sentence:`;
        isModified = true;
      }

      // 2. Incomplete Options
      if (newQ.questionType !== 'short_answer' && newQ.questionType !== 'essay') {
        const existing = newQ.options || [];
        if (existing.length < 4 || existing.some((o) => !o.trim())) {
          const filled: string[] = [];
          letters.forEach((l, lIdx) => {
            if (existing[lIdx] && existing[lIdx].trim()) {
              filled.push(existing[lIdx]);
            } else {
              filled.push(`${l}. Phương án ${l}`);
            }
          });
          newQ.options = filled;
          isModified = true;
        }
      }

      // 3. Missing Answer
      if (!newQ.answer || !newQ.answer.trim()) {
        if (newQ.options && newQ.options.length > 0) {
          newQ.answer = newQ.options[0];
        } else {
          newQ.answer = 'A. Phương án chuẩn';
        }
        isModified = true;
      }

      if (isModified) fixedCount++;
      return newQ;
    });

    setFinalQuestions(updated);
    setActiveFixQuestionId(null);
    setFixSuccessMessage(`Đã tự động sửa hoàn tất ${fixedCount} câu hỏi có cảnh báo!`);
    setTimeout(() => setFixSuccessMessage(null), 4000);
  };

  // Save to Exam Bank
  const handleSaveToExamBank = () => {
    if (finalQuestions.length === 0) {
      alert('Đề thi chưa có câu hỏi nào!');
      return;
    }

    const newExam: ExamItem = {
      id: `ex-man-${Date.now()}`,
      title: examTitle.trim() || `Đề Khảo Sát Tiếng Anh (${selectedGrade})`,
      grade: selectedGrade,
      subject: 'Tiếng Anh',
      questionsCount: finalQuestions.length,
      duration: `${durationMin} phút`,
      difficulty: selectedDifficulty,
      topic: topic || 'Đề soạn thảo thủ công & số hóa',
      submissions: 0,
      avgScore: 0,
      createdAt: 'Hôm nay',
      status: 'Đang mở',
      maxAttempts,
      showSolutions: showAnswerAfterSubmit ? 'always' : 'score_only',
      questions: finalQuestions
    };

    // Save to localStorage directly
    try {
      const existingBankStr = localStorage.getItem('EDUADMIN_EXAM_BANK');
      let bank: ExamItem[] = existingBankStr ? JSON.parse(existingBankStr) : [];
      bank = [newExam, ...bank.filter((e) => e.id !== newExam.id)];
      localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(bank));
      localStorage.setItem('eng_exams_v1', JSON.stringify(bank));

      const thptSavedStr = localStorage.getItem('THPT_SAVED_EXAMS_BANK');
      let thptList: ExamItem[] = thptSavedStr ? JSON.parse(thptSavedStr) : [];
      thptList = [newExam, ...thptList.filter((e) => e.id !== newExam.id)];
      localStorage.setItem('THPT_SAVED_EXAMS_BANK', JSON.stringify(thptList));

      // Sync to backend DB
      fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExam)
      }).catch(() => {});
    } catch {}

    if (onSaveToBankDirectly) {
      onSaveToBankDirectly(newExam);
    }

    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      onExamParsed(newExam);
    }, 900);
  };

  // Filtered questions in preview
  const displayedPreviewQuestions = useMemo(() => {
    if (validationFilter === 'issues') {
      const errorIds = new Set([
        ...validationSummary.missingAnswerIds,
        ...validationSummary.missingOptionsIds,
        ...validationSummary.emptyContentIds
      ]);
      return finalQuestions.filter((q) => errorIds.has(q.id));
    }
    return finalQuestions;
  }, [finalQuestions, validationFilter, validationSummary]);

  return (
    <div className="space-y-5 select-text">
      {/* Toast Notification */}
      {isSavedToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5" />
          <span>Đã lưu thành công bộ đề vào thư mục {selectedGrade}!</span>
        </div>
      )}

      {/* Image Insertion Modal */}
      {imageModalQuestionId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Chèn ảnh minh họa cho câu hỏi</span>
              </h4>
              <button
                type="button"
                onClick={() => setImageModalQuestionId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nhập URL hình ảnh trực tuyến (https://...):
                </label>
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div>
                <span className="font-bold text-slate-600 block mb-1.5">
                  Hoặc chọn nhanh ảnh mẫu giáo dục có sẵn:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleConfirmInsertImage(
                        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
                      )
                    }
                    className="p-2 border border-slate-200 rounded-xl text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-center gap-2"
                  >
                    <span className="text-base">📚</span>
                    <div>
                      <div className="font-bold text-slate-800">Lớp học & Sách</div>
                      <div className="text-[10px] text-slate-500">Classroom Reading</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleConfirmInsertImage(
                        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'
                      )
                    }
                    className="p-2 border border-slate-200 rounded-xl text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-center gap-2"
                  >
                    <span className="text-base">🌱</span>
                    <div>
                      <div className="font-bold text-slate-800">Môi trường xanh</div>
                      <div className="text-[10px] text-slate-500">Green Living topic</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleConfirmInsertImage(
                        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
                      )
                    }
                    className="p-2 border border-slate-200 rounded-xl text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-center gap-2"
                  >
                    <span className="text-base">💻</span>
                    <div>
                      <div className="font-bold text-slate-800">Công nghệ & AI</div>
                      <div className="text-[10px] text-slate-500">Tech Innovation</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleConfirmInsertImage(
                        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80'
                      )
                    }
                    className="p-2 border border-slate-200 rounded-xl text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-center gap-2"
                  >
                    <span className="text-base">🤝</span>
                    <div>
                      <div className="font-bold text-slate-800">Tình nguyện viên</div>
                      <div className="text-[10px] text-slate-500">Community service</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImageModalQuestionId(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!customImageUrl.trim()}
                onClick={() => handleConfirmInsertImage(customImageUrl)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold transition cursor-pointer"
              >
                Chèn ảnh vào câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Step Switcher */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-xs">
            <FileText className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span>Tạo Đề Thủ Công & Số Hóa Đề Thi</span>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                GDPT 2018
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {step === 'input'
                ? 'Lựa chọn phương thức nhập đề phù hợp: Soạn từng câu, dán văn bản thô hoặc tải file mẫu.'
                : 'Kiểm tra lỗi cú pháp, đảo mã đề và cấu hình thông số trước khi lưu vào kho.'}
            </p>
          </div>
        </div>

        {/* Step Navigation Pill */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-bold border border-slate-200">
          <button
            type="button"
            onClick={() => setStep('input')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              step === 'input' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>1. Nhập liệu</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">
              {inputMode === 'visual' ? `${visualQuestions.length} câu` : '3 Chế độ'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (inputMode === 'visual') handleProceedFromVisual();
              else if (finalQuestions.length > 0) setStep('preview');
              else if (rawText.trim()) handleParseRawText();
            }}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              step === 'preview' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>2. Xem trước & Chỉnh sửa</span>
            {finalQuestions.length > 0 && (
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-black">
                {finalQuestions.length} câu
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================= STEP 1: INPUT MODES ================= */}
      {step === 'input' && (
        <div className="space-y-4">
          {/* Mode Tabs (3 Chế độ linh hoạt) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Mode 1 Button */}
            <button
              type="button"
              onClick={() => switchMode('visual')}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                inputMode === 'visual'
                  ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${inputMode === 'visual' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                  Chế độ 1: Soạn thảo trực quan
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Visual Form Editor, hỗ trợ Rich Text, ảnh, bảng, kéo thả đổi thứ tự.
                </div>
              </div>
            </button>

            {/* Mode 2 Button */}
            <button
              type="button"
              onClick={() => switchMode('text')}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                inputMode === 'text'
                  ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${inputMode === 'text' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                  Chế độ 2: Số hóa văn bản thô
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Dán đề có sẵn từ Word/PDF. AI & Regex tự động bóc tách 100%.
                </div>
              </div>
            </button>

            {/* Mode 3 Button */}
            <button
              type="button"
              onClick={() => switchMode('file')}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                inputMode === 'file'
                  ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${inputMode === 'file' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                  Chế độ 3: Nhập từ file mẫu
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Tải file mẫu Excel/Word, điền nội dung và upload .docx/.xlsx.
                </div>
              </div>
            </button>
          </div>

          {/* ---------------- CHẾ ĐỘ 1: VISUAL FORM EDITOR ---------------- */}
          {inputMode === 'visual' && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700 mr-1">+ Thêm câu hỏi:</span>
                  <button
                    type="button"
                    onClick={() => handleAddVisualQuestion('multiple_choice')}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Trắc nghiệm 4 lựa chọn (MCQ)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVisualQuestion('true_false')}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl border border-blue-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Đúng / Sai (True/False)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVisualQuestion('short_answer')}
                    className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl border border-purple-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Điền khuyết / Tự luận</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVisualQuestion('reading_comprehension')}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Bài đọc hiểu (Passage)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddSampleVisualQuestions}
                    className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Nạp 3 câu mẫu</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedFromVisual}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Xem trước & Kiểm tra ({visualQuestions.length} câu)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notice for Drag & Drop and Formatting */}
              <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Mẹo:</strong> Bạn có thể dùng chuột <strong>kéo thả</strong> biểu tượng 6 chấm ở mỗi thẻ để đổi thứ tự các câu hỏi. Nhấn vào các biểu tượng B / I / U / Bảng / Ảnh để định dạng Rich Text.
                  </span>
                </div>
                <span className="font-bold text-[11px] bg-white px-2 py-0.5 rounded-lg border border-emerald-300 shrink-0">
                  {visualQuestions.length} câu hỏi
                </span>
              </div>

              {/* Questions List with Drag & Drop */}
              <div className="space-y-4">
                {visualQuestions.map((q, idx) => {
                  const isBeingDragged = draggedIndex === idx;
                  const isDragTarget = dragOverIndex === idx;
                  const isShowingPreview = Boolean(previewHtmlMap[q.id]);

                  return (
                    <div
                      key={q.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 transition-all ${
                        isBeingDragged
                          ? 'opacity-40 border-dashed border-emerald-500 scale-[0.99]'
                          : isDragTarget
                          ? 'border-t-4 border-t-emerald-600 bg-emerald-50/30'
                          : 'border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      {/* Card Top: Drag Handle, Number, Type & Controls */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          {/* Drag Handle */}
                          <div
                            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                            title="Kéo thả để sắp xếp lại thứ tự câu hỏi"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                            {q.num}
                          </span>

                          <select
                            value={q.questionType}
                            onChange={(e) => {
                              const newType = e.target.value as any;
                              setVisualQuestions(
                                visualQuestions.map((it) =>
                                  it.id === q.id
                                    ? {
                                        ...it,
                                        questionType: newType,
                                        options:
                                          newType === 'true_false'
                                            ? ['A. Đúng (True)', 'B. Sai (False)']
                                            : newType === 'short_answer'
                                            ? []
                                            : it.options.length < 2
                                            ? ['A. ', 'B. ', 'C. ', 'D. ']
                                            : it.options,
                                        answer: newType === 'true_false' ? 'A. Đúng (True)' : ''
                                      }
                                    : it
                                )
                              );
                            }}
                            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
                          >
                            <option value="multiple_choice">Trắc nghiệm 4 lựa chọn (MCQ)</option>
                            <option value="true_false">Đúng / Sai (True / False)</option>
                            <option value="short_answer">Điền khuyết / Tự luận ngắn</option>
                            <option value="reading_comprehension">Bài đọc hiểu (Passage)</option>
                          </select>
                        </div>

                        {/* Formatting tools & Actions */}
                        <div className="flex items-center gap-1.5">
                          {/* Rich formatting toolbar */}
                          <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-slate-700">
                            <button
                              type="button"
                              title="In đậm (Bold): <b>...</b>"
                              onClick={() => insertFormatting(q.id, 'b')}
                              className="p-1 hover:bg-white rounded transition text-xs font-bold"
                            >
                              <Bold className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="In nghiêng (Italic): <i>...</i>"
                              onClick={() => insertFormatting(q.id, 'i')}
                              className="p-1 hover:bg-white rounded transition text-xs"
                            >
                              <Italic className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Gạch chân (Underline): <u>...</u>"
                              onClick={() => insertFormatting(q.id, 'u')}
                              className="p-1 hover:bg-white rounded transition text-xs"
                            >
                              <Underline className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Chèn chỗ trống _______"
                              onClick={() => insertFormatting(q.id, 'blank')}
                              className="px-1.5 py-0.5 text-[10px] font-bold hover:bg-white rounded transition"
                            >
                              ___
                            </button>
                            <button
                              type="button"
                              title="Chèn bảng so sánh (Table)"
                              onClick={() => insertFormatting(q.id, 'table')}
                              className="p-1 hover:bg-white rounded transition text-xs"
                            >
                              <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                            </button>
                            <button
                              type="button"
                              title="Chèn ảnh minh họa (Image)"
                              onClick={() => insertFormatting(q.id, 'image')}
                              className="p-1 hover:bg-white rounded transition text-xs"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                          </div>

                          {/* Live preview toggle button */}
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewHtmlMap((prev) => ({
                                ...prev,
                                [q.id]: !prev[q.id]
                              }))
                            }
                            className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 border ${
                              isShowingPreview
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Bật/Tắt xem trước cách hiển thị định dạng HTML"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{isShowingPreview ? 'Sửa văn bản' : 'Xem trước'}</span>
                          </button>

                          {/* Reorder Up / Down */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveVisualQuestion(idx, 'up')}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            title="Di chuyển lên"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === visualQuestions.length - 1}
                            onClick={() => moveVisualQuestion(idx, 'down')}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            title="Di chuyển xuống"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => duplicateVisualQuestion(q)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                            title="Nhân bản câu này"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => deleteVisualQuestion(q.id)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Reading Passage Box (if reading comprehension) */}
                      {q.questionType === 'reading_comprehension' && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                            <span>📖 Nội dung bài đọc chung (Reading Passage):</span>
                            <input
                              type="text"
                              value={q.passageTitle || ''}
                              onChange={(e) => {
                                setVisualQuestions(
                                  visualQuestions.map((it) =>
                                    it.id === q.id ? { ...it, passageTitle: e.target.value } : it
                                  )
                                );
                              }}
                              placeholder="Tiêu đề bài đọc..."
                              className="text-xs px-2 py-0.5 rounded border border-amber-300 bg-white"
                            />
                          </div>
                          <textarea
                            rows={4}
                            value={q.passage || ''}
                            onChange={(e) => {
                              setVisualQuestions(
                                visualQuestions.map((it) =>
                                  it.id === q.id ? { ...it, passage: e.target.value } : it
                                )
                              );
                            }}
                            placeholder="Dán hoặc nhập đoạn văn đọc hiểu tại đây..."
                            className="w-full text-xs font-serif p-2.5 rounded-lg border border-amber-300 bg-white text-slate-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      )}

                      {/* Question Content Input & Live HTML Preview */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-600 block">
                            Nội dung câu hỏi:
                          </label>
                          {isShowingPreview && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              Đang ở chế độ xem trước trực quan
                            </span>
                          )}
                        </div>

                        {isShowingPreview ? (
                          <div
                            className="p-3 rounded-xl border border-blue-200 bg-blue-50/20 text-xs font-medium text-slate-900 min-h-[60px]"
                            dangerouslySetInnerHTML={{
                              __html: formatQuestionHtml(q.question) || '<span class="text-slate-400 italic">(Chưa có nội dung câu hỏi)</span>'
                            }}
                          />
                        ) : (
                          <textarea
                            rows={3}
                            value={q.question}
                            onChange={(e) => {
                              setVisualQuestions(
                                visualQuestions.map((it) =>
                                  it.id === q.id ? { ...it, question: e.target.value } : it
                                )
                              );
                            }}
                            placeholder="Nhập nội dung câu hỏi (hỗ trợ <b>in đậm</b>, <u>gạch chân</u>, bảng, ảnh minh họa)..."
                            className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        )}
                      </div>

                      {/* Options Selection (MCQ / True False) */}
                      {q.questionType !== 'short_answer' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-600">
                              Các phương án lựa chọn (Click hình tròn A/B/C/D để chọn đáp án đúng):
                            </label>
                            {q.answer && (
                              <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                ✓ Đáp án đúng: {q.answer}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => {
                              const letter = opt.trim().slice(0, 1).toUpperCase();
                              const isCorrect = q.answer && (q.answer.trim().startsWith(letter) || q.answer.trim() === opt.trim());

                              return (
                                <div
                                  key={oIdx}
                                  className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                                    isCorrect
                                      ? 'bg-emerald-50/90 border-emerald-400 ring-1 ring-emerald-500/20'
                                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVisualQuestions(
                                        visualQuestions.map((it) =>
                                          it.id === q.id ? { ...it, answer: opt } : it
                                        )
                                      );
                                    }}
                                    className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition ${
                                      isCorrect
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                        : 'border-slate-300 bg-white text-slate-600 hover:border-emerald-500'
                                    }`}
                                    title="Chọn làm đáp án đúng bằng 1 cú click"
                                  >
                                    {isCorrect ? '✓' : String.fromCharCode(65 + oIdx)}
                                  </button>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const nextOpts = [...q.options];
                                      nextOpts[oIdx] = val;
                                      setVisualQuestions(
                                        visualQuestions.map((it) =>
                                          it.id === q.id
                                            ? {
                                                ...it,
                                                options: nextOpts,
                                                answer: isCorrect ? val : it.answer
                                              }
                                            : it
                                        )
                                      );
                                    }}
                                    className="w-full text-xs font-medium bg-transparent border-0 focus:outline-none text-slate-800"
                                    placeholder={`Phương án ${String.fromCharCode(65 + oIdx)}...`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Short Answer / Fill In the blank */}
                      {q.questionType === 'short_answer' && (
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-purple-900 block">
                            Đáp án đúng / Mẫu câu viết lại:
                          </label>
                          <input
                            type="text"
                            value={q.answer}
                            onChange={(e) => {
                              setVisualQuestions(
                                visualQuestions.map((it) =>
                                  it.id === q.id ? { ...it, answer: e.target.value } : it
                                )
                              );
                            }}
                            placeholder="Nhập đáp án chuẩn hoặc cụm từ cần điền..."
                            className="w-full text-xs font-semibold p-2.5 rounded-xl border border-purple-300 bg-white text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      )}

                      {/* Detailed Explanation */}
                      <div className="space-y-1 pt-1">
                        <label className="text-[11px] font-bold text-slate-500 block">
                          💡 Lời giải thích chi tiết & Quy tắc ngữ pháp:
                        </label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => {
                            setVisualQuestions(
                              visualQuestions.map((it) =>
                                it.id === q.id ? { ...it, explanation: e.target.value } : it
                              )
                            );
                          }}
                          placeholder="Giải thích tại sao chọn phương án này, cấu trúc ngữ pháp cần nhớ..."
                          className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Add & Next Button */}
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleAddVisualQuestion('multiple_choice')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm câu hỏi mới</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedFromVisual}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Chuyển sang Bước 2: Xem trước & Lưu ({visualQuestions.length} câu)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ---------------- CHẾ ĐỘ 2: SMART TEXT / REGEX PARSER ---------------- */}
          {inputMode === 'text' && (
            <div className="space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="font-extrabold text-xs text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Dán toàn bộ đề thi thô từ Word / PDF</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    ({rawText ? rawText.split('\n').length : 0} dòng)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRawText(THPT_SAMPLE_MOET_STANDARDIZED_TEXT)}
                    className="px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer"
                    title="Chèn mẫu Đề thi Tốt nghiệp THPT 40 câu chuẩn cấu trúc Bộ GD&ĐT"
                  >
                    📋 Dán mẫu THPT (40 câu chuẩn BGD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRawText(PERIODIC_EXAM_STANDARDIZED_TEXT)}
                    className="px-2.5 py-1 text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer"
                    title="Chèn mẫu Đề Kiểm tra Định kỳ 40 câu (Giữa kỳ & Cuối kỳ)"
                  >
                    📋 Dán mẫu Định kỳ (Giữa & Cuối kỳ 40 câu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRawText(SAMPLE_EXAM_TEXT)}
                    className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition cursor-pointer"
                  >
                    ⚡ Mẫu rút gọn 7 câu
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFormatGuide(!showFormatGuide)}
                    className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    Hướng dẫn cú pháp
                  </button>
                </div>
              </div>

              {/* Format Guide */}
              {showFormatGuide && (
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-slate-800">Quy chuẩn định dạng thông minh:</div>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                    <li>Mỗi câu bắt đầu bằng <code>Câu 1:</code> hoặc <code>1.</code> hoặc <code>Question 1:</code></li>
                    <li>Phương án bắt đầu bằng <code>A.</code>, <code>B.</code>, <code>C.</code>, <code>D.</code></li>
                    <li>
                      Đáp án đúng: Đánh dấu sao <code>*A. phương án*</code>, hoặc in đậm, hoặc để <code>Đáp án: A</code> dưới mỗi câu, hoặc có bảng đáp án <code>1.A 2.B 3.C...</code> ở cuối đề!
                    </li>
                    <li>Lời giải thích: Ghi <code>Giải thích: ...</code> hoặc <code>Explanation: ...</code></li>
                    <li>Bài đọc chung: Đặt trong <code>[PASSAGE: Nội dung bài đọc...]</code></li>
                  </ul>
                </div>
              )}

              {/* Large Textarea */}
              <div className="relative">
                <textarea
                  rows={14}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Dán toàn bộ nội dung đề thi từ file Word (.docx) hoặc PDF vào đây...
Ví dụ:
Câu 1: Choose the word whose underlined part is pronounced differently:
A. decided
B. waited
*C. watched*
D. invited
Đáp án: C
Giải thích: Đuôi -ed phát âm là /t/..."
                  className="w-full text-xs font-mono p-3.5 border border-slate-300 rounded-2xl bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-inner"
                />

                {rawText && (
                  <button
                    type="button"
                    onClick={() => setRawText('')}
                    className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-bold"
                    title="Xóa nội dung"
                  >
                    Xóa
                  </button>
                )}
              </div>

              {/* AI Parser Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Hỗ trợ tự động đối chiếu bảng đáp án cuối đề và phương án bôi đậm/gạch chân.</span>
                </div>

                <button
                  type="button"
                  disabled={!rawText.trim() || isAiParsing}
                  onClick={handleParseRawText}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {isAiParsing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang phân tích & bóc tách câu hỏi...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>⚡ Phân tích & Tự động số hóa</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ---------------- CHẾ ĐỘ 3: FILE IMPORT (.docx / .xlsx / .pdf) ---------------- */}
          {inputMode === 'file' && (
            <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              {/* Top Template Bar & Supported Formats Banner */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold text-xs text-slate-800 flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Tải file mẫu chuẩn (Download Templates):</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Tải mẫu Excel hoặc Word chuẩn để nhập liệu chính xác 100% không lo lỗi định dạng
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadThptWordTemplate()}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                    title="Tải mẫu Word Đề Tốt nghiệp THPT chuẩn 40 câu cấu trúc Bộ GD&ĐT"
                  >
                    <Download className="w-4 h-4 text-blue-700" />
                    <span>📥 Tải mẫu Word Đề Tốt nghiệp THPT (Chuẩn BGD)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadDinhKyWordTemplate()}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                    title="Tải mẫu Word Đề Kiểm tra Định kỳ Giữa kỳ & Cuối kỳ chuẩn 40 câu"
                  >
                    <Download className="w-4 h-4 text-indigo-700" />
                    <span>📥 Tải mẫu Word Đề Kiểm tra Định kỳ (Giữa kỳ & Cuối kỳ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={downloadExcelTemplate}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                    title="Tải file mẫu Excel chuẩn"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <span>Tải mẫu Excel (.xlsx)</span>
                  </button>

                  {/* Supported Formats Tooltip Button in Top Bar */}
                  <div 
                    className="relative inline-block"
                    onMouseEnter={() => setShowSupportedFormatsTooltip(true)}
                    onMouseLeave={() => setShowSupportedFormatsTooltip(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setShowSupportedFormatsTooltip(!showSupportedFormatsTooltip)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-slate-400 group/fmtbtn"
                    >
                      <Info className="w-3.5 h-3.5 text-blue-600 group-hover/fmtbtn:scale-110 transition-transform" />
                      <span>Supported Formats</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showSupportedFormatsTooltip ? 'rotate-180 text-blue-600' : ''}`} />
                    </button>

                    {/* Rich Tooltip Popover */}
                    {showSupportedFormatsTooltip && (
                      <div 
                        className="absolute z-50 right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700 text-left animate-in fade-in zoom-in-95 duration-150"
                        onMouseEnter={() => setShowSupportedFormatsTooltip(true)}
                        onMouseLeave={() => setShowSupportedFormatsTooltip(false)}
                      >
                        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                              <FileType className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-extrabold text-xs text-white">Supported Formats (Định dạng hỗ trợ)</div>
                              <div className="text-[10px] text-slate-400">Hỗ trợ tự động bóc tách và phân loại câu hỏi</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            3 Định dạng
                          </span>
                        </div>

                        <div className="space-y-2">
                          {/* 1. DOCX */}
                          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition border border-slate-700/60">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                                  <span>Microsoft Word</span>
                                  <span className="font-mono text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded font-extrabold">.docx</span>
                                </span>
                                <span className="text-[10px] text-slate-400">.doc</span>
                              </div>
                              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                                Tự động nhận diện cấu trúc câu hỏi, phương án A-B-C-D, bài đọc hiểu, in đậm và bảng đáp án cuối đề.
                              </p>
                            </div>
                          </div>

                          {/* 2. XLSX */}
                          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition border border-slate-700/60">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                              <FileSpreadsheet className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                                  <span>Microsoft Excel</span>
                                  <span className="font-mono text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-extrabold">.xlsx</span>
                                </span>
                                <span className="text-[10px] text-slate-400">.xls</span>
                              </div>
                              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                                Bảng tính chuẩn phân chia theo từng cột: Nội dung câu hỏi, Lựa chọn A/B/C/D, Đáp án đúng & Lời giải.
                              </p>
                            </div>
                          </div>

                          {/* 3. PDF */}
                          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition border border-slate-700/60">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                              <FileCheck className="w-4 h-4 text-rose-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                                  <span>Tài liệu PDF</span>
                                  <span className="font-mono text-[10px] bg-rose-500/30 text-rose-300 px-1.5 py-0.2 rounded font-extrabold">.pdf</span>
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                                Trích xuất trực tiếp văn bản đề thi PDF tiêu chuẩn, tự động nhận diện dạng bài & chuyển thành đề số hóa.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                          <span>✓ Dung lượng tối đa: 25 MB/tệp</span>
                          <span className="text-blue-400 font-semibold">Tự động đối chiếu đáp án</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Prominent Dashed-Border Drag and Drop Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverDropzone(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverDropzone(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverDropzone(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverDropzone(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const mockEvent = {
                      target: { files: e.dataTransfer.files }
                    } as any;
                    handleFileUpload(mockEvent);
                  }
                }}
                className={`relative group border-2 sm:border-[2.5px] border-dashed rounded-3xl p-8 sm:p-11 text-center transition-all duration-300 cursor-pointer overflow-visible ${
                  isDragOverDropzone
                    ? 'border-blue-600 bg-blue-50/95 ring-4 ring-blue-500/25 scale-[1.01] shadow-xl shadow-blue-500/15'
                    : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 hover:shadow-xl hover:shadow-blue-500/10 hover:ring-4 hover:ring-blue-500/10 bg-gradient-to-b from-slate-50/60 to-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.docx,.doc,.txt,.csv,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Animated Upload Icon Circle */}
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                  isDragOverDropzone
                    ? 'bg-blue-600 text-white scale-110 shadow-blue-500/30'
                    : 'bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/25'
                }`}>
                  <Upload className={`w-8 h-8 transition-transform duration-300 ${
                    isDragOverDropzone ? 'scale-110 -translate-y-0.5' : 'group-hover:-translate-y-0.5'
                  }`} />
                </div>

                <div className="mt-3.5 space-y-1.5">
                  <div className={`font-black text-sm sm:text-base tracking-tight transition-colors duration-200 ${
                    isDragOverDropzone ? 'text-blue-900' : 'text-slate-800 group-hover:text-blue-700'
                  }`}>
                    {isDragOverDropzone ? 'Thả tệp đề thi vào đây để tải lên ngay!' : 'Kéo thả tệp đề thi vào đây, hoặc nhấn để duyệt tệp từ máy tính'}
                  </div>
                  <div className="text-xs text-slate-500 max-w-xl mx-auto">
                    Hệ thống sẽ tự động quét, trích xuất dữ liệu câu hỏi và chuyển sang bước <span className="font-bold text-slate-700">Xem trước & Chỉnh sửa</span> trong tích tắc.
                  </div>
                </div>

                {/* Supported Formats Chips & Tooltip Trigger inside Dropzone */}
                <div 
                  className="mt-4 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[11px] font-bold text-slate-600 mr-1 flex items-center gap-1">
                    <span>Định dạng hỗ trợ:</span>
                  </div>

                  {/* Word chip */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 hover:border-blue-400 text-xs font-bold transition-all shadow-2xs hover:scale-105 cursor-pointer"
                    title="Nhấn để chọn tệp Word (.docx / .doc)"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>.docx</span>
                    <span className="text-[10px] font-semibold text-blue-600">(Word)</span>
                  </div>

                  {/* Excel chip */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 hover:border-emerald-400 text-xs font-bold transition-all shadow-2xs hover:scale-105 cursor-pointer"
                    title="Nhấn để chọn tệp Excel (.xlsx / .xls)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>.xlsx</span>
                    <span className="text-[10px] font-semibold text-emerald-600">(Excel)</span>
                  </div>

                  {/* PDF chip */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 hover:border-rose-400 text-xs font-bold transition-all shadow-2xs hover:scale-105 cursor-pointer"
                    title="Nhấn để chọn tệp PDF (.pdf)"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-rose-600" />
                    <span>.pdf</span>
                    <span className="text-[10px] font-semibold text-rose-600">(PDF)</span>
                  </div>

                  {/* Tooltip trigger pill */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSupportedFormatsTooltip(!showSupportedFormatsTooltip);
                    }}
                    onMouseEnter={() => setShowSupportedFormatsTooltip(true)}
                    onMouseLeave={() => setShowSupportedFormatsTooltip(false)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer"
                    title="Xem chi tiết các định dạng được hỗ trợ"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>Chi tiết</span>
                  </button>
                </div>

                {uploadedFileName && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100 text-emerald-950 px-4 py-2 rounded-full text-xs font-bold border border-emerald-300 shadow-2xs animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tệp đã chọn: <strong className="font-extrabold">{uploadedFileName}</strong> ({uploadedFileSize})</span>
                  </div>
                )}

                {isFileReading && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-800 flex items-center justify-center gap-2 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Đang giải mã và bóc tách dữ liệu từ tệp {uploadedFileName || 'đã tải'}...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= STEP 2: PREVIEW & BATCH EDITING ================= */}
      {step === 'preview' && (
        <div className="space-y-4">
          {/* Top Validation & Status Banner */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm ${validationSummary.hasErrors ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                  {validationSummary.hasErrors ? '⚠️' : '✓'}
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Kiểm tra trước khi lưu ({finalQuestions.length} câu hỏi)
                  </h4>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-700 font-bold">
                      {validationSummary.validCount} câu hoàn hảo
                    </span>
                    {validationSummary.hasErrors && (
                      <span className="text-amber-700 font-bold">
                        • {finalQuestions.length - validationSummary.validCount} câu có cảnh báo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Shuffle Questions */}
                <button
                  type="button"
                  onClick={handleShuffleQuestions}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Đảo ngẫu nhiên thứ tự các câu hỏi để tạo mã đề mới"
                >
                  <Shuffle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Đảo thứ tự câu</span>
                </button>

                {/* Shuffle Options */}
                <button
                  type="button"
                  onClick={handleShuffleOptions}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Đảo các phương án A-B-C-D và tự động cập nhật lại đáp án đúng"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đảo phương án A-B-C-D</span>
                </button>

                {/* Add new question */}
                <button
                  type="button"
                  onClick={handleAddQuestionInPreview}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm câu</span>
                </button>

                {/* Back to Edit */}
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
                >
                  ← Soạn tiếp
                </button>
              </div>
            </div>

            {/* Fix Success Notification Banner */}
            {fixSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 shadow-2xs">
                <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{fixSuccessMessage}</span>
              </div>
            )}

            {/* Validation Alerts Bar */}
            {validationSummary.hasErrors && (
              <div className="p-3.5 bg-gradient-to-r from-amber-50 via-rose-50/40 to-amber-50 border border-amber-300 rounded-xl text-xs space-y-2 text-amber-950">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Bộ kiểm tra tự động phát hiện cảnh báo ({finalQuestions.length - validationSummary.validCount} câu cần xử lý):</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFixAll}
                    className="self-start sm:self-auto px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-95 text-white rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Tự động bổ sung nội dung câu hỏi, điền đủ 4 phương án mẫu và chọn đáp án đúng cho toàn bộ các câu đang có lỗi"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>⚡ Sửa tự động toàn bộ lỗi (Auto-Fix All)</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {validationSummary.emptyContentIds.length > 0 && (
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-rose-300 font-bold text-rose-800 flex items-center gap-1 shadow-2xs">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{validationSummary.emptyContentIds.length} câu trống nội dung câu hỏi</span>
                    </span>
                  )}
                  {validationSummary.missingAnswerIds.length > 0 && (
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-300 font-bold text-amber-900 flex items-center gap-1 shadow-2xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{validationSummary.missingAnswerIds.length} câu chưa chọn đáp án đúng</span>
                    </span>
                  )}
                  {validationSummary.missingOptionsIds.length > 0 && (
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-purple-300 font-bold text-purple-900 flex items-center gap-1 shadow-2xs">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                      <span>{validationSummary.missingOptionsIds.length} câu thiếu phương án (chưa đủ 4 lựa chọn)</span>
                    </span>
                  )}
                  {validationSummary.duplicatePairs.length > 0 && (
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-300 font-bold text-blue-900 flex items-center gap-1 shadow-2xs">
                      <Copy className="w-3.5 h-3.5 text-blue-600" />
                      <span>{validationSummary.duplicatePairs.length} cặp câu trùng lặp nội dung (&gt;70%)</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Filter Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setValidationFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  validationFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả câu hỏi ({finalQuestions.length})
              </button>
              {validationSummary.hasErrors && (
                <button
                  type="button"
                  onClick={() => setValidationFilter('issues')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    validationFilter === 'issues'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Chỉ xem câu có cảnh báo ({finalQuestions.length - validationSummary.validCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-3.5">
            {displayedPreviewQuestions.map((q, idx) => {
              const hasEmptyContent = !q.question || !q.question.trim();
              const hasMissingAns = !q.answer || !q.answer.trim();
              const hasMissingOpt =
                q.questionType !== 'short_answer' &&
                q.questionType !== 'essay' &&
                (!q.options || q.options.length < 2 || q.options.some((opt) => !opt.trim()));
              const isMissing4Opt =
                (q.questionType === 'multiple_choice' || !q.questionType) &&
                q.options &&
                q.options.length > 0 &&
                q.options.length < 4;
              const duplicatePair = validationSummary.duplicatePairs.find(
                (p) => p.id1 === q.id || p.id2 === q.id
              );
              const hasError = hasEmptyContent || hasMissingAns || hasMissingOpt;
              const isFixingThis = activeFixQuestionId === q.id;

              return (
                <div
                  id={`preview-q-card-${q.id}`}
                  key={q.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition bg-white shadow-xs space-y-3 ${
                    hasEmptyContent
                      ? 'border-rose-400 ring-2 ring-rose-400/25 bg-rose-50/10'
                      : hasMissingAns || hasMissingOpt
                      ? 'border-amber-400 ring-2 ring-amber-400/25 bg-amber-50/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center text-white ${
                          hasEmptyContent
                            ? 'bg-rose-600'
                            : hasError
                            ? 'bg-amber-600'
                            : 'bg-blue-600'
                        }`}
                      >
                        {q.num || idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {q.sectionTitle || 'TRẮC NGHIỆM'}
                      </span>

                      {/* Colored Badges for Errors */}
                      {hasEmptyContent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full shadow-2xs animate-pulse">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Trống nội dung</span>
                        </span>
                      )}
                      {hasMissingAns && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Thiếu đáp án</span>
                        </span>
                      )}
                      {hasMissingOpt && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                          <HelpCircle className="w-3 h-3 text-purple-600" />
                          <span>{isMissing4Opt ? 'Chưa đủ 4 lựa chọn' : 'Thiếu phương án'}</span>
                        </span>
                      )}
                      {duplicatePair && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                          <Copy className="w-3 h-3 text-blue-600" />
                          <span>
                            Trùng câu {duplicatePair.id1 === q.id ? duplicatePair.num2 : duplicatePair.num1} ({duplicatePair.similarity}%)
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Fix Now Button on Erroneous Question Card */}
                      {hasError && (
                        <button
                          type="button"
                          onClick={() => handleFixQuestionNow(q.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition shadow-xs cursor-pointer ${
                            isFixingThis
                              ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white animate-pulse hover:animate-none'
                          }`}
                          title="Nhấn để mở công cụ sửa nhanh tự động cho câu hỏi này"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>{isFixingThis ? 'Đang sửa...' : 'Fix Now (Sửa ngay)'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const filtered = finalQuestions.filter((it) => it.id !== q.id);
                          setFinalQuestions(filtered.map((it, i) => ({ ...it, num: i + 1 })));
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Xóa câu này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Fix Interactive Assistant Bar on Card */}
                  {isFixingThis && hasError && (
                    <div className="p-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between font-extrabold text-amber-950">
                        <span className="flex items-center gap-1.5">
                          <Wrench className="w-4 h-4 text-amber-600" />
                          <span>Trợ lý sửa lỗi nhanh (1-Click Quick Fix Assistant)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveFixQuestionId(null)}
                          className="text-amber-700 hover:text-amber-950 font-bold px-2 py-0.5 rounded hover:bg-amber-100 cursor-pointer"
                        >
                          ✕ Đóng
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {hasEmptyContent && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickFixEmptyContent(
                                  q.id,
                                  'Choose the best answer (A, B, C, or D) to complete the following sentence:'
                                )
                              }
                              className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <span>✍️ Điền câu hỏi ngữ pháp</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickFixEmptyContent(
                                  q.id,
                                  'Mark the letter A, B, C, or D to indicate the word(s) CLOSEST in meaning to the underlined word:'
                                )
                              }
                              className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <span>✍️ Điền câu hỏi từ vựng</span>
                            </button>
                          </>
                        )}

                        {hasMissingOpt && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleQuickFixIncompleteOptions(q.id)}
                              className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>⚡ Bổ sung đủ 4 phương án A-B-C-D</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickConvertToShortAnswer(q.id)}
                              className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <span>🔄 Chuyển sang Tự luận ngắn</span>
                            </button>
                          </>
                        )}

                        {hasMissingAns && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-amber-800 text-[11px]">Chọn nhanh đáp án:</span>
                            {q.options && q.options.length > 0 ? (
                              q.options.map((opt, oI) => {
                                const optLetter = opt.trim().slice(0, 1).toUpperCase();
                                return (
                                  <button
                                    key={oI}
                                    type="button"
                                    onClick={() => handleQuickFixMissingAnswer(q.id, opt)}
                                    className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition cursor-pointer shadow-2xs"
                                  >
                                    Chọn {optLetter}
                                  </button>
                                );
                              })
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleQuickFixMissingAnswer(q.id, 'A. Phương án chuẩn A')}
                                className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition cursor-pointer shadow-2xs"
                              >
                                Đặt đáp án A
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Passage if present */}
                  {q.passage && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl font-serif text-xs text-slate-800 leading-relaxed">
                      <div className="font-bold text-amber-900 mb-1">
                        📖 {q.passageTitle || 'Đoạn văn đọc hiểu:'}
                      </div>
                      <p className="line-clamp-3">{q.passage}</p>
                    </div>
                  )}

                  {/* Question Text */}
                  <div className="space-y-1">
                    <input
                      id={`preview-q-input-${q.id}`}
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuestionInPreview(q.id, { question: e.target.value })}
                      placeholder="Nhập nội dung câu hỏi (bắt buộc)..."
                      className={`w-full text-xs font-bold p-2 rounded-xl text-slate-900 focus:outline-none transition ${
                        hasEmptyContent
                          ? 'bg-rose-50/80 border-2 border-rose-400 placeholder:text-rose-400 focus:ring-2 focus:ring-rose-500'
                          : 'bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-blue-500'
                      }`}
                    />
                  </div>

                  {/* Options with 1-click answer selection */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const letter = opt.trim().slice(0, 1).toUpperCase();
                        const isSelected =
                          q.answer &&
                          (q.answer.trim().startsWith(letter) || q.answer.trim() === opt.trim());

                        return (
                          <div
                            key={oIdx}
                            onClick={() => updateQuestionInPreview(q.id, { answer: opt })}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950 shadow-2xs'
                                : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white'
                                  : 'border border-slate-300 bg-white text-slate-600'
                              }`}
                            >
                              {isSelected ? '✓' : letter}
                            </span>
                            <span className="flex-1 truncate">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Short Answer Field */}
                  {(!q.options || q.options.length === 0) && (
                    <div className="flex items-center gap-2 bg-purple-50 p-2.5 rounded-xl border border-purple-200 text-xs">
                      <span className="font-bold text-purple-900 shrink-0">Đáp án chuẩn:</span>
                      <input
                        type="text"
                        value={q.answer}
                        onChange={(e) => updateQuestionInPreview(q.id, { answer: e.target.value })}
                        placeholder="Nhập đáp án chuẩn..."
                        className="w-full bg-white px-2 py-1 rounded border border-purple-300 text-purple-950 font-bold focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <span className="font-bold text-slate-600 shrink-0">💡 Giải thích:</span>
                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => updateQuestionInPreview(q.id, { explanation: e.target.value })}
                      placeholder="Nhập lời giải thích..."
                      className="w-full bg-transparent border-b border-dashed border-slate-300 focus:outline-none text-slate-700 text-[11px]"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= STEP 3: EXAM PARAMETERS & SAVE TO BANK ================= */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <span className="p-2 rounded-xl bg-blue-600 text-white">
                <FolderOpen className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-black text-sm text-white">
                  Cấu hình thông số & Lưu trữ vào Thư mục Khối lớp
                </h4>
                <p className="text-xs text-slate-300">
                  Toàn bộ cấu trúc đề thi sẽ được lưu kiên cố vào cơ sở dữ liệu và hiển thị ngay lập tức trong thư mục của khối lớp.
                </p>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              {/* Exam Title */}
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-300 block">Tên đề thi</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full font-bold px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Grade / Folder Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Lưu vào Thư mục Khối</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full font-bold px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Khối 3">Khối 3</option>
                  <option value="Khối 4">Khối 4</option>
                  <option value="Khối 5">Khối 5</option>
                  <option value="Khối 6">Khối 6</option>
                  <option value="Khối 7">Khối 7</option>
                  <option value="Khối 8">Khối 8</option>
                  <option value="Khối 9">Khối 9</option>
                  <option value="Khối 10">Khối 10</option>
                  <option value="Khối 11">Khối 11</option>
                  <option value="Khối 12">Khối 12</option>
                  <option value="Luyện thi TN THPT">Luyện thi TN THPT</option>
                  <option value="Ôn thi Tuyển sinh 10">Ôn thi Tuyển sinh 10</option>
                </select>
              </div>

              {/* Duration */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Thời gian làm bài</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={durationMin}
                    onChange={(e) => setDurationMin(Math.max(5, parseInt(e.target.value) || 45))}
                    className="w-full font-bold px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-center focus:outline-none"
                  />
                  <span className="text-slate-400 shrink-0 font-medium">phút</span>
                </div>
              </div>

              {/* Max Attempts */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Số lần làm bài tối đa</label>
                <select
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                  className="w-full font-semibold px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none"
                >
                  <option value={0}>Không giới hạn (Luyện tự do)</option>
                  <option value={1}>1 lần duy nhất (Thi chính thức)</option>
                  <option value={2}>2 lần</option>
                  <option value={3}>3 lần</option>
                </select>
              </div>

              {/* Result display mode */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Chế độ xem đáp án</label>
                <select
                  value={showAnswerAfterSubmit ? 'yes' : 'no'}
                  onChange={(e) => setShowAnswerAfterSubmit(e.target.value === 'yes')}
                  className="w-full font-semibold px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="yes">Xem đáp án & giải thích sau nộp</option>
                  <option value="no">Chỉ xem điểm số</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Mức độ phân hóa</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full font-semibold px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="Easy">Easy (Dễ / Nhận biết)</option>
                  <option value="Medium">Medium (Vừa / Thông hiểu)</option>
                  <option value="Hard">Hard (Khó / Vận dụng cao)</option>
                  <option value="Nhận biết - Thông hiểu">Nhận biết - Thông hiểu</option>
                  <option value="Vận dụng cao">Vận dụng cao (Mục tiêu 8-10)</option>
                </select>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const tempExam: ExamItem = {
                      id: `temp-${Date.now()}`,
                      title: examTitle,
                      grade: selectedGrade,
                      subject: 'Tiếng Anh',
                      questionsCount: finalQuestions.length,
                      duration: `${durationMin} phút`,
                      difficulty: selectedDifficulty,
                      topic,
                      submissions: 0,
                      avgScore: 0,
                      createdAt: 'Hôm nay',
                      status: 'Đang mở',
                      questions: finalQuestions
                    };
                    exportExamToWord(tempExam);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <FileDown className="w-4 h-4 text-blue-400" />
                  <span>Xuất file Word (.docx)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveToExamBank}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>💾 Lưu vào Kho đề ({selectedGrade})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
