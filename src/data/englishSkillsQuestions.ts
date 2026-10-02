// src/data/englishSkillsQuestions.ts
// Bộ câu hỏi tự luyện 10 - 15 câu cho từng dạng bài tập kỹ năng tiếng Anh THPT Global Success

export interface VerbFormQuestion {
  id: string;
  sentence: string;
  correct: string;
  alternatives?: string[];
  note: string;
}

export interface WordFormQuestion {
  id: string;
  sentence: string;
  root: string;
  correct: string;
  note: string;
}

export interface SentenceTransformQuestion {
  id: string;
  original: string;
  prompt: string;
  correctAlts: string[];
  note: string;
}

export interface ListeningItem {
  id: string;
  type: 'tf' | 'mc';
  text: string;
  options?: string[];
  correct: string;
  explanation: string;
}

export interface ReadingQuestionItem {
  num: number;
  q: string;
  opts: string[];
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

// ============================================================================
// 1. CHIA ĐỘNG TỪ (VERB FORM & TENSES) - 12 CÂU
// ============================================================================
export const VERB_FORM_QUESTIONS: VerbFormQuestion[] = [
  {
    id: 'v1',
    sentence: 'If renewable energy resources (use) _________ widely, greenhouse gas emissions will decrease significantly.',
    correct: 'are used',
    note: 'Câu điều kiện loại 1 thể bị động trong mệnh đề if: If + S + am/is/are + V3/ed.'
  },
  {
    id: 'v2',
    sentence: 'She suggested (organize) _________ an eco-friendly fundraising campaign for the local community.',
    correct: 'organizing',
    note: 'Cấu trúc "suggest + V-ing" dùng khi đề xuất cùng tham gia một hoạt động.'
  },
  {
    id: 'v3',
    sentence: 'By the time the teacher arrived, all the assignments (submit) _________ by the students.',
    correct: 'had been submitted',
    note: 'Hành động xảy ra và hoàn tất trước một mốc trong quá khứ ("By the time... arrived"), chia Quá khứ hoàn thành thể bị động.'
  },
  {
    id: 'v4',
    sentence: 'While the volunteers (clean) _________ up the beach, it suddenly started to rain heavily.',
    correct: 'were cleaning',
    note: 'Hành động đang diễn ra trong quá khứ (chia Quá khứ tiếp diễn với "While") thì có hành động khác xen vào.'
  },
  {
    id: 'v5',
    sentence: 'You had better (turn) _________ off all household appliances before leaving the classroom.',
    correct: 'turn',
    note: 'Cấu trúc "had better + V-nguyên thể" mang nghĩa khuyên nhủ nên làm gì.'
  },
  {
    id: 'v6',
    sentence: 'The modern solar farm, which (build) _________ last year, now powers more than 5,000 households.',
    correct: 'was built',
    note: 'Mệnh đề quan hệ chỉ sự kiện hoàn tất trong quá khứ có trạng từ "last year", chia Quá khứ đơn thể bị động.'
  },
  {
    id: 'v7',
    sentence: 'He admitted (make) _________ a critical mistake during the chemistry experiment yesterday.',
    correct: 'making',
    alternatives: ['having made'],
    note: 'Cấu trúc "admit + V-ing / having + V3" mang nghĩa thừa nhận đã làm gì.'
  },
  {
    id: 'v8',
    sentence: 'If I (know) _________ her email address yesterday, I would have sent her the project files.',
    correct: 'had known',
    note: 'Câu điều kiện loại 3 diễn tả giả định trái ngược với thực tế trong quá khứ: If + S + had + V3/ed.'
  },
  {
    id: 'v9',
    sentence: 'Hardly had the online conference begun when the electricity (cut) _________ off.',
    correct: 'was cut',
    note: 'Cấu trúc đảo ngữ "Hardly had + S + V3 when + S + V2/ed". Ở đây điện bị cắt nên chia bị động "was cut".'
  },
  {
    id: 'v10',
    sentence: 'She wishes she (speak) _________ fluent English so that she could attend the ASEAN youth summit.',
    correct: 'spoke',
    note: 'Câu ước ở hiện tại (Wish for present): S + wish(es) + S + V-quá khứ đơn.'
  },
  {
    id: 'v11',
    sentence: 'Many rare and endangered species (threaten) _________ by habitat loss and climate change at present.',
    correct: 'are being threatened',
    note: 'Hiện tại tiếp diễn thể bị động diễn tả hành động đang tiếp diễn ở hiện tại ("at present"): S + am/is/are + being + V3/ed.'
  },
  {
    id: 'v12',
    sentence: 'The local green committee is considering (install) _________ more smart solar streetlights downtown.',
    correct: 'installing',
    note: 'Cấu trúc "consider + V-ing" mang nghĩa đang cân nhắc, xem xét làm việc gì.'
  }
];

// ============================================================================
// 2. CẤU TẠO TỪ (WORD FORMATION) - 12 CÂU
// ============================================================================
export const WORD_FORMATION_QUESTIONS: WordFormQuestion[] = [
  {
    id: 'wf1',
    sentence: 'The local authority is seeking innovative and _________ solutions to reduce plastic waste in the city.',
    root: 'SUSTAIN',
    correct: 'sustainable',
    note: 'Cần một tính từ (sustainable - bền vững) song hành cùng "innovative" để bổ nghĩa cho danh từ "solutions".'
  },
  {
    id: 'wf2',
    sentence: 'The rapid _________ of urban areas has caused serious traffic congestion and air pollution.',
    root: 'DEVELOP',
    correct: 'development',
    note: 'Cần một danh từ (development - sự phát triển) đứng sau tính từ "rapid" để làm chủ ngữ.'
  },
  {
    id: 'wf3',
    sentence: 'The young volunteers have worked _________ to renovate the rural healthcare center before winter.',
    root: 'TIRE',
    correct: 'tirelessly',
    note: 'Cần một trạng từ (tirelessly - không biết mệt mỏi) bổ nghĩa cho động từ "have worked".'
  },
  {
    id: 'wf4',
    sentence: 'Public _________ of the extreme dangers of climate change has improved over the past decade.',
    root: 'AWARE',
    correct: 'awareness',
    note: 'Cần danh từ "awareness" (nhận thức) trong cụm "Public awareness of...".'
  },
  {
    id: 'wf5',
    sentence: 'We need to reduce our daily energy _________ to save money and lower carbon emissions.',
    root: 'CONSUME',
    correct: 'consumption',
    note: 'Cần danh từ "consumption" (sự tiêu thụ, mức tiêu thụ) đứng sau tính từ "energy".'
  },
  {
    id: 'wf6',
    sentence: 'The tropical national park boasts remarkable _________, housing thousands of rare flora and fauna species.',
    root: 'DIVERSE',
    correct: 'biodiversity',
    note: 'Cần danh từ "biodiversity" (sự đa dạng sinh học) hoặc "diversity" để chỉ sự phong phú sinh thái.'
  },
  {
    id: 'wf7',
    sentence: 'The government has issued strict regulations regarding the _________ of historical landmarks.',
    root: 'PRESERVE',
    correct: 'preservation',
    note: 'Cần danh từ "preservation" (sự bảo tồn, gìn giữ) đứng sau mạo từ "the" và trước giới từ "of".'
  },
  {
    id: 'wf8',
    sentence: 'Solar, wind, and geothermal energy are dependable examples of _________ energy resources.',
    root: 'RENEW',
    correct: 'renewable',
    note: 'Cần tính từ "renewable" (tái tạo được) bổ nghĩa cho danh từ "energy resources".'
  },
  {
    id: 'wf9',
    sentence: 'Leading _________ around the world are calling for urgent international carbon tax policies.',
    root: 'ENVIRONMENT',
    correct: 'environmentalists',
    note: 'Cần danh từ chỉ người số nhiều "environmentalists" (các nhà hoạt động môi trường) làm chủ ngữ.'
  },
  {
    id: 'wf10',
    sentence: 'Air pollution levels have dropped _________ since electric buses were introduced into the public transit system.',
    root: 'SIGNIFICANT',
    correct: 'significantly',
    note: 'Cần trạng từ "significantly" (đáng kể) bổ nghĩa cho động từ "have dropped".'
  },
  {
    id: 'wf11',
    sentence: 'Taking good care of our surrounding living habitat is a collective _________ for all citizens.',
    root: 'RESPONSIBLE',
    correct: 'responsibility',
    note: 'Cần danh từ "responsibility" (trách nhiệm) đứng sau tính từ "collective".'
  },
  {
    id: 'wf12',
    sentence: 'The international community is determined to limit harmful greenhouse gas _________ by 2030.',
    root: 'EMIT',
    correct: 'emissions',
    note: 'Cần danh từ số nhiều "emissions" (khí thải) trong cụm "greenhouse gas emissions".'
  }
];

// ============================================================================
// 3. VIẾT LẠI CÂU (SENTENCE TRANSFORMATION) - 10 CÂU
// ============================================================================
export const SENTENCE_TRANSFORM_QUESTIONS: SentenceTransformQuestion[] = [
  {
    id: 'tr1',
    original: 'We started using solar energy three years ago.',
    prompt: 'We have __________________________________________________',
    correctAlts: [
      'we have used solar energy for three years',
      'we have been using solar energy for three years',
      'we have used solar energy for 3 years',
      'we have been using solar energy for 3 years'
    ],
    note: 'Chuyển từ Quá khứ đơn (started + V-ing + ago) sang Hiện tại hoàn thành / HTHT tiếp diễn (have used / have been using + for + khoảng thời gian).'
  },
  {
    id: 'tr2',
    original: "Because he didn't follow the instructions carefully, he failed the experiment.",
    prompt: 'If he __________________________________________________',
    correctAlts: [
      'if he had followed the instructions carefully, he would not have failed the experiment',
      "if he had followed the instructions carefully, he wouldn't have failed the experiment",
      'if he had followed the instructions carefully he would have passed the experiment'
    ],
    note: 'Câu điều kiện loại 3 diễn tả giả định trái ngược với quá khứ: If + S + had + V3, S + would have + V3.'
  },
  {
    id: 'tr3',
    original: 'People say that the city is planning a new green park downtown.',
    prompt: 'It is said that __________________________________________________',
    correctAlts: [
      'it is said that the city is planning a new green park downtown',
      'the city is said to be planning a new green park downtown'
    ],
    note: 'Cấu trúc bị động khách quan: People say that + S + V => It is said that + S + V.'
  },
  {
    id: 'tr4',
    original: 'Although he was exhausted, he completed the 10km charity marathon.',
    prompt: 'In spite of __________________________________________________',
    correctAlts: [
      'in spite of being exhausted, he completed the 10km charity marathon',
      'in spite of his exhaustion, he completed the 10km charity marathon',
      'in spite of feeling exhausted, he completed the 10km charity marathon'
    ],
    note: 'Chuyển từ Although + clause sang In spite of + V-ing / Noun phrase.'
  },
  {
    id: 'tr5',
    original: "I haven't visited the National Maritime Museum for five months.",
    prompt: 'The last time __________________________________________________',
    correctAlts: [
      'the last time i visited the national maritime museum was five months ago',
      'the last time i went to the national maritime museum was five months ago',
      'the last time i visited the national maritime museum was 5 months ago'
    ],
    note: 'Chuyển từ S + haven\'t + V3 + for + time sang The last time + S + V2 + was + time + ago.'
  },
  {
    id: 'tr6',
    original: "You shouldn't leave the air conditioner on when you go out.",
    prompt: 'You had better __________________________________________________',
    correctAlts: [
      'you had better not leave the air conditioner on when you go out',
      "you had better turn off the air conditioner when you go out"
    ],
    note: 'Cấu trúc khuyên can: You shouldn\'t + V => You had better not + V.'
  },
  {
    id: 'tr7',
    original: '"I will submit my environmental project report tomorrow," Lan told her teacher.',
    prompt: 'Lan told her teacher that __________________________________________________',
    correctAlts: [
      'lan told her teacher that she would submit her environmental project report the next day',
      'lan told her teacher that she would submit her environmental project report the following day'
    ],
    note: 'Câu tường thuật gián tiếp: lùi thì (will -> would), đổi ngôi (I -> she, my -> her), đổi trạng ngữ (tomorrow -> the next day / following day).'
  },
  {
    id: 'tr8',
    original: 'The rain was so heavy that our flight to Da Nang had to be postponed.',
    prompt: 'It was such __________________________________________________',
    correctAlts: [
      'it was such heavy rain that our flight to da nang had to be postponed',
      'it was such a heavy rain that our flight to da nang had to be postponed'
    ],
    note: 'Chuyển đổi giữa So + adj + that và Such + (a/an) + adj + noun + that.'
  },
  {
    id: 'tr9',
    original: "She didn't realize how important the deadline was until her manager reminded her.",
    prompt: 'Not until __________________________________________________',
    correctAlts: [
      'not until her manager reminded her did she realize how important the deadline was',
      'not until her manager had reminded her did she realize how important the deadline was'
    ],
    note: 'Đảo ngữ với Not until: Not until + time clause + trợ động từ + S + V-nguyên thể.'
  },
  {
    id: 'tr10',
    original: 'No one in our class can solve difficult math problems as quickly as Nam.',
    prompt: 'Nam is the __________________________________________________',
    correctAlts: [
      'nam is the fastest at solving difficult math problems in our class',
      'nam is the quickest student to solve difficult math problems in our class',
      'nam is the best at solving difficult math problems in our class',
      'nam can solve difficult math problems the most quickly in our class'
    ],
    note: 'Chuyển từ so sánh bằng phủ định (No one... as... as) sang so sánh nhất (the most / the best).'
  }
];

// ============================================================================
// 4. LISTENING HUB - 10 CÂU (5 True/False + 5 Multiple Choice)
// ============================================================================
export const LISTENING_QUESTIONS: ListeningItem[] = [
  // Part 1: True / False (5 câu)
  {
    id: 'lis-tf-1',
    type: 'tf',
    text: 'The environmental project was initiated at a high school in Da Nang city.',
    correct: 'True',
    explanation: 'Bài nghe xác nhận dự án bắt đầu từ trường THPT tại thành phố Đà Nẵng.'
  },
  {
    id: 'lis-tf-2',
    type: 'tf',
    text: 'More than 80% of single-use plastic cups have been successfully eliminated after two months.',
    correct: 'True',
    explanation: 'Theo số liệu thống kê trong bài nghe, trường học đã giảm hơn 80% ly nhựa dùng một lần.'
  },
  {
    id: 'lis-tf-3',
    type: 'tf',
    text: 'Students are mandatory required to buy brand-new paper textbooks each semester.',
    correct: 'False',
    explanation: 'Thông tin trong bài nghe nhấn mạnh câu lạc bộ khuyến khích tái sử dụng sách giáo khoa cũ (book exchange fair).'
  },
  {
    id: 'lis-tf-4',
    type: 'tf',
    text: 'The organic rooftop garden provides fresh vegetables used in the school kitchen.',
    correct: 'True',
    explanation: 'Vườn rau hữu cơ trên sân thượng cung cấp rau sạch định kỳ cho bếp ăn bán trú của trường.'
  },
  {
    id: 'lis-tf-5',
    type: 'tf',
    text: 'Solar panels installed on the roof generate power that is sold entirely to commercial factories.',
    correct: 'False',
    explanation: 'Điện mặt trời được dùng trực tiếp cho hệ thống quạt và chiếu sáng các lớp học của nhà trường, không bán cho nhà máy.'
  },

  // Part 2: Multiple Choice (5 câu)
  {
    id: 'lis-mc-1',
    type: 'mc',
    text: 'What is the principal objective of the "Zero-waste Youth" club?',
    options: [
      'A. To collect plastic bottles for sale and commercial profit',
      'B. To educate students and community members on sustainable green living',
      'C. To build large industrial recycling factories in urban zones',
      'D. To organize music concerts for international tourists'
    ],
    correct: 'B',
    explanation: 'Mục tiêu trọng tâm của CLB là nâng cao nhận thức cộng đồng và giáo dục học sinh về lối sống xanh bền vững.'
  },
  {
    id: 'lis-mc-2',
    type: 'mc',
    text: 'How do student volunteers encourage their classmates to conserve electricity?',
    options: [
      'A. By turning off air conditioners during breaks and putting up reminder stickers',
      'B. By cutting off main electrical circuit breakers during school hours',
      'C. By issuing heavy financial fines for students who leave fans running',
      'D. By permanently shutting down the computer lab'
    ],
    correct: 'A',
    explanation: 'Các tình nguyện viên nhắc nhở tắt điều hòa vào giờ ra chơi và dán nhãn thông điệp tiết kiệm điện.'
  },
  {
    id: 'lis-mc-3',
    type: 'mc',
    text: 'Which organization provided funding and technical guidance for the composting project?',
    options: [
      'A. A local environmental NGO in collaboration with the alumni association',
      'B. An overseas luxury travel agency',
      'C. The metropolitan police department',
      'D. A chain of multinational fast-food restaurants'
    ],
    correct: 'A',
    explanation: 'Tổ chức phi chính phủ môi trường địa phương phối hợp cùng hội cựu học sinh đã tài trợ thùng ủ rác hữu cơ.'
  },
  {
    id: 'lis-mc-4',
    type: 'mc',
    text: 'What was the greatest obstacle encountered during the initial weeks of the campaign?',
    options: [
      'A. Changing students deeply ingrained habits of using disposable plastic bags',
      'B. Direct objection and disapproval from the local school board',
      'C. Extreme winter freezing temperatures in Central Vietnam',
      'D. A severe lack of fresh water supply on campus'
    ],
    correct: 'A',
    explanation: 'Khó khăn lớn nhất ban đầu là thay đổi thói quen dùng đồ nhựa dùng một lần đã ăn sâu vào sinh hoạt của học sinh.'
  },
  {
    id: 'lis-mc-5',
    type: 'mc',
    text: 'What is planned as the next milestone for the eco-project next year?',
    options: [
      'A. Installing a rainwater harvesting system and sharing the model with neighboring schools',
      'B. Eliminating all regular offline final examinations',
      'C. Replacing sports fields with concrete car parking lots',
      'D. Closing down the cafeteria permanently'
    ],
    correct: 'A',
    explanation: 'Kế hoạch năm tới là lắp đặt hệ thống thu gom nước mưa và nhân rộng mô hình trường học xanh sang các trường lân cận.'
  }
];

// ============================================================================
// 5. READING LAB - 10 CÂU ĐỌC HIỂU CHUYÊN SÂU
// ============================================================================
export const READING_QUESTIONS: ReadingQuestionItem[] = [
  {
    num: 1,
    q: 'What is the main topic of the passage?',
    opts: [
      'A. The extraordinary cost of modern concrete high-rises',
      'B. The urgent importance and innovative practices of eco-friendly building architecture',
      'C. How to reduce municipal income tax rates in urban centers',
      'D. The detailed chronological history of timber production'
    ],
    correct: 'B',
    explanation: 'Bài viết tập trung phân tích sự cấp thiết và các phương pháp sáng tạo trong kiến trúc xanh thân thiện môi trường.'
  },
  {
    num: 2,
    q: 'According to paragraph 2, what is one major environmental benefit of living green roofs?',
    opts: [
      'A. They completely eliminate household electricity consumption in all seasons',
      'B. They mitigate the urban heat island effect and insulate building structures',
      'C. They replace the necessity for windows and daylight orientation',
      'D. They allow architects to avoid utilizing sustainable wood'
    ],
    correct: 'B',
    explanation: 'Đoạn 2 nêu rõ: "incorporation of native vegetation on roofs... mitigates the urban heat island effect".'
  },
  {
    num: 3,
    q: 'The word "hurdles" in paragraph 4 is closest in meaning to:',
    opts: [
      'A. obstacles',
      'B. advantages',
      'C. regulations',
      'D. investments'
    ],
    correct: 'A',
    explanation: '"hurdles" mang nghĩa rào cản, chướng ngại vật = "obstacles".'
  },
  {
    num: 4,
    q: 'Which eco-friendly material is highlighted as an effective alternative to steel and concrete?',
    opts: [
      'A. Recycled aluminum alloys',
      'B. High-density synthetic plastics',
      'C. Cross-laminated timber (CLT)',
      'D. Compressed limestone blocks'
    ],
    correct: 'C',
    explanation: 'Đoạn 3 chỉ rõ: "Cross-laminated timber (CLT) is increasingly favored as a viable alternative to concrete and steel".'
  },
  {
    num: 5,
    q: 'Why do concrete and conventional steel have high environmental impacts?',
    opts: [
      'A. They dissolve easily when exposed to acid rain',
      'B. They are excessively light and collapse under heavy winds',
      'C. They cannot be manufactured in urban areas',
      'D. They possess extraordinarily high carbon footprints during their production'
    ],
    correct: 'D',
    explanation: 'Đoạn 3 đề cập: "concrete and steel, both of which possess extraordinarily high carbon footprints".'
  },
  {
    num: 6,
    q: 'According to paragraph 2, passive solar design helps buildings to:',
    opts: [
      'A. Dramatically reduce heating and cooling energy demands',
      'B. Generate excess electrical currents for surrounding neighborhoods',
      'C. Eliminate the need for proper outdoor ventilation systems',
      'D. Store large quantities of rainwater beneath the basement'
    ],
    correct: 'A',
    explanation: 'Đoạn 2 khẳng định: "By orienting structures to maximize daylight and shade, heating and cooling demands are reduced dramatically".'
  },
  {
    num: 7,
    q: 'The word "sequester" in paragraph 3 most likely means:',
    opts: [
      'A. release into the open atmosphere',
      'B. capture and store securely',
      'C. burn as a source of biofuel',
      'D. convert into poisonous gas'
    ],
    correct: 'B',
    explanation: '"sequester carbon" trong ngữ cảnh môi trường có nghĩa là hấp thụ và cô lập/lưu trữ carbon.'
  },
  {
    num: 8,
    q: 'Which of the following is NOT mentioned in paragraph 4 as a driver for green building adoption?',
    opts: [
      'A. Significant long-term operational savings on utilities',
      'B. Enhanced physical and mental health for building occupants',
      'C. Mandatory government demolition of all older city high-rises',
      'D. Municipal tax incentives and financial subsidies'
    ],
    correct: 'C',
    explanation: 'Đoạn 4 không hề đề cập đến việc chính phủ bắt buộc phá dỡ các tòa nhà cũ.'
  },
  {
    num: 9,
    q: 'What can be inferred about the future financial viability of sustainable architecture?',
    opts: [
      'A. It will inevitably bankrupte construction firms due to high timber prices',
      'B. It is only suitable for non-profit charitable projects',
      'C. It will remain financially unfeasible without foreign aid',
      'D. Long-term energy savings and incentives will compensate for higher initial building costs'
    ],
    correct: 'D',
    explanation: 'Câu cuối bài: "operational savings, enhanced occupant health, and municipal tax incentives are rapidly demonstrating that green buildings represent... a sound economic investment".'
  },
  {
    num: 10,
    q: 'What is the overall tone and perspective of the author throughout the passage?',
    opts: [
      'A. Informative, analytical, and forward-looking',
      'B. Highly skeptical and dismissive of green technologies',
      'C. Sarcastic and critical of urban planners',
      'D. Indifferent and unconcerned about environmental issues'
    ],
    correct: 'A',
    explanation: 'Tác giả cung cấp thông tin khoa học, phân tích ưu nhược điểm và đưa ra cái nhìn tích cực, lạc quan về tương lai bền vững.'
  }
];
