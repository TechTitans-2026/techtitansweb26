import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';
import { eventService } from '../services/eventService';
import { questService } from '../services/questService';

import './Home.css';

// Export scrollToContact for Navbar use
export const contactRef = React.createRef();
export const scrollToContact = () => {
  contactRef.current?.scrollIntoView({ behavior: 'smooth' });
};

export default function Home() {
  const navigate = useNavigate();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ name: '', email: '', message: '' });
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [latestEvent, setLatestEvent] = useState(null);
  const [latestQuest, setLatestQuest] = useState(null);
  const [isEntering, setIsEntering] = useState(true);
  
  // Typewriter effect state
  const phrases = ["'Welcome_Titans'", "'Think'", "'Build'", "'Innovate'"];
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const typeTimer = setInterval(() => {
      setPhraseIdx(prev => (prev + 1) % phrases.length);
    }, 2000);
    
    const enterTimer = setTimeout(() => setIsEntering(false), 50);
    
    return () => {
      clearInterval(typeTimer);
      clearTimeout(enterTimer);
    };
  }, []);

  useEffect(() => {
    async function fetchNews() {
      try {
        const events = await eventService.fetchEvents();
        if (events && events.length > 0) setLatestEvent(events[0]);

        const quests = await questService.fetchActiveQuests();
        if (quests && quests.length > 0) setLatestQuest(quests[0]);
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    }
    fetchNews();
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    reveals.forEach(r => observer.observe(r));

    return () => {
        reveals.forEach(r => observer.unobserve(r));
    };
  }, []);

  return (
    <div className={`home-body transition-opacity duration-1000 ease-out ${isEntering ? 'opacity-0' : 'opacity-100'}`}>
      

    <button id="back-to-top" className="btn-keycap" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}
        aria-label="Back to top">
        <i className="fas fa-rocket"></i>
    </button>

    <main className="pt-24 pb-20 flex-grow">

        {/*  ==========================================  */}
        {/*  VIEW: HOME                                  */}
        {/*  ==========================================  */}
        <div id="view-home" className="page-view active">
            <section className="relative pt-8 pb-20 lg:pt-16 lg:pb-32 overflow-hidden">
                <div className="anchor-glow"
                    style={{"width":"500px","height":"500px","top":"-180px","left":"-140px","background":"radial-gradient(circle, rgba(174,151,214,0.1), transparent 70%)"}}>
                </div>
                <div className="anchor-glow"
                    style={{"width":"420px","height":"420px","top":"-100px","right":"-160px","background":"radial-gradient(circle, rgba(96,165,250,0.05), transparent 70%)","animationDelay":"3s"}}>
                </div>

                <div className="max-w-5xl mx-auto px-6 relative z-10 text-center w-full">
                    <p className="text-accent tracking-[0.4em] text-xs font-bold uppercase mb-6 drop-shadow-md">A New
                        Chapter Begins</p>

                    <div
                        className="flex flex-wrap justify-center gap-2 sm:gap-4 text-5xl sm:text-7xl md:text-[6.5rem] lg:text-[8rem] font-black tracking-tighter mb-4 leading-none">
                        <span className="title-tech">TECH</span>
                        <span className="title-titans">TITANS</span>
                    </div>

                    <p
                        className="text-[#8c8d96] tracking-[0.3em] text-xs sm:text-sm font-semibold uppercase mb-12 sm:mb-16">
                        Official Club Homepage</p>

                    {/*  Middle Code Element with Typing Loop  */}
                    <div className="code-window w-full max-w-2xl mx-auto rounded-xl overflow-hidden mb-12 sm:mb-16">
                        <div className="code-header px-4 py-2.5 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                            <span className="text-[11px] text-gray-500 ml-3 font-mono opacity-60">titans_init.py</span>
                        </div>
                        <div className="p-6 sm:p-12 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.02]"
                                style={{"backgroundImage":"radial-gradient(white 1px, transparent 1px)","backgroundSize":"20px 20px"}}>
                            </div>

                            <div
                                className="font-mono text-sm sm:text-xl md:text-2xl font-semibold tracking-tight relative z-10">
                                <span className="text-[#ff4ecd]">print</span><span className="text-gray-300">(</span><span
                                    className="text-[#f1fa8c]" id="typewriter">{phrases[phraseIdx]}</span><span
                                    className="text-gray-300">)</span>
                                <span
                                    className="inline-block w-2.5 h-4 sm:h-5 bg-gray-400 ml-1 animate-pulse align-middle"></span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
                        <Link to="/auth"
                            className="btn-keycap px-10 py-3.5 text-sm w-full sm:w-auto text-center inline-flex items-center justify-center min-h-[48px] box-border m-0">Sign Up</Link>
                        <button onClick={() => navigate('/events')}
                            className="bg-transparent border border-white/20 hover:border-white/50 hover:bg-white/5 text-white font-bold rounded-lg px-10 py-3.5 text-sm w-full sm:w-auto transition-all min-h-[48px] flex items-center justify-center box-border m-0">Explore Events</button>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-4 relative z-10 flex flex-col gap-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/*  Story Column  */}
                    <div className="reveal">
                        <h2 className="text-2xl section-title mb-8">Our Story &amp; Purpose</h2>
                        <div className="glass-panel p-8 relative h-full flex flex-col justify-center overflow-hidden">
                            <i
                                className="fas fa-check-circle absolute -top-3 -right-3 text-3xl text-accent bg-[#1a1b22] rounded-full shadow-lg"></i>
                            <i
                                className="fas fa-cog absolute -bottom-8 -left-8 text-6xl text-white/5 animate-[spin_10s_linear_infinite]"></i>

                            <p className="text-[#d1d1d5] leading-relaxed text-sm md:text-base mb-6 relative z-10">
                                Tech Titans is a premier student body dedicated to fostering innovation, skill
                                development, and community within the tech landscape.
                            </p>
                            <p className="text-[#8c8d96] leading-relaxed text-sm md:text-base relative z-10">
                                Our mission is to bridge academia and industry through practical projects, hackathons,
                                and collaborative research, preparing students for the challenges of tomorrow.
                            </p>
                        </div>
                    </div>

                    {/*  News Column  */}
                    <div className="reveal" style={{"transitionDelay":"0.1s"}}>
                        <div className="flex justify-between items-end mb-8">
                            <h2 className="text-2xl section-title mb-0">Latest News</h2>
                        </div>
                        <div className="flex flex-col gap-6 h-full">
                          {latestEvent && (
                            <div className="glass-panel overflow-hidden group flex flex-col border border-white/5 hover:border-[#ae97d6]/30 transition-colors cursor-pointer" onClick={() => navigate('/events')}>
                                {latestEvent.image_url ? (
                                  <div className="h-32 bg-[#0d0d12] relative overflow-hidden">
                                      <img src={latestEvent.image_url} alt={latestEvent.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                ) : (
                                  <div className="h-32 bg-[#0d0d12] relative overflow-hidden p-4 flex items-center justify-center">
                                      <span className="font-mono text-accent">EVENT // {new Date(latestEvent.event_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                                <div className="p-4 flex flex-col flex-grow bg-gradient-to-b from-[#1a1b22]/50 to-transparent">
                                    <div className="text-[10px] text-yellow-400 font-bold mb-1 uppercase">Upcoming Event</div>
                                    <h4 className="font-bold text-white text-md mb-1 truncate">{latestEvent.title}</h4>
                                    <p className="text-xs text-[#8c8d96] line-clamp-2">{latestEvent.description}</p>
                                </div>
                            </div>
                          )}

                          {latestQuest && (
                            <div className="glass-panel overflow-hidden group flex flex-col border border-white/5 hover:border-[#00f3ff]/30 transition-colors cursor-pointer" onClick={() => navigate('/quests')}>
                                <div className="p-4 flex flex-col flex-grow bg-gradient-to-b from-[#1a1b22]/50 to-transparent relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                      <i className="fas fa-crosshairs text-4xl text-[#00f3ff]"></i>
                                    </div>
                                    <div className="text-[10px] text-[#00f3ff] font-bold mb-1 uppercase">New Bounty</div>
                                    <h4 className="font-bold text-white text-md mb-1 truncate">{latestQuest.title}</h4>
                                    <p className="text-xs text-[#8c8d96] line-clamp-2 mb-2">{latestQuest.description}</p>
                                    <div className="text-xs font-mono text-green-400">REWARD: {latestQuest.base_xp} XP</div>
                                </div>
                            </div>
                          )}

                          {!latestEvent && !latestQuest && (
                            <div className="glass-panel p-6 text-center text-[#8c8d96] font-mono text-sm border border-white/5">
                              No updates at this time.
                            </div>
                          )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </main>

    <footer ref={contactRef} id="contact-footer"
        className="bg-[#111116] pt-12 pb-10 border-t border-white/5 relative z-10 mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="anchor-glow"
            style={{"width":"400px","height":"400px","top":"-120px","left":"50%","transform":"translateX(-50%)","background":"radial-gradient(circle, rgba(174,151,214,0.1), transparent 70%)","animationDelay":"1.5s"}}>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">

            <div
                className="glass-panel p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-[#1a1b22] to-[#15161c] reveal">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl section-title mb-2 text-white">Join the Network</h2>
                    <p className="text-sm text-[#8c8d96] max-w-md leading-relaxed">Have questions about joining, partnering,
                        or sponsoring upcoming events? Drop a line to the core team.</p>
                </div>

                <div className="flex gap-5 text-2xl text-[#8c8d96]">
                    <a href="#" className="hover:text-accent hover:-translate-y-2 transition-all drop-shadow-md"
                        aria-label="Email"><i className="fas fa-envelope"></i></a>
                    <a href="#" className="hover:text-accent hover:-translate-y-2 transition-all drop-shadow-md"
                        aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
                    <a href="#" className="hover:text-accent hover:-translate-y-2 transition-all drop-shadow-md"
                        aria-label="GitHub"><i className="fab fa-github"></i></a>
                    <a href="#" className="hover:text-accent hover:-translate-y-2 transition-all drop-shadow-md"
                        aria-label="Discord"><i className="fab fa-discord"></i></a>
                </div>

                <button id="msg-btn" className="btn-keycap px-8 py-3 text-sm w-full md:w-auto min-w-[200px]"
                    onClick={() => setShowFeedbackForm(true)}>SEND MESSAGE</button>
            </div>

            <div
                className="flex flex-col md:flex-row justify-between items-center gap-6 text-[#8c8d96]/60 text-xs font-medium">
                <div className="flex flex-col items-center md:items-start gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-black tracking-tighter text-white/70 text-lg">TECH TITANS</span>
                    </div>
                    <span>Powered by innovation. Founded 2026.</span>
                </div>
                <div className="text-center md:text-right flex flex-col gap-1">
                    <p>&amp;copy; 2026 University Collective. All rights reserved.</p>
                    <p className="text-accent/50">This site is created by members for members.</p>
                </div>
            </div>
        </div>
    </footer>

    
      {/* Feedback Modal */}
      {showFeedbackForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowFeedbackForm(false)}>
          <div 
            className="bg-[#1a1b22] border border-[#31333e] rounded-2xl max-w-md w-full p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#ae97d6]/10 rounded-full blur-3xl pointer-events-none"></div>

            <button 
              onClick={() => setShowFeedbackForm(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10 p-2 bg-[#21222b] rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black text-white mb-6">Send Feedback</h2>
            
            <form onSubmit={async (e) => {
                e.preventDefault();
                setFeedbackStatus('Sending...');
                const { error } = await supabase.from('feedback').insert([feedbackData]);
                if (error) {
                    setFeedbackStatus('Error: ' + error.message);
                } else {
                    setFeedbackStatus('Message sent successfully!');
                    setTimeout(() => {
                        setShowFeedbackForm(false);
                        setFeedbackStatus('');
                        setFeedbackData({ name: '', email: '', message: '' });
                    }, 2000);
                }
            }} className="flex flex-col gap-4 relative z-10">
                
                <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-mono mb-1 block">Name</label>
                    <input type="text" required value={feedbackData.name} onChange={e => setFeedbackData({...feedbackData, name: e.target.value})} className="w-full bg-[#21222b] border border-white/5 rounded-lg p-3 text-white focus:outline-none focus:border-[#ae97d6]/50 transition-colors" />
                </div>
                <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-mono mb-1 block">Email</label>
                    <input type="email" required value={feedbackData.email} onChange={e => setFeedbackData({...feedbackData, email: e.target.value})} className="w-full bg-[#21222b] border border-white/5 rounded-lg p-3 text-white focus:outline-none focus:border-[#ae97d6]/50 transition-colors" />
                </div>
                <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-mono mb-1 block">Message</label>
                    <textarea required value={feedbackData.message} onChange={e => setFeedbackData({...feedbackData, message: e.target.value})} className="w-full bg-[#21222b] border border-white/5 rounded-lg p-3 text-white h-32 resize-none focus:outline-none focus:border-[#ae97d6]/50 transition-colors"></textarea>
                </div>

                <button type="submit" className="btn-keycap w-full py-3 mt-2 text-sm">
                    {feedbackStatus || 'SUBMIT MESSAGE'}
                </button>
            </form>
          </div>
        </div>
      )}
</div>
  );
}
