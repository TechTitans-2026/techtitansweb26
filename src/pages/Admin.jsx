import React, { useEffect, useState } from 'react';
import {
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  Star,
  Plus,
  Image as ImageIcon,
  Trash2,
  Edit
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { questService } from '../services/questService';
import { eventService } from '../services/eventService';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const { profile } = useAuth();

  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState(null);

  // New Quest Form State
  const [questForm, setQuestForm] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    base_xp: 0,
    rewards: ''
  });

  const [questStatus, setQuestStatus] = useState('');

  // New Event Form State
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: '',
    status: 'upcoming'
  });

  const [eventImage, setEventImage] = useState(null);
  const [eventStatus, setEventStatus] = useState('');

  // EDIT EVENT STATE
  const [editingEvent, setEditingEvent] = useState(null);

  // Access Code State
  const [accessCode, setAccessCode] = useState('');
  const [accessStatus, setAccessStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // FETCH EVENTS
  const fetchEvents = async () => {
    try {
      setEventsLoading(true);

      const eventsData = await eventService.fetchEvents();

      setEvents(eventsData || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  // FETCH ADMIN DATA
  useEffect(() => {
    async function fetchAdminData() {
      if (profile?.role !== 'admin' && profile?.role !== 'head') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [profilesData, historyData, eventsData] =
          await Promise.all([
            questService.fetchAllProfiles(),
            questService.fetchAllQuestHistory(),
            eventService.fetchEvents()
          ]);

        setMembers(profilesData || []);
        setHistory(historyData || []);
        setEvents(eventsData || []);

      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, [profile?.role]);

  // CREATE QUEST
  const handleCreateQuest = async (e) => {
    e.preventDefault();

    setQuestStatus('Submitting...');

    try {
      await questService.insertQuest({
        ...questForm,
        base_xp: parseInt(questForm.base_xp, 10) || 0,
        status: 'Active'
      });

      setQuestStatus('Quest created successfully!');

      setQuestForm({
        title: '',
        description: '',
        difficulty: 'Beginner',
        base_xp: 0,
        rewards: ''
      });

      setTimeout(() => setQuestStatus(''), 3000);

    } catch (err) {
      setQuestStatus('Error: ' + err.message);
    }
  };

  // CREATE OR UPDATE EVENT
  const handleCreateEvent = async (e) => {
    e.preventDefault();

    setEventStatus(
      editingEvent ? 'Updating event...' : 'Submitting...'
    );

    try {
      // Keep old image when editing unless a new image is selected
      let image_url = editingEvent?.image_url || null;

      // Upload new image only if selected
      if (eventImage) {
        setEventStatus('Uploading image...');

        image_url = await eventService.uploadImage(eventImage);
      }

      if (editingEvent) {
        // UPDATE EXISTING EVENT
        setEventStatus('Updating event...');

        await eventService.updateEvent(
          editingEvent.id,
          {
            ...eventForm,
            image_url
          }
        );

        setEventStatus('Event updated successfully!');

      } else {
        // CREATE NEW EVENT
        setEventStatus('Saving event...');

        await eventService.insertEvent({
          ...eventForm,
          image_url
        });

        setEventStatus('Event published successfully!');
      }

      // REFRESH EVENTS LIST
      await fetchEvents();

      // RESET FORM
      setEventForm({
        title: '',
        description: '',
        event_date: '',
        status: 'upcoming'
      });

      setEventImage(null);
      setEditingEvent(null);

      setTimeout(() => setEventStatus(''), 3000);

    } catch (err) {
      console.error('Event operation failed:', err);
      setEventStatus('Error: ' + err.message);
    }
  };

  // EDIT EVENT
  const handleEditEvent = (event) => {
    setEditingEvent(event);

    setEventForm({
      title: event.title || '',
      description: event.description || '',
      event_date: event.event_date
        ? new Date(event.event_date).toISOString().slice(0, 16)
        : '',
      status: event.status || 'upcoming'
    });

    // Keep old image unless admin selects a new one
    setEventImage(null);
  };

  // DELETE EVENT
  const handleDeleteEvent = async (id, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );

    if (!confirmDelete) return;

    try {
      setEventStatus('Deleting event...');

      await eventService.deleteEvent(id);

      // REMOVE EVENT FROM SCREEN IMMEDIATELY
      setEvents(prevEvents =>
        prevEvents.filter(event => event.id !== id)
      );

      setEventStatus('Event deleted successfully!');

      setTimeout(() => setEventStatus(''), 3000);

    } catch (err) {
      console.error('Failed to delete event:', err);

      setEventStatus(
        'Error deleting event: ' + err.message
      );
    }
  };

  // ADMIN ACCESS CODE
  const handleAccessCode = async (e) => {
    e.preventDefault();

    setAccessStatus('Verifying...');

    try {
      const { data: rpcData, error: rpcError } =
        await supabase.rpc('verify_admin_code', {
          code: accessCode.trim(),
        });

      if (!rpcError && rpcData) {
        if (rpcData.success) {
          setAccessStatus('Access Granted! Refreshing...');

          setTimeout(() => {
            window.location.reload();
          }, 1200);

          return;

        } else if (rpcData.error) {
          throw new Error(rpcData.error);
        }
      }

      // FALLBACK EDGE FUNCTION
      const { data, error: fnError } =
        await supabase.functions.invoke('grant-admin', {
          body: { code: accessCode.trim() },
        });

      if (fnError) throw fnError;

      if (data?.error) {
        throw new Error(data.error);
      }

      setAccessStatus('Access Granted! Refreshing...');

      setTimeout(() => {
        window.location.reload();
      }, 1200);

    } catch (err) {
      setAccessStatus(
        err.message?.includes('Invalid access code')
          ? 'Invalid Access Code'
          : 'Error: ' + err.message
      );
    }
  };

  // NOT ADMIN SCREEN
  if (profile?.role !== 'admin' && profile?.role !== 'head') {
    return (
      <div className="home-body min-h-screen flex items-center justify-center p-4 pt-24 relative overflow-hidden">

        <div
          className="anchor-glow"
          style={{
            width: '500px',
            height: '500px',
            top: '-180px',
            left: '-140px',
            background:
              'radial-gradient(circle, rgba(174,151,214,0.4), transparent 70%)'
          }}
        />

        <div
          className="anchor-glow"
          style={{
            width: '420px',
            height: '420px',
            bottom: '-100px',
            right: '-160px',
            background:
              'radial-gradient(circle, rgba(220,38,38,0.2), transparent 70%)',
            animationDelay: '3s'
          }}
        />

        <div className="max-w-md w-full glass-panel p-8 relative overflow-hidden z-10">

          <div className="text-center mb-6">
            <span className="text-accent font-mono text-xs font-bold uppercase tracking-[0.3em] mb-2 block">
              SECURITY PROTOCOL
            </span>

            <h2 className="text-3xl font-black text-white tracking-tight">
              ADMIN ACCESS
            </h2>
          </div>

          {accessStatus && (
            <div
              className={`p-3 rounded-lg mb-6 text-sm text-center font-mono ${
                accessStatus.includes('Error') ||
                accessStatus.includes('Invalid')
                  ? 'bg-red-500/10 border border-red-500/50 text-red-400'
                  : 'bg-[#ae97d6]/10 border border-[#ae97d6]/50 text-[#ae97d6]'
              }`}
            >
              {accessStatus}
            </div>
          )}

          <form onSubmit={handleAccessCode} className="space-y-5">

            <div>
              <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider mb-2">
                Access Code
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="input-glass w-full pr-10 font-mono tracking-widest text-center text-lg"
                  placeholder="••••••"
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle access code visibility"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-keycap w-full py-3.5 text-sm"
            >
              VERIFY ACCESS
            </button>

          </form>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div className="home-body min-h-screen pt-24 pb-16 px-6">

      <div className="max-w-7xl mx-auto">

        <div className="mb-10">

          <span className="text-accent font-mono text-xs font-bold uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
            <Shield className="text-[#00f3ff] w-4 h-4" />
            ROOT SECURITY CLEARANCE
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">
            <span className="title-tech">ADMIN</span>{' '}
            <span className="title-titans">CONTROL</span>
          </h1>

          <p className="text-[#8c8d96] font-mono text-xs sm:text-sm">
            Authenticated as:{' '}
            <span className="text-white font-bold">
              {profile?.full_name || 'System Admin'}
            </span>
            {' '}| Clearance Level: Root
          </p>

        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-mono text-sm">
            ERROR: {error}
          </div>
        )}

        {loading ? (

          <div className="glass-panel p-12 text-center text-[#ae97d6] font-mono text-sm animate-pulse">
            Fetching telemetry records...
          </div>

        ) : (

          <div className="flex flex-col gap-10">

            {/* MEMBER DIRECTORY + QUEST ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* MEMBER DIRECTORY */}
              <div>

                <h2 className="section-heading text-lg">
                  MEMBER DIRECTORY
                </h2>

                <div className="glass-panel rounded-xl p-6 flex flex-col h-[400px]">

                  <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">

                    {members.length === 0 ? (

                      <p className="text-sm text-[#8c8d96] font-mono py-8 text-center">
                        No member records located.
                      </p>

                    ) : (

                      members.map(member => (

                        <div
                          key={member.id}
                          className="p-3.5 bg-black/40 rounded-lg border border-white/5 hover:border-[#ae97d6]/40 transition-colors flex justify-between items-center"
                        >

                          <div>
                            <h3 className="font-bold text-white flex items-center gap-2 text-sm">

                              {member.full_name || 'Unknown User'}

                              {member.role === 'admin' && (
                                <Shield
                                  size={14}
                                  className="text-yellow-400"
                                />
                              )}

                            </h3>

                            <p className="text-xs text-[#8c8d96] font-mono mt-0.5">
                              ID: {member.id?.substring(0, 8)}...
                            </p>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold tracking-widest ${
                                member.role === 'admin' ||
                                member.role === 'head'
                                  ? 'bg-[#ae97d6]/20 text-[#ae97d6] border border-[#ae97d6]/30'
                                  : 'bg-[#31333e] text-gray-400 border border-white/10'
                              }`}
                            >
                              {member.role}
                            </span>
                          </div>

                        </div>

                      ))

                    )}

                  </div>
                </div>
              </div>

              {/* GLOBAL QUEST ACTIVITY */}
              <div>

                <h2 className="section-heading text-lg">
                  GLOBAL QUEST ACTIVITY
                </h2>

                <div className="glass-panel rounded-xl p-6 flex flex-col h-[400px]">

                  <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">

                    {history.length === 0 ? (

                      <p className="text-sm text-[#8c8d96] font-mono py-8 text-center">
                        No quest deployments recorded yet.
                      </p>

                    ) : (

                      history.map((record, idx) => {

                        const isWon = record.status === 'won';
                        const isLost = record.status === 'lost';

                        let statusClass = "text-gray-400";
                        let borderClass = "border-[#31333e]";
                        let Icon = Star;

                        if (isWon) {
                          statusClass = "text-green-400";
                          borderClass =
                            "border-green-500/30 bg-green-500/5";
                          Icon = CheckCircle;

                        } else if (isLost) {
                          statusClass = "text-red-400";
                          borderClass =
                            "border-red-500/30 bg-red-500/5";
                          Icon = XCircle;

                        } else {
                          statusClass = "text-yellow-400";
                          Icon = Activity;
                        }

                        return (

                          <div
                            key={record.id || idx}
                            className={`p-3.5 rounded-lg border ${borderClass} flex justify-between items-center bg-black/40`}
                          >

                            <div>

                              <div className="flex items-center gap-2 mb-0.5">

                                <Icon
                                  className={statusClass}
                                  size={15}
                                />

                                <span className="font-bold text-white text-xs sm:text-sm font-['Orbitron']">
                                  {record.quests?.title ||
                                    'Unknown Quest'}
                                </span>

                              </div>

                              <div className="text-xs text-[#8c8d96] font-mono pl-5">

                                Operative:{' '}

                                <span className="text-white">
                                  {record.profiles?.full_name ||
                                    'Unknown'}
                                </span>

                              </div>

                            </div>

                            <div className="text-right">

                              <span
                                className={`text-[10px] uppercase font-mono font-bold tracking-widest ${statusClass}`}
                              >
                                {record.status}
                              </span>

                              <div className="text-[10px] text-[#00f3ff] mt-0.5 font-mono font-bold">
                                +{record.xp_awarded} XP
                              </div>

                            </div>

                          </div>

                        );

                      })

                    )}

                  </div>
                </div>
              </div>

            </div>

            {/* MANAGEMENT FORMS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* SETUP NEW QUEST */}
              <div>

                <h2 className="section-heading text-lg">
                  SETUP NEW QUEST
                </h2>

                <div className="glass-panel rounded-xl p-6 sm:p-8">

                  <form
                    onSubmit={handleCreateQuest}
                    className="space-y-4"
                  >

                    <div>

                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Title
                      </label>

                      <input
                        required
                        type="text"
                        value={questForm.title}
                        onChange={e =>
                          setQuestForm({
                            ...questForm,
                            title: e.target.value
                          })
                        }
                        className="input-glass w-full text-sm"
                        placeholder="e.g. Algorithmic Optimization"
                      />

                    </div>

                    <div>

                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Description
                      </label>

                      <textarea
                        required
                        value={questForm.description}
                        onChange={e =>
                          setQuestForm({
                            ...questForm,
                            description: e.target.value
                          })
                        }
                        className="input-glass w-full h-24 text-sm resize-none"
                        placeholder="Provide quest requirements..."
                      />

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                          Difficulty
                        </label>

                        <select
                          value={questForm.difficulty}
                          onChange={e =>
                            setQuestForm({
                              ...questForm,
                              difficulty: e.target.value
                            })
                          }
                          className="input-glass w-full text-sm [color-scheme:dark]"
                        >
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                        </select>

                      </div>

                      <div>

                        <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                          Base XP
                        </label>

                        <input
                          required
                          type="number"
                          value={questForm.base_xp}
                          onChange={e =>
                            setQuestForm({
                              ...questForm,
                              base_xp: e.target.value
                            })
                          }
                          className="input-glass w-full text-sm"
                        />

                      </div>

                    </div>

                    <div>

                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Rewards
                      </label>

                      <input
                        type="text"
                        value={questForm.rewards}
                        onChange={e =>
                          setQuestForm({
                            ...questForm,
                            rewards: e.target.value
                          })
                        }
                        className="input-glass w-full text-sm"
                        placeholder="e.g. Profile Badge & Certificate"
                      />

                    </div>

                    <button
                      type="submit"
                      className="btn-keycap w-full py-3 text-xs mt-2"
                    >
                      <Plus size={15} className="mr-1.5" />
                      CREATE QUEST
                    </button>

                    {questStatus && (
                      <div className="text-xs font-mono mt-2 text-center text-[#ae97d6]">
                        {questStatus}
                      </div>
                    )}

                  </form>
                </div>
              </div>

              {/* EVENTS MANAGEMENT */}
              <div>

                <h2 className="section-heading text-lg">
                  EVENTS MANAGEMENT
                </h2>

                <div className="glass-panel rounded-xl p-6 sm:p-8">

                  {/* CREATE / UPDATE EVENT FORM */}
                  <form
                    onSubmit={handleCreateEvent}
                    className="space-y-4"
                  >

                    <div>

                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Event Title
                      </label>

                      <input
                        required
                        type="text"
                        value={eventForm.title}
                        onChange={e =>
                          setEventForm({
                            ...eventForm,
                            title: e.target.value
                          })
                        }
                        className="input-glass w-full text-sm"
                        placeholder="e.g. Inauguration Day"
                      />

                    </div>

                    <div>

                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Description
                      </label>

                      <textarea
                        required
                        value={eventForm.description}
                        onChange={e =>
                          setEventForm({
                            ...eventForm,
                            description: e.target.value
                          })
                        }
                        className="input-glass w-full h-24 text-sm resize-none"
                        placeholder="Event overview and schedule..."
                      />

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                          Event Date
                        </label>

                        <input
                          required
                          type="datetime-local"
                          value={eventForm.event_date}
                          onChange={e =>
                            setEventForm({
                              ...eventForm,
                              event_date: e.target.value
                            })
                          }
                          className="input-glass w-full text-sm [color-scheme:dark]"
                        />

                      </div>

                      <div>

                        <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                          Status
                        </label>

                        <select
                          value={eventForm.status}
                          onChange={e =>
                            setEventForm({
                              ...eventForm,
                              status: e.target.value
                            })
                          }
                          className="input-glass w-full text-sm [color-scheme:dark]"
                        >
                          <option value="upcoming">
                            Upcoming
                          </option>

                          <option value="ongoing">
                            Ongoing
                          </option>

                          <option value="completed">
                            Completed
                          </option>
                        </select>

                      </div>

                    </div>

                    <div>

                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Event Cover Image
                      </label>

                      <div className="flex items-center gap-4">

                        <label className="cursor-pointer bg-[#21222b] border border-white/10 hover:border-white/30 rounded-lg p-2.5 flex items-center justify-center transition-colors text-gray-300 w-12 h-12 shrink-0">

                          <ImageIcon size={20} />

                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={e =>
                              setEventImage(e.target.files[0])
                            }
                          />

                        </label>

                        <span className="text-xs font-mono text-[#8c8d96] truncate flex-1">
                          {eventImage
                            ? eventImage.name
                            : editingEvent?.image_url
                            ? "Current image (select new image to replace)"
                            : "No image file selected"}
                        </span>

                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-keycap w-full py-3 text-xs mt-2"
                    >
                      {editingEvent ? (
                        <Edit size={15} className="mr-1.5" />
                      ) : (
                        <Plus size={15} className="mr-1.5" />
                      )}

                      {editingEvent ? 'UPDATE EVENT' : 'PUBLISH EVENT'}
                    </button>

                    {eventStatus && (
                      <div className="text-xs font-mono mt-2 text-center text-[#ae97d6]">
                        {eventStatus}
                      </div>
                    )}

                  </form>

                  {/* PUBLISHED EVENTS LIST */}
                  <div className="mt-8 border-t border-white/10 pt-6">

                    <h3 className="text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-4">
                      PUBLISHED EVENTS
                    </h3>

                    {eventsLoading ? (

                      <p className="text-xs text-[#8c8d96] font-mono">
                        Loading events...
                      </p>

                    ) : events.length === 0 ? (

                      <p className="text-xs text-[#8c8d96] font-mono">
                        No published events found.
                      </p>

                    ) : (

                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">

                        {events.map((event) => (

                          <div
                            key={event.id}
                            className="flex items-center justify-between gap-3 p-3 bg-black/40 border border-white/5 rounded-lg"
                          >

                            <div className="min-w-0">

                              <h4 className="text-sm font-bold text-white truncate">
                                {event.title}
                              </h4>

                              <p className="text-[10px] text-[#8c8d96] font-mono mt-1">
                                {event.event_date
                                  ? new Date(
                                      event.event_date
                                    ).toLocaleString()
                                  : 'No date'}
                              </p>

                              <span className="inline-block mt-1 text-[9px] uppercase font-mono text-[#00f3ff]">
                                {event.status}
                              </span>

                            </div>

                            {/* EDIT + DELETE BUTTONS */}
                            <div className="flex items-center gap-2 shrink-0">

                              {/* EDIT BUTTON */}
                              <button
                                type="button"
                                onClick={() => handleEditEvent(event)}
                                className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#ae97d6]/10 border border-[#ae97d6]/30 text-[#ae97d6] hover:bg-[#ae97d6]/20 transition-colors cursor-pointer"
                                title="Edit Event"
                              >
                                <Edit size={16} />
                              </button>

                              {/* DELETE BUTTON */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteEvent(
                                    event.id,
                                    event.title
                                  )
                                }
                                className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                                title="Delete Event"
                              >
                                <Trash2 size={16} />
                              </button>

                            </div>

                          </div>

                        ))}

                      </div>

                    )}

                  </div>

                </div>
              </div>

            </div>
          </div>

        )}

      </div>
    </div>
  );
}
