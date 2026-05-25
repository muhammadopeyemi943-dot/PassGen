import React from 'react';
import { 
  Users, Plus, Ticket, FileSpreadsheet, Eye, 
  Trash2, Compass, Clock, Award, Calendar, MapPin
} from 'lucide-react';
import { EventItem, ViewType } from '../types';

interface DashboardProps {
  events: EventItem[];
  setView: (view: ViewType) => void;
  setActiveEventId: (id: string) => void;
  handleCreateNewEvent: () => void;
}

export default function Dashboard({
  events,
  setView,
  setActiveEventId,
  handleCreateNewEvent,
}: DashboardProps) {

  // Calculate global aggregate statistics
  const totalEvents = events.length;
  const totalAttendees = events.reduce((sum, ev) => sum + ev.attendees.length, 0);
  
  // Calculate checked-in stats across all events
  const totalCheckedIn = events.reduce((sum, ev) => 
    sum + ev.attendees.filter(a => a.status === 'Used').length, 0
  );
  
  const overallCheckInRate = totalAttendees > 0 
    ? Math.round((totalCheckedIn / totalAttendees) * 100) 
    : 0;

  // List of the most recent events (limit to 3 or 5)
  const recentEvents = [...events]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 4);

  const handleViewEvent = (id: string) => {
    setActiveEventId(id);
    setView('event-details');
  };

  return (
    <div className="w-full text-text-primary">
      
      {/* 2. Page Header Layout with Custom Prominent "Create Event" Hero Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-bg-card border-b border-bg-border px-6 py-5 gap-4">
        <div>
          <h1 className="text-xl font-display font-black tracking-tight text-text-primary">
            Workspace Command Center
          </h1>
          <p className="text-xs text-text-secondary">
            Global metrics overview, dynamic pass statistics, and quick creation panels
          </p>
        </div>

        {/* Global Action buttons sitting beside each other nicely */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setView('events')}
            className="flex-1 sm:flex-initial py-2.5 px-4 bg-bg-surface hover:bg-bg-border border border-bg-border text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors text-text-primary whitespace-nowrap"
          >
            <Compass size={14} className="text-[#6B5FFF]" />
            <span>Manage All schemas({totalEvents})</span>
          </button>

          <button
            onClick={handleCreateNewEvent}
            className="flex-1 sm:flex-initial py-2.5 px-5 bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#6B5FFF]/15 transition-all text-center whitespace-nowrap"
          >
            <Plus size={14} />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* GLOBAL EXECUTIVE OVERVIEW SUMMARY METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1 - Total Events */}
          <div className="bg-bg-card border border-bg-border p-5 rounded-2xl shadow-card-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#6B5FFF]" />
            <div className="flex items-center justify-between text-text-secondary text-xs font-semibold mb-2">
              <span className="uppercase tracking-wider font-mono text-[10px]">Total Active Events</span>
              <Ticket size={16} className="text-[#6B5FFF]" />
            </div>
            <div className="text-4xl font-display font-black text-text-primary">
              {totalEvents}
            </div>
            <p className="text-[10px] text-text-placeholder mt-2 leading-tight">
              Branded visual layouts in system cache
            </p>
          </div>

          {/* Card 2 - Total Attendees */}
          <div className="bg-bg-card border border-bg-border p-5 rounded-2xl shadow-card-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3DD68C]" />
            <div className="flex items-center justify-between text-text-secondary text-xs font-semibold mb-2">
              <span className="uppercase tracking-wider font-mono text-[10px]">Total Issued Passes</span>
              <Users size={16} className="text-[#3DD68C]" />
            </div>
            <div className="text-4xl font-display font-black text-text-primary">
              {totalAttendees}
            </div>
            <p className="text-[10px] text-text-placeholder mt-2 leading-tight">
              Guest credentials globally active
            </p>
          </div>

          {/* Card 3 - Average Check-In stats */}
          <div className="bg-bg-card border border-bg-border p-5 rounded-2xl shadow-card-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FFB547]" />
            <div className="flex items-center justify-between text-text-secondary text-xs font-semibold mb-2">
              <span className="uppercase tracking-wider font-mono text-[10px]">Global Check-In Rate</span>
              <Users size={16} className="text-[#FFB547]" />
            </div>
            <div className="text-4xl font-display font-black text-text-primary">
              {overallCheckInRate}%
            </div>
            <p className="text-[10px] text-text-placeholder mt-2 leading-tight">
              {totalCheckedIn} out of {totalAttendees} verified check-ins
            </p>
          </div>

        </div>

        {/* RECENT EVENTS CARDS GRID PREVIEW */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-text-secondary">
              Recent Events
            </h2>
            <button
              onClick={() => setView('events')}
              className="text-xs text-[#6B5FFF] hover:underline font-semibold"
            >
              See All &rarr;
            </button>
          </div>

          {recentEvents.length === 0 ? (
            <div className="border border-dashed border-bg-border rounded-2xl p-12 text-center bg-bg-card/20">
              <Ticket className="w-12 h-12 text-text-placeholder mx-auto mb-4 stroke-1" />
              <h3 className="font-display font-semibold text-text-primary text-sm">No Events Registered</h3>
              <p className="text-xs text-text-secondary mt-1.5 max-w-xs mx-auto">
                Prepare a dynamic credentials layout by registering your first event pass schema.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentEvents.map((ev) => {
                const brandColor = ev.details.brandColor || '#6B5FFF';
                const totalPasses = ev.attendees.length;
                
                return (
                  <div
                    key={ev.id}
                    onClick={() => handleViewEvent(ev.id)}
                    className="group bg-bg-card hover:bg-bg-surface border border-bg-border hover:border-[#6B5FFF]/40 transition-all rounded-2xl p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden shadow-card-shadow"
                    style={{ borderLeft: `4px solid ${brandColor}` }}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-bg-surface text-text-secondary border border-bg-border uppercase">
                          {ev.activeTemplate} Pass Layout
                        </span>
                        
                        <div 
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: brandColor }}
                        />
                      </div>

                      <h3 className="font-display font-bold text-sm text-text-primary leading-tight group-hover:text-[#6B5FFF] transition-colors line-clamp-1">
                        {ev.details.name || "Untitled Event Draft"}
                      </h3>

                      <div className="mt-3 space-y-1.5 text-xs text-text-secondary">
                        <div className="flex items-center gap-2 text-[11px]">
                          <Calendar size={12} className="text-[#6B5FFF]" />
                          <span>
                            {ev.details.date ? new Date(ev.details.date).toLocaleDateString(undefined, {
                              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                            }) : 'Unscheduled Date'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <MapPin size={12} className="text-[#3DD68C]" />
                          <span className="truncate max-w-[280px]">{ev.details.venue || 'No Location specified'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-bg-border flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] bg-bg-surface border border-bg-border py-1 px-2.5 rounded-lg text-text-primary font-mono">
                        <Users size={11} className="text-[#6B5FFF]" />
                        <span className="font-bold">{totalPasses}</span>
                        <span className="opacity-70 text-[9px] lowercase">passes</span>
                      </div>

                      <span className="text-[11px] text-[#6B5FFF] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Console details</span>
                        <span>&rarr;</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* QUICK ACTION BUTTONS AND TIPS PANEL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          
          <div className="bg-bg-card border border-bg-border rounded-xl p-5 shadow-card-shadow md:col-span-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary mb-3">
              System Console Tips
            </h3>
            <div className="space-y-3.5 text-xs text-text-secondary leading-relaxed">
              <div className="flex gap-2.5">
                <span className="text-[#6B5FFF] font-mono font-bold">01.</span>
                <p>Register multiple events under different ticket tiers. Each event keeps its own unique brand scheme and font layout presets safely cached.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="text-[#3DD68C] font-mono font-bold">02.</span>
                <p>Ensure that credentials verification checking statuses are managed on-site using the status used/unused pills toggler.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="text-[#FFB547] font-mono font-bold">03.</span>
                <p>Download generated SVG-ready PNG visuals of selected guests. It supports offline testing and crisp resolution prints.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#6B5FFF]/5 border border-[#6B5FFF]/15 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-mono text-[#6B5FFF] font-bold uppercase tracking-widest">
                Quick Action Panel
              </span>
              <h4 className="font-display font-extrabold text-sm text-text-primary mt-1">
                Need a new pass schema?
              </h4>
              <p className="text-[11px] text-text-secondary mt-1.5 leading-normal">
                Quickly customize dynamic layout parameters, add custom ticket names, and export formatted spreadsheets instantly.
              </p>
            </div>
            
            <button
              onClick={handleCreateNewEvent}
              className="mt-5 w-full bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition-all duration-150"
            >
              <Plus size={13} />
              <span>Launch Event Creator</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
