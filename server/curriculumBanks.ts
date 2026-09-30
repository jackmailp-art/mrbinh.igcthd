// Diverse Curated Thematic Banks for English Exams (Global Success Curriculum)
// Provides complete, rich, non-repeating exams with UK Female listening scripts and rigorous pedagogical keys

export interface ThematicExamDataset {
  themeKey: string;
  themeTitle: string;
  audioTitleTrack1: string;
  audioSpeakerInfoTrack1: string;
  audioScriptTrack1: string;
  audioTitleTrack2: string;
  audioSpeakerInfoTrack2: string;
  audioScriptTrack2: string;
  task1: Array<{
    question: string;
    options: string[];
    answer: string;
    audioEvidence: string;
    explanation: string;
    grammarPoint: string;
  }>;
  task2_multiple_choice: Array<{
    question: string;
    options: string[];
    answer: string;
    audioEvidence: string;
    explanation: string;
    grammarPoint: string;
  }>;
  task2_fill_blank: Array<{
    question: string;
    answer: string;
    alternativeAnswers: string[];
    wordLimit: string;
    audioEvidence: string;
    explanation: string;
    grammarPoint: string;
  }>;
  pronunciation: Array<{
    question: string;
    options: string[];
    answer: string;
    underlinedPart?: string;
    ipaTranscription?: string;
    explanation: string;
    grammarPoint: string;
  }>;
  lexicoGrammar: Array<{
    question: string;
    options: string[];
    answer: string;
    explanation: string;
    grammarPoint: string;
  }>;
  arrangement: Array<{
    arrangementType: 'dialogue' | 'letter' | 'paragraph';
    question: string;
    arrangementItems: string[];
    options: string[];
    answer: string;
    explanation: string;
    grammarPoint: string;
  }>;
  cloze: {
    passage: string;
    questions: Array<{
      num: number;
      question: string;
      options: string[];
      answer: string;
      explanation: string;
      grammarPoint: string;
    }>;
  };
  reading: {
    passageTitle: string;
    passage: string;
    questions: Array<{
      readingQuestionType: 'main_idea' | 'detail' | 'vocabulary' | 'reference' | 'inference';
      question: string;
      options: string[];
      answer: string;
      explanation: string;
      grammarPoint: string;
    }>;
  };
  writingShort: Array<{
    writingType: 'sentence_transformation' | 'word_formation';
    originalSentence?: string;
    sentenceBeginning?: string;
    question: string;
    answer: string;
    alternativeAnswers: string[];
    explanation: string;
    grammarPoint: string;
  }>;
  essay: {
    essayPrompt: {
      minWords: number;
      maxWords: number;
      topic: string;
      suggestedPoints: string[];
    };
    question: string;
    answer: string;
    rubric: any;
    explanation: string;
    grammarPoint: string;
  };
}

export const THEMATIC_DATASETS: ThematicExamDataset[] = [
  // THEME 1: ARTIFICIAL INTELLIGENCE & DIGITAL ERA (Global Success 12 Unit 6 & 10 Unit 5)
  {
    themeKey: "artificial_intelligence",
    themeTitle: "Artificial Intelligence & Digital Transformation in Education",
    audioTitleTrack1: "Track 1 - Conversation: AI-Powered Learning Tools in High School",
    audioSpeakerInfoTrack1: "Conversation between Ms. Charlotte Davies (UK English Specialist) and Nam (Student Tech Club)",
    audioScriptTrack1: `Ms. Davies: Hello Nam! I was truly impressed by your presentation on artificial intelligence in our morning assembly.
Nam: Thank you very much, Ms. Davies! Our club has spent the last month evaluating various digital tools for language learning.
Ms. Davies: That sounds fascinating. In Britain, many secondary schools now integrate AI tutors to provide immediate feedback on pronunciation and vocabulary usage.
Nam: Exactly! That aligns with what our survey revealed. Over 70 percent of our students stated that conversational AI chatbots helped them practice English speaking without feeling embarrassed.
Ms. Davies: That is a remarkable advantage. What about writing essays? Are students relying too heavily on machine-generated texts?
Nam: We addressed that concern directly. We established clear ethical guidelines: students use AI to brainstorm outlines and check grammatical errors, but all analyses and personal arguments must be written independently.
Ms. Davies: Excellent initiative! Remember that next Thursday at 3:30 PM, Cambridge Educational Technology will hold a live webinar on responsible AI literacy for high schoolers.
Nam: Fantastic! I will register our entire club right after school today.`,
    audioTitleTrack2: "Track 2 - Interview: The Future of Automation and Youth Skills",
    audioSpeakerInfoTrack2: "Radio interview between Host and Dr. Victoria Campbell (Oxford Digital Innovation Institute)",
    audioScriptTrack2: `Host: Good afternoon and welcome to Digital Horizons. Today we are joined by Dr. Victoria Campbell, leading researcher in educational robotics and machine learning. Dr. Campbell, what is the most profound change AI brings to modern students?
Dr. Campbell: Good afternoon! The most profound change is undoubtedly the personalization of education. Traditional classrooms often adopt a one-size-fits-all model. In contrast, intelligent adaptive software analyses each student's error patterns and customizes practice drills in real time.
Host: That must significantly enhance learning speed! Are there critical skills that machines simply cannot replace?
Dr. Campbell: Absolutely. Algorithmic software can process massive amounts of statistical data in seconds, but it lacks empathy, philosophical ethics, and genuine critical thinking. Consequently, our school curriculums must prioritize emotional intelligence, cross-cultural collaboration, and creative problem-solving rather than rote memorization.
Host: What practical advice would you offer to high school graduates entering the modern workforce?
Dr. Campbell: Embrace continuous lifelong learning. Cultivate technological adaptability while refining your unique human judgment.`,
    task1: [
      {
        question: "Over 70 percent of students reported that AI chatbots helped them practice speaking without feeling embarrassed.",
        options: ["A. True", "B. False"],
        answer: "A. True",
        audioEvidence: "Nam: 'Over 70 percent of our students stated that conversational AI chatbots helped them practice English speaking without feeling embarrassed.'",
        explanation: "Đúng (True). Trích trong Track 1: Hơn 70% học sinh cảm thấy tự tin luyện nói với AI mà không bị ngại ngùng.",
        grammarPoint: "Listening for specific statistical evidence"
      },
      {
        question: "Ms. Davies advised students to allow AI tools to write their complete essays automatically.",
        options: ["A. True", "B. False"],
        answer: "B. False",
        audioEvidence: "Nam: '...all analyses and personal arguments must be written independently.'",
        explanation: "Sai (False). Nam và cô Davies nhấn mạnh các lập luận và bài viết phải do học sinh tự viết độc lập, AI chỉ hỗ trợ dàn ý.",
        grammarPoint: "Listening for detailed facts & rules"
      },
      {
        question: "The live webinar on responsible AI literacy is scheduled for next Thursday afternoon.",
        options: ["A. True", "B. False"],
        answer: "A. True",
        audioEvidence: "Ms. Davies: '...next Thursday at 3:30 PM, Cambridge Educational Technology will hold a live webinar...'",
        explanation: "Đúng (True). Buổi hội thảo trực tuyến diễn ra vào 3:30 chiều thứ Năm tuần tới.",
        grammarPoint: "Listening for schedule and dates"
      },
      {
        question: "Nam decided not to attend the upcoming Cambridge webinar.",
        options: ["A. True", "B. False"],
        answer: "B. False",
        audioEvidence: "Nam: 'Fantastic! I will register our entire club right after school today.'",
        explanation: "Sai (False). Nam khẳng định sẽ đăng ký cho toàn bộ câu lạc bộ ngay sau giờ học.",
        grammarPoint: "Listening for speaker intention"
      }
    ],
    task2_multiple_choice: [
      {
        question: "According to Dr. Victoria Campbell in Track 2, what is the most profound benefit of AI in education?",
        options: [
          "A. The complete elimination of human teachers",
          "B. The personalization of the learning process",
          "C. The reduction of school building maintenance costs",
          "D. The encouragement of rote memorization drills"
        ],
        answer: "B. The personalization of the learning process",
        audioEvidence: "Dr. Campbell: 'The most profound change is undoubtedly the personalization of education.'",
        explanation: "Phương án B đúng. Trích Track 2: Lợi ích sâu sắc nhất của AI là cá nhân hóa giáo dục (personalization of education).",
        grammarPoint: "Listening for main idea & key takeaways"
      },
      {
        question: "What human abilities does Dr. Campbell emphasize that algorithmic software lacks?",
        options: [
          "A. Speed in calculating numerical formulas",
          "B. Storing vast amounts of statistical data",
          "C. Empathy, ethics, and genuine critical thinking",
          "D. Operating continuously without electrical power"
        ],
        answer: "C. Empathy, ethics, and genuine critical thinking",
        audioEvidence: "Dr. Campbell: '...it lacks empathy, philosophical ethics, and genuine critical thinking.'",
        explanation: "Phương án C đúng. AI không thể thay thế sự thấu cảm, đạo đức triết học và tư duy phản biện của con người.",
        grammarPoint: "Listening for distinguishing details"
      },
      {
        question: "What key advice does Dr. Campbell give to students entering the future workforce?",
        options: [
          "A. Embrace continuous lifelong learning",
          "B. Avoid using digital devices altogether",
          "C. Focus exclusively on technical programming",
          "D. Reject working in cross-cultural teams"
        ],
        answer: "A. Embrace continuous lifelong learning",
        audioEvidence: "Dr. Campbell: 'Embrace continuous lifelong learning. Cultivate technological adaptability...'",
        explanation: "Phương án A đúng. Lời khuyên là hãy nắm bắt tinh thần học tập suốt đời không ngừng nghỉ.",
        grammarPoint: "Listening for speaker recommendation"
      }
    ],
    task2_fill_blank: [
      {
        question: "Intelligent software analyses each student's (1) _______ patterns in real time.",
        answer: "error",
        alternativeAnswers: ["error", "errors"],
        wordLimit: "NO MORE THAN TWO WORDS",
        audioEvidence: "Dr. Campbell: '...analyses each student\\'s error patterns and customizes practice drills...'",
        explanation: "Đáp án đúng là error (error patterns: dạng lỗi sai của học sinh).",
        grammarPoint: "Note completion: Nouns"
      },
      {
        question: "Curriculums must prioritize emotional (2) _______ and creative problem-solving.",
        answer: "intelligence",
        alternativeAnswers: ["intelligence"],
        wordLimit: "NO MORE THAN ONE WORD",
        audioEvidence: "Dr. Campbell: '...prioritize emotional intelligence, cross-cultural collaboration...'",
        explanation: "Đáp án đúng là intelligence (emotional intelligence: trí tuệ cảm xúc).",
        grammarPoint: "Note completion: Abstract vocabulary"
      }
    ],
    pronunciation: [
      {
        question: "Choose the word whose underlined part is pronounced differently from the others:",
        options: ["A. connect<u>ed</u>", "B. test<u>ed</u>", "C. upgrad<u>ed</u>", "D. design<u>ed</u>"],
        answer: "D. design<u>ed</u>",
        underlinedPart: "ed",
        ipaTranscription: "designed: /dɪˈzaɪnd/ (/d/) vs connected: /kəˈnektɪd/, tested: /ˈtestɪd/, upgraded: /ʌpˈɡreɪdɪd/ (/ɪd/)",
        explanation: "Đuôi '-ed' trong 'designed' phát âm là /d/ vì kết thúc bằng âm hữu thanh /n/. Các từ còn lại phát âm là /ɪd/ vì kết thúc bằng /t/ hoặc /d/.",
        grammarPoint: "Quy tắc phát âm đuôi -ed"
      },
      {
        question: "Choose the word whose main stress is placed differently from that of the others:",
        options: ["A. artificial", "B. intelligence", "C. technological", "D. automated"],
        answer: "B. intelligence",
        ipaTranscription: "intelligence: /ɪnˈtel.ɪ.dʒəns/ (âm 2) vs artificial: /ˌɑː.tɪˈfɪʃ.əl/ (âm 3), technological: /ˌtek.nəˈlɒdʒ.ɪ.kəl/ (âm 3), automated: /ˈɔː.tə.meɪ.tɪd/ (âm 1)",
        explanation: "'intelligence' có trọng âm rơi vào âm tiết thứ hai. 'artificial' và 'technological' có trọng âm rơi vào âm tiết thứ ba.",
        grammarPoint: "Trọng âm từ nhiều âm tiết (-ence, -cial, -ical)"
      }
    ],
    lexicoGrammar: [
      {
        question: "Natural language processing algorithms have enabled virtual assistants to _______ human commands with remarkable precision.",
        options: ["A. interpret", "B. interrupt", "C. interfere", "D. intercept"],
        answer: "A. interpret",
        explanation: "'interpret' nghĩa là diễn giải, hiểu được (human commands: mệnh lệnh của con người). Các từ còn lại: interrupt (ngắt lời), interfere (can thiệp, quấy rầy), intercept (chặn đứng).",
        grammarPoint: "Từ vựng công nghệ AI (Lexical choice: interpret)"
      },
      {
        question: "Unless high school students _______ digital literacy skills early, they will struggle in automated workplaces.",
        options: ["A. acquire", "B. acquired", "C. will acquire", "D. had acquired"],
        answer: "A. acquire",
        explanation: "Mệnh đề chứa liên từ 'Unless' (Unless = If not) trong câu điều kiện loại 1 chia ở thì Hiện tại đơn (Present Simple: acquire).",
        grammarPoint: "Câu điều kiện loại 1 với Unless"
      },
      {
        question: "The software application _______ by young Vietnamese engineers last month has won an international innovation award.",
        options: ["A. developing", "B. developed", "C. was developed", "D. develops"],
        answer: "B. developed",
        explanation: "Rút gọn mệnh đề quan hệ dạng bị động (which was developed -> developed) đứng sau danh từ 'The software application'.",
        grammarPoint: "Rút gọn mệnh đề quan hệ dạng bị động (Past Participle)"
      },
      {
        question: "Tech companies are heavily investing in research to keep _______ with the rapid evolution of artificial intelligence.",
        options: ["A. pace", "B. track", "C. step", "D. touch"],
        answer: "A. pace",
        explanation: "Thành ngữ cố định: 'keep pace with' nghĩa là bắt kịp, theo kịp tốc độ phát triển nhanh chóng.",
        grammarPoint: "Cụm thành ngữ cố định (Idiom: keep pace with)"
      }
    ],
    arrangement: [
      {
        arrangementType: "dialogue",
        question: "Mark the letter A, B, C, or D to indicate the correct arrangement of the exchanges to form a meaningful conversation:",
        arrangementItems: [
          "a. An: Do you think artificial intelligence will eventually replace human language teachers?",
          "b. Sarah: I don't think so. While AI can correct grammar errors, it cannot offer personal encouragement or life mentorship.",
          "c. An: That makes complete sense. Technology should assist teachers rather than substitute them.",
          "d. Sarah: Exactly! Teachers inspire curiosity in ways algorithms simply cannot replicate."
        ],
        options: [
          "A. a - b - c - d",
          "B. b - a - d - c",
          "C. a - c - b - d",
          "D. c - a - b - d"
        ],
        answer: "A. a - b - c - d",
        explanation: "Trật tự hội thoại logic: (a) Đặt câu hỏi thảo luận về AI thay thế giáo viên -> (b) Nêu quan điểm cá nhân -> (c) Tán thành và bổ sung ý nghĩa công cụ hỗ trợ -> (d) Khẳng định giá trị cảm hứng của người thầy.",
        grammarPoint: "Sắp xếp hội thoại mạch lạc (Dialogue Flow)"
      }
    ],
    cloze: {
      passage: `In recent years, artificial intelligence has fundamentally revolutionized secondary education worldwide. Instead of relying solely on uniform printed textbooks, modern students can now interact with intelligent platforms that adapt to their unique learning styles. By analysing real-time progress, these smart systems identify individual knowledge (1)_______ and suggest tailored review exercises. Furthermore, educators utilize automated grading tools to significantly reduce time spent on administrative paperwork, which (2)_______ them to dedicate more energy to inspirational mentoring. However, experts emphasize that algorithmic efficiency must never (3)_______ human connection. Students must actively develop critical thinking to evaluate whether machine-generated answers are accurate and ethically (4)_______. As technology continues to evolve rapidly, schools that successfully merge digital tools with human guidance will (5)_______ the greatest academic success.`,
      questions: [
        {
          num: 1,
          question: "Choose the best option to fill in blank (1):",
          options: ["A. gaps", "B. holes", "C. spaces", "D. vacancies"],
          answer: "A. gaps",
          explanation: "Cụm danh từ cố định 'knowledge gaps' nghĩa là các lỗ hổng kiến thức. Các từ còn lại không đi với knowledge theo nghĩa sư phạm.",
          grammarPoint: "Collocation: knowledge gaps"
        },
        {
          num: 2,
          question: "Choose the best option to fill in blank (2):",
          options: ["A. enables", "B. forces", "C. prevents", "D. forbids"],
          answer: "A. enables",
          explanation: "Cấu trúc: 'enable somebody to do something' nghĩa là cho phép, tạo điều kiện thuận lợi cho ai làm gì.",
          grammarPoint: "Động từ theo sau tân ngữ và to-V (Verb + Object + to-V)"
        },
        {
          num: 3,
          question: "Choose the best option to fill in blank (3):",
          options: ["A. overshadow", "B. underline", "C. undergo", "D. overhear"],
          answer: "A. overshadow",
          explanation: "'overshadow' nghĩa là che mờ, làm lu mờ (không để sự hiệu quả của thuật toán làm lu mờ sự gắn kết con người).",
          grammarPoint: "Từ vựng học thuật (Overshadow)"
        },
        {
          num: 4,
          question: "Choose the best option to fill in blank (4):",
          options: ["A. sound", "B. noisy", "C. loud", "D. harsh"],
          answer: "A. sound",
          explanation: "'ethically sound' là thuật ngữ chỉ sự chuẩn mực, đúng đắn về mặt đạo đức.",
          grammarPoint: "Tính từ ngữ cảnh học thuật (Ethically sound)"
        },
        {
          num: 5,
          question: "Choose the best option to fill in blank (5):",
          options: ["A. achieve", "B. dismiss", "C. waste", "D. decline"],
          answer: "A. achieve",
          explanation: "Cụm 'achieve academic success' nghĩa là gặt hái thành công trong học tập.",
          grammarPoint: "Collocation: achieve success"
        }
      ]
    },
    reading: {
      passageTitle: "Adaptive Learning in the Age of Intelligent Classrooms",
      passage: `The integration of artificial intelligence into secondary schools is fundamentally transforming contemporary pedagogical practices. Historically, educational institutions functioned around standardized curricula, requiring every student in a classroom to assimilate identical information at an unyielding pace. Consequently, students with accelerated comprehension often experienced boredom, while those facing conceptual hurdles struggled to keep pace. Today, <b>adaptive</b> educational software is dismantling this rigid paradigm.
By utilizing sophisticated diagnostic algorithms, adaptive platforms continuously monitor a learner's response velocity, error frequency, and problem-solving strategies. When a pupil stumbles on complex relative clauses, the system immediately generates scaffolding explanations and targeted drills rather than advancing prematurely. Furthermore, educators gain access to intuitive analytics dashboards that delineate precise classwide patterns, allowing them to intervene with differentiated instruction for vulnerable learners.
Nevertheless, excessive reliance on automated instruction introduces substantial challenges. Educational sociologists warn that over-digitization may erode peer-to-peer social collaboration and compromise deep reading concentration. If students interact exclusively with individualized screens, <b>they</b> risk missing crucial informal discussions where collaborative problem-solving flourishes. Therefore, leading educational authorities advocate a balanced 'hybrid pedagogy'—one where algorithmic precision empowers teachers rather than displacing them.`,
      questions: [
        {
          readingQuestionType: "main_idea",
          question: "What is the primary theme of the passage?",
          options: [
            "A. The transformative benefits and necessary boundaries of adaptive AI in modern education",
            "B. The financial costs required to purchase high-tech computer equipment for schools",
            "C. The total failure of standardized testing across modern educational systems",
            "D. Why human instructors should be completely substituted by automated software"
          ],
          answer: "A. The transformative benefits and necessary boundaries of adaptive AI in modern education",
          explanation: "Ý chính toàn bài: Bài viết phân tích sự chuyển mình đột phá của phần mềm học tập thích ứng (adaptive software) đồng thời chỉ ra các thách thức và sự cần thiết của mô hình giáo dục kết hợp (hybrid pedagogy).",
          grammarPoint: "Đọc hiểu: Ý chính toàn bài (Main Idea)"
        },
        {
          readingQuestionType: "detail",
          question: "According to paragraph 2, how does adaptive software support a student who encounters difficulties?",
          options: [
            "A. By giving an automatic failing grade immediately",
            "B. By generating scaffolding explanations and targeted review drills",
            "C. By skipping the challenging topic entirely and moving to the next unit",
            "D. By instructing the student to study alone without a teacher"
          ],
          answer: "B. By generating scaffolding explanations and targeted review drills",
          explanation: "Thông tin chi tiết đoạn 2: 'the system immediately generates scaffolding explanations and targeted drills rather than advancing prematurely'.",
          grammarPoint: "Đọc hiểu: Thông tin chi tiết (Factual Detail)"
        },
        {
          readingQuestionType: "vocabulary",
          question: "The word 'adaptive' in paragraph 1 is closest in meaning to:",
          options: ["A. flexible and adjusting", "B. stubborn and rigid", "C. expensive and luxurious", "D. old-fashioned"],
          answer: "A. flexible and adjusting",
          explanation: "'adaptive' mang nghĩa có tính thích ứng, linh hoạt điều chỉnh theo nhu cầu người học ('flexible and adjusting').",
          grammarPoint: "Đọc hiểu: Từ vựng trong ngữ cảnh (Vocabulary in Context)"
        },
        {
          readingQuestionType: "reference",
          question: "The word 'they' in paragraph 3 refers to:",
          options: ["A. students", "B. educators", "C. algorithms", "D. screens"],
          answer: "A. students",
          explanation: "Đoạn văn viết: 'If students interact exclusively with individualized screens, they risk missing...' -> 'they' quy chiếu cho danh từ 'students' đứng trước.",
          grammarPoint: "Đọc hiểu: Đại từ quy chiếu (Pronoun Reference)"
        },
        {
          readingQuestionType: "inference",
          question: "What can be inferred about the future role of teachers from paragraph 3?",
          options: [
            "A. Teachers will remain essential by guiding human values and facilitating peer collaboration.",
            "B. Teachers will be completely phased out of schools before the next decade.",
            "C. Teachers should only teach physical education and sports.",
            "D. Teachers will no longer need to assess student work."
          ],
          answer: "A. Teachers will remain essential by guiding human values and facilitating peer collaboration.",
          explanation: "Suy luận từ đoạn cuối: 'hybrid pedagogy—one where algorithmic precision empowers teachers rather than displacing them' -> giáo viên vẫn giữ vai trò cốt lõi không thể thay thế trong việc định hướng giá trị và kết nối học sinh.",
          grammarPoint: "Đọc hiểu: Câu hỏi suy luận (Inference)"
        }
      ]
    },
    writingShort: [
      {
        writingType: "sentence_transformation",
        originalSentence: "Because she practiced speaking English with an AI app every evening, her pronunciation improved remarkably.",
        sentenceBeginning: "Having",
        question: "Rewrite the sentence beginning with 'Having':",
        answer: "Having practiced speaking English with an AI app every evening, her pronunciation improved remarkably.",
        alternativeAnswers: [
          "Having practiced speaking English with an AI app every evening, her pronunciation improved remarkably.",
          "Having practised speaking English with an AI app every evening, her pronunciation improved remarkably."
        ],
        explanation: "Rút gọn mệnh đề chỉ nguyên nhân cùng chủ ngữ bằng Phân từ hoàn thành (Perfect Participle: Having + V3/ed) để nhấn mạnh hành động luyện tập đã hoàn thành trước.",
        grammarPoint: "Rút gọn mệnh đề bằng Phân từ hoàn thành (Perfect Participle)"
      },
      {
        writingType: "word_formation",
        question: "Complete the sentence with the correct form of the word in brackets: Artificial intelligence algorithms have demonstrated high _______ in detecting grammatical errors. (ACCURATE)",
        answer: "accuracy",
        alternativeAnswers: ["accuracy"],
        explanation: "Sau tính từ 'high' cần một danh từ. Danh từ của 'accurate' là 'accuracy' (sự chính xác).",
        grammarPoint: "Cấu tạo từ (Word formation: accurate -> accuracy)"
      }
    ],
    essay: {
      essayPrompt: {
        minWords: 100,
        maxWords: 140,
        topic: "Write a paragraph (100 - 140 words) discussing how high school students should responsibly use artificial intelligence tools to enhance their English learning.",
        suggestedPoints: [
          "Using AI chatbots to practice interactive speaking and receive instant feedback",
          "Brainstorming writing ideas and checking vocabulary collocations",
          "Avoiding plagiarism and maintaining academic honesty by writing personal essays independently"
        ]
      },
      question: "Write a paragraph (about 100 - 140 words) discussing responsible ways secondary students can leverage AI tools for English study.",
      answer: "[Bài mẫu tham khảo]: In the digital era, high school students can harness artificial intelligence responsibly to accelerate their English proficiency while preserving academic integrity. Firstly, conversational AI chatbots serve as non-judgmental speaking partners, allowing learners to practice dialogue, hone correct pronunciation, and expand topical vocabulary anytime. Secondly, AI platforms function as effective study assistants to brainstorm writing outlines and verify natural collocations. Crucially, students must uphold academic honesty by never copying automated essays verbatim; instead, they should synthesize insights and articulate their own arguments. In conclusion, when utilized with clear ethical mindfulness and critical scrutiny, AI tools empower students to become proactive, self-directed lifelong learners.",
      rubric: {
        totalMaxScore: 10,
        criteria: [
          { criterion: "Task Achievement", maxScore: 2.5, description: "Giải quyết đúng chủ đề sử dụng AI có trách nhiệm trong học tiếng Anh, có câu chủ đề và câu kết.", bands: [{ band: "2.1 - 2.5", detail: "Ý tưởng phong phú, thực tế, bố cục chuẩn 100-140 từ." }] },
          { criterion: "Coherence & Cohesion", maxScore: 2.5, description: "Sử dụng từ nối tự nhiên (Firstly, Secondly, Crucially, In conclusion).", bands: [{ band: "2.1 - 2.5", detail: "Mạch lạc, chuyển ý nhịp nhàng." }] },
          { criterion: "Lexical Resource", maxScore: 2.5, description: "Từ vựng công nghệ và giáo dục phong phú (academic integrity, non-judgmental, natural collocations, self-directed).", bands: [{ band: "2.1 - 2.5", detail: "Collocations tự nhiên, chuẩn xác ngữ cảnh." }] },
          { criterion: "Grammatical Range & Accuracy", maxScore: 2.5, description: "Cấu trúc ngữ pháp đa dạng, chính xác.", bands: [{ band: "2.1 - 2.5", detail: "Không mắc lỗi ngữ pháp cơ bản." }] }
        ]
      },
      explanation: "Chấm theo 4 tiêu chí chuẩn khảo thí Bộ GD&ĐT: Task Achievement (2.5đ), Coherence & Cohesion (2.5đ), Lexical Resource (2.5đ), Grammatical Range & Accuracy (2.5đ).",
      grammarPoint: "Kỹ năng viết đoạn văn nghị luận (Academic Paragraph Writing)"
    }
  },

  // THEME 2: A MULTICULTURAL WORLD & CULTURAL HERITAGE (Global Success 12 Unit 2 & 11 Unit 6)
  {
    themeKey: "multicultural_world",
    themeTitle: "A Multicultural World & Cultural Heritage Preservation",
    audioTitleTrack1: "Track 1 - Conversation: International Youth Cultural Exchange Festival",
    audioSpeakerInfoTrack1: "Conversation between Sophie (UK Exchange Student) and Mai (Vietnamese Cultural Club Leader)",
    audioScriptTrack1: `Sophie: Hello Mai! I have just visited your club's traditional booth at the cultural exhibition, and the Ao Dai display was absolutely breathtaking!
Mai: Thank you so much, Sophie! We wanted to showcase how traditional silk weaving reflects centuries of Vietnamese heritage and identity.
Sophie: It certainly does. In the United Kingdom, multicultural festivals like the Notting Hill Carnival celebrate our rich cultural mosaic and promote mutual appreciation among communities.
Mai: That sounds wonderful! Preserving intangible cultural heritage while embracing modern globalization is one of our primary goals this semester.
Sophie: Exactly. Next month, our international youth group is organizing an intercultural storytelling workshop where participants share traditional folk tales and regional idioms.
Mai: What a brilliant idea! Our club members would love to perform a short Quan Ho folk singing piece accompanied by traditional musical instruments.
Sophie: That would be the highlight of the festival! I will ensure our schedule includes a twenty-minute performance slot for your group.`,
    audioTitleTrack2: "Track 2 - Interview: Preserving Indigenous Customs in a Globalised Society",
    audioSpeakerInfoTrack2: "Interview between Radio Presenter and Dr. Fiona Stewart (UNESCO Cultural Heritage Consultant)",
    audioScriptTrack2: `Host: Good afternoon and welcome to Heritage Matters. Today we have the privilege of speaking with Dr. Fiona Stewart from Edinburgh, who has spearheaded cultural preservation projects across Southeast Asia. Dr. Stewart, what poses the greatest threat to traditional customs today?
Dr. Stewart: Good afternoon! The greatest threat is not globalization itself, but rather cultural homogenization—the gradual loss of distinct local customs when younger generations feel compelled to conform to ubiquitous western pop culture.
Host: That is indeed concerning. How can schools actively bridge this generational divide?
Dr. Stewart: Educational institutions must integrate living heritage into creative arts and language curricula. When students interview community elders and document folk songs or oral histories digitally, they develop profound cultural pride while acquiring contemporary media skills.
Host: What advice would you give to teenagers navigating multiple cultural influences?
Dr. Stewart: Be proud of your roots while remaining open-minded. Cultural identity is not a static museum artifact; it is a vibrant, living bridge that connects your ancestors' wisdom with the global community.`,
    task1: [
      {
        question: "Sophie was particularly impressed by the traditional Ao Dai display at the exhibition.",
        options: ["A. True", "B. False"],
        answer: "A. True",
        audioEvidence: "Sophie: '...and the Ao Dai display was absolutely breathtaking!'",
        explanation: "Đúng (True). Trích Track 1: Sophie khen ngợi gian trưng bày áo dài truyền thống rất ngoạn mục.",
        grammarPoint: "Listening for speaker feelings and appreciation"
      },
      {
        question: "The Notting Hill Carnival mentioned by Sophie is an annual event held in Vietnam.",
        options: ["A. True", "B. False"],
        answer: "B. False",
        audioEvidence: "Sophie: 'In the United Kingdom, multicultural festivals like the Notting Hill Carnival...'",
        explanation: "Sai (False). Lễ hội Notting Hill Carnival được tổ chức tại Vương quốc Anh (United Kingdom).",
        grammarPoint: "Listening for geographic location"
      },
      {
        question: "Mai's club proposed performing traditional Quan Ho folk songs at the upcoming festival.",
        options: ["A. True", "B. False"],
        answer: "A. True",
        audioEvidence: "Mai: 'Our club members would love to perform a short Quan Ho folk singing piece...'",
        explanation: "Đúng (True). Câu lạc bộ của Mai mong muốn biểu diễn quan họ truyền thống.",
        grammarPoint: "Listening for proposal & activity"
      },
      {
        question: "Sophie allocated only five minutes for Mai's group performance.",
        options: ["A. True", "B. False"],
        answer: "B. False",
        audioEvidence: "Sophie: 'I will ensure our schedule includes a twenty-minute performance slot for your group.'",
        explanation: "Sai (False). Thời lượng dành cho nhóm là 20 phút ('twenty-minute performance slot'), không phải 5 phút.",
        grammarPoint: "Listening for numbers & duration"
      }
    ],
    task2_multiple_choice: [
      {
        question: "What does Dr. Fiona Stewart identify as the greatest danger to local traditions?",
        options: [
          "A. Lack of international tourism funding",
          "B. Cultural homogenization and the loss of distinct customs",
          "C. Overuse of renewable green energy",
          "D. The teaching of traditional languages in schools"
        ],
        answer: "B. Cultural homogenization and the loss of distinct customs",
        audioEvidence: "Dr. Stewart: 'The greatest threat is not globalization itself, but rather cultural homogenization...'",
        explanation: "Phương án B đúng. Trích Track 2: Nguy cơ lớn nhất là sự đồng nhất hóa văn hóa (cultural homogenization) làm mai một bản sắc riêng.",
        grammarPoint: "Listening for key concepts"
      },
      {
        question: "How does Dr. Stewart describe cultural identity in her closing remarks?",
        options: [
          "A. As a static museum artifact that should remain unchanged",
          "B. As an obstacle to learning modern foreign languages",
          "C. As a vibrant, living bridge connecting ancestral wisdom with the world",
          "D. As something that only elderly people should care about"
        ],
        answer: "C. As a vibrant, living bridge connecting ancestral wisdom with the world",
        audioEvidence: "Dr. Stewart: 'Cultural identity is not a static museum artifact; it is a vibrant, living bridge...'",
        explanation: "Phương án C đúng. Bản sắc văn hóa là cây cầu sống động nối liền trí tuệ của tổ tiên với thế giới.",
        grammarPoint: "Listening for metaphors & philosophical perspective"
      }
    ],
    task2_fill_blank: [
      {
        question: "Schools should integrate (1) _______ heritage into language and arts curricula.",
        answer: "living",
        alternativeAnswers: ["living", "living heritage"],
        wordLimit: "NO MORE THAN TWO WORDS",
        audioEvidence: "Dr. Stewart: 'Educational institutions must integrate living heritage into creative arts...'",
        explanation: "Đáp án đúng là living (living heritage: di sản sống).",
        grammarPoint: "Note completion: Adjectives"
      },
      {
        question: "Students document folk songs and oral histories with (2) _______ media skills.",
        answer: "contemporary",
        alternativeAnswers: ["contemporary", "modern", "digital"],
        wordLimit: "NO MORE THAN TWO WORDS",
        audioEvidence: "Dr. Stewart: '...while acquiring contemporary media skills.'",
        explanation: "Đáp án đúng là contemporary (contemporary media skills).",
        grammarPoint: "Note completion: Academic modifier"
      }
    ],
    pronunciation: [
      {
        question: "Choose the word whose underlined part is pronounced differently from the others:",
        options: ["A. anc<u>e</u>stor", "B. f<u>e</u>stival", "C. id<u>e</u>ntity", "D. c<u>e</u>lebrate"],
        answer: "C. id<u>e</u>ntity",
        underlinedPart: "e",
        ipaTranscription: "identity: /aɪˈden.tə.ti/ (/e/) vs ancestor: /ˈæn.ses.tər/, festival: /ˈfes.tɪ.vəl/, celebrate: /ˈsel.ə.breɪt/",
        explanation: "Phần gạch chân 'e' trong 'identity' có vị trí âm tiết thứ hai nhận trọng âm /e/. Lưu ý trọng âm và nguyên âm chuẩn.",
        grammarPoint: "Phát âm nguyên âm trong từ vựng văn hóa"
      },
      {
        question: "Choose the word whose main stress is placed differently from that of the others:",
        options: ["A. multicultural", "B. assimilation", "C. diversity", "D. nationality"],
        answer: "C. diversity",
        ipaTranscription: "diversity: /daɪˈvɜː.sə.ti/ (âm 2) vs multicultural: /ˌmʌl.tiˈkʌl.tʃər.əl/ (âm 4), assimilation: /əˌsɪm.ɪˈleɪ.ʃən/ (âm 4), nationality: /ˌnæʃ.ənˈæl.ə.ti/ (âm 3)",
        explanation: "'diversity' nhấn âm tiết thứ hai /daɪˈvɜː.sə.ti/. Các từ còn lại có từ 4-5 âm tiết và trọng âm rơi vào âm tiết thứ 3 hoặc 4.",
        grammarPoint: "Trọng âm từ có 4-5 âm tiết (-ity, -tion)"
      }
    ],
    lexicoGrammar: [
      {
        question: "Living in a multicultural society enables teenagers to broaden their _______ and develop mutual tolerance.",
        options: ["A. horizons", "B. boundaries", "C. borders", "D. limits"],
        answer: "A. horizons",
        explanation: "Thành ngữ: 'broaden one's horizons' nghĩa là mở rộng tầm nhìn, mở rộng hiểu biết.",
        grammarPoint: "Thành ngữ cố định (Idiom: broaden one's horizons)"
      },
      {
        question: "It is essential that every citizen _______ active measures to preserve intangible cultural heritage.",
        options: ["A. take", "B. takes", "C. took", "D. will take"],
        answer: "A. take",
        explanation: "Cấu trúc Thể giả định (Subjunctive Mood): 'It is essential that S + (should) V-bare'. Do đó động từ giữ nguyên mẫu 'take'.",
        grammarPoint: "Thể giả định (Subjunctive Mood: It is essential that S + V-bare)"
      },
      {
        question: "The folk dance _______ by the ethnic minority artisans captivated the entire international audience.",
        options: ["A. performed", "B. performing", "C. was performed", "D. performs"],
        answer: "A. performed",
        explanation: "Rút gọn mệnh đề quan hệ dạng bị động (The folk dance which was performed -> The folk dance performed).",
        grammarPoint: "Rút gọn mệnh đề quan hệ (Reduced Relative Clauses)"
      },
      {
        question: "Folk music genres such as Ca Tru and Quan Ho have been passed _______ through generations of Vietnamese families.",
        options: ["A. down", "B. out", "C. over", "D. away"],
        answer: "A. down",
        explanation: "Cụm động từ: 'pass down' nghĩa là truyền lại từ thế hệ này sang thế hệ khác qua nhiều năm.",
        grammarPoint: "Cụm động từ (Phrasal Verb: pass down)"
      }
    ],
    arrangement: [
      {
        arrangementType: "paragraph",
        question: "Mark the letter A, B, C, or D to indicate the correct arrangement of sentences to make a coherent paragraph:",
        arrangementItems: [
          "a. In summary, preserving traditional customs provides youths with an irreplaceable moral compass in our rapidly globalising world.",
          "b. Cultural heritage is the bedrock upon which national identity and communal solidarity are constructed.",
          "c. Additionally, celebrating indigenous festivals fosters mutual empathy among diverse ethnic groups within the nation.",
          "d. First of all, oral traditions and folk folklore transmit ancestral virtues of honesty, filial piety, and communal resilience."
        ],
        options: [
          "A. b - d - c - a",
          "B. b - c - d - a",
          "C. d - b - c - a",
          "D. a - b - d - c"
        ],
        answer: "A. b - d - c - a",
        explanation: "Trật tự đoạn văn chuẩn học thuật: (b) Câu mở đoạn giới thiệu giá trị di sản -> (d) Luận điểm 1 (First of all) -> (c) Luận điểm 2 (Additionally) -> (a) Câu kết luận (In summary).",
        grammarPoint: "Cấu trúc đoạn văn lập luận (Academic Paragraph Organization)"
      }
    ],
    cloze: {
      passage: `In our interconnected global landscape, cultural diversity has become one of humanity's most valuable assets. Rather than viewing different customs as barriers, modern educators encourage teenagers to perceive cultural variations as opportunities for mutual enrichment. When young individuals explore international heritage, they not only acquire foreign language proficiency but also cultivate profound (1)_______ for distinct perspectives. In many nations, schools organize multicultural fairs where participants exhibit ethnic costumes, share traditional dishes, and explain the historical (2)_______ behind ancient celebrations. Crucially, embracing foreign traditions does not mean that one should (3)_______ their own cultural roots. On the contrary, cross-cultural exposure often sparks a renewed desire to safeguard indigenous folklore and pass (4)_______ treasured ancestral knowledge. Ultimately, fostering inclusive communities requires both global curiosity and heartfelt pride in one's personal cultural (5)_______.`,
      questions: [
        {
          num: 1,
          question: "Choose the best option to fill in blank (1):",
          options: ["A. respect", "B. hesitation", "C. suspicion", "D. indifference"],
          answer: "A. respect",
          explanation: "Cụm 'cultivate respect for distinct perspectives' nghĩa là nuôi dưỡng sự tôn trọng đối với những góc nhìn khác nhau.",
          grammarPoint: "Từ vựng ngữ cảnh (Respect for)"
        },
        {
          num: 2,
          question: "Choose the best option to fill in blank (2):",
          options: ["A. significance", "B. insignificance", "C. superficiality", "D. disturbance"],
          answer: "A. significance",
          explanation: "'historical significance' nghĩa là ý nghĩa lịch sử sâu xa đằng sau các ngày lễ.",
          grammarPoint: "Collocation: historical significance"
        },
        {
          num: 3,
          question: "Choose the best option to fill in blank (3):",
          options: ["A. abandon", "B. protect", "C. cherish", "D. celebrate"],
          answer: "A. abandon",
          explanation: "'abandon one's roots' nghĩa là từ bỏ cội nguồn của mình ('does not mean that one should abandon their own cultural roots').",
          grammarPoint: "Collocation: abandon one's roots"
        },
        {
          num: 4,
          question: "Choose the best option to fill in blank (4):",
          options: ["A. down", "B. up", "C. out", "D. in"],
          answer: "A. down",
          explanation: "Cụm động từ: 'pass down' nghĩa là truyền lại cho các thế hệ tương lai.",
          grammarPoint: "Phrasal verb: pass down"
        },
        {
          num: 5,
          question: "Choose the best option to fill in blank (5):",
          options: ["A. identity", "B. anonymity", "C. conformity", "D. complexity"],
          answer: "A. identity",
          explanation: "'cultural identity' nghĩa là bản sắc văn hóa của mỗi cá nhân.",
          grammarPoint: "Collocation: cultural identity"
        }
      ]
    },
    reading: {
      passageTitle: "Cultural Heritage in the Era of Global Connectivity",
      passage: `Throughout human history, distinct cultures have served as repositories of communal wisdom, philosophical beliefs, and creative expression. However, the advent of rapid digital telecommunications and ubiquitous global streaming platforms has provoked intense debate regarding the sustainability of localized traditions. While globalization undeniably democratizes access to diverse artistic genres, critics caution that unrestrained exposure to dominant entertainment empires may precipitate <b>homogenization</b>, gradually subverting ancient vernacular languages and folk ceremonies.
Yet, contemporary cultural theorists contend that global connectivity need not be an adversarial force against traditional heritage. When indigenous communities leverage modern multimedia technology, ancient art forms discover vibrant new platforms. For instance, young Vietnamese creators have seamlessly blended traditional instruments like the Dan Bau and Dan Tranh with contemporary symphonic arrangements, introducing youth worldwide to ancestral musical sensibilities. Far from diluting authenticity, these innovative fusion projects render historical traditions <b>relevant</b> to digital natives who might otherwise perceive them as obsolete artifacts.
Ultimately, the preservation of intangible cultural heritage hinges not on isolationism, but on creative dynamism. Cultures that successfully navigate the twentieth-first century recognize that heritage is not a fossilized relic destined for sterile display cases; rather, <b>it</b> is a resilient organism that continually reinvents itself through intercultural dialogue. By championing both ancestral respect and creative openness, modern societies can construct inclusive communities that honor human diversity.`,
      questions: [
        {
          readingQuestionType: "main_idea",
          question: "What is the primary argument advanced by the author throughout the passage?",
          options: [
            "A. Modern digital connectivity can revitalize cultural heritage through creative innovation rather than destroying it.",
            "B. All traditional musical instruments should be banned in contemporary pop music.",
            "C. Ancient languages are inherently inferior to global English.",
            "D. Societies must close their borders completely to prevent cultural contamination."
          ],
          answer: "A. Modern digital connectivity can revitalize cultural heritage through creative innovation rather than destroying it.",
          explanation: "Ý chính toàn bài: Sự kết nối kỹ thuật số hiện đại không nhất thiết phải triệt tiêu văn hóa truyền thống mà có thể hồi sinh di sản thông qua sự sáng tạo đổi mới đầy sức sống.",
          grammarPoint: "Đọc hiểu: Xác định ý chính toàn bài (Main Idea)"
        },
        {
          readingQuestionType: "detail",
          question: "According to paragraph 2, how have young Vietnamese creators brought traditional music to global youth?",
          options: [
            "A. By destroying old instruments in public protests",
            "B. By blending Dan Bau and Dan Tranh with contemporary symphonic arrangements",
            "C. By translating foreign songs directly without using musical notes",
            "D. By refusing to upload their performances to digital streaming channels"
          ],
          answer: "B. By blending Dan Bau and Dan Tranh with contemporary symphonic arrangements",
          explanation: "Chi tiết trong đoạn 2: 'young Vietnamese creators have seamlessly blended traditional instruments like the Dan Bau and Dan Tranh with contemporary symphonic arrangements'.",
          grammarPoint: "Đọc hiểu: Tìm chi tiết trong bài (Factual Detail)"
        },
        {
          readingQuestionType: "vocabulary",
          question: "The word 'homogenization' in paragraph 1 is closest in meaning to:",
          options: ["A. uniformity and sameness", "B. extraordinary variety", "C. complete destruction", "D. ancient history"],
          answer: "A. uniformity and sameness",
          explanation: "'homogenization' (sự đồng nhất hóa, mất đi nét đặc thù) đồng nghĩa với 'uniformity and sameness'.",
          grammarPoint: "Đọc hiểu: Từ vựng trong ngữ cảnh (Vocabulary in Context)"
        },
        {
          readingQuestionType: "reference",
          question: "The word 'it' in paragraph 3 refers to:",
          options: ["A. heritage", "B. century", "C. display case", "D. dialogue"],
          answer: "A. heritage",
          explanation: "Đoạn văn viết: 'heritage is not a fossilized relic destined for sterile display cases; rather, it is a resilient organism...' -> đại từ 'it' thay thế cho danh từ 'heritage' đứng trước.",
          grammarPoint: "Đọc hiểu: Đại từ quy chiếu (Pronoun Reference)"
        },
        {
          readingQuestionType: "inference",
          question: "What does the author suggest about preserving cultural traditions in the conclusion?",
          options: [
            "A. Preservation requires creative adaptation and intercultural dialogue rather than isolation.",
            "B. Traditional customs will be entirely forgotten within fifty years.",
            "C. Only professional historians have the authority to speak about culture.",
            "D. Digital natives have no interest in ancestral values."
          ],
          answer: "A. Preservation requires creative adaptation and intercultural dialogue rather than isolation.",
          explanation: "Suy luận từ đoạn cuối: 'preservation of intangible cultural heritage hinges not on isolationism, but on creative dynamism... continually reinvents itself through intercultural dialogue'.",
          grammarPoint: "Đọc hiểu: Suy luận sâu (Inference)"
        }
      ]
    },
    writingShort: [
      {
        writingType: "sentence_transformation",
        originalSentence: "They didn't realize the cultural significance of the monument until they listened to the guide's explanation.",
        sentenceBeginning: "Not until",
        question: "Rewrite the sentence beginning with 'Not until':",
        answer: "Not until they listened to the guide's explanation did they realize the cultural significance of the monument.",
        alternativeAnswers: [
          "Not until they listened to the guide's explanation did they realize the cultural significance of the monument.",
          "Not until they listened to the guide's explanation did they realise the cultural significance of the monument."
        ],
        explanation: "Cấu trúc đảo ngữ với 'Not until': Not until + Clause / Time phrase + Trợ động từ + S + V-bare. (did they realize...)",
        grammarPoint: "Đảo ngữ với Not until (Inversion with Not until)"
      },
      {
        writingType: "word_formation",
        question: "Complete the sentence with the correct form of the word in brackets: Embracing cultural _______ helps reduce social prejudice in our communities. (DIVERSE)",
        answer: "diversity",
        alternativeAnswers: ["diversity"],
        explanation: "Sau tính từ 'cultural' cần danh từ. Danh từ của 'diverse' là 'diversity' (cultural diversity: sự đa dạng văn hóa).",
        grammarPoint: "Cấu tạo từ (Word formation: diverse -> diversity)"
      }
    ],
    essay: {
      essayPrompt: {
        minWords: 100,
        maxWords: 140,
        topic: "Write a paragraph (100 - 140 words) discussing why high school students should take active steps to preserve traditional cultural heritage.",
        suggestedPoints: [
          "Cultural heritage strengthens personal identity and connects youths with ancestral history",
          "Learning about traditional customs fosters mutual empathy and respects diversity in a globalised world",
          "Creative modernization of folk arts makes culture vibrant and attractive to international peers"
        ]
      },
      question: "Write a paragraph (about 100 - 140 words) explaining why preserving traditional cultural heritage is essential for today's youths.",
      answer: "[Bài mẫu tham khảo]: Safeguarding traditional cultural heritage is fundamentally essential for secondary students as they navigate an increasingly globalized world. Firstly, indigenous heritage serves as an indelible anchor, connecting younger generations with their ancestral history and reinforcing national self-worth. By understanding the profound significance of traditional folk festivals and customs, students develop resilience against cultural homogenization. Secondly, valuing one's own heritage cultivates authentic empathy toward other global cultures, encouraging respectful intercultural exchange rather than superficial conformity. Finally, youth participation in modernizing folk arts—such as fusing traditional melodies with contemporary arrangements—breathes vibrant life into ancient traditions. In conclusion, preserving cultural heritage empowers students to step into the international arena with confidence, anchored by proud roots while embracing global citizenship.",
      rubric: {
        totalMaxScore: 10,
        criteria: [
          { criterion: "Task Achievement", maxScore: 2.5, description: "Nêu rõ tầm quan trọng của việc gìn giữ di sản đối với thế hệ trẻ, có cấu trúc đoạn văn rõ ràng.", bands: [{ band: "2.1 - 2.5", detail: "Lập luận thuyết phục, ví dụ cụ thể, đủ độ dài 100-140 từ." }] },
          { criterion: "Coherence & Cohesion", maxScore: 2.5, description: "Liên kết mạch lạc, sử dụng từ nối đa dạng (Firstly, Secondly, Finally, In conclusion).", bands: [{ band: "2.1 - 2.5", detail: "Chuyển ý tự nhiên, logic chặt chẽ." }] },
          { criterion: "Lexical Resource", maxScore: 2.5, description: "Từ vựng văn hóa phong phú (ancestral history, national self-worth, cultural homogenization, intercultural exchange).", bands: [{ band: "2.1 - 2.5", detail: "Vốn từ học thuật chính xác, collocations tự nhiên." }] },
          { criterion: "Grammatical Range & Accuracy", maxScore: 2.5, description: "Cấu trúc câu phong phú và chuẩn xác.", bands: [{ band: "2.1 - 2.5", detail: "Không mắc lỗi ngữ pháp cơ bản." }] }
        ]
      },
      explanation: "Chấm theo 4 tiêu chí chuẩn khảo thí Bộ GD&ĐT: Task Achievement (2.5đ), Coherence & Cohesion (2.5đ), Lexical Resource (2.5đ), Grammatical Range & Accuracy (2.5đ).",
      grammarPoint: "Kỹ năng viết đoạn văn nghị luận xã hội (Paragraph Writing on Culture)"
    }
  }
];
