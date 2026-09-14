import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, CheckCircle, Ban } from 'lucide-react';

interface AppointmentCalendarPickerProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  bookedSlots: string[]; // e.g. ['09:00 AM', '02:00 PM']
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
  isLoadingSlots?: boolean;
}

const AVAILABLE_TIME_SLOTS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
];

export const AppointmentCalendarPicker: React.FC<AppointmentCalendarPickerProps> = ({
  selectedDate,
  selectedTime,
  bookedSlots,
  onSelectDate,
  onSelectTime,
  isLoadingSlots = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Month navigation
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Calculate starting offset (Monday = 0)
  const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; 
  const totalDays = lastDayOfMonth.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  return (
    <div className="space-y-4">
      {/* Clinic Operating Hours Info Banner */}
      <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl flex items-center justify-between text-xs font-semibold text-teal-900 dark:text-teal-300">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
          <span>Doctor Schedule: <strong>Mon - Fri (8:00 AM - 5:00 PM)</strong></span>
        </div>
        <span className="text-[11px] bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-md font-bold text-teal-800 dark:text-teal-200">
          Weekends Closed
        </span>
      </div>

      {/* Calendar Header & Controls */}
      <div className="bg-slate-50 dark:bg-slate-900/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            {monthNames[month]} {year}
          </h4>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          {daysOfWeek.map((day, idx) => (
            <div key={day} className={idx >= 5 ? 'text-rose-600 dark:text-rose-400' : ''}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {/* Empty padding slots before first day */}
          {Array.from({ length: startDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const dateObj = new Date(year, month, dayNum);
            dateObj.setHours(0, 0, 0, 0);

            const isPast = dateObj < today;
            const dayOfWeek = dateObj.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
            const isDisabled = isPast || isWeekend;
            const isSelected = isSameDay(selectedDate, dateObj);

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) onSelectDate(dateObj);
                }}
                className={`h-9 w-full rounded-xl transition duration-150 flex flex-col items-center justify-center font-extrabold ${
                  isDisabled
                    ? 'opacity-30 cursor-not-allowed pointer-events-none bg-slate-200/50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600'
                    : isSelected
                    ? 'bg-teal-700 text-white font-black shadow-md border-2 border-teal-800 scale-105'
                    : 'bg-white dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-900/40 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 cursor-pointer'
                }`}
                title={
                  isWeekend
                    ? 'Clinic Closed on Weekends'
                    : isPast
                    ? 'Past Date'
                    : `Select ${monthNames[month]} ${dayNum}`
                }
              >
                <span>{dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Available Time Slots Section */}
      {selectedDate ? (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              Available Doctor Time Slots for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </label>
            {isLoadingSlots && (
              <span className="text-[11px] text-teal-700 dark:text-teal-400 animate-pulse font-bold">
                Checking availability...
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AVAILABLE_TIME_SLOTS.map((slot) => {
              const isBooked = bookedSlots.includes(slot);
              const isSelected = selectedTime === slot;

              return (
                <button
                  key={slot}
                  type="button"
                  disabled={isBooked || isLoadingSlots}
                  onClick={() => {
                    if (!isBooked) onSelectTime(slot);
                  }}
                  className={`p-2.5 rounded-xl text-xs transition duration-150 flex flex-col items-center justify-center gap-1 ${
                    isBooked
                      ? 'opacity-35 cursor-not-allowed pointer-events-none bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 line-through'
                      : isSelected
                      ? 'bg-teal-700 text-white font-black border-2 border-teal-800 shadow-md ring-2 ring-teal-600/50 scale-105'
                      : 'bg-white dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-extrabold cursor-pointer'
                  }`}
                >
                  <span className="font-extrabold">{slot}</span>
                  <span className="text-[10px] font-bold">
                    {isBooked ? (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                        <Ban className="w-3 h-3 inline" /> Booked
                      </span>
                    ) : isSelected ? (
                      <span className="text-teal-100 flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3 inline" /> Selected
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        Available
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-semibold">
          👆 Please click an available weekday on the calendar above to view open time slots.
        </div>
      )}
    </div>
  );
};
