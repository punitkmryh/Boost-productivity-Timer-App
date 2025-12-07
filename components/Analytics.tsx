
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Clock, Download, ChevronLeft, ChevronRight, Hash, TrendingUp, Calendar, PieChart as PieChartIcon, Activity, Sparkles, Lightbulb } from 'lucide-react';
import { generateProductivityInsight, generateImprovementTips } from '../services/geminiService';

const focusData = [
  { day: 'Wed', date: 'Nov 19', hours: 5.2 },
  { day: 'Thu', date: 'Nov 20', hours: 2.1 },
  { day: 'Fri', date: 'Nov 21', hours: 3.8 },
  { day: 'Sat', date: 'Nov 22', hours: 4.5 },
  { day: 'Sun', date: 'Nov 23', hours: 7.8 },
  { day: 'Mon', date: 'Nov 24', hours: 5.5 },
  { day: 'Tue', date: 'Nov 25', hours: 5.8 },
];

const categoryData = [
  { name: 'Coding', value: 45, color: '#3b82f6' },
  { name: 'Reading', value: 25, color: '#10b981' },
  { name: 'Meeting', value: 20, color: '#f59e0b' },
  { name: 'Exercise', value: 10, color: '#ef4444' },
];

const radarData = [
  { subject: 'Focus', A: 120, fullMark: 150 },
  { subject: 'Consistency', A: 98, fullMark: 150 },
  { subject: 'Habits', A: 86, fullMark: 150 },
  { subject: 'Tasks', A: 99, fullMark: 150 },
  { subject: 'Goals', A: 85, fullMark: 150 },
  { subject: 'Energy', A: 65, fullMark: 150 },
];

const Analytics: React.FC = () => {
  const [insight, setInsight] = useState("Analyzing your productivity data...");
  const [tips, setTips] = useState<string[]>([]);

  useEffect(() => {
    generateProductivityInsight({ focusData, radarData }).then(setInsight);
    generateImprovementTips().then(setTips);
  }, []);

  const downloadReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: "Weekly Productivity Report",
      focusData,
      categoryData,
      radarData,
      totalFocusTime: "17h 50m",
      totalSessions: 26,
      aiInsight: insight,
      improvementTips: tips
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "boost_analytics_report.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="animate-fade-in pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Analytics Dashboard</h2>
          <p className="text-slate-400">Deep dive into your productivity metrics</p>
        </div>
        <button 
          onClick={downloadReport}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 w-fit"
        >
          <Download size={18} />
          <span className="font-medium text-sm">Export Data</span>
        </button>
      </div>

      {/* AI Insight Banner */}
      <div className="mb-6 p-[1px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          <div className="bg-slate-900 rounded-2xl p-4 flex items-start md:items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg shrink-0 z-10">
                  <Sparkles size={20} />
              </div>
              <div className="flex-1 z-10">
                  <h4 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-wider mb-1">AI Insight</h4>
                  <p className="text-slate-200 font-medium text-sm md:text-base leading-relaxed">
                      {insight}
                  </p>
              </div>
          </div>
      </div>

      {/* Ways to Improve Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             <Lightbulb size={20} className="text-yellow-400" /> Ways to Improve
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tips.length > 0 ? tips.map((tip, idx) => (
                <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex gap-3 items-start hover:bg-slate-800/60 transition-colors">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                    </span>
                    <p className="text-sm text-slate-300 leading-snug">{tip}</p>
                </div>
            )) : (
                <div className="col-span-3 text-slate-500 text-sm italic">Loading tips...</div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
         {/* Main Chart */}
         <div className="lg:col-span-2 glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-600/10 transition-colors"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <TrendingUp size={20} className="text-blue-400" />
                 </div>
                 <h3 className="text-lg font-bold text-white">Focus Activity</h3>
              </div>
              <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                 <button className="px-3 py-1 text-xs font-medium text-white bg-slate-700 rounded shadow-sm">Weekly</button>
                 <button className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white transition-colors">Monthly</button>
              </div>
            </div>
            
            <div className="h-72 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={focusData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(value) => `${value}h`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorHours)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Category Distribution */}
         <div className="glass-panel rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4 relative z-10">
                 <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <PieChartIcon size={20} className="text-emerald-400" />
                 </div>
                 <h3 className="text-lg font-bold text-white">Time Distribution</h3>
            </div>
            <div className="flex-1 min-h-[200px] relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      cornerRadius={6}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }} />
                 </PieChart>
               </ResponsiveContainer>
               {/* Center Metric */}
               <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                  <span className="text-3xl font-bold text-white">45%</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Coding</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Productivity Radar */}
          <div className="glass-panel rounded-3xl p-6 shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Activity size={20} className="text-purple-400" />
                 </div>
                 <h3 className="text-lg font-bold text-white">Performance Radar</h3>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="none" />
                    <Radar
                        name="Performance"
                        dataKey="A"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="#8b5cf6"
                        fillOpacity={0.4}
                        animationDuration={1500}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl hover:bg-slate-800/40 transition-all group cursor-default">
                <div className="flex items-center gap-2 mb-3 text-blue-400 text-xs font-bold uppercase tracking-wider">
                    <Clock size={14} className="group-hover:rotate-12 transition-transform" /> Time Today
                </div>
                <div className="text-3xl font-bold text-white mb-1">1h 54m</div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="text-emerald-400 font-bold">+12%</span> vs yesterday
                </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl hover:bg-slate-800/40 transition-all group cursor-default">
                <div className="flex items-center gap-2 mb-3 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Hash size={14} className="group-hover:rotate-12 transition-transform" /> Sessions
                </div>
                <div className="text-3xl font-bold text-white mb-1">3</div>
                <div className="text-xs text-slate-500">4 sessions started</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl hover:bg-slate-800/40 transition-all group cursor-default">
                <div className="flex items-center gap-2 mb-3 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Calendar size={14} className="group-hover:rotate-12 transition-transform" /> Weekly Avg
                </div>
                <div className="text-3xl font-bold text-white mb-1">2h 30m</div>
                <div className="text-xs text-slate-500">Peak on Sunday</div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-violet-600 p-5 rounded-2xl border border-white/10 shadow-lg shadow-blue-900/40 group relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex items-center gap-2 mb-3 text-blue-100 text-xs font-bold uppercase tracking-wider relative z-10">
                    <TrendingUp size={14} className="group-hover:scale-110 transition-transform" /> Boost Score
                </div>
                <div className="text-4xl font-bold text-white mb-1 relative z-10">850</div>
                <div className="text-xs text-blue-100/80 relative z-10 font-medium">Top 5% of users</div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Analytics;
