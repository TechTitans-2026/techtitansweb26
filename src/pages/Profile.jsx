import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  CheckCircle,
  XCircle,
  Star,
  LogOut,
  User,
  Calendar,
  MapPin,
  Ticket,
  Clock,
  QrCode,
  Loader2
} from 'lucide-react';

import { QRCodeSVG } from 'qrcode.react';

import { useAuth } from '../hooks/useAuth';
import { questService } from '../services/questService';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [eventRegistrations, setEventRegistrations] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [selectedPass, setSelectedPass] = useState(null);

  // --------------------------------------------------
  // LOAD PROFILE DATA
  // --------------------------------------------------

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        setEventsLoading(false);
        return;
      }

      try {
        setLoading(true);

        const userHistory =
          await questService.fetchUserHistory(user.id);

        setHistory(userHistory || []);
      } catch (err) {
        console.error(
          'Failed to load user history:',
          err
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  // --------------------------------------------------
  // LOAD EVENT REGISTRATIONS
  // --------------------------------------------------

  useEffect(() => {
    async function loadEventRegistrations() {
      if (!user?.id) {
        setEventRegistrations([]);
        setEventsLoading(false);
        return;
      }

      try {
        setEventsLoading(true);

        const { data, error } = await supabase
          .from('event_registrations')
          .select(`
            id,
            event_id,
            registration_code,
            qr_token,
            registered_at,
            attended,
            attended_at,
            events (
              id,
              title,
              description,
              event_date,
              venue,
              image_url,
              status,
              max_participants,
              registration_deadline
            )
          `)
          .eq('user_id', user.id)
          .order('registered_at', {
            ascending: false
          });

        if (error) {
          throw error;
        }

        setEventRegistrations(data || []);
      } catch (err) {
        console.error(
          'Failed to load event registrations:',
          err
        );
      } finally {
        setEventsLoading(false);
      }
    }

    loadEventRegistrations();
  }, [user?.id]);

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = async () => {
    await signOut();
    navigate('/home');
  };

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return 'Not announced';

    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // --------------------------------------------------
  // TOTAL XP
  // --------------------------------------------------

  const totalXP =
    (profile?.xp || 0) +
    history.reduce(
      (acc, curr) =>
        acc + (curr.xp_awarded || 0),
      0
    );

  const wonQuests = history.filter(
    (h) => h.status === 'won'
  ).length;

  // --------------------------------------------------
  // QR VALUE
  // --------------------------------------------------

  const getQRValue = (registration) => {
    return JSON.stringify({
      type: 'TECH_TITANS_EVENT_PASS',
      registration_id: registration.id,
      registration_code:
        registration.registration_code,
      qr_token: registration.qr_token,
      event_id: registration.event_id
    });
  };

  return (
    <div className="home-body min-h-screen pt-24 pb-16 px-6">

      <div className="max-w-5xl mx-auto">

        {/* ================================================== */}
        {/* PROFILE HEADER */}
        {/* ================================================== */}

        <div className="glass-panel p-8 sm:p-10 mb-10 relative overflow-hidden">

          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ae97d6]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 relative z-10">

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">

              <div className="w-24 h-24 rounded-full bg-black/60 border-2 border-[#ae97d6] flex items-center justify-center shadow-[0_0_20px_rgba(174,151,214,0.3)] shrink-0">

                <User
                  size={42}
                  className="text-[#ae97d6]"
                />

              </div>

              <div>

                <h1 className="text-2xl sm:text-3xl font-black font-['Orbitron'] text-white tracking-wide mb-1">
                  {profile?.full_name ||
                    user?.user_metadata?.full_name ||
                    'TITAN OPERATIVE'}
                </h1>

                <div className="flex flex-col gap-1 mt-2 font-mono text-xs sm:text-sm">

                  <span className="text-[#8c8d96]">
                    OPERATIVE ID:{' '}
                    {user?.id?.substring(0, 8)}...
                  </span>

                  <span className="text-[#00f3ff] uppercase tracking-widest font-bold">
                    ROLE: {profile?.role || 'member'}
                  </span>

                </div>

              </div>

            </div>

            <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">

              <div className="bg-black/40 border border-[#31333e] rounded-xl p-4 flex gap-6 text-center w-full sm:w-auto justify-center">

                <div>

                  <div className="text-[11px] text-[#8c8d96] font-mono mb-1 uppercase tracking-wider">
                    TOTAL XP
                  </div>

                  <div className="text-2xl font-black font-['Orbitron'] text-[#ae97d6]">
                    {totalXP}
                  </div>

                </div>

                <div className="w-px bg-[#31333e]" />

                <div>

                  <div className="text-[11px] text-[#8c8d96] font-mono mb-1 uppercase tracking-wider">
                    QUESTS WON
                  </div>

                  <div className="text-2xl font-black font-['Orbitron'] text-green-400">
                    {wonQuests}
                  </div>

                </div>

                <div className="w-px bg-[#31333e]" />

                <div>

                  <div className="text-[11px] text-[#8c8d96] font-mono mb-1 uppercase tracking-wider">
                    EVENTS
                  </div>

                  <div className="text-2xl font-black font-['Orbitron'] text-[#00f3ff]">
                    {eventRegistrations.length}
                  </div>

                </div>

              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors font-mono cursor-pointer uppercase tracking-wider py-1.5 px-3 rounded border border-white/5 hover:border-red-500/30"
              >
                <LogOut size={14} />
                SECURE LOGOUT
              </button>

            </div>

          </div>

        </div>

        {/* ================================================== */}
        {/* MY EVENT PASSES */}
        {/* ================================================== */}

        <div className="space-y-6 mb-12">

          <div className="flex items-center justify-between gap-4">

            <div>

              <h2 className="section-heading text-xl">
                YOUR EVENT PASSES
              </h2>

              <p className="text-xs text-[#8c8d96] font-mono mt-2">
                Digital registration credentials for your
                deployed events.
              </p>

            </div>

            <Ticket
              size={24}
              className="text-[#ae97d6] shrink-0"
            />

          </div>

          {eventsLoading ? (

            <div className="glass-panel p-10 text-center">

              <Loader2
                className="animate-spin mx-auto mb-4 text-[#ae97d6]"
                size={30}
              />

              <p className="text-[#8c8d96] text-sm font-mono">
                SYNCING EVENT PASSES...
              </p>

            </div>

          ) : eventRegistrations.length === 0 ? (

            <div className="glass-panel p-10 text-center">

              <Ticket
                size={40}
                className="mx-auto mb-4 text-gray-600"
              />

              <h3 className="text-white font-bold text-lg mb-2">
                No Event Registrations
              </h3>

              <p className="text-[#8c8d96] text-sm font-mono mb-5">
                You have not registered for any Tech Titans
                event yet.
              </p>

              <button
                type="button"
                onClick={() => navigate('/events')}
                className="btn-keycap px-6 py-3 text-xs"
              >
                EXPLORE EVENTS
              </button>

            </div>

          ) : (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {eventRegistrations.map((registration) => {

                const event =
                  registration.events;

                if (!event) return null;

                return (

                  <div
                    key={registration.id}
                    className="glass-panel overflow-hidden border border-[#ae97d6]/20"
                  >

                    {/* EVENT IMAGE */}

                    {event.image_url && (

                      <div className="h-44 overflow-hidden bg-[#0f1015]">

                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />

                      </div>

                    )}

                    <div className="p-6">

                      {/* HEADER */}

                      <div className="flex justify-between items-start gap-4 mb-5">

                        <div>

                          <span className="inline-block px-2.5 py-1 bg-[#ae97d6]/10 text-[#ae97d6] font-bold text-[9px] rounded tracking-wider uppercase border border-[#ae97d6]/20 mb-3">
                            EVENT PASS
                          </span>

                          <h3 className="text-xl font-black text-white font-['Orbitron'] tracking-wide">
                            {event.title}
                          </h3>

                        </div>

                        {registration.attended ? (

                          <span className="shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-mono uppercase font-bold">
                            <CheckCircle size={11} />
                            ATTENDED
                          </span>

                        ) : (

                          <span className="shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-[#00f3ff]/10 border border-[#00f3ff]/20 text-[#00f3ff] text-[9px] font-mono uppercase font-bold">
                            REGISTERED
                          </span>

                        )}

                      </div>

                      {/* DETAILS */}

                      <div className="space-y-2.5">

                        <div className="flex items-center gap-3 text-xs text-gray-300 font-mono">

                          <Calendar
                            size={15}
                            className="text-[#ae97d6] shrink-0"
                          />

                          <span>
                            {formatDate(
                              event.event_date
                            )}
                          </span>

                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-300 font-mono">

                          <MapPin
                            size={15}
                            className="text-[#00f3ff] shrink-0"
                          />

                          <span>
                            {event.venue ||
                              'Venue to be announced'}
                          </span>

                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-300 font-mono">

                          <Clock
                            size={15}
                            className="text-yellow-400 shrink-0"
                          />

                          <span>
                            Registered:{' '}
                            {formatDate(
                              registration.registered_at
                            )}
                          </span>

                        </div>

                      </div>

                      {/* REGISTRATION CODE */}

                      <div className="mt-5 p-3 rounded-lg bg-black/30 border border-white/5">

                        <p className="text-[9px] text-[#8c8d96] uppercase tracking-widest font-mono mb-1">
                          Registration ID
                        </p>

                        <p className="text-[#00f3ff] font-black font-mono tracking-wider text-sm">
                          {registration.registration_code}
                        </p>

                      </div>

                      {/* VIEW QR */}

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPass(
                            registration
                          )
                        }
                        className="btn-keycap w-full mt-4 py-3 text-xs flex items-center justify-center gap-2"
                      >

                        <QrCode size={15} />

                        SHOW EVENT QR PASS

                      </button>

                    </div>

                  </div>

                );

              })}

            </div>

          )}

        </div>

        {/* ================================================== */}
        {/* QUEST HISTORY */}
        {/* ================================================== */}

        <div className="space-y-6">

          <h2 className="section-heading text-xl">
            YOUR QUEST HISTORY
          </h2>

          <div className="glass-panel p-6 rounded-xl border border-white/5">

            {loading ? (

              <p className="text-[#8c8d96] text-sm font-mono text-center py-6 animate-pulse">
                Syncing quest telemetry...
              </p>

            ) : history.length === 0 ? (

              <p className="text-[#8c8d96] text-sm font-mono text-center py-8">
                No quest deployments recorded yet.
              </p>

            ) : (

              <div className="space-y-3">

                {history.map((record, idx) => {

                  const isWon =
                    record.status === 'won';

                  const isLost =
                    record.status === 'lost';

                  let statusClass =
                    'text-gray-400';

                  let borderClass =
                    'border-[#31333e] bg-black/20';

                  let Icon = Target;

                  if (isWon) {

                    statusClass =
                      'text-green-400 font-bold';

                    borderClass =
                      'border-green-500/30 bg-green-500/5';

                    Icon = CheckCircle;

                  } else if (isLost) {

                    statusClass =
                      'text-red-400 font-bold';

                    borderClass =
                      'border-red-500/30 bg-red-500/5';

                    Icon = XCircle;

                  } else {

                    statusClass =
                      'text-yellow-400';

                    Icon = Star;

                  }

                  return (

                    <div
                      key={record.id || idx}
                      className={`flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-lg border ${borderClass} transition-colors gap-3`}
                    >

                      <div>

                        <div className="flex items-center gap-2.5 mb-1">

                          <Icon
                            className={statusClass}
                            size={18}
                          />

                          <span className="font-bold text-white font-['Orbitron'] text-sm sm:text-base tracking-wide">
                            {record.quests?.title ||
                              'Classified Quest'}
                          </span>

                        </div>

                        <div className="text-xs text-[#8c8d96] font-mono pl-7">
                          DEPLOYED:{' '}
                          {new Date(
                            record.created_at
                          ).toLocaleDateString()}
                        </div>

                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 pl-7 sm:pl-0">

                        <span
                          className={`text-xs font-mono uppercase tracking-widest ${statusClass}`}
                        >
                          {record.status}
                        </span>

                        <div className="text-right">

                          <div className="text-[10px] text-[#8c8d96] font-mono uppercase">
                            XP EARNED
                          </div>

                          <span className="font-bold font-['Orbitron'] text-[#ae97d6] text-base">
                            +{record.xp_awarded}
                          </span>

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

      {/* ================================================== */}
      {/* QR EVENT PASS MODAL */}
      {/* ================================================== */}

      {selectedPass && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setSelectedPass(null)}
        >

          <div
            className="w-full max-w-md glass-panel overflow-hidden border border-[#ae97d6]/30"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* PASS HEADER */}

            <div className="p-6 border-b border-white/10 text-center">

              <span className="text-[#00f3ff] font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
                TECH TITANS
              </span>

              <h2 className="text-2xl font-black font-['Orbitron'] text-white mt-2 tracking-wide">
                EVENT PASS
              </h2>

            </div>

            {/* QR */}

            <div className="p-8 flex flex-col items-center">

              <div className="bg-white p-5 rounded-2xl shadow-[0_0_40px_rgba(174,151,214,0.25)]">

                <QRCodeSVG
                  value={getQRValue(
                    selectedPass
                  )}
                  size={220}
                  level="H"
                  includeMargin
                />

              </div>

              <h3 className="text-xl font-black font-['Orbitron'] text-white text-center mt-7">
                {selectedPass.events?.title}
              </h3>

              <div className="flex flex-col gap-2 mt-4 text-center">

                <div className="flex items-center justify-center gap-2 text-xs text-gray-300 font-mono">

                  <Calendar
                    size={14}
                    className="text-[#ae97d6]"
                  />

                  {formatDate(
                    selectedPass.events?.event_date
                  )}

                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-300 font-mono">

                  <MapPin
                    size={14}
                    className="text-[#00f3ff]"
                  />

                  {selectedPass.events?.venue ||
                    'Venue to be announced'}

                </div>

              </div>

              <div className="mt-6 w-full p-4 rounded-xl bg-black/30 border border-white/10 text-center">

                <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-mono mb-2">
                  REGISTRATION ID
                </p>

                <p className="text-[#00f3ff] font-black font-mono text-lg tracking-widest">
                  {selectedPass.registration_code}
                </p>

              </div>

              <div className="mt-5 flex items-center gap-2">

                {selectedPass.attended ? (

                  <>
                    <CheckCircle
                      size={15}
                      className="text-green-400"
                    />

                    <span className="text-green-400 text-xs font-mono font-bold uppercase tracking-wider">
                      Attendance Verified
                    </span>
                  </>

                ) : (

                  <>
                    <QrCode
                      size={15}
                      className="text-[#ae97d6]"
                    />

                    <span className="text-[#ae97d6] text-xs font-mono font-bold uppercase tracking-wider">
                      Present this QR at the event
                    </span>
                  </>

                )}

              </div>

            </div>

            {/* CLOSE */}

            <div className="p-5 border-t border-white/10">

              <button
                type="button"
                onClick={() =>
                  setSelectedPass(null)
                }
                className="btn-keycap w-full py-3 text-xs"
              >
                CLOSE EVENT PASS
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}