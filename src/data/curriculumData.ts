export interface GrammarTopic {
  id: string;
  name: string;
  category: string;
  description: string;
  recommendedGrade: string;
}

export interface UnitItem {
  unitNumber: number | string;
  unitName: string;
  theme: string;
  vocabularyFocus: string;
}

export interface GradeCurriculum {
  grade: string;
  gradeKey: string;
  level: 'THPT' | 'THCS' | 'Tiểu học';
  units: UnitItem[];
}

// 1. TẤT CẢ CÁC CHỦ ĐIỂM NGỮ PHÁP TRUNG HỌC PHỔ THÔNG (THPT)
export const THPT_GRAMMAR_CATEGORIES: { category: string; topics: GrammarTopic[] }[] = [
  {
    category: 'Các thì của động từ (Tenses)',
    topics: [
      {
        id: 'tenses-present',
        name: 'Thì Hiện tại hoàn thành vs Quá khứ đơn (Since/For, Just, Already)',
        category: 'Các thì của động từ (Tenses)',
        description: 'Phân biệt thì HTHT và QKĐ trong đề thi THPT, dấu hiệu nhận biết và cấu trúc Since/For.',
        recommendedGrade: 'Lớp 10',
      },
      {
        id: 'tenses-past',
        name: 'Quá khứ đơn, Quá khứ tiếp diễn & Quá khứ hoàn thành (When/While/By the time)',
        category: 'Các thì của động từ (Tenses)',
        description: 'Hành động xen vào trong quá khứ, trật tự thời gian xảy ra trước - sau.',
        recommendedGrade: 'Lớp 11',
      },
      {
        id: 'tenses-future',
        name: 'Các dạng tương lai: Will, Be going to, Tương lai tiếp diễn & Tương lai hoàn thành',
        category: 'Các thì của động từ (Tenses)',
        description: 'By next year, By the time + hiện tại đơn -> Tương lai hoàn thành (will have V3).',
        recommendedGrade: 'Lớp 12 - Luyện thi TN THPT',
      },
      {
        id: 'tenses-sequence',
        name: 'Sự phối hợp thì (Sequence of Tenses) trong câu phức',
        category: 'Các thì của động từ (Tenses)',
        description: 'Quy tắc hòa hợp thì giữa mệnh đề chính và mệnh đề trạng ngữ chỉ thời gian.',
        recommendedGrade: 'Lớp 12 - Luyện thi TN THPT',
      },
    ],
  },
  {
    category: 'Mệnh đề quan hệ (Relative Clauses)',
    topics: [
      {
        id: 'rel-clauses-basic',
        name: 'Đại từ và Trạng từ quan hệ (Who, Whom, Which, That, Whose, Where, When, Why)',
        category: 'Mệnh đề quan hệ (Relative Clauses)',
        description: 'Mệnh đề quan hệ xác định và không xác định, quy tắc dùng dấu phẩy và giới từ đi kèm.',
        recommendedGrade: 'Lớp 10',
      },
      {
        id: 'rel-clauses-reduced',
        name: 'Rút gọn mệnh đề quan hệ (V-ing / V3-ed / To-infinitive)',
        category: 'Mệnh đề quan hệ (Relative Clauses)',
        description: 'Dạng chủ động (V-ing), bị động (V3/ed), và sau số thứ tự/the first/the only (To V).',
        recommendedGrade: 'Lớp 11',
      },
      {
        id: 'rel-clauses-special',
        name: 'Mệnh đề quan hệ nối tiếp với Which & Giới từ đứng trước Đại từ quan hệ',
        category: 'Mệnh đề quan hệ (Relative Clauses)',
        description: 'Which thay thế cho cả mệnh đề phía trước; in which, to whom, of which.',
        recommendedGrade: 'Lớp 12 - Luyện thi TN THPT',
      },
    ],
  },
  {
    category: 'Câu điều kiện & Đảo ngữ (Conditionals & Inversion)',
    topics: [
      {
        id: 'cond-1-2-3',
        name: 'Câu điều kiện loại 1, 2, 3 và Thể điều kiện hỗn hợp (Mixed Conditionals)',
        category: 'Câu điều kiện & Đảo ngữ (Conditionals & Inversion)',
        description: 'Điều kiện có thật, không có thật ở hiện tại/quá khứ và điều kiện kết hợp Quá khứ - Hiện tại.',
        recommendedGrade: 'Lớp 11',
      },
      {
        id: 'cond-inversion',
        name: 'Đảo ngữ câu điều kiện (Should / Were / Had... + S...)',
        category: 'Câu điều kiện & Đảo ngữ (Conditionals & Inversion)',
        description: 'Should + S + V; Were + S + to V / Were S...; Had + S + V3.',
        recommendedGrade: 'Lớp 12 - Luyện thi TN THPT',
      },
      {
        id: 'cond-without-if',
        name: 'Các cấu trúc tương đương If: Unless, But for, Without, Provided that, As long as',
        category: 'Câu điều kiện & Đảo ngữ (Conditionals & Inversion)',
        description: 'But for / Without + N/V-ing, S + would have V3.',
        recommendedGrade: 'Lớp 12 - Luyện thi TN THPT',
      },
    ],
  },
  {
    category: 'Câu bị động (Passive Voice)',
    topics: [
      {
        id: 'pass-special',
        name: 'Câu bị động với động từ chỉ ý kiến/tường thuật (It is said that / S is said to V)',
        category: 'Câu bị động (Passive Voice)',
        description: 'People say that S + V -> S + be said to V / to have V3.',
        recommendedGrade: 'Lớp 11',
      },
      {
        id: 'pass-causative',
        name: 'Thể truyền khiến (Causative Form): Have / Get sth done & Have sb do / Get sb to do',
        category: 'Câu bị động (Passive Voice)',
        description: 'Nhờ vả, thuê mướn hoặc sự việc khách quan xảy đến với đối tượng.',
        recommendedGrade: 'Lớp 10',
      },
      {
        id: 'pass-verbs-preps',
        name: 'Bị động của cụm động từ (Phrasal Verbs) và động từ đi kèm 2 tân ngữ',
        category: 'Câu bị động (Passive Voice)',
        description: 'Give, send, offer; take care of, look after trong câu bị động.',
        recommendedGrade: 'Lớp 11',
      },
    ],
  },
  {
    category: 'Câu gián tiếp (Reported Speech)',
    topics: [
      {
        id: 'rep-statements-questions',
        name: 'Tường thuật câu kể, câu hỏi Yes/No và Wh-questions (Lùi thì & Đổi trạng từ)',
        category: 'Câu gián tiếp (Reported Speech)',
        description: 'Quy tắc lùi thì, biến đổi đại từ, thời gian và nơi chốn.',
        recommendedGrade: 'Lớp 10',
      },
      {
        id: 'rep-special-verbs',
        name: 'Động từ tường thuật đặc biệt: Suggest, Advise, Promise, Deny, Admit, Accuse of...',
        category: 'Câu gián tiếp (Reported Speech)',
        description: 'V + to V, V + sb + to V, V + V-ing, V + giới từ + V-ing.',
        recommendedGrade: 'Lớp 11',
      },
    ],
  },
  {
    category: 'Động từ khuyết thiếu (Modal Verbs)',
    topics: [
      {
        id: 'modals-basic',
        name: 'Động từ khuyết thiếu diễn tả sự bắt buộc, cấm đoán & cho phép (Must, Have to, May)',
        category: 'Động từ khuyết thiếu (Modal Verbs)',
        description: 'Mustn\'t vs Don\'t have to; Can, Could, May, Might.',
        recommendedGrade: 'Lớp 10',
      },
      {
        id: 'modals-perfect',
        name: 'Modal Perfect: Must have V3, Should have V3, Can\'t have V3, Might have V3',
        category: 'Động từ khuyết thiếu (Modal Verbs)',
        description: 'Dự đoán và phán đoán mức độ chắc chắn về sự việc trong quá khứ.',
        recommendedGrade: 'Lớp 12 - Luyện thi TN THPT',
      },
    ],
  },
  {
    category: 'Cấu trúc so sánh & Câu chẻ (Comparison & Cleft Sentences)',
    topics: [
      {
        id: 'comp-double',
        name: 'So sánh kép: The more... the more... (Càng... càng...)',
        category: 'Cấu trúc so sánh & Câu chẻ (Comparison & Cleft Sentences)',
        description: 'The + comparative + S + V, The + comparative + S + V.',
        recommendedGrade: 'Lớp 11',
      },
      {
        id: 'cleft-sentences',
        name: 'Câu chẻ nhấn mạnh: It is / was + Chủ ngữ/Tân ngữ/Trạng ngữ + that...',
        category: 'Cấu trúc so sánh & Câu chẻ (Comparison & Cleft Sentences)',
        description: 'Nhấn mạnh thành phần câu trọng tâm.',
        recommendedGrade: 'Lớp 10',
      },
    ],
  },
  {
    category: 'Đảo ngữ nâng cao (Inversion)',
    topics: [
      {
        id: 'inv-negative',
        name: 'Đảo ngữ với trạng từ phủ định: Never, Rarely, Seldom, Little, Hardly... when...',
        category: 'Đảo ngữ nâng cao (Inversion)',
        description: 'Hardly / Scarcely had S V3 when S V2; No sooner had S V3 than S V2.',
        recommendedGrade: 'Lớp 12 - Luyện thi TN THPT',
      },
      {
        id: 'inv-only-notuntil',
        name: 'Đảo ngữ với Only after, Only when, Only by, Not until, Not only... but also...',
        category: 'Đảo ngữ nâng cao (Inversion)',
        description: 'Mệnh đề đảo ngữ đặt ở vế thứ hai; Not until... did S V.',
        recommendedGrade: 'Lớp 12 - Luyện thi TN THPT',
      },
    ],
  },
  {
    category: 'Cụm động từ & Cụm từ cố định (Phrasal Verbs & Collocations)',
    topics: [
      {
        id: 'phrasal-verbs-highschool',
        name: 'Cụm động từ (Phrasal Verbs) thường gặp trong đề thi THPT Quốc gia',
        category: 'Cụm động từ & Cụm từ cố định (Phrasal Verbs & Collocations)',
        description: 'Bring about, carry out, give up, look forward to, put off, turn down...',
        recommendedGrade: 'Lớp 12 - Luyện thi TN THPT',
      },
      {
        id: 'collocations-highschool',
        name: 'Collocations & Thành ngữ (Idioms) chuẩn ma trận Bộ GD&ĐT',
        category: 'Cụm động từ & Cụm từ cố định (Phrasal Verbs & Collocations)',
        description: 'Make a decision, take responsibility, pay attention, break a leg...',
        recommendedGrade: 'Lớp 12 - Luyện thi TN THPT',
      },
    ],
  },
  {
    category: 'Ngữ âm & Trọng âm (Phonetics & Word Stress)',
    topics: [
      {
        id: 'pronunciation-ed-s',
        name: 'Quy tắc phát âm đuôi -ed (/t/, /d/, /ɪd/) và đuôi -s/es (/s/, /z/, /ɪz/)',
        category: 'Ngữ âm & Trọng âm (Phonetics & Word Stress)',
        description: 'Các trường hợp đặc biệt: wicked, naked, beloved; quy tắc âm vô thanh/hữu thanh.',
        recommendedGrade: 'Lớp 10',
      },
      {
        id: 'stress-2-3-syllables',
        name: 'Quy tắc trọng âm từ 2, 3 và 4 âm tiết (Hậu tố -tion, -ic, -ity, -ee, tiền tố)',
        category: 'Ngữ âm & Trọng âm (Phonetics & Word Stress)',
        description: 'Trọng âm danh từ/tính từ 2 âm tiết nhấn âm 1, động từ nhấn âm 2; các ngoại lệ.',
        recommendedGrade: 'Lớp 12 - Luyện thi TN THPT',
      },
    ],
  },
  {
    category: 'Mạo từ, Giới từ & Danh động từ (Articles, Prepositions & Gerunds)',
    topics: [
      {
        id: 'articles-a-an-the',
        name: 'Mạo từ A, An, The và Zero Article (Các trường hợp đặc biệt không dùng mạo từ)',
        category: 'Mạo từ, Giới từ & Danh động từ (Articles, Prepositions & Gerunds)',
        description: 'Tên đại dương, dãy núi, nhạc cụ, bữa ăn, danh từ số nhiều nói chung.',
        recommendedGrade: 'Lớp 10',
      },
      {
        id: 'gerund-infinitive',
        name: 'Danh động từ (V-ing) và Động từ nguyên mẫu (To-V / V-bare)',
        category: 'Mạo từ, Giới từ & Danh động từ (Articles, Prepositions & Gerunds)',
        description: 'Stop, remember, forget, regret, try, mean đi với V-ing vs To-V.',
        recommendedGrade: 'Lớp 11',
      },
      {
        id: 'subjunctive-mood',
        name: 'Thể giả định (Subjunctive Mood): S + suggest/demand/recommend that S + (should) V-bare',
        category: 'Mạo từ, Giới từ & Danh động từ (Articles, Prepositions & Gerunds)',
        description: 'It is essential / important that S (should) do sth.',
        recommendedGrade: 'Lớp 12 - Luyện thi TN THPT',
      },
    ],
  },
];

// 2. TỪ VỰNG THEO CHỦ ĐỀ & CÁC UNIT TRONG BỘ SÁCH GLOBAL SUCCESS (LỚP 1 - 12)
export const GLOBAL_SUCCESS_CURRICULUM: GradeCurriculum[] = [
  // LỚP 12
  {
    grade: 'Lớp 12',
    gradeKey: '12',
    level: 'THPT',
    units: [
      { unitNumber: 1, unitName: 'Life Stories We Admire', theme: 'Tiểu sử danh nhân & Những câu chuyện truyền cảm hứng', vocabularyFocus: 'admire, dedicated, achievement, perseverance, legacy, biography' },
      { unitNumber: 2, unitName: 'A Multicultural World', theme: 'Bản sắc văn hóa & Thế giới đa văn hóa', vocabularyFocus: 'diversity, multicultural, cultural identity, assimilation, integration, customs' },
      { unitNumber: 3, unitName: 'Green Living', theme: 'Lối sống xanh & Bảo vệ môi trường bền vững', vocabularyFocus: 'carbon footprint, sustainable, eco-friendly, energy-efficient, waste disposal' },
      { unitNumber: 4, unitName: 'Urbanisation', theme: 'Đô thị hóa & Sự phát triển thành phố', vocabularyFocus: 'urban sprawl, infrastructure, migration, overcrowding, high-rise, modernization' },
      { unitNumber: 5, unitName: 'The World Of Work', theme: 'Thị trường việc làm & Cơ hội nghề nghiệp tương lai', vocabularyFocus: 'curriculum vitae, job market, qualified, apprenticeship, workplace, salary' },
      { unitNumber: 6, unitName: 'Artificial Intelligence', theme: 'Trí tuệ nhân tạo & Kỷ nguyên công nghệ số', vocabularyFocus: 'automation, algorithm, robotics, machine learning, virtual reality, intelligence' },
      { unitNumber: 7, unitName: 'Environmental Protection', theme: 'Bảo vệ tài nguyên & Đa dạng sinh học', vocabularyFocus: 'biodiversity, conservation, endangered, habitat loss, deforestation, ecosystem' },
      { unitNumber: 8, unitName: 'Career Paths', theme: 'Định hướng lộ trình sự nghiệp tương lai', vocabularyFocus: 'career prospective, vocational, professional skills, job security, freelance' },
      { unitNumber: 9, unitName: 'Lifelong Learning', theme: 'Học tập suốt đời & Phát triển bản thân', vocabularyFocus: 'self-directed, lifelong learner, acquire knowledge, self-motivated, adapt' },
      { unitNumber: 10, unitName: 'The Media', theme: 'Phương tiện truyền thông & Báo chí hiện đại', vocabularyFocus: 'broadcast, mass media, journalism, social networking, cyberbullying, reliable source' },
    ],
  },

  // LỚP 11
  {
    grade: 'Lớp 11',
    gradeKey: '11',
    level: 'THPT',
    units: [
      { unitNumber: 1, unitName: 'A Long And Healthy Life', theme: 'Sức khỏe & Tuổi thọ', vocabularyFocus: 'longevity, nutritious, physical fitness, immune system, bacterial, treatment' },
      { unitNumber: 2, unitName: 'The Generation Gap', theme: 'Khoảng cách thế hệ & Giao tiếp gia đình', vocabularyFocus: 'generation gap, perspective, conflict, viewpoint, mutual understanding, curfew' },
      { unitNumber: 3, unitName: 'Cities Of The Future', theme: 'Thành phố tương lai & Đô thị thông minh', vocabularyFocus: 'smart city, liveable, pedestrian, solar-powered, sensor, green space' },
      { unitNumber: 4, unitName: 'ASEAN And Viet Nam', theme: 'Cộng đồng các quốc gia Đông Nam Á', vocabularyFocus: 'charter, solidarity, integration, Association of Southeast Asian Nations, diplomatic' },
      { unitNumber: 5, unitName: 'Global Warming', theme: 'Biến đổi khí hậu & Hiện tượng ấm lên toàn cầu', vocabularyFocus: 'greenhouse gases, global warming, emissions, renewable energy, catastrophic' },
      { unitNumber: 6, unitName: 'Preserving Our Heritage', theme: 'Bảo tồn di sản văn hóa dân tộc', vocabularyFocus: 'intangible heritage, monument, restoration, historical value, folk culture' },
      { unitNumber: 7, unitName: 'Education Options For School-Leavers', theme: 'Lựa chọn học tập sau tốt nghiệp THPT', vocabularyFocus: 'higher education, bachelor degree, vocational college, gap year, scholarship' },
      { unitNumber: 8, unitName: 'Becoming Independent', theme: 'Rèn luyện tính tự lập cho thanh thiếu niên', vocabularyFocus: 'self-reliance, time management, decision making, independent, coping skills' },
      { unitNumber: 9, unitName: 'Social Issues', theme: 'Các vấn đề xã hội: Bắt nạt, Bất bình đẳng, Tệ nạn', vocabularyFocus: 'cyberbullying, poverty, peer pressure, discrimination, awareness campaign' },
      { unitNumber: 10, unitName: 'The Ecosystem', theme: 'Hệ sinh thái & Cân bằng tự nhiên', vocabularyFocus: 'flora and fauna, marine life, food chain, organism, equilibrium, coral reef' },
    ],
  },

  // LỚP 10
  {
    grade: 'Lớp 10',
    gradeKey: '10',
    level: 'THPT',
    units: [
      { unitNumber: 1, unitName: 'Family Life', theme: 'Đời sống gia đình & Trách nhiệm chia sẻ việc nhà', vocabularyFocus: 'household chores, breadwinner, homemaker, division of labour, family bond' },
      { unitNumber: 2, unitName: 'Humans And The Environment', theme: 'Con người và môi trường sống xung quanh', vocabularyFocus: 'carbon footprint, eco-friendly, appliance, pollutant, awareness, chemical' },
      { unitNumber: 3, unitName: 'Music', theme: 'Âm nhạc, Nhạc cụ & Các dòng nghệ thuật', vocabularyFocus: 'composer, audition, idol, performance, release, rhythm, instrument' },
      { unitNumber: 4, unitName: 'For A Better Community', theme: 'Hoạt động tình nguyện & Giúp đỡ cộng đồng', vocabularyFocus: 'volunteer, donation, community development, charitable, underprivileged, orphan' },
      { unitNumber: 5, unitName: 'Inventions', theme: 'Các phát minh vĩ đại & Tiến bộ công nghệ', vocabularyFocus: 'invention, smartphone, portable, 3D printing, convenient, artificial, discovery' },
      { unitNumber: 6, unitName: 'Gender Equality', theme: 'Bình đẳng giới & Quyền lợi phụ nữ', vocabularyFocus: 'equality, discrimination, equal opportunity, career barrier, wage gap, rights' },
      { unitNumber: 7, unitName: 'Viet Nam And International Organisations', theme: 'Việt Nam & Các tổ chức Quốc tế (UN, UNICEF, WTO)', vocabularyFocus: 'United Nations, UNICEF, peacekeeping, trade partner, cooperation, economy' },
      { unitNumber: 8, unitName: 'New Ways To Learn', theme: 'Phương pháp học tập mới: Blended, Online learning', vocabularyFocus: 'blended learning, tablet, distance education, interactive, educational app' },
      { unitNumber: 9, unitName: 'Protecting The Environment', theme: 'Bảo vệ nguồn tài nguyên thiên nhiên', vocabularyFocus: 'wildlife, illegal hunting, habitat, environmentalist, extinction, conservation' },
      { unitNumber: 10, unitName: 'Ecotourism', theme: 'Du lịch sinh thái & Du lịch có trách nhiệm', vocabularyFocus: 'ecotourism, destination, cultural immersion, sustainable tourism, souvenir' },
    ],
  },

  // LỚP 9
  {
    grade: 'Lớp 9',
    gradeKey: '9',
    level: 'THCS',
    units: [
      { unitNumber: 1, unitName: 'Local Community', theme: 'Cộng đồng địa phương & Nghề thủ công truyền thống', vocabularyFocus: 'artisan, handicraft, workshop, specialty, authentic, pottery' },
      { unitNumber: 2, unitName: 'City Life', theme: 'Cuộc sống nơi thành thị & Phương tiện công cộng', vocabularyFocus: 'cosmopolitan, bustling, public transport, drawback, metro, convenience' },
      { unitNumber: 3, unitName: 'Healthy Living For Teens', theme: 'Lối sống lành mạnh & Kiểm soát áp lực', vocabularyFocus: 'counsellor, stress management, balanced diet, mental health, workout' },
      { unitNumber: 4, unitName: 'Remembering The Past', theme: 'Ký ức thời gian & Nét văn hóa xưa', vocabularyFocus: 'tradition, pass down, nuclear family, extended family, preserve' },
      { unitNumber: 5, unitName: 'Our Experiences', theme: 'Những trải nghiệm đáng nhớ trong cuộc sống', vocabularyFocus: 'memorable, challenging, thrilling, unforgettable, adventure' },
      { unitNumber: 6, unitName: 'Viet Nam: Then And Now', theme: 'Việt Nam: Ngày ấy và bây giờ', vocabularyFocus: 'transformation, thatched house, tram car, infrastructure, modernization' },
      { unitNumber: 7, unitName: 'Natural Wonders Of The World', theme: 'Kỳ quan thiên nhiên thế giới', vocabularyFocus: 'breathtaking, limestone karsts, stalactite, cave system, magnificent' },
      { unitNumber: 8, unitName: 'Tourism', theme: 'Ngành du lịch & Khám phá địa danh', vocabularyFocus: 'guided tour, itinerary, package holiday, breathtaking view, souvenir' },
      { unitNumber: 9, unitName: 'World Englishes', theme: 'Tiếng Anh trên toàn cầu & Các phương ngữ', vocabularyFocus: 'mother tongue, bilingual, accent, dialect, global language' },
      { unitNumber: 10, unitName: 'Planet Earth', theme: 'Hành tinh Trái Đất & Vũ trụ', vocabularyFocus: 'atmosphere, celestial, galaxy, gravity, satellite, orbit' },
      { unitNumber: 11, unitName: 'Electronic Devices', theme: 'Thiết bị điện tử trong cuộc sống hàng ngày', vocabularyFocus: 'gadget, wearable, automated, voice command, software' },
      { unitNumber: 12, unitName: 'Career Choices', theme: 'Lựa chọn ngành nghề tương lai', vocabularyFocus: 'occupation, qualification, salary, prospective, job application' },
    ],
  },

  // LỚP 8
  {
    grade: 'Lớp 8',
    gradeKey: '8',
    level: 'THCS',
    units: [
      { unitNumber: 1, unitName: 'Leisure Time', theme: 'Thời gian rảnh rỗi & Sở thích cá nhân', vocabularyFocus: 'origami, knitting, DIY project, surfing the net, leisure activity' },
      { unitNumber: 2, unitName: 'Life In The Countryside', theme: 'Cuộc sống bình yên ở miền quê', vocabularyFocus: 'peaceful, harvest time, vast paddy field, hospitable, cattle, herd' },
      { unitNumber: 3, unitName: 'Teenagers', theme: 'Độ tuổi thanh thiếu niên & Câu lạc bộ học đường', vocabularyFocus: 'peer pressure, school club, upload, forum, bully, adolescence' },
      { unitNumber: 4, unitName: 'Ethnic Groups Of Viet Nam', theme: 'Các dân tộc anh em tại Việt Nam', vocabularyFocus: 'ethnic minority, stilt house, terraced field, unique costume, festive' },
      { unitNumber: 5, unitName: 'Our Customs And Traditions', theme: 'Phong tục tập quán & Lễ hội truyền thống', vocabularyFocus: 'table manners, ancestral worship, custom, folklore, generation' },
      { unitNumber: 6, unitName: 'Lifestyles', theme: 'Phong cách sống & Thói quen văn hóa', vocabularyFocus: 'healthy lifestyle, digital nomad, minimalist, urban living, nomadic' },
      { unitNumber: 7, unitName: 'Environmental Protection', theme: 'Bảo vệ nguồn nước và bầu không khí', vocabularyFocus: 'pollutant, deforestation, wildlife habitat, recycle, eco-friendly' },
      { unitNumber: 8, unitName: 'Shopping', theme: 'Mua sắm & Siêu thị hiện đại', vocabularyFocus: 'bargain, supermarket, discount, customer service, cash, e-wallet' },
      { unitNumber: 9, unitName: 'Natural Disasters', theme: 'Thiên tai & Ứng phó thời tiết cực đoan', vocabularyFocus: 'flood, typhoon, earthquake, tsunami, evacuation, relief supplies' },
      { unitNumber: 10, unitName: 'Communication In The Future', theme: 'Phương thức giao tiếp trong tương lai', vocabularyFocus: 'telepathy, holography, video conference, instant messaging, device' },
      { unitNumber: 11, unitName: 'Science And Technology', theme: 'Khoa học công nghệ & Những phát minh', vocabularyFocus: 'scientific breakthrough, laboratory, artificial, automated, explore' },
      { unitNumber: 12, unitName: 'Life On Other Planets', theme: 'Sự sống ngoài Trái Đất & Thám hiểm không gian', vocabularyFocus: 'alien, UFO, space shuttle, solar system, telescope, astronaut' },
    ],
  },

  // LỚP 7
  {
    grade: 'Lớp 7',
    gradeKey: '7',
    level: 'THCS',
    units: [
      { unitNumber: 1, unitName: 'Hobbies', theme: 'Sở thích & Thu thập đồ sưu tầm', vocabularyFocus: 'gardening, horse riding, model making, collecting stamps, coin' },
      { unitNumber: 2, unitName: 'Healthy Living', theme: 'Lối sống và thói quen sinh hoạt lành mạnh', vocabularyFocus: 'sunburn, acne, allergy, diet, exercise, vitamin, health tips' },
      { unitNumber: 3, unitName: 'Community Service', theme: 'Phục vụ cộng đồng & Hoạt động thiện nguyện', vocabularyFocus: 'community service, nursing home, tutor, donate, homeless people' },
      { unitNumber: 4, unitName: 'Music And Arts', theme: 'Âm nhạc và Mỹ thuật', vocabularyFocus: 'exhibition, painting, portrait, folk music, composer, gallery' },
      { unitNumber: 5, unitName: 'Food And Drink', theme: 'Ẩm thực, Món ăn & Đồ uống truyền thống', vocabularyFocus: 'ingredient, beef noodle soup, spring roll, recipe, sweet, sour' },
      { unitNumber: 6, unitName: 'A Visit To A School', theme: 'Thăm trường học & Di tích Quốc Tử Giám', vocabularyFocus: 'temple of literature, historical site, scholar, stone stela, diploma' },
      { unitNumber: 7, unitName: 'Traffic', theme: 'Giao thông & Luật an toàn đường bộ', vocabularyFocus: 'pedestrian crossing, helmet, traffic jam, vehicle, seat belt, fine' },
      { unitNumber: 8, unitName: 'Films', theme: 'Phim ảnh & Các thể loại điện ảnh', vocabularyFocus: 'comedy, science fiction, animation, review, plot, star, audience' },
      { unitNumber: 9, unitName: 'Festivals Around The World', theme: 'Lễ hội độc đáo trên khắp thế giới', vocabularyFocus: 'carnival, parade, pumpkin, celebration, feast, religious festival' },
      { unitNumber: 10, unitName: 'Energy Sources', theme: 'Nguồn năng lượng & Tiết kiệm điện năng', vocabularyFocus: 'solar energy, wind power, fossil fuel, non-renewable, electricity' },
      { unitNumber: 11, unitName: 'Travelling In The Future', theme: 'Phương tiện di chuyển trong tương lai', vocabularyFocus: 'flying car, bullet train, solar-powered car, hyperloop, driverless' },
      { unitNumber: 12, unitName: 'An English-Speaking World', theme: 'Các quốc gia nói tiếng Anh trên thế giới', vocabularyFocus: 'native speaker, kangaroo, maple leaf, kilt, statue of liberty, continent' },
    ],
  },

  // LỚP 6
  {
    grade: 'Lớp 6',
    gradeKey: '6',
    level: 'THCS',
    units: [
      { unitNumber: 1, unitName: 'My New School', theme: 'Ngôi trường mới của em & Dụng cụ học tập', vocabularyFocus: 'calculator, compass, uniform, library, boarding school, smart' },
      { unitNumber: 2, unitName: 'My House', theme: 'Ngôi nhà thân yêu & Các phòng chức năng', vocabularyFocus: 'living room, country house, villa, balcony, furniture, appliance' },
      { unitNumber: 3, unitName: 'My Friends', theme: 'Bạn bè & Tính cách con người', vocabularyFocus: 'confident, sporty, creative, caring, cheerful, hard-working' },
      { unitNumber: 4, unitName: 'My Neighbourhood', theme: 'Khu phố nơi em sống', vocabularyFocus: 'convenient, peaceful, noisy, square, railway station, pharmacy' },
      { unitNumber: 5, unitName: 'Natural Wonders Of Viet Nam', theme: 'Kỳ quan thiên nhiên Việt Nam', vocabularyFocus: 'island, waterfall, mountain, forest, desert, wonderful, landscape' },
      { unitNumber: 6, unitName: 'Our Tet Holiday', theme: 'Ngày Tết cổ truyền Việt Nam', vocabularyFocus: 'lucky money, peach blossom, fireworks, family gathering, apricot blossom' },
      { unitNumber: 7, unitName: 'Television', theme: 'Truyền hình & Các chương trình giải trí', vocabularyFocus: 'animated film, comedy, game show, educational, viewer, channel' },
      { unitNumber: 8, unitName: 'Sports And Games', theme: 'Thể thao & Trò chơi vận động', vocabularyFocus: 'aerobics, badminton, equipment, gym, medal, champion, court' },
      { unitNumber: 9, unitName: 'Cities Of The World', theme: 'Các thành phố nổi tiếng thế giới', vocabularyFocus: 'landmark, palace, tower, postcard, crowded, famous, modern' },
      { unitNumber: 10, unitName: 'Our Houses In The Future', theme: 'Ngôi nhà tương lai & Thiết bị thông minh', vocabularyFocus: 'houseboat, solar energy, appliance, UFO house, smart robot' },
      { unitNumber: 11, unitName: 'Our Greener World', theme: 'Hành tinh xanh: Reduce, Reuse, Recycle', vocabularyFocus: 'pollution, container, plastic bag, reuse, environment, green club' },
      { unitNumber: 12, unitName: 'Robots', theme: 'Robot & Trợ lý thông minh', vocabularyFocus: 'ironing robot, guard, voice recognition, housework robot, capability' },
    ],
  },

  // TIỂU HỌC: LỚP 5
  {
    grade: 'Lớp 5',
    gradeKey: '5',
    level: 'Tiểu học',
    units: [
      { unitNumber: 1, unitName: 'All About Me', theme: 'Bản thân, gia đình và quê hương', vocabularyFocus: 'address, hometown, peaceful, flat, lane, tower, district' },
      { unitNumber: 2, unitName: 'Our School', theme: 'Trường học, lớp học và bạn bè', vocabularyFocus: 'classroom, computer room, floor, playground, favourite subjects' },
      { unitNumber: 3, unitName: 'My Foreign Friends', theme: 'Bạn bè quốc tế & Các quốc gia', vocabularyFocus: 'nationality, Australian, Malaysian, American, Japanese, Vietnamese' },
      { unitNumber: 4, unitName: 'Our Free-time Activities', theme: 'Hoạt động thời gian rảnh rỗi', vocabularyFocus: 'ride a bike, go fishing, read books, watch cartoons, play chess' },
      { unitNumber: 5, unitName: 'My Future Job', theme: 'Nghề nghiệp mơ ước tương lai', vocabularyFocus: 'architect, pilot, doctor, writer, astronaut, look after' },
      { unitNumber: 6, unitName: 'Our School Picnic', theme: 'Chuyến dã ngoại của trường', vocabularyFocus: 'picnic, tent, campsite, countryside, delicious food, play games' },
      { unitNumber: 7, unitName: 'Our Favourite Sports And Games', theme: 'Thể thao và trò chơi yêu thích', vocabularyFocus: 'table tennis, swimming, football, basketball, skipping rope' },
      { unitNumber: 8, unitName: 'At The Zoo', theme: 'Tham quan vườn thú & Động vật hoang dã', vocabularyFocus: 'peacock, gorilla, elephant, python, move quickly, roaring' },
      { unitNumber: 9, unitName: 'Our Outdoor Activities', theme: 'Hoạt động dã ngoại ngoài trời', vocabularyFocus: 'hide and seek, build sandcastles, roller-skating, kite flying' },
      { unitNumber: 10, unitName: 'Our School Trip', theme: 'Chuyến tham quan học tập', vocabularyFocus: 'historical site, museum, pagoda, wonderful, take photos' },
    ],
  },

  // TIỂU HỌC: LỚP 4
  {
    grade: 'Lớp 4',
    gradeKey: '4',
    level: 'Tiểu học',
    units: [
      { unitNumber: 1, unitName: 'My Friends', theme: 'Gặp gỡ và làm quen bạn bè', vocabularyFocus: 'hello, welcome, country, classmate, friendly, nice to meet you' },
      { unitNumber: 2, unitName: 'Time And Daily Routines', theme: 'Thời gian & Thói quen hàng ngày', vocabularyFocus: 'o\'clock, have breakfast, go to school, get up, in the morning' },
      { unitNumber: 3, unitName: 'My Week', theme: 'Các ngày trong tuần & Hoạt động', vocabularyFocus: 'Monday, Tuesday, Wednesday, weekend, swimming class, art club' },
      { unitNumber: 4, unitName: 'My Birthday Party', theme: 'Bữa tiệc sinh nhật & Tháng trong năm', vocabularyFocus: 'birthday, January, June, December, party, gift, invite' },
      { unitNumber: 5, unitName: 'Things We Can Do', theme: 'Khả năng cá nhân (Can / Can\'t)', vocabularyFocus: 'ride a horse, swim, play the guitar, dance, skate, speak English' },
      { unitNumber: 6, unitName: 'Our School Facilities', theme: 'Cơ sở vật chất trường học', vocabularyFocus: 'library, music room, gym, playground, big, modern, clean' },
      { unitNumber: 7, unitName: 'Our Timetables', theme: 'Thời khóa biểu các môn học', vocabularyFocus: 'Maths, Science, English, Music, Art, PE, history, once a week' },
      { unitNumber: 8, unitName: 'My Favourite Subjects', theme: 'Môn học yêu thích nhất', vocabularyFocus: 'interesting, fun, favourite, because, learn about numbers' },
      { unitNumber: 9, unitName: 'Our Sports Day', theme: 'Ngày hội thể thao trường học', vocabularyFocus: 'sports day, running race, tug of war, join in, win, stadium' },
      { unitNumber: 10, unitName: 'Our Summer Holidays', theme: 'Kỳ nghỉ hè tuyệt vời', vocabularyFocus: 'beach, Da Nang, island, swim in the sea, delicious seafood' },
    ],
  },

  // TIỂU HỌC: LỚP 3
  {
    grade: 'Lớp 3',
    gradeKey: '3',
    level: 'Tiểu học',
    units: [
      { unitNumber: 1, unitName: 'Hello', theme: 'Chào hỏi & Giới thiệu tên', vocabularyFocus: 'Hello, Hi, Name, Nice to meet you, How are you, Fine' },
      { unitNumber: 2, unitName: 'Our Names', theme: 'Tên gọi & Đánh vần chữ cái', vocabularyFocus: 'spell, letters, boy, girl, what is your name, alphabet' },
      { unitNumber: 3, unitName: 'Our Friends', theme: 'Giới thiệu bạn bè', vocabularyFocus: 'this is my friend, who is that, she is, he is, classmates' },
      { unitNumber: 4, unitName: 'Our Bodies', theme: 'Bộ phận cơ thể con người', vocabularyFocus: 'eye, nose, mouth, ear, face, touch your hair, open your mouth' },
      { unitNumber: 5, unitName: 'My Hobbies', theme: 'Sở thích tuổi thơ', vocabularyFocus: 'singing, drawing, dancing, cooking, running, swimming' },
      { unitNumber: 6, unitName: 'Our School', theme: 'Trường học của em', vocabularyFocus: 'school, classroom, library, playground, computer room, big, small' },
      { unitNumber: 7, unitName: 'Classroom Instructions', theme: 'Hiệu lệnh trong lớp học', vocabularyFocus: 'stand up, sit down, open your book, close your book, be quiet' },
      { unitNumber: 8, unitName: 'My School Things', theme: 'Đồ dùng học tập', vocabularyFocus: 'pen, pencil, ruler, school bag, eraser, notebook, pencil case' },
      { unitNumber: 9, unitName: 'Colours', theme: 'Màu sắc quen thuộc', vocabularyFocus: 'red, blue, yellow, green, black, white, orange, brown' },
      { unitNumber: 10, unitName: 'Break Time Activities', theme: 'Giờ ra chơi nhộn nhịp', vocabularyFocus: 'play chess, badminton, football, basketball, skipping, word puzzles' },
    ],
  },

  // TIỂU HỌC: LỚP 2
  {
    grade: 'Lớp 2',
    gradeKey: '2',
    level: 'Tiểu học',
    units: [
      { unitNumber: 1, unitName: 'At My Birthday Party', theme: 'Tiệc sinh nhật', vocabularyFocus: 'cake, candle, pizza, popcorn, present, balloons' },
      { unitNumber: 2, unitName: 'In The Backyard', theme: 'Trong sân sau', vocabularyFocus: 'kite, bike, kitten, ball, tree, play' },
      { unitNumber: 3, unitName: 'At The Seaside', theme: 'Bãi biển', vocabularyFocus: 'sail, sand, sea, sun, shell, swim' },
      { unitNumber: 4, unitName: 'In The Countryside', theme: 'Miền quê thanh bình', vocabularyFocus: 'rainbow, river, road, field, bird, boat' },
      { unitNumber: 5, unitName: 'In The Classroom', theme: 'Trong lớp học', vocabularyFocus: 'door, window, board, desk, chair, book' },
      { unitNumber: 6, unitName: 'On The Farm', theme: 'Nông trại vui vẻ', vocabularyFocus: 'horse, goat, sheep, cow, duck, farm' },
      { unitNumber: 7, unitName: 'In The Kitchen', theme: 'Trong nhà bếp', vocabularyFocus: 'jam, jelly, juice, milk, bread, cup' },
      { unitNumber: 8, unitName: 'In The Village', theme: 'Trong ngôi làng nhỏ', vocabularyFocus: 'van, village, volleyball, water, window' },
    ],
  },

  // TIỂU HỌC: LỚP 1
  {
    grade: 'Lớp 1',
    gradeKey: '1',
    level: 'Tiểu học',
    units: [
      { unitNumber: 1, unitName: 'In The School Playground', theme: 'Sân trường', vocabularyFocus: 'Bill, book, ball, bike, boy' },
      { unitNumber: 2, unitName: 'In The Dining Room', theme: 'Phòng ăn', vocabularyFocus: 'cake, car, cat, cup' },
      { unitNumber: 3, unitName: 'At The Street Market', theme: 'Chợ phố', vocabularyFocus: 'apple, bag, can, hat' },
      { unitNumber: 4, unitName: 'In The Bedroom', theme: 'Phòng ngủ', vocabularyFocus: 'door, duck, dog, desk' },
      { unitNumber: 5, unitName: 'At The Fish And Chip Shop', theme: 'Cửa hàng đồ ăn', vocabularyFocus: 'fish, chips, flag, fox' },
      { unitNumber: 6, unitName: 'In The Classroom', theme: 'Lớp học đầu tiên', vocabularyFocus: 'bell, pencil, pen, desk' },
      { unitNumber: 7, unitName: 'In The Garden', theme: 'Trong khu vườn', vocabularyFocus: 'gate, girl, goat, garden' },
      { unitNumber: 8, unitName: 'In The Park', theme: 'Công viên', vocabularyFocus: 'horse, hair, hand, head' },
    ],
  },
];
