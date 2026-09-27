import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // In the real backend flow this token will come from the URL.
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const passwordRequirements = [
    {
      label: "At least 8 characters",
      valid: form.password.length >= 8,
    },
    {
      label: "Contains an uppercase letter",
      valid: /[A-Z]/.test(form.password),
    },
    {
      label: "Contains a lowercase letter",
      valid: /[a-z]/.test(form.password),
    },
    {
      label: "Contains a number",
      valid: /[0-9]/.test(form.password),
    },
  ];

  const allRequirementsMet = passwordRequirements.every(
    (requirement) => requirement.valid
  );

  const passwordsMatch =
    form.password.length > 0 &&
    form.password === form.confirmPassword;

  const passwordStrength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!allRequirementsMet) {
      setError("Please meet all password requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    /*
      Temporary frontend behavior.

      Later replace this with:

      POST /api/auth/reset-password

      {
        token,
        password
      }
    */

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  if (success) {
    return (
      <SuccessScreen
        onLogin={() => navigate("/login")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* =====================================================
            LEFT BRANDING
        ====================================================== */}

        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:w-[52%]">

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

            {/* Content */}

            <div className="max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-sky-300 backdrop-blur">
                <ShieldCheck size={16} />
                Secure Password Recovery
              </div>

              <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Create a new,
                <span className="block text-sky-400">
                  secure password.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Choose a strong password to protect your school account and
                keep your personal and academic information secure.
              </p>

              {/* Password security cards */}

              <div className="mt-10 space-y-3">

                <SecurityItem
                  title="Use a strong password"
                  description="Combine letters, numbers, and different characters."
                />

                <SecurityItem
                  title="Keep your password private"
                  description="Never share your password with other people."
                />

                <SecurityItem
                  title="Protect your account"
                  description="Use a unique password that you don't reuse elsewhere."
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
            MAIN CONTENT
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

            {/* Heading */}

            <div className="mb-8">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <LockKeyhole size={25} />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Create new password
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Create a strong password for your school management account.
              </p>

            </div>

            {/* Card */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">

              {/* Error */}

              {error && (
                <div
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                  role="alert"
                >
                  <X size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                {/* New password */}

                <PasswordField
                  id="password"
                  name="password"
                  label="New password"
                  value={form.password}
                  onChange={handleChange}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  placeholder="Enter your new password"
                />

                {/* Strength */}

                {form.password && (
                  <PasswordStrength
                    strength={passwordStrength}
                  />
                )}

                {/* Requirements */}

                <div className="rounded-2xl bg-slate-50 p-4">

                  <p className="mb-3 text-xs font-semibold text-slate-700">
                    Password requirements
                  </p>

                  <div className="grid gap-2 sm:grid-cols-2">

                    {passwordRequirements.map((requirement) => (
                      <Requirement
                        key={requirement.label}
                        valid={requirement.valid}
                        label={requirement.label}
                      />
                    ))}

                  </div>

                </div>

                {/* Confirm password */}

                <PasswordField
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  showPassword={showConfirmPassword}
                  setShowPassword={setShowConfirmPassword}
                  placeholder="Confirm your new password"
                />

                {/* Match status */}

                {form.confirmPassword && (
                  <div
                    className={`flex items-center gap-2 text-xs font-medium ${
                      passwordsMatch
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {passwordsMatch ? (
                      <Check size={15} />
                    ) : (
                      <X size={15} />
                    )}

                    {passwordsMatch
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </div>
                )}

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
                >

                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      Reset password

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
                  Your new password will be used the next time you sign in.
                  Keep it private and secure.
                </p>

              </div>

            </div>

            {/* Help */}

            <p className="mt-7 text-center text-xs leading-5 text-slate-400">
              Having trouble resetting your password?{" "}
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
   PASSWORD FIELD
============================================================= */

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  showPassword,
  setShowPassword,
  placeholder,
}) {
  return (
    <div>

      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">

        <LockKeyhole
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
        />

        <button
          type="button"
          onClick={() => setShowPassword((previous) => !previous)}
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
  );
}

/* =============================================================
   PASSWORD STRENGTH
============================================================= */

function PasswordStrength({ strength }) {
  const bars = [1, 2, 3, 4];

  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-xs font-medium text-slate-500">
          Password strength
        </span>

        <span
          className={`text-xs font-semibold ${
            strength.score <= 1
              ? "text-red-500"
              : strength.score === 2
              ? "text-amber-500"
              : strength.score === 3
              ? "text-sky-600"
              : "text-emerald-600"
          }`}
        >
          {strength.label}
        </span>

      </div>

      <div className="flex gap-1.5">

        {bars.map((bar) => (
          <div
            key={bar}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              bar <= strength.score
                ? "bg-current"
                : "bg-slate-200"
            } ${
              strength.score <= 1
                ? "text-red-500"
                : strength.score === 2
                ? "text-amber-500"
                : strength.score === 3
                ? "text-sky-600"
                : "text-emerald-600"
            }`}
          />
        ))}

      </div>

    </div>
  );
}

/* =============================================================
   REQUIREMENT
============================================================= */

function Requirement({ valid, label }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        valid
          ? "text-emerald-600"
          : "text-slate-400"
      }`}
    >

      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          valid
            ? "bg-emerald-100"
            : "bg-slate-200"
        }`}
      >
        {valid ? (
          <Check size={10} />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        )}
      </span>

      {label}

    </div>
  );
}

/* =============================================================
   SECURITY ITEM
============================================================= */

function SecurityItem({ title, description }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
        <ShieldCheck size={19} />
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

    </div>
  );
}

/* =============================================================
   SUCCESS SCREEN
============================================================= */

function SuccessScreen({ onLogin }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">

      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="mb-8 flex justify-center">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
            <GraduationCap size={27} />
          </div>

        </div>

        {/* Card */}

        <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-200/50 sm:p-10">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-950">
            Password reset successful
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Your password has been successfully updated. You can now sign in
            using your new password.
          </p>

          <button
            type="button"
            onClick={onLogin}
            className="group mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Continue to sign in

            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>

        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={15} className="text-emerald-500" />
          Your account is protected
        </div>

      </div>

    </div>
  );
}

/* =============================================================
   PASSWORD STRENGTH CALCULATOR
============================================================= */

function getPasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      label: "None",
    };
  }

  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;

  if (password.length >= 12 && /[^A-Za-z0-9]/.test(password)) {
    score = 4;
  }

  const labels = {
    0: "None",
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
  };

  return {
    score,
    label: labels[score],
  };
}