import React, { useState, useEffect } from 'react';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { eventService } from '../services/eventService';
import './Home.css';

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf5uJhoj9te0Lg9IRJ_Smc4KAHmxO-bRJJZwBnertLK0v893w/viewform?embedded=true';

export default function Events() {
  const [isRegistrationFlipped, setIsRegistrationFlipped] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // NEW: Events published by admin
  const [publishedEvents, setPublishedEvents] = useState([]);

  // NEW: Fetch published events from Supabase
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await eventService.fetchEvents();
        setPublishedEvents(data || []);
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    };

    loadEvents();
  }, []);

  // Intercept browser back button when form modal is open so it closes modal instead of leaving Events page
  useEffect(() => {
    if (!isFormModalOpen) return;

    window.history.pushState({ modalOpen: true }, '');

    const handlePopState = () => {
      setIsFormModalOpen(false);
      setIsRegistrationFlipped(false);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    };
  }, [isFormModalOpen]);

  const handleRegistrationCardClick = () => {
    if (isRegistrationFlipped) {
      setIsRegistrationFlipped(false);
      return;
    }

    setIsRegistrationFlipped(true);
    setIsFormModalOpen(true);
  };

  useRevealOnScroll();

  return (
    <div className="home-body min-h-screen pt-24 pb-20 flex-grow flex flex-col">
      {/* Hidden pre-fetch iframe so Google Form loads instantly when opened */}
      <iframe src={GOOGLE_FORM_URL} className="hidden" aria-hidden="true" title="Preload Form" />

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
                    <i className="fas fa-map-marker-alt text-accent"></i>
                    Venue: Lab 2 (Pending Confirmation)
                  </div>
                </div>

                {/* Formats */}
                <div className="w-full md:w-7/12 p-8 md:p-10">
                  <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">
                    Game Formats
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg">
                      <h5 className="text-white font-bold text-sm mb-1">
                        Prompt Counter
                      </h5>
                      <p className="text-xs text-gray-500">
                        Precision execution &amp; logic timing.
                      </p>
                    </div>

                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg">
                      <h5 className="text-white font-bold text-sm mb-1">
                        Fastest Finger First
                      </h5>
                      <p className="text-xs text-gray-500">
                        Rapid-fire technical trivia.
                      </p>
                    </div>

                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg">
                      <h5 className="text-white font-bold text-sm mb-1">
                        AI vs Human
                      </h5>
                      <p className="text-xs text-gray-500">
                        Content generation challenge (2:1 ratio).
                      </p>
                    </div>

                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg">
                      <h5 className="text-white font-bold text-sm mb-1">
                        Tech Pictionary
                      </h5>
                      <p className="text-xs text-gray-500">
                        Drawing and guessing tech concepts.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ADMIN PUBLISHED EVENTS */}
          {publishedEvents.length > 0 && (
            <div className="reveal in-view">
              <h2 className="section-heading text-2xl">Published Events</h2>

              <div className="grid grid-cols-1 gap-6">
                {publishedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="glass-panel overflow-hidden border border-accent/20"
                  >
                    <div className="flex flex-col md:flex-row">

                      {/* Event Image */}
                      {event.image_url && (
                        <div className="w-full md:w-5/12">
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full min-h-[240px] object-cover"
                          />
                        </div>
                      )}

                      {/* Event Details */}
                      <div className="w-full md:flex-1 p-8 md:p-10 bg-[#161821]/50">

                        <span className="inline-block px-3 py-1 bg-accent/10 text-accent font-bold text-[10px] rounded mb-4 tracking-wider uppercase border border-accent/20">
                          {event.status || 'Upcoming'}
                        </span>

                        <h3 className="text-3xl font-black text-white mb-3 leading-tight tracking-tight">
                          {event.title}
                        </h3>

                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                          {event.description}
                        </p>

                        {event.event_date && (
                          <div className="flex items-center text-xs font-semibold text-gray-300 gap-2 bg-black/20 p-3 rounded-lg border border-white/5">
                            <i className="fas fa-calendar text-accent"></i>
                            {new Date(event.event_date).toLocaleString()}
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participation Form */}
          <div className="max-w-3xl mx-auto w-full reveal">
            <div className="min-h-[320px] cursor-pointer" style={{ perspective: '1200px' }}>
              <div
                className="relative h-[320px] w-full transition-transform duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isRegistrationFlipped
                    ? 'rotateY(180deg)'
                    : 'rotateY(0deg)'
                }}
                onClick={handleRegistrationCardClick}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleRegistrationCardClick();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Flip the event registration card"
              >

                <div
                  className="glass-panel absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#161821] to-[#0f1015]"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
                    <i className="fas fa-calendar-check text-2xl"></i>
                  </span>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    Welcome to Event Registration
                  </h3>

                  <p className="text-gray-400 text-sm">
                    Secure your spot for the Inauguration &amp; Games.
                  </p>

                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                    Click to register
                  </p>
                </div>

                <div
                  className="glass-panel absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#1b1f2d] to-[#0f1015]"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Ready to join?
                  </h3>

                  <p className="max-w-md text-sm leading-relaxed text-gray-400">
                    Complete the Google Form registration to reserve your place in the event.
                  </p>

                  <button
                    type="button"
                    className="btn-keycap mt-8 w-full max-w-sm rounded-lg py-4 text-sm cursor-pointer"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsFormModalOpen(true);
                    }}
                  >
                    Open Google Form Registration
                    <i className="fas fa-arrow-up-right-from-square ml-2"></i>
                  </button>

                  <p className="mt-5 text-xs text-gray-500">
                    Click anywhere on this card to flip it back.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {isFormModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="registration-form-title"
              onClick={() => setIsFormModalOpen(false)}
            >
              <div
                className="event-form-modal relative flex h-[92vh] max-w-4xl w-full flex-col overflow-hidden rounded-2xl bg-[#10121b] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div>
                    <h3
                      id="registration-form-title"
                      className="font-bold text-white"
                    >
                      Event Registration
                    </h3>

                    <p className="text-xs text-gray-400">
                      Complete the form without leaving Tech Titans.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                    onClick={() => setIsFormModalOpen(false)}
                    aria-label="Close registration form"
                  >
                    &times;
                  </button>
                </div>

                <div className="relative flex-1 w-full min-h-0 bg-[#10121b]">
                  {isIframeLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#10121b] text-[#00f3ff] font-mono text-sm gap-3 z-10 px-4 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00f3ff] mb-1"></div>

                      <span className="flex items-center justify-center gap-2 font-bold tracking-wide">
                        <span className="text-xl animate-bounce">⏳</span>
                        CONNECTING TO REGISTRATION PROTOCOL...
                      </span>

                      <span className="text-xs text-gray-400 font-mono animate-pulse mt-1">
                        ⌛ Fetching live form servers... thanks for waiting! ⚡
                      </span>
                    </div>
                  )}

                  <iframe
                    title="Tech Titans event registration Google Form"
                    src={GOOGLE_FORM_URL}
                    onLoad={() => setIsIframeLoading(false)}
                    className={`w-full h-full border-none bg-white transition-opacity duration-300 ${
                      isIframeLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Past Events Section */}
          <div className="reveal">
            <h2 className="section-heading text-2xl">Archived Events</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4 group items-center glass-panel p-4 bg-transparent border-dashed border-white/10">
                <div className="w-16 h-16 rounded bg-[#161821] flex items-center justify-center text-gray-600 group-hover:text-accent transition-colors shrink-0">
                  <i className="fas fa-lock text-xl"></i>
                </div>

                <div>
                  <p className="font-mono text-accent text-[10px] mb-1">
                    WAITING FOR DEPLOYMENT
                  </p>

                  <h4 className="text-white font-bold text-sm tracking-wide">
                    Inauguration Wrap-up
                  </h4>

                  <p className="text-xs text-gray-500 mt-1">
                    Media pending execution of final wrap-up.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}