import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { confirmPayment } from "../../services/paymentService";

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const { reload } = useCart();
  const redirectStatus = searchParams.get("redirect_status");
  const paymentIntentId = searchParams.get("payment_intent");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    // Handles the 3DS redirect case where Stripe sends the user back with
    // payment_intent in the URL. Confirm server-side so enrollments are created.
    const run = async () => {
      if (paymentIntentId && redirectStatus === "succeeded") {
        setConfirming(true);
        try {
          await confirmPayment(paymentIntentId);
        } catch {
          // Already fulfilled (non-redirect path) or webhook handled it — safe to ignore
        } finally {
          setConfirming(false);
        }
      }
      reload();
    };
    run();
  }, []);

  const failed = redirectStatus && redirectStatus !== "succeeded";

  if (failed) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 p-6"
        style={{ background: "#f7f1fb" }}
      >
        <div
          className="rounded-3xl p-10 text-center max-w-md w-full"
          style={{ background: "rgba(255,255,255,0.94)", boxShadow: "0 8px 40px rgba(95,73,153,0.10)" }}
        >
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#3b2f6b" }}>
            Payment Failed
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            Your payment was not completed. No charges were made.
          </p>
          <Link
            to="/checkout"
            className="inline-block py-3 px-8 rounded-2xl font-semibold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #7c5cbf 0%, #5f4999 100%)" }}
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-6"
      style={{ background: "#f7f1fb" }}
    >
      <div
        className="rounded-3xl p-10 text-center max-w-md w-full"
        style={{ background: "rgba(255,255,255,0.94)", boxShadow: "0 8px 40px rgba(95,73,153,0.10)" }}
      >
        <div className="text-5xl mb-4">{confirming ? "⏳" : "🎉"}</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#3b2f6b" }}>
          {confirming ? "Finalizing your order…" : "Payment Successful!"}
        </h1>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          {confirming
            ? "Please wait while we set up your courses."
            : "Your courses have been added to your account. Head to My Learning to start watching."}
        </p>
        {!confirming && (
          <Link
            to="/my-learning"
            className="inline-block py-3 px-8 rounded-2xl font-semibold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #7c5cbf 0%, #5f4999 100%)" }}
          >
            Go to My Learning
          </Link>
        )}
      </div>
    </div>
  );
}
