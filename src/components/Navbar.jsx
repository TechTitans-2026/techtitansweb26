import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { scrollToContact } from '../pages/Home';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  const handleContactClick = () => {
    if (location.pathname !== '/' && location.pathname !== '/home') {
      navigate('/home');
      setTimeout(scrollToContact, 100);
    } else {
      scrollToContact();
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-300" id="navbar">
        <div className="absolute inset-0 bg-[#1a1b22]/90 backdrop-blur-md border-b border-white/5" id="nav-bg"></div>
        <div className="max-w-7xl w-full mx-auto px-6 relative flex justify-between items-center h-20">
            
            <Link to="/home" className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform shrink-0" onClick={() => setMobileMenuOpen(false)}>
                <img src="/logo.jpg" alt="Tech Titans Logo" className="w-16 h-16 rounded-full object-cover shadow-[0_0_15px_rgba(174,151,214,0.4)] border border-[#ae97d6]/30" />
            </Link>

            {/*  Desktop Nav - Evenly Distributed  */}
            <div className="hidden md:flex flex-1 justify-evenly items-center text-sm font-semibold tracking-wide text-[#8c8d96] mx-8">
                <Link to="/home" className={`nav-link transition-colors hover:text-accent ${(location.pathname === '/' || location.pathname === '/home') ? 'active-link' : ''}`}>HOME</Link>
                <Link to="/about" className={`nav-link transition-colors hover:text-accent ${location.pathname === '/about' ? 'active-link' : ''}`}>ABOUT US</Link>
                <Link to="/events" className={`nav-link transition-colors hover:text-accent ${location.pathname === '/events' ? 'active-link' : ''}`}>EVENTS</Link>
                <Link to="/members" className={`nav-link transition-colors hover:text-accent ${location.pathname === '/members' ? 'active-link' : ''}`}>MEMBERS</Link>
                <Link to="/quests" className={`nav-link transition-colors hover:text-accent ${location.pathname === '/quests' ? 'active-link' : ''}`}>QUESTS</Link>
            </div>

            <div className="hidden md:flex items-center gap-3 shrink-0">
                {(profile?.role === 'admin' || profile?.role === 'head') && (
                    <button className="btn-keycap px-5 py-2.5 text-xs bg-red-900/50 text-red-300 border border-red-500/30 hover:bg-red-900/80" onClick={() => navigate('/admin')}>ADMIN</button>
                )}
                {user ? (
                    <button className="btn-keycap px-5 py-2.5 text-xs" onClick={() => navigate('/profile')}>PROFILE</button>
                ) : (
                    <button className="btn-keycap px-5 py-2.5 text-xs" onClick={() => navigate('/auth')}>LOGIN</button>
                )}
                <button className="bg-transparent border border-white/20 hover:border-white/50 text-white rounded-lg px-5 py-2.5 text-xs transition-colors" onClick={handleContactClick}>CONTACT</button>
            </div>

            {/*  Mobile Menu Button  */}
            <button
                className="md:hidden text-white text-2xl p-3 min-w-[48px] min-h-[48px] flex items-center justify-center focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <i className="fas fa-bars"></i>
            </button>
        </div>

        {/*  Mobile Nav Dropdown  */}
        {mobileMenuOpen && (
            <div className="md:hidden absolute w-full bg-[#1a1b22]/98 backdrop-blur-xl border-b border-white/5 pb-8 pt-4 shadow-2xl">
                <div className="flex flex-col px-6 space-y-5 text-sm font-semibold tracking-widest text-[#8c8d96]">
                    <Link to="/home" className={`nav-link text-lg py-2 w-fit ${(location.pathname === '/' || location.pathname === '/home') ? 'active-link' : ''}`} onClick={() => setMobileMenuOpen(false)}>HOME</Link>
                    <Link to="/about" className={`nav-link text-lg py-2 w-fit ${location.pathname === '/about' ? 'active-link' : ''}`} onClick={() => setMobileMenuOpen(false)}>ABOUT US</Link>
                    <Link to="/events" className={`nav-link text-lg py-2 w-fit ${location.pathname === '/events' ? 'active-link' : ''}`} onClick={() => setMobileMenuOpen(false)}>EVENTS</Link>
                    <Link to="/members" className={`nav-link text-lg py-2 w-fit ${location.pathname === '/members' ? 'active-link' : ''}`} onClick={() => setMobileMenuOpen(false)}>MEMBERS</Link>
                    <Link to="/quests" onClick={() => setMobileMenuOpen(false)} className={`nav-link text-lg py-2 w-fit ${location.pathname === '/quests' ? 'active-link' : ''}`}>QUESTS</Link>

                    <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                        {(profile?.role === 'admin' || profile?.role === 'head') && (
                            <button className="btn-keycap px-6 py-3.5 text-sm w-full bg-red-900/50 text-red-300 border border-red-500/30 hover:bg-red-900/80" onClick={() => { setMobileMenuOpen(false); navigate('/admin'); }}>ADMIN</button>
                        )}
                        {user ? (
                            <button className="btn-keycap px-6 py-3.5 text-sm w-full" onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }}>PROFILE</button>
                        ) : (
                            <button className="btn-keycap px-6 py-3.5 text-sm w-full" onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}>LOGIN</button>
                        )}
                        <button className="bg-transparent border border-white/20 text-white rounded-lg px-6 py-3.5 text-sm w-full" onClick={handleContactClick}>CONTACT US</button>
                    </div>
                </div>
            </div>
        )}
    </nav>
  );
}
