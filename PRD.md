# PRD — PassGen: Event QR Pass Generator
**Version:** 1.0 MVP  
**Author:** Sabi Designers — Stage 7  
**Last Updated:** May 2026

---

## 1. Overview

### Product Summary
PassGen is a lightweight web application that allows event organizers to create branded digital event passes with unique, scannable QR codes — in minutes, without design or technical skills.

### Problem Statement
Small and medium event organizers (meetups, weddings, workshops, conferences) lack a fast, affordable way to create professional-looking event passes. Existing tools are either too complex, expensive, or produce generic output that doesn't match their brand.

### Target Users
- **Primary:** Independent event organizers, community managers, wedding planners, workshop hosts
- **Secondary:** Corporate event teams running small internal events

### Success Metrics (MVP)
- User can create an event and generate a pass in under 3 minutes
- Pass downloads as a clean PNG without errors
- Works fully on mobile
- QR code is unique and scannable per attendee

---

## 2. User Flow

```
Landing Page
    ↓
Create Event (name, date, venue, branding)
    ↓
Add Attendees (name, email, ticket type)
    ↓
Real-time Pass Preview
    ↓
Download PNG / Share Pass
    ↓
Attendee Dashboard (view, edit, regenerate)
```

---

## 3. Core Features (MVP)

### 3.1 Event Creation
- **Inputs:** Event name, date & time, venue/location, organizer name, brand color (color picker), optional banner/cover image
- **Behavior:** Form saves event to local state; user proceeds to attendee step
- **Validation:** Required fields flagged inline; date must be future

### 3.2 Attendee Management
- Add individual attendees: name, email, ticket type (General / VIP / Speaker / Staff)
- Edit and delete attendees
- Each attendee auto-assigned a unique Pass ID (e.g. `PSG-2026-00123`)
- Bulk upload via CSV (columns: Name, Email, Ticket Type)

### 3.3 QR Code Generation
- Unique QR code generated per attendee
- QR encodes: `{ passId, attendeeName, eventName, ticketType, eventDate }`
- QR rendered using a JS library (e.g. `qrcode.react` or `qrcodejs`)

### 3.4 Pass Preview & Download
- Real-time pass card preview updates as form is filled
- 3 pass templates: **Minimal**, **Bold**, **Elegant**
- Pass displays: event name, date, venue, attendee name, ticket type, Pass ID, QR code, brand color accent
- Download as **PNG** (primary); PDF (stretch goal)

### 3.5 Pass Status
- Each attendee pass has a status: **Unused** (default) / **Used**
- Organizer can toggle status manually on the dashboard

### 3.6 Dark / Light Mode
- Toggle in top navigation
- Persisted via localStorage

---

## 4. Screens & Pages

| Screen | Description |
|---|---|
| **Landing / Home** | Hero, CTA to create event, feature highlights |
| **Create Event** | Multi-step form: Event Details → Attendees → Preview |
| **Attendee Dashboard** | List of all attendees, pass status, download/share per row |
| **Pass Preview Modal** | Full pass view with template switcher and download button |
| **Bulk Upload** | CSV upload UI with column mapping confirmation |

---

## 5. Stretch Features (Post-MVP)

- Email pass directly to attendee
- Share via link (unique URL per pass)
- QR scan verification page (scan → shows Used/Unused status)
- Authentication for multi-event management
- PDF export
- Multiple events dashboard

---

## 6. Technical Constraints

- **Frontend only** for MVP — no backend required
- State managed in React (useState / useContext or Zustand)
- QR generation: `qrcode.react` or equivalent
- Pass image export: `html2canvas` for PNG download
- CSV parsing: `papaparse`
- Hosting: Vercel / Netlify (auto-deploy from GitHub)
- **No user login required for MVP** — single session, local state

---

## 7. Non-Functional Requirements

- Mobile-first, fully responsive (320px → 1440px)
- Pass PNG export at minimum 1200px wide for print clarity
- Page load under 2 seconds
- Accessible: keyboard navigable, ARIA labels on interactive elements
- Works on Chrome, Safari, Firefox (latest versions)

---

## 8. Out of Scope (MVP)

- Backend / database persistence
- Payment / ticketing integration
- Multi-language support
- Native mobile app

---

## 9. Open Questions

- Should passes be landscape or portrait by default? *(Recommended: landscape for digital, portrait option for print)*
- Should bulk upload replace or append to existing attendees?
- What happens if organizer refreshes — show a "save session" warning?
