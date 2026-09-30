import { AuthUser, UserRole, ClassItem, StudentItem } from '../types';

export interface AccountRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  title?: string;
  schoolName?: string;
  className?: string;
  classId?: string;
  studentId?: string;
  pin?: string;
  avatar?: string;
  createdAt: string;
}

const STORAGE_KEY_USER = 'ai_english_auth_user';
const STORAGE_KEY_ACCOUNTS = 'ai_english_accounts_db_v2';

// Sanitize class name to strictly forbid any sensitive leaks or password strings
export function sanitizeClassName(cls?: string): string {
  if (!cls) return 'Lớp 12G09';
  const clean = cls.trim();
  // If string contains special characters like @, or sensitive patterns, or exceeds 15 chars, or is invalid
  if (
    clean.includes('@') ||
    /[!#$%^&*()+=\[\]{};':"\\|,.<>\/?]/.test(clean) ||
    /phucbinh/i.test(clean) ||
    /@123/i.test(clean) ||
    clean.length > 15
  ) {
    return 'Lớp 12G09';
  }
  return clean.startsWith('Lớp ') ? clean : `Lớp ${clean}`;
}

// Global Security Storage Cleanup: Wipe any leaked credentials or contaminated states
export function runSecurityStorageCleanup(): boolean {
  let cleared = false;
  try {
    const sensitivePatterns = [
      /phucbinh/i,
      /@123/i,
      /phucbinh@123/i
    ];

    // 1. Scan and purge any localStorage keys or values containing sensitive strings
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const val = localStorage.getItem(key) || '';
      if (sensitivePatterns.some(pat => pat.test(key) || pat.test(val))) {
        keysToRemove.push(key);
      }
    }

    if (keysToRemove.length > 0) {
      keysToRemove.forEach(k => localStorage.removeItem(k));
      cleared = true;
    }

    // 2. Validate active user session in localStorage
    const storedUserRaw = localStorage.getItem(STORAGE_KEY_USER);
    if (storedUserRaw) {
      if (sensitivePatterns.some(pat => pat.test(storedUserRaw))) {
        localStorage.removeItem(STORAGE_KEY_USER);
        cleared = true;
      } else {
        try {
          const user = JSON.parse(storedUserRaw) as AuthUser;
          if (
            user.className &&
            (user.className.includes('@') || /phucbinh/i.test(user.className) || user.className.length > 15)
          ) {
            localStorage.removeItem(STORAGE_KEY_USER);
            cleared = true;
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY_USER);
          cleared = true;
        }
      }
    }

    // 3. Validate accounts DB in localStorage
    const accountsRaw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (accountsRaw) {
      if (sensitivePatterns.some(pat => pat.test(accountsRaw))) {
        localStorage.removeItem(STORAGE_KEY_ACCOUNTS);
        cleared = true;
      }
    }
  } catch (e) {
    console.warn('Storage security cleanup error:', e);
  }
  return cleared;
}

// Auto-run cleanup immediately upon script evaluation
runSecurityStorageCleanup();

// Simple deterministic hash for demo/local storage encryption
function hashPassword(pass: string): string {
  let hash = 0;
  const str = pass + '_edu_salt_2025_thaybinh';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'sec_' + Math.abs(hash).toString(36) + '_' + btoa(pass.slice(0, Math.min(pass.length, 4)));
}

// Initial System Accounts (Single Admin Teacher + Initial Student Seed)
const SEED_ACCOUNTS: AccountRecord[] = [
  {
    id: 'usr-teacher-binh-01',
    name: 'Thầy Dương Văn Bình',
    email: 'thaybinh@edu.vn',
    phone: '0912345678',
    passwordHash: hashPassword('password123'),
    role: 'teacher',
    title: 'Tổ trưởng Chuyên môn Tiếng Anh THPT',
    schoolName: 'Hệ thống Luyện thi Thầy Dương Văn Bình',
    avatar: 'TB',
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'usr-student-an-01',
    name: 'Nguyễn Văn An',
    email: 'student@example.com',
    phone: '0987654321',
    passwordHash: hashPassword('password123'),
    role: 'student',
    className: 'Lớp 12G09',
    classId: 'c-1790068920256',
    pin: '4324',
    studentId: 'HS12-001',
    schoolName: 'Lớp 12G09 - Khối 12 THPT',
    avatar: 'NA',
    createdAt: '2026-09-10T08:00:00.000Z'
  }
];

export const authService = {
  // Retrieve all registered accounts from local database
  getAllAccounts(): AccountRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      if (raw) {
        const parsed = JSON.parse(raw) as AccountRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading accounts database:', e);
    }
    // Initialize with seed accounts
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(SEED_ACCOUNTS));
    return SEED_ACCOUNTS;
  },

  // Save account list
  saveAccounts(accounts: AccountRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Error saving accounts database:', e);
    }
  },

  // Active Session Persistence
  getStoredUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USER);
      if (data) {
        const user = JSON.parse(data) as AuthUser;
        if (user && typeof user === 'object') {
          if (user.role === 'student') {
            user.className = sanitizeClassName(user.className);
            if (!user.classId) user.classId = 'c-1790068920256';
            delete user.pin;
          }
          return user;
        }
      }
    } catch {
      // Fallback
    }
    return null;
  },

  setStoredUser(user: AuthUser | null) {
    if (user) {
      if (user.role === 'student') {
        user.className = sanitizeClassName(user.className);
        delete user.pin;
      }
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY_USER);
  },

  // Real Student Registration (Sign Up)
  registerStudent(params: {
    name: string;
    identifier: string; // Email or Phone
    selectedClass?: string;
    classPin?: string;
    password: string;
  }): { success: boolean; user?: AuthUser; message: string } {
    const cleanName = params.name.trim();
    const cleanId = params.identifier.trim().toLowerCase();
    const cleanPass = params.password.trim();
    const rawClass = (params.selectedClass || '').trim();
    const rawPin = (params.classPin || '').trim();

    // 1. Validation
    if (!cleanName || cleanName.length < 2) {
      return { success: false, message: 'Họ và tên học sinh phải có ít nhất 2 ký tự.' };
    }
    if (!cleanId) {
      return { success: false, message: 'Vui lòng nhập Email hoặc Số điện thoại.' };
    }
    if (cleanPass.length < 6) {
      return { success: false, message: 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên.' };
    }

    // Strict Security Guard: Class name must NEVER contain sensitive patterns, special chars like @, or match password
    if (
      rawClass.includes('@') ||
      rawPin.includes('@') ||
      /phucbinh/i.test(rawClass) ||
      /phucbinh/i.test(rawPin) ||
      (cleanPass.length > 0 && (rawClass === cleanPass || rawPin === cleanPass))
    ) {
      return {
        success: false,
        message: 'Thông tin lớp học không hợp lệ. Vui lòng chọn đúng lớp học từ danh sách, không nhập mật khẩu vào ô này.'
      };
    }

    const accounts = this.getAllAccounts();

    // 2. Check duplicate Email or Phone
    const isEmail = cleanId.includes('@');
    const existing = accounts.find(acc => {
      if (isEmail) {
        return acc.email.toLowerCase() === cleanId;
      } else {
        return acc.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '');
      }
    });

    if (existing) {
      return {
        success: false,
        message: `${isEmail ? 'Email' : 'Số điện thoại'} này đã được đăng ký trong hệ thống. Vui lòng đăng nhập hoặc sử dụng tài khoản khác.`
      };
    }

    // 3. Resolve Class Name safely from official school classes
    let resolvedClassName = 'Lớp 12G09';
    let resolvedClassId = 'c-1790068920256';

    const classKey = (rawClass || rawPin).toLowerCase();
    if (classKey.includes('12g09') || classKey.includes('g09') || classKey.includes('4324')) {
      resolvedClassName = 'Lớp 12G09';
      resolvedClassId = 'c-1790068920256';
    } else if (classKey.includes('12a1')) {
      resolvedClassName = 'Lớp 12A1';
      resolvedClassId = 'cls-12';
    } else if (classKey.includes('11')) {
      resolvedClassName = 'Lớp 11A1';
      resolvedClassId = 'cls-11';
    } else if (classKey.includes('10')) {
      resolvedClassName = 'Lớp 10A1';
      resolvedClassId = 'cls-10';
    } else {
      // Default to main class
      resolvedClassName = 'Lớp 12G09';
      resolvedClassId = 'c-1790068920256';
    }

    // 4. Create new student AuthUser (Strictly NO password returned)
    const newId = `usr-std-${Date.now()}`;
    const initials = cleanName
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map(w => w[0].toUpperCase())
      .join('') || 'HS';

    const newUser: AuthUser = {
      id: newId,
      name: cleanName,
      email: isEmail ? cleanId : `${cleanId}@hocsinh.edu.vn`,
      role: 'student',
      title: 'Học sinh',
      className: sanitizeClassName(resolvedClassName),
      classId: resolvedClassId,
      studentId: `HS-${Math.floor(1000 + Math.random() * 9000)}`,
      schoolName: 'Lớp 12G09 - Khối 12 THPT',
      avatar: initials
    };

    const newRecord: AccountRecord = {
      id: newId,
      name: cleanName,
      email: isEmail ? cleanId : `${cleanId}@hocsinh.edu.vn`,
      phone: !isEmail ? cleanId : '',
      passwordHash: hashPassword(cleanPass),
      role: 'student',
      title: 'Học sinh',
      className: sanitizeClassName(resolvedClassName),
      classId: resolvedClassId,
      pin: '4324',
      studentId: newUser.studentId,
      schoolName: newUser.schoolName,
      avatar: initials,
      createdAt: new Date().toISOString()
    };

    accounts.push(newRecord);
    this.saveAccounts(accounts);

    return {
      success: true,
      user: newUser,
      message: `Đăng ký thành công! Đã tự động gán vào ${resolvedClassName}.`
    };
  },

  // Real Teacher Registration (Sign Up)
  registerTeacher(params: {
    name: string;
    identifier: string; // Email or Phone
    subject?: string;
    schoolName?: string;
    password: string;
  }): { success: boolean; user?: AuthUser; message: string } {
    const cleanName = params.name.trim();
    const cleanId = params.identifier.trim().toLowerCase();
    const cleanSubject = params.subject?.trim() || 'Tiếng Anh THPT';
    const cleanSchool = params.schoolName?.trim() || 'Hệ thống Khảo thí & Luyện thi Tiếng Anh';
    const cleanPass = params.password.trim();

    // 1. Validation
    if (!cleanName || cleanName.length < 2) {
      return { success: false, message: 'Họ và tên giáo viên phải có ít nhất 2 ký tự.' };
    }
    if (!cleanId) {
      return { success: false, message: 'Vui lòng nhập Email hoặc Số điện thoại.' };
    }
    if (cleanPass.length < 6) {
      return { success: false, message: 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên.' };
    }

    const accounts = this.getAllAccounts();

    // 2. Check duplicate Email or Phone
    const isEmail = cleanId.includes('@');
    const existing = accounts.find(acc => {
      if (isEmail) {
        return acc.email.toLowerCase() === cleanId;
      } else {
        return acc.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '');
      }
    });

    if (existing) {
      return {
        success: false,
        message: `${isEmail ? 'Email' : 'Số điện thoại'} này đã được đăng ký trong hệ thống. Vui lòng đăng nhập hoặc sử dụng tài khoản khác.`
      };
    }

    // 3. Create new teacher AuthUser
    const newId = `usr-tch-${Date.now()}`;
    const initials = cleanName
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map(w => w[0].toUpperCase())
      .join('') || 'GV';

    const newUser: AuthUser = {
      id: newId,
      name: cleanName,
      email: isEmail ? cleanId : `${cleanId}@giaovien.edu.vn`,
      role: 'teacher',
      title: `Giáo viên ${cleanSubject}`,
      schoolName: cleanSchool,
      avatar: initials
    };

    const newRecord: AccountRecord = {
      id: newId,
      name: cleanName,
      email: isEmail ? cleanId : `${cleanId}@giaovien.edu.vn`,
      phone: !isEmail ? cleanId : '',
      passwordHash: hashPassword(cleanPass),
      role: 'teacher',
      title: `Giáo viên ${cleanSubject}`,
      schoolName: cleanSchool,
      avatar: initials,
      createdAt: new Date().toISOString()
    };

    accounts.push(newRecord);
    this.saveAccounts(accounts);

    return {
      success: true,
      user: newUser,
      message: 'Đăng ký tài khoản giáo viên thành công! Chào mừng thầy/cô đến với Hệ thống.'
    };
  },

  // Real Authentication Login
  login(
    identifier: string,
    pass: string,
    requestedRole: UserRole
  ): { success: boolean; user?: AuthUser; message?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, message: 'Vui lòng nhập đầy đủ Email/Số điện thoại và Mật khẩu.' };
    }

    const accounts = this.getAllAccounts();

    // 1. Search account by email or phone
    const cleanDigits = cleanId.replace(/\D/g, '');
    const account = accounts.find(acc => {
      const emailMatch = acc.email && acc.email.toLowerCase() === cleanId;
      const phoneMatch = cleanDigits.length >= 9 && acc.phone && acc.phone.replace(/\D/g, '') === cleanDigits;
      return emailMatch || phoneMatch;
    });

    if (!account) {
      return {
        success: false,
        message: 'Tài khoản không tồn tại trên hệ thống. Vui lòng kiểm tra lại thông tin hoặc đăng ký mới (đối với Học sinh).'
      };
    }

    // 2. Verify Password
    const incomingHash = hashPassword(cleanPass);
    if (account.passwordHash !== incomingHash) {
      return {
        success: false,
        message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.'
      };
    }

    // 3. Strict RBAC Role Validation
    if (account.role !== requestedRole) {
      if (account.role === 'student' && requestedRole === 'teacher') {
        return {
          success: false,
          message: 'Truy cập bị từ chối! Tài khoản này là của Học sinh, không có quyền truy cập Cổng Quản Trị Giáo Viên.'
        };
      }
      if (account.role === 'teacher' && requestedRole === 'student') {
        return {
          success: false,
          message: 'Tài khoản này là của Giáo viên. Vui lòng chọn cổng Đăng nhập Giáo viên để vào trang Quản trị.'
        };
      }
    }

    // 4. Build AuthUser from valid record (strictly sanitized, no passwords)
    const user: AuthUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      title: account.title,
      schoolName: account.schoolName,
      className: account.role === 'student' ? sanitizeClassName(account.className) : undefined,
      classId: account.classId || (account.role === 'student' ? 'c-1790068920256' : undefined),
      studentId: account.studentId,
      avatar: account.avatar
    };

    return { success: true, user };
  },

  // 2-Factor Student Verification (Class PIN + Student Phone Number)
  verifyStudentByPinAndPhone(params: {
    pin: string;
    phone: string;
    classesList?: ClassItem[];
    studentsList?: StudentItem[];
  }): {
    success: boolean;
    user?: AuthUser;
    matchedClass?: ClassItem;
    message: string;
  } {
    const rawPin = (params.pin || '').trim();
    const rawPhone = (params.phone || '').trim();
    const cleanPhone = rawPhone.replace(/\D/g, '');

    // 1. Basic format validation
    if (!rawPin) {
      return { success: false, message: 'Vui lòng nhập Mã PIN lớp học do Thầy Bình cung cấp.' };
    }
    if (!cleanPhone) {
      return { success: false, message: 'Vui lòng nhập Số điện thoại học sinh.' };
    }

    // 2. Gather all classes from params, localStorage, or defaults
    let allClasses: ClassItem[] = params.classesList && params.classesList.length > 0 ? params.classesList : [];
    if (allClasses.length === 0) {
      try {
        const storedClasses = localStorage.getItem('eng_classes_v1');
        if (storedClasses) {
          const parsed = JSON.parse(storedClasses);
          if (Array.isArray(parsed) && parsed.length > 0) {
            allClasses = parsed;
          }
        }
      } catch {}
    }
    if (allClasses.length === 0) {
      allClasses = [
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
    }

    // 3. Step 1: Check PIN existence in system
    const matchedClass = allClasses.find(c => String(c.pin).trim() === rawPin);
    if (!matchedClass) {
      return {
        success: false,
        message: 'Mã PIN lớp không đúng, vui lòng kiểm tra lại'
      };
    }

    // 4. Gather all students from params or localStorage
    let allStudents: StudentItem[] = params.studentsList && params.studentsList.length > 0 ? params.studentsList : [];
    if (allStudents.length === 0) {
      try {
        const storedStudents = localStorage.getItem('eng_students_v1');
        if (storedStudents) {
          const parsed = JSON.parse(storedStudents);
          if (Array.isArray(parsed) && parsed.length > 0) {
            allStudents = parsed;
          }
        }
      } catch {}
    }

    // Also fallback to registered accounts database if any
    const accounts = this.getAllAccounts();

    // Filter students belonging to this specific class
    const classStudents = allStudents.filter(
      s => s.classId === matchedClass.id || s.className?.trim().toLowerCase() === matchedClass.name.trim().toLowerCase()
    );

    // 5. Step 2: Search for the phone in this class
    const matchedStudent = classStudents.find(s => {
      const sPhone = (s.phone || '').replace(/\D/g, '');
      const sParentPhone = (s.parentPhone || '').replace(/\D/g, '');
      return (
        (sPhone.length >= 8 && (sPhone === cleanPhone || sPhone.endsWith(cleanPhone) || cleanPhone.endsWith(sPhone))) ||
        (sParentPhone.length >= 8 && (sParentPhone === cleanPhone || sParentPhone.endsWith(cleanPhone) || cleanPhone.endsWith(sParentPhone)))
      );
    });

    const matchedAccount = accounts.find(acc => {
      if (acc.role !== 'student') return false;
      const accPhone = (acc.phone || '').replace(/\D/g, '');
      const accClassMatch = acc.classId === matchedClass.id || (acc.className && acc.className.toLowerCase() === matchedClass.name.toLowerCase());
      return accClassMatch && accPhone.length >= 8 && (accPhone === cleanPhone || accPhone.endsWith(cleanPhone) || cleanPhone.endsWith(accPhone));
    });

    if (!matchedStudent && !matchedAccount) {
      return {
        success: false,
        message: 'Số điện thoại không nằm trong danh sách lớp này. Vui lòng liên hệ Thầy Bình để được kiểm tra'
      };
    }

    // 6. Extract exact student identity
    const studentName = matchedStudent?.name || matchedAccount?.name || 'Học sinh';
    const studentId = matchedStudent?.studentId || matchedAccount?.studentId || `HS-${cleanPhone.slice(-4)}`;
    const initials = studentName
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map(w => w[0].toUpperCase())
      .join('') || 'HS';

    const authUser: AuthUser = {
      id: matchedStudent?.id || matchedAccount?.id || `usr-std-${cleanPhone}`,
      name: studentName,
      phone: cleanPhone,
      email: matchedAccount?.email || `${cleanPhone}@hocsinh.edu.vn`,
      role: 'student',
      title: 'Học sinh',
      className: sanitizeClassName(matchedClass.name),
      classId: matchedClass.id,
      studentId: studentId,
      schoolName: `${matchedClass.name} - Thầy Dương Văn Bình`,
      avatar: initials,
      status: matchedStudent?.status || 'Chưa làm'
    };

    return {
      success: true,
      user: authUser,
      matchedClass,
      message: `Xác thực danh tính chính chủ thành công! Chào mừng ${studentName}.`
    };
  }
};
