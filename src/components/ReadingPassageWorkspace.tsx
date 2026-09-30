import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BookOpen,
  Columns,
  Rows,
  ZoomIn,
  ZoomOut,
  Sparkles,
  X,
  Eye,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Highlighter,
  Eraser
} from 'lucide-react';
import { ExamQuestion } from '../types';
import { formatPassageHtml } from '../utils/examFormatters';

interface ReadingPassageWorkspaceProps {
  passage: string;
  passageTitle?: string;
  sectionType?: string;
  relatedQuestions: ExamQuestion[];
  children: React.ReactNode;
  selectedAnswers?: Record<number, string>;
  totalExamQuestions?: number;
}

interface ContextMenuState {
  x: number;
  y: number;
  isFlippedBelow: boolean;
  range: Range;
  selectedText: string;
}

export const ReadingPassageWorkspace: React.FC<ReadingPassageWorkspaceProps> = ({
  passage,
  passageTitle,
  sectionType,
  relatedQuestions,
  children,
  selectedAnswers,
  totalExamQuestions,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const passageRef = useRef<HTMLDivElement>(null);
  const mobilePassageRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [splitMode, setSplitMode] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [highlightKeywords, setHighlightKeywords] = useState<boolean>(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [isCornerCollapsed, setIsCornerCollapsed] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(true);

  // Mouse selection context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [highlightCount, setHighlightCount] = useState<number>(0);

  // Monitor visibility of reading comprehension workspace so the corner widget is only shown when in this section
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '120px 0px 120px 0px',
        threshold: [0, 0.05, 0.15],
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Dismiss context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstNum = relatedQuestions[0]?.num;
  const lastNum = relatedQuestions[relatedQuestions.length - 1]?.num;
  const questionRangeLabel = firstNum && lastNum ? `Questions ${firstNum} - ${lastNum}` : 'Reading Passage';

  // Completion calculation for this specific reading passage
  const passageTotal = relatedQuestions.length;
  const passageAnswered = useMemo(() => {
    if (!selectedAnswers) return 0;
    return relatedQuestions.filter((q) => {
      const ans = selectedAnswers[q.num];
      return ans !== undefined && ans !== null && String(ans).trim().length > 0;
    }).length;
  }, [relatedQuestions, selectedAnswers]);

  const passagePercentage = passageTotal > 0 ? Math.round((passageAnswered / passageTotal) * 100) : 0;

  // Completion calculation for the overall exam
  const examTotal = totalExamQuestions || passageTotal;
  const examAnswered = useMemo(() => {
    if (!selectedAnswers) return 0;
    return Object.values(selectedAnswers).filter(
      (v) => v !== undefined && v !== null && String(v).trim().length > 0
    ).length;
  }, [selectedAnswers]);

  const examPercentage = examTotal > 0 ? Math.round((examAnswered / examTotal) * 100) : 0;

  const isCloze = sectionType === 'cloze_reading';
  const defaultTitle = isCloze
    ? 'Bài đọc điền từ khuyết (Cloze Reading Passage)'
    : 'Bài đọc hiểu (Reading Comprehension Passage)';

  const formattedHtml = formatPassageHtml(passage, relatedQuestions, highlightKeywords);

  const fontSizeClass = {
    sm: 'text-xs leading-relaxed',
    base: 'text-sm leading-relaxed',
    lg: 'text-base leading-loose',
  }[fontSize];

  // Handle user mouse text selection inside the passage
  const handleTextSelection = (targetContainer: HTMLDivElement | null) => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setContextMenu(null);
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length === 0) {
        setContextMenu(null);
        return;
      }

      if (!targetContainer) return;

      if (
        targetContainer.contains(selection.anchorNode) &&
        targetContainer.contains(selection.focusNode)
      ) {
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) {
            setContextMenu(null);
            return;
          }
          const isFlippedBelow = rect.top < 85;
          setContextMenu({
            x: Math.max(140, Math.min(window.innerWidth - 140, rect.left + rect.width / 2)),
            y: isFlippedBelow ? rect.bottom + 10 : rect.top - 10,
            isFlippedBelow,
            range: range.cloneRange(),
            selectedText: text,
          });
        } catch {
          setContextMenu(null);
        }
      } else {
        setContextMenu(null);
      }
    }, 20);
  };

  // Apply user custom highlight
  const applyHighlight = (color: 'yellow' | 'green' | 'blue' = 'yellow') => {
    if (!contextMenu?.range) return;

    const colorClasses = {
      yellow: 'bg-yellow-200/90 text-amber-950 border-b-2 border-yellow-400',
      green: 'bg-emerald-200/90 text-emerald-950 border-b-2 border-emerald-400',
      blue: 'bg-sky-200/90 text-sky-950 border-b-2 border-sky-400',
    }[color];

    try {
      const span = document.createElement('mark');
      span.className = `user-custom-highlight ${colorClasses} px-1 py-0.5 rounded shadow-2xs font-medium transition-colors cursor-pointer`;
      span.title = 'Nhấn vào đoạn tô này để xóa';

      // Click to remove this individual highlight
      span.onclick = (e) => {
        e.stopPropagation();
        const parent = span.parentNode;
        while (span.firstChild) {
          parent?.insertBefore(span.firstChild, span);
        }
        parent?.removeChild(span);
        parent?.normalize();
        setHighlightCount((c) => Math.max(0, c - 1));
      };

      try {
        contextMenu.range.surroundContents(span);
      } catch {
        span.appendChild(contextMenu.range.extractContents());
        contextMenu.range.insertNode(span);
      }

      setHighlightCount((c) => c + 1);
      window.getSelection()?.removeAllRanges();
      setContextMenu(null);
    } catch (err) {
      console.warn('Could not apply highlight:', err);
      setContextMenu(null);
    }
  };

  // Clear text selection
  const clearSelection = () => {
    window.getSelection()?.removeAllRanges();
    setContextMenu(null);
  };

  // Clear all custom highlights created by the student
  const clearAllCustomHighlights = () => {
    [passageRef.current, mobilePassageRef.current].forEach((container) => {
      if (!container) return;
      const marks = container.querySelectorAll('.user-custom-highlight');
      marks.forEach((mark) => {
        const parent = mark.parentNode;
        while (mark.firstChild) {
          parent?.insertBefore(mark.firstChild, mark);
        }
        parent?.removeChild(mark);
      });
      container.normalize();
    });
    setHighlightCount(0);
    setContextMenu(null);
  };

  return (
    <div ref={containerRef} className="space-y-4 my-2 relative">
      {/* Mobile Floating Quick-View Button (for screens < lg) */}
      <div className="lg:hidden sticky top-2 z-20 flex justify-center py-1">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg text-xs font-bold flex items-center gap-2 border-2 border-white transition transform active:scale-95"
        >
          <BookOpen className="w-4 h-4" />
          <span>Xem bài đọc ({questionRangeLabel})</span>
          <span className="bg-amber-800/80 px-2 py-0.5 rounded-full text-[10px] font-black">
            {passageAnswered}/{passageTotal} ({passagePercentage}%)
          </span>
          <Eye className="w-3.5 h-3.5 text-amber-200" />
        </button>
      </div>

      {/* Main Container: Split 2-column or Single column */}
      <div className={splitMode ? 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-start' : 'space-y-4'}>
        {/* Passage Column (Sticky on large screens when splitMode is true) */}
        <div
          className={
            splitMode
              ? 'lg:col-span-5 lg:sticky lg:top-20 transition-all'
              : 'w-full'
          }
        >
          <div
            className={`bg-gradient-to-br from-amber-50/95 via-amber-100/40 to-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col ${
              splitMode
                ? 'lg:h-[calc(100vh-140px)] lg:min-h-[460px]'
                : 'space-y-3'
            }`}
          >
            {/* Header with Title & Badges */}
            <div className="flex-shrink-0 flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-amber-200/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm">
                    {passageTitle || defaultTitle}
                  </h4>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                    Áp dụng cho {questionRangeLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Passage Progress Chip */}
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/95 rounded-lg border border-amber-200 shadow-2xs"
                  title={`Đã hoàn thành ${passageAnswered}/${passageTotal} câu (${passagePercentage}%)`}
                >
                  <span className="text-[10px] text-amber-800 font-bold uppercase hidden sm:inline">Tiến độ:</span>
                  <span className="text-xs font-black text-amber-950">{passageAnswered}/{passageTotal}</span>
                  <div className="w-12 bg-amber-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        passagePercentage === 100 ? 'bg-emerald-500' : 'bg-amber-600'
                      }`}
                      style={{ width: `${passagePercentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-amber-900">{passagePercentage}%</span>
                </div>

                {/* Font Size Zoom Controls */}
                <div className="inline-flex items-center bg-white/90 rounded-lg p-0.5 border border-amber-200 shadow-2xs">
                  <button
                    type="button"
                    title="Giảm cỡ chữ"
                    onClick={() => setFontSize(fontSize === 'lg' ? 'base' : 'sm')}
                    className={`p-1 rounded hover:bg-amber-100 text-amber-900 ${fontSize === 'sm' ? 'opacity-40' : ''}`}
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold px-1.5 text-amber-950">A</span>
                  <button
                    type="button"
                    title="Tăng cỡ chữ"
                    onClick={() => setFontSize(fontSize === 'sm' ? 'base' : 'lg')}
                    className={`p-1 rounded hover:bg-amber-100 text-amber-900 ${fontSize === 'lg' ? 'opacity-40' : ''}`}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Highlight Keywords Toggle */}
                <button
                  type="button"
                  title="Bật/Tắt tô đậm từ khóa được hỏi"
                  onClick={() => setHighlightKeywords(!highlightKeywords)}
                  className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    highlightKeywords
                      ? 'bg-amber-200/90 border-amber-400 text-amber-950 shadow-2xs'
                      : 'bg-white/80 border-amber-200 text-slate-600 hover:bg-amber-50'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  <span className="hidden sm:inline">Từ in đậm</span>
                </button>

                {/* Clear Custom Highlights Button (when user has created highlights) */}
                {highlightCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllCustomHighlights}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-950 text-[10px] font-bold transition shadow-2xs cursor-pointer animate-in fade-in"
                    title="Xóa tất cả các đoạn tô sáng của bạn"
                  >
                    <Eraser className="w-3 h-3 text-amber-800" />
                    <span>Xóa tô ({highlightCount})</span>
                  </button>
                )}

                {/* Split vs Vertical Layout Toggle (Desktop) */}
                <button
                  type="button"
                  title={splitMode ? 'Chuyển sang dạng dọc' : 'Chuyển sang dạng 2 cột cuộn độc lập'}
                  onClick={() => setSplitMode(!splitMode)}
                  className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-200 bg-white/90 hover:bg-amber-100 text-[10px] font-bold text-amber-900 shadow-2xs transition cursor-pointer"
                >
                  {splitMode ? (
                    <>
                      <Rows className="w-3 h-3 text-amber-700" />
                      <span>Dạng dọc</span>
                    </>
                  ) : (
                    <>
                      <Columns className="w-3 h-3 text-amber-700" />
                      <span>Cuộn 2 cột</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Passage Body - Independent scroll with overflow-y: auto */}
            <div
              ref={passageRef}
              onMouseUp={() => handleTextSelection(passageRef.current)}
              onTouchEnd={() => handleTextSelection(passageRef.current)}
              className={`bg-white/95 p-4 sm:p-5 rounded-xl border border-amber-200/80 font-serif text-slate-800 whitespace-pre-line shadow-inner reading-passage-scroll my-2.5 overflow-y-auto overscroll-contain flex-1 select-text ${
                splitMode
                  ? 'min-h-[240px]'
                  : 'max-h-[420px]'
              } ${fontSizeClass}`}
              dangerouslySetInnerHTML={{ __html: formattedHtml }}
            />

            {/* Footer helper notice */}
            <div className="flex-shrink-0 flex items-center justify-between text-[11px] text-amber-800/80 px-1 pt-0.5">
              <span>💡 Dùng chuột bôi đen văn bản để Tô sáng (Highlight) hoặc Bỏ chọn.</span>
              {highlightCount > 0 ? (
                <span className="font-semibold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                  Đã tô {highlightCount} vị trí (nhấn vào chữ đã tô để gỡ)
                </span>
              ) : highlightKeywords && (
                <span className="font-semibold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                  Các từ khóa đã được in đậm & đánh dấu
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Questions Column - Independent scrollable container with overflow-y: auto */}
        <div
          className={
            splitMode
              ? 'lg:col-span-7 lg:sticky lg:top-20 lg:h-[calc(100vh-140px)] lg:min-h-[460px] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 space-y-4 reading-questions-scroll pb-10'
              : 'w-full space-y-4'
          }
        >
          {splitMode && (
            <div className="hidden lg:flex items-center justify-between px-3 py-1.5 bg-slate-100/90 border border-slate-200/80 rounded-xl text-xs text-slate-600 font-semibold mb-2">
              <span className="flex items-center gap-1.5">
                <span>📝 Questions ({questionRangeLabel})</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Cuộn phần này để trả lời từng câu
              </span>
            </div>
          )}
          {children}
        </div>
      </div>

      {/* Context Menu for Text Selection (Highlight / Clear Selection) */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            transform: contextMenu.isFlippedBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
          }}
          className="fixed z-50 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-1.5 shadow-2xl border border-slate-700/80 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          {/* Highlight Button */}
          <button
            type="button"
            onClick={() => applyHighlight('yellow')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition active:scale-95 shadow-sm cursor-pointer"
            title="Tô sáng màu vàng"
          >
            <Highlighter className="w-3.5 h-3.5 text-slate-950" />
            <span>Tô sáng (Highlight)</span>
          </button>

          {/* Quick Color Swatches */}
          <div className="flex items-center gap-1 px-1">
            <button
              type="button"
              onClick={() => applyHighlight('green')}
              className="w-5 h-5 rounded-full bg-emerald-400 hover:scale-115 transition cursor-pointer border border-emerald-600/40"
              title="Tô màu xanh lá"
            />
            <button
              type="button"
              onClick={() => applyHighlight('blue')}
              className="w-5 h-5 rounded-full bg-sky-400 hover:scale-115 transition cursor-pointer border border-sky-600/40"
              title="Tô màu xanh lam"
            />
          </div>

          <div className="h-4 w-px bg-slate-700 my-auto" />

          {/* Clear Selection Button */}
          <button
            type="button"
            onClick={clearSelection}
            className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer"
            title="Hủy vùng chọn văn bản"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
            <span>Bỏ chọn (Clear Selection)</span>
          </button>

          {/* Triangle Pointer */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent ${
              contextMenu.isFlippedBelow
                ? 'bottom-full border-b-6 border-b-slate-900/95'
                : 'top-full border-t-6 border-t-slate-900/95'
            }`}
          />
        </div>
      )}

      {/* Floating Corner Progress Indicator (Corner of screen for Reading Comprehension) */}
      {isInView && (
        <aside
          aria-label="Tiến độ bài đọc hiểu"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300 select-none"
        >
          {isCornerCollapsed ? (
            /* Minimized Pill Button */
            <button
              type="button"
              onClick={() => setIsCornerCollapsed(false)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-full shadow-lg shadow-amber-950/20 border border-white/20 text-xs font-bold transition transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Nhấn để mở rộng chi tiết tiến độ bài đọc"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bài đọc: {passageAnswered}/{passageTotal} ({passagePercentage}%)</span>
              <ChevronUp className="w-3.5 h-3.5 text-amber-200" />
            </button>
          ) : (
            /* Expanded Floating Progress Card */
            <div className="bg-white/95 backdrop-blur-md border border-amber-200/90 rounded-2xl p-3.5 shadow-xl shadow-amber-950/15 flex items-center gap-3.5 min-w-[250px] max-w-xs transition-all ring-1 ring-black/5">
              {/* Circular Progress Gauge */}
              <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    className="text-amber-100 stroke-current"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    className={`${
                      passagePercentage === 100 ? 'text-emerald-500' : 'text-amber-600'
                    } stroke-current transition-all duration-300`}
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - passagePercentage / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-black text-slate-800 leading-none">
                    {passagePercentage}%
                  </span>
                </div>
              </div>

              {/* Details & Stats */}
              <div className="flex-1 min-w-[140px]">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-amber-700" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-950">
                      Tiến độ bài đọc
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCornerCollapsed(true)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition cursor-pointer"
                    title="Thu gọn"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-1 flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-slate-600">Đã trả lời:</span>
                  <span className="font-extrabold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                    {passageAnswered}/{passageTotal} câu ({passagePercentage}%)
                  </span>
                </div>

                {totalExamQuestions && totalExamQuestions > passageTotal && (
                  <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Toàn bộ đề:</span>
                    <span className="font-semibold text-slate-700">
                      {examAnswered}/{examTotal} câu ({examPercentage}%)
                    </span>
                  </div>
                )}

                {/* Mini progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1.5">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      passagePercentage === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-amber-600'
                    }`}
                    style={{ width: `${passagePercentage}%` }}
                  />
                </div>

                {passagePercentage === 100 && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-700 animate-in fade-in">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Đã hoàn thành bài đọc! 🎉</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Mobile Modal/Drawer for full passage viewing */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-amber-200">
            {/* Modal Header */}
            <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <div>
                  <span className="font-extrabold text-amber-950 text-sm block">
                    {passageTitle || defaultTitle}
                  </span>
                  <span className="text-[10px] font-bold text-amber-800">
                    Tiến độ: {passageAnswered}/{passageTotal} câu ({passagePercentage}%)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-white border border-amber-300 text-slate-600 flex items-center justify-center hover:bg-amber-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div
              ref={mobilePassageRef}
              onMouseUp={() => handleTextSelection(mobilePassageRef.current)}
              onTouchEnd={() => handleTextSelection(mobilePassageRef.current)}
              className={`p-4 sm:p-5 overflow-y-auto reading-passage-scroll font-serif leading-relaxed text-slate-800 whitespace-pre-line select-text ${fontSizeClass}`}
              dangerouslySetInnerHTML={{ __html: formattedHtml }}
            />

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950">
                Đã làm: {passageAnswered}/{passageTotal} ({passagePercentage}%)
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Đã đọc xong, quay lại câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
