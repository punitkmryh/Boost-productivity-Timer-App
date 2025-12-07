import React, { useState } from 'react';
import Navigation from './components/Navigation';
import ToDoList from './components/ToDoList';
import HabitTracker from './components/HabitTracker';
import FocusTimer from './components/FocusTimer';
import Analytics from './components/Analytics';
import BoostCenter from './components/BoostCenter';
import AIChat from './components/AIChat';
import Settings from './components/Settings';
import { AppView, UserProfile } from './types';
import { Bell, Search, Settings as SettingsIcon, User, Zap, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.TODOS);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Jake.0',
    email: 'jake@boost.app',
    bio: 'Productivity enthusiast & developer.'
  });
  const [isDarkMode, setIsDarkMode] = useState(true);

  const renderView = () => {
    switch (currentView) {
      case AppView.FOCUS: return <FocusTimer />;
      case AppView.TODOS: return <ToDoList />;
      case AppView.HABITS: return <HabitTracker />;
      case AppView.ANALYTICS: return <Analytics />;
      case AppView.BOOST: return <BoostCenter />;
      case AppView.SETTINGS: return <Settings profile={userProfile} onUpdateProfile={setUserProfile} />;
      default: return <ToDoList />;
    }
  };

  // Enhanced Animated Logo with Redirect & Hover
  const AppLogo = () => (
    <button 
      onClick={() => setCurrentView(AppView.FOCUS)}
      className="relative w-12 h-12 flex items-center justify-center group outline-none"
      title="Go to Focus Timer"
    >
      <div className="absolute inset-0 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 overflow-hidden transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 ease-out">
         {/* Complex Gradient Background */}
         <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-500 group-hover:brightness-110 transition-all"></div>
         
         {/* Internal Glow */}
         <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
      </div>

      {/* Icon Content */}
      <div className="relative z-10 text-white transform group-hover:-translate-y-0.5 transition-transform duration-300">
        <div className="relative">
             {/* Main Rocket/Arrow Shape */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" className="group-hover:text-yellow-300 transition-colors duration-300" />
            </svg>
            {/* Orbiting particles */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
        </div>
      </div>
      
      {/* External decorative glow on hover */}
      <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
    </button>
  );

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/30 flex overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#020617] text-slate-50' : 'bg-slate-50 text-slate-900 light-mode'}`}>
      
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex w-64 flex-col backdrop-blur-2xl border-r p-6 z-20 transition-all duration-500 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-slate-200'}`}>
        <div className="flex items-center gap-3 mb-10 px-2">
            <AppLogo />
            <div className="flex flex-col cursor-pointer" onClick={() => setCurrentView(AppView.FOCUS)}>
                <span className={`text-xl font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'} hover:text-blue-400`}>Boost</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Productivity</span>
            </div>
        </div>

        <Navigation currentView={currentView} onChangeView={setCurrentView} orientation="vertical" isDarkMode={isDarkMode} />

        <div className={`mt-auto pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
             <button 
                onClick={() => setCurrentView(AppView.SETTINGS)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors w-full text-left group ${currentView === AppView.SETTINGS ? (isDarkMode ? 'bg-slate-800' : 'bg-slate-100') : (isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100')}`}
             >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
                    <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                         <span className={`font-bold text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{userProfile.name.substring(0,2).toUpperCase()}</span>
                    </div>
                </div>
                <div className="overflow-hidden flex-1">
                    <div className={`text-sm font-medium transition-colors truncate ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>{userProfile.name}</div>
                    <div className="text-xs text-slate-500 truncate">Pro Member</div>
                </div>
                <SettingsIcon size={16} className={`transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
             </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen relative overflow-hidden transition-colors duration-500">
        
        {/* Desktop Header */}
        <header className={`hidden md:flex justify-between items-center px-8 py-5 backdrop-blur-md sticky top-0 z-20 border-b transition-colors duration-500 ${isDarkMode ? 'bg-[#020617]/80 border-slate-800/50' : 'bg-white/80 border-slate-200/50'}`}>
             <div className="flex flex-col">
                <h1 className={`text-xl font-bold capitalize flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {currentView === AppView.BOOST ? 'Boost Center' : currentView.toLowerCase()}
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">Beta</span>
                </h1>
                <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
             </div>
             
             <div className="flex items-center gap-4">
                 {/* Night/White Mode Toggle */}
                 <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2.5 rounded-full transition-all duration-300 relative overflow-hidden group ${
                        isDarkMode 
                        ? 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700' 
                        : 'bg-slate-100 text-slate-500 hover:text-yellow-600 hover:bg-yellow-50'
                    }`}
                    title={isDarkMode ? "Switch to White Mode" : "Switch to Night Mode"}
                 >
                    <div className="relative z-10">
                        {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                    </div>
                 </button>

                 <div className="relative group">
                     <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'}`} size={16} />
                     <input 
                        type="text" 
                        placeholder="Search tasks..." 
                        className={`border rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-64 transition-all ${
                            isDarkMode 
                            ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 focus:bg-slate-800' 
                            : 'bg-slate-100 border-slate-200 text-slate-700 focus:bg-white'
                        }`} 
                     />
                 </div>
                 <button className={`p-2.5 rounded-full border backdrop-blur-md transition-colors relative ${
                     isDarkMode 
                     ? 'bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700/50' 
                     : 'bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 border-slate-200'
                 }`}>
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-slate-800"></span>
                 </button>
             </div>
        </header>

        {/* Mobile Header */}
        <div className={`md:hidden flex justify-between items-center px-6 pt-12 pb-4 sticky top-0 z-20 bg-gradient-to-b ${isDarkMode ? 'from-[#0f172a] to-transparent' : 'from-white to-transparent'}`}>
          <button onClick={() => setCurrentView(AppView.SETTINGS)} className="flex items-center gap-3 text-left">
             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-[2px]">
                <div className={`w-full h-full rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                    <User size={16} className={isDarkMode ? 'text-slate-200' : 'text-slate-600'} />
                </div>
             </div>
             <div>
                 <div className="text-xs text-slate-400 font-medium">Welcome back</div>
                 <div className={`text-sm font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{userProfile.name}</div>
             </div>
          </button>
          <div className="flex gap-2">
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full border backdrop-blur-md ${isDarkMode ? 'bg-slate-800/50 text-slate-400 border-slate-700/50' : 'bg-white text-slate-600 border-slate-200 shadow-sm'}`}
            >
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className={`p-2 rounded-full border backdrop-blur-md ${isDarkMode ? 'bg-slate-800/50 text-slate-400 hover:text-white border-slate-700/50' : 'bg-white text-slate-600 border-slate-200 shadow-sm'}`}>
                <Bell size={18} />
            </button>
          </div>
        </div>

        {/* Content Scroll Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 scroll-smooth relative">
           {/* Decorative background elements */}
           <div className={`absolute top-0 left-0 w-full h-96 blur-[100px] pointer-events-none -z-10 ${isDarkMode ? 'bg-blue-500/5' : 'bg-blue-500/10'}`}></div>
           
           <div className="max-w-7xl mx-auto h-full">
               {/* Mobile Nav (Top) */}
               <div className="md:hidden mb-2">
                   <Navigation currentView={currentView} onChangeView={setCurrentView} orientation="horizontal" isDarkMode={isDarkMode} />
               </div>
               
               {renderView()}
           </div>
        </main>
      </div>

      <AIChat />
    </div>
  );
};

export default App;