import React, { useEffect, useState } from 'react';
import { fetchMonthlyCalendar } from '../services/api';
import { Coordinates, PrayerData } from '../types';

interface RamadanCalendarProps {
  location: Coordinates;
}

export const RamadanCalendar: React.FC<RamadanCalendarProps> = ({ location }) => {
  const [ramadanDays, setRamadanDays] = useState<PrayerData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Configuration: Start Feb 19th
  const START_DATE_DAY = 19;
  const START_DATE_MONTH = 2; // February
  const TOTAL_DAYS = 30;

  useEffect(() => {
    loadRamadanSchedule();
  }, [location]);

  const loadRamadanSchedule = async () => {
    setLoading(true);
    const year = new Date().getFullYear();

    // Fetch Start Month and Next Month to cover the range
    // Feb (2) and March (3)
    const [month1Data, month2Data] = await Promise.all([
      fetchMonthlyCalendar(location, START_DATE_MONTH, year),
      fetchMonthlyCalendar(location, START_DATE_MONTH + 1, year)
    ]);

    const allData = [...month1Data, ...month2Data];

    // Filter starting from start date
    const startIndex = allData.findIndex(d => {
      const day = parseInt(d.date.gregorian.day);
      const month = d.date.gregorian.month.number;
      return month === START_DATE_MONTH && day === START_DATE_DAY;
    });

    if (startIndex !== -1) {
      // Slice exactly 30 days
      const schedule = allData.slice(startIndex, startIndex + TOTAL_DAYS);
      setRamadanDays(schedule);
    } else {
      setRamadanDays([]);
    }

    setLoading(false);
  };

  const formatTime = (timeStr: string, offsetMinutes = 0) => {
    const cleanTime = timeStr.split(' ')[0]; 
    const [h, m] = cleanTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + offsetMinutes);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const isToday = (dateStr: string) => {
    const d = new Date();
    // API date format DD-MM-YYYY
    const todayStr = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
    return dateStr === todayStr;
  };

  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-4 animate-fade-in pb-20">
      <div className="px-2 pt-2">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-200">
          Ramadan Schedule
        </h2>
        <p className="text-sm text-gray-400 font-light flex items-center gap-2 mt-1">
          <span className="bg-gold-500/10 text-gold-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-gold-500/20">
            {TOTAL_DAYS} Days
          </span>
          <span>Starting {monthNames[START_DATE_MONTH]} {START_DATE_DAY}</span>
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-12 h-12 border-[3px] border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-950/50 text-gray-400 uppercase text-[9px] tracking-[0.15em]">
                <tr>
                  <th className="py-4 px-3 font-semibold text-center w-16">Day</th>
                  <th className="py-4 px-3 font-semibold">Date</th>
                  <th className="py-4 px-3 font-semibold text-center text-rose-300/90">Sehri End</th>
                  <th className="py-4 px-3 font-semibold text-center text-emerald-300/90">Iftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ramadanDays.map((day, idx) => {
                  const today = isToday(day.date.gregorian.date);
                  const isFriday = day.date.gregorian.weekday.en === "Friday";
                  
                  return (
                    <tr 
                      key={idx} 
                      className={`
                        transition-all duration-300
                        ${today ? 'bg-gradient-to-r from-gold-500/20 to-transparent border-l-4 border-gold-500' : 'hover:bg-white/5 border-l-4 border-transparent'}
                      `}
                    >
                      <td className="py-3 px-3 text-center">
                        <div className={`font-bold text-lg font-arabic ${today ? 'text-gold-400' : 'text-gray-500'}`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className={`font-medium text-sm ${today ? 'text-white' : 'text-gray-300'}`}>
                          {day.date.gregorian.day} {day.date.gregorian.month.en.slice(0,3)}
                        </div>
                        <div className={`text-[10px] uppercase tracking-wider font-semibold mt-0.5 ${isFriday ? 'text-gold-500' : 'text-gray-600'}`}>
                          {day.date.gregorian.weekday.en.slice(0,3)}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center bg-rose-500/5">
                        <div className="font-mono font-bold text-white text-base">
                          {formatTime(day.timings.Fajr, -5)}
                        </div>
                        <div className="text-[9px] text-rose-300/50 font-medium">Last Time</div>
                      </td>
                      <td className="py-3 px-3 text-center bg-emerald-500/5">
                        <div className="font-mono font-bold text-gold-400 text-base">
                          {formatTime(day.timings.Maghrib)}
                        </div>
                        <div className="text-[9px] text-emerald-300/50 font-medium">Start Time</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="glass p-4 rounded-xl mx-2 text-[11px] text-gray-400 flex flex-col gap-2 border border-white/5">
        <div className="flex items-start gap-2">
          <div className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0"></div>
          <p><strong className="text-rose-200">Sehri End:</strong> Maximum time to stop eating (Safely calculated as 5 mins before Fajr).</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
          <p><strong className="text-emerald-200">Iftar:</strong> Start eating immediately at this time (Maghrib).</p>
        </div>
      </div>
    </div>
  );
};