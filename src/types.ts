export interface MisconceptionNote {
  option: string;
  trapType: string;
  whyWrong: string;
}

export type ExamSectionType =
  | 'listening'
  | 'pronunciation'
  | 'lexico_grammar'
  | 'arrangement'
  | 'cloze_reading'
  | 'reading_comprehension'
  | 'writing_short'
  | 'essay_writing';

export interface EssayRubricCriterion {
  criterion: string;
  maxScore: number;
  description: string;
  bands?: { band: string; detail: string }[];
}

export interface ScoringRubric {
  totalMaxScore: number;
  criteria: EssayRubricCriterion[];
}

export interface ExamQuestion {
  id: string;
  num: number;
  cognitiveTier?: string;
  sectionType?: ExamSectionType;
  sectionTitle?: string;
  questionType?: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false';
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  grammarPoint?: string;
  underlinedPart?: string;
  ipaTranscription?: string;
  passage?: string;
  passageTitle?: string;
  clozeNumber?: number;
  readingQuestionType?: 'main_idea' | 'detail' | 'vocabulary' | 'reference' | 'inference';
  arrangementType?: 'letter' | 'dialogue' | 'paragraph';
  arrangementItems?: string[];
  writingType?: 'word_formation' | 'sentence_transformation' | 'verb_form';
  baseWord?: string;
  originalSentence?: string;
  sentenceBeginning?: string;
  alternativeAnswers?: string[];
  // Listening specific fields
  listeningTask?: 'task1_true_false' | 'task2_multiple_choice' | 'task2_fill_blank';
  audioScript?: string;
  audioTitle?: string;
  audioSpeakerInfo?: string;
  audioEvidence?: string;
  audioUrl?: string;
  wordLimit?: string;
  fillBlankSummary?: string;
  essayPrompt?: {
    minWords: number;
    maxWords: number;
    topic: string;
    suggestedPoints?: string[];
  };
  rubric?: ScoringRubric;
  misconceptions?: MisconceptionNote[];
  remediation?: {
    coreRule: string;
    counterExample?: string;
    drillTip?: string;
  };
}

export interface ExamSectionSummary {
  type: ExamSectionType;
  title: string;
  questionCount: number;
}

export interface ExamItem {
  id: string;
  title: string;
  grade: string;
  subject: string;
  questionsCount: number;
  duration: string;
  difficulty?: string;
  topic?: string;
  sections?: ExamSectionSummary[];
  submissions: number;
  avgScore: number;
  createdAt: string;
  status: 'Đang mở' | 'Đã đóng';
  questions: ExamQuestion[];
  audioScript?: string;
  audioTitle?: string;
  audioUrl?: string;
  audioScriptTask2?: string;
  audioTitleTask2?: string;
  audioUrlTask2?: string;
  listeningMaxPlays?: number;
  // Assignment Configuration
  assignedClasses?: string[];
  assignedClassIds?: string[];
  deadline?: string;
  deadlineTime?: string;
  durationLimit?: string;
  maxAttempts?: number; // 0: unlimited, 1: once (exam mode), 2, 3...
  scoringMethod?: 'highest' | 'latest' | 'first';
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  examCode?: string;
  versionGroup?: string;
  originalQuestions?: ExamQuestion[];
  preventCheating?: boolean;
  showSolutions?: 'always' | 'after_deadline' | 'score_only';
}

export interface AssignmentConfig {
  examId: string;
  examTitle: string;
  classIds: string[];
  classNames: string[];
  deadline: string;
  deadlineTime?: string;
  durationLimit: string;
  maxAttempts: number; // 0: unlimited, 1: once, 2, 3...
  scoringMethod: 'highest' | 'latest' | 'first';
  shuffleQuestions: boolean;
  shuffleOptions?: boolean;
  preventCheating: boolean;
  showSolutions: 'always' | 'after_deadline' | 'score_only';
}

export interface ClassItem {
  id: string;
  name: string;
  grade: string;
  code: string;
  studentsCount: number;
  activeExams: number;
  pin: string;
  description?: string;
}

export interface StudentItem {
  id: string;
  name: string;
  studentId: string;
  classId: string;
  className: string;
  avatar?: string;
  progress: number;
  lastScore: number;
  status: 'Xuất sắc' | 'Hoàn thành' | 'Cần bổ trợ' | 'Chưa làm';
  phone?: string;
  parentPhone?: string;
  completedExams: number;
  notes?: string;
}

export type TaskCategory = 'Homework' | 'Project' | 'Revision';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface HomeworkTask {
  id: string;
  title: string;
  className: string;
  classId?: string;
  type: 'Chụp vở bài học' | 'Nộp bài trắc nghiệm' | 'File ghi âm phát âm' | 'Bài tập tự luận';
  category?: TaskCategory;
  priority?: TaskPriority;
  deadline: string;
  deadlineHoursRemaining?: number;
  isUrgent?: boolean;
  submittedCount: number;
  totalCount: number;
  status: 'Đang mở' | 'Hết hạn';
  description?: string;
  completedStudentIds?: string[];
  remindedStudentIds?: string[];
  createdAt?: string;
}

export interface AiQuota {
  used: number;
  limit: number;
}

export interface SubmissionItem {
  id: string;
  studentName: string;
  studentId?: string;
  studentPhone?: string;
  classId: string;
  className: string;
  examId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswersCount: number;
  answers: Record<number, string>;
  submittedAt: string;
  essayEvaluation?: {
    totalScore: number;
    criteria: {
      taskAchievement: { score: number; maxScore: number; feedback: string };
      coherence: { score: number; maxScore: number; feedback: string };
      lexical: { score: number; maxScore: number; feedback: string };
      grammar: { score: number; maxScore: number; feedback: string };
    };
    teacherGeneralComment: string;
    strengths?: string[];
    areasToImprove?: string[];
    suggestedRevision?: string;
  };
}

export type UserRole = 'teacher' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  phone?: string;
  classId?: string;
  className?: string;
  studentId?: string;
  pin?: string;
  schoolName?: string;
  status?: string;
}
