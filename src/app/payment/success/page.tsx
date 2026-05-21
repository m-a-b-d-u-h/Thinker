"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { paymentsApi } from "@/lib/api/payments";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth-context";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { user, setUser, loadPreferences } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryRef = useRef(0);
  const mountedRef = useRef(true);

  const verify = useCallback(async (sessionId: string) => {
    try {
      const updatedUser = await paymentsApi.verifySession(sessionId);
      if (!mountedRef.current) return;
      setUser(updatedUser);
      await loadPreferences();
      setVerifying(false);
    } catch (err) {
      if (!mountedRef.current) return;
      if (retryRef.current < 3) {
        retryRef.current++;
        const delay = Math.pow(2, retryRef.current) * 1000;
        setTimeout(() => verify(sessionId), delay);
      } else {
        // All retries exhausted — check if webhook already updated the user
        try {
          const me = await authApi.getMe();
          if (me.subscriptionStatus !== "FREE") {
            setUser(me);
            setVerifying(false);
            return;
          }
        } catch {
          // webhook didn't help either
        }
        setError(err instanceof Error ? err.message : "Verification failed");
        setVerifying(false);
      }
    }
  }, [setUser, loadPreferences]);

  const refreshStatus = useCallback(async () => {
    setVerifying(true);
    setError(null);
    try {
      const me = await authApi.getMe();
      if (me.subscriptionStatus !== "FREE") {
        setUser(me);
        setVerifying(false);
      } else {
        setError("Subscription not yet activated. Try again in a moment.");
        setVerifying(false);
      }
    } catch {
      setError("Could not check subscription status.");
      setVerifying(false);
    }
  }, [setUser]);

  useEffect(() => {
    mountedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      // No session_id in URL — try to recover any pending payment from Stripe
      paymentsApi
        .activatePending()
        .then((updatedUser) => {
          if (!mountedRef.current) return;
          setUser(updatedUser);
          loadPreferences();
          setVerifying(false);
        })
        .catch(() => {
          if (!mountedRef.current) return;
          setVerifying(false);
        });
      return;
    }

    verify(sessionId);

    return () => { mountedRef.current = false; };
  }, [verify, setUser, loadPreferences]);

  useEffect(() => {
    if (verifying || error) return;
    if (countdown <= 0) {
      router.push("/models");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, verifying, error, router]);

  return (
    <div className="mx-auto w-full max-w-[500px] px-6 py-24 min-h-[90vh] flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
        <CheckCircle size={36} className="text-emerald-500" />
      </div>

      <h1 className="text-3xl font-black mb-3 tracking-[-0.03em]">
        Payment Successful!
      </h1>

      {verifying ? (
        <p className="text-[#888] text-[0.9375rem]">Activating your subscription...</p>
      ) : error ? (
        <>
          <p className="text-red-400 text-[0.9375rem] mb-2">Could not verify payment</p>
          <p className="text-[#666] text-[0.8125rem] mb-8">{error}. Your subscription should be active shortly.</p>
          <button
            onClick={refreshStatus}
            className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold text-[0.875rem] hover:bg-white/90 transition-all"
          >
            <RefreshCw size={16} />
            Refresh Status
          </button>
        </>
      ) : (
        <p className="text-[#666] text-[0.9375rem] mb-8 leading-relaxed max-w-[380px]">
          Thank you for subscribing. You now have full access to all modules, audio narration, and premium features.
        </p>
      )}

      <div className="flex flex-col gap-3 w-full max-w-[300px]">
        <Link
          href="/models"
          className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold text-[0.875rem] hover:bg-white/90 transition-all no-underline"
        >
          <Sparkles size={16} />
          Start Exploring
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-[0.8125rem] text-[#666] hover:text-white border border-white/10 hover:border-white/20 transition-all no-underline"
        >
          Go to Dashboard
          <ArrowRight size={14} />
        </Link>
      </div>

      {!verifying && !error && (
        <p className="mt-8 text-[0.75rem] text-[#444]">
          Redirecting to explore in {countdown}s...
        </p>
      )}
    </div>
  );
}
