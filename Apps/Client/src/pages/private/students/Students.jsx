import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  Ban,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Edit3,
  Eye,
  FileText,
  Filter,
  Grid2X2,
  GraduationCap,
  LayoutList,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  WalletCards,
  X,
} from "lucide-react";

const STORAGE_KEY = "school_students";

const demoStudents = [
  {
    id: "stu_001",
    admissionNo: "ADM-2026-0001",
    fullName: "Aisha Mohammed",
    gender: "Female",
    section: "Primary",
    className: "Primary 5",
    parentName: "Mohammed Ibrahim",
    parentPhone: "08031234567",
    attendance: 96,
    feeBalance: 0,
    status: "Active",
    photo: "",
  },
  {
    id: "stu_002",
    admissionNo: "ADM-2026-0002",
    fullName: "Abdullahi Yusuf",
    gender: "Male",
    section: "JSS",
    className: "JSS 2",
    parentName: "Yusuf Abdullahi",
    parentPhone: "08045678901",
    attendance: 91,
    feeBalance: 25000,
    status: "Active",
    photo: "",
  },
  {
    id: "stu_003",
    admissionNo: "ADM-2026-0003",
    fullName: "Fatima Ali",
    gender: "Female",
    section: "SS",
    className: "SS 2",
    parentName: "Ali Hassan",
    parentPhone: "08098765432",
    attendance: 87,
    feeBalance: 45000,
    status: "Active",
    photo: "",
  },
  {
    id: "stu_004",
    admissionNo: "ADM-2026-0004",
    fullName: "Ibrahim Musa",
    gender: "Male",
    section: "Nursery",
    className: "Nursery 2",
    parentName: "Musa Bello",
    parentPhone: "08011112222",
    attendance: 98,
    feeBalance: 0,
    status: "Active",
    photo: "",
  },
  {
    id: "stu_005",
    admissionNo: "ADM-2026-0005",
    fullName: "Maryam Sani",
    gender: "Female",
    section: "JSS",
    className: "JSS 3",
    parentName: "Sani Ibrahim",
    parentPhone: "08033334444",
    attendance: 79,
    feeBalance: 15000,
    status: "Active",
    photo: "",
  },
  {
    id: "stu_006",
    admissionNo: "ADM-2025-0144",
    fullName: "Usman Ahmed",
    gender: "Male",
    section: "SS",
    className: "SS 3",
    parentName: "Ahmed Umar",
    parentPhone: "08055556666",
    attendance: 94,
    feeBalance: 0,
    status: "Graduated",
    photo: "",
  },
  {
    id: "stu_007",
    admissionNo: "ADM-2026-0007",
    fullName: "Zainab Garba",
    gender: "Female",
    section: "SS",
    className: "SS 1",
    parentName: "Garba Ibrahim",
    parentPhone: "08077778888",
    attendance: 68,
    feeBalance: 70000,
    status: "Suspended",
    photo: "",
  },
];

const sectionClasses = {
  Nursery: ["Nursery 1", "Nursery 2", "Nursery 3"],
  Primary: [
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
  ],
  JSS: ["JSS 1", "JSS 2", "JSS 3"],
  SS: ["SS 1", "SS 2", "SS 3"],
};

function getStudents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoStudents));
      return demoStudents;
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : demoStudents;
  } catch {
    return demoStudents;
  }
}

function saveStudents(students) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function money(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

function attendanceLevel(value) {
  if (value >= 90) return "excellent";
  if (value >= 80) return "good";
  if (value >= 70) return "watch";
  return "low";
}

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Suspended: "bg-rose-50 text-rose-700 border-rose-100",
    Graduated: "bg-violet-50 text-violet-700 border-violet-100",
    Inactive: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        styles[status] || styles.Inactive
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function StudentAvatar({ student, size = "normal" }) {
  const sizes =
    size === "large"
      ? "h-16 w-16 text-lg rounded-2xl"
      : size === "small"
        ? "h-9 w-9 text-[10px] rounded-xl"
        : "h-11 w-11 text-xs rounded-xl";

  if (student.photo) {
    return (
      <img
        src={student.photo}
        alt={student.fullName}
        className={`${sizes} object-cover shadow-sm ring-2 ring-white`}
      />
    );
  }

  return (
    <div
      className={`${sizes} flex shrink-0 items-center justify-center bg-slate-950 font-bold text-white shadow-sm`}
    >
      {initials(student.fullName)}
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  description,
  type = "blue",
}) {
  const themes = {
    blue: "bg-sky-50 text-sky-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-violet-50 text-violet-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100/60 transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${themes[type]} transition-transform duration-500 group-hover:rotate-6`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10"
        >
          <option value="">All</option>

          {options.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </label>
  );
}

function AttendanceBar({ value }) {
  const level = attendanceLevel(value);

  const colors = {
    excellent: "bg-emerald-500",
    good: "bg-sky-500",
    watch: "bg-amber-500",
    low: "bg-rose-500",
  };

  const text = {
    excellent: "text-emerald-600",
    good: "text-sky-600",
    watch: "text-amber-600",
    low: "text-rose-600",
  };

  return (
    <div className="w-32">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">{value}%</span>
        <span className={`text-[10px] font-semibold ${text[level]}`}>
          {level === "excellent"
            ? "Excellent"
            : level === "good"
              ? "Good"
              : level === "watch"
                ? "Watch"
                : "Low"}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colors[level]} transition-all duration-700`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function EmptyState({ clearFilters, register }) {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-3xl bg-sky-100 opacity-30" />

        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
          <Users size={34} />
        </div>
      </div>

      <h3 className="mt-6 text-xl font-black text-slate-950">
        No students found
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Try adjusting your search or filters. If this is a new school session,
        you can register your first student from here.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Clear Filters
        </button>

        <button
          type="button"
          onClick={register}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          <Plus size={16} />
          Register Student
        </button>
      </div>
    </div>
  );
}

export default function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    section: "",
    className: "",
    gender: "",
    status: "",
    feeStatus: "",
    attendance: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState("table");
  const [selected, setSelected] = useState([]);
  const [menu, setMenu] = useState(null);
  const [page, setPage] = useState(1);

  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const pageSize = 8;

  useEffect(() => {
    setStudents(getStudents());
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(() => {
    const total = students.length;

    const active = students.filter(
      (student) => student.status === "Active"
    ).length;

    const suspended = students.filter(
      (student) => student.status === "Suspended"
    ).length;

    const graduated = students.filter(
      (student) => student.status === "Graduated"
    ).length;

    const male = students.filter(
      (student) => student.gender === "Male"
    ).length;

    const female = students.filter(
      (student) => student.gender === "Female"
    ).length;

    const outstanding = students.reduce(
      (sum, student) => sum + Number(student.feeBalance || 0),
      0
    );

    return {
      total,
      active,
      suspended,
      graduated,
      male,
      female,
      outstanding,
    };
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return students.filter((student) => {
      const searchable = [
        student.fullName,
        student.admissionNo,
        student.parentName,
        student.parentPhone,
        student.className,
        student.section,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const searchMatch = !q || searchable.includes(q);

      const sectionMatch =
        !filters.section || student.section === filters.section;

      const classMatch =
        !filters.className || student.className === filters.className;

      const genderMatch =
        !filters.gender || student.gender === filters.gender;

      const statusMatch =
        !filters.status || student.status === filters.status;

      const balance = Number(student.feeBalance || 0);

      const feeMatch =
        !filters.feeStatus ||
        (filters.feeStatus === "Paid" && balance <= 0) ||
        (filters.feeStatus === "Outstanding" && balance > 0);

      const attendance = Number(student.attendance || 0);

      const attendanceMatch =
        !filters.attendance ||
        (filters.attendance === "Excellent" && attendance >= 90) ||
        (filters.attendance === "Good" &&
          attendance >= 80 &&
          attendance < 90) ||
        (filters.attendance === "Watch" &&
          attendance >= 70 &&
          attendance < 80) ||
        (filters.attendance === "Low" && attendance < 70);

      return (
        searchMatch &&
        sectionMatch &&
        classMatch &&
        genderMatch &&
        statusMatch &&
        feeMatch &&
        attendanceMatch
      );
    });
  }, [students, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const visible = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const allVisibleSelected =
    visible.length > 0 &&
    visible.every((student) => selected.includes(student.id));

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function notify(message, type = "success") {
    setToast({ message, type });
  }

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "section" ? { className: "" } : {}),
    }));
  }

  function clearFilters() {
    setSearch("");

    setFilters({
      section: "",
      className: "",
      gender: "",
      status: "",
      feeStatus: "",
      attendance: "",
    });
  }

  function toggleSelected(id) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAll() {
    const ids = visible.map((student) => student.id);

    if (allVisibleSelected) {
      setSelected((current) =>
        current.filter((id) => !ids.includes(id))
      );
    } else {
      setSelected((current) => [...new Set([...current, ...ids])]);
    }
  }

  function deleteStudent(student) {
    setConfirm({
      type: "delete",
      student,
    });
  }

  function changeStatus(student) {
    const suspended = student.status === "Suspended";

    setConfirm({
      type: suspended ? "activate" : "suspend",
      student,
    });
  }

  function executeConfirm() {
    if (!confirm) return;

    if (confirm.type === "delete") {
      const updated = students.filter(
        (student) => student.id !== confirm.student.id
      );

      setStudents(updated);
      saveStudents(updated);

      setSelected((current) =>
        current.filter((id) => id !== confirm.student.id)
      );

      notify(`${confirm.student.fullName} was removed.`);
    }

    if (confirm.type === "suspend") {
      const updated = students.map((student) =>
        student.id === confirm.student.id
          ? { ...student, status: "Suspended" }
          : student
      );

      setStudents(updated);
      saveStudents(updated);

      notify(`${confirm.student.fullName} has been suspended.`);
    }

    if (confirm.type === "activate") {
      const updated = students.map((student) =>
        student.id === confirm.student.id
          ? { ...student, status: "Active" }
          : student
      );

      setStudents(updated);
      saveStudents(updated);

      notify(`${confirm.student.fullName} has been activated.`);
    }

    if (confirm.type === "bulkDelete") {
      const updated = students.filter(
        (student) => !selected.includes(student.id)
      );

      setStudents(updated);
      saveStudents(updated);
      setSelected([]);

      notify("Selected student records were removed.");
    }

    setConfirm(null);
  }

  function bulkStatus(status) {
    if (!selected.length) return;

    const updated = students.map((student) =>
      selected.includes(student.id)
        ? { ...student, status }
        : student
    );

    setStudents(updated);
    saveStudents(updated);
    setSelected([]);

    notify(
      `${selected.length} student${
        selected.length > 1 ? "s" : ""
      } ${
        status === "Active" ? "activated" : "suspended"
      }.`
    );
  }

  function exportCSV() {
    if (!filtered.length) {
      notify("There are no records to export.", "error");
      return;
    }

    const headers = [
      "Admission No",
      "Full Name",
      "Gender",
      "Section",
      "Class",
      "Parent",
      "Parent Phone",
      "Attendance",
      "Fee Balance",
      "Status",
    ];

    const rows = filtered.map((student) => [
      student.admissionNo,
      student.fullName,
      student.gender,
      student.section,
      student.className,
      student.parentName,
      student.parentPhone,
      `${student.attendance || 0}%`,
      student.feeBalance || 0,
      student.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "students.csv";
    anchor.click();

    URL.revokeObjectURL(url);

    notify("Student directory exported successfully.");
  }

  function printStudents() {
    const rows = filtered
      .map(
        (student) => `
          <tr>
            <td>${student.admissionNo || "-"}</td>
            <td>${student.fullName || "-"}</td>
            <td>${student.gender || "-"}</td>
            <td>${student.section || "-"}</td>
            <td>${student.className || "-"}</td>
            <td>${student.parentName || "-"}</td>
            <td>${student.attendance || 0}%</td>
            <td>${student.status || "-"}</td>
          </tr>
        `
      )
      .join("");

    const popup = window.open(
      "",
      "_blank",
      "width=1200,height=800"
    );

    if (!popup) {
      notify("Please allow popups to print.", "error");
      return;
    }

    popup.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Student Directory</title>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 35px;
              color: #0f172a;
            }

            .header {
              text-align: center;
              margin-bottom: 30px;
            }

            .header h1 {
              margin: 0;
              font-size: 26px;
            }

            .header p {
              color: #64748b;
              margin: 6px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid #e2e8f0;
              padding: 9px;
              font-size: 11px;
              text-align: left;
            }

            th {
              background: #f8fafc;
            }

            .footer {
              margin-top: 30px;
              font-size: 10px;
              color: #64748b;
            }
          </style>
        </head>

        <body>
          <div class="header">
            <h1>School Student Directory</h1>
            <p>Student Management Register</p>
            <p>Total Records: ${filtered.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Student</th>
                <th>Gender</th>
                <th>Section</th>
                <th>Class</th>
                <th>Parent</th>
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            Generated: ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `);

    popup.document.close();
    popup.focus();
    popup.print();
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1800px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* ========================================================= */}
        {/* HERO */}
        {/* ========================================================= */}

        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl sm:p-8 lg:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="absolute right-8 top-8 hidden opacity-10 lg:block">
            <Users size={150} strokeWidth={1} />
          </div>

          <div className="relative z-10 max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-sky-200 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Student Management System
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              All Students
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              A central workspace for managing enrollment, student identity,
              classes, attendance, academic performance, financial records,
              documents and the complete student lifecycle.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300">
                {stats.active} Active
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300">
                {stats.total} Total Records
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300">
                2026/2027 Session
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 flex flex-wrap gap-3 lg:absolute lg:bottom-10 lg:right-10 lg:mt-0">
            <button
              type="button"
              onClick={() => navigate("/students/register")}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-slate-100 hover:shadow-xl"
            >
              <UserPlus size={17} />
              Register Student
            </button>

            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              <Download size={17} />
              Export
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* STATISTICS */}
        {/* ========================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            icon={Users}
            title="Total Students"
            value={stats.total}
            description="All registered records"
            type="blue"
          />

          <StatCard
            icon={UserCheck}
            title="Active"
            value={stats.active}
            description="Currently enrolled"
            type="green"
          />

          <StatCard
            icon={UserPlus}
            title="Male"
            value={stats.male}
            description="Male students"
            type="purple"
          />

          <StatCard
            icon={UserPlus}
            title="Female"
            value={stats.female}
            description="Female students"
            type="rose"
          />

          <StatCard
            icon={GraduationCap}
            title="Graduated"
            value={stats.graduated}
            description="Completed students"
            type="purple"
          />

          <StatCard
            icon={WalletCards}
            title="Outstanding"
            value={money(stats.outstanding)}
            description="Unpaid balances"
            type="amber"
          />
        </section>

        {/* ========================================================= */}
        {/* DIRECTORY */}
        {/* ========================================================= */}

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative flex-1 xl:max-w-2xl">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students, admission number, class, parent or phone..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm font-medium text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters((v) => !v)}
                  className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all ${
                    showFilters || activeFilterCount
                      ? "border-sky-200 bg-sky-50 text-sky-700"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <SlidersHorizontal size={17} />
                  Filters

                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={printStudents}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Printer size={17} />
                  <span className="hidden sm:block">Print</span>
                </button>

                <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setView("table")}
                    className={`rounded-lg p-2.5 transition ${
                      view === "table"
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <LayoutList size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={`rounded-lg p-2.5 transition ${
                      view === "grid"
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <Grid2X2 size={17} />
                  </button>
                </div>
              </div>
            </div>

            {/* ===================================================== */}
            {/* FILTER PANEL */}
            {/* ===================================================== */}

            <div
              className={`grid overflow-hidden transition-all duration-500 ${
                showFilters
                  ? "mt-5 grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-sky-600" />

                      <h3 className="text-sm font-bold text-slate-900">
                        Advanced Filters
                      </h3>
                    </div>

                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-xs font-bold text-sky-700 hover:underline"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <SelectField
                      label="Section"
                      value={filters.section}
                      onChange={(value) =>
                        updateFilter("section", value)
                      }
                      options={Object.keys(sectionClasses)}
                    />

                    <SelectField
                      label="Class"
                      value={filters.className}
                      onChange={(value) =>
                        updateFilter("className", value)
                      }
                      options={
                        filters.section
                          ? sectionClasses[filters.section] || []
                          : Object.values(sectionClasses).flat()
                      }
                    />

                    <SelectField
                      label="Gender"
                      value={filters.gender}
                      onChange={(value) =>
                        updateFilter("gender", value)
                      }
                      options={["Male", "Female"]}
                    />

                    <SelectField
                      label="Status"
                      value={filters.status}
                      onChange={(value) =>
                        updateFilter("status", value)
                      }
                      options={[
                        "Active",
                        "Suspended",
                        "Graduated",
                        "Inactive",
                      ]}
                    />

                    <SelectField
                      label="Fee Status"
                      value={filters.feeStatus}
                      onChange={(value) =>
                        updateFilter("feeStatus", value)
                      }
                      options={["Paid", "Outstanding"]}
                    />

                    <SelectField
                      label="Attendance"
                      value={filters.attendance}
                      onChange={(value) =>
                        updateFilter("attendance", value)
                      }
                      options={[
                        "Excellent",
                        "Good",
                        "Watch",
                        "Low",
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* BULK ACTION BAR */}
          {/* ========================================================= */}

          {selected.length > 0 && (
            <div className="animate-[fadeSlide_0.3s_ease-out] border-b border-sky-100 bg-sky-50 px-4 py-3 sm:px-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-xs font-black text-white shadow-sm">
                    {selected.length}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-sky-950">
                      {selected.length} student
                      {selected.length > 1 ? "s" : ""} selected
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelected([])}
                      className="text-xs text-sky-700 hover:underline"
                    >
                      Clear selection
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      notify(
                        "Messaging will connect to the communication module."
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Mail size={14} />
                    Message
                  </button>

                  <button
                    type="button"
                    onClick={() => bulkStatus("Active")}
                    className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    <UserCheck size={14} />
                    Activate
                  </button>

                  <button
                    type="button"
                    onClick={() => bulkStatus("Suspended")}
                    className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    <Ban size={14} />
                    Suspend
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirm({
                        type: "bulkDelete",
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Directory heading */}
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-950">
                  Student Directory
                </h2>

                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {filtered.length}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                Manage and access every student record from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setStudents(getStudents());
                notify("Student records refreshed.");
              }}
              className="inline-flex items-center gap-2 self-start rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
            >
              <RefreshCw size={14} />
              Refresh records
            </button>
          </div>

          {/* ========================================================= */}
          {/* TABLE */}
          {/* ========================================================= */}

          {view === "table" && (
            <div className="overflow-x-auto">
              {visible.length > 0 ? (
                <table className="min-w-[1150px] w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="w-12 px-5 py-3">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Student
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Class
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Parent / Guardian
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Attendance
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Fees
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visible.map((student) => (
                      <StudentRow
                        key={student.id}
                        student={student}
                        selected={selected.includes(student.id)}
                        menuOpen={menu === student.id}
                        onSelect={() => toggleSelected(student.id)}
                        onMenu={() =>
                          setMenu(
                            menu === student.id ? null : student.id
                          )
                        }
                        onCloseMenu={() => setMenu(null)}
                        onView={() =>
                          navigate(`/students/${student.id}`)
                        }
                        onEdit={() =>
                          navigate(`/students/${student.id}/edit`)
                        }
                        onReport={() =>
                          navigate(
                            `/students/${student.id}/report`
                          )
                        }
                        onAttendance={() =>
                          navigate(
                            `/students/${student.id}/attendance`
                          )
                        }
                        onResults={() =>
                          navigate(
                            `/students/${student.id}/results`
                          )
                        }
                        onFees={() =>
                          navigate(`/students/${student.id}/fees`)
                        }
                        onStatus={() => changeStatus(student)}
                        onDelete={() => deleteStudent(student)}
                      />
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  clearFilters={clearFilters}
                  register={() => navigate("/students/register")}
                />
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* GRID */}
          {/* ========================================================= */}

          {view === "grid" && (
            <div className="p-4 sm:p-6">
              {visible.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {visible.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      selected={selected.includes(student.id)}
                      onSelect={() => toggleSelected(student.id)}
                      onView={() =>
                        navigate(`/students/${student.id}`)
                      }
                      onEdit={() =>
                        navigate(`/students/${student.id}/edit`)
                      }
                      onReport={() =>
                        navigate(`/students/${student.id}/report`)
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  clearFilters={clearFilters}
                  register={() => navigate("/students/register")}
                />
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGINATION */}
          {/* ========================================================= */}

          {filtered.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <strong>
                  {(page - 1) * pageSize + 1}
                </strong>{" "}
                to{" "}
                <strong>
                  {Math.min(page * pageSize, filtered.length)}
                </strong>{" "}
                of <strong>{filtered.length}</strong>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white">
                  {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* SYSTEM INSIGHT */}
        {/* ========================================================= */}

        <section className="grid gap-4 lg:grid-cols-3">
          <Insight
            icon={Activity}
            title="Student Lifecycle"
            text="Admissions, registration, enrollment, active status, promotion, transfer, suspension and graduation can all be connected to the same student record."
          />

          <Insight
            icon={BarChart3}
            title="Academic Intelligence"
            text="Student profiles will connect attendance, assignments, examinations, results, report cards and academic performance."
          />

          <Insight
            icon={WalletCards}
            title="Financial Visibility"
            text="Invoices, payments, receipts, scholarships, discounts and outstanding balances will remain linked to each student."
          />
        </section>
      </div>

      {/* ============================================================= */}
      {/* CONFIRMATION */}
      {/* ============================================================= */}

      {confirm && (
        <ConfirmModal
          confirm={confirm}
          onClose={() => setConfirm(null)}
          onConfirm={executeConfirm}
        />
      )}

      {/* ============================================================= */}
      {/* TOAST */}
      {/* ============================================================= */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] animate-[toastIn_0.35s_ease-out]">
          <div className="flex max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                toast.type === "error"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {toast.type === "error" ? (
                <X size={17} />
              ) : (
                <Check size={17} />
              )}
            </div>

            <div>
              <p className="text-sm font-black text-slate-950">
                {toast.type === "error" ? "Attention" : "Success"}
              </p>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(15px) scale(.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function StudentRow({
  student,
  selected,
  menuOpen,
  onSelect,
  onMenu,
  onCloseMenu,
  onView,
  onEdit,
  onReport,
  onAttendance,
  onResults,
  onFees,
  onStatus,
  onDelete,
}) {
  return (
    <tr
      className={`group transition-all duration-300 hover:bg-slate-50 ${
        selected ? "bg-sky-50/50" : ""
      }`}
    >
      <td className="px-5 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
        />
      </td>

      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
          <StudentAvatar student={student} />

          <div className="min-w-0">
            <Link
              to={`/students/${student.id}`}
              className="block max-w-[230px] truncate text-sm font-black text-slate-900 transition hover:text-sky-700"
            >
              {student.fullName}
            </Link>

            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
              <span>{student.admissionNo}</span>
              <span>•</span>
              <span>{student.gender}</span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-3 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <BookOpen size={14} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              {student.className}
            </p>

            <p className="text-[11px] text-slate-400">
              {student.section}
            </p>
          </div>
        </div>
      </td>

      <td className="px-3 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {student.parentName || "Not provided"}
          </p>

          {student.parentPhone && (
            <a
              href={`tel:${student.parentPhone}`}
              className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400 transition hover:text-sky-600"
            >
              <Phone size={11} />
              {student.parentPhone}
            </a>
          )}
        </div>
      </td>

      <td className="px-3 py-4">
        <AttendanceBar value={Number(student.attendance || 0)} />
      </td>

      <td className="px-3 py-4">
        {Number(student.feeBalance || 0) > 0 ? (
          <div>
            <p className="text-sm font-black text-rose-600">
              {money(student.feeBalance)}
            </p>

            <p className="mt-0.5 text-[10px] font-semibold text-rose-400">
              Outstanding
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-black text-emerald-600">
              Paid
            </p>

            <p className="mt-0.5 text-[10px] text-emerald-400">
              No balance
            </p>
          </div>
        )}
      </td>

      <td className="px-3 py-4">
        <StatusBadge status={student.status} />
      </td>

      <td className="px-3 py-4">
        <div className="relative flex justify-end">
          <button
            type="button"
            onClick={onMenu}
            className={`rounded-xl p-2.5 transition-all duration-200 ${
              menuOpen
                ? "bg-slate-950 text-white"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 origin-top-right animate-[menuIn_0.2s_ease-out] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl">
              <MenuItem
                icon={Eye}
                label="View Student Profile"
                onClick={() => {
                  onView();
                  onCloseMenu();
                }}
              />

              <MenuItem
                icon={Edit3}
                label="Edit Student"
                onClick={() => {
                  onEdit();
                  onCloseMenu();
                }}
              />

              <MenuItem
                icon={FileText}
                label="Student Report"
                onClick={() => {
                  onReport();
                  onCloseMenu();
                }}
              />

              <MenuItem
                icon={ClipboardList}
                label="Attendance"
                onClick={() => {
                  onAttendance();
                  onCloseMenu();
                }}
              />

              <MenuItem
                icon={BarChart3}
                label="Results"
                onClick={() => {
                  onResults();
                  onCloseMenu();
                }}
              />

              <MenuItem
                icon={WalletCards}
                label="Fees & Payments"
                onClick={() => {
                  onFees();
                  onCloseMenu();
                }}
              />

              <div className="my-1 border-t border-slate-100" />

              <MenuItem
                icon={student.status === "Suspended" ? UserCheck : UserX}
                label={
                  student.status === "Suspended"
                    ? "Activate Student"
                    : "Suspend Student"
                }
                onClick={() => {
                  onStatus();
                  onCloseMenu();
                }}
              />

              <MenuItem
                icon={Trash2}
                label="Delete Student"
                danger
                onClick={() => {
                  onDelete();
                  onCloseMenu();
                }}
              />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function StudentCard({
  student,
  selected,
  onSelect,
  onView,
  onEdit,
  onReport,
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border bg-white p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
        selected
          ? "border-sky-300 ring-4 ring-sky-500/5"
          : "border-slate-200"
      }`}
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-slate-50 transition-all duration-500 group-hover:h-32 group-hover:w-32" />

      <div className="relative flex items-start justify-between">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
        />

        <StatusBadge status={student.status} />
      </div>

      <div className="relative mt-6 flex flex-col items-center text-center">
        <StudentAvatar student={student} size="large" />

        <button
          type="button"
          onClick={onView}
          className="mt-4 text-base font-black text-slate-950 transition hover:text-sky-700"
        >
          {student.fullName}
        </button>

        <p className="mt-1 text-xs text-slate-400">
          {student.admissionNo}
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
          <BookOpen size={13} />
          {student.className}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Attendance
          </p>

          <p className="mt-1 text-sm font-black text-slate-900">
            {student.attendance || 0}%
          </p>

          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{
                width: `${Math.min(
                  100,
                  Number(student.attendance || 0)
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Balance
          </p>

          <p
            className={`mt-1 text-sm font-black ${
              Number(student.feeBalance || 0) > 0
                ? "text-rose-600"
                : "text-emerald-600"
            }`}
          >
            {Number(student.feeBalance || 0) > 0
              ? money(student.feeBalance)
              : "Paid"}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-bold text-slate-700">
          Parent / Guardian
        </p>

        <p className="mt-1 truncate text-xs text-slate-500">
          {student.parentName || "Not provided"}
        </p>

        {student.parentPhone && (
          <a
            href={`tel:${student.parentPhone}`}
            className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-sky-600"
          >
            <Phone size={11} />
            {student.parentPhone}
          </a>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50"
        >
          <Eye size={14} />
          View
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 py-2.5 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          <Edit3 size={14} />
          Edit
        </button>
      </div>

      <button
        type="button"
        onClick={onReport}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-slate-400 transition hover:bg-sky-50 hover:text-sky-700"
      >
        <ArrowUpRight size={13} />
        Open complete student record
      </button>
    </article>
  );
}

function Insight({ icon: Icon, title, text }) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-transform duration-300 group-hover:rotate-6">
          <Icon size={19} />
        </div>

        <div>
          <h3 className="text-sm font-black text-slate-950">
            {title}
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ confirm, onClose, onConfirm }) {
  const deleteAction =
    confirm.type === "delete" ||
    confirm.type === "bulkDelete";

  const suspendAction = confirm.type === "suspend";

  const title = deleteAction
    ? "Delete student record?"
    : suspendAction
      ? "Suspend student?"
      : "Activate student?";

  const description =
    confirm.type === "bulkDelete"
      ? `You are about to delete ${confirm.count || "the selected"} student records.`
      : deleteAction
        ? `The record for ${confirm.student?.fullName} will be removed from the current browser storage.`
        : suspendAction
          ? `${confirm.student?.fullName} will be marked as suspended.`
          : `${confirm.student?.fullName} will be returned to active status.`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-[modalIn_0.25s_ease-out] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="p-6 sm:p-7">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              deleteAction
                ? "bg-rose-50 text-rose-600"
                : suspendAction
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {deleteAction ? (
              <Trash2 size={21} />
            ) : suspendAction ? (
              <Ban size={21} />
            ) : (
              <UserCheck size={21} />
            )}
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-950">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>

          {deleteAction && (
            <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
              This action cannot be undone.
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-100 bg-slate-50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-black text-white ${
              deleteAction
                ? "bg-rose-600 hover:bg-rose-700"
                : suspendAction
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {deleteAction
              ? "Delete"
              : suspendAction
                ? "Suspend"
                : "Activate"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(15px) scale(.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}