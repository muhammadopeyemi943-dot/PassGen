import React, { useState, useEffect } from 'react';
import PassCard from './PassCard';
import { EventDetails, Attendee, PassTemplate } from '../types';

interface PassPreviewContainerProps {
  eventDetails: EventDetails;
  attendee: Attendee | any;
  template: PassTemplate;
  containerId?: string;
  isModalContext?: boolean;
}

export default function PassPreviewContainer({
  eventDetails,
  attendee,
  template,
  containerId,
  isModalContext = false
}: PassPreviewContainerProps) {
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 380);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;

  if (isMobile) {
    // scale = (screenWidth - 32) / 380 (16px padding on each side)
    const scale = Math.min((screenWidth - 32) / 380, 1);
    const scaledHeight = 580 * scale;

    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: `${scaledHeight + 48}px`, // 24px top padding + 24px bottom padding
          padding: '24px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--bg-border)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative'
        }}
        className="shrink-0"
      >
        <div 
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            width: '380px',
            height: '580px',
            position: 'absolute',
            top: '24px',
          }}
          className="shrink-0"
        >
          <PassCard 
            containerId={containerId}
            eventDetails={eventDetails}
            attendee={attendee}
            template={template}
          />
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '16px',
        border: '1px solid var(--bg-border)',
        width: 'fit-content',
        height: 'fit-content',
      }}
      className="shrink-0"
    >
      <div style={{ width: '380px', height: '580px' }} className="shrink-0">
        <PassCard 
          containerId={containerId}
          eventDetails={eventDetails}
          attendee={attendee}
          template={template}
        />
      </div>
    </div>
  );
}
