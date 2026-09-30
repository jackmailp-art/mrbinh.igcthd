import * as XLSX from 'xlsx';
import { ClassItem, ExamItem, StudentItem, SubmissionItem } from '../types';

export interface ExportReportOptions {
  targetClassId: string | 'ALL';
  classes: ClassItem[];
  students: StudentItem[];
  exams?: ExamItem[];
  submissions?: SubmissionItem[];
  reportType?: 'full_multisheet' | 'roster_scores' | 'exam_matrix' | 'submissions_log';
  statusFilter?: string; // 'ALL', 'Xuất sắc', etc.
  customFileName?: string;
}

export interface ExportSummary {
  studentCount: number;
  classCount: number;
  examCount: number;
  submissionCount: number;
  fileName: string;
}

/**
 * Helper to normalize string for comparison
 */
function normalizeText(text?: string): string {
  if (!text) return '';
  return text.toLowerCase().trim();
}

/**
 * Filter students belonging to target class
 */
export function getFilteredStudentsForClass(
  students: StudentItem[],
  classes: ClassItem[],
  targetClassId: string | 'ALL'
): { targetStudents: StudentItem[]; activeClass: ClassItem | null } {
  if (targetClassId === 'ALL') {
    return { targetStudents: students, activeClass: null };
  }

  const activeClass = classes.find(c => c.id === targetClassId) || null;
  const targetStudents = students.filter(s => {
    if (s.classId === targetClassId) return true;
    if (activeClass && s.className && normalizeText(s.className) === normalizeText(activeClass.name)) {
      return true;
    }
    return false;
  });

  return { targetStudents, activeClass };
}

/**
 * Main function to generate and download Excel (.xlsx) report for Class and Exam Scores
 */
export function exportClassReportToExcel(options: ExportReportOptions): ExportSummary {
  const {
    targetClassId,
    classes,
    students,
    exams = [],
    submissions = [],
    reportType = 'full_multisheet',
    statusFilter = 'ALL',
    customFileName
  } = options;

  // 1. Identify target class and students
  const { targetStudents, activeClass } = getFilteredStudentsForClass(students, classes, targetClassId);

  // Apply optional status filter
  const finalStudents = targetStudents.filter(s => {
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  // 2. Filter relevant exams and submissions
  const relevantClassIds = new Set<string>();
  if (activeClass) {
    relevantClassIds.add(activeClass.id);
  } else {
    classes.forEach(c => relevantClassIds.add(c.id));
  }

  // Find submissions for these students
  const studentIds = new Set(finalStudents.map(s => s.studentId).filter(Boolean));
  const studentPhones = new Set(finalStudents.map(s => s.phone).filter(p => p && p !== 'Chưa cập nhật'));
  const studentNames = new Set(finalStudents.map(s => normalizeText(s.name)));

  const relevantSubmissions = submissions.filter(sub => {
    if (sub.studentId && studentIds.has(sub.studentId)) return true;
    if (sub.studentPhone && studentPhones.has(sub.studentPhone)) return true;
    if (studentNames.has(normalizeText(sub.studentName))) return true;
    if (sub.classId && relevantClassIds.has(sub.classId)) return true;
    if (activeClass && sub.className && normalizeText(sub.className) === normalizeText(activeClass.name)) return true;
    return false;
  });

  // Unique exams relevant to these students or submissions
  const examMap = new Map<string, ExamItem>();
  exams.forEach(e => {
    const isAssigned = e.assignedClassIds?.some(cid => relevantClassIds.has(cid)) ||
      (activeClass && e.assignedClasses?.some(cname => normalizeText(cname) === normalizeText(activeClass.name))) ||
      targetClassId === 'ALL';
    if (isAssigned) {
      examMap.set(e.id, e);
    }
  });

  // Also include exams present in submissions
  relevantSubmissions.forEach(sub => {
    if (!examMap.has(sub.examId)) {
      const foundExam = exams.find(e => e.id === sub.examId);
      if (foundExam) {
        examMap.set(foundExam.id, foundExam);
      } else {
        // Fallback placeholder exam item
        examMap.set(sub.examId, {
          id: sub.examId,
          title: sub.examTitle || 'Bài kiểm tra',
          grade: activeClass?.grade || 'Khối chung',
          subject: 'Tiếng Anh',
          questionsCount: sub.totalQuestions || 10,
          duration: '45 phút',
          submissions: 1,
          avgScore: sub.score,
          createdAt: sub.submittedAt || '',
          status: 'Đã đóng',
          questions: []
        });
      }
    }
  });

  const relevantExams = Array.from(examMap.values());

  // Determine file naming
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const classLabel = activeClass ? activeClass.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Toan_Truong';
  const defaultFileName = `Bao_Cao_Lop_Va_Diem_Thi_${classLabel}_${dateStr}.xlsx`;
  const exportFileName = customFileName || defaultFileName;

  // Initialize Workbook
  const workbook = XLSX.utils.book_new();
  const nowFormatted = new Date().toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // =========================================================================
  // SHEET 1: DANH SÁCH LỚP HỌC & HỒ SƠ HỌC SINH (ROSTER & STUDENT OVERVIEW)
  // =========================================================================
  if (reportType === 'full_multisheet' || reportType === 'roster_scores') {
    const rosterRows: any[][] = [];

    // Title and Meta header block
    rosterRows.push(['HỆ THỐNG QUẢN LÝ KHẢO THÍ & ĐÀO TẠO TIẾNG ANH EDUADMIN']);
    rosterRows.push([
      activeClass
        ? `BÁO CÁO DANH SÁCH LỚP & HỒ SƠ HỌC TẬP - ${activeClass.name.toUpperCase()}`
        : 'BÁO CÁO DANH SÁCH HỌC SINH & HỒ SƠ HỌC TẬP TOÀN TRƯỜNG'
    ]);
    rosterRows.push([
      `Ngày xuất báo cáo: ${nowFormatted}`,
      '',
      activeClass ? `Khối: ${activeClass.grade || '—'}` : `Tổng số lớp: ${classes.length}`,
      '',
      activeClass ? `Mã PIN phòng thi 2FA: ${activeClass.pin || '—'}` : '',
      '',
      `Sĩ số: ${finalStudents.length} học sinh`
    ]);
    rosterRows.push([]); // Blank separator

    // Column Headers
    rosterRows.push([
      'STT',
      'Mã Học Sinh',
      'Họ và Tên Học Sinh',
      'Lớp',
      'SĐT Học Sinh (2FA)',
      'SĐT Phụ Huynh',
      'Số Bài Thi Đã Làm',
      'Điểm Gần Nhất',
      'Điểm Trung Bình',
      'Tiến Độ (%)',
      'Xếp Loại Học Lực',
      'Ghi Chú & Nhận Xét'
    ]);

    // Data rows
    finalStudents.forEach((student, index) => {
      // Find all submissions for this student to compute average
      const studentSubs = relevantSubmissions.filter(sub =>
        (student.studentId && sub.studentId === student.studentId) ||
        (student.phone && sub.studentPhone === student.phone) ||
        normalizeText(sub.studentName) === normalizeText(student.name)
      );

      const subScores = studentSubs.map(s => Number(s.score)).filter(s => !isNaN(s));
      let avgScoreValue: string | number = '—';
      if (subScores.length > 0) {
        const sum = subScores.reduce((a, b) => a + b, 0);
        avgScoreValue = Number((sum / subScores.length).toFixed(1));
      } else if (student.lastScore && student.lastScore > 0) {
        avgScoreValue = Number(student.lastScore.toFixed(1));
      }

      const lastScoreVal = (student.lastScore && student.lastScore > 0)
        ? Number(student.lastScore.toFixed(1))
        : (subScores.length > 0 ? subScores[subScores.length - 1] : '—');

      const completedCount = Math.max(student.completedExams || 0, studentSubs.length);

      rosterRows.push([
        index + 1,
        student.studentId || `HS-${String(index + 1).padStart(4, '0')}`,
        student.name,
        student.className || (activeClass ? activeClass.name : '—'),
        student.phone && student.phone !== 'Chưa cập nhật' ? student.phone : 'Chưa có SĐT 2FA',
        student.parentPhone && student.parentPhone !== 'Chưa cập nhật' ? student.parentPhone : 'Chưa cập nhật',
        completedCount,
        lastScoreVal,
        avgScoreValue,
        `${student.progress || 0}%`,
        student.status || 'Chưa làm',
        student.notes || ''
      ]);
    });

    const wsRoster = XLSX.utils.aoa_to_sheet(rosterRows);

    // Setup column widths
    wsRoster['!cols'] = [
      { wch: 6 },  // STT
      { wch: 15 }, // Mã HS
      { wch: 25 }, // Họ tên
      { wch: 14 }, // Lớp
      { wch: 18 }, // SĐT Học sinh
      { wch: 20 }, // SĐT Phụ huynh
      { wch: 18 }, // Số bài thi đã làm
      { wch: 16 }, // Điểm gần nhất
      { wch: 16 }, // Điểm trung bình
      { wch: 14 }, // Tiến độ (%)
      { wch: 18 }, // Xếp loại
      { wch: 35 }, // Ghi chú
    ];

    XLSX.utils.book_append_sheet(workbook, wsRoster, '1. Danh Sách Lớp & Hồ Sơ');
  }

  // =========================================================================
  // SHEET 2: BẢNG ĐIỂM CHI TIẾT CÁC BÀI THI (GRADEBOOK MATRIX)
  // =========================================================================
  if (reportType === 'full_multisheet' || reportType === 'exam_matrix') {
    const matrixRows: any[][] = [];

    // Header block
    matrixRows.push(['HỆ THỐNG QUẢN LÝ KHẢO THÍ EDUADMIN - SỔ ĐIỂM ĐIỆN TỬ']);
    matrixRows.push([
      activeClass
        ? `BẢNG ĐIỂM CHI TIẾT TỪNG BÀI THI - ${activeClass.name.toUpperCase()}`
        : 'BẢNG ĐIỂM CHI TIẾT TỪNG BÀI THI TOÀN TRƯỜNG'
    ]);
    matrixRows.push([
      `Thời gian xuất: ${nowFormatted}`,
      '',
      `Số lượng bài thi: ${relevantExams.length} đề`,
      '',
      `Sĩ số theo dõi: ${finalStudents.length} học sinh`
    ]);
    matrixRows.push([]); // Blank row

    // Table Headers: STT, Mã HS, Họ Tên, Lớp, [Tên các bài thi...], Điểm TB, Điểm Cao Nhất, Tỷ Lệ Đạt, Xếp Loại
    const headerCols = [
      'STT',
      'Mã Học Sinh',
      'Họ và Tên Học Sinh',
      'Lớp'
    ];

    // Add each exam as a column
    relevantExams.forEach((exam, idx) => {
      headerCols.push(`Đề ${idx + 1}: ${exam.title}`);
    });

    headerCols.push('Điểm Trung Bình');
    headerCols.push('Điểm Cao Nhất');
    headerCols.push('Số Đề Hoàn Thành');
    headerCols.push('Xếp Loại Tổng Hợp');

    matrixRows.push(headerCols);

    // Populate data rows for each student
    finalStudents.forEach((student, index) => {
      const studentSubs = relevantSubmissions.filter(sub =>
        (student.studentId && sub.studentId === student.studentId) ||
        (student.phone && sub.studentPhone === student.phone) ||
        normalizeText(sub.studentName) === normalizeText(student.name)
      );

      const rowData: any[] = [
        index + 1,
        student.studentId || `HS-${String(index + 1).padStart(4, '0')}`,
        student.name,
        student.className || (activeClass ? activeClass.name : '—')
      ];

      const examScores: number[] = [];

      // For each exam, find the highest score if multiple attempts
      relevantExams.forEach(exam => {
        const matchingSubs = studentSubs.filter(s => s.examId === exam.id || normalizeText(s.examTitle) === normalizeText(exam.title));
        if (matchingSubs.length > 0) {
          const maxScore = Math.max(...matchingSubs.map(s => Number(s.score) || 0));
          rowData.push(maxScore);
          examScores.push(maxScore);
        } else if (relevantExams.length === 1 && student.lastScore && student.lastScore > 0) {
          // If only 1 exam or matching, fallback to student.lastScore
          rowData.push(student.lastScore);
          examScores.push(student.lastScore);
        } else {
          rowData.push('Chưa làm');
        }
      });

      // Calculate aggregates
      if (examScores.length > 0) {
        const avg = Number((examScores.reduce((a, b) => a + b, 0) / examScores.length).toFixed(1));
        const max = Math.max(...examScores);
        rowData.push(avg);
        rowData.push(max);
        rowData.push(`${examScores.length} / ${relevantExams.length}`);
        
        // Rating
        if (avg >= 8.5) rowData.push('Xuất sắc');
        else if (avg >= 7.0) rowData.push('Khá / Hoàn thành tốt');
        else if (avg >= 5.0) rowData.push('Trung bình');
        else rowData.push('Cần bổ trợ');
      } else {
        rowData.push(student.lastScore > 0 ? student.lastScore : '—');
        rowData.push(student.lastScore > 0 ? student.lastScore : '—');
        rowData.push(`0 / ${relevantExams.length}`);
        rowData.push(student.status || 'Chưa làm');
      }

      matrixRows.push(rowData);
    });

    const wsMatrix = XLSX.utils.aoa_to_sheet(matrixRows);

    // Auto calculate column widths
    const matrixColWidths = [
      { wch: 6 },  // STT
      { wch: 15 }, // Mã HS
      { wch: 25 }, // Họ tên
      { wch: 14 }, // Lớp
    ];
    relevantExams.forEach(e => {
      matrixColWidths.push({ wch: Math.min(Math.max(e.title.length + 8, 22), 40) });
    });
    matrixColWidths.push({ wch: 16 }); // Điểm TB
    matrixColWidths.push({ wch: 16 }); // Điểm Max
    matrixColWidths.push({ wch: 18 }); // Số Đề Hoàn Thành
    matrixColWidths.push({ wch: 20 }); // Xếp Loại

    wsMatrix['!cols'] = matrixColWidths;

    XLSX.utils.book_append_sheet(workbook, wsMatrix, '2. Bảng Điểm Chi Tiết');
  }

  // =========================================================================
  // SHEET 3: LỊCH SỬ NỘP BÀI THI (DETAILED SUBMISSIONS LOG)
  // =========================================================================
  if (reportType === 'full_multisheet' || reportType === 'submissions_log') {
    const subRows: any[][] = [];

    subRows.push(['HỆ THỐNG KHẢO THÍ EDUADMIN - NHẬT KÝ LƯỢT NỘP BÀI THI']);
    subRows.push([
      activeClass
        ? `LỊCH SỬ NỘP BÀI & ĐIỂM SỐ CHI TIẾT - ${activeClass.name.toUpperCase()}`
        : 'LỊCH SỬ NỘP BÀI & ĐIỂM SỐ CHI TIẾT TOÀN HỆ THỐNG'
    ]);
    subRows.push([
      `Thời điểm xuất: ${nowFormatted}`,
      '',
      `Tổng số lượt nộp ghi nhận: ${relevantSubmissions.length} bài`
    ]);
    subRows.push([]); // Blank

    subRows.push([
      'STT',
      'Mã Lượt Nộp',
      'Thời Gian Nộp',
      'Mã Học Sinh',
      'Họ và Tên Học Sinh',
      'Lớp',
      'SĐT Học Sinh (2FA)',
      'Tên Đề Thi / Bài Kiểm Tra',
      'Điểm Số (Thang 10)',
      'Số Câu Đúng',
      'Tổng Số Câu',
      'Tỷ Lệ Đúng (%)',
      'Đánh Giá Tự Luận / AI Feedback',
      'Trạng Thái'
    ]);

    if (relevantSubmissions.length === 0) {
      // If no raw submissions yet, synthesize rows from student lastScore for complete report
      finalStudents.filter(s => s.lastScore > 0 || s.status !== 'Chưa làm').forEach((student, idx) => {
        subRows.push([
          idx + 1,
          `SUB-${student.studentId || idx + 1}`,
          nowFormatted,
          student.studentId || `HS-${idx + 1}`,
          student.name,
          student.className,
          student.phone || '—',
          relevantExams[0]?.title || 'Đề kiểm tra tiếng Anh định kỳ',
          student.lastScore || 0,
          Math.round(((student.lastScore || 0) / 10) * 40),
          40,
          `${Math.round(((student.lastScore || 0) / 10) * 100)}%`,
          'Bài nộp đạt yêu cầu chương trình',
          student.status
        ]);
      });
    } else {
      relevantSubmissions.forEach((sub, idx) => {
        const matchedStudent = finalStudents.find(
          s => (sub.studentId && s.studentId === sub.studentId) ||
               (sub.studentPhone && s.phone === sub.studentPhone) ||
               normalizeText(s.name) === normalizeText(sub.studentName)
        );

        const totalQ = sub.totalQuestions || 40;
        const correctQ = sub.correctAnswersCount !== undefined
          ? sub.correctAnswersCount
          : Math.round(((sub.score || 0) / 10) * totalQ);
        const percentage = Math.round((correctQ / totalQ) * 100);

        let aiFeedback = '';
        if (sub.essayEvaluation?.teacherGeneralComment) {
          aiFeedback = sub.essayEvaluation.teacherGeneralComment;
        } else if (sub.score >= 8.5) {
          aiFeedback = 'Nắm vững kiến thức, độ chính xác ngữ pháp và từ vựng rất cao.';
        } else if (sub.score >= 6.5) {
          aiFeedback = 'Nắm chắc kiến thức trọng tâm, cần chú ý thêm bẫy ngữ âm và từ vựng nâng cao.';
        } else {
          aiFeedback = 'Cần củng cố kiến thức ngữ pháp cơ bản và rèn luyện thêm kỹ năng đọc hiểu.';
        }

        subRows.push([
          idx + 1,
          sub.id,
          sub.submittedAt || nowFormatted,
          sub.studentId || matchedStudent?.studentId || '—',
          sub.studentName || matchedStudent?.name || '—',
          sub.className || matchedStudent?.className || (activeClass ? activeClass.name : '—'),
          sub.studentPhone || matchedStudent?.phone || '—',
          sub.examTitle || 'Đề kiểm tra tiếng Anh',
          sub.score,
          correctQ,
          totalQ,
          `${percentage}%`,
          aiFeedback,
          sub.score >= 5.0 ? 'Đạt' : 'Cần rèn luyện'
        ]);
      });
    }

    const wsSub = XLSX.utils.aoa_to_sheet(subRows);
    wsSub['!cols'] = [
      { wch: 6 },  // STT
      { wch: 16 }, // Mã lượt nộp
      { wch: 18 }, // Thời gian nộp
      { wch: 15 }, // Mã HS
      { wch: 25 }, // Họ tên
      { wch: 14 }, // Lớp
      { wch: 18 }, // SĐT
      { wch: 35 }, // Tên đề thi
      { wch: 18 }, // Điểm số
      { wch: 14 }, // Số câu đúng
      { wch: 14 }, // Tổng câu
      { wch: 16 }, // Tỷ lệ đúng
      { wch: 45 }, // AI Feedback
      { wch: 16 }, // Trạng thái
    ];

    XLSX.utils.book_append_sheet(workbook, wsSub, '3. Lịch Sử Nộp Bài Thi');
  }

  // =========================================================================
  // SHEET 4: BÁO CÁO THỐNG KÊ & PHỔ ĐIỂM LỚP HỌC (ANALYTICS & SUMMARY)
  // =========================================================================
  if (reportType === 'full_multisheet') {
    const statsRows: any[][] = [];

    statsRows.push(['HỆ THỐNG QUẢN LÝ KHẢO THÍ EDUADMIN - TỔNG HỢP THỐNG KÊ & PHÂN TÍCH']);
    statsRows.push([
      activeClass
        ? `BÁO CÁO PHÂN TÍCH PHỔ ĐIỂM & KẾT QUẢ THI - ${activeClass.name.toUpperCase()}`
        : 'BÁO CÁO PHÂN TÍCH PHỔ ĐIỂM & KẾT QUẢ THI TOÀN TRƯỜNG'
    ]);
    statsRows.push([`Ngày báo cáo: ${nowFormatted}`]);
    statsRows.push([]); // Blank

    // Section 1: KPI Tổng Quan
    const totalStudents = finalStudents.length;
    const scoresPool: number[] = [];
    finalStudents.forEach(s => {
      if (s.lastScore && s.lastScore > 0) scoresPool.push(s.lastScore);
    });
    relevantSubmissions.forEach(sub => {
      if (sub.score !== undefined && !isNaN(Number(sub.score))) {
        scoresPool.push(Number(sub.score));
      }
    });

    const highestScore = scoresPool.length > 0 ? Math.max(...scoresPool).toFixed(1) : '—';
    const lowestScore = scoresPool.length > 0 ? Math.min(...scoresPool).toFixed(1) : '—';
    const avgScoreClass = scoresPool.length > 0
      ? (scoresPool.reduce((a, b) => a + b, 0) / scoresPool.length).toFixed(2)
      : '—';

    statsRows.push(['1. BẢNG THỐNG KÊ CHỈ SỐ TỔNG QUAN']);
    statsRows.push(['Chỉ số', 'Giá trị', 'Đơn vị tính', 'Ghi chú']);
    statsRows.push(['Tổng sĩ số học sinh', totalStudents, 'Học sinh', 'Số học sinh trong danh sách báo cáo']);
    statsRows.push(['Tổng số bài thi khảo thí', relevantExams.length, 'Đề thi', 'Các đề thi được phân công']);
    statsRows.push(['Tổng lượt làm bài ghi nhận', relevantSubmissions.length, 'Lượt nộp', 'Các lượt nộp hoàn chỉnh']);
    statsRows.push(['Điểm trung bình toàn lớp', avgScoreClass, 'Thang điểm 10', 'Tính trên toàn bộ bài nộp']);
    statsRows.push(['Điểm thi cao nhất', highestScore, 'Thang điểm 10', 'Điểm thủ khoa lớp']);
    statsRows.push(['Điểm thi thấp nhất', lowestScore, 'Thang điểm 10', 'Học sinh cần lưu ý hỗ trợ']);
    statsRows.push([]);

    // Section 2: Phân phối phổ điểm học lực
    const countExcellent = finalStudents.filter(s => s.status === 'Xuất sắc' || (s.lastScore && s.lastScore >= 8.5)).length;
    const countGood = finalStudents.filter(s => s.status === 'Hoàn thành' || (s.lastScore && s.lastScore >= 6.5 && s.lastScore < 8.5)).length;
    const countAverage = finalStudents.filter(s => s.lastScore && s.lastScore >= 5.0 && s.lastScore < 6.5).length;
    const countNeedHelp = finalStudents.filter(s => s.status === 'Cần bổ trợ' || (s.lastScore && s.lastScore > 0 && s.lastScore < 5.0)).length;
    const countNotTaken = finalStudents.filter(s => (!s.lastScore || s.lastScore === 0) && s.status === 'Chưa làm').length;

    statsRows.push(['2. BẢNG PHÂN BỐ PHỔ ĐIỂM & NĂNG LỰC HỌC SINH']);
    statsRows.push(['Phân khúc năng lực', 'Khoảng điểm', 'Số học sinh', 'Tỷ lệ (%)', 'Định hướng bồi dưỡng']);
    statsRows.push([
      'Xuất sắc (Giỏi)',
      '8.5 – 10.0 điểm',
      countExcellent,
      totalStudents > 0 ? `${((countExcellent / totalStudents) * 100).toFixed(1)}%` : '0%',
      'Bồi dưỡng câu hỏi vận dụng cao (Tier 4), chuyên đề từ vựng C1/C2'
    ]);
    statsRows.push([
      'Khá (Hoàn thành tốt)',
      '6.5 – 8.4 điểm',
      countGood,
      totalStudents > 0 ? `${((countGood / totalStudents) * 100).toFixed(1)}%` : '0%',
      'Củng cố kỹ năng đọc hiểu nhanh và bẫy phát âm đuôi / trọng âm'
    ]);
    statsRows.push([
      'Trung bình',
      '5.0 – 6.4 điểm',
      countAverage,
      totalStudents > 0 ? `${((countAverage / totalStudents) * 100).toFixed(1)}%` : '0%',
      'Rèn luyện chuyên đề ngữ pháp trọng tâm và cấu trúc câu thông dụng'
    ]);
    statsRows.push([
      'Cần bổ trợ ngữ pháp',
      'Dưới 5.0 điểm',
      countNeedHelp,
      totalStudents > 0 ? `${((countNeedHelp / totalStudents) * 100).toFixed(1)}%` : '0%',
      'Giao bài tập bổ trợ ngữ pháp cơ bản, theo dõi kèm cặp trực tiếp'
    ]);
    statsRows.push([
      'Chưa tham gia làm bài',
      '0 điểm / Chưa nộp',
      countNotTaken,
      totalStudents > 0 ? `${((countNotTaken / totalStudents) * 100).toFixed(1)}%` : '0%',
      'Gửi thông báo nhắc nhở qua SĐT 2FA hoặc phụ huynh'
    ]);
    statsRows.push([]);

    // Section 3: Thống kê chi tiết theo từng đề thi
    if (relevantExams.length > 0) {
      statsRows.push(['3. BẢNG TỔNG HỢP KẾT QUẢ THEO TỪNG ĐỀ THI']);
      statsRows.push(['STT', 'Tên đề thi', 'Thời lượng', 'Số câu hỏi', 'Số bài nộp', 'Điểm TB đề', 'Điểm Max', 'Tỷ lệ hoàn thành (%)']);

      relevantExams.forEach((exam, idx) => {
        const examSubs = relevantSubmissions.filter(s => s.examId === exam.id || normalizeText(s.examTitle) === normalizeText(exam.title));
        const examScores = examSubs.map(s => Number(s.score) || 0);
        const subCount = examSubs.length;
        const examAvg = examScores.length > 0 ? (examScores.reduce((a, b) => a + b, 0) / examScores.length).toFixed(1) : '—';
        const examMax = examScores.length > 0 ? Math.max(...examScores).toFixed(1) : '—';
        const completionRate = totalStudents > 0 ? `${((subCount / totalStudents) * 100).toFixed(1)}%` : '0%';

        statsRows.push([
          idx + 1,
          exam.title,
          exam.duration || '45 phút',
          exam.questionsCount || 40,
          subCount,
          examAvg,
          examMax,
          completionRate
        ]);
      });
    }

    const wsStats = XLSX.utils.aoa_to_sheet(statsRows);
    wsStats['!cols'] = [
      { wch: 6 },  // STT / Chỉ số
      { wch: 35 }, // Tên đề / Giá trị
      { wch: 18 }, // Đơn vị / Thời lượng
      { wch: 16 }, // Ghi chú / Số câu
      { wch: 16 }, // Số bài nộp
      { wch: 16 }, // Điểm TB
      { wch: 16 }, // Điểm Max
      { wch: 22 }, // Tỷ lệ hoàn thành
    ];

    XLSX.utils.book_append_sheet(workbook, wsStats, '4. Thống Kê & Phổ Điểm');
  }

  // Write and trigger download
  XLSX.writeFile(workbook, exportFileName);

  return {
    studentCount: finalStudents.length,
    classCount: activeClass ? 1 : classes.length,
    examCount: relevantExams.length,
    submissionCount: relevantSubmissions.length,
    fileName: exportFileName
  };
}
