import React, { useEffect, useState } from 'react';
import { Trophy, Star, Award } from 'lucide-react';
import { questService } from '../services/questService';
import './Home.css';

export default function Quests() {
  const [quests, setQuests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [questsData, leaderboardData] = await Promise.all([
          questService.fetchActiveQuests(),
          questService.fetchLeaderboard()
        ]);
        
        setQuests(questsData || []);
        setLeaderboard(leaderboardData || []);
      } catch (error) {
        console.error("Failed to fetch quests data:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="home-body min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16 reveal in-view">
          <span className="text-accent font-mono text-xs font-bold uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
            <Trophy className="text-[#00f3ff] w-4 h-4" />
            OPERATIVE BOUNTIES & CHALLENGES
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 flex items-center justify-center gap-3">
            <span className="title-tech">QUEST</span>
            <span className="title-titans">BOARD</span>
          </h1>
          <p className="text-[#8c8d96] max-w-2xl font-mono text-xs sm:text-sm leading-relaxed">
            Complete technical bounties, solve challenges, and rise through the ranks of the Tech Titans network.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Available Bounties */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <h2 className="section-heading text-xl">AVAILABLE BOUNTIES</h2>
              
              <div className="grid gap-6">
                {quests.length === 0 ? (
                  <div className="glass-panel p-8 text-center text-[#8c8d96] font-mono text-sm">
                    No active bounties this week. Stay tuned for new deployments!
                  </div>
                ) : (
                  quests.map(quest => (
                    <div key={quest.id} className="glass-panel p-6 sm:p-8 rounded-xl flex flex-col group border border-white/5 hover:border-[#b89eff]/30 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-lg sm:text-xl font-bold font-['Orbitron'] text-white group-hover:text-[#00f3ff] transition-colors tracking-wide">
                              {quest.title}
                            </h3>
                            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border border-[#31333e] text-gray-300 font-semibold bg-black/30">
                              {quest.difficulty}
                            </span>
                            {quest.active_week && (
                              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-[#b89eff]/10 text-[#b89eff] border border-[#b89eff]/30 font-semibold">
                                Week {quest.active_week}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#8c8d96] leading-relaxed mb-4">{quest.description}</p>
                          
                          <div className="bg-black/30 rounded-lg px-3.5 py-2 text-xs font-mono text-gray-300 border border-white/5 inline-block">
                            <span className="text-[#00f3ff] font-bold">REWARD:</span> {quest.rewards || "Admin Recognition"}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center shrink-0 bg-black/40 p-5 rounded-xl border border-[#31333e] group-hover:border-[#ff007f]/40 min-w-[130px] self-stretch sm:self-auto justify-center">
                          <Star className="text-[#ff007f] mb-1.5 group-hover:scale-110 transition-transform" size={22} />
                          <div className="text-center">
                            <span className="font-bold text-xl text-white font-['Orbitron'] tracking-wide">{quest.base_xp} XP</span>
                            <div className="text-[10px] uppercase text-green-400 font-mono font-bold tracking-wider mt-1">
                              +{quest.bonus_xp} Win Bonus
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Leaderboard */}
          <div>
            <h2 className="section-heading text-xl">GLOBAL RANKINGS</h2>
            
            <div className="glass-panel border border-[#00f3ff]/20 p-6 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00f3ff]/10 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="space-y-3 relative z-10">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-sm font-mono text-gray-500 py-6">Leaderboard is empty.</p>
                ) : (
                  leaderboard.map((userObj, idx) => {
                    const displayName = userObj.full_name || userObj.profiles?.full_name || userObj.username || 'Titan Operative';
                    return (
                      <div key={userObj.id || idx} className="flex flex-col p-3.5 bg-[#16171d]/80 rounded-lg border border-white/5 hover:border-[#00f3ff]/30 transition-colors">
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-3">
                            <span className={`font-bold font-mono text-base w-6 text-center ${idx === 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-[#cd7f32]' : 'text-gray-600'}`}>
                              #{idx + 1}
                            </span>
                            <span className="font-bold text-white font-mono text-sm truncate max-w-[140px]">{displayName}</span>
                          </div>
                          <span className="text-[#00f3ff] font-bold font-mono text-sm">{userObj.total_points || 0} XP</span>
                        </div>
                        
                        {/* Reward Badge */}
                        <div className="flex items-center gap-2 mt-0.5">
                          {idx === 0 && (
                            <span className="text-[10px] font-mono flex items-center gap-1 uppercase px-2 py-0.5 bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 rounded font-semibold">
                              <Award size={11} /> Grand Champion
                            </span>
                          )}
                          {idx > 0 && idx < 5 && (
                            <span className="text-[10px] font-mono flex items-center gap-1 uppercase px-2 py-0.5 bg-[#b89eff]/10 text-[#b89eff] border border-[#b89eff]/30 rounded font-semibold">
                              <Award size={11} /> Elite Tier
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
