
import React from 'react';
import { AppView } from '../types';
import { Coffee, ListTodo, CheckSquare, Rocket, PieChart, Briefcase } from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  orientation?: 'horizontal' | 'vertical';
  isDarkMode?: boolean;
  isCollapsed?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView, orientation = 'horizontal', isDarkMode = true, isCollapsed = false }) => {
  const tabs = [
    { id: AppView.FOCUS, label: 'Focus', icon: Coffee },
    { id: AppView.TODOS, label: 'Personal', icon: ListTodo },
    { id: AppView.WORK, label: 'Work Board', icon: Briefcase },
    { id: AppView.HABITS, label: 'Habits', icon: CheckSquare },
    { id: AppView.ANALYTICS, label: 'Analytics', icon: PieChart },
    { id: AppView.BOOST, label: 'Boost', icon: Rocket },
  ];

  if (orientation === 'vertical') {
    return (
      <nav className="flex flex-col gap-2 w-full">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeView(tab.id)}
              title={isCollapsed ? tab.label : undefined}
              className={`flex items-center transition-all duration-200 group relative overflow-hidden ${
                isCollapsed ? 'justify-center px-2 py-3 rounded-xl' : 'gap-3 px-4 py-3 rounded-xl'
              } ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : isDarkMode 
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon size={20} className={`${isActive ? 'stroke-2' : 'stroke-1.5'} transition-transform group-hover:scale-110 relative z-10`} />
              {!isCollapsed && (
                <span className="font-medium text-sm relative z-10 animate-fade-in">{tab.label}</span>
              )}
              {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />}
            </button>
          );
        })}
      </nav>
    );
  }

  // Horizontal (Mobile)
  return (
    <div className={`backdrop-blur-xl p-1.5 rounded-2xl flex justify-between items-center mb-6 border shadow-xl sticky top-0 z-30 overflow-x-auto ${
        isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-200'
    }`}>
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeView(tab.id)}
            className={`flex flex-col items-center justify-center py-2.5 px-2 flex-1 min-w-[60px] rounded-xl transition-all duration-300 relative overflow-hidden ${
              isActive
                ? isDarkMode ? 'bg-slate-700/80 text-blue-400 shadow-inner' : 'bg-blue-50 text-blue-600 shadow-inner'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon size={20} className={`mb-1 relative z-10 ${isActive ? 'stroke-2 scale-110' : 'stroke-1.5'} transition-all`} />
            <span className="text-[10px] font-medium relative z-10 whitespace-nowrap">{tab.label}</span>
            {isActive && <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent" />}
          </button>
        );
      })}
    </div>
  );
};

export default Navigation;
