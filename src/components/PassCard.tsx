import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { EventDetails, Attendee, PassTemplate } from '../types';

interface PassCardProps {
  key?: any;
  eventDetails: EventDetails;
  attendee: any;
  template: PassTemplate;
  containerId?: string;
  size?: 'preview' | 'full'; 
}

export default function PassCard({
  eventDetails,
  attendee,
  template,
  containerId,
  size = 'preview'
}: PassCardProps) {
  const brandColor = eventDetails.brandColor || '#6B5FFF';
  const eventName = eventDetails.name || 'Sample Event';
  const venue = eventDetails.venue || 'Event Venue Location';
  const dateStr = eventDetails.date || '2026-06-15';
  const timeStr = eventDetails.time || '18:00';
  
  const attendeeObj = attendee || { name: 'Your Name', id: 'PSG-2026-00000', ticketType: 'General', email: 'attendee@passgen.io' };
  const attName = attendeeObj.name || 'Your Name';
  const attId = attendeeObj.id || 'PSG-2026-00000';
  const ticketType = attendeeObj.ticketType || 'General';

  const scale = size === 'full' ? 2 : 1;
  const qSize = 140 * scale;
  const isMinimal = template === 'minimal';
  const displayFont = eventDetails.passFont || 'Syne';

  // Construct QR Payload
  const qrPayload = JSON.stringify({
    passId: attId,
    attendeeName: attName,
    eventName: eventName,
    ticketType: ticketType,
    eventDate: `${dateStr} ${timeStr}`
  }, null, 2);

  // Ticket Badge Colors Helper
  const getBadgeColors = (type: string) => {
    const cleanType = String(type).toUpperCase();
    if (cleanType.includes('VIP')) {
      return { bg: 'rgba(255, 181, 71, 0.15)', text: '#FFB547', border: 'rgba(255, 181, 71, 0.3)' };
    }
    if (cleanType.includes('SPEAKER')) {
      return { bg: 'rgba(107, 95, 255, 0.15)', text: '#6B5FFF', border: 'rgba(107, 95, 255, 0.3)' };
    }
    if (cleanType.includes('STAFF')) {
      return { bg: 'rgba(61, 214, 140, 0.15)', text: '#3DD68C', border: 'rgba(61, 214, 140, 0.3)' };
    }
    return { bg: 'rgba(136, 136, 168, 0.15)', text: '#8888A8', border: 'rgba(136, 136, 168, 0.3)' };
  };

  const badgeTheme = getBadgeColors(ticketType);

  const cardStyle = {
    '--event-brand': brandColor,
    '--event-brand-faded': `${brandColor}24`,
    fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    width: `${380 * scale}px`,
    height: `${580 * scale}px`,
  } as React.CSSProperties;

  return (
    <div
      id={containerId}
      style={cardStyle}
      className={`relative select-none overflow-hidden text-[#F0F0F8] rounded-2xl flex flex-col shrink-0 border border-neutral-800 ${
        template === 'elegant' 
          ? 'bg-[#0E0E15]' 
          : template === 'bold'
            ? 'bg-[#111118]'
            : 'bg-[#12121A]'
      }`}
    >
      {/* 1. TOP SECTION TREATMENT */}
      {template === 'minimal' && (
        <div 
          style={{ height: `${8 * scale}px`, backgroundColor: brandColor }} 
          className="w-full shrink-0"
        />
      )}

      {template === 'bold' && (
        <div 
          style={{ height: `${203 * scale}px`, backgroundColor: brandColor }} 
          className="w-full shrink-0 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-white/5 to-transparent pointer-events-none" />
        </div>
      )}

      {template === 'elegant' && (
        <div 
          style={{ 
            height: `${203 * scale}px`, 
            background: `linear-gradient(135deg, #18112C 0%, #08080C 100%)`
          }} 
          className="w-full shrink-0 relative overflow-hidden border-b border-[#ffffff]/10"
        >
          <div 
            className="absolute right-0 bottom-0 w-48 h-48 rounded-full filter blur-[40px] opacity-20 pointer-events-none"
            style={{ backgroundColor: brandColor }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-black/40 pointer-events-none" />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 pointer-events-none"
            style={{
              border: `1px solid ${brandColor}`,
              width: `${120 * scale}px`,
              height: `${120 * scale}px`,
              transform: 'translate(-50%, -50%) rotate(45deg)',
            }}
          />
        </div>
      )}

      {/* 2. BANNER IMAGE IF ANY */}
      {eventDetails.bannerImage && (
        <div 
          style={{ height: `${54 * scale}px` }} 
          className="w-full shrink-0 overflow-hidden relative border-b border-[#ffffff]/10"
        >
          <img 
            src={eventDetails.bannerImage} 
            alt="Event Banner" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* 3. VERTICAL TEXT CONTENT AND QR CODE */}
      <div 
        style={{
          paddingLeft: `${(isMinimal ? 24 : 16) * scale}px`,
          paddingRight: `${(isMinimal ? 24 : 16) * scale}px`,
          paddingTop: `${(isMinimal ? 20 : 12) * scale}px`,
          paddingBottom: `${(isMinimal ? 24 : 16) * scale}px`,
        }}
        className="flex-1 w-full flex flex-col justify-between items-center z-10 overflow-hidden"
      >
        {/* EVENT DETAILS BLOCK */}
        <div className="flex flex-col items-center text-center w-full select-text">
          <h1 
            style={{ 
              fontFamily: displayFont,
              fontSize: `${(isMinimal ? 20 : 16) * scale}px`,
              lineHeight: 1.2,
            }} 
            className="font-black tracking-tight text-[#FFFFFF] uppercase line-clamp-2 max-w-full"
          >
            {eventName}
          </h1>
          
          <div 
            style={{ fontSize: `${(isMinimal ? 11 : 9.5) * scale}px`, marginTop: `${4 * scale}px` }} 
            className="flex flex-col gap-0.5 text-[#8888A8]"
          >
            <span className="font-semibold">{dateStr} · {timeStr}</span>
            <span className="opacity-90">{venue}</span>
            <span style={{ fontSize: `${(isMinimal ? 10 : 8.5) * scale}px` }} className="opacity-60 italic mt-0.5">
              by {eventDetails.organizerName || 'Organizer'}
            </span>
          </div>
        </div>

        {/* THIN DIVIDER LINE 1 */}
        <div 
          style={{ height: `${1 * scale}px`, marginTop: `${8 * scale}px`, marginBottom: `${8 * scale}px` }}
          className="w-full bg-neutral-800 shrink-0" 
        />

        {/* ATTENDEE BLOCK */}
        <div className="flex flex-col items-center text-center w-full select-text">
          <h2 
            style={{ 
              fontFamily: displayFont,
              fontSize: `${(isMinimal ? 22 : 18) * scale}px`,
              lineHeight: 1.2,
            }} 
            className="font-extrabold tracking-tight text-[#FFFFFF] uppercase truncate max-w-full"
          >
            {attName}
          </h2>
          
          <div style={{ marginTop: `${6 * scale}px` }} className="flex justify-center shrink-0">
            <span 
              style={{
                backgroundColor: badgeTheme.bg,
                color: badgeTheme.text,
                borderColor: badgeTheme.border,
                borderWidth: `${1 * scale}px`,
                fontSize: `${10 * scale}px`,
                paddingLeft: `${10 * scale}px`,
                paddingRight: `${10 * scale}px`,
                paddingTop: `${2 * scale}px`,
                paddingBottom: `${2 * scale}px`,
              }}
              className="font-bold tracking-wider rounded-full uppercase"
            >
              {ticketType}
            </span>
          </div>
        </div>

        {/* THIN DIVIDER LINE 2 */}
        <div 
          style={{ height: `${1 * scale}px`, marginTop: `${8 * scale}px`, marginBottom: `${8 * scale}px` }}
          className="w-full bg-neutral-800 shrink-0" 
        />

        {/* QR CODE AND PASS ID */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div 
            style={{ 
              padding: `${8 * scale}px`,
              borderColor: template === 'elegant' ? `${brandColor}44` : template === 'bold' ? brandColor : '#262626',
              borderWidth: `${2 * scale}px`,
            }}
            className="bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden shrink-0"
          >
            <QRCodeSVG 
              value={qrPayload}
              size={qSize}
              level="M"
              fgColor="#000000"
              bgColor="#FFFFFF"
              includeMargin={false}
            />
          </div>
          
          <span 
            style={{ 
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: `${11 * scale}px` 
            }} 
            className="text-[#8888A8] tracking-widest uppercase font-semibold mt-1 shrink-0"
          >
            {attId}
          </span>
        </div>
      </div>
    </div>
  );
}
