
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SignupPage() {
  const [form, setForm] = useState({
    adminId: "",
    name: "",
    gmail: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/admin/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed.");
        return;
      }

      setSuccess("Account created successfully!");

      setForm({
        adminId: "",
        name: "",
        gmail: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
    } catch {
      setError(
        "Cannot connect to server. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    {
      name: "adminId",
      label: "Admin ID",
      placeholder: "Enter your admin ID",
      type: "text",
    },
    {
      name: "name",
      label: "Full Name",
      placeholder: "Enter your full name",
      type: "text",
    },
    {
      name: "gmail",
      label: "Gmail",
      placeholder: "admin@gmail.com",
      type: "email",
    },
    {
      name: "phone",
      label: "Phone Number",
      placeholder: "01XXXXXXXXX",
      type: "tel",
    },
    {
      name: "password",
      label: "Password",
      placeholder: "Create a password",
      type: "password",
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      placeholder: "Enter password again",
      type: "password",
    },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-2xl text-white shadow-lg">
            <span>✦</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Create Admin Account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Register your account to manage your products.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-9">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  {field.label}
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={
                    form[field.name as keyof typeof form]
                  }
                  onChange={handleChange}
                  autoComplete={
                    field.name === "password"
                      ? "new-password"
                      : field.name === "confirmPassword"
                        ? "new-password"
                        : field.name === "gmail"
                          ? "email"
                          : field.name === "name"
                            ? "name"
                            : "off"
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                />
              </div>
            ))}

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {success && (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                <p className="font-semibold">{success}</p>
                <Link
                  href="/loginPage"
                  className="mt-2 inline-block font-semibold underline"
                >
                  Go to Login →
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-emerald-700 px-5 py-4 font-semibold text-white shadow-lg shadow-emerald-800/15 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/loginPage"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Login
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} ShopAdmin
        </p>
      </div>
    </main>
  );
}
