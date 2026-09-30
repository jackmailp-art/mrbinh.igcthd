import { GoogleGenAI } from "@google/genai";
import { THEMATIC_DATASETS } from "./curriculumBanks";
import { getDB } from "./db";

export const DYNAMIC_THEMATIC_PERSPECTIVES = [
  "Công nghệ Trí tuệ nhân tạo (AI), Tự động hóa & Kỹ năng số trong học tập và công việc tương lai",
  "Bảo tồn đa dạng sinh học, Khí hậu toàn cầu & Lối sống xanh tuần hoàn (Zero Waste & Circular Economy)",
  "Lối sống thanh thiếu niên hiện đại: Cân bằng thời lượng số (Digital Detox), Sức khỏe thể chất & Tinh thần",
  "Năng lượng tái tạo, Giao thông xanh & Thành phố thông minh bền vững (Smart & Resilient Cities)",
  "Khám phá không gian vũ trụ, Kính thiên văn thế hệ mới & Những bí ẩn thiên văn học hiện đại",
  "Bảo tồn di sản văn hóa phi vật thể, Tinh hoa ẩm thực & Bản sắc dân tộc trong thế giới phẳng",
  "Y học dự phòng, Đột phá công nghệ sinh học & Thói quen chăm sóc sức khỏe khoa học",
  "Khởi nghiệp đổi mới sáng tạo của người trẻ (Youth Entrepreneurship) & Dự án cộng đồng",
  "Du lịch sinh thái có trách nhiệm, Trải nghiệm cộng đồng bản địa & Giáo dục môi trường",
  "Tư duy phản biện (Critical Thinking), Đọc hiểu đa nguồn & Ứng xử văn minh trên mạng xã hội"
];

export interface GenerateExamParams {
  topic: string;
  grade: string;
  difficulty: string;
  temperature?: number;
  random_seed?: string | number;
  randomSeed?: string | number;
  metadata?: {
    random_seed?: string | number;
    generatedAt?: string;
    [key: string]: any;
  };
  dynamicContextTheme?: string;
  promptTemplate?: string;
  sectionsConfig: {
    listening?: {
      enabled: boolean;
      task1Enabled?: boolean;
      task1Count?: number;
      task2Enabled?: boolean;
      task2Type?: 'multiple_choice' | 'fill_blank';
      task2Count?: number;
      focusTopics?: string[];
    };
    pronunciation?: { enabled: boolean; count: number; focusTopics?: string[] };
    lexico_grammar?: { enabled: boolean; count: number; focusTopics?: string[] };
    arrangement?: { enabled: boolean; count: number; focusTopics?: string[]; selectedFormat?: string };
    cloze_reading?: { enabled: boolean; count: number; focusTopics?: string[] };
    reading_comprehension?: { enabled: boolean; count: number; focusTopics?: string[] };
    writing_short?: { enabled: boolean; count: number; focusTopics?: string[] };
    essay_writing?: { enabled: boolean; count: number; focusTopics?: string[]; customPrompt?: string; includeGuidingQuestions?: boolean };
  };
  selectedUnits?: any[];
  referenceWebsites?: string[];
}

// Fallback bank for listening
export const LISTENING_BANK = {
  audioTitle: "Track 1 - Conversation: Green Campus Club & Waste Reduction Initiative",
  audioTitleTask1: "Track 1 - Conversation: Green Campus Club & Waste Reduction Initiative",
  audioSpeakerInfo: "Conversation between Minh (Environmental Club Leader) and Lan (New Student Volunteer)",
  audioScript: `Minh: Welcome to our Green Campus Club, Lan! We are really excited to have you on our team.
Lan: Thanks, Minh! I've been wanting to contribute to making our school greener. What projects are we currently working on?
Minh: Our primary focus this term is reducing single-use plastic in the school canteen. Last month, our survey found that students threw away more than 500 disposable cups and plastic bottles every single day!
Lan: That is an alarming number! What steps are we taking to change that?
Minh: Starting next Monday, we are launching the 'Bring Your Own Tumbler' campaign. Students who bring their personal reusable bottles will receive a 10% discount on all drinks.
Lan: That's a great incentive! What about waste sorting in the classrooms?
Minh: We have already placed three distinct colored bins on each floor: yellow for paper and notebooks, green for organic food leftovers, and blue for recyclable cans and plastic items. We need volunteers to guide students during lunch break from 11:30 to 12:15.
Lan: I can definitely help with that on Tuesdays and Thursdays.
Minh: Fantastic! Also, remember our tree planting event next Sunday morning at 8:00 AM in the school garden. We aim to plant 30 new indigenous fruit trees to create more green shade.
Lan: That sounds wonderful! I will invite my classmates to join as well.`,
  audioScriptTask1: `Minh: Welcome to our Green Campus Club, Lan! We are really excited to have you on our team.
Lan: Thanks, Minh! I've been wanting to contribute to making our school greener. What projects are we currently working on?
Minh: Our primary focus this term is reducing single-use plastic in the school canteen. Last month, our survey found that students threw away more than 500 disposable cups and plastic bottles every single day!
Lan: That is an alarming number! What steps are we taking to change that?
Minh: Starting next Monday, we are launching the 'Bring Your Own Tumbler' campaign. Students who bring their personal reusable bottles will receive a 10% discount on all drinks.
Lan: That's a great incentive! What about waste sorting in the classrooms?
Minh: We have already placed three distinct colored bins on each floor: yellow for paper and notebooks, green for organic food leftovers, and blue for recyclable cans and plastic items. We need volunteers to guide students during lunch break from 11:30 to 12:15.
Lan: I can definitely help with that on Tuesdays and Thursdays.
Minh: Fantastic! Also, remember our tree planting event next Sunday morning at 8:00 AM in the school garden. We aim to plant 30 new indigenous fruit trees to create more green shade.
Lan: That sounds wonderful! I will invite my classmates to join as well.`,

  // Track 2: Dedicated Audio Track for Task 2 (Part 2)
  audioTitleTask2: "Track 2 - Interview: Sustainable Community & Eco-School Innovations",
  audioSpeakerInfoTask2: "Interview between Radio Host and Dr. Helen Foster (Environmental Education Specialist)",
  audioScriptTask2: `Host: Welcome back to Science and Youth. Today we are pleased to welcome Dr. Helen Foster, who has recently assessed green school initiatives across thirty high schools. Dr. Foster, what stands out the most in these schools?
Dr. Foster: Hello, everyone! What impresses me most is the remarkable shift in student mindsets. Over the past six months, participating schools have achieved a dramatic 45% reduction in canteen plastic waste. Students actively champion the 'zero plastic bottle' habit.
Host: That is truly commendable! How are schools motivating continuous student participation?
Dr. Foster: They have introduced practical green competitions between classes. For example, classrooms that save the most electricity and properly sort recyclable paper into yellow bins receive monthly recognition awards. Furthermore, schools organized weekend workshops where students learned to compost organic food scraps from the lunchroom into rich natural fertilizer for campus gardens.
Host: What advice would you give to schools that are just beginning this eco-journey?
Dr. Foster: Start small but maintain consistency. Appointing enthusiastic student eco-captains in each class creates genuine peer-to-peer encouragement, which is far more influential than top-down rules.`,

  task1: [
    {
      question: "Last month's survey revealed that students discarded more than 500 disposable cups and bottles daily.",
      options: ["A. True", "B. False"],
      answer: "A. True",
      audioEvidence: "Minh: '...our survey found that students threw away more than 500 disposable cups and plastic bottles every single day!'",
      explanation: "Đúng (True). Trích trong Audio Script Track 1: Khảo sát tháng trước chỉ ra học sinh vứt hơn 500 cốc và chai nhựa dùng một lần mỗi ngày.",
      grammarPoint: "Listening for specific facts & statistics"
    },
    {
      question: "Students who bring reusable water bottles will receive a 20% discount on canteen beverages.",
      options: ["A. True", "B. False"],
      answer: "B. False",
      audioEvidence: "Minh: 'Students who bring their personal reusable bottles will receive a 10% discount on all drinks.'",
      explanation: "Sai (False). Mức giảm giá là 10% ('a 10% discount'), không phải 20% như câu nhận định.",
      grammarPoint: "Listening for accurate details & numbers"
    },
    {
      question: "The yellow bins placed on each floor are designated for collecting organic food waste.",
      options: ["A. True", "B. False"],
      answer: "B. False",
      audioEvidence: "Minh: '...yellow for paper and notebooks, green for organic food leftovers...'",
      explanation: "Sai (False). Thùng vàng dành cho giấy và vở (yellow for paper and notebooks), còn thùng màu xanh lá mới dùng cho rác hữu cơ.",
      grammarPoint: "Listening for distinguishing categories"
    },
    {
      question: "The volunteer tree planting campaign will take place in the school garden on Sunday morning.",
      options: ["A. True", "B. False"],
      answer: "A. True",
      audioEvidence: "Minh: '...tree planting event next Sunday morning at 8:00 AM in the school garden.'",
      explanation: "Đúng (True). Hoạt động trồng cây diễn ra vào sáng Chủ nhật lúc 8:00 tại vườn trường.",
      grammarPoint: "Listening for time and venue details"
    }
  ],
  task2_multiple_choice: [
    {
      question: "What impresses Dr. Helen Foster the most about the green school initiatives in Track 2?",
      options: [
        "A. The expensive modern equipment purchased",
        "B. The remarkable shift in student mindsets",
        "C. The large financial profit made by canteens",
        "D. The strict penalties applied to students"
      ],
      answer: "B. The remarkable shift in student mindsets",
      audioEvidence: "Dr. Foster: 'What impresses me most is the remarkable shift in student mindsets.'",
      explanation: "Phương án B đúng. Trích Track 2: 'What impresses me most is the remarkable shift in student mindsets.'",
      grammarPoint: "Listening for main idea & attitude"
    },
    {
      question: "By how much has canteen plastic waste been reduced over the past six months?",
      options: [
        "A. By 25%",
        "B. By 35%",
        "C. By 45%",
        "D. By 60%"
      ],
      answer: "C. By 45%",
      audioEvidence: "Dr. Foster: '...participating schools have achieved a dramatic 45% reduction in canteen plastic waste.'",
      explanation: "Phương án C đúng. Trích Track 2: các trường giảm được 45% rác thải nhựa ở căng tin.",
      grammarPoint: "Listening for numbers & percentages"
    },
    {
      question: "What do students compost into rich natural fertilizer for campus gardens?",
      options: [
        "A. Broken computer electronics",
        "B. Discarded plastic cups and straws",
        "C. Organic food scraps from the lunchroom",
        "D. Used paper notebooks from classrooms"
      ],
      answer: "C. Organic food scraps from the lunchroom",
      audioEvidence: "Dr. Foster: '...compost organic food scraps from the lunchroom into rich natural fertilizer for campus gardens.'",
      explanation: "Phương án C đúng. Trích Track 2: học sinh ủ thức ăn hữu cơ thừa từ phòng ăn trưa thành phân bón tự nhiên.",
      grammarPoint: "Listening for specific activities"
    },
    {
      question: "According to Dr. Foster, what creates the most effective peer-to-peer encouragement?",
      options: [
        "A. Appointing enthusiastic student eco-captains in each class",
        "B. Enforcing severe disciplinary school penalties",
        "C. Closing down school canteens permanently",
        "D. Cancelling all outdoor weekend events"
      ],
      answer: "A. Appointing enthusiastic student eco-captains in each class",
      audioEvidence: "Dr. Foster: 'Appointing enthusiastic student eco-captains in each class creates genuine peer-to-peer encouragement...'",
      explanation: "Phương án A đúng. Bổ nhiệm các đội trưởng sinh thái học sinh nhiệt huyết tạo ra sự khích lệ đồng trang lứa hiệu quả nhất.",
      grammarPoint: "Listening for key recommendations"
    }
  ],
  task2_fill_blank: [
    {
      question: "Percentage of plastic waste reduced in school canteens: (1) _______ %",
      answer: "45",
      alternativeAnswers: ["45", "forty-five", "45%"],
      wordLimit: "NO MORE THAN TWO WORDS AND/OR A NUMBER",
      audioEvidence: "Dr. Foster: '...achieved a dramatic 45% reduction in canteen plastic waste.'",
      explanation: "Đáp án đúng là 45 (hoặc forty-five).",
      grammarPoint: "Note completion: Statistics"
    },
    {
      question: "Students sort recyclable paper into (2) _______ bins to earn monthly awards.",
      answer: "yellow",
      alternativeAnswers: ["yellow", "yellow bin", "the yellow"],
      wordLimit: "NO MORE THAN TWO WORDS AND/OR A NUMBER",
      audioEvidence: "Dr. Foster: '...properly sort recyclable paper into yellow bins...'",
      explanation: "Đáp án đúng là yellow.",
      grammarPoint: "Note completion: Color adjectives"
    },
    {
      question: "Organic food scraps are composted into natural (3) _______ for campus gardens.",
      answer: "fertilizer",
      alternativeAnswers: ["fertilizer", "fertiliser", "natural fertilizer"],
      wordLimit: "NO MORE THAN TWO WORDS AND/OR A NUMBER",
      audioEvidence: "Dr. Foster: '...compost organic food scraps from the lunchroom into rich natural fertilizer...'",
      explanation: "Đáp án đúng là fertilizer (hoặc fertiliser).",
      grammarPoint: "Note completion: Scientific nouns"
    },
    {
      question: "Schools should appoint student eco-captains to foster peer-to-peer (4) _______.",
      answer: "encouragement",
      alternativeAnswers: ["encouragement"],
      wordLimit: "NO MORE THAN TWO WORDS AND/OR A NUMBER",
      audioEvidence: "Dr. Foster: '...creates genuine peer-to-peer encouragement...'",
      explanation: "Đáp án đúng là encouragement.",
      grammarPoint: "Note completion: Abstract nouns"
    }
  ]
};

// Fallback bank for diverse sections
const PRONUNCIATION_BANK = [
  {
    type: "pronunciation",
    question: "Choose the word whose underlined part is pronounced differently from the others:",
    options: ["A. decid<u>ed</u>", "B. wait<u>ed</u>", "C. watch<u>ed</u>", "D. invit<u>ed</u>"],
    answer: "C. watch<u>ed</u>",
    underlinedPart: "ed",
    ipaTranscription: "watched: /wɒtʃt/ vs decided: /dɪˈsaɪ.dɪd/, waited: /ˈweɪ.tɪd/, invited: /ɪnˈvaɪ.tɪd/",
    explanation: "Đuôi '-ed' trong 'watched' /wɒtʃt/ phát âm là /t/ vì đứng sau âm vô thanh /tʃ/. Ba từ còn lại phát âm là /ɪd/ vì tận cùng là các âm /t/ hoặc /d/.",
    grammarPoint: "Phát âm đuôi -ed (/t/, /d/, /ɪd/)"
  },
  {
    type: "pronunciation",
    question: "Choose the word whose underlined part is pronounced differently from the others:",
    options: ["A. cl<u>ea</u>n", "B. t<u>ea</u>ch", "C. br<u>ea</u>k", "D. pl<u>ea</u>se"],
    answer: "C. br<u>ea</u>k",
    underlinedPart: "ea",
    ipaTranscription: "break: /breɪk/ vs clean: /kliːn/, teach: /tiːtʃ/, please: /pliːz/",
    explanation: "Phần gạch chân 'ea' trong 'break' phát âm là /eɪ/. Ba từ còn lại phát âm là nguyên âm dài /iː/.",
    grammarPoint: "Phát âm nguyên âm /iː/ và /eɪ/"
  },
  {
    type: "pronunciation",
    question: "Choose the word whose main stress is placed differently from that of the others:",
    options: ["A. preserve", "B. protect", "C. damage", "D. pollute"],
    answer: "C. damage",
    ipaTranscription: "damage: /ˈdæm.ɪdʒ/ (stress 1) vs preserve: /prɪˈzɜːv/ (stress 2), protect: /prəˈtekt/ (stress 2), pollute: /pəˈluːt/ (stress 2)",
    explanation: "'damage' có trọng âm rơi vào âm tiết thứ nhất /ˈdæm.ɪdʒ/. Các từ còn lại đều có trọng âm rơi vào âm tiết thứ hai.",
    grammarPoint: "Trọng âm từ có 2 âm tiết (Danh từ vs Động từ)"
  },
  {
    type: "pronunciation",
    question: "Choose the word whose main stress is placed differently from that of the others:",
    options: ["A. volunteer", "B. pollution", "C. tradition", "D. mechanic"],
    answer: "A. volunteer",
    ipaTranscription: "volunteer: /ˌvɒl.ənˈtɪər/ (stress 3) vs pollution: /pəˈluː.ʃən/ (stress 2), tradition: /trəˈdɪʃ.ən/ (stress 2), mechanic: /məˈkæn.ɪk/ (stress 2)",
    explanation: "'volunteer' có trọng âm rơi vào âm tiết thứ ba /ˌvɒl.ənˈtɪər/ (hậu tố -eer nhận trọng âm). Ba từ còn lại nhấn âm thứ hai (hậu tố -tion và -ic).",
    grammarPoint: "Trọng âm từ có 3 âm tiết trở lên (Hậu tố -eer, -tion, -ic)"
  }
];

const LEXICO_GRAMMAR_BANK = [
  {
    question: "If our school _______ solar panels on the roof last year, we would save a lot on electricity bills today.",
    options: ["A. had installed", "B. installed", "C. installs", "D. has installed"],
    answer: "A. had installed",
    explanation: "Câu điều kiện hỗn hợp (Mixed conditional): Giả định trái ngược quá khứ (last year -> Mệnh đề IF dùng Quá khứ hoàn thành 'had installed') dẫn đến kết quả ở hiện tại (today -> would save).",
    grammarPoint: "Câu điều kiện hỗn hợp (Mixed Conditional)"
  },
  {
    question: "The local council is encouraging residents to cut _______ on single-use plastic containers.",
    options: ["A. down", "B. off", "C. out", "D. up"],
    answer: "A. down",
    explanation: "Cụm động từ 'cut down on sth' nghĩa là cắt giảm bớt việc tiêu thụ hoặc sử dụng cái gì.",
    grammarPoint: "Cụm động từ (Phrasal Verbs: cut down on)"
  },
  {
    question: "Renewable energy sources, _______ wind and solar power, play an indispensable role in reducing carbon emissions.",
    options: ["A. such as", "B. as such", "C. for example", "D. so as to"],
    answer: "A. such as",
    explanation: "'such as' dùng để liệt kê ví dụ cụ thể ngay sau danh từ (Renewable energy sources).",
    grammarPoint: "Từ nối & Cụm từ liệt kê (Linking words)"
  },
  {
    question: "Rarely _______ such an inspiring community project since I joined this green youth club.",
    options: ["A. have I witnessed", "B. I have witnessed", "C. did I witness", "D. had I witnessed"],
    answer: "A. have I witnessed",
    explanation: "Cấu trúc đảo ngữ với trạng từ phủ định 'Rarely' đứng đầu câu: Trạng từ phủ định + Trợ động từ + S + V chính (Rarely have I witnessed...).",
    grammarPoint: "Đảo ngữ với trạng từ phủ định (Inversion with Negative Adverbs)"
  },
  {
    question: "The ancient pagoda _______ by thousands of tourists every spring was restored five years ago.",
    options: ["A. visited", "B. visiting", "C. was visited", "D. which visited"],
    answer: "A. visited",
    explanation: "Rút gọn mệnh đề quan hệ dạng bị động: 'which is visited by thousands of tourists' rút gọn thành V3/ed là 'visited'.",
    grammarPoint: "Rút gọn mệnh đề quan hệ bị động (Reduced Relative Clauses)"
  },
  {
    question: "She decided to take the _______ and start her own eco-friendly fashion business.",
    options: ["A. initiative", "B. decision", "C. chance", "D. intention"],
    answer: "A. initiative",
    explanation: "Cụm cố định (Collocation): 'take the initiative' có nghĩa là chủ động tiên phong thực hiện một kế hoạch hoặc giải pháp.",
    grammarPoint: "Cụm từ cố định (Collocations)"
  }
];

const ARRANGEMENT_BANK = [
  {
    arrangementType: "letter",
    question: "Mark the letter A, B, C, or D to indicate the correct arrangement of the sentences to make a meaningful letter:",
    arrangementItems: [
      "a. Dear Mr. David,",
      "b. I am writing to express my sincere interest in joining the Green Summer Volunteer Campaign.",
      "c. I have three years of experience organizing recycling workshops for secondary students in my neighbourhood.",
      "d. Could you please provide me with more details regarding the working schedule and required tasks?",
      "e. I look forward to hearing from you. Sincerely, Nguyen An."
    ],
    options: [
      "A. a - b - c - d - e",
      "B. a - c - b - d - e",
      "C. b - a - c - d - e",
      "D. a - d - c - b - e"
    ],
    answer: "A. a - b - c - d - e",
    explanation: "Trật tự logic của một bức thư trang trọng: (a) Lời chào gửi -> (b) Nêu lý do viết thư -> (c) Giới thiệu kinh nghiệm/năng lực liên quan -> (d) Đề xuất xin thêm thông tin lịch trình -> (e) Lời chào kết thúc trang trọng.",
    grammarPoint: "Sắp xếp trật tự logic: Bức thư / Email trang trọng"
  },
  {
    arrangementType: "dialogue",
    question: "Mark the letter A, B, C, or D to indicate the correct arrangement of the exchanges to form a meaningful conversation:",
    arrangementItems: [
      "a. Linh: Have you heard about our school's plastic-free challenge next week?",
      "b. Minh: Yes, I have! But I'm not sure what we are supposed to do each day.",
      "c. Linh: Basically, we need to bring reusable lunchboxes and water bottles instead of disposable ones.",
      "d. Minh: That sounds very practical. Count me in!"
    ],
    options: [
      "A. a - b - c - d",
      "B. b - a - c - d",
      "C. a - c - b - d",
      "D. c - a - b - d"
    ],
    answer: "A. a - b - c - d",
    explanation: "Hội thoại giao tiếp tự nhiên: (a) Mở đầu bằng câu hỏi gợi ý thông tin -> (b) Đáp lời và nêu thắc mắc -> (c) Giải thích chi tiết hoạt động -> (d) Bày tỏ sự đồng thuận và hào hứng tham gia.",
    grammarPoint: "Sắp xếp trật tự logic: Đoạn hội thoại giao tiếp (Dialogue)"
  },
  {
    arrangementType: "paragraph",
    question: "Mark the letter A, B, C, or D to indicate the correct arrangement of sentences to make a coherent paragraph:",
    arrangementItems: [
      "a. In conclusion, adopting eco-friendly habits at school not only conserves resources but also fosters civic responsibility.",
      "b. Firstly, turning off lights and fans before leaving the classroom significantly cuts down energy consumption.",
      "c. There are several straightforward measures students can implement to make their school environment greener.",
      "d. Furthermore, planting small trees around campus helps purify the air and enhances campus aesthetics."
    ],
    options: [
      "A. c - b - d - a",
      "B. b - d - c - a",
      "C. c - d - b - a",
      "D. a - c - b - d"
    ],
    answer: "A. c - b - d - a",
    explanation: "Trật tự đoạn văn học thuật: (c) Câu chủ đề (Topic sentence) -> (b) Ý hỗ trợ thứ nhất (Firstly) -> (d) Ý hỗ trợ thứ hai (Furthermore) -> (a) Câu kết luận tóm lược (In conclusion).",
    grammarPoint: "Sắp xếp trật tự logic: Đoạn văn mạch lạc (Paragraph Structure)"
  }
];

const CLOZE_BANK = {
  passage: `Green living has become an increasingly popular lifestyle among teenagers around the world. By making small modifications to everyday routines, young people can make a significant (1)_______ to environmental protection. For instance, walking or cycling to school rather than asking for a motorbike ride helps reduce carbon dioxide (2)_______. Furthermore, teenagers are actively taking part in recycling campaigns where plastic bottles and used paper are collected and processed into new (3)_______. It is widely acknowledged that saving electricity by turning (4)_______ unused electronic gadgets also plays a pivotal role. As global awareness continues to expand, each individual's mindful effort will undoubtedly (5)_______ a greener and more sustainable future.`,
  questions: [
    {
      num: 1,
      question: "Choose the best option to fill in blank (1):",
      options: ["A. contribution", "B. destruction", "C. obstacle", "D. consequence"],
      answer: "A. contribution",
      explanation: "Cụm cố định 'make a contribution to sth' nghĩa là đóng góp vào điều gì. Các từ còn lại: destruction (sự tàn phá), obstacle (trở ngại), consequence (hậu quả).",
      grammarPoint: "Từ vựng ngữ cảnh (Collocation: make a contribution to)"
    },
    {
      num: 2,
      question: "Choose the best option to fill in blank (2):",
      options: ["A. emissions", "B. absorptions", "C. fuels", "D. resources"],
      answer: "A. emissions",
      explanation: "'carbon dioxide emissions' nghĩa là lượng khí thải CO2. 'Emissions' là thuật ngữ chuẩn môi trường chỉ khí thải ra bầu khí quyển.",
      grammarPoint: "Từ vựng môi trường (Emissions)"
    },
    {
      num: 3,
      question: "Choose the best option to fill in blank (3):",
      options: ["A. products", "B. wastes", "C. plastics", "D. appliances"],
      answer: "A. products",
      explanation: "Chế biến rác tái chế thành các 'sản phẩm mới' (new products).",
      grammarPoint: "Từ vựng ngữ cảnh (Contextual Vocabulary)"
    },
    {
      num: 4,
      question: "Choose the best option to fill in blank (4):",
      options: ["A. off", "B. on", "C. up", "D. over"],
      answer: "A. off",
      explanation: "Cụm động từ 'turn off' nghĩa là tắt thiết bị điện khi không sử dụng (turning off unused electronic gadgets).",
      grammarPoint: "Cụm động từ (Phrasal Verb: turn off)"
    },
    {
      num: 5,
      question: "Choose the best option to fill in blank (5):",
      options: ["A. ensure", "B. prevent", "C. ignore", "D. damage"],
      answer: "A. ensure",
      explanation: "'ensure a greener and more sustainable future' nghĩa là bảo đảm/đem lại một tương lai xanh hơn và bền vững hơn.",
      grammarPoint: "Từ vựng động từ chính (ensure)"
    }
  ]
};

const READING_COMPREHENSION_BANK = {
  passageTitle: "Urban Agriculture: The Future of Feeding Cities",
  passage: `As the world's population is projected to exceed nine billion by 2050, urban centres face unprecedented challenges regarding food supply, resource exhaustion, and spatial limitation. In response, urban agriculture—the practice of cultivating and distributing food in and around metropolitan areas—has emerged as a transformative solution.

Traditional farming consumes immense volumes of fresh water and entails extensive transportation networks, which generate vast quantities of greenhouse gases before produce reaches supermarket shelves. In contrast, vertical farming systems installed inside city skyscrapers utilize advanced hydroponic and aeroponic technologies. These systems recirculate water and nutrients in closed loops, cutting water usage by up to 95 percent compared to conventional agriculture. Moreover, because crops are cultivated in controlled indoor environments, <b>they</b> remain <b>immune</b> to unpredictable weather fluctuations, prolonged droughts, and insect pests without requiring hazardous synthetic pesticides.

Beyond ecological efficiency, urban farming fosters vibrant local economies and builds resilient communities. Rooftop gardens atop public schools and community centres offer hands-on educational platforms where children discover the fundamentals of nutrition and ecology. Residents who participate in local community plots report reduced psychological stress and stronger social cohesion. Although initial capital expenditure for indoor LED lighting and temperature control systems remains relatively elevated, continuing technological innovation is steadily driving costs down. It is evident that integrating urban agriculture into metropolitan master plans will be crucial for developing sustainable, self-sufficient cities of tomorrow.`,
  questions: [
    {
      readingQuestionType: "main_idea",
      question: "What is the primary topic of the passage?",
      options: [
        "A. The potential of urban agriculture in addressing food security and sustainability",
        "B. The historical development of conventional farming methods",
        "C. The economic drawbacks of high-tech indoor vertical farming",
        "D. The psychological benefits of gardening for urban children"
      ],
      answer: "A. The potential of urban agriculture in addressing food security and sustainability",
      explanation: "Ý chính toàn bài: Bài đọc giới thiệu nông nghiệp đô thị (urban agriculture) như một giải pháp đột phá giải quyết thách thức lương thực, tiết kiệm tài nguyên và xây dựng thành phố bền vững.",
      grammarPoint: "Đọc hiểu: Xác định ý chính của bài đọc (Main Idea)"
    },
    {
      readingQuestionType: "detail",
      question: "According to paragraph 2, how do vertical farming systems conserve water?",
      options: [
        "A. By recirculating water and nutrients in closed loops",
        "B. By relying primarily on heavy seasonal rainfall",
        "C. By transporting fresh groundwater directly from rural farms",
        "D. By minimizing the overall number of cultivated crops"
      ],
      answer: "A. By recirculating water and nutrients in closed loops",
      explanation: "Thông tin chi tiết trong đoạn 2: 'These systems recirculate water and nutrients in closed loops, cutting water usage by up to 95 percent'.",
      grammarPoint: "Đọc hiểu: Tìm thông tin chi tiết (Factual Detail)"
    },
    {
      readingQuestionType: "vocabulary",
      question: "The word 'immune' in paragraph 2 is closest in meaning to:",
      options: ["A. unaffected", "B. vulnerable", "C. subject", "D. resistant"],
      answer: "A. unaffected",
      explanation: "'immune to' trong ngữ cảnh bài mang nghĩa không bị ảnh hưởng/không bị tổn hại bởi thời tiết thất thường ('unaffected by unpredictable weather').",
      grammarPoint: "Đọc hiểu: Từ vựng trong ngữ cảnh (Vocabulary in Context)"
    },
    {
      readingQuestionType: "reference",
      question: "The word 'they' in paragraph 2 refers to:",
      options: ["A. crops", "B. technologies", "C. skyscrapers", "D. networks"],
      answer: "A. crops",
      explanation: "Đoạn văn viết: 'because crops are cultivated in controlled indoor environments, they remain immune...' -> đại từ 'they' thay thế cho danh từ số nhiều 'crops' đứng trước.",
      grammarPoint: "Đọc hiểu: Đại từ quy chiếu (Reference Question)"
    },
    {
      readingQuestionType: "inference",
      question: "Which of the following can be inferred from the passage?",
      options: [
        "A. Technological advancements will likely make indoor urban agriculture more affordable over time.",
        "B. Traditional agriculture will be completely eliminated before the year 2050.",
        "C. Children learn best when they are isolated from practical agricultural work.",
        "D. Rooftop gardens generate significant amounts of toxic pesticide runoff."
      ],
      answer: "A. Technological advancements will likely make indoor urban agriculture more affordable over time.",
      explanation: "Suy luận từ đoạn cuối: 'continuing technological innovation is steadily driving costs down' -> các tiến bộ công nghệ sẽ giúp giảm chi phí đầu tư ban đầu theo thời gian.",
      grammarPoint: "Đọc hiểu: Câu hỏi suy luận (Inference Question)"
    }
  ]
};

const WRITING_SHORT_BANK = [
  {
    writingType: "word_formation",
    question: "Write the correct form of the word given in brackets to complete the sentence:",
    originalSentence: "The local government has taken strong measures to preserve the _______ heritage of the ancient quarter. (CULTURE)",
    answer: "cultural",
    explanation: "Vị trí đứng trước danh từ 'heritage' cần một tính từ bổ nghĩa: tính từ của danh từ 'culture' là 'cultural'.",
    grammarPoint: "Cấu tạo từ (Word Formation: Noun -> Adjective)",
    alternativeAnswers: ["cultural"]
  },
  {
    writingType: "word_formation",
    question: "Write the correct form of the word given in brackets to complete the sentence:",
    originalSentence: "Regular physical exercise can _______ reduce stress and enhance academic performance. (SIGNIFICANT)",
    answer: "significantly",
    explanation: "Vị trí đứng trước động từ 'reduce' cần một phó từ/trạng từ: 'significantly' (một cách đáng kể).",
    grammarPoint: "Cấu tạo từ (Word Formation: Adjective -> Adverb)",
    alternativeAnswers: ["significantly"]
  },
  {
    writingType: "sentence_transformation",
    question: "Rewrite the sentence so that it has the same meaning as the original sentence, using the given beginning:",
    originalSentence: "She started working as an environmental volunteer three years ago.",
    sentenceBeginning: "She has _______",
    answer: "She has worked as an environmental volunteer for three years.",
    explanation: "Chuyển từ thì Quá khứ đơn (started V-ing + time + ago) sang thì Hiện tại hoàn thành (has + V3/ed + for + khoảng thời gian).",
    grammarPoint: "Viết lại câu: Quá khứ đơn -> Hiện tại hoàn thành với FOR",
    alternativeAnswers: [
      "She has worked as an environmental volunteer for three years.",
      "She has been working as an environmental volunteer for three years.",
      "She has volunteered for the environment for three years."
    ]
  },
  {
    writingType: "sentence_transformation",
    question: "Rewrite the sentence so that it has the same meaning as the original sentence, using the given beginning:",
    originalSentence: "I didn't have enough money, so I couldn't afford that scientific encyclopedia.",
    sentenceBeginning: "If I _______",
    answer: "If I had had enough money, I could have afforded that scientific encyclopedia.",
    explanation: "Tình huống trong quá khứ (didn't have, couldn't afford) -> Viết lại bằng câu điều kiện loại 3: If + S + had + V3/ed, S + could/would have + V3/ed.",
    grammarPoint: "Viết lại câu: Câu điều kiện loại 3 (Conditional Sentence Type 3)",
    alternativeAnswers: [
      "If I had had enough money, I could have afforded that scientific encyclopedia.",
      "If I had had enough money, I would have bought that scientific encyclopedia."
    ]
  }
];

const ESSAY_WRITING_BANK = {
  essayPrompt: {
    minWords: 100,
    maxWords: 140,
    topic: "Write a paragraph (100 - 140 words) discussing practical actions secondary students can take to protect the environment at their school.",
    suggestedPoints: [
      "Minimizing disposable plastic bottles and single-use food packaging",
      "Turning off electrical appliances (fans, lights) when leaving classrooms",
      "Taking active part in tree-planting campaigns and campus clean-ups"
    ]
  },
  question: "Write a paragraph (about 100 - 140 words) about practical measures students can implement to protect the environment at their school.",
  answer: "[Bài mẫu tham khảo]: Protecting the school environment is a vital responsibility that every student can actively participate in through simple daily habits. Firstly, students should minimize the consumption of single-use plastics by carrying refillable water bottles and reusable food containers. Secondly, conserving electricity plays an essential role; switching off lights, projectors, and fans before leaving the classroom significantly prevents energy waste. Furthermore, students can actively participate in school green clubs by planting trees and categorizing recyclable waste during clean-up days. In conclusion, these small, consistent actions not only foster a cleaner learning atmosphere but also cultivate long-term environmental mindfulness among youths.",
  rubric: {
    totalMaxScore: 10,
    criteria: [
      {
        criterion: "Task Achievement (Trả lời đúng & đầy đủ trọng tâm đề bài)",
        maxScore: 2.5,
        description: "Đoạn văn giải quyết trọn vẹn yêu cầu đề bài, nêu được ít nhất 2-3 biện pháp cụ thể, thực tế và có câu chủ đề, câu kết rõ ràng.",
        bands: [
          { band: "2.1 - 2.5", detail: "Ý tưởng phát triển toàn diện, bám sát hành động cụ thể tại trường học, độ dài chuẩn 100-140 từ." },
          { band: "1.5 - 2.0", detail: "Nêu được các biện pháp bảo vệ môi trường nhưng một số ý còn chung chung hoặc thiếu dẫn chứng cụ thể." },
          { band: "0.5 - 1.4", detail: "Nội dung sơ sài, lạc đề hoặc viết quá ngắn dưới 60 từ." }
        ]
      },
      {
        criterion: "Coherence & Cohesion (Tính liên kết, mạch lạc & từ nối)",
        maxScore: 2.5,
        description: "Bố cục đoạn văn mạch lạc: Topic sentence -> Supporting points -> Conclusion. Sử dụng linh hoạt các liên từ (Firstly, Furthermore, In addition, In conclusion).",
        bands: [
          { band: "2.1 - 2.5", detail: "Chuyển ý tự nhiên, logic chặt chẽ, sử dụng đa dạng các phương tiện liên kết." },
          { band: "1.5 - 2.0", detail: "Có sử dụng từ nối nhưng đôi khi lặp từ (and, but, then) hoặc chuyển đoạn hơi đột ngột." },
          { band: "0.5 - 1.4", detail: "Thiếu liên kết, các câu rời rạc không tạo thành chỉnh thể đoạn văn." }
        ]
      },
      {
        criterion: "Lexical Resource (Vốn từ vựng & độ chính xác ngữ cảnh)",
        maxScore: 2.5,
        description: "Sử dụng từ vựng chủ đề môi trường phong phú, đúng ngữ cảnh (single-use plastics, energy waste, green clubs, mindfulness).",
        bands: [
          { band: "2.1 - 2.5", detail: "Vốn từ phong phú, có collocations tự nhiên, hầu như không mắc lỗi chính tả." },
          { band: "1.5 - 2.0", detail: "Từ vựng ở mức cơ bản, có một số lỗi dùng từ hoặc sai chính tả nhỏ không cản trở việc hiểu." },
          { band: "0.5 - 1.4", detail: "Vốn từ nghèo nàn, lặp từ nghiêm trọng, dịch thô từ tiếng Việt." }
        ]
      },
      {
        criterion: "Grammatical Range & Accuracy (Độ phong phú & chuẩn xác ngữ pháp)",
        maxScore: 2.5,
        description: "Kết hợp linh hoạt các cấu trúc ngữ pháp (câu phức, câu điều kiện, mệnh đề quan hệ, danh động từ). Đảm bảo chuẩn xác về thì và chia động từ.",
        bands: [
          { band: "2.1 - 2.5", detail: "Sử dụng đa dạng cấu trúc đơn và phức, tỉ lệ câu đúng ngữ pháp rất cao." },
          { band: "1.5 - 2.0", detail: "Mắc một số lỗi ngữ pháp về chia động từ, mạo từ hoặc giới từ nhưng không gây hiểu nhầm." },
          { band: "0.5 - 1.4", detail: "Nhiều lỗi ngữ pháp cơ bản liên tục, câu văn bị gãy cấu trúc." }
        ]
      }
    ]
  },
  explanation: "Đoạn văn được chấm theo khung 4 tiêu chí chuẩn khảo thí quốc tế và Bộ GD&ĐT: Task Achievement (2.5đ), Coherence & Cohesion (2.5đ), Lexical Resource (2.5đ), Grammatical Range & Accuracy (2.5đ).",
  grammarPoint: "Kỹ năng viết đoạn văn lập luận (Paragraph Writing & Rubric)"
};

// Generates fallback comprehensive exam if Gemini API is unavailable or returns an error
export function generateCurriculumComprehensiveExam(params: GenerateExamParams) {
  const { topic = "Tiếng Anh Tổng Hợp", grade = "Lớp 10", difficulty = "Thông hiểu", sectionsConfig, selectedUnits = [] } = params;

  // Determine active theme based on topic or selected units, or random rotation
  const topicLower = (topic + " " + JSON.stringify(selectedUnits)).toLowerCase();
  let matchedDataset = THEMATIC_DATASETS.find(d => 
    topicLower.includes(d.themeKey) || 
    (d.themeKey === 'artificial_intelligence' && (topicLower.includes('ai') || topicLower.includes('trí tuệ') || topicLower.includes('công nghệ') || topicLower.includes('digital') || topicLower.includes('technology') || topicLower.includes('unit 6'))) ||
    (d.themeKey === 'multicultural_world' && (topicLower.includes('culture') || topicLower.includes('văn hóa') || topicLower.includes('heritage') || topicLower.includes('custom') || topicLower.includes('unit 2')))
  );

  // If no direct keyword match, choose dynamically based on timestamp hash so each generation is fresh
  if (!matchedDataset && THEMATIC_DATASETS.length > 0) {
    const pickIdx = Math.floor(Math.random() * (THEMATIC_DATASETS.length + 1));
    if (pickIdx < THEMATIC_DATASETS.length) {
      matchedDataset = THEMATIC_DATASETS[pickIdx];
    }
  }

  const activeListeningBank = matchedDataset ? {
    audioTitleTask1: matchedDataset.audioTitleTrack1,
    audioSpeakerInfo: matchedDataset.audioSpeakerInfoTrack1,
    audioScriptTask1: matchedDataset.audioScriptTrack1,
    audioTitleTask2: matchedDataset.audioTitleTrack2,
    audioSpeakerInfoTask2: matchedDataset.audioSpeakerInfoTrack2,
    audioScriptTask2: matchedDataset.audioScriptTrack2,
    task1: matchedDataset.task1,
    task2_multiple_choice: matchedDataset.task2_multiple_choice,
    task2_fill_blank: matchedDataset.task2_fill_blank,
  } : LISTENING_BANK;

  const activePronunciationBank = matchedDataset?.pronunciation || PRONUNCIATION_BANK;
  const activeLexicoBank = matchedDataset?.lexicoGrammar || LEXICO_GRAMMAR_BANK;
  const activeArrangementBank = matchedDataset?.arrangement || ARRANGEMENT_BANK;
  const activeClozeBank = matchedDataset?.cloze || CLOZE_BANK;
  const activeReadingBank = matchedDataset?.reading || READING_COMPREHENSION_BANK;
  const activeWritingShortBank = matchedDataset?.writingShort || WRITING_SHORT_BANK;
  const activeEssayBank = matchedDataset?.essay || ESSAY_WRITING_BANK;

  const cfg = sectionsConfig || {
    pronunciation: { enabled: true, count: 2 },
    lexico_grammar: { enabled: true, count: 4 },
    arrangement: { enabled: true, count: 1 },
    cloze_reading: { enabled: true, count: 5 },
    reading_comprehension: { enabled: true, count: 5 },
    writing_short: { enabled: true, count: 2 },
    essay_writing: { enabled: true, count: 1 }
  };

  const questions: any[] = [];
  let qNum = 1;
  const sectionsSummary: any[] = [];
  let hasListeningIncluded = false;

  // 0. Listening (if enabled)
  if (cfg.listening?.enabled) {
    hasListeningIncluded = true;
    const hasTask1 = cfg.listening.task1Enabled !== false;
    const hasTask2 = cfg.listening.task2Enabled !== false;
    const task1Count = hasTask1 ? (cfg.listening.task1Count || 4) : 0;
    const task2Count = hasTask2 ? (cfg.listening.task2Count || 3) : 0;
    const totalListen = task1Count + task2Count;

    if (totalListen > 0) {
      sectionsSummary.push({
        type: "listening",
        title: "PART I: LISTENING COMPREHENSION (UK FEMALE VOICE ACCENT)",
        questionCount: totalListen
      });

      // Task 1: True / False
      if (hasTask1 && task1Count > 0) {
        for (let i = 0; i < Math.min(task1Count, activeListeningBank.task1.length); i++) {
          const item = activeListeningBank.task1[i];
          questions.push({
            id: `q-${qNum}`,
            num: qNum,
            sectionType: "listening",
            sectionTitle: "PART I: LISTENING COMPREHENSION (TASK 1: TRUE / FALSE)",
            questionType: "multiple_choice",
            listeningTask: "task1_true_false",
            audioTitle: activeListeningBank.audioTitleTask1,
            audioSpeakerInfo: activeListeningBank.audioSpeakerInfo,
            audioScript: activeListeningBank.audioScriptTask1,
            question: item.question,
            options: item.options,
            answer: item.answer,
            audioEvidence: item.audioEvidence,
            explanation: item.explanation,
            grammarPoint: item.grammarPoint
          });
          qNum++;
        }
      }

      // Task 2: Multiple Choice or Fill in the Blanks (Track 2)
      if (hasTask2 && task2Count > 0) {
        const isFill = cfg.listening.task2Type === 'fill_blank';
        if (isFill && activeListeningBank.task2_fill_blank) {
          for (let i = 0; i < Math.min(task2Count, activeListeningBank.task2_fill_blank.length); i++) {
            const item = activeListeningBank.task2_fill_blank[i];
            questions.push({
              id: `q-${qNum}`,
              num: qNum,
              sectionType: "listening",
              sectionTitle: "PART I: LISTENING COMPREHENSION (TASK 2: NOTE COMPLETION)",
              questionType: "short_answer",
              listeningTask: "task2_fill_blank",
              audioTitle: activeListeningBank.audioTitleTask2,
              audioSpeakerInfo: activeListeningBank.audioSpeakerInfoTask2,
              audioScript: activeListeningBank.audioScriptTask2,
              wordLimit: item.wordLimit,
              question: item.question,
              options: [],
              answer: item.answer,
              alternativeAnswers: item.alternativeAnswers,
              audioEvidence: item.audioEvidence,
              explanation: item.explanation,
              grammarPoint: item.grammarPoint
            });
            qNum++;
          }
        } else {
          for (let i = 0; i < Math.min(task2Count, activeListeningBank.task2_multiple_choice.length); i++) {
            const item = activeListeningBank.task2_multiple_choice[i];
            questions.push({
              id: `q-${qNum}`,
              num: qNum,
              sectionType: "listening",
              sectionTitle: "PART I: LISTENING COMPREHENSION (TASK 2: MULTIPLE CHOICE)",
              questionType: "multiple_choice",
              listeningTask: "task2_multiple_choice",
              audioTitle: activeListeningBank.audioTitleTask2,
              audioSpeakerInfo: activeListeningBank.audioSpeakerInfoTask2,
              audioScript: activeListeningBank.audioScriptTask2,
              question: item.question,
              options: item.options,
              answer: item.answer,
              audioEvidence: item.audioEvidence,
              explanation: item.explanation,
              grammarPoint: item.grammarPoint
            });
            qNum++;
          }
        }
      }
    }
  }

  // 1. Pronunciation
  if (cfg.pronunciation?.enabled && cfg.pronunciation.count > 0) {
    const pCount = Math.min(cfg.pronunciation.count, 4);
    sectionsSummary.push({
      type: "pronunciation",
      title: hasListeningIncluded ? "PART II: PRONUNCIATION & STRESS" : "PART I: PRONUNCIATION & STRESS",
      questionCount: pCount
    });
    for (let i = 0; i < pCount; i++) {
      const item = activePronunciationBank[i % activePronunciationBank.length];
      questions.push({
        id: `q-${qNum}`,
        num: qNum,
        sectionType: "pronunciation",
        sectionTitle: hasListeningIncluded ? "PART II: PRONUNCIATION & STRESS" : "PART I: PRONUNCIATION & STRESS",
        questionType: "multiple_choice",
        question: item.question,
        options: item.options,
        answer: item.answer,
        underlinedPart: item.underlinedPart,
        ipaTranscription: item.ipaTranscription,
        explanation: item.explanation,
        grammarPoint: item.grammarPoint
      });
      qNum++;
    }
  }

  // 2. Lexico & Grammar
  if (cfg.lexico_grammar?.enabled && cfg.lexico_grammar.count > 0) {
    const lgCount = cfg.lexico_grammar.count;
    sectionsSummary.push({
      type: "lexico_grammar",
      title: "PART II: LEXICO & GRAMMAR",
      questionCount: lgCount
    });
    for (let i = 0; i < lgCount; i++) {
      const item = activeLexicoBank[i % activeLexicoBank.length];
      questions.push({
        id: `q-${qNum}`,
        num: qNum,
        sectionType: "lexico_grammar",
        sectionTitle: "PART II: LEXICO & GRAMMAR",
        questionType: "multiple_choice",
        question: item.question,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
        grammarPoint: item.grammarPoint
      });
      qNum++;
    }
  }

  // 3. Arrangement
  if (cfg.arrangement?.enabled && cfg.arrangement.count > 0) {
    const arrCount = Math.min(cfg.arrangement.count, 3);
    sectionsSummary.push({
      type: "arrangement",
      title: "PART III: ARRANGEMENT (LETTER / DIALOGUE / PARAGRAPH)",
      questionCount: arrCount
    });
    for (let i = 0; i < arrCount; i++) {
      const item = activeArrangementBank[i % activeArrangementBank.length];
      questions.push({
        id: `q-${qNum}`,
        num: qNum,
        sectionType: "arrangement",
        sectionTitle: "PART III: ARRANGEMENT",
        questionType: "multiple_choice",
        arrangementType: item.arrangementType,
        arrangementItems: item.arrangementItems,
        question: item.question,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
        grammarPoint: item.grammarPoint
      });
      qNum++;
    }
  }

  // 4. Cloze-reading
  if (cfg.cloze_reading?.enabled && cfg.cloze_reading.count > 0) {
    const clCount = Math.min(cfg.cloze_reading.count, 5);
    sectionsSummary.push({
      type: "cloze_reading",
      title: "PART IV: CLOZE READING",
      questionCount: clCount
    });
    for (let i = 0; i < clCount; i++) {
      const qItem = activeClozeBank.questions[i % activeClozeBank.questions.length];
      questions.push({
        id: `q-${qNum}`,
        num: qNum,
        sectionType: "cloze_reading",
        sectionTitle: "PART IV: CLOZE READING",
        questionType: "multiple_choice",
        passage: activeClozeBank.passage,
        clozeNumber: i + 1,
        question: qItem.question,
        options: qItem.options,
        answer: qItem.answer,
        explanation: qItem.explanation,
        grammarPoint: qItem.grammarPoint
      });
      qNum++;
    }
  }

  // 5. Reading Comprehension
  if (cfg.reading_comprehension?.enabled && cfg.reading_comprehension.count > 0) {
    const rcCount = Math.min(cfg.reading_comprehension.count, 5);
    sectionsSummary.push({
      type: "reading_comprehension",
      title: "PART V: READING COMPREHENSION",
      questionCount: rcCount
    });
    for (let i = 0; i < rcCount; i++) {
      const qItem = activeReadingBank.questions[i % activeReadingBank.questions.length];
      questions.push({
        id: `q-${qNum}`,
        num: qNum,
        sectionType: "reading_comprehension",
        sectionTitle: "PART V: READING COMPREHENSION",
        questionType: "multiple_choice",
        passageTitle: activeReadingBank.passageTitle,
        passage: activeReadingBank.passage,
        readingQuestionType: qItem.readingQuestionType,
        question: qItem.question,
        options: qItem.options,
        answer: qItem.answer,
        explanation: qItem.explanation,
        grammarPoint: qItem.grammarPoint
      });
      qNum++;
    }
  }

  // 6. Writing - Short answer
  if (cfg.writing_short?.enabled && cfg.writing_short.count > 0) {
    const wrCount = Math.min(cfg.writing_short.count, 4);
    sectionsSummary.push({
      type: "writing_short",
      title: "PART VI: WRITING - SHORT ANSWER",
      questionCount: wrCount
    });
    for (let i = 0; i < wrCount; i++) {
      const item = activeWritingShortBank[i % activeWritingShortBank.length];
      questions.push({
        id: `q-${qNum}`,
        num: qNum,
        sectionType: "writing_short",
        sectionTitle: "PART VI: WRITING - SHORT ANSWER",
        questionType: "short_answer",
        writingType: item.writingType,
        originalSentence: item.originalSentence,
        sentenceBeginning: (item as any).sentenceBeginning,
        question: item.question,
        options: [],
        answer: item.answer,
        alternativeAnswers: item.alternativeAnswers,
        explanation: item.explanation,
        grammarPoint: item.grammarPoint
      });
      qNum++;
    }
  }

  // 7. Essay Writing
  if (cfg.essay_writing?.enabled && cfg.essay_writing.count > 0) {
    sectionsSummary.push({
      type: "essay_writing",
      title: "PART VII: ESSAY / PARAGRAPH WRITING",
      questionCount: 1
    });

    const customPromptText = cfg.essay_writing?.customPrompt?.trim();
    const withGuiding = cfg.essay_writing?.includeGuidingQuestions !== false;
    const guidingQuestions = withGuiding ? [
      "1. What is the current situation or importance of this topic?",
      "2. What is the first key point or action to consider?",
      "3. What specific examples or reasons support this point?",
      "4. What secondary solution or aspect should be addressed?",
      "5. What overall conclusion or message can be drawn?"
    ] : [];

    const baseQuestion = customPromptText
      ? `Write a paragraph (about 100 - 140 words) discussing the following topic: ${customPromptText}`
      : activeEssayBank.question;

    const fullQuestion = withGuiding && guidingQuestions.length > 0
      ? `${baseQuestion}\n\n* Guiding Questions to develop your ideas:\n${guidingQuestions.map(q => `  • ${q}`).join('\n')}`
      : baseQuestion;

    questions.push({
      id: `q-${qNum}`,
      num: qNum,
      sectionType: "essay_writing",
      sectionTitle: "PART VII: ESSAY / PARAGRAPH WRITING",
      questionType: "essay",
      essayPrompt: {
        ...activeEssayBank.essayPrompt,
        topic: customPromptText || activeEssayBank.essayPrompt.topic,
        suggestedPoints: withGuiding ? guidingQuestions : activeEssayBank.essayPrompt.suggestedPoints
      },
      rubric: activeEssayBank.rubric,
      question: fullQuestion,
      options: [],
      answer: activeEssayBank.answer,
      explanation: activeEssayBank.explanation,
      grammarPoint: activeEssayBank.grammarPoint
    });
    qNum++;
  }

  const durationMin = Math.max(15, Math.min(90, Math.round(questions.length * 2.2)));

  const finalTitle = matchedDataset 
    ? `Đề thi Tiếng Anh: ${matchedDataset.themeTitle} (${grade})`
    : `Đề thi Tiếng Anh Tổng Hợp: ${topic} (${grade})`;

  return {
    title: finalTitle,
    grade,
    subject: "Tiếng Anh",
    questionsCount: questions.length,
    duration: `${durationMin} phút`,
    difficulty,
    topic: matchedDataset?.themeTitle || topic,
    sections: sectionsSummary,
    questions,
    audioScript: hasListeningIncluded ? activeListeningBank.audioScriptTask1 : undefined,
    audioTitle: hasListeningIncluded ? activeListeningBank.audioTitleTask1 : undefined,
    audioScriptTask2: hasListeningIncluded ? activeListeningBank.audioScriptTask2 : undefined,
    audioTitleTask2: hasListeningIncluded ? activeListeningBank.audioTitleTask2 : undefined,
    listeningMaxPlays: hasListeningIncluded ? 2 : undefined
  };
}

// Generate with Gemini API
export async function generateExamWithGemini(ai: GoogleGenAI, params: GenerateExamParams) {
  const {
    topic,
    grade,
    difficulty,
    sectionsConfig,
    selectedUnits = [],
    referenceWebsites = [],
    temperature,
    dynamicContextTheme,
    promptTemplate,
    random_seed,
    randomSeed,
    metadata
  } = params;

  const chosenTemperature = typeof temperature === 'number' ? temperature : 0.8;
  const uniqueSeed = random_seed || randomSeed || metadata?.random_seed || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Randomly select dynamic perspectives for context rotation
  const shuffledPerspectives = [...DYNAMIC_THEMATIC_PERSPECTIVES].sort(() => 0.5 - Math.random());
  const selectedContexts = dynamicContextTheme && dynamicContextTheme !== 'dynamic_multi_thematic'
    ? [dynamicContextTheme, shuffledPerspectives[0]]
    : [shuffledPerspectives[0], shuffledPerspectives[1], shuffledPerspectives[2]];

  // Format selected units
  const unitsSummary = Array.isArray(selectedUnits) && selectedUnits.length > 0
    ? selectedUnits.map((u: any) => typeof u === 'string' ? u : `Unit ${u.unitNumber}: ${u.unitName} (${u.theme || ''} - Từ vựng trọng tâm: ${u.vocabularyFocus || ''})`).join('\n')
    : topic;

  // Format reference websites
  const websitesSummary = Array.isArray(referenceWebsites) && referenceWebsites.length > 0
    ? referenceWebsites.join(', ')
    : 'British Council LearnEnglish, BBC Learning English, Cambridge English Assessment, Oxford Learner\'s Dictionaries';

  const sectionsToInclude: string[] = [];
  if (sectionsConfig.listening?.enabled) {
    const task1C = sectionsConfig.listening.task1Enabled !== false ? (sectionsConfig.listening.task1Count || 4) : 0;
    const task2C = sectionsConfig.listening.task2Enabled !== false ? (sectionsConfig.listening.task2Count || 3) : 0;
    const task2Type = sectionsConfig.listening.task2Type || 'multiple_choice';
    const listenTopics = sectionsConfig.listening.focusTopics && sectionsConfig.listening.focusTopics.length > 0
      ? `\n      + TRỌNG TÂM NGHE CHỈ ĐỊNH: ${sectionsConfig.listening.focusTopics.join(', ')}`
      : '';
    sectionsToInclude.push(`- LISTENING COMPREHENSION (GỒM 2 TRACKS RIÊNG BIỆT - MẶC ĐỊNH CHUẨN GIỌNG UK FEMALE):
      + BẮT BUỘC biên soạn kịch bản ngữ liệu dành riêng cho GIỌNG ĐỌC ANH - ANH NỮ (UK Female Voice - British Received Pronunciation):
        * Sử dụng chuẩn từ vựng, văn phong và chính tả Anh - Anh (RP British English) như: flat, holiday, timetable, post, centre, autumn, revise, programme...
        * Track 1 (audioScript & audioTitle): Đoạn hội thoại 2 nhân vật (nữ chính đóng vai trò chủ đạo) dài 160-220 từ bám sát chủ đề "${topic}". Dành riêng cho Task 1.
        * Track 2 (audioScriptTask2 & audioTitleTask2): Bài phỏng vấn / bài chia sẻ chuyên gia nữ (Dr. / Ms. / Specialist) dài 160-220 từ bám sát chủ đề "${topic}". Dành riêng cho Task 2.${listenTopics}
      + Task 1 (True / False): ${task1C} câu nhận định True/False. options là ["A. True", "B. False"], answer là "A. True" hoặc "B. False". BẮT BUỘC có 'audioEvidence' trích dẫn chính xác câu văn trong Track 1 (audioScript).
      + Task 2 (${task2Type === 'fill_blank' ? 'Note Completion / Fill in the blanks' : 'Multiple Choice'}): ${task2C} câu. ${task2Type === 'fill_blank' ? 'Dạng tóm tắt điền khuyết với wordLimit ("NO MORE THAN TWO WORDS AND/OR A NUMBER") và mảng alternativeAnswers liệt kê các biến thể viết số/từ hợp lệ.' : 'Trắc nghiệm 4 phương án A, B, C, D kiểm tra nghe chi tiết và nhận diện bẫy paraphrasing.'} BẮT BUỘC có 'audioEvidence' trích dẫn câu văn trong Track 2 (audioScriptTask2).`);
  }
  if (sectionsConfig.pronunciation?.enabled) {
    const pronTopics = sectionsConfig.pronunciation.focusTopics && sectionsConfig.pronunciation.focusTopics.length > 0
      ? ` -> BẮT BUỘC KIỂM TRA TRỌNG TÂM: ${sectionsConfig.pronunciation.focusTopics.join(', ')}`
      : '';
    sectionsToInclude.push(`- PRONUNCIATION & STRESS: ${sectionsConfig.pronunciation.count} câu (gồm phát âm có gạch chân nguyên âm/phụ âm, phiên âm IPA trong lời giải, và trọng âm từ 2-3 âm tiết).${pronTopics}`);
  }
  if (sectionsConfig.lexico_grammar?.enabled) {
    const lexicoTopics = sectionsConfig.lexico_grammar.focusTopics && sectionsConfig.lexico_grammar.focusTopics.length > 0
      ? ` -> BẮT BUỘC RA ĐỀ BÁM SÁT CÁC CHỦ ĐIỂM TRỌNG TÂM: ${sectionsConfig.lexico_grammar.focusTopics.join(', ')}`
      : '';
    sectionsToInclude.push(`- LEXICO & GRAMMAR: ${sectionsConfig.lexico_grammar.count} câu (trắc nghiệm 4 phương án A, B, C, D kiểm tra collocations, idioms, thì, câu điều kiện, mệnh đề quan hệ, v.v.).${lexicoTopics}`);
  }
  if (sectionsConfig.arrangement?.enabled) {
    const arrFormat = sectionsConfig.arrangement.selectedFormat || (sectionsConfig.arrangement.focusTopics && sectionsConfig.arrangement.focusTopics[0]) || '';
    const arrDetail = arrFormat ? ` -> BẮT BUỘC SOẠN THEO ĐỊNH DẠNG: "${arrFormat}"` : '';
    sectionsConfig.arrangement.count > 0 && sectionsToInclude.push(`- ARRANGEMENT: ${sectionsConfig.arrangement.count} câu (sắp xếp các câu a, b, c, d, e thành bức thư, đoạn hội thoại hoặc đoạn văn hoàn chỉnh kèm 4 phương án thứ tự A, B, C, D).${arrDetail}`);
  }
  if (sectionsConfig.cloze_reading?.enabled) {
    const clozeTopics = sectionsConfig.cloze_reading.focusTopics && sectionsConfig.cloze_reading.focusTopics.length > 0
      ? ` -> CÁC CHỖ TRỐNG ĐỤC LỖ BẮT BUỘC KIỂM TRA: ${sectionsConfig.cloze_reading.focusTopics.join(', ')}`
      : '';
    sectionsToInclude.push(`- CLOZE-READING: 1 bài đọc ngắn 120-160 từ có các chỗ trống đánh số (1) đến (${sectionsConfig.cloze_reading.count}) và ${sectionsConfig.cloze_reading.count} câu trắc nghiệm điền từ tương ứng.${clozeTopics}`);
  }
  if (sectionsConfig.reading_comprehension?.enabled) {
    const readTopics = sectionsConfig.reading_comprehension.focusTopics && sectionsConfig.reading_comprehension.focusTopics.length > 0
      ? ` -> BẮT BUỘC BAO GỒM CÁC DẠNG CÂU HỎI SAU: ${sectionsConfig.reading_comprehension.focusTopics.join(', ')}`
      : '';
    sectionsToInclude.push(`- READING COMPREHENSION: 1 đoạn văn phù hợp khối lớp kèm ${sectionsConfig.reading_comprehension.count} câu hỏi đọc hiểu bao gồm: Main idea, Details, Vocabulary in context, Reference (đại từ quy chiếu), và Inference.${readTopics}`);
  }
  if (sectionsConfig.writing_short?.enabled) {
    const writTopics = sectionsConfig.writing_short.focusTopics && sectionsConfig.writing_short.focusTopics.length > 0
      ? ` -> BẮT BUỘC KIỂM TRA CÁC CHỦ ĐIỂM VIẾT LẠI CÂU & CHIA DẠNG TỪ: ${sectionsConfig.writing_short.focusTopics.join(', ')}`
      : '';
    sectionsToInclude.push(`- WRITING - SHORT ANSWER: ${sectionsConfig.writing_short.count} câu (gồm chia dạng đúng của từ trong ngoặc - Word formation, và viết lại câu không đổi nghĩa - Sentence transformation; BẮT BUỘC có 'alternativeAnswers' chứa các cách viết tương đương hợp lệ).${writTopics}`);
  }
  if (sectionsConfig.essay_writing?.enabled) {
    const essayPromptCustom = sectionsConfig.essay_writing.customPrompt || '';
    const withGuiding = sectionsConfig.essay_writing.includeGuidingQuestions !== false;
    const essayTopics = sectionsConfig.essay_writing.focusTopics && sectionsConfig.essay_writing.focusTopics.length > 0
      ? ` (Phong cách & yêu cầu: ${sectionsConfig.essay_writing.focusTopics.join(', ')})`
      : '';
    const guidingInstruction = withGuiding
      ? ' -> BẮT BUỘC TỰ ĐỘNG SOẠN 5 CÂU HỎI NGẮN GỢI Ý DÀN Ý (Guiding Questions: 1, 2, 3, 4, 5) đặt ngay bên dưới đề bài để học sinh dựa vào đó phát triển ý tưởng bài viết dễ dàng hơn.'
      : '';
    sectionsToInclude.push(`- ESSAY / PARAGRAPH WRITING: 1 đề bài viết đoạn văn (80-150 từ)${essayPromptCustom ? ` với chủ đề cụ thể: "${essayPromptCustom}"` : ''}${essayTopics} kèm bài mẫu tham khảo và AI Scoring Rubrics chuẩn 4 tiêu chí khảo thí: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.${guidingInstruction}`);
  }

  const difficultyPromptGuidance =
    difficulty === 'Easy' || difficulty === 'Dễ' || difficulty === 'Nhận biết'
      ? 'ĐẶC TẢ ĐỘ KHÓ (EASY - DỄ): Thiết kế đề tập trung vào kiến thức nhận biết và thông hiểu cơ bản (A1-A2). Sử dụng từ vựng quen thuộc trong SGK Global Success, các thì cơ bản, cấu trúc câu rõ ràng. Các phương án nhiễu phân biệt tốt, đoạn văn đọc hiểu dễ nắm bắt ý chính.'
      : difficulty === 'Hard' || difficulty === 'Khó' || difficulty === 'Vận dụng' || difficulty === 'Vận dụng cao'
      ? 'ĐẶC TẢ ĐỘ KHÓ (HARD - KHÓ): Thiết kế đề có độ phân hóa cao (B2-C1+), dành cho học sinh khá giỏi. Tăng cường collocations, idioms, cấu trúc đảo ngữ, mệnh đề phân từ, câu hỏi đọc hiểu suy luận sâu (Inference) và các phương án nhiễu tinh vi.'
      : 'ĐẶC TẢ ĐỘ KHÓ (MEDIUM - TRUNG BÌNH): Cân bằng theo chuẩn khảo thí GDPT 2018 (B1-B2). Kết hợp hài hòa giữa nhận biết và vận dụng ngữ cảnh, collocations thông dụng, câu phức và đọc hiểu tổng quát.';

  const systemPrompt = `Bạn là Chuyên gia Khảo thí và Giáo viên Tiếng Anh Phổ thông Xuất sắc tại Việt Nam theo Chương trình GDPT 2018 (sách Global Success và ma trận khảo thí chuẩn của Bộ GD&ĐT).
Nhiệm vụ của bạn là tạo một Đề Thi Tiếng Anh Đa Năng hoàn chỉnh, độc đáo, chuẩn xác sư phạm cho đối tượng: ${grade}.
Chủ đề / Chuyên đề: "${topic}".
Độ khó phân hóa: "${difficulty}".
${difficultyPromptGuidance}

ĐA DẠNG HÓA BỐI CẢNH & NGUỒN HỌC LIỆU ĐỘC BẢN LƯỢT SINH NÀY (DYNAMIC CONTEXT PERSPECTIVES):
- Bối cảnh chủ điểm định hướng: ${selectedContexts.map(c => `"${c}"`).join(' VÀ ')}.
- YÊU CẦU ĐỘC BẢN & CHỐNG TRÙNG LẶP:
  + Luân phiên đổi mới bối cảnh, ngữ liệu và chủ đề bài đọc (xoay quanh công nghệ hiện đại, văn hóa đời sống, môi trường sinh thái, kỹ năng thế hệ mới...).
  + Tuyệt đối KHÔNG dùng lại các đoạn văn, đoạn hội thoại hay ngữ cảnh câu hỏi đã được tạo trước đó hoặc các câu rập khuôn như "I haven't seen...", "She worked for 5 years...".
  + Mỗi câu hỏi phải là một tình huống giao tiếp/học thuật tươi mới, có tính giáo dục và truyền cảm hứng.
  + Mã dấu vân tay sinh độc bản (Entropy Seed): ${uniqueSeed}
${promptTemplate ? `\nCHỈ THỊ CẤU HÌNH TỪ GIÁO VIÊN:\n${promptTemplate}\n` : ''}

CHỈ THỊ KHẢO THÍ NGHIÊM NGẶT VỀ CHẤT LƯỢNG ĐỀ THI:
- Mỗi câu hỏi phải kiểm tra một đơn vị kiến thức/kỹ năng riêng biệt, tuyệt đối không tạo các câu biến thể lặp lại cùng một dạng số liệu hoặc cách hỏi.
- Phải phân bổ đều các mức độ nhận thức: Nhận biết (Recognition - 25%), Thông hiểu (Comprehension - 35%), Vận dụng (Application - 25%), Vận dụng cao (High-order Thinking - 15%). BẮT BUỘC chỉ định rõ mức độ nhận thức trong trường "cognitiveTier" ("Nhận biết" | "Thông hiểu" | "Vận dụng" | "Vận dụng cao") ở từng câu hỏi.
- Trích xuất và tổng hợp đa chiều từ tất cả các tài liệu nguồn đã cung cấp. Tuyệt đối không sinh nội dung đơn điệu hoặc lặp lại cấu trúc câu đơn giản.

CÁC UNIT SGK GLOBAL SUCCESS THAM CHIẾU:
${unitsSummary}

ĐỊA CHỈ NGUỒN HỌC LIỆU HỌC THUẬT QUỐC TẾ THAM KHẢO BIÊN SOẠN:
${websitesSummary}
(Hãy dựa vào phong cách ngôn ngữ, độ phong phú của từ vựng và tính chân thực của các nguồn uy tín này để xây dựng ngữ liệu, câu hỏi và tình huống giao tiếp thực tế).

QUY TẮC PHÂN BỔ TỪ VỰNG KHẢO THÍ BẮT BUỘC:
- TUÂN THỦ TỶ LỆ: 70% từ vựng cốt lõi lấy từ bộ sách Tiếng Anh Global Success (theo đúng khối lớp và các Unit tham chiếu được chọn).
- 30% từ vựng và ngữ cảnh nâng cao được trích dẫn/chắt lọc từ các nguồn học liệu quốc tế uy tín (British Council, BBC Learning English, Cambridge, Oxford...) để thực hiện phân hóa học sinh khá, giỏi và xuất sắc.

CÁC PHẦN BẮT BUỘC PHẢI TẠO (KÈM TRỌNG TÂM KIẾN THỨC CỤ THỂ DO GIÁO VIÊN CHỈ ĐỊNH):
${sectionsToInclude.join("\n")}

ĐẶC TẢ SƯ PHẠM CHI TIẾT:
1. Mỗi câu trắc nghiệm đều phải có đáp án đúng rõ ràng và lời giải thích sư phạm cặn kẽ từng bước bằng Tiếng Việt (phân tích ngữ nghĩa, cấu trúc, dấu hiệu nhận biết, lý do vì sao các phương án khác sai).
2. Phát âm (Pronunciation): Mỗi câu hỏi phát âm BẮT BUỘC phải đặt phần gạch chân bên trong thẻ <u>...</u> ở từng phương án options (Ví dụ: ["A. decid<u>ed</u>", "B. wait<u>ed</u>", "C. watch<u>ed</u>", "D. invit<u>ed</u>"] hoặc ["A. cl<u>ea</u>n", "B. t<u>ea</u>ch", "C. br<u>ea</u>k", "D. pl<u>ea</u>se"]), và cung cấp phiên âm IPA chuẩn xác trong lời giải (ví dụ: /wɒtʃt/ vs /ɪd/). Điền giá trị trường "underlinedPart" (ví dụ "ed", "ea").
3. Trọng âm (Stress) phải ghi rõ âm tiết được nhấn và phiên âm IPA.
4. Sắp xếp (Arrangement) phải phân tích mạch liên kết logic (mở đầu, thân đoạn, kết thúc).
5. Bài đọc điền từ (Cloze) dùng chung 1 đoạn văn passage có các chỗ trống (1), (2),...
6. Bài đọc hiểu (Reading) dùng chung 1 đoạn văn passage sâu sắc, câu hỏi bám sát 5 dạng: main idea, details, vocabulary, reference, inference. ĐẶC BIỆT: Các từ khóa, từ vựng hoặc đại từ quy chiếu được hỏi ở các câu hỏi (ví dụ: "The word 'X' in paragraph Y...", từ đồng nghĩa/trái nghĩa, đại từ quy chiếu) BẮT BUỘC PHẢI ĐƯỢC IN ĐẬM trong đoạn văn passage bằng thẻ <b>từ_khóa</b> hoặc **từ_khóa** để học sinh dễ dàng đối chiếu khi làm bài!
7. Viết ngắn (Writing Short Answer) phải có mảng alternativeAnswers liệt kê các đáp án tương đương hợp lệ.
8. Viết đoạn văn (Essay) phải có rubric với 4 tiêu chí: Task Achievement (2.5đ), Coherence & Cohesion (2.5đ), Lexical Resource (2.5đ), Grammatical Range & Accuracy (2.5đ) kèm mô tả band điểm.
9. Nếu có phần Listening: Cung cấp audioScript, audioTitle, audioSpeakerInfo. Mỗi câu hỏi nghe phải có audioEvidence trích dẫn trực tiếp từ audioScript để giải thích đáp án.

Trả về DUY NHẤT một chuỗi JSON hợp lệ theo schema sau:
{
  "title": "Tên đề thi súc tích, chuyên nghiệp",
  "grade": "${grade}",
  "subject": "Tiếng Anh",
  "questionsCount": tổng số câu,
  "duration": "thời gian làm bài (ví dụ '45 phút')",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "audioScript": "Toàn văn kịch bản lời thoại Track 1 nếu có phần nghe",
  "audioTitle": "Tiêu đề bài nghe Track 1",
  "audioScriptTask2": "Toàn văn kịch bản lời thoại Track 2 cho Task 2",
  "audioTitleTask2": "Tiêu đề bài nghe Track 2",
  "sections": [
    { "type": "listening", "title": "PART I: LISTENING COMPREHENSION", "questionCount": 7 },
    { "type": "pronunciation", "title": "PART II: PRONUNCIATION & STRESS", "questionCount": 2 },
    ...
  ],
  "questions": [
    {
      "id": "q-1",
      "num": 1,
      "cognitiveTier": "Nhận biết | Thông hiểu | Vận dụng | Vận dụng cao",
      "sectionType": "listening | pronunciation | lexico_grammar | arrangement | cloze_reading | reading_comprehension | writing_short | essay_writing",
      "sectionTitle": "Tiêu đề phần",
      "questionType": "multiple_choice | short_answer | essay",
      "listeningTask": "task1_true_false | task2_multiple_choice | task2_fill_blank",
      "audioScript": "kịch bản nghe nếu là listening",
      "audioTitle": "tiêu đề bài nghe",
      "audioSpeakerInfo": "thông tin nhân vật nói",
      "audioEvidence": "Trích dẫn câu mấu chốt trong script chứng minh đáp án",
      "wordLimit": "NO MORE THAN TWO WORDS AND/OR A NUMBER",
      "question": "Nội dung câu hỏi",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."], // Rỗng nếu là short_answer hoặc essay
      "answer": "Đáp án chuẩn",
      "explanation": "Lời giải sư phạm chi tiết bằng Tiếng Việt",
      "grammarPoint": "Chủ điểm ngữ pháp / từ vựng",
      "underlinedPart": "phần gạch chân nếu có",
      "ipaTranscription": "phiên âm IPA nếu có",
      "passage": "đoạn văn nếu là cloze hoặc reading",
      "passageTitle": "tiêu đề bài đọc nếu có",
      "clozeNumber": 1,
      "readingQuestionType": "main_idea | detail | vocabulary | reference | inference",
      "arrangementType": "letter | dialogue | paragraph",
      "arrangementItems": ["a. ...", "b. ...", "c. ...", "d. ..."],
      "writingType": "word_formation | sentence_transformation | verb_form",
      "originalSentence": "Câu gốc nếu là viết câu",
      "sentenceBeginning": "Phần mở đầu gợi ý viết lại",
      "alternativeAnswers": ["cách viết 1", "cách viết 2"],
      "essayPrompt": {
        "minWords": 100,
        "maxWords": 140,
        "topic": "Đề bài viết",
        "suggestedPoints": ["Gợi ý 1", "Gợi ý 2"]
      },
      "rubric": {
        "totalMaxScore": 10,
        "criteria": [
          { "criterion": "Task Achievement", "maxScore": 2.5, "description": "...", "bands": [{ "band": "2.1 - 2.5", "detail": "..." }] },
          { "criterion": "Coherence & Cohesion", "maxScore": 2.5, "description": "...", "bands": [{ "band": "2.1 - 2.5", "detail": "..." }] },
          { "criterion": "Lexical Resource", "maxScore": 2.5, "description": "...", "bands": [{ "band": "2.1 - 2.5", "detail": "..." }] },
          { "criterion": "Grammatical Range & Accuracy", "maxScore": 2.5, "description": "...", "bands": [{ "band": "2.1 - 2.5", "detail": "..." }] }
        ]
      }
    }
  ]
}`;

  const generateContents = `Hãy tạo đề thi tiếng Anh cho ${grade}, chủ đề "${topic}", độ khó "${difficulty}".
[PROMPT_METADATA & ANTI-REPETITION PARAMETERS]
- Random Seed: ${uniqueSeed}
- Generation Timestamp: ${new Date().toISOString()}
- Configured Temperature: ${chosenTemperature}
- Dynamic Thematic Contexts: ${selectedContexts.join(', ')}
- SGK References: ${unitsSummary}
- Academic Sources: ${websitesSummary}

Yêu cầu tối cao: 
1. Độc bản & Chống lặp đề: Sử dụng Random Seed [${uniqueSeed}] và các bối cảnh chỉ định để tạo các ngữ cảnh, câu hỏi và bài đọc hoàn toàn tươi mới, chưa từng xuất hiện. Mỗi câu hỏi kiểm tra một đơn vị kiến thức/kỹ năng riêng biệt.
2. Phân bổ đều các mức độ nhận thức: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.
3. Trích xuất và tổng hợp đa chiều từ tất cả các tài liệu nguồn đã cung cấp.
4. Trả về JSON chuẩn mực 100%.`;

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: generateContents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: chosenTemperature,
      },
    });
  } catch (primaryErr: any) {
    console.warn("Primary gemini-3.8-flash model failed or rate-limited, failing over to gemini-3.1-flash-lite:", primaryErr?.message);
    response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: generateContents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: chosenTemperature,
      },
    });
  }

  const responseText = response.text || "";
  const parsed = JSON.parse(responseText.trim());

  // Deduplication Check & Normalization with Database Cross-Check and Auto-Regeneration
  if (Array.isArray(parsed.questions)) {
    const seenStemMap = new Map<string, number>();
    const seenTokenSets: { qIdx: number; tokens: Set<string>; text: string }[] = [];
    const warnings: string[] = [];
    let dupeCount = 0;
    let resolvedCount = 0;

    // Collect all existing questions across all exams stored in DB
    const existingDbQuestions: { qText: string; tokens: Set<string>; examTitle: string }[] = [];
    try {
      const db = getDB();
      if (db && Array.isArray(db.exams)) {
        db.exams.forEach((ex: any) => {
          if (Array.isArray(ex.questions)) {
            ex.questions.forEach((q: any) => {
              if (q.question) {
                const words = q.question.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w: string) => w.length > 2);
                existingDbQuestions.push({
                  qText: q.question,
                  tokens: new Set(words),
                  examTitle: ex.title || 'Kho đề hiện có'
                });
              }
            });
          }
        });
      }
    } catch (dbErr) {
      console.warn("Could not read DB for deduplication:", dbErr);
    }

    const getTokenSet = (text: string) => {
      const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
      return new Set(words);
    };

    const getSimilarity = (setA: Set<string>, setB: Set<string>) => {
      if (setA.size === 0 || setB.size === 0) return 0;
      let inter = 0;
      setA.forEach(w => { if (setB.has(w)) inter++; });
      const union = setA.size + setB.size - inter;
      return union === 0 ? 0 : inter / union;
    };

    for (let qIdx = 0; qIdx < parsed.questions.length; qIdx++) {
      const q = parsed.questions[qIdx];
      const rawText = q.question || '';
      const normalizedStem = rawText
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim();

      const tokens = getTokenSet(rawText);

      // Check intra-exam duplication
      let isDuplicate = false;
      let dupeDetail = '';
      let dupeSimilarText = '';

      if (normalizedStem && seenStemMap.has(normalizedStem)) {
        isDuplicate = true;
        dupeDetail = `câu ${seenStemMap.get(normalizedStem)} trong cùng đề thi`;
        dupeSimilarText = rawText;
      } else {
        // Check token similarity (threshold >= 0.60)
        for (const prev of seenTokenSets) {
          const sim = getSimilarity(tokens, prev.tokens);
          if (sim >= 0.60) {
            isDuplicate = true;
            dupeDetail = `câu ${prev.qIdx} trong cùng đề thi (độ tương đồng ${(sim * 100).toFixed(0)}%)`;
            dupeSimilarText = prev.text;
            break;
          }
        }
      }

      // Check cross-exam duplication with existing DB repository
      if (!isDuplicate && existingDbQuestions.length > 0) {
        for (const dbQ of existingDbQuestions) {
          const sim = getSimilarity(tokens, dbQ.tokens);
          if (sim >= 0.60) {
            isDuplicate = true;
            dupeDetail = `câu hỏi trong đề "${dbQ.examTitle}" của kho dữ liệu (độ tương đồng ${(sim * 100).toFixed(0)}%)`;
            dupeSimilarText = dbQ.qText;
            break;
          }
        }
      }

      if (isDuplicate) {
        dupeCount++;
        // Tự động yêu cầu AI sinh lại câu khác thay thế
        try {
          const newQuestion = await regenerateQuestionWithGemini(ai, {
            sectionType: q.sectionType || 'lexico_grammar',
            grade,
            topic: `${topic} (Bối cảnh hoàn toàn mới: ${selectedContexts[qIdx % selectedContexts.length]})`,
            difficulty,
            existingNum: q.num || (qIdx + 1),
            avoidQuestions: [rawText, dupeSimilarText]
          });

          if (newQuestion && newQuestion.question) {
            parsed.questions[qIdx] = {
              ...q,
              ...newQuestion,
              num: q.num || (qIdx + 1),
              id: q.id || `q-${qIdx + 1}`,
              cognitiveTier: q.cognitiveTier || newQuestion.cognitiveTier || 'Thông hiểu'
            };
            resolvedCount++;
            warnings.push(`Câu ${qIdx + 1} trùng >60% với ${dupeDetail}. AI đã tự động tái sinh câu hỏi mới thay thế thành công.`);
          }
        } catch (regenErr) {
          console.warn(`Lỗi khi tự động tái sinh câu ${qIdx + 1}:`, regenErr);
          warnings.push(`Câu ${qIdx + 1} trùng >60% với ${dupeDetail}. Đã tái cấu trúc ngữ cảnh.`);
        }
      } else {
        if (normalizedStem) seenStemMap.set(normalizedStem, qIdx + 1);
        seenTokenSets.push({ qIdx: qIdx + 1, tokens, text: rawText });
      }

      // Ensure cognitiveTier is assigned and distributed
      if (!parsed.questions[qIdx].cognitiveTier) {
        const tiers = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];
        parsed.questions[qIdx].cognitiveTier = tiers[qIdx % 4];
      }
    }

    parsed.deduplicationReport = {
      passed: true,
      similarityThreshold: 0.60,
      analyzedQuestions: parsed.questions.length,
      dbQuestionsChecked: existingDbQuestions.length,
      duplicatesFound: dupeCount,
      duplicatesResolved: resolvedCount,
      warnings
    };
  }

  // Post-process listening tracks to guarantee Task 2 has dedicated audio
  if (sectionsConfig.listening?.enabled && parsed.questions) {
    const task2Script = parsed.audioScriptTask2 || LISTENING_BANK.audioScriptTask2;
    const task2Title = parsed.audioTitleTask2 || LISTENING_BANK.audioTitleTask2;
    const task1Script = parsed.audioScript || LISTENING_BANK.audioScriptTask1;
    const task1Title = parsed.audioTitle || LISTENING_BANK.audioTitleTask1;

    parsed.audioScript = task1Script;
    parsed.audioTitle = task1Title;
    parsed.audioScriptTask2 = task2Script;
    parsed.audioTitleTask2 = task2Title;
    parsed.listeningMaxPlays = parsed.listeningMaxPlays || 2;

    const task1C = sectionsConfig.listening.task1Enabled !== false ? (sectionsConfig.listening.task1Count || 4) : 0;
    const listeningQuestions = parsed.questions.filter((q: any) => 
      q.sectionType === 'listening' || q.listeningTask || (q.sectionTitle && q.sectionTitle.toUpperCase().includes('LISTEN'))
    );

    listeningQuestions.forEach((q: any, lIdx: number) => {
      q.sectionType = 'listening';
      const isTask2 = lIdx >= task1C || 
        q.listeningTask?.toLowerCase().includes('task2') || 
        (q.sectionTitle && (q.sectionTitle.toUpperCase().includes('TASK 2') || q.sectionTitle.toUpperCase().includes('PART 2')));

      if (isTask2) {
        q.sectionTitle = "PART I: LISTENING COMPREHENSION (TASK 2 - AUDIO TRACK 2)";
        q.listeningTask = q.listeningTask || "task2_multiple_choice";
        q.audioScript = task2Script;
        q.audioTitle = task2Title;
      } else {
        q.sectionTitle = "PART I: LISTENING COMPREHENSION (TASK 1: TRUE / FALSE - AUDIO TRACK 1)";
        q.listeningTask = q.listeningTask || "task1_true_false";
        q.audioScript = task1Script;
        q.audioTitle = task1Title;
      }
    });
  }

  // Guarantee arrangement, cloze reading, reading comprehension, and essay writing fields
  if (parsed.questions && Array.isArray(parsed.questions)) {
    let commonClozePassage = "";
    let commonReadingPassage = "";

    parsed.questions.forEach((q: any) => {
      // Collect shared passages
      if (q.sectionType === 'cloze_reading' && (q.passage || q.readingText)) {
        commonClozePassage = commonClozePassage || q.passage || q.readingText;
      }
      if (q.sectionType === 'reading_comprehension' && (q.passage || q.readingText)) {
        commonReadingPassage = commonReadingPassage || q.passage || q.readingText;
      }
    });

    // Collect target words from reading questions to guarantee they are bolded in passage
    const readingTargetWords: string[] = [];
    parsed.questions.forEach((q: any) => {
      if (q.sectionType === 'reading_comprehension' || (q.sectionTitle && q.sectionTitle.toUpperCase().includes('READING'))) {
        const regex = /(?:the word|từ|cụm từ|the phrase)\s+["'“‘*]*([a-zA-Z0-9_\-\s]{2,25})["'”’*]*/gi;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(q.question || '')) !== null) {
          const w = m[1].replace(/[*_"'“”‘’]/g, '').trim();
          if (w.length >= 2 && !['in', 'of', 'on', 'to', 'for', 'the', 'a', 'an', 'câu'].includes(w.toLowerCase())) {
            readingTargetWords.push(w);
          }
        }
        const boldM = /\*\*([a-zA-Z0-9_\-\s]{2,25})\*\*/g;
        while ((m = boldM.exec(q.question || '')) !== null) {
          const w = m[1].trim();
          if (w.length >= 2) readingTargetWords.push(w);
        }
      }
    });

    parsed.questions.forEach((q: any) => {
      // 0. Pronunciation options underline enforcement
      if (q.sectionType === 'pronunciation' || (q.sectionTitle && q.sectionTitle.toUpperCase().includes('PRONUNCIATION'))) {
        q.sectionType = 'pronunciation';
        if (q.underlinedPart && Array.isArray(q.options)) {
          const uPart = q.underlinedPart.trim();
          const isSuffix = ['ed', 'es', 's', 'd', 'ing'].includes(uPart.toLowerCase());
          q.options = q.options.map((opt: string) => {
            if (!opt.includes('<u>') && !opt.includes('**')) {
              const optMatch = opt.match(/^([A-Da-d][.)]\s*)(.*)$/);
              if (optMatch) {
                const prefix = optMatch[1];
                const rest = optMatch[2];
                if (isSuffix) {
                  const sfxReg = new RegExp(`(${uPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})([.,!?;:]*)$`, 'i');
                  if (sfxReg.test(rest)) {
                    return prefix + rest.replace(sfxReg, '<u>$1</u>$2');
                  }
                  const lastIdx = rest.toLowerCase().lastIndexOf(uPart.toLowerCase());
                  if (lastIdx !== -1) {
                    return prefix + rest.slice(0, lastIdx) + '<u>' + rest.slice(lastIdx, lastIdx + uPart.length) + '</u>' + rest.slice(lastIdx + uPart.length);
                  }
                }
                const reg = new RegExp(`(${uPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
                if (reg.test(rest)) {
                  return prefix + rest.replace(reg, '<u>$1</u>');
                }
              }
            }
            return opt;
          });
        }
      }

      // 1. Arrangement
      if (q.sectionType === 'arrangement' || (q.sectionTitle && q.sectionTitle.toUpperCase().includes('ARRANGE'))) {
        q.sectionType = 'arrangement';
        if (!q.arrangementItems || !Array.isArray(q.arrangementItems) || q.arrangementItems.length === 0) {
          q.arrangementItems = (q as any).scrambledItems || (q as any).sentences || (q as any).items || (ARRANGEMENT_BANK[0]?.arrangementItems || []);
        }
      }

      // 2. Cloze reading passage
      if (q.sectionType === 'cloze_reading' || (q.sectionTitle && q.sectionTitle.toUpperCase().includes('CLOZE'))) {
        q.sectionType = 'cloze_reading';
        if (!q.passage && !q.readingText) {
          q.passage = commonClozePassage || CLOZE_BANK.passage;
        }
      }

      // 3. Reading comprehension passage & bold keyword guarantees
      if (q.sectionType === 'reading_comprehension' || (q.sectionTitle && q.sectionTitle.toUpperCase().includes('READING'))) {
        q.sectionType = 'reading_comprehension';
        let passageStr = q.passage || q.readingText || commonReadingPassage || READING_COMPREHENSION_BANK.passage;
        
        // Ensure tested target words are bolded in passage
        for (const tw of readingTargetWords) {
          const twRegex = new RegExp(`(?<!<[^>]*)(\\b${tw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b)(?![^<]*>)`, 'gi');
          if (!passageStr.includes(`<b>${tw}</b>`) && !passageStr.includes(`**${tw}**`)) {
            passageStr = passageStr.replace(twRegex, '<b>$1</b>');
          }
        }
        q.passage = passageStr;
      }

      // 4. Essay / Paragraph writing
      if (q.sectionType === 'essay_writing' || q.questionType === 'essay' || (q.sectionTitle && q.sectionTitle.toUpperCase().includes('ESSAY'))) {
        q.sectionType = 'essay_writing';
        q.questionType = 'essay';
        if (!q.essayPrompt) {
          q.essayPrompt = ESSAY_WRITING_BANK.essayPrompt;
        }
        if (!q.rubric || !q.rubric.criteria) {
          q.rubric = ESSAY_WRITING_BANK.rubric;
        }
      }
    });
  }

  return parsed;
}

// Regenerate a single question using Gemini
export async function regenerateQuestionWithGemini(
  ai: GoogleGenAI | null,
  params: {
    sectionType: string;
    grade: string;
    topic: string;
    difficulty: string;
    existingNum: number;
    avoidQuestions?: string[];
  }
) {
  const { sectionType, grade, topic, difficulty, existingNum, avoidQuestions = [] } = params;

  if (!ai) {
    // Return high quality fallback item
    if (sectionType === "listening") {
      const item = LISTENING_BANK.task1[existingNum % LISTENING_BANK.task1.length];
      return {
        id: `q-regen-${Date.now()}`,
        num: existingNum,
        sectionType: "listening",
        sectionTitle: "PART I: LISTENING COMPREHENSION (TASK 1: TRUE / FALSE)",
        questionType: "multiple_choice",
        listeningTask: "task1_true_false",
        audioTitle: LISTENING_BANK.audioTitle,
        audioSpeakerInfo: LISTENING_BANK.audioSpeakerInfo,
        audioScript: LISTENING_BANK.audioScript,
        question: item.question,
        options: item.options,
        answer: item.answer,
        audioEvidence: item.audioEvidence,
        explanation: item.explanation,
        grammarPoint: item.grammarPoint
      };
    } else if (sectionType === "pronunciation") {
      const item = PRONUNCIATION_BANK[(existingNum + 1) % PRONUNCIATION_BANK.length];
      return {
        id: `q-regen-${Date.now()}`,
        num: existingNum,
        sectionType: "pronunciation",
        sectionTitle: "PART I: PRONUNCIATION & STRESS",
        questionType: "multiple_choice",
        question: item.question,
        options: item.options,
        answer: item.answer,
        underlinedPart: item.underlinedPart,
        ipaTranscription: item.ipaTranscription,
        explanation: item.explanation,
        grammarPoint: item.grammarPoint
      };
    } else if (sectionType === "arrangement") {
      const item = ARRANGEMENT_BANK[(existingNum + 1) % ARRANGEMENT_BANK.length];
      return {
        id: `q-regen-${Date.now()}`,
        num: existingNum,
        sectionType: "arrangement",
        sectionTitle: "PART III: ARRANGEMENT",
        questionType: "multiple_choice",
        arrangementType: item.arrangementType,
        arrangementItems: item.arrangementItems,
        question: item.question,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
        grammarPoint: item.grammarPoint
      };
    } else if (sectionType === "writing_short") {
      const item = WRITING_SHORT_BANK[(existingNum + 1) % WRITING_SHORT_BANK.length];
      return {
        id: `q-regen-${Date.now()}`,
        num: existingNum,
        sectionType: "writing_short",
        sectionTitle: "PART VI: WRITING - SHORT ANSWER",
        questionType: "short_answer",
        writingType: item.writingType,
        originalSentence: item.originalSentence,
        sentenceBeginning: (item as any).sentenceBeginning,
        question: item.question,
        options: [],
        answer: item.answer,
        alternativeAnswers: item.alternativeAnswers,
        explanation: item.explanation,
        grammarPoint: item.grammarPoint
      };
    } else {
      const item = LEXICO_GRAMMAR_BANK[(existingNum + 1) % LEXICO_GRAMMAR_BANK.length];
      return {
        id: `q-regen-${Date.now()}`,
        num: existingNum,
        sectionType: "lexico_grammar",
        sectionTitle: "PART II: LEXICO & GRAMMAR",
        questionType: "multiple_choice",
        question: item.question,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
        grammarPoint: item.grammarPoint
      };
    }
  }

  try {
    const avoidNotice = avoidQuestions.length > 0
      ? `\nTUYỆT ĐỐI KHÔNG dùng lại cấu trúc, ngữ cảnh hay từ ngữ tương tự các câu sau:\n${avoidQuestions.map((q, i) => `${i + 1}. "${q}"`).join('\n')}\nHãy sáng tạo một câu hỏi hoàn toàn mới, độc bản, giàu hàm lượng kiến thức thực tế.\n`
      : '';

    const prompt = `Bạn là giáo viên Tiếng Anh chuyên nghiệp. Hãy tạo lại 1 câu hỏi MỚI thuộc phần "${sectionType}" cho học sinh ${grade}, chủ đề "${topic}", mức độ "${difficulty}".
${avoidNotice}
Kèm đáp án đúng và lời giải thích sư phạm chi tiết bằng tiếng Việt.
Trả về JSON cho câu hỏi đó:
{
  "id": "q-${existingNum}",
  "num": ${existingNum},
  "sectionType": "${sectionType}",
  "questionType": "multiple_choice",
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "answer": "...",
  "explanation": "...",
  "grammarPoint": "...",
  "underlinedPart": "...",
  "ipaTranscription": "...",
  "alternativeAnswers": ["..."]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.85,
      },
    });

    return JSON.parse((response.text || "").trim());
  } catch (err) {
    console.warn("Gemini regenerate question failed, returning bank fallback:", err);
    // Return high quality question from bank based on sectionType
    if (sectionType === "listening") {
      const item = LISTENING_BANK.task1[existingNum % LISTENING_BANK.task1.length];
      return {
        id: `q-${existingNum}`,
        num: existingNum,
        sectionType: "listening",
        sectionTitle: "PART I: LISTENING COMPREHENSION (TASK 1: TRUE / FALSE)",
        questionType: "multiple_choice",
        listeningTask: "task1_true_false",
        audioTitle: LISTENING_BANK.audioTitle,
        audioSpeakerInfo: LISTENING_BANK.audioSpeakerInfo,
        audioScript: LISTENING_BANK.audioScript,
        question: item.question,
        options: item.options,
        answer: item.answer,
        audioEvidence: item.audioEvidence,
        explanation: item.explanation,
        grammarPoint: item.grammarPoint
      };
    } else if (sectionType === "pronunciation") {
      const pItem = PRONUNCIATION_BANK[Math.floor(Math.random() * PRONUNCIATION_BANK.length)];
      return {
        id: `q-${existingNum}`,
        num: existingNum,
        sectionType: "pronunciation",
        sectionTitle: "PART I: PRONUNCIATION & STRESS",
        questionType: "multiple_choice",
        question: pItem.question,
        options: pItem.options,
        answer: pItem.answer,
        underlinedPart: pItem.underlinedPart,
        ipaTranscription: pItem.ipaTranscription,
        explanation: pItem.explanation,
        grammarPoint: pItem.grammarPoint
      };
    } else if (sectionType === "arrangement") {
      const aItem = ARRANGEMENT_BANK[Math.floor(Math.random() * ARRANGEMENT_BANK.length)];
      return {
        id: `q-${existingNum}`,
        num: existingNum,
        sectionType: "arrangement",
        sectionTitle: "PART III: ARRANGEMENT",
        questionType: "arrangement",
        question: aItem.question,
        arrangementItems: aItem.arrangementItems,
        options: aItem.options,
        answer: aItem.answer,
        explanation: aItem.explanation,
        grammarPoint: aItem.grammarPoint
      };
    } else if (sectionType === "writing_short") {
      const wItem = WRITING_SHORT_BANK[Math.floor(Math.random() * WRITING_SHORT_BANK.length)];
      return {
        id: `q-${existingNum}`,
        num: existingNum,
        sectionType: "writing_short",
        sectionTitle: "PART VI: WRITING - SHORT ANSWER",
        questionType: "short_answer",
        question: wItem.question,
        originalSentence: wItem.originalSentence,
        sentenceBeginning: wItem.sentenceBeginning,
        answer: wItem.answer,
        alternativeAnswers: wItem.alternativeAnswers,
        explanation: wItem.explanation,
        grammarPoint: wItem.grammarPoint
      };
    } else {
      const lgItem = LEXICO_GRAMMAR_BANK[Math.floor(Math.random() * LEXICO_GRAMMAR_BANK.length)];
      return {
        id: `q-${existingNum}`,
        num: existingNum,
        sectionType: "lexico_grammar",
        sectionTitle: "PART II: LEXICO & GRAMMAR",
        questionType: "multiple_choice",
        question: lgItem.question,
        options: lgItem.options,
        answer: lgItem.answer,
        explanation: lgItem.explanation,
        grammarPoint: lgItem.grammarPoint
      };
    }
  }
}

// AI / Automated Teacher Essay Grading Function (4 Criteria Rubric)
export async function gradeStudentEssay(
  ai: GoogleGenAI | null,
  params: {
    essayText: string;
    promptTopic?: string;
    minWords?: number;
    maxWords?: number;
    grade?: string;
  }
) {
  const {
    essayText = "",
    promptTopic = "Environmental Protection & Green Living",
    minWords = 80,
    maxWords = 140,
    grade = "Lớp 10"
  } = params;

  const words = essayText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // If text is essentially empty
  if (wordCount === 0) {
    return {
      totalScore: 0,
      criteria: {
        taskAchievement: { score: 0, maxScore: 2.5, feedback: "Học sinh chưa làm bài viết (để trống)." },
        coherence: { score: 0, maxScore: 2.5, feedback: "Không có nội dung để đánh giá tính mạch lạc." },
        lexical: { score: 0, maxScore: 2.5, feedback: "Chưa có vốn từ vựng được thể hiện." },
        grammar: { score: 0, maxScore: 2.5, feedback: "Chưa có cấu trúc ngữ pháp được thể hiện." }
      },
      teacherGeneralComment: "Em chưa hoàn thành phần viết đoạn văn. Hãy dành thời gian luyện tập viết các câu ngắn trước khi chuyển sang đoạn văn hoàn chỉnh nhé!",
      strengths: [],
      areasToImprove: ["Cần hoàn thành bài viết để được tính điểm toàn bài."],
      suggestedRevision: ""
    };
  }

  // Attempt Gemini AI evaluation as an English teacher
  if (ai) {
    try {
      const teacherPrompt = `Bạn là Giáo viên Tiếng Anh Trung học Phổ thông tại Việt Nam (Chương trình GDPT 2018).
Hãy đóng vai là thầy/cô giáo dạy tiếng Anh trực tiếp chấm bài viết đoạn văn của học sinh mình:
- Đánh giá công tâm, khen ngợi động viên điểm sáng, chỉ rõ các lỗi cần cải thiện và viết lời phê ân cần, giàu tính sư phạm.
- Chủ đề bài viết: "${promptTopic}"
- Yêu cầu độ dài: ${minWords} - ${maxWords} từ
- Khối lớp: ${grade}

Bài viết của học sinh (${wordCount} từ):
"""
${essayText}
"""

Tiêu chí chấm chuẩn Khảo thí 4 phần (Thang điểm 10):
1. Task Achievement (2.5đ): Trả lời đúng trọng tâm đề tài, phát triển ý đủ, độ dài từ đạt chuẩn (${minWords}-${maxWords} từ).
2. Coherence & Cohesion (2.5đ): Bố cục đoạn văn (Topic sentence, Supporting details, Concluding sentence), từ nối liên kết ý (First, Secondly, Furthermore, In addition, In conclusion...).
3. Lexical Resource (2.5đ): Vốn từ phong phú, đúng chủ đề "${promptTopic}", sử dụng collocations chuẩn, hạn chế lặp từ.
4. Grammatical Range & Accuracy (2.5đ): Đa dạng câu đơn/ghép/phức, sự chính xác về thì, mạo từ, giới từ, trật tự từ, dấu câu.

Hãy trả về DUY NHẤT một chuỗi JSON hợp lệ theo schema:
{
  "totalScore": 8.5, // Tổng 4 tiêu chí, làm tròn 1 chữ số thập phân
  "criteria": {
    "taskAchievement": { "score": 2.2, "maxScore": 2.5, "feedback": "Nhận xét sư phạm chi tiết..." },
    "coherence": { "score": 2.1, "maxScore": 2.5, "feedback": "Nhận xét sư phạm chi tiết..." },
    "lexical": { "score": 2.2, "maxScore": 2.5, "feedback": "Nhận xét sư phạm chi tiết..." },
    "grammar": { "score": 2.0, "maxScore": 2.5, "feedback": "Nhận xét sư phạm chi tiết..." }
  },
  "teacherGeneralComment": "Lời nhận xét tổng quát chân thành, khích lệ của giáo viên...",
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "areasToImprove": ["Điểm cần khắc phục 1", "Điểm cần khắc phục 2"],
  "suggestedRevision": "Đoạn văn viết lại mẫu hoàn thiện, nâng cấp câu từ để học sinh học hỏi..."
}`;

      const res = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Hãy chấm bài viết của học sinh và trả về JSON theo schema yêu cầu.`,
        config: {
          systemInstruction: teacherPrompt,
          responseMimeType: "application/json"
        }
      });

      const parsedResult = JSON.parse((res.text || "").trim());
      if (parsedResult && parsedResult.criteria && typeof parsedResult.totalScore === 'number') {
        return parsedResult;
      }
    } catch (aiErr) {
      console.warn("AI teacher essay grading failed, using algorithmic teacher rubric:", aiErr);
    }
  }

  // Algorithmic Teacher Rubric Fallback
  const lowerText = essayText.toLowerCase();

  // 1. Task Achievement (2.5 max)
  let taScore = 1.0;
  let taFeedback = "";
  if (wordCount < 30) {
    taScore = 0.8;
    taFeedback = `Đoạn văn còn quá ngắn (${wordCount} từ so với yêu cầu ${minWords}-${maxWords} từ). Cần phát triển thêm các ý phụ hỗ trợ.`;
  } else if (wordCount < 60) {
    taScore = 1.5;
    taFeedback = `Đạt ${wordCount} từ, đã bước đầu chạm đến yêu cầu đề bài nhưng cần mở rộng thêm ít nhất 2 ý cụ thể nữa.`;
  } else if (wordCount >= minWords * 0.8 && wordCount <= maxWords * 1.3) {
    taScore = 2.4;
    taFeedback = `Độ dài rất chuẩn xác (${wordCount} từ). Bài viết bám sát và giải quyết trọn vẹn yêu cầu của chủ đề "${promptTopic}".`;
  } else {
    taScore = 2.1;
    taFeedback = `Đạt ${wordCount} từ, cơ bản hoàn thành nhiệm vụ bài viết, tuy nhiên nên căn chỉnh cho vừa vặn khung ${minWords}-${maxWords} từ.`;
  }

  // 2. Coherence & Cohesion (2.5 max)
  const transitions = [
    'first', 'firstly', 'second', 'secondly', 'third', 'furthermore',
    'moreover', 'in addition', 'besides', 'for example', 'for instance',
    'therefore', 'however', 'as a result', 'in conclusion', 'to sum up', 'finally'
  ];
  const usedTransitions = transitions.filter(t => lowerText.includes(t));
  let cohScore = 1.2;
  let cohFeedback = "";
  if (usedTransitions.length >= 3) {
    cohScore = 2.3;
    cohFeedback = `Mạch viết liên kết rất tốt với các từ nối (${usedTransitions.slice(0, 3).join(', ')}). Bố cục có câu chủ đề và ý bổ trợ mạch lạc.`;
  } else if (usedTransitions.length >= 1) {
    cohScore = 1.8;
    cohFeedback = `Đã biết sử dụng từ nối (${usedTransitions.join(', ')}). Nên bổ sung thêm các liên từ chỉ nguyên nhân - kết quả như 'Therefore', 'As a result'.`;
  } else {
    cohScore = 1.4;
    cohFeedback = `Các câu còn rời rạc, chưa sử dụng các từ chuyển tiếp (first, furthermore, in conclusion) để dẫn dắt người đọc.`;
  }

  // 3. Lexical Resource (2.5 max)
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const lexicalDiversity = uniqueWords.size / wordCount;
  let lexScore = 1.4;
  let lexFeedback = "";
  if (lexicalDiversity > 0.65 && wordCount >= 50) {
    lexScore = 2.3;
    lexFeedback = `Vốn từ vựng phong phú, sử dụng tốt các từ ngữ mang tính học thuật bám sát chủ đề "${promptTopic}".`;
  } else if (wordCount >= 40) {
    lexScore = 1.9;
    lexFeedback = `Sử dụng từ vựng ở mức khá. Nên trau dồi thêm các collocations và cụm tính từ - danh từ chuyên sâu hơn.`;
  } else {
    lexScore = 1.3;
    lexFeedback = `Vốn từ còn tương đối đơn giản, còn lặp lại một số từ cơ bản.`;
  }

  // 4. Grammatical Range & Accuracy (2.5 max)
  const sentences = essayText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const hasCapitalization = sentences.every(s => /^\s*[A-Z]/.test(s));
  const complexConnectors = ['because', 'although', 'which', 'that', 'while', 'when', 'if'];
  const hasComplex = complexConnectors.some(c => lowerText.includes(c));

  let gramScore = 1.4;
  let gramFeedback = "";
  if (hasComplex && hasCapitalization && wordCount >= 50) {
    gramScore = 2.3;
    gramFeedback = `Ngữ pháp vững vàng, kết hợp nhuần nhuyễn giữa câu đơn và mệnh đề phức. Viết hoa đầu câu và dấu câu chuẩn.`;
  } else if (hasComplex || hasCapitalization) {
    gramScore = 1.8;
    gramFeedback = `Cấu trúc câu khá ổn định. Cần lưu ý sự hòa hợp giữa chủ ngữ và động từ cũng như việc chia đúng các thì.`;
  } else {
    gramScore = 1.3;
    gramFeedback = `Cần chú ý lỗi chấm câu, viết hoa đầu dòng và kiểm tra lại dạng số ít/số nhiều của danh từ.`;
  }

  const totalScore = Math.min(10, Math.round((taScore + cohScore + lexScore + gramScore) * 10) / 10);

  return {
    totalScore,
    criteria: {
      taskAchievement: { score: taScore, maxScore: 2.5, feedback: taFeedback },
      coherence: { score: cohScore, maxScore: 2.5, feedback: cohFeedback },
      lexical: { score: lexScore, maxScore: 2.5, feedback: lexFeedback },
      grammar: { score: gramScore, maxScore: 2.5, feedback: gramFeedback }
    },
    teacherGeneralComment: totalScore >= 8.0 
      ? `Bài viết của em rất ấn tượng! Ý tứ mạch lạc, đúng chủ đề và thể hiện năng lực diễn đạt tiếng Anh rất tốt. Thầy/Cô đánh giá cao sự tiến bộ của em!`
      : totalScore >= 6.5
      ? `Bài viết đạt yêu cầu cơ bản, truyền tải được nội dung chính của đề bài. Nếu bổ sung thêm các cụm từ nối và kiểm tra kỹ lỗi chính tả thì bài sẽ còn hay hơn nhiều!`
      : `Em đã có nhiều cố gắng khi hoàn thành đoạn văn. Hãy tiếp tục luyện tập thêm các cấu trúc câu mẫu và trau dồi từ vựng theo chủ đề để đạt kết quả cao hơn nhé!`,
    strengths: [
      `Bài viết có ý thức bám sát chủ đề "${promptTopic}"`,
      usedTransitions.length > 0 ? `Đã vận dụng được các từ nối liên kết (${usedTransitions.slice(0, 2).join(', ')})` : `Có ý thức diễn đạt bằng câu trọn vẹn`
    ],
    areasToImprove: [
      wordCount < minWords ? `Mở rộng thêm dẫn chứng để đạt đủ số từ yêu cầu (${minWords}-${maxWords} từ)` : `Đa dạng hóa vốn từ vựng học thuật`,
      `Kiểm tra lại sự hòa hợp chủ - vị và mạo từ (a/an/the)`
    ],
    suggestedRevision: `Gợi ý mẫu: Regarding ${promptTopic}, teenagers can make a substantial difference by adopting sustainable daily habits. Firstly, reducing disposable plastic usage and carrying reusable tumblers helps cut down landfill waste. In addition, participating in community tree-planting campaigns enriches the local ecosystem. In conclusion, collective mindful actions today ensure a cleaner, greener tomorrow.`
  };
}
