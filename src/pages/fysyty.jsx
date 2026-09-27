import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  Star,
  Plus,
  Image as ImageIcon,
  Trash2,
  Edit,
  Users,
  RefreshCw,
  Search,
  CalendarCheck
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import EventAttendanceScanner from '../components/EventAttendanceScanner';
import { questService } from '../services/questService';
import { eventService } from '../services/eventService';
import { supabase } from '../lib/supabase';
import { canClaimAdminAccess } from '../utils/adminCheck';

export default function Admin() {
<<<<<<< HEAD:src/pages/fysyty.jsx
  const { user, profile } = useAuth();
=======
  const { profile } = useAuth();
  const navigate = useNavigate();
>>>>>>> 8a51097 (Profile.jsx, Events.jsx, and Admin.jsx are updated and EventAttendanceScanner.jsx added):src/pages/Admin.jsx

  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [quests, setQuests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================
  // QUEST FORM
  // ==========================================

  const [questForm, setQuestForm] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    base_xp: 0,
    rewards: '',
    image_url: '',
    quest_link: '',
    start_date: '',
    end_date: ''
  });

  const [questStatus, setQuestStatus] = useState('');
  const [editingQuest, setEditingQuest] = useState(null);

  // ==========================================
  // EVENT FORM
  // ==========================================

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: '',
<<<<<<< HEAD:src/pages/fysyty.jsx
=======
    venue: '',
    max_participants: 100,
    xp_reward: 50,
    registration_deadline: '',
    registration_enabled: true,
>>>>>>> 8a51097 (Profile.jsx, Events.jsx, and Admin.jsx are updated and EventAttendanceScanner.jsx added):src/pages/Admin.jsx
    status: 'upcoming',
    event_link: ''
  });

  const [eventImage, setEventImage] = useState(null);
  const [eventStatus, setEventStatus] = useState('');

  const [editingEvent, setEditingEvent] = useState(null);

<<<<<<< HEAD:src/pages/fysyty.jsx
=======
  // ==========================================
  // ACCESS CODE
  // ==========================================

  const [accessCode, setAccessCode] = useState('');
  const [accessStatus, setAccessStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // ATTENDANCE DASHBOARD
  // ==========================================

  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('all');

  // ==========================================
>>>>>>> 8a51097 (Profile.jsx, Events.jsx, and Admin.jsx are updated and EventAttendanceScanner.jsx added):src/pages/Admin.jsx
  // FETCH EVENTS
  // ==========================================

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);

      const eventsData = await eventService.fetchEvents();

      setEvents(eventsData || []);

      if (
        !selectedEventId &&
        eventsData &&
        eventsData.length > 0
      ) {
        setSelectedEventId(eventsData[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  // ==========================================
  // FETCH QUESTS
  // ==========================================

  const fetchQuests = async () => {
    try {
      const questsData = await questService.fetchAllQuests();
      setQuests(questsData || []);
    } catch (err) {
      console.error('Failed to fetch quests:', err);
    }
  };

  // ==========================================
  // FETCH ATTENDANCE
  // ==========================================

  const fetchAttendance = async (eventId = selectedEventId) => {
    if (!eventId) {
      setRegistrations([]);
      return;
    }

    try {
      setAttendanceLoading(true);
      setAttendanceError('');

      const { data, error: fetchError } = await supabase
        .from('event_registrations')
        .select(`
          id,
          event_id,
          user_id,
          registered_at,
          attended,
          attended_at,
          registration_code,
          qr_token,
          profiles (
            id,
            full_name,
            username,
            email
          ),
          events (
            id,
            title,
            event_date,
            venue
          )
        `)
        .eq('event_id', eventId)
        .order('registered_at', {
          ascending: false
        });

      if (fetchError) {
        throw fetchError;
      }

      setRegistrations(data || []);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);

      setAttendanceError(
        err.message || 'Failed to load attendance data.'
      );

      setRegistrations([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  // ==========================================
  // FETCH ADMIN DATA
  // ==========================================

  useEffect(() => {
    async function fetchAdminData() {
<<<<<<< HEAD:src/pages/fysyty.jsx
      if (!canClaimAdminAccess(profile, user) && profile?.role !== 'admin' && profile?.role !== 'head') {
=======
      if (
        profile?.role !== 'admin' &&
        profile?.role !== 'head'
      ) {
>>>>>>> 8a51097 (Profile.jsx, Events.jsx, and Admin.jsx are updated and EventAttendanceScanner.jsx added):src/pages/Admin.jsx
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

        if (
          !selectedEventId &&
          eventsData &&
          eventsData.length > 0
        ) {
          setSelectedEventId(eventsData[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, [profile, user]);

  // ==========================================
  // FETCH ATTENDANCE WHEN EVENT CHANGES
  // ==========================================

  useEffect(() => {
    if (
      selectedEventId &&
      (profile?.role === 'admin' ||
        profile?.role === 'head')
    ) {
      fetchAttendance(selectedEventId);
    }
  }, [selectedEventId, profile?.role]);

  // ==========================================
  // CREATE / UPDATE QUEST
  // ==========================================

  const handleCreateQuest = async (e) => {
    e.preventDefault();

    setQuestStatus(
      editingQuest
        ? 'Updating quest...'
        : 'Submitting...'
    );

    try {
      if (!questForm.title.trim()) {
        throw new Error('Quest title is required.');
      }

      if (
        questForm.start_date &&
        questForm.end_date &&
        questForm.start_date > questForm.end_date
      ) {
        throw new Error(
          'Ending date cannot be before starting date.'
        );
      }

      const questData = {
        title: questForm.title.trim(),
        description: questForm.description.trim(),
        difficulty: questForm.difficulty,
        base_xp: parseInt(questForm.base_xp, 10) || 0,
        rewards: questForm.rewards.trim(),
        image_url: questForm.image_url.trim() || null,
        quest_link: questForm.quest_link.trim() || null,
        start_date: questForm.start_date || null,
        end_date: questForm.end_date || null
      };

      if (editingQuest) {
        await questService.updateQuest(
          editingQuest.id,
          questData
        );

        setQuestStatus(
          'Quest updated successfully!'
        );
      } else {
        await questService.insertQuest({
          ...questData,
          status: 'Active'
        });

        setQuestStatus(
          'Quest created successfully!'
        );
      }

      await fetchQuests();

      setQuestForm({
        title: '',
        description: '',
        difficulty: 'Beginner',
        base_xp: 0,
        rewards: '',
        image_url: '',
        quest_link: '',
        start_date: '',
        end_date: ''
      });

      setEditingQuest(null);

      setTimeout(() => {
        setQuestStatus('');
      }, 3000);
    } catch (err) {
      console.error(
        'Quest operation failed:',
        err
      );

      setQuestStatus(
        'Error: ' + err.message
      );
    }
  };

  // ==========================================
  // EDIT QUEST
  // ==========================================

  const handleEditQuest = (quest) => {
    setEditingQuest(quest);

<<<<<<< HEAD:src/pages/fysyty.jsx
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
        status: 'upcoming',
        event_link: ''
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
      status: event.status || 'upcoming',
      event_link: event.event_link || ''
=======
    setQuestForm({
      title: quest.title || '',
      description: quest.description || '',
      difficulty: quest.difficulty || 'Beginner',
      base_xp: quest.base_xp ?? 0,
      rewards: quest.rewards || '',
      image_url: quest.image_url || '',
      quest_link: quest.quest_link || '',
      start_date: quest.start_date || '',
      end_date: quest.end_date || ''
>>>>>>> 8a51097 (Profile.jsx, Events.jsx, and Admin.jsx are updated and EventAttendanceScanner.jsx added):src/pages/Admin.jsx
    });

    setQuestStatus('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // ==========================================
  // CANCEL QUEST EDIT
  // ==========================================

  const handleCancelQuestEdit = () => {
    setEditingQuest(null);

    setQuestForm({
      title: '',
      description: '',
      difficulty: 'Beginner',
      base_xp: 0,
      rewards: '',
      image_url: '',
      quest_link: '',
      start_date: '',
      end_date: ''
    });

    setQuestStatus('');
  };

  // ==========================================
  // DELETE QUEST
  // ==========================================

  const handleDeleteQuest = async (id, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setQuestStatus('Deleting quest...');

      await questService.deleteQuest(id);

      setQuests((prevQuests) =>
        prevQuests.filter(
          (quest) => quest.id !== id
        )
      );

      if (editingQuest?.id === id) {
        handleCancelQuestEdit();
      }

      setQuestStatus(
        'Quest deleted successfully!'
      );

      setTimeout(() => {
        setQuestStatus('');
      }, 3000);
    } catch (err) {
      console.error(
        'Failed to delete quest:',
        err
      );

      setQuestStatus(
        'Error deleting quest: ' +
          err.message
      );
    }
  };

<<<<<<< HEAD:src/pages/fysyty.jsx
  // NOT AUTHORIZED SCREEN
  const isAllowed = canClaimAdminAccess(profile, user) || profile?.role === 'admin' || profile?.role === 'head';

  if (!isAllowed) {
=======
  // ==========================================
  // CREATE / UPDATE EVENT
  // ==========================================

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    setEventStatus(
      editingEvent
        ? 'Updating event...'
        : 'Submitting...'
    );

    try {
      let image_url =
        editingEvent?.image_url || null;

      if (eventImage) {
        setEventStatus('Uploading image...');

        image_url =
          await eventService.uploadImage(
            eventImage
          );
      }

      const eventData = {
        title: eventForm.title.trim(),

        description:
          eventForm.description.trim(),

        event_date: eventForm.event_date
          ? new Date(
              eventForm.event_date
            ).toISOString()
          : null,

        venue:
          eventForm.venue.trim() || null,

        max_participants:
          parseInt(
            eventForm.max_participants,
            10
          ) || 100,

        xp_reward:
          Math.max(
            0,
            Math.min(
              10000,
              parseInt(
                eventForm.xp_reward,
                10
              ) || 0
            )
          ),

        registration_deadline:
          eventForm.registration_deadline
            ? new Date(
                eventForm.registration_deadline
              ).toISOString()
            : null,

        registration_enabled:
          Boolean(
            eventForm.registration_enabled
          ),

        status: eventForm.status,

        event_link:
          eventForm.event_link.trim() ||
          null,

        image_url
      };

      if (editingEvent) {
        setEventStatus(
          'Updating event...'
        );

        await eventService.updateEvent(
          editingEvent.id,
          eventData
        );

        setEventStatus(
          'Event updated successfully!'
        );
      } else {
        setEventStatus(
          'Publishing event...'
        );

        await eventService.insertEvent(
          eventData
        );

        setEventStatus(
          'Event published successfully!'
        );
      }

      await fetchEvents();

      setEventForm({
        title: '',
        description: '',
        event_date: '',
        venue: '',
        max_participants: 100,
        xp_reward: 50,
        registration_deadline: '',
        registration_enabled: true,
        status: 'upcoming',
        event_link: ''
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

  // ==========================================
  // EDIT EVENT
  // ==========================================

  const handleEditEvent = (event) => {
    setEditingEvent(event);

    setEventForm({
      title: event.title || '',

      description:
        event.description || '',

      event_date: event.event_date
        ? new Date(event.event_date)
            .toISOString()
            .slice(0, 16)
        : '',

      venue: event.venue || '',

      max_participants:
        event.max_participants || 100,

      xp_reward:
        event.xp_reward ?? 50,

      registration_deadline:
        event.registration_deadline
          ? new Date(
              event.registration_deadline
            )
              .toISOString()
              .slice(0, 16)
          : '',

      registration_enabled:
        event.registration_enabled !== false,

      status:
        event.status || 'upcoming',

      event_link:
        event.event_link || ''
    });

    setEventImage(null);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // ==========================================
  // CANCEL EVENT EDIT
  // ==========================================

  const handleCancelEdit = () => {
    setEditingEvent(null);

    setEventForm({
      title: '',
      description: '',
      event_date: '',
      venue: '',
      max_participants: 100,
      xp_reward: 50,
      registration_deadline: '',
      registration_enabled: true,
      status: 'upcoming',
      event_link: ''
    });

    setEventImage(null);
    setEventStatus('');
  };

  // ==========================================
  // DELETE EVENT
  // ==========================================

  const handleDeleteEvent = async (
    id,
    title
  ) => {
    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete "${title}"?`
      );

    if (!confirmDelete) return;

    try {
      setEventStatus(
        'Deleting event...'
      );

      await eventService.deleteEvent(id);

      setEvents((prevEvents) =>
        prevEvents.filter(
          (event) => event.id !== id
        )
      );

      if (selectedEventId === id) {
        setSelectedEventId('');
        setRegistrations([]);
      }

      if (editingEvent?.id === id) {
        handleCancelEdit();
      }

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

  // ==========================================
  // ADMIN ACCESS CODE
  // ==========================================

  const handleAccessCode = async (e) => {
    e.preventDefault();

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
        }

        if (rpcData.error) {
          throw new Error(
            rpcData.error
          );
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

      if (fnError) {
        throw fnError;
      }

      if (data?.error) {
        throw new Error(
          data.error
        );
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

  // ==========================================
  // ATTENDANCE STATISTICS
  // ==========================================

  const totalRegistered =
    registrations.length;

  const totalPresent =
    registrations.filter(
      (registration) =>
        registration.attended
    ).length;

  const totalAbsent =
    totalRegistered -
    totalPresent;

  const attendancePercentage =
    totalRegistered > 0
      ? Math.round(
          (totalPresent /
            totalRegistered) *
            100
        )
      : 0;

  // ==========================================
  // FILTER ATTENDANCE
  // ==========================================

  const filteredRegistrations =
    registrations.filter(
      (registration) => {
        const student =
          registration.profiles || {};

        const search =
          attendanceSearch
            .trim()
            .toLowerCase();

        const matchesSearch =
          !search ||
          student.full_name
            ?.toLowerCase()
            .includes(search) ||
          student.username
            ?.toLowerCase()
            .includes(search) ||
          student.email
            ?.toLowerCase()
            .includes(search) ||
          registration.registration_code
            ?.toLowerCase()
            .includes(search);

        const matchesFilter =
          attendanceFilter === 'all' ||
          (attendanceFilter ===
            'present' &&
            registration.attended) ||
          (attendanceFilter ===
            'absent' &&
            !registration.attended);

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );

  // ==========================================
  // SELECTED EVENT
  // ==========================================

  const selectedEvent =
    events.find(
      (event) =>
        event.id ===
        selectedEventId
    );

  // ==========================================
  // NOT ADMIN SCREEN
  // ==========================================

  if (
    profile?.role !== 'admin' &&
    profile?.role !== 'head'
  ) {
>>>>>>> 8a51097 (Profile.jsx, Events.jsx, and Admin.jsx are updated and EventAttendanceScanner.jsx added):src/pages/Admin.jsx
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
              'radial-gradient(circle, rgba(220,38,38,0.3), transparent 70%)'
          }}
        />

<<<<<<< HEAD:src/pages/fysyty.jsx
        <div className="max-w-md w-full glass-panel p-8 relative overflow-hidden z-10 text-center">
          <div className="mb-6 flex justify-center">
            <span className="p-4 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
              <Shield size={36} />
            </span>
          </div>

          <span className="text-red-400 font-mono text-xs font-bold uppercase tracking-[0.3em] mb-2 block">
            SECURITY PROTOCOL
          </span>

          <h2 className="text-2xl font-black text-white tracking-tight mb-3">
            ACCESS DENIED
          </h2>

          <p className="text-gray-400 font-mono text-xs mb-6 leading-relaxed">
            This terminal is restricted to authorized Tech Titans leadership. You do not have clearance to access this control panel.
          </p>

          <a
            href="/home"
            className="btn-keycap inline-flex items-center justify-center px-6 py-3 text-xs w-full"
          >
            RETURN TO PORTAL
          </a>
=======
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
                accessStatus.includes(
                  'Error'
                ) ||
                accessStatus.includes(
                  'Invalid'
                )
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

>>>>>>> 8a51097 (Profile.jsx, Events.jsx, and Admin.jsx are updated and EventAttendanceScanner.jsx added):src/pages/Admin.jsx
        </div>

      </div>
    );
  }

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================

  return (
    <div className="home-body min-h-screen pt-24 pb-16 px-6">

      <div className="max-w-7xl mx-auto">

        <div className="mb-10">

          <span className="text-accent font-mono text-xs font-bold uppercase tracking-[0.3em] mb-2 flex items-center gap-2">

            <Shield
              className="text-[#00f3ff] w-4 h-4"
            />

            ROOT SECURITY CLEARANCE

          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">

            <span className="title-tech">
              ADMIN
            </span>{' '}

            <span className="title-titans">
              CONTROL
            </span>

          </h1>

          <p className="text-[#8c8d96] font-mono text-xs sm:text-sm">

            Authenticated as:{' '}

            <span className="text-white font-bold">
              {profile?.full_name ||
                'System Admin'}
            </span>

            {' '}| Clearance Level: Root

          </p>

          <div className="mt-5 flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/admin/student-directory'
                )
              }
              className="btn-keycap px-5 py-3 text-xs flex items-center gap-2"
            >
              <Users size={15} />
              STUDENT DIRECTORY
            </button>

          </div>

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

            {/* ==========================================
                MEMBER DIRECTORY + QUEST ACTIVITY
                ========================================== */}

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

                      members.map((member) => (

                        <div
                          key={member.id}
                          className="p-3.5 bg-black/40 rounded-lg border border-white/5 hover:border-[#ae97d6]/40 transition-colors flex justify-between items-center"
                        >

                          <div>

                            <h3 className="font-bold text-white flex items-center gap-2 text-sm">

                              {member.full_name ||
                                'Unknown User'}

                              {member.role ===
                                'admin' && (
                                <Shield
                                  size={14}
                                  className="text-yellow-400"
                                />
                              )}

                            </h3>

                            <p className="text-xs text-[#8c8d96] font-mono mt-0.5">
                              ID:{' '}
                              {member.id?.substring(
                                0,
                                8
                              )}
                              ...
                            </p>

                          </div>

                          <div className="text-right">

                            <span
                              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold tracking-widest ${
                                member.role ===
                                  'admin' ||
                                member.role ===
                                  'head'
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

                      history.map(
                        (record, idx) => {

                          const isWon =
                            record.status ===
                            'won';

                          const isLost =
                            record.status ===
                            'lost';

                          let statusClass =
                            'text-gray-400';

                          let borderClass =
                            'border-[#31333e]';

                          let Icon = Star;

                          if (isWon) {
                            statusClass =
                              'text-green-400';

                            borderClass =
                              'border-green-500/30 bg-green-500/5';

                            Icon =
                              CheckCircle;
                          } else if (
                            isLost
                          ) {
                            statusClass =
                              'text-red-400';

                            borderClass =
                              'border-red-500/30 bg-red-500/5';

                            Icon = XCircle;
                          } else {
                            statusClass =
                              'text-yellow-400';

                            Icon = Activity;
                          }

                          return (

                            <div
                              key={
                                record.id ||
                                idx
                              }
                              className={`p-3.5 rounded-lg border ${borderClass} flex justify-between items-center bg-black/40`}
                            >

                              <div>

                                <div className="flex items-center gap-2 mb-0.5">

                                  <Icon
                                    className={
                                      statusClass
                                    }
                                    size={15}
                                  />

                                  <span className="font-bold text-white text-xs sm:text-sm font-['Orbitron']">

                                    {record
                                      .quests
                                      ?.title ||
                                      'Unknown Quest'}

                                  </span>

                                </div>

                                <div className="text-xs text-[#8c8d96] font-mono pl-5">

                                  Operative:{' '}

                                  <span className="text-white">

                                    {record
                                      .profiles
                                      ?.full_name ||
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
                                  +
                                  {
                                    record.xp_awarded
                                  }{' '}
                                  XP
                                </div>

                              </div>

                            </div>

                          );
                        }
                      )

                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* ==========================================
                MANAGEMENT FORMS
                ========================================== */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* QUEST MANAGEMENT */}

              <div>

                <h2 className="section-heading text-lg">
                  {editingQuest
                    ? 'EDIT QUEST'
                    : 'SETUP NEW QUEST'}
                </h2>

                <div className="glass-panel rounded-xl p-6 sm:p-8">

                  {/* EDITING INDICATOR */}

                  {editingQuest && (
                    <div className="mb-5 p-3 rounded-lg bg-[#ae97d6]/10 border border-[#ae97d6]/30 flex items-center justify-between gap-3">

                      <div className="text-xs font-mono text-[#ae97d6]">

                        EDITING:{' '}

                        <span className="text-white font-bold">
                          {editingQuest.title}
                        </span>

                      </div>

                      <button
                        type="button"
                        onClick={
                          handleCancelQuestEdit
                        }
                        className="text-[10px] font-mono uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                      >
                        CANCEL
                      </button>

                    </div>
                  )}

                  <form
                    onSubmit={
                      handleCreateQuest
                    }
                    className="space-y-4"
                  >

                    <div>

                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Title
                      </label>

                      <input
                        required
                        type="text"
                        value={
                          questForm.title
                        }
                        onChange={(e) =>
                          setQuestForm({
                            ...questForm,
                            title:
                              e.target.value
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
                        value={
                          questForm.description
                        }
                        onChange={(e) =>
                          setQuestForm({
                            ...questForm,
                            description:
                              e.target.value
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
                          value={
                            questForm.difficulty
                          }
                          onChange={(e) =>
                            setQuestForm({
                              ...questForm,
                              difficulty:
                                e.target.value
                            })
                          }
                          className="input-glass w-full text-sm [color-scheme:dark]"
                        >

                          <option>
                            Beginner
                          </option>

                          <option>
                            Intermediate
                          </option>

                          <option>
                            Advanced
                          </option>

                        </select>

                      </div>

                      <div>

                        <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                          Base XP
                        </label>

                        <input
                          required
                          type="number"
                          min="0"
                          value={
                            questForm.base_xp
                          }
                          onChange={(e) =>
                            setQuestForm({
                              ...questForm,
                              base_xp:
                                e.target.value
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
                        value={
                          questForm.rewards
                        }
                        onChange={(e) =>
                          setQuestForm({
                            ...questForm,
                            rewards:
                              e.target.value
                          })
                        }
                        className="input-glass w-full text-sm"
                        placeholder="e.g. Profile Badge & Certificate"
                      />

                    </div>

                    {/* QUEST IMAGE URL */}

                    <div>

                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Quest Image URL
                      </label>

                      <input
                        type="url"
                        value={
                          questForm.image_url
                        }
                        onChange={(e) =>
                          setQuestForm({
                            ...questForm,
                            image_url:
                              e.target.value
                          })
                        }
                        className="input-glass w-full text-sm"
                        placeholder="https://example.com/quest-image.jpg"
                      />

                    </div>

                    {/* QUEST LINK */}

                    <div>

                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Quest Link
                      </label>

                      <input
                        type="url"
                        value={
                          questForm.quest_link
                        }
                        onChange={(e) =>
                          setQuestForm({
                            ...questForm,
                            quest_link:
                              e.target.value
                          })
                        }
                        className="input-glass w-full text-sm"
                        placeholder="https://example.com/quest"
                      />

                    </div>

                    {/* QUEST DATES */}

                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                          Start Date
                        </label>

                        <input
                          type="date"
                          value={
                            questForm.start_date
                          }
                          onChange={(e) =>
                            setQuestForm({
                              ...questForm,
                              start_date:
                                e.target.value
                            })
                          }
                          className="input-glass w-full text-sm [color-scheme:dark]"
                        />

                      </div>

                      <div>

                        <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                          End Date
                        </label>

                        <input
                          type="date"
                          value={
                            questForm.end_date
                          }
                          onChange={(e) =>
                            setQuestForm({
                              ...questForm,
                              end_date:
                                e.target.value
                            })
                          }
                          className="input-glass w-full text-sm [color-scheme:dark]"
                        />

                      </div>

                    </div>

                    <button
                      type="submit"
                      className="btn-keycap w-full py-3 text-xs mt-2 flex items-center justify-center"
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
                      <div
                        className={`text-xs font-mono mt-2 text-center ${
                          questStatus.startsWith(
                            'Error'
                          )
                            ? 'text-red-400'
                            : 'text-[#ae97d6]'
                        }`}
                      >
                        {questStatus}
                      </div>
                    )}

                  </form>

                  {/* ==========================================
                      DEPLOYED QUESTS
                      ========================================== */}

                  <div className="mt-8 border-t border-white/10 pt-6">

                    <div className="flex items-center justify-between gap-3 mb-4">

                      <h3 className="text-xs font-mono text-[#8c8d96] uppercase tracking-wider">
                        DEPLOYED QUESTS
                      </h3>

                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#00f3ff]">
                        {quests.length}{' '}
                        QUEST
                        {quests.length !==
                        1
                          ? 'S'
                          : ''}
                      </span>

                    </div>

                    {quests.length === 0 ? (

                      <div className="p-6 rounded-lg bg-black/30 border border-white/5 text-center">

                        <Star
                          size={22}
                          className="mx-auto mb-2 text-gray-600"
                        />

                        <p className="text-xs text-[#8c8d96] font-mono">
                          No quests have been
                          deployed yet.
                        </p>

                      </div>

                    ) : (

                      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">

                        {quests.map(
                          (quest) => (

                            <div
                              key={
                                quest.id
                              }
                              className="p-4 bg-black/40 border border-white/5 rounded-lg hover:border-[#ae97d6]/30 transition-all"
                            >

                              <div className="flex flex-col gap-4">

                                <div className="min-w-0">

                                  <div className="flex flex-wrap items-center gap-2 mb-2">

                                    <h4 className="text-sm font-bold text-white font-['Orbitron'] break-words">
                                      {
                                        quest.title
                                      }
                                    </h4>

                                    <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-[#31333e] text-gray-300 border border-white/10">
                                      {
                                        quest.difficulty
                                      }
                                    </span>

                                    <span
                                      className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded border ${
                                        quest.status ===
                                        'Active'
                                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                          : quest.status ===
                                            'Upcoming'
                                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                      }`}
                                    >
                                      {
                                        quest.status ||
                                        'Unknown'
                                      }
                                    </span>

                                  </div>

                                  <p className="text-xs text-[#8c8d96] leading-relaxed mb-3">
                                    {quest.description ||
                                      'No description provided.'}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-mono">

                                    <span className="text-[#00f3ff] font-bold">
                                      XP:{' '}
                                      {
                                        quest.base_xp ??
                                        0
                                      }
                                    </span>

                                    <span className="text-[#ff007f]">
                                      REWARD:{' '}
                                      {quest.rewards ||
                                        'Admin Recognition'}
                                    </span>

                                    {quest.active_week && (
                                      <span className="text-[#b89eff]">
                                        WEEK:{' '}
                                        {
                                          quest.active_week
                                        }
                                      </span>
                                    )}

                                  </div>

                                </div>

                                <div className="flex items-center gap-2 pt-3 border-t border-white/5">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEditQuest(
                                        quest
                                      )
                                    }
                                    className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-[#ae97d6]/10 border border-[#ae97d6]/30 text-[#ae97d6] hover:bg-[#ae97d6]/20 transition-colors text-[10px] font-mono font-bold uppercase tracking-wider"
                                    title="Edit Quest"
                                  >
                                    <Edit
                                      size={15}
                                    />
                                    EDIT
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteQuest(
                                        quest.id,
                                        quest.title
                                      )
                                    }
                                    className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-[10px] font-mono font-bold uppercase tracking-wider"
                                    title="Delete Quest"
                                  >
                                    <Trash2
                                      size={15}
                                    />
                                    DELETE
                                  </button>

                                </div>

                              </div>

                            </div>

                          )
                        )}

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

                  {editingEvent && (
                    <div className="mb-5 p-3 rounded-lg bg-[#ae97d6]/10 border border-[#ae97d6]/30 flex items-center justify-between gap-3">

                      <div className="text-xs font-mono text-[#ae97d6]">

                        EDITING:{' '}

                        <span className="text-white font-bold">
                          {
                            editingEvent.title
                          }
                        </span>

                      </div>

                      <button
                        type="button"
                        onClick={
                          handleCancelEdit
                        }
                        className="text-[10px] font-mono uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                      >
                        CANCEL
                      </button>

                    </div>
                  )}

                  <form
                    onSubmit={
                      handleCreateEvent
                    }
                    className="space-y-4"
                  >

                    {/* EVENT TITLE */}
                    <div>
                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Event Title
                      </label>

                      <input
                        required
                        type="text"
                        value={
                          eventForm.title
                        }
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            title:
                              e.target.value
                          })
                        }
                        className="input-glass w-full text-sm"
                        placeholder="e.g. Tech Titans Hackathon"
                      />
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Description
                      </label>

                      <textarea
                        required
                        value={
                          eventForm.description
                        }
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            description:
                              e.target.value
                          })
                        }
                        className="input-glass w-full h-24 text-sm resize-none"
                        placeholder="Event overview and schedule..."
                      />
                    </div>

                    {/* DATE + STATUS */}
                    <div className="grid grid-cols-2 gap-4">

                      <div>
                        <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                          Event Date
                        </label>

                        <input
                          required
                          type="datetime-local"
                          value={
                            eventForm.event_date
                          }
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              event_date:
                                e.target.value
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
                          value={
                            eventForm.status
                          }
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              status:
                                e.target.value
                            })
                          }
                          className="input-glass w-full text-sm [color-scheme:dark]"
                        >
<<<<<<< HEAD:src/pages/fysyty.jsx
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
=======

                          <option value="upcoming">
                            Upcoming
                          </option>

                          <option value="ongoing">
                            Ongoing
                          </option>

                          <option value="completed">
                            Completed
                          </option>

>>>>>>> 8a51097 (Profile.jsx, Events.jsx, and Admin.jsx are updated and EventAttendanceScanner.jsx added):src/pages/Admin.jsx
                        </select>
                      </div>

                    </div>

<<<<<<< HEAD:src/pages/fysyty.jsx
                    {/* EVENT LINK - NEW */}
                    <div>
=======
                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                          Venue
                        </label>

                        <input
                          type="text"
                          value={
                            eventForm.venue
                          }
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              venue:
                                e.target.value
                            })
                          }
                          className="input-glass w-full text-sm"
                          placeholder="e.g. Main Auditorium"
                        />

                      </div>

                      <div>

                        <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                          Maximum Participants
                        </label>

                        <input
                          required
                          type="number"
                          min="1"
                          value={
                            eventForm.max_participants
                          }
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              max_participants:
                                e.target.value
                            })
                          }
                          className="input-glass w-full text-sm"
                          placeholder="100"
                        />

                      </div>

                    </div>

                    <div>

                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        XP Reward
                      </label>

                      <input
                        required
                        type="number"
                        min="0"
                        max="10000"
                        value={
                          eventForm.xp_reward
                        }
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            xp_reward:
                              e.target.value
                          })
                        }
                        className="input-glass w-full text-sm"
                        placeholder="50"
                      />

                      <p className="text-[10px] text-[#8c8d96] font-mono mt-1.5">
                        XP awarded when attendance is confirmed.
                      </p>

                    </div>

                    <div>

                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Registration Deadline
                      </label>

                      <input
                        type="datetime-local"
                        value={
                          eventForm.registration_deadline
                        }
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            registration_deadline:
                              e.target.value
                          })
                        }
                        className="input-glass w-full text-sm [color-scheme:dark]"
                      />

                      <p className="text-[10px] text-[#8c8d96] font-mono mt-1.5">
                        Leave empty if registration should remain open until the event begins.
                      </p>

                    </div>

                    <div className="flex items-center justify-between gap-4 p-3.5 rounded-lg bg-black/30 border border-white/5">

                      <div>

                        <p className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                          Event Registration
                        </p>

                        <p className="text-[10px] text-[#8c8d96] font-mono mt-1">
                          Allow students to register for this event.
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setEventForm({
                            ...eventForm,
                            registration_enabled:
                              !eventForm.registration_enabled
                          })
                        }
                        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                          eventForm.registration_enabled
                            ? 'bg-[#ae97d6]'
                            : 'bg-[#31333e]'
                        }`}
                        aria-label="Toggle event registration"
                      >

                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            eventForm.registration_enabled
                              ? 'translate-x-7'
                              : 'translate-x-1'
                          }`}
                        />

                      </button>

                    </div>

                    <div>

>>>>>>> 8a51097 (Profile.jsx, Events.jsx, and Admin.jsx are updated and EventAttendanceScanner.jsx added):src/pages/Admin.jsx
                      <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-1.5">
                        Event Link
                      </label>

                      <input
                        type="url"
<<<<<<< HEAD:src/pages/fysyty.jsx
                        value={eventForm.event_link}
                        onChange={e =>
                          setEventForm({
                            ...eventForm,
                            event_link: e.target.value
=======
                        value={
                          eventForm.event_link
                        }
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            event_link:
                              e.target.value
>>>>>>> 8a51097 (Profile.jsx, Events.jsx, and Admin.jsx are updated and EventAttendanceScanner.jsx added):src/pages/Admin.jsx
                          })
                        }
                        className="input-glass w-full text-sm"
                        placeholder="https://example.com/event-page"
                      />
<<<<<<< HEAD:src/pages/fysyty.jsx
                    </div>

                    {/* EVENT COVER IMAGE */}
=======

                    </div>

>>>>>>> 8a51097 (Profile.jsx, Events.jsx, and Admin.jsx are updated and EventAttendanceScanner.jsx added):src/pages/Admin.jsx
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
                                e.target.files?.[0] ||
                                  null
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

                    {/* PUBLISH / UPDATE BUTTON */}
                    <button
                      type="submit"
                      className="btn-keycap w-full py-3 text-xs mt-2 flex items-center justify-center"
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
                      <div
                        className={`text-xs font-mono mt-2 text-center ${
                          eventStatus.startsWith(
                            'Error'
                          )
                            ? 'text-red-400'
                            : 'text-[#ae97d6]'
                        }`}
                      >
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

                        {events.map(
                          (event) => (

                            <div
                              key={
                                event.id
                              }
                              className="flex items-center justify-between gap-3 p-3 bg-black/40 border border-white/5 rounded-lg"
                            >

                              <div className="min-w-0">

<<<<<<< HEAD:src/pages/fysyty.jsx
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
                                className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#ae97d6]/10 border border-[#ae97d6]/30 text-[#ae97d6] hover:bg-[#ae97d6]/20 transition-colors"
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
                                className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Delete Event"
                              >
                                <Trash2 size={16} />
                              </button>
=======
                                <h4 className="text-sm font-bold text-white truncate">
                                  {
                                    event.title
                                  }
                                </h4>

                                <p className="text-[10px] text-[#8c8d96] font-mono mt-1">

                                  {event.event_date
                                    ? new Date(
                                        event.event_date
                                      ).toLocaleString()
                                    : 'No date'}

                                </p>

                                {event.venue && (
                                  <p className="text-[10px] text-[#8c8d96] font-mono mt-1 truncate">
                                    {
                                      event.venue
                                    }
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-2 mt-1">

                                  <span className="text-[9px] uppercase font-mono text-[#00f3ff]">
                                    {
                                      event.status
                                    }
                                  </span>

                                  {event.registration_enabled !==
                                    false && (
                                    <span className="text-[9px] uppercase font-mono text-green-400">
                                      REGISTRATION
                                      ON
                                    </span>
                                  )}

                                  {event.max_participants && (
                                    <span className="text-[9px] uppercase font-mono text-gray-500">
                                      MAX:{' '}
                                      {
                                        event.max_participants
                                      }
                                    </span>
                                  )}

                                  <span className="text-[9px] uppercase font-mono text-yellow-400">
                                    XP:{' '}
                                    {
                                      event.xp_reward ??
                                      50
                                    }
                                  </span>

                                </div>

                              </div>

                              <div className="flex items-center gap-2 shrink-0">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditEvent(
                                      event
                                    )
                                  }
                                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#ae97d6]/10 border border-[#ae97d6]/30 text-[#ae97d6] hover:bg-[#ae97d6]/20 transition-colors"
                                  title="Edit Event"
                                >

                                  <Edit
                                    size={16}
                                  />

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

                                  <Trash2
                                    size={16}
                                  />

                                </button>

                              </div>
>>>>>>> 8a51097 (Profile.jsx, Events.jsx, and Admin.jsx are updated and EventAttendanceScanner.jsx added):src/pages/Admin.jsx

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* ==========================================
                ATTENDANCE DASHBOARD
                ========================================== */}

            <div>

              <h2 className="section-heading text-lg">
                EVENT ATTENDANCE DASHBOARD
              </h2>

              <div className="glass-panel rounded-xl p-6 sm:p-8">

                {/* HEADER */}

                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">

                  <div>

                    <span className="text-[#00f3ff] font-mono text-xs font-bold uppercase tracking-[0.2em]">
                      REGISTRATION & ATTENDANCE CONTROL
                    </span>

                    <p className="text-[#8c8d96] font-mono text-xs mt-2">
                      Monitor registered students and real-time attendance for each event.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      fetchAttendance(
                        selectedEventId
                      )
                    }
                    disabled={
                      attendanceLoading ||
                      !selectedEventId
                    }
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-black/30 text-gray-300 hover:text-white hover:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >

                    <RefreshCw
                      size={15}
                      className={
                        attendanceLoading
                          ? 'animate-spin'
                          : ''
                      }
                    />

                    REFRESH

                  </button>

                </div>

                {/* EVENT SELECTOR */}

                <div className="mb-8">

                  <label className="block text-xs font-mono text-[#8c8d96] uppercase tracking-wider mb-2">
                    Select Event
                  </label>

                  <select
                    value={
                      selectedEventId
                    }
                    onChange={(e) =>
                      setSelectedEventId(
                        e.target.value
                      )
                    }
                    className="input-glass w-full text-sm [color-scheme:dark]"
                  >

                    <option value="">
                      Select an event...
                    </option>

                    {events.map(
                      (event) => (
                        <option
                          key={
                            event.id
                          }
                          value={
                            event.id
                          }
                        >
                          {
                            event.title
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {selectedEvent && (
                  <div className="mb-8 p-4 rounded-xl bg-black/30 border border-white/5">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                      <div>

                        <h3 className="text-lg font-bold text-white">
                          {
                            selectedEvent.title
                          }
                        </h3>

                        <div className="flex flex-wrap gap-3 mt-2">

                          {selectedEvent.event_date && (
                            <span className="text-[10px] font-mono text-[#8c8d96]">
                              📅{' '}
                              {new Date(
                                selectedEvent.event_date
                              ).toLocaleString()}
                            </span>
                          )}

                          {selectedEvent.venue && (
                            <span className="text-[10px] font-mono text-[#8c8d96]">
                              📍{' '}
                              {
                                selectedEvent.venue
                              }
                            </span>
                          )}

                        </div>

                      </div>

                      <CalendarCheck
                        size={28}
                        className="text-[#00f3ff]"
                      />

                    </div>

                  </div>
                )}

                {/* STATISTICS */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                  <div className="rounded-xl border border-white/10 bg-black/30 p-5">

                    <div className="flex items-center justify-between mb-3">

                      <span className="text-[10px] uppercase tracking-widest font-mono text-[#8c8d96]">
                        REGISTERED
                      </span>

                      <Users
                        size={17}
                        className="text-[#ae97d6]"
                      />

                    </div>

                    <p className="text-3xl font-black text-white">
                      {
                        totalRegistered
                      }
                    </p>

                  </div>

                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">

                    <div className="flex items-center justify-between mb-3">

                      <span className="text-[10px] uppercase tracking-widest font-mono text-green-400">
                        PRESENT
                      </span>

                      <CheckCircle
                        size={17}
                        className="text-green-400"
                      />

                    </div>

                    <p className="text-3xl font-black text-green-400">
                      {
                        totalPresent
                      }
                    </p>

                  </div>

                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">

                    <div className="flex items-center justify-between mb-3">

                      <span className="text-[10px] uppercase tracking-widest font-mono text-red-400">
                        ABSENT
                      </span>

                      <XCircle
                        size={17}
                        className="text-red-400"
                      />

                    </div>

                    <p className="text-3xl font-black text-red-400">
                      {
                        totalAbsent
                      }
                    </p>

                  </div>

                  <div className="rounded-xl border border-[#00f3ff]/20 bg-[#00f3ff]/5 p-5">

                    <div className="flex items-center justify-between mb-3">

                      <span className="text-[10px] uppercase tracking-widest font-mono text-[#00f3ff]">
                        ATTENDANCE
                      </span>

                      <Activity
                        size={17}
                        className="text-[#00f3ff]"
                      />

                    </div>

                    <p className="text-3xl font-black text-[#00f3ff]">
                      {
                        attendancePercentage
                      }%
                    </p>

                  </div>

                </div>

                {/* SEARCH + FILTER */}

                <div className="flex flex-col md:flex-row gap-3 mb-5">

                  <div className="relative flex-1">

                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      type="text"
                      value={
                        attendanceSearch
                      }
                      onChange={(e) =>
                        setAttendanceSearch(
                          e.target.value
                        )
                      }
                      className="input-glass w-full pl-10 text-sm"
                      placeholder="Search student, username, email or registration code..."
                    />

                  </div>

                  <select
                    value={
                      attendanceFilter
                    }
                    onChange={(e) =>
                      setAttendanceFilter(
                        e.target.value
                      )
                    }
                    className="input-glass md:w-44 text-sm [color-scheme:dark]"
                  >

                    <option value="all">
                      All Students
                    </option>

                    <option value="present">
                      Present
                    </option>

                    <option value="absent">
                      Absent
                    </option>

                  </select>

                </div>

                {/* ERROR */}

                {attendanceError && (
                  <div className="mb-5 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs">
                    ERROR:{' '}
                    {
                      attendanceError
                    }
                  </div>
                )}

                {/* LOADING */}

                {attendanceLoading ? (

                  <div className="py-12 text-center text-[#ae97d6] font-mono text-xs animate-pulse">
                    Loading attendance records...
                  </div>

                ) : !selectedEventId ? (

                  <div className="py-12 text-center text-[#8c8d96] font-mono text-xs">
                    Select an event to view attendance.
                  </div>

                ) : filteredRegistrations.length === 0 ? (

                  <div className="py-12 text-center">

                    <Users
                      size={30}
                      className="mx-auto mb-3 text-gray-600"
                    />

                    <p className="text-[#8c8d96] font-mono text-xs">
                      {registrations.length ===
                      0
                        ? 'No students have registered for this event yet.'
                        : 'No students match your search/filter.'}
                    </p>

                  </div>

                ) : (

                  /* STUDENT TABLE */

                  <div className="overflow-x-auto rounded-xl border border-white/5">

                    <table className="w-full min-w-[850px]">

                      <thead>

                        <tr className="bg-black/50 border-b border-white/10">

                          <th className="text-left px-4 py-4 text-[10px] font-mono uppercase tracking-wider text-[#8c8d96]">
                            Student
                          </th>

                          <th className="text-left px-4 py-4 text-[10px] font-mono uppercase tracking-wider text-[#8c8d96]">
                            Registration
                          </th>

                          <th className="text-left px-4 py-4 text-[10px] font-mono uppercase tracking-wider text-[#8c8d96]">
                            Registered At
                          </th>

                          <th className="text-center px-4 py-4 text-[10px] font-mono uppercase tracking-wider text-[#8c8d96]">
                            Status
                          </th>

                          <th className="text-left px-4 py-4 text-[10px] font-mono uppercase tracking-wider text-[#8c8d96]">
                            Attendance Time
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {filteredRegistrations.map(
                          (
                            registration
                          ) => {

                            const student =
                              registration.profiles ||
                              {};

                            return (

                              <tr
                                key={
                                  registration.id
                                }
                                className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
                              >

                                <td className="px-4 py-4">

                                  <div>

                                    <p className="text-sm font-bold text-white">
                                      {
                                        student.full_name ||
                                        'Unknown Student'
                                      }
                                    </p>

                                    {student.username && (
                                      <p className="text-[10px] text-[#8c8d96] font-mono mt-1">
                                        @
                                        {
                                          student.username
                                        }
                                      </p>
                                    )}

                                    {student.email && (
                                      <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                                        {
                                          student.email
                                        }
                                      </p>
                                    )}

                                  </div>

                                </td>

                                <td className="px-4 py-4">

                                  <span className="font-mono text-xs font-bold text-[#00f3ff]">
                                    {
                                      registration.registration_code ||
                                      'N/A'
                                    }
                                  </span>

                                </td>

                                <td className="px-4 py-4">

                                  <span className="text-xs font-mono text-gray-400">

                                    {registration.registered_at
                                      ? new Date(
                                          registration.registered_at
                                        ).toLocaleString()
                                      : 'N/A'}

                                  </span>

                                </td>

                                <td className="px-4 py-4 text-center">

                                  {registration.attended ? (

                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-mono font-bold uppercase">

                                      <CheckCircle
                                        size={12}
                                      />

                                      Present

                                    </span>

                                  ) : (

                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono font-bold uppercase">

                                      <XCircle
                                        size={12}
                                      />

                                      Absent

                                    </span>

                                  )}

                                </td>

                                <td className="px-4 py-4">

                                  <span className="text-xs font-mono text-gray-400">

                                    {registration.attended &&
                                    registration.attended_at
                                      ? new Date(
                                          registration.attended_at
                                        ).toLocaleString()
                                      : '—'}

                                  </span>

                                </td>

                              </tr>

                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

                <div className="mt-4 flex justify-between items-center">

                  <p className="text-[10px] font-mono text-gray-600">
                    Showing{' '}
                    {
                      filteredRegistrations.length
                    }{' '}
                    of{' '}
                    {
                      registrations.length
                    }{' '}
                    registrations
                  </p>

                  <p className="text-[10px] font-mono text-gray-600">
                    Attendance data is synced with Supabase
                  </p>

                </div>

              </div>

            </div>

            {/* ==========================================
                QR ATTENDANCE SCANNER
                ========================================== */}

            <div>

              <h2 className="section-heading text-lg">
                EVENT ATTENDANCE SCANNER
              </h2>

              <div className="glass-panel rounded-xl p-6 sm:p-8">

                <div className="mb-6">

                  <span className="text-[#00f3ff] font-mono text-xs font-bold uppercase tracking-[0.2em]">
                    QR VERIFICATION SYSTEM
                  </span>

                  <p className="text-[#8c8d96] font-mono text-xs mt-2">
                    Scan a student's Tech Titans Event Pass to verify registration and mark attendance.
                  </p>

                </div>

                <EventAttendanceScanner />

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}