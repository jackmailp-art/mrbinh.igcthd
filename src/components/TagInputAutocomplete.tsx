import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, ChevronDown, Check, Sparkles } from 'lucide-react';

interface TagInputAutocompleteProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  label?: string;
  badgeColor?: 'blue' | 'purple' | 'indigo' | 'emerald' | 'amber' | 'teal' | 'cyan';
  maxTags?: number;
  singleSelect?: boolean;
  popularSuggestions?: string[];
  helperText?: string;
}

const COLOR_MAP = {
  blue: {
    tagBg: 'bg-blue-50 text-blue-800 border-blue-200',
    tagHover: 'hover:bg-blue-100 text-blue-600',
    focusRing: 'focus-within:ring-blue-500 focus-within:border-blue-500',
    btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    pillQuick: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
  },
  purple: {
    tagBg: 'bg-purple-50 text-purple-800 border-purple-200',
    tagHover: 'hover:bg-purple-100 text-purple-600',
    focusRing: 'focus-within:ring-purple-500 focus-within:border-purple-500',
    btnBg: 'bg-purple-600 hover:bg-purple-700 text-white',
    pillQuick: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200',
  },
  indigo: {
    tagBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    tagHover: 'hover:bg-indigo-100 text-indigo-600',
    focusRing: 'focus-within:ring-indigo-500 focus-within:border-indigo-500',
    btnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    pillQuick: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  emerald: {
    tagBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    tagHover: 'hover:bg-emerald-100 text-emerald-600',
    focusRing: 'focus-within:ring-emerald-500 focus-within:border-emerald-500',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    pillQuick: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  amber: {
    tagBg: 'bg-amber-50 text-amber-900 border-amber-200',
    tagHover: 'hover:bg-amber-100 text-amber-700',
    focusRing: 'focus-within:ring-amber-500 focus-within:border-amber-500',
    btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    pillQuick: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200',
  },
  teal: {
    tagBg: 'bg-teal-50 text-teal-800 border-teal-200',
    tagHover: 'hover:bg-teal-100 text-teal-600',
    focusRing: 'focus-within:ring-teal-500 focus-within:border-teal-500',
    btnBg: 'bg-teal-600 hover:bg-teal-700 text-white',
    pillQuick: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200',
  },
  cyan: {
    tagBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    tagHover: 'hover:bg-cyan-100 text-cyan-600',
    focusRing: 'focus-within:ring-cyan-500 focus-within:border-cyan-500',
    btnBg: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    pillQuick: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200',
  },
};

export const TagInputAutocomplete: React.FC<TagInputAutocompleteProps> = ({
  tags,
  onChange,
  suggestions,
  placeholder = 'Nhập hoặc chọn gợi ý...',
  label,
  badgeColor = 'blue',
  maxTags = 10,
  singleSelect = false,
  popularSuggestions,
  helperText,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const colors = COLOR_MAP[badgeColor] || COLOR_MAP.blue;

  // Filter suggestions matching the typed input and not already added
  const filteredSuggestions = suggestions.filter((item) => {
    const isAlreadySelected = tags.some((t) => t.toLowerCase() === item.toLowerCase());
    if (isAlreadySelected) return false;
    if (!inputValue.trim()) return true;
    return item.toLowerCase().includes(inputValue.toLowerCase().trim());
  });

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;

    if (singleSelect) {
      onChange([trimmed]);
      setInputValue('');
      setIsOpen(false);
      return;
    }

    if (tags.length >= maxTags) return;
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;

    onChange([...tags, trimmed]);
    setInputValue('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleRemoveTag = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(0);
      } else {
        setActiveIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(filteredSuggestions.length - 1);
      } else {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
        handleAddTag(filteredSuggestions[activeIndex]);
      } else if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      handleRemoveTag(tags.length - 1);
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick suggestions list: items from popularSuggestions or top suggestions not yet picked
  const quickList = (popularSuggestions || suggestions).filter(
    (item) => !tags.some((t) => t.toLowerCase() === item.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="space-y-1.5 w-full text-xs" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-800 flex items-center gap-1.5">
            <span>{label}</span>
            {tags.length > 0 && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                {tags.length}{singleSelect ? '' : `/${maxTags}`}
              </span>
            )}
          </label>
          {tags.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold transition"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      )}

      {/* Main Tag Box + Input */}
      <div
        className={`min-h-[38px] p-1.5 border border-slate-300 rounded-xl bg-white flex flex-wrap items-center gap-1.5 transition-all shadow-2xs relative ${colors.focusRing}`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Rendered Tags */}
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border shadow-2xs animate-in fade-in zoom-in-95 duration-150 ${colors.tagBg}`}
          >
            <span className="truncate max-w-[200px]">{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(idx);
              }}
              className={`hover:opacity-100 opacity-60 rounded-full p-0.5 transition cursor-pointer ${colors.tagHover}`}
              title="Xóa thẻ này"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input */}
        <div className="flex-1 min-w-[120px] flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : (tags.length < maxTags ? '+ Thêm...' : '')}
            disabled={tags.length >= maxTags && !singleSelect}
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none py-0.5 px-1 font-medium"
          />
        </div>

        {/* Add button or dropdown indicator */}
        <div className="flex items-center gap-1 shrink-0">
          {inputValue.trim() && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAddTag(inputValue);
              }}
              className={`p-1 rounded-md text-xs font-bold transition flex items-center gap-0.5 ${colors.btnBg}`}
              title="Thêm mục này"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 scrollbar-thin">
            {filteredSuggestions.length > 0 ? (
              <div className="space-y-0.5">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Gợi ý chuẩn chương trình GDPT 2018</span>
                  </span>
                  <span>Nhấp hoặc bấm Enter</span>
                </div>
                {filteredSuggestions.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTag(item);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-900 font-bold'
                          : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span className="truncate">{item}</span>
                      <Plus className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-slate-500">
                {inputValue.trim() ? (
                  <button
                    type="button"
                    onClick={() => handleAddTag(inputValue)}
                    className="text-blue-600 hover:underline font-bold flex items-center justify-center gap-1 mx-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm thẻ mới: "{inputValue}"</span>
                  </button>
                ) : (
                  <span>Đã chọn tất cả gợi ý có sẵn.</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Click Recommendation Pills */}
      {quickList.length > 0 && tags.length < maxTags && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
            <span>Chọn nhanh:</span>
          </span>
          {quickList.map((rec, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAddTag(rec)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition cursor-pointer truncate max-w-[210px] ${colors.pillQuick}`}
              title={`Thêm ${rec}`}
            >
              + {rec}
            </button>
          ))}
        </div>
      )}

      {helperText && (
        <p className="text-[10px] text-slate-500 leading-snug">{helperText}</p>
      )}
    </div>
  );
};
