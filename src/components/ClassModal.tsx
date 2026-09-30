import React, { useState } from 'react';
import { X, Plus, Layers, Shield } from 'lucide-react';
import { ClassItem } from '../types';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClass: (newClass: ClassItem) => void;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onAddClass,
}) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Lớp 10');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const newCls: ClassItem = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      grade,
      code: `AV-${Math.floor(100 + Math.random() * 900)}`,
      studentsCount: 0,
      activeExams: 0,
      pin,
      description: description.trim() || `Lớp học tiếng Anh ${grade}`,
    };

    onAddClass(newCls);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-slate-800">Thêm lớp học mới</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Tên lớp học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: 11B2 - Tiếng Anh Nâng Cao"
              className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Khối lớp
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Lớp 6</option>
              <option>Lớp 7</option>
              <option>Lớp 8</option>
              <option>Lớp 9</option>
              <option>Lớp 10</option>
              <option>Lớp 11</option>
              <option>Lớp 12</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Ghi chú / Mục tiêu học tập
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mục tiêu điểm số, giáo trình áp dụng..."
              className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-800">
              <Shield className="w-3.5 h-3.5" />
              <span>Tự động cấp mã PIN học sinh</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800/80">
              Hệ thống sẽ tự động khởi tạo mã PIN bảo mật 4 chữ số. Học sinh chỉ cần nhập mã PIN để vào làm bài mà không cần đăng ký tài khoản phức tạp.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition active:scale-95"
            >
              Tạo lớp ngay
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
