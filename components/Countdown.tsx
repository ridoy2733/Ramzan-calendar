import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetTime: Date | null;
  label: string;
}

export const Countdown: React.FC<CountdownProps> = ({ targetTime, label }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        // Ideally trigger a refresh callback here
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  if (!targetTime) return null;

  return (
    <div className="text-center py-6">
      <p className="text-gold-400 text-sm uppercase tracking-widest mb-1">{label}</p>
      <h2 className="text-5xl font-bold font-mono text-white tracking-wider tabular-nums drop-shadow-lg">
        {timeLeft}
      </h2>
    </div>
  );
};
