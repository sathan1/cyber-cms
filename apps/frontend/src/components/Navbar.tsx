'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, LogOut, LogIn, UserPlus, AlertCircle, Menu, X } from 'lucide-react';
import { User } from '@/types';
import { removeAuthToken, getAuthToken, fetchApi } from '@/lib/api';
import ProfileModal from './ProfileModal';

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
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);

  useEffect(() => {
    setMounted(true);

    if (user !== undefined && user !== null) {
      setCurrentUser(user);
    } else {
      const token = getAuthToken();
      if (token) {
        fetchApi('/me')
          .then((res) => {
            setCurrentUser(res.user);
            if (onUserChange) onUserChange(res.user);
          })
          .catch(() => {
            setCurrentUser(null);
            if (onUserChange) onUserChange(null);
          });
      } else {
        setCurrentUser(null);
      }
    }
  }, [user, pathname, onUserChange]);

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
    if (onUserChange) onUserChange(null);
    setMobileMenuOpen(false);
    router.push('/');
  };

  if (!mounted) return null;

  const activeUser = currentUser || user;

  return (
    <>
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
                <span className="text-xs block text-indigo-400 font-medium">MCET Academic Platform</span>
              </div>
            </Link>

            {/* Desktop Nav items */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-indigo-400 font-semibold' : 'text-gray-300 hover:text-white'}`}>
                Course Catalog
              </Link>

              {activeUser?.role === 'STUDENT' && (
                <Link href="/dashboard/student" className={`text-sm font-medium transition-colors ${pathname.includes('/student') ? 'text-indigo-400 font-semibold' : 'text-gray-300 hover:text-white'}`}>
                  Student Portal
                </Link>
              )}

              {(activeUser?.role === 'STAFF' || activeUser?.role === 'ADMIN') && (
                <>
                  <Link href="/dashboard/mentor" className={`text-sm font-medium transition-colors ${pathname.includes('/mentor') ? 'text-indigo-400 font-semibold' : 'text-gray-300 hover:text-white'}`}>
                    Mentor Portal
                  </Link>
                  <Link href="/dashboard/staff/cms" className={`text-sm font-medium transition-colors ${pathname.includes('/cms') ? 'text-indigo-400 font-semibold' : 'text-gray-300 hover:text-white'}`}>
                    Staff CMS Portal
                  </Link>
                </>
              )}

              {activeUser?.role === 'ADMIN' && (
                <Link href="/dashboard/admin" className={`text-sm font-medium transition-colors ${pathname.includes('/admin') ? 'text-rose-400 font-semibold' : 'text-gray-300 hover:text-white'}`}>
                  Admin Console
                </Link>
              )}

              {activeUser?.role === 'PAID_USER' && (
                <Link href="/dashboard/paid" className={`text-sm font-medium transition-colors ${pathname.includes('/paid') ? 'text-indigo-400 font-semibold' : 'text-gray-300 hover:text-white'}`}>
                  My Courses
                </Link>
              )}
            </nav>

            {/* Right Action buttons */}
            <div className="flex items-center gap-2">
              {activeUser ? (
                <div className="flex items-center gap-3">
                  {activeUser.role === 'STUDENT' && !activeUser.roll_number && (
                    <button
                      onClick={onOpenOnboarding}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition-all animate-pulse"
                    >
                      <AlertCircle className="w-4 h-4" /> Complete Onboarding
                    </button>
                  )}

                  {/* Profile preview button */}
                  <button
                    onClick={() => setProfileModalOpen(true)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-900/60 hover:bg-gray-800 border border-gray-700/80 transition-all text-left"
                    title="Click to view Profile Details"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow">
                      {activeUser.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-xs font-semibold text-white block leading-none">{activeUser.name}</span>
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{activeUser.role.replace('_', ' ')}</span>
                    </div>
                  </button>

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
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800 space-y-4 animate-in slide-in-from-top duration-200 px-4">
            <nav className="flex flex-col space-y-2 text-sm">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${pathname === '/' ? 'bg-indigo-600/20 text-indigo-400 font-semibold' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                Course Catalog
              </Link>

              {activeUser?.role === 'STUDENT' && (
                <Link
                  href="/dashboard/student"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${pathname.includes('/student') ? 'bg-indigo-600/20 text-indigo-400 font-semibold' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  Student Portal
                </Link>
              )}

              {(activeUser?.role === 'STAFF' || activeUser?.role === 'ADMIN') && (
                <>
                  <Link
                    href="/dashboard/mentor"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${pathname.includes('/mentor') ? 'bg-indigo-600/20 text-indigo-400 font-semibold' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Mentor Portal
                  </Link>
                  <Link
                    href="/dashboard/staff/cms"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${pathname.includes('/cms') ? 'bg-indigo-600/20 text-indigo-400 font-semibold' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Staff CMS Portal
                  </Link>
                </>
              )}

              {activeUser?.role === 'ADMIN' && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${pathname.includes('/admin') ? 'bg-rose-600/20 text-rose-400 font-semibold' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  Admin Console
                </Link>
              )}

              {activeUser?.role === 'PAID_USER' && (
                <Link
                  href="/dashboard/paid"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${pathname.includes('/paid') ? 'bg-indigo-600/20 text-indigo-400 font-semibold' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  My Courses
                </Link>
              )}
            </nav>

            {/* Mobile User Profile / Auth Actions */}
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
              {activeUser ? (
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => { setMobileMenuOpen(false); setProfileModalOpen(true); }}
                    className="flex items-center gap-2 text-xs font-semibold text-white"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
                      {activeUser.name.charAt(0)}
                    </div>
                    {activeUser.name} <span className="text-[10px] text-gray-400 font-normal">({activeUser.role})</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-rose-400 text-xs font-semibold py-1 px-2 rounded hover:bg-rose-500/10"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
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
      </header>

      {/* Profile Details Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        user={activeUser || null}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
