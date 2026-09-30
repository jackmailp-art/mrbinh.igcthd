import { ExamItem, ExamQuestion } from '../types';
import { formatOptionHtml, inferUnderlinedPart } from './examFormatters';

/**
 * Strips HTML tags from text for plain text representations
 */
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

/**
 * Generates an educational Word Document (.doc / .docx compatible)
 * with separate student test paper and teacher answer key + detailed explanations.
 */
export function exportExamToWord(exam: ExamItem) {
  const titleSafe = exam.title.replace(/[/\\?%*:|"<>]/g, '_');
  const questions = exam.questions || [];

  // Group questions or iterate
  const studentQuestionsHtml = questions.map((q, idx) => {
    const qNum = q.num || idx + 1;
    let content = '';

    // Passage if first in passage block
    if (q.passage && (idx === 0 || questions[idx - 1]?.passage !== q.passage)) {
      content += `
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; margin: 12px 0; border-radius: 6px; font-family: 'Times New Roman', serif;">
          <p style="font-weight: bold; margin-bottom: 6px; color: #1e3a8a;">
            ${q.passageTitle ? q.passageTitle.toUpperCase() : 'READING PASSAGE:'}
          </p>
          <div style="line-height: 1.6; text-align: justify;">${q.passage.replace(/\n/g, '<br/>')}</div>
        </div>
      `;
    }

    // Audio script for teacher/context notice
    if (q.sectionType === 'listening' && q.audioScript && (idx === 0 || questions[idx - 1]?.audioScript !== q.audioScript)) {
      content += `
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0;">
          <p style="font-weight: bold; color: #1e40af; margin: 0 0 4px 0;">[KỸ NĂNG NGHE - ${q.audioTitle || 'AUDIO TRACK'}]</p>
          <p style="font-size: 11pt; color: #475569; margin: 0; font-style: italic;">Học sinh lắng nghe audio và hoàn thành các câu hỏi dưới đây.</p>
        </div>
      `;
    }

    // Question title
    content += `
      <p style="margin: 8px 0 4px 0; line-height: 1.5;">
        <strong>Question ${qNum}:</strong> ${q.question}
        ${q.grammarPoint ? `<span style="color: #64748b; font-size: 10pt; font-style: italic;"> (${q.grammarPoint})</span>` : ''}
      </p>
    `;

    // Arrangement items
    if (q.arrangementItems && q.arrangementItems.length > 0) {
      content += `<div style="margin: 4px 0 6px 16px; font-style: italic; line-height: 1.4;">`;
      q.arrangementItems.forEach((item, aIdx) => {
        content += `<p style="margin: 2px 0;">${item.match(/^[a-z0-9][.)]/i) ? item : `${String.fromCharCode(97 + aIdx)}. ${item}`}</p>`;
      });
      content += `</div>`;
    }

    // Word formation base word
    if (q.baseWord) {
      content += `<p style="margin: 2px 0 4px 16px; color: #1e40af;"><strong>[Từ gốc cho trước: ${q.baseWord.toUpperCase()}]</strong></p>`;
    }

    // Options for multiple choice
    if (q.options && q.options.length > 0) {
      content += `
        <table style="width: 100%; margin: 4px 0 8px 0; border-collapse: collapse;">
          <tr>
            ${q.options.map(opt => `
              <td style="width: ${q.options.length <= 2 ? '50%' : '25%'}; padding: 3px 6px; vertical-align: top; font-size: 11pt;">
                ${formatOptionHtml(opt, q)}
              </td>
            `).join('')}
          </tr>
        </table>
      `;
    } else if (q.questionType === 'essay' || q.essayPrompt) {
      // Essay prompt
      content += `
        <div style="border: 1px dashed #94a3b8; padding: 12px; margin: 8px 0; background-color: #fafafa;">
          <p style="font-weight: bold; color: #0f172a; margin-top: 0;">Yêu cầu viết đoạn văn (${q.essayPrompt?.minWords || 100}-${q.essayPrompt?.maxWords || 140} từ):</p>
          <p style="font-style: italic; margin-bottom: 8px;">"${q.essayPrompt?.topic || q.question}"</p>
          <div style="height: 140px; border-bottom: 1px dotted #94a3b8; line-height: 28px; background-image: linear-gradient(to bottom, transparent 27px, #cbd5e1 28px); background-size: 100% 28px;"></div>
        </div>
      `;
    } else {
      // Short answer writing line
      content += `
        <p style="margin: 4px 0 8px 16px; color: #475569;">
          <em>Trả lời: ......................................................................................................................................................</em>
        </p>
      `;
    }

    return content;
  }).join('');

  // Teacher Answer Matrix
  const answerRows: string[] = [];
  const colCount = 10;
  for (let i = 0; i < questions.length; i += colCount) {
    const chunk = questions.slice(i, i + colCount);
    const headerCells = chunk.map((q, cIdx) => `<th style="border: 1px solid #334155; padding: 6px; background-color: #e2e8f0; font-size: 10pt;">${q.num || i + cIdx + 1}</th>`).join('');
    const ansCells = chunk.map(q => {
      const optLetter = (q.answer || '').match(/^([A-Da-d])/)?.[1]?.toUpperCase() || stripHtml(q.answer || '').slice(0, 5);
      return `<td style="border: 1px solid #334155; padding: 6px; text-align: center; font-weight: bold; color: #1e3a8a; font-size: 11pt;">${optLetter}</td>`;
    }).join('');

    answerRows.push(`
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; text-align: center;">
        <tr>${headerCells}</tr>
        <tr>${ansCells}</tr>
      </table>
    `);
  }

  // Teacher Detailed Explanations Html
  const teacherExplanationsHtml = questions.map((q, idx) => {
    const qNum = q.num || idx + 1;
    return `
      <div style="margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px dashed #cbd5e1;">
        <p style="margin: 2px 0; font-weight: bold; color: #0f172a;">
          Câu ${qNum}: <span style="color: #15803d; font-size: 12pt;">Đáp án: ${stripHtml(q.answer)}</span>
          ${q.grammarPoint ? `<span style="font-weight: normal; color: #64748b; font-size: 10pt;"> [${q.grammarPoint}]</span>` : ''}
        </p>
        ${q.ipaTranscription ? `<p style="margin: 2px 0 4px 0; color: #4338ca; font-family: monospace; font-size: 10.5pt;"><strong>Phiên âm IPA:</strong> ${q.ipaTranscription}</p>` : ''}
        ${q.audioEvidence ? `<p style="margin: 2px 0 4px 0; color: #0369a1; font-size: 10.5pt;"><strong>Dẫn chứng bài nghe (Audio Evidence):</strong> <em>"${q.audioEvidence}"</em></p>` : ''}
        ${q.explanation ? `<p style="margin: 2px 0; color: #334155; font-size: 10.5pt; line-height: 1.5;"><strong>Giải thích sư phạm:</strong> ${q.explanation}</p>` : ''}
        ${q.alternativeAnswers && q.alternativeAnswers.length > 0 ? `<p style="margin: 2px 0; color: #047857; font-size: 10pt;"><strong>Các phương án chấp nhận được:</strong> ${q.alternativeAnswers.join(' / ')}</p>` : ''}
      </div>
    `;
  }).join('');

  // Word Document Template
  const wordHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${exam.title}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 2cm 2cm 2cm 2cm;
          mso-header-margin: 1cm;
          mso-footer-margin: 1cm;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.35;
          color: #111827;
        }
        h1, h2, h3, h4 {
          font-family: 'Times New Roman', Times, serif;
        }
        u {
          text-decoration: underline;
          font-weight: bold;
        }
        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        .header-table td {
          vertical-align: top;
        }
        .student-info-table {
          width: 100%;
          border: 1px solid #334155;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .student-info-table td {
          border: 1px solid #334155;
          padding: 6px 10px;
          font-size: 11pt;
        }
        .page-break {
          page-break-before: always;
          clear: both;
        }
      </style>
    </head>
    <body>
      <!-- TOP PEDAGOGICAL HEADER -->
      <table class="header-table">
        <tr>
          <td style="width: 48%; text-align: center; font-size: 11pt;">
            <strong>SỞ GIÁO DỤC VÀ ĐÀO TẠO</strong><br/>
            <strong>TRƯỜNG THPT / THCS CHUẨN QUỐC GIA</strong><br/>
            <span>ĐỀ THI KHẢO SÁT CHẤT LƯỢNG TIẾNG ANH</span><br/>
            <em>(Đề thi gồm ${Math.max(1, Math.ceil(questions.length / 6))} trang)</em>
          </td>
          <td style="width: 4%;"></td>
          <td style="width: 48%; text-align: center; font-size: 11pt;">
            <strong>KỲ THI KHẢO SÁT HỌC KỲ & ĐỊNH KỲ</strong><br/>
            <strong>BỘ SÁCH: GLOBAL SUCCESS (GDPT 2018)</strong><br/>
            <span>Khối lớp: <strong>${exam.grade || 'Lớp 10'}</strong> - Thời gian: <strong>${exam.duration || '45 phút'}</strong></span><br/>
            <span style="font-size: 10pt; color: #475569;">(Không kể thời gian phát đề)</span>
          </td>
        </tr>
      </table>

      <!-- EXAM TITLE -->
      <div style="text-align: center; margin: 12px 0 16px 0;">
        <h2 style="margin: 0; text-transform: uppercase; font-size: 15pt; color: #0f172a;">${exam.title}</h2>
        <p style="margin: 4px 0 0 0; font-size: 11pt; font-style: italic; color: #334155;">
          Chuyên đề trọng tâm: ${exam.topic || 'Kiến thức tổng hợp SGK Global Success'} • Độ khó: ${exam.difficulty || 'Chuẩn phân hóa'}
        </p>
      </div>

      <!-- STUDENT INFO BOX -->
      <table class="student-info-table">
        <tr>
          <td style="width: 65%;">
            Họ và tên thí sinh: ............................................................................................<br/>
            Lớp: ................................ Số báo danh (Mã HS): ........................................
          </td>
          <td style="width: 35%; text-align: center;">
            <strong>MÃ ĐỀ THI: 10${Math.floor(Math.random() * 8 + 1)}</strong><br/>
            <span style="font-size: 10pt; color: #64748b;">(Thí sinh làm bài trực tiếp vào đề thi)</span>
          </td>
        </tr>
      </table>

      <!-- SECTION I: STUDENT TEST QUESTIONS -->
      <div style="margin-bottom: 24px;">
        <h3 style="background-color: #f1f5f9; padding: 6px 10px; border-left: 5px solid #2563eb; font-size: 13pt; margin: 16px 0 12px 0;">
          PHẦN I: NỘI DUNG ĐỀ BÀI KIỂM TRA (DÀNH CHO HỌC SINH)
        </h3>
        ${studentQuestionsHtml}
      </div>

      <div style="text-align: center; margin: 24px 0; font-weight: bold; font-style: italic; font-size: 11pt;">
        ------------------- HẾT PHẦN ĐỀ BÀI (Cán bộ coi thi không giải thích gì thêm) -------------------
      </div>

      <!-- SECTION II: TEACHER ANSWER KEY & PEDAGOGICAL EXPLANATIONS (SEPARATE PAGE) -->
      <div class="page-break" style="page-break-before: always; mso-break-type: section-break;"></div>

      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; text-transform: uppercase; font-size: 15pt; color: #1e3a8a;">
          ĐÁP ÁN & HƯỚNG DẪN CHẤM CHI TIẾT
        </h2>
        <p style="margin: 4px 0 0 0; font-size: 11pt; font-weight: bold; color: #047857;">
          (DÀNH RIÊNG CHO GIÁO VIÊN & TỔ CHUYÊN MÔN TIẾNG ANH)
        </p>
      </div>

      <h3 style="background-color: #f1f5f9; padding: 6px 10px; border-left: 5px solid #16a34a; font-size: 12pt; margin: 16px 0 8px 0;">
        1. BẢNG MA TRẬN ĐÁP ÁN NHANH (ANSWER KEY TABLE)
      </h3>
      ${answerRows.join('')}

      <h3 style="background-color: #f1f5f9; padding: 6px 10px; border-left: 5px solid #7c3aed; font-size: 12pt; margin: 20px 0 12px 0;">
        2. HƯỚNG DẪN CHẤM & LỜI GIẢI SƯ PHẠM CHI TIẾT TỪNG CÂU
      </h3>
      ${teacherExplanationsHtml}

      <div style="text-align: center; margin-top: 30px; font-size: 10.5pt; color: #64748b;">
        Tài liệu được sinh và chuẩn hóa bởi <strong>Hệ Thống Trợ Lý Khảo Thí Tiếng Anh GDPT 2018 Thầy Bình</strong>.
      </div>
    </body>
    </html>
  `;

  // Create Blob and trigger download
  const blob = new Blob(['\ufeff' + wordHtml], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DE_THI_${exam.grade ? exam.grade.replace(/\s+/g, '_') : 'TIENG_ANH'}_${titleSafe}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers Browser Print Dialog with dedicated Printable Pedagogical Exam Layout
 */
export function printExamSheet(exam: ExamItem) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Vui lòng cho phép mở popup trên trình duyệt để in đề thi.');
    return;
  }

  const questions = exam.questions || [];

  const studentQuestionsHtml = questions.map((q, idx) => {
    const qNum = q.num || idx + 1;
    let content = `
      <div style="margin-bottom: 12px; page-break-inside: avoid;">
        <p style="margin: 4px 0; font-weight: bold; font-size: 13px;">
          Question ${qNum}: <span style="font-weight: normal;">${q.question}</span>
        </p>
    `;

    if (q.options && q.options.length > 0) {
      content += `
        <div style="display: grid; grid-template-columns: repeat(${q.options.length <= 2 ? 2 : 4}, 1fr); gap: 6px; margin: 4px 0 6px 12px; font-size: 13px;">
          ${q.options.map(opt => `<div>${formatOptionHtml(opt, q)}</div>`).join('')}
        </div>
      `;
    } else {
      content += `<p style="margin: 4px 0 6px 12px; font-style: italic; color: #64748b;">Trả lời: ..........................................................................................................................................</p>`;
    }

    content += `</div>`;
    return content;
  }).join('');

  const answerTableCells = questions.map((q, idx) => `
    <div style="border: 1px solid #334155; padding: 4px; text-align: center; font-size: 11px;">
      <div style="background-color: #f1f5f9; font-weight: bold;">${q.num || idx + 1}</div>
      <div style="color: #1e40af; font-weight: bold; margin-top: 2px;">
        ${(q.answer || '').match(/^([A-Da-d])/)?.[1]?.toUpperCase() || stripHtml(q.answer).slice(0, 4)}
      </div>
    </div>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>In Đề Thi - ${exam.title}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: "Times New Roman", Times, serif; color: #111827; font-size: 13px; line-height: 1.4; margin: 0; padding: 0; }
        .page-break { page-break-before: always; }
        u { text-decoration: underline; font-weight: bold; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="background: #1e3a8a; color: white; padding: 10px 16px; margin-bottom: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold;">Bản xem trước khi in đề thi chuẩn A4</span>
        <button onclick="window.print()" style="background: #22c55e; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
          Bấm In Ngay (Print to PDF)
        </button>
      </div>

      <!-- HEADER -->
      <div style="display: flex; justify-content: space-between; text-align: center; margin-bottom: 12px; font-size: 12px;">
        <div style="width: 48%;">
          <strong>SỞ GIÁO DỤC VÀ ĐÀO TẠO</strong><br/>
          <strong>TRƯỜNG THPT / THCS CHUYÊN</strong><br/>
          <span>ĐỀ KHẢO SÁT CHẤT LƯỢNG GDPT 2018</span>
        </div>
        <div style="width: 48%;">
          <strong>BÀI THI MÔN: TIẾNG ANH</strong><br/>
          <strong>KHỐI: ${exam.grade || 'LỚP 10'}</strong><br/>
          <span>Thời gian: ${exam.duration || '45 phút'}</span>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 16px; text-transform: uppercase;">${exam.title}</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; font-style: italic;">Chủ đề: ${exam.topic || 'Global Success'}</p>
      </div>

      <div style="border: 1px solid #334155; padding: 8px 12px; margin-bottom: 16px; font-size: 12px; display: flex; justify-content: space-between;">
        <span>Họ và tên: ............................................................................</span>
        <span>Lớp: ................. SBD: ................</span>
        <span>Mã đề: 101</span>
      </div>

      <!-- QUESTIONS -->
      <div>
        ${studentQuestionsHtml}
      </div>

      <div style="text-align: center; margin: 20px 0; font-style: italic; font-weight: bold;">
        --- HẾT ĐỀ BÀI (Học sinh nộp lại đề sau khi thi) ---
      </div>

      <!-- ANSWER KEY ON NEW PAGE -->
      <div class="page-break"></div>

      <div style="text-align: center; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 16px; text-transform: uppercase; color: #1e3a8a;">
          ĐÁP ÁN & HƯỚNG DẪN CHẤM (GIÁO VIÊN)
        </h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: bold; color: #15803d;">${exam.title}</p>
      </div>

      <h3 style="font-size: 13px; margin: 12px 0 6px 0; border-bottom: 2px solid #3b82f6; padding-bottom: 3px;">
        BẢNG MA TRẬN ĐÁP ÁN NHANH
      </h3>
      <div style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; margin-bottom: 16px;">
        ${answerTableCells}
      </div>

      <h3 style="font-size: 13px; margin: 12px 0 6px 0; border-bottom: 2px solid #7c3aed; padding-bottom: 3px;">
        HƯỚNG DẪN GIẢI CHI TIẾT
      </h3>
      ${questions.map((q, idx) => `
        <div style="margin-bottom: 8px; font-size: 12px; border-bottom: 1px dotted #e2e8f0; padding-bottom: 4px;">
          <strong>Câu ${q.num || idx + 1}:</strong> Đáp án đúng: <strong style="color: #15803d;">${stripHtml(q.answer)}</strong>.
          ${q.explanation ? `<span style="color: #334155;"> ${q.explanation}</span>` : ''}
        </div>
      `).join('')}
    </body>
    </html>
  `);

  printWindow.document.close();
}

/**
 * Exports student exam results report to CSV / Excel with clean cell boundaries and UTF-8 BOM
 */
export function exportStudentResultsToExcel(
  examTitle: string,
  results: {
    studentId: string;
    studentName: string;
    className: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    durationMinutes: number;
    tabSwitches: number;
    status: string;
    submittedAt: string;
    gradeCategory: string;
  }[]
) {
  // Prepend UTF-8 Byte Order Mark (\uFEFF) for native Excel UTF-8 recognition
  const headers = [
    'STT',
    'Mã học sinh',
    'Họ và tên học sinh',
    'Lớp học',
    'Tên đề thi',
    'Điểm số (Thang 10)',
    'Số câu đúng',
    'Thời gian làm bài (Phút)',
    'Số lần thoát tab (Cảnh báo)',
    'Trạng thái nộp bài',
    'Thời điểm nộp',
    'Xếp loại học tập'
  ];

  const rows = results.map((r, idx) => [
    idx + 1,
    r.studentId,
    r.studentName,
    r.className,
    examTitle,
    r.score.toFixed(2),
    `${r.correctCount}/${r.totalQuestions}`,
    `${r.durationMinutes} phút`,
    r.tabSwitches > 0 ? `${r.tabSwitches} lần (Cảnh báo)` : '0 lần (Nghiêm túc)',
    r.status,
    r.submittedAt,
    r.gradeCategory
  ]);

  const csvContent =
    '\uFEFF' +
    [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '');
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = examTitle.replace(/[/\\?%*:|"<>]/g, '_').substring(0, 40);
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `Ket_qua_${safeTitle}_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports single exam to JSON file
 */
export function exportExamToJson(exam: ExamItem) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exam, null, 2));
  const a = document.createElement('a');
  a.href = dataStr;
  const titleSafe = exam.title.replace(/[/\\?%*:|"<>]/g, '_');
  a.download = `EXAM_${titleSafe}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

