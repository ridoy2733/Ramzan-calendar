import { AppSettings, TrackerData } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

const SETTINGS_KEY = 'ramadan_pro_settings';
const TRACKER_KEY = 'ramadan_pro_tracker';

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
};

export const saveTracker = (data: TrackerData[]) => {
  localStorage.setItem(TRACKER_KEY, JSON.stringify(data));
};

export const getTracker = (): TrackerData[] => {
  const data = localStorage.getItem(TRACKER_KEY);
  return data ? JSON.parse(data) : [];
};
