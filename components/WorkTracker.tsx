
import React, { useState, useEffect } from 'react';
import { WorkTicket } from '../types';
import { Plus, ChevronLeft, ChevronRight, Calendar, Tag, MoreHorizontal, CheckCircle2, Circle, X, Edit, Trash, GripVertical, Search, Filter, Layers, Zap } from 'lucide-react';
import db from '../services/databaseService';

const getDateKey = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

const WorkTracker: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const [tickets, setTickets] = useState<WorkTicket[]>([]);

    useEffect(() => {
        const loaded = db.getTickets();
        if (loaded.length === 0) {
            const today = getDateKey(new Date());
            const defaults: WorkTicket[] = [
                { id: '1', ticketId: 'PROJ-101', title: 'Design System Update', description: 'Standardize primary colors across UI', status: 'in-progress', priority: 'high', tag: 'Design', assignee: 'JD', date: today, storyPoints: 5 },
                { id: '2', ticketId: 'PROJ-102', title: 'API Integration', description: 'Connect Gemini Service to Frontend', status: 'review', priority: 'high', tag: 'Backend', assignee: 'MK', date: today, storyPoints: 8 },
                { id: '3', ticketId: 'PROJ-103', title: 'Update Documentation', description: 'Write readme for the new module', status: 'todo', priority: 'low', tag: 'Docs', assignee: 'JD', date: today, storyPoints: 2 },
                { id: '4', ticketId: 'PROJ-104', title: 'Weekly Standup', description: 'Prepare slides for meeting', status: 'done', priority: 'medium', tag: 'Meeting', assignee: 'JD', date: today, storyPoints: 1 },
            ];
            setTickets(defaults);
            db.saveTickets(defaults);
        } else {
            setTickets(loaded);
        }
    }, []);

    // Save
    useEffect(() => {
        if(tickets.length > 0) db.saveTickets(tickets);
    }, [tickets]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
    const [newTicket, setNewTicket] = useState<Partial<WorkTicket>>({ status: 'todo', priority: 'medium', tag: 'General', storyPoints: 1 });
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'high'>('all');

    // Drag and Drop
    const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
    const [activeMenuTicketId, setActiveMenuTicketId] = useState<string | null>(null);

    const currentKey = getDateKey(currentDate);

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

    const moveTicket = (id: string, newStatus: WorkTicket['status']) => {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
    };

    const deleteTicket = (id: string) => {
        if(window.confirm('Are you sure you want to delete this ticket?')) {
            setTickets(tickets.filter(t => t.id !== id));
        }
        setActiveMenuTicketId(null);
    };

    const openEditModal = (ticket: WorkTicket) => {
        setNewTicket(ticket);
        setEditingTicketId(ticket.id);
        setActiveMenuTicketId(null);
        setShowAddModal(true);
    };

    const openCreateModal = () => {
        setNewTicket({ status: 'todo', priority: 'medium', tag: 'General', title: '', description: '', storyPoints: 1 });
        setEditingTicketId(null);
        setShowAddModal(true);
    };

    const saveTicket = () => {
        if (!newTicket.title) return;
        
        if (editingTicketId) {
            setTickets(tickets.map(t => t.id === editingTicketId ? { ...t, ...newTicket } as WorkTicket : t));
        } else {
            const ticket: WorkTicket = {
                id: Date.now().toString(),
                ticketId: `PROJ-${Math.floor(Math.random() * 1000)}`,
                title: newTicket.title,
                description: newTicket.description || '',
                status: 'todo',
                priority: newTicket.priority as any,
                tag: newTicket.tag || 'General',
                assignee: 'ME',
                date: currentKey,
                storyPoints: newTicket.storyPoints || 1
            };
            setTickets([...tickets, ticket]);
        }
        setShowAddModal(false);
        setEditingTicketId(null);
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedTicketId(id);
        e.dataTransfer.setData("ticketId", id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, columnId: WorkTicket['status']) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("ticketId");
        if (id) {
            moveTicket(id, columnId);
        }
        setDraggedTicketId(null);
    };

    const columns: { id: WorkTicket['status'], label: string, color: string, progress: number }[] = [
        { id: 'todo', label: 'To Do', color: 'border-slate-500', progress: 0 },
        { id: 'in-progress', label: 'In Progress', color: 'border-blue-500', progress: 33 },
        { id: 'review', label: 'Review', color: 'border-purple-500', progress: 66 },
        { id: 'done', label: 'Done', color: 'border-emerald-500', progress: 100 },
    ];

    const getPriorityColor = (p: string) => {
         switch (p) {
            case 'high': return 'border-red-500';
            case 'medium': return 'border-amber-500';
            case 'low': return 'border-blue-400';
            default: return 'border-slate-300';
        }
    };

    const getPriorityBadge = (p: string) => {
        switch (p) {
            case 'high': return <span className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[9px] px-1.5 py-0.5 rounded-md uppercase font-bold tracking-wider">High</span>;
            case 'medium': return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] px-1.5 py-0.5 rounded-md uppercase font-bold tracking-wider">Med</span>;
            case 'low': return <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[9px] px-1.5 py-0.5 rounded-md uppercase font-bold tracking-wider">Low</span>;
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesDate = t.date === currentKey;
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) || t.tag.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
        return matchesDate && matchesSearch && matchesPriority;
    });

    const totalPoints = filteredTickets.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const completedPoints = filteredTickets.filter(t => t.status === 'done').reduce((acc, t) => acc + (t.storyPoints || 0), 0);

    return (
        <div className="animate-fade-in pb-20 md:pb-8 h-full flex flex-col" onClick={() => setActiveMenuTicketId(null)}>
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-6 gap-6 flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-bold dark:text-white text-slate-900 mb-1 tracking-tight">Work Board</h2>
                    <p className="text-slate-500">Agile Sprint Management & Tracking</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
                     <div className="relative flex-1 xl:flex-none">
                         <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                         <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tickets..." 
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm w-full xl:w-64 focus:ring-2 ring-blue-500 outline-none transition-all"
                        />
                     </div>

                     <button 
                        onClick={() => setPriorityFilter(priorityFilter === 'all' ? 'high' : 'all')}
                        className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold uppercase ${priorityFilter === 'high' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                     >
                         <Filter size={14} /> {priorityFilter === 'high' ? 'High Only' : 'All Priorities'}
                     </button>

                     <div className="glass-panel p-1 rounded-xl flex items-center shadow-lg bg-white/50 dark:bg-slate-900/50">
                        <button onClick={() => navigateDate(-1)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-slate-700/50 rounded-lg transition-colors"><ChevronLeft size={20}/></button>
                        <div className="px-4 text-center min-w-[120px] relative">
                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Sprint Date</div>
                             <div className="font-bold dark:text-white text-slate-900 text-sm flex items-center justify-center gap-2">
                                <Calendar size={14} className="text-blue-500" />
                                {currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                             </div>
                             <input type="date" value={currentKey} onChange={handleDatePick} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <button onClick={() => navigateDate(1)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-slate-700/50 rounded-lg transition-colors"><ChevronRight size={20}/></button>
                     </div>

                     <button 
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2"
                     >
                        <Plus size={20} /> <span className="hidden md:inline">New Ticket</span>
                     </button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="glass-panel p-3 rounded-xl flex items-center gap-3 border-l-4 border-l-blue-500 bg-white/50 dark:bg-slate-900/40">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Layers size={18} /></div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Total Points</div>
                        <div className="text-lg font-bold dark:text-white text-slate-900">{totalPoints} SP</div>
                    </div>
                </div>
                <div className="glass-panel p-3 rounded-xl flex items-center gap-3 border-l-4 border-l-emerald-500 bg-white/50 dark:bg-slate-900/40">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><CheckCircle2 size={18} /></div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Completed</div>
                        <div className="text-lg font-bold dark:text-white text-slate-900">{completedPoints} SP <span className="text-xs text-emerald-500 font-normal">({Math.round((completedPoints/totalPoints || 0)*100)}%)</span></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-[1000px] h-full">
                    {columns.map(col => {
                        const colTickets = filteredTickets.filter(t => t.status === col.id);
                        return (
                            <div 
                                key={col.id} 
                                className="flex-1 flex flex-col glass-panel dark:bg-slate-900/40 bg-white/60 rounded-2xl p-3 min-h-[500px] transition-colors"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, col.id)}
                            >
                                <div className={`flex items-center justify-between mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700`}>
                                    <div className="flex items-center gap-2">
                                        {col.id === 'done' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-slate-400" />}
                                        <h3 className="font-bold dark:text-slate-200 text-slate-700 uppercase text-xs tracking-wider">
                                            {col.label}
                                        </h3>
                                    </div>
                                    <span className="bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm">{colTickets.length}</span>
                                </div>
                                
                                <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full mb-3 overflow-hidden">
                                     <div className={`h-full ${col.id === 'done' ? 'bg-emerald-500' : 'bg-blue-500'} opacity-50`} style={{ width: `${col.progress}%` }}></div>
                                </div>

                                <div className="flex-1 space-y-3 px-1 pb-2">
                                    {colTickets.map(ticket => (
                                        <div 
                                            key={ticket.id} 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, ticket.id)}
                                            className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500/50 group transition-all duration-200 relative cursor-grab active:cursor-grabbing transform hover:-translate-y-1 ${draggedTicketId === ticket.id ? 'opacity-50 rotate-3 scale-95' : 'opacity-100'} border-l-4 ${getPriorityColor(ticket.priority)}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                     <GripVertical size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                     <span className="text-[10px] font-mono text-slate-400 font-medium tracking-tight bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">{ticket.ticketId}</span>
                                                </div>
                                                <div className="relative" onClick={e => e.stopPropagation()}>
                                                    <button 
                                                        onClick={() => setActiveMenuTicketId(activeMenuTicketId === ticket.id ? null : ticket.id)}
                                                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                                    >
                                                        <MoreHorizontal size={14} />
                                                    </button>
                                                    {activeMenuTicketId === ticket.id && (
                                                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg overflow-hidden z-20 w-32 animate-fade-in">
                                                            <button 
                                                                onClick={() => openEditModal(ticket)}
                                                                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                            >
                                                                <Edit size={12} /> Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteTicket(ticket.id)}
                                                                className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                            >
                                                                <Trash size={12} /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <h4 className="font-semibold text-sm dark:text-slate-100 text-slate-800 mb-3 leading-snug line-clamp-2">{ticket.title}</h4>
                                            
                                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                                <span className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-medium">
                                                    <Tag size={10} /> {ticket.tag}
                                                </span>
                                                {getPriorityBadge(ticket.priority)}
                                                {ticket.storyPoints && (
                                                    <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[9px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1" title="Story Points">
                                                        <Zap size={10} fill="currentColor" /> {ticket.storyPoints}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                                 <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white dark:ring-slate-800 shadow-sm">
                                                        {ticket.assignee}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-medium">Assignee</span>
                                                 </div>
                                                 
                                                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     {col.id !== 'todo' && (
                                                         <button onClick={() => moveTicket(ticket.id, columns[columns.findIndex(c => c.id === col.id) - 1].id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Move Back">
                                                             <ChevronLeft size={14} />
                                                         </button>
                                                     )}
                                                     {col.id !== 'done' && (
                                                         <button onClick={() => moveTicket(ticket.id, columns[columns.findIndex(c => c.id === col.id) + 1].id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Move Forward">
                                                             <ChevronRight size={14} />
                                                         </button>
                                                     )}
                                                 </div>
                                            </div>
                                        </div>
                                    ))}
                                    {colTickets.length === 0 && (
                                        <div className="h-24 border-2 border-dashed border-slate-300 dark:border-slate-700/30 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-600 text-xs font-medium italic">
                                            No Tickets
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-panel dark:bg-slate-900 bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 transform scale-100 transition-all">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white text-slate-900">{editingTicketId ? 'Edit Ticket' : 'Create New Ticket'}</h3>
                            <button onClick={() => setShowAddModal(false)}><X className="text-slate-500 hover:text-red-500 transition-colors" /></button>
                         </div>
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Title</label>
                                 <input 
                                    type="text" 
                                    value={newTicket.title} 
                                    onChange={e => setNewTicket({...newTicket, title: e.target.value})}
                                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 dark:text-white text-slate-900 focus:ring-2 ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="e.g., Fix login bug"
                                    autoFocus
                                 />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Description</label>
                                 <textarea 
                                    value={newTicket.description} 
                                    onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 dark:text-white text-slate-900 focus:ring-2 ring-blue-500 outline-none h-24 resize-none transition-all placeholder:text-slate-400"
                                    placeholder="Details about the task..."
                                 />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Priority</label>
                                     <select 
                                        value={newTicket.priority}
                                        onChange={e => setNewTicket({...newTicket, priority: e.target.value as any})}
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 dark:text-white text-slate-900 outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                     >
                                         <option value="high">High</option>
                                         <option value="medium">Medium</option>
                                         <option value="low">Low</option>
                                     </select>
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Story Points</label>
                                     <select 
                                        value={newTicket.storyPoints}
                                        onChange={e => setNewTicket({...newTicket, storyPoints: parseInt(e.target.value)})}
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 dark:text-white text-slate-900 outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                     >
                                         {[1, 2, 3, 5, 8, 13, 21].map(p => (
                                             <option key={p} value={p}>{p} SP</option>
                                         ))}
                                     </select>
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Tag</label>
                                 <input 
                                    type="text" 
                                    value={newTicket.tag} 
                                    onChange={e => setNewTicket({...newTicket, tag: e.target.value})}
                                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 dark:text-white text-slate-900 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="e.g. Dev, Design"
                                 />
                             </div>
                             <button onClick={saveTicket} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 active:scale-95 mt-2">
                                 {editingTicketId ? 'Save Changes' : 'Create Ticket'}
                             </button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkTracker;
