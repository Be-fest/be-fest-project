import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCalendarToday, MdChevronLeft, MdChevronRight } from 'react-icons/md';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

interface PremiumDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function PremiumDatePicker({ value, onChange, error, disabled }: PremiumDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const initialDate = value ? new Date(value + 'T12:00:00') : new Date();
  
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const selectDate = (day: number) => {
    const y = currentYear;
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const displayValue = value ? (() => {
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  })() : '';

  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border rounded-lg focus-within:ring-2 focus-within:ring-[#A502CA] outline-none flex items-center justify-between cursor-pointer transition-all duration-300
          ${error ? 'border-red-500 bg-red-50/50' : 'border-gray-200 bg-white hover:border-[#A502CA]/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className={displayValue ? 'text-gray-800 font-medium' : 'text-gray-400'}>
          {displayValue || 'Selecione a data'}
        </span>
        <MdCalendarToday className={`text-xl ${isOpen ? 'text-[#A502CA]' : 'text-gray-400'} transition-colors`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 mt-2 p-4 bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl w-80"
            style={{
              boxShadow: '0 20px 40px -10px rgba(165, 2, 202, 0.15)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={prevMonth}
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-[#A502CA]"
              >
                <MdChevronLeft size={24} />
              </button>
              <h3 className="font-semibold text-gray-800 text-lg">
                {monthNames[currentMonth]} <span className="text-[#A502CA]">{currentYear}</span>
              </h3>
              <button 
                onClick={nextMonth}
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-[#A502CA]"
              >
                <MdChevronRight size={24} />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = value && value === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = currentYear === todayY && currentMonth === todayM && day === todayD;
                
                const dateObj = new Date(currentYear, currentMonth, day);
                const isPast = dateObj < new Date(todayY, todayM, todayD);

                return (
                  <motion.button
                    whileHover={!isPast ? { scale: 1.1 } : {}}
                    whileTap={!isPast ? { scale: 0.9 } : {}}
                    key={day}
                    onClick={() => !isPast && selectDate(day)}
                    disabled={isPast}
                    type="button"
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                      ${isSelected ? 'bg-gradient-to-r from-[#A502CA] to-[#8B0A9E] text-white shadow-md shadow-[#A502CA]/30' : 
                        isToday ? 'bg-purple-100 text-[#A502CA] border border-purple-200' : 
                        isPast ? 'text-gray-300 cursor-not-allowed' :
                        'text-gray-700 hover:bg-purple-50 hover:text-[#A502CA]'
                      }
                    `}
                  >
                    {day}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
