"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { dataProvider } from "@/services";
import type { UserRole } from "@/types";

type RegisterStep = "form" | "otp";
type ForgotStep = "email" | "otp" | "new_password" | "done";

/**
 * Konten utama halaman Register & Lupa Password (US-04 — Task H-01).
 * Referensi Figma: Section `1331:6003` (`1331:6004`, `1331:6065`, `1331:6033`, `1331:6046`, `1331:6019`).
 */
function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "forgot" ? "forgot" : "register";

  const [tab, setTab] = useState<"register" | "forgot">(initialTab);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State Register
  const [regStep, setRegStep] = useState<RegisterStep>("form");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("pengelola");
  const [regOtp, setRegOtp] = useState("");

  // State Forgot Password
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const switchTab = (next: "register" | "forgot") => {
    setTab(next);
    setErrorMsg(null);
  };

  const handleRegisterFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!regEmail.trim() || !regEmail.includes("@")) {
      setErrorMsg("Masukkan alamat email yang valid.");
      return;
    }
    if (regPassword.trim().length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }
    if (regPassword !== regConfirm) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setRegStep("otp");
  };

  const handleRegisterOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (regOtp.trim().length < 4) {
      setErrorMsg("Masukkan 4 digit kode konfirmasi (contoh: 1234).");
      return;
    }
    const res = await dataProvider.auth.registerAccount(
      regEmail,
      regPassword,
      regRole
    );
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }
    router.push("/login");
  };

  const handleForgotEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      setErrorMsg("Masukkan alamat email akun yang ingin dipulihkan.");
      return;
    }
    setForgotStep("otp");
  };

  const handleForgotOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (forgotOtp.trim().length < 4) {
      setErrorMsg("Masukkan 4 digit kode verifikasi (contoh: 1234).");
      return;
    }
    setForgotStep("new_password");
  };

  const handleNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (newPassword.trim().length < 6) {
      setErrorMsg("Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    setForgotStep("done");
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-ceashyr-mint relative overflow-x-hidden">
      <div className="w-full md:w-[49%] min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-[429px] rounded-[24px] bg-white shadow-ceashyr-card p-6 sm:p-9 border border-ceashyr-border space-y-5">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-ceashyr-field border border-ceashyr-border">
            <button
              type="button"
              onClick={() => switchTab("register")}
              className={`py-2 rounded-lg text-xs font-semibold transition ${
                tab === "register"
                  ? "bg-ceashyr-orange text-white"
                  : "text-ceashyr-muted hover:text-ceashyr-ink"
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => switchTab("forgot")}
              className={`py-2 rounded-lg text-xs font-semibold transition ${
                tab === "forgot"
                  ? "bg-ceashyr-orange text-white"
                  : "text-ceashyr-muted hover:text-ceashyr-ink"
              }`}
            >
              Forgot Password
            </button>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="bg-ceashyr-red-soft border border-ceashyr-red text-ceashyr-red text-xs font-medium rounded-xl px-3.5 py-2.5"
            >
              {errorMsg}
            </div>
          )}

          {/* ALUR REGISTER */}
          {tab === "register" && regStep === "form" && (
            <form onSubmit={handleRegisterFormSubmit} className="space-y-3.5">
              <h1 className="text-xl font-bold text-ceashyr-orange text-center">
                Create Your Account
              </h1>

              <div>
                <label className="block text-xs font-semibold text-ceashyr-ink mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-ceashyr-border bg-white text-sm text-ceashyr-ink focus:outline-none focus:border-ceashyr-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ceashyr-ink mb-1">
                  Peran Akun
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full h-11 px-3.5 rounded-xl border border-ceashyr-border bg-white text-sm text-ceashyr-ink focus:outline-none focus:border-ceashyr-orange"
                >
                  <option value="pengelola">Pengelola / Kasir</option>
                  <option value="ketua_kwu">Ketua KWU</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ceashyr-ink mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full h-11 px-3.5 rounded-xl border border-ceashyr-border bg-white text-sm text-ceashyr-ink focus:outline-none focus:border-ceashyr-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ceashyr-ink mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="w-full h-11 px-3.5 rounded-xl border border-ceashyr-border bg-white text-sm text-ceashyr-ink focus:outline-none focus:border-ceashyr-orange"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition"
              >
                Create Account
              </button>
            </form>
          )}

          {tab === "register" && regStep === "otp" && (
            <form onSubmit={handleRegisterOtpSubmit} className="space-y-4">
              <div className="text-center">
                <h1 className="text-xl font-bold text-ceashyr-ink">
                  Enter confirmation code
                </h1>
                <p className="text-xs text-ceashyr-muted mt-1">
                  A 4-digit code was sent to{" "}
                  <span className="font-medium text-ceashyr-ink">
                    {regEmail}
                  </span>{" "}
                  (demo: 1234)
                </p>
              </div>

              <input
                type="text"
                maxLength={4}
                inputMode="numeric"
                value={regOtp}
                onChange={(e) => setRegOtp(e.target.value)}
                placeholder="1234"
                className="w-full h-12 text-center tracking-[0.6em] text-lg font-bold rounded-xl border border-ceashyr-border focus:outline-none focus:border-ceashyr-orange"
              />

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition"
              >
                Verify &amp; Selesai
              </button>
              <button
                type="button"
                onClick={() => setRegStep("form")}
                className="w-full text-xs text-ceashyr-muted hover:underline"
              >
                ← Ubah Data Akun
              </button>
            </form>
          )}

          {/* ALUR FORGOT PASSWORD */}
          {tab === "forgot" && forgotStep === "email" && (
            <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
              <h1 className="text-xl font-bold text-ceashyr-orange text-center">
                Recover Your account
              </h1>
              <div>
                <label className="block text-xs font-semibold text-ceashyr-ink mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full h-11 px-3.5 rounded-xl border border-ceashyr-border bg-white text-sm text-ceashyr-ink focus:outline-none focus:border-ceashyr-orange"
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition"
              >
                Send Code
              </button>
            </form>
          )}

          {tab === "forgot" && forgotStep === "otp" && (
            <form onSubmit={handleForgotOtpSubmit} className="space-y-4">
              <div className="text-center">
                <h1 className="text-xl font-bold text-ceashyr-ink">
                  Enter confirmation code
                </h1>
                <p className="text-xs text-ceashyr-muted mt-1">
                  Masukkan kode 4 digit untuk {forgotEmail} (demo: 1234)
                </p>
              </div>
              <input
                type="text"
                maxLength={4}
                inputMode="numeric"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                placeholder="1234"
                className="w-full h-12 text-center tracking-[0.6em] text-lg font-bold rounded-xl border border-ceashyr-border focus:outline-none focus:border-ceashyr-orange"
              />
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition"
              >
                Verify Code
              </button>
            </form>
          )}

          {tab === "forgot" && forgotStep === "new_password" && (
            <form onSubmit={handleNewPasswordSubmit} className="space-y-3.5">
              <h1 className="text-xl font-bold text-ceashyr-orange text-center">
                Enter Your New Password
              </h1>
              <div>
                <label className="block text-xs font-semibold text-ceashyr-ink mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru"
                  className="w-full h-11 px-3.5 rounded-xl border border-ceashyr-border bg-white text-sm text-ceashyr-ink focus:outline-none focus:border-ceashyr-orange"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ceashyr-ink mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full h-11 px-3.5 rounded-xl border border-ceashyr-border bg-white text-sm text-ceashyr-ink focus:outline-none focus:border-ceashyr-orange"
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition"
              >
                Change My Password
              </button>
            </form>
          )}

          {tab === "forgot" && forgotStep === "done" && (
            <div className="space-y-4 text-center">
              <div className="rounded-xl bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green px-4 py-3 text-xs font-semibold">
                ✓ Kata sandi untuk {forgotEmail} berhasil diperbarui!
              </div>
              <Link
                href="/login"
                className="block w-full py-2.5 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition"
              >
                Kembali ke Halaman Login →
              </Link>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs border-t border-ceashyr-border">
            <Link
              href="/login"
              className="text-ceashyr-orange font-semibold hover:underline"
            >
              ← Kembali ke Login
            </Link>
            <Link href="/" className="text-ceashyr-muted hover:underline">
              Launchpad
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:block md:w-[51%] min-h-screen relative bg-ceashyr-cream">
        <img
          src="/images/login-canteen-illustration.png"
          alt="Ilustrasi kantin Ceashyr"
          className="w-full h-full object-cover object-right"
        />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ceashyr-mint flex items-center justify-center text-sm text-ceashyr-muted">
          Memuat halaman...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
