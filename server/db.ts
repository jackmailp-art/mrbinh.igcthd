import fs from 'fs';
import path from 'path';
import { INITIAL_EXAMS } from '../src/data/mockData';

export interface SubmissionRecord {
  id: string;
  studentName: string;
  studentId?: string;
  classId: string;
  className: string;
  examId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswersCount: number;
  answers: Record<number, string>;
  submittedAt: string;
}

export interface DBStore {
  classes: any[];
  exams: any[];
  students: any[];
  tasks: any[];
  submissions: SubmissionRecord[];
  aiUsage: { used: number; limit: number };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultClasses = [
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

const defaultStudents = [
  {
    id: 's-12g09-1',
    name: 'Vũ Nguyên Phúc',
    studentId: '2403192601',
    classId: 'c-1790068920256',
    className: 'Lớp 12G09',
    progress: 25,
    lastScore: 8.0,
    status: 'Hoàn thành',
    phone: '0839050211',
    parentPhone: '0839050211',
    completedExams: 1,
    notes: 'Học sinh Lớp 12G09 (STT: 1)'
  },
  {
    id: 's-12g09-2',
    name: 'Dương Thế Phong',
    studentId: '2403192602',
    classId: 'c-1790068920256',
    className: 'Lớp 12G09',
    progress: 0,
    lastScore: 0,
    status: 'Chưa làm',
    phone: '0907675863',
    parentPhone: '0907675863',
    completedExams: 0,
    notes: 'Học sinh Lớp 12G09 (STT: 2)'
  },
  {
    id: 's-12g09-3',
    name: 'Dương Quốc Đại',
    studentId: '2403192603',
    classId: 'c-1790068920256',
    className: 'Lớp 12G09',
    progress: 0,
    lastScore: 0,
    status: 'Chưa làm',
    phone: '0867574711',
    parentPhone: '0867574711',
    completedExams: 0,
    notes: 'Học sinh Lớp 12G09 (STT: 3)'
  },
  {
    id: 's-12g09-4',
    name: 'Nguyễn Văn An',
    studentId: 'HS12-001',
    classId: 'c-1790068920256',
    className: 'Lớp 12G09',
    progress: 0,
    lastScore: 0,
    status: 'Chưa làm',
    phone: '0987654321',
    parentPhone: '0987654322',
    completedExams: 0,
    notes: 'Học sinh Lớp 12G09 (STT: 4)'
  },
  {
    id: 's-11a1-1',
    name: 'Trần Thị Mai',
    studentId: 'HS11-002',
    classId: 'c-1790068920257',
    className: 'Lớp 11A1',
    progress: 0,
    lastScore: 0,
    status: 'Chưa làm',
    phone: '0912345678',
    parentPhone: '0912345679',
    completedExams: 0,
    notes: 'Học sinh Lớp 11A1 (STT: 1)'
  }
];

const defaultData: DBStore = {
  classes: defaultClasses,
  exams: INITIAL_EXAMS,
  students: defaultStudents,
  tasks: [],
  submissions: [],
  aiUsage: { used: 0, limit: 5 }
};

let inMemoryStore: DBStore | null = null;

export function getDB(): DBStore {
  if (inMemoryStore) {
    return inMemoryStore;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(fileContent);
      const loadedClasses = Array.isArray(parsed.classes) && parsed.classes.length > 0 ? parsed.classes : defaultClasses;
      const loadedStudents = Array.isArray(parsed.students) && parsed.students.length > 0 ? parsed.students : defaultStudents;

      // Ensure class student counts are accurate
      loadedClasses.forEach((c: any) => {
        const count = loadedStudents.filter((s: any) => s.classId === c.id || (s.className && s.className.toLowerCase() === c.name.toLowerCase())).length;
        if (count > 0) {
          c.studentsCount = count;
        }
      });

      inMemoryStore = {
        classes: loadedClasses,
        exams: Array.isArray(parsed.exams) && parsed.exams.length > 0 ? parsed.exams : defaultData.exams,
        students: loadedStudents,
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
        aiUsage: parsed.aiUsage || defaultData.aiUsage
      };
      return inMemoryStore!;
    }
  } catch (err) {
    console.error('Error reading db.json, using defaults:', err);
  }

  inMemoryStore = JSON.parse(JSON.stringify(defaultData));
  saveDBToDisk(inMemoryStore!);
  return inMemoryStore!;
}

function saveDBToDisk(data: DBStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to db.json:', err);
  }
}

export function syncDB(partialData: Partial<DBStore>): DBStore {
  const current = getDB();
  if (Array.isArray(partialData.classes) && (partialData.classes.length > 0 || current.classes.length === 0)) {
    current.classes = partialData.classes;
  }
  if (Array.isArray(partialData.exams) && (partialData.exams.length > 0 || current.exams.length === 0)) {
    current.exams = partialData.exams;
  }
  if (Array.isArray(partialData.students) && (partialData.students.length > 0 || current.students.length === 0)) {
    current.students = partialData.students;
  }
  if (Array.isArray(partialData.tasks)) current.tasks = partialData.tasks;
  if (Array.isArray(partialData.submissions)) current.submissions = partialData.submissions;
  if (partialData.aiUsage) current.aiUsage = partialData.aiUsage;

  // Keep class student counts consistent
  if (current.classes && current.students) {
    current.classes.forEach(c => {
      const actualCount = current.students.filter(s => s.classId === c.id).length;
      if (actualCount > 0) {
        c.studentsCount = actualCount;
      }
    });
  }

  saveDBToDisk(current);
  return current;
}

export function addOrUpdateClass(cls: any): any {
  const db = getDB();
  const index = db.classes.findIndex(c => c.id === cls.id);
  if (index >= 0) {
    db.classes[index] = { ...db.classes[index], ...cls };
  } else {
    db.classes.unshift(cls);
  }
  saveDBToDisk(db);
  return cls;
}

export function deleteClass(id: string): boolean {
  const db = getDB();
  db.classes = db.classes.filter(c => c.id !== id);
  // Also remove students belonging to this class or keep them unassigned
  db.students = db.students.filter(s => s.classId !== id);
  saveDBToDisk(db);
  return true;
}

export function findClassByPin(pin: string) {
  const db = getDB();
  const normalizedPin = String(pin).trim();
  const found = db.classes.find(c => String(c.pin).trim() === normalizedPin);
  if (!found) return null;

  // Find assigned exams for this class, or all open exams
  const classExams = db.exams.filter(e => e.status === 'Đang mở');
  const classStudents = db.students.filter(s => s.classId === found.id);

  return {
    classItem: found,
    exams: classExams,
    students: classStudents
  };
}

export function addOrUpdateExam(exam: any): any {
  const db = getDB();
  const index = db.exams.findIndex(e => e.id === exam.id);
  if (index >= 0) {
    db.exams[index] = { ...db.exams[index], ...exam };
  } else {
    db.exams.unshift(exam);
  }
  saveDBToDisk(db);
  return exam;
}

export function deleteExam(id: string): boolean {
  const db = getDB();
  db.exams = db.exams.filter(e => e.id !== id);
  saveDBToDisk(db);
  return true;
}

export function addOrUpdateStudent(student: any): any {
  const db = getDB();
  const index = db.students.findIndex(s => s.id === student.id);
  if (index >= 0) {
    db.students[index] = { ...db.students[index], ...student };
  } else {
    db.students.unshift(student);
    // Increment student count in class
    const cls = db.classes.find(c => c.id === student.classId);
    if (cls) {
      cls.studentsCount = (cls.studentsCount || 0) + 1;
    }
  }
  saveDBToDisk(db);
  return student;
}

export function batchAddStudents(newStudents: any[], autoClasses: any[] = []): any {
  const db = getDB();

  if (autoClasses && autoClasses.length > 0) {
    autoClasses.forEach(nc => {
      if (!db.classes.some(c => c.id === nc.id)) {
        db.classes.push(nc);
      }
    });
  }

  // Prepend students
  db.students = [...newStudents, ...db.students];

  // Recalculate class student count
  db.classes.forEach(c => {
    const count = db.students.filter(s => s.classId === c.id).length;
    c.studentsCount = count;
  });

  saveDBToDisk(db);
  return { students: db.students, classes: db.classes };
}

export function deleteStudent(studentId: string): boolean {
  const db = getDB();
  const student = db.students.find(s => s.id === studentId);
  if (!student) return false;

  db.students = db.students.filter(s => s.id !== studentId);
  const cls = db.classes.find(c => c.id === student.classId);
  if (cls) {
    cls.studentsCount = Math.max(0, (cls.studentsCount || 1) - 1);
  }
  saveDBToDisk(db);
  return true;
}

export function recordSubmission(sub: SubmissionRecord) {
  const db = getDB();
  db.submissions.unshift(sub);

  // Update corresponding exam submission count and avg score
  const exam = db.exams.find(e => e.id === sub.examId);
  if (exam) {
    const examSubs = db.submissions.filter(s => s.examId === sub.examId);
    exam.submissions = examSubs.length;
    const totalScore = examSubs.reduce((acc, curr) => acc + curr.score, 0);
    exam.avgScore = Number((totalScore / examSubs.length).toFixed(1));
  }

  // Update student score & progress
  const student = db.students.find(s => s.id === sub.studentId || (s.name.trim().toLowerCase() === sub.studentName.trim().toLowerCase() && s.classId === sub.classId));
  if (student) {
    student.lastScore = sub.score;
    student.completedExams = (student.completedExams || 0) + 1;
    student.progress = Math.min(100, (student.completedExams * 25));
    if (sub.score >= 8.5) {
      student.status = 'Xuất sắc';
    } else if (sub.score >= 5.0) {
      student.status = 'Hoàn thành';
    } else {
      student.status = 'Cần bổ trợ';
    }
  }

  saveDBToDisk(db);
  return sub;
}
