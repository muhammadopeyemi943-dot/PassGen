import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { 
  Users, Eye, Trash2, X, Check, RefreshCw, Search, Download
} from 'lucide-react';
import { EventItem, Attendee, PassTemplate, TicketType, ViewType } from '../types';
import PassCard from './PassCard';
import PassPreviewContainer from './PassPreviewContainer';
import VisualTemplateSelector from './VisualTemplateSelector';

interface AttendeesProps {
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  setView: (view: ViewType) => void;
  setActiveEventId: (id: string) => void;
  // Retained props for prop-mapping compatibility with App shell
  attendees: Attendee[];
  setAttendees: React.Dispatch<React.SetStateAction<Attendee[]>>;
  eventDetails: any;
  activeTemplate: PassTemplate;
  setActiveTemplate: (template: PassTemplate) => void;
  ticketTypes: TicketType[];
  setTicketTypes?: React.Dispatch<React.SetStateAction<TicketType[]>>;
}

interface ExtendedAttendee extends Attendee {
  eventId: string;
  eventName: string;
  eventBrandColor: string;
  eventPassFont: string;
  eventActiveTemplate: PassTemplate;
  eventDetailsObj: any;
}

export default function Attendees({
  events,
  setEvents,
  setView,
  setActiveEventId,
  activeTemplate,
  setActiveTemplate,
}: AttendeesProps) {
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Modals & temporary views
  const [viewPassModalOpen, setViewPassModalOpen] = useState(false);
  const [selectedAttendeeView, setSelectedAttendeeView] = useState<ExtendedAttendee | null>(null);
  const [renderingPng, setRenderingPng] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Derive and flatten all attendees across all events with full event context
  const allAttendees: ExtendedAttendee[] = events.flatMap(ev => 
    ev.attendees.map(a => ({
      ...a,
      eventId: ev.id,
      eventName: ev.details.name,
      eventBrandColor: ev.details.brandColor || '#6B5FFF',
      eventPassFont: ev.details.passFont || 'Syne',
      eventActiveTemplate: ev.activeTemplate || 'bold',
      eventDetailsObj: ev.details
    }))
  );

  // Total absolute count of attendees across all events
  const totalAttendeesCount = allAttendees.length;

  // Filter list matching search query, event filter, ticket type, and status filter
  const filteredAttendees = allAttendees.filter(a => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      a.name.toLowerCase().includes(query) || 
      a.email.toLowerCase().includes(query) ||
      a.id.toLowerCase().includes(query);

    const matchesEvent = selectedEventFilter === 'All' || a.eventId === selectedEventFilter;
    const matchesType = selectedTypeFilter === 'All' || a.ticketType === selectedTypeFilter;
    const matchesStatus = selectedStatusFilter === 'All' || a.status === selectedStatusFilter;

    return matchesSearch && matchesEvent && matchesType && matchesStatus;
  });

  // Action: Toggle Check-In status instantly
  const handleToggleStatus = (id: string, eventId: string) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        return {
          ...ev,
          attendees: ev.attendees.map(a => 
            a.id === id ? { ...a, status: a.status === 'Unused' ? 'Used' : 'Unused' } : a
          )
        };
      }
      return ev;
    }));
  };

  // Action: Delete standard attendee registration from specific event
  const handleDeleteAttendee = (id: string, eventId: string) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        return {
          ...ev,
          attendees: ev.attendees.filter(a => a.id !== id)
        };
      }
      return ev;
    }));
    setDeleteConfirmId(null);
  };

  // Action: Export formatted all-attendees dataset as clean CSV
  const handleExportCSV = () => {
    // Generate row matrix based on selected filters
    const columns = ['Name', 'Email', 'Event', 'Ticket Type', 'Pass ID', 'Status'];
    const rows = filteredAttendees.map(a => [
      a.name,
      a.email,
      a.eventName,
      a.ticketType,
      a.id,
      a.status
    ]);

    const csvContent = "\uFEFF" + [
      columns.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'all-attendees.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // High Resolution PNG Renderer Handler
  const handleDownloadInModal = async (attendee: ExtendedAttendee) => {
    if (!attendee) return;
    const domId = `pass-card-downloadable-${attendee.id}`;
    setRenderingPng(attendee.id);

    await new Promise(resolve => setTimeout(resolve, 350));

    const element = document.getElementById(domId);
    if (!element) {
      alert('Error: Canvas container element was not located in document hierarchy.');
      setRenderingPng(null);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: null
      });

      const imgData = canvas.toDataURL('image/png');
      const dlLink = document.createElement('a');
      dlLink.href = imgData;
      dlLink.download = `${attendee.name.replace(/\s+/g, '_')}_Pass_${attendee.id}.png`;
      dlLink.click();
    } catch (error) {
      console.error('html2canvas rendering failed: ', error);
      alert('Failed to generate pass PNG image document.');
    } finally {
      setRenderingPng(null);
    }
  };

  // Ticket Badge Colors Helper
  const getBadgeColors = (type: string) => {
    const t = String(type).toUpperCase();
    if (t.includes('VIP')) {
      return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    }
    if (t.includes('SPEAKER')) {
      return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    }
    if (t.includes('STAFF')) {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
    return 'bg-badge-general-bg text-badge-general-text border border-bg-border/30';
  };

  const getTicketTypeBadgeMarkup = (type: string | TicketType) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase border shadow-sm ${getBadgeColors(type)}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6 text-text-primary">
      
      {/* 1. HEADER TITLE SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-bg-border pb-4 select-none">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#6B5FFF] block mb-1 font-bold">
            Master Registry
          </span>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-display font-black text-text-primary uppercase tracking-tight">
              Attendees
            </h1>
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-neutral-500/10 text-neutral-400 border border-bg-border/30">
              {totalAttendeesCount} Total
            </span>
          </div>
        </div>
      </div>

      {/* 2. SOFT HELPER BANNER COMPONENT */}
      <div 
        style={{ 
          backgroundColor: 'rgba(107, 95, 255, 0.08)', 
          border: '1px solid rgba(107, 95, 255, 0.2)', 
          borderRadius: '10px',
          color: 'var(--text-secondary)'
        }}
        className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full text-center sm:text-left select-none animate-fade-in"
      >
        <span className="text-xs sm:text-sm text-center sm:text-left">
          💡 To add attendees, open a specific event and add them from there.
        </span>
        <button
          onClick={() => setView('events')}
          className="text-[#6B5FFF] font-bold text-xs sm:text-sm hover:underline shrink-0 text-center cursor-pointer active:scale-95 transition-transform self-center sm:self-auto bg-transparent border-none"
        >
          View Events →
        </button>
      </div>

      {/* 3. CONDITIONAL MAIN BODY DESIGN RENDER GRIDS */}
      {totalAttendeesCount === 0 ? (
        
        /* EMPTY STATE - NO REGISTRATIONS SYSTEM-WIDE */
        <div className="bg-bg-card border border-bg-border rounded-2xl p-12 text-center max-w-xl mx-auto my-12 shadow-card-shadow select-none">
          <div className="w-16 h-16 bg-[#6B5FFF]/10 text-[#6B5FFF] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#6B5FFF]/15">
            <Users size={32} strokeWidth={1.5} />
          </div>
          
          <h3 className="font-display font-black text-text-primary text-xl uppercase tracking-tight">No attendees yet</h3>
          <p className="text-xs text-text-secondary mt-2 max-w-xs mx-auto leading-relaxed">
            Create an event and start adding attendees to see them here.
          </p>

          <div className="mt-8">
            <button
              onClick={() => setView('events')}
              className="inline-flex items-center gap-2 bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white text-xs font-bold font-mono uppercase tracking-wider py-3 px-6 rounded-xl cursor-pointer transition-transform active:scale-95 shadow-md shadow-[#6B5FFF]/15"
            >
              <span>View Events &rarr;</span>
            </button>
          </div>
        </div>

      ) : (

        /* ATTENDEE DATABASE RENDER WITH SEARCH & CONTROLS */
        <div className="space-y-6">
          
          {/* SEARCH, EVENTS DROPDOWN, TIER FILTER & CSV EXPORTER PANEL */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-bg-card border border-bg-border p-4 rounded-xl shadow-card-shadow">
            {/* Left: Search Tool */}
            <div className="relative w-full lg:max-w-xs shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder" />
              <input 
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 bg-input-bg border border-input-border text-input-text placeholder-text-placeholder rounded-xl h-10 outline-none focus:border-[#6B5FFF]"
              />
            </div>

            {/* Right: Dropdowns Filters Matrix & EXPORT ACTION BUTTON */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto lg:justify-end">
              {/* Event dropdown selector */}
              <select
                value={selectedEventFilter}
                onChange={(e) => setSelectedEventFilter(e.target.value)}
                className="text-xs bg-input-bg border border-input-border text-input-text h-10 px-3 rounded-xl outline-none font-bold cursor-pointer max-w-[180px] truncate"
              >
                <option value="All">All Events</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.details.name || 'Untitled Event'}</option>
                ))}
              </select>

              {/* Ticket Type drop-down */}
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="text-xs bg-input-bg border border-input-border text-input-text h-10 px-3 rounded-xl outline-none font-bold cursor-pointer"
              >
                <option value="All">All</option>
                <option value="General">General</option>
                <option value="VIP">VIP</option>
                <option value="Speaker">Speaker</option>
                <option value="Staff">Staff</option>
              </select>

              {/* Status drop-down */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="text-xs bg-input-bg border border-input-border text-input-text h-10 px-3 rounded-xl outline-none font-bold cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Unused">Unused</option>
                <option value="Used">Used</option>
              </select>

              {/* CSV Export Action button inside controls */}
              <button
                onClick={handleExportCSV}
                disabled={filteredAttendees.length === 0}
                className="h-10 px-4 bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm ml-auto lg:ml-0"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* EMPTY FILTER SEARCH MATCH RESULT STATE */}
          {filteredAttendees.length === 0 ? (
            <div className="bg-bg-card border border-bg-border rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-card-shadow select-none animate-fade-in">
              <div className="w-12 h-12 bg-neutral-500/10 text-text-placeholder rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search size={20} />
              </div>
              <p className="text-sm font-bold text-text-primary">No attendees match your search.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedEventFilter('All');
                  setSelectedTypeFilter('All');
                  setSelectedStatusFilter('All');
                }}
                className="text-xs text-[#6B5FFF] hover:underline mt-3 font-mono font-bold cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* 4. DESKTOP VIEW TABLE LAYOUT */}
              <div className="hidden md:block bg-bg-card border border-bg-border rounded-2xl overflow-hidden shadow-card-shadow">
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left text-xs text-text-secondary table-fixed">
                    <thead className="bg-[#12121e] border-b border-bg-border text-table-header-text font-mono text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="py-4 px-5 font-bold w-[18%]">Name</th>
                        <th className="py-4 px-4 font-bold w-[22%]">Email</th>
                        <th className="py-4 px-4 font-bold w-[22%] font-sans">Event</th>
                        <th className="py-4 px-4 font-bold w-[12%]">Ticket Type</th>
                        <th className="py-4 px-4 font-bold w-[13%]">Pass ID</th>
                        <th className="py-4 px-4 font-bold w-[10%]">Status</th>
                        <th className="py-4 px-5 font-bold text-right w-[8%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bg-border text-xs">
                      {filteredAttendees.map((att) => {
                        const isDeleting = deleteConfirmId === `${att.eventId}-${att.id}`;
                        
                        return (
                          <tr 
                            key={`${att.eventId}-${att.id}`} 
                            className="hover:bg-bg-surface/30 text-text-primary transition-all duration-100"
                          >
                            {isDeleting ? (
                              <td colSpan={7} className="py-3.5 px-5 bg-red-500/5 animate-fade-in">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-mono text-red-400 font-bold flex items-center gap-1.5">
                                    Confirm removing attendee {att.name}?
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-3 py-1 bg-bg-surface hover:bg-bg-border rounded text-[11px] border border-bg-border text-text-primary transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAttendee(att.id, att.eventId)}
                                      className="px-3 py-1 bg-red-650 hover:bg-red-700 text-white font-bold rounded text-[11px] transition-colors cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </td>
                            ) : (
                              <>
                                {/* Name */}
                                <td className="py-4 px-5 font-bold text-text-primary truncate" title={att.name}>
                                  {att.name}
                                </td>
                                
                                {/* Email */}
                                <td className="py-4 px-4 text-text-secondary truncate" title={att.email}>
                                  {att.email}
                                </td>
                                
                                {/* Event click anchor link to specific event registry console */}
                                <td className="py-4 px-4 truncate">
                                  <button
                                    onClick={() => {
                                      setActiveEventId(att.eventId);
                                      setView('event-details');
                                    }}
                                    className="text-[#6B5FFF] hover:underline text-left cursor-pointer font-bold inline-block truncate max-w-full"
                                  >
                                    {att.eventName}
                                  </button>
                                </td>
                                
                                {/* Ticket Type badges options */}
                                <td className="py-4 px-4">
                                  {getTicketTypeBadgeMarkup(att.ticketType)}
                                </td>
                                
                                {/* Unique sequential Pass ID */}
                                <td className="py-4 px-4 font-mono text-[11px] text-text-secondary tracking-wider font-semibold">
                                  {att.id}
                                </td>
                                
                                {/* Quick change active Check-In Status pill */}
                                <td className="py-4 px-4">
                                  <button
                                    onClick={() => handleToggleStatus(att.id, att.eventId)}
                                    className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-bold uppercase cursor-pointer select-none border transition-all ${
                                      att.status === 'Used'
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/15'
                                        : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20 hover:bg-neutral-500/15'
                                    }`}
                                    title="Instant check-in status toggler"
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${att.status === 'Used' ? 'bg-green-400' : 'bg-neutral-400'}`} />
                                    <span>{att.status}</span>
                                  </button>
                                </td>
                                
                                {/* Action Set Icons */}
                                <td className="py-2 px-5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => {
                                        setSelectedAttendeeView(att);
                                        setViewPassModalOpen(true);
                                      }}
                                      className="p-1 px-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg transition-colors cursor-pointer"
                                      title="View Ticket Pass"
                                    >
                                      <Eye size={13} />
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(`${att.eventId}-${att.id}`)}
                                      className="p-1 px-1.5 hover:bg-red-500/10 text-text-secondary hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                      title="Delete guest registration"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. MOBILE VIEW CARD LIST LISTINGS */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredAttendees.map((att) => {
                  const isDeleting = deleteConfirmId === `${att.eventId}-${att.id}`;
                  
                  return (
                    <div 
                      key={`${att.eventId}-${att.id}`}
                      className="bg-bg-card border border-bg-border rounded-xl p-5 shadow-card-shadow flex flex-col justify-between gap-4"
                    >
                      {isDeleting ? (
                        <div className="space-y-3.5 text-center py-2 animate-fade-in">
                          <p className="text-xs text-red-400 font-extrabold font-mono uppercase tracking-wide">
                            Remove {att.name}?
                          </p>
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-4 py-1.5 bg-bg-surface hover:bg-bg-border text-xs rounded border border-bg-border cursor-pointer text-text-primary"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteAttendee(att.id, att.eventId)}
                              className="px-4 py-1.5 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Top row: Name & Ticket type badge */}
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-text-primary leading-tight select-text">{att.name}</h4>
                              
                              {/* Small clickable link referencing back to main event */}
                              <button
                                onClick={() => {
                                  setActiveEventId(att.eventId);
                                  setView('event-details');
                                }}
                                className="text-[11px] text-[#6B5FFF] hover:underline text-left cursor-pointer font-bold mt-1.5 block leading-normal"
                              >
                                {att.eventName}
                              </button>
                            </div>
                            <div className="shrink-0">
                              {getTicketTypeBadgeMarkup(att.ticketType)}
                            </div>
                          </div>

                          {/* Detail attributes: Email & Pass ID */}
                          <div className="space-y-2 select-text">
                            <p className="text-xs text-text-secondary truncate">{att.email}</p>
                            <div className="font-mono text-[10px] text-text-secondary tracking-widest bg-bg-surface border border-bg-border/40 py-1.5 px-3 rounded-lg overflow-x-auto truncate select-all h-8 flex items-center">
                              {att.id}
                            </div>
                          </div>

                          {/* Footer row: status (bottom left) & actions (bottom right) */}
                          <div className="flex items-center justify-between pt-3 border-t border-bg-border/60">
                            {/* Toggle status pill clicking rotates checking */}
                            <button
                              onClick={() => handleToggleStatus(att.id, att.eventId)}
                              className={`inline-flex items-center gap-1 py-1.5 px-3 rounded-full text-[10px] font-bold uppercase cursor-pointer select-none border transition-all ${
                                att.status === 'Used'
                                  ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/15'
                                  : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20 hover:bg-neutral-500/15'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${att.status === 'Used' ? 'bg-green-400' : 'bg-neutral-400'}`} />
                              <span>{att.status}</span>
                            </button>

                            {/* View pass and Delete guest buttons action set */}
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedAttendeeView(att);
                                  setViewPassModalOpen(true);
                                }}
                                className="p-2 border border-bg-border bg-bg-surface text-text-secondary rounded-lg hover:text-text-primary cursor-pointer active:scale-90 transition-transform flex items-center justify-center"
                                title="View badge design"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(`${att.eventId}-${att.id}`)}
                                className="p-2 border border-bg-border bg-bg-surface text-text-secondary rounded-lg hover:text-red-400 cursor-pointer active:scale-90 transition-transform flex items-center justify-center"
                                title="Remove guest"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      )}

      {/* --- MODALS CONTROLLERS OVERLAYS --- */}
      <AnimatePresence>
        {viewPassModalOpen && selectedAttendeeView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewPassModalOpen(false)}
              className="absolute inset-0 bg-modal-backdrop backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-4xl bg-modal-bg border border-bg-border p-6 md:p-8 rounded-2xl shadow-card-shadow z-10 text-xs text-text-primary max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-4 border-b border-bg-border mb-6 select-none">
                <div>
                  <h3 className="text-sm font-display font-black uppercase tracking-wider text-text-primary">
                    Event Pass Preview Panel
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Live compiled badge design options with dynamic instant QR generation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewPassModalOpen(false)}
                  className="p-1.5 bg-bg-surface border border-bg-border text-text-secondary hover:text-text-primary rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Style selector panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1 border border-bg-border bg-bg-card p-4 rounded-xl space-y-4 select-none">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary font-bold block">
                    Style Switcher presets
                  </span>

                  {/* Switch badge templates */}
                  <div className="flex flex-col gap-2">
                    <VisualTemplateSelector
                      selectedTemplate={selectedAttendeeView.eventActiveTemplate}
                      onChange={(t) => {
                        setSelectedAttendeeView(prev => {
                          if (!prev) return null;
                          return { ...prev, eventActiveTemplate: t };
                        });
                      }}
                      brandColor={selectedAttendeeView.eventDetailsObj?.brandColor}
                      label=""
                    />
                  </div>

                  <div className="h-px bg-bg-border my-4" />

                  {/* Pass Metadata specifications */}
                  <div className="text-[11px] text-text-secondary space-y-2 select-text">
                    <p className="font-bold text-text-primary">Attendee Pass Metadata:</p>
                    <ul className="list-disc list-inside space-y-1 font-mono text-[10px]">
                      <li>Pass Resolution: 1600x880px</li>
                      <li>Associated Event ID: {selectedAttendeeView.eventId}</li>
                      <li>QR Payload: Secure JSON string</li>
                    </ul>
                  </div>

                  {/* Download image generation button */}
                  <button
                    type="button"
                    onClick={() => handleDownloadInModal(selectedAttendeeView)}
                    className="w-full bg-[#3DD68C] hover:bg-[#2fc17c] text-neutral-950 font-black text-xs h-12 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {renderingPng === selectedAttendeeView.id ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Rendering Pass...</span>
                      </>
                    ) : (
                      <>
                        <Check size={15} strokeWidth={2.5} />
                        <span>Download PNG Pass</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Virtual Viewport Card Canvas representation container */}
                <div className="lg:col-span-2 flex items-center justify-center">
                  <PassPreviewContainer
                    containerId={`pass-card-downloadable-${selectedAttendeeView.id}`}
                    eventDetails={{
                      ...selectedAttendeeView.eventDetailsObj,
                      passFont: selectedAttendeeView.eventPassFont
                    }}
                    attendee={selectedAttendeeView}
                    template={selectedAttendeeView.eventActiveTemplate}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden high definition canvas rendering container node */}
      {selectedAttendeeView && (
        <div className="absolute left-[-9999px] top-[-9999px] pointer-events-none select-none overflow-hidden" id="passcard-offscreener-container">
          <PassCard
            containerId={`pass-card-downloadable-${selectedAttendeeView.id}`}
            eventDetails={{
              ...selectedAttendeeView.eventDetailsObj,
              passFont: selectedAttendeeView.eventPassFont
            }}
            attendee={selectedAttendeeView}
            template={selectedAttendeeView.eventActiveTemplate}
            size="full"
          />
        </div>
      )}

    </div>
  );
}
