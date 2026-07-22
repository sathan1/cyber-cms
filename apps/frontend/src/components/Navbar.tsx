'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, LogOut, LogIn, UserPlus, Sparkles, AlertCircle, Menu, X, FileText } from 'lucide-react';
import { User } from '@/types';
import { removeAuthToken, fetchApi, setAuthToken } from '@/lib/api';

interface NavbarProps {
  user?: User | null;
  onUserChange?: (user: User | null) => void;
  onOpenAuth?: (mode: 'login' | 'register' | 'otp') => void;
  onOpenOnboarding?: () => void;
}

export default function Navbar({ user, onUserChange, onOpenAuth, onOpenOnboarding }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    if (onUserChange) onUserChange(null);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const handleDemoSwitch = async (email: string) => {
    try {
      const res = await fetchApi('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: 'password123' }),
      });
      setAuthToken(res.token);
      if (onUserChange) onUserChange(res.user);
      setMobileMenuOpen(false);

      // Navigate to corresponding dashboard
      if (res.user.role === 'STUDENT') router.push('/dashboard/student');
      else if (res.user.role === 'STAFF') router.push('/dashboard/mentor');
      else if (res.user.role === 'ADMIN') router.push('/dashboard/admin');
      else if (res.user.role === 'PAID_USER') router.push('/dashboard/paid');
    } catch (err: any) {
      alert(err.message || 'Demo login failed');
    }
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-wide">CyberCMS</span>
              <span className="text-xs block text-indigo-400 font-medium">Academic Platform</span>
            </div>
          </Link>

          {/* Desktop Nav items */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-indigo-400' : 'text-gray-300 hover:text-white'}`}>
              Course Catalog
            </Link>

            {user?.role === 'STUDENT' && (
              <Link href="/dashboard/student" className={`text-sm font-medium transition-colors ${pathname.includes('/student') ? 'text-indigo-400' : 'text-gray-300 hover:text-white'}`}>
                Student Portal
              </Link>
            )}

            {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
              <>
                <Link href="/dashboard/mentor" className={`text-sm font-medium transition-colors ${pathname.includes('/mentor') ? 'text-indigo-400' : 'text-gray-300 hover:text-white'}`}>
                  Mentor Portal
                </Link>
                <Link href="/dashboard/staff/cms" className={`text-sm font-medium transition-colors ${pathname.includes('/cms') ? 'text-indigo-400' : 'text-gray-300 hover:text-white'}`}>
                  CMS Portal
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <Link href="/dashboard/admin" className={`text-sm font-medium transition-colors ${pathname.includes('/admin') ? 'text-indigo-400' : 'text-gray-300 hover:text-white'}`}>
                Admin Console
              </Link>
            )}

            {user?.role === 'PAID_USER' && (
              <Link href="/dashboard/paid" className={`text-sm font-medium transition-colors ${pathname.includes('/paid') ? 'text-indigo-400' : 'text-gray-300 hover:text-white'}`}>
                My Courses
              </Link>
            )}
          </nav>

          {/* Quick Demo Role Switcher (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 glass-card px-2 py-1 rounded-lg text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1" />
            <span className="text-gray-400 mr-1">Demo As:</span>
            <button onClick={() => handleDemoSwitch('student@institution.edu')} className="px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300 hover:bg-indigo-800/60 font-medium transition-colors">
              Student
            </button>
            <button onClick={() => handleDemoSwitch('prof.smith@institution.edu')} className="px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 hover:bg-purple-800/60 font-medium transition-colors">
              Staff
            </button>
            <button onClick={() => handleDemoSwitch('admin@institution.edu')} className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-300 hover:bg-rose-800/60 font-medium transition-colors">
              Admin
            </button>
            <button onClick={() => handleDemoSwitch('charlie@gmail.com')} className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/60 font-medium transition-colors">
              Paid User
            </button>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'STUDENT' && !user.roll_number && (
                  <button
                    onClick={onOpenOnboarding}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition-all animate-pulse"
                  >
                    <AlertCircle className="w-4 h-4" /> Complete Onboarding
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-semibold text-white block leading-none">{user.name}</span>
                    <span className="text-[10px] text-gray-400 capitalize">{user.role.replace('_', ' ')}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors hidden sm:block"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth && onOpenAuth('login')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </button>
                <button
                  onClick={() => onOpenAuth && onOpenAuth('register')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg btn-primary text-white text-xs font-semibold"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white rounded-lg md:hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800 space-y-4 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-2 text-sm">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${pathname === '/' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                Course Catalog
              </Link>

              {user?.role === 'STUDENT' && (
                <Link
                  href="/dashboard/student"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${pathname.includes('/student') ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  Student Portal
                </Link>
              )}

              {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
                <>
                  <Link
                    href="/dashboard/mentor"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${pathname.includes('/mentor') ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Mentor Portal
                  </Link>
                  <Link
                    href="/dashboard/staff/cms"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${pathname.includes('/cms') ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Staff CMS Portal
                  </Link>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${pathname.includes('/admin') ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  Admin Console
                </Link>
              )}

              {user?.role === 'PAID_USER' && (
                <Link
                  href="/dashboard/paid"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${pathname.includes('/paid') ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  My Courses
                </Link>
              )}
            </nav>

            {/* Demo Switcher for Mobile */}
            <div className="pt-2 border-t border-gray-800/80">
              <span className="text-[11px] text-gray-400 font-semibold px-3 block mb-2">Switch Demo Account:</span>
              <div className="grid grid-cols-2 gap-2 px-1 text-xs">
                <button onClick={() => handleDemoSwitch('student@institution.edu')} className="p-2 rounded bg-indigo-900/40 text-indigo-300 font-medium">
                  Student
                </button>
                <button onClick={() => handleDemoSwitch('prof.smith@institution.edu')} className="p-2 rounded bg-purple-900/40 text-purple-300 font-medium">
                  Staff / Mentor
                </button>
                <button onClick={() => handleDemoSwitch('admin@institution.edu')} className="p-2 rounded bg-rose-900/40 text-rose-300 font-medium">
                  Admin
                </button>
                <button onClick={() => handleDemoSwitch('charlie@gmail.com')} className="p-2 rounded bg-emerald-900/40 text-emerald-300 font-medium">
                  Paid User
                </button>
              </div>
            </div>

            {/* Mobile Auth Actions */}
            <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between px-3">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-rose-400 text-xs font-semibold py-2"
                >
                  <LogOut className="w-4 h-4" /> Logout ({user.name})
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth && onOpenAuth('login'); }}
                    className="flex-1 py-2 text-center rounded-lg bg-gray-800 text-gray-200 text-xs font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth && onOpenAuth('register'); }}
                    className="flex-1 py-2 text-center rounded-lg btn-primary text-white text-xs font-semibold"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
