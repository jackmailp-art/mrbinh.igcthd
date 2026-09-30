import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ClipboardList,
  AlertTriangle,
  Bell,
  Clock,
  CheckCircle2,
  Send,
  Plus,
  Trash2,
  Users,
  Search,
  Filter,
  Phone,
  Sparkles,
  Smartphone,
  Check,
  X,
  MessageSquare,
  FileText,
  Volume2,
  Calendar,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Flame,
  UserCheck,
  UserX,
  RefreshCw,
  PieChart as LucidePieChart,
  LayoutGrid,
  CalendarDays,
  CheckSquare,
  Square,
  BarChart3,
  TrendingUp,
  Tag,
  Bookmark,
  CheckCircle,
  BookOpen,
  RotateCw
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { HomeworkTask, StudentItem, ClassItem, TaskCategory, TaskPriority } from '../types';
import { TaskCalendarView } from './TaskCalendarView';

interface TaskPieChartProps {
  submittedCount: number;
  totalCount: number;
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
}

// Small Recharts Donut/Pie Chart displaying completed vs incomplete students
const TaskCompletionPieChart: React.FC<TaskPieChartProps> = ({
  submittedCount,
  totalCount,
  size = 74,
  innerRadius = 22,
  outerRadius = 33,
  showLegend = true,
}) => {
  const safeTotal = Math.max(0, totalCount);
  const safeSubmitted = Math.min(Math.max(0, submittedCount), safeTotal);
  const safePending = Math.max(0, safeTotal - safeSubmitted);

  const percent = safeTotal > 0 ? Math.round((safeSubmitted / safeTotal) * 100) : 0;
  const pendingPercent = 100 - percent;

  const chartData = useMemo(() => {
    if (safeTotal === 0) {
      return [{ name: 'Chưa có dữ liệu', value: 1, color: '#e2e8f0' }];
    }
    if (safeSubmitted === 0 && safePending > 0) {
      return [{ name: 'Chưa hoàn thành', value: safePending, color: '#f43f5e' }];
    }
    if (safePending === 0 && safeSubmitted > 0) {
      return [{ name: 'Đã hoàn thành', value: safeSubmitted, color: '#10b981' }];
    }
    return [
      { name: 'Đã hoàn thành', value: safeSubmitted, color: '#10b981' },
      { name: 'Chưa hoàn thành', value: safePending, color: '#f43f5e' },
    ];
  }, [safeTotal, safeSubmitted, safePending]);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex items-center gap-3 bg-slate-50/90 p-2.5 rounded-xl border border-slate-100">
      {/* Recharts Pie with center % label */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <RechartsPieChart width={size} height={size}>
          <Pie
            data={chartData}
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={safeSubmitted > 0 && safePending > 0 ? 3 : 0}
            dataKey="value"
            stroke="none"
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                const count = Number(item.value);
                const pct = safeTotal > 0 ? Math.round((count / safeTotal) * 100) : 0;
                return (
                  <div className="bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-700 pointer-events-none z-50">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span
                        className="w-2 h-2 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: (item.payload as any)?.color || '#10b981' }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className="text-slate-300 font-medium mt-0.5">
                      {count} học sinh ({pct}%)
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </RechartsPieChart>

        {/* Center % Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className="text-[12px] font-black text-slate-800 leading-none">{percent}%</span>
          <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-tighter mt-0.5">xong</span>
        </div>
      </div>

      {/* Legend & Details */}
      {showLegend && (
        <div className="flex-1 min-w-0 space-y-1 text-xs">
          <div className="flex items-center justify-between gap-1">
            <span className="flex items-center gap-1.5 text-slate-600 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate text-[11px] font-medium">Đã hoàn thành:</span>
            </span>
            <span className="font-extrabold text-emerald-700 text-xs shrink-0">
              {safeSubmitted} <span className="font-normal text-slate-400 text-[10px]">({percent}%)</span>
            </span>
          </div>

          <div className="flex items-center justify-between gap-1">
            <span className="flex items-center gap-1.5 text-slate-600 truncate">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span className="truncate text-[11px] font-medium">Chưa hoàn thành:</span>
            </span>
            <span className="font-extrabold text-rose-600 text-xs shrink-0">
              {safePending} <span className="font-normal text-slate-400 text-[10px]">({pendingPercent}%)</span>
            </span>
          </div>

          {/* Mini two-tone ratio bar */}
          <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden flex mt-1">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${percent}%` }}
              title={`Đã hoàn thành: ${percent}%`}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${pendingPercent}%` }}
              title={`Chưa hoàn thành: ${pendingPercent}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface TasksManagementViewProps {
  tasks: HomeworkTask[];
  students: StudentItem[];
  classes: ClassItem[];
  onAddTask: (newTask: HomeworkTask) => void;
  onUpdateTasks: (updatedTasks: HomeworkTask[]) => void;
  onDeleteTask: (taskId: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

interface SimulatedPushNotification {
  id: string;
  studentName: string;
  className: string;
  parentPhone: string;
  taskTitle: string;
  deadline: string;
  message: string;
  timestamp: string;
  templateType: 'friendly' | 'urgent' | 'parent';
}

// Web Audio sound simulation for push notification chime
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First high tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Second higher tone for standard mobile chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    // Audio autoplay policy or unavailable, fallback silently
  }
}

export const TasksManagementView: React.FC<TasksManagementViewProps> = ({
  tasks,
  students,
  classes,
  onAddTask,
  onUpdateTasks,
  onDeleteTask,
  onShowToast,
}) => {
  // Filters & State
  const [viewLayout, setViewLayout] = useState<'cards' | 'calendar'>('cards');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOnlyUrgent, setShowOnlyUrgent] = useState<boolean>(false);

  // Bulk selection & action state
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isBulkReminding, setIsBulkReminding] = useState<boolean>(false);
  const [bulkRemindTarget, setBulkRemindTarget] = useState<'pending' | 'all'>('pending');
  const [showBulkDeleteConfirmModal, setShowBulkDeleteConfirmModal] = useState<boolean>(false);

  // New task modal
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskClassName, setNewTaskClassName] = useState(classes[0]?.name || 'Lớp 12G09');
  const [newTaskType, setNewTaskType] = useState<HomeworkTask['type']>('Chụp vở bài học');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('Homework');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');
  const [newTaskDeadline, setNewTaskDeadline] = useState('Hôm nay 23:59 (Còn 4 giờ)');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskIsUrgent, setNewTaskIsUrgent] = useState(true);

  // Task details drawer / modal
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<HomeworkTask | null>(null);

  // Reminded students tracking map: { [taskId_studentId]: { time: string, message: string } }
  const [remindedMap, setRemindedMap] = useState<Record<string, { time: string; template: string }>>(() => {
    try {
      const stored = localStorage.getItem('EDUADMIN_REMINDED_STUDENTS');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Simulated Push Notification Banner State (Floating on screen)
  const [activePushNotification, setActivePushNotification] = useState<SimulatedPushNotification | null>(null);
  const pushTimeoutRef = useRef<any>(null);

  // Template options for reminders
  const [selectedTemplate, setSelectedTemplate] = useState<'friendly' | 'urgent' | 'parent'>('friendly');

  // Multi-sending progress state
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  // Synchronize remindedMap to localStorage
  const recordStudentReminder = (taskId: string, studentId: string, template: string) => {
    const key = `${taskId}_${studentId}`;
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setRemindedMap((prev) => {
      const updated = {
        ...prev,
        [key]: { time: nowStr, template },
      };
      try {
        localStorage.setItem('EDUADMIN_REMINDED_STUDENTS', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Also update task's remindedStudentIds if present
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        const existing = t.remindedStudentIds || [];
        if (!existing.includes(studentId)) {
          return { ...t, remindedStudentIds: [...existing, studentId] };
        }
      }
      return t;
    });
    onUpdateTasks(updatedTasks);
  };

  // Helper to build push notification message text based on template
  const buildReminderMessage = (
    studentName: string,
    taskTitle: string,
    deadline: string,
    className: string,
    template: 'friendly' | 'urgent' | 'parent'
  ) => {
    if (template === 'urgent') {
      return `⚠️ [CẢNH BÁO KHẨN CẤP] Em ${studentName} (${className}) ơi, nhiệm vụ "${taskTitle}" SẮP HẾT HẠN vào ${deadline}! Nếu không hoàn thành trước giờ khóa cổng, hệ thống sẽ tự động ghi nhận điểm 0 và trừ điểm chuyên cần tuần này. Hãy hoàn tất và chụp nộp ngay!`;
    }
    if (template === 'parent') {
      return `👨‍👩‍👧 [THÔNG BÁO PHỤ HUYNH & HỌC SINH] Kính gửi Phụ huynh em ${studentName}: Nhiệm vụ "${taskTitle}" của em sắp hết hạn vào ${deadline} nhưng hệ thống ghi nhận em chưa nộp bài. Kính nhờ Quý phụ huynh đôn đốc em hoàn thành đúng hạn.`;
    }
    return `🔔 [NHẮC NHỞ HỌC TẬP] Chào em ${studentName} (${className})! Nhiệm vụ "${taskTitle}" sẽ đến hạn chót vào ${deadline}. Em nhớ dành chút thời gian hoàn thiện và chụp/nộp bài sớm nhé. Chúc em làm bài thật tốt! ✨`;
  };

  // Trigger push notification simulation
  const triggerPushSimulation = (
    student: StudentItem,
    task: HomeworkTask,
    template: 'friendly' | 'urgent' | 'parent' = selectedTemplate
  ) => {
    playNotificationChime();

    const message = buildReminderMessage(
      student.name,
      task.title,
      task.deadline,
      task.className,
      template
    );

    const notification: SimulatedPushNotification = {
      id: `push-${Date.now()}`,
      studentName: student.name,
      className: student.className,
      parentPhone: student.parentPhone || student.phone || '0987654321',
      taskTitle: task.title,
      deadline: task.deadline,
      message,
      timestamp: 'Vừa xong',
      templateType: template,
    };

    setActivePushNotification(notification);
    recordStudentReminder(task.id, student.id, template);

    // Auto dismiss after 7.5 seconds
    if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
    pushTimeoutRef.current = setTimeout(() => {
      setActivePushNotification(null);
    }, 7500);

    onShowToast(`Đã bắn thông báo đẩy (Push) nhắc nhở tới em ${student.name} & Zalo Phụ huynh!`, 'success');
  };

  // Bulk trigger simulation
  const handleBulkSendReminders = (urgentList: { student: StudentItem; task: HomeworkTask }[]) => {
    if (urgentList.length === 0) return;
    setIsBulkSending(true);
    setBulkProgress(0);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < urgentList.length) {
        const item = urgentList[idx];
        recordStudentReminder(item.task.id, item.student.id, selectedTemplate);
        idx++;
        setBulkProgress(Math.round((idx / urgentList.length) * 100));
      } else {
        clearInterval(interval);
        setIsBulkSending(false);
        playNotificationChime();
        onShowToast(`Đã gửi thông báo đẩy (Push-Notification) hàng loạt tới toàn bộ ${urgentList.length} học sinh sát hạn chót!`, 'success');

        // Show sample push notification for the first student
        const first = urgentList[0];
        const msg = buildReminderMessage(
          first.student.name,
          first.task.title,
          first.task.deadline,
          first.task.className,
          selectedTemplate
        );
        setActivePushNotification({
          id: `push-bulk-${Date.now()}`,
          studentName: `[Hàng loạt] ${first.student.name} + ${urgentList.length - 1} học sinh`,
          className: first.task.className,
          parentPhone: first.student.parentPhone || '0987654321',
          taskTitle: first.task.title,
          deadline: first.task.deadline,
          message: msg,
          timestamp: 'Vừa xong',
          templateType: selectedTemplate,
        });

        if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
        pushTimeoutRef.current = setTimeout(() => {
          setActivePushNotification(null);
        }, 8000);
      }
    }, 200);
  };

  // Feature: Remind Students for a specific task - sends toast notification to all assigned students
  const handleRemindTaskStudents = (task: HomeworkTask, targetMode: 'all' | 'pending' = 'all') => {
    const assignedStudents = students.filter(
      (s) => s.className === task.className || (task.classId && s.classId === task.classId)
    );

    if (assignedStudents.length === 0) {
      onShowToast(`Không tìm thấy học sinh nào thuộc lớp ${task.className} được giao nhiệm vụ "${task.title}"!`, 'info');
      return;
    }

    const targetStudents =
      targetMode === 'pending'
        ? assignedStudents.filter((s) => !task.completedStudentIds?.includes(s.id))
        : assignedStudents;

    if (targetStudents.length === 0) {
      onShowToast(`Tất cả học sinh lớp ${task.className} đều đã hoàn thành nhiệm vụ "${task.title}"!`, 'info');
      return;
    }

    playNotificationChime();

    // Record reminder timestamp & template for all target students in remindedMap & localStorage
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const newRemindedKeys: Record<string, { time: string; template: string }> = {};
    targetStudents.forEach((s) => {
      newRemindedKeys[`${task.id}_${s.id}`] = { time: nowStr, template: selectedTemplate };
    });

    setRemindedMap((prev) => {
      const updated = { ...prev, ...newRemindedKeys };
      try {
        localStorage.setItem('EDUADMIN_REMINDED_STUDENTS', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Update task's remindedStudentIds list
    const targetStudentIds = targetStudents.map((s) => s.id);
    const updatedTasks = tasks.map((t) => {
      if (t.id === task.id) {
        const existing = t.remindedStudentIds || [];
        const combined = Array.from(new Set([...existing, ...targetStudentIds]));
        return { ...t, remindedStudentIds: combined };
      }
      return t;
    });
    onUpdateTasks(updatedTasks);

    // Also update selectedTaskForDetails if currently open
    if (selectedTaskForDetails && selectedTaskForDetails.id === task.id) {
      setSelectedTaskForDetails((prev) => {
        if (!prev) return null;
        const existing = prev.remindedStudentIds || [];
        const combined = Array.from(new Set([...existing, ...targetStudentIds]));
        return { ...prev, remindedStudentIds: combined };
      });
    }

    // Trigger visual floating push notification preview
    const firstStudent = targetStudents[0];
    const previewMessage = buildReminderMessage(
      targetStudents.length > 1
        ? `${firstStudent.name} (và ${targetStudents.length - 1} học sinh khác)`
        : firstStudent.name,
      task.title,
      task.deadline,
      task.className,
      selectedTemplate
    );

    setActivePushNotification({
      id: `push-task-${Date.now()}`,
      studentName:
        targetStudents.length > 1
          ? `Toàn bộ ${targetStudents.length} học sinh ${task.className}`
          : firstStudent.name,
      className: task.className,
      parentPhone: firstStudent.parentPhone || firstStudent.phone || '0987654321',
      taskTitle: task.title,
      deadline: task.deadline,
      message: previewMessage,
      timestamp: 'Vừa xong',
      templateType: selectedTemplate,
    });

    if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
    pushTimeoutRef.current = setTimeout(() => {
      setActivePushNotification(null);
    }, 7500);

    // Send toast notification to all students assigned to this task
    onShowToast(
      `🔔 [Remind Students] Đã gửi thông báo nhắc nhở thành công tới tất cả ${targetStudents.length} học sinh được giao nhiệm vụ "${task.title}" (${task.className})!`,
      'success'
    );
  };

  // Compile urgent students across all open tasks that have an imminent deadline
  const urgentStudentsList = useMemo(() => {
    const list: {
      student: StudentItem;
      task: HomeworkTask;
      key: string;
      isReminded: boolean;
      remindedInfo?: { time: string; template: string };
    }[] = [];

    tasks.forEach((task) => {
      // Check if task is open and has urgent deadline
      const deadlineLower = task.deadline.toLowerCase();
      const isUrgentTask =
        task.isUrgent ||
        (task.deadlineHoursRemaining !== undefined && task.deadlineHoursRemaining <= 24) ||
        deadlineLower.includes('hôm nay') ||
        deadlineLower.includes('còn 2') ||
        deadlineLower.includes('còn 3') ||
        deadlineLower.includes('còn 4') ||
        deadlineLower.includes('sát giờ') ||
        deadlineLower.includes('ngày mai');

      if (!isUrgentTask || task.status === 'Hết hạn') return;

      // Find all students belonging to this task's class
      const classStudents = students.filter(
        (s) => s.className === task.className || s.classId === task.classId
      );

      // Determine who has NOT completed
      classStudents.forEach((student) => {
        const isCompleted = task.completedStudentIds?.includes(student.id);
        if (!isCompleted) {
          const key = `${task.id}_${student.id}`;
          const reminded = !!remindedMap[key] || (task.remindedStudentIds || []).includes(student.id);
          list.push({
            student,
            task,
            key,
            isReminded: reminded,
            remindedInfo: remindedMap[key],
          });
        }
      });
    });

    return list;
  }, [tasks, students, remindedMap]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedClassFilter !== 'all' && t.className !== selectedClassFilter) {
        return false;
      }
      if (selectedTypeFilter !== 'all' && t.type !== selectedTypeFilter) {
        return false;
      }
      if (selectedCategoryFilter !== 'all' && (t.category || 'Homework') !== selectedCategoryFilter) {
        return false;
      }
      if (selectedPriorityFilter !== 'all') {
        const effPriority = t.priority || (t.isUrgent ? 'High' : 'Medium');
        if (effPriority !== selectedPriorityFilter) return false;
      }
      if (showOnlyUrgent && !t.isUrgent && !(t.deadlineHoursRemaining !== undefined && t.deadlineHoursRemaining <= 24)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        const matchesClass = t.className.toLowerCase().includes(q);
        const matchesType = t.type.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesClass || matchesType;
      }
      return true;
    });
  }, [tasks, selectedClassFilter, selectedTypeFilter, selectedCategoryFilter, selectedPriorityFilter, showOnlyUrgent, searchQuery]);

  // Statistics Panel Data: Completed vs Pending across all classes
  const overallTaskStats = useMemo(() => {
    let totalExpected = 0;
    let totalSubmitted = 0;
    tasks.forEach((t) => {
      totalExpected += t.totalCount || 0;
      totalSubmitted += t.submittedCount || 0;
    });
    const totalPending = Math.max(0, totalExpected - totalSubmitted);
    const completedPercent = totalExpected > 0 ? Math.round((totalSubmitted / totalExpected) * 100) : 0;
    const pendingPercent = 100 - completedPercent;

    return {
      totalExpected,
      totalSubmitted,
      totalPending,
      completedPercent,
      pendingPercent,
      totalTasksCount: tasks.length,
      urgentCount: tasks.filter((t) => t.isUrgent || (t.deadlineHoursRemaining !== undefined && t.deadlineHoursRemaining <= 24)).length,
      activeTasksCount: tasks.filter((t) => t.status === 'Đang mở').length,
    };
  }, [tasks]);

  // Performance Overview Data for Recharts BarChart by Class
  const classPerformanceData = useMemo(() => {
    const classMap: Record<string, { className: string; submitted: number; total: number; tasksCount: number }> = {};
    classes.forEach((c) => {
      classMap[c.name] = { className: c.name, submitted: 0, total: 0, tasksCount: 0 };
    });
    tasks.forEach((t) => {
      if (!classMap[t.className]) {
        classMap[t.className] = { className: t.className, submitted: 0, total: 0, tasksCount: 0 };
      }
      classMap[t.className].submitted += t.submittedCount || 0;
      classMap[t.className].total += t.totalCount || 0;
      classMap[t.className].tasksCount += 1;
    });

    return Object.values(classMap).map((item) => {
      const rate = item.total > 0 ? Math.round((item.submitted / item.total) * 100) : 0;
      const pending = Math.max(0, item.total - item.submitted);
      return {
        className: item.className,
        rate,
        submitted: item.submitted,
        total: item.total,
        pending,
        tasksCount: item.tasksCount,
      };
    });
  }, [classes, tasks]);

  // Quick Toggle Task Complete directly from card without opening modal
  const handleToggleTaskComplete = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const isCurrentlyComplete = targetTask.status === 'Hết hạn' || targetTask.submittedCount >= targetTask.totalCount;
    const nextStatus = isCurrentlyComplete ? ('Đang mở' as const) : ('Hết hạn' as const);
    const nextSubmitted = isCurrentlyComplete
      ? Math.max(0, Math.round(targetTask.totalCount * 0.75))
      : targetTask.totalCount;

    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: nextStatus,
          submittedCount: nextSubmitted,
        };
      }
      return t;
    });

    onUpdateTasks(updatedTasks);
    onShowToast(
      !isCurrentlyComplete
        ? `✅ Đã đánh dấu hoàn thành nhiệm vụ "${targetTask.title}"!`
        : `🔄 Đã mở lại nhiệm vụ "${targetTask.title}"!`,
      'success'
    );
  };

  // Selected tasks objects
  const selectedTasks = useMemo(() => {
    return tasks.filter((t) => selectedTaskIds.includes(t.id));
  }, [tasks, selectedTaskIds]);

  // Aggregate stats across selected tasks
  const selectedTasksStats = useMemo(() => {
    let totalAssigned = 0;
    let totalPending = 0;
    const uniqueStudentIds = new Set<string>();
    const uniquePendingStudentIds = new Set<string>();

    selectedTasks.forEach((task) => {
      const assigned = students.filter(
        (s) => s.className === task.className || (task.classId && s.classId === task.classId)
      );
      totalAssigned += assigned.length;
      assigned.forEach((s) => uniqueStudentIds.add(s.id));

      const pending = assigned.filter((s) => !task.completedStudentIds?.includes(s.id));
      totalPending += pending.length;
      pending.forEach((s) => uniquePendingStudentIds.add(s.id));
    });

    return {
      totalAssigned,
      totalPending,
      uniqueStudentsCount: uniqueStudentIds.size,
      uniquePendingStudentsCount: uniquePendingStudentIds.size,
    };
  }, [selectedTasks, students]);

  const isAllSelected =
    filteredTasks.length > 0 && filteredTasks.every((t) => selectedTaskIds.includes(t.id));
  const isSomeSelected = selectedTaskIds.length > 0 && !isAllSelected;

  const toggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAllVisible = () => {
    if (isAllSelected) {
      setSelectedTaskIds((prev) => prev.filter((id) => !filteredTasks.some((t) => t.id === id)));
    } else {
      const visibleIds = filteredTasks.map((t) => t.id);
      setSelectedTaskIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedTaskIds([]);
  };

  // Mass Delete operation
  const handleConfirmBulkDelete = () => {
    if (selectedTaskIds.length === 0) return;
    const count = selectedTaskIds.length;
    const remainingTasks = tasks.filter((t) => !selectedTaskIds.includes(t.id));
    onUpdateTasks(remainingTasks);
    setSelectedTaskIds([]);
    setShowBulkDeleteConfirmModal(false);
    onShowToast(`🗑️ Đã xóa thành công ${count} nhiệm vụ khỏi hệ thống!`, 'success');
  };

  // Bulk Remind operation
  const handleBulkRemindSelectedTasks = (targetMode: 'pending' | 'all' = bulkRemindTarget) => {
    const targetTasks = tasks.filter((t) => selectedTaskIds.includes(t.id));
    if (targetTasks.length === 0) {
      onShowToast('Vui lòng chọn ít nhất một nhiệm vụ để gửi nhắc nhở!', 'info');
      return;
    }

    setIsBulkReminding(true);
    playNotificationChime();

    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const newRemindedKeys: Record<string, { time: string; template: string }> = {};
    let totalNotifiedStudentTimes = 0;
    const notifiedStudentNames: string[] = [];
    const updatedTaskRemindedIds: Record<string, string[]> = {};

    targetTasks.forEach((task) => {
      const assignedStudents = students.filter(
        (s) => s.className === task.className || (task.classId && s.classId === task.classId)
      );
      const targetStudents =
        targetMode === 'pending'
          ? assignedStudents.filter((s) => !task.completedStudentIds?.includes(s.id))
          : assignedStudents;

      targetStudents.forEach((s) => {
        newRemindedKeys[`${task.id}_${s.id}`] = { time: nowStr, template: selectedTemplate };
        if (!notifiedStudentNames.includes(s.name)) {
          notifiedStudentNames.push(s.name);
        }
      });

      const targetIds = targetStudents.map((s) => s.id);
      const existing = task.remindedStudentIds || [];
      updatedTaskRemindedIds[task.id] = Array.from(new Set([...existing, ...targetIds]));
      totalNotifiedStudentTimes += targetStudents.length;
    });

    if (totalNotifiedStudentTimes === 0) {
      setIsBulkReminding(false);
      onShowToast('Không có học sinh nào phù hợp tiêu chí để nhắc nhở (có thể các bài tập đã nộp đủ)!', 'info');
      return;
    }

    // Synchronize to localStorage & state
    setRemindedMap((prev) => {
      const updated = { ...prev, ...newRemindedKeys };
      try {
        localStorage.setItem('EDUADMIN_REMINDED_STUDENTS', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Update tasks state
    const updatedTasks = tasks.map((t) => {
      if (updatedTaskRemindedIds[t.id]) {
        return { ...t, remindedStudentIds: updatedTaskRemindedIds[t.id] };
      }
      return t;
    });
    onUpdateTasks(updatedTasks);

    // Trigger active floating push notification banner
    const sampleClassNames = Array.from(new Set(targetTasks.map((t) => t.className))).join(', ');
    const previewMsg = `🔔 [Nhắc nhở hàng loạt] Giáo viên đã gửi thông báo nhắc nhở tới ${notifiedStudentNames.length} học sinh (${totalNotifiedStudentTimes} lượt nhắc) cho ${targetTasks.length} nhiệm vụ (${targetMode === 'pending' ? 'chưa nộp bài' : 'toàn bộ học sinh'}). Vui lòng kiểm tra và hoàn thành đúng hạn!`;

    setActivePushNotification({
      id: `bulk-remind-${Date.now()}`,
      studentName: `${notifiedStudentNames.length} học sinh (${targetTasks.length} bài tập)`,
      className: sampleClassNames,
      parentPhone: 'Zalo / SMS / App',
      taskTitle: `Nhắc hàng loạt (${targetTasks.length} nhiệm vụ)`,
      deadline: 'Xem hạn chót từng bài',
      message: previewMsg,
      timestamp: 'Vừa xong',
      templateType: selectedTemplate,
    });

    if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
    pushTimeoutRef.current = setTimeout(() => {
      setActivePushNotification(null);
    }, 7500);

    onShowToast(
      `🔔 [Bulk Remind] Đã gửi thông báo nhắc nhở thành công tới ${notifiedStudentNames.length} học sinh (${totalNotifiedStudentTimes} lượt) thuộc ${targetTasks.length} nhiệm vụ đã chọn!`,
      'success'
    );

    setIsBulkReminding(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. SIMULATED FLOATING PUSH NOTIFICATION BANNER (Real-world iOS/Android Web Push Appearance) */}
      {activePushNotification && (
        <div className="fixed top-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-blue-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <span>EduAdmin Push Notification</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-slate-400">Đã bắn tới thiết bị học sinh & Zalo phụ huynh</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">{activePushNotification.timestamp}</span>
                <button
                  type="button"
                  onClick={() => setActivePushNotification(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-200 bg-white/5 p-2.5 rounded-xl border border-white/10 leading-relaxed font-sans">
              {activePushNotification.message}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>PH: {activePushNotification.parentPhone}</span>
              </span>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    playNotificationChime();
                    onShowToast(`Đã gửi lại âm thanh chuông nhắc nhở tới em ${activePushNotification.studentName}!`, 'info');
                  }}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3 text-amber-300" />
                  <span>Rung chuông</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePushNotification(null)}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] transition cursor-pointer"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TOP MANAGEMENT HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <ClipboardList className="w-4 h-4" />
            <span>Quản Lý Nhiệm Vụ & Nộp Vở Bài Tập</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">
            Theo dõi tiến độ, nộp ảnh chụp vở & Gửi thông báo nhắc nhở
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Giám sát tỷ lệ hoàn thành bài tập của các lớp. Tự động nhận diện học sinh chưa nộp bài sát hạn chót và cho phép gửi thông báo đẩy (Push Notification / Zalo) nhanh chóng.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowNewTaskModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Giao nhiệm vụ mới</span>
          </button>
        </div>
      </div>

      {/* 3. URGENT PENDING STUDENTS ALERT BANNER & PUSH NOTIFICATION SIMULATION PANEL */}
      <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-orange-500/10 border-2 border-rose-300 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0 animate-pulse">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-rose-950 flex items-center gap-1.5">
                  <span>CẢNH BÁO SÁT HẠN CHÓT</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                    {urgentStudentsList.length} học sinh
                  </span>
                </h3>
                <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md hidden sm:inline">
                  Hạn chót &lt; 24 giờ
                </span>
              </div>
              <p className="text-xs text-rose-800/80 mt-0.5">
                Danh sách các học sinh chưa nộp bài tập sát hạn nộp. Nhấn vào từng em hoặc chọn gửi tất cả để bắn thông báo đẩy (Push Notification) tức thời.
              </p>
            </div>
          </div>

          {/* Template Selector & Bulk Action */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-rose-200 text-xs shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 px-1.5 uppercase">Mẫu tin:</span>
              <button
                type="button"
                onClick={() => setSelectedTemplate('friendly')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  selectedTemplate === 'friendly'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Nhẹ nhàng
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('urgent')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  selectedTemplate === 'urgent'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Khẩn cấp
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('parent')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  selectedTemplate === 'parent'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Phụ huynh
              </button>
            </div>

            <button
              type="button"
              disabled={urgentStudentsList.length === 0 || isBulkSending}
              onClick={() => handleBulkSendReminders(urgentStudentsList)}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              {isBulkSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang bắn push ({bulkProgress}%)...</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 text-amber-200" />
                  <span>⚡ Gửi nhắc nhở tất cả ({urgentStudentsList.length} em)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* URGENT STUDENTS LIST TABLE / CARDS */}
        {urgentStudentsList.length > 0 ? (
          <div className="bg-white rounded-xl border border-rose-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-80 overflow-y-auto divide-y divide-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Học sinh & Lớp</th>
                    <th className="py-2.5 px-3">Nhiệm vụ chưa nộp</th>
                    <th className="py-2.5 px-3">Hạn chót</th>
                    <th className="py-2.5 px-3">Số ĐT Phụ huynh</th>
                    <th className="py-2.5 px-3">Trạng thái thông báo</th>
                    <th className="py-2.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {urgentStudentsList.map(({ student, task, key, isReminded, remindedInfo }) => (
                    <tr key={key} className="hover:bg-rose-50/40 transition">
                      {/* Student info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-black shrink-0 border border-slate-200">
                            {student.name.charAt(0)}
                          </span>
                          <div>
                            <div>{student.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Mã HS: {student.studentId} • <span className="font-semibold text-blue-600">{student.className}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Task title */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 line-clamp-1 max-w-[220px]" title={task.title}>
                          {task.title}
                        </div>
                        <div className="text-[10px] text-slate-400">{task.type}</div>
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <Clock className="w-3 h-3 text-rose-600" />
                          <span>{task.deadline}</span>
                        </span>
                      </td>

                      {/* Parent Phone */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{student.parentPhone || student.phone || '0987654321'}</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold">Đã liên kết Zalo</span>
                      </td>

                      {/* Reminder status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isReminded ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span>Đã nhắc {remindedInfo?.time ? `(${remindedInfo.time})` : 'vừa xong'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Chưa gửi nhắc</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => triggerPushSimulation(student, task, selectedTemplate)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ml-auto active:scale-95 shadow-2xs ${
                            isReminded
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isReminded ? 'Gửi lại push' : 'Gửi nhắc nhở nhanh'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white/80 rounded-xl border border-rose-200 text-center text-xs text-slate-600">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <span className="font-bold text-slate-800">Tuyệt vời! Hiện tại không có học sinh nào sát hạn chót bị trễ bài.</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Tất cả nhiệm vụ sát hạn chót đều đã được nộp hoặc chưa đến mốc cảnh báo 24 giờ.</p>
          </div>
        )}
      </div>

      {/* 4. TASK FILTERS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nhiệm vụ, lớp học, định dạng..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle: Cards vs Calendar */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewLayout('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewLayout === 'cards'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Xem danh sách bài tập dạng lưới thẻ"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Dạng Thẻ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewLayout === 'calendar'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Xem lịch hạn chót dạng tuần / tháng"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lịch Hạn Chót (Calendar)</span>
            </button>
          </div>

          {/* Class Filter */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả các lớp ({classes.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả định dạng</option>
            <option value="Chụp vở bài học">Chụp vở bài học</option>
            <option value="File ghi âm phát âm">File ghi âm phát âm</option>
            <option value="Bài tập tự luận">Bài tập tự luận</option>
            <option value="Nộp bài trắc nghiệm">Nộp bài trắc nghiệm</option>
          </select>

          {/* Urgent only toggle */}
          <button
            type="button"
            onClick={() => setShowOnlyUrgent(!showOnlyUrgent)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              showOnlyUrgent
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Chỉ xem Sát hạn chót</span>
          </button>
        </div>
      </div>

      {/* 4.1 BATCH SELECTION & ACTION BAR */}
      {filteredTasks.length > 0 && viewLayout === 'cards' && (
        <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="flex items-center gap-2 font-bold text-slate-700 hover:text-blue-600 transition cursor-pointer select-none"
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  isAllSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isSomeSelected
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'border-slate-300 bg-white hover:border-blue-400'
                }`}
              >
                {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
                {isSomeSelected && <div className="w-2 h-0.5 bg-blue-700 rounded-full" />}
              </div>
              <span>
                {isAllSelected
                  ? `Đang chọn tất cả (${filteredTasks.length})`
                  : `Chọn tất cả (${filteredTasks.length} nhiệm vụ)`}
              </span>
            </button>

            {selectedTaskIds.length > 0 && (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                Đã chọn {selectedTaskIds.length} nhiệm vụ ({selectedTasksStats.totalAssigned} HS, {selectedTasksStats.totalPending} chưa nộp)
              </span>
            )}
          </div>

          {selectedTaskIds.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Target mode switch */}
              <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setBulkRemindTarget('pending')}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                    bulkRemindTarget === 'pending'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Chỉ gửi nhắc nhở cho học sinh chưa nộp bài"
                >
                  Chưa nộp ({selectedTasksStats.totalPending})
                </button>
                <button
                  type="button"
                  onClick={() => setBulkRemindTarget('all')}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                    bulkRemindTarget === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Gửi nhắc nhở cho tất cả học sinh được giao"
                >
                  Tất cả HS ({selectedTasksStats.totalAssigned})
                </button>
              </div>

              {/* Bulk Remind button */}
              <button
                type="button"
                disabled={isBulkReminding}
                onClick={() => handleBulkRemindSelectedTasks(bulkRemindTarget)}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {isBulkReminding ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Bell className="w-3.5 h-3.5 fill-slate-950" />
                )}
                <span>Nhắc nhở ({selectedTaskIds.length})</span>
              </button>

              {/* Mass Delete button */}
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirmModal(true)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa ({selectedTaskIds.length})</span>
              </button>

              {/* Deselect All */}
              <button
                type="button"
                onClick={handleClearSelection}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
                title="Bỏ chọn tất cả"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. TASKS VIEW: CARDS GRID VS CALENDAR */}
      {viewLayout === 'calendar' ? (
        <TaskCalendarView
          tasks={filteredTasks}
          allTasks={tasks}
          students={students}
          classes={classes}
          onSelectTask={setSelectedTaskForDetails}
          onRemindStudents={(task) => handleRemindTaskStudents(task, 'all')}
          onQuickNewTask={(dateStr) => {
            if (dateStr) {
              setNewTaskDeadline(dateStr);
            }
            setShowNewTaskModal(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((t) => {
            const percent = t.totalCount > 0 ? Math.round((t.submittedCount / t.totalCount) * 100) : 0;
            const pendingCount = Math.max(0, t.totalCount - t.submittedCount);
            const isUrgent =
              t.isUrgent ||
              (t.deadlineHoursRemaining !== undefined && t.deadlineHoursRemaining <= 24) ||
              t.deadline.toLowerCase().includes('hôm nay') ||
              t.deadline.toLowerCase().includes('còn');
            const isSelected = selectedTaskIds.includes(t.id);

            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 flex flex-col justify-between transition hover:shadow-md relative ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/15 shadow-md'
                    : isUrgent
                    ? 'border-amber-300 ring-1 ring-amber-100'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Header Badge & Selection Checkbox */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Checkbox for mass selection */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectTask(t.id);
                        }}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50 text-transparent'
                        }`}
                        title={
                          isSelected
                            ? 'Bỏ chọn nhiệm vụ này'
                            : 'Chọn nhiệm vụ này để thao tác hàng loạt'
                        }
                      >
                        <Check className={`w-3.5 h-3.5 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                      </button>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${
                          t.type === 'Chụp vở bài học'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : t.type === 'File ghi âm phát âm'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : t.type === 'Bài tập tự luận'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {t.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isUrgent && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full animate-pulse">
                          <Flame className="w-3 h-3 text-rose-500" />
                          <span>Sát hạn chót</span>
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'Đang mở'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">{t.title}</h3>
                    {t.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {t.description}
                      </p>
                    )}
                  </div>

                  {/* Meta details */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Lớp được giao:</span>
                      <strong className="text-slate-800">{t.className}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Hạn nộp:</span>
                      <strong className={isUrgent ? 'text-rose-600 font-extrabold' : 'text-slate-700'}>
                        {t.deadline}
                      </strong>
                    </div>
                  </div>

                  {/* Recharts Pie Chart: % completed vs incomplete */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <LucidePieChart className="w-3.5 h-3.5 text-blue-500" />
                        <span>Tỷ lệ hoàn thành:</span>
                      </span>
                      <span className="font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {t.submittedCount}/{t.totalCount} HS ({percent}%)
                      </span>
                    </div>

                    <TaskCompletionPieChart
                      submittedCount={t.submittedCount}
                      totalCount={t.totalCount}
                      size={74}
                      innerRadius={21}
                      outerRadius={33}
                    />
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTaskForDetails(t)}
                    className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Danh sách lớp ({pendingCount} chưa nộp)</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Dedicated 'Remind Students' button sending toast notification to all assigned students */}
                    <button
                      type="button"
                      title={`Gửi thông báo nhắc nhở (Remind Students) tới tất cả học sinh được giao nhiệm vụ "${t.title}"`}
                      onClick={() => handleRemindTaskStudents(t, 'all')}
                      className="px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-98"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-600" />
                      <span>Remind Students</span>
                    </button>

                    <button
                      type="button"
                      title="Xóa nhiệm vụ này"
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc chắn muốn xóa nhiệm vụ "${t.title}"?`)) {
                          onDeleteTask(t.id);
                          onShowToast(`Đã xóa nhiệm vụ "${t.title}"!`, 'info');
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4.2 FLOATING BOTTOM BULK ACTION TOOLBAR */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[calc(100%-2rem)] sm:w-auto animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-4">
            {/* Selection Count Badge */}
            <div className="flex items-center gap-2.5 pr-2.5 sm:border-r sm:border-slate-700/80">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                {selectedTaskIds.length}
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>Đã chọn {selectedTaskIds.length} nhiệm vụ</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {selectedTasksStats.totalAssigned} học sinh ({selectedTasksStats.totalPending} chưa nộp)
                </div>
              </div>
            </div>

            {/* Select/Deselect quick toggle */}
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="text-xs font-semibold text-slate-300 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition cursor-pointer hidden md:inline-block"
            >
              {isAllSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${filteredTasks.length})`}
            </button>

            {/* Target mode pill in floating bar */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setBulkRemindTarget('pending')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${
                  bulkRemindTarget === 'pending'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Chỉ gửi nhắc nhở cho học sinh chưa nộp bài"
              >
                Chưa nộp ({selectedTasksStats.totalPending})
              </button>
              <button
                type="button"
                onClick={() => setBulkRemindTarget('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${
                  bulkRemindTarget === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Gửi nhắc nhở cho tất cả học sinh được giao"
              >
                Tất cả ({selectedTasksStats.totalAssigned})
              </button>
            </div>

            {/* Bulk Remind Button */}
            <button
              type="button"
              disabled={isBulkReminding}
              onClick={() => handleBulkRemindSelectedTasks(bulkRemindTarget)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 group/bulk"
            >
              {isBulkReminding ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 fill-slate-950 group-hover/bulk:rotate-12 transition-transform" />
                  <span>Nhắc nhở hàng loạt</span>
                </>
              )}
            </button>

            {/* Mass Delete Button */}
            <button
              type="button"
              onClick={() => setShowBulkDeleteConfirmModal(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-rose-500/40"
              title="Xóa tất cả các nhiệm vụ đã chọn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa hàng loạt</span>
            </button>

            {/* Dismiss / Clear selection */}
            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Bỏ chọn tất cả"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4.3 MASS DELETE CONFIRMATION MODAL */}
      {showBulkDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Xác nhận xóa {selectedTaskIds.length} nhiệm vụ?
                </h3>
                <p className="text-xs text-slate-500">
                  Hành động này sẽ xóa vĩnh viễn các bài tập đã chọn cùng tiến độ nộp bài của học sinh.
                </p>
              </div>
            </div>

            {/* List of tasks to be deleted */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 max-h-48 overflow-y-auto space-y-2 text-xs">
              {selectedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200/70"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-800 truncate">{task.title}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span>Lớp: {task.className}</span>
                      <span>•</span>
                      <span>Hạn: {task.deadline}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {task.submittedCount}/{task.totalCount} nộp
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xóa ({selectedTaskIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-base text-slate-700">Không tìm thấy nhiệm vụ nào</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Không có nhiệm vụ nào khớp với bộ lọc hiện tại. Thử xóa bớt bộ lọc hoặc nhấn nút "+ Giao nhiệm vụ mới".
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedClassFilter('all');
              setSelectedTypeFilter('all');
              setSearchQuery('');
              setShowOnlyUrgent(false);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {/* 6. MODAL: CREATE NEW TASK */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Giao nhiệm vụ & Chụp vở mới</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên nhiệm vụ / Nội dung cần nộp *</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ví dụ: Chụp ảnh vở ghi bài Unit 4, Ghi âm đoạn văn Speaking..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp được giao *</label>
                  <select
                    value={newTaskClassName}
                    onChange={(e) => setNewTaskClassName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.studentsCount} học sinh)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hình thức nộp *</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Chụp vở bài học">Chụp vở bài học</option>
                    <option value="File ghi âm phát âm">File ghi âm phát âm</option>
                    <option value="Bài tập tự luận">Bài tập tự luận</option>
                    <option value="Nộp bài trắc nghiệm">Nộp bài trắc nghiệm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hạn nộp bài *</label>
                <input
                  type="text"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  placeholder="Ví dụ: Hôm nay 23:59 (Còn 4 giờ), 23:59 Chủ nhật..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả / Hướng dẫn học sinh</label>
                <textarea
                  rows={2}
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Ghi chú thêm cho học sinh (yêu cầu chụp rõ nét, kiểm tra ánh sáng...)"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newTaskUrgentCheck"
                  checked={newTaskIsUrgent}
                  onChange={(e) => setNewTaskIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="newTaskUrgentCheck" className="font-bold text-slate-700 cursor-pointer">
                  Đánh dấu "Sát hạn chót" để kích hoạt tính năng Cảnh báo & Bắn Push Notification
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={!newTaskTitle.trim()}
                onClick={() => {
                  const targetClass = classes.find((c) => c.name === newTaskClassName) || classes[0];
                  const created: HomeworkTask = {
                    id: `task-${Date.now()}`,
                    title: newTaskTitle.trim(),
                    className: targetClass?.name || newTaskClassName,
                    classId: targetClass?.id,
                    type: newTaskType,
                    deadline: newTaskDeadline.trim() || '23:59 Chủ nhật',
                    deadlineHoursRemaining: newTaskIsUrgent ? 4 : 72,
                    isUrgent: newTaskIsUrgent,
                    submittedCount: 0,
                    totalCount: targetClass?.studentsCount || 35,
                    status: 'Đang mở',
                    description: newTaskDescription.trim(),
                    completedStudentIds: [],
                    remindedStudentIds: [],
                    createdAt: new Date().toLocaleDateString('vi-VN'),
                  };
                  onAddTask(created);
                  setShowNewTaskModal(false);
                  setNewTaskTitle('');
                  setNewTaskDescription('');
                  onShowToast(`Đã giao nhiệm vụ "${created.title}" cho ${created.className}!`, 'success');
                }}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition"
              >
                Phát hành nhiệm vụ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: TASK CLASS SUBMISSION DETAILS */}
      {selectedTaskForDetails && (() => {
        const assignedStudentsForDetails = students.filter(
          (s) =>
            s.className === selectedTaskForDetails.className ||
            s.classId === selectedTaskForDetails.classId
        );
        const pendingStudentsForDetails = assignedStudentsForDetails.filter(
          (s) => !selectedTaskForDetails.completedStudentIds?.includes(s.id)
        );

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    Chi tiết tiến độ nộp bài
                  </span>
                  <h3 className="font-extrabold text-base text-slate-800">{selectedTaskForDetails.title}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Lớp: <strong className="text-slate-700">{selectedTaskForDetails.className}</strong> • Hạn chót:{' '}
                    <strong className="text-rose-600">{selectedTaskForDetails.deadline}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemindTaskStudents(selectedTaskForDetails, 'all')}
                    className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                    title={`Gửi thông báo nhắc nhở (Remind Students) tới tất cả ${assignedStudentsForDetails.length} học sinh được giao nhiệm vụ "${selectedTaskForDetails.title}"`}
                  >
                    <Bell className="w-3.5 h-3.5 animate-bounce" />
                    <span>Remind Students</span>
                    <span className="bg-amber-700/60 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                      {assignedStudentsForDetails.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTaskForDetails(null)}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Recharts Pie Chart & Progress Summary for Selected Task */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 w-full">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <LucidePieChart className="w-3.5 h-3.5 text-blue-600" />
                    <span>Biểu đồ tỷ lệ hoàn thành nhiệm vụ của lớp</span>
                  </div>
                  <TaskCompletionPieChart
                    submittedCount={selectedTaskForDetails.submittedCount}
                    totalCount={selectedTaskForDetails.totalCount}
                    size={80}
                    innerRadius={23}
                    outerRadius={36}
                  />
                </div>

                {/* Quick counts */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2 text-center min-w-[85px]">
                    <div className="text-[10px] font-bold uppercase text-emerald-600">Đã nộp bài</div>
                    <div className="text-base font-black text-emerald-700 mt-0.5">
                      {selectedTaskForDetails.submittedCount} HS
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-600">
                      {selectedTaskForDetails.totalCount > 0 ? Math.round((selectedTaskForDetails.submittedCount / selectedTaskForDetails.totalCount) * 100) : 0}%
                    </div>
                  </div>

                  <div className="bg-rose-50 border border-rose-200/80 rounded-xl px-3 py-2 text-center min-w-[85px]">
                    <div className="text-[10px] font-bold uppercase text-rose-600">Chưa nộp bài</div>
                    <div className="text-base font-black text-rose-700 mt-0.5">
                      {Math.max(0, selectedTaskForDetails.totalCount - selectedTaskForDetails.submittedCount)} HS
                    </div>
                    <div className="text-[10px] font-semibold text-rose-600">
                      {selectedTaskForDetails.totalCount > 0 ? 100 - Math.round((selectedTaskForDetails.submittedCount / selectedTaskForDetails.totalCount) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Student List Action Sub-bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1 border-b border-slate-100">
                <div className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Danh sách học sinh được giao bài ({assignedStudentsForDetails.length} em):</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemindTaskStudents(selectedTaskForDetails, 'all')}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-98"
                    title="Gửi thông báo nhắc nhở tới tất cả học sinh được giao nhiệm vụ này"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    <span>Remind All ({assignedStudentsForDetails.length})</span>
                  </button>

                  {pendingStudentsForDetails.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemindTaskStudents(selectedTaskForDetails, 'pending')}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-98"
                      title="Chỉ gửi nhắc nhở cho các em chưa nộp bài"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Chỉ nhắc chưa nộp ({pendingStudentsForDetails.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Students list */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs">
                {assignedStudentsForDetails.map((student) => {
                  const isSubmitted = selectedTaskForDetails.completedStudentIds?.includes(student.id);
                  const reminderKey = `${selectedTaskForDetails.id}_${student.id}`;
                  const isReminded =
                    !!remindedMap[reminderKey] ||
                    (selectedTaskForDetails.remindedStudentIds || []).includes(student.id);

                  return (
                    <div
                      key={student.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSubmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{student.name}</div>
                          <div className="text-[11px] text-slate-400">
                            Mã: {student.studentId} • PH: {student.parentPhone || student.phone || '0987654321'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isSubmitted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã nộp bài</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Chưa nộp bài</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => triggerPushSimulation(student, selectedTaskForDetails, selectedTemplate)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                                isReminded
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-rose-600 hover:bg-rose-700 text-white'
                              }`}
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isReminded ? 'Gửi lại push' : 'Gửi nhắc nhở nhanh'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForDetails(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
