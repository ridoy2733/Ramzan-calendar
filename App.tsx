import React, { useState, useEffect, useRef } from 'react';
import { BD_DISTRICTS, DEFAULT_SETTINGS, DUAS } from './constants';
import { getSettings, saveSettings } from './services/storage';
import { fetchPrayerTimes } from './services/api';
import { AppSettings, PrayerData } from './types';
import { PrayerCard } from './components/PrayerCard';
import { Countdown } from './components/Countdown';
import { MoonSighting } from './components/MoonSighting';
import { Tracker } from './components/Tracker';
import { RamadanCalendar } from './components/RamadanCalendar';

// Define prayer order for calculation
const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string, time: Date } | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'calendar' | 'tracker' | 'settings'>('home');
  const [showAdmin, setShowAdmin] = useState(false);

  // Load Settings & Request Location on Mount
  useEffect(() => {
    const saved = getSettings();
    setSettings(saved);

    // Request Notification Permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (saved.location.latitude === DEFAULT_SETTINGS.location.latitude) {
      // Try Auto Location
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newSettings = {
            ...saved,
            location: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            },
            locationName: "My Location"
          };
          setSettings(newSettings);
          saveSettings(newSettings);
          loadData(newSettings.location);
        },
        (err) => {
          console.warn("Location denied, using default");
          loadData(saved.location);
        }
      );
    } else {
      loadData(saved.location);
    }

    // Refresh data at midnight logic could go here
  }, []);

  const loadData = async (coords: { latitude: number, longitude: number }) => {
    setLoading(true);
    const data = await fetchPrayerTimes(coords);
    setPrayerData(data);
    setLoading(false);
  };

  // Timer Logic
  useEffect(() => {
    if (!prayerData) return;
    
    const interval = setInterval(() => {
      calculateTimes(prayerData);
    }, 1000);
    
    calculateTimes(prayerData); // Initial call

    return () => clearInterval(interval);
  }, [prayerData]);

  const calculateTimes = (data: PrayerData) => {
    const now = new Date();
    const timings = data.timings;
    
    // Create Date objects for today's prayers
    const prayerTimesList = PRAYER_ORDER.map(name => {
      const timeStr = timings[name];
      const [h, m] = timeStr.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return { name, time: d };
    });

    // Find next prayer
    let next = prayerTimesList.find(p => p.time > now);
    let current = 'Isha'; // Default if after Isha

    if (next) {
      setNextPrayer(next);
      const idx = prayerTimesList.indexOf(next);
      if (idx > 0) current = prayerTimesList[idx - 1].name;
    } else {
      // Next is Fajr tomorrow
      const fTimeStr = timings['Fajr'];
      const [h, m] = fTimeStr.split(':').map(Number);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(h, m, 0, 0);
      setNextPrayer({ name: 'Fajr', time: tomorrow });
      current = 'Isha';
    }

    setCurrentPrayer(current);

    // Check Alarm
    checkAlarm(next, settings);
  };

  const lastAlertRef = useRef<string>('');

  const checkAlarm = (next: { name: string, time: Date } | undefined, appSettings: AppSettings) => {
    if (!next) return;
    if (!appSettings.notifications[next.name]) return;

    const now = new Date();
    const diffMins = (next.time.getTime() - now.getTime()) / 1000 / 60;
    
    // Alert logic based on offset (e.g. at time, or 5 mins before)
    // Simple implementation: Alert exactly when time matches offset
    const offset = appSettings.notificationOffset;
    
    if (diffMins <= offset && diffMins > offset - 1) {
      const alertKey = `${next.name}-${now.getDate()}-${now.getHours()}:${now.getMinutes()}`;
      if (lastAlertRef.current !== alertKey) {
        new Notification(`Time for ${next.name}`, {
          body: `It is almost time for ${next.name} prayer.`,
          icon: '/icon.png'
        });
        lastAlertRef.current = alertKey;
      }
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dist = BD_DISTRICTS.find(d => d.name === e.target.value);
    if (dist) {
      const newSettings = {
        ...settings,
        locationName: dist.name,
        location: { latitude: dist.lat, longitude: dist.lng }
      };
      setSettings(newSettings);
      saveSettings(newSettings);
      loadData(newSettings.location);
    }
  };

  const toggleAlarm = (prayer: string) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [prayer]: !settings.notifications[prayer]
      }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Determine if it is Ramadan
  // Hijri Month 9 is Ramadan. Or manual override.
  const isRamadan = settings.isRamadanOverride || (prayerData?.date.hijri.month.number === 9);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate Sehri (Fajr - 10m) and Iftar (Maghrib)
  const getSehriTime = () => {
    if (!prayerData) return null;
    const fStr = prayerData.timings.Fajr;
    const [h, m] = fStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m - 10, 0, 0);
    return d;
  };

  const getIftarTime = () => {
    if (!prayerData) return null;
    const mStr = prayerData.timings.Maghrib;
    const [h, m] = mStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };
  
  const sehriTime = getSehriTime();
  const iftarTime = getIftarTime();
  const now = new Date();
  
  // Decide what to show on countdown
  // If Ramadan: Show Countdown to Sehri (if before Sehri) or Iftar (if before Iftar)
  // Else: Show Countdown to Next Prayer
  let countdownTarget = nextPrayer?.time || null;
  let countdownLabel = `Next: ${nextPrayer?.name}`;

  if (isRamadan) {
    if (sehriTime && now < sehriTime) {
      countdownTarget = sehriTime;
      countdownLabel = "Time Left for Sehri";
    } else if (iftarTime && now < iftarTime && (!sehriTime || now > sehriTime)) {
      countdownTarget = iftarTime;
      countdownLabel = "Time Left for Iftar";
    }
  }

  return (
    <div className="min-h-screen pb-20 relative bg-navy-900 text-white selection:bg-gold-500 selection:text-white">
      {/* Header */}
      <header className="relative bg-navy-800 rounded-b-[2.5rem] shadow-2xl pb-8 pt-6 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold font-arabic text-gold-400">Ramadan PRO</h1>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
              {settings.locationName}
            </p>
          </div>
          <div className="text-right">
             <div className="text-xs text-gold-500 font-bold uppercase tracking-wider bg-gold-500/10 px-2 py-1 rounded border border-gold-500/20">
               {prayerData?.date.hijri.day} {prayerData?.date.hijri.month.en} {prayerData?.date.hijri.year}
             </div>
             <div className="text-[10px] text-gray-400 mt-1">{prayerData?.date.readable}</div>
          </div>
        </div>

        <Countdown targetTime={countdownTarget} label={countdownLabel} />
      </header>

      {/* Main Content */}
      <main className="px-4 -mt-6 relative z-20 space-y-4">
        
        {view === 'home' && (
          <>
            {/* Today's Special (Sehri/Iftar Cards if Ramadan) */}
            {isRamadan && sehriTime && iftarTime && (
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="glass-card p-3 rounded-xl text-center">
                   <span className="text-xs text-gray-400 uppercase">Sehri Ends</span>
                   <div className="text-xl font-bold text-white mt-1">
                     {sehriTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </div>
                </div>
                <div className="glass-card p-3 rounded-xl text-center">
                   <span className="text-xs text-gray-400 uppercase">Iftar Time</span>
                   <div className="text-xl font-bold text-gold-400 mt-1">
                     {iftarTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </div>
                </div>
              </div>
            )}

            {/* Prayer List */}
            <div className="space-y-3 pb-4">
              {PRAYER_ORDER.map(p => (
                <PrayerCard 
                  key={p} 
                  name={p} 
                  time={prayerData?.timings[p] || ''} 
                  isNext={nextPrayer?.name === p}
                  isCurrent={currentPrayer === p}
                  isActive={settings.notifications[p]}
                  onToggleAlarm={() => toggleAlarm(p)}
                />
              ))}
            </div>

            {/* Dua Section */}
            {isRamadan && (
              <div className="glass-card p-4 rounded-xl mt-4">
                <h3 className="text-gold-500 font-bold mb-3 text-center text-sm uppercase">Daily Dua</h3>
                <div className="space-y-4">
                  {DUAS.map((dua, idx) => (
                    <div key={idx} className="border-b border-white/10 last:border-0 pb-3 last:pb-0">
                      <p className="text-xs text-gray-400 mb-1">{dua.title}</p>
                      <p className="font-arabic text-lg text-right mb-1 leading-loose">{dua.arabic}</p>
                      <p className="text-xs italic text-gray-300">{dua.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {view === 'calendar' && (
          <RamadanCalendar location={settings.location} />
        )}

        {view === 'tracker' && (
          <Tracker todayStr={prayerData?.date.readable || new Date().toDateString()} />
        )}

        {view === 'settings' && (
          <div className="space-y-6 pt-4">
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-gold-400 font-bold mb-4">Location Settings</h3>
              <select 
                value={settings.locationName} 
                onChange={handleDistrictChange}
                className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-600 focus:border-gold-500 outline-none"
              >
                <option value="My Location">Auto Detect (GPS)</option>
                {BD_DISTRICTS.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-gold-400 font-bold mb-4">Notification Settings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Alert Offset</span>
                  <select 
                    value={settings.notificationOffset}
                    onChange={(e) => {
                      const newS = { ...settings, notificationOffset: parseInt(e.target.value) };
                      setSettings(newS);
                      saveSettings(newS);
                    }}
                    className="bg-slate-800 rounded p-1 text-sm"
                  >
                    <option value="0">At time</option>
                    <option value="5">5 min before</option>
                    <option value="10">10 min before</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="text-center pt-8">
               <button 
                onClick={() => setShowAdmin(true)}
                className="text-slate-700 hover:text-slate-500 transition"
               >
                 <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
               </button>
               <p className="text-[10px] text-slate-700 mt-1">v1.0.0 PRO</p>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full glass bg-navy-900/90 border-t border-white/5 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 w-16 ${view === 'home' ? 'text-gold-400' : 'text-gray-500'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span className="text-[10px]">Home</span>
          </button>
          
          <button onClick={() => setView('calendar')} className={`flex flex-col items-center gap-1 w-16 ${view === 'calendar' ? 'text-gold-400' : 'text-gray-500'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span className="text-[10px]">Calendar</span>
          </button>

          <button onClick={() => setView('tracker')} className={`flex flex-col items-center gap-1 w-16 ${view === 'tracker' ? 'text-gold-400' : 'text-gray-500'}`}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            <span className="text-[10px]">Tracker</span>
          </button>
          <button onClick={() => setView('settings')} className={`flex flex-col items-center gap-1 w-16 ${view === 'settings' ? 'text-gold-400' : 'text-gray-500'}`}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span className="text-[10px]">Settings</span>
          </button>
        </div>
      </nav>

      {/* Admin Modal */}
      <MoonSighting 
        isOpen={showAdmin} 
        onClose={() => setShowAdmin(false)} 
        isOverrideEnabled={settings.isRamadanOverride}
        onToggleOverride={(val) => {
          const newS = { ...settings, isRamadanOverride: val };
          setSettings(newS);
          saveSettings(newS);
        }}
      />
    </div>
  );
};

export default App;