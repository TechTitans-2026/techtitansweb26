import React, { useEffect, useState } from 'react';
import { membersData } from '../data/members';
import { X, User } from 'lucide-react';
import './Home.css';

const getTeamSlots = (teamName) => {
  if (teamName === 'Cybersecurity') return 7;
  if (teamName === 'Events') return 6;
  if (teamName === 'Support Team' || teamName === 'General Members') return null;
  return 5;
};

export default function Members() {
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-16">
            {teams.map(team => {
              const teamMembers = membersData.filter((member) => member.team === team);
              const maxSlots = getTeamSlots(team);
              const openPositions = (team === 'Core Leadership' || !maxSlots)
                ? []
                : Array.from(
                    { length: Math.max(0, maxSlots - teamMembers.length) },
                    (_, index) => ({ isOpenPosition: true, slot: teamMembers.length + index + 1 })
                  );

              return (
              <div key={team} className={`reveal in-view flex flex-col h-full ${team === 'Core Leadership' ? 'lg:col-span-3' : ''}`}>
                <h3 className="text-xl font-bold text-white mb-6 border-b border-[#31333e] pb-4 flex items-center gap-3 min-h-[48px]">
                  <span className="w-2 h-6 bg-[#00f3ff] inline-block rounded shrink-0"></span>
                  <span className="truncate">{team}{team !== 'Core Leadership' && maxSlots ? ` (${maxSlots} SLOTS)` : ''}</span>
                </h3>
                <div className={team === 'Core Leadership' ? 'flex flex-row items-center justify-between sm:justify-evenly w-full max-w-3xl mx-auto px-1 sm:px-6 gap-2 sm:gap-6' : 'grid grid-cols-1 gap-3.5 w-full flex-1'}>
                  {teamMembers.map((member, idx) => (
                    <button 
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={team === 'Core Leadership'
                        ? 'glass-panel w-[30%] sm:w-44 h-auto sm:h-44 rounded-xl sm:rounded-full py-3 px-1.5 sm:p-4 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,243,255,0.15)] transition-all group border border-white/5 relative overflow-hidden text-center flex flex-col items-center justify-center cursor-pointer shrink-0'
                        : 'glass-panel p-3.5 sm:p-4 rounded-xl hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,243,255,0.15)] transition-all group border border-white/5 relative overflow-hidden text-left w-full cursor-pointer flex flex-row items-center gap-3.5 min-h-[100px] sm:min-h-[104px]'}
                    >
                      {team !== 'Core Leadership' && team !== 'General Members' && team !== 'Support Team' && (
                        idx === 0 ? (
                          <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 text-[8px] sm:text-[9px] font-mono px-1 sm:px-1.5 py-0.5 rounded border border-[#b89eff]/50 text-[#b89eff] bg-[#b89eff]/10 tracking-wider shrink-0 font-semibold leading-none z-10">[LEAD]</span>
                        ) : (member.isCoLead || member.name.toLowerCase().includes('eldho paul')) ? (
                          <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 text-[8px] sm:text-[9px] font-mono px-1 sm:px-1.5 py-0.5 rounded border border-[#b89eff]/50 text-[#b89eff] bg-[#b89eff]/10 tracking-wider shrink-0 font-semibold leading-none z-10">[CO-LEAD]</span>
                        ) : null
                      )}
                      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-[#b89eff]/20 to-transparent rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-150"></div>
                      <div className={`bg-gradient-to-br from-[#21222b] to-[#16171d] rounded-full flex items-center justify-center border border-[#31333e] shadow-inner group-hover:border-[#00f3ff]/50 transition-colors ${team === 'Core Leadership' ? 'w-7 h-7 min-[380px]:w-9 min-[380px]:h-9 sm:w-11 sm:h-11 mb-1 sm:mb-3' : 'w-9 h-9 sm:w-11 sm:h-11 mb-0 shrink-0'}`}>
                        <span className="font-mono font-bold text-xs min-[380px]:text-sm sm:text-base text-[#00f3ff]">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className={team === 'Core Leadership' ? 'flex flex-col items-center justify-center text-center w-full' : 'min-w-0 flex-1 w-full'}>
                        <h3 className={`font-bold mb-0.5 sm:mb-1 text-white group-hover:text-[#b89eff] transition-colors truncate ${team === 'Core Leadership' ? 'text-xs min-[380px]:text-sm sm:text-sm justify-center w-full text-center' : 'text-xs sm:text-sm'}`}>
                          <span className="truncate">{member.name}</span>
                        </h3>
                        {member.details && (
                          <p className={`text-[#00f3ff] font-mono mb-0.5 sm:mb-1 uppercase tracking-tight sm:tracking-wider truncate px-1 max-w-full ${team === 'Core Leadership' ? 'text-[7px] min-[360px]:text-[8px] min-[400px]:text-[9px] sm:text-[10px]' : 'text-[8px] min-[380px]:text-[10px]'}`}>{member.details}</p>
                        )}
                        <div className={`flex items-center mt-1 sm:mt-2.5 pt-1 sm:pt-2.5 border-t border-white/5 gap-1 sm:gap-2 ${team === 'Core Leadership' ? 'justify-center' : 'justify-between'}`}>
                          <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono truncate">{member.course}</span>
                          <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono shrink-0">Yr {member.year}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                  {openPositions.map(member => (
                    <div
                      key={`${team}-open-${member.slot}`}
                      className="glass-panel p-3.5 sm:p-4 rounded-xl border border-dashed border-white/15 bg-black/15 hover:border-white/30 transition-all group relative overflow-hidden text-left w-full flex flex-row items-center gap-3.5 min-h-[100px] sm:min-h-[104px] opacity-75 hover:opacity-100"
                    >
                      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-6 -mt-6"></div>
                      <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-[#1c1d24] to-[#121318] rounded-full flex items-center justify-center border border-white/10 shrink-0 text-gray-400 font-mono text-sm sm:text-lg font-bold">
                        +
                      </div>
                      <div className="min-w-0 flex-1 w-full">
                        <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1 text-gray-300 group-hover:text-white transition-colors truncate">Open Position</h3>
                        <p className="text-[8px] sm:text-[10px] text-gray-500 font-mono mb-0.5 sm:mb-1 uppercase tracking-wider truncate">Recruitment Active</p>
                        <div className="flex items-center mt-1 sm:mt-2.5 pt-1 sm:pt-2.5 border-t border-white/5 justify-between gap-1 sm:gap-2">
                          <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono truncate">Apply Now</span>
                          <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono shrink-0">Slot #{member.slot}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        </div>

      {/* Member Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedMember(null)}>
          <div 
            className="bg-[#1a1b22] border border-[#31333e] rounded-2xl max-w-2xl w-full max-h-[90dvh] overflow-y-auto p-6 sm:p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative background blur */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#b89eff]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#00f3ff]/10 rounded-full blur-3xl pointer-events-none"></div>

            <button 
              type="button"
              onClick={() => setSelectedMember(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition-all duration-200 z-20 p-2 bg-[#21222b] rounded-full hover:bg-white/10 hover:scale-110 hover:rotate-90 cursor-pointer"
              aria-label="Close member modal"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 relative z-10">
              {/* Photo Placeholder */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-[#21222b] rounded-2xl border border-[#31333e] flex items-center justify-center mb-4 shadow-inner">
                  <User size={52} className="text-[#31333e]" />
                </div>
                <div className="w-full text-center">
                  <span className="inline-block px-3 py-1 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20 rounded text-xs font-mono tracking-wider">
                    {selectedMember.team}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="w-full md:w-2/3 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2">{selectedMember.name}</h2>
                <h4 className="text-[#b89eff] font-mono text-xs sm:text-sm mb-5 uppercase tracking-wider">{selectedMember.details}</h4>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
                  <div className="bg-[#21222b] p-3.5 sm:p-4 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Course</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-200">{selectedMember.course}</p>
                  </div>
                  <div className="bg-[#21222b] p-3.5 sm:p-4 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Year</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-200">{selectedMember.year}</p>
                  </div>
                </div>

                <div className="bg-black/30 p-3.5 sm:p-4 rounded-lg border border-white/5">
                  <p className="text-[10px] text-gray-500 font-mono uppercase mb-1.5">Connect</p>
                  <p className="text-[#8c8d96] font-mono text-xs sm:text-sm">Reach out via the club's official Discord or Contact Us form.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
