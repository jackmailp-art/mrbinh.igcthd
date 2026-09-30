import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Bell,
  Plus,
  Flame,
  Volume2,
  FileText,
  Camera,
  CalendarDays,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { HomeworkTask, StudentItem, ClassItem } from '../types';

export interface TaskCalendarViewProps {
  tasks: HomeworkTask[];
  allTasks?: HomeworkTask[];
  students: StudentItem[];
  classes: ClassItem[];
  onSelectTask: (task: HomeworkTask) => void;
  onRemindStudents: (task: HomeworkTask) => void;
  onQuickNewTask?: (dateStr?: string) => void;
}

// Helper to reliably parse task deadline into a Date object
export function parseTaskDeadlineDate(task: HomeworkTask, baseDate: Date = new Date()): Date {
  const dStr = (task.deadline || '').toLowerCase();

  // 1. If explicit deadlineHoursRemaining is present, compute from baseDate
  if (typeof task.deadlineHoursRemaining === 'number' && !isNaN(task.deadlineHoursRemaining)) {
    return new Date(baseDate.getTime() + task.deadlineHoursRemaining * 3600000);
  }

  // 2. Check for explicit ISO or DD/MM/YYYY formats in string
  const dmyMatch = dStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(year, month, day, 23, 59, 0);
  }

  const ymdMatch = dStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day, 23, 59, 0);
  }

  // 3. Keyword: "hôm nay" (Today)
  if (dStr.includes('hôm nay') || dStr.includes('today')) {
    const today = new Date(baseDate);
    const timeMatch = dStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      today.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0);
    } else {
      today.setHours(23, 59, 0);
    }
    return today;
  }

  // 4. Keyword: "ngày mai" (Tomorrow)
  if (dStr.includes('ngày mai') || dStr.includes('tomorrow')) {
    const tomorrow = new Date(baseDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const timeMatch = dStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      tomorrow.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0);
    } else {
      tomorrow.setHours(17, 0, 0);
    }
    return tomorrow;
  }

  // 5. Day of week keywords: "chủ nhật", "thứ 2", "thứ 3", etc.
  const dayOfWeekMap: Record<string, number> = {
    'chủ nhật': 0,
    'sunday': 0,
    'thứ 2': 1,
    'thứ hai': 1,
    'thứ 3': 2,
    'thứ ba': 2,
    'thứ 4': 3,
    'thứ tư': 3,
    'thứ 5': 4,
    'thứ năm': 4,
    'thứ 6': 5,
    'thứ sáu': 5,
    'thứ 7': 6,
    'thứ bảy': 6,
  };

  for (const [key, targetDay] of Object.entries(dayOfWeekMap)) {
    if (dStr.includes(key)) {
      const target = new Date(baseDate);
      const currentDay = target.getDay(); // 0 is Sunday
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7; // Next occurrence in current or next week
      target.setDate(target.getDate() + diff);
      target.setHours(23, 59, 0);
      return target;
    }
  }

  // 6. Fallback based on task.createdAt or default 2 days ahead
  if (task.createdAt) {
    const cMatch = task.createdAt.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (cMatch) {
      const day = parseInt(cMatch[1], 10);
      const month = parseInt(cMatch[2], 10) - 1;
      const year = parseInt(cMatch[3], 10);
      const cDate = new Date(year, month, day);
      cDate.setDate(cDate.getDate() + 3); // 3 days after creation
      return cDate;
    }
  }

  // Default: Today + 1 day
  const fallback = new Date(baseDate);
  fallback.setDate(fallback.getDate() + 1);
  return fallback;
}

// Compare if two dates belong to the same calendar day (Year, Month, Day)
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Format date to local key YYYY-MM-DD
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  allTasks = tasks,
  students,
  classes,
  onSelectTask,
  onRemindStudents,
  onQuickNewTask,
}) => {
  // Calendar view mode: 'month' or 'week'
  const [calendarMode, setCalendarMode] = useState<'month' | 'week'>('month');

  // Currently focused date (defaults to today)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Hovered task for rich tooltip / popover
  const [hoveredTask, setHoveredTask] = useState<{
    task: HomeworkTask;
    x: number;
    y: number;
  } | null>(null);

  // Selected date filter in calendar
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  // Map each task to its resolved deadline date
  const tasksWithDates = useMemo(() => {
    return tasks.map((task) => {
      const parsedDate = parseTaskDeadlineDate(task);
      return {
        task,
        deadlineDate: parsedDate,
        dateKey: toDateKey(parsedDate),
      };
    });
  }, [tasks]);

  // Tasks grouped by dateKey
  const tasksByDateKey = useMemo(() => {
    const map = new Map<string, typeof tasksWithDates>();
    tasksWithDates.forEach((item) => {
      const existing = map.get(item.dateKey) || [];
      existing.push(item);
      map.set(item.dateKey, existing);
    });
    return map;
  }, [tasksWithDates]);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (calendarMode === 'month') {
        next.setMonth(next.getMonth() - 1);
      } else {
        next.setDate(next.getDate() - 7);
      }
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (calendarMode === 'month') {
        next.setMonth(next.getMonth() + 1);
      } else {
        next.setDate(next.getDate() + 7);
      }
      return next;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDayKey(null);
  };

  // Month days generation
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of current month
    const firstDayOfMonth = new Date(year, month, 1);
    // Last day of current month
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Days in current month
    const daysInMonth = lastDayOfMonth.getDate();

    // Day of week for 1st of month: 0 (Sun) to 6 (Sat).
    // In Vietnam / Europe calendar, week starts on Monday (1).
    let startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    // Adjust so Monday is 0, Sunday is 6
    const adjustedStartDay = (startDayOfWeek + 6) % 7;

    const days: {
      date: Date;
      dateKey: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      dayNumber: number;
    }[] = [];

    // Preceding month trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = adjustedStartDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        dateKey: toDateKey(d),
        isCurrentMonth: false,
        isToday: isSameDay(d, new Date()),
        dayNumber: d.getDate(),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      days.push({
        date: d,
        dateKey: toDateKey(d),
        isCurrentMonth: true,
        isToday: isSameDay(d, new Date()),
        dayNumber: day,
      });
    }

    // Trailing next month days to complete 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
      const d = new Date(year, month + 1, day);
      days.push({
        date: d,
        dateKey: toDateKey(d),
        isCurrentMonth: false,
        isToday: isSameDay(d, new Date()),
        dayNumber: day,
      });
    }

    return days;
  }, [currentDate]);

  // Week days generation (Monday to Sunday around currentDate)
  const weekData = useMemo(() => {
    const current = new Date(currentDate);
    const dayOfWeek = (current.getDay() + 6) % 7; // Monday = 0
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - dayOfWeek);

    const weekDays: {
      date: Date;
      dateKey: string;
      isToday: boolean;
      dayNumber: number;
      dayName: string;
    }[] = [];

    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        date: d,
        dateKey: toDateKey(d),
        isToday: isSameDay(d, new Date()),
        dayNumber: d.getDate(),
        dayName: dayNames[i],
      });
    }

    return weekDays;
  }, [currentDate]);

  // Upcoming urgency stats for quick top banner
  const upcomingStats = useMemo(() => {
    const today = new Date();
    const todayKey = toDateKey(today);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = toDateKey(tomorrow);

    let dueTodayCount = 0;
    let dueTomorrowCount = 0;
    let urgentCount = 0;

    tasksWithDates.forEach(({ task, dateKey }) => {
      if (dateKey === todayKey) dueTodayCount++;
      if (dateKey === tomorrowKey) dueTomorrowCount++;
      if (task.isUrgent || (task.deadlineHoursRemaining !== undefined && task.deadlineHoursRemaining <= 24)) {
        urgentCount++;
      }
    });

    return { dueTodayCount, dueTomorrowCount, urgentCount, total: tasks.length };
  }, [tasksWithDates, tasks]);

  // Helper to get styling for each task type
  const getTaskTypeStyle = (type: HomeworkTask['type']) => {
    switch (type) {
      case 'Chụp vở bài học':
        return {
          icon: <Camera className="w-3 h-3 text-blue-600" />,
          pillBg: 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'File ghi âm phát âm':
        return {
          icon: <Volume2 className="w-3 h-3 text-purple-600" />,
          pillBg: 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200',
          dot: 'bg-purple-500',
        };
      case 'Bài tập tự luận':
        return {
          icon: <FileText className="w-3 h-3 text-emerald-600" />,
          pillBg: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'Nộp bài trắc nghiệm':
      default:
        return {
          icon: <CheckCircle2 className="w-3 h-3 text-amber-600" />,
          pillBg: 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200',
          dot: 'bg-amber-500',
        };
    }
  };

  const weekDayHeaders = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

  return (
    <div className="space-y-4">
      {/* 1. TOP CALENDAR HEADER CONTROLS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Navigation and Current Period Display */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0 shadow-2xs">
            <CalendarIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight">
                {calendarMode === 'month'
                  ? `Tháng ${String(currentDate.getMonth() + 1).padStart(2, '0')}, ${currentDate.getFullYear()}`
                  : `Tuần từ ${weekData[0]?.dayNumber}/${weekData[0]?.date.getMonth() + 1} - ${weekData[6]?.dayNumber}/${weekData[6]?.date.getMonth() + 1}, ${currentDate.getFullYear()}`}
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                {calendarMode === 'month' ? 'Lịch Tháng' : 'Lịch Tuần'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi trực quan thời hạn nộp bài (Deadlines) & Lịch giao bài tập của các lớp
            </p>
          </div>
        </div>

        {/* Right: Mode Switcher (Month / Week) & Nav Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setCalendarMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                calendarMode === 'month'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Theo Tháng (Monthly)</span>
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                calendarMode === 'week'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Theo Tuần (Weekly)</span>
            </button>
          </div>

          {/* Navigation Buttons: Prev, Today, Next */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-white rounded-lg transition cursor-pointer"
              title="Kỳ trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-white rounded-lg transition cursor-pointer"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-white rounded-lg transition cursor-pointer"
              title="Kỳ tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. UPCOMING DEADLINES QUICK SUMMARY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hôm nay đến hạn</div>
            <div className="text-base font-black text-rose-600">
              {upcomingStats.dueTodayCount} <span className="text-xs font-semibold text-slate-500">nhiệm vụ</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày mai đến hạn</div>
            <div className="text-base font-black text-amber-700">
              {upcomingStats.dueTomorrowCount} <span className="text-xs font-semibold text-slate-500">nhiệm vụ</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sát hạn chót (&lt;24h)</div>
            <div className="text-base font-black text-blue-700">
              {upcomingStats.urgentCount} <span className="text-xs font-semibold text-slate-500">cần nhắc</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng đang mở</div>
            <div className="text-base font-black text-emerald-700">
              {upcomingStats.total} <span className="text-xs font-semibold text-slate-500">nhiệm vụ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CALENDAR GRID DISPLAY */}
      {calendarMode === 'month' ? (
        /* ================= MONTHLY GRID ================= */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/90 text-center font-bold text-xs text-slate-600 py-3">
            {weekDayHeaders.map((dayName, idx) => (
              <div key={idx} className={idx >= 5 ? 'text-amber-800' : ''}>
                <span className="hidden sm:inline">{dayName}</span>
                <span className="sm:hidden">{dayName.slice(0, 3)}</span>
              </div>
            ))}
          </div>

          {/* Month Calendar Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-100/40">
            {monthData.map(({ date, dateKey, isCurrentMonth, isToday, dayNumber }, index) => {
              const dayTasks = tasksByDateKey.get(dateKey) || [];
              const isSelected = selectedDayKey === dateKey;

              return (
                <div
                  key={`${dateKey}-${index}`}
                  onClick={() => setSelectedDayKey(isSelected ? null : dateKey)}
                  className={`min-h-[110px] sm:min-h-[135px] p-1.5 sm:p-2.5 flex flex-col justify-between transition-colors relative group ${
                    isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 text-slate-400'
                  } ${isToday ? 'bg-blue-50/40 ring-1 ring-inset ring-blue-500/40' : ''} ${
                    isSelected ? 'ring-2 ring-inset ring-blue-600 bg-blue-50/60' : 'hover:bg-slate-50/90'
                  }`}
                >
                  {/* Cell Top Header: Date number & Add button */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-lg ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-xs font-black'
                          : isCurrentMonth
                          ? 'text-slate-800 group-hover:text-blue-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {/* Quick Add Button on Hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const formatted = `${String(dayNumber).padStart(2, '0')}/${String(
                          date.getMonth() + 1
                        ).padStart(2, '0')}/${date.getFullYear()} 23:59`;
                        onQuickNewTask?.(formatted);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                      title={`Thêm nhiệm vụ cho ngày ${dayNumber}/${date.getMonth() + 1}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Tasks on this Day */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px] sm:max-h-[95px] pr-0.5 scrollbar-thin">
                    {dayTasks.map(({ task }) => {
                      const typeStyle = getTaskTypeStyle(task.type);
                      const isUrgent =
                        task.isUrgent ||
                        (task.deadlineHoursRemaining !== undefined && task.deadlineHoursRemaining <= 24);

                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(task);
                          }}
                          className={`p-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition shadow-2xs hover:shadow-xs hover:scale-[1.02] flex items-center justify-between gap-1 group/task ${
                            isUrgent
                              ? 'bg-rose-50 hover:bg-rose-100/90 text-rose-950 border-rose-300 ring-1 ring-rose-200'
                              : typeStyle.pillBg
                          }`}
                          title={`Nhấn xem chi tiết nộp bài: ${task.title} (${task.className})`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="shrink-0">{typeStyle.icon}</span>
                            <span className="truncate">{task.title}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isUrgent && <Flame className="w-3 h-3 text-rose-600 animate-pulse shrink-0" />}
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-white/80 border border-slate-200/80 text-slate-700">
                              {task.submittedCount}/{task.totalCount}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {dayTasks.length === 0 && (
                      <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-40 text-[10px] text-slate-400 italic">
                        Không có lịch
                      </div>
                    )}
                  </div>

                  {/* Bottom Day Task Count Pill */}
                  {dayTasks.length > 0 && (
                    <div className="pt-1 mt-auto flex items-center justify-between text-[9px] font-extrabold text-slate-400 border-t border-slate-100">
                      <span>{dayTasks.length} nhiệm vụ</span>
                      <span className="text-blue-600 hover:underline">Chi tiết →</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= WEEKLY GRID ================= */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* 7 Columns for the active week */}
          <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {weekData.map(({ date, dateKey, isToday, dayNumber, dayName }, idx) => {
              const dayTasks = tasksByDateKey.get(dateKey) || [];

              return (
                <div
                  key={dateKey}
                  className={`flex flex-col min-h-[420px] transition-colors ${
                    isToday ? 'bg-blue-50/30' : 'bg-white'
                  }`}
                >
                  {/* Week Column Header */}
                  <div
                    className={`p-3 border-b border-slate-200 text-center ${
                      isToday
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50/90 text-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider opacity-90">{dayName}</div>
                    <div className="text-xl font-black mt-0.5">{dayNumber}</div>
                    <div
                      className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${
                        isToday
                          ? 'bg-white/20 text-white'
                          : dayTasks.length > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200/70 text-slate-600'
                      }`}
                    >
                      {dayTasks.length} nhiệm vụ
                    </div>
                  </div>

                  {/* Column Body: Task list for this day */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5 overflow-y-auto">
                    <div className="space-y-2.5">
                      {dayTasks.map(({ task }) => {
                        const typeStyle = getTaskTypeStyle(task.type);
                        const isUrgent =
                          task.isUrgent ||
                          (task.deadlineHoursRemaining !== undefined && task.deadlineHoursRemaining <= 24);
                        const percent =
                          task.totalCount > 0 ? Math.round((task.submittedCount / task.totalCount) * 100) : 0;

                        return (
                          <div
                            key={task.id}
                            className={`p-3 rounded-2xl border text-xs space-y-2 transition shadow-2xs hover:shadow-md ${
                              isUrgent
                                ? 'bg-rose-50/90 border-rose-300 ring-1 ring-rose-200'
                                : 'bg-white border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            {/* Task Type and Class */}
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                                  isUrgent
                                    ? 'bg-rose-100 text-rose-900 border-rose-200'
                                    : typeStyle.pillBg
                                }`}
                              >
                                {typeStyle.icon}
                                <span>{task.type}</span>
                              </span>

                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {task.className}
                              </span>
                            </div>

                            {/* Task Title */}
                            <div
                              onClick={() => onSelectTask(task)}
                              className="font-extrabold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-2 leading-snug"
                            >
                              {task.title}
                            </div>

                            {/* Deadline info */}
                            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{task.deadline}</span>
                            </div>

                            {/* Progress bar */}
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                                <span>Tiến độ nộp:</span>
                                <span>
                                  {task.submittedCount}/{task.totalCount} ({percent}%)
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    percent >= 80 ? 'bg-emerald-500' : percent >= 50 ? 'bg-blue-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>

                            {/* Action Buttons: Remind Students & View Details */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                              <button
                                type="button"
                                onClick={() => onSelectTask(task)}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                              >
                                <Users className="w-3 h-3" />
                                <span>Danh sách</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => onRemindStudents(task)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                                title="Gửi thông báo nhắc nhở (Remind Students) tới cả lớp"
                              >
                                <Bell className="w-3 h-3 text-amber-600" />
                                <span>Remind</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {dayTasks.length === 0 && (
                        <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                          <CheckCircle2 className="w-6 h-6 text-slate-200 mx-auto" />
                          <div className="italic">Không có hạn nộp nào</div>
                        </div>
                      )}
                    </div>

                    {/* Quick Add Button at bottom of column */}
                    <button
                      type="button"
                      onClick={() => {
                        const formatted = `${String(dayNumber).padStart(2, '0')}/${String(
                          date.getMonth() + 1
                        ).padStart(2, '0')}/${date.getFullYear()} 23:59`;
                        onQuickNewTask?.(formatted);
                      }}
                      className="w-full py-1.5 px-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-xl border border-slate-200 hover:border-blue-300 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer mt-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Giao bài ngày này</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DETAIL DRAWER FOR SELECTED DATE IF ANY */}
      {selectedDayKey && (() => {
        const selectedTasks = tasksByDateKey.get(selectedDayKey) || [];
        const [y, m, d] = selectedDayKey.split('-');

        return (
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <h4 className="font-extrabold text-sm text-slate-800">
                  Lịch nhiệm vụ ngày {d}/{m}/{y} ({selectedTasks.length} nhiệm vụ)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayKey(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Đóng chi tiết ngày ✕
              </button>
            </div>

            {selectedTasks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {selectedTasks.map(({ task }) => (
                  <div
                    key={task.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>{task.className}</span>
                        <span className="text-rose-600 font-extrabold">{task.deadline}</span>
                      </div>
                      <div className="font-extrabold text-xs text-slate-900 line-clamp-2">{task.title}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-500">
                        {task.submittedCount}/{task.totalCount} đã nộp
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onRemindStudents(task)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Remind
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectTask(task)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500 italic">
                Ngày này chưa có nhiệm vụ nào cần nộp. Bạn có thể nhấn "+ Giao nhiệm vụ mới" để thêm bài tập.
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
