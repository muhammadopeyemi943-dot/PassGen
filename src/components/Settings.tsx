import React from 'react';
import { Settings as SettingsIcon, Sliders, Shield, Bell, Key } from 'lucide-react';

export default function Settings() {
  return (
    <div className="w-full text-text-primary">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-bg-card border-b border-bg-border px-6 py-5 gap-4">
        <div>
          <h1 className="text-xl font-display font-black tracking-tight text-text-primary">
            Settings
          </h1>
          <p className="text-xs text-text-secondary">
            Customize layout presets, security policies, and workspace connections
          </p>
        </div>
      </div>

      {/* Main body with styled panels matching rest of app */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-bg-card border border-bg-border rounded-2xl p-8 shadow-card-shadow text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6B5FFF] to-[#3DD68C]" />
          
          <div className="w-14 h-14 bg-[#6B5FFF]/10 text-[#6B5FFF] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#6B5FFF]/15">
            <SettingsIcon size={24} className="animate-spin" style={{ animationDuration: '8s' }} />
          </div>

          <h2 className="text-lg font-display font-bold text-text-primary mb-2">
            Settings and preferences coming soon
          </h2>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            We are configuring secure Cloud DB integrations, theme modifiers, and SVG output configurations. Stay tuned for version 1.1!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 text-left text-xs max-w-md mx-auto">
            <div className="p-3.5 bg-bg-surface border border-bg-border rounded-xl flex items-center gap-3">
              <Sliders size={16} className="text-[#6B5FFF]" />
              <div className="font-mono text-[10px] text-text-secondary">Template Presets</div>
            </div>
            <div className="p-3.5 bg-bg-surface border border-bg-border rounded-xl flex items-center gap-3">
              <Shield size={16} className="text-[#3DD68C]" />
              <div className="font-mono text-[10px] text-text-secondary">Security & Auditing</div>
            </div>
            <div className="p-3.5 bg-bg-surface border border-bg-border rounded-xl flex items-center gap-3">
              <Bell size={16} className="text-[#FFB547]" />
              <div className="font-mono text-[10px] text-text-secondary">Notification Hooks</div>
            </div>
            <div className="p-3.5 bg-bg-surface border border-bg-border rounded-xl flex items-center gap-3">
              <Key size={16} className="text-indigo-400" />
              <div className="font-mono text-[10px] text-text-secondary">Encrypted Tokens</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
