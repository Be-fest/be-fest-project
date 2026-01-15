'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AgendaEvent } from '@/lib/actions/agenda';
import { EventPill } from './EventPill';

type ViewType = 'week' | 'month';

interface CalendarGridProps {
    currentDate: Date;
    viewType: ViewType;
    events: AgendaEvent[];
    onEventClick: (event: AgendaEvent) => void;
    onDayClick?: (date: Date) => void;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarGrid({
    currentDate,
    viewType,
    events,
    onEventClick,
    onDayClick
}: CalendarGridProps) {
    // Calculate days to display based on view type
    const days = useMemo(() => {
        if (viewType === 'week') {
            const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
            const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
            return eachDayOfInterval({ start: weekStart, end: weekEnd });
        } else {
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(currentDate);
            // Include days from previous/next month to fill the calendar grid
            const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
            const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
            return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
        }
    }, [currentDate, viewType]);

    // Group events by date
    const eventsByDate = useMemo(() => {
        const grouped: Record<string, AgendaEvent[]> = {};
        events.forEach((event) => {
            const dateKey = event.event_date;
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(event);
        });
        return grouped;
    }, [events]);

    // Calculate number of weeks for grid
    const weeks = useMemo(() => {
        const result: Date[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            result.push(days.slice(i, i + 7));
        }
        return result;
    }, [days]);

    const isWeekView = viewType === 'week';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
            {/* Header with weekday names */}
            <div className="grid grid-cols-7 border-b border-gray-200">
                {WEEKDAYS.map((day, index) => (
                    <div
                        key={day}
                        className={`
              py-3 text-center text-sm font-semibold
              ${index === 0 || index === 6 ? 'text-gray-400' : 'text-gray-700'}
              ${index < 6 ? 'border-r border-gray-200' : ''}
            `}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="divide-y divide-gray-200">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 divide-x divide-gray-200">
                        {week.map((day, dayIndex) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const dayEvents = eventsByDate[dateKey] || [];
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const isDayToday = isToday(day);
                            const isWeekend = dayIndex === 0 || dayIndex === 6;

                            return (
                                <div
                                    key={dateKey}
                                    onClick={() => onDayClick?.(day)}
                                    className={`
                    ${isWeekView ? 'min-h-[180px]' : 'min-h-[120px]'}
                    p-2 transition-colors cursor-pointer hover:bg-gray-50
                    ${!isCurrentMonth && !isWeekView ? 'bg-gray-50' : ''}
                    ${isWeekend ? 'bg-gray-50/50' : ''}
                  `}
                                >
                                    {/* Day number */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span
                                            className={`
                        inline-flex items-center justify-center w-8 h-8 text-sm font-medium rounded-full
                        ${isDayToday
                                                    ? 'bg-purple-600 text-white'
                                                    : isCurrentMonth || isWeekView
                                                        ? 'text-gray-900 hover:bg-gray-100'
                                                        : 'text-gray-400'
                                                }
                      `}
                                        >
                                            {format(day, 'd')}
                                        </span>
                                        {dayEvents.length > 3 && !isWeekView && (
                                            <span className="text-xs text-gray-500">
                                                +{dayEvents.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    {/* Events */}
                                    <div className="space-y-1">
                                        {dayEvents
                                            .slice(0, isWeekView ? undefined : 3)
                                            .map((event) => (
                                                <EventPill
                                                    key={event.id}
                                                    event={event}
                                                    onClick={() => onEventClick(event)}
                                                    compact={!isWeekView}
                                                />
                                            ))}

                                        {/* Show more indicator for week view */}
                                        {isWeekView && dayEvents.length === 0 && (
                                            <div className="text-xs text-gray-400 text-center py-4">
                                                Sem eventos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
