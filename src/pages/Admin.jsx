import React, { useEffect, useState } from 'react';
import { Shield, Users, Activity, CheckCircle, XCircle, Star, Database, Plus, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { questService } from '../services/questService';
import { eventService } from '../services/eventService';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const { user, profile } = useAuth();
  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Quest Form State
  const [questForm, setQuestForm] = useState({ title: '', description: '', difficulty: 'Beginner', base_xp: 0, rewards: '' });
  const [questStatus, setQuestStatus] = useState('');

  // New Event Form State
  const [eventForm, setEventForm] = useState({ title: '', description: '', event_date: '', status: 'upcoming' });
  const [eventImage, setEventImage] = useState(null);
  const [eventStatus, setEventStatus] = useState('');

  // Access Code State
  const [accessCode, setAccessCode] = useState('');
  const [accessStatus, setAccessStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setLoading(true);
        setError(null);
        
        const [profilesData, historyData] = await Promise.all([
          questService.fetchAllProfiles(),
          questService.fetchAllQuestHistory()
        ]);
        
        setMembers(profilesData || []);
        setHistory(historyData || []);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  const handleCreateQuest = async (e) => {
    e.preventDefault();
    setQuestStatus('Submitting...');
    try {
      await questService.insertQuest({
        ...questForm,
        base_xp: parseInt(questForm.base_xp, 10),
        status: 'Active'
      });
      setQuestStatus('Quest created successfully!');
      setQuestForm({ title: '', description: '', difficulty: 'Beginner', base_xp: 0, rewards: '' });
      setTimeout(() => setQuestStatus(''), 3000);
    } catch (err) {
      setQuestStatus('Error: ' + err.message);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setEventStatus('Submitting...');
    try {
      let image_url = null;
      if (eventImage) {
        setEventStatus('Uploading image...');
        image_url = await eventService.uploadImage(eventImage);
      }

      setEventStatus('Saving event...');
      await eventService.insertEvent({
        ...eventForm,
        image_url
      });
      setEventStatus('Event published successfully!');
      setEventForm({ title: '', description: '', event_date: '', status: 'upcoming' });
      setEventImage(null);
      setTimeout(() => setEventStatus(''), 3000);
    } catch (err) {
      setEventStatus('Error: ' + err.message);
    }
  };

  const handleAccessCode = async (e) => {
    e.preventDefault();
    setAccessStatus('Verifying...');
    const correctCode = import.meta.env.VITE_ADMIN_ACCESS_CODE;
    
    if (!correctCode) {
      setAccessStatus('Error: VITE_ADMIN_ACCESS_CODE is not set in .env');
      return;
    }

    if (accessCode.trim() === correctCode) {
      try {
        let { data, error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id).select();
        if (error) throw error;
        
        if (!data || data.length === 0) {
          // Profile doesn't exist (Legacy account before trigger was added).
          // We will create it right now!
          const { data: insertData, error: insertError } = await supabase.from('profiles').insert([{
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
            role: 'admin',
            xp: 0
          }]).select();

          if (insertError) throw new Error('Failed to create missing profile: ' + insertError.message);
          data = insertData;
        }

        setAccessStatus('Access Granted! Reloading...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setAccessStatus('Error: ' + err.message);
      }
    } else {
      setAccessStatus('Invalid Access Code');
    }
  };

  if (profile?.role !== 'admin' && profile?.role !== 'head') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-24 relative overflow-hidden">
        <div className="anchor-glow" style={{ width: '500px', height: '500px', top: '-180px', left: '-140px', background: 'radial-gradient(circle, rgba(174,151,214,0.4), transparent 70%)' }}></div>
        <div className="anchor-glow" style={{ width: '420px', height: '420px', bottom: '-100px', right: '-160px', background: 'radial-gradient(circle, rgba(220,38,38,0.2), transparent 70%)', animationDelay: '3s' }}></div>

        <div className="max-w-md w-full glass-panel p-8 relative overflow-hidden z-10">
          <h2 className="text-3xl font-black text-white text-center mb-6 tracking-tight">
            ADMIN ACCESS
          </h2>
          {accessStatus && (
            <div className={`p-3 rounded-lg mb-6 text-sm text-center ${accessStatus.includes('Error') || accessStatus.includes('Invalid') ? 'bg-red-500/10 border border-red-500/50 text-red-400' : 'bg-[#ae97d6]/10 border border-[#ae97d6]/50 text-[#ae97d6]'}`}>
              {accessStatus}
            </div>
          )}
          <form onSubmit={handleAccessCode} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Access Code</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="input-glass w-full pr-10"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn-keycap w-full py-4 text-sm rounded-lg mt-2 !bg-red-500 !text-white !shadow-[inset_0px_2px_4px_rgba(255,255,255,0.4),0px_6px_0px_#7f1d1d,0px_12px_20px_rgba(0,0,0,0.6)] hover:scale-[1.02] transition-transform"
            >
              VERIFY ACCESS
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1b22] text-white pt-24 pb-12 px-6 font-['Space_Grotesk']">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Shield className="text-[#ae97d6] w-10 h-10" />
          <h1 className="text-4xl font-bold font-['Orbitron'] text-[#ae97d6]">ADMINISTRATIVE OVERRIDE</h1>
        </div>
        <p className="text-[#8c8d96] font-['JetBrains_Mono'] mb-8">
          Logged in as: <span className="text-white font-bold">{profile?.full_name || 'System Admin'}</span> | Access Granted
        </p>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 font-mono text-sm">
            ERROR: {error}
          </div>
        )}
        
        {loading ? (
          <p className="font-['JetBrains_Mono'] animate-pulse text-[#ae97d6]">Fetching global records...</p>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Member Directory */}
              <div className="bg-[#21222b] rounded-xl p-6 border border-[#ae97d6]/20 flex flex-col h-[400px]">
                <h2 className="text-xl font-bold font-['Orbitron'] mb-4 flex items-center gap-3 border-b border-[#ae97d6]/20 pb-4">
                  <Users className="text-[#00f3ff] w-5 h-5" />
                  MEMBER DIRECTORY
                </h2>
                
                <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                  {members.length === 0 ? (
                    <p className="text-sm text-[#8c8d96] font-['JetBrains_Mono']">No members found.</p>
                  ) : (
                    members.map(member => (
                      <div key={member.id} className="p-4 bg-black/40 rounded-lg border border-white/5 hover:border-[#ae97d6]/40 transition-colors flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-white flex items-center gap-2">
                            {member.full_name || 'Unknown User'}
                            {member.role === 'admin' && <Shield size={14} className="text-yellow-400" />}
                          </h3>
                          <p className="text-xs text-gray-400 font-mono mt-1">ID: {member.id.substring(0,8)}...</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] uppercase px-2 py-1 rounded font-bold tracking-widest ${
                            member.role === 'admin' || member.role === 'head' 
                              ? 'bg-[#ae97d6]/20 text-[#ae97d6] border border-[#ae97d6]/30' 
                              : 'bg-[#31333e] text-gray-400 border border-white/10'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Global Quest Activity */}
              <div className="bg-[#21222b] rounded-xl p-6 border border-[#ae97d6]/20 flex flex-col h-[400px]">
                <h2 className="text-xl font-bold font-['Orbitron'] mb-4 flex items-center gap-3 border-b border-[#ae97d6]/20 pb-4">
                  <Activity className="text-[#ff007f] w-5 h-5" />
                  GLOBAL QUEST ACTIVITY
                </h2>
                
                <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                  {history.length === 0 ? (
                    <p className="text-sm text-[#8c8d96] font-['JetBrains_Mono']">No quest activity recorded yet.</p>
                  ) : (
                    history.map((record, idx) => {
                      const isWon = record.status === 'won';
                      const isLost = record.status === 'lost';
                      
                      let statusClass = "text-gray-400";
                      let borderClass = "border-[#31333e]";
                      let Icon = Star;
                      
                      if (isWon) {
                        statusClass = "text-green-500";
                        borderClass = "border-green-500/30 bg-green-500/5";
                        Icon = CheckCircle;
                      } else if (isLost) {
                        statusClass = "text-red-500";
                        borderClass = "border-red-500/30 bg-red-500/5";
                        Icon = XCircle;
                      } else {
                        statusClass = "text-yellow-400";
                        Icon = Activity;
                      }

                      return (
                        <div key={record.id || idx} className={`p-4 rounded-lg border ${borderClass} flex justify-between items-center`}>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={statusClass} size={16} />
                              <span className="font-bold text-white text-sm">
                                {record.quests?.title || 'Unknown Quest'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              User: <span className="text-white">{record.profiles?.full_name || 'Unknown'}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className={`text-xs uppercase font-bold tracking-widest ${statusClass}`}>
                              {record.status}
                            </span>
                            <div className="text-[10px] text-[#00f3ff] mt-1 font-mono font-bold">
                              +{record.xp_awarded} XP
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Management Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Setup New Quests */}
              <div className="bg-[#21222b] rounded-xl p-6 border border-[#ae97d6]/20">
                <h2 className="text-xl font-bold font-['Orbitron'] mb-6 flex items-center gap-3 text-white border-b border-[#ae97d6]/20 pb-4">
                  <Database className="text-[#00f3ff]" />
                  SETUP NEW QUEST
                </h2>
                <form onSubmit={handleCreateQuest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Title</label>
                    <input required type="text" value={questForm.title} onChange={e => setQuestForm({...questForm, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Description</label>
                    <textarea required value={questForm.description} onChange={e => setQuestForm({...questForm, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white h-24"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Difficulty</label>
                      <select value={questForm.difficulty} onChange={e => setQuestForm({...questForm, difficulty: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white">
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Base XP</label>
                      <input required type="number" value={questForm.base_xp} onChange={e => setQuestForm({...questForm, base_xp: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Rewards</label>
                    <input type="text" value={questForm.rewards} onChange={e => setQuestForm({...questForm, rewards: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" placeholder="e.g. Profile Badge" />
                  </div>
                  <button type="submit" className="w-full bg-[#00f3ff]/20 text-[#00f3ff] hover:bg-[#00f3ff]/40 py-2 rounded font-mono font-bold flex justify-center items-center gap-2 transition-colors border border-[#00f3ff]/50">
                    <Plus size={16} /> CREATE QUEST
                  </button>
                  {questStatus && <div className="text-sm font-mono mt-2 text-center text-[#ae97d6]">{questStatus}</div>}
                </form>
              </div>

              {/* Events Management */}
              <div className="bg-[#21222b] rounded-xl p-6 border border-[#ae97d6]/20">
                <h2 className="text-xl font-bold font-['Orbitron'] mb-6 flex items-center gap-3 text-white border-b border-[#ae97d6]/20 pb-4">
                  <Activity className="text-yellow-400" />
                  EVENTS MANAGEMENT
                </h2>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Event Title</label>
                    <input required type="text" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Description</label>
                    <textarea required value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white h-24"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Event Date</label>
                      <input required type="datetime-local" value={eventForm.event_date} onChange={e => setEventForm({...eventForm, event_date: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Status</label>
                      <select value={eventForm.status} onChange={e => setEventForm({...eventForm, status: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white">
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Event Image</label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer bg-black/40 border border-white/10 hover:border-white/30 rounded p-2 flex items-center justify-center transition-colors text-gray-300 w-12 h-12">
                        <ImageIcon size={20} />
                        <input type="file" className="hidden" accept="image/*" onChange={e => setEventImage(e.target.files[0])} />
                      </label>
                      <span className="text-sm font-mono text-gray-400 truncate flex-1">
                        {eventImage ? eventImage.name : "No image selected"}
                      </span>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/40 py-2 rounded font-mono font-bold flex justify-center items-center gap-2 transition-colors border border-yellow-400/50 mt-4">
                    <Plus size={16} /> PUBLISH EVENT
                  </button>
                  {eventStatus && <div className="text-sm font-mono mt-2 text-center text-[#ae97d6]">{eventStatus}</div>}
                </form>
              </div>
            </div>

          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(174, 151, 214, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(174, 151, 214, 0.6);
        }
      `}} />
    </div>
  );
}
