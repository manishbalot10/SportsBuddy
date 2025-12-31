export type SportType = 
  | 'Cricket' | 'Football' | 'Hockey' | 'Badminton' | 'Tennis' | 'Table Tennis'
  | 'Kabaddi' | 'Wrestling' | 'Boxing' | 'Shooting' | 'Archery' | 'Athletics'
  | 'Swimming' | 'Volleyball' | 'Basketball' | 'Chess' | 'Carrom' | 'Kho Kho'
  | 'Squash' | 'Golf' | 'Cycling' | 'Weightlifting' | 'Gymnastics' | 'Martial Arts'
  | 'Yoga' | 'Running' | 'Marathon' | 'Throwball' | 'Handball' | 'Baseball';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';

export interface Player {
  id: number;
  name: string;
  sport: SportType;
  level: SkillLevel;
  city: string;
  latitude: number;
  longitude: number;
  avatar: string;
  distance_km?: number;
}

export interface FilterState {
  sport: SportType | 'All';
  levels: Record<SkillLevel, boolean>;
  maxDistance: number; // in km
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}