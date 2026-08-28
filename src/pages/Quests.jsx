import React, { useEffect, useState } from 'react';
import { Trophy, Star, Target, Award } from 'lucide-react';
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
    <div className="home-body min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center text-center mb-16 reveal in-view">
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="text-[#00f3ff] w-12 h-12" />
            <h1 className="text-3xl md:text-5xl font-black title-tech tracking-tight">QUEST BOARD</h1>
          </div>
          <p className="text-gray-400 max-w-2xl font-mono text-sm leading-relaxed mt-4">
            Complete bounties, solve challenges, and rise through the ranks of the Tech Titans network.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Available Bounties */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Quests List */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-[#31333e] pb-4 flex items-center gap-3 font-mono">
                <Target className="text-[#b89eff] w-6 h-6" />
                AVAILABLE BOUNTIES
              </h2>
              
              <div className="grid gap-6">
                {quests.length === 0 ? (
                  <p className="text-gray-500 font-mono text-sm">No active bounties this week. Stay tuned!</p>
                ) : (
                  quests.map(quest => (
                    <div key={quest.id} className="glass-panel p-6 rounded-xl flex flex-col group border border-white/5 hover:border-[#b89eff]/30 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="flex-1 pr-6 mb-4 sm:mb-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold font-mono text-white group-hover:text-[#00f3ff] transition-colors">{quest.title}</h3>
                            <span className="text-[10px] uppercase px-2 py-0.5 rounded border border-[#31333e] text-gray-400">{quest.difficulty}</span>
                            {quest.active_week && (
                              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[#b89eff]/10 text-[#b89eff]">Week {quest.active_week}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-4">{quest.description}</p>
                          
                          <div className="bg-black/30 rounded p-3 text-xs font-mono text-gray-300 border border-white/5 inline-block">
                            <span className="text-[#00f3ff] font-bold">REWARDS:</span> {quest.rewards || "Admin Recognition"}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center shrink-0 bg-black/40 p-4 rounded-lg border border-[#31333e] group-hover:border-[#ff007f]/40 min-w-[120px]">
                          <Star className="text-[#ff007f] mb-1 group-hover:scale-110 transition-transform" size={24} />
                          <div className="text-center">
                            <span className="font-bold text-lg text-white font-mono">{quest.base_xp} XP</span>
                            <div className="text-[10px] uppercase text-green-400 font-bold tracking-widest mt-1">
                              + {quest.bonus_xp} Win Bonus
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
          <div className="glass-panel border border-[#00f3ff]/20 p-6 rounded-xl h-fit relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00f3ff]/10 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
            
            <h2 className="text-xl font-bold text-white mb-6 border-b border-[#31333e] pb-4 flex items-center gap-3 font-mono relative z-10">
              <Trophy className="text-yellow-400 w-6 h-6" />
              GLOBAL RANKINGS
            </h2>
            
            <div className="space-y-4 relative z-10">
              {leaderboard.length === 0 ? (
                <p className="text-center text-sm font-mono text-gray-500 py-4">Leaderboard is empty.</p>
              ) : (
                leaderboard.map((userObj, idx) => (
                  <div key={userObj.id || idx} className="flex flex-col p-4 bg-[#16171d]/80 rounded-lg border border-transparent hover:border-[#00f3ff]/30 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold font-mono text-lg w-6 text-center ${idx === 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-[#cd7f32]' : 'text-gray-600'}`}>
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-white font-mono truncate max-w-[120px]">{userObj.profiles?.full_name || 'Unknown'}</span>
                      </div>
                      <span className="text-[#00f3ff] font-bold font-mono">{userObj.total_points} XP</span>
                    </div>
                    
                    {/* Reward Badge Display */}
                    <div className="flex items-center gap-2 mt-1">
                      {idx === 0 && (
                        <span className="text-[10px] flex items-center gap-1 uppercase px-2 py-1 bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 rounded">
                          <Award size={12} /> Grand Champion Reward
                        </span>
                      )}
                      {idx > 0 && idx < 5 && (
                        <span className="text-[10px] flex items-center gap-1 uppercase px-2 py-1 bg-[#b89eff]/10 text-[#b89eff] border border-[#b89eff]/30 rounded">
                          <Award size={12} /> Elite Tier Reward
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
