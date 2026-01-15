'use client';

import { MdChevronLeft, MdChevronRight, MdToday, MdRefresh } from 'react-icons/md';
import { format, startOfWeek, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewType = 'week' | 'month';

interface CalendarHeaderProps {
  currentDate: Date;
  viewType: ViewType;
  onViewTypeChange: (view: ViewType) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function CalendarHeader({
  currentDate,
  viewType,
  onViewTypeChange,
  onPrevious,
  onNext,
  onToday,
  onRefresh,
  loading = false
}: CalendarHeaderProps) {
  const formatTitle = () => {
    if (viewType === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      return format(weekStart, "MMMM 'de' yyyy", { locale: ptBR });
    }
    return format(startOfMonth(currentDate), "MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
      {/* Left: Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToday}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Hoje
        </button>
        
        <div className="flex items-center">
          <button
            onClick={onPrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={viewType === 'week' ? 'Semana anterior' : 'Mês anterior'}
          >
            <MdChevronLeft className="text-2xl text-gray-600" />
          </button>
          
          <button
            onClick={onNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={viewType === 'week' ? 'Próxima semana' : 'Próximo mês'}
          >
            <MdChevronRight className="text-2xl text-gray-600" />
          </button>
        </div>
        
        <h2 className="text-lg font-semibold text-gray-900 capitalize min-w-[180px]">
          {formatTitle()}
        </h2>
      </div>
      
      {/* Right: View selector and refresh */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewTypeChange('week')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewType === 'week'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => onViewTypeChange('month')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewType === 'month'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mês
          </button>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Atualizar"
        >
          <MdRefresh className={`text-xl text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
