import { ExamItem, ExamQuestion } from '../types';
import { apiService } from './apiService';

/**
 * Deep clone an array of questions to prevent accidental mutation of original questions
 */
export function cloneExamQuestions(questions: ExamQuestion[]): ExamQuestion[] {
  return JSON.parse(JSON.stringify(questions || []));
}

/**
 * Shuffle questions while preserving reading passage integrity
 * (Questions sharing the same passage stay together in their contextual block)
 */
export function shuffleQuestionsArray(questions: ExamQuestion[]): ExamQuestion[] {
  if (!questions || questions.length <= 1) return questions ? [...questions] : [];

  // Group questions into blocks (consecutive questions with the same passage stay grouped)
  const blocks: ExamQuestion[][] = [];
  let currentBlock: ExamQuestion[] = [];
  let currentPassageId: string | null = null;

  questions.forEach((q) => {
    const pKey = q.passage?.trim() || q.passageTitle?.trim() || null;
    if (pKey) {
      if (currentPassageId === pKey) {
        currentBlock.push(q);
      } else {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock);
        }
        currentBlock = [q];
        currentPassageId = pKey;
      }
    } else {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
        currentBlock = [];
        currentPassageId = null;
      }
      blocks.push([q]);
    }
  });

  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  // Fisher-Yates shuffle the question blocks
  const shuffledBlocks = [...blocks];
  for (let i = shuffledBlocks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledBlocks[i], shuffledBlocks[j]] = [shuffledBlocks[j], shuffledBlocks[i]];
  }

  // Flatten and re-number questions 1..N
  const flattened: ExamQuestion[] = [];
  shuffledBlocks.forEach((block) => {
    block.forEach((q) => {
      flattened.push({
        ...q,
        num: flattened.length + 1,
      });
    });
  });

  return flattened;
}

/**
 * Shuffle options (A, B, C, D) for a single question and recalculate the correct answer
 */
export function shuffleOptionsForQuestion(q: ExamQuestion): ExamQuestion {
  if (!q.options || q.options.length < 2) return { ...q };

  // Skip True / False questions from option shuffling
  if (
    q.questionType === 'true_false' ||
    q.options.some((o) => /^(A\.\s*(Đúng|True)|B\.\s*(Sai|False))/i.test(o))
  ) {
    return { ...q };
  }

  // Identify original target answer text
  const curAns = (q.answer || '').trim();
  let targetAnswerText = '';
  const letterMatch = curAns.match(/^([A-D])\./i);

  if (letterMatch) {
    const letter = letterMatch[1].toUpperCase();
    const matchedOpt = q.options.find((o) => o.toUpperCase().startsWith(letter + '.'));
    targetAnswerText = matchedOpt ? matchedOpt.replace(/^[A-D]\.\s*/i, '').trim() : curAns;
  } else {
    targetAnswerText = curAns.replace(/^[A-D]\.\s*/i, '').trim();
  }

  // Strip prefix letter tags
  const pureTexts = q.options.map((o) => o.replace(/^[A-D]\.\s*/i, '').trim());

  // Fisher-Yates shuffle option texts
  const shuffledTexts = [...pureTexts];
  for (let i = shuffledTexts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledTexts[i], shuffledTexts[j]] = [shuffledTexts[j], shuffledTexts[i]];
  }

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const newOptions = shuffledTexts.map((text, idx) => `${letters[idx] || 'A'}. ${text}`);

  // Re-determine correct answer letter
  let newAnswer = curAns;
  const newIdx = shuffledTexts.findIndex(
    (t) => t.toLowerCase() === targetAnswerText.toLowerCase()
  );
  if (newIdx >= 0) {
    newAnswer = newOptions[newIdx];
  }

  return {
    ...q,
    options: newOptions,
    answer: newAnswer,
  };
}

/**
 * Shuffle options for all multiple choice questions in an array
 */
export function shuffleAllQuestionsOptions(questions: ExamQuestion[]): ExamQuestion[] {
  return questions.map((q) => shuffleOptionsForQuestion(q));
}

/**
 * Toggle 'Shuffle Question Order' on an existing ExamItem.
 * Returns a new ExamItem with state updated and questions reordered/restored instantly.
 */
export function toggleShuffleQuestionOrder(exam: ExamItem, forceState?: boolean): ExamItem {
  if (!exam || !exam.questions) return exam;

  const currentQuestions = exam.questions;
  // Ensure baseline originalQuestions is preserved
  const originalQuestions: ExamQuestion[] =
    exam.originalQuestions && exam.originalQuestions.length > 0
      ? cloneExamQuestions(exam.originalQuestions)
      : cloneExamQuestions(currentQuestions);

  const nextShuffleQuestionsState =
    forceState !== undefined ? forceState : !Boolean(exam.shuffleQuestions);

  let newQuestions: ExamQuestion[] = [];

  if (nextShuffleQuestionsState) {
    // Turning Shuffle ON: Shuffle the current questions
    newQuestions = shuffleQuestionsArray(currentQuestions);
    // If option shuffle is also active, ensure options are shuffled
    if (exam.shuffleOptions) {
      newQuestions = shuffleAllQuestionsOptions(newQuestions);
    }
  } else {
    // Turning Shuffle OFF: Restore original questions order
    if (exam.shuffleOptions) {
      // Keep option-shuffled state while restoring the original order
      const curMap = new Map(currentQuestions.map((q) => [q.id, q]));
      newQuestions = originalQuestions.map((origQ, idx) => {
        const matchingCurrent = curMap.get(origQ.id);
        if (matchingCurrent) {
          return {
            ...origQ,
            num: idx + 1,
            options: matchingCurrent.options,
            answer: matchingCurrent.answer,
          };
        }
        return {
          ...shuffleOptionsForQuestion(origQ),
          num: idx + 1,
        };
      });
    } else {
      // Revert completely to original questions with sequential numbers
      newQuestions = originalQuestions.map((origQ, idx) => ({
        ...origQ,
        num: idx + 1,
      }));
    }
  }

  return {
    ...exam,
    shuffleQuestions: nextShuffleQuestionsState,
    originalQuestions,
    questions: newQuestions,
    questionsCount: newQuestions.length,
  };
}

/**
 * Toggle 'Shuffle Answer Options' on an existing ExamItem.
 * Returns a new ExamItem with options shuffled or restored instantly.
 */
export function toggleShuffleAnswerOptions(exam: ExamItem, forceState?: boolean): ExamItem {
  if (!exam || !exam.questions) return exam;

  const currentQuestions = exam.questions;
  // Ensure baseline originalQuestions is preserved
  const originalQuestions: ExamQuestion[] =
    exam.originalQuestions && exam.originalQuestions.length > 0
      ? cloneExamQuestions(exam.originalQuestions)
      : cloneExamQuestions(currentQuestions);

  const nextShuffleOptionsState =
    forceState !== undefined ? forceState : !Boolean(exam.shuffleOptions);

  let newQuestions: ExamQuestion[] = [];

  if (nextShuffleOptionsState) {
    // Turning Shuffle Options ON: Shuffle options on all questions
    newQuestions = shuffleAllQuestionsOptions(currentQuestions);
  } else {
    // Turning Shuffle Options OFF: Restore original options & answers from originalQuestions
    const origMap = new Map(originalQuestions.map((q) => [q.id, q]));
    newQuestions = currentQuestions.map((q) => {
      const orig = origMap.get(q.id);
      if (orig && orig.options && orig.options.length > 0) {
        return {
          ...q,
          options: [...orig.options],
          answer: orig.answer,
        };
      }
      return q;
    });
  }

  return {
    ...exam,
    shuffleOptions: nextShuffleOptionsState,
    originalQuestions,
    questions: newQuestions,
    questionsCount: newQuestions.length,
  };
}

/**
 * Unified shuffle toggle for an existing ExamItem.
 * Can toggle questions, options, or both simultaneously.
 */
export function toggleExamShuffle(
  exam: ExamItem,
  options: { shuffleQuestions?: boolean; shuffleOptions?: boolean }
): ExamItem {
  let updated = exam;

  if (options.shuffleQuestions !== undefined) {
    updated = toggleShuffleQuestionOrder(updated, options.shuffleQuestions);
  }

  if (options.shuffleOptions !== undefined) {
    updated = toggleShuffleAnswerOptions(updated, options.shuffleOptions);
  }

  return updated;
}

/**
 * Re-shuffle an exam that already has shuffle enabled, generating a fresh random permutation.
 */
export function reshuffleExam(
  exam: ExamItem,
  target: 'all' | 'questions' | 'options' = 'all'
): ExamItem {
  if (!exam || !exam.questions) return exam;

  const originalQuestions: ExamQuestion[] =
    exam.originalQuestions && exam.originalQuestions.length > 0
      ? cloneExamQuestions(exam.originalQuestions)
      : cloneExamQuestions(exam.questions);

  let newQuestions = cloneExamQuestions(originalQuestions);

  // Re-shuffle questions order if requested or if already enabled
  const shouldShuffleQuestions =
    target === 'all' || target === 'questions' ? true : Boolean(exam.shuffleQuestions);
  if (shouldShuffleQuestions) {
    newQuestions = shuffleQuestionsArray(newQuestions);
  }

  // Re-shuffle options if requested or if already enabled
  const shouldShuffleOptions =
    target === 'all' || target === 'options' ? true : Boolean(exam.shuffleOptions);
  if (shouldShuffleOptions) {
    newQuestions = shuffleAllQuestionsOptions(newQuestions);
  }

  return {
    ...exam,
    shuffleQuestions: shouldShuffleQuestions,
    shuffleOptions: shouldShuffleOptions,
    originalQuestions,
    questions: newQuestions,
    questionsCount: newQuestions.length,
  };
}

/**
 * Reset all shuffle settings and restore original question order and options
 */
export function resetExamShuffle(exam: ExamItem): ExamItem {
  if (!exam) return exam;

  const originalQuestions: ExamQuestion[] =
    exam.originalQuestions && exam.originalQuestions.length > 0
      ? cloneExamQuestions(exam.originalQuestions)
      : cloneExamQuestions(exam.questions || []);

  const restored = originalQuestions.map((q, idx) => ({
    ...q,
    num: idx + 1,
  }));

  return {
    ...exam,
    shuffleQuestions: false,
    shuffleOptions: false,
    questions: restored,
    questionsCount: restored.length,
  };
}

/**
 * Helper to check current shuffle status
 */
export function isExamShuffled(exam: ExamItem): {
  hasShuffledQuestions: boolean;
  hasShuffledOptions: boolean;
  isAnyShuffled: boolean;
} {
  const hasShuffledQuestions = Boolean(exam?.shuffleQuestions);
  const hasShuffledOptions = Boolean(exam?.shuffleOptions);
  return {
    hasShuffledQuestions,
    hasShuffledOptions,
    isAnyShuffled: hasShuffledQuestions || hasShuffledOptions,
  };
}

/**
 * Interface representing a single question's answer in a specific version
 */
export interface VersionAnswerKeyItem {
  num: number;
  letter: string;
  answerText: string;
  questionPreview: string;
  sectionType?: string;
  originalId?: string;
  originalNum?: number;
}

/**
 * Interface representing one shuffled exam version (mã đề)
 */
export interface ShuffledExamVersion {
  code: string;
  exam: ExamItem;
  answerKey: VersionAnswerKeyItem[];
}

/**
 * Interface representing a row in the combined Matrix Answer Key table
 */
export interface MatrixRow {
  num: number;
  questionPreview?: string;
  answers: { [code: string]: string };
  details: { [code: string]: string };
}

/**
 * Interface representing the complete result of an Exam Shuffler run
 */
export interface ExamShufflerResult {
  originalExam: ExamItem;
  codes: string[];
  versions: ShuffledExamVersion[];
  matrixAnswerKey: MatrixRow[];
  generatedAt: string;
}

/**
 * Extracts answer letter (A, B, C, D) from question answer string
 */
export function extractAnswerLetter(answer?: string, options: string[] = []): string {
  if (!answer) return '-';
  const cleanAns = answer.trim();

  // 1. Prefix match like "A. ...", "B.", "C)"
  const m = cleanAns.match(/^([A-D])(?:[.)\s]|$)/i);
  if (m) return m[1].toUpperCase();

  // 2. Exact match with an option
  const optIdx = options.findIndex((opt) => {
    const pureOpt = opt.replace(/^[A-D][.)]\s*/i, '').trim().toLowerCase();
    const pureAns = cleanAns.toLowerCase();
    return pureOpt === pureAns || opt.toLowerCase() === pureAns;
  });
  if (optIdx >= 0) {
    return ['A', 'B', 'C', 'D', 'E', 'F'][optIdx] || '-';
  }

  // 3. If short answer / essay
  if (cleanAns.length <= 15) return cleanAns;
  return cleanAns.slice(0, 15) + '...';
}

/**
 * Generates 4 unique exam versions (mã đề) by permuting the order of questions and options,
 * ensuring each version has its own independent answer key and a combined matrix.
 */
export function generate4ExamVersions(
  exam: ExamItem,
  customCodes: string[] = ['101', '102', '103', '104'],
  options: {
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
  } = { shuffleQuestions: true, shuffleOptions: true }
): ExamShufflerResult {
  const codes = customCodes.length > 0 ? customCodes.slice(0, 4) : ['101', '102', '103', '104'];
  const baseQuestions: ExamQuestion[] =
    exam.originalQuestions && exam.originalQuestions.length > 0
      ? cloneExamQuestions(exam.originalQuestions)
      : cloneExamQuestions(exam.questions || []);

  const versionGroupId = `shuffler_group_${exam.id}_${Date.now()}`;
  const shouldShuffleQuestions = options.shuffleQuestions !== false;
  const shouldShuffleOptions = options.shuffleOptions !== false;

  const versions: ShuffledExamVersion[] = codes.map((code, vIdx) => {
    let versionQuestions = cloneExamQuestions(baseQuestions);

    // Give each question an explicit originalNum for tracking
    versionQuestions = versionQuestions.map((q, idx) => ({
      ...q,
      originalNum: (q as any).originalNum || idx + 1,
    }));

    // For all versions, perform question shuffling if enabled
    if (shouldShuffleQuestions) {
      versionQuestions = shuffleQuestionsArray(versionQuestions);
    }

    // Shuffle options A, B, C, D if enabled
    if (shouldShuffleOptions) {
      versionQuestions = shuffleAllQuestionsOptions(versionQuestions);
    }

    // Re-number 1..N
    versionQuestions = versionQuestions.map((q, idx) => ({
      ...q,
      num: idx + 1,
    }));

    // Build answer key for this specific version
    const answerKey: VersionAnswerKeyItem[] = versionQuestions.map((q, idx) => {
      const letter = extractAnswerLetter(q.answer, q.options || []);
      const preview = q.question.replace(/<[^>]*>/g, '').replace(/^(?:Question|Câu\s*hỏi|Câu)\s*\d+[:.-]\s*/i, '').trim();
      return {
        num: idx + 1,
        letter,
        answerText: q.answer || '',
        questionPreview: preview.length > 40 ? preview.slice(0, 40) + '...' : preview,
        sectionType: q.sectionType,
        originalId: q.id,
        originalNum: (q as any).originalNum || idx + 1,
      };
    });

    const versionExam: ExamItem = {
      ...cloneExamQuestions([exam] as any)[0],
      ...exam,
      id: `${exam.id}-code-${code}-${Date.now().toString(36)}`,
      title: `${exam.title} - Mã đề ${code}`,
      examCode: code,
      versionGroup: versionGroupId,
      shuffleQuestions: shouldShuffleQuestions,
      shuffleOptions: shouldShuffleOptions,
      originalQuestions: cloneExamQuestions(baseQuestions),
      questions: versionQuestions,
      questionsCount: versionQuestions.length,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    return {
      code,
      exam: versionExam,
      answerKey,
    };
  });

  // Build Matrix Answer Key (Question 1..N across all 4 versions)
  const totalQuestions = baseQuestions.length;
  const matrixAnswerKey: MatrixRow[] = [];

  for (let qNum = 1; qNum <= totalQuestions; qNum++) {
    const rowAnswers: { [code: string]: string } = {};
    const rowDetails: { [code: string]: string } = {};
    let preview = `Câu ${qNum}`;

    versions.forEach((v) => {
      const item = v.answerKey[qNum - 1];
      if (item) {
        rowAnswers[v.code] = item.letter;
        rowDetails[v.code] = item.answerText;
        if (!preview || preview === `Câu ${qNum}`) {
          preview = item.questionPreview || preview;
        }
      } else {
        rowAnswers[v.code] = '-';
        rowDetails[v.code] = '-';
      }
    });

    matrixAnswerKey.push({
      num: qNum,
      questionPreview: preview,
      answers: rowAnswers,
      details: rowDetails,
    });
  }

  return {
    originalExam: exam,
    codes,
    versions,
    matrixAnswerKey,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Exam Service Object with state toggling, utility functions, and persistence methods
 */
export const examService = {
  // Pure utility functions
  cloneExamQuestions,
  shuffleQuestionsArray,
  shuffleOptionsForQuestion,
  shuffleAllQuestionsOptions,
  toggleShuffleQuestionOrder,
  toggleShuffleAnswerOptions,
  toggleExamShuffle,
  reshuffleExam,
  resetExamShuffle,
  isExamShuffled,
  generate4ExamVersions,
  extractAnswerLetter,

  // Persistence methods that update local cache and sync to server
  async saveExam(exam: ExamItem): Promise<ExamItem> {
    try {
      // Save to localStorage immediately
      const bankStr = localStorage.getItem('EDUADMIN_EXAM_BANK');
      let bank: ExamItem[] = bankStr ? JSON.parse(bankStr) : [];
      bank = bank.map((e) => (e.id === exam.id ? exam : e));
      if (!bank.some((e) => e.id === exam.id)) {
        bank.unshift(exam);
      }
      localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(bank));
      localStorage.setItem('eng_exams_v1', JSON.stringify(bank));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }

    // Sync to server API
    return apiService.createOrUpdateExam(exam);
  },

  async toggleShuffleQuestionOrderAndSave(
    exam: ExamItem,
    forceState?: boolean
  ): Promise<ExamItem> {
    const updated = toggleShuffleQuestionOrder(exam, forceState);
    return this.saveExam(updated);
  },

  async toggleShuffleAnswerOptionsAndSave(
    exam: ExamItem,
    forceState?: boolean
  ): Promise<ExamItem> {
    const updated = toggleShuffleAnswerOptions(exam, forceState);
    return this.saveExam(updated);
  },

  async toggleExamShuffleAndSave(
    exam: ExamItem,
    options: { shuffleQuestions?: boolean; shuffleOptions?: boolean }
  ): Promise<ExamItem> {
    const updated = toggleExamShuffle(exam, options);
    return this.saveExam(updated);
  },

  async reshuffleExamAndSave(
    exam: ExamItem,
    target: 'all' | 'questions' | 'options' = 'all'
  ): Promise<ExamItem> {
    const updated = reshuffleExam(exam, target);
    return this.saveExam(updated);
  },

  async resetExamShuffleAndSave(exam: ExamItem): Promise<ExamItem> {
    const updated = resetExamShuffle(exam);
    return this.saveExam(updated);
  },
};
