"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Sparkles, RefreshCw, XCircle } from "lucide-react";
import { paymentsApi } from "@/lib/api/payments";
import { useAuth } from "@/lib/auth-context";
import { paymentWs } from "@/lib/websocket";
import { authApi } from "@/lib/api/auth";

const POLL_INTERVAL = 2000;
const MAX_RETRIES = 30;

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { setUser, user } = useAuth();
  const [status, setStatus] = useState<"polling" | "active" | "timeout">("polling");
  const [countdown, setCountdown] = useState(5);
  const mountedRef = useRef(true);
  const retriesRef = useRef(0);

  const onPaymentSuccess = useCallback((data: Record<string, unknown>) => {
    if (!mountedRef.current) return;
    setStatus("active");
    // Refresh user data
    authApi.getMe().then((u) => setUser(u)).catch(() => {});
  }, [setUser]);

  useEffect(() => {
    mountedRef.current = true;
    retriesRef.current = 0;

    // Connect WebSocket for real-time payment confirmation
    if (user?.id) {
      const unsubscribe = paymentWs.on("payment_success", onPaymentSuccess);
      paymentWs.connect(user.id);
      return () => {
        mountedRef.current = false;
        unsubscribe();
      };
    }
    // Fallback: poll if no user found
    return () => { mountedRef.current = false; };
  }, [user?.id, onPaymentSuccess]);

  // Also keep polling as fallback
  useEffect(() => {
    mountedRef.current = true;
    retriesRef.current = 0;

    const poll = async () => {
      if (!mountedRef.current) return;
      try {
        const sub = await paymentsApi.getSubscription();
        if (!mountedRef.current) return;

        if (sub.subscriptionStatus !== "FREE") {
          setStatus("active");
          return;
        }
      } catch {
        // network error — retry
      }

      retriesRef.current++;
      if (retriesRef.current >= MAX_RETRIES) {
        if (mountedRef.current) setStatus("timeout");
        return;
      }
      setTimeout(poll, POLL_INTERVAL);
    };

    poll();

    return () => { mountedRef.current = false; };
  }, [setUser]);

  useEffect(() => {
    if (status !== "active") return;
    if (countdown <= 0) {
      router.push("/models");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, status, router]);

  return (
    <div className="mx-auto w-full max-w-[500px] px-6 py-24 min-h-[90vh] flex flex-col items-center justify-center text-center">
      {status === "polling" && (
        <>
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
            <RefreshCw size={36} className="text-yellow-500 animate-spin" />
          </div>
          <h1 className="text-3xl font-black mb-3 tracking-[-0.03em]">Processing Payment</h1>
          <p className="text-muted-dark text-[0.9375rem]">Waiting for payment confirmation&hellip;</p>
        </>
      )}

      {status === "active" && (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <CheckCircle size={36} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black mb-3 tracking-[-0.03em]">Payment Successful!</h1>
          <p className="text-muted text-[0.9375rem] mb-8 leading-relaxed max-w-[380px]">
            Your subscription is now active. You have full access to all modules and premium features.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-[300px]">
            <Link href="/models" className="inline-flex items-center justify-center gap-2 bg-fg text-bg px-6 py-3 rounded-xl font-bold text-[0.875rem] hover:bg-fg/90 transition-all no-underline">
              <Sparkles size={16} />
              Start Exploring
            </Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-[0.8125rem] text-muted hover:text-fg border border-border-subtle hover:border-border transition-all no-underline">
              Go to Dashboard
              <ArrowRight size={14} />
            </Link>
          </div>
          <p className="mt-8 text-[0.75rem] text-muted-dark">Redirecting in {countdown}s&hellip;</p>
        </>
      )}

      {status === "timeout" && (
        <>
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
            <XCircle size={36} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-black mb-3 tracking-[-0.03em]">Still Processing</h1>
          <p className="text-muted-dark text-[0.9375rem] mb-2">
            Activation is taking longer than expected.
          </p>
          <p className="text-muted text-[0.8125rem] mb-8">
            Don&apos;t worry — your subscription will be activated once the payment is confirmed.
            Check your dashboard in a few minutes.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-[300px]">
            <button
              onClick={() => {
                retriesRef.current = 0;
                setStatus("polling");
              }}
              className="inline-flex items-center justify-center gap-2 bg-fg text-bg px-6 py-3 rounded-xl font-bold text-[0.875rem] hover:bg-fg/90 transition-all"
            >
              <RefreshCw size={16} />
              Check Again
            </button>
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-[0.8125rem] text-muted hover:text-fg border border-border-subtle hover:border-border transition-all no-underline">
              Go to Dashboard
              <ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
