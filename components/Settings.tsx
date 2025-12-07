
import React, { useState } from 'react';
import { User, Bell, Save, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsProps {
    profile: UserProfile;
    onUpdateProfile: (p: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdateProfile }) => {
  const [localProfile, setLocalProfile] = useState(profile);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weeklyReport: false
  });

  const handleSave = () => {
    onUpdateProfile(localProfile);
    const btn = document.getElementById('save-btn');
    if (btn) {
        btn.innerText = 'Saved!';
        setTimeout(() => { btn.innerText = 'Save Changes' }, 2000);
    }
  };

  return (
    <div className="animate-fade-in pb-20 md:pb-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-1">Settings</h2>
        <p className="text-slate-400">Manage your profile and app preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 shadow-xl flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[3px] mb-4">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                        <User size={40} className="text-slate-200" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-white">{localProfile.name}</h3>
                <p className="text-sm text-slate-400 mb-6">{localProfile.email}</p>
                
                <button className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2 mb-2">
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </div>

        {/* Edit Forms */}
        <div className="md:col-span-2 space-y-6">
            
            {/* Account Details */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <User size={20} className="text-blue-400" /> Account Details
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                            <input 
                                type="text" 
                                value={localProfile.name}
                                onChange={(e) => setLocalProfile({...localProfile, name: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                            <input 
                                type="email" 
                                value={localProfile.email}
                                onChange={(e) => setLocalProfile({...localProfile, email: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bio</label>
                        <textarea 
                            value={localProfile.bio}
                            onChange={(e) => setLocalProfile({...localProfile, bio: e.target.value})}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all h-24 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Bell size={20} className="text-blue-400" /> Notifications
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-xl transition-colors">
                        <span className="text-slate-300">Email Notifications</span>
                        <button 
                            onClick={() => setNotifications({...notifications, email: !notifications.email})}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications.email ? 'bg-blue-600' : 'bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-xl transition-colors">
                        <span className="text-slate-300">Push Notifications</span>
                        <button 
                            onClick={() => setNotifications({...notifications, push: !notifications.push})}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications.push ? 'bg-blue-600' : 'bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifications.push ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button 
                    id="save-btn"
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 font-bold"
                >
                    <Save size={18} />
                    Save Changes
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
