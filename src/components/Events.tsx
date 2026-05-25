import React, { useState, useRef } from 'react';
import { 
  Users, Search, Plus, Trash2, Edit2, Compass, 
  Calendar, MapPin, X, Check, Type, Save, Upload , Eye
} from 'lucide-react';
import { EventItem, EventDetails, PassTemplate } from '../types';
import VisualTemplateSelector from './VisualTemplateSelector';

interface EventsProps {
  events: EventItem[];
  activeEventId: string;
  setActiveEventId: (id: string) => void;
  setView: (view: any) => void;
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  handleCreateNewEvent: () => void;
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

export default function Events({
  events,
  activeEventId,
  setActiveEventId,
  setView,
  setEvents,
  handleCreateNewEvent
}: EventsProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  
  // Custom detail editing tracker
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter events by name or code search match
  const filteredEvents = events.filter(ev => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      (ev.details.name || '').toLowerCase().includes(term) ||
      (ev.details.venue || '').toLowerCase().includes(term) ||
      (ev.details.organizerName || '').toLowerCase().includes(term)
    );
  });

  const handleViewEvent = (id: string) => {
    setActiveEventId(id);
    setView('event-details');
  };

  const handleOpenEdit = (e: React.MouseEvent, ev: EventItem) => {
    e.stopPropagation();
    setEditingEvent(JSON.parse(JSON.stringify(ev))); // deep clone draft
  };

  const handleSaveEdit = () => {
    if (!editingEvent) return;
    
    // Validate
    if (!editingEvent.details.name.trim()) {
      alert("Please specify a display name.");
      return;
    }

    setEvents(prev => prev.map(ev => {
      if (ev.id === editingEvent.id) {
        return editingEvent;
      }
      return ev;
    }));

    setEditingEvent(null);
  };

  // Safe Deletion routine
  const handleDeleteEvent = (id: string) => {
    if (events.length <= 1) {
      alert("At least one event draft must remain in system memory.");
      setDeletingEventId(null);
      return;
    }

    setEvents(prev => prev.filter(ev => ev.id !== id));
    
    // Auto shift active event if deleted active
    if (id === activeEventId) {
      const remaining = events.filter(ev => ev.id !== id);
      if (remaining.length > 0) {
        setActiveEventId(remaining[0].id);
      }
    }
    setDeletingEventId(null);
  };

  // Edit fields helper
  const handleFieldChange = (key: string, value: any) => {
    if (!editingEvent) return;
    setEditingEvent({
      ...editingEvent,
      details: {
        ...editingEvent.details,
        [key]: value
      }
    });
  };

  // Handle banner image base64 upload
  const handleImageUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be smaller than 2MB for browser local storage.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFieldChange('bannerImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full text-text-primary">
      {/* Search and Action Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-text-primary">
            Created Events Archive
          </h2>
          <p className="text-xs text-text-secondary">
            Manage, configure branding, and monitor attendee logs per each schemas
          </p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          {/* Search bar inputs */}
          <div className="relative flex-1 md:w-64">
            <input 
              type="text"
              placeholder="Search schemas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-3.5 pr-10 text-xs bg-input-bg border border-input-border rounded-xl focus:border-[#6B5FFF] focus:outline-none focus:ring-1 focus:ring-[#6B5FFF] text-input-text placeholder-text-placeholder"
            />
          </div>

          <button
            onClick={handleCreateNewEvent}
            className="flex-shrink-0 h-10 px-4 bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-[#6B5FFF]/15 transition-all text-center"
          >
            <Plus size={14} />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Events Grid layout */}
      {filteredEvents.length === 0 ? (
        <div className="border border-dashed border-bg-border rounded-2xl p-12 text-center max-w-xl mx-auto my-12 bg-bg-card/20">
          <Compass className="w-12 h-12 text-text-placeholder mx-auto mb-4 stroke-1" />
          <h3 className="font-display font-semibold text-text-primary text-sm">No Events Found</h3>
          <p className="text-xs text-text-secondary mt-1.5 max-w-xs mx-auto">
            We couldn't find any databases matching "{searchQuery}". Create a new event pass to begin.
          </p>
          <button
            onClick={handleCreateNewEvent}
            className="mt-5 inline-flex items-center gap-2 bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white text-xs font-bold py-2.5 px-4 rounded-lg cursor-pointer transition-transform duration-100"
          >
            <Plus size={14} />
            <span>Build First Event Pass</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {filteredEvents.map((ev) => {
            const isCurrentActive = ev.id === activeEventId;
            const brandColor = ev.details.brandColor || '#6B5FFF';
            
            return (
              <div
                key={ev.id}
                onClick={() => handleViewEvent(ev.id)}
                className={`relative group bg-bg-card hover:bg-bg-surface border hover:border-accent-primary transition-all rounded-2xl p-6 flex flex-col justify-between cursor-pointer shadow-card-shadow ${
                  isCurrentActive 
                    ? "border-accent-primary" 
                    : "border-bg-border"
                }`}
                style={{ borderLeft: `4px solid ${brandColor}` }}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    {/* Badge container */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-badge-general-bg text-badge-general-text border border-bg-border/30 uppercase">
                        {ev.activeTemplate} Template
                      </span>
                      {isCurrentActive && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#6B5FFF]/15 text-[#6B5FFF] border border-[#6B5FFF]/20">
                          Active Console
                        </span>
                      )}
                    </div>
                    {/* Brand Indicator */}
                    <div 
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm"
                      style={{ backgroundColor: brandColor }}
                      title={`Brand color preset: ${brandColor}`}
                    />
                  </div>

                  <h3 className="font-display font-bold text-base text-text-primary leading-tight tracking-tight group-hover:text-accent-primary transition-colors line-clamp-2 animate-fade-in">
                    {ev.details.name || "Untitled Event Draft"}
                  </h3>

                  {/* Date & Location list */}
                  <div className="space-y-2 mt-4 text-xs text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-[#6B5FFF]" />
                      <span>
                        {ev.details.date ? new Date(ev.details.date).toLocaleDateString(undefined, {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        }) : "Unscheduled Date"}
                        {ev.details.time && ` @ ${ev.details.time}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-[#3DD68C]" />
                      <span className="line-clamp-1">{ev.details.venue || "Virtual / TBD"}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Section: Attendee count & Action drawers */}
                <div className="mt-6 pt-4 border-t border-bg-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs bg-bg-surface border border-bg-border py-1.5 px-3 rounded-lg text-text-primary">
                    <Users size={12} className="text-[#6B5FFF]" />
                    <span className="font-mono font-bold">{ev.attendees.length}</span>
                    <span className="opacity-70 text-[10px]">Guests</span>
                  </div>

                  {/* Buttons Drawer */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleViewEvent(ev.id); }}
                      className="p-2 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg transition-all"
                      title="View Event Dashboard"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={(e) => handleOpenEdit(e, ev)}
                      className="p-2 hover:bg-bg-surface text-text-secondary hover:text-[#6B5FFF] rounded-lg transition-all"
                      title="Edit details and branding"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingEventId(ev.id);
                      }}
                      className="p-2 hover:bg-red-500/10 text-text-secondary hover:text-red-400 rounded-lg transition-all"
                      title="Delete Event schema"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. DELETION CONFIRMATION DIALOG MODAL */}
      {deletingEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setDeletingEventId(null)}
            className="absolute inset-0 bg-modal-backdrop backdrop-blur-sm"
          />
          <div 
            className="relative w-full max-w-md bg-modal-bg border border-red-500/30 p-6 rounded-2xl shadow-card-shadow z-10"
          >
            <h3 className="text-base font-bold text-text-primary font-display flex items-center gap-2">
              <Trash2 className="text-red-400" size={18} />
              <span>Delete Event Schema?</span>
            </h3>
            <p className="text-xs text-text-secondary mt-2.5 leading-relaxed">
              This action is irreversible. Deleting this event will wipe it from local memory along with its entire attendee records sheet.
            </p>
            <div className="mt-6 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeletingEventId(null)}
                className="border border-bg-border hover:bg-bg-surface text-text-secondary px-4 py-2 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(deletingEventId)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC DETAILS & BRANDING EDIT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            onClick={() => setEditingEvent(null)}
            className="absolute inset-0 bg-modal-backdrop backdrop-blur-sm"
          />
          <div 
            className="relative w-full max-w-2xl bg-modal-bg border border-bg-border p-6 rounded-2xl shadow-card-shadow z-10 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-bg-border pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-text-primary font-display">
                  Edit Event Details & Branding
                </h3>
                <p className="text-[10px] text-text-secondary">
                  ID: <span className="font-mono">{editingEvent.id}</span>
                </p>
              </div>
              <button 
                onClick={() => setEditingEvent(null)}
                className="p-1.5 rounded-lg border border-bg-border hover:bg-bg-surface text-text-secondary cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Form Content Scroll Section */}
            <div className="space-y-6 text-xs text-text-primary">
              {/* 1. EVENT INFO */}
              <div>
                <h4 className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#6B5FFF] mb-3">
                  Step 1: Event Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-text-secondary mb-1.5 font-semibold">Event Display Name *</label>
                    <input 
                      type="text"
                      value={editingEvent.details.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="w-full h-10 px-3.5 bg-input-bg border border-input-border text-input-text placeholder-text-placeholder rounded-lg text-xs outline-none"
                      placeholder="e.g. Aether Synth Symphony"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1.5 font-semibold">Scheduled Date *</label>
                    <input 
                      type="date"
                      value={editingEvent.details.date}
                      onChange={(e) => handleFieldChange('date', e.target.value)}
                      className="w-full h-10 px-3.5 bg-input-bg border border-input-border text-input-text rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1.5 font-semibold">Scheduled Time *</label>
                    <input 
                      type="time"
                      value={editingEvent.details.time}
                      onChange={(e) => handleFieldChange('time', e.target.value)}
                      className="w-full h-10 px-3.5 bg-input-bg border border-input-border text-input-text rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-text-secondary mb-1.5 font-semibold">Venue Location *</label>
                    <input 
                      type="text"
                      value={editingEvent.details.venue}
                      onChange={(e) => handleFieldChange('venue', e.target.value)}
                      className="w-full h-10 px-3.5 bg-input-bg border border-input-border text-input-text placeholder-text-placeholder rounded-lg text-xs outline-none"
                      placeholder="e.g. Grand Plaza, London"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-text-secondary mb-1.5 font-semibold">Organizer Name *</label>
                    <input 
                      type="text"
                      value={editingEvent.details.organizerName}
                      onChange={(e) => handleFieldChange('organizerName', e.target.value)}
                      className="w-full h-10 px-3.5 bg-input-bg border border-input-border text-input-text placeholder-text-placeholder rounded-lg text-xs outline-none"
                      placeholder="e.g. Sabi Labs Event Bureau"
                    />
                  </div>
                </div>
              </div>

              {/* 2. DYNAMIC BRANDING */}
              <div className="pt-4 border-t border-bg-border">
                <h4 className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#3DD68C] mb-3">
                  Step 2: Pass Branding & Cover Layout
                </h4>

                <div className="space-y-4">
                  {/* Brand color selector */}
                  <div>
                    <label className="block text-text-secondary mb-1.5 font-semibold">Signature Brand Color</label>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {colorPresets.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleFieldChange('brandColor', color)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-black/15 shadow-sm active:scale-90 transition-transform flex items-center justify-center text-white"
                          style={{ backgroundColor: color }}
                        >
                          {editingEvent.details.brandColor === color && <Check size={14} strokeWidth={3} />}
                        </button>
                      ))}
                      {/* Custom color hex input */}
                      <div className="relative flex items-center ml-2 text-text-primary">
                        <input 
                          type="color"
                          value={editingEvent.details.brandColor}
                          onChange={(e) => handleFieldChange('brandColor', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 outline-none p-0 bg-transparent shrink-0"
                        />
                        <input 
                          type="text"
                          value={editingEvent.details.brandColor}
                          onChange={(e) => handleFieldChange('brandColor', e.target.value)}
                          className="w-20 col text-center ml-1 font-mono uppercase text-[10px] h-7 bg-input-bg border border-input-border text-input-text rounded outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Template Layout Selection tabs */}
                  <div className="flex flex-col gap-1.5 select-none">
                    <VisualTemplateSelector
                      selectedTemplate={editingEvent.activeTemplate}
                      onChange={(t) => setEditingEvent({
                        ...editingEvent,
                        activeTemplate: t
                      })}
                      brandColor={editingEvent.details?.brandColor}
                      label="Active Pass Template Style"
                    />
                  </div>

                  {/* Pass card Display Font Customize */}
                  <div>
                    <label className="block text-text-secondary mb-1.5 font-semibold flex items-center gap-1.5">
                      <Type size={13} className="text-[#6B5FFF]" />
                      <span>Pass Header Font</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {passFonts.map(fontName => (
                        <button
                          key={fontName}
                          type="button"
                          onClick={() => handleFieldChange('passFont', fontName)}
                          className={`py-2 px-2 border text-[11px] rounded-lg text-center cursor-pointer transition-all ${
                            editingEvent.details.passFont === fontName || (!editingEvent.details.passFont && fontName === 'Syne')
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

                  {/* Cover photo banner */}
                  <div>
                    <label className="block text-text-secondary mb-1.5 font-semibold">Cover Photo / Banner Image (Step 2 Upload)</label>
                    <div className="flex gap-3 items-center">
                      {editingEvent.details.bannerImage ? (
                        <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-bg-border shrink-0">
                          <img 
                            src={editingEvent.details.bannerImage} 
                            alt="Banner placeholder" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button; submit"
                            onClick={() => handleFieldChange('bannerImage', null)}
                            className="absolute top-1 right-1 p-1 bg-black/80 text-red-400 rounded-full hover:bg-black hover:text-red-300 pointer-events-auto"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-20 border border-dashed border-bg-border hover:border-[#6B5FFF] rounded-xl flex flex-col justify-center items-center text-text-secondary cursor-pointer"
                        >
                          <Upload size={16} />
                          <span className="text-[10px] mt-1.5">Click to upload banner (max 2MB)</span>
                          <input 
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action row footer */}
            <div className="mt-8 pt-4 border-t border-bg-border flex justify-end gap-2 text-xs">
              <button
                onClick={() => setEditingEvent(null)}
                className="border border-bg-border hover:bg-bg-surface text-text-secondary px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Discard Changes
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white font-semibold px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Save size={14} />
                <span>Update Schema</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
