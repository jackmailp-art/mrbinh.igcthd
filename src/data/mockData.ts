import { ClassItem, ExamItem, StudentItem, HomeworkTask, SubmissionItem } from '../types';

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: 'c-1790068920256',
    name: 'Lớp 12G09',
    grade: 'Lớp 12',
    code: 'AV-496',
    studentsCount: 38,
    activeExams: 2,
    pin: '4324',
    description: 'Lớp học tiếng Anh Lớp 12 - Thầy Dương Văn Bình'
  },
  {
    id: 'c-1790068920257',
    name: 'Lớp 11A1',
    grade: 'Lớp 11',
    code: 'AV-11A',
    studentsCount: 32,
    activeExams: 1,
    pin: '4827',
    description: 'Lớp học tiếng Anh Lớp 11 Ôn thi THPT'
  }
];

export const INITIAL_EXAMS: ExamItem[] = [
  {
    id: 'ex-1',
    title: 'Đề ôn tập: Thì Quá Khứ & Hiện Tại Hoàn Thành',
    grade: 'Lớp 10',
    subject: 'Tiếng Anh',
    questionsCount: 15,
    duration: '20 phút',
    difficulty: 'Trung bình',
    submissions: 36,
    avgScore: 8.2,
    createdAt: '20/09/2026',
    status: 'Đang mở',
    questions: [
      {
        id: 'q-1-1',
        num: 1,
        sectionType: 'pronunciation',
        sectionTitle: 'PART I: PRONUNCIATION & STRESS',
        question: 'Choose the word whose underlined part is pronounced differently from the others:',
        options: ['A. decid<u>ed</u>', 'B. wait<u>ed</u>', 'C. watch<u>ed</u>', 'D. invit<u>ed</u>'],
        answer: 'C. watch<u>ed</u>',
        underlinedPart: 'ed',
        ipaTranscription: 'watched: /wɒtʃt/ vs decided: /dɪˈsaɪ.dɪd/, waited: /ˈweɪ.tɪd/, invited: /ɪnˈvaɪ.tɪd/',
        explanation: "Đuôi '-ed' trong 'watched' /wɒtʃt/ phát âm là /t/ vì sau phụ âm vô thanh /tʃ/. Các từ còn lại phát âm là /ɪd/ vì tận cùng là /t/ hoặc /d/.",
        grammarPoint: 'Quy tắc phát âm đuôi -ed'
      },
      {
        id: 'q-1-2',
        num: 2,
        question: 'She _______ in this company for over five years before she moved to Da Nang.',
        options: ['A. worked', 'B. had worked', 'C. has worked', 'D. was working'],
        answer: 'B. had worked',
        explanation: 'Hành động làm việc đã xảy ra và kéo dài trước một mốc thời gian trong quá khứ ("before she moved"), do đó dùng thì quá khứ hoàn thành (Past Perfect).',
        grammarPoint: 'Thì Quá khứ hoàn thành (Past Perfect)'
      },
      {
        id: 'q-1-3',
        num: 3,
        question: 'I haven\'t heard from Nam since he _______ high school last summer.',
        options: ['A. graduated', 'B. has graduated', 'C. had graduated', 'D. was graduating'],
        answer: 'A. graduated',
        explanation: 'Cấu trúc với "since": Mệnh đề chính dùng Hiện tại hoàn thành (haven\'t heard), mệnh đề sau "since" dùng Quá khứ đơn (graduated).',
        grammarPoint: 'Cấu trúc Since trong các thì hoàn thành'
      },
      {
        id: 'q-1-4',
        num: 4,
        question: 'Choose the word that has the main stress placed differently from the others:',
        options: ['A. prevent', 'B. receive', 'C. happen', 'D. decide'],
        answer: 'C. happen',
        explanation: "'happen' có trọng âm rơi vào âm tiết thứ 1 /ˈhæp.ən/. Các từ còn lại đều có trọng âm rơi vào âm tiết thứ 2: prevent /prɪˈvent/, receive /rɪˈsiːv/, decide /dɪˈsaɪd/.",
        grammarPoint: 'Trọng âm từ 2 âm tiết'
      },
      {
        id: 'q-1-5',
        num: 5,
        question: 'They _______ to Paris three times so far this year.',
        options: ['A. went', 'B. have gone', 'C. have been', 'D. had gone'],
        answer: 'C. have been',
        explanation: "'have been to' chỉ trải nghiệm đã từng đến nơi nào đó rồi quay về. Dấu hiệu nhận biết: 'three times so far'.",
        grammarPoint: 'Phân biệt Have been to vs Have gone to'
      },
      {
        id: 'q-1-6',
        num: 6,
        question: 'By the time the fire brigade arrived, the neighbors _______ the fire.',
        options: ['A. put out', 'B. had put out', 'C. have put out', 'D. was putting out'],
        answer: 'B. had put out',
        explanation: 'Cấu trúc By the time + quá khứ đơn, quá khứ hoàn thành (had put out).',
        grammarPoint: 'Cấu trúc By the time'
      },
      {
        id: 'q-1-7',
        num: 7,
        question: 'He _______ his keys, so he couldn\'t get into the house yesterday evening.',
        options: ['A. lost', 'B. has lost', 'C. had lost', 'D. was losing'],
        answer: 'C. had lost',
        explanation: 'Hành động làm mất chìa khóa xảy ra trước thời điểm không vào được nhà trong quá khứ.',
        grammarPoint: 'Thì Quá khứ hoàn thành'
      },
      {
        id: 'q-1-8',
        num: 8,
        question: 'How long _______ you _______ for this international organization?',
        options: ['A. did / work', 'B. have / been working', 'C. had / worked', 'D. were / working'],
        answer: 'B. have / been working',
        explanation: 'Hỏi về khoảng thời gian kéo dài liên tục từ quá khứ đến hiện tại dùng Hiện tại hoàn thành tiếp diễn.',
        grammarPoint: 'Hiện tại hoàn thành tiếp diễn'
      },
      {
        id: 'q-1-9',
        num: 9,
        question: 'While Minh was studying in his room, his brother _______ video games.',
        options: ['A. played', 'B. was playing', 'C. has played', 'D. had played'],
        answer: 'B. was playing',
        explanation: 'Hai hành động diễn ra song song cùng lúc trong quá khứ dùng thì Quá khứ tiếp diễn với While.',
        grammarPoint: 'Hành động song song trong Quá khứ'
      },
      {
        id: 'q-1-10',
        num: 10,
        question: 'This is the first time I _______ such an inspiring lecture on environmental protection.',
        options: ['A. heard', 'B. have heard', 'C. had heard', 'D. hear'],
        answer: 'B. have heard',
        explanation: 'Cấu trúc It/This is the first time + S + have/has + V3/ed.',
        grammarPoint: 'Cấu trúc This is the first time'
      },
      {
        id: 'q-1-11',
        num: 11,
        question: 'When we reached the stadium, the football match _______.',
        options: ['A. already started', 'B. had already started', 'C. has already started', 'D. is starting'],
        answer: 'B. had already started',
        explanation: 'Trận đấu bắt đầu trước khi chúng tôi đến sân vận động, dùng Quá khứ hoàn thành.',
        grammarPoint: 'Thì Quá khứ hoàn thành với When'
      },
      {
        id: 'q-1-12',
        num: 12,
        question: 'Up to now, the team _______ five major green community projects.',
        options: ['A. completed', 'B. has completed', 'C. had completed', 'D. completes'],
        answer: 'B. has completed',
        explanation: "'Up to now' là dấu hiệu nhận biết của thì Hiện tại hoàn thành.",
        grammarPoint: 'Dấu hiệu nhận biết Hiện tại hoàn thành'
      },
      {
        id: 'q-1-13',
        num: 13,
        question: 'She _______ tired yesterday because she _______ late the previous night.',
        options: ['A. was / had worked', 'B. had been / worked', 'C. is / worked', 'D. was / has worked'],
        answer: 'A. was / had worked',
        explanation: 'Hành động thức khuya làm việc xảy ra trước (had worked) dẫn đến kết quả mệt mỏi ngày hôm qua (was).',
        grammarPoint: 'Nguyên nhân - kết quả trong quá khứ'
      },
      {
        id: 'q-1-14',
        num: 14,
        question: 'No sooner _______ home than the heavy rain began.',
        options: ['A. he arrived', 'B. had he arrived', 'C. did he arrive', 'D. he had arrived'],
        answer: 'B. had he arrived',
        explanation: 'Cấu trúc đảo ngữ: No sooner + had + S + V3/ed + than + S + V2/ed.',
        grammarPoint: 'Đảo ngữ với No sooner ... than'
      },
      {
        id: 'q-1-15',
        num: 15,
        question: 'We _______ each other since our elementary school days.',
        options: ['A. know', 'B. knew', 'C. have known', 'D. had known'],
        answer: 'C. have known',
        explanation: 'Động từ chỉ trạng thái tri giác "know" không chia tiếp diễn, dùng Hiện tại hoàn thành với "since".',
        grammarPoint: 'Hiện tại hoàn thành với State Verbs'
      }
    ]
  },
  {
    id: 'ex-2',
    title: 'Chuyên đề Mệnh Đề Quan Hệ (Relative Clauses)',
    grade: 'Lớp 12',
    subject: 'Tiếng Anh',
    questionsCount: 20,
    duration: '30 phút',
    difficulty: 'Vận dụng',
    submissions: 41,
    avgScore: 7.6,
    createdAt: '18/09/2026',
    status: 'Đang mở',
    questions: [
      {
        id: 'q-2-1',
        num: 1,
        question: 'The scientist _______ research led to this breakthrough received an international award.',
        options: ['A. who', 'B. whom', 'C. whose', 'D. which'],
        answer: 'C. whose',
        explanation: "'whose research' mang nghĩa sở hữu: nghiên cứu của nhà khoa học đó.",
        grammarPoint: 'Đại từ quan hệ chỉ sở hữu (Whose)'
      },
      {
        id: 'q-2-2',
        num: 2,
        question: 'The young athletes _______ in the national championship showed remarkable determination.',
        options: ['A. competed', 'B. competing', 'C. were competed', 'D. who competing'],
        answer: 'B. competing',
        explanation: 'Rút gọn mệnh đề quan hệ dạng chủ động (who competed -> competing).',
        grammarPoint: 'Rút gọn mệnh đề quan hệ với V-ing'
      },
      {
        id: 'q-2-3',
        num: 3,
        question: 'This is the most impressive historical novel _______ I have ever read.',
        options: ['A. that', 'B. which', 'C. who', 'D. whom'],
        answer: 'A. that',
        explanation: 'Sau tính từ so sánh nhất ("the most impressive"), ta ưu tiên dùng đại từ quan hệ "that".',
        grammarPoint: 'Đại từ quan hệ That sau so sánh nhất'
      },
      {
        id: 'q-2-4',
        num: 4,
        question: 'The building _______ was destroyed in the storm has now been completely rebuilt.',
        options: ['A. who', 'B. which', 'C. whom', 'D. whose'],
        answer: 'B. which',
        explanation: "'The building' là danh từ chỉ vật đóng vai trò chủ ngữ trong mệnh đề quan hệ, dùng 'which' hoặc 'that'.",
        grammarPoint: 'Đại từ quan hệ Which chỉ vật'
      },
      {
        id: 'q-2-5',
        num: 5,
        question: 'Mr. David, _______ you met at the education workshop yesterday, is our new dean.',
        options: ['A. whom', 'B. which', 'C. whose', 'D. what'],
        answer: 'A. whom',
        explanation: "'whom' thay thế cho tân ngữ chỉ người sau dấu phẩy (mệnh đề quan hệ không xác định).",
        grammarPoint: 'Đại từ quan hệ Whom trong mệnh đề không xác định'
      },
      {
        id: 'q-2-6',
        num: 6,
        question: 'The village _______ my grandparents grew up is famous for traditional pottery.',
        options: ['A. which', 'B. where', 'C. that', 'D. when'],
        answer: 'B. where',
        explanation: "'where' thay cho trạng từ chỉ nơi chốn (in which/in the village).",
        grammarPoint: 'Trạng từ quan hệ Where'
      },
      {
        id: 'q-2-7',
        num: 7,
        question: 'I will never forget the day _______ I received the admission letter from university.',
        options: ['A. which', 'B. when', 'C. where', 'D. why'],
        answer: 'B. when',
        explanation: "'the day' chỉ thời gian, sau đó dùng trạng từ quan hệ 'when'.",
        grammarPoint: 'Trạng từ quan hệ When'
      },
      {
        id: 'q-2-8',
        num: 8,
        question: 'The reason _______ she decided to study environmental engineering is very inspiring.',
        options: ['A. why', 'B. which', 'C. where', 'D. what'],
        answer: 'A. why',
        explanation: "'The reason why' là cấu trúc chỉ lý do nguyên nhân.",
        grammarPoint: 'Trạng từ quan hệ Why'
      },
      {
        id: 'q-2-9',
        num: 9,
        question: 'The documents _______ by the committee yesterday will be made public next week.',
        options: ['A. approving', 'B. approved', 'C. was approved', 'D. were approving'],
        answer: 'B. approved',
        explanation: 'Rút gọn mệnh đề quan hệ dạng bị động (which were approved -> approved).',
        grammarPoint: 'Rút gọn mệnh đề quan hệ dạng Bị động (V3/ed)'
      },
      {
        id: 'q-2-10',
        num: 10,
        question: 'He is the only candidate _______ meets all the stringent requirements of the scholarship.',
        options: ['A. who', 'B. which', 'C. that', 'D. whom'],
        answer: 'C. that',
        explanation: 'Sau "the only" bắt buộc dùng đại từ quan hệ "that".',
        grammarPoint: 'Dùng That sau the only / all / none'
      },
      {
        id: 'q-2-11',
        num: 11,
        question: 'Neil Armstrong was the first person _______ on the Moon.',
        options: ['A. walking', 'B. to walk', 'C. walked', 'D. who walking'],
        answer: 'B. to walk',
        explanation: 'Rút gọn mệnh đề quan hệ sau the first/second/last/only dùng To-Infinitive.',
        grammarPoint: 'Rút gọn mệnh đề quan hệ với To-Infinitive'
      },
      {
        id: 'q-2-12',
        num: 12,
        question: 'The woman to _______ you were speaking on the phone is the head of department.',
        options: ['A. who', 'B. whom', 'C. that', 'D. whose'],
        answer: 'B. whom',
        explanation: 'Sau giới từ (to) chỉ người bắt buộc dùng "whom", không được dùng "who" hay "that".',
        grammarPoint: 'Giới từ đứng trước đại từ quan hệ (preposition + whom)'
      },
      {
        id: 'q-2-13',
        num: 13,
        question: 'The solar project, _______ was funded by international donors, has reduced local emissions by 40%.',
        options: ['A. that', 'B. which', 'C. what', 'D. whose'],
        answer: 'B. which',
        explanation: 'Mệnh đề quan hệ không xác định có dấu phẩy không được dùng "that", phải dùng "which".',
        grammarPoint: 'Mệnh đề quan hệ không xác định với Which'
      },
      {
        id: 'q-2-14',
        num: 14,
        question: 'All the students _______ essays scored above 8.5 will be awarded certificates.',
        options: ['A. whose', 'B. who', 'C. whom', 'D. which'],
        answer: 'A. whose',
        explanation: "'whose essays' biểu đạt quyền sở hữu bài viết của các em học sinh.",
        grammarPoint: 'Đại từ sở hữu Whose'
      },
      {
        id: 'q-2-15',
        num: 15,
        question: 'The software company _______ head office is located in Da Nang has expanded globally.',
        options: ['A. which', 'B. whose', 'C. where', 'D. that'],
        answer: 'B. whose',
        explanation: "'whose head office': trụ sở chính của công ty đó (sở hữu).",
        grammarPoint: 'Whose chỉ sở hữu của tổ chức/sự vật'
      },
      {
        id: 'q-2-16',
        num: 16,
        question: 'He passed the graduation exam with flying colors, _______ made his parents very proud.',
        options: ['A. which', 'B. that', 'C. what', 'D. who'],
        answer: 'A. which',
        explanation: "'which' đứng sau dấu phẩy thay thế cho toàn bộ mệnh đề phía trước.",
        grammarPoint: 'Which thay thế cho cả mệnh đề đứng trước'
      },
      {
        id: 'q-2-17',
        num: 17,
        question: 'The hotel _______ we stayed during our trip to Nha Trang was very close to the beach.',
        options: ['A. which', 'B. in which', 'C. where in', 'D. that in'],
        answer: 'B. in which',
        explanation: "'in which' tương đương với 'where', bổ nghĩa cho 'The hotel'.",
        grammarPoint: 'In which thay cho Where'
      },
      {
        id: 'q-2-18',
        num: 18,
        question: 'Do you know the boy _______ bicycle was stolen outside the library?',
        options: ['A. whose', 'B. whom', 'C. which', 'D. who'],
        answer: 'A. whose',
        explanation: "'whose bicycle': chiếc xe đạp của bạn nam đó.",
        grammarPoint: 'Đại từ sở hữu Whose'
      },
      {
        id: 'q-2-19',
        num: 19,
        question: 'The books _______ on the top shelf need to be cataloged by tomorrow.',
        options: ['A. lying', 'B. laid', 'C. to lie', 'D. were lying'],
        answer: 'A. lying',
        explanation: 'Rút gọn mệnh đề quan hệ chủ động của nội động từ lie: which are lying -> lying.',
        grammarPoint: 'Rút gọn mệnh đề quan hệ với phân từ hiện tại'
      },
      {
        id: 'q-2-20',
        num: 20,
        question: 'The environmental campaign, in _______ hundreds of local students participated, was a resounding success.',
        options: ['A. which', 'B. that', 'C. whom', 'D. where'],
        answer: 'A. which',
        explanation: 'Cụm participate in -> in which. Giới từ đứng trước đại từ chỉ vật là "which".',
        grammarPoint: 'Giới từ đi với Which (in which)'
      }
    ]
  },
  {
    id: 'ex-3',
    title: 'Đề Khảo Sát Năng Lực Đầu Năm Học 2026 - 2027',
    grade: 'Lớp 10',
    subject: 'Tiếng Anh',
    questionsCount: 40,
    duration: '50 phút',
    difficulty: 'Thông hiểu',
    submissions: 38,
    avgScore: 6.9,
    createdAt: '10/09/2026',
    status: 'Đã đóng',
    questions: [
      {
        id: 'q-3-1',
        num: 1,
        question: 'Lan usually _______ to school by bicycle, but today she is taking the bus.',
        options: ['A. goes', 'B. go', 'C. is going', 'D. went'],
        answer: 'A. goes',
        explanation: 'Thì Hiện tại đơn diễn tả thói quen lặp đi lặp lại với dấu hiệu "usually", chủ ngữ "Lan" số ít chia "goes".',
        grammarPoint: 'Thì Hiện tại đơn (Present Simple)'
      },
      {
        id: 'q-3-2',
        num: 2,
        question: 'Choose the word whose underlined part is pronounced differently: decid<u>ed</u>, wait<u>ed</u>, clean<u>ed</u>, invit<u>ed</u>',
        options: ['A. decided', 'B. waited', 'C. cleaned', 'D. invited'],
        answer: 'C. cleaned',
        explanation: "Đuôi '-ed' trong 'cleaned' /kliːnd/ phát âm là /d/. Các từ còn lại phát âm là /ɪd/.",
        grammarPoint: 'Phát âm đuôi -ed'
      },
      {
        id: 'q-3-3',
        num: 3,
        question: 'My father _______ in the garden when it suddenly started to rain heavily.',
        options: ['A. worked', 'B. was working', 'C. has worked', 'D. had worked'],
        answer: 'B. was working',
        explanation: 'Hành động đang diễn ra trong quá khứ (was working) thì có hành động khác xen vào (started to rain).',
        grammarPoint: 'Quá khứ tiếp diễn kết hợp Quá khứ đơn'
      },
      {
        id: 'q-3-4',
        num: 4,
        question: 'We _______ each other since we attended elementary school.',
        options: ['A. know', 'B. have known', 'C. knew', 'D. had known'],
        answer: 'B. have known',
        explanation: 'Dấu hiệu "since" kết hợp thì Hiện tại hoàn thành.',
        grammarPoint: 'Thì Hiện tại hoàn thành với Since'
      },
      {
        id: 'q-3-5',
        num: 5,
        question: 'If you _______ hard, you will pass the final examination with high marks.',
        options: ['A. study', 'B. studied', 'C. will study', 'D. have studied'],
        answer: 'A. study',
        explanation: 'Câu điều kiện loại 1: Mệnh đề IF chia thì Hiện tại đơn.',
        grammarPoint: 'Câu điều kiện loại 1'
      },
      {
        id: 'q-3-6',
        num: 6,
        question: 'The school library _______ by the municipal government last year.',
        options: ['A. built', 'B. was built', 'C. has built', 'D. is built'],
        answer: 'B. was built',
        explanation: 'Câu bị động thì Quá khứ đơn: was/were + V3/ed.',
        grammarPoint: 'Câu bị động Quá khứ đơn'
      },
      {
        id: 'q-3-7',
        num: 7,
        question: 'Choose the word with different stress pattern: \'modern\', \'polite\', \'famous\', \'active\'.',
        options: ['A. modern', 'B. polite', 'C. famous', 'D. active'],
        answer: 'B. polite',
        explanation: "'polite' trọng âm âm tiết 2 /pəˈlaɪt/, các từ còn lại trọng âm âm tiết 1.",
        grammarPoint: 'Trọng âm từ 2 âm tiết'
      },
      {
        id: 'q-3-8',
        num: 8,
        question: 'Nam is very interested _______ playing chess in his free time.',
        options: ['A. on', 'B. in', 'C. at', 'D. about'],
        answer: 'B. in',
        explanation: "Cụm tính từ đi kèm giới từ: 'be interested in + V-ing'.",
        grammarPoint: 'Giới từ đi sau tính từ'
      },
      {
        id: 'q-3-9',
        num: 9,
        question: 'She asked me where I _______ from.',
        options: ['A. come', 'B. came', 'C. am coming', 'D. have come'],
        answer: 'B. came',
        explanation: 'Câu gián tiếp lùi thì từ Hiện tại đơn sang Quá khứ đơn.',
        grammarPoint: 'Câu tường thuật gián tiếp'
      },
      {
        id: 'q-3-10',
        num: 10,
        question: 'Although the weather was bad, they _______ their outdoor camping trip.',
        options: ['A. enjoyed', 'B. enjoy', 'C. will enjoy', 'D. have enjoyed'],
        answer: 'A. enjoyed',
        explanation: 'Mệnh đề nhượng bộ với "Although", vế sau chia thì Quá khứ đơn hòa hợp thì.',
        grammarPoint: 'Liên từ chỉ sự nhượng bộ Although'
      },
      {
        id: 'q-3-11',
        num: 11,
        question: 'You should avoid _______ too much fast food because it is harmful to health.',
        options: ['A. eat', 'B. eating', 'C. to eat', 'D. ate'],
        answer: 'B. eating',
        explanation: "Động từ 'avoid + V-ing'.",
        grammarPoint: 'Danh động từ sau avoid'
      },
      {
        id: 'q-3-12',
        num: 12,
        question: 'This problem is _______ than the previous one we solved yesterday.',
        options: ['A. more difficult', 'B. most difficult', 'C. as difficult', 'D. difficult'],
        answer: 'A. more difficult',
        explanation: 'So sánh hơn của tính từ dài: more + adj + than.',
        grammarPoint: 'So sánh hơn với tính từ dài'
      },
      {
        id: 'q-3-13',
        num: 13,
        question: 'The teacher told us _______ quiet during the test.',
        options: ['A. keep', 'B. to keep', 'C. keeping', 'D. kept'],
        answer: 'B. to keep',
        explanation: "Cấu trúc 'tell someone to do something'.",
        grammarPoint: 'Động từ nguyên mẫu có to sau tell'
      },
      {
        id: 'q-3-14',
        num: 14,
        question: 'He has lived in Hanoi _______ ten years.',
        options: ['A. since', 'B. for', 'C. in', 'D. at'],
        answer: 'B. for',
        explanation: "'for' đi với khoảng thời gian trong thì Hiện tại hoàn thành.",
        grammarPoint: 'For và khoảng thời gian'
      },
      {
        id: 'q-3-15',
        num: 15,
        question: 'Neither Minh nor his friends _______ going to the music concert tonight.',
        options: ['A. is', 'B. are', 'C. was', 'D. were'],
        answer: 'B. are',
        explanation: 'Quy tắc hòa hợp chủ vị với Neither ... nor chia theo chủ ngữ gần nhất ("his friends" số nhiều -> are).',
        grammarPoint: 'Hòa hợp Chủ - Vị với Neither ... nor'
      },
      {
        id: 'q-3-16',
        num: 16,
        question: 'You haven\'t finished your homework yet, _______?',
        options: ['A. have you', 'B. haven\'t you', 'C. do you', 'D. did you'],
        answer: 'A. have you',
        explanation: 'Câu hỏi đuôi: Vế trước phủ định (haven\'t), vế đuôi khẳng định (have you).',
        grammarPoint: 'Câu hỏi đuôi (Tag questions)'
      },
      {
        id: 'q-3-17',
        num: 17,
        question: 'She is fond _______ reading science fiction books.',
        options: ['A. with', 'B. of', 'C. at', 'D. on'],
        answer: 'B. of',
        explanation: "Cụm 'be fond of + V-ing'.",
        grammarPoint: 'Cụm giới từ Be fond of'
      },
      {
        id: 'q-3-18',
        num: 18,
        question: 'Unless it _______ tomorrow, we will have a picnic in the park.',
        options: ['A. rains', 'B. rain', 'C. will rain', 'D. rained'],
        answer: 'A. rains',
        explanation: "'Unless' = 'If ... not', mệnh đề sau Unless chia hiện tại đơn (it rains).",
        grammarPoint: 'Cấu trúc Unless'
      },
      {
        id: 'q-3-19',
        num: 19,
        question: 'The film was so _______ that many people left the cinema early.',
        options: ['A. boring', 'B. bored', 'C. bore', 'D. boredom'],
        answer: 'A. boring',
        explanation: "Tính từ đuôi '-ing' chỉ tính chất của bộ phim ('boring').",
        grammarPoint: 'Phân biệt tính từ -ing và -ed'
      },
      {
        id: 'q-3-20',
        num: 20,
        question: 'He suggested _______ by bus instead of taking a taxi to save money.',
        options: ['A. travel', 'B. travelling', 'C. to travel', 'D. travelled'],
        answer: 'B. travelling',
        explanation: "Cấu trúc 'suggest + V-ing'.",
        grammarPoint: 'Cấu trúc Suggest + V-ing'
      }
    ]
  }
];

// Helper to generate full realistic class rosters
const CLASS_12G09_NAMES = [
  'Nguyễn Văn An', 'Vũ Nguyên Phúc', 'Dương Thế Phong', 'Dương Quốc Đại',
  'Lê Hoàng Long', 'Phạm Thu Thảo', 'Hoàng Minh Đức', 'Đỗ Bảo Ngọc',
  'Nguyễn Gia Huy', 'Bùi Quỳnh Nga', 'Phan Tiến Dũng', 'Vũ Khánh Linh',
  'Trần Anh Tuấn', 'Đặng Thùy Dung', 'Ngô Quang Huy', 'Lý Hải Đăng',
  'Mai Phương Thúy', 'Hồ Ngọc Hà', 'Đoàn Văn Hậu', 'Trịnh Thăng Bình',
  'Võ Hoài Nam', 'Cao Thái Sơn', 'Lương Bích Hữu', 'Tạ Quang Thắng',
  'Lê Cát Trọng Lý', 'Phan Mạnh Quỳnh', 'Vũ Cát Tường', 'Nguyễn Trọng Hiếu',
  'Hà Anh Tuấn', 'Bùi Anh Tuấn', 'Đinh Tiến Dũng', 'Trần Trung Kiên',
  'Dương Hoàng Yến', 'Vương Anh Tú', 'Nguyễn Đình Dũng', 'Lê Bảo Bình',
  'Phùng Khánh Linh', 'Tăng Duy Tân'
];

const CLASS_11A1_NAMES = [
  'Trần Thị Mai', 'Nguyễn Hải Đăng', 'Lê Thảo My', 'Phạm Hoàng Bách',
  'Bùi Minh Trí', 'Vũ Ngọc Hân', 'Hoàng Gia Bảo', 'Đỗ Thùy Linh',
  'Phan Thanh Tùng', 'Đặng Mai Phương', 'Lý Quốc Bảo', 'Ngô Minh Châu',
  'Mai Anh Dũng', 'Trịnh Thảo Nhi', 'Võ Quang Khải', 'Cao Ngọc Ánh',
  'Lương Tuấn Khang', 'Đoàn Thúy Vy', 'Tạ Minh Nhật', 'Hồ Bảo Trâm',
  'Phạm Minh Quang', 'Trần Thảo Ly', 'Nguyễn Đức Anh', 'Lê Khánh Huyền',
  'Bùi Quang Huy', 'Vũ Hoàng Nam', 'Đỗ Phương Anh', 'Hoàng Tuấn Anh',
  'Phan Diệu Linh', 'Đặng Nhật Minh', 'Lý Hoàng Yến', 'Mai Tuấn Kiệt'
];

export const INITIAL_STUDENTS: StudentItem[] = [
  // 38 Students of Lớp 12G09
  ...CLASS_12G09_NAMES.map((name, i) => {
    // Specific custom phones for the primary test students
    let phone = `098${String(1000000 + i * 2341).slice(0, 7)}`;
    let parentPhone = `091${String(2000000 + i * 1928).slice(0, 7)}`;
    let studentId = `24031926${String(i + 1).padStart(2, '0')}`;

    if (name === 'Vũ Nguyên Phúc') {
      phone = '0839050211';
      parentPhone = '0839050211';
    } else if (name === 'Dương Thế Phong') {
      phone = '0907675863';
      parentPhone = '0907675863';
    } else if (name === 'Dương Quốc Đại') {
      phone = '0867574711';
      parentPhone = '0867574711';
    } else if (name === 'Nguyễn Văn An') {
      phone = '0987654321';
      parentPhone = '0987654322';
      studentId = 'HS12-001';
    }

    return {
      id: `s-12g09-${i + 1}`,
      name,
      studentId,
      classId: 'c-1790068920256',
      className: 'Lớp 12G09',
      progress: name === 'Vũ Nguyên Phúc' ? 25 : 0,
      lastScore: name === 'Vũ Nguyên Phúc' ? 8.0 : 0,
      status: (name === 'Vũ Nguyên Phúc' ? 'Hoàn thành' : 'Chưa làm') as any,
      phone,
      parentPhone,
      completedExams: name === 'Vũ Nguyên Phúc' ? 1 : 0,
      notes: `Học sinh Lớp 12G09 (STT: ${i + 1})`,
    };
  }),

  // 32 Students of Lớp 11A1
  ...CLASS_11A1_NAMES.map((name, i) => {
    let phone = `097${String(3000000 + i * 3141).slice(0, 7)}`;
    let parentPhone = `094${String(4000000 + i * 2718).slice(0, 7)}`;
    let studentId = `25021811${String(i + 1).padStart(2, '0')}`;

    if (name === 'Trần Thị Mai') {
      phone = '0912345678';
      parentPhone = '0912345679';
      studentId = 'HS11-002';
    }

    return {
      id: `s-11a1-${i + 1}`,
      name,
      studentId,
      classId: 'c-1790068920257',
      className: 'Lớp 11A1',
      progress: 0,
      lastScore: 0,
      status: 'Chưa làm' as any,
      phone,
      parentPhone,
      completedExams: 0,
      notes: `Học sinh Lớp 11A1 (STT: ${i + 1})`,
    };
  })
];

export const INITIAL_SUBMISSIONS: SubmissionItem[] = [
  {
    id: 'sub-init-1',
    studentName: 'Vũ Nguyên Phúc',
    studentId: '2403192678',
    studentPhone: '0839050211',
    classId: 'c-1790068920256',
    className: 'Lớp 12G09',
    examId: 'ex-1',
    examTitle: 'Đề ôn tập: Thì Quá Khứ & Hiện Tại Hoàn Thành',
    score: 8.0,
    totalQuestions: 5,
    correctAnswersCount: 4,
    answers: {
      1: 'C. watched',
      2: 'B. had worked',
      3: 'A. graduated',
      4: 'A. prevent', // Chose A instead of C. happen -> Wrong, generates misconception diagnosis!
      5: 'C. have been',
    },
    submittedAt: '22/09/2026 08:30',
  }
];

export const INITIAL_TASKS: HomeworkTask[] = [
  {
    id: 't-1',
    title: 'Chụp ảnh vở ghi bài Unit 4 & Tóm tắt Ngữ pháp',
    className: 'Lớp 12G09',
    classId: 'c-1790068920256',
    type: 'Chụp vở bài học',
    category: 'Homework',
    priority: 'High',
    deadline: 'Hôm nay 23:59 (Còn 4 giờ)',
    deadlineHoursRemaining: 4,
    isUrgent: true,
    submittedCount: 30,
    totalCount: 38,
    status: 'Đang mở',
    description: 'Chụp rõ nét 2 trang vở ghi chép lý thuyết ngữ pháp và sơ đồ tư duy từ vựng Unit 4: For A Better Community',
    completedStudentIds: Array.from({ length: 30 }, (_, i) => `s-12g09-${i + 1}`),
    remindedStudentIds: [],
    createdAt: '25/09/2026'
  },
  {
    id: 't-2',
    title: 'Ghi âm bài đọc phát âm Unit 4: Speaking Task',
    className: 'Lớp 12G09',
    classId: 'c-1790068920256',
    type: 'File ghi âm phát âm',
    category: 'Project',
    priority: 'Medium',
    deadline: 'Ngày mai 17:00 (Còn 21 giờ)',
    deadlineHoursRemaining: 21,
    isUrgent: true,
    submittedCount: 24,
    totalCount: 38,
    status: 'Đang mở',
    description: 'Ghi âm đoạn hội thoại ngắn 1 - 2 phút luyện phát âm âm đuôi và ngữ điệu câu hỏi SGK Global Success',
    completedStudentIds: Array.from({ length: 24 }, (_, i) => `s-12g09-${i + 1}`),
    remindedStudentIds: [],
    createdAt: '25/09/2026'
  },
  {
    id: 't-3',
    title: 'Chụp ảnh vở bài tập tiếng Anh Unit 3: Music',
    className: 'Lớp 11A1',
    classId: 'c-1790068920257',
    type: 'Chụp vở bài học',
    category: 'Homework',
    priority: 'High',
    deadline: 'Hôm nay 21:00 (Còn 2 giờ)',
    deadlineHoursRemaining: 2,
    isUrgent: true,
    submittedCount: 22,
    totalCount: 32,
    status: 'Đang mở',
    description: 'Chụp toàn bộ phần bài tập tự luyện trang 28 - 29 sách bài tập Tiếng Anh 11',
    completedStudentIds: Array.from({ length: 22 }, (_, i) => `s-11a1-${i + 1}`),
    remindedStudentIds: [],
    createdAt: '24/09/2026'
  },
  {
    id: 't-4',
    title: 'Bài tập tự luận viết lại câu (Transformation) Unit 3',
    className: 'Lớp 11A1',
    classId: 'c-1790068920257',
    type: 'Bài tập tự luận',
    category: 'Revision',
    priority: 'Low',
    deadline: '23:59 Chủ nhật (Còn 3 ngày)',
    deadlineHoursRemaining: 72,
    isUrgent: false,
    submittedCount: 15,
    totalCount: 32,
    status: 'Đang mở',
    description: 'Viết lại 10 câu hoàn chỉnh sử dụng Gerunds và To-Infinitives theo ngữ cảnh',
    completedStudentIds: Array.from({ length: 15 }, (_, i) => `s-11a1-${i + 1}`),
    remindedStudentIds: [],
    createdAt: '23/09/2026'
  }
];

