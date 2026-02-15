import React, { useState } from 'react';
import { ADMIN_PASSWORD } from '../constants';

interface MoonSightingProps {
  isOpen: boolean;
  onClose: () => void;
  isOverrideEnabled: boolean;
  onToggleOverride: (val: boolean) => void;
}

export const MoonSighting: React.FC<MoonSightingProps> = ({ isOpen, onClose, isOverrideEnabled, onToggleOverride }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid Access Code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-sm p-6 rounded-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        
        <h2 className="text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          Moon Sighting Admin
        </h2>

        {!isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">Enter authorized code to access sighting override.</p>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-gold-500 outline-none"
              placeholder="Enter Code"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button 
              onClick={handleLogin}
              className="w-full bg-gold-600 hover:bg-gold-500 text-white font-bold py-2 rounded-lg transition"
            >
              Verify
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700">
              <span className="text-gray-200 text-sm">Force Ramadan Mode</span>
              <button 
                onClick={() => onToggleOverride(!isOverrideEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOverrideEnabled ? 'bg-gold-500' : 'bg-slate-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isOverrideEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-xs text-center text-gray-400">
              Enabling this will override automatic API detection and set the app to Ramadan mode globally for this device.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
