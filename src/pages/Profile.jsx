import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, CheckCircle, XCircle, Star, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { questService } from '../services/questService';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (user) {
        try {
          const userHistory = await questService.fetchUserHistory(user.id);
          setHistory(userHistory || []);
        } catch (err) {
          console.error("Failed to load user history:", err);
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/home');
  };

  const totalXP = (profile?.xp || 0) + history.reduce((acc, curr) => acc + (curr.xp_awarded || 0), 0);
  const wonQuests = history.filter(h => h.status === 'won').length;

  return (
    <div className="home-body min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="glass-panel p-8 sm:p-10 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ae97d6]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="w-24 h-24 rounded-full bg-black/60 border-2 border-[#ae97d6] flex items-center justify-center shadow-[0_0_20px_rgba(174,151,214,0.3)] shrink-0">
                <User size={42} className="text-[#ae97d6]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-['Orbitron'] text-white tracking-wide mb-1">
                  {profile?.full_name || user?.user_metadata?.full_name || 'TITAN OPERATIVE'}
                </h1>
                <div className="flex flex-col gap-1 mt-2 font-mono text-xs sm:text-sm">
                  <span className="text-[#8c8d96]">OPERATIVE ID: {user?.id?.substring(0, 8)}...</span>
                  <span className="text-[#00f3ff] uppercase tracking-widest font-bold">
                    ROLE: {profile?.role || 'member'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
              <div className="bg-black/40 border border-[#31333e] rounded-xl p-4 flex gap-6 text-center w-full sm:w-auto justify-center">
                <div>
                  <div className="text-[11px] text-[#8c8d96] font-mono mb-1 uppercase tracking-wider">TOTAL XP</div>
                  <div className="text-2xl font-black font-['Orbitron'] text-[#ae97d6]">{totalXP}</div>
                </div>
                <div className="w-px bg-[#31333e]"></div>
                <div>
                  <div className="text-[11px] text-[#8c8d96] font-mono mb-1 uppercase tracking-wider">QUESTS WON</div>
                  <div className="text-2xl font-black font-['Orbitron'] text-green-400">{wonQuests}</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors font-mono cursor-pointer uppercase tracking-wider py-1.5 px-3 rounded border border-white/5 hover:border-red-500/30"
              >
                <LogOut size={14} /> SECURE LOGOUT
              </button>
            </div>
          </div>
        </div>

        {/* Quest History Section */}
        <div className="space-y-6">
          <h2 className="section-heading text-xl">YOUR QUEST HISTORY</h2>
          
          <div className="glass-panel p-6 rounded-xl border border-white/5">
            {loading ? (
              <p className="text-[#8c8d96] text-sm font-mono text-center py-6 animate-pulse">Syncing quest telemetry...</p>
            ) : history.length === 0 ? (
              <p className="text-[#8c8d96] text-sm font-mono text-center py-8">No quest deployments recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {history.map((record, idx) => {
                  const isWon = record.status === 'won';
                  const isLost = record.status === 'lost';
                  
                  let statusClass = "text-gray-400";
                  let borderClass = "border-[#31333e] bg-black/20";
                  let Icon = Target;
                  
                  if (isWon) {
                    statusClass = "text-green-400 font-bold";
                    borderClass = "border-green-500/30 bg-green-500/5";
                    Icon = CheckCircle;
                  } else if (isLost) {
                    statusClass = "text-red-400 font-bold";
                    borderClass = "border-red-500/30 bg-red-500/5";
                    Icon = XCircle;
                  } else {
                    statusClass = "text-yellow-400";
                    Icon = Star;
                  }

                  return (
                    <div key={record.id || idx} className={`flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-lg border ${borderClass} transition-colors gap-3`}>
                      <div>
                        <div className="flex items-center gap-2.5 mb-1">
                          <Icon className={statusClass} size={18} />
                          <span className="font-bold text-white font-['Orbitron'] text-sm sm:text-base tracking-wide">
                            {record.quests?.title || 'Classified Quest'}
                          </span>
                        </div>
                        <div className="text-xs text-[#8c8d96] font-mono pl-7">
                          DEPLOYED: {new Date(record.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 pl-7 sm:pl-0">
                        <span className={`text-xs font-mono uppercase tracking-widest ${statusClass}`}>
                          {record.status}
                        </span>
                        <div className="text-right">
                          <div className="text-[10px] text-[#8c8d96] font-mono uppercase">XP EARNED</div>
                          <span className="font-bold font-['Orbitron'] text-[#ae97d6] text-base">+{record.xp_awarded}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
