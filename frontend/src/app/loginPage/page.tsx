"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please enter your Gmail/phone number and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Login failed. Please check your details.");
        return;
      }

      if (!data.admin?.adminId) {
        setError("Login response did not include an admin ID.");
        return;
      }

      // Simple local testing setup; this is not secure authentication.
      localStorage.setItem("adminId", data.admin.adminId);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      router.push("/adminPage");
    } catch {
      setError("Cannot connect to the server. Check that your backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7faf8] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-100 px-12 py-10 lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div className="absolute -left-24 top-64 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="absolute -right-20 bottom-24 h-72 w-72 rounded-full bg-green-200/40 blur-3xl" />

          <Link href="/login" className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/15">
              <BagIcon />
            </span>
            <span>
              <span className="block text-2xl font-extrabold tracking-tight">
                Shop<span className="text-emerald-700">Admin</span>
              </span>
              <span className="text-sm text-slate-500">Manage your products easily</span>
            </span>
          </Link>

          <div className="relative max-w-xl py-12">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Your store, under control
            </p>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight xl:text-6xl">
              Welcome back,
              <span className="block text-emerald-700">Admin!</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-slate-600">
              Sign in to manage your products, keep track of stock, and grow your business from one simple workspace.
            </p>

            <div className="mt-12 rounded-3xl border border-white bg-white/85 p-5 shadow-xl shadow-emerald-950/5 backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Product overview</p>
                  <p className="mt-1 text-xs text-slate-500">Your admin workspace</p>
                </div>
                <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">Dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-3 py-5">
                {[
                  { label: "Products", value: "Manage", height: "h-16" },
                  { label: "Inventory", value: "Track", height: "h-24" },
                  { label: "Store", value: "Grow", height: "h-20" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 p-3">
                    <div className={`mb-3 flex ${item.height} items-end rounded-xl bg-gradient-to-t from-emerald-100 to-emerald-50 p-2`}>
                      <div className="h-2 w-full rounded-full bg-emerald-600/70" />
                    </div>
                    <p className="text-sm font-bold">{item.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex gap-8 text-sm text-slate-600">
            <span className="flex items-center gap-2"><ShieldIcon /> Simple access</span>
            <span className="flex items-center gap-2"><BoxIcon /> Product management</span>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg">
                <BagIcon />
              </div>
              <p className="text-2xl font-extrabold">Shop<span className="text-emerald-700">Admin</span></p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-10">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-5 hidden h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 lg:flex">
                  <BagIcon />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">Admin Login</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Enter your Gmail or phone number and password to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="identifier" className="mb-2 block text-sm font-semibold text-slate-700">
                    Gmail or Phone Number
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white transition focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-600/10">
                    <span className="pl-4 text-slate-400"><UserIcon /></span>
                    <input
                      id="identifier"
                      name="identifier"
                      autoComplete="username"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder="admin@gmail.com or 01XXXXXXXXX"
                      className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-4 text-sm outline-none placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white transition focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-600/10">
                    <span className="pl-4 text-slate-400"><LockIcon /></span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="min-w-0 flex-1 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-slate-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="mr-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-semibold text-white shadow-lg shadow-emerald-800/15 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>Login <ArrowIcon /></>
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-400">NEW ADMIN?</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <Link
                href="/signupPage"
                className="flex w-full items-center justify-center rounded-xl border border-emerald-700 px-5 py-3.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
              >
                Create an Account
              </Link>
            </div>
            <p className="mt-6 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} ShopAdmin. Admin workspace.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function BagIcon() {
  return <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg>;
}
function UserIcon() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2Z"/></svg>;
}
function LockIcon() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>;
}
function EyeIcon() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function EyeOffIcon() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 3 18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.1 3.9M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 3-.4"/></svg>;
}
function ArrowIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
}
function ShieldIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>;
}
function BoxIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 8 9 5 9-5"/><path d="M3 8v9l9 5 9-5V8"/><path d="M12 13v9"/></svg>;
}
