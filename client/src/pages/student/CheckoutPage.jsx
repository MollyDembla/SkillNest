import React, { useEffect, useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useNavigate, Link } from "react-router-dom";
import { createPaymentIntent, confirmPayment } from "../../services/paymentService";
import toast from "react-hot-toast";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ total, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed. Please try again.");
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Confirm server-side immediately so enrollments are created without
      // waiting for the Stripe webhook (which requires stripe listen in dev).
      try {
        await confirmPayment(paymentIntent.id);
      } catch {
        // Webhook may still fulfill it — don't block the redirect
      }
      navigate("/checkout/success");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 px-6 rounded-2xl font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #7c5cbf 0%, #5f4999 100%)" }}
      >
        {processing ? "Processing…" : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await createPaymentIntent();
        setClientSecret(res.data.clientSecret);
        setOrderItems(res.data.items || []);
        setOrderTotal(res.data.amount || 0);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to initialize checkout."
        );
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const stripeOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#5f4999",
            borderRadius: "12px",
            fontFamily: "inherit",
          },
        },
      }
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Preparing checkout…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-600 text-center">{error}</p>
        <Link
          to="/cart"
          className="text-sm font-medium underline"
          style={{ color: "#5f4999" }}
        >
          ← Back to Cart
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{ background: "#f7f1fb" }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "#3b2f6b" }}>
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div
              className="rounded-3xl p-6"
              style={{ background: "rgba(255,255,255,0.94)", boxShadow: "0 8px 40px rgba(95,73,153,0.10)" }}
            >
              <h2 className="text-lg font-bold mb-4" style={{ color: "#3b2f6b" }}>
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                {orderItems.map((item) => (
                  <div key={item._id} className="flex justify-between items-start gap-3">
                    <span className="text-sm text-gray-700 leading-tight">
                      {item.title}
                    </span>
                    <span className="text-sm font-semibold whitespace-nowrap" style={{ color: "#5f4999" }}>
                      ${(item.price || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="pt-4 flex justify-between items-center border-t"
                style={{ borderColor: "#e8e0f7" }}
              >
                <span className="font-semibold" style={{ color: "#3b2f6b" }}>
                  Total
                </span>
                <span className="text-xl font-bold" style={{ color: "#5f4999" }}>
                  ${orderTotal.toFixed(2)}
                </span>
              </div>

              <p className="mt-4 text-xs text-gray-400 leading-relaxed">
                By completing your purchase you agree to our Terms of Service.
                All sales are final.
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-3">
            <div
              className="rounded-3xl p-6"
              style={{ background: "rgba(255,255,255,0.94)", boxShadow: "0 8px 40px rgba(95,73,153,0.10)" }}
            >
              <h2 className="text-lg font-bold mb-4" style={{ color: "#3b2f6b" }}>
                Payment Details
              </h2>

              {clientSecret && stripeOptions && (
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <PaymentForm total={orderTotal} />
                </Elements>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/cart"
            className="text-sm"
            style={{ color: "#7c5cbf" }}
          >
            ← Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
