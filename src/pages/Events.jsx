import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import './Home.css';

export default function Events() {
  const navigate = useNavigate();
  const [regForm, setRegForm] = useState({ name: '', course: '', activity: '' });

  useRevealOnScroll();

  return (
    <div className="home-body min-h-screen pt-24 pb-20 flex-grow flex flex-col">
      <div id="view-events" className="page-view active flex-grow">
        <div className="max-w-6xl mx-auto px-6 py-16 relative z-10 flex flex-col gap-20">

          {/* Upcoming Event Highlight */}
          <div className="reveal">
            <h2 className="section-heading text-3xl">Active Deployment</h2>
            <div className="glass-panel overflow-hidden border border-accent/20">
              <div className="flex flex-col md:flex-row">
                {/* Details */}
                <div className="w-full md:w-5/12 p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/5 bg-[#161821]/50">
                  <span className="inline-block px-3 py-1 bg-accent/10 text-accent font-bold text-[10px] rounded mb-4 tracking-wider uppercase border border-accent/20">
                    Official Launch
                  </span>
                  <h3 className="text-3xl font-black text-white mb-3 leading-tight tracking-tight">
                    Inauguration Day <br />&amp; Tech Games
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    The official launch of the Tech Titans collective. Join us for the premiere followed by intense, time-limited technical games.
                  </p>
                  <div className="flex items-center text-xs font-semibold text-gray-300 gap-2 bg-black/20 p-3 rounded-lg border border-white/5">
                    <i className="fas fa-map-marker-alt text-accent"></i> Venue: Lab 2 (Pending Confirmation)
                  </div>
                </div>

                {/* Formats */}
                <div className="w-full md:w-7/12 p-8 md:p-10">
                  <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">
                    Game Formats
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg">
                      <h5 className="text-white font-bold text-sm mb-1">Prompt Counter</h5>
                      <p className="text-xs text-gray-500">Precision execution &amp; logic timing.</p>
                    </div>
                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg">
                      <h5 className="text-white font-bold text-sm mb-1">Fastest Finger First</h5>
                      <p className="text-xs text-gray-500">Rapid-fire technical trivia.</p>
                    </div>
                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg">
                      <h5 className="text-white font-bold text-sm mb-1">AI vs Human</h5>
                      <p className="text-xs text-gray-500">Content generation challenge (2:1 ratio).</p>
                    </div>
                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg">
                      <h5 className="text-white font-bold text-sm mb-1">Tech Pictionary</h5>
                      <p className="text-xs text-gray-500">Drawing and guessing tech concepts.</p>
                    </div>
                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg sm:col-span-2">
                      <h5 className="text-white font-bold text-sm mb-1">Generic Creation Quiz</h5>
                      <p className="text-xs text-gray-500">Broad knowledge testing across domains.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Participation Form */}
          <div className="max-w-3xl mx-auto w-full reveal">
            <div className="glass-panel p-8 md:p-10 relative overflow-hidden bg-gradient-to-br from-[#161821] to-[#0f1015]">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Event Registration</h3>
                <p className="text-gray-400 text-sm">Secure your spot for the Inauguration &amp; Games.</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate('/auth', { state: { pendingRegistration: regForm } });
                }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      className="input-glass"
                      placeholder="John Doe"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                      Course / Year
                    </label>
                    <input
                      type="text"
                      required
                      className="input-glass"
                      placeholder="e.g. CS - SY"
                      value={regForm.course}
                      onChange={(e) => setRegForm({ ...regForm, course: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                    Select Primary Activity
                  </label>
                  <select
                    required
                    className="input-glass appearance-none cursor-pointer"
                    value={regForm.activity}
                    onChange={(e) => setRegForm({ ...regForm, activity: e.target.value })}
                  >
                    <option value="" disabled>-- Choose your challenge --</option>
                    <option value="prompt">Prompt Counter</option>
                    <option value="fastest">Fastest Finger First</option>
                    <option value="aivshuman">AI vs. Human Challenge</option>
                    <option value="pictionary">Tech-Themed Pictionary</option>
                    <option value="quiz">Generic Creation Quiz</option>
                  </select>
                </div>
                <div className="pt-4 text-center">
                  <button type="submit" id="regSubmitBtn" className="btn-keycap w-full py-4 text-sm rounded-lg cursor-pointer">
                    Confirm Registration
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Past Events Section */}
          <div className="reveal">
            <h2 className="section-heading text-2xl">Archived Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4 group items-center glass-panel p-4 bg-transparent border-dashed border-white/10">
                <div className="w-16 h-16 rounded bg-[#161821] flex items-center justify-center text-gray-600 group-hover:text-accent transition-colors shrink-0">
                  <i className="fas fa-lock text-xl"></i>
                </div>
                <div>
                  <p className="font-mono text-accent text-[10px] mb-1">WAITING FOR DEPLOYMENT</p>
                  <h4 className="text-white font-bold text-sm tracking-wide">Inauguration Wrap-up</h4>
                  <p className="text-xs text-gray-500 mt-1">Media pending execution of final wrap-up.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
