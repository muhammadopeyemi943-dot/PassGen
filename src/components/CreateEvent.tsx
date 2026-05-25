import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import { 
  Calendar, MapPin, User, Users, Trash2, Upload, 
  ArrowLeft, ArrowRight, CheckCircle2, Sliders, Palette, AlertCircle,
  FileSpreadsheet, Image as ImageIcon, Check, RefreshCw, Type, Plus
} from 'lucide-react';
import { EventDetails, Attendee, PassTemplate, TicketType, ViewType } from '../types';
import PassCard from './PassCard';
import PassPreviewContainer from './PassPreviewContainer';
import VisualTemplateSelector from './VisualTemplateSelector';

interface CreateEventProps {
  activeEventId: string;
  eventDetails: EventDetails;
  setEventDetails: React.Dispatch<React.SetStateAction<EventDetails>>;
  attendees: Attendee[];
  setAttendees: React.Dispatch<React.SetStateAction<Attendee[]>>;
  setView: (view: ViewType) => void;
  ticketTypes: TicketType[];
  setTicketTypes: React.Dispatch<React.SetStateAction<TicketType[]>>;
  activeTemplate: PassTemplate;
  setActiveTemplate: (template: PassTemplate) => void;
}

export default function CreateEvent({
  activeEventId,
  eventDetails,
  setEventDetails,
  attendees,
  setAttendees,
  setView,
  ticketTypes,
  setTicketTypes,
  activeTemplate,
  setActiveTemplate,
}: CreateEventProps) {
  // Navigation steps: 1 (Details), 2 (Branding)
  const [step, setStep] = useState<1 | 2>(1);
  const [newAttendee, setNewAttendee] = useState({ name: '', email: '', ticketType: 'General' });

  // Manage custom ticket type entry state
  const [newCustomType, setNewCustomType] = useState('');
  const [showTypeEditor, setShowTypeEditor] = useState(false);

  // Mobile split layout tab state (Step 1 only)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isMobile, setIsMobile] = useState(false);

  // Reference for file updates
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Download state feedback
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedPreviewAttendeeIndex, setSelectedPreviewAttendeeIndex] = useState(0);

  // CSV drag-over state
  const [isDraggingCsv, setIsDraggingCsv] = useState(false);
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);
  const [csvSuccessCount, setCsvSuccessCount] = useState<number | null>(null);

  // Detect Mobile Width changes for responsive tab implementation
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Standard color presets
  const colorPresets = [
    '#6B5FFF', // Electric Violet
    '#3DD68C', // Success Teal
    '#FFB547', // Warning Gold
    '#FF6B6B', // Warm Coral
    '#00D4FF', // Neon Blue
    '#D946EF', // Fuchsia
  ];

  // Helper sequential Pass ID generator
  const generateNewPassId = (list: Attendee[]) => {
    const sequenceNumber = list.length + 101; 
    return `PSG-2026-${String(sequenceNumber).padStart(5, '0')}`;
  };

  // 1. EVENT DETAIL CHANGES
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleColorPresetSelect = (color: string) => {
    setEventDetails(prev => ({ ...prev, brandColor: color }));
  };

  const handleImageUploadFiles = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be smaller than 2MB for browser local storage.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventDetails(prev => ({ ...prev, bannerImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop Uploaders
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
  };
  const handleImageDragLeave = () => {
    setIsDraggingImage(false);
  };
  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    handleImageUploadFiles(e.dataTransfer.files);
  };

  // Remove uploaded Banner image
  const handleRemoveBanner = () => {
    setEventDetails(prev => ({ ...prev, bannerImage: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 2. TICKET TYPES MANAGEMENT
  const handleAddCustomType = () => {
    const cleanType = newCustomType.trim();
    if (!cleanType) return;
    if (ticketTypes.includes(cleanType)) {
      setNewCustomType('');
      return;
    }
    setTicketTypes([...ticketTypes, cleanType]);
    setNewAttendee(prev => ({ ...prev, ticketType: cleanType }));
    setNewCustomType('');
  };

  const handleRemoveCustomType = (typeToRemove: string) => {
    if (ticketTypes.length <= 1) return; // Prevent removing last remaining type
    const updated = ticketTypes.filter(t => t !== typeToRemove);
    setTicketTypes(updated);
    
    // Fall back to first available type for the attendee input
    if (newAttendee.ticketType === typeToRemove) {
      setNewAttendee(prev => ({ ...prev, ticketType: updated[0] }));
    }
  };

  // 3. INDIVIDUAL ATTENDEE ADDITION
  const handleAddSingleAttendee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttendee.name.trim() || !newAttendee.email.trim()) return;

    const passId = generateNewPassId(attendees);
    const added: Attendee = {
      id: passId,
      name: newAttendee.name.trim(),
      email: newAttendee.email.trim(),
      ticketType: newAttendee.ticketType,
      status: 'Unused',
      createdAt: new Date().toISOString()
    };

    const nextAttendees = [...attendees, added];
    setAttendees(nextAttendees);
    setNewAttendee({ name: '', email: '', ticketType: newAttendee.ticketType }); // Keep type selection
    
    // Auto shift preview selector focus to the newly added attendee
    setSelectedPreviewAttendeeIndex(nextAttendees.length - 1);
  };

  const handleRemoveAttendee = (index: number) => {
    const updated = attendees.filter((_, i) => i !== index);
    setAttendees(updated);
    
    // Adjust selector boundaries
    if (selectedPreviewAttendeeIndex >= updated.length) {
      setSelectedPreviewAttendeeIndex(Math.max(0, updated.length - 1));
    }
  };

  // 4. CSV BULK IMPORT
  const handleCsvDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCsv(true);
  };

  const handleCsvDragLeave = () => {
    setIsDraggingCsv(false);
  };

  const handleCsvDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCsv(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseAndImportCsv(e.dataTransfer.files[0]);
    }
  };

  const handleCsvFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseAndImportCsv(e.target.files[0]);
    }
  };

  const parseAndImportCsv = (file: File) => {
    setCsvUploadError(null);
    setCsvSuccessCount(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        if (!rows || rows.length === 0) {
          setCsvUploadError("The uploaded CSV file appears empty.");
          return;
        }

        const validImported: Attendee[] = [];
        let index = attendees.length;

        rows.forEach((row) => {
          // Look for flexible headings in CSV records
          const rawName = row.name || row.Name || row['Full Name'] || row['fullname'] || Object.values(row)[0];
          const rawEmail = row.email || row.Email || row['Email Address'] || row['emailaddress'] || Object.values(row)[1];
          const rawTicketType = row.ticketType || row.TicketType || row['Ticket Type'] || row.type || row.Type || Object.values(row)[2];

          const nameVal = String(rawName || '').trim();
          const emailVal = String(rawEmail || '').trim();
          let ticketTypeVal = String(rawTicketType || '').trim();

          if (nameVal && emailVal) {
            if (!ticketTypeVal) {
              ticketTypeVal = 'General';
            }
            
            // Auto add custom ticket types to presets if discovered
            if (ticketTypeVal && !ticketTypes.includes(ticketTypeVal)) {
              setTicketTypes(prev => [...prev, ticketTypeVal]);
            }

            const seq = index + 101;
            const passId = `PSG-2026-${String(seq).padStart(5, '0')}`;
            
            validImported.push({
              id: passId,
              name: nameVal,
              email: emailVal,
              ticketType: ticketTypeVal,
              status: 'Unused',
              createdAt: new Date().toISOString()
            });

            index++;
          }
        });

        if (validImported.length === 0) {
          setCsvUploadError("Could not parse any credentials. Check that CSV has 'name' and 'email' headings.");
          return;
        }

        setAttendees(prev => [...prev, ...validImported]);
        setCsvSuccessCount(validImported.length);

        // Auto move to the newer guest for preview
        setSelectedPreviewAttendeeIndex(attendees.length + validImported.length - 1);
      },
      error: (err) => {
        setCsvUploadError(`Failed parsing CSV: ${err.message}`);
      }
    });
  };

  // 5. DOWNLOAD PASS TO LOCAL PNG
  const handleDownloadSinglePass = async (attendeeToDownload: Attendee, index: number) => {
    const cardId = `pass-card-downloadable-${attendeeToDownload.id}`;
    setDownloadingId(attendeeToDownload.id);

    // Give react time to render correctly
    const waitPromise = new Promise(resolve => setTimeout(resolve, 350));
    await waitPromise;

    const element = document.getElementById(cardId);
    if (!element) {
      alert("Error: Rendering area could not be located in document elements.");
      setDownloadingId(null);
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

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${attendeeToDownload.name.replace(/\s+/g, '_')}_Pass_${attendeeToDownload.id}.png`;
      link.click();
    } catch (err) {
      console.error("html2canvas export failed: ", err);
      alert("Sorry, we encountered a canvas failure while exporting your ticket high-res assets.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Interactive local demo view
  const currentPreviewAttendee = attendees[selectedPreviewAttendeeIndex] || {
    id: 'PSG-2026-00101',
    name: newAttendee.name || 'Alex Mercer',
    email: newAttendee.email || 'alex@mercer.dev',
    ticketType: newAttendee.ticketType || 'VIP'
  };

  // Wipe event form and state
  const handleClearSession = () => {
    if (confirm("Are you sure you want to delete current event specifications, layouts, and guest list? All locally persisted state will be lost.")) {
      setEventDetails({
        name: '',
        date: '',
        time: '',
        venue: '',
        organizerName: '',
        brandColor: '#6B5FFF',
        bannerImage: null
      });
      setAttendees([]);
      setStep(1);
    }
  };

  return (
    <div className="w-full text-text-primary">
      
      {/* Upper Progress Indicators Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-bg-card border-b border-bg-border px-6 py-5 gap-4">
        <div>
          <h1 className="text-xl font-display font-black tracking-tight text-text-primary">
            Event Pass Configurator
          </h1>
          <p className="text-xs text-text-secondary">
            Configure fields, design layouts, and bundle bulk exports
          </p>
        </div>

        {/* Step indicator pills */}
        <div className="flex items-center gap-1.5 md:gap-3">
          {[
            { tag: 1, name: 'Event Details' },
            { tag: 2, name: 'Pass Branding' }
          ].map((s) => (
            <React.Fragment key={s.tag}>
              <button
                onClick={() => {
                  if (s.tag > 1 && !eventDetails.name.trim()) {
                    alert('Please specify an Event Name before changing steps!');
                    return;
                  }
                  setStep(s.tag as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer ${
                  step === s.tag
                    ? 'bg-step-active-bg text-step-active-text font-bold shadow-md shadow-[#6B5FFF]/15'
                    : 'bg-step-inactive-bg text-step-inactive-text'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-black/20 text-center flex items-center justify-center text-[10px] font-bold">
                  {s.tag}
                </span>
                <span className="hidden sm:inline">{s.name}</span>
              </button>
              {s.tag < 2 && <div className="text-text-placeholder text-xs">&rarr;</div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Split Layout container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: CUSTOMIZER FORM PANEL */}
          <div className="lg:col-span-6 xl:col-span-7 bg-bg-card border border-bg-border rounded-2xl p-6 relative shadow-card-shadow">
            
            {/* Step 1: Event Fields Customizer */}
            {step === 1 && (
              <div>
                {/* Mobile Tab Switcher */}
                {isMobile && (
                  <div className="flex justify-between border-b border-bg-border pb-4 mb-6">
                    {(['edit', 'preview'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setMobileTab(tab)}
                        className={`flex-1 text-center py-2.5 text-sm font-bold font-display cursor-pointer relative transition-all capitalize ${
                          mobileTab === tab 
                            ? 'text-tab-active-text font-bold' 
                            : 'text-tab-inactive-text'
                        }`}
                      >
                        {tab} Details
                        {mobileTab === tab && (
                          <motion.div 
                            layoutId="activeMobileTabIndicator" 
                            className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-tab-active-border" 
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Show Form area */}
                {(!isMobile || mobileTab === 'edit') && (
                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-display font-extrabold text-text-primary flex items-center gap-2 animate-fade-in">
                        <Palette size={18} className="text-[#6B5FFF]" />
                        Event Details Configuration
                      </h2>
                      <button 
                        type="button" 
                        onClick={handleClearSession}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors font-mono hover:underline bg-red-500/10 py-1 px-2.5 rounded border border-red-500/10"
                      >
                        Reset Form
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      {/* Event Name */}
                      <div className="flex flex-col">
                        <label htmlFor="ev-name" className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary mb-1.5 animate-fade-in">
                          Event Name *
                        </label>
                        <input
                          id="ev-name"
                          type="text"
                          name="name"
                          value={eventDetails.name}
                          onChange={handleEventChange}
                          placeholder="e.g. Decibels Indie Summit"
                          className="px-4 py-2 bg-input-bg text-input-text border border-input-border rounded-xl h-11 w-full placeholder-text-placeholder focus:border-accent-primary focus:outline-none"
                          required
                        />
                      </div>

                      {/* Organizer Name */}
                      <div className="flex flex-col">
                        <label htmlFor="ev-organizer" className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                          Organizer / Host Name *
                        </label>
                        <input
                          id="ev-organizer"
                          type="text"
                          name="organizerName"
                          value={eventDetails.organizerName}
                          onChange={handleEventChange}
                          placeholder="e.g. Syndicate Records"
                          className="px-4 py-2 bg-input-bg text-input-text border border-input-border rounded-xl h-11 w-full placeholder-text-placeholder focus:border-accent-primary focus:outline-none"
                          required
                        />
                      </div>

                      {/* Date and Time split */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label htmlFor="ev-date" className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                            Event Date *
                          </label>
                          <input
                            id="ev-date"
                            type="date"
                            name="date"
                            value={eventDetails.date}
                            onChange={handleEventChange}
                            className="px-4 py-2 bg-input-bg text-input-text border border-input-border rounded-xl h-11 w-full focus:border-accent-primary focus:outline-none"
                            required
                          />
                        </div>

                        <div className="flex flex-col">
                          <label htmlFor="ev-time" className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                            Start Time *
                          </label>
                          <input
                            id="ev-time"
                            type="time"
                            name="time"
                            value={eventDetails.time}
                            onChange={handleEventChange}
                            className="px-4 py-2 bg-input-bg text-input-text border border-input-border rounded-xl h-11 w-full focus:border-accent-primary focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* Venue location */}
                      <div className="flex flex-col">
                        <label htmlFor="ev-venue" className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                          Venue Location *
                        </label>
                        <input
                          id="ev-venue"
                          type="text"
                          name="venue"
                          value={eventDetails.venue}
                          onChange={handleEventChange}
                          placeholder="e.g. Grand Town Hall, London"
                          className="px-4 py-2 bg-input-bg text-input-text border border-input-border rounded-xl h-11 w-full placeholder-text-placeholder focus:border-accent-primary focus:outline-none"
                          required
                        />
                      </div>

                      {/* Banner cover photo upload */}
                      <div className="flex flex-col">
                        <label className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                          Optional Banner Image (Max 2MB)
                        </label>
                        <div
                          onDragOver={handleImageDragOver}
                          onDragLeave={handleImageDragLeave}
                          onDrop={handleImageDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed border-bg-border rounded-xl p-5 text-center cursor-pointer hover:border-[#6B5FFF] transition-colors ${
                            isDraggingImage ? 'border-accent-primary bg-accent-primary/5' : 'bg-input-bg'
                          }`}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUploadFiles(e.target.files)}
                          />

                          {eventDetails.bannerImage ? (
                            <div className="flex items-center justify-between bg-bg-surface border border-bg-border p-3.5 rounded-xl pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-3">
                                <img 
                                  src={eventDetails.bannerImage} 
                                  alt="Preview Thumb" 
                                  className="w-12 h-8 rounded object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="text-left">
                                  <div className="text-xs text-text-primary font-semibold truncate max-w-[180px]">
                                    Uploaded Banner
                                  </div>
                                  <div className="text-[10px] text-text-secondary">
                                    Base64 encoded string
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={handleRemoveBanner}
                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-text-placeholder">
                              <ImageIcon size={28} className="text-text-placeholder opacity-70" />
                              <div className="text-xs text-text-secondary">
                                <span className="font-bold text-[#6B5FFF]">Click to upload</span> or drag banner file here
                              </div>
                              <div className="text-[10px]" style={{ color: 'var(--text-placeholder)' }}>
                                Format support: JPEG, PNG, WEBP
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submit Footer */}
                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={!eventDetails.name.trim()}
                        className="bg-[#6B5FFF] hover:bg-[#5A4EFF] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm h-11 px-6 rounded-xl shadow shadow-[#6B5FFF]/20 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <span>Save & Continue</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </form>
                )}

                {/* Mobile Preview Sandbox */}
                {isMobile && mobileTab === 'preview' && (
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="text-sm text-text-secondary mb-4 text-center">
                      Live event pass rendering based on form details:
                    </div>
                    <div className="w-full">
                      <PassPreviewContainer
                        eventDetails={eventDetails}
                        attendee={currentPreviewAttendee as Attendee}
                        template={activeTemplate}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Branding and templates selection & Accent Color / Font Customization */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-display font-extrabold text-text-primary">
                    Pass Branding & Template Selector
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Fine tune styling coordinates, select themes, and customize pass typography
                  </p>
                </div>

                {/* Layout Template Switcher Tabs */}
                <div className="flex flex-col bg-bg-surface p-4 border border-bg-border rounded-xl gap-3">
                  <VisualTemplateSelector
                    selectedTemplate={activeTemplate}
                    onChange={setActiveTemplate}
                    brandColor={eventDetails.brandColor}
                    label="Select Visual Preset Template"
                  />
                </div>

                {/* Brand Accent Color selector */}
                <div className="flex flex-col bg-bg-surface p-4 border border-bg-border rounded-xl">
                  <label className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
                    Brand Accent Color
                  </label>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorPresetSelect(color)}
                        className="w-8 h-8 rounded-lg cursor-pointer transition-transform duration-100 hover:scale-110 flex items-center justify-center relative shadow"
                        style={{ backgroundColor: color }}
                      >
                        {eventDetails.brandColor === color && (
                          <Check size={14} className="text-white drop-shadow font-bold" />
                        )}
                      </button>
                    ))}
                    
                    {/* Color Input Picker */}
                    <div className="h-8 w-px bg-bg-border" />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        name="brandColor"
                        value={eventDetails.brandColor}
                        onChange={handleEventChange}
                        className="w-10 h-8 rounded-lg outline-none bg-transparent cursor-pointer border-0"
                        title="Custom HEX Color Picker"
                      />
                      <span className="text-xs font-mono text-text-secondary">
                        {eventDetails.brandColor.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pass Font Selector */}
                <div className="flex flex-col bg-bg-surface p-4 border border-bg-border rounded-xl gap-3">
                  <label htmlFor="pass-font-selector" className="text-xs font-mono font-bold uppercase tracking-widest text-text-secondary">
                    Select Pass Display Font
                  </label>
                  <select
                    id="pass-font-selector"
                    name="passFont"
                    value={eventDetails.passFont || 'Syne'}
                    onChange={handleEventChange}
                    className="px-4 py-2 bg-input-bg border border-input-border text-xs text-input-text rounded-lg h-10 w-full font-semibold outline-none cursor-pointer"
                  >
                    {['Syne', 'Playfair Display', 'Bebas Neue', 'Raleway', 'Montserrat', 'DM Sans'].map((f) => (
                      <option key={f} value={f} style={{ fontFamily: f }}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Attendee dropdown preview focus selector */}
                <div className="flex flex-col bg-bg-surface p-4 border border-bg-border rounded-xl gap-2.5">
                  <label htmlFor="preview-guest-selector" className="text-xs font-mono font-bold uppercase tracking-widest text-text-secondary">
                    Focus Attendee Card Preview Selection:
                  </label>
                  <select
                    id="preview-guest-selector"
                    value={selectedPreviewAttendeeIndex}
                    onChange={(e) => setSelectedPreviewAttendeeIndex(Number(e.target.value))}
                    className="px-4 py-2 bg-input-bg border border-input-border text-xs text-input-text rounded-lg h-10 w-full font-semibold outline-none cursor-pointer"
                  >
                    {attendees.map((a, i) => (
                      <option key={i} value={i}>
                        {a.name} ({a.ticketType}) - {a.id}
                      </option>
                    ))}
                    {attendees.length === 0 && (
                      <option value={0}>
                        Alex Mercer (VIP) - PSG-2026-00101 (Demo Mock)
                      </option>
                    )}
                  </select>
                </div>

                {/* Core single attendee download CTA if they have attendees */}
                {attendees.length > 0 && (
                  <div className="bg-bg-surface/60 border border-bg-border p-5 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-text-secondary mb-4 max-w-sm">
                      Review specifications in the sticky live frame. Downloader compiles passes at <b>1600x880px</b> resolution format for crispy printing!
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => handleDownloadSinglePass(currentPreviewAttendee as Attendee, selectedPreviewAttendeeIndex)}
                      className="w-full sm:w-auto bg-[#3DD68C] hover:bg-[#2fc17c] text-neutral-950 font-bold text-sm h-12 px-8 rounded-xl shadow shadow-[#3DD68C]/15 flex items-center justify-center gap-2 cursor-pointer transition-transform duration-100 active:scale-95"
                    >
                      {downloadingId === currentPreviewAttendee.id ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Rendering Canvas...</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} strokeWidth={2.5} />
                          <span>Download single Pass PNG</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Navigation panel */}
                <div className="pt-6 border-t border-bg-border flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="border border-bg-border hover:bg-bg-surface text-text-secondary text-xs font-semibold h-11 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Event Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeEventId) {
                        window.history.pushState(null, '', `/events/${activeEventId}`);
                      }
                      setView('event-details');
                    }}
                    className="bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white text-xs font-semibold h-11 px-6 rounded-xl shadow-md shadow-[#6B5FFF]/15 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Save & Continue</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: LIVE PREVIEW STICKY PANE (Desktop Split-Screen) */}
          {(!isMobile || mobileTab === 'preview' || step !== 1) && (
            <div style={{ width: isMobile ? '100%' : 'fit-content' }} className="lg:col-span-6 xl:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
              <div className="flex justify-between items-center px-2">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8888A8] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#6B5FFF]" />
                    Real-time Pass Card Preview
                  </h3>
                  <p className="text-[10px] text-text-secondary">
                    Selected preset: <span className="font-bold text-[#6B5FFF] uppercase">{activeTemplate}</span>
                  </p>
                </div>

                <span className="text-[10px] bg-bg-surface border border-bg-border text-text-secondary py-1 px-2 rounded font-mono">
                  380x580px
                </span>
              </div>

              {/* Pass Card scaling sandbox container */}
              <PassPreviewContainer
                containerId="live-interactive-pass-preview"
                eventDetails={eventDetails}
                attendee={currentPreviewAttendee as Attendee}
                template={activeTemplate}
              />

              {/* Off-screen downloadable elements at high resolution scale */}
              <div className="absolute left-[-10000px] top-[-10000px]">
                {attendees.map((attendeeToRender) => (
                  <PassCard
                    key={`render-key-${attendeeToRender.id}`}
                    containerId={`pass-card-downloadable-${attendeeToRender.id}`}
                    eventDetails={eventDetails}
                    attendee={attendeeToRender}
                    template={activeTemplate}
                    size="full"
                  />
                ))}
              </div>

              {/* Attendee Info Meta Indicators */}
              <div className="bg-bg-card border border-bg-border rounded-xl p-4 flex flex-col gap-2.5 shadow-card-shadow">
                <div className="text-[10px] font-mono uppercase tracking-widest text-text-placeholder">
                  Focus Attendee Meta Check
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center text-[#6B5FFF]">
                    <User size={14} />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-text-primary">{currentPreviewAttendee.name}</div>
                    <div className="text-text-secondary font-mono text-[10px]">{currentPreviewAttendee.id}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
