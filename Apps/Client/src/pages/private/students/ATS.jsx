import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Printer,
  Search,
  UserCheck,
  UserX,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  Activity,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

const STATUS = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  EXCUSED: "Excused",
};

const STATUS_META = {
  Present: {
    label: "Present",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  Absent: {
    label: "Absent",
    icon: XCircle,
    classes: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  Late: {
    label: "Late",
    icon: Clock3,
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  Excused: {
    label: "Excused",
    icon: ShieldCheck,
    classes: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
};

const pad = (value) => String(value).padStart(2, "0");

const formatDateKey = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
};

const parseDateKey = (key) => {
  if (!key) return null;

  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const formatLongDate = (key) => {
  const date = parseDateKey(key);

  if (!date) return "Unknown date";

  return date.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatShortDate = (key) => {
  const date = parseDateKey(key);

  if (!date) return "-";

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getMonthKey = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
};

const getDaysInMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

const calculatePercentage = (present, late, total) => {
  if (!total) return 0;

  return Math.round(((present + late) / total) * 100);
};

const escapeCSV = (value) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status, compact = false }) {
  if (!status) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 ${
          compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1 text-xs"
        } font-semibold text-slate-500`}
      >
        Not marked
      </span>
    );
  }

  const meta = STATUS_META[status] || STATUS_META.Absent;
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${
        meta.classes
      } ${
        compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1 text-xs"
      } font-semibold`}
    >
      <Icon size={compact ? 11 : 13} />
      {meta.label}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ title, value, subtitle, icon: Icon, iconClass }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs font-medium text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ATTENDANCE RING
========================================================= */

function AttendanceRing({ percentage }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative h-48 w-48">
      <svg
        viewBox="0 0 160 160"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-slate-100"
        />

        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          className="text-sky-500 transition-all duration-1000 ease-out"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-slate-900">
          {percentage}%
        </span>

        <span className="mt-1 text-xs font-semibold text-slate-500">
          Attendance
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function StudentAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [selectedDate, setSelectedDate] = useState(null);
  const [showReason, setShowReason] = useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    setLoading(true);

    try {
      const students = JSON.parse(
        localStorage.getItem("school_students") || "[]"
      );

      const attendanceData = JSON.parse(
        localStorage.getItem("school_attendance") || "{}"
      );

      const found = students.find(
        (item) => String(item.id) === String(id)
      );

      setStudent(found || null);
      setAttendance(attendanceData);
    } catch (error) {
      console.error("Failed to load student attendance:", error);
      setStudent(null);
      setAttendance({});
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* =======================================================
     STUDENT ATTENDANCE RECORDS
  ======================================================= */

  const records = useMemo(() => {
    if (!student) return [];

    return Object.entries(attendance)
      .map(([date, day]) => {
        const record = day?.records?.[student.id];

        if (!record) return null;

        return {
          date,
          ...record,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, student]);

  /* =======================================================
     OVERALL STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const result = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: records.length,
    };

    records.forEach((record) => {
      if (record.status === STATUS.PRESENT) result.present++;
      if (record.status === STATUS.ABSENT) result.absent++;
      if (record.status === STATUS.LATE) result.late++;
      if (record.status === STATUS.EXCUSED) result.excused++;
    });

    return {
      ...result,
      percentage: calculatePercentage(
        result.present,
        result.late,
        result.total
      ),
    };
  }, [records]);

  /* =======================================================
     MONTHLY RECORDS
  ======================================================= */

  const monthRecords = useMemo(() => {
    const monthKey = getMonthKey(currentMonth);

    return records.filter((record) =>
      record.date.startsWith(monthKey)
    );
  }, [records, currentMonth]);

  const monthlyStats = useMemo(() => {
    const result = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: monthRecords.length,
    };

    monthRecords.forEach((record) => {
      if (record.status === STATUS.PRESENT) result.present++;
      if (record.status === STATUS.ABSENT) result.absent++;
      if (record.status === STATUS.LATE) result.late++;
      if (record.status === STATUS.EXCUSED) result.excused++;
    });

    return {
      ...result,
      percentage: calculatePercentage(
        result.present,
        result.late,
        result.total
      ),
    };
  }, [monthRecords]);

  /* =======================================================
     FILTERED HISTORY
  ======================================================= */

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      const matchesSearch =
        !query ||
        record.date.toLowerCase().includes(query) ||
        record.status?.toLowerCase().includes(query) ||
        record.note?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [records, statusFilter, search]);

  /* =======================================================
     CALENDAR
  ======================================================= */

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();

    const daysInMonth = getDaysInMonth(year, month);

    const cells = [];

    for (let i = 0; i < startingDay; i++) {
      cells.push({
        empty: true,
        key: `empty-${i}`,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);

      const key = formatDateKey(date);

      const record = attendance[key]?.records?.[student?.id];

      cells.push({
        empty: false,
        day,
        key,
        record,
      });
    }

    return cells;
  }, [currentMonth, attendance, student]);

  /* =======================================================
     MONTH NAVIGATION
  ======================================================= */

  const previousMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  /* =======================================================
     PRINT
  ======================================================= */

  const printAttendance = () => {
    window.print();
  };

  /* =======================================================
     CSV EXPORT
  ======================================================= */

  const exportCSV = () => {
    if (!student) return;

    const headers = [
      "Date",
      "Student",
      "Admission Number",
      "Class",
      "Status",
      "Reason",
      "Marked At",
    ];

    const rows = filteredRecords.map((record) => [
      record.date,
      student.fullName ||
        `${student.firstName || ""} ${student.lastName || ""}`.trim(),
      student.admissionNo || "",
      student.className || "",
      record.status || "",
      record.note || "",
      record.markedAt || "",
    ]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${student.fullName || "student"}-attendance.csv`;

    link.click();

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading attendance...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!student) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <UserX size={30} />
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-900">
            Student Not Found
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            The student record could not be found in the school
            database.
          </p>

          <button
            onClick={() => navigate("/students")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft size={17} />
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  const studentName =
    student.fullName ||
    [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Unnamed Student";

  const avatar =
    student.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      studentName
    )}&background=0f172a&color=fff&bold=true`;

  const monthTitle = currentMonth.toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 pb-12 print:bg-white">
      {/* ===================================================
          PRINT HEADER
      =================================================== */}

      <div className="hidden print:block">
        <div className="border-b border-slate-300 pb-5">
          <h1 className="text-2xl font-black">
            Student Attendance Report
          </h1>

          <p className="mt-2 text-sm">
            {studentName} · {student.admissionNo || "No admission number"} ·{" "}
            {student.className || "Class not assigned"}
          </p>
        </div>
      </div>

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden bg-slate-950 text-white print:hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(`/students/${student.id}`)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Student Profile
          </button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={avatar}
                alt={studentName}
                className="h-20 w-20 rounded-2xl border-2 border-white/10 object-cover shadow-xl"
              />

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Attendance
                  </h1>

                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">
                    {student.status || "Active"}
                  </span>
                </div>

                <p className="mt-1 text-sm font-semibold text-slate-300">
                  {studentName}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {student.admissionNo || "No admission number"} ·{" "}
                  {student.className || "Class not assigned"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <Download size={16} />
                Export CSV
              </button>

              <button
                onClick={printAttendance}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                <Printer size={16} />
                Print
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard
            title="Attendance"
            value={`${statistics.percentage}%`}
            subtitle="Effective attendance"
            icon={TrendingUp}
            iconClass="bg-sky-50 text-sky-600"
          />

          <StatCard
            title="Present"
            value={statistics.present}
            subtitle="Days attended"
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Absent"
            value={statistics.absent}
            subtitle="Unexcused absence"
            icon={XCircle}
            iconClass="bg-red-50 text-red-600"
          />

          <StatCard
            title="Late"
            value={statistics.late}
            subtitle="Late arrivals"
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Excused"
            value={statistics.excused}
            subtitle="Approved absence"
            icon={ShieldCheck}
            iconClass="bg-sky-50 text-sky-600"
          />
        </section>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        <section className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          {/* Attendance Ring */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Overall Overview
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Attendance Health
                </h2>
              </div>

              <Activity className="text-sky-500" size={22} />
            </div>

            <div className="mt-6 flex flex-col items-center">
              <AttendanceRing percentage={statistics.percentage} />

              <p className="mt-4 max-w-sm text-center text-sm leading-6 text-slate-500">
                Effective attendance counts both{" "}
                <strong className="text-slate-700">
                  Present
                </strong>{" "}
                and{" "}
                <strong className="text-slate-700">
                  Late
                </strong>{" "}
                days as attended days.
              </p>
            </div>
          </div>

          {/* Monthly Summary */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Monthly Summary
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {monthTitle}
                </h2>
              </div>

              <button
                onClick={goToCurrentMonth}
                className="self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Current Month
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-600">
                  Present
                </p>

                <p className="mt-2 text-2xl font-black text-emerald-700">
                  {monthlyStats.present}
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-semibold text-red-600">
                  Absent
                </p>

                <p className="mt-2 text-2xl font-black text-red-700">
                  {monthlyStats.absent}
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-600">
                  Late
                </p>

                <p className="mt-2 text-2xl font-black text-amber-700">
                  {monthlyStats.late}
                </p>
              </div>

              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-xs font-semibold text-sky-600">
                  Excused
                </p>

                <p className="mt-2 text-2xl font-black text-sky-700">
                  {monthlyStats.excused}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">
                  Monthly attendance
                </span>

                <span className="text-lg font-black text-slate-900">
                  {monthlyStats.percentage}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-700"
                  style={{
                    width: `${monthlyStats.percentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            CALENDAR
        ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <CalendarDays size={21} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Attendance Calendar
                </p>

                <h2 className="text-xl font-black text-slate-900">
                  {monthTitle}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={previousMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={nextMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Legend */}

          <div className="mt-5 flex flex-wrap gap-3 border-b border-slate-100 pb-5">
            {Object.entries(STATUS_META).map(([status, meta]) => (
              <div
                key={status}
                className="flex items-center gap-2 text-xs font-semibold text-slate-500"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${meta.dot}`}
                />

                {status}
              </div>
            ))}
          </div>

          {/* Calendar */}

          <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-2">
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((day) => (
              <div
                key={day}
                className="pb-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-400 sm:text-xs"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((cell) => {
              if (cell.empty) {
                return (
                  <div
                    key={cell.key}
                    className="min-h-[62px] rounded-xl sm:min-h-[90px]"
                  />
                );
              }

              const status = cell.record?.status;
              const meta = status ? STATUS_META[status] : null;

              const isToday =
                cell.key === formatDateKey(new Date());

              return (
                <button
                  key={cell.key}
                  onClick={() => {
                    if (cell.record) {
                      setSelectedDate(cell.key);
                      setShowReason(true);
                    }
                  }}
                  className={`group relative min-h-[62px] rounded-xl border p-2 text-left transition-all duration-200 sm:min-h-[90px] ${
                    status
                      ? `${meta.classes} hover:-translate-y-0.5 hover:shadow-md`
                      : "border-slate-100 bg-slate-50/50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black ${
                        isToday
                          ? "flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white"
                          : status
                          ? "text-current"
                          : "text-slate-600"
                      }`}
                    >
                      {cell.day}
                    </span>

                    {status && (
                      <span
                        className={`h-2 w-2 rounded-full ${meta.dot}`}
                      />
                    )}
                  </div>

                  {status && (
                    <div className="mt-3 hidden sm:block">
                      <p className="text-[10px] font-bold uppercase tracking-wide">
                        {status}
                      </p>

                      {status === STATUS.EXCUSED &&
                        cell.record?.note && (
                          <p className="mt-1 line-clamp-2 text-[10px] opacity-70">
                            {cell.record.note}
                          </p>
                        )}
                    </div>
                  )}

                  {status && (
                    <div className="mt-2 sm:hidden">
                      <span
                        className={`mx-auto block h-1.5 w-1.5 rounded-full ${meta.dot}`}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* =================================================
            ATTENDANCE HISTORY
        ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Attendance Records
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Attendance History
                </h2>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search records..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 sm:w-56"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-sky-400"
                >
                  <option value="All">All statuses</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Excused">Excused</option>
                </select>
              </div>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CalendarDays size={25} />
              </div>

              <h3 className="mt-4 font-black text-slate-800">
                No attendance records
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Attendance records matching your filters will appear
                here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                        Date
                      </th>

                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                        Reason / Note
                      </th>

                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                        Marked At
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">
                        Details
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((record) => (
                      <tr
                        key={record.date}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">
                            {formatLongDate(record.date)}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {record.date}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={record.status} />
                        </td>

                        <td className="max-w-xs px-6 py-4">
                          {record.note ? (
                            <div className="flex items-start gap-2">
                              <Info
                                size={15}
                                className="mt-0.5 shrink-0 text-sky-500"
                              />

                              <p className="text-sm leading-5 text-slate-600">
                                {record.note}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              No note
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {record.markedAt
                            ? new Date(
                                record.markedAt
                              ).toLocaleString("en-NG")
                            : "-"}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedDate(record.date);
                              setShowReason(true);
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}

              <div className="space-y-3 p-4 md:hidden">
                {filteredRecords.map((record) => (
                  <button
                    key={record.date}
                    onClick={() => {
                      setSelectedDate(record.date);
                      setShowReason(true);
                    }}
                    className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-sky-200 hover:bg-sky-50/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-800">
                          {formatShortDate(record.date)}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {record.date}
                        </p>
                      </div>

                      <StatusBadge
                        status={record.status}
                        compact
                      />
                    </div>

                    {record.note && (
                      <div className="mt-3 flex gap-2 rounded-xl bg-slate-50 p-3">
                        <Info
                          size={14}
                          className="mt-0.5 shrink-0 text-sky-500"
                        />

                        <p className="text-xs leading-5 text-slate-600">
                          {record.note}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        {/* =================================================
            EXCUSED ABSENCES
        ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <FileText size={20} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Documentation
              </p>

              <h2 className="text-xl font-black text-slate-900">
                Excused Absences
              </h2>
            </div>
          </div>

          {records.filter(
            (record) => record.status === STATUS.EXCUSED
          ).length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <ShieldCheck
                size={25}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                No excused absences recorded.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {records
                .filter(
                  (record) =>
                    record.status === STATUS.EXCUSED
                )
                .map((record) => (
                  <div
                    key={record.date}
                    className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-800">
                          {formatShortDate(record.date)}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-sky-600">
                          Excused absence
                        </p>
                      </div>

                      <ShieldCheck
                        size={18}
                        className="text-sky-500"
                      />
                    </div>

                    <div className="mt-4 rounded-xl bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Reason
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-700">
                        {record.note ||
                          "No reason was provided."}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </main>

      {/* ===================================================
          DATE DETAILS MODAL
      =================================================== */}

      {showReason && selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setShowReason(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            {(() => {
              const record =
                attendance[selectedDate]?.records?.[
                  student.id
                ];

              if (!record) return null;

              const meta = STATUS_META[record.status];

              return (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        Attendance Detail
                      </p>

                      <h3 className="mt-1 text-xl font-black text-slate-900">
                        {formatShortDate(selectedDate)}
                      </h3>
                    </div>

                    <button
                      onClick={() => setShowReason(false)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>

                  <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <span className="text-sm font-bold text-slate-600">
                      Status
                    </span>

                    <StatusBadge status={record.status} />
                  </div>

                  {record.status === STATUS.EXCUSED && (
                    <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-sky-600">
                        Excuse Reason
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {record.note ||
                          "No reason was provided."}
                      </p>
                    </div>
                  )}

                  {record.status !== STATUS.EXCUSED &&
                    record.note && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                          Note
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {record.note}
                        </p>
                      </div>
                    )}

                  <div className="mt-4 text-xs text-slate-400">
                    Marked at:{" "}
                    {record.markedAt
                      ? new Date(
                          record.markedAt
                        ).toLocaleString("en-NG")
                      : "Unknown"}
                  </div>

                  <button
                    onClick={() => setShowReason(false)}
                    className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    Close
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ===================================================
          PRINT STYLES
      =================================================== */}

      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            .print\\\\:hidden {
              display: none !important;
            }

            button {
              display: none !important;
            }

            section {
              break-inside: avoid;
            }

            @page {
              margin: 15mm;
            }
          }
        `}
      </style>
    </div>
  );
}