import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Target, CheckCircle, XCircle, Star, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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

  const totalXP = history.reduce((acc, curr) => acc + (curr.xp_awarded || 0), 0);
  const wonQuests = history.filter(h => h.status === 'won').length;

  return (
    <div className="min-h-screen bg-[#1a1b22] text-white pt-24 pb-12 px-6 font-['Space_Grotesk']">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-[#21222b] rounded-2xl p-8 border border-[#ae97d6]/20 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ae97d6]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-black/50 border-2 border-[#ae97d6] flex items-center justify-center shadow-[0_0_20px_rgba(174,151,214,0.3)]">
                <User size={40} className="text-[#ae97d6]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-['Orbitron'] text-white tracking-wide">
                  {profile?.full_name || 'TITAN'}
                </h1>
                <div className="flex flex-col gap-1 mt-2 font-mono text-sm">
                  <span className="text-[#8c8d96]">ID: {user?.id.substring(0,8)}...</span>
                  <span className="text-[#00f3ff] uppercase tracking-widest font-bold">ROLE: {profile?.role}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="bg-black/30 border border-[#31333e] rounded-lg p-4 flex gap-6 text-center">
                <div>
                  <div className="text-xs text-[#8c8d96] font-mono mb-1">TOTAL XP</div>
                  <div className="text-2xl font-bold text-[#ae97d6]">{totalXP}</div>
                </div>
                <div className="w-px bg-[#31333e]"></div>
                <div>
                  <div className="text-xs text-[#8c8d96] font-mono mb-1">QUESTS WON</div>
                  <div className="text-2xl font-bold text-green-400">{wonQuests}</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors font-mono"
              >
                <LogOut size={16} /> SECURE LOGOUT
              </button>
            </div>
          </div>
        </div>

        {/* Quest History Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-[#31333e] pb-4 flex items-center gap-3 font-mono">
            <Shield className="text-[#00f3ff] w-6 h-6" />
            YOUR QUEST HISTORY
          </h2>
          
          <div className="bg-[#21222b] p-6 rounded-xl border border-white/5">
            {loading ? (
              <p className="text-[#8c8d96] text-sm font-mono text-center animate-pulse">Syncing data...</p>
            ) : history.length === 0 ? (
              <p className="text-gray-500 text-sm font-mono text-center py-8">No quest history recorded.</p>
            ) : (
              <div className="space-y-3">
                {history.map((record, idx) => {
                  const isWon = record.status === 'won';
                  const isLost = record.status === 'lost';
                  
                  let statusClass = "text-gray-400";
                  let borderClass = "border-[#31333e] bg-black/20";
                  let Icon = Target;
                  
                  if (isWon) {
                    statusClass = "text-green-500 font-bold";
                    borderClass = "border-green-500/30 bg-green-500/5";
                    Icon = CheckCircle;
                  } else if (isLost) {
                    statusClass = "text-red-500 font-bold";
                    borderClass = "border-red-500/30 bg-red-500/5";
                    Icon = XCircle;
                  } else {
                    statusClass = "text-yellow-400";
                    Icon = Star;
                  }

                  return (
                    <div key={idx} className={`flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-lg border ${borderClass} transition-colors`}>
                      <div className="mb-3 sm:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={statusClass} size={18} />
                          <span className="font-bold text-white tracking-wide">
                            {record.quests?.title || 'Unknown Quest'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono pl-6">
                          {new Date(record.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                        <span className={`text-xs uppercase tracking-widest ${statusClass}`}>
                          {record.status}
                        </span>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 font-mono mb-1">XP EARNED</div>
                          <span className="font-bold text-[#ae97d6]">+{record.xp_awarded}</span>
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
