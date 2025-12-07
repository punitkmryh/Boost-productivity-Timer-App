
import { Task, WorkTicket, Habit, FocusSession } from '../types';

const STORAGE_KEYS = {
    TASKS: 'boost_tasks',
    TICKETS: 'boost_tickets',
    HABITS: 'boost_habits',
    FOCUS_SESSIONS: 'boost_focus_sessions'
};

// Helper to get today's date key
const getTodayKey = () => new Date().toISOString().split('T')[0];

const db = {
    // --- TASKS ---
    getTasks: (): Task[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TASKS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },
    saveTasks: (tasks: Task[]) => {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    },

    // --- WORK TICKETS ---
    getTickets: (): WorkTicket[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },
    saveTickets: (tickets: WorkTicket[]) => {
        localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    },

    // --- HABITS ---
    getHabits: (): Habit[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.HABITS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },
    saveHabits: (habits: Habit[]) => {
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    },

    // --- FOCUS SESSIONS ---
    getSessions: (): FocusSession[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },
    addSession: (session: FocusSession) => {
        const sessions = db.getSessions();
        sessions.push(session);
        localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
    },

    // --- ANALYTICS HELPERS ---
    
    // Calculate total XP based on activity
    // Rules: 10 XP per Focus Minute, 50 XP per Task, 100 XP per Ticket, 20 XP per Habit day
    getUserXP: () => {
        const sessions = db.getSessions();
        const tasks = db.getTasks();
        const tickets = db.getTickets();
        const habits = db.getHabits();

        let xp = 0;
        
        // Focus XP
        sessions.forEach(s => {
            if (s.completed) xp += (s.duration * 10);
        });

        // Task XP
        tasks.filter(t => t.completed).forEach(() => xp += 50);

        // Ticket XP
        tickets.filter(t => t.status === 'done').forEach(() => xp += 100);

        // Habit XP
        habits.forEach(h => {
            xp += (Object.keys(h.completedDates).length * 20);
        });

        return xp;
    },

    // Get Focus Hours per day for the last 7 days
    getWeeklyFocusData: () => {
        const sessions = db.getSessions();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const result = [];
        const today = new Date();

        // Iterate backwards from today for 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateKey = d.toISOString().split('T')[0];
            const dayName = days[d.getDay()];

            // Sum duration for this day
            const daySessions = sessions.filter(s => s.timestamp.startsWith(dateKey));
            const totalMinutes = daySessions.reduce((acc, s) => acc + s.duration, 0);
            
            result.push({
                day: dayName,
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                hours: parseFloat((totalMinutes / 60).toFixed(1))
            });
        }
        return result;
    },

    // Get Ticket Status Distribution
    getTicketStats: () => {
        const tickets = db.getTickets();
        const stats = {
            todo: 0,
            'in-progress': 0,
            review: 0,
            done: 0
        };
        tickets.forEach(t => {
            if (stats[t.status] !== undefined) stats[t.status]++;
        });
        
        return [
            { name: 'Done', value: stats.done, color: '#10b981' },
            { name: 'In Progress', value: stats['in-progress'], color: '#3b82f6' },
            { name: 'Review', value: stats.review, color: '#a855f7' },
            { name: 'Todo', value: stats.todo, color: '#64748b' },
        ];
    }
};

export default db;
