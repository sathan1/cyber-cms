'use client';

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800/60 bg-gray-950/40 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm text-white">CyberCMS</span>
          <span className="text-xs text-gray-500">Academic E-Learning Platform</span>
        </div>

        <p className="text-xs text-gray-500">© {new Date().getFullYear()} CyberCMS. All rights reserved.</p>
      </div>
    </footer>
  );
}
