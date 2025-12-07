
import React, { useState, useEffect } from 'react';
import { Habit } from '../types';
import { Plus, MoreVertical, ChevronLeft, ChevronRight, Calendar, Flame, X, Check, Trophy, Grid, List } from 'lucide-react';
import db from '../services/databaseService';

const getDateKey = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

const HabitTracker: React.FC = () => {
  const calculateStreak = (completedDates: Record<string, boolean>) => {
      let streak = 0;
      const today = new Date();
      const todayKey = getDateKey(today);
      let checkDate = new Date(today);
      
      if (!completedDates[todayKey]) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayKey = getDateKey(checkDate);
          if (!completedDates[yesterdayKey]) return 0;
      }

      while (true) {
          const key = getDateKey(checkDate);
          if (completedDates[key]) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
          } else {
              break;
          }
      }
      return streak;
  };

  const [habits, setHabits] = useState<Habit[]>([]);

  // Load from DB
  useEffect(() => {
      const loaded = db.getHabits();
      if (loaded.length === 0) {
          // Defaults
          const defaults = [
            { id: '1', title: 'Code Daily', goalDescription: 'For at least 1 hour', completedDates: {}, color: 'bg-red-500', streak: 0 },
            { id: '2', title: 'Practice L33tcode', goalDescription: '60 minutes daily', completedDates: {}, color: 'bg-blue-500', streak: 0 },
            { id: '3', title: 'Workout', goalDescription: 'At least twice per week', completedDates: {}, color: 'bg-green-500', streak: 0 },
          ];
          setHabits(defaults);
          db.saveHabits(defaults);
      } else {
          setHabits(loaded);
      }
  }, []);

  // Save to DB
  useEffect(() => {
      if(habits.length > 0) db.saveHabits(habits);
  }, [habits]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: '', desc: '', color: 'bg-blue-500' });
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [datesToDisplay, setDatesToDisplay] = useState<(Date | null)[]>([]);

  useEffect(() => {
    const dates: (Date | null)[] = [];
    const tempDate = new Date(referenceDate);
    
    if (viewMode === 'week') {
        const day = tempDate.getDay(); 
        const diff = tempDate.getDate() - day; 
        tempDate.setDate(diff); 
        for (let i = 0; i < 7; i++) {
            dates.push(new Date(tempDate));
            tempDate.setDate(tempDate.getDate() + 1);
        }
    } else {
        const year = tempDate.getFullYear();
        const month = tempDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        for(let i=0; i < firstDayOfMonth; i++) dates.push(null);

        const iterDate = new Date(year, month, 1);
        for (let i = 0; i < daysInMonth; i++) {
            dates.push(new Date(iterDate));
            iterDate.setDate(iterDate.getDate() + 1);
        }
    }
    setDatesToDisplay(dates);
  }, [referenceDate, viewMode]);

  const navigateDate = (direction: 'prev' | 'next') => {
      const newDate = new Date(referenceDate);
      if (viewMode === 'week') {
          newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      } else {
          newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      }
      setReferenceDate(newDate);
  };

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
          const picked = new Date(e.target.value);
          const offset = picked.getTimezoneOffset();
          const adjusted = new Date(picked.getTime() + offset * 60 * 1000);
          setReferenceDate(adjusted);
      }
  };

  const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' });
  const getDateNum = (date: Date) => date.getDate();
  
  const isToday = (date: Date) => {
      const d1 = new Date();
      return date.getDate() === d1.getDate() && 
             date.getMonth() === d1.getMonth() && 
             date.getFullYear() === d1.getFullYear();
  };

  const toggleDay = (habitId: string, date: Date) => {
    const dateKey = getDateKey(date);
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const newCompleted = { ...h.completedDates };
        if (newCompleted[dateKey]) {
            delete newCompleted[dateKey];
        } else {
            newCompleted[dateKey] = true;
        }
        const newStreak = calculateStreak(newCompleted);
        return { ...h, completedDates: newCompleted, streak: newStreak };
      }
      return h;
    }));
  };

  const totalCompletions = habits.reduce((acc, h) => acc + Object.keys(h.completedDates).length, 0);
  const currentLevel = Math.floor(totalCompletions / 10) + 1;
  const progressToNext = (totalCompletions % 10) * 10;

  const addHabit = () => {
    if (!newHabit.title) return;
    const h: Habit = {
        id: Date.now().toString(),
        title: newHabit.title,
        goalDescription: newHabit.desc || 'Daily goal',
        completedDates: {},
        color: newHabit.color,
        streak: 0
    };
    setHabits([...habits, h]);
    setNewHabit({ title: '', desc: '', color: 'bg-blue-500' });
    setShowAddModal(false);
  };

  const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];

  const getRangeLabel = () => {
      const validDates = datesToDisplay.filter(d => d !== null) as Date[];
      if (validDates.length === 0) return '';
      const start = validDates[0];
      const end = validDates[validDates.length - 1];
      
      if (viewMode === 'week') {
          if (start.getMonth() !== end.getMonth()) {
              return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          }
          return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.getDate()}`;
      } else {
          return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
  };

  return (
    <div className="animate-fade-in pb-20 md:pb-8 relative max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Habits</h2>
          <p className="text-slate-400">Build better routines, one day at a time</p>
        </div>
        
        <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-4 border-amber-500/20 bg-amber-500/5">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                <Trophy size={20} />
            </div>
            <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
                    <span className="text-amber-500">Level {currentLevel}</span>
                    <span className="text-slate-500">{progressToNext}%</span>
                </div>
                <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${progressToNext}%` }}></div>
                </div>
            </div>
             <button 
                onClick={() => setShowAddModal(true)}
                className="ml-4 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
                <Plus size={20} />
            </button>
        </div>
      </div>

      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-2 mb-8 flex flex-col sm:flex-row justify-between items-center border border-slate-700/50 gap-4 sm:gap-0 shadow-lg">
        <button 
            onClick={() => navigateDate('prev')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors order-2 sm:order-1 active:scale-95"
        >
            <ChevronLeft size={20}/>
        </button>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2">
            <div className="flex items-center gap-2 text-white font-medium relative group cursor-pointer px-4 py-2 hover:bg-slate-800/50 rounded-xl transition-colors">
                <Calendar size={18} className="text-blue-400 pointer-events-none" />
                <span className="min-w-[140px] text-center pointer-events-none text-sm md:text-base">{getRangeLabel()}</span>
                <input 
                    type="date" 
                    onChange={handleDatePick}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Jump to date"
                />
            </div>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button 
                    onClick={() => setViewMode('week')}
                    className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-md transition-all ${viewMode === 'week' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600' : 'text-slate-400 hover:text-white'}`}
                >
                    <List size={12} /> Week
                </button>
                <button 
                    onClick={() => setViewMode('month')}
                     className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-md transition-all ${viewMode === 'month' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600' : 'text-slate-400 hover:text-white'}`}
                >
                    <Grid size={12} /> Month
                </button>
            </div>
        </div>
        
        <button 
            onClick={() => navigateDate('next')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors order-3 active:scale-95"
        >
            <ChevronRight size={20}/>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {habits.map((habit) => (
          <div key={habit.id} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-5 hover:border-slate-600 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl ${habit.color} flex items-center justify-center shadow-lg ${habit.color.replace('bg-', 'shadow-')}/30 transform group-hover:scale-105 transition-transform`}>
                     <Check size={24} className="text-white" strokeWidth={3} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-100">{habit.title}</h3>
                    <p className="text-sm text-slate-500 mb-1">{habit.goalDescription}</p>
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wide transition-all">
                        <Flame size={14} className={`transition-colors duration-300 ${habit.streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-700"}`} />
                        <span className={`transition-colors duration-300 ${habit.streak > 0 ? "text-orange-400" : "text-slate-600"}`}>
                            {habit.streak} Day Streak
                        </span>
                    </div>
                 </div>
              </div>
              <button className="text-slate-500 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>

            <div className={`grid grid-cols-7 gap-2`}>
                {viewMode === 'month' && ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] uppercase font-bold text-slate-500 py-1">
                        {day}
                    </div>
                ))}
                
                {datesToDisplay.map((date, index) => {
                    if (!date) return <div key={`empty-${index}`} className="w-full aspect-square" />;
                    const dateKey = getDateKey(date);
                    const isCompleted = habit.completedDates[dateKey];
                    const isTodayDate = isToday(date);
                    
                    return (
                    <button
                        key={`${habit.id}-${dateKey}`}
                        onClick={() => toggleDay(habit.id, date)}
                        className={`group flex flex-col items-center justify-center rounded-xl transition-all duration-200 relative overflow-hidden active:scale-90 ${
                        viewMode === 'month' 
                            ? 'p-1 aspect-square w-full' 
                            : 'p-2 h-auto aspect-square sm:aspect-auto sm:h-16'
                        } ${
                        isCompleted
                            ? `${habit.color} text-white shadow-lg ${habit.color.replace('bg-', 'shadow-')}/30 ring-2 ring-offset-2 ring-offset-slate-900 ring-transparent`
                            : isTodayDate 
                                ? 'bg-slate-800 border-2 border-blue-500/50 text-white shadow-inner' 
                                : 'bg-slate-800/50 text-slate-500 hover:bg-slate-700 hover:text-slate-300 border border-transparent hover:border-slate-600'
                        }`}
                        title={date.toDateString()}
                    >
                        <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${viewMode === 'month' ? 'hidden' : 'block'}`}>{getDayName(date)}</span>
                        <span className={`font-bold ${viewMode === 'month' ? 'text-xs md:text-sm' : 'text-sm'} ${isCompleted ? 'text-white' : ''} z-10 relative`}>{getDateNum(date)}</span>
                        
                        {isCompleted && viewMode === 'week' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Check size={28} className="text-white/20 scale-150" />
                            </div>
                        )}
                        <div className={`mt-1 transition-all duration-300 ${isCompleted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-50'} ${viewMode === 'month' ? 'hidden' : 'block'} z-10`}>
                            <div className="bg-white/20 rounded-full p-0.5">
                                <Check size={10} strokeWidth={4} />
                            </div>
                        </div>
                    </button>
                    );
                })}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl transform scale-100 transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Create New Habit</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Habit Name</label>
                        <input 
                            type="text" 
                            value={newHabit.title}
                            onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
                            placeholder="e.g. Read 10 pages"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                        <input 
                            type="text" 
                            value={newHabit.desc}
                            onChange={(e) => setNewHabit({...newHabit, desc: e.target.value})}
                            placeholder="e.g. Before bed"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setNewHabit({...newHabit, color: c})}
                                    className={`w-8 h-8 rounded-full ${c} transition-transform hover:scale-110 ${newHabit.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={addHabit}
                    disabled={!newHabit.title}
                    className="w-full bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 active:scale-95"
                >
                    Create Habit
                </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default HabitTracker;
