import React, { useState } from 'react';
import { Sparkles, Plus, LayoutGrid, HeartHandshake, Menu, X, ArrowRight } from 'lucide-react';
import { FacthLogo } from './FacthLogo';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onNewInvitation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onNewInvitation }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            id="nav-logo"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 cursor-pointer group hover:opacity-95 transition-opacity"
            title="Facth Printing - Beranda"
          >
            <FacthLogo size="sm" theme="light" className="h-10 sm:h-11" />
            <div className="flex flex-col border-l border-stone-300 pl-2.5 justify-center">
              <span className="font-serif-display text-xs font-bold tracking-wider text-amber-700 leading-tight">
                Visthetic
              </span>
              <span className="text-[10px] text-stone-500 font-medium tracking-tight">
                facth printing
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              id="nav-link-home"
              onClick={() => onNavigate('landing')}
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                currentView === 'landing'
                  ? 'text-amber-700 bg-amber-50 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Beranda
            </button>
            <button
              id="nav-link-templates"
              onClick={() => {
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-3.5 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            >
              Pilihan Template
            </button>
            <button
              id="nav-link-dashboard"
              onClick={() => onNavigate('dashboard')}
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'text-amber-700 bg-amber-50 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Kelola Undangan
            </button>
          </nav>

          {/* Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              id="nav-btn-create"
              onClick={onNewInvitation}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm shadow-md shadow-amber-600/25 transition-all duration-150 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Undangan Baru</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              id="nav-mobile-create"
              onClick={onNewInvitation}
              className="p-2 rounded-lg bg-amber-600 text-white text-xs font-medium flex items-center gap-1 px-3"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat</span>
            </button>
            <button
              id="nav-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <button
            onClick={() => {
              onNavigate('landing');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 font-medium text-sm"
          >
            Beranda
          </button>
          <button
            onClick={() => {
              onNavigate('landing');
              setIsMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 font-medium text-sm"
          >
            Pilihan Template
          </button>
          <button
            onClick={() => {
              onNavigate('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 font-medium text-sm flex items-center justify-between"
          >
            <span>Kelola Undangan</span>
            <ArrowRight className="w-4 h-4 text-stone-400" />
          </button>
          <div className="pt-2">
            <button
              onClick={() => {
                onNewInvitation();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 text-white font-medium text-sm shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Undangan Baru</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
