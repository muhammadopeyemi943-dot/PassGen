import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Ticket, Sun, Moon } from 'lucide-react';
import { EventDetails, Attendee, PassTemplate, TicketType, ViewType, ThemeType, EventItem } from './types';
import Sidebar from './components/Sidebar';
import CreateEvent from './components/CreateEvent';
import Dashboard from './components/Dashboard';
import Attendees from './components/Attendees';
import Events from './components/Events';
import EventDetailsComponent from './components/EventDetails';
import Settings from './components/Settings';

// Mock Initial seed data to prevent boring blank layouts
const defaultEventSeed: EventDetails = {
  name: "CYBERPUNK SUMMIT & EXHIBITION 2026",
  date: "2026-08-14",
  time: "18:00",
  venue: "Neo-Tokyo Cyber-Dome, Sector 7",
  organizerName: "Aether Cyber Grid System",
  brandColor: "#6B5FFF",
  bannerImage: null,
  passFont: "Syne"
};

const defaultAttendeesSeed: Attendee[] = [
  {
    id: "PSG-2026-00101",
    name: "Alexander Mercer",
    email: "alex@mercer.cyber",
    ticketType: "VIP",
    status: "Unused",
    createdAt: new Date().toISOString()
  },
  {
    id: "PSG-2026-00102",
    name: "Hiro Protagonist",
    email: "hiro@metaverse.net",
    ticketType: "Speaker",
    status: "Used",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "PSG-2026-00103",
    name: "Jane Sterling",
    email: "jane@sterling-studios.com",
    ticketType: "Staff",
    status: "Unused",
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

export default function App() {
  // Try loading events from localStorage or initialize with seed event
  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('passgen_events_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing events list:", e);
      }
    }
    
    // Seed default event if empty
    return [
      {
        id: "ev-default",
        details: defaultEventSeed,
        attendees: defaultAttendeesSeed,
        ticketTypes: ['General', 'VIP', 'Speaker', 'Staff'],
        activeTemplate: 'bold',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [activeEventId, setActiveEventId] = useState<string>(() => {
    const savedActive = localStorage.getItem('passgen_active_event_id');
    return savedActive || "ev-default";
  });

  // Global theme persistence
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as ThemeType) || 'dark';
  });

  // Derive active event
  const activeEvent = events.find(e => e.id === activeEventId) || events[0] || {
    id: "ev-default",
    details: defaultEventSeed,
    attendees: defaultAttendeesSeed,
    ticketTypes: ['General', 'VIP', 'Speaker', 'Staff'],
    activeTemplate: 'bold',
  };

  // State-like accessors pointing directly to active event in state grid
  const eventDetails = activeEvent.details;
  const attendees = activeEvent.attendees;
  const ticketTypes = activeEvent.ticketTypes;
  const activeTemplate = activeEvent.activeTemplate;

  // Custom setters that update the active event inside events state array
  const setEventDetails = (newDetails: EventDetails | ((prev: EventDetails) => EventDetails)) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === activeEventId) {
        const base = ev.details;
        const next = typeof newDetails === 'function' ? newDetails(base) : newDetails;
        return { ...ev, details: next };
      }
      return ev;
    }));
  };

  const setAttendees = (newAttendees: Attendee[] | ((prev: Attendee[]) => Attendee[])) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === activeEventId) {
        const base = ev.attendees;
        const next = typeof newAttendees === 'function' ? newAttendees(base) : newAttendees;
        return { ...ev, attendees: next };
      }
      return ev;
    }));
  };

  const setTicketTypes = (newTypes: TicketType[] | ((prev: TicketType[]) => TicketType[])) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === activeEventId) {
        const base = ev.ticketTypes;
        const next = typeof newTypes === 'function' ? newTypes(base) : newTypes;
        return { ...ev, ticketTypes: next };
      }
      return ev;
    }));
  };

  const setActiveTemplate = (newTemplate: PassTemplate | ((prev: PassTemplate) => PassTemplate)) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === activeEventId) {
        const base = ev.activeTemplate;
        const next = typeof newTemplate === 'function' ? newTemplate(base) : newTemplate;
        return { ...ev, activeTemplate: next };
      }
      return ev;
    }));
  };

  // View state tracking
  const [currentView, setView] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/attendees' || window.location.hash === '#attendees') return 'attendees';
      if (p === '/create' || window.location.hash === '#create') return 'create';
      if (p === '/events' || window.location.hash === '#events') return 'events';
      if (p === '/settings' || window.location.hash === '#settings') return 'settings';
      if (p.startsWith('/events/')) return 'event-details';
    }
    const saved = localStorage.getItem('passgen_active_view');
    return (saved as ViewType) || 'dashboard';
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Synchronize events list and active event ID to localStorage
  useEffect(() => {
    localStorage.setItem('passgen_events_list', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('passgen_active_event_id', activeEventId);
  }, [activeEventId]);

  // Synchronize URL and View state together
  useEffect(() => {
    localStorage.setItem('passgen_active_view', currentView);
    let path = '/';
    if (currentView === 'attendees') {
      path = '/attendees';
    } else if (currentView === 'create') {
      path = '/create';
    } else if (currentView === 'events') {
      path = '/events';
    } else if (currentView === 'settings') {
      path = '/settings';
    } else if (currentView === 'event-details') {
      path = activeEventId && activeEventId !== 'ev-default' ? `/events/${activeEventId}` : '/events';
    } else if (currentView === 'dashboard') {
      path = '/';
    }
    
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [currentView, activeEventId]);

  // Browser navigation popstate parsing
  useEffect(() => {
    const handleLocationChange = () => {
      const p = window.location.pathname;
      if (p === '/attendees' || window.location.hash === '#attendees') {
        setView('attendees');
      } else if (p === '/create' || window.location.hash === '#create') {
        setView('create');
      } else if (p === '/events' || window.location.hash === '#events') {
        setView('events');
      } else if (p === '/settings' || window.location.hash === '#settings') {
        setView('settings');
      } else if (p.startsWith('/events/')) {
        const parts = p.split('/');
        const id = parts[parts.length - 1];
        if (id) {
          const matched = events.find(ev => ev.id === id);
          if (matched) {
            setActiveEventId(id);
          }
        }
        setView('event-details');
      } else {
        setView('dashboard');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [events]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  // Theme Toggler helper
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Helper action to create a fresh new event in state
  const handleCreateNewEvent = () => {
    const newId = `ev-${Date.now()}`;
    const newEv: EventItem = {
      id: newId,
      details: {
        name: "",
        date: "",
        time: "",
        venue: "",
        organizerName: "",
        brandColor: "#6B5FFF",
        bannerImage: null,
        passFont: "Syne"
      },
      attendees: [],
      ticketTypes: ['General', 'VIP', 'Speaker', 'Staff'],
      activeTemplate: 'bold',
      createdAt: new Date().toISOString()
    };
    setEvents(prev => [...prev, newEv]);
    setActiveEventId(newId);
    setView('create');
  };

  // Get current Page/View Title
  const getHeaderTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'Home Dashboard';
      case 'event-details': return 'Event Console';
      case 'create': return 'Create Event Pass';
      case 'attendees': return 'Global Attendees';
      case 'events': return 'Events Archive';
      case 'settings': return 'Settings';
      default: return 'Workspace Console';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-page text-text-primary">
      
      {/* Laptop / Desktop fixed sidebar layout. Closed overlay drawer on Mobile */}
      <Sidebar 
        currentView={currentView}
        setView={setView}
        theme={theme}
        toggleTheme={toggleTheme}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        handleCreateNewEvent={handleCreateNewEvent}
      />

      {/* Main Content Workspace viewport wrapper */}
      <main className="flex-1 w-full min-h-screen flex flex-col overflow-x-hidden">
        
        {/* GLOBAL PREMIUM TOP NAVIGATION BAR */}
        <header className="flex h-16 items-center justify-between border-b border-nav-border bg-nav-bg px-6 z-40 sticky top-0 left-0 select-none w-full text-text-primary">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger block */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-bg-card active:scale-95 border border-bg-border cursor-pointer text-text-secondary hover:text-text-primary"
              id="hamburger-menu-trigger"
              title="Open Nav Sidebar"
            >
              <Menu size={18} />
            </button>

            {/* View Title indication */}
            <div className="flex items-center gap-2">
              <span className="hidden md:inline w-2 h-2 rounded-full bg-[#6B5FFF]" />
              <h1 className="text-xs font-mono font-bold uppercase tracking-widest text-text-secondary">
                {getHeaderTitle()}
              </h1>
              {currentView === 'event-details' && eventDetails.name && (
                <>
                  <span className="text-bg-border text-sm hidden sm:inline">|</span>
                  <span className="text-xs bg-bg-card border border-bg-border px-2 py-0.5 rounded font-mono text-text-secondary truncate max-w-[200px] hidden sm:inline">
                    {eventDetails.name}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ACTIVE PASS DETAILS LINK */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3DD68C] animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
                Console Connected
              </span>
            </div>

            {/* NO TEXT SUN/MOON ICON THEME TOGGLER */}
            <motion.button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-bg-card border border-bg-border hover:border-[#6B5FFF] text-text-secondary hover:text-text-primary shadow-card-shadow transition-all cursor-pointer flex items-center justify-center relative overflow-hidden"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              id="theme-toggle-topbar"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -12, opacity: 0, rotate: -45 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 12, opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  {theme === 'dark' ? (
                    <Sun size={15} className="text-amber-400" />
                  ) : (
                    <Moon size={15} className="text-[#6B5FFF]" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </header>

        {/* WORKSPACE VIEW RENDERING PANE */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="w-full flex-1"
            >
              {currentView === 'create' && (
                <CreateEvent
                  activeEventId={activeEventId}
                  eventDetails={eventDetails}
                  setEventDetails={setEventDetails}
                  attendees={attendees}
                  setAttendees={setAttendees}
                  setView={setView}
                  ticketTypes={ticketTypes}
                  setTicketTypes={setTicketTypes}
                  activeTemplate={activeTemplate}
                  setActiveTemplate={setActiveTemplate}
                />
              )}

              {currentView === 'dashboard' && (
                <Dashboard
                  events={events}
                  setView={setView}
                  setActiveEventId={setActiveEventId}
                  handleCreateNewEvent={handleCreateNewEvent}
                />
              )}

              {currentView === 'event-details' && (
                <EventDetailsComponent
                  events={events}
                  setEvents={setEvents}
                  activeEventId={activeEventId}
                  setActiveEventId={setActiveEventId}
                  attendees={attendees}
                  setAttendees={setAttendees}
                  eventDetails={eventDetails}
                  activeTemplate={activeTemplate}
                  setActiveTemplate={setActiveTemplate}
                  setView={setView}
                  ticketTypes={ticketTypes}
                  setTicketTypes={setTicketTypes}
                  handleCreateNewEvent={handleCreateNewEvent}
                />
              )}

              {currentView === 'settings' && (
                <Settings />
              )}

              {currentView === 'attendees' && (
                <Attendees
                  events={events}
                  setEvents={setEvents}
                  setView={setView}
                  setActiveEventId={setActiveEventId}
                  attendees={attendees}
                  setAttendees={setAttendees}
                  eventDetails={eventDetails}
                  activeTemplate={activeTemplate}
                  setActiveTemplate={setActiveTemplate}
                  ticketTypes={ticketTypes}
                  setTicketTypes={setTicketTypes}
                />
              )}

              {currentView === 'events' && (
                <Events
                  events={events}
                  setEvents={setEvents}
                  activeEventId={activeEventId}
                  setActiveEventId={setActiveEventId}
                  setView={setView}
                  handleCreateNewEvent={handleCreateNewEvent}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
