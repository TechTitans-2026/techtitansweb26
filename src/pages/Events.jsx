<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { eventService } from '../services/eventService';
import './Home.css';

const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSf5uJhoj9te0Lg9IRJ_Smc4KAHmxO-bRJJZwBnertLK0v893w/viewform?embedded=true';

export default function Events() {
  const [isRegistrationFlipped, setIsRegistrationFlipped] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // Events published by admin
  const [publishedEvents, setPublishedEvents] = useState([]);

  // Fetch published events from Supabase
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

  // Intercept browser back button when form modal is open
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

      {/* Hidden pre-fetch iframe */}
      <iframe
        src={GOOGLE_FORM_URL}
        className="hidden"
        aria-hidden="true"
        title="Preload Form"
      />

      <div id="view-events" className="page-view active flex-grow">

        <div className="max-w-6xl mx-auto px-6 py-16 relative z-10 flex flex-col gap-20">

          {/* Upcoming Event Highlight */}
          <div className="reveal">

            <h2 className="section-heading text-3xl">
              Active Deployment
            </h2>

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
                    The official launch of the Tech Titans collective. Join us
                    for the premiere followed by intense, time-limited technical
                    games.
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
                        Prompt Battle
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
                        Bot or Brain
                      </h5>

                      <p className="text-xs text-gray-500">
                        Content generation challenge (2:1 ratio).
                      </p>

                    </div>

                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg">

                      <h5 className="text-white font-bold text-sm mb-1">
                        TechSketch
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

              <h2 className="section-heading text-2xl">
                Published Events
              </h2>

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

                        {/* Event Status */}
                        <span className="inline-block px-3 py-1 bg-accent/10 text-accent font-bold text-[10px] rounded mb-4 tracking-wider uppercase border border-accent/20">

                          {event.status || 'Upcoming'}

                        </span>


                        {/* Event Title */}
                        <h3 className="text-3xl font-black text-white mb-3 leading-tight tracking-tight">

                          {event.title}

                        </h3>


                        {/* Event Description */}
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">

                          {event.description}

                        </p>


                        {/* Event Date */}
                        {event.event_date && (

                          <div className="flex items-center text-xs font-semibold text-gray-300 gap-2 bg-black/20 p-3 rounded-lg border border-white/5">

                            <i className="fas fa-calendar text-accent"></i>

                            {new Date(event.event_date).toLocaleString()}

                          </div>

                        )}


                        {/* EVENT LINK BUTTON */}
                        {event.event_link && (

                          <a
                            href={event.event_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-keycap inline-flex items-center justify-center mt-5 px-6 py-3 text-xs"
                          >

                            VIEW EVENT

                            <i className="fas fa-arrow-up-right-from-square ml-2"></i>

                          </a>

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

            <div
              className="min-h-[320px] cursor-pointer"
              style={{ perspective: '1200px' }}
            >

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

                {/* Front Side */}
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


                {/* Back Side */}
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
                    Complete the Google Form registration to reserve your place
                    in the event.
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


          {/* REGISTRATION FORM MODAL */}
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

                {/* Modal Header */}
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


                {/* Modal Content */}
                <div className="relative flex-1 w-full min-h-0 bg-[#10121b]">

                  {isIframeLoading && (

                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#10121b] text-[#00f3ff] font-mono text-sm gap-3 z-10 px-4 text-center">

                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00f3ff] mb-1"></div>

                      <span className="flex items-center justify-center gap-2 font-bold tracking-wide">

                        <span className="text-xl animate-bounce">
                          ⏳
                        </span>

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

            <h2 className="section-heading text-2xl">
              Archived Events
            </h2>
            
          </div>

        </div>

      </div>

    </div>
  );
=======
import React, { useEffect, useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  Ticket,
  ExternalLink,
  Loader2,
  QrCode
} from 'lucide-react';

import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { useAuth } from '../hooks/useAuth';
import { eventService } from '../services/eventService';
import { supabase } from '../lib/supabase';

import './Home.css';

export default function Events() {
  const { user } = useAuth();

  const [publishedEvents, setPublishedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [registeringEventId, setRegisteringEventId] = useState(null);
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [registrationResult, setRegistrationResult] = useState(null);

  const [registeredEvents, setRegisteredEvents] = useState([]);

  useRevealOnScroll();

  // --------------------------------------------------
  // LOAD EVENTS
  // --------------------------------------------------

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoadingEvents(true);

        const data = await eventService.fetchEvents();

        setPublishedEvents(data || []);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  // --------------------------------------------------
  // LOAD USER'S EXISTING REGISTRATIONS
  // --------------------------------------------------

  useEffect(() => {
    const loadRegistrations = async () => {
      if (!user?.id) {
        setRegisteredEvents([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('event_registrations')
          .select(
            'event_id, registration_code, registered_at, attended, qr_token'
          )
          .eq('user_id', user.id);

        if (error) {
          console.error(
            'Failed to load registrations:',
            error
          );
          return;
        }

        setRegisteredEvents(data || []);
      } catch (error) {
        console.error(
          'Registration loading error:',
          error
        );
      }
    };

    loadRegistrations();
  }, [user?.id]);

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return 'Date not announced';

    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // --------------------------------------------------
  // REGISTRATION DEADLINE
  // --------------------------------------------------

  const getDeadlineStatus = (event) => {
    if (!event.registration_deadline) {
      return {
        expired: false,
        text: 'Registration open until event'
      };
    }

    const deadline = new Date(event.registration_deadline);
    const now = new Date();

    if (deadline <= now) {
      return {
        expired: true,
        text: 'Registration closed'
      };
    }

    return {
      expired: false,
      text: `Closes ${formatDate(event.registration_deadline)}`
    };
  };

  // --------------------------------------------------
  // CHECK IF USER IS REGISTERED
  // --------------------------------------------------

  const isRegistered = (eventId) => {
    return registeredEvents.some(
      (registration) =>
        registration.event_id === eventId
    );
  };

  // --------------------------------------------------
  // REGISTER FOR EVENT
  // --------------------------------------------------

  const handleRegister = async (event) => {
    setRegistrationMessage('');
    setRegistrationResult(null);

    if (!user) {
      setRegistrationMessage(
        'Please sign in to register for this event.'
      );
      return;
    }

    if (!event.registration_enabled) {
      setRegistrationMessage(
        'Registration is currently disabled for this event.'
      );
      return;
    }

    if (event.status !== 'upcoming') {
      setRegistrationMessage(
        'Registration is only available for upcoming events.'
      );
      return;
    }

    const deadlineStatus =
      getDeadlineStatus(event);

    if (deadlineStatus.expired) {
      setRegistrationMessage(
        'Registration deadline has passed.'
      );
      return;
    }

    if (isRegistered(event.id)) {
      const existingRegistration =
        registeredEvents.find(
          (registration) =>
            registration.event_id === event.id
        );

      setRegistrationResult(
        existingRegistration || null
      );

      setRegistrationMessage(
        'You are already registered for this event.'
      );

      return;
    }

    try {
      setRegisteringEventId(event.id);

      const { data, error } =
        await supabase.rpc(
          'register_for_event',
          {
            target_event_id: event.id
          }
        );

      if (error) {
        throw error;
      }

      const result =
        Array.isArray(data) ? data[0] : data;

      const newRegistration = {
        event_id: event.id,
        registration_code:
          result?.registration_code,
        registered_at:
          result?.registered_at ||
          new Date().toISOString(),
        attended: false,
        qr_token: result?.qr_token
      };

      setRegisteredEvents((previous) => [
        ...previous,
        newRegistration
      ]);

      setRegistrationResult(
        newRegistration
      );

      setRegistrationMessage(
        'Registration successful!'
      );
    } catch (error) {
      console.error(
        'Event registration failed:',
        error
      );

      let message =
        error?.message ||
        'Registration failed. Please try again.';

      if (
        message
          .toLowerCase()
          .includes('already registered')
      ) {
        message =
          'You are already registered for this event.';
      }

      if (
        message
          .toLowerCase()
          .includes('registration is disabled')
      ) {
        message =
          'Registration is currently disabled.';
      }

      if (
        message
          .toLowerCase()
          .includes('registration deadline')
      ) {
        message =
          'Registration deadline has passed.';
      }

      if (
        message
          .toLowerCase()
          .includes('event is full')
      ) {
        message =
          'Sorry, this event is full.';
      }

      setRegistrationMessage(message);
    } finally {
      setRegisteringEventId(null);
    }
  };

  // --------------------------------------------------
  // CLOSE REGISTRATION MESSAGE
  // --------------------------------------------------

  const closeRegistrationMessage = () => {
    setRegistrationMessage('');
    setRegistrationResult(null);
  };

  // --------------------------------------------------
  // SHOW EVENT PASS
  // --------------------------------------------------

  const showEventPass = (event, registration) => {
    setRegistrationResult({
      ...registration,
      event_title: event.title,
      event_date: event.event_date,
      venue: event.venue
    });

    setRegistrationMessage(
      'Your Tech Titans event pass is ready.'
    );
  };

  // --------------------------------------------------
  // QR CODE URL
  // --------------------------------------------------

  const getQrCodeUrl = (qrToken) => {
    if (!qrToken) return null;

    const payload = encodeURIComponent(
      JSON.stringify({
        type: 'TECH_TITANS_EVENT_PASS',
        qr_token: qrToken
      })
    );

    return `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${payload}`;
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loadingEvents) {
    return (
      <div className="home-body min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-[#ae97d6]"
            size={36}
          />

          <p className="text-[#ae97d6] font-mono text-sm uppercase tracking-widest">
            Loading Event Deployments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-body min-h-screen pt-24 pb-20 flex-grow flex flex-col">

      <div
        id="view-events"
        className="page-view active flex-grow"
      >

        <div className="max-w-6xl mx-auto px-6 py-16 relative z-10 flex flex-col gap-20">

          {/* ------------------------------------------------ */}
          {/* UPCOMING EVENT HIGHLIGHT */}
          {/* ------------------------------------------------ */}

          <div className="reveal">

            <h2 className="section-heading text-3xl">
              Active Deployment
            </h2>

            <div className="glass-panel overflow-hidden border border-accent/20">

              <div className="flex flex-col md:flex-row">

                <div className="w-full md:w-5/12 p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/5 bg-[#161821]/50">

                  <span className="inline-block px-3 py-1 bg-accent/10 text-accent font-bold text-[10px] rounded mb-4 tracking-wider uppercase border border-accent/20">
                    Tech Titans
                  </span>

                  <h3 className="text-3xl font-black text-white mb-3 leading-tight tracking-tight">
                    Events &amp;
                    <br />
                    Deployments
                  </h3>

                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Discover upcoming Tech Titans events,
                    register directly through the platform,
                    and secure your participation.
                  </p>

                  <div className="flex items-center text-xs font-semibold text-gray-300 gap-2 bg-black/20 p-3 rounded-lg border border-white/5">
                    <MapPin
                      size={15}
                      className="text-accent"
                    />

                    Official Tech Titans Events
                  </div>

                </div>

                <div className="w-full md:w-7/12 p-8 md:p-10">

                  <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">
                    Event Protocol
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg">
                      <Calendar
                        size={20}
                        className="text-[#00f3ff] mb-3"
                      />

                      <h5 className="text-white font-bold text-sm mb-1">
                        Live Events
                      </h5>

                      <p className="text-xs text-gray-500">
                        View official event dates and schedules.
                      </p>
                    </div>

                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg">
                      <Ticket
                        size={20}
                        className="text-[#ae97d6] mb-3"
                      />

                      <h5 className="text-white font-bold text-sm mb-1">
                        Direct Registration
                      </h5>

                      <p className="text-xs text-gray-500">
                        Register directly through Tech Titans.
                      </p>
                    </div>

                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg">
                      <Users
                        size={20}
                        className="text-green-400 mb-3"
                      />

                      <h5 className="text-white font-bold text-sm mb-3">
                        Participant Slots
                      </h5>

                      <p className="text-xs text-gray-500">
                        Every event can have its own capacity.
                      </p>
                    </div>

                    <div className="bg-[#0f1015] border border-white/5 p-4 rounded-lg">
                      <CheckCircle
                        size={20}
                        className="text-yellow-400 mb-3"
                      />

                      <h5 className="text-white font-bold text-sm mb-1">
                        Digital Attendance
                      </h5>

                      <p className="text-xs text-gray-500">
                        Registration will connect to event attendance.
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* ------------------------------------------------ */}
          {/* PUBLISHED EVENTS */}
          {/* ------------------------------------------------ */}

          {publishedEvents.length > 0 ? (

            <div className="reveal in-view">

              <h2 className="section-heading text-2xl">
                Published Events
              </h2>

              <div className="grid grid-cols-1 gap-8">

                {publishedEvents.map((event) => {

                  const deadlineStatus =
                    getDeadlineStatus(event);

                  const registered =
                    isRegistered(event.id);

                  return (

                    <div
                      key={event.id}
                      className="glass-panel overflow-hidden border border-accent/20"
                    >

                      <div className="flex flex-col md:flex-row">

                        {event.image_url && (

                          <div className="w-full md:w-5/12 bg-[#0f1015]">

                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="w-full h-full min-h-[320px] object-cover"
                            />

                          </div>

                        )}

                        <div className="w-full md:flex-1 p-8 md:p-10 bg-[#161821]/50">

                          <span className="inline-block px-3 py-1 bg-accent/10 text-accent font-bold text-[10px] rounded mb-4 tracking-wider uppercase border border-accent/20">
                            {event.status || 'Upcoming'}
                          </span>

                          <h3 className="text-3xl font-black text-white mb-3 leading-tight tracking-tight">
                            {event.title}
                          </h3>

                          {event.description && (

                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                              {event.description}
                            </p>

                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                            <div className="flex items-start text-xs font-semibold text-gray-300 gap-3 bg-black/20 p-3 rounded-lg border border-white/5">

                              <Calendar
                                size={17}
                                className="text-accent shrink-0 mt-0.5"
                              />

                              <div>
                                <p className="text-[9px] text-gray-500 uppercase tracking-wider font-mono mb-1">
                                  Event Date
                                </p>

                                <p>
                                  {formatDate(
                                    event.event_date
                                  )}
                                </p>
                              </div>

                            </div>

                            <div className="flex items-start text-xs font-semibold text-gray-300 gap-3 bg-black/20 p-3 rounded-lg border border-white/5">

                              <MapPin
                                size={17}
                                className="text-[#00f3ff] shrink-0 mt-0.5"
                              />

                              <div>
                                <p className="text-[9px] text-gray-500 uppercase tracking-wider font-mono mb-1">
                                  Venue
                                </p>

                                <p>
                                  {event.venue ||
                                    'Venue will be announced'}
                                </p>
                              </div>

                            </div>

                            <div className="flex items-start text-xs font-semibold text-gray-300 gap-3 bg-black/20 p-3 rounded-lg border border-white/5">

                              <Users
                                size={17}
                                className="text-green-400 shrink-0 mt-0.5"
                              />

                              <div>
                                <p className="text-[9px] text-gray-500 uppercase tracking-wider font-mono mb-1">
                                  Maximum Participants
                                </p>

                                <p>
                                  {event.max_participants ||
                                    'Unlimited'}
                                </p>
                              </div>

                            </div>

                            <div className="flex items-start text-xs font-semibold text-gray-300 gap-3 bg-black/20 p-3 rounded-lg border border-white/5">

                              <Clock
                                size={17}
                                className={
                                  deadlineStatus.expired
                                    ? 'text-red-400 shrink-0 mt-0.5'
                                    : 'text-yellow-400 shrink-0 mt-0.5'
                                }
                              />

                              <div>
                                <p className="text-[9] text-gray-500 uppercase tracking-wider font-mono mb-1">
                                  Registration Deadline
                                </p>

                                <p
                                  className={
                                    deadlineStatus.expired
                                      ? 'text-red-400'
                                      : ''
                                  }
                                >
                                  {event.registration_deadline
                                    ? formatDate(
                                        event.registration_deadline
                                      )
                                    : 'Until event begins'}
                                </p>
                              </div>

                            </div>

                          </div>

                          <div className="mt-4 flex items-center gap-2">

                            <span
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] uppercase tracking-wider font-mono font-bold ${
                                event.registration_enabled &&
                                !deadlineStatus.expired
                                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                  : 'bg-red-500/10 border-red-500/20 text-red-400'
                              }`}
                            >

                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  event.registration_enabled &&
                                  !deadlineStatus.expired
                                    ? 'bg-green-400'
                                    : 'bg-red-400'
                                }`}
                              />

                              {event.registration_enabled &&
                              !deadlineStatus.expired
                                ? 'Registration Open'
                                : 'Registration Closed'}

                            </span>

                          </div>

                          <div className="flex flex-wrap gap-3 mt-6">

                            {event.registration_enabled &&
                              event.status === 'upcoming' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRegister(event)
                                  }
                                  disabled={
                                    registeringEventId ===
                                      event.id ||
                                    registered ||
                                    deadlineStatus.expired
                                  }
                                  className={`btn-keycap inline-flex items-center justify-center px-6 py-3 text-xs ${
                                    registered ||
                                    deadlineStatus.expired
                                      ? 'opacity-60 cursor-not-allowed'
                                      : ''
                                  }`}
                                >

                                  {registeringEventId ===
                                  event.id ? (

                                    <>
                                      <Loader2
                                        size={15}
                                        className="mr-2 animate-spin"
                                      />

                                      REGISTERING...
                                    </>

                                  ) : registered ? (

                                    <>
                                      <CheckCircle
                                        size={15}
                                        className="mr-2"
                                      />

                                      REGISTERED
                                    </>

                                  ) : (

                                    <>
                                      <Ticket
                                        size={15}
                                        className="mr-2"
                                      />

                                      REGISTER NOW
                                    </>

                                  )}

                                </button>
                              )}

                            {registered && (
                              <button
                                type="button"
                                onClick={() =>
                                  showEventPass(
                                    event,
                                    registeredEvents.find(
                                      (item) =>
                                        item.event_id ===
                                        event.id
                                    )
                                  )
                                }
                                className="inline-flex items-center justify-center px-6 py-3 text-xs rounded-lg border border-[#00f3ff]/20 bg-[#00f3ff]/5 text-[#00f3ff] hover:border-[#00f3ff]/40 transition-colors"
                              >
                                <QrCode
                                  size={15}
                                  className="mr-2"
                                />
                                VIEW EVENT PASS
                              </button>
                            )}

                            {event.event_link && (

                              <a
                                href={event.event_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-6 py-3 text-xs rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
                              >

                                VIEW EVENT

                                <ExternalLink
                                  size={14}
                                  className="ml-2"
                                />

                              </a>

                            )}

                          </div>

                          {registered && (
                            <div className="mt-5 p-4 rounded-xl bg-[#ae97d6]/10 border border-[#ae97d6]/30">

                              <div className="flex items-center gap-2 mb-2">

                                <CheckCircle
                                  size={16}
                                  className="text-[#ae97d6]"
                                />

                                <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#ae97d6]">
                                  Registration Confirmed
                                </span>

                              </div>

                              {(() => {
                                const registration =
                                  registeredEvents.find(
                                    (item) =>
                                      item.event_id ===
                                      event.id
                                  );

                                return (
                                  <p className="text-sm text-white font-mono">
                                    Registration ID:{' '}
                                    <span className="text-[#00f3ff] font-bold">
                                      {registration?.registration_code ||
                                        'GENERATED'}
                                    </span>
                                  </p>
                                );
                              })()}

                            </div>
                          )}

                        </div>

                      </div>

                    </div>

                  );
                })}

              </div>

            </div>

          ) : (

            <div className="reveal">

              <div className="glass-panel p-12 text-center">

                <Calendar
                  size={40}
                  className="mx-auto mb-4 text-gray-600"
                />

                <h3 className="text-xl font-bold text-white mb-2">
                  No Published Events
                </h3>

                <p className="text-gray-500 text-sm">
                  New Tech Titans deployments will appear here
                  once published by an administrator.
                </p>

              </div>

            </div>

          )}

          {/* ------------------------------------------------ */}
          {/* REGISTRATION MESSAGE MODAL */}
          {/* ------------------------------------------------ */}

          {registrationMessage && (

            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={closeRegistrationMessage}
            >

              <div
                className="glass-panel w-full max-w-md p-8 border border-[#ae97d6]/30"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >

                <div className="text-center">

                  <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#ae97d6]/10 border border-[#ae97d6]/30 flex items-center justify-center">

                    {registrationResult ? (
                      <CheckCircle
                        size={30}
                        className="text-[#ae97d6]"
                      />
                    ) : (
                      <Ticket
                        size={30}
                        className="text-[#ae97d6]"
                      />
                    )}

                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {registrationResult
                      ? 'Registration Confirmed'
                      : 'Registration Notice'}
                  </h3>

                  <p className="text-sm text-gray-400 leading-relaxed">
                    {registrationMessage}
                  </p>

                  {registrationResult
                    ?.registration_code && (

                    <div className="mt-6 p-4 rounded-xl bg-black/30 border border-white/10">

                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">
                        Your Registration ID
                      </p>

                      <p className="text-xl text-[#00f3ff] font-black font-mono tracking-wider">
                        {registrationResult.registration_code}
                      </p>

                      {registrationResult.qr_token && (
                        <div className="mt-5">

                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-3">
                            Digital Event Pass
                          </p>

                          <div className="bg-white p-3 rounded-xl inline-block">

                            <img
                              src={getQrCodeUrl(
                                registrationResult.qr_token
                              )}
                              alt="Tech Titans Event Pass QR Code"
                              className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                            />

                          </div>

                          <p className="text-[10px] text-gray-500 mt-3">
                            Show this QR code at the event entrance
                            for attendance verification.
                          </p>

                        </div>
                      )}

                      {registrationResult.event_title && (
                        <div className="mt-5 pt-4 border-t border-white/10 text-left">

                          <p className="text-white font-bold text-sm">
                            {registrationResult.event_title}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(
                              registrationResult.event_date
                            )}
                          </p>

                          {registrationResult.venue && (
                            <p className="text-xs text-gray-500 mt-1">
                              {registrationResult.venue}
                            </p>
                          )}

                        </div>
                      )}

                      <p className="text-[10px] text-gray-500 mt-3">
                        Keep this pass available on event day.
                      </p>

                    </div>

                  )}

                  <button
                    type="button"
                    onClick={closeRegistrationMessage}
                    className="btn-keycap mt-7 w-full py-3 text-xs"
                  >
                    CLOSE
                  </button>

                </div>

              </div>

            </div>

          )}

          {/* ------------------------------------------------ */}
          {/* ARCHIVED EVENTS */}
          {/* ------------------------------------------------ */}

          <div className="reveal">

            <h2 className="section-heading text-2xl">
              Archived Events
            </h2>

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
                    Event History
                  </h4>

                  <p className="text-xs text-gray-500 mt-1">
                    Completed events will appear here.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
>>>>>>> 8a51097 (Profile.jsx, Events.jsx, and Admin.jsx are updated and EventAttendanceScanner.jsx added)
}