import React from 'react';

interface PrayerCardProps {
  name: string;
  time: string;
  isNext: boolean;
  isCurrent: boolean;
  isActive: boolean; // For alarm toggle
  onToggleAlarm?: () => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({ name, time, isNext, isCurrent, isActive, onToggleAlarm }) => {
  // Convert 24h string to 12h
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  return (
    <div className={`
      relative overflow-hidden rounded-xl p-4 transition-all duration-300
      ${isNext ? 'bg-gold-500 text-navy-900 shadow-lg scale-105 z-10' : 'glass hover:bg-slate-800/50'}
      ${isCurrent ? 'border-2 border-gold-500' : 'border-transparent'}
    `}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className={`font-bold text-lg ${isNext ? 'text-navy-900' : 'text-gray-100'}`}>{name}</h3>
          <p className={`text-xl font-mono ${isNext ? 'text-navy-950 font-bold' : 'text-gold-400'}`}>
            {formatTime(time)}
          </p>
        </div>
        
        {onToggleAlarm && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleAlarm();
            }}
            className={`p-2 rounded-full ${isActive ? (isNext ? 'bg-navy-900/20 text-navy-900' : 'bg-gold-500/20 text-gold-400') : 'opacity-30'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
