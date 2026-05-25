import React from 'react';
import { Home, PlusCircle, LayoutDashboard, X, Ticket, Users, Settings } from 'lucide-react';
import { ViewType, ThemeType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  theme: ThemeType;
  toggleTheme: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  handleCreateNewEvent?: () => void;
}

export default function Sidebar({
  currentView,
  setView,
  mobileOpen,
  setMobileOpen,
  handleCreateNewEvent
}: SidebarProps) {
  
  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard, desc: 'Statistics overview' },
    { id: 'events' as ViewType, label: 'Events', icon: Ticket, desc: 'Archive of schemas' },
    { id: 'attendees' as ViewType, label: 'Attendees', icon: Users, desc: 'Manage event list' },
    { id: 'settings' as ViewType, label: 'Settings', icon: Settings, desc: 'Preferences & parameters' },
  ];

  const handleNav = (view: ViewType) => {
    if (view === 'create' && handleCreateNewEvent) {
      handleCreateNewEvent();
    } else {
      setView(view);
    }
    setMobileOpen(false); // Close mobile sidebar on click
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar-bg border-r border-bg-border text-text-primary p-6 justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[#6B5FFF] flex items-center justify-center text-white shadow-lg shadow-[#6B5FFF]/20">
            <Ticket size={22} strokeWidth={2} />
          </div>
          <div>
            <span className="font-display font-black text-xl tracking-tight text-text-primary">
              PassGen
            </span>
            <div className="text-[10px] uppercase tracking-widest text-text-secondary">
              v1.0 MVP
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-widest text-text-placeholder px-3 mb-3">
            Menu Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-4 px-3.5 py-3 rounded-xl text-left cursor-pointer transition-all duration-150 group ${
                  isActive
                    ? 'bg-sidebar-active-bg text-sidebar-active-text font-bold shadow-sm'
                    : 'text-sidebar-text hover:text-text-primary hover:bg-bg-surface'
                }`}
                id={`sidebar-link-${item.id}`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  isActive ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-surface text-text-secondary border border-bg-border group-hover:text-text-primary group-hover:bg-bg-card'
                }`}>
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="font-medium text-sm leading-none">{item.label}</div>
                  <div className={`text-[10px] mt-0.5 ${isActive ? 'text-sidebar-active-text/75' : 'text-text-placeholder'}`}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="pt-6 border-t border-bg-border space-y-4">
        {/* Short Copyright Note */}
        <div className="px-2">
          <div className="text-[10px] text-text-placeholder font-mono leading-none">
            Securely persisted locally.
          </div>
          <div className="text-[9px] text-text-placeholder/80 mt-1">
            PassGen &copy; 2026 Sabi Labs.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Laptop & Desktop Sidebar Pane (Hidden on Tablet <1024px or mobile <768px) */}
      <aside className="hidden md:block w-72 h-screen shrink-0 sticky top-0 left-0 bg-sidebar-bg">
        <SidebarContent />
      </aside>

      {/* Mobile Backdrop & Slide-in Drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop wrapper */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Wrapper */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-sidebar-bg border-r border-bg-border transition-transform duration-300 transform translate-x-0">
            {/* Close button inside drawer */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-bg-card border border-bg-border text-text-secondary hover:text-text-primary"
              id="close-mobile-nav"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
