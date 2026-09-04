import React, { useEffect, useState } from 'react';
import {
  Shield,
  Plus,
  Image as ImageIcon,
  Trash2,
  Edit
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { isAuthorizedAdmin, canClaimAdminAccess } from '../utils/adminCheck';
import { questService } from '../services/questService';
import { eventService } from '../services/eventService';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const { user, profile } = useAuth();

  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [quests, setQuests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [questsLoading, setQuestsLoading] = useState(false);
  const [error, setError] = useState(null);

  // QUEST FORM STATE
  const [questForm, setQuestForm] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    base_xp: 0,
    rewards: '',
    status: 'Active'
  });

  const [questStatus, setQuestStatus] = useState('');

  // EDIT QUEST STATE
  const [editingQuest, setEditingQuest] = useState(null);

  // EVENT FORM STATE
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

  // ACCESS CODE STATE
  const [accessCode, setAccessCode] = useState('');
  const [accessStatus, setAccessStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // =========================
  // FETCH EVENTS
  // =========================
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

  // =========================
  // FETCH ALL QUESTS
  // =========================
  const fetchQuests = async () => {
    try {
      setQuestsLoading(true);

      const questsData = await questService.fetchAllQuests();

      setQuests(questsData || []);

    } catch (err) {
      console.error('Failed to fetch quests:', err);
    } finally {
      setQuestsLoading(false);
    }
  };

  // =========================
  // FETCH ADMIN DATA
  // =========================
  useEffect(() => {
    async function fetchAdminData() {
      if (!isAuthorizedAdmin(profile, user)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [
          profilesData,
          historyData,
          eventsData,
          questsData
        ] = await Promise.all([
          questService.fetchAllProfiles(),
          questService.fetchAllQuestHistory(),
          eventService.fetchEvents(),
          questService.fetchAllQuests()
        ]);

        setMembers(profilesData || []);
        setHistory(historyData || []);
        setEvents(eventsData || []);
        setQuests(questsData || []);

      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();

  }, [profile, user]);

  // =========================
  // CREATE OR UPDATE QUEST
  // =========================
  const handleCreateQuest = async (e) => {
    e.preventDefault();

    setQuestStatus(
      editingQuest
        ? 'Updating quest...'
        : 'Submitting...'
    );

    try {
      const questData = {
        ...questForm,
        base_xp: parseInt(questForm.base_xp, 10) || 0
      };

      if (editingQuest) {
        // UPDATE QUEST
        await questService.updateQuest(
          editingQuest.id,
          questData
        );

        setQuestStatus('Quest updated successfully!');

      } else {
        // CREATE QUEST
        await questService.insertQuest({
          ...questData,
          status: questForm.status || 'Active'
        });

        setQuestStatus('Quest created successfully!');
      }

      // REFRESH QUEST LIST
      await fetchQuests();

      // RESET FORM
      setQuestForm({
        title: '',
        description: '',
        difficulty: 'Beginner',
        base_xp: 0,
        rewards: '',
        status: 'Active'
      });

      setEditingQuest(null);

      setTimeout(() => {
        setQuestStatus('');
      }, 3000);

    } catch (err) {
      console.error('Quest operation failed:', err);

      setQuestStatus(
        'Error: ' + err.message
      );
    }
  };

  // =========================
  // EDIT QUEST
  // =========================
  const handleEditQuest = (quest) => {
    setEditingQuest(quest);

    setQuestForm({
      title: quest.title || '',
      description: quest.description || '',
      difficulty: quest.difficulty || 'Beginner',
      base_xp: quest.base_xp || 0,
      rewards: quest.rewards || '',
      status: quest.status || 'Active'
    });

    // Scroll to quest form
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };

  // =========================
  // DELETE QUEST
  // =========================
  const handleDeleteQuest = async (id, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );

    if (!confirmDelete) return;

    try {
      setQuestStatus('Deleting quest...');

      await questService.deleteQuest(id);

      // REMOVE FROM SCREEN IMMEDIATELY
      setQuests(prevQuests =>
        prevQuests.filter(quest => quest.id !== id)
      );

      setQuestStatus('Quest deleted successfully!');

      setTimeout(() => {
        setQuestStatus('');
      }, 3000);

    } catch (err) {
      console.error('Failed to delete quest:', err);

      setQuestStatus(
        'Error deleting quest: ' + err.message
      );
    }
  };

  // =========================
  // CREATE OR UPDATE EVENT
  // =========================
  const handleCreateEvent = async (e) => {
    e.preventDefault();

    setEventStatus(
      editingEvent
        ? 'Updating event...'
        : 'Submitting...'
    );

    try {
      // KEEP OLD IMAGE WHEN EDITING
      let image_url = editingEvent?.image_url || null;

      // UPLOAD NEW IMAGE ONLY IF SELECTED
      if (eventImage) {
        setEventStatus('Uploading image...');

        image_url = await eventService.uploadImage(
          eventImage
        );
      }

      if (editingEvent) {
        // UPDATE EVENT
        setEventStatus('Updating event...');

        await eventService.updateEvent(
          editingEvent.id,
          {
            ...eventForm,
            image_url
          }
        );

        setEventStatus(
          'Event updated successfully!'
        );

      } else {
        // CREATE EVENT
        setEventStatus('Saving event...');

        await eventService.insertEvent({
          ...eventForm,
          image_url
        });

        setEventStatus(
          'Event published successfully!'
        );
      }

      // REFRESH EVENTS
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

      setTimeout(() => {
        setEventStatus('');
      }, 3000);

    } catch (err) {
      console.error(
        'Event operation failed:',
        err
      );

      setEventStatus(
        'Error: ' + err.message
      );
    }
  };

  // =========================
  // EDIT EVENT
  // =========================
  const handleEditEvent = (event) => {
    setEditingEvent(event);

    setEventForm({
      title: event.title || '',
      description: event.description || '',
      event_date: event.event_date
        ? new Date(event.event_date)
            .toISOString()
            .slice(0, 16)
        : '',
      status: event.status || 'upcoming'
    });

    setEventImage(null);
  };

  // =========================
  // DELETE EVENT
  // =========================
  const handleDeleteEvent = async (id, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );

    if (!confirmDelete) return;

    try {
      setEventStatus('Deleting event...');

      await eventService.deleteEvent(id);

      setEvents(prevEvents =>
        prevEvents.filter(
          event => event.id !== id
        )
      );

      setEventStatus(
        'Event deleted successfully!'
      );

      setTimeout(() => {
        setEventStatus('');
      }, 3000);

    } catch (err) {
      console.error(
        'Failed to delete event:',
        err
      );

      setEventStatus(
        'Error deleting event: ' +
        err.message
      );
    }
  };

  // =========================
  // ADMIN ACCESS CODE
  // =========================
  const handleAccessCode = async (e) => {
    e.preventDefault();

    if (!canClaimAdminAccess(profile, user)) {
      setAccessStatus('Access Denied: Admin access is restricted to authorized Titan leadership.');
      return;
    }

    setAccessStatus('Verifying...');

    try {
      const {
        data: rpcData,
        error: rpcError
      } = await supabase.rpc(
        'verify_admin_code',
        {
          code: accessCode.trim()
        }
      );

      if (!rpcError && rpcData) {
        if (rpcData.success) {
          setAccessStatus(
            'Access Granted! Refreshing...'
          );

          setTimeout(() => {
            window.location.reload();
          }, 1200);

          return;

        } else if (rpcData.error) {
          throw new Error(rpcData.error);
        }
      }

      const {
        data,
        error: fnError
      } = await supabase.functions.invoke(
        'grant-admin',
        {
          body: {
            code: accessCode.trim()
          }
        }
      );

      if (fnError) throw fnError;

      if (data?.error) {
        throw new Error(data.error);
      }

      setAccessStatus(
        'Access Granted! Refreshing...'
      );

      setTimeout(() => {
        window.location.reload();
      }, 1200);

    } catch (err) {
      setAccessStatus(
        err.message?.includes(
          'Invalid access code'
        )
          ? 'Invalid Access Code'
          : 'Error: ' + err.message
      );
    }
  };

  // =========================
  // NOT ADMIN SCREEN
  // =========================
  if (!isAuthorizedAdmin(profile, user)) {
    if (!canClaimAdminAccess(profile, user)) {
      return (
        <div className="home-body min-h-screen flex items-center justify-center p-4 pt-24 relative overflow-hidden">
          <div className="max-w-md w-full glass-panel p-8 relative overflow-hidden z-10 text-center">
            <span className="text-red-400 font-mono text-xs font-bold uppercase tracking-[0.3em] mb-2 block">
              SECURITY PROTOCOL
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mb-4">
              ACCESS RESTRICTED
            </h2>
            <p className="text-gray-400 font-mono text-xs leading-relaxed">
              Admin privileges are strictly reserved for authorized Titan leadership personnel.
            </p>
          </div>
        </div>
      );
    }

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

          <form
            onSubmit={handleAccessCode}
            className="space-y-5"
          >

            <div>

              <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider mb-2">
                Access Code
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  required
                  value={accessCode}
                  onChange={(e) =>
                    setAccessCode(
                      e.target.value
                    )
                  }
                  className="input-glass w-full pr-10 font-mono tracking-widest text-center text-lg"
                  placeholder="••••••"
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label="Toggle access code visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
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

  // =========================
  // ADMIN DASHBOARD
  // =========================
  return (
    <div className="home-body min-h-screen pt-24 pb-16 px-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
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

            {/* MEMBER + ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* MEMBER DIRECTORY */}
              <div>

                <h2 className="section-heading text-lg">
                  MEMBER DIRECTORY
                </h2>

                <div className="glass-panel rounded-xl p-6 flex flex-col h-[400px]">

                  <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">

                    {members.map(member => (
                      <div
                        key={member.id}
                        className="p-3.5 bg-black/40 rounded-lg border border-white/5 flex justify-between items-center"
                      >
                        <div>
                          <h3 className="font-bold text-white text-sm">
                            {member.full_name ||
                              'Unknown User'}
                          </h3>

                          <p className="text-xs text-[#8c8d96] font-mono">
                            ID:{' '}
                            {member.id?.substring(0, 8)}...
                          </p>
                        </div>

                        <span className="text-[10px] uppercase font-mono text-[#ae97d6]">
                          {member.role}
                        </span>
                      </div>
                    ))}

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

                    {history.map((record, idx) => (
                      <div
                        key={record.id || idx}
                        className="p-3.5 rounded-lg border border-white/5 flex justify-between items-center bg-black/40"
                      >
                        <div>
                          <span className="font-bold text-white text-sm">
                            {record.quests?.title ||
                              'Unknown Quest'}
                          </span>

                          <p className="text-xs text-[#8c8d96] font-mono">
                            Operative:{' '}
                            {record.profiles?.full_name ||
                              'Unknown'}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-yellow-400">
                            {record.status}
                          </span>

                          <div className="text-[10px] text-[#00f3ff]">
                            +{record.xp_awarded} XP
                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>
              </div>

            </div>

            {/* MANAGEMENT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* QUEST MANAGEMENT */}
              <div>

                <h2 className="section-heading text-lg">
                  QUEST MANAGEMENT
                </h2>

                <div className="glass-panel rounded-xl p-6 sm:p-8">

                  {/* CREATE / UPDATE QUEST */}
                  <form
                    onSubmit={handleCreateQuest}
                    className="space-y-4"
                  >

                    {/* TITLE */}
                    <div>
                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Title
                      </label>

                      <input
                        required
                        type="text"
                        value={questForm.title}
                        onChange={(e) =>
                          setQuestForm({
                            ...questForm,
                            title: e.target.value
                          })
                        }
                        className="input-glass w-full text-sm"
                      />
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Description
                      </label>

                      <textarea
                        required
                        value={questForm.description}
                        onChange={(e) =>
                          setQuestForm({
                            ...questForm,
                            description: e.target.value
                          })
                        }
                        className="input-glass w-full h-24 text-sm resize-none"
                      />
                    </div>

                    {/* DIFFICULTY + XP */}
                    <div className="grid grid-cols-2 gap-4">

                      <div>
                        <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                          Difficulty
                        </label>

                        <select
                          value={questForm.difficulty}
                          onChange={(e) =>
                            setQuestForm({
                              ...questForm,
                              difficulty: e.target.value
                            })
                          }
                          className="input-glass w-full text-sm"
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
                          onChange={(e) =>
                            setQuestForm({
                              ...questForm,
                              base_xp: e.target.value
                            })
                          }
                          className="input-glass w-full text-sm"
                        />
                      </div>

                    </div>

                    {/* REWARDS */}
                    <div>
                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Rewards
                      </label>

                      <input
                        type="text"
                        value={questForm.rewards}
                        onChange={(e) =>
                          setQuestForm({
                            ...questForm,
                            rewards: e.target.value
                          })
                        }
                        className="input-glass w-full text-sm"
                      />
                    </div>

                    {/* STATUS */}
                    <div>
                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Status
                      </label>

                      <select
                        value={questForm.status}
                        onChange={(e) =>
                          setQuestForm({
                            ...questForm,
                            status: e.target.value
                          })
                        }
                        className="input-glass w-full text-sm"
                      >
                        <option value="Active">
                          Active
                        </option>

                        <option value="Upcoming">
                          Upcoming
                        </option>

                        <option value="Completed">
                          Completed
                        </option>
                      </select>
                    </div>

                    {/* BUTTON */}
                    <button
                      type="submit"
                      className="btn-keycap w-full py-3 text-xs mt-2"
                    >
                      {editingQuest ? (
                        <Edit
                          size={15}
                          className="mr-1.5"
                        />
                      ) : (
                        <Plus
                          size={15}
                          className="mr-1.5"
                        />
                      )}

                      {editingQuest
                        ? 'UPDATE QUEST'
                        : 'CREATE QUEST'}
                    </button>

                    {questStatus && (
                      <div className="text-xs font-mono mt-2 text-center text-[#ae97d6]">
                        {questStatus}
                      </div>
                    )}

                  </form>

                  {/* QUEST LIST */}
                  <div className="mt-8 border-t border-white/10 pt-6">

                    <h3 className="text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-4">
                      CREATED QUESTS
                    </h3>

                    {questsLoading ? (

                      <p className="text-xs text-[#8c8d96] font-mono">
                        Loading quests...
                      </p>

                    ) : quests.length === 0 ? (

                      <p className="text-xs text-[#8c8d96] font-mono">
                        No quests found.
                      </p>

                    ) : (

                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">

                        {quests.map((quest) => (

                          <div
                            key={quest.id}
                            className="flex items-center justify-between gap-3 p-3 bg-black/40 border border-white/5 rounded-lg"
                          >

                            <div className="min-w-0">

                              <h4 className="text-sm font-bold text-white truncate">
                                {quest.title}
                              </h4>

                              <p className="text-[10px] text-[#8c8d96] font-mono mt-1">
                                {quest.difficulty} • {quest.base_xp} XP
                              </p>

                              <span className="inline-block mt-1 text-[9px] uppercase font-mono text-[#00f3ff]">
                                {quest.status}
                              </span>

                            </div>

                            {/* EDIT + DELETE */}
                            <div className="flex items-center gap-2 shrink-0">

                              <button
                                type="button"
                                onClick={() =>
                                  handleEditQuest(quest)
                                }
                                className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#ae97d6]/10 border border-[#ae97d6]/30 text-[#ae97d6] hover:bg-[#ae97d6]/20 transition-colors"
                                title="Edit Quest"
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteQuest(
                                    quest.id,
                                    quest.title
                                  )
                                }
                                className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Delete Quest"
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

              {/* EVENTS MANAGEMENT */}
              <div>

                <h2 className="section-heading text-lg">
                  EVENTS MANAGEMENT
                </h2>

                <div className="glass-panel rounded-xl p-6 sm:p-8">

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
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            title: e.target.value
                          })
                        }
                        className="input-glass w-full text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Description
                      </label>

                      <textarea
                        required
                        value={eventForm.description}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            description: e.target.value
                          })
                        }
                        className="input-glass w-full h-24 text-sm resize-none"
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
                          onChange={(e) =>
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
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              status: e.target.value
                            })
                          }
                          className="input-glass w-full text-sm"
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
                            onChange={(e) =>
                              setEventImage(
                                e.target.files[0]
                              )
                            }
                          />

                        </label>

                        <span className="text-xs font-mono text-[#8c8d96] truncate flex-1">
                          {eventImage
                            ? eventImage.name
                            : editingEvent?.image_url
                            ? 'Current image (select new image to replace)'
                            : 'No image file selected'}
                        </span>

                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-keycap w-full py-3 text-xs mt-2"
                    >
                      {editingEvent ? (
                        <Edit
                          size={15}
                          className="mr-1.5"
                        />
                      ) : (
                        <Plus
                          size={15}
                          className="mr-1.5"
                        />
                      )}

                      {editingEvent
                        ? 'UPDATE EVENT'
                        : 'PUBLISH EVENT'}
                    </button>

                    {eventStatus && (
                      <div className="text-xs font-mono mt-2 text-center text-[#ae97d6]">
                        {eventStatus}
                      </div>
                    )}

                  </form>

                  {/* PUBLISHED EVENTS */}
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

                            <div className="flex items-center gap-2 shrink-0">

                              <button
                                type="button"
                                onClick={() =>
                                  handleEditEvent(event)
                                }
                                className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#ae97d6]/10 border border-[#ae97d6]/30 text-[#ae97d6] hover:bg-[#ae97d6]/20 transition-colors"
                                title="Edit Event"
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteEvent(
                                    event.id,
                                    event.title
                                  )
                                }
                                className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
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
