
import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, X, Check, Clock, Trash2, Filter, AlertCircle, Flag, Sparkles, Loader2 } from 'lucide-react';
import { generateTaskSuggestions } from '../services/geminiService';

const ToDoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Run sample app on simulator', duration: 30, completed: true, priority: 'high' },
    { id: '2', title: 'Create a test account and log in', duration: 15, completed: false, priority: 'medium' },
    { id: '3', title: 'Try adding and completing one task', duration: 20, completed: true, priority: 'low' },
    { id: '4', title: 'Connect iPhone via USB & test', duration: 25, completed: false, priority: 'high' },
    { id: '5', title: 'Install Xcode from App Store', duration: 45, completed: false, priority: 'medium' },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

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
      priority: newTaskPriority
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
    setTasks(tasks.filter(t => !t.completed));
    setShowClearConfirm(false);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'medium': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      case 'low': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="animate-fade-in pb-20 md:pb-8 relative max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">To-Dos</h2>
          <p className="text-slate-400">Manage your tasks & priorities</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <div className="glass-panel p-1 rounded-xl flex-1 md:flex-none flex">
                {['all', 'active', 'completed'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all flex-1 md:flex-none ${
                            filter === f 
                            ? 'bg-slate-700 text-white shadow-sm' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
            
            <button 
                onClick={() => setShowClearConfirm(true)}
                className="glass-panel hover:bg-red-500/10 text-slate-400 hover:text-red-400 px-3 py-2 rounded-xl transition-all border hover:border-red-500/30"
                title="Clear Completed"
            >
                <Trash2 size={20} />
            </button>
        </div>
      </div>

      {/* Add Task Input */}
      <div className="glass-panel p-2 rounded-2xl mb-8 flex flex-col md:flex-row gap-2 shadow-lg group focus-within:ring-1 ring-blue-500/30 transition-all">
        <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Plus size={20} />
            </div>
            <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add a new task..."
                className="w-full bg-transparent border-none py-4 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none text-lg"
            />
            {/* AI Suggest Button */}
            <button 
                onClick={handleAiSuggest}
                disabled={isSuggesting}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-colors disabled:opacity-50"
                title="Auto-generate tasks with AI"
            >
                {isSuggesting ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            </button>
        </div>
        <div className="flex items-center gap-2 px-2 pb-2 md:pb-0">
             <div className="h-8 w-[1px] bg-slate-700 hidden md:block"></div>
             <select 
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="bg-slate-800 text-slate-300 text-sm font-medium rounded-xl px-4 py-3 border border-slate-700 outline-none cursor-pointer hover:bg-slate-700 transition-colors appearance-none"
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

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
            <div className="text-center py-24 glass-panel rounded-3xl border-dashed border-slate-700 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full mx-auto flex items-center justify-center mb-4 ring-1 ring-slate-700">
                    <Check size={32} className="text-slate-600" />
                </div>
                <h3 className="text-slate-300 font-bold text-lg">No tasks found</h3>
                <p className="text-slate-500 text-sm mb-6">Add a new task to get started or let AI help you</p>
                <button 
                    onClick={handleAiSuggest}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-full hover:bg-purple-600/30 transition-all text-sm font-medium"
                >
                    <Sparkles size={16} /> Suggest Tasks
                </button>
            </div>
        ) : (
            filteredTasks.map((task) => (
            <div 
                key={task.id} 
                className={`group flex items-center p-4 rounded-2xl border transition-all duration-300 ${
                task.completed 
                    ? 'bg-slate-900/20 border-slate-800 opacity-60 hover:opacity-100' 
                    : 'glass-panel hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/5 hover:-translate-y-0.5'
                }`}
            >
                <button 
                    onClick={() => toggleTask(task.id)}
                    className={`mr-4 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        task.completed 
                        ? 'bg-blue-500 text-white scale-110 shadow-sm' 
                        : 'bg-slate-800/50 text-transparent border border-slate-600 hover:border-blue-400 hover:bg-blue-500/10'
                    }`}
                >
                    <Check size={14} strokeWidth={4} />
                </button>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <p className={`font-medium truncate transition-all text-lg ${task.completed ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-100'}`}>
                            {task.title}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <Clock size={12} /> {task.duration}m
                        </span>
                    </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
            <div className="glass-panel rounded-3xl p-8 max-w-sm w-full shadow-2xl transform scale-100 transition-all border-slate-700">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-400">
                         <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Clear Completed Tasks?</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Are you sure you want to delete all completed tasks? This action cannot be undone.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors font-medium border border-transparent hover:border-slate-700"
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
