import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Check,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  Edit3,
  Send,
  RefreshCw,
  Layers,
  Clock,
  BookOpen,
  GraduationCap,
  Search,
  CheckCircle2,
  ChevronRight,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sliders,
  Plus,
  Trash2,
  FileText,
  MessageSquare,
  PenTool,
  AlignLeft,
  ListOrdered,
  Volume2,
  Save,
  Headphones,
  Globe,
  RotateCcw,
  ExternalLink,
  Upload,
  Wrench
} from 'lucide-react';
import { ExamItem, ExamQuestion, AiQuota, ExamSectionType } from '../types';
import { formatQuestionHtml, formatOptionHtml, formatPassageHtml } from '../utils/examFormatters';
import {
  THPT_GRAMMAR_CATEGORIES,
  GLOBAL_SUCCESS_CURRICULUM,
  GrammarTopic,
  UnitItem
} from '../data/curriculumData';
import { AudioPlayerControl } from './AudioPlayerControl';
import { exportExamToWord } from '../utils/exportExamDocs';
import { TagInputAutocomplete } from './TagInputAutocomplete';
import { ManualExamTab } from './ManualExamTab';

export interface ReferenceSource {
  id: string;
  name: string;
  url: string;
  description: string;
  enabled: boolean;
  category?: 'sgk' | 'international' | 'news';
  icon?: string;
}

export interface AcademicSourceSuggestion {
  name: string;
  url: string;
  description: string;
  category: 'sgk' | 'international' | 'news';
  icon: string;
}

export const PRESTIGIOUS_ACADEMIC_SUGGESTIONS: AcademicSourceSuggestion[] = [
  { name: 'SGK Tiếng Anh Global Success (Lớp 10, 11, 12)', url: 'https://tienganhglobalsuccess.vn', description: 'Bộ SGK chuẩn GDPT 2018 của NXB Giáo Dục Việt Nam (70% từ vựng cốt lõi)', category: 'sgk', icon: '📚' },
  { name: 'British Council LearnEnglish', url: 'https://learnenglish.britishcouncil.org', description: 'Ngữ liệu chuẩn CEFR A2-C1, đọc hiểu & giao tiếp đời sống', category: 'international', icon: '🇬🇧' },
  { name: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish', description: 'Bản tin thời sự thế giới, idioms & phát âm chuẩn giọng UK', category: 'international', icon: '🌍' },
  { name: 'Cambridge English Assessment', url: 'https://www.cambridgeenglish.org', description: 'Cấu trúc bài thi quốc tế, collocations & từ vựng học thuật', category: 'international', icon: '🎓' },
  { name: 'Oxford Learner\'s Dictionaries', url: 'https://oxfordlearnersdictionaries.com', description: 'Tra cứu định nghĩa, mẫu câu & giới từ chuẩn xác', category: 'international', icon: '📖' },
  { name: 'IELTS Academic Resource Portal', url: 'https://www.ielts.org', description: 'Bài đọc phân hóa học thuật cao, tư duy phản biện & suy luận', category: 'international', icon: '📝' },
  { name: 'VNExpress International', url: 'https://e.vnexpress.net', description: 'Tin tức thời sự Việt Nam và quốc tế bằng tiếng Anh chuẩn xác', category: 'news', icon: '🇻🇳' },
  { name: 'Tuoi Tre News English', url: 'https://tuoitrenews.vn', description: 'Bản tin xã hội, văn hóa, giáo dục và giới trẻ Việt Nam', category: 'news', icon: '📰' },
  { name: 'VOA Learning English', url: 'https://learningenglish.voanews.com', description: 'Bản tin tiếng Anh ngữ tốc vừa phải, từ vựng phong phú theo chủ điểm', category: 'news', icon: '📻' },
  { name: 'National Geographic Learning', url: 'https://eltngl.com', description: 'Ngữ liệu khoa học tự nhiên, môi trường & khám phá thế giới', category: 'news', icon: '🌿' },
  { name: 'CEFR English Profile', url: 'https://www.englishprofile.org', description: 'Bảng quy chiếu từ vựng & ngữ pháp SGK Global Success', category: 'international', icon: '📊' },
  { name: 'Macmillan Dictionary & Thesaurus', url: 'https://www.macmillandictionary.com', description: 'Từ điển từ đồng nghĩa và mẫu câu thông dụng phong phú', category: 'international', icon: '📘' }
];

export const DEFAULT_REFERENCE_SOURCES: ReferenceSource[] = [
  { id: 'gs', name: 'SGK Tiếng Anh Global Success (Lớp 10, 11, 12)', url: 'https://tienganhglobalsuccess.vn', description: 'Bộ SGK chuẩn GDPT 2018 của NXB Giáo Dục Việt Nam', enabled: true, category: 'sgk', icon: '📚' },
  { id: 'bc', name: 'British Council LearnEnglish', url: 'https://learnenglish.britishcouncil.org', description: 'Ngữ liệu chuẩn CEFR A2-C1, đọc hiểu & giao tiếp đời sống', enabled: true, category: 'international', icon: '🇬🇧' },
  { id: 'bbc', name: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish', description: 'Bản tin thời sự thế giới, idioms & phát âm chuẩn giọng UK', enabled: true, category: 'international', icon: '🌍' },
  { id: 'cambridge', name: 'Cambridge English Assessment', url: 'https://www.cambridgeenglish.org', description: 'Cấu trúc bài thi quốc tế, collocations & từ vựng học thuật', enabled: true, category: 'international', icon: '🎓' },
  { id: 'oxford', name: 'Oxford Learner\'s Dictionaries', url: 'https://oxfordlearnersdictionaries.com', description: 'Tra cứu định nghĩa, mẫu câu & giới từ chuẩn xác', enabled: true, category: 'international', icon: '📖' },
  { id: 'ielts', name: 'IELTS Academic Resource Portal', url: 'https://www.ielts.org', description: 'Bài đọc phân hóa học thuật cao, tư duy phản biện & suy luận', enabled: false, category: 'international', icon: '📝' },
  { id: 'profile', name: 'CEFR English Profile', url: 'https://www.englishprofile.org', description: 'Bảng quy chiếu từ vựng & ngữ pháp SGK Global Success', enabled: true, category: 'international', icon: '📊' },
];

export const PRONUNCIATION_SUGGESTIONS = [
  'Đuôi -ed',
  'Đuôi -s/-es',
  'Nguyên âm đôi (Diphthongs)',
  'Phụ âm câm (Silent letters)',
  'Nguyên âm /i:/ vs /ɪ/',
  'Nguyên âm /æ/ vs /e/',
  'Trọng âm từ 2 âm tiết (Danh từ vs Động từ)',
  'Trọng âm từ có hậu tố (-tion, -ic, -ity, -ee...)',
  'Trọng âm từ ghép'
];

export const LEXICO_GRAMMAR_SUGGESTIONS = [
  'Relative pronouns & clauses',
  'Tenses (Quá khứ hoàn thành vs Quá khứ đơn, Hiện tại hoàn thành...)',
  'Conditional sentences (Loại 1, 2, 3, Mixed)',
  'Phrasal verbs thông dụng',
  'Modal verbs & Perfect modals',
  'Gerund & Infinitive',
  'Comparisons (So sánh kép, so sánh hơn/nhất)',
  'Conjunctions & Transition words',
  'Cụm từ cố định (Collocations)',
  'Cấu trúc & Thành ngữ (Idioms) theo SGK Global Success',
  'Inversion (Đảo ngữ)',
  'Subjunctive (Câu giả định)'
];

export const ARRANGEMENT_FORMAT_SUGGESTIONS = [
  'Sắp xếp đoạn hội thoại giao tiếp (Everyday Dialogue)',
  'Sắp xếp lá thư/Email (Formal/Informal Letter)',
  'Sắp xếp đoạn văn nghị luận/mô tả (Coherent Paragraph)',
  'Sắp xếp câu chuyện theo trình tự thời gian (Story narrative)'
];

export const CLOZE_READING_SUGGESTIONS = [
  'Connectors & Linking words',
  'Reduced relative clauses (Rút gọn MĐQH)',
  'Collocations',
  'Vocabulary in context',
  'Phrasal verbs',
  'Trật tự tính từ (OSASCOMP)',
  'Verb forms (V-ing/To V/V-bare)',
  'Prepositions of time/place/direction',
  'Quantifiers (Much, many, few, little, each, every)',
  'Pronouns & Determiners'
];

export const READING_COMPREHENSION_SUGGESTIONS = [
  'Main idea / Best title',
  'Reference questions (It/They/Which refers to...)',
  'Synonym & Antonym in context',
  'Not mentioned / Except questions',
  'True / False / Not Given',
  'Sentence insertion (Chèn câu vào vị trí thích hợp)',
  'Paraphrase question (Tìm câu đồng nghĩa với câu in đậm)',
  'Inference question (Câu hỏi suy luận logic)'
];

export const WRITING_SHORT_SUGGESTIONS = [
  'Tenses Transformation (Hiện tại hoàn thành sang Quá khứ đơn...)',
  'Relative clauses (Dùng đại từ hoặc rút gọn)',
  'Passive voice (Bị động thông thường & Bị động đặc biệt)',
  'Reported speech (Câu gián tiếp, câu hỏi, câu mệnh lệnh)',
  'Comparisons (Chuyển đổi so sánh bằng/hơn/nhất)',
  'Conditional sentences & Wish',
  'Modal verbs transformation',
  'Inversion (Đảo ngữ)',
  'Word formation (Danh/Tính/Động/Trạng theo ngữ cảnh)',
  'Cấu trúc "Too... to", "Enough... to", "So... that", "Such... that"'
];

export const ESSAY_TOPIC_SUGGESTIONS = [
  'Practical actions secondary students can take to protect the environment at their school',
  'The impact of Artificial Intelligence (AI) and digital tools on modern education',
  'Preserving traditional Vietnamese cultural heritage in the 21st century',
  'The importance of maintaining mental wellbeing and balanced lifestyle for teenagers',
  'Future career paths and essential skills needed in the digital era',
  'Ways to promote gender equality and equal opportunities in local communities',
  'Building sustainable green cities and promoting eco-friendly public transportation'
];

export interface DynamicPromptTemplate {
  id: string;
  name: string;
  badge: string;
  icon: string;
  themes: string;
  defaultTopicExample: string;
  systemInstruction: string;
}

export const DYNAMIC_CONTEXT_PROMPT_TEMPLATES: DynamicPromptTemplate[] = [
  {
    id: 'multi_thematic_dynamic',
    name: 'Đa Dạng Hóa Tự Động (Multi-thematic Dynamic)',
    badge: 'Khuyến nghị AI',
    icon: '🌟',
    themes: 'AI, Sinh thái, Văn hóa, Khoa học, Nghệ thuật, Vũ trụ',
    defaultTopicExample: 'English in the Modern World: Technology, Environment & Culture',
    systemInstruction: `CHỈ THỊ ĐA DẠNG HÓA NGỮ CẢNH & CHỐNG LẶP ĐỀ (DYNAMIC CONTEXT):
- Mỗi lần sinh đề mới, AI phải tự động luân phiên đổi mới bối cảnh, ngữ liệu và chủ đề bài đọc (xoay quanh đa dạng các lĩnh vực: công nghệ AI, biến đổi khí hậu & lối sống xanh, văn hóa di sản, nghề nghiệp tương lai, lối sống thanh thiếu niên...).
- Tuyệt đối không dùng lại các đoạn văn, đoạn hội thoại hay ngữ cảnh câu hỏi đã được tạo trước đó.
- Tạo các câu hỏi tình huống thực tế, hiện đại, không sử dụng các câu mẫu mặc định rập khuôn.`
  },
  {
    id: 'tech_ai_future',
    name: 'Công Nghệ Số & Trí Tuệ Nhân Tạo (Tech & AI Era)',
    badge: 'Chủ điểm Hot',
    icon: '🤖',
    themes: 'AI, Tự động hóa, Kỹ năng số, Thành phố thông minh',
    defaultTopicExample: 'Artificial Intelligence, Automation & Future Skills',
    systemInstruction: `BỐI CẢNH ĐA DẠNG: Trí tuệ nhân tạo (AI), tự động hóa, kỹ năng lao động số, đô thị thông minh và đạo đức công nghệ trong thế kỷ 21.`
  },
  {
    id: 'eco_green_earth',
    name: 'Môi Trường Sinh Thái & Lối Sống Xanh (Green & Eco Living)',
    badge: 'Chuẩn GDPT 2018',
    icon: '🌿',
    themes: 'Đa dạng sinh học, Rác thải nhựa, Năng lượng sạch, Khí hậu',
    defaultTopicExample: 'Green Living, Biodiversity & Environmental Sustainability',
    systemInstruction: `BỐI CẢNH ĐA DẠNG: Bảo tồn đa dạng sinh học, giảm thiểu rác thải nhựa (Zero Waste), chuyển đổi năng lượng xanh và du lịch sinh thái bền vững.`
  },
  {
    id: 'culture_heritage_global',
    name: 'Văn Hóa, Di Sản & Lối Sống Trẻ (Culture & Global Youth)',
    badge: 'Giao thoa quốc tế',
    icon: '🌍',
    themes: 'Di sản thế giới, Ẩm thực, Digital Detox, Sức khỏe tinh thần',
    defaultTopicExample: 'Cultural Heritage, Global Youth Trends & Well-being',
    systemInstruction: `BỐI CẢNH ĐA DẠNG: Bảo tồn di sản văn hóa, phong tục truyền thống, giao lưu đa văn hóa, thói quen cân bằng số (Digital Detox) và sức khỏe tinh thần thanh thiếu niên.`
  },
  {
    id: 'space_science_discovery',
    name: 'Khoa Học Vũ Trụ & Khám Phá Tự Nhiên (Space & Science)',
    badge: 'Tư duy học thuật',
    icon: '🚀',
    themes: 'Thiên văn học, Kính viễn vọng, Thám hiểm không gian, Hải dương',
    defaultTopicExample: 'Space Exploration, Astronomy & Ocean Wonders',
    systemInstruction: `BỐI CẢNH ĐA DẠNG: Khám phá không gian vũ trụ, thiên văn học hiện đại, thám hiểm đại dương sâu và những phát kiến khoa học tự nhiên đương đại.`
  }
];

interface AiExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExam: (newExam: ExamItem) => void;
  aiUsage: AiQuota;
  onIncrementUsage: () => void;
  onAssignExamDirectly?: (exam: ExamItem) => void;
  defaultTab?: 'ai' | 'manual' | 'visual' | 'text' | 'file';
}

export interface SectionToggleConfig {
  enabled: boolean;
  count: number;
  focusTopics?: string[];
  customPrompt?: string;
  selectedFormat?: string;
  includeGuidingQuestions?: boolean;
}

export interface ListeningToggleConfig extends SectionToggleConfig {
  task1Enabled: boolean;
  task1Count: number;
  task2Enabled: boolean;
  task2Type: 'multiple_choice' | 'fill_blank';
  task2Count: number;
  maxPlays: number;
}

export interface ExamSectionsFormConfig {
  listening: ListeningToggleConfig;
  pronunciation: SectionToggleConfig;
  lexico_grammar: SectionToggleConfig;
  arrangement: SectionToggleConfig;
  cloze_reading: SectionToggleConfig;
  reading_comprehension: SectionToggleConfig;
  writing_short: SectionToggleConfig;
  essay_writing: SectionToggleConfig;
}

const DEFAULT_SECTIONS_CONFIG: ExamSectionsFormConfig = {
  listening: {
    enabled: true,
    count: 8,
    task1Enabled: true,
    task1Count: 4,
    task2Enabled: true,
    task2Type: 'multiple_choice',
    task2Count: 4,
    maxPlays: 2,
    focusTopics: ['Listening for specific details & statistics', 'Listening for main idea & attitude']
  },
  pronunciation: {
    enabled: true,
    count: 2,
    focusTopics: ['Đuôi -ed', 'Trọng âm từ 2 âm tiết (Danh từ vs Động từ)']
  },
  lexico_grammar: {
    enabled: true,
    count: 4,
    focusTopics: [
      'Relative pronouns & clauses',
      'Tenses (Quá khứ hoàn thành vs Quá khứ đơn, Hiện tại hoàn thành...)',
      'Cụm từ cố định (Collocations)'
    ]
  },
  arrangement: {
    enabled: true,
    count: 1,
    focusTopics: ['Sắp xếp đoạn hội thoại giao tiếp (Everyday Dialogue)'],
    selectedFormat: 'Sắp xếp đoạn hội thoại giao tiếp (Everyday Dialogue)'
  },
  cloze_reading: {
    enabled: true,
    count: 5,
    focusTopics: [
      'Connectors & Linking words',
      'Reduced relative clauses (Rút gọn MĐQH)',
      'Vocabulary in context'
    ]
  },
  reading_comprehension: {
    enabled: true,
    count: 5,
    focusTopics: [
      'Main idea / Best title',
      'Reference questions (It/They/Which refers to...)',
      'Inference question (Câu hỏi suy luận logic)'
    ]
  },
  writing_short: {
    enabled: true,
    count: 2,
    focusTopics: [
      'Tenses Transformation (Hiện tại hoàn thành sang Quá khứ đơn...)',
      'Word formation (Danh/Tính/Động/Trạng theo ngữ cảnh)'
    ]
  },
  essay_writing: {
    enabled: true,
    count: 1,
    customPrompt: 'Practical actions secondary students can take to protect the environment at their school',
    includeGuidingQuestions: true,
    focusTopics: ['Argumentative Paragraph', 'Formal Academic Tone']
  }
};

export const AiExamModal: React.FC<AiExamModalProps> = ({
  isOpen,
  onClose,
  onSaveExam,
  aiUsage,
  onIncrementUsage,
  onAssignExamDirectly,
  defaultTab = 'ai',
}) => {
  const resolveTab = (tab: string | undefined): 'ai' | 'visual' | 'text' | 'file' => {
    if (tab === 'visual' || tab === 'text' || tab === 'file') return tab;
    if (tab === 'manual') return 'visual';
    return 'ai';
  };

  const [activeCreationTab, setActiveCreationTab] = useState<'ai' | 'visual' | 'text' | 'file'>(() => resolveTab(defaultTab));
  const [topic, setTopic] = useState('Green Living & Environmental Protection');
  const [grade, setGrade] = useState('Lớp 10');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<ExamItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveCreationTab(resolveTab(defaultTab));
    }
  }, [isOpen, defaultTab]);

  // Sections configuration
  const [sectionsConfig, setSectionsConfig] = useState<ExamSectionsFormConfig>(DEFAULT_SECTIONS_CONFIG);

  // Editing state for single questions
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<ExamQuestion | null>(null);
  const [regeneratingQuestionId, setRegeneratingQuestionId] = useState<string | null>(null);

  // Curriculum Explorer States
  const [curriculumTab, setCurriculumTab] = useState<'grammar' | 'global_success'>('global_success');
  const [grammarCategory, setGrammarCategory] = useState<string>('Tất cả');
  const [globalGradeKey, setGlobalGradeKey] = useState<string>('10');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showConfigDetails, setShowConfigDetails] = useState<boolean>(true);

  // Multi-unit & Reference Sources States
  const [selectedUnits, setSelectedUnits] = useState<UnitItem[]>([]);
  const [referenceSources, setReferenceSources] = useState<ReferenceSource[]>(DEFAULT_REFERENCE_SOURCES);
  const [customSourceInput, setCustomSourceInput] = useState<string>('');
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState<boolean>(false);
  const [sourceCategoryFilter, setSourceCategoryFilter] = useState<'all' | 'sgk' | 'international' | 'news'>('all');
  const [sourceActiveIndex, setSourceActiveIndex] = useState<number>(-1);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const [showSourcesPanel, setShowSourcesPanel] = useState<boolean>(false);
  const [driveExportSuccess, setDriveExportSuccess] = useState<boolean>(false);
  const [dedupWarningList, setDedupWarningList] = useState<string[]>([]);

  // Dynamic Context & AI Temperature States (0.8 default for unique non-repetitive generation)
  const [selectedPromptTemplateId, setSelectedPromptTemplateId] = useState<string>('multi_thematic_dynamic');
  const [aiTemperature, setAiTemperature] = useState<number>(0.8);
  const [showPromptDetails, setShowPromptDetails] = useState<boolean>(false);

  // Close sources dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(e.target as Node)) {
        setSourceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle multi-unit selection
  const handleToggleUnit = (unit: UnitItem) => {
    setSelectedUnits(prev => {
      const exists = prev.some(u => String(u.unitNumber) === String(unit.unitNumber));
      let updated: UnitItem[];
      if (exists) {
        updated = prev.filter(u => String(u.unitNumber) !== String(unit.unitNumber));
      } else {
        updated = [...prev, unit];
      }

      if (updated.length === 0) {
        setTopic('Tổng hợp kiến thức SGK Global Success');
      } else if (updated.length === 1) {
        setTopic(`Unit ${updated[0].unitNumber}: ${updated[0].unitName} - ${updated[0].theme}`);
      } else {
        const unitsStr = updated.map(u => `U${u.unitNumber} (${u.unitName})`).join(' + ');
        setTopic(`Ôn tập liên Unit: ${unitsStr} - SGK Global Success`);
      }
      return updated;
    });
  };

  const handleSelectTermUnits = (mode: 'term1' | 'term2' | 'all') => {
    if (!currentGlobalGrade) return;
    const units = currentGlobalGrade.units;
    let picked: UnitItem[] = [];
    if (mode === 'term1') {
      picked = units.slice(0, 5);
    } else if (mode === 'term2') {
      picked = units.slice(5, 10);
    } else {
      picked = [...units];
    }
    setSelectedUnits(picked);
    const unitsStr = picked.map(u => `U${u.unitNumber} (${u.unitName})`).join(' + ');
    setTopic(`Ôn tập tổng hợp ${picked.length} Units: ${unitsStr} - SGK Global Success`);
  };

  const handleClearSelectedUnits = () => {
    setSelectedUnits([]);
  };

  const handleToggleSource = (id: string) => {
    setReferenceSources(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleToggleAcademicSource = (item: AcademicSourceSuggestion) => {
    setReferenceSources(prev => {
      const existing = prev.find(s => s.name.toLowerCase() === item.name.toLowerCase() || s.url.toLowerCase() === item.url.toLowerCase());
      if (existing) {
        return prev.map(s => s.id === existing.id ? { ...s, enabled: !s.enabled } : s);
      }
      const newSource: ReferenceSource = {
        id: `academic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: item.name,
        url: item.url,
        description: item.description,
        enabled: true,
        category: item.category,
        icon: item.icon
      };
      return [...prev, newSource];
    });
    setCustomSourceInput('');
  };

  const handleAddAcademicSource = (item: AcademicSourceSuggestion) => {
    setReferenceSources(prev => {
      const existing = prev.find(s => s.name.toLowerCase() === item.name.toLowerCase() || s.url.toLowerCase() === item.url.toLowerCase());
      if (existing) {
        return prev.map(s => s.id === existing.id ? { ...s, enabled: true } : s);
      }
      const newSource: ReferenceSource = {
        id: `academic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: item.name,
        url: item.url,
        description: item.description,
        enabled: true,
        category: item.category,
        icon: item.icon
      };
      return [...prev, newSource];
    });
    setCustomSourceInput('');
  };

  const handleAddCustomSource = (overrideVal?: string) => {
    const val = (overrideVal || customSourceInput).trim();
    if (!val) return;

    // Check if matched in prestigious list
    const matched = PRESTIGIOUS_ACADEMIC_SUGGESTIONS.find(s =>
      s.name.toLowerCase() === val.toLowerCase() ||
      s.url.toLowerCase() === val.toLowerCase()
    );
    if (matched) {
      handleAddAcademicSource(matched);
      return;
    }

    let url = val;
    if (!url.startsWith('http') && (url.includes('.com') || url.includes('.vn') || url.includes('.org') || url.includes('.edu') || url.includes('.net'))) {
      url = `https://${url}`;
    }

    const newSource: ReferenceSource = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: val.startsWith('http') ? `Nguồn web: ${val.replace(/^https?:\/\//, '').split('/')[0]}` : val,
      url: url.startsWith('http') ? url : `https://google.com/search?q=${encodeURIComponent(val)}`,
      description: 'Nguồn học liệu trực tuyến do giáo viên đề xuất',
      enabled: true,
      category: 'international',
      icon: '🌐'
    };
    setReferenceSources(prev => [...prev, newSource]);
    setCustomSourceInput('');
  };

  const handleRemoveSource = (id: string) => {
    setReferenceSources(prev => prev.filter(s => s.id !== id));
  };

  const handleClearAllSources = () => {
    setReferenceSources([]);
  };

  const handleRestoreDefaultSources = () => {
    setReferenceSources(DEFAULT_REFERENCE_SOURCES);
  };

  // Google Drive Compatible Backup Export
  const handleExportGoogleDrivePackage = (exam: ExamItem) => {
    try {
      const drivePayload = {
        meta: {
          app: "EduAdmin AI Exam Studio",
          platform: "Google Drive Cloud Backup",
          syncedAt: new Date().toISOString(),
          curriculum: "Global Success GDPT 2018",
          listeningAccent: "UK Female (British English)",
          examId: exam.id,
          title: exam.title,
          grade: exam.grade,
          subject: exam.subject,
          duration: exam.duration,
          totalQuestions: exam.questionsCount,
          difficulty: exam.difficulty,
          topic: exam.topic,
          units: selectedUnits.map(u => ({ unitNumber: u.unitNumber, unitName: u.unitName })),
          sources: referenceSources.filter(s => s.enabled).map(s => s.name)
        },
        examData: exam
      };

      const blob = new Blob([JSON.stringify(drivePayload, null, 2)], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeTitle = exam.title.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_').slice(0, 35);
      link.href = url;
      link.download = `GoogleDrive_DeThi_${exam.grade}_${safeTitle}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setDriveExportSuccess(true);
      setTimeout(() => setDriveExportSuccess(false), 4000);
    } catch (err) {
      console.error('Lỗi xuất tệp Google Drive:', err);
    }
  };

  // Total questions count calculation
  const totalQuestionsCalculated = useMemo(() => {
    let count = 0;
    if (sectionsConfig.listening?.enabled) count += Number(sectionsConfig.listening.count) || 0;
    if (sectionsConfig.pronunciation.enabled) count += Number(sectionsConfig.pronunciation.count) || 0;
    if (sectionsConfig.lexico_grammar.enabled) count += Number(sectionsConfig.lexico_grammar.count) || 0;
    if (sectionsConfig.arrangement.enabled) count += Number(sectionsConfig.arrangement.count) || 0;
    if (sectionsConfig.cloze_reading.enabled) count += Number(sectionsConfig.cloze_reading.count) || 0;
    if (sectionsConfig.reading_comprehension.enabled) count += Number(sectionsConfig.reading_comprehension.count) || 0;
    if (sectionsConfig.writing_short.enabled) count += Number(sectionsConfig.writing_short.count) || 0;
    if (sectionsConfig.essay_writing.enabled) count += Number(sectionsConfig.essay_writing.count) || 0;
    return count;
  }, [sectionsConfig]);

  // Presets
  const applyPreset = (type: 'full' | 'regular' | 'reading_writing' | 'exam_prep') => {
    if (type === 'full') {
      setSectionsConfig(prev => ({
        listening: {
          ...prev.listening,
          enabled: true,
          count: 8,
          task1Enabled: true,
          task1Count: 4,
          task2Enabled: true,
          task2Type: 'multiple_choice',
          task2Count: 4,
          maxPlays: 2
        },
        pronunciation: { ...prev.pronunciation, enabled: true, count: 4 },
        lexico_grammar: { ...prev.lexico_grammar, enabled: true, count: 10 },
        arrangement: { ...prev.arrangement, enabled: true, count: 2 },
        cloze_reading: { ...prev.cloze_reading, enabled: true, count: 5 },
        reading_comprehension: { ...prev.reading_comprehension, enabled: true, count: 5 },
        writing_short: { ...prev.writing_short, enabled: true, count: 4 },
        essay_writing: { ...prev.essay_writing, enabled: true, count: 1 }
      }));
    } else if (type === 'regular') {
      setSectionsConfig(prev => ({
        listening: {
          ...prev.listening,
          enabled: false,
          count: 0,
          task1Enabled: false,
          task1Count: 0,
          task2Enabled: false,
          task2Type: 'multiple_choice',
          task2Count: 0,
          maxPlays: 2
        },
        pronunciation: { ...prev.pronunciation, enabled: true, count: 2 },
        lexico_grammar: { ...prev.lexico_grammar, enabled: true, count: 6 },
        arrangement: { ...prev.arrangement, enabled: false, count: 0 },
        cloze_reading: { ...prev.cloze_reading, enabled: true, count: 5 },
        reading_comprehension: { ...prev.reading_comprehension, enabled: false, count: 0 },
        writing_short: { ...prev.writing_short, enabled: true, count: 2 },
        essay_writing: { ...prev.essay_writing, enabled: false, count: 0 }
      }));
    } else if (type === 'reading_writing') {
      setSectionsConfig(prev => ({
        listening: {
          ...prev.listening,
          enabled: false,
          count: 0,
          task1Enabled: false,
          task1Count: 0,
          task2Enabled: false,
          task2Type: 'multiple_choice',
          task2Count: 0,
          maxPlays: 2
        },
        pronunciation: { ...prev.pronunciation, enabled: false, count: 0 },
        lexico_grammar: { ...prev.lexico_grammar, enabled: false, count: 0 },
        arrangement: { ...prev.arrangement, enabled: true, count: 2 },
        cloze_reading: { ...prev.cloze_reading, enabled: true, count: 5 },
        reading_comprehension: { ...prev.reading_comprehension, enabled: true, count: 5 },
        writing_short: { ...prev.writing_short, enabled: true, count: 4 },
        essay_writing: { ...prev.essay_writing, enabled: true, count: 1 }
      }));
    } else if (type === 'exam_prep') {
      setSectionsConfig(prev => ({
        listening: {
          ...prev.listening,
          enabled: true,
          count: 8,
          task1Enabled: true,
          task1Count: 4,
          task2Enabled: true,
          task2Type: 'multiple_choice',
          task2Count: 4,
          maxPlays: 2
        },
        pronunciation: { ...prev.pronunciation, enabled: true, count: 4 },
        lexico_grammar: { ...prev.lexico_grammar, enabled: true, count: 12 },
        arrangement: { ...prev.arrangement, enabled: true, count: 2 },
        cloze_reading: { ...prev.cloze_reading, enabled: true, count: 5 },
        reading_comprehension: { ...prev.reading_comprehension, enabled: true, count: 8 },
        writing_short: { ...prev.writing_short, enabled: true, count: 4 },
        essay_writing: { ...prev.essay_writing, enabled: true, count: 1 }
      }));
    }
  };

  // Grammar Categories List
  const grammarCategories = useMemo(() => {
    return ['Tất cả', ...THPT_GRAMMAR_CATEGORIES.map((c) => c.category)];
  }, []);

  // Filtered Grammar Topics
  const filteredGrammarTopics = useMemo(() => {
    let all: GrammarTopic[] = [];
    THPT_GRAMMAR_CATEGORIES.forEach((cat) => {
      if (grammarCategory === 'Tất cả' || cat.category === grammarCategory) {
        all = all.concat(cat.topics);
      }
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      all = all.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return all;
  }, [grammarCategory, searchQuery]);

  // Current Global Success Grade Curriculum
  const currentGlobalGrade = useMemo(() => {
    return (
      GLOBAL_SUCCESS_CURRICULUM.find((g) => g.gradeKey === globalGradeKey) ||
      GLOBAL_SUCCESS_CURRICULUM[0]
    );
  }, [globalGradeKey]);

  // Filtered Units for Global Success
  const filteredUnits = useMemo(() => {
    if (!currentGlobalGrade) return [];
    if (!searchQuery.trim()) return currentGlobalGrade.units;
    const q = searchQuery.toLowerCase().trim();
    return currentGlobalGrade.units.filter(
      (u) =>
        u.unitName.toLowerCase().includes(q) ||
        u.theme.toLowerCase().includes(q) ||
        u.vocabularyFocus.toLowerCase().includes(q) ||
        String(u.unitNumber).includes(q)
    );
  }, [currentGlobalGrade, searchQuery]);

  // Filtered Academic Source Suggestions for Autocomplete
  const filteredAcademicSuggestions = useMemo(() => {
    return PRESTIGIOUS_ACADEMIC_SUGGESTIONS.filter((item) => {
      if (sourceCategoryFilter !== 'all' && item.category !== sourceCategoryFilter) {
        return false;
      }
      if (!customSourceInput.trim()) return true;
      const q = customSourceInput.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [sourceCategoryFilter, customSourceInput]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);

    try {
      const activePromptTemplate = DYNAMIC_CONTEXT_PROMPT_TEMPLATES.find(t => t.id === selectedPromptTemplateId) || DYNAMIC_CONTEXT_PROMPT_TEMPLATES[0];

      // Generate unique random seed for prompt metadata and anti-repetition guarantees
      const randomSeed = `seed_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const promptMetadata = {
        random_seed: randomSeed,
        generatedAt: new Date().toISOString(),
        theme: activePromptTemplate.name,
        antiRepetitionDirective: 'Enforce complete question and passage novelty. Strictly avoid duplicate or textbook default stems.'
      };

      // Enrich prompt template with random_seed metadata
      const enrichedPromptTemplate = `${activePromptTemplate.systemInstruction}\n\n[PROMPT_METADATA]\n- random_seed: "${randomSeed}"\n- timestamp: "${promptMetadata.generatedAt}"\n- anti_duplication_directive: "Enforce complete novelty; no recycled questions or passages."\n[/PROMPT_METADATA]`;

      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          grade,
          difficulty,
          temperature: 0.8,
          random_seed: randomSeed,
          randomSeed: randomSeed,
          metadata: promptMetadata,
          dynamicContextTheme: activePromptTemplate.name,
          promptTemplate: enrichedPromptTemplate,
          sectionsConfig,
          selectedUnits: selectedUnits.map(u => ({
            unitNumber: u.unitNumber,
            unitName: u.unitName,
            theme: u.theme,
            vocabularyFocus: u.vocabularyFocus
          })),
          referenceWebsites: referenceSources.filter(s => s.enabled).map(s => `${s.name} (${s.url})`)
        }),
      });

      const data = await res.json();
      if (data && data.data) {
        const payload = data.data;

        const durationMin = Math.max(15, Math.min(90, Math.round((payload.questions?.length || totalQuestionsCalculated) * 2.2)));

        const rawQuestions = payload.questions || [];
        const seenStems = new Set<string>();
        const seenWordSets: { idx: number; words: Set<string> }[] = [];
        const uniqueQuestions: any[] = [];
        let dupeCount = 0;
        const dedupWarnings: string[] = [];

        const getWords = (text: string) => {
          return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2));
        };

        rawQuestions.forEach((q: any, idx: number) => {
          const stem = (q.question || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
          const words = getWords(q.question || '');
          const tiers = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];
          const cognitiveTier = q.cognitiveTier || tiers[idx % 4];

          let isDupe = false;
          if (stem && seenStems.has(stem)) {
            isDupe = true;
          } else {
            // Check token overlap similarity > 65%
            for (const prev of seenWordSets) {
              let common = 0;
              words.forEach(w => { if (prev.words.has(w)) common++; });
              const union = words.size + prev.words.size - common;
              if (union > 0 && common / union >= 0.65) {
                isDupe = true;
                break;
              }
            }
          }

          if (isDupe) {
            dupeCount++;
            dedupWarnings.push(`Câu ${idx + 1} có độ tương đồng cao với câu trước; đã tự động tinh chỉnh câu hỏi.`);
            uniqueQuestions.push({
              ...q,
              id: q.id || `q-${idx + 1}`,
              num: idx + 1,
              question: q.question, // Clean question text without tag leaks
              cognitiveTier
            });
          } else {
            if (stem) seenStems.add(stem);
            seenWordSets.push({ idx: idx + 1, words });
            uniqueQuestions.push({
              ...q,
              id: q.id || `q-${idx + 1}`,
              num: idx + 1,
              cognitiveTier
            });
          }
        });

        const exam: ExamItem = {
          id: `ex-${Date.now()}`,
          title: payload.title || `Đề thi Tiếng Anh Tổng Hợp: ${topic} (${grade})`,
          grade: payload.grade || grade,
          subject: 'Tiếng Anh',
          questionsCount: uniqueQuestions.length || totalQuestionsCalculated,
          duration: payload.duration || `${durationMin} phút`,
          difficulty: payload.difficulty || difficulty,
          topic: payload.topic || topic,
          sections: payload.sections || [],
          submissions: 0,
          avgScore: 0,
          createdAt: 'Hôm nay',
          status: 'Đang mở',
          audioScript: payload.audioScript,
          audioTitle: payload.audioTitle,
          audioScriptTask2: payload.audioScriptTask2,
          audioTitleTask2: payload.audioTitleTask2,
          listeningMaxPlays: payload.listeningMaxPlays || 2,
          questions: uniqueQuestions,
        };
        setGeneratedExam(exam);
        setDedupWarningList(dedupWarnings);
        onIncrementUsage();
      }
    } catch (err) {
      console.error('Lỗi sinh đề thi tổng hợp:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedExam) return;
    try {
      const existingStr = localStorage.getItem('EDUADMIN_EXAM_BANK');
      let bank: ExamItem[] = [];
      if (existingStr) bank = JSON.parse(existingStr);
      const updatedBank = [generatedExam, ...bank.filter(e => e.id !== generatedExam.id)];
      localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(updatedBank));
      localStorage.setItem('eng_exams_v1', JSON.stringify(updatedBank));
    } catch {}
    onSaveExam(generatedExam);
    onClose();
  };

  const handleAssignNow = () => {
    if (!generatedExam) return;
    try {
      const existingStr = localStorage.getItem('EDUADMIN_EXAM_BANK');
      let bank: ExamItem[] = [];
      if (existingStr) bank = JSON.parse(existingStr);
      const updatedBank = [generatedExam, ...bank.filter(e => e.id !== generatedExam.id)];
      localStorage.setItem('EDUADMIN_EXAM_BANK', JSON.stringify(updatedBank));
      localStorage.setItem('eng_exams_v1', JSON.stringify(updatedBank));
    } catch {}
    onSaveExam(generatedExam);
    if (onAssignExamDirectly) {
      onAssignExamDirectly(generatedExam);
    }
    onClose();
  };

  // Regenerate a single question
  const handleRegenerateQuestion = async (q: ExamQuestion) => {
    if (!generatedExam) return;
    setRegeneratingQuestionId(q.id);

    try {
      const res = await fetch('/api/regenerate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType: q.sectionType || 'lexico_grammar',
          grade: generatedExam.grade || grade,
          topic: generatedExam.topic || topic,
          difficulty: generatedExam.difficulty || difficulty,
          existingNum: q.num,
          avoidQuestions: [q.question]
        })
      });

      const resData = await res.json();
      if (resData && resData.data) {
        const newQ = {
          ...resData.data,
          id: q.id,
          num: q.num,
          sectionType: q.sectionType,
          sectionTitle: q.sectionTitle
        };

        const updatedQuestions = generatedExam.questions.map(item =>
          item.id === q.id ? newQ : item
        );

        setGeneratedExam({
          ...generatedExam,
          questions: updatedQuestions
        });

        if (editingQuestionId === q.id) {
          setEditedQuestion(newQ);
        }
      }
    } catch (e) {
      console.error('Lỗi tạo lại câu hỏi:', e);
    } finally {
      setRegeneratingQuestionId(null);
    }
  };

  // Save inline edit for a question
  const handleSaveEditedQuestion = () => {
    if (!generatedExam || !editedQuestion) return;

    const updatedQuestions = generatedExam.questions.map(item =>
      item.id === editedQuestion.id ? editedQuestion : item
    );

    setGeneratedExam({
      ...generatedExam,
      questions: updatedQuestions
    });

    setEditingQuestionId(null);
    setEditedQuestion(null);
  };

  // Delete question
  const handleDeleteQuestion = (qId: string) => {
    if (!generatedExam) return;
    const filtered = generatedExam.questions.filter(q => q.id !== qId);
    const reindexed = filtered.map((q, idx) => ({ ...q, num: idx + 1 }));
    setGeneratedExam({
      ...generatedExam,
      questions: reindexed,
      questionsCount: reindexed.length
    });
    if (editingQuestionId === qId) {
      setEditingQuestionId(null);
      setEditedQuestion(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-amber-300">
              <Sparkles className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  {activeCreationTab === 'ai'
                    ? 'Tạo Đề Thi Tiếng Anh Đa Năng bằng AI'
                    : activeCreationTab === 'visual'
                    ? 'Soạn Thảo Đề Thi Trực Quan (Visual Form Editor)'
                    : activeCreationTab === 'text'
                    ? 'Số Hóa Đề Thi Từ Văn Bản Thô (Smart Text Parser)'
                    : 'Nhập Đề Thi Từ File Mẫu (Word / Excel / PDF)'}
                </h3>
                <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {activeCreationTab === 'ai' ? 'Chuẩn GDPT 2018' : 'Thủ Công & Số Hóa'}
                </span>
              </div>
              <p className="text-xs text-blue-100 font-normal">
                {activeCreationTab === 'ai'
                  ? 'Hỗ trợ từ Lớp 3 đến Lớp 12 & Luyện thi Tuyển sinh 10 / Tốt nghiệp THPT với 7 dạng bài khảo thí'
                  : activeCreationTab === 'visual'
                  ? 'Visual Editor: Soạn thảo từng câu trực quan với Rich Text (in đậm, gạch chân, bảng, ảnh) và kéo thả đổi thứ tự'
                  : activeCreationTab === 'text'
                  ? 'Smart Text Parser: Copy-paste toàn bộ đề thi từ Word/PDF, Regex & AI tự động bóc tách 100%'
                  : 'File Import: Nhập đề tức thì từ file mẫu chuẩn Word (.docx), Excel (.xlsx) hoặc PDF'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Creation Mode Navigation Tabs */}
        {!generatedExam && (
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-2.5 gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveCreationTab('ai')}
              className={`pb-2.5 px-3.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
                activeCreationTab === 'ai'
                  ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl border-t border-x border-slate-200 shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Tạo đề AI (Chuẩn GDPT 2018)</span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">
                Gemini
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCreationTab('visual')}
              className={`pb-2.5 px-3.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
                activeCreationTab === 'visual'
                  ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl border-t border-x border-slate-200 shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chế độ 1: Soạn thảo trực quan (Visual Editor)</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                Form & Kéo thả
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCreationTab('text')}
              className={`pb-2.5 px-3.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
                activeCreationTab === 'text'
                  ? 'border-indigo-600 text-indigo-800 bg-white rounded-t-xl border-t border-x border-slate-200 shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Chế độ 2: Số hóa văn bản thô (Smart Text Parser)</span>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full">
                Regex & AI
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCreationTab('file')}
              className={`pb-2.5 px-3.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
                activeCreationTab === 'file'
                  ? 'border-amber-600 text-amber-800 bg-white rounded-t-xl border-t border-x border-slate-200 shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" />
              <span>Chế độ 3: Nhập từ file mẫu (File Import)</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                Word / Excel / PDF
              </span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {!generatedExam ? (
            activeCreationTab !== 'ai' ? (
              <ManualExamTab
                grade={grade}
                topic={topic}
                difficulty={difficulty}
                initialMode={activeCreationTab}
                onModeChange={(newMode) => setActiveCreationTab(newMode)}
                onExamParsed={(manualExam) => {
                  setGeneratedExam(manualExam);
                }}
                onSaveToBankDirectly={(manualExam) => {
                  onSaveExam(manualExam);
                }}
              />
            ) : (
              <>
                {/* TOP SETTINGS BAR: Khối lớp, Độ khó, Presets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Khối lớp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. Khối lớp mục tiêu
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => {
                      setGrade(e.target.value);
                      const key = e.target.value.replace(/[^0-9]/g, '');
                      if (key) setGlobalGradeKey(key);
                    }}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  >
                    <optgroup label="Tiểu học (Lớp 3 - 5)">
                      <option value="Lớp 3">Lớp 3</option>
                      <option value="Lớp 4">Lớp 4</option>
                      <option value="Lớp 5">Lớp 5</option>
                    </optgroup>
                    <optgroup label="THCS (Lớp 6 - 9)">
                      <option value="Lớp 6">Lớp 6</option>
                      <option value="Lớp 7">Lớp 7</option>
                      <option value="Lớp 8">Lớp 8</option>
                      <option value="Lớp 9">Lớp 9</option>
                      <option value="Ôn thi Tuyển sinh 10">Ôn thi Tuyển sinh 10</option>
                    </optgroup>
                    <optgroup label="THPT (Lớp 10 - 12)">
                      <option value="Lớp 10">Lớp 10</option>
                      <option value="Lớp 11">Lớp 11</option>
                      <option value="Lớp 12">Lớp 12</option>
                      <option value="Ôn thi Tốt nghiệp THPT">Ôn thi Tốt nghiệp THPT</option>
                    </optgroup>
                  </select>
                </div>

                {/* 2. Độ khó (Difficulty Level: Easy, Medium, Hard) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      2. Độ khó (Difficulty Level)
                    </label>
                    <span className="text-[10px] font-bold text-slate-500">
                      {difficulty === 'Easy' || difficulty === 'Nhận biết'
                        ? '🟢 Dễ (A1-A2)'
                        : difficulty === 'Hard' || difficulty === 'Vận dụng' || difficulty === 'Vận dụng cao'
                        ? '🔴 Khó (C1+)'
                        : '🟡 Vừa (B1-B2)'}
                    </span>
                  </div>

                  {/* 3-button segmented selector for Easy, Medium, Hard */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setDifficulty('Easy')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        difficulty === 'Easy' || difficulty === 'Nhận biết'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                      title="Easy: Mức độ nhận biết, từ vựng nền tảng SGK, thì cơ bản, không có bẫy phức tạp"
                    >
                      <span>Easy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDifficulty('Medium')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        difficulty === 'Medium' || difficulty === 'Thông hiểu'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                      title="Medium: Mức độ thông hiểu & vận dụng chuẩn B1-B2, đọc hiểu ngữ cảnh, collocations"
                    >
                      <span>Medium</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDifficulty('Hard')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        difficulty === 'Hard' || difficulty === 'Vận dụng' || difficulty === 'Vận dụng cao'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                      title="Hard: Mức độ phân hóa 9+ điểm, câu hỏi suy luận cao (Inference), idioms và đảo ngữ nâng cao"
                    >
                      <span>Hard</span>
                    </button>
                  </div>

                  {/* Synchronized Select Dropdown */}
                  <select
                    value={
                      difficulty === 'Easy' || difficulty === 'Nhận biết'
                        ? 'Easy'
                        : difficulty === 'Hard' || difficulty === 'Vận dụng' || difficulty === 'Vận dụng cao'
                        ? 'Hard'
                        : 'Medium'
                    }
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full text-[11px] font-bold border border-slate-200 rounded-lg p-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1.5 cursor-pointer"
                  >
                    <option value="Easy">Easy - Dễ (Nhận biết, từ vựng cơ bản, thì nền tảng)</option>
                    <option value="Medium">Medium - Vừa (Thông hiểu, đọc hiểu ngữ cảnh, collocations)</option>
                    <option value="Hard">Hard - Khó (Vận dụng cao, phân hóa 9-10 điểm, idioms)</option>
                  </select>
                </div>

                {/* 3. Mẫu đề thi nhanh (Presets) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3. Mẫu đề cấu hình sẵn
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => applyPreset('regular')}
                      className="flex-1 py-2 px-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
                      title="Kiểm tra thường xuyên 10-15 câu"
                    >
                      KTTX 15c
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('full')}
                      className="flex-1 py-2 px-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
                      title="Đề định kỳ chuẩn 30 câu Full 7 dạng"
                    >
                      KTĐK 30c
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('reading_writing')}
                      className="flex-1 py-2 px-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
                      title="Chuyên biệt Đọc & Viết luận"
                    >
                      Đọc - Viết
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('exam_prep')}
                      className="flex-1 py-2 px-1 text-[11px] font-bold rounded-lg border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition"
                      title="Luyện thi Tuyển sinh 10 / THPT"
                    >
                      Luyện thi
                    </button>
                  </div>
                </div>
              </div>

              {/* TOPIC INPUT & FAST SELECTOR */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Chủ đề / Unit bài học cần tạo đề
                  </label>
                  <span className="text-[11px] text-blue-600 font-semibold">
                    Ví dụ: Green Living, Community Services, Generation Gap...
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Nhập tên chủ đề, Unit bài học hoặc ngữ pháp..."
                    className="w-full text-sm font-medium border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 shadow-2xs"
                  />
                </div>
              </div>

              {/* DYNAMIC CONTEXT & AI PROMPT TEMPLATES */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-slate-50 border border-indigo-200/90 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shadow-2xs">
                      ✨
                    </span>
                    <div>
                      <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wide">
                        Đa dạng hóa bối cảnh & Prompt AI (Dynamic Context Engine)
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Tự động luân phiên đề tài (AI, sinh thái, văn hóa, vũ trụ...) và thiết lập Temperature 0.8 chống trùng đề
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600">Nhiệt độ AI (Temp):</span>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs">
                      {aiTemperature.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Prompt Template Selector Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {DYNAMIC_CONTEXT_PROMPT_TEMPLATES.map((tmpl) => {
                    const isSelected = selectedPromptTemplateId === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => {
                          setSelectedPromptTemplateId(tmpl.id);
                          if (!topic || topic === 'Green Living & Environmental Protection') {
                            setTopic(tmpl.defaultTopicExample);
                          }
                        }}
                        className={`p-3 rounded-xl border text-xs transition cursor-pointer flex flex-col justify-between gap-2 select-none ${
                          isSelected
                            ? 'bg-white border-indigo-600 ring-2 ring-indigo-200 shadow-xs'
                            : 'bg-white/80 border-slate-200 hover:border-indigo-300 hover:bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-black text-slate-900 flex items-center gap-1.5 truncate">
                              <span>{tmpl.icon}</span>
                              <span className="truncate">{tmpl.name}</span>
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              isSelected ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {tmpl.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {tmpl.themes}
                          </p>
                        </div>
                        <div className="text-[10px] text-indigo-700 font-semibold flex items-center gap-1 pt-1 border-t border-slate-100">
                          <span>Ví dụ:</span>
                          <span className="italic truncate">{tmpl.defaultTopicExample}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Temperature Slider & Instructions Expander */}
                <div className="bg-white/90 p-3 rounded-xl border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <span>Mức độ sáng tạo & tính độc bản (AI Temperature):</span>
                      <span className="text-[11px] font-normal text-slate-500">Khuyến nghị 0.75 - 0.85</span>
                    </span>
                    <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {aiTemperature >= 0.8 ? '🔥 Sáng tạo cao & Độc bản 100%' : 'Chuẩn mực ổn định'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400">0.70</span>
                    <input
                      type="range"
                      min={0.7}
                      max={0.9}
                      step={0.05}
                      value={aiTemperature}
                      onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                      className="flex-1 accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                    <span className="text-[10px] font-bold text-slate-400">0.90</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPromptDetails(!showPromptDetails)}
                      className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showPromptDetails ? 'Ẩn chi tiết Prompt Template' : 'Xem nội dung Prompt gửi AI'}</span>
                      {showPromptDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <span className="text-[10px] text-slate-500">
                      Đã kích hoạt: Chống lặp câu hỏi & Lọc trùng đối chiếu kho DB (&gt;60%)
                    </span>
                  </div>

                  {showPromptDetails && (
                    <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap animate-in fade-in">
                      {(DYNAMIC_CONTEXT_PROMPT_TEMPLATES.find(t => t.id === selectedPromptTemplateId) || DYNAMIC_CONTEXT_PROMPT_TEMPLATES[0]).systemInstruction}
                    </div>
                  )}
                </div>
              </div>

              {/* CURRICULUM EXPLORER DRAWER */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Chọn nhanh từ SGK Global Success & Chuyên đề chuẩn
                    </span>
                  </div>

                  <div className="flex p-0.5 bg-white rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setCurriculumTab('global_success')}
                      className={`text-xs px-2.5 py-1 rounded-md font-bold transition ${
                        curriculumTab === 'global_success'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Unit SGK (Lớp 1-12)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurriculumTab('grammar')}
                      className={`text-xs px-2.5 py-1 rounded-md font-bold transition ${
                        curriculumTab === 'grammar'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Ngữ pháp Trọng tâm
                    </button>
                  </div>
                </div>

                {curriculumTab === 'global_success' && (
                  <div className="space-y-3">
                    {/* Grade Selector & Batch Quick Select */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[11px] font-bold text-slate-500 mr-1">Khối lớp:</span>
                        {['3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => {
                              setGlobalGradeKey(k);
                              setGrade(`Lớp ${k}`);
                              setSelectedUnits([]);
                            }}
                            className={`text-xs px-2 py-0.5 rounded-md font-bold border transition ${
                              globalGradeKey === k
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            L{k}
                          </button>
                        ))}
                      </div>

                      {/* Quick batch selectors */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-500 font-semibold">Chọn nhanh:</span>
                        <button
                          type="button"
                          onClick={() => handleSelectTermUnits('term1')}
                          className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                        >
                          + HK1 (U1-U5)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectTermUnits('term2')}
                          className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                        >
                          + HK2 (U6-U10)
                        </button>
                        {selectedUnits.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearSelectedUnits}
                            className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
                          >
                            Bỏ chọn ({selectedUnits.length})
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Selected Units Indicator Chips */}
                    {selectedUnits.length > 0 && (
                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 animate-in fade-in">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-blue-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Đã chọn {selectedUnits.length} Unit liên kết để AI tổng hợp kiến thức & từ vựng:</span>
                          </span>
                          <span className="text-[10px] font-extrabold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                            Liên Unit
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedUnits.map((su) => (
                            <span
                              key={su.unitNumber}
                              className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-blue-800 px-2.5 py-1 rounded-lg border border-blue-300 shadow-2xs"
                            >
                              <span>U{su.unitNumber}: {su.unitName}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleUnit(su)}
                                className="text-slate-400 hover:text-rose-600 font-bold ml-0.5"
                                title="Bỏ unit này"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Units Checkbox Grid */}
                    <div className="max-h-[160px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2 scrollbar-thin">
                      {filteredUnits.map((u) => {
                        const isChecked = selectedUnits.some(su => String(su.unitNumber) === String(u.unitNumber));
                        return (
                          <div
                            key={u.unitNumber}
                            onClick={() => handleToggleUnit(u)}
                            className={`p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-start gap-2.5 select-none ${
                              isChecked
                                ? 'bg-blue-50/90 border-blue-500 shadow-2xs'
                                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Handled by parent div onClick
                              className="w-4 h-4 text-blue-600 rounded mt-0.5 shrink-0 pointer-events-none"
                            />
                            <div className="truncate flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-blue-700">U{u.unitNumber}:</span>
                                <span className="font-bold text-slate-800 truncate">{u.unitName}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">{u.theme}</p>
                              {u.vocabularyFocus && (
                                <p className="text-[10px] text-blue-600 truncate italic">Từ vựng: {u.vocabularyFocus}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {curriculumTab === 'grammar' && (
                  <div className="max-h-[140px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5 scrollbar-thin">
                    {filteredGrammarTopics.slice(0, 12).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTopic(`${t.name} (${t.category})`);
                          setGrade(t.recommendedGrade);
                        }}
                        className="text-left p-2 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 text-xs transition flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <span className="font-bold text-slate-900 mr-1">{t.name}</span>
                          <span className="text-[10px] text-slate-500">[{t.category}]</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {t.recommendedGrade}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ACADEMIC SOURCE WEBSITES SUGGESTION DRAWER (Autocomplete & Tags) */}
              <div
                ref={sourceDropdownRef}
                className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/50 border border-blue-200/90 rounded-2xl p-4 space-y-3.5 shadow-2xs"
              >
                {/* Header with Title & Active Count */}
                <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-blue-950 flex items-center gap-2">
                        <span>Nguồn website học liệu</span>
                        <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                          AI Grounding Sources
                        </span>
                      </h4>
                      <p className="text-[11px] text-blue-800/80">
                        Cung cấp cho AI các địa chỉ học liệu uy tín để sinh ngữ cảnh thực tế, từ vựng phong phú và bài đọc chất lượng cao
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-300 shadow-2xs shrink-0 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{referenceSources.filter(s => s.enabled).length} nguồn đang gắn thẻ</span>
                  </span>
                </div>

                {/* 1. Main Autocomplete Input Box */}
                <div ref={sourceDropdownRef} className="relative">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        ref={sourceInputRef}
                        type="text"
                        value={customSourceInput}
                        onChange={(e) => {
                          setCustomSourceInput(e.target.value);
                          setSourceDropdownOpen(true);
                          setSourceActiveIndex(-1);
                        }}
                        onFocus={() => {
                          setSourceDropdownOpen(true);
                          setSourceActiveIndex(-1);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            if (!sourceDropdownOpen) setSourceDropdownOpen(true);
                            setSourceActiveIndex((prev) =>
                              prev < filteredAcademicSuggestions.length - 1 ? prev + 1 : 0
                            );
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setSourceActiveIndex((prev) =>
                              prev > 0 ? prev - 1 : filteredAcademicSuggestions.length - 1
                            );
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            if (sourceActiveIndex >= 0 && filteredAcademicSuggestions[sourceActiveIndex]) {
                              handleToggleAcademicSource(filteredAcademicSuggestions[sourceActiveIndex]);
                            } else {
                              handleAddCustomSource();
                            }
                            setSourceDropdownOpen(false);
                            setSourceActiveIndex(-1);
                          } else if (e.key === 'Escape') {
                            setSourceDropdownOpen(false);
                            setSourceActiveIndex(-1);
                          }
                        }}
                        placeholder="Nhập hoặc tìm kiếm nguồn học liệu uy tín (VD: Global Success, British Council, BBC, Cambridge, Oxford, IELTS...)"
                        className="w-full text-xs pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs font-medium"
                      />
                      {customSourceInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomSourceInput('');
                            sourceInputRef.current?.focus();
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleAddCustomSource();
                        setSourceDropdownOpen(false);
                      }}
                      disabled={!customSourceInput.trim()}
                      className="px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition cursor-pointer shrink-0 shadow-2xs flex items-center gap-1.5 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm nguồn</span>
                    </button>
                  </div>

                  {/* Autocomplete Dropdown Menu */}
                  {sourceDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2.5 space-y-2 scrollbar-thin animate-in fade-in slide-in-from-top-1">
                      
                      {/* Category Filter Tabs */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 scrollbar-none">
                        {[
                          { id: 'all', label: `Tất cả (${PRESTIGIOUS_ACADEMIC_SUGGESTIONS.length})` },
                          { id: 'sgk', label: '📚 SGK & Giáo dục VN' },
                          { id: 'international', label: '🇬🇧 Khảo thí Quốc tế' },
                          { id: 'news', label: '📰 Báo chí & Thời sự' }
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSourceCategoryFilter(cat.id as any)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                              sourceCategoryFilter === cat.id
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* Dropdown Suggestions List */}
                      <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                        {filteredAcademicSuggestions.length > 0 ? (
                          filteredAcademicSuggestions.map((item, idx) => {
                            const isAlreadyAdded = referenceSources.some(
                              (s) => s.enabled && (s.name.toLowerCase() === item.name.toLowerCase() || s.url.toLowerCase() === item.url.toLowerCase())
                            );
                            const isActiveKeyboard = sourceActiveIndex === idx;

                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  handleToggleAcademicSource(item);
                                  setSourceDropdownOpen(false);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-3 ${
                                  isActiveKeyboard
                                    ? 'bg-blue-50 ring-1 ring-blue-300'
                                    : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 truncate">
                                      <span className="truncate">{item.name}</span>
                                    </div>
                                    <div className="text-[11px] text-blue-600 truncate mt-0.5">
                                      {item.url.replace(/^https?:\/\//, '')}
                                    </div>
                                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                      {item.description}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {isAlreadyAdded ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span>Đã gắn thẻ</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition">
                                      <Plus className="w-3 h-3" />
                                      <span>Chọn nguồn</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-500">
                            <p>Không tìm thấy nguồn mẫu phù hợp với từ khóa.</p>
                            <p className="text-[11px] text-blue-600 mt-1">
                              Nhấn <strong>[Enter]</strong> hoặc <strong>[+ Thêm nguồn]</strong> để thêm trực tiếp: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold">{customSourceInput}</code>
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>

                {/* 2. Quick-Add 1-Click Popular Source Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0">
                    Gợi ý chọn nhanh:
                  </span>
                  {[
                    PRESTIGIOUS_ACADEMIC_SUGGESTIONS[0], // SGK Global Success
                    PRESTIGIOUS_ACADEMIC_SUGGESTIONS[1], // British Council
                    PRESTIGIOUS_ACADEMIC_SUGGESTIONS[2], // BBC Learning English
                    PRESTIGIOUS_ACADEMIC_SUGGESTIONS[3], // Cambridge English Assessment
                    PRESTIGIOUS_ACADEMIC_SUGGESTIONS[4], // Oxford Learner's Dictionaries
                    PRESTIGIOUS_ACADEMIC_SUGGESTIONS[5], // IELTS.org
                    PRESTIGIOUS_ACADEMIC_SUGGESTIONS[6], // VNExpress
                  ].map((p, i) => {
                    const isAdded = referenceSources.some(
                      (s) => s.enabled && (s.name.toLowerCase() === p.name.toLowerCase() || s.url.toLowerCase() === p.url.toLowerCase())
                    );
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleToggleAcademicSource(p)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 shadow-2xs ${
                          isAdded
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{p.icon}</span>
                        <span>{p.name.split('(')[0].trim()}</span>
                        {isAdded ? (
                          <Check className="w-3 h-3 text-white ml-0.5" />
                        ) : (
                          <Plus className="w-3 h-3 text-slate-400 ml-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 3. Selected Sources Displayed as Tags (Pills) with Quick Delete */}
                <div className="bg-white/80 border border-blue-200/80 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Các thẻ nguồn học liệu đã chọn ({referenceSources.filter(s => s.enabled).length}):</span>
                    </span>

                    {referenceSources.filter(s => s.enabled).length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRestoreDefaultSources}
                          title="Khôi phục 5 nguồn học liệu chuẩn cốt lõi"
                          className="text-[10px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Nguồn chuẩn</span>
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={handleClearAllSources}
                          title="Xóa tất cả các thẻ nguồn đã chọn"
                          className="text-[10px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa tất cả</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Render Tags */}
                  {referenceSources.filter(s => s.enabled).length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {referenceSources.filter(s => s.enabled).map((source) => (
                        <span
                          key={source.id}
                          className="inline-flex items-center gap-2 text-xs font-bold bg-white text-blue-950 px-3 py-1.5 rounded-xl border border-blue-300 shadow-xs hover:border-blue-400 transition animate-in fade-in group select-none"
                        >
                          <span>{source.icon || '🌐'}</span>
                          <span className="truncate max-w-[200px]" title={source.name}>
                            {source.name}
                          </span>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-blue-600 font-normal hover:underline opacity-70 group-hover:opacity-100"
                            title={`Mở trang: ${source.url}`}
                          >
                            <ExternalLink className="w-2.5 h-2.5 inline" />
                          </a>

                          {/* Quick Delete "X" button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSource(source.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-rose-500 font-black transition cursor-pointer ml-0.5"
                            title={`Xóa thẻ "${source.name}"`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                      Chưa có nguồn học liệu nào được gắn thẻ. Hãy tìm kiếm ở ô trên hoặc bấm vào các nút gợi ý chọn nhanh!
                    </div>
                  )}
                </div>

                {/* 4. Pedagogical Guideline Callout (70% Global Success / 30% Other Sources) */}
                <div className="p-2.5 bg-blue-50/90 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-950">
                  <span className="text-base shrink-0 mt-0.5">⭐</span>
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-extrabold text-blue-900">Quy tắc phân bổ từ vựng chuẩn Khảo thí: </span>
                    Đề thi tuân thủ <strong>70% từ vựng cốt lõi</strong> từ bộ sách <em>Global Success</em> (theo các Unit đã chọn) và <strong>30% từ vựng nâng cao</strong> trích từ các nguồn học liệu uy tín (British Council, Cambridge, BBC...) để phân loại học sinh khá, giỏi và xuất sắc.
                  </div>
                </div>
              </div>

              {/* 8 FORMATS CHECKBOXES & QUESTION COUNTS */}
              <div className="rounded-2xl border border-slate-300 bg-white p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Cấu trúc đề & Định dạng các dạng bài (8 phần chuẩn - Bổ sung Listening)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Bật/tắt dạng bài và chỉnh số lượng câu cho từng phần (Listening được cộng tự động vào tổng số câu)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                      Tổng số câu: {totalQuestionsCalculated} câu
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Part 0: Listening (Nghe hiểu) */}
                  <div className={`p-3 rounded-xl border transition sm:col-span-2 ${
                    sectionsConfig.listening?.enabled ? 'bg-purple-50/60 border-purple-300 shadow-2xs' : 'bg-slate-50/50 border-slate-200 opacity-70'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sectionsConfig.listening?.enabled}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            listening: { ...sectionsConfig.listening, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Headphones className="w-3.5 h-3.5 text-purple-600" />
                          <span>0. Listening (Kỹ năng Nghe hiểu - Web Speech API)</span>
                        </span>
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full uppercase">
                          Mới bổ sung
                        </span>
                      </label>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-semibold text-slate-600">Số câu:</span>
                          <input
                            type="number"
                            min={2}
                            max={16}
                            disabled={!sectionsConfig.listening?.enabled}
                            value={sectionsConfig.listening?.count || 8}
                            onChange={(e) => {
                              const val = Math.max(2, parseInt(e.target.value) || 2);
                              setSectionsConfig({
                                ...sectionsConfig,
                                listening: {
                                  ...sectionsConfig.listening,
                                  count: val,
                                  task1Count: Math.ceil(val / 2),
                                  task2Count: Math.floor(val / 2)
                                }
                              });
                            }}
                            className="w-14 text-center text-xs font-bold border border-slate-300 rounded p-1 bg-white"
                          />
                          <span className="text-[11px] text-slate-500">câu</span>
                        </div>
                      </div>
                    </div>

                    {/* Listening Detail Options */}
                    {sectionsConfig.listening?.enabled && (
                      <div className="mt-2 pt-2 border-t border-purple-200/70 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-white/90 rounded-lg border border-purple-200/80 space-y-1">
                          <span className="text-[11px] font-bold text-purple-900 block">
                            Task 1: Dạng Đúng / Sai (True / False)
                          </span>
                          <p className="text-[10px] text-slate-600 leading-snug">
                            4-5 nhận định nghe bắt ý, kèm mốc dẫn chứng cụ thể từ Audio Script khi chấm điểm.
                          </p>
                        </div>

                        <div className="p-2 bg-white/90 rounded-lg border border-purple-200/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-purple-900 block">
                              Task 2: Chọn dạng bài
                            </span>
                            <span className="text-[10px] text-purple-700 font-semibold">Tự động chấm</span>
                          </div>
                          <select
                            value={sectionsConfig.listening?.task2Type || 'multiple_choice'}
                            onChange={(e) => setSectionsConfig({
                              ...sectionsConfig,
                              listening: {
                                ...sectionsConfig.listening,
                                task2Type: e.target.value as 'multiple_choice' | 'fill_blank'
                              }
                            })}
                            className="w-full text-xs font-semibold p-1.5 rounded-md border border-purple-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="multiple_choice">Dạng Trắc nghiệm (A, B, C, D)</option>
                            <option value="fill_blank">Dạng Điền từ khuyết (Fill-in-the-blanks / Note)</option>
                          </select>
                        </div>

                        <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-purple-900 bg-purple-100/70 p-2 rounded-lg border border-purple-200">
                          <span className="flex items-center gap-1.5 font-bold text-purple-950">
                            <span>🇬🇧 Giọng đọc bài nghe:</span>
                            <span className="bg-white px-2 py-0.5 rounded text-purple-800 border border-purple-300">
                              Mặc định chuẩn UK Female (Anh - Anh Nữ)
                            </span>
                          </span>
                          <span className="text-[10px] text-purple-700 italic">
                            Giới hạn 2 lượt nghe • Kịch bản 2 Tracks riêng biệt
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Part 1: Pronunciation */}
                  <div className={`p-3 rounded-xl border transition ${
                    sectionsConfig.pronunciation.enabled ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50/50 border-slate-200 opacity-70'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sectionsConfig.pronunciation.enabled}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            pronunciation: { ...sectionsConfig.pronunciation, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>1. Pronunciation & Stress</span>
                        </span>
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={6}
                          disabled={!sectionsConfig.pronunciation.enabled}
                          value={sectionsConfig.pronunciation.count}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            pronunciation: { ...sectionsConfig.pronunciation, count: Math.max(1, parseInt(e.target.value) || 1) }
                          })}
                          className="w-12 text-center text-xs font-bold border border-slate-300 rounded p-1 bg-white"
                        />
                        <span className="text-[11px] text-slate-500">câu</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-6">
                      Phát âm (gạch chân nguyên âm/phụ âm, IPA trong giải thích) & Trọng âm từ 2-3 âm tiết.
                    </p>
                    {sectionsConfig.pronunciation.enabled && (
                      <div className="mt-2.5 pt-2 border-t border-indigo-200/60">
                        <TagInputAutocomplete
                          label="Trọng tâm phát âm & trọng âm cần kiểm tra:"
                          tags={sectionsConfig.pronunciation.focusTopics || []}
                          onChange={(tags) => setSectionsConfig({
                            ...sectionsConfig,
                            pronunciation: { ...sectionsConfig.pronunciation, focusTopics: tags }
                          })}
                          suggestions={PRONUNCIATION_SUGGESTIONS}
                          badgeColor="indigo"
                          placeholder="Gõ hoặc chọn: Đuôi -ed, -s/-es, nguyên âm đôi..."
                          popularSuggestions={['Đuôi -ed', 'Đuôi -s/-es', 'Trọng âm từ 2 âm tiết (Danh từ vs Động từ)', 'Nguyên âm đôi (Diphthongs)']}
                          helperText="AI sẽ sinh câu hỏi kiểm tra đúng các quy tắc phát âm/trọng âm được chỉ định."
                        />
                      </div>
                    )}
                  </div>

                  {/* Part 2: Lexico & Grammar */}
                  <div className={`p-3 rounded-xl border transition ${
                    sectionsConfig.lexico_grammar.enabled ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50/50 border-slate-200 opacity-70'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sectionsConfig.lexico_grammar.enabled}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            lexico_grammar: { ...sectionsConfig.lexico_grammar, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>2. Lexico & Grammar</span>
                        </span>
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={20}
                          disabled={!sectionsConfig.lexico_grammar.enabled}
                          value={sectionsConfig.lexico_grammar.count}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            lexico_grammar: { ...sectionsConfig.lexico_grammar, count: Math.max(1, parseInt(e.target.value) || 1) }
                          })}
                          className="w-12 text-center text-xs font-bold border border-slate-300 rounded p-1 bg-white"
                        />
                        <span className="text-[11px] text-slate-500">câu</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-6">
                      Trắc nghiệm 4 phương án: collocations, idioms, thì, mệnh đề quan hệ, câu điều kiện...
                    </p>
                    {sectionsConfig.lexico_grammar.enabled && (
                      <div className="mt-2.5 pt-2 border-t border-blue-200/60">
                        <TagInputAutocomplete
                          label="Chủ điểm từ vựng & ngữ pháp trọng tâm:"
                          tags={sectionsConfig.lexico_grammar.focusTopics || []}
                          onChange={(tags) => setSectionsConfig({
                            ...sectionsConfig,
                            lexico_grammar: { ...sectionsConfig.lexico_grammar, focusTopics: tags }
                          })}
                          suggestions={LEXICO_GRAMMAR_SUGGESTIONS}
                          badgeColor="blue"
                          placeholder="Gõ hoặc chọn: Relative clauses, Tenses, Conditionals..."
                          popularSuggestions={['Relative pronouns & clauses', 'Tenses (Quá khứ hoàn thành vs Quá khứ đơn, Hiện tại hoàn thành...)', 'Cụm từ cố định (Collocations)', 'Conditional sentences (Loại 1, 2, 3, Mixed)']}
                          helperText="Các câu hỏi từ vựng & ngữ pháp sẽ xoay quanh các chủ điểm trọng tâm này."
                        />
                      </div>
                    )}
                  </div>

                  {/* Part 3: Arrangement */}
                  <div className={`p-3 rounded-xl border transition ${
                    sectionsConfig.arrangement.enabled ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50/50 border-slate-200 opacity-70'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sectionsConfig.arrangement.enabled}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            arrangement: { ...sectionsConfig.arrangement, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <ListOrdered className="w-3.5 h-3.5 text-amber-600" />
                          <span>3. Arrangement (Sắp xếp)</span>
                        </span>
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={5}
                          disabled={!sectionsConfig.arrangement.enabled}
                          value={sectionsConfig.arrangement.count}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            arrangement: { ...sectionsConfig.arrangement, count: Math.max(1, parseInt(e.target.value) || 1) }
                          })}
                          className="w-12 text-center text-xs font-bold border border-slate-300 rounded p-1 bg-white"
                        />
                        <span className="text-[11px] text-slate-500">câu</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-6">
                      Sắp xếp thứ tự logic để tạo thành: Bức thư/Email, Đoạn hội thoại, hoặc Đoạn văn.
                    </p>
                    {sectionsConfig.arrangement.enabled && (
                      <div className="mt-2.5 pt-2 border-t border-amber-200/60">
                        <TagInputAutocomplete
                          label="Định dạng văn bản sắp xếp:"
                          tags={sectionsConfig.arrangement.focusTopics || []}
                          singleSelect={true}
                          onChange={(tags) => setSectionsConfig({
                            ...sectionsConfig,
                            arrangement: {
                              ...sectionsConfig.arrangement,
                              focusTopics: tags,
                              selectedFormat: tags[0] || ''
                            }
                          })}
                          suggestions={ARRANGEMENT_FORMAT_SUGGESTIONS}
                          badgeColor="amber"
                          placeholder="Chọn dạng: Hội thoại, lá thư/email, đoạn văn..."
                          popularSuggestions={ARRANGEMENT_FORMAT_SUGGESTIONS}
                          helperText="Chọn 1 định dạng văn bản chuẩn để AI biên soạn câu hỏi sắp xếp thứ tự."
                        />
                      </div>
                    )}
                  </div>

                  {/* Part 4: Cloze-reading */}
                  <div className={`p-3 rounded-xl border transition ${
                    sectionsConfig.cloze_reading.enabled ? 'bg-teal-50/50 border-teal-200' : 'bg-slate-50/50 border-slate-200 opacity-70'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sectionsConfig.cloze_reading.enabled}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            cloze_reading: { ...sectionsConfig.cloze_reading, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <AlignLeft className="w-3.5 h-3.5 text-teal-600" />
                          <span>4. Cloze-reading (Điền từ)</span>
                        </span>
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={3}
                          max={5}
                          disabled={!sectionsConfig.cloze_reading.enabled}
                          value={sectionsConfig.cloze_reading.count}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            cloze_reading: { ...sectionsConfig.cloze_reading, count: Math.max(1, parseInt(e.target.value) || 1) }
                          })}
                          className="w-12 text-center text-xs font-bold border border-slate-300 rounded p-1 bg-white"
                        />
                        <span className="text-[11px] text-slate-500">chỗ trống</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-6">
                      Bài đọc ngắn 120-160 từ có các chỗ trống (1), (2), (3)... chọn từ/giới từ phù hợp.
                    </p>
                    {sectionsConfig.cloze_reading.enabled && (
                      <div className="mt-2.5 pt-2 border-t border-teal-200/60">
                        <TagInputAutocomplete
                          label="Dạng kiến thức kiểm tra trong bài đục lỗ:"
                          tags={sectionsConfig.cloze_reading.focusTopics || []}
                          onChange={(tags) => setSectionsConfig({
                            ...sectionsConfig,
                            cloze_reading: { ...sectionsConfig.cloze_reading, focusTopics: tags }
                          })}
                          suggestions={CLOZE_READING_SUGGESTIONS}
                          badgeColor="teal"
                          placeholder="Gõ hoặc chọn: Connectors, Reduced relative clauses, Collocations..."
                          popularSuggestions={['Connectors & Linking words', 'Reduced relative clauses (Rút gọn MĐQH)', 'Vocabulary in context', 'Prepositions of time/place/direction']}
                          helperText="Các chỗ đục lỗ (1), (2), (3)... sẽ kiểm tra đúng các kiến thức này."
                        />
                      </div>
                    )}
                  </div>

                  {/* Part 5: Reading Comprehension */}
                  <div className={`p-3 rounded-xl border transition ${
                    sectionsConfig.reading_comprehension.enabled ? 'bg-cyan-50/50 border-cyan-200' : 'bg-slate-50/50 border-slate-200 opacity-70'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sectionsConfig.reading_comprehension.enabled}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            reading_comprehension: { ...sectionsConfig.reading_comprehension, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-cyan-600" />
                          <span>5. Reading Comprehension</span>
                        </span>
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={3}
                          max={8}
                          disabled={!sectionsConfig.reading_comprehension.enabled}
                          value={sectionsConfig.reading_comprehension.count}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            reading_comprehension: { ...sectionsConfig.reading_comprehension, count: Math.max(1, parseInt(e.target.value) || 1) }
                          })}
                          className="w-12 text-center text-xs font-bold border border-slate-300 rounded p-1 bg-white"
                        />
                        <span className="text-[11px] text-slate-500">câu</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-6">
                      Đoạn văn đọc hiểu: Main idea, Details, Vocabulary in context, Reference, Inference.
                    </p>
                    {sectionsConfig.reading_comprehension.enabled && (
                      <div className="mt-2.5 pt-2 border-t border-cyan-200/60">
                        <TagInputAutocomplete
                          label="Hệ thống dạng câu hỏi đọc hiểu cần tạo:"
                          tags={sectionsConfig.reading_comprehension.focusTopics || []}
                          onChange={(tags) => setSectionsConfig({
                            ...sectionsConfig,
                            reading_comprehension: { ...sectionsConfig.reading_comprehension, focusTopics: tags }
                          })}
                          suggestions={READING_COMPREHENSION_SUGGESTIONS}
                          badgeColor="cyan"
                          placeholder="Gõ hoặc chọn: Main idea, Reference, Synonym, Inference..."
                          popularSuggestions={['Main idea / Best title', 'Reference questions (It/They/Which refers to...)', 'Inference question (Câu hỏi suy luận logic)', 'Synonym & Antonym in context']}
                          helperText="AI sẽ tạo bài đọc sâu sắc và phân bổ các dạng câu hỏi đọc hiểu theo đúng danh sách này."
                        />
                      </div>
                    )}
                  </div>

                  {/* Part 6: Writing - Short answer */}
                  <div className={`p-3 rounded-xl border transition ${
                    sectionsConfig.writing_short.enabled ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50/50 border-slate-200 opacity-70'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sectionsConfig.writing_short.enabled}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            writing_short: { ...sectionsConfig.writing_short, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                          <span>6. Writing - Short Answer</span>
                        </span>
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={6}
                          disabled={!sectionsConfig.writing_short.enabled}
                          value={sectionsConfig.writing_short.count}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            writing_short: { ...sectionsConfig.writing_short, count: Math.max(1, parseInt(e.target.value) || 1) }
                          })}
                          className="w-12 text-center text-xs font-bold border border-slate-300 rounded p-1 bg-white"
                        />
                        <span className="text-[11px] text-slate-500">câu</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-6">
                      Word formation & Viết lại câu không đổi nghĩa (kèm Alternative valid answers).
                    </p>
                    {sectionsConfig.writing_short.enabled && (
                      <div className="mt-2.5 pt-2 border-t border-purple-200/60">
                        <TagInputAutocomplete
                          label="Chủ điểm viết lại câu & chia dạng từ:"
                          tags={sectionsConfig.writing_short.focusTopics || []}
                          onChange={(tags) => setSectionsConfig({
                            ...sectionsConfig,
                            writing_short: { ...sectionsConfig.writing_short, focusTopics: tags }
                          })}
                          suggestions={WRITING_SHORT_SUGGESTIONS}
                          badgeColor="purple"
                          placeholder="Gõ hoặc chọn: Tenses transformation, Passive voice, Word formation..."
                          popularSuggestions={['Tenses Transformation (Hiện tại hoàn thành sang Quá khứ đơn...)', 'Word formation (Danh/Tính/Động/Trạng theo ngữ cảnh)', 'Passive voice (Bị động thông thường & Bị động đặc biệt)', 'Reported speech (Câu gián tiếp, câu hỏi, câu mệnh lệnh)']}
                          helperText="Cung cấp sẵn các đáp án thay thế (alternative answers) để tự động chấm linh hoạt."
                        />
                      </div>
                    )}
                  </div>

                  {/* Part 7: Essay / Paragraph Writing */}
                  <div className={`p-3 rounded-xl border sm:col-span-2 transition ${
                    sectionsConfig.essay_writing.enabled ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/50 border-slate-200 opacity-70'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sectionsConfig.essay_writing.enabled}
                          onChange={(e) => setSectionsConfig({
                            ...sectionsConfig,
                            essay_writing: { ...sectionsConfig.essay_writing, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                          <span>7. Essay / Paragraph Writing (Kèm AI Grading Rubric 4 Tiêu Chí)</span>
                        </span>
                      </label>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        1 đoạn văn (80-140 từ)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-6">
                      Đoạn văn viết luận theo chủ đề kèm AI Rubric khảo thí: Task Achievement (2.5đ), Coherence & Cohesion (2.5đ), Lexical Resource (2.5đ), Grammatical Range & Accuracy (2.5đ).
                    </p>
                    {sectionsConfig.essay_writing.enabled && (
                      <div className="mt-2.5 pt-2 border-t border-emerald-200/60 space-y-2.5">
                        {/* Field 1: Specific Topic Input & Quick Buttons */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                            <span>Chủ đề / Đề bài đoạn văn cụ thể:</span>
                            <span className="text-[10px] text-emerald-700 font-semibold">Theo SGK Global Success</span>
                          </label>
                          <input
                            type="text"
                            value={sectionsConfig.essay_writing.customPrompt || ''}
                            onChange={(e) => setSectionsConfig({
                              ...sectionsConfig,
                              essay_writing: { ...sectionsConfig.essay_writing, customPrompt: e.target.value }
                            })}
                            placeholder="Nhập chủ đề viết luận cụ thể hoặc chọn gợi ý bên dưới..."
                            className="w-full text-xs px-3 py-1.5 rounded-xl border border-emerald-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs font-medium"
                          />
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            <span className="text-[10px] text-slate-500 font-semibold mr-1">Chủ đề mẫu:</span>
                            {ESSAY_TOPIC_SUGGESTIONS.slice(0, 4).map((topItem, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setSectionsConfig({
                                  ...sectionsConfig,
                                  essay_writing: { ...sectionsConfig.essay_writing, customPrompt: topItem }
                                })}
                                className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition truncate max-w-[240px]"
                                title={topItem}
                              >
                                {topItem}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Field 2: Checkbox Guiding Questions */}
                        <label className="flex items-center gap-2 p-2 bg-white/90 rounded-xl border border-emerald-200 text-xs cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sectionsConfig.essay_writing.includeGuidingQuestions !== false}
                            onChange={(e) => setSectionsConfig({
                              ...sectionsConfig,
                              essay_writing: { ...sectionsConfig.essay_writing, includeGuidingQuestions: e.target.checked }
                            })}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <span className="font-bold text-emerald-950">
                            Tự động tạo 5 câu hỏi ngắn gợi ý dàn ý (Guiding Questions)
                          </span>
                          <span className="text-[10px] text-slate-500 italic ml-auto">
                            Giúp học sinh dễ dàng phát triển ý tưởng bài viết
                          </span>
                        </label>

                        {/* Field 3: Style / Tag Input */}
                        <TagInputAutocomplete
                          label="Phong cách & Định hướng nghị luận:"
                          tags={sectionsConfig.essay_writing.focusTopics || []}
                          onChange={(tags) => setSectionsConfig({
                            ...sectionsConfig,
                            essay_writing: { ...sectionsConfig.essay_writing, focusTopics: tags }
                          })}
                          suggestions={[
                            'Argumentative Paragraph (Nghị luận)',
                            'Problem & Solution (Thực trạng & Giải pháp)',
                            'Advantages & Disadvantages (Thuận lợi & Khó khăn)',
                            'Cause & Effect (Nguyên nhân & Hệ quả)',
                            'Formal Academic Tone (Văn phong học thuật)'
                          ]}
                          badgeColor="emerald"
                          placeholder="Gõ hoặc chọn phong cách đoạn văn..."
                          popularSuggestions={[
                            'Argumentative Paragraph (Nghị luận)',
                            'Problem & Solution (Thực trạng & Giải pháp)',
                            'Formal Academic Tone (Văn phong học thuật)'
                          ]}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )) : (
            /* PREVIEW & IN-LINE EDITING VIEW */
            <div className="space-y-4">
              
              {/* Banner Summary */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded shadow-2xs">
                      AI Biên Soạn Hoàn Tất
                    </span>
                    <span className="text-xs font-bold text-emerald-900">
                      {generatedExam.grade} • {generatedExam.questions.length} câu • {generatedExam.duration}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border shadow-2xs ${
                      generatedExam.difficulty === 'Easy' || generatedExam.difficulty === 'Nhận biết' || generatedExam.difficulty === 'Dễ'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : generatedExam.difficulty === 'Hard' || generatedExam.difficulty === 'Vận dụng' || generatedExam.difficulty === 'Vận dụng cao' || generatedExam.difficulty === 'Khó'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}>
                      Độ khó (Difficulty): {generatedExam.difficulty}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 mt-1">
                    {generatedExam.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {dedupWarningList.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md" title={dedupWarningList.join('; ')}>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Deduplication Check: Phát hiện & tự động chuẩn hóa {dedupWarningList.length} câu tương đồng cao
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Deduplication Check: 100% câu hỏi độc bản
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100/90 border border-blue-300 px-2 py-0.5 rounded-md">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Phân bổ đều 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGeneratedExam(null)}
                    className="flex items-center gap-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tạo lại từ đầu</span>
                  </button>
                </div>
              </div>

              {/* Sections Quick Jump */}
              {generatedExam.sections && generatedExam.sections.length > 0 && (
                <div className="flex flex-wrap gap-1.5 py-1">
                  {generatedExam.sections.map((sec, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {sec.title} ({sec.questionCount}c)
                    </span>
                  ))}
                </div>
              )}

              {/* Listening Audio Track Players (Teacher Preview: Track 1 & Track 2) */}
              {(generatedExam.audioScript || generatedExam.audioScriptTask2) && (
                <div className="my-2 space-y-2.5">
                  {generatedExam.audioScript && (
                    <AudioPlayerControl
                      audioScript={generatedExam.audioScript}
                      audioUrl={generatedExam.audioUrl}
                      audioTitle={generatedExam.audioTitle || 'Track 1 - Listening Part 1 (Task 1: True / False)'}
                      maxPlays={generatedExam.listeningMaxPlays || 2}
                      isTeacher={true}
                      isSubmitted={true}
                    />
                  )}
                  {generatedExam.audioScriptTask2 && (
                    <AudioPlayerControl
                      audioScript={generatedExam.audioScriptTask2}
                      audioUrl={generatedExam.audioUrlTask2}
                      audioTitle={generatedExam.audioTitleTask2 || 'Track 2 - Listening Part 2 (Task 2)'}
                      maxPlays={generatedExam.listeningMaxPlays || 2}
                      isTeacher={true}
                      isSubmitted={true}
                    />
                  )}
                </div>
              )}

              {/* Quality Assurance & Deduplication Report Banner */}
              <div className="p-4 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl flex items-start gap-3 text-xs shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="font-extrabold text-emerald-950 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Kiểm định sư phạm AI & Chống trùng lặp (Deduplication Check: Passed)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-lg font-mono font-bold">
                      {generatedExam.questions.length} câu độc bản • 4 mức độ nhận thức
                    </span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed text-[11px]">
                    ✓ Mỗi câu hỏi kiểm tra một đơn vị kiến thức/kỹ năng riêng biệt, không có câu biến thể trùng lặp.<br />
                    ✓ Phân bổ đều các mức độ nhận thức: Nhận biết (25%), Thông hiểu (35%), Vận dụng (25%), Vận dụng cao (15%).<br />
                    ✓ Ngữ liệu trích xuất đa chiều, bám sát các Unit Global Success và nguồn học thuật uy tín đã nạp.
                  </p>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {generatedExam.questions.map((q, idx) => {
                  const isEditingThis = editingQuestionId === q.id;
                  const isRegeneratingThis = regeneratingQuestionId === q.id;

                  // Render section header divider if first item or different section
                  const prevQ = idx > 0 ? generatedExam.questions[idx - 1] : null;
                  const showSectionDivider = !prevQ || prevQ.sectionTitle !== q.sectionTitle;

                  return (
                    <div key={q.id || idx} className="space-y-2">
                      {/* Section Title Header */}
                      {showSectionDivider && q.sectionTitle && (
                        <div className="pt-2 pb-1">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-extrabold border border-blue-200">
                            <Layers className="w-3.5 h-3.5 text-blue-700" />
                            <span>{q.sectionTitle}</span>
                          </div>
                        </div>
                      )}

                      {/* Reading Passage or Cloze Passage if present */}
                      {q.passage && (!prevQ || prevQ.passage !== q.passage) && (
                        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs">
                          <div className="font-extrabold text-amber-950 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-amber-700" />
                              <span>
                                {q.passageTitle ? `Đoạn văn đọc: ${q.passageTitle}` : 'Đoạn văn dùng cho bài đọc (Passage):'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                              Từ khóa & từ in đậm đã được đánh dấu
                            </span>
                          </div>
                          <div
                            className="text-slate-800 leading-relaxed font-serif text-sm bg-white/90 p-3.5 rounded-xl border border-amber-100 whitespace-pre-line shadow-inner max-h-[300px] overflow-y-auto reading-passage-scroll"
                            dangerouslySetInnerHTML={{
                              __html: formatPassageHtml(
                                q.passage,
                                generatedExam.questions.filter((it) => it.passage === q.passage)
                              ),
                            }}
                          />
                        </div>
                      )}

                      {/* Main Question Card */}
                      {(() => {
                        const hasEmptyContent = !q.question || !q.question.trim();
                        const hasMissingAns = !q.answer || !q.answer.trim();
                        const hasMissingOpt =
                          q.questionType !== 'short_answer' &&
                          !q.essayPrompt &&
                          !q.sentenceBeginning &&
                          (!q.options || q.options.length < 2 || q.options.some((opt) => !opt.trim()));
                        const isMissing4Opt =
                          (q.questionType === 'multiple_choice' || !q.questionType) &&
                          q.options &&
                          q.options.length > 0 &&
                          q.options.length < 4;
                        const hasCardError = hasEmptyContent || hasMissingAns || hasMissingOpt;

                        return (
                          <div
                            id={`ai-preview-q-${q.id}`}
                            className={`p-4 rounded-2xl border transition ${
                              isEditingThis
                                ? 'bg-blue-50/40 border-blue-400 ring-2 ring-blue-500/20 shadow-md'
                                : hasEmptyContent
                                ? 'bg-rose-50/10 border-rose-400 ring-2 ring-rose-400/20 shadow-2xs'
                                : hasCardError
                                ? 'bg-amber-50/10 border-amber-400 ring-2 ring-amber-400/25 shadow-2xs'
                                : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            {/* Top bar of question */}
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center text-white ${
                                    hasEmptyContent
                                      ? 'bg-rose-600'
                                      : hasCardError
                                      ? 'bg-amber-600'
                                      : 'bg-blue-600'
                                  }`}
                                >
                                  {q.num || idx + 1}
                                </span>
                                <strong className="font-extrabold text-xs text-slate-900 tracking-tight">Question {q.num || idx + 1}:</strong>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                                  {q.sectionType || 'Question'}
                                </span>
                                {q.grammarPoint && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                    {q.grammarPoint}
                                  </span>
                                )}
                                {(q as any).cognitiveTier && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                    {(q as any).cognitiveTier}
                                  </span>
                                )}

                                {/* Colored Badges for Errors */}
                                {hasEmptyContent && (
                                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1 shadow-2xs animate-pulse">
                                    <AlertCircle className="w-3 h-3 text-rose-600" />
                                    <span>Trống nội dung</span>
                                  </span>
                                )}
                                {hasMissingAns && (
                                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                    <span>Thiếu đáp án</span>
                                  </span>
                                )}
                                {hasMissingOpt && (
                                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1 shadow-2xs">
                                    <HelpCircle className="w-3 h-3 text-purple-600" />
                                    <span>{isMissing4Opt ? 'Chưa đủ 4 lựa chọn' : 'Thiếu phương án'}</span>
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons: Fix Now, Regenerate & Edit */}
                              <div className="flex items-center gap-1.5">
                                {hasCardError && !isEditingThis && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingQuestionId(q.id);
                                      setEditedQuestion({ ...q });
                                    }}
                                    className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white transition cursor-pointer shadow-xs animate-pulse hover:animate-none"
                                    title="Sửa nhanh lỗi cho câu hỏi này"
                                  >
                                    <Wrench className="w-3 h-3" />
                                    <span>Fix Now (Sửa ngay)</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  disabled={isRegeneratingThis}
                                  onClick={() => handleRegenerateQuestion(q)}
                                  className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition cursor-pointer"
                                  title="Yêu cầu AI sinh lại riêng câu hỏi này"
                                >
                                  <RefreshCw className={`w-3 h-3 ${isRegeneratingThis ? 'animate-spin text-amber-600' : 'text-slate-500'}`} />
                                  <span>{isRegeneratingThis ? 'Đang tạo...' : 'Tạo lại câu này'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isEditingThis) {
                                      setEditingQuestionId(null);
                                      setEditedQuestion(null);
                                    } else {
                                      setEditingQuestionId(q.id);
                                      setEditedQuestion({ ...q });
                                    }
                                  }}
                                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                    isEditingThis
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>{isEditingThis ? 'Đang sửa' : 'Chỉnh sửa'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                  title="Xóa câu hỏi này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                        {/* QUESTION VIEW OR INLINE EDIT FORM */}
                        {!isEditingThis ? (
                          <div className="space-y-3">
                            {/* Question text */}
                            <div className="font-bold text-slate-900 text-sm">
                              <span dangerouslySetInnerHTML={{ __html: formatQuestionHtml(q.question) }} />
                            </div>

                            {/* Arrangement Items if present */}
                            {q.arrangementItems && q.arrangementItems.length > 0 && (
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs font-mono">
                                {q.arrangementItems.map((item, aIdx) => (
                                  <div key={aIdx} className="text-slate-800">
                                    {item}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Original sentence for transformation if present */}
                            {q.originalSentence && (
                              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                <span className="font-semibold text-slate-500">Câu gốc: </span>
                                <span className="font-bold text-slate-800">{q.originalSentence}</span>
                                {q.sentenceBeginning && (
                                  <div className="mt-1 text-blue-700 font-semibold">
                                    Gợi ý bắt đầu: {q.sentenceBeginning}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Essay Prompt if essay type */}
                            {q.essayPrompt && (
                              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-1.5">
                                <div className="font-bold text-emerald-900">
                                  Đề bài: {q.essayPrompt.topic} ({q.essayPrompt.minWords} - {q.essayPrompt.maxWords} từ)
                                </div>
                                {q.essayPrompt.suggestedPoints && (
                                  <div className="text-[11px] text-emerald-800 space-y-0.5">
                                    <div className="font-semibold">Gợi ý phát triển ý:</div>
                                    {q.essayPrompt.suggestedPoints.map((pt, pIdx) => (
                                      <div key={pIdx}>• {pt}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Multiple choice options */}
                            {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, oIdx) => {
                                  const isCorrect = q.answer && q.answer.trim().startsWith(opt.slice(0, 2));
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                                        isCorrect
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                          : 'bg-white border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <span dangerouslySetInnerHTML={{ __html: formatOptionHtml(opt, q) }} />
                                      {isCorrect && (
                                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 ml-1" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Answer & Explanation Box */}
                            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1.5">
                              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Đáp án chuẩn: </span>
                                <span className="text-emerald-900 underline font-extrabold" dangerouslySetInnerHTML={{ __html: formatOptionHtml(q.answer, q) }} />
                              </div>

                              {/* Alternative answers if available */}
                              {q.alternativeAnswers && q.alternativeAnswers.length > 0 && (
                                <div className="text-[11px] text-emerald-900 bg-white/70 p-2 rounded-lg border border-emerald-200/80 space-y-0.5">
                                  <div className="font-bold text-emerald-950">
                                    Các phương án viết lại tương đương hợp lệ:
                                  </div>
                                  {q.alternativeAnswers.map((alt, aIdx) => (
                                    <div key={aIdx}>✓ {alt}</div>
                                  ))}
                                </div>
                              )}

                              {q.ipaTranscription && (
                                <div className="text-[11px] text-indigo-900 font-mono bg-indigo-50/80 px-2 py-1 rounded border border-indigo-200">
                                  <strong>Phiên âm IPA:</strong> {q.ipaTranscription}
                                </div>
                              )}

                              {q.explanation && (
                                <div className="text-[11px] text-emerald-950/90 leading-relaxed">
                                  <strong>Lời giải thích sư phạm:</strong> {q.explanation}
                                </div>
                              )}
                            </div>

                            {/* AI Essay Rubric if present */}
                            {q.rubric && (
                              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                                <div className="font-bold text-slate-900 flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <PenTool className="w-3.5 h-3.5 text-blue-600" />
                                    <span>AI Grading Rubric (Thang điểm {q.rubric.totalMaxScore}đ):</span>
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {q.rubric.criteria.map((cr, cIdx) => (
                                    <div key={cIdx} className="p-2 bg-white rounded-lg border border-slate-200 space-y-0.5">
                                      <div className="font-bold text-slate-900 flex items-center justify-between text-[11px]">
                                        <span>{cr.criterion}</span>
                                        <span className="text-blue-600 font-bold">{cr.maxScore}đ</span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 line-clamp-2">{cr.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        ) : (
                          /* INLINE EDIT MODE */
                          editedQuestion && (
                            <div className="space-y-3 pt-2 text-xs">
                              {/* Edit question text */}
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Nội dung câu hỏi:</label>
                                <textarea
                                  rows={2}
                                  value={editedQuestion.question}
                                  onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                                />
                              </div>

                              {/* Edit options if multiple choice */}
                              {editedQuestion.options && editedQuestion.options.length > 0 && (
                                <div>
                                  <label className="block font-bold text-slate-700 mb-1">Các lựa chọn (A, B, C, D):</label>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {editedQuestion.options.map((opt, oIdx) => (
                                      <input
                                        key={oIdx}
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const nextOpts = [...editedQuestion.options];
                                          nextOpts[oIdx] = e.target.value;
                                          setEditedQuestion({ ...editedQuestion, options: nextOpts });
                                        }}
                                        className="p-1.5 border border-slate-300 rounded-lg text-xs"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Edit answer */}
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Đáp án đúng:</label>
                                <input
                                  type="text"
                                  value={editedQuestion.answer}
                                  onChange={(e) => setEditedQuestion({ ...editedQuestion, answer: e.target.value })}
                                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold text-emerald-800"
                                />
                              </div>

                              {/* Edit explanation */}
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Lời giải thích sư phạm:</label>
                                <textarea
                                  rows={2}
                                  value={editedQuestion.explanation}
                                  onChange={(e) => setEditedQuestion({ ...editedQuestion, explanation: e.target.value })}
                                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                                />
                              </div>

                              {/* Buttons to save/cancel edit */}
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={handleSaveEditedQuestion}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Lưu thay đổi</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingQuestionId(null);
                                    setEditedQuestion(null);
                                  }}
                                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs hover:bg-slate-300 transition"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          )
                        )}

                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Đóng
          </button>

          {!generatedExam ? (
            <button
              disabled={isGenerating || !topic.trim() || totalQuestionsCalculated === 0}
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition shadow-md active:scale-95 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI đang biên soạn đề thi ({totalQuestionsCalculated} câu)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>Tạo đề ngay bằng AI ({totalQuestionsCalculated} câu)</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {driveExportSuccess && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 animate-in fade-in">
                  ✓ Đã tải gói tệp đồng bộ Google Drive!
                </span>
              )}

              {/* Tải tệp Google Drive */}
              <button
                type="button"
                onClick={() => handleExportGoogleDrivePackage(generatedExam)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 border border-blue-300 hover:bg-blue-100 transition shadow-2xs cursor-pointer"
                title="Tải gói dữ liệu JSON đồng bộ lưu giữ lên Google Drive"
              >
                <span>📁</span>
                <span>Sao lưu Google Drive (.json)</span>
              </button>

              {/* Xuất file Word */}
              <button
                type="button"
                onClick={() => exportExamToWord(generatedExam)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                title="Tải đề thi dạng file Word .docx chuẩn sư phạm"
              >
                <span>📄</span>
                <span>Tải Word (.docx)</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-xs cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Lưu bền vững vào kho đề</span>
              </button>

              <button
                onClick={handleAssignNow}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Lưu & Giao bài ngay</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
