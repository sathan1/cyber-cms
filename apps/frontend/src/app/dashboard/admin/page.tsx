'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchApi } from '@/lib/api';
import { Course, Payment } from '@/types';
import { Shield, Users, DollarSign, Settings, BookOpen, CreditCard, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<{
    user_counts: { admin: number; staff: number; student: number; paid_user: number; total: number };
    total_revenue: number;
    recent_payments: Payment[];
    courses: Course[];
    cms_branding: {
      platform_name: string;
      institution_code: string;
      verified_domain: string;
      primary_color: string;
    };
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metrics' | 'payments' | 'courses' | 'branding'>('metrics');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/dashboard/admin');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white text-sm">
        <span className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mr-2"></span>
        Loading Admin Portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar onUserChange={() => {}} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold">
              Administrator Console
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">System Metrics & CMS Management</h1>
            <p className="text-xs text-gray-400 mt-1">Manage platform branding, course catalog, staff/student accounts, and payment revenue logs.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Total Revenue:</span>
            <span className="text-xl font-extrabold text-emerald-400">${data?.total_revenue.toFixed(2)}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'metrics' ? 'border-rose-500 text-rose-400' : 'border-transparent text-gray-400'
            }`}
          >
            User Metrics ({data?.user_counts.total})
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'payments' ? 'border-rose-500 text-rose-400' : 'border-transparent text-gray-400'
            }`}
          >
            Payment Reports ({data?.recent_payments.length})
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'courses' ? 'border-rose-500 text-rose-400' : 'border-transparent text-gray-400'
            }`}
          >
            Course Constructor ({data?.courses.length})
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'branding' ? 'border-rose-500 text-rose-400' : 'border-transparent text-gray-400'
            }`}
          >
            CMS Branding Controls
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-gray-800">
              <span className="text-xs text-gray-400 font-semibold block">Students</span>
              <span className="text-3xl font-extrabold text-indigo-400 mt-1 block">{data?.user_counts.student}</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-gray-800">
              <span className="text-xs text-gray-400 font-semibold block">Staff / Mentors</span>
              <span className="text-3xl font-extrabold text-purple-400 mt-1 block">{data?.user_counts.staff}</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-gray-800">
              <span className="text-xs text-gray-400 font-semibold block">Paid Users</span>
              <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">{data?.user_counts.paid_user}</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-gray-800">
              <span className="text-xs text-gray-400 font-semibold block">Administrators</span>
              <span className="text-3xl font-extrabold text-rose-400 mt-1 block">{data?.user_counts.admin}</span>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950/80 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-4">Razorpay Order ID</th>
                  <th className="p-4">Payment ID</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80">
                {data?.recent_payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-900/40">
                    <td className="p-4 font-mono text-indigo-300">{p.razorpay_order_id}</td>
                    <td className="p-4 font-mono text-gray-400">{p.razorpay_payment_id || 'N/A'}</td>
                    <td className="p-4 font-bold text-emerald-400">${p.amount}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="glass-card p-8 rounded-2xl border border-indigo-500/30 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Course Management has moved to the CMS Portal</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Create courses, author lesson modules, attach quizzes with retry limits, manage assignments, and monitor student quiz attempts — all from the full CMS interface.
            </p>
            <div className="space-y-3">
              <div className="text-left text-xs text-gray-400 space-y-1 glass-card p-4 rounded-xl border border-gray-800 max-w-sm mx-auto">
                {data?.courses.map((c) => (
                  <div key={c.id} className="flex justify-between items-center py-1 border-b border-gray-800/60 last:border-0">
                    <span className="text-white font-medium truncate pr-2">{c.title}</span>
                    <span className="text-emerald-400 font-bold flex-shrink-0">${c.price.toFixed(2)}</span>
                  </div>
                ))}
                {(data?.courses.length ?? 0) === 0 && <p className="text-center text-gray-500 py-2">No courses yet.</p>}
              </div>
              <a href="/dashboard/staff/cms" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-white text-sm font-bold">
                <Settings className="w-4 h-4" /> Open CMS Portal
              </a>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="glass-card p-6 rounded-2xl border border-gray-800 max-w-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-rose-400" /> System Branding & Domain Constraints
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">Platform Name</label>
                <input
                  type="text"
                  readOnly
                  value={data?.cms_branding.platform_name}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-gray-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Allowed Student Email Domain</label>
                <input
                  type="text"
                  readOnly
                  value={data?.cms_branding.verified_domain}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-indigo-400 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Institution Code</label>
                <input
                  type="text"
                  readOnly
                  value={data?.cms_branding.institution_code}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-gray-400"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
