import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Layers, Users, ShieldCheck, ChevronRight, ArrowRight } from 'lucide-react';
import { ViewType, EventDetails } from '../types';
import PassCard from './PassCard';
import VisualTemplateSelector from './VisualTemplateSelector';

interface LandingPageProps {
  setView: (view: ViewType) => void;
}

export default function LandingPage({ setView }: LandingPageProps) {
  // Demo State for the interactive showcase card
  const [activeTemplate, setActiveTemplate] = React.useState<'minimal' | 'bold' | 'elegant'>('bold');

  const demoEvent: EventDetails = {
    name: "DECIBELS MUSIC FESTIVAL 2026",
    date: "2026-07-18",
    time: "19:00",
    venue: "Grand Arena, London, UK",
    organizerName: "Aether Syndicate",
    brandColor: "#6B5FFF",
    bannerImage: null
  };

  const demoAttendee = {
    id: "PSG-2026-04289",
    name: "Alex Sterling",
    email: "alex@sterling.design",
    ticketType: "VIP PASS",
    status: "Unused" as const,
    createdAt: "2026-05-25"
  };

  return (
    <div className="w-full text-text-primary select-none">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:py-24 overflow-hidden">
        {/* Background glow meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6B5FFF]/15 rounded-full filter blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-[200px] h-[200px] bg-[#3DD68C]/5 rounded-full filter blur-[80px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center px-4">
          {/* Tag badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-card border border-bg-border text-xs font-mono font-bold text-[#6B5FFF] mb-6 shadow-sm"
          >
            <Sparkles size={12} />
            <span>INSTANT BRANDED TICKET GENERATOR</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight leading-[1.1] mb-6 text-text-primary"
          >
            Create Beautiful digital <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B5FFF] via-[#8F85FF] to-[#3DD68C]">
              Event Passes
            </span> in seconds.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Design tailored landscape passes with unique, secure QR codes. Import guests instantly via CSV, preview live customizations, and download print-ready image passes.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button
              onClick={() => setView('create')}
              className="bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white font-medium text-base px-8 py-4 rounded-xl shadow-lg shadow-[#6B5FFF]/20 active:scale-95 transition-all text-center flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Create Event Pass</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setView('dashboard')}
              className="border border-bg-border hover:bg-bg-surface text-text-secondary font-medium text-base px-8 py-4 rounded-xl transition-all cursor-pointer"
            >
              Go to Dashboard
            </button>
          </motion.div>
        </div>
      </section>

      {/* Ticket Showcase and Live Template Switcher */}
      <section className="py-12 bg-bg-card/40 border-y border-bg-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-2xl tracking-tight text-text-primary">
              Interactive Ticket Showcase
            </h2>
            <p className="text-sm text-text-secondary mt-1.5">
              Switch between our 3 gorgeous preset layouts configured dynamically in memory
            </p>
          </div>

          {/* Template Switcher Pills */}
          <div className="flex justify-center mb-10 select-none">
            <div className="w-fit mx-auto">
              <VisualTemplateSelector
                selectedTemplate={activeTemplate}
                onChange={setActiveTemplate}
                brandColor={demoEvent.brandColor}
                label=""
              />
            </div>
          </div>

          {/* Render the Pass Card with Scaler (For Mobile Responsiveness) */}
          <div className="flex justify-center items-center overflow-auto py-4 px-2 no-scrollbar">
            <div className="origin-center scale-[0.45] sm:scale-[0.85] md:scale-100 py-6 pr-0 md:py-0">
              <PassCard 
                eventDetails={demoEvent}
                attendee={demoAttendee}
                template={activeTemplate}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Columns Feature Highlights */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary">
            Engineered for Event Organizers
          </h2>
          <p className="text-text-secondary mt-2 max-w-lg mx-auto text-sm sm:text-base">
            Everything you need to issue, customize, and verify event tickets with zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-bg-card border border-bg-border p-8 rounded-2xl group shadow-card-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#6B5FFF]/10 flex items-center justify-center text-[#6B5FFF] mb-6">
              <Layers size={22} />
            </div>
            <h3 className="font-display font-bold text-lg text-text-primary mb-3">
              3 Distinct Templates
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Choose from **Minimal**, **Bold**, and **Elegant** templates. Each configures the layout personality immediately while obeying your brand accent selection.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-bg-card border border-bg-border p-8 rounded-2xl group shadow-card-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#6B5FFF]/10 flex items-center justify-center text-[#6B5FFF] mb-6">
              <Users size={22} />
            </div>
            <h3 className="font-display font-bold text-lg text-text-primary mb-3">
              CSV Bulk Passenger Upload
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Ditch slow manual work. Map spreadsheets in bulk using an interactive CSV parser to generate hundreds of individual attendee passes fully prefilled in milliseconds.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-bg-card border border-bg-border p-8 rounded-2xl group shadow-card-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#6B5FFF]/10 flex items-center justify-center text-[#3DD68C] mb-6">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-display font-bold text-lg text-text-primary mb-3">
              Sealed QR Verification
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Every pass carries a personalized, high-density secure QR code encoding Pass ID, name, event date, and tier for fast validation inside modern mobile scanner tools.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section className="py-16 md:py-20 bg-bg-card/20 border-t border-bg-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-extrabold text-3xl text-text-primary">
              How it Works
            </h2>
            <p className="text-sm text-text-secondary mt-2">
              Generate event items in 3 simple intuitive milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-x-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-bg-border pointer-events-none -z-10" />

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-bg-surface border border-bg-border text-xs font-bold font-mono text-[#6B5FFF] flex items-center justify-center mb-4">
                01
              </div>
              <h4 className="font-display font-bold text-base text-text-primary mb-2">
                Configure Design
              </h4>
              <p className="text-xs text-text-secondary max-w-xs">
                Fill out the event details, choose your signature brand color, and optionally upload a cover photo to accent layouts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-bg-surface border border-bg-border text-xs font-bold font-mono text-[#6B5FFF] flex items-center justify-center mb-4">
                02
              </div>
              <h4 className="font-display font-bold text-base text-text-primary mb-2">
                Load Attendee List
              </h4>
              <p className="text-xs text-text-secondary max-w-xs">
                Key guests in one-by-one or quickly drag-and-drop a CSV file containing hundreds of names to auto-provisions distinct Pass ID slugs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-bg-surface border border-bg-border text-xs font-bold font-mono text-[#3DD68C] flex items-center justify-center mb-4">
                03
              </div>
              <h4 className="font-display font-bold text-base text-text-primary mb-2">
                Download Pass PNG
              </h4>
              <p className="text-xs text-text-secondary max-w-xs">
                Select your favorite layout and download high-resolution 1600x880px ticket cards ready for distribution or print.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 text-center max-w-4xl mx-auto px-4">
        <div className="bg-bg-card border border-bg-border p-10 sm:p-14 rounded-3xl relative overflow-hidden shadow-card-shadow">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#6B5FFF]/5 rounded-full filter blur-xl" />
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary mb-4">
            Ready to issue stunning passes?
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-8">
            Create your first event schema and manage tickets instantly. All data is kept securely in your local browser sandbox.
          </p>
          <button
            onClick={() => setView('create')}
            className="inline-flex items-center gap-2 bg-[#6B5FFF] hover:bg-[#5A4EFF] text-white font-semibold text-sm px-7 py-3.5 rounded-xl cursor-pointer shadow-lg shadow-[#6B5FFF]/25 transition-transform active:scale-[0.98]"
          >
            <span>Launch Event Builder</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
