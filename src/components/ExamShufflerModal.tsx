import React, { useState, useEffect, useMemo } from 'react';
import {
  Shuffle,
  CheckCircle2,
  Download,
  Printer,
  Save,
  RefreshCw,
  X,
  FileText,
  Check,
  Layers,
  Sparkles,
  HelpCircle,
  Copy,
  Table,
  ArrowRight
} from 'lucide-react';
import { ExamItem } from '../types';
import {
  generate4ExamVersions,
  ExamShufflerResult,
  ShuffledExamVersion
} from '../services/examService';
import { exportExamToWord, printExamSheet } from '../utils/exportExamDocs';
import { formatQuestionHtml } from '../utils/examFormatters';

interface ExamShufflerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamItem | null;
  onSaveExamVersions?: (versions: ExamItem[]) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const ExamShufflerModal: React.FC<ExamShufflerModalProps> = ({
  isOpen,
  onClose,
  exam,
  onSaveExamVersions,
  onShowToast,
}) => {
  // Configurable Exam Codes
  const [codeInputs, setCodeInputs] = useState<[string, string, string, string]>(['101', '102', '103', '104']);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);

  // Result state
  const [shufflerResult, setShufflerResult] = useState<ExamShufflerResult | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | string>('matrix');
  const [isSavedToBank, setIsSavedToBank] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Initialize or re-generate when exam changes or modal opens
  useEffect(() => {
    if (isOpen && exam) {
      handleGenerate();
      setIsSavedToBank(false);
    }
  }, [isOpen, exam]);

  if (!isOpen || !exam) return null;

  const handleGenerate = () => {
    try {
      const result = generate4ExamVersions(exam, codeInputs, {
        shuffleQuestions,
        shuffleOptions,
      });
      setShufflerResult(result);
      setIsSavedToBank(false);
      setActiveTab('matrix');
    } catch (err) {
      console.error('Failed to shuffle exam:', err);
    }
  };

  const handleSaveAllToBank = () => {
    if (!shufflerResult) return;
    const versionsToSave = shufflerResult.versions.map((v) => v.exam);

    if (onSaveExamVersions) {
      onSaveExamVersions(versionsToSave);
    } else {
      // Direct LocalStorage fallback
      try {
        const bankStr = localStorage.getItem('EDUADMIN_EXAM_BANK');
        let bank: ExamItem[] = bankStr ? JSON.parse(bankStr) : [];
        versionsToSave.forEach((newV) => {
          bank = bank.filter((e) => e.id !== newV.id);
          bank.unshift(newV);
        });
        localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(bank));
        localStorage.setItem('eng_exams_v1', JSON.stringify(bank));
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    }

    setIsSavedToBank(true);
    if (onShowToast) {
      onShowToast(`Đã lưu thành công 4 mã đề (${shufflerResult.codes.join(', ')}) vào kho đề thi!`, 'success');
    }
  };

  const handleExportWordVersion = (version: ShuffledExamVersion) => {
    exportExamToWord(version.exam);
    if (onShowToast) {
      onShowToast(`Đã xuất đề thi mã ${version.code} ra file Word!`, 'success');
    }
  };

  const handleExportAllWord = () => {
    if (!shufflerResult) return;
    shufflerResult.versions.forEach((v, idx) => {
      setTimeout(() => {
        exportExamToWord(v.exam);
      }, idx * 400);
    });
    if (onShowToast) {
      onShowToast('Đang tải về toàn bộ 4 file Word cho 4 mã đề...', 'info');
    }
  };

  const handlePrintMatrix = () => {
    if (!shufflerResult) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cho phép mở cửa sổ popup để in Bảng Đáp Án.');
      return;
    }

    const rowsHtml = shufflerResult.matrixAnswerKey
      .map(
        (row) => `
      <tr>
        <td style="text-align: center; font-weight: bold; padding: 6px; border: 1px solid #cbd5e1;">${row.num}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-size: 11pt; color: #334155;">${row.questionPreview || `Question ${row.num}`}</td>
        ${shufflerResult.codes
          .map(
            (c) => `
          <td style="text-align: center; font-weight: bold; font-size: 12pt; padding: 6px; border: 1px solid #cbd5e1; color: #1e3a8a;">
            ${row.answers[c] || '-'}
          </td>
        `
          )
          .join('')}
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bảng Ma Trận Đáp Án 4 Mã Đề - ${exam.title}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 30px; color: #0f172a; }
            h2, h3 { text-align: center; margin: 4px 0; }
            .header-info { text-align: center; font-size: 11pt; color: #475569; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #f1f5f9; border: 1px solid #94a3b8; padding: 8px; font-size: 11pt; }
            td { font-size: 11pt; }
            .footer { margin-top: 30px; text-align: right; font-style: italic; font-size: 10pt; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h2>BẢNG MA TRẬN ĐÁP ÁN 4 MÃ ĐỀ THI HOÁN VỊ</h2>
          <h3>${exam.title.toUpperCase()}</h3>
          <div class="header-info">
            Khối lớp: ${exam.grade || 'Lớp 10'} • Thời gian: ${exam.duration || '45 phút'} • Tổng số câu: ${shufflerResult.matrixAnswerKey.length} câu • Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">Câu</th>
                <th>Nội dung câu hỏi tóm lược</th>
                ${shufflerResult.codes.map((c) => `<th style="width: 80px;">Mã ${c}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            Hệ thống Khảo thí Giáo dục Tiếng Anh Global Success GDPT 2018
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyAnswerKey = (version: ShuffledExamVersion) => {
    const text = version.answerKey.map((k) => `${k.num}.${k.letter}`).join('  |  ');
    navigator.clipboard.writeText(text);
    setCopiedCode(version.code);
    setTimeout(() => setCopiedCode(null), 2000);
    if (onShowToast) {
      onShowToast(`Đã sao chép đáp án mã đề ${version.code} vào Clipboard!`, 'info');
    }
  };

  // Color mapper for letters A, B, C, D
  const getLetterBadgeClass = (letter: string) => {
    switch (letter.toUpperCase()) {
      case 'A':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'D':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white flex items-center justify-between border-b border-indigo-800/40 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <Shuffle className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] font-black border border-indigo-400/30 uppercase tracking-wide">
                  Exam Shuffler Engine
                </span>
                <span className="text-xs text-indigo-300/90 font-medium">
                  Trộn 4 Mã Đề Tự Động & Bảng Đáp Án Ma Trận
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5 leading-snug line-clamp-1">
                {exam.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Strip */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Custom 4 Code Inputs */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <span>Mã đề tạo:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {codeInputs.map((code, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={5}
                  value={code}
                  onChange={(e) => {
                    const next = [...codeInputs] as [string, string, string, string];
                    next[idx] = e.target.value.trim().toUpperCase();
                    setCodeInputs(next);
                  }}
                  className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-black text-indigo-900 text-xs shadow-2xs focus:outline-none focus:border-indigo-500"
                />
              ))}
            </div>
          </div>

          {/* Permutation Toggles */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 flex-wrap">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm accent-indigo-600 cursor-pointer"
              />
              <span>Hoán vị thứ tự câu hỏi</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleOptions}
                onChange={(e) => setShuffleOptions(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm accent-indigo-600 cursor-pointer"
              />
              <span>Hoán vị phương án A, B, C, D</span>
            </label>

            {/* Re-generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Trộn lại (Reshuffle)</span>
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 pt-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'matrix'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Table className="w-4 h-4 text-indigo-600" />
              <span>Bảng Ma Trận Đáp Án 4 Mã Đề</span>
            </button>

            {shufflerResult?.versions.map((ver) => (
              <button
                key={ver.code}
                type="button"
                onClick={() => setActiveTab(ver.code)}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition flex items-center gap-2 border-b-2 cursor-pointer ${
                  activeTab === ver.code
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Mã Đề {ver.code}</span>
              </button>
            ))}
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2 pb-1.5">
            <button
              type="button"
              onClick={handlePrintMatrix}
              title="In Bảng Ma Trận Đáp Án cho 4 mã đề"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>In Đáp Án</span>
            </button>

            <button
              type="button"
              onClick={handleExportAllWord}
              title="Tải về trọn bộ 4 file Word cho 4 mã đề"
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-emerald-300 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất Word 4 Mã Đề</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAllToBank}
              disabled={isSavedToBank}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                isSavedToBank
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/20 active:scale-95'
              }`}
            >
              {isSavedToBank ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã lưu vào kho đề</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu 4 mã vào kho đề</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {shufflerResult && (
            <>
              {/* ================= TAB 1: BẢNG MA TRẬN ĐÁP ÁN ================= */}
              {activeTab === 'matrix' && (
                <div className="space-y-4">
                  {/* Summary Banner */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                      <div>
                        <div className="font-extrabold text-indigo-950 text-sm">
                          Ma Trận Khảo Thí 4 Mã Đề Hoán Vị
                        </div>
                        <p className="text-slate-600 mt-0.5">
                          Tất cả các câu hỏi và phương án A-D đã được hoán vị ngẫu nhiên. Thứ tự bài đọc hiểu được bảo toàn nguyên vẹn.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {shufflerResult.codes.map((c) => (
                        <span key={c} className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 font-black text-indigo-900 shadow-2xs">
                          Mã {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Matrix Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="max-h-[58vh] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[11px] tracking-wider sticky top-0 z-10 border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4 w-16 text-center">Câu</th>
                            <th className="py-3 px-4">Nội dung câu hỏi tóm lược</th>
                            {shufflerResult.codes.map((code) => (
                              <th key={code} className="py-3 px-4 w-28 text-center bg-indigo-50/70 text-indigo-900">
                                Mã {code}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {shufflerResult.matrixAnswerKey.map((row) => (
                            <tr key={row.num} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-4 text-center font-black text-slate-800 bg-slate-50/40">
                                {row.num}
                              </td>
                              <td className="py-2.5 px-4 text-slate-700">
                                <span className="font-bold text-slate-900 mr-1.5">Question {row.num}:</span>
                                <span className="line-clamp-1">{row.questionPreview}</span>
                              </td>
                              {shufflerResult.codes.map((code) => {
                                const letter = row.answers[code] || '-';
                                return (
                                  <td key={code} className="py-2.5 px-4 text-center">
                                    <span
                                      className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-black text-xs border shadow-2xs ${getLetterBadgeClass(
                                        letter
                                      )}`}
                                    >
                                      {letter}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 2..5: CHI TIẾT TỪNG MÃ ĐỀ ================= */}
              {activeTab !== 'matrix' && (() => {
                const currentVersion = shufflerResult.versions.find((v) => v.code === activeTab);
                if (!currentVersion) return null;

                return (
                  <div className="space-y-4">
                    {/* Top Version Banner & Quick Answer Key */}
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                            {currentVersion.code}
                          </span>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-base">
                              {currentVersion.exam.title}
                            </h3>
                            <p className="text-xs text-slate-500">
                              Tổng cộng {currentVersion.exam.questions.length} câu hỏi • Hoán vị câu hỏi & phương án lựa chọn
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyAnswerKey(currentVersion)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                          >
                            {copiedCode === currentVersion.code ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Đã sao chép!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Sao chép đáp án</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExportWordVersion(currentVersion)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Xuất Word (.docx)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => printExamSheet(currentVersion.exam)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>In Đề Thi</span>
                          </button>
                        </div>
                      </div>

                      {/* Horizontal Strip of Answer Key */}
                      <div>
                        <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                          Khóa Đáp Án Nhanh Mã Đề {currentVersion.code}:
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                          {currentVersion.answerKey.map((item) => (
                            <div
                              key={item.num}
                              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-extrabold flex items-center gap-1 shadow-2xs"
                            >
                              <span className="text-slate-500 text-[10px]">{item.num}.</span>
                              <span className="text-indigo-700">{item.letter}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Question List of This Version */}
                    <div className="space-y-3">
                      {currentVersion.exam.questions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                                {q.num}
                              </span>
                              <strong className="font-extrabold text-sm text-slate-900 tracking-tight">
                                Question {q.num}:
                              </strong>
                              {q.sectionType && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                                  {q.sectionType}
                                </span>
                              )}
                              {q.grammarPoint && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  {q.grammarPoint}
                                </span>
                              )}
                            </div>

                            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Đáp án: {q.answer}
                            </span>
                          </div>

                          {/* Reading passage if attached */}
                          {q.passage && (
                            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs font-serif text-slate-800 whitespace-pre-line max-h-32 overflow-y-auto">
                              {q.passage}
                            </div>
                          )}

                          {/* Question Content */}
                          <div
                            className="font-bold text-sm text-slate-900 leading-snug"
                            dangerouslySetInnerHTML={{ __html: formatQuestionHtml(q.question) }}
                          />

                          {/* Options */}
                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = q.answer && (opt === q.answer || opt.startsWith(q.answer.slice(0, 2)));
                                return (
                                  <div
                                    key={oIdx}
                                    className={`p-2.5 rounded-xl border font-medium flex items-start gap-2 ${
                                      isCorrect
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isCorrect && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0 mt-0.5" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Explanation */}
                          {q.explanation && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                              <span className="font-bold text-slate-800">Lời giải: </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Hệ thống hoán vị thuật toán Fisher-Yates tối ưu • Bảo toàn cấu trúc câu hỏi đọc hiểu và bài nghe
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveAllToBank}
              disabled={isSavedToBank}
              className={`px-5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-xs cursor-pointer ${
                isSavedToBank
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
              }`}
            >
              {isSavedToBank ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã lưu cả 4 mã đề vào kho đề</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu 4 mã đề vào kho đề</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
