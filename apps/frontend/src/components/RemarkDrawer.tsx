'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle, Clock, User, Sparkles } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Course, Remark, User as UserType } from '@/types';

interface RemarkDrawerProps {
  isOpen: boolean;
  user: UserType;
  courses: Course[];
  remarks: Remark[];
  onClose: () => void;
  onRemarkUpdated: () => void;
}

export default function RemarkDrawer({
  isOpen,
  user,
  courses,
  remarks,
  onClose,
  onRemarkUpdated,
}: RemarkDrawerProps) {
  const [courseId, setCourseId] = useState<number>(courses[0]?.id || 1);
  const [question, setQuestion] = useState('');
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'ask'>('view');

  if (!isOpen) return null;

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchApi('/remarks', {
        method: 'POST',
        body: JSON.stringify({ course_id: courseId, question }),
      });
      setQuestion('');
      onRemarkUpdated();
      setActiveTab('view');
    } catch (err: any) {
      alert(err.message || 'Failed to submit question.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostReply = async (remarkId: number) => {
    const text = replyText[remarkId];
    if (!text || text.trim() === '') return;

    try {
      await fetchApi(`/remarks/${remarkId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply: text }),
      });
      setReplyText((prev) => ({ ...prev, [remarkId]: '' }));
      onRemarkUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to post reply.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg h-full border-l border-gray-800 shadow-2xl flex flex-col p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Mentor Q&A & Remarks</h3>
              <span className="text-xs text-gray-400">Tagged by Roll Number & Cohort Year</span>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        {user.role === 'STUDENT' && (
          <div className="flex border-b border-gray-800 mt-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 pb-2 border-b-2 text-center transition-colors ${
                activeTab === 'view' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400'
              }`}
            >
              My Submissions ({remarks.length})
            </button>
            <button
              onClick={() => setActiveTab('ask')}
              className={`flex-1 pb-2 border-b-2 text-center transition-colors ${
                activeTab === 'ask' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400'
              }`}
            >
              + Ask New Question
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {activeTab === 'ask' && user.role === 'STUDENT' ? (
            <form onSubmit={handlePostQuestion} className="space-y-4 glass-card p-4 rounded-xl border border-gray-800">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Select Course Subject</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-gray-950/70 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Your Question / Technical Query</label>
                <textarea
                  required
                  rows={4}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Describe your question or difficulty for your assigned mentor..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-gray-950/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg btn-primary text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Submit to Mentor'} <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {remarks.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400">
                  <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  No remarks or queries found.
                </div>
              ) : (
                remarks.map((rem) => (
                  <div key={rem.id} className="glass-card p-4 rounded-xl border border-gray-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-semibold text-indigo-300">Roll: {rem.roll_number} (Year {rem.year})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rem.status === 'replied' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {rem.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-white">{rem.question}</p>

                    {rem.reply ? (
                      <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
                        <span className="font-semibold block text-[11px] text-indigo-400">Mentor Reply:</span>
                        <p>{rem.reply}</p>
                      </div>
                    ) : (
                      (user.role === 'STAFF' || user.role === 'ADMIN') && (
                        <div className="mt-3 space-y-2">
                          <input
                            type="text"
                            placeholder="Type official mentor reply..."
                            value={replyText[rem.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [rem.id]: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-gray-950 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handlePostReply(rem.id)}
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Post Reply
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
