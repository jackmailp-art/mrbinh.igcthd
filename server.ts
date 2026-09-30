import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import { generateChatFallback } from "./server/chatFallback";
import {
  getDB,
  syncDB,
  addOrUpdateClass,
  deleteClass,
  findClassByPin,
  addOrUpdateExam,
  deleteExam,
  addOrUpdateStudent,
  deleteStudent,
  batchAddStudents,
  recordSubmission
} from "./server/db";
import {
  generateCurriculumComprehensiveExam,
  generateExamWithGemini,
  regenerateQuestionWithGemini,
  gradeStudentEssay
} from "./server/examEngine";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// Centralized persistent storage API endpoints
app.get("/api/db", (req, res) => {
  res.json(getDB());
});

app.post("/api/db/sync", (req, res) => {
  res.json(syncDB(req.body));
});

app.get("/api/classes", (req, res) => {
  res.json(getDB().classes);
});

app.post("/api/classes", (req, res) => {
  const result = addOrUpdateClass(req.body);
  res.json(result);
});

app.delete("/api/classes/:id", (req, res) => {
  const success = deleteClass(req.params.id);
  res.json({ success });
});

app.get("/api/classes/verify-pin/:pin", (req, res) => {
  const result = findClassByPin(req.params.pin);
  if (result) {
    return res.json({ valid: true, ...result });
  }
  return res.status(404).json({
    valid: false,
    message: "Không tìm thấy lớp học với mã PIN này. Vui lòng kiểm tra lại!"
  });
});

app.get("/api/exams", (req, res) => {
  res.json(getDB().exams);
});

app.post("/api/exams", (req, res) => {
  res.json(addOrUpdateExam(req.body));
});

app.delete("/api/exams/:id", (req, res) => {
  const success = deleteExam(req.params.id);
  res.json({ success });
});

app.get("/api/students", (req, res) => {
  res.json(getDB().students);
});

app.post("/api/students", (req, res) => {
  res.json(addOrUpdateStudent(req.body));
});

app.delete("/api/students/:id", (req, res) => {
  const success = deleteStudent(req.params.id);
  res.json({ success });
});

app.post("/api/students/batch", (req, res) => {
  const { students = [], classes = [] } = req.body;
  res.json(batchAddStudents(students, classes));
});

app.get("/api/submissions", (req, res) => {
  res.json(getDB().submissions);
});

app.post("/api/submissions", (req, res) => {
  const sub = recordSubmission(req.body);
  res.json({ success: true, submission: sub });
});

// Helper for realistic fallback questions based on English curriculum in Vietnam
function generateFallbackQuestions(topic: string, grade: string, count: number, difficulty: string) {
  const bank = [
    {
      q: "Choose the word whose underlined part is pronounced differently from the others:",
      options: ["A. decided", "B. waited", "C. watched", "D. invited"],
      answer: "C. watched",
      explanation: "Đuôi '-ed' trong 'watched' /wɒtʃt/ phát âm là /t/ vì đứng sau phụ âm vô thanh /tʃ/. Các từ còn lại phát âm là /ɪd/ vì tận cùng là /t/ hoặc /d/.",
      grammarPoint: "Quy tắc phát âm đuôi -ed"
    },
    {
      q: "Choose the word whose main stress is placed differently from that of the others:",
      options: ["A. preserve", "B. protect", "C. damage", "D. pollute"],
      answer: "C. damage",
      explanation: "'damage' có trọng âm rơi vào âm tiết thứ nhất /ˈdæm.ɪdʒ/. Ba từ còn lại 'preserve' /prɪˈzɜːv/, 'protect' /prəˈtekt/, 'pollute' /pəˈluːt/ đều có trọng âm rơi vào âm tiết thứ hai.",
      grammarPoint: "Trọng âm từ có 2 âm tiết"
    },
    {
      q: "If I _______ his phone number, I would have invited him to my birthday party yesterday.",
      options: ["A. had known", "B. knew", "C. know", "D. have known"],
      answer: "A. had known",
      explanation: "Đây là câu điều kiện loại 3 (diễn tả sự việc trái ngược với quá khứ). Mệnh đề IF dùng quá khứ hoàn thành: Had + V3/ed.",
      grammarPoint: "Câu điều kiện loại 3 (Conditional Sentence Type 3)"
    },
    {
      q: "The man _______ you met at the conference yesterday is our new English teacher.",
      options: ["A. which", "B. whom", "C. whose", "D. where"],
      answer: "B. whom",
      explanation: "Đại từ quan hệ 'whom' thay thế cho danh từ chỉ người 'The man' và đóng vai trò làm tân ngữ trong mệnh đề quan hệ (you met whom).",
      grammarPoint: "Mệnh đề quan hệ (Relative Clauses)"
    },
    {
      q: "She has been living in London _______ five years, but she still misses her hometown.",
      options: ["A. since", "B. for", "C. in", "D. during"],
      answer: "B. for",
      explanation: "Thì Hiện tại hoàn thành tiếp diễn: dùng 'for' đi với khoảng thời gian (for five years), dùng 'since' đi với mốc thời gian.",
      grammarPoint: "Thì Hiện tại hoàn thành tiếp diễn (Present Perfect Continuous)"
    },
    {
      q: "My sister is very good _______ solving difficult English grammar problems.",
      options: ["A. in", "B. on", "C. at", "D. with"],
      answer: "C. at",
      explanation: "Cụm cố định: 'be good at + V-ing/Noun' nghĩa là giỏi về một lĩnh vực hoặc kỹ năng nào đó.",
      grammarPoint: "Giới từ đi kèm tính từ (Adjectives + Prepositions)"
    },
    {
      q: "The bridge _______ across the river was built by experienced engineers last year.",
      options: ["A. spanning", "B. spanned", "C. spans", "D. is spanning"],
      answer: "A. spanning",
      explanation: "Rút gọn mệnh đề quan hệ dạng chủ động (The bridge which spans/is spanning -> The bridge spanning).",
      grammarPoint: "Rút gọn mệnh đề quan hệ (Reduced Relative Clauses)"
    },
    {
      q: "Neither Lan nor her classmates _______ present at the extracurricular workshop yesterday morning.",
      options: ["A. was", "B. were", "C. is", "D. are"],
      answer: "B. were",
      explanation: "Cấu trúc 'Neither S1 nor S2 + V': động từ chia theo chủ ngữ gần nhất (S2 = 'her classmates' là số nhiều) và thời điểm 'yesterday morning' nên chọn 'were'.",
      grammarPoint: "Sự hòa hợp giữa Chủ ngữ và Động từ (Subject-Verb Agreement)"
    },
    {
      q: "He didn't pass the exam _______ he had spent a lot of time reviewing the materials.",
      options: ["A. despite", "B. because of", "C. although", "D. because"],
      answer: "C. although",
      explanation: "'Although + Clause' (mặc dù) chỉ sự tương phản. Sau 'although' là một mệnh đề hoàn chỉnh (S + V).",
      grammarPoint: "Liên từ chỉ sự tương phản (Conjunctions of Contrast)"
    },
    {
      q: "We need to come _______ with a creative solution to improve students' speaking fluency.",
      options: ["A. up", "B. out", "C. down", "D. across"],
      answer: "A. up",
      explanation: "Cụm động từ: 'come up with' có nghĩa là nảy ra, nghĩ ra (một ý tưởng, giải pháp hoặc kế hoạch).",
      grammarPoint: "Cụm động từ (Phrasal Verbs)"
    },
    {
      q: "Nam asked Mai: 'What time does the school library close today?' -> Nam asked Mai what time _______ that day.",
      options: ["A. does the school library close", "B. the school library closed", "C. did the school library close", "D. the school library had closed"],
      answer: "B. the school library closed",
      explanation: "Trong câu gián tiếp dạng câu hỏi có từ để hỏi (Wh-question): giữ nguyên từ để hỏi, đưa về dạng trần thuật (S + V lùi thì), đổi 'today' thành 'that day'.",
      grammarPoint: "Câu tường thuật (Reported Speech)"
    },
    {
      q: "By the time we arrived at the cinema, the movie _______ already.",
      options: ["A. started", "B. had started", "C. has started", "D. starts"],
      answer: "B. had started",
      explanation: "Hành động xem phim bắt đầu trước thời điểm 'arrived' trong quá khứ -> sử dụng thì quá khứ hoàn thành (Past Perfect: had + V3).",
      grammarPoint: "Thì Quá khứ hoàn thành (Past Perfect Tense)"
    }
  ];

  const selected = [];
  for (let i = 0; i < count; i++) {
    const template = bank[i % bank.length];
    
    // Auto-generate rich misconception diagnostics for wrong options if not explicitly in template
    const wrongOptions = template.options.filter(
      (opt) => !template.answer.trim().startsWith(opt.slice(0, 2))
    );
    const generatedMisconceptions = wrongOptions.map((opt) => ({
      option: opt,
      trapType: "Lỗi nhầm lẫn khái niệm / Bẫy ngữ pháp thường gặp",
      whyWrong: `Học sinh thường chọn nhầm ${opt.slice(0, 2)} do chưa chú ý sự phối hợp cấu trúc hoặc dịch nghĩa thô thay vì nhận diện dấu hiệu nhận biết ngữ cảnh.`,
    }));

    selected.push({
      id: `q-${i + 1}`,
      num: i + 1,
      question: template.q,
      options: template.options,
      answer: template.answer,
      explanation: template.explanation,
      grammarPoint: template.grammarPoint,
      misconceptions: (template as any).misconceptions || generatedMisconceptions,
      remediation: (template as any).remediation || {
        coreRule: `Nắm vững công thức chuẩn và đối chiếu trực tiếp với chủ ngữ & dấu hiệu thời gian của câu.`,
        counterExample: `Lưu ý các trường hợp ngoại lệ hoặc bẫy đảo ngữ / rút gọn tương đương trong đề thi THPT.`,
        drillTip: `Đọc kỹ cả 4 phương án trước khi chọn; loại trừ các phương án sai hình thái động từ trước.`,
      },
    });
  }

  return {
    title: `Đề kiểm tra trắc nghiệm: ${topic || "Ngữ pháp tổng hợp"}`,
    grade: grade || "Lớp 10",
    subject: "Tiếng Anh",
    questionsCount: count,
    duration: `${Math.max(15, Math.round(count * 1.5))} phút`,
    difficulty: difficulty || "Trung bình",
    questions: selected,
  };
}

// AI Exam Generator Route - Multi-section English Exam
app.post("/api/generate-exam", async (req, res) => {
  try {
    const {
      topic = "Green Living & Environmental Protection",
      grade = "Lớp 10",
      difficulty = "Thông hiểu",
      temperature = 0.8,
      random_seed,
      randomSeed = random_seed,
      metadata,
      dynamicContextTheme,
      promptTemplate,
      sectionsConfig = {
        pronunciation: { enabled: true, count: 2 },
        lexico_grammar: { enabled: true, count: 4 },
        arrangement: { enabled: true, count: 1 },
        cloze_reading: { enabled: true, count: 5 },
        reading_comprehension: { enabled: true, count: 5 },
        writing_short: { enabled: true, count: 2 },
        essay_writing: { enabled: true, count: 1 }
      },
      selectedUnits = [],
      referenceWebsites = []
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      const fallback = generateCurriculumComprehensiveExam({
        topic,
        grade,
        difficulty,
        sectionsConfig,
        selectedUnits,
        referenceWebsites
      });
      return res.json({
        success: true,
        source: "curriculum_engine",
        data: fallback,
      });
    }

    try {
      const examData = await generateExamWithGemini(ai, {
        topic,
        grade,
        difficulty,
        temperature,
        dynamicContextTheme,
        promptTemplate,
        random_seed: random_seed || randomSeed || metadata?.random_seed,
        randomSeed: randomSeed || random_seed || metadata?.random_seed,
        metadata,
        sectionsConfig,
        selectedUnits,
        referenceWebsites
      });
      return res.json({
        success: true,
        source: "gemini_ai",
        data: examData,
      });
    } catch (aiErr: any) {
      console.warn("Gemini generation failed, falling back to curriculum engine:", aiErr?.message);
      const fallback = generateCurriculumComprehensiveExam({
        topic,
        grade,
        difficulty,
        sectionsConfig,
        selectedUnits,
        referenceWebsites
      });
      return res.json({
        success: true,
        source: "curriculum_engine_fallback",
        data: fallback,
        note: "Được sinh bởi Động cơ Khảo thí Tiếng Anh chuẩn GDPT 2018.",
      });
    }
  } catch (error: any) {
    console.error("General exam generation error:", error);
    const fallback = generateCurriculumComprehensiveExam({
      topic: req.body.topic || "Tiếng Anh Tổng Hợp",
      grade: req.body.grade || "Lớp 10",
      difficulty: req.body.difficulty || "Thông hiểu",
      sectionsConfig: req.body.sectionsConfig,
      selectedUnits: req.body.selectedUnits || [],
      referenceWebsites: req.body.referenceWebsites || []
    });
    return res.json({
      success: true,
      source: "curriculum_engine_fallback",
      data: fallback
    });
  }
});

// AI Exam Digitizer Endpoint - Converts raw text from Word/PDF/Text into structured exam
app.post("/api/digitize-exam", async (req, res) => {
  try {
    const { rawText = "", grade = "Lớp 12", topic = "Tiếng Anh" } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ success: false, message: "Văn bản rỗng" });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `Bạn là chuyên gia số hóa đề thi tiếng Anh (English Exam Digitizer).
Nhiệm vụ: Phân tích văn bản đề thi thô sau đây và bóc tách thành danh sách câu hỏi theo định dạng JSON chuẩn.

Văn bản đề thi:
"""
${rawText.slice(0, 14000)}
"""

Yêu cầu bóc tách chính xác:
1. title: Tiêu đề đề thi (nếu có trong văn bản, hoặc tạo tiêu đề phù hợp: "Đề Khảo Sát Năng Lực Tiếng Anh ${grade}")
2. questions: Mảng các câu hỏi, mỗi câu gồm:
   - id: chuỗi id duy nhất, ví dụ "q-dig-1"
   - num: số thứ tự câu hỏi (1, 2, 3...)
   - question: nội dung câu hỏi (giữ nguyên gạch chân HTML <u>...</u> nếu có)
   - options: mảng các phương án (thường là 4 phương án ["A. ...", "B. ...", "C. ...", "D. ..."], hoặc 2 phương án cho Đúng/Sai)
   - answer: đáp án đúng (ví dụ "A. ...", hoặc "A", hoặc nếu văn bản có bảng đáp án ở cuối đề thì tự động đối chiếu ghép vào!)
   - explanation: lời giải thích chi tiết (nếu có trong đề hoặc tự sinh giải thích ngắn gọn, sư phạm)
   - sectionType: một trong các loại: 'pronunciation' | 'lexico_grammar' | 'arrangement' | 'cloze_reading' | 'reading_comprehension' | 'writing_short'
   - passage: đoạn văn đọc nếu câu hỏi thuộc bài đọc hiểu hoặc điền từ khuyết
   - passageTitle: tiêu đề đoạn văn (nếu có)

ĐẶC BIỆT CHÚ Ý:
- Nếu phương án nào có dấu sao (*A.*), in đậm, hoặc [x], đó là ĐÁP ÁN ĐÚNG.
- Nếu ở cuối đề có bảng đáp án (ví dụ "1.A 2.B 3.C..." hoặc "ĐÁP ÁN: 1-A, 2-B..."), hãy đọc bảng này để gán đáp án chính xác cho từng câu!

Trả về ĐÚNG định dạng JSON sau:
{
  "title": "Tiêu đề đề thi",
  "questions": [
    {
      "id": "q-dig-1",
      "num": 1,
      "question": "Nội dung câu hỏi",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "A. ...",
      "explanation": "Giải thích chi tiết",
      "sectionType": "lexico_grammar",
      "passage": ""
    }
  ]
}`;

        const geminiRes = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        });

        const textOutput = geminiRes.text || "";
        const cleanJson = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedData = JSON.parse(cleanJson);
        if (parsedData && Array.isArray(parsedData.questions) && parsedData.questions.length > 0) {
          return res.json({
            success: true,
            source: "gemini_ai",
            data: parsedData
          });
        }
      } catch (aiErr) {
        console.warn("Gemini digitize fallback to regex parser:", aiErr);
      }
    }

    return res.json({
      success: false,
      message: "Fallback to local regex parser"
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Lỗi server" });
  }
});

// Single Question Regeneration Endpoint
app.post("/api/regenerate-question", async (req, res) => {
  try {
    const {
      sectionType = "lexico_grammar",
      grade = "Lớp 10",
      topic = "General English",
      difficulty = "Thông hiểu",
      existingNum = 1,
      avoidQuestions = []
    } = req.body;

    const ai = getGeminiClient();
    const regenerated = await regenerateQuestionWithGemini(ai, {
      sectionType,
      grade,
      topic,
      difficulty,
      existingNum,
      avoidQuestions
    });

    return res.json({
      success: true,
      data: regenerated
    });
  } catch (err: any) {
    console.error("Regenerate question error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to regenerate question"
    });
  }
});

// AI Teacher Essay Grading Endpoint
app.post("/api/grade-essay", async (req, res) => {
  try {
    const {
      essayText = "",
      promptTopic = "General English Essay",
      minWords = 80,
      maxWords = 140,
      grade = "Lớp 10"
    } = req.body;

    const ai = getGeminiClient();
    const evaluation = await gradeStudentEssay(ai, {
      essayText,
      promptTopic,
      minWords,
      maxWords,
      grade
    });

    return res.json({
      success: true,
      data: evaluation
    });
  } catch (err: any) {
    console.error("Grade essay error:", err);
    // Fallback to local evaluation on error
    try {
      const fallback = await gradeStudentEssay(null, req.body);
      return res.json({
        success: true,
        data: fallback
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to grade essay"
      });
    }
  }
});

// AI Pedagogical Diagnostic Endpoint for Exam & Student Cohort
app.post("/api/ai-diagnostic", async (req, res) => {
  try {
    const {
      examTitle = "Đề thi Tiếng Anh",
      topic = "Tổng hợp",
      grade = "Lớp 12",
      className = "Lớp học",
      totalStudents = 35,
      submissionsCount = 28,
      avgScore = 7.2,
      pillars = { grammar: 78, vocab: 82, reading: 70, inference: 65 },
      topErrors = [],
      tierCounts = { remedial: 4, average: 18, advanced: 6 },
      studentName = null,
      studentScore = null,
      studentWrongQuestions = []
    } = req.body;

    const ai = getGeminiClient();

    if (ai) {
      try {
        const isIndividual = Boolean(studentName && studentScore !== null);
        const prompt = isIndividual
          ? `Bạn là Chuyên gia Khảo thí Tiếng Anh THPT Quốc gia (Bộ GD&ĐT). Hãy phân tích cá nhân hóa kết quả làm bài của học sinh "${studentName}" (Điểm số: ${studentScore}/10) trong đề thi "${examTitle}" (Chủ đề: ${topic}, Khối: ${grade}).
Các câu học sinh làm sai gồm:
${studentWrongQuestions.slice(0, 8).map((q: any) => `- Câu ${q.num}: ${q.question} | Điểm ngữ pháp: ${q.grammarPoint || 'Chưa rõ'} | Em chọn: ${q.chosen} | Đáp án đúng: ${q.correct}`).join('\n')}

Hãy trả về định dạng JSON thuần túy (không bọc code block markdown nếu có thể, hoặc bọc \`\`\`json) với cấu trúc:
{
  "summary": "Đánh giá tổng quan năng lực và điểm mạnh/yếu của em ${studentName}",
  "weakestPillars": ["Lỗ hổng 1", "Lỗ hổng 2"],
  "specificRootCauses": ["Nguyên nhân sai lầm cụ thể 1", "Nguyên nhân 2"],
  "personalizedRoadmap": [
    "Bước 1 trong 7 ngày tới...",
    "Bước 2 trong 14 ngày tới...",
    "Mục tiêu điểm số nâng cấp..."
  ],
  "teacherEncouragement": "Lời động viên và nhắn nhủ từ thầy/cô dành cho em"
}`
          : `Bạn là Chuyên gia Khảo thí và Đo lường Sư phạm Tiếng Anh THPT (Bộ GD&ĐT). Hãy chẩn đoán lỗ hổng kiến thức tổng thể cho cả lớp "${className}" sau khi làm xong đề thi "${examTitle}" (Chủ đề: ${topic}, Khối: ${grade}).
Thống kê lớp: ${submissionsCount}/${totalStudents} học sinh nộp bài, Điểm TB: ${avgScore}/10đ.
Tỉ lệ nắm vững 4 trụ cột: Ngữ pháp: ${pillars.grammar}%, Từ vựng: ${pillars.vocab}%, Đọc hiểu: ${pillars.reading}%, Suy luận: ${pillars.inference}%.
Phân hóa: Nhóm yếu (<5đ): ${tierCounts.remedial} em, Nhóm TB-Khá (5-7.9đ): ${tierCounts.average} em, Nhóm Giỏi (8-10đ): ${tierCounts.advanced} em.
Top các câu hỏi học sinh sai nhiều nhất:
${topErrors.slice(0, 6).map((e: any) => `- Câu ${e.num} (Tỉ lệ sai: ${e.failRate}%): ${e.question} [Chuyên đề: ${e.grammarPoint}]. Đáp án đúng: ${e.correctAnswer}. Phương án bẫy học sinh hay chọn nhầm: ${e.mostCommonWrongOption || 'Bẫy ngữ pháp'}`).join('\n')}

Hãy trả về JSON thuần túy:
{
  "executiveSummary": "Nhận xét tổng quan chất lượng làm bài của lớp đối với đề thi này",
  "criticalAlerts": [
    "Cảnh báo lỗ hổng 1 cần khắc phục ngay trên lớp",
    "Cảnh báo lỗ hổng 2..."
  ],
  "pillarEvaluation": {
    "grammar": "Đánh giá chi tiết phần ngữ pháp của đề này",
    "vocab": "Đánh giá chi tiết phần từ vựng và collocations",
    "reading": "Đánh giá chi tiết phần đọc hiểu và quét thông tin",
    "inference": "Đánh giá kỹ năng suy luận và tư duy phản biện"
  },
  "actionPlan": {
    "remedial": "Kế hoạch can thiệp cho nhóm Yếu / Mất gốc (<5đ)",
    "average": "Chiến lược bứt phá cho nhóm Trung bình - Khá (5-7.9đ)",
    "advanced": "Kế hoạch thử thách cho nhóm Giỏi - Xuất sắc (8-10đ)",
    "suggestedLesson": "Nội dung bài học giáo viên nên bổ sung 15 phút đầu giờ tiếp theo"
  }
}`;

        const geminiRes = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        });

        const rawText = geminiRes.text || "";
        const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        return res.json({
          success: true,
          source: "gemini_ai",
          data: parsed
        });
      } catch (genErr) {
        console.warn("Gemini diagnostic generation fallback:", genErr);
      }
    }

    // Dynamic Pedagogical Fallback based on real numbers
    const isIndividual = Boolean(studentName && studentScore !== null);
    if (isIndividual) {
      const fallbackInd = {
        summary: `Học sinh ${studentName} đạt ${studentScore}/10 điểm, phản ánh mức độ tiếp thu ${studentScore >= 8 ? 'rất tốt' : studentScore >= 6.5 ? 'khá đồng đều' : 'cần củng cố thêm'} kiến thức trọng tâm của đề "${examTitle}".`,
        weakestPillars: studentWrongQuestions.slice(0, 3).map((q: any) => q.grammarPoint || `Lỗi phần ${q.sectionType || 'đọc hiểu'}`),
        specificRootCauses: studentWrongQuestions.slice(0, 3).map((q: any) => `Câu ${q.num}: Học sinh nhầm lẫn giữa đáp án đúng (${q.correct}) với lựa chọn (${q.chosen}) do chưa nhận diện đầy đủ bẫy ngữ cảnh.`),
        personalizedRoadmap: [
          `Tuần 1: Xem lại toàn bộ lời giải thích chi tiết của ${studentWrongQuestions.length} câu làm sai trong đề này.`,
          `Tuần 2: Ôn tập chuyên đề ${studentWrongQuestions[0]?.grammarPoint || 'Từ vựng & Cấu trúc câu'} trong SGK Global Success.`,
          `Mục tiêu: Đạt từ ${Math.min(10, (studentScore || 5) + 1.5).toFixed(1)} điểm ở lượt làm đề kiểm tra định kỳ tiếp theo.`
        ],
        teacherEncouragement: `Thầy/Cô tin tưởng ${studentName} hoàn toàn có thể bứt phá điểm số nếu em chú ý phân tích kỹ đề bài và tránh vội vàng ở các câu bẫy từ vựng.`
      };
      return res.json({ success: true, source: "curriculum_engine", data: fallbackInd });
    }

    const fallbackClass = {
      executiveSummary: `Kết quả khảo sát đề "${examTitle}" của lớp ${className} ghi nhận ${submissionsCount}/${totalStudents} học sinh hoàn thành với điểm trung bình ${avgScore}/10. Phổ điểm cho thấy mức độ phân hóa rõ nét giữa các nhóm năng lực.`,
      criticalAlerts: topErrors.slice(0, 2).map((e: any) => `Câu ${e.num} (${e.grammarPoint}) có tới ${e.failRate}% học sinh làm sai do dính bẫy cấu trúc.`),
      pillarEvaluation: {
        grammar: `Trụ cột Ngữ pháp đạt ${pillars.grammar}% độ chuẩn xác. Học sinh nắm vững các thì cơ bản nhưng dễ mất điểm ở câu đảo ngữ hoặc mệnh đề rút gọn.`,
        vocab: `Trụ cột Từ vựng đạt ${pillars.vocab}%. Cần mở rộng thêm Collocations và từ đồng nghĩa học thuật trong SGK Global Success.`,
        reading: `Trụ cột Đọc hiểu đạt ${pillars.reading}%. Tốc độ quét thông tin (skimming & scanning) đoạn văn dài còn hạn chế.`,
        inference: `Trụ cột Suy luận đạt ${pillars.inference}%. Học sinh cần rèn luyện thêm kỹ năng phán đoán thái độ tác giả và nối mạch logic câu.`
      },
      actionPlan: {
        remedial: `Dành 1 buổi phụ đạo 45 phút ôn tập từ vựng cơ bản và công thức nhận biết thì cho ${tierCounts.remedial} em nhóm dưới 5.0đ.`,
        average: `Luyện tập chuyên đề giải bẫy Collocations và các câu sắp xếp hội thoại để nhóm ${tierCounts.average} em nâng mục tiêu lên 8+.`,
        advanced: `Cung cấp thêm 2 bài đọc báo học thuật quốc tế (BBC, The Guardian) với câu hỏi suy luận cao cho ${tierCounts.advanced} em nhóm giỏi.`,
        suggestedLesson: `Dành 15 phút đầu giờ buổi học tới để sửa chi tiết Câu ${topErrors[0]?.num || 1} và Câu ${topErrors[1]?.num || 2} - hai câu học sinh lớp mắc lỗi nhiều nhất.`
      }
    };

    return res.json({ success: true, source: "curriculum_engine", data: fallbackClass });
  } catch (err: any) {
    console.error("AI Diagnostic error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// AI Chatbot Endpoint (Supporting gemini-3.5-flash, gemini-3.1-flash-lite, gemini-3.1-pro-preview, gemini-3.8-flash)
app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages = [],
      model = "gemini-3.5-flash",
      systemInstruction = "",
      role = "teacher_copilot",
      temperature = 0.7
    } = req.body;

    const allowedModels = [
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.1-pro-preview",
      "gemini-3.8-flash"
    ];
    const targetModel = allowedModels.includes(model) ? model : "gemini-3.5-flash";

    const ai = getGeminiClient();
    if (!ai) {
      const lastMsg = messages[messages.length - 1]?.content || "";
      const reply = generateChatFallback(lastMsg, role);
      return res.json({
        success: true,
        source: "curriculum_assistant",
        model: targetModel,
        reply
      });
    }

    // Format messages for @google/genai
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || "" }]
    }));

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config: {
        systemInstruction: systemInstruction || undefined,
        temperature
      }
    });

    const reply = response.text || "Đã nhận câu hỏi của bạn.";
    return res.json({
      success: true,
      source: "gemini_ai",
      model: targetModel,
      reply
    });
  } catch (err: any) {
    console.error("Chat API error:", err);
    const lastMsg = req.body.messages?.[req.body.messages.length - 1]?.content || "";
    const reply = generateChatFallback(lastMsg, req.body.role);
    return res.json({
      success: true,
      source: "curriculum_assistant_fallback",
      model: req.body.model || "gemini-3.5-flash",
      reply,
      note: "Phản hồi từ Động cơ Trợ lý Sư phạm dự phòng."
    });
  }
});

// Text-to-Speech Endpoint with gemini-3.8-flash-lite-tts
app.post("/api/tts", async (req, res) => {
  try {
    const { text = "", voice = "Zephyr" } = req.body;
    if (!text.trim()) {
      return res.status(400).json({ success: false, message: "Missing text" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ success: false, fallbackToBrowser: true });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: text.slice(0, 800),
              speechMetadata: {
                style: "Clear, encouraging teacher voice"
              }
            } as any
          ]
        }
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || "Zephyr" }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ success: true, base64Audio });
    }
    return res.json({ success: false, fallbackToBrowser: true });
  } catch (err: any) {
    console.warn("TTS generation error:", err?.message);
    return res.json({ success: false, fallbackToBrowser: true, error: err?.message });
  }
});

// ==========================================
// 1. AUDIO TRANSCRIPTION: gemini-3.5-transcribe
// ==========================================
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audioData, mimeType = "audio/webm", prompt } = req.body;
    if (!audioData) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu âm thanh (audioData)" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        source: "local_simulation",
        text: "Today we are practicing English pronunciation and conversation skills for Unit 4: Green Living. Remember to pay close attention to stress patterns and ending sounds like /t/ and /d/.",
        note: "Mô phỏng bản ghi âm (Khi chưa cấu hình GEMINI_API_KEY)"
      });
    }

    // Clean base64 data prefix if present (e.g. data:audio/webm;base64,...)
    const cleanBase64 = audioData.includes(",") ? audioData.split(",")[1] : audioData;

    const audioPart = {
      inlineData: {
        mimeType: mimeType || "audio/webm",
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          audioPart,
          {
            text: prompt || "Transcribe this audio file accurately. Transcribe all spoken words in English or Vietnamese exactly as spoken with proper capitalization and punctuation."
          }
        ]
      },
    });

    return res.json({
      success: true,
      source: "gemini-3.5-transcribe",
      model: "gemini-3.5-transcribe",
      text: response.text || "",
    });
  } catch (err: any) {
    console.error("Transcribe API error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Lỗi xử lý bóc băng âm thanh với gemini-3.5-transcribe"
    });
  }
});

// ==========================================
// 2 & 3. VEO 3 VIDEO GENERATION: veo-3.1-fast-generate-preview
// Text-to-Video & Image-to-Video (Aspect Ratio: 16:9 or 9:16)
// ==========================================
const simulatedVideoStore = new Map<string, {
  prompt: string;
  aspectRatio: string;
  hasImage: boolean;
  createdAt: number;
}>();

app.post("/api/generate-video", async (req, res) => {
  try {
    const {
      prompt = "",
      image, // { imageBytes: string, mimeType?: string }
      aspectRatio = "16:9",
      resolution = "720p"
    } = req.body;

    // Enforce 16:9 or 9:16
    const targetAspectRatio = aspectRatio === "9:16" ? "9:16" : "16:9";
    const targetResolution = resolution === "1080p" ? "1080p" : "720p";

    const ai = getGeminiClient();

    if (!ai) {
      const simId = `sim-veo-${Date.now()}`;
      simulatedVideoStore.set(simId, {
        prompt,
        aspectRatio: targetAspectRatio,
        hasImage: Boolean(image?.imageBytes),
        createdAt: Date.now()
      });
      return res.json({
        success: true,
        operationName: `models/veo-3.1-fast-generate-preview/operations/${simId}`,
        simulated: true,
        aspectRatio: targetAspectRatio
      });
    }

    const payload: any = {
      model: "veo-3.1-fast-generate-preview",
      config: {
        numberOfVideos: 1,
        resolution: targetResolution,
        aspectRatio: targetAspectRatio,
      }
    };

    if (prompt) {
      payload.prompt = prompt;
    }

    if (image && image.imageBytes) {
      const cleanImg = image.imageBytes.includes(",") ? image.imageBytes.split(",")[1] : image.imageBytes;
      payload.image = {
        imageBytes: cleanImg,
        mimeType: image.mimeType || "image/jpeg"
      };
    }

    const operation = await ai.models.generateVideos(payload);
    return res.json({
      success: true,
      operationName: operation.name,
      aspectRatio: targetAspectRatio
    });
  } catch (err: any) {
    console.error("Veo 3 Generate Video API error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Lỗi tạo video với model veo-3.1-fast-generate-preview"
    });
  }
});

app.post("/api/video-status", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) return res.status(400).json({ error: "Missing operationName" });

    // Handle simulation
    if (operationName.includes("sim-veo-")) {
      const simId = operationName.split("/").pop() || "";
      const record = simulatedVideoStore.get(simId);
      const elapsed = record ? Date.now() - record.createdAt : 5000;
      const done = elapsed >= 5000;
      return res.json({
        done,
        simulated: true,
        progress: Math.min(100, Math.round((elapsed / 5000) * 100)),
        statusMessage: done
          ? "Video Veo 3 đã hoàn tất!"
          : "Veo 3 đang render hoạt ảnh chuyển động..."
      });
    }

    const ai = getGeminiClient();
    if (!ai) return res.status(500).json({ error: "Gemini client chưa khởi tạo" });

    const op: any = { name: operationName };
    const updated = await ai.operations.getVideosOperation({ operation: op });
    return res.json({
      done: Boolean(updated.done),
      error: updated.error,
      response: updated.response
    });
  } catch (err: any) {
    console.error("Veo 3 Video Status API error:", err);
    return res.status(500).json({ error: err.message || "Failed to poll video status" });
  }
});

app.post("/api/video-download", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) return res.status(400).json({ error: "Missing operationName" });

    if (operationName.includes("sim-veo-")) {
      return res.json({
        success: true,
        simulated: true,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      });
    }

    const ai = getGeminiClient();
    if (!ai) return res.status(500).json({ error: "Gemini client chưa khởi tạo" });

    const op: any = { name: operationName };
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: "Video URI not found in operation result" });
    }

    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY! },
    });
    res.setHeader("Content-Type", "video/mp4");
    if (videoRes.body) {
      videoRes.body.pipeTo(
        new WritableStream({
          write(chunk) { res.write(chunk); },
          close() { res.end(); },
        })
      );
    } else {
      const buffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (err: any) {
    console.error("Veo 3 Video Download API error:", err);
    return res.status(500).json({ error: err.message || "Failed to download video stream" });
  }
});

// ==========================================
// 4. GOOGLE SEARCH GROUNDING: gemini-3.5-flash with googleSearch tool
// ==========================================
app.post("/api/search-grounding", async (req, res) => {
  try {
    const { query = "", systemInstruction = "" } = req.body;
    if (!query.trim()) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập từ khóa tìm kiếm (query)" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        source: "curriculum_grounding_fallback",
        model: "gemini-3.5-flash",
        text: `Dữ liệu tổng hợp từ nguồn học liệu thực tế cho truy vấn "${query}": Các cập nhật mới nhất từ Bộ GD&ĐT (Chương trình GDPT 2018) và các tổ chức giáo dục quốc tế (British Council, BBC Learning English, Cambridge) nhấn mạnh phương pháp giảng dạy tích hợp ngữ cảnh thực tế, bài tập đọc hiểu chủ đề nóng (Green Living, AI in Education) và đa dạng hóa hình thức khảo thí.`,
        groundingChunks: [
          { web: { uri: "https://moet.gov.vn", title: "Bộ Giáo Dục và Đào Tạo - Chương trình GDPT 2018" } },
          { web: { uri: "https://learnenglish.britishcouncil.org", title: "British Council - LearnEnglish Official Portal" } },
          { web: { uri: "https://www.bbc.co.uk/learningenglish", title: "BBC Learning English - Authentic Materials" } }
        ],
        webSearchQueries: [query, `${query} Vietnam English curriculum 2026`]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction || "You are an expert English language educator and curriculum researcher. Provide accurate, up-to-date information grounded in Google Search, with clean citations and reliable sources."
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    return res.json({
      success: true,
      source: "gemini_google_search",
      model: "gemini-3.5-flash",
      text: response.text || "",
      groundingChunks: chunks,
      webSearchQueries: searchQueries,
    });
  } catch (err: any) {
    console.error("Search Grounding API error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Lỗi tra cứu dữ liệu thời gian thực với gemini-3.5-flash"
    });
  }
});

// Vite & WebSocket server setup
async function startServer() {
  const httpServer = http.createServer(app);

  // Setup WebSocket Server for Gemini 3.8 Live API real-time voice streaming
  const wss = new WebSocketServer({ server: httpServer, path: "/live" });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("Client connected to Gemini 3.8 Live WebSocket");
    let liveSession: any = null;
    let isClosed = false;

    clientWs.on("close", () => {
      isClosed = true;
      if (liveSession) {
        try {
          liveSession.close();
        } catch {}
        liveSession = null;
      }
    });

    clientWs.on("error", (err) => {
      console.warn("Live Client WebSocket error:", err);
    });

    clientWs.on("message", async (rawData) => {
      try {
        const msg = JSON.parse(rawData.toString());

        if (msg.type === "init") {
          const {
            voiceName = "Zephyr",
            systemInstruction = "You are a friendly and professional English teacher and speaking partner.",
          } = msg;

          const ai = getGeminiClient();
          if (!ai) {
            clientWs.send(JSON.stringify({
              type: "status",
              status: "ready_fallback",
              message: "Chế độ mô phỏng giọng nói sẵn sàng (Gemini API key chưa được gán)."
            }));
            return;
          }

          try {
            liveSession = await ai.live.connect({
              model: "gemini-3.8-live",
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voiceName || "Zephyr" }
                  }
                },
                systemInstruction: systemInstruction || "You are an encouraging English teacher and speaking partner."
              },
              callbacks: {
                onmessage: (message: LiveServerMessage) => {
                  if (isClosed) return;
                  const parts = message.serverContent?.modelTurn?.parts;
                  let textChunk = "";
                  let audioChunk = "";
                  if (parts) {
                    for (const part of parts) {
                      if (part.text) textChunk += part.text;
                      if (part.inlineData?.data) audioChunk += part.inlineData.data;
                    }
                  }
                  if (audioChunk) {
                    clientWs.send(JSON.stringify({ type: "audio", audio: audioChunk }));
                  }
                  if (textChunk) {
                    clientWs.send(JSON.stringify({ type: "text", text: textChunk }));
                  }
                  if (message.serverContent?.turnComplete) {
                    clientWs.send(JSON.stringify({ type: "turnComplete" }));
                  }
                  if (message.serverContent?.interrupted) {
                    clientWs.send(JSON.stringify({ type: "interrupted", interrupted: true }));
                  }
                },
                onerror: (err: any) => {
                  console.error("Gemini Live session error:", err);
                  if (!isClosed) {
                    clientWs.send(JSON.stringify({
                      type: "error",
                      error: err?.message || "Lỗi phiên Live API"
                    }));
                  }
                },
                onclose: () => {
                  if (!isClosed) {
                    clientWs.send(JSON.stringify({ type: "closed" }));
                  }
                }
              }
            });

            clientWs.send(JSON.stringify({
              type: "status",
              status: "connected",
              model: "gemini-3.8-live",
              voice: voiceName
            }));
          } catch (connectErr: any) {
            console.warn("Failed to connect Gemini Live session:", connectErr?.message);
            clientWs.send(JSON.stringify({
              type: "status",
              status: "fallback",
              message: `Không thể kết nối Live API: ${connectErr?.message || "Lỗi mạng"}. Sẵn sàng chế độ hội thoại dự phòng.`
            }));
          }
          return;
        }

        if (msg.type === "audio") {
          if (liveSession && msg.audio) {
            liveSession.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" }
            });
          }
          return;
        }

        if (msg.type === "text") {
          if (liveSession && msg.text) {
            try {
              liveSession.send({
                clientContent: {
                  turns: [
                    {
                      role: "user",
                      parts: [{ text: msg.text }]
                    }
                  ],
                  turnComplete: true
                }
              });
            } catch (e: any) {
              console.warn("Error sending text to liveSession:", e?.message);
            }
          }
          return;
        }
      } catch (parseErr) {
        console.error("Error parsing WS message:", parseErr);
      }
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Teacher Management Server with Gemini Live WebSocket running on port ${PORT}`);
  });
}

startServer();
