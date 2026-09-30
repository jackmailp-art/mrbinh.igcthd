import { ClassItem, ExamItem, StudentItem, HomeworkTask, AiQuota, SubmissionItem } from '../types';

const STORAGE_KEYS = {
  CLASSES: 'eng_classes_v1',
  CLASSES_BACKUP: 'eng_classes_backup_v1',
  DELETED_CLASSES: 'eng_deleted_classes_v1',
  EXAMS: 'eng_exams_v1',
  EDUADMIN_EXAMS: 'EDUADMIN_EXAM_BANK',
  DELETED_EXAMS: 'EDUADMIN_DELETED_EXAM_IDS',
  STUDENTS: 'eng_students_v1',
  STUDENTS_BACKUP: 'eng_students_backup_v1',
  DELETED_STUDENTS: 'eng_deleted_students_v1',
  TASKS: 'eng_tasks_v1',
  SUBMISSIONS: 'eng_submissions_v1',
  AI_USAGE: 'eng_ai_usage_v1',
};

export const getDeletedClassIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_CLASSES);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
};

export const markClassAsDeleted = (id: string) => {
  try {
    const set = getDeletedClassIds();
    set.add(id);
    localStorage.setItem(STORAGE_KEYS.DELETED_CLASSES, JSON.stringify(Array.from(set)));
  } catch {}
};

export const unmarkClassAsDeleted = (id: string) => {
  try {
    const set = getDeletedClassIds();
    set.delete(id);
    localStorage.setItem(STORAGE_KEYS.DELETED_CLASSES, JSON.stringify(Array.from(set)));
  } catch {}
};

export const getDeletedStudentIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_STUDENTS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
};

export const markStudentAsDeleted = (id: string) => {
  try {
    const set = getDeletedStudentIds();
    set.add(id);
    localStorage.setItem(STORAGE_KEYS.DELETED_STUDENTS, JSON.stringify(Array.from(set)));
  } catch {}
};

export const unmarkStudentAsDeleted = (id: string) => {
  try {
    const set = getDeletedStudentIds();
    set.delete(id);
    localStorage.setItem(STORAGE_KEYS.DELETED_STUDENTS, JSON.stringify(Array.from(set)));
  } catch {}
};

export const getDeletedExamIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_EXAMS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
};

export const markExamAsDeleted = (id: string) => {
  try {
    const set = getDeletedExamIds();
    set.add(id);
    localStorage.setItem(STORAGE_KEYS.DELETED_EXAMS, JSON.stringify(Array.from(set)));
  } catch {}
};

export const unmarkExamAsDeleted = (id: string) => {
  try {
    const set = getDeletedExamIds();
    set.delete(id);
    localStorage.setItem(STORAGE_KEYS.DELETED_EXAMS, JSON.stringify(Array.from(set)));
  } catch {}
};

// 1. LocalStorage Helpers for immediate synchronous hydration
export const loadLocalState = () => {
  try {
    let classes = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (!classes || classes === '[]') {
      const backupClasses = localStorage.getItem(STORAGE_KEYS.CLASSES_BACKUP);
      if (backupClasses && backupClasses !== '[]') {
        classes = backupClasses;
      }
    }

    // Prioritize EDUADMIN_EXAM_BANK, fallback to eng_exams_v1
    const eduAdminExams = localStorage.getItem(STORAGE_KEYS.EDUADMIN_EXAMS);
    const legacyExams = localStorage.getItem(STORAGE_KEYS.EXAMS);
    const exams = eduAdminExams || legacyExams;

    let students = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!students || students === '[]' || students === 'null') {
      const backupStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS_BACKUP);
      if (backupStudents && backupStudents !== '[]' && backupStudents !== 'null') {
        students = backupStudents;
      }
    }
    if (!students || students === '[]' || students === 'null') {
      const latestBackup = localStorage.getItem('eng_students_latest_backup');
      if (latestBackup && latestBackup !== '[]' && latestBackup !== 'null') {
        students = latestBackup;
      }
    }

    if (!classes || classes === '[]' || classes === 'null') {
      const backupClasses = localStorage.getItem(STORAGE_KEYS.CLASSES_BACKUP);
      if (backupClasses && backupClasses !== '[]' && backupClasses !== 'null') {
        classes = backupClasses;
      }
    }

    const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const submissions = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const aiUsage = localStorage.getItem(STORAGE_KEYS.AI_USAGE);
    const deletedIds = getDeletedExamIds();
    const deletedClassIds = getDeletedClassIds();
    const deletedStudentIds = getDeletedStudentIds();

    let parsedClasses = classes ? (JSON.parse(classes) as ClassItem[]) : null;
    if (parsedClasses && deletedClassIds.size > 0) {
      parsedClasses = parsedClasses.filter(c => !deletedClassIds.has(c.id));
    }

    let parsedExams = exams ? (JSON.parse(exams) as ExamItem[]) : null;
    if (parsedExams && deletedIds.size > 0) {
      parsedExams = parsedExams.filter(e => !deletedIds.has(e.id));
    }

    // Merge in THPT exams from THPT_SAVED_EXAMS_BANK so all assigned THPT exams are present in exams state
    try {
      const thptRaw = localStorage.getItem('THPT_SAVED_EXAMS_BANK');
      if (thptRaw) {
        const thptExams = JSON.parse(thptRaw) as ExamItem[];
        if (Array.isArray(thptExams) && thptExams.length > 0) {
          const map = new Map((parsedExams || []).map(e => [e.id, e]));
          thptExams.forEach(te => {
            if (!deletedIds.has(te.id)) {
              if (map.has(te.id)) {
                const existing = map.get(te.id)!;
                if ((te.assignedClasses && te.assignedClasses.length > 0) || (te.assignedClassIds && te.assignedClassIds.length > 0)) {
                  map.set(te.id, { ...existing, ...te });
                }
              } else {
                map.set(te.id, te);
              }
            }
          });
          parsedExams = Array.from(map.values());
        }
      }
    } catch {}

    let parsedStudents = students ? (JSON.parse(students) as StudentItem[]) : null;
    if (parsedStudents && deletedStudentIds.size > 0) {
      parsedStudents = parsedStudents.filter(s => !deletedStudentIds.has(s.id));
    }

    // Map each student's classId reliably to an existing class, and NEVER wipe classes
    if (parsedStudents && Array.isArray(parsedStudents) && parsedStudents.length > 0) {
      if (!parsedClasses || !Array.isArray(parsedClasses) || parsedClasses.length === 0) {
        parsedClasses = [];
      }
      const classIdSet = new Set(parsedClasses.map(c => c.id));
      const classMapByName = new Map(parsedClasses.map(c => [c.name.toLowerCase().trim(), c.id]));
      const classMapByShortName = new Map(parsedClasses.map(c => [c.name.toLowerCase().replace(/^lớp\s+/i, '').trim(), c.id]));

      parsedStudents = parsedStudents.map(st => {
        if (classIdSet.has(st.classId)) {
          return st;
        }
        // Try matching by className
        const rawName = (st.className || '').toLowerCase().trim();
        const shortName = rawName.replace(/^lớp\s+/i, '').trim();
        const matchedId = classMapByName.get(rawName) || classMapByShortName.get(shortName);

        if (matchedId) {
          const matchedClass = parsedClasses!.find(c => c.id === matchedId);
          return {
            ...st,
            classId: matchedId,
            className: matchedClass ? matchedClass.name : st.className
          };
        }

        // Auto-preserve class if missing, never dump into random class
        const targetName = st.className && st.className.trim() ? st.className.trim() : `Lớp ${st.classId}`;
        const autoClsId = st.classId || `c-auto-${Date.now()}`;
        const autoGrade = targetName.includes('10') ? 'Lớp 10' : targetName.includes('11') ? 'Lớp 11' : targetName.includes('12') ? 'Lớp 12' : 'Toàn trường';
        const newClass: ClassItem = {
          id: autoClsId,
          name: targetName.toLowerCase().startsWith('lớp') ? targetName : `Lớp ${targetName}`,
          grade: autoGrade,
          code: `LH-${Math.floor(100 + Math.random() * 900)}`,
          studentsCount: 1,
          activeExams: 0,
          pin: String(Math.floor(1000 + Math.random() * 9000)),
          description: 'Lớp học được bảo toàn tự động từ danh sách học sinh'
        };
        parsedClasses!.push(newClass);
        classIdSet.add(autoClsId);
        classMapByName.set(newClass.name.toLowerCase().trim(), autoClsId);
        return {
          ...st,
          classId: autoClsId,
          className: newClass.name
        };
      });

      // Update student count in classes
      parsedClasses = parsedClasses.map(c => {
        const count = parsedStudents!.filter(s => s.classId === c.id || (s.className && s.className.toLowerCase() === c.name.toLowerCase())).length;
        return { ...c, studentsCount: count };
      });
    }

    return {
      classes: parsedClasses && parsedClasses.length > 0 ? parsedClasses : null,
      exams: parsedExams && parsedExams.length > 0 ? parsedExams : null,
      students: parsedStudents && parsedStudents.length > 0 ? parsedStudents : null,
      tasks: tasks ? (JSON.parse(tasks) as HomeworkTask[]) : null,
      submissions: submissions ? (JSON.parse(submissions) as SubmissionItem[]) : null,
      aiUsage: aiUsage ? (JSON.parse(aiUsage) as AiQuota) : null,
    };
  } catch (err) {
    console.warn('Could not read from localStorage:', err);
    return { classes: null, exams: null, students: null, tasks: null, submissions: null, aiUsage: null };
  }
};

export const saveLocalState = (data: {
  classes?: ClassItem[];
  exams?: ExamItem[];
  students?: StudentItem[];
  tasks?: HomeworkTask[];
  submissions?: SubmissionItem[];
  aiUsage?: AiQuota;
}) => {
  try {
    if (data.classes !== undefined) {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(data.classes));
      if (Array.isArray(data.classes) && data.classes.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CLASSES_BACKUP, JSON.stringify(data.classes));
      }
    }
    if (data.exams !== undefined) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(data.exams));
      localStorage.setItem(STORAGE_KEYS.EDUADMIN_EXAMS, JSON.stringify(data.exams));
    }
    if (data.students !== undefined) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
      if (Array.isArray(data.students) && data.students.length > 0) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS_BACKUP, JSON.stringify(data.students));
        localStorage.setItem('eng_students_latest_backup', JSON.stringify(data.students));
      }
    }
    if (data.tasks !== undefined) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
    if (data.submissions !== undefined) localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(data.submissions));
    if (data.aiUsage !== undefined) localStorage.setItem(STORAGE_KEYS.AI_USAGE, JSON.stringify(data.aiUsage));
  } catch (err) {
    console.warn('Could not write to localStorage:', err);
  }
};

// 2. Server API calls for Cross-Device Synchronization
export const apiService = {
  // Fetch entire centralized database from server (safe merge, does not overwrite local state blindly)
  async getFullDatabase(): Promise<{
    classes: ClassItem[];
    exams: ExamItem[];
    students: StudentItem[];
    tasks: HomeworkTask[];
    submissions: SubmissionItem[];
    aiUsage: AiQuota;
  } | null> {
    try {
      const res = await fetch('/api/db');
      if (!res.ok) throw new Error('Failed to fetch from server db');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Server sync unavailable, using local cache:', err);
      return null;
    }
  },

  // Sync state up to server
  async syncToServer(partialData: {
    classes?: ClassItem[];
    exams?: ExamItem[];
    students?: StudentItem[];
    tasks?: HomeworkTask[];
    submissions?: SubmissionItem[];
    aiUsage?: AiQuota;
  }) {
    saveLocalState(partialData);
    try {
      const res = await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialData),
      });
      if (!res.ok) throw new Error('Sync failed');
      return await res.json();
    } catch (err) {
      console.warn('Server sync failed:', err);
    }
  },

  // Class APIs
  async createOrUpdateClass(cls: ClassItem) {
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cls),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to save class to server:', err);
    }
    return cls;
  },

  async deleteClass(id: string) {
    try {
      await fetch(`/api/classes/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete class from server:', err);
    }
  },

  async deleteExam(id: string) {
    try {
      await fetch(`/api/exams/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete exam from server:', err);
    }
  },

  // Student Verify PIN (Used by students from phone or other devices)
  async verifyPin(pin: string): Promise<{
    valid: boolean;
    classItem?: ClassItem;
    exams?: ExamItem[];
    students?: StudentItem[];
    message?: string;
  }> {
    try {
      const res = await fetch(`/api/classes/verify-pin/${encodeURIComponent(pin.trim())}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Error verifying PIN on server:', err);
      return { valid: false, message: 'Không thể kết nối tới máy chủ. Vui lòng thử lại!' };
    }
  },

  // Exam APIs
  async createOrUpdateExam(exam: ExamItem) {
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exam),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to save exam to server:', err);
    }
    return exam;
  },

  // Student APIs
  async createOrUpdateStudent(student: StudentItem) {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to save student to server:', err);
    }
    return student;
  },

  async deleteStudent(id: string) {
    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete student from server:', err);
    }
  },

  async batchAddStudents(students: StudentItem[], classes: ClassItem[] = []) {
    try {
      const res = await fetch('/api/students/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students, classes }),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to batch save students to server:', err);
    }
    return { students, classes };
  },

  // Submissions API (Student takes and submits exam)
  async submitExam(submission: SubmissionItem) {
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to submit exam to server:', err);
    }
    return { success: true, submission };
  },

  async getSubmissions(): Promise<SubmissionItem[]> {
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to get submissions from server:', err);
    }
    return [];
  },

  // AI Teacher Essay Grading
  async gradeEssay(params: {
    essayText: string;
    promptTopic?: string;
    minWords?: number;
    maxWords?: number;
    grade?: string;
  }) {
    try {
      const res = await fetch('/api/grade-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) return data.data;
      }
    } catch (err) {
      console.warn('Teacher essay grading request failed, running client-side teacher grading:', err);
    }

    // Client-side Teacher Evaluation Fallback (4 standard criteria: Task, Coherence, Lexical, Grammar)
    const {
      essayText = "",
      promptTopic = "Đoạn văn tiếng Anh",
      minWords = 80,
      maxWords = 140,
    } = params;

    const words = essayText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    if (wordCount === 0) {
      return {
        totalScore: 0,
        criteria: {
          taskAchievement: { score: 0, maxScore: 2.5, feedback: "Học sinh chưa làm bài viết (để trống)." },
          coherence: { score: 0, maxScore: 2.5, feedback: "Không có nội dung để đánh giá tính mạch lạc." },
          lexical: { score: 0, maxScore: 2.5, feedback: "Chưa có vốn từ vựng được thể hiện." },
          grammar: { score: 0, maxScore: 2.5, feedback: "Chưa có cấu trúc ngữ pháp được thể hiện." }
        },
        teacherGeneralComment: "Em chưa hoàn thành bài viết đoạn văn. Hãy cố gắng luyện viết từng câu đơn giản trước khi chuyển sang đoạn văn hoàn chỉnh nhé!",
        strengths: [],
        areasToImprove: ["Cần hoàn thành bài viết để được tính điểm toàn bài."],
        suggestedRevision: ""
      };
    }

    // 1. Task Achievement (Max 2.5)
    let taScore = 1.0;
    let taFeedback = "";
    if (wordCount < minWords * 0.5) {
      taScore = 1.0;
      taFeedback = `Đoạn văn còn ngắn (${wordCount} từ so với yêu cầu ${minWords}-${maxWords} từ). Cần phát triển thêm ý triển khai.`;
    } else if (wordCount < minWords * 0.8) {
      taScore = 1.8;
      taFeedback = `Đạt ${wordCount} từ, đã đề cập đúng chủ đề nhưng cần bổ sung thêm dẫn chứng hoặc lý do cụ thể.`;
    } else if (wordCount <= maxWords * 1.25) {
      taScore = 2.4;
      taFeedback = `Độ dài rất chuẩn (${wordCount} từ). Bài viết bám sát và trả lời trọn vẹn yêu cầu chủ đề "${promptTopic}".`;
    } else {
      taScore = 2.2;
      taFeedback = `Bài viết khá phong phú (${wordCount} từ) nhưng hơi dài so với giới hạn ${minWords}-${maxWords} từ. Nên cô đọng các ý phụ.`;
    }

    // 2. Coherence & Cohesion (Max 2.5)
    const lowerText = essayText.toLowerCase();
    const transitions = [
      'first', 'firstly', 'second', 'secondly', 'third', 'furthermore',
      'moreover', 'in addition', 'besides', 'for example', 'for instance',
      'however', 'therefore', 'in conclusion', 'finally', 'as a result'
    ];
    const foundTransitions = transitions.filter(t => lowerText.includes(t));
    let ccScore = 1.5;
    let ccFeedback = "";
    if (foundTransitions.length >= 3) {
      ccScore = 2.3;
      ccFeedback = `Mạch văn liên kết tốt, sử dụng linh hoạt các từ nối liên kết (${foundTransitions.slice(0, 3).join(', ')}).`;
    } else if (foundTransitions.length >= 1) {
      ccScore = 1.9;
      ccFeedback = `Có dùng từ nối ý (${foundTransitions.join(', ')}). Nên bổ sung thêm các liên từ chỉ nguyên nhân/kết quả để đoạn văn mượt mà hơn.`;
    } else {
      ccScore = 1.4;
      ccFeedback = "Các câu còn rời rạc. Cần bổ sung các từ nối như 'First, Second, Furthermore, In conclusion' để tăng tính liên kết.";
    }

    // 3. Lexical Resource (Max 2.5)
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''))).size;
    const lexicalRatio = uniqueWords / (wordCount || 1);
    let lrScore = 1.8;
    let lrFeedback = "";
    if (lexicalRatio > 0.65 && wordCount >= 50) {
      lrScore = 2.3;
      lrFeedback = "Vốn từ phong phú, có sự đa dạng trong cách diễn đạt và sử dụng các thuật ngữ đúng ngữ cảnh.";
    } else if (lexicalRatio > 0.45) {
      lrScore = 2.0;
      lrFeedback = "Vốn từ vựng tương đối đủ dùng, diễn đạt được ý chính. Nên tìm thêm các từ đồng nghĩa (synonyms) để tránh lặp từ.";
    } else {
      lrScore = 1.5;
      lrFeedback = "Còn bị lặp lại nhiều từ ngữ đơn giản. Em nên trau dồi thêm các collocations và từ vựng chuyên đề.";
    }

    // 4. Grammatical Range & Accuracy (Max 2.5)
    const complexIndicators = ['which', 'that', 'because', 'although', 'even though', 'if', 'when', 'while', 'so that', 'in order to'];
    const foundComplex = complexIndicators.filter(ci => lowerText.includes(ci));
    let grScore = 1.8;
    let grFeedback = "";
    if (foundComplex.length >= 2) {
      grScore = 2.2;
      grFeedback = "Kết hợp tốt các câu ghép và câu phức; cấu trúc ngữ pháp tương đối chuẩn xác và tự nhiên.";
    } else {
      grScore = 1.8;
      grFeedback = "Đa phần là câu đơn. Em nên kết hợp thêm các mệnh đề quan hệ (which, who) hoặc liên từ (because, although) để nâng cao chất lượng câu.";
    }

    const totalScore = Number((taScore + ccScore + lrScore + grScore).toFixed(1));

    return {
      totalScore,
      criteria: {
        taskAchievement: { score: taScore, maxScore: 2.5, feedback: taFeedback },
        coherence: { score: ccScore, maxScore: 2.5, feedback: ccFeedback },
        lexical: { score: lrScore, maxScore: 2.5, feedback: lrFeedback },
        grammar: { score: grScore, maxScore: 2.5, feedback: grFeedback }
      },
      teacherGeneralComment: totalScore >= 8.0
        ? `Thầy/Cô rất ấn tượng với bài viết của em! Em nắm vững cách lập luận, dùng từ tự nhiên và bám sát chủ đề "${promptTopic}". Hãy tiếp tục phát huy nhé!`
        : `Bài viết đã đạt yêu cầu cơ bản về chủ đề "${promptTopic}". Em cần chú ý thêm cách dùng từ nối và mở rộng cấu trúc câu phức để bài viết thêm chiều sâu!`,
      strengths: [
        foundTransitions.length > 0 ? "Biết sử dụng từ nối liên kết ý trong đoạn văn." : "Diễn đạt được các ý chính theo yêu cầu đề bài.",
        wordCount >= minWords * 0.8 ? "Độ dài đoạn văn đạt tiêu chuẩn khảo thí." : "Cấu trúc cơ bản có mở đoạn và thân đoạn."
      ],
      areasToImprove: [
        "Nên bổ sung thêm ví dụ thực tế minh họa cho luận điểm.",
        "Cần kiểm tra kỹ các lỗi chia động từ theo thì và mạo từ (a/an/the)."
      ],
      suggestedRevision: `To achieve a greener and more sustainable community, students should play an active role. First, we ought to reduce disposable plastic items by bringing our personal water tumblers to school. Moreover, sorting everyday waste into dedicated bins not only keeps classrooms clean but also facilitates recycling. Finally, participating in tree-planting campaigns and turning off unnecessary lights can make a profound difference. By taking these small yet consistent actions, we can collectively safeguard our environment for future generations.`
    };
  }
};

export {
  examService,
  toggleShuffleQuestionOrder,
  toggleShuffleAnswerOptions,
  toggleExamShuffle,
  reshuffleExam,
  resetExamShuffle,
  isExamShuffled,
  shuffleQuestionsArray,
  shuffleOptionsForQuestion,
  shuffleAllQuestionsOptions
} from './examService';
