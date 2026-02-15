import { District } from './types';

export const BD_DISTRICTS: District[] = [
  { name: "Dhaka", lat: 23.8103, lng: 90.4125 },
  { name: "Chittagong", lat: 22.3569, lng: 91.7832 },
  { name: "Sylhet", lat: 24.8949, lng: 91.8687 },
  { name: "Rajshahi", lat: 24.3636, lng: 88.6241 },
  { name: "Khulna", lat: 22.8456, lng: 89.5403 },
  { name: "Barisal", lat: 22.7010, lng: 90.3535 },
  { name: "Rangpur", lat: 25.7439, lng: 89.2752 },
  { name: "Mymensingh", lat: 24.7471, lng: 90.4203 },
  { name: "Comilla", lat: 23.4607, lng: 91.1809 },
  { name: "Narayanganj", lat: 23.6238, lng: 90.5000 },
];

export const ADMIN_PASSWORD = "786786";

export const DEFAULT_SETTINGS = {
  location: { latitude: 23.8103, longitude: 90.4125 }, // Default Dhaka
  locationName: "Dhaka",
  notifications: {
    Fajr: true,
    Sunrise: false,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
  notificationOffset: 0,
  isRamadanOverride: false,
};

export const DUAS = [
  {
    title: "Sehri Dua",
    arabic: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
    transliteration: "Wa bisawmi ghadin nawaiytu min shahri ramadan",
    meaning: "I intend to keep the fast for tomorrow in the month of Ramadan."
  },
  {
    title: "Iftar Dua",
    arabic: "اللَّهُمَّ اِنِّى لَكَ صُمْتُ وَبِكَ امنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ اَفْطَرْتُ",
    transliteration: "Allahumma inni laka sumtu wa bika aamantu wa 'alayka tawakkaltu wa 'ala rizq-ika -aftartu",
    meaning: "O Allah! I fasted for You and I believe in You and I put my trust in You and I break my fast with Your sustenance."
  }
];
