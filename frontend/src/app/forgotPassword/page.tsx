"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ForgotPasswordPage() {
  const [gmail, setGmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [step, setStep] = useState<"email" | "reset">("email");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gmail }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send OTP");
      }

      setStep("reset");
      setMessage(data.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gmail,
            otp,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      setMessage(data.message);
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Forgot Password
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          {step === "email"
            ? "Enter your registered Gmail to receive an OTP."
            : `Enter the OTP sent to ${gmail} and choose a new password.`}
        </p>

        {step === "email" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Registered Gmail
            </label>

            <input
              type="email"
              required
              value={gmail}
              onChange={(e) => setGmail(e.target.value)}
              placeholder="Enter your Gmail"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                6-digit OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                New Password
              </label>

              <input
                type="password"
                minLength={8}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setStep("email");
                setOtp("");
                setNewPassword("");
                setMessage("");
                setError("");
              }}
              className="w-full text-sm text-blue-600 hover:underline"
            >
              Request a new OTP
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {message.includes("Password reset successful") && (
          <Link
            href="/loginPage"
            className="mt-4 block text-center font-semibold text-blue-600 hover:underline"
          >
            Go to Login
          </Link>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            href="/loginPage"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}