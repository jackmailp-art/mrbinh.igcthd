import { ExamQuestion } from '../types';

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts target vocabulary words or reference pronouns from questions for a passage.
 * Examples: "The word 'sustainable' in paragraph 2...", "Từ 'biodiversity'...", "**impact**"
 */
export function extractTargetWordsFromQuestions(questions: ExamQuestion[] = []): string[] {
  const words = new Set<string>();

  const commonStopwords = new Set([
    'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
    'is', 'are', 'was', 'were', 'câu', 'đoạn', 'bài', 'paragraph', 'passage',
    'line', 'word', 'phrase', 'following', 'closest', 'opposite', 'meaning'
  ]);

  for (const q of questions) {
    if (q.underlinedPart && q.underlinedPart.trim().length >= 2) {
      words.add(q.underlinedPart.trim());
    }
    if (q.baseWord && q.baseWord.trim().length >= 2) {
      words.add(q.baseWord.trim());
    }

    if (!q.question) continue;

    // 1. Quoted words following indicators: The word "xyz", Từ 'xyz', The phrase "xyz", etc.
    const indicatorRegex = /(?:the word|từ|cụm từ|the phrase|term|đại từ|the pronoun)\s+["'“‘*]*([a-zA-Z0-9_\-\s]{2,30})["'”’*]*/gi;
    let match: RegExpExecArray | null;
    while ((match = indicatorRegex.exec(q.question)) !== null) {
      const clean = match[1].replace(/[*_"'“”‘’]/g, '').trim();
      if (clean && clean.length >= 2 && !commonStopwords.has(clean.toLowerCase())) {
        words.add(clean);
      }
    }

    // 2. Markdown bold inside question: **word**
    const boldRegex = /\*\*([a-zA-Z0-9_\-\s]{2,30})\*\*/g;
    while ((match = boldRegex.exec(q.question)) !== null) {
      const clean = match[1].replace(/[*_"'“”‘’]/g, '').trim();
      if (clean && clean.length >= 2 && !commonStopwords.has(clean.toLowerCase())) {
        words.add(clean);
      }
    }

    // 3. Underline in question: <u>word</u>
    const uRegex = /<u[^>]*>([a-zA-Z0-9_\-\s]{2,30})<\/u>/gi;
    while ((match = uRegex.exec(q.question)) !== null) {
      const clean = match[1].trim();
      if (clean && clean.length >= 2 && !commonStopwords.has(clean.toLowerCase())) {
        words.add(clean);
      }
    }
  }

  return Array.from(words);
}

/**
 * Cleans question content for student test taking and presentation.
 * - Strips leading redundant prefixes like "Question 1:", "Câu hỏi 1:", "Câu 1:"
 * - If isTestingMode is true, strips spoiler tags like "[Từ vựng công nghệ AI]", "[Lexical choice: interpret]", "[Mệnh đề quan hệ]"
 */
export function cleanQuestionContent(text?: string, isTestingMode: boolean = false): string {
  if (!text) return '';
  let cleaned = text.trim();

  // Strip leading Question/Câu number prefix if already present
  cleaned = cleaned.replace(/^(?:Question|Câu\s*hỏi|Câu)\s*\d+\s*[:.-]\s*/i, '');

  if (isTestingMode) {
    // Strip leading or trailing bracketed topic/grammar/lexical tags
    // e.g. [Từ vựng công nghệ AI (Lexical choice: interpret)] or [Mệnh đề quan hệ]
    cleaned = cleaned.replace(/^\[(?:Từ vựng|Ngữ pháp|Chủ điểm|Lexical|Grammar|Mệnh đề|Dạng bài|Dạng câu|Kiến thức|Chuyên đề|Topic|Focus)[^\]]*\]\s*/i, '');
    cleaned = cleaned.replace(/\s*\[(?:Từ vựng|Ngữ pháp|Chủ điểm|Lexical|Grammar|Mệnh đề|Dạng bài|Dạng câu|Kiến thức|Chuyên đề|Topic|Focus)[^\]]*\]$/i, '');
    // Also remove any inline [Lexical choice: ...] or [Grammar: ...]
    cleaned = cleaned.replace(/\[(?:Lexical choice|Grammar focus|Topic|Target vocabulary|Vocabulary|Chủ điểm)[^\]]*\]/gi, '');
    // Also clean parenthesis tags at start or end if they contain keyword clues
    cleaned = cleaned.replace(/^\((?:Từ vựng|Ngữ pháp|Chủ điểm|Lexical|Grammar)[^)]*\)\s*/i, '');
    cleaned = cleaned.replace(/\s*\((?:Từ vựng|Ngữ pháp|Chủ điểm|Lexical|Grammar)[^)]*\)$/i, '');
  }

  return cleaned.trim();
}

/**
 * Formats question text with support for bold, italic, and underline tags.
 */
export function formatQuestionHtml(text: string): string {
  if (!text) return '';
  let res = text;

  // Convert markdown bold **word** to strong
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-900">$1</strong>');

  // Convert markdown italics *word*
  res = res.replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, '<em class="italic">$1</em>');

  // Enhance <u> tags with clear underline decoration
  res = res.replace(
    /<u(?:\s+class="[^"]*")*>(.*?)<\/u>/gi,
    '<u class="underline decoration-2 decoration-blue-600 underline-offset-4 font-bold text-blue-900">$1</u>'
  );

  return res;
}

/**
 * Strips HTML tags and option letter prefixes for clean comparison
 */
export function cleanOptionText(opt: string): string {
  if (!opt) return '';
  return opt
    .replace(/^([A-Da-d][.)]\s*)/, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Robust check if a selected option matches the answer.
 * Handles cases where answer is "C. watch<u>ed</u>", "C. watched", "C", etc.
 */
export function isOptionMatchingAnswer(optionOrChosen?: string, answer?: string): boolean {
  if (!optionOrChosen || !answer) return false;
  const cleanOpt = optionOrChosen.trim();
  const cleanAns = answer.trim();

  // 1. Direct match or cleaned text match
  if (cleanOpt === cleanAns) return true;
  if (cleanOptionText(cleanOpt).toLowerCase() === cleanOptionText(cleanAns).toLowerCase()) return true;

  // 2. Letter prefix match: "A.", "B.", "C.", "D."
  const optLetterMatch = cleanOpt.match(/^([A-Da-d])(?:[.)\s]|$)/);
  const ansLetterMatch = cleanAns.match(/^([A-Da-d])(?:[.)\s]|$)/);
  if (optLetterMatch && ansLetterMatch) {
    return optLetterMatch[1].toUpperCase() === ansLetterMatch[1].toUpperCase();
  }

  // 3. Fallback prefix check
  if (cleanAns.startsWith(cleanOpt.slice(0, 2)) || cleanOpt.startsWith(cleanAns.slice(0, 2))) {
    return true;
  }

  return false;
}

/**
 * Intelligently infers the target letter/digraph to be underlined in a pronunciation question.
 * Checks:
 * 1. question.underlinedPart
 * 2. question.explanation & question.grammarPoint (e.g. "Đuôi '-ed'", "phần gạch chân 'ea'")
 * 3. question.question text
 * 4. Automatic common suffix/digraph matching across options words
 */
export function inferUnderlinedPart(question?: ExamQuestion): string | null {
  if (!question) return null;
  if (question.underlinedPart && question.underlinedPart.trim()) {
    return question.underlinedPart.trim();
  }

  const qText = (question.question || '').toLowerCase();
  const secTitle = (question.sectionTitle || '').toLowerCase();
  const secType = question.sectionType || '';
  const gp = (question.grammarPoint || '').toLowerCase();
  const expl = (question.explanation || '').toLowerCase();

  // Exclude pure stress questions ("main stress", "trọng âm") unless they explicitly test underlined parts
  const isStressOnly = (qText.includes('stress') || secTitle.includes('stress') || gp.includes('trọng âm')) &&
    !qText.includes('underlined') && !qText.includes('gạch chân');
  if (isStressOnly) return null;

  const isPronun =
    secType === 'pronunciation' ||
    secTitle.includes('pronunciation') ||
    secTitle.includes('phát âm') ||
    qText.includes('pronounced') ||
    qText.includes('pronunciation') ||
    qText.includes('phát âm') ||
    qText.includes('gạch chân') ||
    qText.includes('underlined') ||
    gp.includes('phát âm') ||
    gp.includes('pronunciation') ||
    expl.includes('phát âm');

  if (!isPronun) return null;

  // 1. Try extracting target from explanation or grammar point
  const combinedText = `${question.explanation || ''} ${question.grammarPoint || ''} ${question.question || ''}`;

  // Suffix indicator: Đuôi '-ed', đuôi -ed, đuôi -s, đuôi -es, ending -ed, suffix -ed
  const suffixMatch = combinedText.match(/(?:đuôi|hậu tố|ending|suffix)\s+['"“‘-]*([a-zA-Z]{1,4})['"”’]*/i);
  if (suffixMatch && suffixMatch[1]) {
    return suffixMatch[1].toLowerCase();
  }

  // Digraph / part indicator: Phần gạch chân 'ea', âm 'ch', gạch chân "oo"
  const partMatch = combinedText.match(/(?:phần gạch chân|chữ|âm|letter|sound|underlined part)\s+['"“‘-]*([a-zA-Z]{1,4})['"”’]*/i);
  if (partMatch && partMatch[1]) {
    return partMatch[1].toLowerCase();
  }

  // 2. Infer from options words if available
  if (Array.isArray(question.options) && question.options.length >= 2) {
    const words = question.options
      .map(opt => {
        const clean = cleanOptionText(opt).toLowerCase().replace(/[^a-z]/g, '');
        return clean;
      })
      .filter(w => w.length >= 2);

    if (words.length >= 2) {
      // Check suffixes first (ed, es, s, ing)
      for (const sfx of ['ed', 'es', 's']) {
        if (words.every(w => w.endsWith(sfx))) {
          return sfx;
        }
      }
      // Check common vowel digraphs
      for (const dg of ['ea', 'ee', 'oo', 'ou', 'oa', 'ai', 'ay', 'ie', 'ei', 'au', 'aw', 'oi', 'oy']) {
        if (words.every(w => w.includes(dg))) {
          return dg;
        }
      }
      // Check common consonant digraphs
      for (const cg of ['ch', 'sh', 'th', 'ph', 'gh', 'wh']) {
        if (words.every(w => w.includes(cg))) {
          return cg;
        }
      }
      // Check single vowels
      for (const v of ['a', 'e', 'i', 'o', 'u', 'y']) {
        if (words.every(w => w.includes(v))) {
          return v;
        }
      }
    }
  }

  return null;
}

/**
 * Safely applies an underline to a target letter/cluster in a word.
 * For suffixes (ed, es, s), matches the LAST occurrence at the end of the word
 * (avoiding false hits like the first 's' in 'stops' or first 'ed' in 'edited').
 */
function applyUnderline(word: string, target: string): string {
  if (!word || !target) return word;
  const targetLower = target.toLowerCase();
  const wordLower = word.toLowerCase();

  const isSuffix = ['ed', 'es', 's', 'd', 'ing'].includes(targetLower);

  if (isSuffix) {
    // Suffix priority: match target at the end of the word or before punctuation
    const suffixRegex = new RegExp(`(${escapeRegExp(target)})([.,!?;:]*)$`, 'i');
    if (suffixRegex.test(word)) {
      return word.replace(
        suffixRegex,
        '<u class="underline decoration-[2.5px] decoration-amber-500 underline-offset-4 font-black text-inherit">$1</u>$2'
      );
    }
    // Fallback: match the last occurrence in the word
    const lastIdx = wordLower.lastIndexOf(targetLower);
    if (lastIdx !== -1) {
      return (
        word.slice(0, lastIdx) +
        '<u class="underline decoration-[2.5px] decoration-amber-500 underline-offset-4 font-black text-inherit">' +
        word.slice(lastIdx, lastIdx + target.length) +
        '</u>' +
        word.slice(lastIdx + target.length)
      );
    }
  }

  // For digraphs/vowels: find occurrence
  const regex = new RegExp(`(${escapeRegExp(target)})`, 'i');
  if (regex.test(word)) {
    return word.replace(
      regex,
      '<u class="underline decoration-[2.5px] decoration-amber-500 underline-offset-4 font-black text-inherit">$1</u>'
    );
  }

  return word;
}

/**
 * Formats options in multiple-choice questions.
 * Handles pronunciation questions (<u>, markdown, auto-underlining target parts),
 * ensuring the letter prefix (A., B., C., D.) is neat and clear.
 */
export function formatOptionHtml(opt: string, question?: ExamQuestion): string {
  if (!opt) return '';
  let res = opt;

  // 1. Enhance existing <u> tags with high-visibility styling
  if (/<u[^>]*>/i.test(res)) {
    return res.replace(
      /<u(?:\s+class="[^"]*")*>(.*?)<\/u>/gi,
      '<u class="underline decoration-[2.5px] decoration-amber-500 underline-offset-4 font-black text-inherit">$1</u>'
    );
  }

  // 2. Option has markdown **part**
  if (/\*\*(.*?)\*\*/.test(res)) {
    const isPronun = question?.sectionType === 'pronunciation' || !!question?.underlinedPart || !!inferUnderlinedPart(question);
    if (isPronun) {
      return res.replace(
        /\*\*(.*?)\*\*/g,
        '<u class="underline decoration-[2.5px] decoration-amber-500 underline-offset-4 font-black text-inherit">$1</u>'
      );
    } else {
      return res.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    }
  }

  // 3. Option has _part_
  if (/(?<!\w)_(.*?)_(?!\w)/.test(res)) {
    return res.replace(
      /(?<!\w)_(.*?)_(?!\w)/g,
      '<u class="underline decoration-[2.5px] decoration-amber-500 underline-offset-4 font-black text-inherit">$1</u>'
    );
  }

  // 4. Auto-detect target and underline if it's a pronunciation question
  const target = question?.underlinedPart || inferUnderlinedPart(question);
  if (target && target.trim().length > 0) {
    const cleanTarget = target.trim();
    // Split option into Prefix (e.g. "A. ") and Word (e.g. "decided")
    const prefixMatch = res.match(/^([A-Da-d][.)]\s*)(.*)$/);
    if (prefixMatch) {
      const prefix = prefixMatch[1];
      const word = prefixMatch[2];
      const formattedWord = applyUnderline(word, cleanTarget);
      return prefix + formattedWord;
    } else {
      return applyUnderline(res, cleanTarget);
    }
  }

  return res;
}

/**
 * Natural audio speech synthesis for English words in pronunciation questions
 */
export function playPronunciationAudio(rawWord: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const cleanWord = rawWord.replace(/^[A-Da-d][.)]\s*/, '').replace(/<[^>]*>/g, '').trim();
    if (!cleanWord) return;

    const utterance = new SpeechSynthesisUtterance(cleanWord);
    utterance.lang = 'en-US';
    utterance.rate = 0.85; // Natural learning speed

    const voices = window.speechSynthesis.getVoices();
    const enVoice =
      voices.find(v => v.lang.startsWith('en-US') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Aaron'))) ||
      voices.find(v => v.lang.startsWith('en-US')) ||
      voices.find(v => v.lang.startsWith('en'));

    if (enVoice) utterance.voice = enVoice;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Pronunciation audio error:', e);
  }
}

/**
 * Formats reading comprehension and cloze passages.
 * - interprets existing <b>, <strong>, **word** tags into eye-catching highlighted bold text
 * - auto-highlights target words tested in the accompanying questions if not already bolded
 * - styles cloze blanks like (1), (2), (3) cleanly
 */
export function formatPassageHtml(
  passage: string,
  relatedQuestions: ExamQuestion[] = [],
  highlightKeywords: boolean = true
): string {
  if (!passage) return '';
  let res = passage;

  // 1. Standardize markdown bold: **word** -> <b>word</b>
  res = res.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

  // 2. Format existing <b> and <strong> tags with distinctive bold + highlight badge
  res = res.replace(
    /<(?:b|strong)(?:\s+class="[^"]*")*>(.*?)<\/(?:b|strong)>/gi,
    '<strong class="passage-bold-highlight font-black text-amber-950 bg-amber-200/95 px-1.5 py-0.5 rounded-md border border-amber-400 shadow-2xs font-sans inline-block mx-0.5">$1</strong>'
  );

  // 3. Highlight target words extracted from questions if they are not already tagged
  if (highlightKeywords && relatedQuestions.length > 0) {
    const targetWords = extractTargetWordsFromQuestions(relatedQuestions);
    for (const word of targetWords) {
      if (!word || word.length < 2) continue;
      // Check if word exists in text outside existing tags
      const regex = new RegExp(`(?<!<[^>]*)(\\b${escapeRegExp(word)}\\b)(?![^<]*>)`, 'gi');
      if (regex.test(res)) {
        res = res.replace(
          regex,
          '<strong class="passage-bold-highlight font-black text-amber-950 bg-amber-200/95 px-1.5 py-0.5 rounded-md border border-amber-400 shadow-2xs font-sans inline-block mx-0.5" title="Từ khóa được hỏi trong câu hỏi">$1</strong>'
        );
      }
    }
  }

  // 4. Highlight cloze gaps like (1), (2), (3)...
  res = res.replace(
    /(?<!<[^>]*)\((\d{1,2})\)(?![^<]*>)/g,
    '<span class="inline-flex items-center justify-center px-2.5 py-0.5 mx-1 font-black text-xs bg-blue-100 text-blue-900 border border-blue-300 rounded-md font-sans shadow-2xs">($1)</span>'
  );

  return res;
}
