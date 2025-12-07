
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Plus, X, Check, Clock, Trash2, Filter, AlertCircle, Sparkles, Loader2, ChevronLeft, ChevronRight, Calendar, CalendarDays, ArrowUpDown, AlignLeft } from 'lucide-react';
import { generateTaskSuggestions } from '../services/geminiService';
import db from '../services/databaseService';

// Helper to get consistent date keys (YYYY-MM-DD)
const getDateKey = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

const ToDoList: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Initialize from Database Service
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
      // Load initial tasks
      const loadedTasks = db.getTasks();
      if (loadedTasks.length === 0) {
          // Initialize mock data if empty
           const today = getDateKey(new Date());
           const mocks: Task[] = [
            { id: '1', title: 'Run sample app on simulator', duration: 30, completed: true, priority: 'high', date: today },
            { id: '2', title: 'Create a test account and log in', duration: 15, completed: false, priority: 'medium', date: today },
            { id: '3', title: 'Plan weekly sprint goals', duration: 45, completed: false, priority: 'medium', date: today },
          ];
          setTasks(mocks);
          db.saveTasks(mocks);
      } else {
          setTasks(loadedTasks);
      }
  }, []);

  // Persistence Effect
  useEffect(() => {
      if (tasks.length > 0) db.saveTasks(tasks);
  }, [tasks]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  // Sorting State
  const [sortBy, setSortBy] = useState<'time' | 'priority'>('time');

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (title?: string) => {
    const titleToAdd = title || newTaskTitle;
    if (!titleToAdd.trim()) return;
    const newTask: Task = {
      id: Date.now().toString() + Math.random().toString(),
      title: titleToAdd,
      duration: 15,
      completed: false,
      priority: newTaskPriority,
      date: getDateKey(currentDate)
    };
    setTasks([newTask, ...tasks]);
    if (!title) setNewTaskTitle('');
  };

  const handleAiSuggest = async () => {
    setIsSuggesting(true);
    const suggestions = await generateTaskSuggestions();
    suggestions.forEach(s => addTask(s));
    setIsSuggesting(false);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    const currentKey = getDateKey(currentDate);
    setTasks(tasks.filter(t => !(t.completed && t.date === currentKey)));
    setShowClearConfirm(false);
  };

  const navigateDate = (days: number) => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + days);
      setCurrentDate(newDate);
  };

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
          const picked = new Date(e.target.value);
          const offset = picked.getTimezoneOffset();
          const adjusted = new Date(picked.getTime() + offset * 60 * 1000);
          setCurrentDate(adjusted);
      }
  };

  const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() && 
             date.getMonth() === today.getMonth() && 
             date.getFullYear() === today.getFullYear();
  };

  const currentKey = getDateKey(currentDate);
  
  const processedTasks = tasks
    .filter(task => {
        if (task.date !== currentKey) return false;
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    })
    .sort((a, b) => {
        if (sortBy === 'priority') {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
            if (diff !== 0) return diff;
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return 0;
        }
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return 0;
    });

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'medium': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      case 'low': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      default: return 'text-slate-400';
    }
  };

  const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="animate-fade-in pb-20 md:pb-8 relative max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6">
        <div>
          <h2 className="text-3xl font-bold dark:text-white text-slate-900 mb-1 tracking-tight">To-Dos</h2>
          <p className="text-slate-500">Manage your tasks for <span className="text-blue-500 font-semibold">{isToday(currentDate) ? 'Today' : formattedDate}</span></p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <div className="glass-panel p-1 rounded-xl flex-1 md:flex-none flex bg-white/50 dark:bg-slate-900/50">
                {['all', 'active', 'completed'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all flex-1 md:flex-none ${
                            filter === f 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
            
            <button 
                onClick={() => setShowClearConfirm(true)}
                className="glass-panel hover:bg-red-500/10 text-slate-400 hover:text-red-400 px-3 py-2 rounded-xl transition-all border dark:border-slate-700 border-slate-200 hover:border-red-500/30"
                title="Clear Completed"
            >
                <Trash2 size={20} />
            </button>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-2 mb-8 flex justify-between items-center border border-slate-200 dark:border-slate-800 shadow-lg">
          <button 
              onClick={() => navigateDate(-1)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-slate-700/50 rounded-xl transition-colors active:scale-95 flex items-center gap-1"
          >
              <ChevronLeft size={20}/>
              <span className="hidden sm:inline text-xs font-bold uppercase">Prev Day</span>
          </button>
          
          <div className="flex items-center gap-3 relative group">
              <CalendarDays size={20} className="text-blue-500" />
              <div className="text-center">
                  <span className="block dark:text-white text-slate-900 font-bold text-sm md:text-base">{formattedDate}</span>
              </div>
              <input 
                  type="date" 
                  value={currentKey}
                  onChange={handleDatePick}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Jump to date"
              />
          </div>
          
          <button 
              onClick={() => navigateDate(1)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-slate-700/50 rounded-xl transition-colors active:scale-95 flex items-center gap-1"
          >
              <span className="hidden sm:inline text-xs font-bold uppercase">Next Day</span>
              <ChevronRight size={20}/>
          </button>
      </div>

      {/* Add Task Input */}
      <div className="glass-panel p-2 rounded-2xl mb-6 flex flex-col md:flex-row gap-2 shadow-lg group focus-within:ring-1 ring-blue-500/30 transition-all dark:bg-slate-900/40 bg-white border-transparent">
        <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Plus size={20} />
            </div>
            <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder={`Add a task for ${isToday(currentDate) ? 'today' : currentDate.toLocaleDateString('en-US', {weekday: 'long'})}...`}
                className="w-full bg-transparent border-none py-4 pl-12 pr-12 dark:text-white text-slate-900 placeholder-slate-400 focus:outline-none text-lg"
            />
            {/* AI Suggest Button */}
            <button 
                onClick={handleAiSuggest}
                disabled={isSuggesting}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-purple-500 hover:bg-purple-500/10 hover:text-purple-600 transition-colors disabled:opacity-50"
                title="Auto-generate tasks with AI"
            >
                {isSuggesting ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            </button>
        </div>
        <div className="flex items-center gap-2 px-2 pb-2 md:pb-0">
             <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
             <select 
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="dark:bg-slate-800 bg-slate-100 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl px-4 py-3 border border-transparent dark:border-slate-700 outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors appearance-none"
             >
                 <option value="high">High Priority</option>
                 <option value="medium">Medium Priority</option>
                 <option value="low">Low Priority</option>
             </select>
             <button 
                onClick={() => addTask()}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition-all font-bold shadow-lg shadow-blue-900/20 active:scale-95 whitespace-nowrap"
                >
                Add Task
            </button>
        </div>
      </div>

      {/* Sorting Control */}
      <div className="flex justify-end mb-4 px-2">
         <button 
            onClick={() => setSortBy(sortBy === 'time' ? 'priority' : 'time')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-500 transition-colors"
         >
             Sort by: <span className={sortBy === 'priority' ? 'text-blue-500 underline' : ''}>{sortBy === 'priority' ? 'Priority' : 'Time Added'}</span>
             {sortBy === 'priority' ? <ArrowUpDown size={14} /> : <AlignLeft size={14} />}
         </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {processedTasks.length === 0 ? (
            <div className="text-center py-24 glass-panel rounded-3xl border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full mx-auto flex items-center justify-center mb-4 ring-1 ring-slate-200 dark:ring-slate-700">
                    <Calendar size={32} className="text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-slate-900 dark:text-slate-300 font-bold text-lg">No tasks for {isToday(currentDate) ? 'today' : formattedDate}</h3>
                <p className="text-slate-500 text-sm mb-6">Plan ahead or take a break!</p>
                <button 
                    onClick={handleAiSuggest}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 rounded-full hover:bg-purple-600/20 transition-all text-sm font-medium"
                >
                    <Sparkles size={16} /> Suggest Tasks
                </button>
            </div>
        ) : (
            processedTasks.map((task) => (
            <div 
                key={task.id} 
                className={`group flex items-center p-4 rounded-2xl border transition-all duration-300 ${
                task.completed 
                    ? 'bg-slate-100 dark:bg-slate-900/40 border-transparent dark:border-slate-800 opacity-60 hover:opacity-100' 
                    : 'glass-panel bg-white dark:bg-slate-900/50 border-transparent hover:border-slate-700 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-blue-900/5 hover:-translate-y-0.5'
                }`}
            >
                <button 
                    onClick={() => toggleTask(task.id)}
                    className={`mr-4 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        task.completed 
                        ? 'bg-blue-500 text-white scale-110 shadow-sm' 
                        : 'bg-slate-200 dark:bg-slate-800/50 text-transparent border border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-500/10'
                    }`}
                >
                    <Check size={14} strokeWidth={4} />
                </button>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <p className={`font-medium truncate transition-all text-lg ${task.completed ? 'text-slate-400 line-through decoration-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                            {task.title}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <Clock size={12} /> {task.duration}m
                        </span>
                    </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
            ))
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl transform scale-100 transition-all border-slate-200 dark:border-slate-700">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                         <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white text-slate-900 mb-2">Clear Completed Tasks?</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Are you sure you want to delete completed tasks for <span className="dark:text-white text-slate-900 font-medium">{formattedDate}</span>?
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium border border-transparent"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={clearCompleted}
                        className="px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors font-bold shadow-lg shadow-red-900/20"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ToDoList;
