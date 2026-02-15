import { Coordinates, PrayerData } from '../types';

export const fetchPrayerTimes = async (coords: Coordinates): Promise<PrayerData | null> => {
  try {
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    // Method 1: University of Islamic Sciences, Karachi (Generally used for BD Hanfi)
    // School 1: Hanfi
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=1&school=1`;
    
    const response = await fetch(url);
    const json = await response.json();
    
    if (json.code === 200 && json.data) {
      return json.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch prayer times", error);
    return null;
  }
};

export const fetchMonthlyCalendar = async (coords: Coordinates, month: number, year: number): Promise<PrayerData[]> => {
  try {
    const url = `https://api.aladhan.com/v1/calendar?latitude=${coords.latitude}&longitude=${coords.longitude}&method=1&school=1&month=${month}&year=${year}`;
    const response = await fetch(url);
    const json = await response.json();
    
    if (json.code === 200 && json.data) {
      return json.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch calendar", error);
    return [];
  }
};