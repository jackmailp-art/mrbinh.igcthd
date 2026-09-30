import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Users,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ClassItem, StudentItem } from '../types';

interface ParsedStudentRow {
  stt?: number | string;
  studentId: string;
  name: string;
  className: string;
  phone: string;
  parentPhone: string;
  notes: string;
  isValid: boolean;
  validationError?: string;
}

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  onImportSuccess: (importedStudents: StudentItem[], autoCreatedClasses: ClassItem[]) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  classes,
  onImportSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [defaultClassMode, setDefaultClassMode] = useState<'from_file' | 'fixed_class'>('from_file');
  const [selectedFixedClassId, setSelectedFixedClassId] = useState<string>(classes[0]?.id || '');
  const [newClassNameInput, setNewClassNameInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Download Standardized Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'STT': 1,
        'Mã học sinh': 'HS-1001',
        'Họ và tên': 'Nguyễn Văn An',
        'Lớp': '10A1',
        'SĐT học sinh': '0912345678',
        'SĐT phụ huynh': '0988111222 (Mẹ)',
        'Ghi chú': 'Học sinh chăm chỉ, nắm chắc ngữ pháp cơ bản'
      },
      {
        'STT': 2,
        'Mã học sinh': 'HS-1002',
        'Họ và tên': 'Trần Thị Mai',
        'Lớp': '10A1',
        'SĐT học sinh': '0933456789',
        'SĐT phụ huynh': '0977222333 (Bố)',
        'Ghi chú': 'Cần rèn thêm kỹ năng làm đề trắc nghiệm'
      },
      {
        'STT': 3,
        'Mã học sinh': 'HS-1201',
        'Họ và tên': 'Phạm Minh Đức',
        'Lớp': '12D',
        'SĐT học sinh': '0901234567',
        'SĐT phụ huynh': '0911555666 (Mẹ)',
        'Ghi chú': 'Mục tiêu điểm 9+ kỳ thi THPT Quốc Gia'
      },
      {
        'STT': 4,
        'Mã học sinh': 'HS-1202',
        'Họ và tên': 'Đặng Ngọc Ánh',
        'Lớp': '12D',
        'SĐT học sinh': '0922678901',
        'SĐT phụ huynh': '0933777888 (Mẹ)',
        'Ghi chú': 'Tiến bộ rõ rệt phần đọc hiểu Reading'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Format column widths for neat look
    worksheet['!cols'] = [
      { wch: 6 },  // STT
      { wch: 14 }, // Mã học sinh
      { wch: 24 }, // Họ và tên
      { wch: 14 }, // Lớp
      { wch: 16 }, // SĐT học sinh
      { wch: 22 }, // SĐT phụ huynh
      { wch: 35 }, // Ghi chú
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocSinh');
    XLSX.writeFile(workbook, 'Mau_Danh_Sach_Hoc_Sinh.xlsx');
  };

  // Helper to extract field value regardless of slight header naming variations
  const extractField = (row: Record<string, any>, possibleKeys: string[]): string => {
    const rowKeys = Object.keys(row);
    for (const key of possibleKeys) {
      const match = rowKeys.find(k => k.trim().toLowerCase() === key.toLowerCase());
      if (match && row[match] !== undefined && row[match] !== null) {
        return String(row[match]).trim();
      }
    }
    return '';
  };

  // 2. Process File
  const processFile = (file: File) => {
    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

        if (rawData.length === 0) {
          alert('Tệp Excel không chứa dữ liệu. Vui lòng kiểm tra lại!');
          setIsProcessing(false);
          return;
        }

        const rows: ParsedStudentRow[] = rawData.map((row, index) => {
          const stt = extractField(row, ['stt', 'số thứ tự', 'no', 'order']) || (index + 1);
          const studentId = extractField(row, ['mã học sinh', 'mã hs', 'ma hoc sinh', 'student id', 'id', 'mã']) || `HS-${1000 + index + 1}`;
          const name = extractField(row, ['họ và tên', 'họ tên', 'tên', 'tên học sinh', 'full name', 'name']);
          const className = extractField(row, ['lớp', 'tên lớp', 'lop', 'class', 'grade']);
          const phone = extractField(row, ['sđt học sinh', 'sđt', 'số điện thoại', 'phone', 'mobile']);
          const parentPhone = extractField(row, ['sđt phụ huynh', 'sđt mẹ', 'sđt bố', 'phụ huynh', 'parent phone', 'sđt ba']);
          const notes = extractField(row, ['ghi chú', 'ghi chu', 'note', 'notes', 'nhận xét']);

          const isValid = !!name;
          const validationError = !name ? 'Thiếu họ và tên học sinh' : undefined;

          return {
            stt,
            studentId,
            name,
            className: className || 'Chưa phân lớp',
            phone,
            parentPhone,
            notes,
            isValid,
            validationError
          };
        });

        setParsedRows(rows);
      } catch (err) {
        console.error('Error reading Excel file:', err);
        alert('Không thể đọc tệp Excel. Vui lòng đảm bảo tệp định dạng .xlsx, .xls hoặc .csv!');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemoveRow = (index: number) => {
    setParsedRows(prev => prev.filter((_, i) => i !== index));
  };

  // 3. Confirm and Save Students
  const handleConfirmImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Không có học sinh nào hợp lệ để nhập vào hệ thống!');
      return;
    }

    const autoCreatedClasses: ClassItem[] = [];
    const classMap: Record<string, string> = {}; // normalized name -> classId

    // Populate existing classes into map
    classes.forEach(c => {
      classMap[c.name.trim().toLowerCase()] = c.id;
      classMap[c.name.replace(/^Lớp\s+/i, '').trim().toLowerCase()] = c.id;
    });

    const newStudents: StudentItem[] = validRows.map((row, index) => {
      let targetClassId = '';
      let targetClassName = '';

      if (defaultClassMode === 'fixed_class') {
        if (selectedFixedClassId === '__NEW__') {
          const customName = newClassNameInput.trim() || 'Lớp mới';
          const existingKey = customName.toLowerCase();
          if (classMap[existingKey]) {
            targetClassId = classMap[existingKey];
            targetClassName = customName;
          } else {
            const newClsId = `c-auto-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const newCls: ClassItem = {
              id: newClsId,
              name: customName,
              grade: customName.includes('10') ? 'Lớp 10' : customName.includes('11') ? 'Lớp 11' : customName.includes('12') ? 'Lớp 12' : 'Toàn trường',
              code: `LH-${Math.floor(100 + Math.random() * 900)}`,
              studentsCount: 0,
              activeExams: 0,
              pin: String(Math.floor(1000 + Math.random() * 9000)),
              description: 'Lớp tạo tự động khi nhập danh sách học sinh từ Excel'
            };
            autoCreatedClasses.push(newCls);
            classMap[existingKey] = newClsId;
            targetClassId = newClsId;
            targetClassName = customName;
          }
        } else {
          const found = classes.find(c => c.id === selectedFixedClassId);
          targetClassId = found ? found.id : 'c-default';
          targetClassName = found ? found.name : 'Lớp chung';
        }
      } else {
        // from_file: Use row.className
        const rawClassName = row.className.trim() || 'Chưa phân lớp';
        const key = rawClassName.toLowerCase();

        if (classMap[key]) {
          targetClassId = classMap[key];
          const found = classes.find(c => c.id === targetClassId) || autoCreatedClasses.find(c => c.id === targetClassId);
          targetClassName = found ? found.name : rawClassName;
        } else {
          // Auto create this class
          const newClsId = `c-auto-${Date.now()}-${index}`;
          const formattedName = rawClassName.toLowerCase().startsWith('lớp') ? rawClassName : `Lớp ${rawClassName}`;
          const newCls: ClassItem = {
            id: newClsId,
            name: formattedName,
            grade: formattedName.includes('10') ? 'Lớp 10' : formattedName.includes('11') ? 'Lớp 11' : formattedName.includes('12') ? 'Lớp 12' : 'Toàn trường',
            code: `LH-${Math.floor(100 + Math.random() * 900)}`,
            studentsCount: 0,
            activeExams: 0,
            pin: String(Math.floor(1000 + Math.random() * 9000)),
            description: 'Lớp tạo tự động khi nhập danh sách học sinh từ Excel'
          };
          autoCreatedClasses.push(newCls);
          classMap[key] = newClsId;
          classMap[formattedName.toLowerCase()] = newClsId;
          targetClassId = newClsId;
          targetClassName = formattedName;
        }
      }

      return {
        id: `s-imp-${Date.now()}-${index}`,
        name: row.name,
        studentId: row.studentId || `HS-${1000 + index + 1}`,
        classId: targetClassId,
        className: targetClassName,
        progress: 0,
        lastScore: 0,
        status: 'Chưa làm',
        phone: row.phone || 'Chưa cập nhật',
        parentPhone: row.parentPhone || 'Chưa cập nhật',
        completedExams: 0,
        notes: row.notes || 'Học sinh nhập từ file Excel'
      };
    });

    onImportSuccess(newStudents, autoCreatedClasses);
    onClose();
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                Thêm hàng loạt học sinh từ Excel
              </h3>
              <p className="text-xs text-slate-500">
                Tải file mẫu, điền danh sách học sinh và nhập dữ liệu vào hệ thống chỉ với một bước
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Step 1: Download Template & Instructions Card */}
          <div className="bg-gradient-to-r from-emerald-50/80 to-blue-50/80 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">
                  Tải tệp mẫu Excel chuẩn (.xlsx)
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Bao gồm các cột chuẩn: <strong>Mã HS, Họ và tên, Lớp, SĐT học sinh, SĐT phụ huynh, Ghi chú</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 whitespace-nowrap self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Tải file Excel mẫu</span>
            </button>
          </div>

          {/* Options: Class assignment mode */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Quy tắc phân lớp khi nhập học sinh:
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <label
                onClick={() => setDefaultClassMode('from_file')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  defaultClassMode === 'from_file'
                    ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="classMode"
                  checked={defaultClassMode === 'from_file'}
                  onChange={() => setDefaultClassMode('from_file')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-bold text-slate-800">Tự động theo cột "Lớp" trong file</div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Học sinh sẽ được gán theo tên lớp trong file (tự động nhận diện lớp cũ hoặc tạo lớp mới kèm mã PIN).
                  </p>
                </div>
              </label>

              <label
                onClick={() => setDefaultClassMode('fixed_class')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  defaultClassMode === 'fixed_class'
                    ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="classMode"
                  checked={defaultClassMode === 'fixed_class'}
                  onChange={() => setDefaultClassMode('fixed_class')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div className="w-full">
                  <div className="font-bold text-slate-800">Gán toàn bộ vào một lớp chỉ định</div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Tất cả học sinh trong file sẽ được đưa vào chung một lớp bạn chọn bên dưới.
                  </p>

                  {defaultClassMode === 'fixed_class' && (
                    <div className="mt-2.5">
                      <select
                        value={selectedFixedClassId}
                        onChange={(e) => setSelectedFixedClassId(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>
                        ))}
                        <option value="__NEW__">+ Tạo lớp mới cho danh sách này...</option>
                      </select>

                      {selectedFixedClassId === '__NEW__' && (
                        <input
                          type="text"
                          value={newClassNameInput}
                          onChange={(e) => setNewClassNameInput(e.target.value)}
                          placeholder="Nhập tên lớp mới (VD: Lớp 11A2)..."
                          className="mt-2 w-full border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>

            {fileName ? (
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Tệp đã chọn: <span className="text-emerald-700 font-mono">{fileName}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Bấm vào đây nếu bạn muốn chọn một tệp khác
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Kéo thả file Excel vào đây hoặc <span className="text-emerald-600 underline">bấm để chọn file</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Hỗ trợ định dạng .xlsx, .xls, .csv (Tự động nhận diện tiêu đề tiếng Việt có dấu hoặc không dấu)
                </p>
              </div>
            )}
          </div>

          {/* Preview Table Section */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-800">
                    Bảng xem trước dữ liệu ({parsedRows.length} dòng)
                  </h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {validCount} hợp lệ
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {invalidCount} thiếu thông tin
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setParsedRows([])}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Xóa kết quả đọc file
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3">Mã HS</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3">Lớp</th>
                      <th className="py-2.5 px-3">SĐT học sinh</th>
                      <th className="py-2.5 px-3">SĐT phụ huynh</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3 text-right">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={`hover:bg-slate-50 ${!row.isValid ? 'bg-amber-50/40' : ''}`}>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{row.stt || idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{row.studentId}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.name || <span className="text-rose-500 italic">Trống</span>}</td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {defaultClassMode === 'fixed_class'
                            ? (selectedFixedClassId === '__NEW__' ? (newClassNameInput || 'Lớp mới') : (classes.find(c => c.id === selectedFixedClassId)?.name || 'Lớp chỉ định'))
                            : row.className}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono">{row.phone || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.parentPhone || '-'}</td>
                        <td className="py-2.5 px-3">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Hợp lệ</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60" title={row.validationError}>
                              <AlertCircle className="w-3 h-3" />
                              <span>{row.validationError}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleRemoveRow(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Xóa dòng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Mỗi học sinh sau khi nhập sẽ được cấp mã định danh để nộp bài và nhận bài qua hệ thống.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={validCount === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                validCount === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận nhập ({validCount} học sinh)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
