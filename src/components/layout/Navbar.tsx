import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Layers, Award, BarChart2, Home, Sparkles, QrCode, Gamepad2 } from 'lucide-react';
import { ExpoQRModal } from '../common/ExpoQRModal';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Beginner', path: '/beginner', icon: Sparkles, badge: 'Trace' },
    { name: 'Intermediate', path: '/intermediate', icon: Layers, badge: 'Trace/Free' },
    { name: 'Advanced', path: '/advanced', icon: Award, badge: 'Free' },
    { name: 'Runner Game', path: '/game', icon: Gamepad2, badge: 'Play' },
    { name: 'Progress', path: '/progress', icon: BarChart2 },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <ExpoQRModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo / Brand */}
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-3 group text-decoration-none"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
                <span className="font-bold text-lg sm:text-xl font-serif">感</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
                  KanaSense
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 tracking-wider font-medium -mt-1">
                  かなセンス • 日本語学習
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-rose-50 text-rose-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`
                    }
                  >
                    <Icon size={16} className="opacity-70" />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-200/70 text-slate-600">
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}

              {/* Expo QR Code Share Trigger */}
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                title="Expo QR Code"
                className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 text-slate-700 hover:text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <QrCode size={15} className="text-rose-600" />
                <span className="hidden lg:inline">Expo QR</span>
              </button>
            </nav>

            {/* Mobile Actions: QR Code + Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Show Expo QR code"
                title="Expo QR Code"
              >
                <QrCode size={20} />
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 px-4 pt-2 pb-5 space-y-1 shadow-lg animate-in fade-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-rose-50 text-rose-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="opacity-75" />
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  </>
);
};
