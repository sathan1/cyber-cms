'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RemarkDrawer from '@/components/RemarkDrawer';
import { fetchApi } from '@/lib/api';
import { Remark, User } from '@/types';
import { Users, AlertTriangle, MessageSquare, Filter, Shield, Search, Send, CheckCircle2 } from 'lucide-react';

export default function MentorDashboard() {
  const [data, setData] = useState<{
    total_students: number;
    cohorts: {
      year_1_count: number;
      year_2_count: number;
      year_3_count: number;
      year_4_count: number;
    };
    students_by_cohort: Record<string, User[]>;
    risk_watchlist: Array<{
      id: number;
      name: string;
      roll_number: string;
      year: number;
      avg_progress: number;
      risk_level: 'CRITICAL' | 'WARNING';
    }>;
    remarks: Remark[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedCohortYear, setSelectedCohortYear] = useState<number>(3);
  const [searchRoll, setSearchRoll] = useState('');
  const [remarkDrawerOpen, setRemarkDrawerOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/dashboard/mentor');
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
        <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></span>
        Loading Mentor Portal...
      </div>
    );
  }

  const activeCohortList = data?.students_by_cohort[`year_${selectedCohortYear}`] || [];
  const filteredStudents = activeCohortList.filter(
    (s) => !searchRoll || s.roll_number?.toLowerCase().includes(searchRoll.toLowerCase()) || s.name.toLowerCase().includes(searchRoll.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar onUserChange={() => {}} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold">
              Staff / Mentor Portal
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">Department Cohorts & Risk Watchlist</h1>
            <p className="text-xs text-gray-400 mt-1">Manage assigned students by year cohort and reply to student remarks tagged by roll number.</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/dashboard/staff/cms"
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <Shield className="w-4 h-4" /> Open CMS Portal
            </a>
            <button
              onClick={() => setRemarkDrawerOpen(true)}
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <MessageSquare className="w-4 h-4" /> Manage Remarks ({data?.remarks.filter((r) => r.status === 'pending').length || 0} Pending)
            </button>
          </div>
        </div>

        {/* Cohort Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((yr) => {
            const count = (data?.cohorts as any)?.[`year_${yr}_count`] || 0;
            const isSelected = selectedCohortYear === yr;
            return (
              <button
                key={yr}
                onClick={() => setSelectedCohortYear(yr)}
                className={`glass-card p-5 rounded-2xl border text-left transition-all ${
                  isSelected ? 'border-purple-500 bg-purple-950/30' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400">Year {yr} Cohort</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-2xl font-extrabold text-white">{count} Students</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cohort Student List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" /> Year {selectedCohortYear} Cohort Roster
              </h2>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Filter by roll number or name..."
                  value={searchRoll}
                  onChange={(e) => setSearchRoll(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-950/80 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-950/80 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
                  <tr>
                    <th className="p-4">Roll Number</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/80">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        No students found in Year {selectedCohortYear} cohort.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-gray-900/40">
                        <td className="p-4 font-mono font-semibold text-purple-300">{st.roll_number || 'UNASSIGNED'}</td>
                        <td className="p-4 font-medium text-white">{st.name}</td>
                        <td className="p-4 text-gray-400">{st.email}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setRemarkDrawerOpen(true)}
                            className="px-3 py-1 rounded-lg bg-purple-900/30 text-purple-300 border border-purple-500/30 hover:bg-purple-800/40 text-[11px]"
                          >
                            View Queries
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Watchlist Flag Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" /> Risk Watchlist (&lt; 30% Progress)
            </h2>

            <div className="glass-card p-4 rounded-2xl border border-rose-500/20 space-y-3">
              {data?.risk_watchlist.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No academic risk warnings detected.</p>
              ) : (
                data?.risk_watchlist.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{item.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.risk_level === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {item.risk_level}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-gray-400">
                      <span>Roll: {item.roll_number || 'N/A'} (Year {item.year})</span>
                      <span className="font-mono text-rose-300">{item.avg_progress}% Avg</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <RemarkDrawer
        isOpen={remarkDrawerOpen}
        user={{ id: 99, name: 'Staff Mentor', email: 'prof.smith@mcet.in', role: 'STAFF', status: 'active' }}
        courses={[]}
        remarks={data?.remarks || []}
        onClose={() => setRemarkDrawerOpen(false)}
        onRemarkUpdated={loadData}
      />
    </div>
  );
}
