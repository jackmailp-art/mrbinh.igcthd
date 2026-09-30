import { ExamItem } from '../types';

export const THPT_INITIAL_EXAMS: ExamItem[] = [
  {
    id: 'thpt-mock-2026-101',
    title: 'Đề Thi Thử Tốt Nghiệp THPT Định Hướng 2026 - Chuẩn Cấu Trúc Bộ GD&ĐT (Mã đề 101)',
    grade: 'Ôn thi Tốt nghiệp THPT',
    subject: 'Tiếng Anh',
    questionsCount: 40,
    duration: '50 phút',
    difficulty: 'Phân hóa cao',
    submissions: 0,
    avgScore: 0,
    assignedClasses: [],
    assignedClassIds: [],
    createdAt: '24/09/2026',
    status: 'Đang mở',
    topic: 'Global Success 12: AI, Kỷ nguyên số, Lối sống xanh & Nghề nghiệp tương lai',
    questions: [
      {
        id: 'q101-1',
        num: 1,
        sectionType: 'cloze_reading',
        sectionTitle: 'PART I: LEAFLET & ANNOUNCEMENT CLOZE (6 CÂU)',
        passageTitle: 'GREEN LIVING YOUTH COMMUNITY PROJECT - NOTICE',
        passage: `GREEN LIVING YOUTH INITIATIVE 2026\nJoin our community environmental drive to cut carbon emissions!\n• We are calling for passionate volunteers to help (1) _______ awareness of single-use plastic reduction.\n• Participants will be provided with (2) _______ training on waste segregation and organic composting.\n• Please register before October 15th to receive our official eco-friendly starter kit (3) _______ of bamboo utensils and tote bags.\nFor further inquiries, contact us at contact@greenliving.org or call 0987-654-321.`,
        question: 'Mark the letter A, B, C, or D to indicate the correct word for blank (1):',
        options: ['A. raise', 'B. rise', 'C. increase', 'D. lift'],
        answer: 'A. raise',
        grammarPoint: 'Collocation: raise awareness',
        explanation: 'Step 1: Nhận diện dạng bài điền từ vào thông báo.\nStep 2: Dịch nghĩa: "giúp nâng cao nhận thức về giảm thiểu đồ nhựa dùng một lần".\nStep 3: Dấu hiệu: danh từ "awareness".\nStep 4: Phân tích bẫy: "rise" là nội động từ không có tân ngữ; "increase/lift" không tạo thành cụm tự nhiên.\nStep 5: Chốt đáp án A: "raise awareness of sth".\nStep 6: Mở rộng: raise money (gây quỹ), raise standard of living (nâng cao mức sống).'
      },
      {
        id: 'q101-2',
        num: 2,
        sectionType: 'cloze_reading',
        sectionTitle: 'PART I: LEAFLET & ANNOUNCEMENT CLOZE (6 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the correct word for blank (2):',
        options: ['A. intensive', 'B. intense', 'C. intensity', 'D. intensively'],
        answer: 'A. intensive',
        grammarPoint: 'Word Formation: Adjective before Noun',
        explanation: 'Step 1: Nhận diện cấu tạo từ.\nStep 2: Cần tính từ bổ nghĩa cho danh từ "training".\nStep 3: "Intensive training" mang nghĩa khóa đào tạo chuyên sâu/cấp tốc.\nStep 4: Loại B (intense: khốc liệt), C (danh từ), D (phó từ).\nStep 5: Chốt đáp án A.\nStep 6: Mở rộng: crash course, hands-on experience.'
      },
      {
        id: 'q101-3',
        num: 3,
        sectionType: 'cloze_reading',
        sectionTitle: 'PART I: LEAFLET & ANNOUNCEMENT CLOZE (6 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the correct word for blank (3):',
        options: ['A. consisting', 'B. comprising', 'C. containing', 'D. composing'],
        answer: 'A. consisting',
        grammarPoint: 'Rút gọn mệnh đề quan hệ & Giới từ of',
        explanation: 'Step 1: Nhận diện mệnh đề quan hệ rút gọn chủ động (which consists of -> consisting of).\nStep 2: "Consist of" = bao gồm.\nStep 3: "Comprise" không đi kèm "of" ở dạng chủ động.\nStep 4: Loại C và D.\nStep 5: Chốt A.\nStep 6: Mở rộng: be made up of, be composed of.'
      },
      {
        id: 'q101-4',
        num: 4,
        sectionType: 'cloze_reading',
        sectionTitle: 'PART I: LEAFLET & ANNOUNCEMENT CLOZE (6 CÂU)',
        passageTitle: 'ANNOUNCEMENT: ROBOTICS & AI CAREER FAIR 2026',
        passage: `FUTURE CAREERS EXPO 2026: NAVIGATING THE ERA OF AI\nThe National Innovation Center is proud to host the biggest tech job summit!\n• Discover cutting-edge developments in machine learning and (4) _______ intelligence.\n• Meet certified career counselors who will help you find the most suitable career (5) _______ for your future.\n• All registered attendees (6) _______ to check in at the reception desk 15 minutes before the opening keynote.`,
        question: 'Mark the letter A, B, C, or D to indicate the correct word for blank (4):',
        options: ['A. artificial', 'B. false', 'C. synthetic', 'D. manufactured'],
        answer: 'A. artificial',
        grammarPoint: 'Thuật ngữ SGK Global Success 12 Unit 6',
        explanation: 'Step 1: Thuật ngữ cố định trong SGK 12: "artificial intelligence" (AI - Trí tuệ nhân tạo).\nStep 2: Loại B (false: sai/giả), C (synthetic: sợi tổng hợp), D (manufactured: đồ sản xuất công nghiệp).\nStep 3: Chốt A.'
      },
      {
        id: 'q101-5',
        num: 5,
        sectionType: 'cloze_reading',
        sectionTitle: 'PART I: LEAFLET & ANNOUNCEMENT CLOZE (6 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the correct word for blank (5):',
        options: ['A. path', 'B. road', 'C. street', 'D. avenue'],
        answer: 'A. path',
        grammarPoint: 'Collocation: career path (SGK 12 Unit 8)',
        explanation: 'Step 1: Cụm danh từ: "career path" = con đường/lộ trình phát triển sự nghiệp.\nStep 2: Chốt đáp án A.'
      },
      {
        id: 'q101-6',
        num: 6,
        sectionType: 'cloze_reading',
        sectionTitle: 'PART I: LEAFLET & ANNOUNCEMENT CLOZE (6 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the correct word for blank (6):',
        options: ['A. are required', 'B. require', 'C. requiring', 'D. have required'],
        answer: 'A. are required',
        grammarPoint: 'Thể bị động thì Hiện tại đơn',
        explanation: 'Step 1: Chủ ngữ "All registered attendees" là đối tượng chịu tác động.\nStep 2: Cấu trúc: be required to V (được yêu cầu làm gì).\nStep 3: Chốt A: are required.'
      },

      // PHẦN II: SẮP XẾP CÂU / BỨC THƯ / HỘI THOẠI (ARRANGEMENT - 5 CÂU)
      {
        id: 'q101-7',
        num: 7,
        sectionType: 'arrangement',
        sectionTitle: 'PART II: SENTENCE & CONVERSATION ARRANGEMENT (5 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the correct arrangement of the sentences to make a meaningful letter:',
        arrangementItems: [
          'a. First of all, I wanted to thank you for inviting me to your school’s Green Fair last weekend.',
          'b. Dear Minh, I hope you are doing well and enjoying your school term.',
          'c. Besides, the workshop on recycling electronic waste really opened my eyes to sustainable habits.',
          'd. Write back soon and let me know when we can meet again.',
          'e. I was thoroughly impressed by how enthusiastic the students were about protecting the environment.'
        ],
        options: ['A. b - a - e - c - d', 'B. a - b - e - c - d', 'C. b - e - a - c - d', 'D. b - a - c - e - d'],
        answer: 'A. b - a - e - c - d',
        grammarPoint: 'Bố cục thư thân mật (Informal letter structure)',
        explanation: 'Step 1: Lời chào mở đầu (b).\nStep 2: Nêu lý do cảm ơn (a).\nStep 3: Bày tỏ ấn tượng chung (e).\nStep 4: Nêu thêm ấn tượng hội thảo bằng "Besides" (c).\nStep 5: Lời chào kết (d) -> Thứ tự chuẩn: b - a - e - c - d.'
      },
      {
        id: 'q101-8',
        num: 8,
        sectionType: 'arrangement',
        sectionTitle: 'PART II: SENTENCE & CONVERSATION ARRANGEMENT (5 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the correct arrangement of the sentences in a dialogue:',
        arrangementItems: [
          'a. Mai: That sounds like a smart choice! Have you considered whether you prefer working from home or in an office?',
          'b. Nam: I am leaning toward becoming a software engineer because technology is developing so rapidly.',
          'c. Mai: What career path are you planning to pursue after graduating from high school, Nam?',
          'd. Nam: I definitely prefer a hybrid model so that I can enjoy both teamwork and flexible working hours.'
        ],
        options: ['A. c - b - a - d', 'B. c - a - b - d', 'C. b - c - a - d', 'D. c - b - d - a'],
        answer: 'A. c - b - a - d',
        grammarPoint: 'Hội thoại định hướng nghề nghiệp (Global Success 12)',
        explanation: 'Step 1: Mai mở đầu hỏi về nghề nghiệp tương lai (c).\nStep 2: Nam trả lời muốn làm kỹ sư phần mềm (b).\nStep 3: Mai hỏi về môi trường làm việc ưa thích (a).\nStep 4: Nam trả lời mô hình hybrid (d) -> Thứ tự c - b - a - d.'
      },
      {
        id: 'q101-9',
        num: 9,
        sectionType: 'arrangement',
        sectionTitle: 'PART II: SENTENCE & CONVERSATION ARRANGEMENT (5 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the correct arrangement of the paragraph on smart cities:',
        arrangementItems: [
          'a. Consequently, urban residents can enjoy cleaner air and faster daily commutes.',
          'b. Modern smart cities rely heavily on cutting-edge Internet of Things (IoT) sensors to manage municipal services.',
          'c. In addition, automated public transportation systems reduce both traffic congestion and harmful emissions.',
          'd. For instance, smart streetlights automatically adjust their brightness according to pedestrian activity.',
          'e. In conclusion, sustainable technology is transforming urban areas into healthier, more liveable spaces.'
        ],
        options: ['A. b - d - c - a - e', 'B. b - c - d - a - e', 'C. d - b - c - a - e', 'D. b - d - a - c - e'],
        answer: 'A. b - d - c - a - e',
        grammarPoint: 'Cấu trúc đoạn văn nghị luận (Topic - Examples - Result - Conclusion)',
        explanation: 'Step 1: Câu chủ đề (b).\nStep 2: Ví dụ 1 đèn thông minh với "For instance" (d).\nStep 3: Bổ sung phương tiện tự động với "In addition" (c).\nStep 4: Kết quả giảm khí thải với "Consequently" (a).\nStep 5: Kết luận với "In conclusion" (e) -> Chọn A.'
      },
      {
        id: 'q101-10',
        num: 10,
        sectionType: 'arrangement',
        sectionTitle: 'PART II: SENTENCE & CONVERSATION ARRANGEMENT (5 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the correct arrangement of sentences in an application email:',
        arrangementItems: [
          'a. I am writing to express my strong interest in the volunteer position for your Youth Heritage Club.',
          'b. Dear Ms. Harrison,',
          'c. Thank you very much for your time and consideration, and I look forward to hearing from you.',
          'd. Having studied Vietnamese folk music for three years, I believe I can contribute significantly to the festival.',
          'e. Sincerely, Le Van An.'
        ],
        options: ['A. b - a - d - c - e', 'B. b - d - a - c - e', 'C. a - b - d - c - e', 'D. b - a - c - d - e'],
        answer: 'A. b - a - d - c - e',
        grammarPoint: 'Bố cục thư ứng tuyển (Application letter structure)',
        explanation: 'Step 1: Kính gửi (b) -> Mục đích viết thư (a) -> Thế mạnh bản thân (d) -> Cảm ơn & trông đợi (c) -> Ký tên (e) -> Chọn A.'
      },
      {
        id: 'q101-11',
        num: 11,
        sectionType: 'arrangement',
        sectionTitle: 'PART II: SENTENCE & CONVERSATION ARRANGEMENT (5 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the correct logical arrangement describing a scientific experiment:',
        arrangementItems: [
          'a. After two weeks of careful observation, the plants receiving filtered solar light showed 30% faster growth.',
          'b. To test the hypothesis, we placed identical seedling samples under two different lighting environments.',
          'c. The scientific team began by formulating a question about how different wavelengths affect photosynthesis.',
          'd. These promising findings suggest that smart greenhouse lighting can optimize agricultural output in arid regions.'
        ],
        options: ['A. c - b - a - d', 'B. b - c - a - d', 'C. c - a - b - d', 'D. b - a - c - d'],
        answer: 'A. c - b - a - d',
        grammarPoint: 'Tiến trình nghiên cứu thực nghiệm logic',
        explanation: 'Step 1: Đặt câu hỏi nghiên cứu (c) -> Bố trí thực nghiệm đối chứng (b) -> Thu thập kết quả sau 2 tuần (a) -> Kết luận ứng dụng (d) -> Chọn A.'
      },

      // PHẦN III: ĐỌC ĐIỀN TỪ KHUYẾT (CLOZE TEST - 5 CÂU - BÁO THE GUARDIAN)
      {
        id: 'q101-12',
        num: 12,
        sectionType: 'cloze_reading',
        sectionTitle: 'PART III: CLOZE READING COMPREHENSION (5 CÂU)',
        passageTitle: 'THE RISE OF LIFELONG LEARNING IN THE AGE OF AUTOMATION',
        passage: `In today’s rapidly evolving global economy, the traditional concept of finishing education in one’s early twenties is swiftly becoming obsolete. As artificial intelligence and automation reshape industry benchmarks, professionals must embrace lifelong learning to stay competitive. According to a recent report by the World Economic Forum, nearly half of all workers will need reskilling by 2030.\n\n(12) _______ individuals who commit to continuous personal growth find it much easier to adapt to unexpected technological disruptions. Furthermore, digital learning platforms have democratized knowledge, allowing people from all walks of life to acquire credentials from top universities.\n\nHowever, self-directed learning requires a high degree of discipline. Without structured classrooms, learners must rely on their own motivation to (13) _______ difficult coursework. Organizations also play a vital role; companies that invest in upskilling their workforce report significantly higher retention rates.\n\nUltimately, education should no longer be viewed as a finite phase of life, but rather as an ongoing journey (14) _______ empowers individuals to thrive. Those who fail to update their competencies risk being left behind in an increasingly (15) _______ job market. Therefore, cultivating curiosity and resilience is perhaps the most (16) _______ asset for future generations.`,
        question: 'Mark the letter A, B, C, or D to indicate the correct word for blank (12):',
        options: ['A. Those', 'B. That', 'C. This', 'D. Which'],
        answer: 'A. Those',
        grammarPoint: 'Đại từ chỉ định làm đại từ chỉ người: Those individuals who',
        explanation: 'Step 1: Đại từ chỉ người đi cùng mệnh đề quan hệ: "Those individuals who..." (Những người mà...).'
      },
      {
        id: 'q101-13',
        num: 13,
        sectionType: 'cloze_reading',
        sectionTitle: 'PART III: CLOZE READING COMPREHENSION (5 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the correct phrasal verb for blank (13):',
        options: ['A. get through', 'B. look through', 'C. come across', 'D. break down'],
        answer: 'A. get through',
        grammarPoint: 'Phrasal Verb: get through sth',
        explanation: 'Step 1: "Get through" = hoàn thành, vượt qua khóa học/nhiệm vụ khó khăn. Loại B (đọc lướt), C (tình cờ thấy), D (hỏng).'
      },
      {
        id: 'q101-14',
        num: 14,
        sectionType: 'cloze_reading',
        sectionTitle: 'PART III: CLOZE READING COMPREHENSION (5 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the correct relative pronoun for blank (14):',
        options: ['A. that', 'B. whom', 'C. whose', 'D. where'],
        answer: 'A. that',
        grammarPoint: 'Mệnh đề quan hệ thay thế cho danh từ journey',
        explanation: 'Step 1: "That" làm chủ ngữ thay cho danh từ chỉ vật "an ongoing journey".'
      },
      {
        id: 'q101-15',
        num: 15,
        sectionType: 'cloze_reading',
        sectionTitle: 'PART III: CLOZE READING COMPREHENSION (5 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the correct adjective for blank (15):',
        options: ['A. demanding', 'B. leisurely', 'C. careless', 'D. sluggish'],
        answer: 'A. demanding',
        grammarPoint: 'Từ vựng theo ngữ cảnh: demanding job market',
        explanation: 'Step 1: "Demanding job market" = thị trường việc làm khắt khe, đòi hỏi năng lực cao.'
      },
      {
        id: 'q101-16',
        num: 16,
        sectionType: 'cloze_reading',
        sectionTitle: 'PART III: CLOZE READING COMPREHENSION (5 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the correct word for blank (16):',
        options: ['A. invaluable', 'B. worthless', 'C. price', 'D. valueless'],
        answer: 'A. invaluable',
        grammarPoint: 'Từ vựng phân hóa: Invaluable (Vô giá)',
        explanation: 'Step 1: "Invaluable" = vô giá, cực kỳ quý báu (đối lập với worthless: không có giá trị).'
      },

      // PHẦN IV: ĐỌC HIỂU 1 (READING COMPREHENSION 1 - 8 CÂU - BÁO BBC FUTURE)
      {
        id: 'q101-17',
        num: 17,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART IV: READING COMPREHENSION PASSAGE 1 (8 CÂU)',
        passageTitle: 'BIODIVERSITY LOSS AND THE FRAGILE WEB OF LIFE (BBC FUTURE)',
        passage: `Across every continent, natural ecosystems are undergoing rapid transformations due to human activities. According to a landmark global assessment by the Intergovernmental Science-Policy Platform on Biodiversity and Ecosystem Services (IPBES), approximately one million plant and animal species now face extinction, many within decades, unless urgent action is taken.\n\nThe primary driver of this ecological crisis is habitat conversion. Expansive agricultural developments, urban sprawl, and industrial forestry have altered more than 75% of the terrestrial land surface. Tropical rainforests, often celebrated as the planet's lungs and biodiversity hotspots, are being logged and cleared at an alarming rate. When a forest is fragmented, native species lose their natural migration corridors, rendering them highly vulnerable to predators and climate fluctuations.\n\nIn addition to physical destruction, chemical pollution poses a pervasive threat. Agricultural runoff carrying synthetic fertilizers and pesticides contaminates freshwater streams, ultimately flowing into oceans and causing widespread coastal "dead zones." In these oxygen-depleted marine waters, aquatic life suffocates and dies. Furthermore, plastic debris discarded by consumer societies has permeated every marine ecosystem, from shallow mangroves to the deepest abyssal trenches.\n\nFortunately, conservation biologists emphasize that the collapse of nature is not yet inevitable. Indigenous communities have demonstrated for centuries that humans can live harmoniously alongside wild nature, managing ancestral lands with remarkable ecological stewardship. Rewilding initiatives in Europe and North America have shown that when damaged lands are protected and left undisturbed, native flora and fauna return with extraordinary resilience. Preserving global biodiversity is not merely an ethical obligation; it is fundamental to the survival and prosperity of human civilization.`,
        question: 'Which of the following would be the best title for the passage?',
        options: [
          'A. The Precipitous Decline of Global Biodiversity and Pathways to Recovery',
          'B. The History of Agricultural Expansion in Tropical Rainforests',
          'C. How Plastic Pollution is Destroying Marine Coastal Ecosystems',
          'D. The Failure of International Environmental Treaties in Modern Times'
        ],
        answer: 'A. The Precipitous Decline of Global Biodiversity and Pathways to Recovery',
        grammarPoint: 'Main Idea / Title Question',
        explanation: 'Step 1: Câu hỏi tiêu đề bao quát.\nStep 2: Đoạn 1-3 nêu thực trạng suy giảm đa dạng sinh học và nguyên nhân; đoạn 4 nêu con đường phục hồi (rewilding, indigenous stewardship).\nStep 3: Chốt A.'
      },
      {
        id: 'q101-18',
        num: 18,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART IV: READING COMPREHENSION PASSAGE 1 (8 CÂU)',
        question: 'According to paragraph 2, what is identified as the primary cause of biodiversity loss?',
        options: [
          'A. Habitat conversion caused by human activities',
          'B. Severe volcanic eruptions in the tropics',
          'C. Natural migration patterns of apex predators',
          'D. Rising sea levels flooding all inland waterways'
        ],
        answer: 'A. Habitat conversion caused by human activities',
        grammarPoint: 'Scanning Detail Question',
        explanation: 'Step 1: Dẫn chứng đoạn 2: "The primary driver of this ecological crisis is habitat conversion." -> Chọn A.'
      },
      {
        id: 'q101-19',
        num: 19,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART IV: READING COMPREHENSION PASSAGE 1 (8 CÂU)',
        question: 'The word "fragmented" in paragraph 2 is closest in meaning to:',
        options: ['A. broken into pieces', 'B. carefully preserved', 'C. rapidly expanded', 'D. deeply flooded'],
        answer: 'A. broken into pieces',
        grammarPoint: 'Từ đồng nghĩa theo ngữ cảnh',
        explanation: 'Step 1: "fragmented" = chia nhỏ, phân mảnh = broken into pieces.'
      },
      {
        id: 'q101-20',
        num: 20,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART IV: READING COMPREHENSION PASSAGE 1 (8 CÂU)',
        question: 'The word "them" in paragraph 2 refers to:',
        options: ['A. native species', 'B. human activities', 'C. tropical rainforests', 'D. migration corridors'],
        answer: 'A. native species',
        grammarPoint: 'Đại từ chỉ xuất (Reference Question)',
        explanation: 'Step 1: "...native species lose their natural migration corridors, rendering them highly vulnerable..." -> "them" là native species.'
      },
      {
        id: 'q101-21',
        num: 21,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART IV: READING COMPREHENSION PASSAGE 1 (8 CÂU)',
        question: 'According to paragraph 3, coastal "dead zones" are primarily created by:',
        options: [
          'A. agricultural runoff containing fertilizers that depletes oxygen in seawater',
          'B. high water temperatures boiling local marine organisms',
          'C. commercial fishing boats netting too many small fishes',
          'D. natural freshwater streams overflowing their riverbanks'
        ],
        answer: 'A. agricultural runoff containing fertilizers that depletes oxygen in seawater',
        grammarPoint: 'Detail Question',
        explanation: 'Step 1: Dẫn chứng đoạn 3: "Agricultural runoff carrying synthetic fertilizers... causing coastal dead zones. In these oxygen-depleted marine waters, aquatic life suffocates and dies."'
      },
      {
        id: 'q101-22',
        num: 22,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART IV: READING COMPREHENSION PASSAGE 1 (8 CÂU)',
        question: 'The word "pervasive" in paragraph 3 is opposite in meaning to:',
        options: ['A. limited', 'B. widespread', 'C. destructive', 'D. persistent'],
        answer: 'A. limited',
        grammarPoint: 'Từ trái nghĩa (Antonym)',
        explanation: 'Step 1: "Pervasive" = lan tràn rộng khắp. Trái nghĩa là "limited" (hạn chế).'
      },
      {
        id: 'q101-23',
        num: 23,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART IV: READING COMPREHENSION PASSAGE 1 (8 CÂU)',
        question: 'Which of the following is NOT true according to the passage?',
        options: [
          'A. Rewilding projects have proven completely useless in restoring damaged ecosystems.',
          'B. Indigenous communities have a proven track record of managing lands sustainably.',
          'C. More than three-quarters of the Earth’s terrestrial surface has been altered by humans.',
          'D. Approximately one million species currently face the risk of extinction.'
        ],
        answer: 'A. Rewilding projects have proven completely useless in restoring damaged ecosystems.',
        grammarPoint: 'Thông tin sai (Negative Fact)',
        explanation: 'Step 1: Đoạn 4 nói "Rewilding initiatives... have shown that native flora and fauna return with extraordinary resilience". Do đó khẳng định vô ích ở phương án A là sai.'
      },
      {
        id: 'q101-24',
        num: 24,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART IV: READING COMPREHENSION PASSAGE 1 (8 CÂU)',
        question: 'Which of the following can be inferred from the final paragraph?',
        options: [
          'A. Protecting ecological diversity directly safeguards human prosperity and long-term survival.',
          'B. Modern industrial technology alone can replace all natural ecosystem functions.',
          'C. Indigenous knowledge should be abolished in favor of synthetic laboratory farming.',
          'D. Extinction events are exclusively biological phenomena with zero economic consequences.'
        ],
        answer: 'A. Protecting ecological diversity directly safeguards human prosperity and long-term survival.',
        grammarPoint: 'Câu hỏi suy luận (Inference)',
        explanation: 'Step 1: Dẫn chứng câu cuối: "Preserving global biodiversity is fundamental to the survival and prosperity of human civilization." -> Chọn A.'
      },

      // PHẦN V: ĐỌC HIỂU 2 PHÂN HÓA CAO (READING COMPREHENSION 2 - 8 CÂU - BÁO NATGEO)
      {
        id: 'q101-25',
        num: 25,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART V: ADVANCED READING COMPREHENSION PASSAGE 2 (8 CÂU)',
        passageTitle: 'THE NEUROSCIENCE OF SLEEP AND COGNITIVE EXCELLENCE (NATGEO)',
        passage: `For centuries, sleep was erroneously regarded by philosophers and early physicians as a passive state of biological dormancy, during which the brain essentially powered down to conserve energy. Modern neuroimaging techniques, however, have revolutionized this perception. Far from being an inactive shut-down, slumber is an exquisitely orchestrated metabolic symphony, characterized by intense neural processing, structural maintenance, and deep memory consolidation.\n\nDuring the deepest stages of non-rapid eye movement (NREM) sleep, slow electrical brainwaves pulse across the cerebral cortex. This rhythmic activity facilitates a biological dialogue between the hippocampus, which serves as a temporary storage vault for daily experiences, and the neocortex, where long-term knowledge is organized. Through this synaptic replay, fleeting short-term memories are etched into resilient permanent neural circuits. Simultaneously, the brain activates its newly discovered glymphatic system—a microscopic hydraulic plumbing network that flushes away toxic metabolic byproducts, including amyloid-beta proteins linked to neurodegenerative disorders.\n\nDespite these indispensable benefits, modern industrialized societies are gripped by a silent epidemic of chronic sleep deprivation. Driven by ubiquitous blue-light emitting screens, high-pressure professional cultures, and the proliferation of artificial stimulants, average sleep durations have plummeted over the past fifty years. This self-inflicted sleep debt imposes severe physiological costs: it impairs emotional regulation, blunts executive decision-making, and drastically suppresses the production of natural killer immune cells.\n\nAddressing this public health crisis necessitates a systemic cultural paradigm shift. Educational institutions and corporate organizations are gradually recognizing that sacrificing rest in the name of productivity is a myopic fallacy. Prioritizing consistent eight-hour sleep windows does not diminish human capability; rather, it serves as the ultimate cognitive amplifier, fostering creativity, emotional resilience, and lifelong intellectual vitality.`,
        question: 'What is the primary topic of the passage?',
        options: [
          'A. The neural mechanisms of sleep, its critical benefits, and the societal peril of sleep deficit',
          'B. The history of pharmaceutical stimulants and sleep aids in industrialized countries',
          'C. Why teenagers require more screen time before bedtime than working adults',
          'D. The structural failure of the neocortex in storing short-term daily experiences'
        ],
        answer: 'A. The neural mechanisms of sleep, its critical benefits, and the societal peril of sleep deficit',
        grammarPoint: 'Chủ đề chính (Primary Topic)',
        explanation: 'Step 1: Bài viết phân tích cơ chế thần kinh của giấc ngủ, lợi ích sinh học đối với trí nhớ và tác hại nghiêm trọng của việc thiếu ngủ.'
      },
      {
        id: 'q101-26',
        num: 26,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART V: ADVANCED READING COMPREHENSION PASSAGE 2 (8 CÂU)',
        question: 'The word "erroneously" in paragraph 1 is closest in meaning to:',
        options: ['A. mistakenly', 'B. deliberately', 'C. accurately', 'D. traditionally'],
        answer: 'A. mistakenly',
        grammarPoint: 'Từ đồng nghĩa theo ngữ cảnh',
        explanation: 'Step 1: "Erroneously" = một cách sai lầm = mistakenly.'
      },
      {
        id: 'q101-27',
        num: 27,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART V: ADVANCED READING COMPREHENSION PASSAGE 2 (8 CÂU)',
        question: 'According to paragraph 2, the glymphatic system functions primarily to:',
        options: [
          'A. flush away toxic waste proteins that accumulate during waking hours',
          'B. produce synthetic artificial light waves inside the skull',
          'C. permanently eliminate all old childhood memories from the neocortex',
          'D. prevent the heart from beating while the body is sleeping'
        ],
        answer: 'A. flush away toxic waste proteins that accumulate during waking hours',
        grammarPoint: 'Scanning Detail Question',
        explanation: 'Step 1: Dẫn chứng đoạn 2: "...glymphatic system... flushes away toxic metabolic byproducts, including amyloid-beta proteins..." -> Chọn A.'
      },
      {
        id: 'q101-28',
        num: 28,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART V: ADVANCED READING COMPREHENSION PASSAGE 2 (8 CÂU)',
        question: 'The word "it" in paragraph 3 refers to:',
        options: ['A. sleep debt', 'B. blue-light', 'C. emotional regulation', 'D. modern society'],
        answer: 'A. sleep debt',
        grammarPoint: 'Đại từ thay thế',
        explanation: 'Step 1: "This self-inflicted sleep debt imposes severe physiological costs: it impairs emotional regulation..." -> "it" là sleep debt.'
      },
      {
        id: 'q101-29',
        num: 29,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART V: ADVANCED READING COMPREHENSION PASSAGE 2 (8 CÂU)',
        question: 'The word "myopic" in paragraph 4 is closest in meaning to:',
        options: ['A. short-sighted', 'B. long-term', 'C. generous', 'D. visionary'],
        answer: 'A. short-sighted',
        grammarPoint: 'Từ vựng học thuật (Phân hóa 8-10đ)',
        explanation: 'Step 1: "myopic" = thiển cận, tầm nhìn hạn hẹp = short-sighted.'
      },
      {
        id: 'q101-30',
        num: 30,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART V: ADVANCED READING COMPREHENSION PASSAGE 2 (8 CÂU)',
        question: 'Which of the following is NOT mentioned in paragraph 3 as a contributing factor to sleep loss?',
        options: [
          'A. Mandatory regular physical exercise routines outdoors',
          'B. High-pressure corporate and professional working cultures',
          'C. Ubiquitous blue-light emitting electronic screens',
          'D. The heavy proliferation of artificial stimulants'
        ],
        answer: 'A. Mandatory regular physical exercise routines outdoors',
        grammarPoint: 'Negative Fact Finding',
        explanation: 'Step 1: Đoạn 3 không hề đề cập đến tập thể dục ngoài trời.'
      },
      {
        id: 'q101-31',
        num: 31,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART V: ADVANCED READING COMPREHENSION PASSAGE 2 (8 CÂU)',
        question: 'Which of the following statements can be most reasonably inferred from the passage?',
        options: [
          'A. Chronic sleep deprivation can accelerate biological vulnerability to cognitive and immune impairment.',
          'B. Sleeping four hours every night is scientifically proven to double human innovation.',
          'C. Memories can only be consolidated when an individual is working at a computer screen.',
          'D. The brain loses 90% of its electrical activity during non-rapid eye movement sleep.'
        ],
        answer: 'A. Chronic sleep deprivation can accelerate biological vulnerability to cognitive and immune impairment.',
        grammarPoint: 'Inference Question (Phân hóa 8-10đ)',
        explanation: 'Step 1: Tổng hợp từ đoạn 2 và 3, thiếu ngủ làm tích tụ độc tố thần kinh và giảm tế bào miễn dịch.'
      },
      {
        id: 'q101-32',
        num: 32,
        sectionType: 'reading_comprehension',
        sectionTitle: 'PART V: ADVANCED READING COMPREHENSION PASSAGE 2 (8 CÂU)',
        question: 'Which of the following best summarizes the author’s tone and conclusion in the final paragraph?',
        options: [
          'A. Constructive and encouraging, advocating for sleep as an essential cognitive foundation',
          'B. Cynical and indifferent towards the challenges of modern industrial workplaces',
          'C. Melodramatic and hopeless regarding the future of human intelligence',
          'D. Purely aggressive and accusatory against high school teachers'
        ],
        answer: 'A. Constructive and encouraging, advocating for sleep as an essential cognitive foundation',
        grammarPoint: 'Thái độ của tác giả (Author’s Tone)',
        explanation: 'Step 1: Tác giả mang giọng văn xây dựng, tích cực (constructive and encouraging).'
      },

      // PHẦN VI: NGỮ ÂM & TRỌNG ÂM (PHONETICS & STRESS - 4 CÂU)
      {
        id: 'q101-33',
        num: 33,
        sectionType: 'pronunciation',
        sectionTitle: 'PART VI: PRONUNCIATION & STRESS (4 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the word whose underlined part differs from the other three in pronunciation:',
        options: ['A. watch<u>ed</u>', 'B. clean<u>ed</u>', 'C. play<u>ed</u>', 'D. stay<u>ed</u>'],
        answer: 'A. watch<u>ed</u>',
        underlinedPart: 'ed',
        grammarPoint: 'Quy tắc phát âm đuôi -ed',
        explanation: 'Step 1: "watched" phát âm là /t/ vì tận cùng là âm vô thanh /tʃ/. Ba từ còn lại phát âm là /d/.'
      },
      {
        id: 'q101-34',
        num: 34,
        sectionType: 'pronunciation',
        sectionTitle: 'PART VI: PRONUNCIATION & STRESS (4 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the word whose underlined part differs from the other three in pronunciation:',
        options: ['A. br<u>ea</u>k', 'B. sp<u>ea</u>k', 'C. cl<u>ea</u>n', 'D. t<u>ea</u>ch'],
        answer: 'A. br<u>ea</u>k',
        underlinedPart: 'ea',
        grammarPoint: 'Phát âm nguyên âm đôi ea',
        explanation: 'Step 1: "break" phát âm là /eɪ/. Ba từ còn lại phát âm là /iː/.'
      },
      {
        id: 'q101-35',
        num: 35,
        sectionType: 'pronunciation',
        sectionTitle: 'PART VI: PRONUNCIATION & STRESS (4 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the word that differs from the other three in the position of primary stress:',
        options: ['A. preserve', 'B. pollute', 'C. damage', 'D. protect'],
        answer: 'C. damage',
        grammarPoint: 'Trọng âm từ 2 âm tiết',
        explanation: 'Step 1: "damage" trọng âm 1. Ba từ còn lại trọng âm 2.'
      },
      {
        id: 'q101-36',
        num: 36,
        sectionType: 'pronunciation',
        sectionTitle: 'PART VI: PRONUNCIATION & STRESS (4 CÂU)',
        question: 'Mark the letter A, B, C, or D to indicate the word that differs from the other three in the position of primary stress:',
        options: ['A. renewable', 'B. environmental', 'C. diversity', 'D. ecological'],
        answer: 'A. renewable',
        grammarPoint: 'Trọng âm từ nhiều âm tiết',
        explanation: 'Step 1: "renewable" trọng âm rơi vào âm tiết thứ 2 /rɪˈnjuː.ə.bəl/.'
      },

      // PHẦN VII: GIAO TIẾP & NGỮ PHÁP TỪ VỰNG TRỌNG ĐIỂM (4 CÂU)
      {
        id: 'q101-37',
        num: 37,
        sectionType: 'lexico_grammar',
        sectionTitle: 'PART VII: LEXICO-GRAMMAR & SOCIAL EXCHANGES (4 CÂU)',
        question: 'Peter and Mary are talking about renewable energy:\n- Peter: "I believe solar and wind energy will completely replace fossil fuels within the next two decades."\n- Mary: "_______. Clean energy technologies are becoming significantly cheaper and more efficient every year."',
        options: [
          'A. I couldn’t agree with you more',
          'B. That’s completely untrue',
          'C. I’m afraid I have to disagree',
          'D. It’s none of your business'
        ],
        answer: 'A. I couldn’t agree with you more',
        grammarPoint: 'Chức năng giao tiếp: Đồng ý hoàn toàn',
        explanation: 'Step 1: Mary bổ sung bằng chứng ủng hộ -> Đồng ý hoàn toàn.'
      },
      {
        id: 'q101-38',
        num: 38,
        sectionType: 'lexico_grammar',
        sectionTitle: 'PART VII: LEXICO-GRAMMAR & SOCIAL EXCHANGES (4 CÂU)',
        question: 'If the government _______ stricter regulations on industrial effluent earlier, our local river wouldn’t be so severely polluted now.',
        options: ['A. had imposed', 'B. imposed', 'C. would impose', 'D. has imposed'],
        answer: 'A. had imposed',
        grammarPoint: 'Câu điều kiện trộn (Mixed Conditional 3 - 2)',
        explanation: 'Step 1: Giả thiết quá khứ ("earlier") -> If + had V3/ed; hệ quả hiện tại ("now") -> wouldn\'t be.'
      },
      {
        id: 'q101-39',
        num: 39,
        sectionType: 'lexico_grammar',
        sectionTitle: 'PART VII: LEXICO-GRAMMAR & SOCIAL EXCHANGES (4 CÂU)',
        question: 'The young entrepreneur decided to take the bull by the _______ and invest all her savings into developing a zero-waste packaging startup.',
        options: ['A. horns', 'B. tail', 'C. legs', 'D. eyes'],
        answer: 'A. horns',
        grammarPoint: 'Idioms: take the bull by the horns',
        explanation: 'Step 1: Thành ngữ "take the bull by the horns" = dũng cảm trực diện đương đầu khó khăn.'
      },
      {
        id: 'q101-40',
        num: 40,
        sectionType: 'lexico_grammar',
        sectionTitle: 'PART VII: LEXICO-GRAMMAR & SOCIAL EXCHANGES (4 CÂU)',
        question: 'Not until the investigative journalist published the evidence _______ the extent of the corporate tax fraud.',
        options: [
          'A. did the public realize',
          'B. the public realized',
          'C. has the public realized',
          'D. does the public realize'
        ],
        answer: 'A. did the public realize',
        grammarPoint: 'Đảo ngữ với Not until',
        explanation: 'Step 1: Not until + clause, trợ động từ + S + V nguyên mẫu -> did the public realize.'
      }
    ]
  },

  // ĐỀ THI 2: MÃ ĐỀ 102
  {
    id: 'thpt-mock-2026-102',
    title: 'Đề Khảo Sát Năng Lực Tiếng Anh THPT 2026 - Chuẩn Cấu Trúc Bộ GD&ĐT (Mã đề 102)',
    grade: 'Ôn thi Tốt nghiệp THPT',
    subject: 'Tiếng Anh',
    questionsCount: 40,
    duration: '50 phút',
    difficulty: 'Phân hóa cao',
    submissions: 0,
    avgScore: 0,
    assignedClasses: [],
    assignedClassIds: [],
    createdAt: '25/09/2026',
    status: 'Đang mở',
    topic: 'Global Success 11 & 12: Smart Cities, Bảo tồn di sản & Phương tiện giao thông xanh',
    questions: [] // will be cloned from 101 with tweaks
  },

  // ĐỀ THI 3: MÃ ĐỀ 103
  {
    id: 'thpt-mock-2026-103',
    title: 'Đề Thi Thử Tốt Nghiệp THPT Định Hướng 2026 - Đợt Khảo Sát 1 (Mã đề 103)',
    grade: 'Ôn thi Tốt nghiệp THPT',
    subject: 'Tiếng Anh',
    questionsCount: 40,
    duration: '50 phút',
    difficulty: 'Chuẩn Bộ 2026',
    submissions: 0,
    avgScore: 0,
    assignedClasses: [],
    assignedClassIds: [],
    createdAt: '25/09/2026',
    status: 'Đang mở',
    topic: 'Global Success 10 & 11: Protecting the Environment, Inventions & ASEAN Community',
    questions: []
  }
];

// Fill questions for 102 and 103 dynamically based on 101 template
THPT_INITIAL_EXAMS[1].questions = THPT_INITIAL_EXAMS[0].questions.map((q, idx) => ({
  ...q,
  id: `q102-${idx + 1}`
}));

THPT_INITIAL_EXAMS[2].questions = THPT_INITIAL_EXAMS[0].questions.map((q, idx) => ({
  ...q,
  id: `q103-${idx + 1}`
}));
