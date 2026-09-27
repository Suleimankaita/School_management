import React from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  MoreHorizontal,
  School,
  UserPlus,
  Users,
  UserRound,
  Wallet,
} from "lucide-react";

/* =========================================================
   DEMO DATA
   Replace these with API data later.
========================================================= */

const stats = [
  {
    title: "Total Students",
    value: "1,248",
    change: "8.2%",
    description: "vs last term",
    icon: Users,
    color: "sky",
    trend: "up",
  },
  {
    title: "Teaching Staff",
    value: "86",
    change: "4.1%",
    description: "vs last term",
    icon: UserRound,
    color: "violet",
    trend: "up",
  },
  {
    title: "Active Classes",
    value: "32",
    change: "2 new",
    description: "this session",
    icon: School,
    color: "emerald",
    trend: "up",
  },
  {
    title: "Attendance",
    value: "94.6%",
    change: "1.4%",
    description: "vs yesterday",
    icon: ClipboardCheck,
    color: "orange",
    trend: "down",
  },
];

const attendance = [
  { day: "Mon", value: 94 },
  { day: "Tue", value: 97 },
  { day: "Wed", value: 92 },
  { day: "Thu", value: 96 },
  { day: "Fri", value: 91 },
];

const performance = [
  {
    subject: "Mathematics",
    score: 82,
    students: 238,
  },
  {
    subject: "English Language",
    score: 88,
    students: 245,
  },
  {
    subject: "Basic Science",
    score: 76,
    students: 221,
  },
  {
    subject: "Computer Studies",
    score: 91,
    students: 198,
  },
  {
    subject: "Social Studies",
    score: 84,
    students: 232,
  },
];

const activities = [
  {
    icon: UserPlus,
    title: "New student registered",
    description: "Aisha Mohammed was added to JSS 2A.",
    time: "12 min ago",
    type: "student",
  },
  {
    icon: ClipboardCheck,
    title: "Attendance completed",
    description: "Primary 5 attendance has been submitted.",
    time: "38 min ago",
    type: "attendance",
  },
  {
    icon: BookOpen,
    title: "Results uploaded",
    description: "JSS 3 second-term results were updated.",
    time: "1 hr ago",
    type: "academic",
  },
  {
    icon: Wallet,
    title: "Payment received",
    description: "A student fee payment was recorded.",
    time: "2 hrs ago",
    type: "finance",
  },
];

const events = [
  {
    day: "27",
    month: "SEP",
    title: "Parents & Teachers Meeting",
    time: "10:00 AM",
    location: "Main Hall",
  },
  {
    day: "03",
    month: "OCT",
    title: "Mid-Term Examination",
    time: "8:00 AM",
    location: "All Classes",
  },
  {
    day: "10",
    month: "OCT",
    title: "Inter-House Sports",
    time: "9:00 AM",
    location: "School Field",
  },
];

const announcements = [
  {
    title: "Mid-Term Examination Schedule",
    text: "The examination timetable has been published for all secondary classes.",
    date: "Today",
    urgent: true,
  },
  {
    title: "School Fees Reminder",
    text: "Parents are reminded to complete outstanding fee payments before the deadline.",
    date: "Yesterday",
    urgent: false,
  },
  {
    title: "Staff Development Workshop",
    text: "Teachers are invited to attend the upcoming professional development workshop.",
    date: "Sep 20",
    urgent: false,
  },
];

/* =========================================================
   COLOR HELPERS
========================================================= */

const colorStyles = {
  sky: {
    wrapper: "bg-sky-50",
    icon: "text-sky-600",
    badge: "bg-sky-50 text-sky-600",
    line: "bg-sky-500",
  },
  violet: {
    wrapper: "bg-violet-50",
    icon: "text-violet-600",
    badge: "bg-violet-50 text-violet-600",
    line: "bg-violet-500",
  },
  emerald: {
    wrapper: "bg-emerald-50",
    icon: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-600",
    line: "bg-emerald-500",
  },
  orange: {
    wrapper: "bg-orange-50",
    icon: "text-orange-600",
    badge: "bg-orange-50 text-orange-600",
    line: "bg-orange-500",
  },
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ item }) {
  const Icon = item.icon;
  const colors = colorStyles[item.color];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      {/* top accent */}
      <div
        className={`absolute left-0 right-0 top-0 h-1 ${colors.line} opacity-0 transition group-hover:opacity-100`}
      />

      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors.wrapper}`}
        >
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>

        <button className="rounded-lg p-1.5 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500">
          {item.title}
        </p>

        <div className="mt-1 flex items-end justify-between gap-3">
          <h3 className="text-3xl font-bold tracking-tight text-slate-950">
            {item.value}
          </h3>

          <span
            className={`mb-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${colors.badge}`}
          >
            {item.trend === "up" ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}

            {item.change}
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-400">
          {item.description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
  description,
  action = "View all",
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            {description}
          </p>
        )}
      </div>

      {action && (
        <button className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-sky-600 transition hover:text-sky-700 sm:flex">
          {action}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  return (
    <main className="min-h-full bg-[#f7f9fc]">
      <div className="mx-auto max-w-[1700px] space-y-6 p-4 sm:p-6 lg:p-8">

        {/* =====================================================
            TOP HEADER
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[28px] bg-slate-950 shadow-2xl">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />

            <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="absolute right-1/4 top-1/2 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-sky-200 backdrop-blur-xl">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  School Management Portal
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Good morning, Administrator
                  <span className="ml-2">👋</span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Manage your school operations, monitor academic progress,
                  track attendance and stay updated with everything happening
                  across the school.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 backdrop-blur">
                    <CalendarDays className="h-4 w-4 text-sky-400" />
                    2025/2026 Session
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 backdrop-blur">
                    <BookOpen className="h-4 w-4 text-sky-400" />
                    First Term
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row xl:flex-col 2xl:flex-row">
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100">
                  <CalendarDays className="h-4 w-4" />
                  Academic Calendar
                </button>

                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10">
                  <Award className="h-4 w-4" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard key={item.title} item={item} />
          ))}
        </section>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader
            title="Quick Actions"
            description="Common operations you may want to perform"
            action={null}
          />

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              {
                title: "Add Student",
                icon: UserPlus,
                color: "sky",
              },
              {
                title: "Add Teacher",
                icon: UserRound,
                color: "violet",
              },
              {
                title: "Attendance",
                icon: ClipboardCheck,
                color: "emerald",
              },
              {
                title: "Create Exam",
                icon: BookOpen,
                color: "orange",
              },
              {
                title: "Record Payment",
                icon: Wallet,
                color: "sky",
              },
              {
                title: "Announcement",
                icon: Bell,
                color: "violet",
              },
            ].map((item) => {
              const Icon = item.icon;
              const colors = colorStyles[item.color];

              return (
                <button
                  key={item.title}
                  className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:bg-white hover:shadow-md"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.wrapper} transition group-hover:scale-110`}
                  >
                    <Icon className={`h-5 w-5 ${colors.icon}`} />
                  </div>

                  <p className="mt-4 text-xs font-bold text-slate-700 sm:text-sm">
                    {item.title}
                  </p>

                  <ArrowUpRight className="mt-2 h-4 w-4 text-slate-300 transition group-hover:text-sky-500" />
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            MAIN ANALYTICS
        ===================================================== */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">

          {/* Attendance */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 xl:col-span-7">
            <SectionHeader
              title="Attendance Overview"
              description="Student attendance during the current week"
            />

            <div className="mt-7 flex flex-col gap-8 md:flex-row md:items-center">

              {/* Circle */}
              <div className="flex shrink-0 justify-center md:w-40">
                <div className="relative h-36 w-36">
                  <svg
                    viewBox="0 0 100 100"
                    className="h-full w-full -rotate-90"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      strokeWidth="9"
                      className="stroke-slate-100"
                    />

                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      strokeDashoffset="13.5"
                      className="stroke-sky-500"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-950">
                      94.6%
                    </span>

                    <span className="text-[10px] font-medium text-slate-400">
                      Attendance
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid flex-1 grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                    <span className="text-xs font-semibold text-slate-500">
                      Present
                    </span>
                  </div>

                  <p className="mt-2 text-xl font-bold text-slate-900">
                    1,180
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                    <span className="text-xs font-semibold text-slate-500">
                      Absent
                    </span>
                  </div>

                  <p className="mt-2 text-xl font-bold text-slate-900">
                    68
                  </p>
                </div>
              </div>
            </div>

            {/* Bars */}
            <div className="mt-8">
              <div className="flex h-40 items-end gap-3 border-b border-slate-100 px-2 sm:gap-6">
                {attendance.map((item) => (
                  <div
                    key={item.day}
                    className="flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="group relative flex h-full items-end justify-center">
                      <div
                        className="w-full max-w-10 rounded-t-xl bg-sky-500 transition-all duration-500 group-hover:bg-sky-600"
                        style={{
                          height: `${item.value}%`,
                        }}
                      />

                      <div className="absolute -top-7 hidden rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold text-white group-hover:block">
                        {item.value}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-3 px-2 sm:gap-6">
                {attendance.map((item) => (
                  <span
                    key={item.day}
                    className="flex-1 text-center text-xs font-medium text-slate-400"
                  >
                    {item.day}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 xl:col-span-5">
            <SectionHeader
              title="Academic Performance"
              description="Average performance by subject"
            />

            <div className="mt-6 space-y-5">
              {performance.map((item) => (
                <div key={item.subject}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="truncate text-xs font-semibold text-slate-600 sm:text-sm">
                      {item.subject}
                    </span>

                    <span className="text-xs font-bold text-slate-900">
                      {item.score}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all duration-700"
                      style={{
                        width: `${item.score}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {item.students} students assessed
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <Award className="h-4 w-4 text-emerald-600" />
              </div>

              <div>
                <p className="text-xs font-bold text-emerald-800">
                  Strong academic progress
                </p>

                <p className="mt-0.5 text-[10px] text-emerald-600">
                  Current dashboard values are sample data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ACTIVITY + EVENTS
        ===================================================== */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">

          {/* Activity */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 xl:col-span-7">
            <SectionHeader
              title="Recent Activity"
              description="Latest activity across the school"
            />

            <div className="mt-6 divide-y divide-slate-100">
              {activities.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group flex gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-sky-50 group-hover:text-sky-600">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-slate-800">
                          {item.title}
                        </p>

                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock3 className="h-3 w-3" />
                          {item.time}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
              View activity history
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Events */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 xl:col-span-5">
            <SectionHeader
              title="Upcoming Events"
              description="Important dates coming up"
            />

            <div className="mt-6 space-y-3">
              {events.map((event) => (
                <div
                  key={event.title}
                  className="group flex gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-sky-100 hover:bg-sky-50/40"
                >
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <span className="text-[9px] font-bold">
                      {event.month}
                    </span>

                    <span className="text-xl font-bold leading-5">
                      {event.day}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                      {event.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {event.time}
                      </span>

                      <span className="flex items-center gap-1">
                        <School className="h-3 w-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>

                  <ChevronDown className="mt-1 h-4 w-4 rotate-[-90deg] text-slate-300 transition group-hover:text-sky-500" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            ANNOUNCEMENTS
        ===================================================== */}

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader
            title="Announcements"
            description="Recent messages shared with the school community"
          />

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {announcements.map((item) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {item.urgent && (
                  <div className="absolute right-0 top-0 h-16 w-16">
                    <div className="absolute right-[-30px] top-[10px] w-[100px] rotate-45 bg-orange-500 py-1 text-center text-[8px] font-bold uppercase text-white">
                      Important
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <Bell className="h-4 w-4" />
                  </div>

                  <span className="text-[10px] font-medium text-slate-400">
                    {item.date}
                  </span>
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800 transition group-hover:text-sky-700">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {item.text}
                </p>

                <button className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-sky-600">
                  Read more
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* =====================================================
            SYSTEM STATUS
        ===================================================== */}

        <footer className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-400 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-sky-500" />
            <span>
              School Management System • 2025/2026 Academic Session
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span>All systems operational</span>
          </div>
        </footer>
      </div>
    </main>
  );
}