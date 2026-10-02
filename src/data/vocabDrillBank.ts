export interface VocabDrillQuestion {
  id: string;
  num: number;
  question: string;
  options: string[]; // e.g. ["A. footprint", "B. fingerprint", "C. handprint", "D. shadow"]
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  type: 'collocation' | 'idiom';
  targetPhrase: string;
  meaningVi: string;
  exampleSentence: string;
  explanation: string;
}

export interface VocabDrillResult {
  unitTitle: string;
  grade: string;
  generatedAt: string;
  focus: string;
  difficulty: string;
  questions: VocabDrillQuestion[];
}

export interface GlobalSuccessUnitSpec {
  id: string;
  unitNumber: number;
  title: string;
  grade: '10' | '11' | '12';
  theme: string;
  keyCollocations: string[];
  keyIdioms: string[];
  sampleDrill: VocabDrillQuestion[];
}

export const VOCAB_DRILL_CURRICULUM: Record<string, GlobalSuccessUnitSpec[]> = {
  '10': [
    {
      id: 'g10-u1',
      unitNumber: 1,
      title: 'Unit 1: Family Life',
      grade: '10',
      theme: 'Household chores, family values, and responsibilities',
      keyCollocations: ['do the laundry', 'take out the rubbish', 'split the chores', 'heavy lifting', 'set a good example'],
      keyIdioms: ['like two peas in a pod', 'flesh and blood', 'wear the pants in the family', 'born with a silver spoon in one’s mouth'],
      sampleDrill: [
        {
          id: 'g10-u1-q1',
          num: 1,
          question: 'In my family, both of my parents believe in equality, so they always ______ the household chores equally.',
          options: ['A. split', 'B. slice', 'C. break', 'D. chop'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'split the chores',
          meaningVi: 'Phân chia công việc nhà (đều nhau)',
          exampleSentence: 'My sister and I always split the chores to finish cleaning before dinner.',
          explanation: 'Collocation chuẩn: "split the chores / split household duties" có nghĩa là chia sẻ công việc nhà. Các từ "slice" (thái lát), "break" (làm vỡ), "chop" (chặt) không kết hợp với chores.'
        },
        {
          id: 'g10-u1-q2',
          num: 2,
          question: 'My father usually handles the ______ around the house, such as carrying bulky furniture or fixing heavy appliances.',
          options: ['A. strong carrying', 'B. heavy lifting', 'C. hard weight', 'D. solid burden'],
          correctAnswer: 'B',
          type: 'collocation',
          targetPhrase: 'heavy lifting',
          meaningVi: 'Công việc nặng nhọc, khuân vác đồ đạc',
          exampleSentence: 'He is strong enough to do the heavy lifting in our garden.',
          explanation: 'Cụm cố định: "do the heavy lifting" mang nghĩa đen là làm việc nặng nhọc mang vác, nghĩa bóng là gánh vác phần việc khó khăn nhất.'
        },
        {
          id: 'g10-u1-q3',
          num: 3,
          question: 'Parents should always ______ a good example for their children by treating each other with mutual respect.',
          options: ['A. build', 'B. make', 'C. set', 'D. form'],
          correctAnswer: 'C',
          type: 'collocation',
          targetPhrase: 'set a good example (for somebody)',
          meaningVi: 'Làm gương tốt cho ai noi theo',
          exampleSentence: 'Teachers strive to set a good example for all students in school.',
          explanation: 'Collocation cố định: "set an example for somebody" (nêu gương cho ai). Ta không dùng "make an example" hay "build an example" trong ngữ cảnh này.'
        },
        {
          id: 'g10-u1-q4',
          num: 4,
          question: 'Even though they have different personalities, the twin brothers look and act just like ______.',
          options: ['A. two peas in a pod', 'B. chalk and cheese', 'C. apples and oranges', 'D. cats and dogs'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'like two peas in a pod',
          meaningVi: 'Giống nhau như hai giọt nước (về ngoại hình hoặc sở thích)',
          exampleSentence: 'My best friend and I are like two peas in a pod; we like the same music and food.',
          explanation: 'Thành ngữ: "like two peas in a pod" diễn tả hai người giống hệt nhau. "Chalk and cheese" mang nghĩa hoàn toàn khác nhau; "apples and oranges" mang nghĩa khập khiễng không thể so sánh; "cats and dogs" (rain cats and dogs) chỉ mưa to.'
        },
        {
          id: 'g10-u1-q5',
          num: 5,
          question: 'No matter what happens, you should forgive your brother because at the end of the day, he is your own ______.',
          options: ['A. heart and soul', 'B. skin and bones', 'C. flesh and blood', 'D. tooth and nail'],
          correctAnswer: 'C',
          type: 'idiom',
          targetPhrase: 'flesh and blood',
          meaningVi: 'Máu mủ ruột thịt, người trong gia đình',
          exampleSentence: 'I cannot refuse to help him; he is my own flesh and blood.',
          explanation: 'Thành ngữ: "one’s own flesh and blood" có nghĩa là người cùng dòng máu, ruột thịt. "Heart and soul" (toàn tâm toàn ý); "skin and bones" (gầy trơ xương); "tooth and nail" (quyết liệt).'
        }
      ]
    },
    {
      id: 'g10-u2',
      unitNumber: 2,
      title: 'Unit 2: Humans and the Environment',
      grade: '10',
      theme: 'Carbon footprint, eco-friendly lifestyle, pollution',
      keyCollocations: ['carbon footprint', 'eco-friendly lifestyle', 'single-use plastic', 'raise awareness', 'renewable energy'],
      keyIdioms: ['go green', 'tip of the iceberg', 'a breath of fresh air', 'down to earth'],
      sampleDrill: [
        {
          id: 'g10-u2-q1',
          num: 1,
          question: 'More and more young people are choosing to ride bicycles in order to reduce their personal carbon ______.',
          options: ['A. fingerprint', 'B. footprint', 'C. trackmark', 'D. shadow'],
          correctAnswer: 'B',
          type: 'collocation',
          targetPhrase: 'carbon footprint',
          meaningVi: 'Dấu chân carbon (lượng khí nhà kính phát thải)',
          exampleSentence: 'Using solar panels helps families significantly reduce their carbon footprint.',
          explanation: 'Collocation khoa học môi trường: "carbon footprint" chỉ lượng khí CO2 một người hoặc tổ chức thải ra khí quyển. "Fingerprint" (vân tay).'
        },
        {
          id: 'g10-u2-q2',
          num: 2,
          question: 'Supermarkets are encouraged to phase out ______ plastic bags and replace them with biodegradable canvas totes.',
          options: ['A. single-use', 'B. once-time', 'C. solo-turn', 'D. unique-wear'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'single-use plastic',
          meaningVi: 'Nhựa dùng một lần',
          exampleSentence: 'Many countries have banned single-use plastic straws and containers.',
          explanation: 'Thuật ngữ môi trường: "single-use plastic" (đồ nhựa dùng một lần). Các phương án khác dịch thô không có trong từ điển học thuật.'
        },
        {
          id: 'g10-u2-q3',
          num: 3,
          question: 'The youth club launched an environmental campaign to ______ public awareness about recycling e-waste.',
          options: ['A. rise', 'B. lift', 'C. raise', 'D. boost'],
          correctAnswer: 'C',
          type: 'collocation',
          targetPhrase: 'raise awareness (about/of)',
          meaningVi: 'Nâng cao nhận thức của cộng đồng',
          exampleSentence: 'The documentary aimed to raise awareness of marine conservation.',
          explanation: 'Collocation chuẩn: "raise awareness" (nâng cao nhận thức). Lưu ý động từ "raise" là ngoại động từ có tân ngữ "awareness", khác với nội động từ "rise".'
        },
        {
          id: 'g10-u2-q4',
          num: 4,
          question: 'Our school decided to ______ by installing solar panels and planting trees around the campus.',
          options: ['A. turn red', 'B. go green', 'C. feel blue', 'D. show white'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'go green',
          meaningVi: 'Chuyển sang lối sống xanh, bảo vệ môi trường',
          exampleSentence: 'Many multinational corporations are going green to attract eco-conscious consumers.',
          explanation: 'Thành ngữ môi trường: "go green" nghĩa là theo đuổi lối sống thân thiện với môi trường. "Feel blue" (buồn bã); "turn red" (ngượng ngùng).'
        },
        {
          id: 'g10-u2-q5',
          num: 5,
          question: 'The plastic waste we see floating on the ocean surface is merely the ______; tons of microplastics lie deep underwater.',
          options: ['A. head of the pin', 'B. tip of the iceberg', 'C. drop in the ocean', 'D. root of the problem'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'the tip of the iceberg',
          meaningVi: 'Phần nổi của tảng băng chìm (chỉ phần nhỏ nhìn thấy được của một vấn đề lớn)',
          exampleSentence: 'The reported pollution cases are only the tip of the iceberg.',
          explanation: 'Thành ngữ: "the tip of the iceberg" biểu thị chỉ mới là bề nổi của một hiểm họa lớn hơn nhiều.'
        }
      ]
    },
    {
      id: 'g10-u3',
      unitNumber: 3,
      title: 'Unit 3: Music',
      grade: '10',
      theme: 'Musical talents, concerts, instruments, idol culture',
      keyCollocations: ['release an album', 'live concert', 'musical instrument', 'win an award', 'idol culture'],
      keyIdioms: ['music to one’s ears', 'blow one’s own trumpet', 'play second fiddle', 'face the music'],
      sampleDrill: [
        {
          id: 'g10-u3-q1',
          num: 1,
          question: 'The famous young band is planning to ______ their debut studio album early next month.',
          options: ['A. release', 'B. discharge', 'C. liberate', 'D. emit'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'release an album / single',
          meaningVi: 'Phát hành một album / đĩa đơn âm nhạc',
          exampleSentence: 'Taylor Swift released a re-recorded album that topped international charts.',
          explanation: 'Collocation âm nhạc: "release an album / single / movie" (phát hành album). "Discharge" (xuất viện/xả thải); "liberate" (giải phóng lãnh thổ); "emit" (phát ra khí thải).'
        },
        {
          id: 'g10-u3-q2',
          num: 2,
          question: 'Learning to play a musical ______ at an early age helps children develop both creative and analytical skills.',
          options: ['A. apparatus', 'B. gadget', 'C. instrument', 'D. implement'],
          correctAnswer: 'C',
          type: 'collocation',
          targetPhrase: 'musical instrument',
          meaningVi: 'Nhạc cụ âm nhạc (đàn, sáo, trống...)',
          exampleSentence: 'Can you play any musical instruments like the piano or violin?',
          explanation: 'Collocation: "musical instrument" (nhạc cụ). "Apparatus" (bộ máy/thiết bị thí nghiệm); "gadget" (thiết bị điện tử nhỏ); "implement" (dụng cụ làm nông).'
        },
        {
          id: 'g10-u3-q3',
          num: 3,
          question: 'Hearing that all our class members passed the national English proficiency examination was truly ______.',
          options: ['A. music to my ears', 'B. words in my mouth', 'C. a song in my heart', 'D. bells on my toes'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'music to one’s ears',
          meaningVi: 'Điều làm ai đó vô cùng mừng rỡ, tin vui nghe êm tai',
          exampleSentence: 'The news of our scholarship approval was music to our ears.',
          explanation: 'Thành ngữ: "music to someone’s ears" là tin tức tuyệt vời khiến ai đó rất vui mừng khi được nghe.'
        },
        {
          id: 'g10-u3-q4',
          num: 4,
          question: 'Nobody likes working with Kevin because he constantly ______ about his minor achievements.',
          options: ['A. plays his own drum', 'B. blows his own trumpet', 'C. rings his own bell', 'D. hits his own gong'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'blow one’s own trumpet',
          meaningVi: 'Tự khen mình, khoe khoang huênh hoang',
          exampleSentence: 'Without wishing to blow my own trumpet, I think I did exceptionally well in the audition.',
          explanation: 'Thành ngữ: "blow one’s own trumpet" (Mỹ: toot one’s own horn) nghĩa là tự đề cao hoặc khoe khoang về bản thân.'
        },
        {
          id: 'g10-u3-q5',
          num: 5,
          question: 'He skipped class without permission and knew he would have to ______ when meeting his head teacher.',
          options: ['A. dance to the tune', 'B. hear the sound', 'C. face the music', 'D. beat the rhythm'],
          correctAnswer: 'C',
          type: 'idiom',
          targetPhrase: 'face the music',
          meaningVi: 'Chấp nhận hậu quả hoặc sự chỉ trích vì lỗi lầm mình gây ra',
          exampleSentence: 'You made a mistake, so now you must stand up and face the music.',
          explanation: 'Thành ngữ: "face the music" nghĩa là đối mặt với hình phạt hoặc hậu quả của việc mình đã làm.'
        }
      ]
    },
    {
      id: 'g10-u4',
      unitNumber: 4,
      title: 'Unit 4: For a Better Community',
      grade: '10',
      theme: 'Volunteer work, community development, charitable organizations',
      keyCollocations: ['volunteer work', 'community service', 'raise funds', 'make a difference', 'donate blood'],
      keyIdioms: ['lend a helping hand', 'from the bottom of one’s heart', 'pay it forward', 'have a heart of gold'],
      sampleDrill: [
        {
          id: 'g10-u4-q1',
          num: 1,
          question: 'Every summer, university students go to remote mountainous regions to do ______ for disadvantaged ethnic minorities.',
          options: ['A. volunteer work', 'B. willingly job', 'C. unpaid chore', 'D. gratuitous task'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'volunteer work',
          meaningVi: 'Công việc tình nguyện vì cộng đồng',
          exampleSentence: 'Doing volunteer work gives teenagers practical life skills and empathy.',
          explanation: 'Collocation: "volunteer work" (công tác tình nguyện) hoặc "community service".'
        },
        {
          id: 'g10-u4-q2',
          num: 2,
          question: 'Even a small financial contribution can ______ to the lives of impoverished children in rural areas.',
          options: ['A. take a difference', 'B. make a difference', 'C. create a divergence', 'D. hold a distinction'],
          correctAnswer: 'B',
          type: 'collocation',
          targetPhrase: 'make a difference (to)',
          meaningVi: 'Tạo nên sự thay đổi tích cực, có ý nghĩa',
          exampleSentence: 'Volunteering once a week can make a huge difference to homeless people.',
          explanation: 'Collocation kinh điển: "make a difference" (tạo nên sự khác biệt/ảnh hưởng tích cực).'
        },
        {
          id: 'g10-u4-q3',
          num: 3,
          question: 'Whenever our neighbors struggle with home repairs, Mr. Minh is always eager to ______.',
          options: ['A. lend an open palm', 'B. give a strong arm', 'C. lend a helping hand', 'D. hand an easy fist'],
          correctAnswer: 'C',
          type: 'idiom',
          targetPhrase: 'lend a helping hand',
          meaningVi: 'Chung tay giúp đỡ, sẵn lòng tương trợ người khác',
          exampleSentence: 'Could you please lend a helping hand with moving these charity donation boxes?',
          explanation: 'Thành ngữ: "lend a helping hand" (giúp đỡ một tay). Ta không dùng palm/arm/fist trong thành ngữ này.'
        },
        {
          id: 'g10-u4-q4',
          num: 4,
          question: 'Mrs. Lan volunteers at the local orphanage three times a week; she truly has ______.',
          options: ['A. a heart of gold', 'B. a head of silver', 'C. an iron fist', 'D. an eye of diamond'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'have a heart of gold',
          meaningVi: 'Có tấm lòng vàng, vô cùng tốt bụng và nhân hậu',
          exampleSentence: 'She has a heart of gold and never refuses anyone who asks for support.',
          explanation: 'Thành ngữ: "have a heart of gold" (có tấm lòng vàng, nhân đức).'
        },
        {
          id: 'g10-u4-q5',
          num: 5,
          question: 'The local charity foundation organized a music festival to ______ funds for the newly built children hospital.',
          options: ['A. rise', 'B. raise', 'C. lift', 'D. arouse'],
          correctAnswer: 'B',
          type: 'collocation',
          targetPhrase: 'raise funds',
          meaningVi: 'Gây quỹ từ thiện',
          exampleSentence: 'The charity managed to raise funds to build five new classrooms in Ha Giang.',
          explanation: 'Collocation: "raise funds / raise money" (gây quỹ). "Rise" là nội động từ, "arouse" (khơi dậy cảm xúc).'
        }
      ]
    },
    {
      id: 'g10-u5',
      unitNumber: 5,
      title: 'Unit 5: Inventions',
      grade: '10',
      theme: 'Technological breakthroughs, AI, smartphones, robotic devices',
      keyCollocations: ['artificial intelligence', 'cutting-edge technology', 'technological breakthrough', 'smart device', 'patent an invention'],
      keyIdioms: ['ahead of its time', 'reinvent the wheel', 'state of the art', 'light-bulb moment'],
      sampleDrill: [
        {
          id: 'g10-u5-q1',
          num: 1,
          question: 'Scientists have achieved a major technological ______ in renewable energy battery storage.',
          options: ['A. breakdown', 'B. breakthrough', 'C. breakout', 'D. outbreak'],
          correctAnswer: 'B',
          type: 'collocation',
          targetPhrase: 'technological breakthrough',
          meaningVi: 'Bước đột phá về mặt công nghệ',
          exampleSentence: 'The development of mRNA vaccines was a historic scientific breakthrough.',
          explanation: 'Collocation: "technological / scientific breakthrough" (bước đột phá công nghệ). "Breakdown" (sự cố/hỏng hóc); "outbreak" (bùng phát dịch bệnh).'
        },
        {
          id: 'g10-u5-q2',
          num: 2,
          question: 'The new laboratory is equipped with ______ technology to analyze nanoscale materials.',
          options: ['A. cutting-edge', 'B. razor-sharp', 'C. sharp-blade', 'D. front-end'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'cutting-edge technology',
          meaningVi: 'Công nghệ tối tân, hiện đại nhất',
          exampleSentence: 'Our hospital utilizes cutting-edge medical equipment for minimally invasive surgeries.',
          explanation: 'Collocation: "cutting-edge technology" (công nghệ tiên tiến nhất). Đồng nghĩa: "state-of-the-art".'
        },
        {
          id: 'g10-u5-q3',
          num: 3,
          question: 'There is no point in trying to ______; we should adopt existing open-source code and build upon it.',
          options: ['A. reinvent the wheel', 'B. reshape the circle', 'C. turn the tire', 'D. revolve the gear'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'reinvent the wheel',
          meaningVi: 'Tốn công vô ích làm lại thứ người khác đã làm hoàn hảo',
          exampleSentence: 'Do not reinvent the wheel; just use the standard design patterns.',
          explanation: 'Thành ngữ: "reinvent the wheel" mang nghĩa lãng phí thời gian sáng tạo lại điều đã có sẵn và tối ưu.'
        },
        {
          id: 'g10-u5-q4',
          num: 4,
          question: 'When Nikola Tesla proposed wireless energy transmission over a century ago, his ideas were way ______.',
          options: ['A. ahead of his time', 'B. in front of his clock', 'C. beyond his date', 'D. forward of his hour'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'ahead of one’s time',
          meaningVi: 'Đi trước thời đại, có tư tưởng vượt thời gian',
          exampleSentence: 'Her conceptual architectural models were far ahead of their time.',
          explanation: 'Thành ngữ: "ahead of one’s time" (đi trước thời đại).'
        },
        {
          id: 'g10-u5-q5',
          num: 5,
          question: 'While taking a shower, the young inventor suddenly had a ______ and sketched the app blueprint immediately.',
          options: ['A. bright-sun hour', 'B. light-bulb moment', 'C. neon-glow minute', 'D. spark-fire second'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'light-bulb moment',
          meaningVi: 'Khoảnh khắc lóe sáng ý tưởng, phát kiến bất ngờ',
          exampleSentence: 'The engineer had a light-bulb moment that solved the overheating puzzle.',
          explanation: 'Thành ngữ: "light-bulb moment" (khoảnh khắc nảy ra ý tưởng thiên tài, tựa như bóng đèn bật sáng trên đầu).'
        }
      ]
    }
  ],
  '11': [
    {
      id: 'g11-u1',
      unitNumber: 1,
      title: 'Unit 1: A Long and Healthy Life',
      grade: '11',
      theme: 'Longevity, balanced diet, physical exercises, bacteria and viruses',
      keyCollocations: ['balanced diet', 'life expectancy', 'immune system', 'regular exercise', 'relieve stress'],
      keyIdioms: ['as fit as a fiddle', 'under the weather', 'in the pink of health', 'kick the habit'],
      sampleDrill: [
        {
          id: 'g11-u1-q1',
          num: 1,
          question: 'Maintaining a ______ diet rich in fiber and vitamins is essential to boost your body’s natural resistance.',
          options: ['A. balanced', 'B. leveled', 'C. weighted', 'D. symmetrical'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'balanced diet',
          meaningVi: 'Chế độ ăn uống cân bằng, lành mạnh',
          exampleSentence: 'Doctors recommend a balanced diet combined with adequate hydration.',
          explanation: 'Collocation dinh dưỡng: "balanced diet" (chế độ dinh dưỡng cân bằng).'
        },
        {
          id: 'g11-u1-q2',
          num: 2,
          question: 'Thanks to modern medical advancements, the average life ______ in many developed countries exceeds 80 years.',
          options: ['A. duration', 'B. expectancy', 'C. prolongment', 'D. endurance'],
          correctAnswer: 'B',
          type: 'collocation',
          targetPhrase: 'life expectancy',
          meaningVi: 'Tuổi thọ trung bình dự kiến',
          exampleSentence: 'Japan has one of the highest life expectancies in the world.',
          explanation: 'Collocation: "life expectancy" (tuổi thọ trung bình). "Lifespan" cũng mang nghĩa tuổi thọ, còn "expectancy" đi kèm "life" là thuật ngữ nhân khẩu học.'
        },
        {
          id: 'g11-u1-q3',
          num: 3,
          question: 'My grandfather exercises every morning at the park and feels as ______ as a fiddle at the age of seventy-eight.',
          options: ['A. fit', 'B. sound', 'C. strong', 'D. firm'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'as fit as a fiddle',
          meaningVi: 'Khỏe mạnh như vâm, tràn trề sinh lực',
          exampleSentence: 'After recovering from surgery, she is now as fit as a fiddle.',
          explanation: 'Thành ngữ so sánh cố định: "as fit as a fiddle" (vô cùng khỏe mạnh, sung sức).'
        },
        {
          id: 'g11-u1-q4',
          num: 4,
          question: 'Linda could not attend school today because she was feeling a bit ______ due to a slight cold.',
          options: ['A. above the cloud', 'B. under the weather', 'C. behind the rain', 'D. across the climate'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'under the weather',
          meaningVi: 'Hơi ốm, mệt mỏi trong người, không khỏe',
          exampleSentence: 'I’m feeling a bit under the weather today, so I think I’ll stay in bed.',
          explanation: 'Thành ngữ sức khỏe phổ biến: "under the weather" (bị cảm nhẹ hoặc hơi uể oải trong người).'
        },
        {
          id: 'g11-u1-q5',
          num: 5,
          question: 'It took him years to finally ______ of smoking and adopt a healthier lifestyle.',
          options: ['A. strike the pattern', 'B. kick the habit', 'C. punch the routine', 'D. drop the track'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'kick the habit',
          meaningVi: 'Từ bỏ một thói quen xấu (hút thuốc, cắn móng tay, thức khuya...)',
          exampleSentence: 'She decided to kick the habit of drinking sugary sodas every evening.',
          explanation: 'Thành ngữ: "kick the habit" (từ bỏ thói quen xấu).'
        }
      ]
    },
    {
      id: 'g11-u2',
      unitNumber: 2,
      title: 'Unit 2: The Generation Gap',
      grade: '11',
      theme: 'Generational differences, family communication, viewpoints, curfew',
      keyCollocations: ['generation gap', 'nuclear family', 'open-minded attitude', 'impose rules', 'mutual respect'],
      keyIdioms: ['see eye to eye', 'set in one’s ways', 'speak the same language', 'bridge the gap'],
      sampleDrill: [
        {
          id: 'g11-u2-q1',
          num: 1,
          question: 'The wide differences in musical taste and fashion between parents and teenagers often result from the generation ______.',
          options: ['A. space', 'B. gap', 'C. distance', 'D. hole'],
          correctAnswer: 'B',
          type: 'collocation',
          targetPhrase: 'generation gap',
          meaningVi: 'Khoảng cách thế hệ',
          exampleSentence: 'Open communication within the family helps narrow the generation gap.',
          explanation: 'Collocation xã hội học: "generation gap" (khoảng cách thế hệ).'
        },
        {
          id: 'g11-u2-q2',
          num: 2,
          question: 'Parents should avoid ______ strict curfews and career choices on their teenage children.',
          options: ['A. imposing', 'B. pushing', 'C. charging', 'D. demanding'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'impose rules / curfew on somebody',
          meaningVi: 'Áp đặt luật lệ / giờ giới nghiêm lên ai',
          exampleSentence: 'Strict parents often impose their own expectations on their offspring.',
          explanation: 'Collocation: "impose something on somebody" (áp đặt điều gì lên ai).'
        },
        {
          id: 'g11-u2-q3',
          num: 3,
          question: 'My mother and I rarely ______ on fashion; she prefers conservative clothes while I like trendy streetwear.',
          options: ['A. touch hand to hand', 'B. see eye to eye', 'C. meet ear to ear', 'D. walk face to face'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'see eye to eye (with somebody)',
          meaningVi: 'Đồng tình, chung quan điểm với ai',
          exampleSentence: 'My boss and I see eye to eye on the future marketing strategy.',
          explanation: 'Thành ngữ: "see eye to eye with somebody" (đồng lòng, đồng thuận quan điểm với ai).'
        },
        {
          id: 'g11-u2-q4',
          num: 4,
          question: 'Grandpa is very ______; he insists on reading physical newspapers rather than browsing news on an iPad.',
          options: ['A. set in his ways', 'B. placed in his steps', 'C. fixed in his shoes', 'D. rooted in his tracks'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'set in one’s ways',
          meaningVi: 'Bảo thủ, khó thay đổi nếp sống quen thuộc lâu năm',
          exampleSentence: 'As people grow older, they often become more set in their ways.',
          explanation: 'Thành ngữ: "set in one’s ways" (có thói quen cố hữu khó bỏ, không chịu đổi mới).'
        },
        {
          id: 'g11-u2-q5',
          num: 5,
          question: 'Family counseling sessions helped the father and daughter ______ and rebuild their broken relationship.',
          options: ['A. jump the wall', 'B. bridge the gap', 'C. clear the fence', 'D. cross the fence'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'bridge the gap',
          meaningVi: 'Rút ngắn khoảng cách, hàn gắn sự bất đồng',
          exampleSentence: 'Cultural exchange festivals help bridge the gap between different ethnic groups.',
          explanation: 'Thành ngữ: "bridge the gap" (thu hẹp khoảng cách khác biệt hoặc bất đồng).'
        }
      ]
    },
    {
      id: 'g11-u3',
      unitNumber: 3,
      title: 'Unit 3: Cities of the Future',
      grade: '11',
      theme: 'Smart city, sustainable infrastructure, renewable energy, urban planning',
      keyCollocations: ['smart city', 'sustainable infrastructure', 'high-speed rail', 'renewable energy sources', 'urban sprawl'],
      keyIdioms: ['state of the art', 'ahead of the curve', 'pave the way', 'at the cutting edge'],
      sampleDrill: [
        {
          id: 'g11-u3-q1',
          num: 1,
          question: 'Future smart cities will heavily rely on ______ energy sources such as solar and wind to generate clean electricity.',
          options: ['A. renewable', 'B. repeatable', 'C. restored', 'D. refillable'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'renewable energy sources',
          meaningVi: 'Nguồn năng lượng tái tạo',
          exampleSentence: 'Governments should invest in renewable energy sources to cut emissions.',
          explanation: 'Collocation trọng tâm: "renewable energy" (năng lượng tái tạo). Các từ "repeatable" (có thể lặp lại), "refillable" (có thể nạp/rót lại) không kết hợp với energy trong ngữ cảnh này.'
        },
        {
          id: 'g11-u3-q2',
          num: 2,
          question: 'The city council unveiled a ______ public transit system equipped with autonomous electric buses and AI traffic sensors.',
          options: ['A. state of the art', 'B. peace of mind', 'C. turn of the tide', 'D. piece of cake'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'state of the art',
          meaningVi: 'Hiện đại nhất, tối tân nhất',
          exampleSentence: 'The new hospital features state-of-the-art diagnostic equipment.',
          explanation: 'Thành ngữ / Cụm tính từ: "state-of-the-art" mang nghĩa là tân tiến, hiện đại nhất hiện nay. "Piece of cake" (dễ như ăn bánh), "peace of mind" (sự an tâm).'
        },
        {
          id: 'g11-u3-q3',
          num: 3,
          question: 'Urban planners are designing vertical gardens to prevent ______ and preserve green spaces in the metropolitan center.',
          options: ['A. urban sprawl', 'B. city expansionism', 'C. town spreading', 'D. civic stretch'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'urban sprawl',
          meaningVi: 'Sự mở rộng đô thị tràn lan, thiếu quy hoạch',
          exampleSentence: 'Urban sprawl often leads to habitat destruction and traffic congestion.',
          explanation: 'Thuật ngữ địa lý đô thị: "urban sprawl" (sự phát triển đô thị không kiểm soát ra ngoại ô). Đây là collocation chuẩn trong SGK Unit 3 Lớp 11.'
        },
        {
          id: 'g11-u3-q4',
          num: 4,
          question: 'Technological innovations in waste management have enabled our tech hub to stay ______ of the curve.',
          options: ['A. above', 'B. ahead', 'C. front', 'D. forward'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'ahead of the curve',
          meaningVi: 'Đi trước thời đại, dẫn đầu xu thế đổi mới',
          exampleSentence: 'By adopting AI early, the high-tech school stayed ahead of the curve.',
          explanation: 'Thành ngữ: "ahead of the curve" nghĩa là dẫn đầu, đi trước thời đại và đối thủ. "Behind the curve" là tụt hậu.'
        },
        {
          id: 'g11-u3-q5',
          num: 5,
          question: 'The implementation of pedestrian-only zones has breathed ______ into the historic downtown district.',
          options: ['A. new life', 'B. clear air', 'C. cold wind', 'D. deep sigh'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'breathe new life into',
          meaningVi: 'Thổi luồng sinh khí mới vào, làm sống động lại',
          exampleSentence: 'The cultural center breathed new life into the old industrial zone.',
          explanation: 'Thành ngữ: "breathe new life into something" có nghĩa là mang lại sức sống mới, tái sinh hoặc làm cho nơi nào trở nên thịnh vượng, sôi nổi hơn.'
        }
      ]
    },
    {
      id: 'g11-u4',
      unitNumber: 4,
      title: 'Unit 4: ASEAN and Viet Nam',
      grade: '11',
      theme: 'Diplomacy, regional cooperation, cultural exchange, socio-economic integration',
      keyCollocations: ['regional solidarity', 'cultural exchange', 'maintain peace and stability', 'foster mutual understanding', 'member states'],
      keyIdioms: ['join hands', 'see eye to eye', 'stand shoulder to shoulder', 'build bridges'],
      sampleDrill: [
        {
          id: 'g11-u4-q1',
          num: 1,
          question: 'All ASEAN member states are committed to maintaining peace and ______ across Southeast Asia.',
          options: ['A. stability', 'B. stillness', 'C. fixedness', 'D. firmness'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'maintain peace and stability',
          meaningVi: 'Duy trì hòa bình và ổn định khu vực',
          exampleSentence: 'Viet Nam actively contributes to maintaining peace and stability in the region.',
          explanation: 'Collocation ngoại giao cốt lõi: "maintain peace and stability" (duy trì hòa bình và sự ổn định). Các từ stillness (sự tĩnh lặng) hay firmness không dùng trong văn bản chính trị ngoại giao.'
        },
        {
          id: 'g11-u4-q2',
          num: 2,
          question: 'Youth delegates from ten nations came together to ______ bridges and strengthen cross-cultural friendships.',
          options: ['A. set', 'B. build', 'C. craft', 'D. forge'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'build bridges (between)',
          meaningVi: 'Xây dựng nhịp cầu gắn kết, thu hẹp khoảng cách văn hóa',
          exampleSentence: 'Educational exchange programs help build bridges between young citizens.',
          explanation: 'Thành ngữ: "build bridges" (xây dựng cầu nối gắn kết, tạo mối quan hệ hữu nghị thân thiện giữa các bên).'
        },
        {
          id: 'g11-u4-q3',
          num: 3,
          question: 'Countries in the region need to ______ hands to combat cross-border plastic waste and climate emergencies.',
          options: ['A. hold', 'B. join', 'C. shake', 'D. link'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'join hands (to do something)',
          meaningVi: 'Chung tay, hợp lực giải quyết vấn đề',
          exampleSentence: 'All communities must join hands to protect biodiversity.',
          explanation: 'Cụm thành ngữ thông dụng: "join hands with somebody / join hands to do something" (chung tay góp sức). "Shake hands" là bắt tay chào hỏi; "hold hands" là nắm tay.'
        },
        {
          id: 'g11-u4-q4',
          num: 4,
          question: 'Annual youth festivals are organized to foster mutual ______ and celebrate Southeast Asian cultural diversity.',
          options: ['A. understanding', 'B. comprehension', 'C. perception', 'D. grasp'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'foster mutual understanding',
          meaningVi: 'Tăng cường sự hiểu biết lẫn nhau',
          exampleSentence: 'Sports events foster mutual understanding among regional neighbours.',
          explanation: 'Collocation học thuật: "foster mutual understanding" (bồi dưỡng, nâng cao sự hiểu biết lẫn nhau). "Comprehension" thường dùng cho kỹ năng đọc hiểu.'
        },
        {
          id: 'g11-u4-q5',
          num: 5,
          question: 'During regional crises, member nations must stand ______ to overcome economic hurdles and health emergencies.',
          options: ['A. eye to eye', 'B. arm in arm', 'C. shoulder to shoulder', 'D. back to back'],
          correctAnswer: 'C',
          type: 'idiom',
          targetPhrase: 'stand shoulder to shoulder',
          meaningVi: 'Kề vai sát cánh, đoàn kết kiên định cùng vượt qua thử thách',
          exampleSentence: 'Volunteers stood shoulder to shoulder to rescue villagers during the storm.',
          explanation: 'Thành ngữ: "stand shoulder to shoulder" (kề vai sát cánh cùng nhau vượt qua khó khăn). "Back to back" là liên tiếp nhau hoặc quay lưng; "arm in arm" là khoác tay đi dạo.'
        }
      ]
    },
    {
      id: 'g11-u5',
      unitNumber: 5,
      title: 'Unit 5: Global Warming',
      grade: '11',
      theme: 'Greenhouse effect, emissions, rising sea levels, deforestation',
      keyCollocations: ['greenhouse gases', 'rising sea levels', 'extreme weather', 'fossil fuels', 'catastrophic damage'],
      keyIdioms: ['skate on thin ice', 'a drop in the ocean', 'weather the storm', 'play with fire'],
      sampleDrill: [
        {
          id: 'g11-u5-q1',
          num: 1,
          question: 'The burning of ______ fuels like coal and oil releases excessive amounts of carbon dioxide into the atmosphere.',
          options: ['A. ancient', 'B. fossil', 'C. antique', 'D. prehistoric'],
          correctAnswer: 'B',
          type: 'collocation',
          targetPhrase: 'fossil fuels',
          meaningVi: 'Nhiên liệu hóa thạch (than đá, dầu mỏ)',
          exampleSentence: 'Transitioning away from fossil fuels is crucial to limit global warming.',
          explanation: 'Collocation khoa học: "fossil fuels" (nhiên liệu hóa thạch).'
        },
        {
          id: 'g11-u5-q2',
          num: 2,
          question: 'Coastal cities across the globe are under severe threat from rising ______ levels caused by melting polar ice caps.',
          options: ['A. ocean', 'B. water', 'C. sea', 'D. flood'],
          correctAnswer: 'C',
          type: 'collocation',
          targetPhrase: 'rising sea levels',
          meaningVi: 'Mực nước biển dâng cao',
          exampleSentence: 'Rising sea levels threaten low-lying delta regions in Vietnam.',
          explanation: 'Collocation địa lý - môi trường: "rising sea levels" (mực nước biển dâng).'
        },
        {
          id: 'g11-u5-q3',
          num: 3,
          question: 'Governments that continue to ignore climate pledges are ______ with the future survival of humanity.',
          options: ['A. dancing with wind', 'B. playing with fire', 'C. swimming in storm', 'D. walking in fog'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'play with fire',
          meaningVi: 'Đùa với lửa (hành động liều lĩnh, nguy hiểm)',
          exampleSentence: 'Cutting safety protocols in chemical factories is truly playing with fire.',
          explanation: 'Thành ngữ: "play with fire" (đùa với lửa, mạo hiểm với hiểm họa).'
        },
        {
          id: 'g11-u5-q4',
          num: 4,
          question: 'The financial donation of 100 dollars is just ______ compared to the millions required for reforestation.',
          options: ['A. a drop in the ocean', 'B. a stone in the lake', 'C. a grain in the sand', 'D. a cloud in the sky'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'a drop in the ocean',
          meaningVi: 'Giọt nước trong biển cả, quá nhỏ bé không đáng kể',
          exampleSentence: 'Our initial fundraising effort was a drop in the ocean compared to the reconstruction costs.',
          explanation: 'Thành ngữ: "a drop in the ocean" (hạt cát trong sa mạc / muối bỏ biển).'
        },
        {
          id: 'g11-u5-q5',
          num: 5,
          question: 'Industries that emit hazardous fumes without filtration are ______ with safety inspection laws.',
          options: ['A. running on hot bricks', 'B. skating on thin ice', 'C. sliding on wet moss', 'D. stepping on raw eggs'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'skate on thin ice',
          meaningVi: 'Đi trên băng mỏng, lâm vào tình thế rủi ro nguy hiểm',
          exampleSentence: 'You are skating on thin ice by coming late to work every morning.',
          explanation: 'Thành ngữ: "skate on thin ice" (mạo hiểm, làm việc liều lĩnh dễ rước họa).'
        }
      ]
    }
  ],
  '12': [
    {
      id: 'g12-u1',
      unitNumber: 1,
      title: 'Unit 1: Life Stories We Admire',
      grade: '12',
      theme: 'Biographies, historical figures, achievements, dedication',
      keyCollocations: ['overcome adversity', 'inspirational figure', 'lifelong devotion', 'exceptional achievement', 'leave a legacy'],
      keyIdioms: ['against all odds', 'leave one’s mark', 'stand on the shoulders of giants', 'pave the way'],
      sampleDrill: [
        {
          id: 'g12-u1-q1',
          num: 1,
          question: 'Despite being born into extreme poverty, he managed to ______ severe adversity and become a world-renowned physician.',
          options: ['A. overcome', 'B. overthrow', 'C. overlook', 'D. overtake'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'overcome adversity',
          meaningVi: 'Vượt qua nghịch cảnh, gian khó',
          exampleSentence: 'Her memoir depicts how she overcame adversity with courage and resilience.',
          explanation: 'Collocation tiểu sử danh nhân: "overcome adversity" (vượt qua nghịch cảnh).'
        },
        {
          id: 'g12-u1-q2',
          num: 2,
          question: 'President Ho Chi Minh is celebrated worldwide as an inspirational ______ who devoted his life to national independence.',
          options: ['A. figure', 'B. shape', 'C. statue', 'D. profile'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'inspirational figure',
          meaningVi: 'Nhân vật truyền cảm hứng',
          exampleSentence: 'Marie Curie remains an inspirational figure for young female scientists.',
          explanation: 'Collocation: "inspirational figure" (nhân vật truyền cảm hứng).'
        },
        {
          id: 'g12-u1-q3',
          num: 3,
          question: '______ all odds, the paralyzed athlete completed the marathon and touched the hearts of millions.',
          options: ['A. Across', 'B. Above', 'C. Against', 'D. Beyond'],
          correctAnswer: 'C',
          type: 'idiom',
          targetPhrase: 'against all odds',
          meaningVi: 'Bất chấp mọi nghịch cảnh, vượt qua mọi sự bất khả thi',
          exampleSentence: 'Against all odds, the tiny startup survived economic recession and succeeded.',
          explanation: 'Thành ngữ kinh điển: "against all odds" (bất chấp nghịch cảnh khó khăn nhất).'
        },
        {
          id: 'g12-u1-q4',
          num: 4,
          question: 'Steve Jobs undoubtedly left his ______ on the technological landscape with the invention of the iPhone.',
          options: ['A. stamp', 'B. mark', 'C. scratch', 'D. sign'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'leave one’s mark (on something)',
          meaningVi: 'Để lại dấu ấn sâu sắc, làm rạng danh tên tuổi',
          exampleSentence: 'Great writers leave their mark on literature for centuries.',
          explanation: 'Thành ngữ: "leave one’s mark on something" (để lại dấu ấn không phai mờ).'
        },
        {
          id: 'g12-u1-q5',
          num: 5,
          question: 'Early suffragettes fought tirelessly to ______ the way for future generations of women in politics.',
          options: ['A. cement', 'B. brick', 'C. pave', 'D. asphalt'],
          correctAnswer: 'C',
          type: 'idiom',
          targetPhrase: 'pave the way (for)',
          meaningVi: 'Mở đường, tạo điều kiện thuận lợi cho thế hệ mai sau',
          exampleSentence: 'Groundbreaking research paved the way for clean nuclear fusion.',
          explanation: 'Thành ngữ: "pave the way for somebody/something" (mở đường cho cái gì).'
        }
      ]
    },
    {
      id: 'g12-u2',
      unitNumber: 2,
      title: 'Unit 2: A Diversity of Cultures',
      grade: '12',
      theme: 'Cultural heritage, traditions, customs, social etiquette, intercultural dialogue',
      keyCollocations: ['cultural heritage', 'pay tribute to', 'customs and traditions', 'cross-cultural communication', 'sense of belonging'],
      keyIdioms: ['when in Rome do as the Romans do', 'break the ice', 'melt in the pot', 'stick out like a sore thumb'],
      sampleDrill: [
        {
          id: 'g12-u2-q1',
          num: 1,
          question: 'The imperial citadel of Thang Long was inscribed by UNESCO as an exceptional piece of world ______ heritage.',
          options: ['A. cultural', 'B. customary', 'C. civilized', 'D. culturing'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'cultural heritage',
          meaningVi: 'Di sản văn hóa',
          exampleSentence: 'Traditional folk singing is an invaluable intangible cultural heritage.',
          explanation: 'Collocation chuẩn: "cultural heritage" (di sản văn hóa). "Customary" (theo tập quán, thông lệ), "civilized" (văn minh).'
        },
        {
          id: 'g12-u2-q2',
          num: 2,
          question: 'When traveling abroad, you should remember the golden rule: "When in Rome, ______ as the Romans do".',
          options: ['A. act', 'B. live', 'C. do', 'D. stay'],
          correctAnswer: 'C',
          type: 'idiom',
          targetPhrase: 'when in Rome, do as the Romans do',
          meaningVi: 'Nhập gia tùy tục (khi ở đâu thì tuân theo phong tục ở đó)',
          exampleSentence: 'I tried eating with wooden chopsticks in Tokyo: when in Rome, do as the Romans do!',
          explanation: 'Thành ngữ kinh điển: "When in Rome, do as the Romans do" (Nhập gia tùy tục). Cụm cố định không thay đổi động từ "do".'
        },
        {
          id: 'g12-u2-q3',
          num: 3,
          question: 'The opening social reception was awkward at first until the host told a witty joke to ______ the ice.',
          options: ['A. melt', 'B. break', 'C. shatter', 'D. crack'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'break the ice',
          meaningVi: 'Phá vỡ bầu không khí ngượng ngùng lúc ban đầu',
          exampleSentence: 'An introductory game helped break the ice among international students.',
          explanation: 'Thành ngữ: "break the ice" (làm quen, phá vỡ sự xa lạ, ngượng ngùng ban đầu).'
        },
        {
          id: 'g12-u2-q4',
          num: 4,
          question: 'Wearing a bright neon sports tracksuit to a solemn traditional tea ceremony made him ______ like a sore thumb.',
          options: ['A. stick out', 'B. stand off', 'C. push out', 'D. jut over'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'stick out like a sore thumb',
          meaningVi: 'Nổi bật lên một cách kỳ quặc, lạc lõng, chướng mắt',
          exampleSentence: 'His formal tuxedo stuck out like a sore thumb at the beach barbecue.',
          explanation: 'Thành ngữ: "stick out like a sore thumb" (lạc lõng, khác người một cách dễ nhận thấy).'
        },
        {
          id: 'g12-u2-q5',
          num: 5,
          question: 'Preserving ancestral rituals fosters a strong sense of ______ among members of the diaspora community.',
          options: ['A. belonging', 'B. possession', 'C. dwelling', 'D. ownership'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'sense of belonging',
          meaningVi: 'Cảm giác thuộc về một cộng đồng, sự gắn kết',
          exampleSentence: 'Clubs and cultural associations give youths a welcoming sense of belonging.',
          explanation: 'Collocation xã hội học: "sense of belonging" (ý thức gắn bó, cảm giác thuộc về một tập thể/quê hương).'
        }
      ]
    },
    {
      id: 'g12-u3',
      unitNumber: 3,
      title: 'Unit 3: Green Living',
      grade: '12',
      theme: 'Zero-waste lifestyle, eco-tourism, organic farming, sustainable consumption',
      keyCollocations: ['zero-waste lifestyle', 'biodegradable packaging', 'carbon-neutral', 'organic produce', 'conserve natural resources'],
      keyIdioms: ['turn over a new leaf', 'clear the air', 'go the extra mile', 'in the driver’s seat'],
      sampleDrill: [
        {
          id: 'g12-u3-q1',
          num: 1,
          question: 'To eliminate household rubbish, Linh decided to adopt a ______ lifestyle by composting food scraps and using refillable jars.',
          options: ['A. zero-waste', 'B. null-trash', 'C. void-litter', 'D. free-debris'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'zero-waste lifestyle',
          meaningVi: 'Lối sống không rác thải',
          exampleSentence: 'Adopting a zero-waste lifestyle requires mindful shopping habits.',
          explanation: 'Collocation môi trường thế kỷ 21: "zero-waste lifestyle" (lối sống không rác thải).'
        },
        {
          id: 'g12-u3-q2',
          num: 2,
          question: 'Many beverage companies have switched to ______ packaging made from sugarcane bagasse and cornstarch.',
          options: ['A. biodegradable', 'B. biotoxic', 'C. biochemical', 'D. biostatic'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'biodegradable packaging',
          meaningVi: 'Bao bì có thể phân hủy sinh học',
          exampleSentence: 'Biodegradable packaging breaks down naturally without leaving microplastics.',
          explanation: 'Collocation: "biodegradable packaging / materials" (bao bì tự phân hủy sinh học).'
        },
        {
          id: 'g12-u3-q3',
          num: 3,
          question: 'After learning about global warming, Nam decided to ______ and pledged to walk to school every day.',
          options: ['A. turn over a new leaf', 'B. flip over a new page', 'C. shake a new tree', 'D. rotate a fresh branch'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'turn over a new leaf',
          meaningVi: 'Bước sang trang mới, thay đổi hoàn toàn theo hướng tích cực hơn',
          exampleSentence: 'The New Year is a wonderful opportunity to turn over a new leaf.',
          explanation: 'Thành ngữ: "turn over a new leaf" (thay đổi tích cực, cải tà quy chính, làm lại cuộc đời).'
        },
        {
          id: 'g12-u3-q4',
          num: 4,
          question: 'Environmentally conscious firms are willing to ______ to ensure all materials are ethically sourced.',
          options: ['A. run the long lap', 'B. walk the extra yard', 'C. go the extra mile', 'D. sprint the whole path'],
          correctAnswer: 'C',
          type: 'idiom',
          targetPhrase: 'go the extra mile',
          meaningVi: 'Sẵn sàng nỗ lực nhiều hơn bình thường để đạt kết quả tốt nhất',
          exampleSentence: 'Our teacher always goes the extra mile to assist students who fall behind.',
          explanation: 'Thành ngữ: "go the extra mile" (cố gắng nhiều hơn sự mong đợi).'
        },
        {
          id: 'g12-u3-q5',
          num: 5,
          question: 'Citizens must put themselves ______ when it comes to combating municipal climate degradation.',
          options: ['A. on the bicycle pedal', 'B. in the driver’s seat', 'C. at the train engine', 'D. over the plane wing'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'in the driver’s seat',
          meaningVi: 'Nắm quyền chủ động, làm chủ tình thế',
          exampleSentence: 'You are in the driver’s seat of your own educational journey.',
          explanation: 'Thành ngữ: "in the driver’s seat" (ở vị trí người cầm lái, kiểm soát và chủ động định đoạt).'
        }
      ]
    },
    {
      id: 'g12-u4',
      unitNumber: 4,
      title: 'Unit 4: Urbanisation',
      grade: '12',
      theme: 'Rural-to-urban migration, infrastructure overload, standard of living, mega-cities',
      keyCollocations: ['rural-to-urban migration', 'overload infrastructure', 'standard of living', 'slum clearance', 'traffic congestion'],
      keyIdioms: ['the rat race', 'hustle and bustle', 'fast lane', 'cost an arm and a leg'],
      sampleDrill: [
        {
          id: 'g12-u4-q1',
          num: 1,
          question: 'Massive rural-to-urban ______ has exerted intense pressure on healthcare and housing in megacities.',
          options: ['A. migration', 'B. wandering', 'C. strolling', 'D. drifting'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'rural-to-urban migration',
          meaningVi: 'Sự di cư từ nông thôn ra thành thị',
          exampleSentence: 'Rural-to-urban migration requires progressive city planning.',
          explanation: 'Collocation xã hội học trọng điểm: "rural-to-urban migration" (dòng di dân từ nông thôn ra thành phố).'
        },
        {
          id: 'g12-u4-q2',
          num: 2,
          question: 'After twenty years trapped in the corporate ______, he resigned and moved to an organic farm in Da Lat.',
          options: ['A. rat race', 'B. cat track', 'C. dog run', 'D. bird chase'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'the rat race',
          meaningVi: 'Cuộc đua tranh giành giật công danh tiền tài mệt mỏi ở chốn đô thị',
          exampleSentence: 'Many urbanites seek mindful meditation to escape the exhausting rat race.',
          explanation: 'Thành ngữ: "the rat race" chỉ lối sống bon chen, chạy đua kiếm tiền và thăng tiến đầy căng thẳng trong xã hội hiện đại.'
        },
        {
          id: 'g12-u4-q3',
          num: 3,
          question: 'Elderly residents often seek quiet rural villages to escape the ______ of downtown Hanoi.',
          options: ['A. hustle and bustle', 'B. push and shove', 'C. hit and run', 'D. give and take'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'hustle and bustle',
          meaningVi: 'Sự nhộn nhịp hối hả và ồn ào của phố xá đô thị',
          exampleSentence: 'I enjoy the tranquility of nature away from the hustle and bustle of big cities.',
          explanation: 'Thành ngữ: "hustle and bustle" (chốn đô thị phồn hoa náo nhiệt, ồn ào tấp nập).'
        },
        {
          id: 'g12-u4-q4',
          num: 4,
          question: 'Renting an apartment in the central business district costs ______ for low-income migrant workers.',
          options: ['A. an arm and a leg', 'B. a head and a hand', 'C. a tooth and an ear', 'D. a heart and a lung'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'cost an arm and a leg',
          meaningVi: 'Cực kỳ đắt đỏ, tốn kém ngất ngưởng',
          exampleSentence: 'Private housing in luxury towers costs an arm and a leg.',
          explanation: 'Thành ngữ quen thuộc: "cost an arm and a leg" (giá cả trên trời, vô cùng đắt đỏ).'
        },
        {
          id: 'g12-u4-q5',
          num: 5,
          question: 'Rapid population influx has severely overloaded the public transportation ______ in peak hours.',
          options: ['A. infrastructure', 'B. base-work', 'C. substructure', 'D. groundwork'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'overload infrastructure',
          meaningVi: 'Làm quá tải cơ sở hạ tầng',
          exampleSentence: 'Investment is needed to upgrade aging municipal infrastructure.',
          explanation: 'Collocation cốt lõi Unit 4: "overload infrastructure / transportation infrastructure" (cơ sở hạ tầng giao thông bị quá tải).'
        }
      ]
    },
    {
      id: 'g12-u5',
      unitNumber: 5,
      title: 'Unit 5: The World of Work',
      grade: '12',
      theme: 'Job market, career prospective, workplace skills, automation, employment',
      keyCollocations: ['job security', 'career prospective', 'hands-on experience', 'climb the career ladder', 'workplace culture'],
      keyIdioms: ['learn the ropes', 'burn the candle at both ends', 'call it a day', 'bring home the bacon'],
      sampleDrill: [
        {
          id: 'g12-u5-q1',
          num: 1,
          question: 'Fresh graduates are often advised to seek internship opportunities to gain valuable ______ experience.',
          options: ['A. hands-on', 'B. foot-on', 'C. eye-in', 'D. finger-in'],
          correctAnswer: 'A',
          type: 'collocation',
          targetPhrase: 'hands-on experience',
          meaningVi: 'Kinh nghiệm thực hành, trải nghiệm thực tế',
          exampleSentence: 'The engineering course emphasizes hands-on experience in laboratory workshops.',
          explanation: 'Collocation việc làm: "hands-on experience / training" (kinh nghiệm thực hành thực tế).'
        },
        {
          id: 'g12-u5-q2',
          num: 2,
          question: 'Working diligently and building positive connections helped her quickly climb the corporate ______.',
          options: ['A. stairs', 'B. ladder', 'C. escalator', 'D. elevator'],
          correctAnswer: 'B',
          type: 'collocation',
          targetPhrase: 'climb the career/corporate ladder',
          meaningVi: 'Thăng tiến từng bước trên nấc thang danh vọng, sự nghiệp',
          exampleSentence: 'He spent twenty years climbing the corporate ladder to become CEO.',
          explanation: 'Collocation: "climb the career/corporate ladder" (thăng tiến trong sự nghiệp).'
        },
        {
          id: 'g12-u5-q3',
          num: 3,
          question: 'During your first two weeks at the company, a senior mentor will help you ______ and get familiar with software.',
          options: ['A. tie the knots', 'B. learn the ropes', 'C. pull the strings', 'D. cut the cords'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'learn the ropes',
          meaningVi: 'Học hỏi những điều cơ bản, nắm vững cách thức vận hành công việc',
          exampleSentence: 'It took me a month to learn the ropes of customer relationship management.',
          explanation: 'Thành ngữ công sở: "learn the ropes" (học việc, nắm bắt công việc mới).'
        },
        {
          id: 'g12-u5-q4',
          num: 4,
          question: 'Taking on two part-time jobs while preparing for final graduation exams means he is ______.',
          options: ['A. lighting the stove from inside', 'B. burning the candle at both ends', 'C. boiling the kettle in two fires', 'D. warming the iron in dual sparks'],
          correctAnswer: 'B',
          type: 'idiom',
          targetPhrase: 'burn the candle at both ends',
          meaningVi: 'Làm việc quần quật ngày đêm, vắt kiệt sức lực',
          exampleSentence: 'You will fall ill if you keep burning the candle at both ends.',
          explanation: 'Thành ngữ: "burn the candle at both ends" (thức khuya dậy sớm làm việc kiệt sức).'
        },
        {
          id: 'g12-u5-q5',
          num: 5,
          question: 'We have finished reviewing forty job applications today; let us ______ and resume tomorrow morning.',
          options: ['A. call it a day', 'B. name it a night', 'C. mark it a week', 'D. sign it a break'],
          correctAnswer: 'A',
          type: 'idiom',
          targetPhrase: 'call it a day',
          meaningVi: 'Kết thúc ngày làm việc, nghỉ ngơi',
          exampleSentence: 'It’s already 6 PM; let’s call it a day and head home.',
          explanation: 'Thành ngữ: "call it a day" (dừng công việc hôm nay lại).'
        }
      ]
    }
  ]
};

// Generates dynamic 10 - 15 question multiple choice drill for ANY unit (preset or custom)
export function generateDynamicVocabDrill(
  unitTitle: string,
  grade: '10' | '11' | '12',
  focus: 'all' | 'collocations' | 'idioms' = 'all',
  difficulty: 'medium' | 'hard' = 'medium',
  requestedCount: number = 12
): VocabDrillResult {
  const normalizedTitle = unitTitle.toLowerCase().trim();
  const targetCount = Math.max(10, Math.min(15, requestedCount || 12));

  // 1. Gather all questions from current unit and other units of same grade
  const gradeUnits = VOCAB_DRILL_CURRICULUM[grade] || [];
  const matched = gradeUnits.find(
    u => normalizedTitle.includes(u.title.toLowerCase()) || 
         normalizedTitle.includes(`unit ${u.unitNumber}`) ||
         u.title.toLowerCase().includes(normalizedTitle)
  );

  let pool: VocabDrillQuestion[] = [];
  if (matched && matched.sampleDrill && matched.sampleDrill.length > 0) {
    pool = [...matched.sampleDrill];
  }

  // Add questions from other units of same grade to expand to 10-15 questions
  for (const otherUnit of gradeUnits) {
    if (otherUnit.id !== matched?.id && otherUnit.sampleDrill) {
      pool.push(...otherUnit.sampleDrill);
    }
  }

  // 2. Synthesize smart contextual questions for custom unit
  const contextualBank: VocabDrillQuestion[] = [
    {
      id: `custom-q-1`,
      num: 1,
      question: `In the context of ${unitTitle}, experts strongly recommend that young learners should ______ an active role in sustainable development.`,
      options: ['A. play', 'B. make', 'C. build', 'D. pose'],
      correctAnswer: 'A',
      type: 'collocation',
      targetPhrase: 'play an active role (in)',
      meaningVi: 'Đóng một vai trò tích cực / chủ động',
      exampleSentence: `Youth organisations play an active role in the thematic studies of ${unitTitle}.`,
      explanation: 'Collocation học thuật: "play a role / play an active role in something" (đóng vai trò trong cái gì). Các từ make/build/pose không đi kèm với role trong nghĩa này.'
    },
    {
      id: `custom-q-2`,
      num: 2,
      question: `Local authorities have taken decisive measures to ______ public awareness of critical challenges discussed in ${unitTitle}.`,
      options: ['A. lift', 'B. rise', 'C. raise', 'D. boost'],
      correctAnswer: 'C',
      type: 'collocation',
      targetPhrase: 'raise awareness (of/about)',
      meaningVi: 'Nâng cao nhận thức của cộng đồng',
      exampleSentence: `Seminars were held to raise awareness about the key issues of ${unitTitle}.`,
      explanation: 'Collocation chuẩn ma trận Bộ GD&ĐT: "raise awareness of something" (ngoại động từ đi với tân ngữ awareness).'
    },
    {
      id: `custom-q-3`,
      num: 3,
      question: `When analyzing the core issues of ${unitTitle}, educators and policymakers finally managed to ______ and reached a unanimous consensus.`,
      options: ['A. see eye to eye', 'B. turn a blind eye', 'C. keep an eye on', 'D. hit between the eyes'],
      correctAnswer: 'A',
      type: 'idiom',
      targetPhrase: 'see eye to eye (with somebody)',
      meaningVi: 'Hoàn toàn đồng lòng, chung quan điểm và tầm nhìn',
      exampleSentence: `Both committees see eye to eye on how to implement the curriculum objectives.`,
      explanation: 'Thành ngữ: "see eye to eye" (đồng quan điểm). "Turn a blind eye" (nhắm mắt làm ngơ); "keep an eye on" (để mắt canh chừng).'
    },
    {
      id: 'custom-q-4',
      num: 4,
      question: `The initial environmental and educational projects were only ______; substantial collective reforms are still required.`,
      options: ['A. the tip of the iceberg', 'B. a bolt from the blue', 'C. the apple of the eye', 'D. a storm in a teacup'],
      correctAnswer: 'A',
      type: 'idiom',
      targetPhrase: 'the tip of the iceberg',
      meaningVi: 'Chỉ là phần nổi của tảng băng chìm (vấn đề thực tế rộng lớn hơn nhiều)',
      exampleSentence: `The current discoveries in ${unitTitle} are just the tip of the iceberg.`,
      explanation: 'Thành ngữ: "the tip of the iceberg" chỉ một phần nhỏ có thể nhận thấy của một hiện tượng hay vấn đề phức tạp to lớn hơn.'
    },
    {
      id: 'custom-q-5',
      num: 5,
      question: `Dedicated researchers are willing to ______ to ensure that innovative solutions for ${unitTitle} achieve maximum effectiveness.`,
      options: ['A. run the long track', 'B. go the extra mile', 'C. walk the hard path', 'D. push the heavy door'],
      correctAnswer: 'B',
      type: 'idiom',
      targetPhrase: 'go the extra mile',
      meaningVi: 'Nỗ lực nhiều hơn bình thường để gặt hái thành công trọn vẹn',
      exampleSentence: `Teachers often go the extra mile to guide students through difficult unit exercises.`,
      explanation: 'Thành ngữ: "go the extra mile" (cố gắng nhiều hơn mong đợi bình thường).'
    },
    {
      id: 'custom-q-6',
      num: 6,
      question: `Students should ______ full advantage of online self-study libraries to enhance their vocabulary mastery.`,
      options: ['A. take', 'B. make', 'C. get', 'D. find'],
      correctAnswer: 'A',
      type: 'collocation',
      targetPhrase: 'take full advantage of',
      meaningVi: 'Tận dụng triệt để, phát huy tối đa lợi thế',
      exampleSentence: 'Diligent students always take full advantage of available reference materials.',
      explanation: 'Collocation cốt lõi: "take advantage of something" (tận dụng cái gì). Cụm cố định không dùng make hay get.'
    },
    {
      id: 'custom-q-7',
      num: 7,
      question: `To pass the national examination with flying colours, one must ______ and review grammar formulas every night.`,
      options: ['A. burn the midnight oil', 'B. add fuel to the fire', 'C. hit below the belt', 'D. spill the beans'],
      correctAnswer: 'A',
      type: 'idiom',
      targetPhrase: 'burn the midnight oil',
      meaningVi: 'Thức khuya miệt mài học tập, nghiên cứu',
      exampleSentence: 'Candidates burnt the midnight oil preparing for the university entrance exam.',
      explanation: 'Thành ngữ: "burn the midnight oil" nghĩa là thức khuya chong đèn học tập hoặc làm việc chăm chỉ.'
    },
    {
      id: 'custom-q-8',
      num: 8,
      question: `After weeks of intense brainstorming, the project team finally ______ with a groundbreaking technological idea.`,
      options: ['A. came up', 'B. went off', 'C. looked out', 'D. turned down'],
      correctAnswer: 'A',
      type: 'collocation',
      targetPhrase: 'come up with',
      meaningVi: 'Nghĩ ra, nảy ra ý tưởng mới',
      exampleSentence: 'She came up with a brilliant plan to reduce plastic waste in school.',
      explanation: 'Cụm động từ / Collocation: "come up with an idea/solution" (nghĩ ra, nảy ra một sáng kiến hoặc ý tưởng).'
    },
    {
      id: 'custom-q-9',
      num: 9,
      question: `Do not let minor misunderstandings ______ between you and your long-term study partner.`,
      options: ['A. come', 'B. jump', 'C. stand', 'D. walk'],
      correctAnswer: 'A',
      type: 'idiom',
      targetPhrase: 'come between',
      meaningVi: 'Gây chia rẽ, xen vào giữa mối quan hệ',
      exampleSentence: 'Nothing could come between the two best friends.',
      explanation: 'Thành ngữ / Cụm từ: "come between two people" (gây chia rẽ mối quan hệ tốt đẹp).'
    },
    {
      id: 'custom-q-10',
      num: 10,
      question: `Educators are working hard to ______ the gap between academic theory and practical job skills.`,
      options: ['A. bridge', 'B. pave', 'C. leap', 'D. patch'],
      correctAnswer: 'A',
      type: 'idiom',
      targetPhrase: 'bridge the gap',
      meaningVi: 'Rút ngắn khoảng cách, hàn gắn sự khác biệt',
      exampleSentence: 'Internships help bridge the gap between classroom theory and real workplace needs.',
      explanation: 'Thành ngữ: "bridge the gap" (thu hẹp khoảng cách giữa lý thuyết và thực tiễn).'
    },
    {
      id: 'custom-q-11',
      num: 11,
      question: `We cannot ______ a blind eye to environmental destruction happening in our own neighborhood.`,
      options: ['A. turn', 'B. close', 'C. shut', 'D. give'],
      correctAnswer: 'A',
      type: 'idiom',
      targetPhrase: 'turn a blind eye to',
      meaningVi: 'Nhắm mắt làm ngơ, vờ như không thấy',
      exampleSentence: 'Authorities must not turn a blind eye to illegal wildlife hunting.',
      explanation: 'Thành ngữ: "turn a blind eye to something" (nhắm mắt làm ngơ trước sai phạm).'
    },
    {
      id: 'custom-q-12',
      num: 12,
      question: `By sharing daily chores and mutual goals, the two brothers have always been like ______ in a pod.`,
      options: ['A. two peas', 'B. two beans', 'C. two nuts', 'D. two apples'],
      correctAnswer: 'A',
      type: 'idiom',
      targetPhrase: 'like two peas in a pod',
      meaningVi: 'Giống nhau như hai giọt nước',
      exampleSentence: 'The twin sisters are like two peas in a pod.',
      explanation: 'Thành ngữ: "like two peas in a pod" (giống hệt nhau từ ngoại hình đến sở thích).'
    },
    {
      id: 'custom-q-13',
      num: 13,
      question: `Every individual can ______ a difference by saving clean water and sorting domestic waste.`,
      options: ['A. make', 'B. create', 'C. build', 'D. compose'],
      correctAnswer: 'A',
      type: 'collocation',
      targetPhrase: 'make a difference',
      meaningVi: 'Tạo ra sự khác biệt tích cực, có ý nghĩa',
      exampleSentence: 'Small green habits can make a huge difference to our planet.',
      explanation: 'Collocation: "make a difference" (tạo ra sự khác biệt, đóng góp tích cực).'
    },
    {
      id: 'custom-q-14',
      num: 14,
      question: `Don’t count your chickens ______ they hatch; wait until the final test results are officially published.`,
      options: ['A. before', 'B. after', 'C. while', 'D. during'],
      correctAnswer: 'A',
      type: 'idiom',
      targetPhrase: 'count one’s chickens before they hatch',
      meaningVi: 'Nói trước bước không qua, đừng quá lạc quan trước khi có kết quả thực tế',
      exampleSentence: 'He started celebrating before the scores came out: counting chickens before they hatch!',
      explanation: 'Tục ngữ / Thành ngữ: "Don’t count your chickens before they hatch" (đừng vội mừng khi mọi chuyện chưa ngã ngũ).'
    },
    {
      id: 'custom-q-15',
      num: 15,
      question: `The successful launch of the community initiative has ______ the foundation for future educational programs.`,
      options: ['A. laid', 'B. lied', 'C. lain', 'D. settled'],
      correctAnswer: 'A',
      type: 'collocation',
      targetPhrase: 'lay the foundation (for)',
      meaningVi: 'Đặt nền móng, tạo cơ sở vững chắc cho tương lai',
      exampleSentence: 'Good study habits in high school lay the foundation for lifelong success.',
      explanation: 'Collocation: "lay the foundation for something" (đặt nền móng vững chắc cho cái gì).'
    }
  ];

  pool.push(...contextualBank);

  // Filter by focus if required
  let filtered = pool;
  if (focus === 'collocations') {
    filtered = pool.filter(q => q.type === 'collocation');
  } else if (focus === 'idioms') {
    filtered = pool.filter(q => q.type === 'idiom');
  }

  // Fallback to pool if filtered is too small
  if (filtered.length < targetCount) {
    filtered = pool;
  }

  // Deduplicate by question text
  const uniqueQuestions: VocabDrillQuestion[] = [];
  const seenQuestions = new Set<string>();

  for (const q of filtered) {
    const key = q.question.trim().slice(0, 40);
    if (!seenQuestions.has(key)) {
      seenQuestions.add(key);
      uniqueQuestions.push(q);
    }
    if (uniqueQuestions.length >= targetCount) break;
  }

  const finalQuestions = uniqueQuestions.slice(0, targetCount).map((q, idx) => ({
    ...q,
    id: `drill-${Date.now()}-${idx + 1}`,
    num: idx + 1
  }));

  return {
    unitTitle: matched?.title || unitTitle || `Chuyên đề Unit ${grade}`,
    grade,
    generatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    focus: focus === 'collocations' ? 'Key Collocations' : focus === 'idioms' ? 'Idiomatic Expressions' : 'Collocations & Idioms',
    difficulty: difficulty === 'hard' ? 'Vận dụng cao' : 'Thông hiểu - Vận dụng',
    questions: finalQuestions
  };
}
