'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Lock, QrCode } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Course, User } from '@/types';
import QRCode from 'react-qr-code';

interface ManualCheckoutModalProps {
  isOpen: boolean;
  course: Course;
  user?: User | null;
  onClose: () => void;
  onSuccess: (courseId: number) => void;
}

export default function ManualCheckoutModal({ isOpen, course, user, onClose, onSuccess }: ManualCheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'review' | 'payment' | 'success'>('review');
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<{ upi_id: string; bank_details: string } | null>(null);
  const [utr, setUtr] = useState('');

  useEffect(() => {
    if (isOpen && step === 'review') {
      fetchApi('/payments/settings')
        .then(setSettings)
        .catch(err => console.error("Failed to fetch payment settings", err));
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const handleProceedToPayment = () => {
    if (!settings?.upi_id) {
      setError('Payment gateway is currently unavailable. Please contact admin.');
      return;
    }
    setStep('payment');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (utr.length !== 12) {
      setError('UTR number must be exactly 12 digits long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fetchApi('/payments/manual', {
        method: 'POST',
        body: JSON.stringify({
          course_id: course.id,
          utr_number: utr,
        }),
      });
      
      setStep('success');
      setTimeout(() => {
        onSuccess(course.id); // Triggers re-fetch and UI updates in parent component
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Payment submission failed.');
      setLoading(false);
    }
  };

  // Generate UPI URI
  const upiUri = settings ? `upi://pay?pa=${settings.upi_id}&pn=CyberCMS&am=${course.price}&cu=INR` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-indigo-500/30 shadow-2xl overflow-hidden p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'review' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-3">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Course Checkout</h3>
              <p className="text-xs text-gray-400 mt-1">Review your order details</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="glass-card p-4 rounded-xl space-y-3 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-semibold text-white">{course.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{course.department?.name || 'Academic Course'}</p>
                </div>
                <span className="text-lg font-bold text-indigo-400">₹{course.price}</span>
              </div>

              <div className="border-t border-gray-700/60 pt-3 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" /> Secure Manual Transfer
                </span>
                <span className="text-indigo-400 font-medium">INR (₹)</span>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
            >
              <ShieldCheck className="w-5 h-5" /> Proceed to Pay ₹{course.price}
            </button>
          </div>
        )}

        {step === 'payment' && settings && (
          <div>
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-2">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Scan & Pay</h3>
              <p className="text-xs text-gray-400">Scan this QR code with any UPI app to pay.</p>
            </div>

            <div className="bg-white p-4 rounded-xl flex justify-center mb-4 mx-auto w-48 h-48">
              {upiUri && <QRCode value={upiUri} size={160} />}
            </div>
            
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-indigo-300">UPI ID: {settings.upi_id}</p>
              <p className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">{settings.bank_details}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPayment} className="space-y-4 border-t border-gray-800 pt-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Enter 12-Digit UTR Number *</label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 312345678901"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono tracking-widest text-center"
                />
              </div>
              <button
                type="submit"
                disabled={loading || utr.length !== 12}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>Submit Payment for Verification</>
                )}
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">Payment Submitted!</h3>
            <p className="text-xs text-gray-300 px-4">
              Your payment is under review. The course will be unlocked once an admin verifies the transaction.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
