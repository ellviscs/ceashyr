"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dataProvider } from "@/services";
import { SEED_ACCOUNTS } from "@/constants/seed-data";
import type { LoginValidationErrors } from "@/types";

/**
 * Halaman Login Multi-Peran (US-04 — Tasks H-01 & H-02).
 * Referensi Figma: 1331:5580, 1331:5596, 1331:6664, 1331:6680, 1331:5786.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginValidationErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (fieldErrors.email || authError) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
      setAuthError(null);
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (fieldErrors.password || authError) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
      setAuthError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await dataProvider.auth.login(email, password);
    if (res.ok) {
      router.push(res.redirectPath);
      return;
    }

    if (res.fieldErrors) {
      setFieldErrors(res.fieldErrors);
      setAuthError(null);
    } else {
      setFieldErrors({});
      setAuthError(res.error);
    }
    setIsSubmitting(false);
  };

  const fillDemoAccount = (role: "ketua_kwu" | "pengelola") => {
    const acc = SEED_ACCOUNTS.find((a) => a.role === role);
    if (!acc) return;
    setEmail(acc.email);
    setPassword(acc.password);
    setFieldErrors({});
    setAuthError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-ceashyr-mint relative overflow-x-hidden">
      {/* Kolom Kiri: Kartu Login */}
      <div className="w-full md:w-[49%] min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-10 relative z-10">
        <div className="w-full max-w-[429px] rounded-[24px] bg-white shadow-ceashyr-card p-6 sm:p-9 border border-ceashyr-border">
          <h1 className="text-2xl font-bold text-ceashyr-orange text-center mb-5">
            Welcome!
          </h1>

          {authError && (
            <div
              role="alert"
              className="mb-4 bg-ceashyr-red-soft border border-ceashyr-red text-ceashyr-red text-xs font-medium rounded-xl px-3.5 py-2.5 flex items-center gap-2"
            >
              <span className="w-4 h-4 rounded-full bg-ceashyr-red text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                !
              </span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-ceashyr-ink mb-1.5"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Email Address"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm text-ceashyr-ink placeholder:text-ceashyr-muted focus:outline-none transition-colors ${
                  fieldErrors.email
                    ? "border-ceashyr-red bg-ceashyr-red-soft/40 focus:border-ceashyr-red"
                    : "border-ceashyr-border bg-white focus:border-ceashyr-orange"
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs font-medium text-ceashyr-red flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-ceashyr-red text-white text-[9px] font-bold inline-flex items-center justify-center shrink-0">
                    !
                  </span>
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-ceashyr-ink mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Password"
                  className={`w-full h-11 pl-3.5 pr-10 rounded-xl border text-sm text-ceashyr-ink placeholder:text-ceashyr-muted focus:outline-none transition-colors ${
                    fieldErrors.password
                      ? "border-ceashyr-red bg-ceashyr-red-soft/40 focus:border-ceashyr-red"
                      : "border-ceashyr-border bg-white focus:border-ceashyr-orange"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ceashyr-muted hover:text-ceashyr-ink p-1"
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs font-medium text-ceashyr-red flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-ceashyr-red text-white text-[9px] font-bold inline-flex items-center justify-center shrink-0">
                    !
                  </span>
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            <div className="flex justify-start">
              <Link
                href="/register?tab=forgot"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 active:scale-[0.99] transition disabled:opacity-60"
            >
              {isSubmitting ? "Memproses..." : "Login"}
            </button>
          </form>

          {/* Tombol cepat pengisian akun demo untuk QA & Tablet */}
          <div className="mt-5 pt-4 border-t border-ceashyr-border space-y-2">
            <p className="text-[11px] font-medium text-ceashyr-muted text-center">
              Isi Cepat Akun Demo:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount("ketua_kwu")}
                className="py-2 px-3 rounded-xl bg-ceashyr-peach border border-ceashyr-orange/40 text-ceashyr-orange text-xs font-semibold hover:bg-ceashyr-peach/80 transition"
              >
                Isi Akun Ketua KWU
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("pengelola")}
                className="py-2 px-3 rounded-xl bg-ceashyr-field border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-mint/60 transition"
              >
                Isi Akun Pengelola/Kasir
              </button>
            </div>
          </div>

          <p className="text-xs text-center text-ceashyr-muted mt-5">
            Not a member?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>

      {/* Kolom Kanan: Ilustrasi Kantin Figma (1331:5581) */}
      <div className="hidden md:block md:w-[51%] min-h-screen relative bg-ceashyr-cream">
        <img
          src="/images/login-canteen-illustration.png"
          alt="Ilustrasi pengunjung kantin Ceashyr"
          className="w-full h-full object-cover object-right"
        />
      </div>
    </div>
  );
}
