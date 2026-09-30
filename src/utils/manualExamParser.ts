import * as XLSX from 'xlsx';
// @ts-ignore
import mammoth from 'mammoth';
import { ExamQuestion, ExamSectionType } from '../types';
import {
  downloadThptWordTemplate,
  downloadDinhKyWordTemplate,
  THPT_SAMPLE_MOET_STANDARDIZED_TEXT,
  PERIODIC_EXAM_STANDARDIZED_TEXT
} from './thptTemplates';

export {
  downloadThptWordTemplate,
  downloadDinhKyWordTemplate,
  THPT_SAMPLE_MOET_STANDARDIZED_TEXT,
  PERIODIC_EXAM_STANDARDIZED_TEXT
};

export interface ParseError {
  lineIndex: number; // 0-based
  lineNumber: number; // 1-based
  lineText: string;
  message: string;
  questionNum?: number;
}

export interface ParseResult {
  success: boolean;
  questions: ExamQuestion[];
  errors: ParseError[];
  lineErrorsMap: Record<number, string>; // lineNumber -> error message
  totalQuestions: number;
  sectionsSummary: { type: ExamSectionType; title: string; questionCount: number }[];
}

export interface ValidationSummary {
  total: number;
  validCount: number;
  hasErrors: boolean;
  missingAnswerIds: string[];
  missingOptionsIds: string[];
  emptyContentIds: string[];
  duplicatePairs: { id1: string; id2: string; num1: number; num2: number; similarity: number }[];
}

export const SAMPLE_EXAM_TEXT = `[SECTION: PRONUNCIATION & STRESS]
Câu 1: Choose the word whose underlined part is pronounced differently from the others:
A. decid<u>ed</u>
B. wait<u>ed</u>
*C. watch<u>ed</u>*
D. invit<u>ed</u>
Đáp án: C
Giải thích: Đuôi '-ed' trong 'watched' /wɒtʃt/ phát âm là /t/. Các từ còn lại phát âm là /ɪd/.

Câu 2: Choose the word whose main stress is placed differently from the others:
A. preserve
B. protect
*C. damage*
D. pollute
Đáp án: C
Giải thích: 'damage' có trọng âm rơi vào âm tiết thứ nhất /ˈdæm.ɪdʒ/. Các từ còn lại rơi vào âm tiết 2.

[SECTION: LEXICO & GRAMMAR]
Câu 3: If I _______ his phone number, I would have invited him to my party yesterday.
*A. had known*
B. knew
C. know
D. have known
Đáp án: A
Giải thích: Câu điều kiện loại 3 (trái ngược với quá khứ): If + S + had + V3/ed.

Câu 4: The teacher asked us to look _______ the new words in the dictionary before class.
A. after
B. for
*C. up*
D. into
Đáp án: C
Giải thích: Cụm từ 'look up' mang nghĩa tra cứu từ ngữ trong từ điển.

[SECTION: ARRANGEMENT]
Câu 5: Sắp xếp các câu sau để tạo thành đoạn hội thoại hợp lý:
a. Good morning. How can I help you?
b. I'd like to book a flight to Da Nang this Friday.
c. Sure, what time of day would you prefer to depart?
*A. a - b - c*
B. b - a - c
C. c - b - a
D. b - c - a
Đáp án: A
Giải thích: Đoạn hội thoại bắt đầu bằng lời chào mừng của nhân viên (a), khách đưa ra nhu cầu (b), và nhân viên hỏi chi tiết (c).

[SECTION: READING COMPREHENSION]
[PASSAGE: Eco-friendly living has become a prominent movement among young people worldwide. By adopting simple daily habits such as carrying reusable containers and avoiding single-use plastics, students can significantly reduce campus waste. Furthermore, conserving electricity by turning off lights and computers when not in use helps minimize unnecessary energy consumption. In addition, planting trees on school grounds improves air quality and creates an inviting green learning environment.]
Câu 6: What is the main idea of the passage?
A. The history of renewable energy
*B. Practical ways students can practice eco-friendly habits*
C. How to manufacture reusable containers
D. The dangers of air pollution
Đáp án: B
Giải thích: Đoạn văn bàn về các hành động thiết thực mà học sinh có thể thực hiện để sống xanh tại trường học.

[SECTION: WRITING - SHORT ANSWER]
Câu 7: They haven't visited their grandparents for two months. (last)
Đáp án: They last visited their grandparents two months ago.
[ACCEPTED: They last visited their grandparents 2 months ago | The last time they visited their grandparents was two months ago]
Giải thích: Chuyển đổi từ Hiện tại hoàn thành (phủ định) sang Quá khứ đơn với 'last'.`;

export function downloadExcelTemplate() {
  const data = [
    {
      "STT": 1,
      "Phần thi (Section)": "PRONUNCIATION",
      "Câu hỏi (Question)": "Choose the word whose underlined part is pronounced differently:",
      "Phương án A": "A. decided",
      "Phương án B": "B. waited",
      "Phương án C": "C. watched",
      "Phương án D": "D. invited",
      "Đáp án đúng (Answer)": "C",
      "Giải thích (Explanation)": "Đuôi '-ed' trong watched phát âm là /t/, các từ còn lại là /ɪd/.",
      "Đoạn văn đọc (Passage nếu có)": ""
    },
    {
      "STT": 2,
      "Phần thi (Section)": "LEXICO_GRAMMAR",
      "Câu hỏi (Question)": "If I _______ his phone number, I would have invited him.",
      "Phương án A": "A. had known",
      "Phương án B": "B. knew",
      "Phương án C": "C. know",
      "Phương án D": "D. have known",
      "Đáp án đúng (Answer)": "A",
      "Giải thích (Explanation)": "Câu điều kiện loại 3 diễn tả điều không có thật trong quá khứ.",
      "Đoạn văn đọc (Passage nếu có)": ""
    },
    {
      "STT": 3,
      "Phần thi (Section)": "READING",
      "Câu hỏi (Question)": "What is the main idea of the passage?",
      "Phương án A": "A. Renewable energy history",
      "Phương án B": "B. Practical eco-friendly habits",
      "Phương án C": "C. Plastic recycling",
      "Phương án D": "D. Tree planting guide",
      "Đáp án đúng (Answer)": "B",
      "Giải thích (Explanation)": "Đoạn văn nêu bật các biện pháp sống xanh của học sinh.",
      "Đoạn văn đọc (Passage nếu có)": "Eco-friendly living has become a prominent movement among young people worldwide. By adopting simple daily habits..."
    },
    {
      "STT": 4,
      "Phần thi (Section)": "WRITING_SHORT",
      "Câu hỏi (Question)": "They haven't visited their grandparents for two months. (last)",
      "Phương án A": "",
      "Phương án B": "",
      "Phương án C": "",
      "Phương án D": "",
      "Đáp án đúng (Answer)": "They last visited their grandparents two months ago.",
      "Giải thích (Explanation)": "Chuyển từ thì Hiện tại hoàn thành sang Quá khứ đơn với 'last'.",
      "Đoạn văn đọc (Passage nếu có)": ""
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Mau_De_Thi_Tieng_Anh");
  XLSX.writeFile(wb, "Mau_Soan_De_Thi_Tieng_Anh_Chuan.xlsx");
}

export function downloadWordTemplate() {
  const wordContentHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Mẫu Soạn Thảo Đề Thi Chuẩn</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 20mm; }
        h2 { text-align: center; color: #1e3a8a; font-size: 16pt; margin-bottom: 4px; }
        .instructions { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
        .q-block { margin-bottom: 14px; }
        .q-title { font-weight: bold; }
        .options { margin-left: 20px; margin-top: 4px; }
        .key { color: #047857; font-weight: bold; }
        .expl { color: #475569; font-style: italic; }
      </style>
    </head>
    <body>
      <h2>MẪU ĐỀ THI TIẾNG ANH CHUẨN SỐ HÓA</h2>
      <div class="instructions">
        <p><strong>HƯỚNG DẪN DÀNH CHO GIÁO VIÊN:</strong></p>
        <p>• Mỗi câu hỏi bắt đầu bằng <b>Câu 1:</b> hoặc <b>1.</b></p>
        <p>• Các lựa chọn <b>A.</b>, <b>B.</b>, <b>C.</b>, <b>D.</b> trên từng dòng.</p>
        <p>• Phương án đúng có thể <b>in đậm</b> hoặc ghi <b>Đáp án: [A/B/C/D]</b> ngay sau câu hỏi.</p>
        <p>• Đối với bài đọc: Đặt trước câu hỏi dạng <b>[PASSAGE: Nội dung bài đọc...]</b>.</p>
      </div>

      <div class="q-block">
        <p class="q-title">Câu 1: Choose the word whose underlined part is pronounced differently from the others:</p>
        <div class="options">
          <p>A. decided</p>
          <p>B. waited</p>
          <p><b>C. watched</b></p>
          <p>D. invited</p>
        </div>
        <p class="key">Đáp án: C</p>
        <p class="expl">Giải thích: Đuôi '-ed' trong 'watched' phát âm là /t/. Các từ còn lại phát âm là /ɪd/.</p>
      </div>

      <div class="q-block">
        <p class="q-title">Câu 2: If I _______ his phone number, I would have invited him to my party yesterday.</p>
        <div class="options">
          <p><b>A. had known</b></p>
          <p>B. knew</p>
          <p>C. know</p>
          <p>D. have known</p>
        </div>
        <p class="key">Đáp án: A</p>
        <p class="expl">Giải thích: Câu điều kiện loại 3 diễn tả điều kiện không có thật trong quá khứ.</p>
      </div>

      <div class="q-block">
        <p style="background: #f1f5f9; padding: 10px; border-left: 3px solid #3b82f6;">
          <b>[PASSAGE: Eco-friendly living has become a prominent movement among young people worldwide. By adopting simple daily habits such as carrying reusable containers and avoiding single-use plastics, students can significantly reduce campus waste.]</b>
        </p>
        <p class="q-title">Câu 3: What is the main topic of the passage?</p>
        <div class="options">
          <p>A. Renewable energy history</p>
          <p><b>B. Practical eco-friendly habits for youth</b></p>
          <p>C. Chemical properties of plastics</p>
          <p>D. Electric automobile engineering</p>
        </div>
        <p class="key">Đáp án: B</p>
        <p class="expl">Giải thích: Đoạn văn trình bày các thói quen sống xanh thiết thực cho học sinh.</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordContentHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "Mau_Soan_De_Thi_Tieng_Anh_Chuan.doc";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Extract plain text from .docx array buffer
export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value || '';
  } catch (err: any) {
    console.warn('Mammoth extraction failed:', err);
    throw new Error(`Không thể giải mã tệp Word (.docx): ${err.message || 'Lỗi định dạng'}`);
  }
}

// Check text similarity between two strings (0 to 1)
export function calculateTextSimilarity(str1: string, str2: string): number {
  const clean1 = str1.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const clean2 = str2.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (!clean1 || !clean2) return 0;
  if (clean1 === clean2) return 1;

  const words1 = new Set(clean1.split(/\s+/));
  const words2 = new Set(clean2.split(/\s+/));

  let intersection = 0;
  words1.forEach((w) => {
    if (words2.has(w)) intersection++;
  });

  const union = new Set([...words1, ...words2]).size;
  return union === 0 ? 0 : intersection / union;
}

// Parses separate answer table at the bottom of exam text
function parseAnswerTable(text: string): Record<number, string> {
  const tableMap: Record<number, string> = {};
  // Match patterns like "1.A 2.B", "| 1.A | 2.B |", "1-A 2-B", "1: A, 2: B", "1A 2B", "Câu 1: A", "Question 1: A"
  const matches = text.matchAll(/(?:câu|question|\b)\s*(\d{1,3})\s*[:.\-–]?\s*([A-D]|True|False|Đúng|Sai)\b/gi);
  for (const m of matches) {
    const num = parseInt(m[1], 10);
    const ans = m[2].trim().toUpperCase();
    if (num > 0 && ans) {
      tableMap[num] = ans.startsWith('T') || ans === 'ĐÚNG' ? 'True' : ans.startsWith('F') || ans === 'SAI' ? 'False' : ans;
    }
  }
  return tableMap;
}

// Parses separate explanation section at the bottom of exam text
function parseExplanationsTable(text: string): Record<number, string> {
  const explMap: Record<number, string> = {};
  const lines = text.split(/\r?\n/);
  let isInsideExplSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.match(/HƯỚNG DẪN GIẢI CHI TIẾT|DETAILED EXPLANATIONS|LỜI GIẢI CHI TIẾT|ANSWER KEY & EXPLANATIONS/i)) {
      isInsideExplSection = true;
      continue;
    }
    if (isInsideExplSection) {
      const m = trimmed.match(/^(?:question|câu)\s*(\d{1,3})\s*[:.-]\s*(?:đáp án\s*[A-D]\s*[:.-]?\s*)?(.*)$/i);
      if (m) {
        const num = parseInt(m[1], 10);
        const explText = m[2].trim();
        if (num > 0 && explText) {
          explMap[num] = explText;
        }
      }
    }
  }
  return explMap;
}

// Robust Parser Logic
export function parseRawExamText(rawText: string): ParseResult {
  const lines = rawText.split(/\r?\n/);
  const questions: ExamQuestion[] = [];
  const errors: ParseError[] = [];
  const lineErrorsMap: Record<number, string> = {};

  // Pre-scan for separate answer table and explanation section
  const answerTableMap = parseAnswerTable(rawText);
  const explanationMap = parseExplanationsTable(rawText);

  let currentSectionType: ExamSectionType = 'lexico_grammar';
  let currentSectionTitle = 'LEXICO & GRAMMAR';
  let currentPassage = '';
  let currentPassageTitle = '';

  let currentQuestionNum = 0;
  let currentQuestionText = '';
  let currentOptions: string[] = [];
  let currentAnswer = '';
  let currentExplanation = '';
  let currentAlternativeAnswers: string[] = [];
  let currentQuestionStartLine = 0;
  let isInsideQuestion = false;

  const flushQuestion = () => {
    if (!isInsideQuestion) return;

    const lineNum = currentQuestionStartLine + 1;
    const qIndex = questions.length + 1;

    // Check if question text is empty
    if (!currentQuestionText.trim()) {
      const err: ParseError = {
        lineIndex: currentQuestionStartLine,
        lineNumber: lineNum,
        lineText: lines[currentQuestionStartLine] || '',
        message: `Câu ${currentQuestionNum || qIndex}: Thiếu nội dung câu hỏi sau tiêu đề.`,
        questionNum: currentQuestionNum || qIndex
      };
      errors.push(err);
      lineErrorsMap[lineNum] = err.message;
      return;
    }

    // If answer not set yet, check answer table map
    if (!currentAnswer.trim()) {
      const candidateNum = currentQuestionNum || qIndex;
      if (answerTableMap[candidateNum]) {
        currentAnswer = answerTableMap[candidateNum];
      }
    }

    // Determine question type
    let qType: 'multiple_choice' | 'short_answer' | 'essay' = 'multiple_choice';
    if (currentSectionType === 'writing_short' || currentOptions.length === 0) {
      if (currentOptions.length === 0) {
        qType = 'short_answer';
      }
    }

    // Multiple choice must have options & answer
    if (qType === 'multiple_choice') {
      if (currentOptions.length < 2) {
        const err: ParseError = {
          lineIndex: currentQuestionStartLine,
          lineNumber: lineNum,
          lineText: lines[currentQuestionStartLine] || '',
          message: `Câu ${currentQuestionNum || qIndex}: Câu trắc nghiệm cần ít nhất 2 phương án (A, B, C, D).`,
          questionNum: currentQuestionNum || qIndex
        };
        errors.push(err);
        lineErrorsMap[lineNum] = err.message;
      }
    }

    // Format final answer properly
    let finalAnswer = currentAnswer.trim();
    if (finalAnswer.length === 1 && /^[A-D]$/i.test(finalAnswer)) {
      const optMatch = currentOptions.find(o => o.trim().toUpperCase().startsWith(finalAnswer.toUpperCase() + '.'));
      if (optMatch) {
        finalAnswer = optMatch;
      } else {
        finalAnswer = `${finalAnswer.toUpperCase()}. Phương án ${finalAnswer.toUpperCase()}`;
      }
    }

    // Check explanation from bottom section if missing or generic
    const candidateNum = currentQuestionNum || qIndex;
    let finalExplanation = currentExplanation.trim();
    if ((!finalExplanation || finalExplanation.startsWith('Căn cứ')) && explanationMap[candidateNum]) {
      finalExplanation = explanationMap[candidateNum];
    }

    questions.push({
      id: `manual-q-${qIndex}`,
      num: qIndex,
      sectionType: currentSectionType,
      sectionTitle: currentSectionTitle,
      questionType: qType,
      question: currentQuestionText.trim(),
      options: currentOptions,
      answer: finalAnswer,
      explanation: finalExplanation || 'Căn cứ theo ngữ cảnh và quy tắc ngữ pháp.',
      passage: currentPassage || undefined,
      passageTitle: currentPassageTitle || undefined,
      alternativeAnswers: currentAlternativeAnswers.length > 0 ? currentAlternativeAnswers : undefined,
    });

    // Reset current question state
    currentQuestionText = '';
    currentOptions = [];
    currentAnswer = '';
    currentExplanation = '';
    currentAlternativeAnswers = [];
    isInsideQuestion = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    const lineNum = i + 1;

    if (!line) continue;

    // 1. Detect Section Headers: e.g. [SECTION: PRONUNCIATION] or [PHẦN I: PHÁT ÂM]
    const sectionMatch = line.match(/^\[(?:SECTION|PHẦN|PART):\s*(.*?)\]$/i);
    if (sectionMatch) {
      flushQuestion();
      const secName = sectionMatch[1].toUpperCase();
      if (secName.includes('PRONUNCIATION') || secName.includes('PHÁT ÂM') || secName.includes('STRESS')) {
        currentSectionType = 'pronunciation';
        currentSectionTitle = 'PRONUNCIATION & STRESS';
      } else if (secName.includes('ARRANGEMENT') || secName.includes('SẮP XẾP')) {
        currentSectionType = 'arrangement';
        currentSectionTitle = 'ARRANGEMENT';
      } else if (secName.includes('CLOZE') || secName.includes('ĐIỀN TỪ')) {
        currentSectionType = 'cloze_reading';
        currentSectionTitle = 'CLOZE-READING';
      } else if (secName.includes('READING') || secName.includes('ĐỌC HIỂU')) {
        currentSectionType = 'reading_comprehension';
        currentSectionTitle = 'READING COMPREHENSION';
      } else if (secName.includes('WRITING') || secName.includes('VIẾT') || secName.includes('SHORT')) {
        currentSectionType = 'writing_short';
        currentSectionTitle = 'WRITING - SHORT ANSWER';
      } else if (secName.includes('ESSAY') || secName.includes('LUẬN')) {
        currentSectionType = 'essay_writing';
        currentSectionTitle = 'ESSAY WRITING';
      } else {
        currentSectionType = 'lexico_grammar';
        currentSectionTitle = 'LEXICO & GRAMMAR';
      }
      continue;
    }

    // 2. Detect Passages: e.g. [PASSAGE: Text...] or [ĐOẠN VĂN: Text...]
    const passageMatch = line.match(/^\[(?:PASSAGE|ĐOẠN VĂN|BÀI ĐỌC)(?::\s*([^\]]*))?\](.*)$/i);
    if (passageMatch) {
      flushQuestion();
      const directText = (passageMatch[1] || '') + (passageMatch[2] || '');
      currentPassage = directText.trim();
      currentPassageTitle = 'Bài đọc hiểu (Reading Passage)';
      currentSectionType = 'reading_comprehension';
      currentSectionTitle = 'READING COMPREHENSION';
      continue;
    }

    // 3. Detect Question Starter: e.g. "Câu 1:", "Question 1:", "1.", "1/"
    const questionMatch = line.match(/^(?:câu|question|\b)\s*(\d{1,3})\s*[:.)/]\s*(.*)$/i);
    if (questionMatch && !line.match(/^[A-D]\./i)) {
      flushQuestion();
      isInsideQuestion = true;
      currentQuestionNum = parseInt(questionMatch[1], 10);
      currentQuestionText = questionMatch[2] || '';
      currentQuestionStartLine = i;
      continue;
    }

    // 4a. Detect Multiple Inline Options: A. ... B. ... C. ... D. on the same line
    const multiOptionRegex = new RegExp('(?:(?:\\*|\\*\\*|\\[x\\]|\\(x\\)|<b>)?\\s*([A-D])\\s*[.:\\)]\\s*)(.*?)(?=(?:(?:\\*|\\*\\*|\\[x\\]|\\(x\\)|<b>)?\\s*[A-D]\\s*[.:\\)]|$)', 'gi');
    const multiOptionMatches = Array.from(line.matchAll(multiOptionRegex));
    if (isInsideQuestion && multiOptionMatches.length >= 2) {
      for (const m of multiOptionMatches) {
        const letter = m[1].toUpperCase();
        let optText = (m[2] || '').trim();
        const fullMatchText = m[0];

        const isMarkedCorrect =
          fullMatchText.startsWith('*') ||
          fullMatchText.startsWith('**') ||
          fullMatchText.startsWith('[x]') ||
          fullMatchText.includes('*' + letter + '*') ||
          optText.endsWith('*') ||
          optText.endsWith('**') ||
          optText.includes('[đúng]') ||
          optText.includes('(key)');

        optText = optText.replace(/\*+/g, '').replace(/\[(?:x|đúng)\]/gi, '').trim();
        const formattedOption = `${letter}. ${optText}`;
        currentOptions.push(formattedOption);

        if (isMarkedCorrect && !currentAnswer) {
          currentAnswer = formattedOption;
        }
      }
      continue;
    }

    // 4b. Detect Single Option on line: A. B. C. D. (including *A.*, [x] A., <b>A.</b>, etc.)
    const optionMatch = line.match(/^(?:\*|\*\*|\[x\]|\(x\)|<b>)?\s*([A-D])\s*[.:)]\s*(.*)$/i);
    if (isInsideQuestion && optionMatch) {
      const letter = optionMatch[1].toUpperCase();
      let optText = optionMatch[2].trim();

      // Check if this option is marked as correct with asterisks or bold
      const isMarkedCorrect =
        line.startsWith('*') ||
        line.startsWith('**') ||
        line.startsWith('[x]') ||
        line.includes('*' + letter + '*') ||
        optText.endsWith('*') ||
        optText.endsWith('**') ||
        optText.includes('[đúng]') ||
        optText.includes('(key)');

      optText = optText.replace(/\*+/g, '').replace(/\[(?:x|đúng)\]/gi, '').trim();
      const formattedOption = `${letter}. ${optText}`;
      currentOptions.push(formattedOption);

      if (isMarkedCorrect && !currentAnswer) {
        currentAnswer = formattedOption;
      }
      continue;
    }

    // 5. Detect Inline Answer: "Đáp án: A", "Answer: A", "Key: A"
    const ansMatch = line.match(/^(?:đáp án|answer|key):\s*(.*)$/i);
    if (isInsideQuestion && ansMatch) {
      currentAnswer = ansMatch[1].trim();
      continue;
    }

    // 6. Detect Explanation: "Giải thích: ...", "Explanation: ..."
    const explMatch = line.match(/^(?:giải thích|explanation|hướng dẫn giải):\s*(.*)$/i);
    if (isInsideQuestion && explMatch) {
      currentExplanation = explMatch[1].trim();
      continue;
    }

    // 7. Detect Alternative Accepted Answers: [ACCEPTED: ans1 | ans2]
    const acceptedMatch = line.match(/^\[ACCEPTED:\s*(.*)\]$/i);
    if (isInsideQuestion && acceptedMatch) {
      currentAlternativeAnswers = acceptedMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      continue;
    }

    // If inside question and none of above, append line to question text or explanation
    if (isInsideQuestion) {
      if (currentOptions.length === 0) {
        currentQuestionText += (currentQuestionText ? '\n' : '') + line;
      } else if (currentExplanation) {
        currentExplanation += '\n' + line;
      }
    }
  }

  // Flush final question
  flushQuestion();

  // Calculate sections summary
  const sectionCounts: Record<string, { type: ExamSectionType; title: string; count: number }> = {};
  questions.forEach((q) => {
    const key = q.sectionType || 'lexico_grammar';
    if (!sectionCounts[key]) {
      sectionCounts[key] = {
        type: q.sectionType || 'lexico_grammar',
        title: q.sectionTitle || 'LEXICO & GRAMMAR',
        count: 0
      };
    }
    sectionCounts[key].count++;
  });

  const sectionsSummary = Object.values(sectionCounts).map(s => ({
    type: s.type,
    title: s.title,
    questionCount: s.count
  }));

  return {
    success: errors.length === 0 && questions.length > 0,
    questions,
    errors,
    lineErrorsMap,
    totalQuestions: questions.length,
    sectionsSummary
  };
}

// Parse Excel Workbook into ExamQuestions
export function parseExcelExamFile(buffer: ArrayBuffer): ParseResult {
  try {
    const wb = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = wb.SheetNames[0];
    const ws = wb.Sheets[firstSheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return {
        success: false,
        questions: [],
        errors: [{ lineIndex: 0, lineNumber: 1, lineText: '', message: 'Tệp Excel không chứa dữ liệu!' }],
        lineErrorsMap: { 1: 'Tệp Excel không chứa dữ liệu!' },
        totalQuestions: 0,
        sectionsSummary: []
      };
    }

    const questions: ExamQuestion[] = [];
    const errors: ParseError[] = [];
    const lineErrorsMap: Record<number, string> = {};

    rawRows.forEach((row, idx) => {
      const lineNum = idx + 2; // header is row 1
      const qText = String(row['Câu hỏi (Question)'] || row['Câu hỏi'] || row['Question'] || '').trim();
      const secRaw = String(row['Phần thi (Section)'] || row['Phần thi'] || row['Section'] || '').toUpperCase();
      const optA = String(row['Phương án A'] || row['A'] || '').trim();
      const optB = String(row['Phương án B'] || row['B'] || '').trim();
      const optC = String(row['Phương án C'] || row['C'] || '').trim();
      const optD = String(row['Phương án D'] || row['D'] || '').trim();
      const ansRaw = String(row['Đáp án đúng (Answer)'] || row['Đáp án'] || row['Answer'] || '').trim();
      const expl = String(row['Giải thích (Explanation)'] || row['Giải thích'] || row['Explanation'] || '').trim();
      const passage = String(row['Đoạn văn đọc (Passage nếu có)'] || row['Passage'] || row['Bài đọc'] || '').trim();

      if (!qText) {
        return; // skip empty rows
      }

      // Collect options
      const options: string[] = [];
      if (optA) options.push(optA.startsWith('A.') ? optA : `A. ${optA}`);
      if (optB) options.push(optB.startsWith('B.') ? optB : `B. ${optB}`);
      if (optC) options.push(optC.startsWith('C.') ? optC : `C. ${optC}`);
      if (optD) options.push(optD.startsWith('D.') ? optD : `D. ${optD}`);

      let sectionType: ExamSectionType = 'lexico_grammar';
      let sectionTitle = 'LEXICO & GRAMMAR';
      if (secRaw.includes('PRONUNCIATION') || secRaw.includes('PHÁT ÂM')) {
        sectionType = 'pronunciation';
        sectionTitle = 'PRONUNCIATION & STRESS';
      } else if (secRaw.includes('READING') || secRaw.includes('ĐỌC HIỂU')) {
        sectionType = 'reading_comprehension';
        sectionTitle = 'READING COMPREHENSION';
      } else if (secRaw.includes('CLOZE') || secRaw.includes('ĐIỀN TỪ')) {
        sectionType = 'cloze_reading';
        sectionTitle = 'CLOZE-READING';
      } else if (secRaw.includes('WRITING') || secRaw.includes('VIẾT')) {
        sectionType = 'writing_short';
        sectionTitle = 'WRITING - SHORT ANSWER';
      } else if (secRaw.includes('ARRANGEMENT') || secRaw.includes('SẮP XẾP')) {
        sectionType = 'arrangement';
        sectionTitle = 'ARRANGEMENT';
      }

      // Format answer
      let finalAns = ansRaw;
      if (finalAns.length === 1 && /^[A-D]$/i.test(finalAns)) {
        const found = options.find(o => o.toUpperCase().startsWith(finalAns.toUpperCase() + '.'));
        if (found) finalAns = found;
        else finalAns = `${finalAns.toUpperCase()}. Phương án ${finalAns.toUpperCase()}`;
      }

      questions.push({
        id: `excel-q-${questions.length + 1}`,
        num: questions.length + 1,
        sectionType,
        sectionTitle,
        questionType: options.length > 0 ? 'multiple_choice' : 'short_answer',
        question: qText,
        options,
        answer: finalAns,
        explanation: expl || 'Đáp án theo hướng dẫn khảo thí.',
        passage: passage || undefined,
        passageTitle: passage ? 'Bài đọc hiểu (Reading Passage)' : undefined
      });
    });

    return {
      success: errors.length === 0 && questions.length > 0,
      questions,
      errors,
      lineErrorsMap,
      totalQuestions: questions.length,
      sectionsSummary: [{ type: 'lexico_grammar', title: 'NGÂN HÀNG CÂU HỎI TỪ EXCEL', questionCount: questions.length }]
    };
  } catch (err: any) {
    return {
      success: false,
      questions: [],
      errors: [{ lineIndex: 0, lineNumber: 1, lineText: '', message: `Lỗi đọc tệp Excel: ${err.message}` }],
      lineErrorsMap: { 1: `Lỗi đọc tệp Excel: ${err.message}` },
      totalQuestions: 0,
      sectionsSummary: []
    };
  }
}

// Validation check helper for questions before saving
export function validateExamQuestions(questions: ExamQuestion[]): ValidationSummary {
  const missingAnswerIds: string[] = [];
  const missingOptionsIds: string[] = [];
  const emptyContentIds: string[] = [];
  const duplicatePairs: { id1: string; id2: string; num1: number; num2: number; similarity: number }[] = [];

  questions.forEach((q, idx) => {
    // Missing answer
    if (!q.answer || !q.answer.trim()) {
      missingAnswerIds.push(q.id);
    }

    // Incomplete options for multiple choice
    if (q.questionType !== 'short_answer' && q.questionType !== 'essay') {
      if (!q.options || q.options.length < 2) {
        missingOptionsIds.push(q.id);
      }
    }

    // Empty content
    if (!q.question || !q.question.trim()) {
      emptyContentIds.push(q.id);
    }

    // Text duplicate check
    for (let j = idx + 1; j < questions.length; j++) {
      const other = questions[j];
      const sim = calculateTextSimilarity(q.question, other.question);
      if (sim > 0.75) {
        duplicatePairs.push({
          id1: q.id,
          id2: other.id,
          num1: q.num || idx + 1,
          num2: other.num || j + 1,
          similarity: Math.round(sim * 100)
        });
      }
    }
  });

  const hasErrors =
    missingAnswerIds.length > 0 ||
    missingOptionsIds.length > 0 ||
    emptyContentIds.length > 0 ||
    duplicatePairs.length > 0;

  const validCount = questions.length - new Set([
    ...missingAnswerIds,
    ...missingOptionsIds,
    ...emptyContentIds
  ]).size;

  return {
    total: questions.length,
    validCount: Math.max(0, validCount),
    hasErrors,
    missingAnswerIds,
    missingOptionsIds,
    emptyContentIds,
    duplicatePairs
  };
}

// Shuffle Question Order
export function shuffleExamQuestions(questions: ExamQuestion[]): ExamQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.map((q, idx) => ({ ...q, num: idx + 1 }));
}

// Shuffle Options (A, B, C, D) within each multiple choice question
export function shuffleQuestionOptions(questions: ExamQuestion[]): ExamQuestion[] {
  return questions.map((q) => {
    if (!q.options || q.options.length < 2) return q;

    // Find original answer text
    const curAns = q.answer || '';
    let targetAnswerText = '';
    const letterMatch = curAns.match(/^([A-D])\./i);

    if (letterMatch) {
      const letter = letterMatch[1].toUpperCase();
      const matchedOpt = q.options.find(o => o.toUpperCase().startsWith(letter + '.'));
      targetAnswerText = matchedOpt ? matchedOpt.replace(/^[A-D]\.\s*/i, '').trim() : curAns;
    } else {
      targetAnswerText = curAns.replace(/^[A-D]\.\s*/i, '').trim();
    }

    // Strip letters and shuffle text only
    const pureOptions = q.options.map(o => o.replace(/^[A-D]\.\s*/i, '').trim());
    for (let i = pureOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pureOptions[i], pureOptions[j]] = [pureOptions[j], pureOptions[i]];
    }

    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const newOptions = pureOptions.map((text, idx) => `${letters[idx] || 'A'}. ${text}`);

    // Re-determine correct answer letter
    let newAnswer = curAns;
    const newIdx = pureOptions.findIndex(t => t.toLowerCase() === targetAnswerText.toLowerCase());
    if (newIdx >= 0) {
      newAnswer = newOptions[newIdx];
    }

    return {
      ...q,
      options: newOptions,
      answer: newAnswer
    };
  });
}
