export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface District {
  name: string;
  lat: number;
  lng: number;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface HijriDate {
  date: string;
  month: {
    number: number;
    en: string;
    ar: string;
  };
  day: string;
  year: string;
}

export interface GregorianDate {
  date: string;
  day: string;
  weekday: { en: string };
  month: { number: number; en: string };
  year: string;
}

export interface PrayerData {
  timings: PrayerTimes;
  date: {
    readable: string;
    hijri: HijriDate;
    gregorian: GregorianDate;
  };
}

export interface AppSettings {
  location: Coordinates;
  locationName: string;
  notifications: Record<string, boolean>; // 'Fajr': true
  notificationOffset: number; // 0, 5, 10 mins
  isRamadanOverride: boolean;
}

export interface TrackerData {
  date: string;
  roza: boolean;
  taraweeh: boolean;
}