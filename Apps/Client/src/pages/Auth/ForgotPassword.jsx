import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    /*
      Temporary frontend behavior.

      Later this will connect to:

      POST /api/auth/forgot-password

      {
        email
      }
    */

    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* =====================================================
            LEFT BRANDING
        ====================================================== */}

        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:w-[52%]">

          {/* Background decoration */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

          <div className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            {/* Logo */}

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
                <GraduationCap size={27} />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white">
                  School Management
                </h1>

                <p className="text-xs text-slate-400">
                  Smart • Simple • Connected
                </p>
              </div>

            </div>

            {/* Main content */}

            <div className="max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-sky-300 backdrop-blur">
                <ShieldCheck size={16} />
                Account Security
              </div>

              <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Keep your account
                <span className="block text-sky-400">
                  secure and accessible.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Forgot your password? Don't worry. Enter the email address
                associated with your school account and we'll help you regain
                access.
              </p>

              {/* Security cards */}

              <div className="mt-10 grid grid-cols-2 gap-4">

                <SecurityCard
                  icon={<ShieldCheck size={20} />}
                  title="Secure Recovery"
                  description="Protected password reset process."
                />

                <SecurityCard
                  icon={<Mail size={20} />}
                  title="Email Verification"
                  description="Reset instructions are sent securely."
                />

              </div>

            </div>

            {/* Footer */}

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                © {new Date().getFullYear()} School Management System
              </span>

              <span>
                Private Portal
              </span>
            </div>

          </div>
        </section>

        {/* =====================================================
            MOBILE BRAND
        ====================================================== */}

        <div className="absolute left-0 right-0 top-0 flex items-center p-5 lg:hidden">

          <div className="flex items-center gap-2">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white">
              <GraduationCap size={22} />
            </div>

            <span className="font-bold text-slate-800">
              School Management
            </span>

          </div>

        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <main className="flex w-full items-center justify-center px-5 py-24 sm:px-8 lg:w-[48%] lg:px-12 lg:py-10">

          <div className="w-full max-w-md">

            {/* Back */}

            <Link
              to="/login"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-sky-600"
            >
              <ArrowLeft size={17} />
              Back to sign in
            </Link>

            {!sent ? (
              <>
                {/* Heading */}

                <div className="mb-8">

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <Mail size={25} />
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                    Forgot your password?
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    No problem. Enter your email address below and we'll send
                    you instructions to reset your password.
                  </p>

                </div>

                {/* Card */}

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">

                  {/* Error */}

                  {error && (
                    <div
                      className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >

                    {/* Email */}

                    <div>

                      <label
                        htmlFor="forgot-email"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Email address
                      </label>

                      <div className="relative">

                        <Mail
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          id="forgot-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                          }}
                          placeholder="you@example.com"
                          className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                        />

                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Use the email address registered with your school
                        account.
                      </p>

                    </div>

                    {/* Submit */}

                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >

                      {loading ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Sending instructions...
                        </>
                      ) : (
                        <>
                          Send reset instructions

                          <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </>
                      )}

                    </button>

                  </form>

                  {/* Security */}

                  <div className="mt-7 flex gap-3 rounded-2xl bg-slate-50 p-4">

                    <ShieldCheck
                      size={19}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <p className="text-xs leading-5 text-slate-500">
                      For your security, never share password reset links or
                      verification codes with anyone.
                    </p>

                  </div>

                </div>

              </>
            ) : (
              /* =================================================
                 SUCCESS STATE
              ================================================== */

              <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-200/50 sm:p-10">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={32} />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-slate-950">
                  Check your email
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                  If an account exists for{" "}
                  <span className="font-semibold text-slate-700">
                    {email}
                  </span>
                  , you'll receive instructions to reset your password.
                </p>

                <div className="mt-7 rounded-2xl bg-slate-50 p-4 text-left">

                  <p className="text-xs font-semibold text-slate-700">
                    Didn't receive the email?
                  </p>

                  <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
                    <li>• Check your spam or junk folder.</li>
                    <li>• Make sure the email address is correct.</li>
                    <li>• Wait a few minutes before trying again.</li>
                  </ul>

                </div>

                <Link
                  to="/login"
                  className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-sky-600"
                >
                  Return to sign in
                  <ArrowRight size={17} />
                </Link>

              </div>
            )}

            {/* Help */}

            <p className="mt-7 text-center text-xs leading-5 text-slate-400">
              Still having trouble?{" "}
              <button
                type="button"
                className="font-semibold text-sky-600 hover:text-sky-700"
              >
                Contact school administration
              </button>
            </p>

          </div>

        </main>

      </div>
    </div>
  );
}

/* =============================================================
   SECURITY CARD
============================================================= */

function SecurityCard({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/10">

      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
        {icon}
      </div>

      <p className="text-sm font-semibold text-white">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}