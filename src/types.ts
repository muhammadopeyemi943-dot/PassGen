export type PassTemplate = 'minimal' | 'bold' | 'elegant';

export type TicketType = 'General' | 'VIP' | 'Speaker' | 'Staff' | string;

export interface EventDetails {
  name: string;
  date: string;
  time: string;
  venue: string;
  organizerName: string;
  brandColor: string;
  bannerImage: string | null; // Base64 or ObjectURL string
  passFont?: string; // custom font family
}

export interface Attendee {
  id: string; // e.g. PSG-2026-00001
  name: string;
  email: string;
  ticketType: TicketType;
  status: 'Unused' | 'Used';
  createdAt: string;
}

export interface EventItem {
  id: string;
  details: EventDetails;
  attendees: Attendee[];
  ticketTypes: TicketType[];
  activeTemplate: PassTemplate;
  createdAt: string;
}

export type ViewType = 'create' | 'dashboard' | 'attendees' | 'events' | 'settings' | 'event-details';
export type ThemeType = 'dark' | 'light';
