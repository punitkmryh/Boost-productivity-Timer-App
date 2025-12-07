
export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  date: string; // YYYY-MM-DD
}

export interface WorkTicket {
  id: string;
  ticketId: string; // e.g. PROJ-101
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'high' | 'medium' | 'low';
  tag: string;
  assignee: string; // Initials
  date: string; // YYYY-MM-DD
  storyPoints?: number; // Agile estimation
  subtasks?: Subtask[];
}

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
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

export interface FocusSession {
    id: string;
    duration: number; // minutes
    timestamp: string; // ISO String
    goal?: string;
    completed: boolean;
}

export type NotificationSound = 'chime' | 'gong' | 'digital' | 'success' | 'bowl';

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  notificationSound?: NotificationSound;
}

export enum AppView {
  FOCUS = 'focus',
  TODOS = 'todos',
  WORK = 'work',
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
