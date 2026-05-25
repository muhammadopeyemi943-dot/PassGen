import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { 
  Users, Search, Download, Plus, FileSpreadsheet, Eye, Trash2, 
  X, ShieldCheck, Clock, Award, Edit2, Calendar, MapPin, 
  User, Mail, ArrowLeft, Upload, DownloadCloud, AlertTriangle, Check
} from 'lucide-react';
import { Attendee, EventDetails as EventDetailsType, PassTemplate, ViewType, TicketType, EventItem } from '../types';
import PassCard from './PassCard';
import PassPreviewContainer from './PassPreviewContainer';
import VisualTemplateSelector from './VisualTemplateSelector';

interface EventDetailsProps {
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  activeEventId: string;
  setActiveEventId: (id: string) => void;
  attendees: Attendee[];
  setAttendees: React.Dispatch<React.SetStateAction<Attendee[]>>;
  eventDetails: EventDetailsType;
  activeTemplate: PassTemplate;
  setActiveTemplate: (template: PassTemplate) => void;
  setView: (view: ViewType) => void;
  ticketTypes: TicketType[];
  setTicketTypes?: React.Dispatch<React.SetStateAction<TicketType[]>>;
  handleCreateNewEvent?: () => void;
}

const colorPresets = [
  '#6B5FFF', // Electric Violet
  '#E63946', // Candy Apple Red
  '#3DD68C', // Emerald
  '#FFB547', // Sunburst Orange
  '#F72585', // Neon Pink
  '#3A0CA3', // Indigo Imperial
  '#00F5D4', // Mint Green
  '#FFD166', // Golden Velvet
];

const passFonts = [
  'Syne',
  'Montserrat',
  'Raleway',
  'Bebas Neue',
  'Playfair Display',
  'JetBrains Mono'
];

export default function EventDetailsComponent({
  events,
  setEvents,
  activeEventId,
  setActiveEventId,
  attendees,
  setAttendees,
  eventDetails,
  activeTemplate,
  setActiveTemplate,
  setView,
  ticketTypes,
  setTicketTypes,
}: EventDetailsProps) {

  // --- STATE LIST ---
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals visibility toggles
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isDeleteEventOpen, setIsDeleteEventOpen] = useState(false);
  const [isAddAttendeeOpen, setIsAddAttendeeOpen] = useState(false);
  const [isViewPassOpen, setIsViewPassOpen] = useState(false);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);

  // Focus structures
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null);
  const [viewPassTemplate, setViewPassTemplate] = useState<PassTemplate>(activeTemplate);
  const [deletingAttendeeId, setDeletingAttendeeId] = useState<string | null>(null);

  // Form states
  // Edit Event state elements
  const [editEventForm, setEditEventForm] = useState<EventDetailsType>({ ...eventDetails });
  const [editEventTemplate, setEditEventTemplate] = useState<PassTemplate>(activeTemplate);
  const editEventFileInputRef = useRef<HTMLInputElement>(null);

  // Add/Edit Attendee Form states
  const [attendeeForm, setAttendeeForm] = useState({
    name: '',
    email: '',
    ticketType: 'General'
  });
  const [attendeeFormError, setAttendeeFormError] = useState('');

  // CSV Import state elements
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreviewRows, setCsvPreviewRows] = useState<Array<{ name: string; email: string; ticketType: string }>>([]);
  const [csvError, setCsvError] = useState('');
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Image downloader loading state (for UI feedback spinner)
  const [isDownloading, setIsDownloading] = useState(false);


  // --- HANDLERS & HELPERS ---

  // Date formatter helper
  const formatEventDate = (dateStr: string) => {
    if (!dateStr) return 'Unscheduled Date';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Generate 5-digit unique random suffix
  const generateRandomPassId = () => {
    let suffix = '';
    for (let i = 0; i < 5; i++) {
      suffix += Math.floor(Math.random() * 10).toString();
    }
    // Self healing collisions checking inside the active attendees state grid
    const code = `PSG-2026-${suffix}`;
    const collision = attendees.some(val => val.id === code);
    if (collision) {
      return generateRandomPassId();
    }
    return code;
  };

  // Save edit event details handler
  const handleSaveEventDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEventForm.name.trim()) {
      alert("Event Display Name is required.");
      return;
    }

    setEvents(prev => prev.map(ev => {
      if (ev.id === activeEventId) {
        return {
          ...ev,
          details: { ...editEventForm },
          activeTemplate: editEventTemplate
        };
      }
      return ev;
    }));

    // Update active template state
    setActiveTemplate(editEventTemplate);
    setIsEditEventOpen(false);
  };

  // Init edit event modal helper prefilled with current event variables
  const handleOpenEditEventModal = () => {
    setEditEventForm({ ...eventDetails });
    setEditEventTemplate(activeTemplate);
    setIsEditEventOpen(true);
  };

  // Delete event handler
  const handleDeleteEvent = () => {
    if (events.length <= 1) {
      alert("At least one event draft must remain in system memory.");
      setIsDeleteEventOpen(false);
      return;
    }

    const remaining = events.filter(ev => ev.id !== activeEventId);
    setEvents(remaining);
    
    // Switch active event id
    if (remaining.length > 0) {
      setActiveEventId(remaining[0].id);
    }
    
    setIsDeleteEventOpen(false);
    setView('events');
  };

  // Status toggle handler
  const handleToggleAttendeeStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAttendees(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: a.status === 'Unused' ? 'Used' : 'Unused' };
      }
      return a;
    }));
  };

  // Delete single attendee with clean inline prompt response handlers
  const handleConfirmDeleteAttendee = (id: string) => {
    setAttendees(prev => prev.filter(a => a.id !== id));
    setDeletingAttendeeId(null);
  };

  // Add guest submit handler
  const handleAddAttendeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttendeeFormError('');

    if (!attendeeForm.name.trim() || !attendeeForm.email.trim()) {
      setAttendeeFormError('Full Name and Email are strictly required fields.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(attendeeForm.email.trim())) {
      setAttendeeFormError('Please specify a valid email address.');
      return;
    }

    if (editingAttendee) {
      // Editing attendee
      setAttendees(prev => prev.map(a => {
        if (a.id === editingAttendee.id) {
          return {
            ...a,
            name: attendeeForm.name.trim(),
            email: attendeeForm.email.trim(),
            ticketType: attendeeForm.ticketType
          };
        }
        return a;
      }));
      setEditingAttendee(null);
    } else {
      // Create new attendee
      const nextId = generateRandomPassId();
      const added: Attendee = {
        id: nextId,
        name: attendeeForm.name.trim(),
        email: attendeeForm.email.trim(),
        ticketType: attendeeForm.ticketType as TicketType,
        status: 'Unused',
        createdAt: new Date().toISOString()
      };
      setAttendees(prev => [added, ...prev]);
    }

    setAttendeeForm({ name: '', email: '', ticketType: 'General' });
    setIsAddAttendeeOpen(false);
  };

  // Open Edit Attendee Modal prefilled
  const handleOpenEditAttendee = (a: Attendee, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingAttendee(a);
    setAttendeeForm({
      name: a.name,
      email: a.email,
      ticketType: String(a.ticketType)
    });
    setAttendeeFormError('');
    setIsAddAttendeeOpen(true);
  };

  // Open Add Attendee Modal freshly initialized
  const handleOpenAddAttendee = () => {
    setEditingAttendee(null);
    setAttendeeForm({
      name: '',
      email: '',
      ticketType: 'General'
    });
    setAttendeeFormError('');
    setIsAddAttendeeOpen(true);
  };

  // Open View Pass Modal
  const handleOpenViewPass = (a: Attendee, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedAttendee(a);
    setViewPassTemplate(activeTemplate);
    setIsViewPassOpen(true);
  };

  // Custom high precision PNG builder & download
  const handleDownloadPng = async () => {
    if (!selectedAttendee) return;
    setIsDownloading(true);

    // Yield threat cycle thread for accurate layout painting
    await new Promise(resolve => setTimeout(resolve, 250));

    const elementId = `pass-card-download-${selectedAttendee.id}`;
    const element = document.getElementById(elementId);
    if (!element) {
      alert("Error generating card: download node elements missing in virtual viewports.");
      setIsDownloading(false);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High DPI support multiplier matches exact (380x2 px width / 580x2 px height ratios)
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: null
      });

      const dataUrl = canvas.toDataURL('image/png');
      const dlLink = document.createElement('a');
      dlLink.href = dataUrl;
      const safeName = selectedAttendee.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      dlLink.download = `${safeName}_Pass_${selectedAttendee.id}.png`;
      document.body.appendChild(dlLink);
      dlLink.click();
      document.body.removeChild(dlLink);
    } catch (err) {
      console.error("html2canvas generation failed:", err);
      alert("Encountered problem processing and rendering the high-density pass card.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Manual image base64 uploader helper (for Edit Event modal)
  const handleEditEventBannerUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("Banner photo limit exceeded (max 2MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditEventForm(prev => ({ ...prev, bannerImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // CSV parse trigger
  const handleCsvFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setCsvError('Unable to read binary buffers from file.');
        return;
      }

      try {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
          setCsvError('Uploaded file contains no rows or lack headers schemas (Name, Email, Ticket Type).');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        const nIndex = headers.indexOf('name');
        const eIndex = headers.indexOf('email');
        let tIndex = headers.indexOf('ticket type');
        if (tIndex === -1) tIndex = headers.indexOf('tickettype');

        if (nIndex === -1 || eIndex === -1) {
          setCsvError('CSV requires column headers titled "Name" and "Email".');
          return;
        }

        const parsedRows = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const row: string[] = [];
          let current = '';
          let insideQ = false;
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              insideQ = !insideQ;
            } else if (char === ',' && !insideQ) {
              row.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          row.push(current.trim());

          const rawName = (row[nIndex] || '').replace(/^["']|["']$/g, '').trim();
          const rawEmail = (row[eIndex] || '').replace(/^["']|["']$/g, '').trim();
          let rawType = 'General';
          if (tIndex !== -1 && row[tIndex]) {
            const tempVal = row[tIndex].replace(/^["']|["']$/g, '').trim();
            const tempUpper = tempVal.toUpperCase();
            if (tempUpper === 'VIP') rawType = 'VIP';
            else if (tempUpper === 'SPEAKER') rawType = 'Speaker';
            else if (tempUpper === 'STAFF') rawType = 'Staff';
            else if (tempVal) rawType = tempVal.charAt(0).toUpperCase() + tempVal.slice(1).toLowerCase();
          }

          if (rawName && rawEmail) {
            parsedRows.push({ name: rawName, email: rawEmail, ticketType: rawType });
          }
        }

        if (parsedRows.length === 0) {
          setCsvError('No valid rows found under required criteria. Please review sample columns.');
        } else {
          setCsvPreviewRows(parsedRows);
        }
      } catch (err) {
        setCsvError('An error occurred. Check file delimiter is standard comma.');
      }
    };
    reader.readAsText(file);
  };

  // Confirm and insert bulk CSV rows instantly
  const handleConfirmImportCsv = () => {
    if (csvPreviewRows.length === 0) return;

    const importedAttendees: Attendee[] = csvPreviewRows.map(row => {
      return {
        id: generateRandomPassId(),
        name: row.name,
        email: row.email,
        ticketType: row.ticketType as TicketType,
        status: 'Unused' as const,
        createdAt: new Date().toISOString()
      };
    });

    setAttendees(prev => [...importedAttendees, ...prev]);
    setIsImportCsvOpen(false);
    setCsvFile(null);
    setCsvPreviewRows([]);
  };

  // Immediate Local Attendees file CSV exporter
  const handleExportAttendeesCsv = () => {
    const headers = ['Name', 'Email', 'Ticket Type', 'Pass ID', 'Status'];
    const rows = attendees.map(a => [
      a.name,
      a.email,
      a.ticketType,
      a.id,
      a.status
    ]);
    
    // BOM header sequence injection avoids MS Excel charset discrepancies on legacy OS
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    const safeEventName = (eventDetails.name || 'Event').toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    link.download = `${safeEventName}-attendees.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter attendees by queries
  const filteredList = attendees.filter(att => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      att.name.toLowerCase().includes(term) ||
      att.email.toLowerCase().includes(term) ||
      att.id.toLowerCase().includes(term) ||
      String(att.ticketType).toLowerCase().includes(term)
    );
  });

  // Ticket badge coloring mapping
  const getTicketTypeBadgeMarkup = (type: string | TicketType) => {
    const t = String(type).toUpperCase();
    if (t.includes('VIP')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
          VIP
        </span>
      );
    }
    if (t.includes('SPEAKER')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm">
          Speaker
        </span>
      );
    }
    if (t.includes('STAFF')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
          Staff
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 shadow-sm">
        {String(type)}
      </span>
    );
  };


  return (
    <div className="w-full text-text-primary">

      {/* Breadcrumb row */}
      <div className="flex items-center gap-2 mb-6 text-xs text-text-secondary select-none">
        <button
          onClick={() => setView('events')}
          className="hover:text-[#6B5FFF] transition-colors font-semibold cursor-pointer py-1"
        >
          Events
        </button>
        <span className="opacity-40 text-xs">&rarr;</span>
        <span className="text-text-primary px-1 truncate max-w-[240px] font-medium">
          {eventDetails.name || 'Current Event'}
        </span>
      </div>

      {/* SECTION 1 — EVENT SUMMARY PROFILE CONTAINER */}
      <div className="bg-bg-card border border-bg-border rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-card-shadow flex flex-col lg:flex-row justify-between items-start gap-6 select-text">
        {/* Banner subtle background overlay */}
        {eventDetails.bannerImage && (
          <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
            <img 
              src={eventDetails.bannerImage} 
              alt="ambient cover image" 
              className="w-full h-full object-cover filter blur-[2px]"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="flex-1 space-y-4 z-10 w-full">
          <div>
            <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#6B5FFF] bg-[#6B5FFF]/10 border border-[#6B5FFF]/15 px-2.5 py-0.5 rounded-full">
                Active Console
              </span>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-850 border border-bg-border/30">
                <div 
                  className="w-2.5 h-2.5 rounded-full border border-black/20" 
                  style={{ backgroundColor: eventDetails.brandColor || '#6B5FFF' }}
                />
                <span className="text-[10px] font-mono uppercase tracking-wide text-text-secondary font-bold">
                  {activeTemplate} Layout
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-text-primary leading-tight uppercase">
              {eventDetails.name || 'Untitled Event Draft'}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-text-secondary pt-1">
            <div className="flex items-center gap-2.5">
              <Calendar size={15} className="text-[#6B5FFF] shrink-0" />
              <span>
                {formatEventDate(eventDetails.date)} &middot; <span className="font-mono">{eventDetails.time || '18:00'}</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin size={15} className="text-[#3DD68C] shrink-0" />
              <span className="truncate">{eventDetails.venue || 'Virtual / TBD Location'}</span>
            </div>

            <div className="flex items-center gap-2.5 col-span-1 sm:col-span-2">
              <User size={15} className="text-[#FFB547] shrink-0" />
              <span>
                Organized by: <span className="font-semibold text-text-primary">{eventDetails.organizerName || 'Sabi Labs Bureau'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Top Right of Card */}
        <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0 z-10 w-full lg:w-auto items-stretch lg:items-end">
          <button
            onClick={handleOpenEditEventModal}
            className="flex-1 lg:flex-initial py-2.5 px-4 rounded-xl border border-bg-border bg-bg-surface hover:bg-bg-border text-xs font-bold font-mono uppercase tracking-wider text-text-primary flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            <Edit2 size={13} className="text-[#6B5FFF]" />
            <span>Edit Event</span>
          </button>

          <button
            onClick={() => setIsDeleteEventOpen(true)}
            className="flex-1 lg:flex-initial py-2.5 px-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Trash2 size={13} className="text-red-400" />
            <span>Delete Event</span>
          </button>
        </div>
      </div>


      {/* SECTION 2 — ATTENDEES LIST MANAGEMENT PANEL */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-black text-lg tracking-tight text-text-primary">
              Attendees
            </h2>
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-badge-general-bg text-badge-general-text border border-bg-border/30">
              {attendees.length} {attendees.length === 1 ? 'Attendee' : 'Attendees'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsImportCsvOpen(true)}
              className="flex-1 sm:flex-initial h-10 px-4 bg-bg-card hover:bg-bg-surface border border-bg-border rounded-xl text-xs font-bold font-mono uppercase tracking-wider text-text-primary flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              <Upload size={14} className="text-[#3DD68C]" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={handleExportAttendeesCsv}
              disabled={attendees.length === 0}
              className="flex-1 sm:flex-initial h-10 px-4 bg-bg-card hover:bg-bg-surface border border-bg-border rounded-xl text-xs font-bold font-mono uppercase tracking-wider text-text-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            >
              <FileSpreadsheet size={14} className="text-[#FFB547]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenAddAttendee}
              className="w-full sm:w-auto h-10 px-4 bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md shadow-[#6B5FFF]/15"
            >
              <Plus size={14} />
              <span>Add Attendee</span>
            </button>
          </div>
        </div>

        {/* Search tool block */}
        {attendees.length > 0 && (
          <div className="relative w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder pointer-events-none" />
            <input 
              type="text"
              placeholder="Search by name, email, pass ID, ticket type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs bg-input-bg border border-input-border text-input-text placeholder-text-placeholder rounded-xl outline-none focus:border-[#6B5FFF] focus:ring-1 focus:ring-[#6B5FFF]"
            />
          </div>
        )}

        {/* Table & Empty state render grids */}
        {attendees.length === 0 ? (
          <div className="bg-bg-card border border-dashed border-bg-border rounded-2xl p-12 text-center max-w-xl mx-auto my-6 select-none">
            <div className="w-14 h-14 bg-[#6B5FFF]/10 text-[#6B5FFF] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#6B5FFF]/15">
              <Users size={24} strokeWidth={1.5} />
            </div>
            
            <h3 className="font-display font-bold text-text-primary text-base">No attendees yet</h3>
            <p className="text-xs text-text-secondary mt-1.5 max-w-xs mx-auto leading-relaxed">
              Add your first attendee to generate their pass
            </p>

            <div className="mt-5">
              <button
                onClick={handleOpenAddAttendee}
                className="inline-flex items-center gap-2 bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer transition-transform active:scale-95 shadow"
              >
                <Plus size={14} />
                <span>Add Attendee</span>
              </button>
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-bg-card border border-bg-border rounded-2xl p-12 text-center select-none">
            <Search className="w-8 h-8 text-text-placeholder mx-auto mb-3" />
            <p className="text-xs text-text-primary">No results match your search keywords "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-[#6B5FFF] hover:underline mt-2 font-mono"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-bg-card border border-bg-border rounded-xl md:rounded-2xl overflow-hidden shadow-card-shadow">
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left text-xs text-text-secondary table-fixed">
                  <thead className="bg-table-header-bg border-b border-table-border text-table-header-text font-mono text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-5 font-bold w-[25%]">Name</th>
                      <th className="py-4 px-4 font-bold w-[25%]">Email</th>
                      <th className="py-4 px-4 font-bold w-[13%]">Ticket Type</th>
                      <th className="py-4 px-4 font-bold w-[17%]">Pass ID</th>
                      <th className="py-4 px-4 font-bold w-[10%]">Status</th>
                      <th className="py-4 px-5 font-bold text-right w-[10%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-table-border text-xs">
                    {filteredList.map((att) => {
                      const isRowDeleting = deletingAttendeeId === att.id;
                      
                      return (
                        <tr 
                          key={att.id}
                          className="hover:bg-table-row-hover-bg/30 text-text-primary transition-all duration-100"
                        >
                          {isRowDeleting ? (
                            <td colSpan={6} className="py-3 px-5 bg-red-500/5 animate-fade-in">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-[11px] text-red-400 font-bold flex items-center gap-1.5">
                                  <AlertTriangle size={13} />
                                  Remove {att.name} from this event?
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setDeletingAttendeeId(null)}
                                    className="px-3 py-1 bg-bg-surface hover:bg-bg-border rounded text-[11px] border border-bg-border hover:text-text-primary transition-colors cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleConfirmDeleteAttendee(att.id)}
                                    className="px-3 py-1 bg-red-650 hover:bg-red-700 text-white font-bold rounded text-[11px] transition-colors cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="py-4 px-5 font-bold truncate text-text-primary" title={att.name}>
                                {att.name}
                              </td>
                              <td className="py-4 px-4 text-text-secondary truncate" title={att.email}>
                                {att.email}
                              </td>
                              <td className="py-4 px-4">
                                {getTicketTypeBadgeMarkup(att.ticketType)}
                              </td>
                              <td className="py-4 px-4 font-mono text-[11px] text-text-secondary tracking-wider font-semibold">
                                {att.id}
                              </td>
                              <td className="py-4 px-4">
                                <button
                                  onClick={(e) => handleToggleAttendeeStatus(att.id, e)}
                                  className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-bold uppercase cursor-pointer select-none border transition-all ${
                                    att.status === 'Used'
                                      ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/15'
                                      : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20 hover:bg-neutral-500/15'
                                  }`}
                                  title="Click to toggle check-in state"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${att.status === 'Used' ? 'bg-green-400' : 'bg-neutral-400'}`} />
                                  <span>{att.status}</span>
                                </button>
                              </td>
                              <td className="py-2 px-5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={(e) => handleOpenViewPass(att, e)}
                                    className="p-1 px-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg transition-colors cursor-pointer"
                                    title="View Ticket Pass"
                                  >
                                    <Eye size={13} />
                                  </button>
                                  <button
                                    onClick={(e) => handleOpenEditAttendee(att, e)}
                                    className="p-1 px-1.5 hover:bg-bg-surface text-text-secondary hover:text-[#6B5FFF] rounded-lg transition-colors cursor-pointer"
                                    title="Edit Details"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setDeletingAttendeeId(att.id); }}
                                    className="p-1 px-1.5 hover:bg-red-500/10 text-text-secondary hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                    title="Delete guest"
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

            {/* Mobile Card List View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredList.map((att) => {
                const isCardDeleting = deletingAttendeeId === att.id;
                
                return (
                  <div 
                    key={att.id}
                    className="bg-bg-card border border-bg-border rounded-xl p-5 shadow-card-shadow flex flex-col justify-between gap-4"
                  >
                    {isCardDeleting ? (
                      <div className="space-y-3.5 text-center py-2 animate-fade-in">
                        <p className="text-xs text-red-400 font-bold font-mono">
                          Remove {att.name} from this event?
                        </p>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setDeletingAttendeeId(null)}
                            className="px-4 py-1.5 bg-bg-surface hover:bg-bg-border text-xs rounded border border-bg-border cursor-pointer text-text-primary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleConfirmDeleteAttendee(att.id)}
                            className="px-4 py-1.5 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-text-primary">{att.name}</h4>
                            <p className="text-xs text-text-secondary truncate mt-0.5">{att.email}</p>
                          </div>
                          <div>
                            {getTicketTypeBadgeMarkup(att.ticketType)}
                          </div>
                        </div>

                        <div className="font-mono text-xs text-text-secondary tracking-wider bg-bg-surface border border-bg-border/40 py-1.5 px-3 rounded-lg overflow-x-auto truncate">
                          {att.id}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-bg-border/60">
                          {/* Toggle Status Pill */}
                          <button
                            onClick={(e) => handleToggleAttendeeStatus(att.id, e)}
                            className={`inline-flex items-center gap-1 py-1 px-3 rounded-full text-[10px] font-bold uppercase cursor-pointer select-none border transition-all ${
                              att.status === 'Used'
                                ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/15'
                                : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20 hover:bg-neutral-500/15'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${att.status === 'Used' ? 'bg-green-400' : 'bg-neutral-400'}`} />
                            <span>{att.status}</span>
                          </button>

                          {/* Quick Action Drawer */}
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => handleOpenViewPass(att, e)}
                              className="p-2 border border-bg-border bg-bg-surface text-text-secondary rounded-lg hover:text-text-primary cursor-pointer active:scale-90 transition-transform"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              onClick={(e) => handleOpenEditAttendee(att, e)}
                              className="p-2 border border-bg-border bg-bg-surface text-text-secondary rounded-lg hover:text-[#6B5FFF] cursor-pointer active:scale-90 transition-transform"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingAttendeeId(att.id); }}
                              className="p-2 border border-bg-border bg-bg-surface text-text-secondary rounded-lg hover:text-red-400 cursor-pointer active:scale-90 transition-transform"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>


      {/* --- MODALS SECTION OVERLAYS --- */}
      <AnimatePresence>

        {/* 1. DYNAMIC DETAILS & BRANDING EDIT EVENT MODAL */}
        {isEditEventOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
            <div 
              onClick={() => setIsEditEventOpen(false)}
              className="absolute inset-0 bg-modal-backdrop backdrop-blur-md"
            />
            <div 
              className="relative w-full max-w-2xl bg-modal-bg border border-bg-border p-6 rounded-2xl shadow-card-shadow z-10 max-h-[85vh] overflow-y-auto custom-scrollbar text-left text-text-primary"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-bg-border pb-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-text-primary font-display flex items-center gap-1.5">
                    <Edit2 size={16} className="text-[#6B5FFF]" />
                    <span>Edit Event Details & Branding</span>
                  </h3>
                  <p className="text-[10px] text-text-secondary font-mono mt-0.5 uppercase tracking-wider">
                    ID SCHEMA: {activeEventId}
                  </p>
                </div>
                <button 
                  onClick={() => setIsEditEventOpen(false)}
                  className="p-2 rounded-xl border border-bg-border bg-bg-surface text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveEventDetails} className="space-y-6 text-xs text-text-primary pb-2">
                {/* 1. EVENT INFO */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase font-extrabold tracking-widest text-[#6B5FFF] mb-3 border-b border-bg-border/60 pb-1.5">
                    Step 1: Event Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-text-secondary mb-1.5 font-bold font-mono tracking-wider">Event Name *</label>
                      <input 
                        type="text"
                        value={editEventForm.name}
                        onChange={(e) => setEditEventForm({ ...editEventForm, name: e.target.value })}
                        className="w-full h-10 px-3.5 bg-input-bg border border-input-border text-input-text placeholder-text-placeholder rounded-lg text-xs outline-none focus:border-[#6B5FFF]"
                        placeholder="e.g. CYBERPUNK SUMMIT & EXHIBITION 2026"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-text-secondary mb-1.5 font-bold font-mono tracking-wider">Scheduled Date *</label>
                      <input 
                        type="date"
                        value={editEventForm.date}
                        onChange={(e) => setEditEventForm({ ...editEventForm, date: e.target.value })}
                        className="w-full h-10 px-3.5 bg-input-bg border border-input-border text-input-text rounded-lg text-xs outline-none focus:border-[#6B5FFF]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-text-secondary mb-1.5 font-bold font-mono tracking-wider">Scheduled Time *</label>
                      <input 
                        type="time"
                        value={editEventForm.time}
                        onChange={(e) => setEditEventForm({ ...editEventForm, time: e.target.value })}
                        className="w-full h-10 px-3.5 bg-input-bg border border-input-border text-input-text rounded-lg text-xs outline-none focus:border-[#6B5FFF]"
                        required
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-text-secondary mb-1.5 font-bold font-mono tracking-wider">Venue / Location *</label>
                      <input 
                        type="text"
                        value={editEventForm.venue}
                        onChange={(e) => setEditEventForm({ ...editEventForm, venue: e.target.value })}
                        className="w-full h-10 px-3.5 bg-input-bg border border-input-border text-input-text placeholder-text-placeholder rounded-lg text-xs outline-none focus:border-[#6B5FFF]"
                        placeholder="e.g. Grand Plaza Cyber-Dome, Tokyo"
                        required
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-text-secondary mb-1.5 font-bold font-mono tracking-wider">Organizer Name *</label>
                      <input 
                        type="text"
                        value={editEventForm.organizerName}
                        onChange={(e) => setEditEventForm({ ...editEventForm, organizerName: e.target.value })}
                        className="w-full h-10 px-3.5 bg-input-bg border border-input-border text-input-text placeholder-text-placeholder rounded-lg text-xs outline-none focus:border-[#6B5FFF]"
                        placeholder="e.g. Sabi Labs Bureau"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 2. DYNAMIC BRANDING */}
                <div className="pt-2">
                  <h4 className="font-mono text-[10px] uppercase font-extrabold tracking-widest text-[#3DD68C] mb-3 border-b border-bg-border/60 pb-1.5">
                    Step 2: Pass Branding & Style
                  </h4>

                  <div className="space-y-4">
                    {/* Brand color selector */}
                    <div>
                      <label className="block text-text-secondary mb-2 font-bold font-mono tracking-wider">Signature Brand Color</label>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {colorPresets.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEditEventForm({ ...editEventForm, brandColor: color })}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-black/15 shadow-sm active:scale-90 transition-transform flex items-center justify-center text-white"
                            style={{ backgroundColor: color }}
                          >
                            {editEventForm.brandColor === color && <Check size={14} strokeWidth={3} />}
                          </button>
                        ))}
                        {/* Custom color hex input */}
                        <div className="relative flex items-center ml-2 text-text-primary">
                          <input 
                            type="color"
                            value={editEventForm.brandColor || '#6B5FFF'}
                            onChange={(e) => setEditEventForm({ ...editEventForm, brandColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 outline-none p-0 bg-transparent shrink-0"
                          />
                          <input 
                            type="text"
                            value={editEventForm.brandColor || ''}
                            onChange={(e) => setEditEventForm({ ...editEventForm, brandColor: e.target.value })}
                            className="w-20 col text-center ml-1.5 font-mono uppercase text-[10px] h-7 bg-input-bg border border-input-border text-input-text rounded outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Template Layout Selection tabs */}
                    <div className="flex flex-col gap-1.5 select-none">
                      <VisualTemplateSelector
                        selectedTemplate={editEventTemplate}
                        onChange={setEditEventTemplate}
                        brandColor={editEventForm.brandColor}
                        label="Preset Template Layout"
                      />
                    </div>

                    {/* Pass card Display Font Customize */}
                    <div>
                      <label className="block text-text-secondary mb-1.5 font-bold font-mono tracking-wider">Pass Typography Header Font</label>
                      <div className="grid grid-cols-3 gap-2">
                        {passFonts.map(fontName => (
                          <button
                            key={fontName}
                            type="button"
                            onClick={() => setEditEventForm({ ...editEventForm, passFont: fontName })}
                            className={`py-2 px-1 text-[11px] rounded-lg text-center cursor-pointer border transition-all truncate ${
                              editEventForm.passFont === fontName || (!editEventForm.passFont && fontName === 'Syne')
                                ? 'border-[#6B5FFF] bg-[#6B5FFF]/15 font-bold text-text-primary'
                                : 'border-bg-border bg-bg-surface text-text-secondary hover:bg-bg-card'
                            }`}
                            style={{ fontFamily: fontName }}
                          >
                            {fontName}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Cover Photo upload */}
                    <div>
                      <label className="block text-text-secondary mb-1.5 font-bold font-mono tracking-wider">Cover Banner Image</label>
                      <div className="flex gap-3 items-center">
                        {editEventForm.bannerImage ? (
                          <div className="relative w-36 h-20 rounded-lg overflow-hidden border border-bg-border shrink-0 bg-black/40">
                            <img 
                              src={editEventForm.bannerImage} 
                              alt="Banner placeholder" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => setEditEventForm({ ...editEventForm, bannerImage: null })}
                              className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-black text-red-400 rounded-full cursor-pointer hover:scale-105 transition-transform"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => editEventFileInputRef.current?.click()}
                            className="w-full h-20 border border-dashed border-bg-border hover:border-[#6B5FFF] rounded-xl flex flex-col justify-center items-center text-text-secondary cursor-pointer bg-bg-surface hover:bg-bg-card transition-colors select-none"
                          >
                            <Upload size={16} className="text-[#3DD68C] mb-1" />
                            <span className="text-[10px] font-mono">Upload Banner PNG/JPG (max 2MB)</span>
                            <input 
                              type="file"
                              ref={editEventFileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleEditEventBannerUpload(e.target.files)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action buttons row */}
                <div className="mt-8 pt-4 border-t border-bg-border flex justify-end gap-2.5 text-xs select-none">
                  <button
                    type="button"
                    onClick={() => setIsEditEventOpen(false)}
                    className="border border-bg-border hover:bg-bg-surface text-text-secondary px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow"
                  >
                    <Check size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. DELETE EVENT CONFIRMATION DIALOG GHOST MODAL */}
        {isDeleteEventOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              onClick={() => setIsDeleteEventOpen(false)}
              className="absolute inset-0 bg-modal-backdrop backdrop-blur-sm pointer-events-auto"
            />
            <div 
              className="relative w-full max-w-md bg-modal-bg border border-red-500/30 p-6 rounded-2xl shadow-card-shadow z-10 text-left select-text"
            >
              <h3 className="text-base font-bold text-text-primary font-display flex items-center gap-2 text-red-400">
                <Trash2 size={18} />
                <span>Delete Event?</span>
              </h3>
              <p className="text-xs text-text-secondary mt-3 leading-relaxed">
                Are you sure you want to delete this event and all its attendees? This cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-2 text-xs select-none">
                <button
                  onClick={() => setIsDeleteEventOpen(false)}
                  className="border border-bg-border hover:bg-bg-surface text-text-secondary px-4 py-2 rounded-lg cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-md"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. ADD / EDIT ATTENDEE MODAL CONTAINER */}
        {isAddAttendeeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              onClick={() => setIsAddAttendeeOpen(false)}
              className="absolute inset-0 bg-modal-backdrop backdrop-blur-sm"
            />
            <div 
              className="relative w-full max-w-md bg-modal-bg border border-bg-border p-6 rounded-2xl shadow-card-shadow z-10 text-left text-text-primary"
            >
              <div className="flex items-center justify-between border-b border-bg-border pb-4 mb-4 select-none">
                <h3 className="text-base font-bold text-text-primary font-display">
                  {editingAttendee ? 'Edit Attendee' : 'Add Attendee'}
                </h3>
                <button 
                  onClick={() => setIsAddAttendeeOpen(false)}
                  className="p-1 px-1.5 rounded-lg border border-bg-border hover:bg-bg-surface text-text-secondary cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {attendeeFormError && (
                <div className="p-2.5 mb-4 rounded bg-red-500/10 text-red-400 text-[11px] font-semibold border border-red-500/15">
                  {attendeeFormError}
                </div>
              )}

              <form onSubmit={handleAddAttendeeSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-text-secondary mb-1.5 font-bold font-mono uppercase tracking-wider">Full Name *</label>
                  <input 
                    type="text"
                    required
                    value={attendeeForm.name}
                    onChange={(e) => setAttendeeForm({ ...attendeeForm, name: e.target.value })}
                    className="w-full h-10 px-3.5 bg-input-bg border border-input-border text-input-text rounded-lg outline-none focus:border-[#6B5FFF]"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-1.5 font-bold font-mono uppercase tracking-wider">Email Address *</label>
                  <input 
                    type="email"
                    required
                    value={attendeeForm.email}
                    onChange={(e) => setAttendeeForm({ ...attendeeForm, email: e.target.value })}
                    className="w-full h-10 px-3.5 bg-input-bg border border-input-border text-input-text rounded-lg outline-none focus:border-[#6B5FFF]"
                    placeholder="e.g. johndoe@example.com"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-1.5 font-bold font-mono uppercase tracking-wider">Ticket Type *</label>
                  <select
                    value={attendeeForm.ticketType}
                    onChange={(e) => setAttendeeForm({ ...attendeeForm, ticketType: e.target.value })}
                    className="w-full h-10 px-3.5 bg-input-bg border border-input-border text-input-text rounded-lg outline-none focus:border-[#6B5FFF] cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="VIP">VIP</option>
                    <option value="Speaker">Speaker</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>

                <div className="mt-6 pt-4 border-t border-bg-border flex justify-end gap-2 text-xs select-none">
                  <button
                    type="button"
                    onClick={() => setIsAddAttendeeOpen(false)}
                    className="border border-bg-border hover:bg-bg-surface text-text-secondary px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white font-bold px-4 py-2 rounded-lg cursor-pointer shadow-md"
                  >
                    {editingAttendee ? 'Save Attendee' : 'Save Attendee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. VIEW PORTRAIT PASS AND TEMPLATE SWITCHER MODAL */}
        {isViewPassOpen && selectedAttendee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
            <div 
              onClick={() => setIsViewPassOpen(false)}
              className="absolute inset-0 bg-modal-backdrop backdrop-blur-md"
            />
            <div 
              style={{ width: 'fit-content', maxWidth: '100%' }}
              className="relative bg-modal-bg border border-bg-border p-6 rounded-2xl shadow-card-shadow z-10 flex flex-col items-center max-h-[92vh] overflow-y-auto hidden-scrollbar"
            >
              {/* Modal Header */}
              <div className="w-full flex justify-between items-center border-b border-bg-border pb-3 mb-5 select-none">
                <div className="text-left">
                  <h3 className="text-xs font-bold font-mono text-text-secondary uppercase tracking-widest">
                    Live Ticket Pass Preview
                  </h3>
                  <p className="text-[10px] text-text-placeholder font-mono mt-0.5">
                    ID: {selectedAttendee.id}
                  </p>
                </div>
                <button
                  onClick={() => setIsViewPassOpen(false)}
                  className="p-1 px-1.5 rounded-lg border border-bg-border hover:bg-bg-surface text-text-secondary cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Central Pass Card Render Box */}
              <PassPreviewContainer
                eventDetails={eventDetails}
                attendee={selectedAttendee}
                template={viewPassTemplate}
              />

              {/* HIDDEN high precise 2x full size node for html2canvas downloading pipeline */}
              <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none opacity-0">
                <PassCard
                  eventDetails={eventDetails}
                  attendee={selectedAttendee}
                  template={viewPassTemplate}
                  containerId={`pass-card-download-${selectedAttendee.id}`}
                  size="full"
                />
              </div>

              {/* Template Style Switcher Row below actual image */}
              <div className="w-full mt-6 flex flex-col items-center gap-3 select-none">
                <VisualTemplateSelector
                  selectedTemplate={viewPassTemplate}
                  onChange={setViewPassTemplate}
                  brandColor={eventDetails.brandColor}
                  label="Style Layout Presets"
                />
              </div>

              {/* Modal controls footer */}
              <div className="w-full grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-bg-border select-none">
                <button
                  onClick={() => setIsViewPassOpen(false)}
                  className="h-11 border border-bg-border hover:bg-bg-surface text-xs font-bold font-mono uppercase tracking-wider text-text-secondary rounded-xl cursor-pointer"
                >
                  Close Pass
                </button>

                <button
                  onClick={handleDownloadPng}
                  disabled={isDownloading}
                  className="h-11 bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow"
                >
                  <Download size={14} className={isDownloading ? 'animate-spin' : ''} />
                  <span>{isDownloading ? 'Generating...' : 'Download PNG'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. IMPORT ATTENDEES CSV SHEET MODAL */}
        {isImportCsvOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              onClick={() => setIsImportCsvOpen(false)}
              className="absolute inset-0 bg-modal-backdrop backdrop-blur-sm"
            />
            <div 
              className="relative w-full max-w-xl bg-modal-bg border border-bg-border p-6 rounded-2xl shadow-card-shadow z-10 text-left text-text-primary"
            >
              <div className="flex items-center justify-between border-b border-bg-border pb-4 mb-4 select-none">
                <h3 className="text-base font-bold text-text-primary font-display flex items-center gap-2">
                  <Upload size={18} className="text-[#3DD68C]" />
                  <span>Import Attendees CSV</span>
                </h3>
                <button 
                  onClick={() => setIsImportCsvOpen(false)}
                  className="p-1 px-1.5 rounded-lg border border-bg-border hover:bg-bg-surface text-text-secondary cursor-pointer animate-fade-in"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Upload Drop Zone Box */}
              {csvPreviewRows.length === 0 ? (
                <div className="space-y-4">
                  <div 
                    onClick={() => importFileInputRef.current?.click()}
                    className="border border-dashed border-bg-border hover:border-[#6B5FFF] bg-bg-surface/60 hover:bg-bg-surface py-8 px-6 rounded-xl text-center cursor-pointer transition-colors select-none"
                  >
                    <DownloadCloud size={32} className="mx-auto text-text-placeholder mb-3" />
                    <p className="text-xs font-bold text-text-primary">Click to choose or drag-and-drop CSV file</p>
                    <p className="text-[10px] text-text-secondary mt-1 max-w-xs mx-auto leading-relaxed">
                      Must contain headers in first row: <span className="font-mono text-text-primary">Name, Email, Ticket Type</span> (optional)
                    </p>
                    <input 
                      type="file"
                      ref={importFileInputRef}
                      className="hidden"
                      accept=".csv"
                      onChange={handleCsvFileSelected}
                    />
                  </div>

                  {csvError && (
                    <div className="p-2.5 bg-red-500/10 text-red-500 font-semibold border border-red-500/15 rounded text-[11px] font-mono leading-relaxed">
                      Error: {csvError}
                    </div>
                  )}

                  <div className="bg-bg-surface border border-bg-border rounded-xl p-4 text-[10px] text-text-secondary font-mono space-y-1.5 select-text">
                    <p className="font-bold uppercase tracking-wider text-text-placeholder text-[8px] mb-1">CSV Template Format Sample:</p>
                    <p className="text-text-primary">Name,Email,Ticket Type</p>
                    <p>Alice Mercer,alice@cyber.net,VIP</p>
                    <p>Bob Sterling,bob@gmail.net,General</p>
                    <p>James Dev,james@node.org,Speaker</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-2.5 bg-[#3DD68C]/10 border border-[#3DD68C]/25 text-[#3DD68C] rounded font-bold text-[11px] font-mono">
                    Success: Parsed {csvPreviewRows.length} valid attendee rows! Review data before importing below.
                  </div>

                  {/* Preview Rows Table wrapper with height restriction bounds */}
                  <div className="max-h-56 overflow-y-auto border border-bg-border rounded-lg bg-bg-surface/50 text-[11px]">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-table-header-bg text-table-header-text font-bold text-[9px] uppercase tracking-wider sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Name</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">Ticket Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-table-border text-text-secondary">
                        {csvPreviewRows.slice(0, 100).map((row, index) => (
                          <tr key={index}>
                            <td className="py-2 px-3 truncate text-text-primary font-medium">{row.name}</td>
                            <td className="py-2 px-3 truncate">{row.email}</td>
                            <td className="py-2 px-3 font-mono">{row.ticketType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {csvPreviewRows.length > 100 && (
                    <p className="text-[10px] text-text-placeholder italic">Showing first 100 rows preview...</p>
                  )}

                  <div className="mt-6 pt-4 border-t border-bg-border flex justify-end gap-2 text-xs select-none">
                    <button
                      onClick={() => { setCsvPreviewRows([]); setCsvFile(null); }}
                      className="border border-bg-border hover:bg-bg-surface text-text-secondary px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Clear File
                    </button>
                    <button
                      onClick={handleConfirmImportCsv}
                      className="bg-[#3DD68C] hover:bg-[#34C580] text-white font-bold px-5 py-2'5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <Check size={14} />
                      <span>Confirm Import ({csvPreviewRows.length})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
}
