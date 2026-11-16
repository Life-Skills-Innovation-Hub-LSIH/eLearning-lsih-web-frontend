"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, X } from "lucide-react";
import { checkBillingPayment, type BakongCheckout } from "@/features/learning/api/enrollment-api";

type Summary = {
  title: string;
  listPrice: number;
  accessLabel: string;
  included: string[];
};

type Props = {
  token: string;
  checkout: BakongCheckout;
  summary?: Summary;
  onPaid: () => void;
  onClose: () => void;
  onRetry: () => Promise<BakongCheckout | void>;
  onApplyCoupon?: (code: string) => Promise<BakongCheckout | void>;
};

function remainingLabel(expiresAt?: string | null) {
  if (!expiresAt) return "";
  const seconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

function money(amount: number, currency?: string) {
  const value = Number(amount).toFixed(2);
  return currency === "KHR" ? `${value} KHR` : `$${value}`;
}

export function BakongCheckoutDialog({
  token,
  checkout,
  summary,
  onPaid,
  onClose,
  onRetry,
  onApplyCoupon,
}: Props) {
  const [current, setCurrent] = useState(checkout);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [renewing, setRenewing] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [showIncluded, setShowIncluded] = useState(false);
  const [showCoupon, setShowCoupon] = useState(true);
  const paid = current.status === "paid" || current.paid === true;
  const expired =
    !paid &&
    (current.status === "expired" ||
      (current.expires_at ? new Date(current.expires_at).getTime() <= now : false));
  const listPrice = summary?.listPrice ?? current.amount;
  const discount = Math.max(0, Number((listPrice - current.amount).toFixed(2)));

  useEffect(() => {
    setCurrent(checkout);
    setError("");
  }, [checkout]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (!current.id || paid || expired) return;

    const timer = window.setInterval(() => {
      void checkBillingPayment(token, current.id as number)
        .then((next) => {
          setCurrent(next);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Could not check the payment.");
        });
    }, 3000);

    return () => window.clearInterval(timer);
  }, [current.id, paid, expired, token]);

  async function applyCoupon() {
    if (!onApplyCoupon || !coupon.trim()) return;
    setApplying(true);
    setError("");
    try {
      const next = await onApplyCoupon(coupon.trim());
      if (next && "amount" in next) {
        setCurrent(next);
        setAppliedCode(coupon.trim().toUpperCase());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "That coupon code is not valid.");
    } finally {
      setApplying(false);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-white">
      <div className="grid h-full grid-cols-1 lg:grid-cols-2">
        <section className="overflow-y-auto px-6 py-6 sm:px-10 sm:py-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#334155]"
            onClick={paid ? onPaid : onClose}
          >
            <X className="h-4 w-4" />
            Close
          </button>
          <h2 id="bakong-checkout-title" className="mt-6 text-3xl font-semibold tracking-tight text-[#111827]">
            {paid ? "Payment successful" : "Checkout"}
          </h2>
          <p className="mt-2 text-sm text-[#64748b]">
            {paid
              ? "The payment is confirmed. Continue to open this course."
              : "Review this course, then scan the KHQR to pay."}
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-[#e6e8ec]">
            <div className="flex items-center justify-between border-b border-[#eef0f3] px-5 py-4">
              <p className="text-sm font-semibold text-[#111827]">{summary?.title || "Course access"}</p>
              <p className="text-sm text-[#64748b]">{money(listPrice, current.currency)}</p>
            </div>
            <Row label="Access" value={summary?.accessLabel || "1 month"} />
            <Row label="Payment" value="ABA KHQR" />
            {discount > 0 ? (
              <Row label={appliedCode ? `Coupon ${appliedCode}` : "Coupon"} value={`-${money(discount, current.currency)}`} />
            ) : null}
            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-[#111827]"
              onClick={() => setShowIncluded((open) => !open)}
            >
              What&apos;s included
              <ChevronDown className={`h-4 w-4 transition ${showIncluded ? "rotate-180" : ""}`} />
            </button>
            {showIncluded ? (
              <ul className="grid gap-2 px-5 pb-5 sm:grid-cols-2">
                {(summary?.included ?? [
                  "Full course access for 1 month",
                  "Lessons and quizzes included",
                  "Certificate included",
                  "Scan with ABA or any banking app",
                ]).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[#334155]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#111827]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {onApplyCoupon && !paid ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-[#e6e8ec]">
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-[#111827]"
                onClick={() => setShowCoupon((open) => !open)}
              >
                Have a discount code?
                <ChevronDown className={`h-4 w-4 transition ${showCoupon ? "rotate-180" : ""}`} />
              </button>
              {showCoupon ? (
                <form
                  className="flex gap-2 px-5 pb-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void applyCoupon();
                  }}
                >
                  <input
                    value={coupon}
                    onChange={(event) => setCoupon(event.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="h-11 min-w-0 flex-1 rounded-xl border border-[#e6e8ec] px-3 text-sm uppercase"
                  />
                  <button
                    type="submit"
                    className="h-11 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white disabled:opacity-60"
                    disabled={applying || !coupon.trim()}
                  >
                    {applying ? "Applying…" : "Apply"}
                  </button>
                </form>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex items-end justify-between">
            <p className="text-sm text-[#64748b]">{paid ? "Amount paid" : "Total due today"}</p>
            <p className="text-3xl font-semibold tracking-tight text-[#111827]">
              {money(current.amount, current.currency)}{" "}
              <span className="text-base font-medium text-[#64748b]">{current.currency || "USD"}</span>
            </p>
          </div>
          <p className="mt-2 text-sm text-[#64748b]">
            {paid
              ? "This course stays open for 1 month."
              : "One-time payment. This course stays open for 1 month after the scan is confirmed."}
          </p>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </section>

        <section className="flex items-center justify-center bg-[#f6f7f9] px-6 py-10">
          {paid ? (
            <div className="w-full max-w-[340px] rounded-2xl bg-white px-8 py-10 text-center shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#16a34a] text-white">
                <Check className="h-10 w-10" strokeWidth={2.75} />
              </span>
              <p className="mt-5 text-2xl font-semibold tracking-tight text-[#111827]">Paid</p>
              <p className="mt-2 text-sm text-[#64748b]">
                {summary?.title ? `${summary.title} is unlocked.` : "Your payment was received."}
              </p>
              <p className="mt-4 text-lg font-semibold text-[#111827]">
                {money(current.amount, current.currency)}
              </p>
              <button type="button" className="btn btn-primary mt-8 w-full" onClick={onPaid}>
                Continue
              </button>
            </div>
          ) : (
          <div className="w-full max-w-[340px] overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
            <div className="bg-[#E1232E] px-5 py-4 text-white">
              <p className="text-lg font-bold tracking-[0.18em]">KHQR</p>
            </div>
            <div className="px-5 pb-5 pt-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#1a1a2e]">
                {current.merchant_name || "LSIH"}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#1a1a2e]">{money(current.amount, current.currency)}</p>
              <p className="text-xs text-[#64748b]">USD</p>
              {expired || !current.qr_image ? (
                <div className="mt-4 flex h-64 flex-col items-center justify-center rounded-xl bg-[#f4f6f8] px-4 text-center">
                  <p className="text-sm font-medium text-[#1a1a2e]">This QR has expired</p>
                  <button
                    type="button"
                    className="btn btn-primary mt-4"
                    disabled={renewing}
                    onClick={() => {
                      setRenewing(true);
                      setError("");
                      void onRetry()
                        .catch((err: unknown) => {
                          setError(err instanceof Error ? err.message : "Could not create a new QR.");
                        })
                        .finally(() => setRenewing(false));
                    }}
                  >
                    {renewing ? "Creating…" : "Get a new QR"}
                  </button>
                </div>
              ) : (
                <div className="relative mx-auto mt-3 h-64 w-64">
                  <img src={current.qr_image} alt="KHQR code" className="h-full w-full" />
                  <span className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white">
                    <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden>
                      <circle cx="32" cy="32" r="30" fill="#E1232E" />
                      <path
                        fill="#fff"
                        d="M32 10l4.2 10.2L47 18l-6.2 8.8L52 32l-11.2 5.2L47 46l-10.8-4.2L32 54l-4.2-12.2L17 46l6.2-8.8L12 32l11.2-5.2L17 18l10.8 2.2L32 10z"
                      />
                    </svg>
                  </span>
                </div>
              )}
              <p className="mt-3 text-center text-xs text-[#64748b]">
                {expired ? "Scan time ended." : `Expires in ${remainingLabel(current.expires_at)}`}
              </p>
            </div>
          </div>
          )}
        </section>
      </div>
    </div>,
    document.body,
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#eef0f3] px-5 py-4 text-sm">
      <span className="text-[#64748b]">{label}</span>
      <span className="font-medium text-[#111827]">{value}</span>
    </div>
  );
}
