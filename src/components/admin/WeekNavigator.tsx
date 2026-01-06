'use client';

import { MdChevronLeft, MdChevronRight, MdToday } from 'react-icons/md';
import { addDays, format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeekNavigatorProps {
    currentWeekStart: Date;
    onWeekChange: (weekStart: Date) => void;
    onMonthChange?: (year: number, month: number) => void;
}

export function WeekNavigator({ currentWeekStart, onWeekChange, onMonthChange }: WeekNavigatorProps) {
    const weekEnd = addDays(currentWeekStart, 6);

    const formatWeekRange = () => {
        const startMonth = format(currentWeekStart, 'MMM', { locale: ptBR });
        const endMonth = format(weekEnd, 'MMM', { locale: ptBR });
        const startDay = format(currentWeekStart, 'd');
        const endDay = format(weekEnd, 'd');
        const year = format(currentWeekStart, 'yyyy');

        if (startMonth === endMonth) {
            return `${startDay} - ${endDay} ${startMonth} ${year}`;
        } else {
            return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
        }
    };

    const goToPreviousWeek = () => {
        onWeekChange(addDays(currentWeekStart, -7));
    };

    const goToNextWeek = () => {
        onWeekChange(addDays(currentWeekStart, 7));
    };

    const goToToday = () => {
        const today = new Date();
        const todayWeekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
        onWeekChange(todayWeekStart);
    };

    // Generate months for dropdown
    const months = [
        { value: 1, label: 'Janeiro' },
        { value: 2, label: 'Fevereiro' },
        { value: 3, label: 'Março' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Maio' },
        { value: 6, label: 'Junho' },
        { value: 7, label: 'Julho' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Setembro' },
        { value: 10, label: 'Outubro' },
        { value: 11, label: 'Novembro' },
        { value: 12, label: 'Dezembro' }
    ];

    const currentYear = currentWeekStart.getFullYear();
    const currentMonth = currentWeekStart.getMonth() + 1;

    // Generate years (current year - 1 to current year + 2)
    const thisYear = new Date().getFullYear();
    const years = [thisYear - 1, thisYear, thisYear + 1, thisYear + 2];

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const month = parseInt(e.target.value);
        if (onMonthChange) {
            onMonthChange(currentYear, month);
        } else {
            // Navigate to first week of the month
            const firstDayOfMonth = new Date(currentYear, month - 1, 1);
            const weekStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
            onWeekChange(weekStart);
        }
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = parseInt(e.target.value);
        const firstDayOfMonth = new Date(year, currentMonth - 1, 1);
        const weekStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
        onWeekChange(weekStart);
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            {/* Week navigation */}
            <div className="flex items-center gap-2">
                <button
                    onClick={goToPreviousWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Semana anterior"
                >
                    <MdChevronLeft className="text-2xl text-gray-600" />
                </button>

                <div className="min-w-[200px] text-center">
                    <span className="font-semibold text-gray-900 capitalize">
                        {formatWeekRange()}
                    </span>
                </div>

                <button
                    onClick={goToNextWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Próxima semana"
                >
                    <MdChevronRight className="text-2xl text-gray-600" />
                </button>

                <button
                    onClick={goToToday}
                    className="flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors ml-2"
                    title="Ir para hoje"
                >
                    <MdToday className="text-lg" />
                    <span className="text-sm font-medium">Hoje</span>
                </button>
            </div>

            {/* Month/Year filter */}
            <div className="flex items-center gap-2">
                <select
                    value={currentMonth}
                    onChange={handleMonthChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    {months.map((month) => (
                        <option key={month.value} value={month.value}>
                            {month.label}
                        </option>
                    ))}
                </select>

                <select
                    value={currentYear}
                    onChange={handleYearChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
