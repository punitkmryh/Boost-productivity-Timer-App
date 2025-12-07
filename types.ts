
export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface Habit {
  id: string;
  title: string;
  goalDescription: string;
  // Map date string 'YYYY-MM-DD' to completion status
  completedDates: Record<string, boolean>; 
  color: string; // Tailwind class for color, e.g., 'bg-red-500'
  streak: number;
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
}

export enum AppView {
  FOCUS = 'focus',
  TODOS = 'todos',
  HABITS = 'habits',
  GOALS = 'goals',
  BOOST = 'boost',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
