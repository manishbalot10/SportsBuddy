export type SportType = 
  | 'Cricket' | 'Football' | 'Hockey' | 'Badminton' | 'Tennis' | 'Table Tennis'
  | 'Kabaddi' | 'Wrestling' | 'Boxing' | 'Shooting' | 'Archery' | 'Athletics'
  | 'Swimming' | 'Volleyball' | 'Basketball' | 'Chess' | 'Carrom' | 'Kho Kho'
  | 'Squash' | 'Golf' | 'Cycling' | 'Weightlifting' | 'Gymnastics' | 'Martial Arts'
  | 'Yoga' | 'Running' | 'Marathon' | 'Throwball' | 'Handball' | 'Baseball'
  | 'Gym' | 'Padel';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';

// Expertise levels: 1=Beginner, 2=Learner, 3=Intermediate, 4=Advanced, 5=Expert
export type ExpertiseLevel = 1 | 2 | 3 | 4 | 5;

export interface PrimarySport {
  sport: SportType;
  level: ExpertiseLevel; // 1-5 rating dots
}

export interface Player {
  id: number;
  name: string;
  // Primary sports (up to 2) - shown with rating dots
  primarySports: PrimarySport[];
  // Secondary sports (max 3) - shown as text tags
  secondarySports?: SportType[];
  // Legacy fields for backward compatibility
  sport: SportType;
  level: SkillLevel;
  city: string;
  latitude: number;
  longitude: number;
  avatar: string;
  distance_km?: number;
  is_new?: boolean;
  role?: 'player' | 'coach';
  profileUrl?: string; // Dynamic URL for player profile/connect
  deepLink?: string; // Deep link for app navigation
}

export interface FilterState {
  sport: SportType | 'All';
  levels: Record<SkillLevel, boolean>;
  maxDistance: number; // in km
  userType?: 'all' | 'players' | 'coaches';
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface Coach {
  id: number;
  name: string;
  sport: SportType;
  specialization: string;
  experience_years: number;
  certifications: string[];
  city: string;
  latitude: number;
  longitude: number;
  avatar: string;
  hourly_rate?: number;
  rating?: number;
  students_trained?: number;
  distance_km?: number;
}