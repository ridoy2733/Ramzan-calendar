import React, { useState, useEffect } from 'react';
import { getTracker, saveTracker } from '../services/storage';
import { TrackerData, HijriDate } from '../types';

interface TrackerProps {
  todayStr: string;
}

export const Tracker: React.FC<TrackerProps> = ({ todayStr }) => {
  const [data, setData] = useState<TrackerData[]>([]);
  const [todayData, setTodayData] = useState<TrackerData>({ date: todayStr, roza: false, taraweeh: false });
  const [tasbihCount, setTasbihCount] = useState(0);

  useEffect(() => {
    const history = getTracker();
    setData(history);
    const found = history.find(d => d.date === todayStr);
    if (found) setTodayData(found);
    else setTodayData({ date: todayStr, roza: false, taraweeh: false });
  }, [todayStr]);

  const toggleStatus = (field: 'roza' | 'taraweeh') => {
    const newData = { ...todayData, [field]: !todayData[field] };
    setTodayData(newData);

    const newHistory = data.filter(d => d.date !== todayStr);
    newHistory.push(newData);
    saveTracker(newHistory);
    setData(newHistory);
  };

  const rozaCount = data.filter(d => d.roza).length + (todayData.roza && !data.find(d=>d.date===todayStr)?.roza ? 1 : 0); // rough calc fix for UI

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-gold-400 font-bold mb-4 text-center uppercase tracking-wider text-sm">Daily Tracker</h3>
        <div className="flex gap-4">
          <button 
            onClick={() => toggleStatus('roza')}
            className={`flex-1 p-4 rounded-xl border transition-all ${todayData.roza ? 'bg-gold-500 border-gold-500 text-navy-900' : 'bg-transparent border-slate-600 text-gray-400'}`}
          >
            <div className="font-bold text-lg">Roza</div>
            <div className="text-xs opacity-75">{todayData.roza ? 'Completed' : 'Mark Done'}</div>
          </button>
          <button 
            onClick={() => toggleStatus('taraweeh')}
            className={`flex-1 p-4 rounded-xl border transition-all ${todayData.taraweeh ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-transparent border-slate-600 text-gray-400'}`}
          >
            <div className="font-bold text-lg">Taraweeh</div>
            <div className="text-xs opacity-75">{todayData.taraweeh ? 'Completed' : 'Mark Done'}</div>
          </button>
        </div>
        <div className="mt-4 text-center text-xs text-gray-400">
          Total Roza: <span className="text-white font-bold">{rozaCount}</span>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 text-center">
        <h3 className="text-gold-400 font-bold mb-6 uppercase tracking-wider text-sm">Digital Tasbih</h3>
        <div 
          onClick={() => setTasbihCount(p => p + 1)}
          className="w-40 h-40 mx-auto rounded-full border-4 border-slate-700 flex items-center justify-center bg-slate-800 active:scale-95 transition-transform cursor-pointer shadow-inner shadow-black"
        >
          <span className="text-5xl font-mono font-bold text-white select-none">{tasbihCount}</span>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={() => setTasbihCount(0)} className="text-xs text-red-400 uppercase font-bold tracking-widest px-4 py-2 hover:bg-red-400/10 rounded">Reset</button>
        </div>
      </div>
    </div>
  );
};
