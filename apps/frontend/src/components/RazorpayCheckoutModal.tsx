'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Lock, ExternalLink } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Course, User } from '@/types';

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  course: Course;
  user?: User | null;
  onClose: () => void;
  onSuccess: (courseId: number) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayCheckoutModal({ isOpen, course, user, onClose, onSuccess }: RazorpayCheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'review' | 'success'>('review');
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setSdkLoaded(true);
      script.onerror = () => setSdkLoaded(false);
      document.body.appendChild(script);
    } else if (window.Razorpay) {
      setSdkLoaded(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create Razorpay order on backend
      const orderRes = await fetchApi('/payments/order', {
        method: 'POST',
        body: JSON.stringify({ course_id: course.id }),
      });

      const orderId = orderRes.order_id;
      const keyId = orderRes.key_id;

      // 2. Launch Razorpay Web Checkout Modal if SDK is loaded
      if (typeof window !== 'undefined' && window.Razorpay && keyId && !keyId.startsWith('rzp_test_mock')) {
        const options = {
          key: keyId,
          amount: Math.round(orderRes.amount * 100),
          currency: orderRes.currency || 'INR',
          name: 'CyberCMS Academic Platform',
          description: course.title,
          order_id: orderId,
          handler: async function (response: any) {
            try {
              await fetchApi('/payments/verify', {
                method: 'POST',
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              setStep('success');
              setTimeout(() => {
                onSuccess(course.id);
                onClose();
              }, 1800);
            } catch (err: any) {
              setError(err.message || 'Signature verification failed.');
              setLoading(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#4f46e5',
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Test Mode / Fallback Order Verification Simulation
        const mockPaymentId = 'pay_' + Math.random().toString(36).substring(2, 10);
        const mockSignature = 'sig_demo_hash_' + Math.random().toString(36).substring(2, 10);

        await fetchApi('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            razorpay_order_id: orderId,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSignature,
          }),
        });

        setStep('success');
        setTimeout(() => {
          onSuccess(course.id);
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-emerald-500/30 shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'review' ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Razorpay Secure Checkout</h3>
              <p className="text-xs text-gray-400 mt-1">
                Authentic Razorpay Web Checkout Integration with Server Signature Verification
              </p>
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
                <span className="text-lg font-bold text-emerald-400">${course.price.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-700/60 pt-3 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> SSL 256-bit Encrypted
                </span>
                <span className="text-emerald-400 font-medium">Paise / INR / USD</span>
              </div>
            </div>

            <button
              onClick={handleRazorpayPayment}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> Launch Razorpay & Pay ${course.price.toFixed(2)}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">Payment Verified!</h3>
            <p className="text-xs text-gray-300">
              Razorpay HMAC-SHA256 signature verified on server. Course access unlocked!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
