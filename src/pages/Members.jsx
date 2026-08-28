import React, { useEffect, useState } from 'react';
import { membersData } from '../data/members';
import { X, User } from 'lucide-react';
import './Home.css';

export default function Members() {
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    // Simulate network load
    setTimeout(() => setLoading(false), 600);
  }, []);

  // Group members by team
  const teams = [...new Set(membersData.map(m => m.team))];

  return (
    <div className="home-body min-h-screen pt-24 pb-12 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center text-center mb-16 reveal in-view">
          <span className="section-heading">TITAN OPERATIVES</span>
          <h2 className="text-3xl md:text-5xl font-black mb-6 mt-4 title-titans tracking-tight">Our Core Teams</h2>
          <p className="text-gray-400 max-w-2xl font-mono text-sm leading-relaxed">
            The minds behind the innovation. Browse our departments to see who is driving the Tech Titans forward.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b89eff]"></div>
          </div>
        ) : (
          <div className="space-y-16">
            {teams.map(team => (
              <div key={team} className="reveal in-view">
                <h3 className="text-2xl font-bold text-white mb-6 border-b border-[#31333e] pb-4 flex items-center gap-3">
                  <span className="w-2 h-6 bg-[#00f3ff] inline-block rounded"></span>
                  {team}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {membersData.filter(m => m.team === team).map(member => (
                    <button 
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className="glass-panel p-6 rounded-xl hover:-translate-y-2 hover:shadow-[0_10px_25px_rgba(0,243,255,0.15)] transition-all group border border-white/5 relative overflow-hidden text-left w-full cursor-pointer"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#b89eff]/20 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                      <div className="w-14 h-14 bg-gradient-to-br from-[#21222b] to-[#16171d] rounded-full mb-4 flex items-center justify-center border border-[#31333e] shadow-inner group-hover:border-[#00f3ff]/50 transition-colors">
                        <span className="font-mono font-bold text-xl text-[#00f3ff]">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-1 text-white group-hover:text-[#b89eff] transition-colors">{member.name}</h3>
                      <p className="text-xs text-[#00f3ff] font-mono mb-2 uppercase tracking-wider">{member.details}</p>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                        <span className="text-xs text-gray-400 font-mono">Course: {member.course}</span>
                        <span className="text-xs text-gray-400 font-mono">Yr: {member.year}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedMember(null)}>
          <div 
            className="bg-[#1a1b22] border border-[#31333e] rounded-2xl max-w-2xl w-full p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative background blur */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#b89eff]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#00f3ff]/10 rounded-full blur-3xl pointer-events-none"></div>

            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10 p-2 bg-[#21222b] rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row gap-8 relative z-10">
              {/* Photo Placeholder */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="w-32 h-32 md:w-48 md:h-48 bg-[#21222b] rounded-2xl border border-[#31333e] flex items-center justify-center mb-4 shadow-inner">
                  <User size={64} className="text-[#31333e]" />
                </div>
                <div className="w-full text-center">
                  <span className="inline-block px-3 py-1 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20 rounded text-xs font-mono tracking-wider">
                    {selectedMember.team}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="w-full md:w-2/3 flex flex-col justify-center">
                <h2 className="text-3xl font-black text-white mb-2">{selectedMember.name}</h2>
                <h4 className="text-[#b89eff] font-mono text-sm mb-6 uppercase tracking-wider">{selectedMember.details}</h4>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#21222b] p-4 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Course</p>
                    <p className="text-sm font-bold text-gray-200">{selectedMember.course}</p>
                  </div>
                  <div className="bg-[#21222b] p-4 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Year</p>
                    <p className="text-sm font-bold text-gray-200">{selectedMember.year}</p>
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                  <p className="text-[10px] text-gray-500 font-mono uppercase mb-2">Connect</p>
                  <p className="text-[#8c8d96] font-mono text-sm">Reach out via the club's official Discord or Contact Us form.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
