import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Users,
  BookOpen,
  Menu,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    /*
      Temporary frontend authentication.

      Replace this section later with:
      POST /api/auth/login
    */

    setTimeout(() => {
      setLoading(false);

      // Temporary demo login
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="min-h-screen flex">

        {/* =====================================================
            LEFT BRANDING SECTION
        ====================================================== */}
        <section className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-slate-950">

          {/* Background decoration */}
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between w-full p-10 xl:p-14">

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
                Secure School Portal
              </div>

              <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Everything your school needs,
                <span className="block text-sky-400">
                  in one place.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Manage students, teachers, academics, attendance, results,
                communication, and daily school activities through one
                centralized platform.
              </p>

              {/* Feature cards */}
              <div className="mt-10 grid grid-cols-3 gap-4">

                <FeatureCard
                  icon={<Users size={19} />}
                  title="Students"
                  text="Manage records"
                />

                <FeatureCard
                  icon={<BookOpen size={19} />}
                  title="Academics"
                  text="Track performance"
                />

                <FeatureCard
                  icon={<ShieldCheck size={19} />}
                  title="Secure"
                  text="Protected access"
                />

              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>© {new Date().getFullYear()} School Management System</span>
              <span>Private Portal</span>
            </div>

          </div>
        </section>

        {/* =====================================================
            MOBILE HEADER
        ====================================================== */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-5 lg:hidden">

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white">
              <GraduationCap size={22} />
            </div>

            <span className="font-bold text-slate-800">
              School Management
            </span>
          </div>

          <button
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            type="button"
          >
            <Menu size={21} />
          </button>

        </div>

        {/* =====================================================
            LOGIN SECTION
        ====================================================== */}
        <main className="flex w-full items-center justify-center px-5 py-24 sm:px-8 lg:w-[48%] lg:px-12 lg:py-10">

          <div className="w-full max-w-md">

            {/* Mobile intro */}
            <div className="mb-10 lg:hidden">
              <p className="mb-2 text-sm font-medium text-sky-600">
                Secure School Portal
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in to access your school management account.
              </p>
            </div>

            {/* Desktop heading */}
            <div className="mb-9 hidden lg:block">
              <p className="mb-2 text-sm font-semibold text-sky-600">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your credentials to access the private school portal.
              </p>
            </div>

            {/* Login Card */}
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

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
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
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-sky-600 transition hover:text-sky-700"
                    >
                      Forgot password?
                    </Link>

                  </div>

                  <div className="relative">

                    <LockKeyhole
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>

                  </div>
                </div>

                {/* Remember */}
                <div className="flex items-center">

                  <label className="flex cursor-pointer items-center gap-3">

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />

                    <span className="text-sm text-slate-500">
                      Remember me
                    </span>

                  </label>

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
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in

                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

              </form>

              {/* Security message */}
              <div className="mt-7 flex gap-3 rounded-2xl bg-slate-50 p-4">

                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />

                <p className="text-xs leading-5 text-slate-500">
                  Your account is protected by secure authentication.
                  Never share your password with another person.
                </p>

              </div>

            </div>

            {/* Help */}
            <p className="mt-7 text-center text-xs leading-5 text-slate-400">
              Having trouble accessing your account?{" "}
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

/* ============================================================
   FEATURE CARD
============================================================ */

function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/10">

      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
        {icon}
      </div>

      <p className="text-sm font-semibold text-white">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {text}
      </p>

    </div>
  );
}