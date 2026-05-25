import React from 'react';
import { PassTemplate } from '../types';

interface VisualTemplateSelectorProps {
  selectedTemplate: PassTemplate;
  onChange: (template: PassTemplate) => void;
  brandColor?: string;
  label?: string;
}

export default function VisualTemplateSelector({
  selectedTemplate,
  onChange,
  brandColor = '#6B5FFF',
  label = 'Select Pass Template'
}: VisualTemplateSelectorProps) {
  const templates: PassTemplate[] = ['minimal', 'bold', 'elegant'];

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && (
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-text-secondary select-none">
          {label}
        </span>
      )}
      
      <div className="flex flex-row gap-3 items-center justify-start select-none" style={{ gap: '12px' }}>
        {templates.map((template) => {
          const isSelected = selectedTemplate === template;
          return (
            <div
              key={template}
              onClick={() => onChange(template)}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              {/* Thumbnail card */}
              <div
                style={{
                  width: '100px',
                  height: '150px',
                  transition: 'all 150ms ease-in-out',
                  boxShadow: isSelected ? '0 0 0 4px rgba(107, 95, 255, 0.2)' : 'none',
                  borderColor: isSelected ? '#6B5FFF' : 'var(--bg-border)',
                  borderWidth: isSelected ? '2px' : '1px'
                }}
                className={`relative overflow-hidden rounded-xl bg-[var(--bg-card)] shrink-0 select-none flex flex-col items-center border
                  ${!isSelected ? 'hover:border-[#6B5FFF] hover:-translate-y-[2px]' : ''}
                `}
              >
                {/* 1. Minimal preset design card representation */}
                {template === 'minimal' && (
                  <div className="relative w-full h-full flex flex-col items-center p-1 bg-[var(--bg-card)]">
                    {/* Brand top tab bar */}
                    <div
                      style={{ height: '6px', backgroundColor: brandColor }}
                      className="w-full absolute top-0 left-0"
                    />
                    {/* Event name placeholder (dark, bold, 60% width centered) */}
                    <div className="w-3/5 h-[4px] bg-neutral-800 dark:bg-neutral-300 rounded mt-4" />
                    {/* Detail placeholders (40% width, secondary color) */}
                    <div className="w-2/5 h-[2.5px] bg-neutral-400 dark:bg-neutral-600 rounded mt-1.5" />
                    <div className="w-2/5 h-[2.5px] bg-neutral-400 dark:bg-neutral-600 rounded mt-1" />
                    {/* Thin horizontal divider */}
                    <div className="w-4/5 h-[1px] bg-neutral-200 dark:bg-neutral-800/40 my-2" />
                    {/* Attendee name (50% width, centered) */}
                    <div className="w-1/2 h-[4px] bg-neutral-800 dark:bg-neutral-400 rounded" />
                    {/* Ticket badge representation (small pill shape) */}
                    <div className="w-2/5 h-[10px] rounded-full border border-neutral-400/20 bg-neutral-300/20 dark:bg-neutral-700/20 mt-1.5 shrink-0" />
                    {/* QR code square (centered, 28x28px) */}
                    <div className="w-[28px] h-[28px] bg-white border border-[#DDDDE8] p-0.5 rounded mt-auto mb-1 flex items-center justify-center shrink-0">
                      <div className="w-full h-full bg-neutral-800 rounded-[1px]" />
                    </div>
                    {/* Pass ID representation (tiny line) */}
                    <div className="w-[30%] h-[2px] bg-neutral-400/50 rounded mb-1" />
                  </div>
                )}

                {/* 2. Bold preset design card representation */}
                {template === 'bold' && (
                  <div className="relative w-full h-full flex flex-col items-center p-1 bg-[var(--bg-card)]">
                    {/* Brand header background (top 35% of the card filled solid with brand color) */}
                    <div
                      style={{ height: '35%', backgroundColor: brandColor }}
                      className="w-full absolute top-0 left-0 flex flex-col items-center pt-2 px-1"
                    >
                      {/* Event name as a bold white line inside the colored section */}
                      <div className="w-3/5 h-[3px] bg-white rounded" />
                      {/* Date and venue as thinner white lines inside the colored section */}
                      <div className="w-2/5 h-[2px] bg-white/70 rounded mt-1" />
                      <div className="w-2/5 h-[2px] bg-white/70 rounded mt-1" />
                    </div>
                    
                    {/* Spacer for top colored header */}
                    <div className="h-[35%] shrink-0" />
                    
                    {/* Attendee name as a bold dark line centered in the bottom section */}
                    <div className="w-1/2 h-[4px] bg-neutral-800 dark:bg-neutral-300 rounded mt-3" />
                    {/* Ticket type badge pill */}
                    <div className="w-2/5 h-[10px] rounded-full bg-neutral-200 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-750 mt-1.5 shrink-0" />
                    
                    {/* QR code square centered */}
                    <div className="w-[28px] h-[28px] bg-white border border-[#DDDDE8] p-0.5 rounded mt-auto mb-1 flex items-center justify-center shrink-0">
                      <div className="w-full h-full bg-neutral-800 rounded-[1px]" />
                    </div>
                    {/* Pass ID line below QR */}
                    <div className="w-[30%] h-[2px] bg-neutral-400/50 rounded mb-1" />
                  </div>
                )}

                {/* 3. Elegant preset design card representation */}
                {template === 'elegant' && (
                  <div className="relative w-full h-full flex flex-col items-center p-1 bg-[#1A1A24] overflow-hidden">
                    {/* Subtle noise/grain texture overlay on the entire card */}
                    <div 
                      style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.20'/%3E%3C/svg%3E")`
                      }}
                      className="absolute inset-0 pointer-events-none opacity-50 mix-blend-overlay"
                    />
                    {/* Brand color used as a thin decorative left border (4px, full height) */}
                    <div
                      style={{ backgroundColor: brandColor }}
                      className="absolute left-0 top-0 w-[4px] h-full"
                    />
                    {/* Event name banner details in off-white */}
                    <div className="w-3/5 h-[4px] bg-neutral-100 rounded mt-4" />
                    {/* Date and venue lines in muted color */}
                    <div className="w-2/5 h-[2.5px] bg-neutral-400 rounded mt-1.5" />
                    <div className="w-2/5 h-[2.5px] bg-neutral-400 rounded mt-1" />
                    
                    {/* A decorative thin divider line with small diamond or dot in the center */}
                    <div className="w-4/5 flex items-center justify-between gap-0.5 my-2 shrink-0">
                      <div className="h-[0.5px] bg-neutral-700 flex-1" />
                      <div className="w-[3px] h-[3px] bg-neutral-400 rotate-45 shrink-0" />
                      <div className="h-[0.5px] bg-neutral-700 flex-1" />
                    </div>
                    
                    {/* Attendee name in off-white, slightly larger */}
                    <div className="w-1/2 h-[4px] bg-neutral-200 rounded" />
                    {/* Ticket badge pill */}
                    <div className="w-2/5 h-[10px] rounded-full border border-neutral-700 bg-neutral-800/40 mt-1.5 shrink-0" />
                    
                    {/* QR code square with a subtle brand color border */}
                    <div 
                      style={{ borderColor: brandColor }}
                      className="w-[28px] h-[28px] bg-white border border-solid p-0.5 rounded mt-auto mb-1 flex items-center justify-center shrink-0"
                    >
                      <div className="w-full h-full bg-neutral-800 rounded-[1px]" />
                    </div>
                    {/* Pass ID in lighter monospace style */}
                    <div className="w-[30%] h-[2px] bg-neutral-300/40 rounded mb-1" />
                  </div>
                )}
              </div>

              {/* Label below thumbnail */}
              <span
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '11px',
                  color: isSelected ? '#6B5FFF' : 'var(--text-secondary)',
                  fontWeight: isSelected ? '700' : 'normal'
                }}
                className="capitalize tracking-tight transition-colors line-clamp-1 text-center"
              >
                {template}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
