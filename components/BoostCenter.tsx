
import React, { useState } from 'react';
import { Trophy, Zap, Award, Flame, Timer, Wind, ChevronRight, Activity, Medal, Star } from 'lucide-react';

const BoostCenter: React.FC = () => {
  const [activeBoost, setActiveBoost] = useState<string | null>(null);

  const leaderboard = [
    { name: "Jake.0", xp: 12500, rank: 1, avatar: "bg-blue-500" },
    { name: "Sarah K.", xp: 11200, rank: 2, avatar: "bg-purple-500" },
    { name: "Mike D.", xp: 10850, rank: 3, avatar: "bg-emerald-500" },
    { name: "Alex R.", xp: 9500, rank: 4, avatar: "bg-amber-500" },
    { name: "You", xp: 850, rank: 142, avatar: "bg-indigo-500" },
  ];

  const badges = [
    { name: "Early Bird", desc: "Complete a task before 7 AM", icon: <Star size={16} />, earned: true, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { name: "Streak Master", desc: "7 day habit streak", icon: <Flame size={16} />, earned: true, color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
    { name: "Deep Work", desc: "4h focus session", icon: <Timer size={16} />, earned: false, color: "text-slate-500 bg-slate-800 border-slate-700" },
    { name: "Zen Master", desc: "10 breaks taken", icon: <Wind size={16} />, earned: false, color: "text-slate-500 bg-slate-800 border-slate-700" },
  ];

  return (
    <div className="animate-fade-in pb-20 md:pb-8">
       <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Boost Center</h2>
          <p className="text-slate-400">Gamify your productivity & recharge</p>
        </div>
        
        <div className="glass-panel px-5 py-2 rounded-xl flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-full">
                <Medal className="text-yellow-500" size={20} />
            </div>
            <div>
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Your Rank</div>
                <div className="text-xl font-bold text-white">#142 <span className="text-sm font-normal text-slate-500">Top 5%</span></div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Boosts */}
          <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-blue-400" /> Quick Boosts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Breathing Boost */}
                    <button 
                        onClick={() => setActiveBoost('breathing')}
                        className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-left shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 text-white">
                                <Wind size={24} />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-1">Box Breathing</h4>
                            <p className="text-blue-100 text-sm mb-4">2 min to reduce stress & regain focus.</p>
                            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white">
                                Start <ChevronRight size={12} className="ml-1" />
                            </span>
                        </div>
                    </button>

                    {/* Stretch Boost */}
                    <button className="group relative overflow-hidden bg-slate-800 rounded-3xl p-6 text-left border border-slate-700 hover:border-slate-500 transition-all active:scale-95">
                         <div className="relative z-10">
                            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center mb-4 text-emerald-400">
                                <Activity size={24} />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-1">Desk Stretch</h4>
                            <p className="text-slate-400 text-sm mb-4">5 min routine to loosen up.</p>
                            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider bg-slate-700 px-3 py-1 rounded-full text-white group-hover:bg-emerald-500 transition-colors">
                                Start <ChevronRight size={12} className="ml-1" />
                            </span>
                        </div>
                    </button>
                </div>
              </section>

              <section>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Award size={20} className="text-amber-400" /> Badges & Achievements
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {badges.map((badge, idx) => (
                          <div key={idx} className={`rounded-2xl p-4 border flex flex-col items-center text-center ${badge.color}`}>
                              <div className="mb-3 p-2 rounded-full bg-current/10">
                                  {badge.icon}
                              </div>
                              <div className="font-bold text-sm mb-1 text-slate-200">{badge.name}</div>
                              <div className="text-[10px] opacity-70 text-slate-400 leading-tight">{badge.desc}</div>
                          </div>
                      ))}
                  </div>
              </section>
          </div>

          {/* Leaderboard */}
          <div className="glass-panel rounded-3xl p-6 h-fit border-slate-700/50">
             <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <Trophy size={20} className="text-yellow-400" /> Leaderboard
                 </h3>
                 <span className="text-xs font-bold text-slate-500 uppercase">Weekly</span>
             </div>
             
             <div className="space-y-4">
                 {leaderboard.map((user, idx) => (
                     <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${user.name === 'You' ? 'bg-blue-600/10 border border-blue-500/30' : 'hover:bg-slate-800/50'}`}>
                         <div className={`w-6 text-center font-bold ${idx < 3 ? 'text-yellow-400' : 'text-slate-500'}`}>
                             {user.rank}
                         </div>
                         <div className={`w-8 h-8 rounded-full ${user.avatar} flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-900`}>
                             {user.name.charAt(0)}
                         </div>
                         <div className="flex-1 min-w-0">
                             <div className={`text-sm font-bold truncate ${user.name === 'You' ? 'text-blue-400' : 'text-white'}`}>{user.name}</div>
                             <div className="text-xs text-slate-500">{user.xp.toLocaleString()} XP</div>
                         </div>
                         {idx === 0 && <Trophy size={16} className="text-yellow-400" />}
                     </div>
                 ))}
             </div>
             <button className="w-full mt-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold text-slate-300 transition-colors">
                 View Full Rankings
             </button>
          </div>

      </div>

      {/* Boost Overlay (Mockup for Breathing) */}
      {activeBoost === 'breathing' && (
          <div className="fixed inset-0 z-[60] bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
              <div className="text-center max-w-md w-full">
                  <div className="w-64 h-64 mx-auto bg-blue-500/20 rounded-full mb-12 relative flex items-center justify-center animate-breathe">
                      <div className="w-48 h-48 bg-blue-500/40 rounded-full blur-xl absolute"></div>
                      <div className="text-2xl font-bold text-white relative z-10">Breathe In...</div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Box Breathing</h2>
                  <p className="text-slate-400 mb-8">Follow the rhythm to center your mind.</p>
                  <button 
                    onClick={() => setActiveBoost(null)}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                  >
                      End Session
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default BoostCenter;
