import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Download,
  Edit3,
  FileText,
  GraduationCap,
  HeartPulse,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Printer,
  Receipt,
  School,
  Search,
  ShieldCheck,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  UserX,
  Wallet,
  X,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ATTENDANCE = {
  present: 0,
  absent: 0,
  late: 0,
  excused: 0,
  total: 0,
  percentage: 0,
};

const EMPTY_ACADEMIC = {
  average: 0,
  position: "—",
  classAverage: 0,
  subjects: [],
};

const EMPTY_FEES = {
  registrationFee: 0,
  tuitionFee: 0,
  booksFee: 0,
  uniformFee: 0,
  transportFee: 0,
  otherFee: 0,
  discount: 0,
  scholarship: 0,
  subtotal: 0,
  total: 0,
  paid: 0,
  balance: 0,
  paymentStatus: "Pending",
};

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "personal", label: "Personal", icon: User },
  { id: "academic", label: "Academic", icon: GraduationCap },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
  { id: "results", label: "Results", icon: Award },
  { id: "assignments", label: "Assignments", icon: BookOpen },
  { id: "fees", label: "Fees", icon: Wallet },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "activity", label: "Activity", icon: Activity },
];

/* =========================================================
   HELPERS
========================================================= */

const money = (value) => {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const initials = (name = "") => {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST"
  );
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const getScore = (result) => {
  if (!result) return 0;

  return number(
    result.total ??
      result.score ??
      result.percentage ??
      result.mark ??
      result.examScore
  );
};

const calculateAverage = (results = []) => {
  const validScores = safeArray(results)
    .map(getScore)
    .filter((score) => Number.isFinite(score));

  if (!validScores.length) return 0;

  return (
    validScores.reduce((sum, score) => sum + score, 0) /
    validScores.length
  );
};

const getGrade = (score) => {
  const value = number(score);

  if (value >= 80) return "A";
  if (value >= 70) return "B";
  if (value >= 60) return "C";
  if (value >= 50) return "D";
  if (value >= 40) return "E";
  return "F";
};

const getGradeDescription = (score) => {
  const value = number(score);

  if (value >= 80) return "Excellent";
  if (value >= 70) return "Very Good";
  if (value >= 60) return "Good";
  if (value >= 50) return "Pass";
  if (value >= 40) return "Needs Improvement";
  return "Fail";
};

const getPerformance = (average) => {
  if (average >= 80) {
    return {
      label: "Excellent",
      description: "Outstanding academic performance",
    };
  }

  if (average >= 70) {
    return {
      label: "Very Good",
      description: "Strong academic performance",
    };
  }

  if (average >= 60) {
    return {
      label: "Good",
      description: "Good academic performance",
    };
  }

  if (average >= 50) {
    return {
      label: "Pass",
      description: "Satisfactory performance",
    };
  }

  if (average > 0) {
    return {
      label: "Needs Improvement",
      description: "Additional academic support may be useful",
    };
  }

  return {
    label: "No Results",
    description: "Results have not been entered yet",
  };
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeStudent = (student) => {
  if (!student) return null;

  const fees = {
    ...EMPTY_FEES,
    ...(student.fees || {}),
  };

  const attendance = {
    ...EMPTY_ATTENDANCE,
    ...(student.attendance || {}),
  };

  const academic = {
    ...EMPTY_ACADEMIC,
    ...(student.academic || {}),
  };

  const results = safeArray(student.results);
  const assignments = safeArray(student.assignments);
  const documents = safeArray(student.documents);
  const activity = safeArray(student.activity);
  const messages = safeArray(student.messages);

  const fullName =
    student.fullName ||
    [
      student.firstName,
      student.middleName,
      student.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Unnamed Student";

  return {
    ...student,

    id: student.id ?? "",
    fullName,
    firstName: student.firstName || "",
    middleName: student.middleName || "",
    lastName: student.lastName || "",

    status: student.status || "Active",

    attendance,
    academic,
    results,
    assignments,
    documents,
    activity,
    messages,
    fees,

    payment: {
      amount: 0,
      method: "",
      reference: "",
      date: "",
      ...(student.payment || {}),
    },
  };
};

const getStatusClasses = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "active") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (value === "graduated") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (value === "suspended") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (value === "inactive") {
    return "bg-slate-100 text-slate-600 border-slate-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
};

const getPaymentClasses = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "paid") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (value === "partial") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-red-50 text-red-700 border-red-200";
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function StatusBadge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  action,
  className = "",
}) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Icon className="h-5 w-5" />
            </div>
          )}

          <div>
            <h2 className="font-bold text-slate-900">{title}</h2>

            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function EmptyState({
  icon: Icon = FileText,
  title,
  description,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass = "bg-slate-100 text-slate-700",
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      {Icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
      )}

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function ProgressBar({ value, label, showValue = true }) {
  const percentage = Math.max(0, Math.min(100, number(value)));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        {label && <span className="font-medium text-slate-700">{label}</span>}

        {showValue && (
          <span className="font-bold text-slate-900">
            {Math.round(percentage)}%
          </span>
        )}
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-sky-500 transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showMenu, setShowMenu] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [toast, setToast] = useState(null);

  /* =======================================================
     LOAD STUDENT
  ======================================================= */

  useEffect(() => {
    setLoading(true);

    try {
      const raw = localStorage.getItem("school_students");

      const students = raw ? JSON.parse(raw) : [];

      const foundStudent = Array.isArray(students)
        ? students.find(
            (item) => String(item?.id) === String(id)
          )
        : null;

      setStudent(normalizeStudent(foundStudent));
    } catch (error) {
      console.error("Failed to load student:", error);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* =======================================================
     TOAST
  ======================================================= */

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const notify = (message, type = "success") => {
    setToast({ message, type });
  };

  /* =======================================================
     CALCULATED DATA
  ======================================================= */

  const calculated = useMemo(() => {
    if (!student) {
      return {
        average: 0,
        performance: getPerformance(0),
        attendance: EMPTY_ATTENDANCE,
        fees: EMPTY_FEES,
        balance: 0,
        totalFees: 0,
        subjectResults: [],
        gradeDistribution: {},
      };
    }

    const results = safeArray(student.results);

    const average =
      results.length > 0
        ? calculateAverage(results)
        : number(student.academic?.average);

    const attendance = {
      ...EMPTY_ATTENDANCE,
      ...(student.attendance || {}),
    };

    const attendanceTotal =
      number(attendance.total) ||
      number(attendance.present) +
        number(attendance.absent) +
        number(attendance.late) +
        number(attendance.excused);

    const calculatedAttendancePercentage =
      attendanceTotal > 0
        ? ((number(attendance.present) +
            number(attendance.late)) /
            attendanceTotal) *
          100
        : number(attendance.percentage);

    const fees = {
      ...EMPTY_FEES,
      ...(student.fees || {}),
    };

    const totalFees =
      number(fees.total) ||
      Math.max(
        0,
        number(fees.registrationFee) +
          number(fees.tuitionFee) +
          number(fees.booksFee) +
          number(fees.uniformFee) +
          number(fees.transportFee) +
          number(fees.otherFee) -
          number(fees.discount) -
          number(fees.scholarship)
      );

    const balance = Math.max(
      0,
      number(fees.balance) || totalFees - number(fees.paid)
    );

    const subjectResults = results.map((result, index) => ({
      ...result,
      id: result.id || `result-${index}`,
      subject:
        result.subject ||
        result.subjectName ||
        `Subject ${index + 1}`,
      score: getScore(result),
      grade: result.grade || getGrade(getScore(result)),
    }));

    const gradeDistribution = subjectResults.reduce(
      (accumulator, result) => {
        const grade = result.grade || getGrade(result.score);

        accumulator[grade] = (accumulator[grade] || 0) + 1;

        return accumulator;
      },
      {}
    );

    return {
      average,
      performance: getPerformance(average),
      attendance: {
        ...attendance,
        total: attendanceTotal,
        percentage: Math.round(
          Math.max(
            0,
            Math.min(100, calculatedAttendancePercentage)
          )
        ),
      },
      fees: {
        ...fees,
        total: totalFees,
        balance,
      },
      balance,
      totalFees,
      subjectResults,
      gradeDistribution,
    };
  }, [student]);

  /* =======================================================
     PRINT PROFILE
  ======================================================= */

  const printProfile = () => {
    if (!student) return;

    const printWindow = window.open(
      "",
      "_blank",
      "width=1000,height=900"
    );

    if (!printWindow) {
      notify(
        "Your browser blocked the print window. Please allow popups.",
        "error"
      );
      return;
    }

    const attendance = calculated.attendance;
    const fees = calculated.fees;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Profile - ${student.fullName}</title>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 32px;
              font-family: Arial, sans-serif;
              color: #0f172a;
              background: white;
            }

            .header {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }

            .school {
              font-size: 26px;
              font-weight: 800;
            }

            .subtitle {
              margin-top: 5px;
              color: #64748b;
            }

            .student-header {
              display: flex;
              gap: 20px;
              align-items: center;
              margin-bottom: 25px;
            }

            .avatar {
              width: 90px;
              height: 90px;
              border-radius: 20px;
              object-fit: cover;
              background: #e2e8f0;
            }

            .initials {
              width: 90px;
              height: 90px;
              border-radius: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #0f172a;
              color: white;
              font-size: 28px;
              font-weight: bold;
            }

            h1 {
              margin: 0;
              font-size: 25px;
            }

            h2 {
              margin-top: 28px;
              font-size: 18px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
            }

            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }

            .item {
              padding: 12px;
              background: #f8fafc;
              border-radius: 8px;
            }

            .label {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
            }

            .value {
              margin-top: 4px;
              font-weight: 700;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }

            th,
            td {
              border: 1px solid #e2e8f0;
              padding: 9px;
              text-align: left;
              font-size: 12px;
            }

            th {
              background: #f8fafc;
            }

            .footer {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }

            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>

        <body>
          <div class="header">
            <div class="school">School Management System</div>
            <div class="subtitle">Student Profile Report</div>
          </div>

          <div class="student-header">
            ${
              student.photo
                ? `<img class="avatar" src="${student.photo}" />`
                : `<div class="initials">${initials(
                    student.fullName
                  )}</div>`
            }

            <div>
              <h1>${student.fullName}</h1>
              <div>${student.admissionNo || "No admission number"}</div>
              <div>${student.className || "No class"} ${
      student.section ? `• ${student.section}` : ""
    }</div>
            </div>
          </div>

          <h2>Personal Information</h2>

          <div class="grid">
            <div class="item">
              <div class="label">Date of Birth</div>
              <div class="value">${formatDate(
                student.dateOfBirth
              )}</div>
            </div>

            <div class="item">
              <div class="label">Gender</div>
              <div class="value">${student.gender || "—"}</div>
            </div>

            <div class="item">
              <div class="label">Nationality</div>
              <div class="value">${student.nationality || "—"}</div>
            </div>

            <div class="item">
              <div class="label">Phone</div>
              <div class="value">${student.phone || "—"}</div>
            </div>

            <div class="item">
              <div class="label">Email</div>
              <div class="value">${student.email || "—"}</div>
            </div>

            <div class="item">
              <div class="label">Address</div>
              <div class="value">${student.address || "—"}</div>
            </div>
          </div>

          <h2>Guardian Information</h2>

          <div class="grid">
            <div class="item">
              <div class="label">Guardian</div>
              <div class="value">${student.guardianName || "—"}</div>
            </div>

            <div class="item">
              <div class="label">Relationship</div>
              <div class="value">${
                student.guardianRelationship || "—"
              }</div>
            </div>

            <div class="item">
              <div class="label">Phone</div>
              <div class="value">${
                student.guardianPhone || "—"
              }</div>
            </div>

            <div class="item">
              <div class="label">Occupation</div>
              <div class="value">${
                student.guardianOccupation || "—"
              }</div>
            </div>
          </div>

          <h2>Academic Summary</h2>

          <div class="grid">
            <div class="item">
              <div class="label">Average Score</div>
              <div class="value">${calculated.average.toFixed(
                1
              )}%</div>
            </div>

            <div class="item">
              <div class="label">Class Position</div>
              <div class="value">${
                student.academic?.position || "—"
              }</div>
            </div>

            <div class="item">
              <div class="label">Performance</div>
              <div class="value">${
                calculated.performance.label
              }</div>
            </div>

            <div class="item">
              <div class="label">Class Average</div>
              <div class="value">${
                number(student.academic?.classAverage).toFixed(1)
              }%</div>
            </div>
          </div>

          <h2>Attendance</h2>

          <div class="grid">
            <div class="item">
              <div class="label">Attendance</div>
              <div class="value">${
                attendance.percentage
              }%</div>
            </div>

            <div class="item">
              <div class="label">Present</div>
              <div class="value">${attendance.present}</div>
            </div>

            <div class="item">
              <div class="label">Absent</div>
              <div class="value">${attendance.absent}</div>
            </div>

            <div class="item">
              <div class="label">Late</div>
              <div class="value">${attendance.late}</div>
            </div>
          </div>

          <h2>Fees</h2>

          <div class="grid">
            <div class="item">
              <div class="label">Total Fees</div>
              <div class="value">${money(fees.total)}</div>
            </div>

            <div class="item">
              <div class="label">Paid</div>
              <div class="value">${money(fees.paid)}</div>
            </div>

            <div class="item">
              <div class="label">Balance</div>
              <div class="value">${money(fees.balance)}</div>
            </div>

            <div class="item">
              <div class="label">Status</div>
              <div class="value">${
                fees.paymentStatus || "Pending"
              }</div>
            </div>
          </div>

          <h2>Academic Results</h2>

          ${
            calculated.subjectResults.length
              ? `
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Score</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${calculated.subjectResults
                      .map(
                        (result) => `
                          <tr>
                            <td>${result.subject}</td>
                            <td>${number(result.score).toFixed(1)}%</td>
                            <td>${result.grade}</td>
                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>
                </table>
              `
              : "<p>No results have been entered.</p>"
          }

          <div class="footer">
            <div>Generated: ${formatDateTime(
              new Date().toISOString()
            )}</div>
            <div>School Administrator</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  /* =======================================================
     EXPORT PROFILE
  ======================================================= */

  const exportProfile = () => {
    if (!student) return;

    const data = {
      student,
      calculated: {
        average: calculated.average,
        attendance: calculated.attendance,
        fees: calculated.fees,
      },
    };

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${student.fullName
      .replace(/\s+/g, "-")
      .toLowerCase()}-profile.json`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    notify("Student profile exported successfully.");
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>

          <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
            <UserX className="h-10 w-10 text-slate-400" />
          </div>

          <h1 className="mt-6 text-2xl font-black text-slate-900">
            Student not found
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            The student record may have been removed, the
            registration may not have completed, or the student ID
            may be invalid.
          </p>

          <button
            type="button"
            onClick={() => navigate("/students")}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     SAFE DATA AFTER NULL CHECK
  ======================================================= */

  const attendance = calculated.attendance;
  const fees = calculated.fees;
  const performance = calculated.performance;

  const guardianName =
    student.guardianName ||
    student.fatherName ||
    student.motherName ||
    "Not provided";

  /* =======================================================
     TAB CONTENT
  ======================================================= */

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Attendance"
          value={`${attendance.percentage}%`}
          subtitle={`${attendance.present} days present`}
          icon={CalendarDays}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Average Score"
          value={`${calculated.average.toFixed(1)}%`}
          subtitle={performance.label}
          icon={TrendingUp}
          iconClass="bg-sky-50 text-sky-600"
        />

        <StatCard
          title="Fee Balance"
          value={money(fees.balance)}
          subtitle={fees.paymentStatus || "Pending"}
          icon={Wallet}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Class Position"
          value={student.academic?.position || "—"}
          subtitle="Current academic position"
          icon={Award}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Academic Performance"
          description="Current academic overview"
          icon={GraduationCap}
          className="xl:col-span-2"
        >
          {calculated.subjectResults.length ? (
            <div className="space-y-5">
              {calculated.subjectResults
                .slice(0, 6)
                .map((result) => (
                  <div key={result.id}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-slate-800">
                        {result.subject}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {number(result.score).toFixed(1)}%
                        </span>

                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-700">
                          {result.grade}
                        </span>
                      </div>
                    </div>

                    <ProgressBar value={result.score} />
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="No academic results"
              description="Results will appear here after scores are entered and published."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Attendance"
          description="Attendance summary"
          icon={CalendarDays}
        >
          <div className="flex items-center justify-center py-3">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[18px] border-slate-100">
              <div
                className="absolute inset-[-18px] rounded-full border-[18px] border-transparent"
                style={{
                  borderTopColor: "#0ea5e9",
                  transform: `rotate(${
                    attendance.percentage * 3.6 - 45
                  }deg)`,
                }}
              />

              <div className="text-center">
                <p className="text-4xl font-black text-slate-900">
                  {attendance.percentage}%
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Attendance
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs text-emerald-600">Present</p>
              <p className="mt-1 text-xl font-black text-emerald-700">
                {attendance.present}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3">
              <p className="text-xs text-red-600">Absent</p>
              <p className="mt-1 text-xl font-black text-red-700">
                {attendance.absent}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-xs text-amber-600">Late</p>
              <p className="mt-1 text-xl font-black text-amber-700">
                {attendance.late}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <p className="text-xs text-blue-600">Excused</p>
              <p className="mt-1 text-xl font-black text-blue-700">
                {attendance.excused}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Guardian Information"
          description="Primary parent or guardian"
          icon={UserCheck}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem
              label="Name"
              value={guardianName}
              icon={User}
            />

            <InfoItem
              label="Relationship"
              value={student.guardianRelationship}
              icon={UserCheck}
            />

            <InfoItem
              label="Phone"
              value={student.guardianPhone}
              icon={Phone}
            />

            <InfoItem
              label="Email"
              value={student.guardianEmail}
              icon={Mail}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Fee Summary"
          description="Current payment status"
          icon={Wallet}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Total</p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {money(fees.total)}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs text-emerald-600">Paid</p>
              <p className="mt-1 text-lg font-black text-emerald-700">
                {money(fees.paid)}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-4">
              <p className="text-xs text-red-600">Balance</p>
              <p className="mt-1 text-lg font-black text-red-700">
                {money(fees.balance)}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-xs text-blue-600">Status</p>
              <p className="mt-1 text-lg font-black text-blue-700">
                {fees.paymentStatus || "Pending"}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <ProgressBar
              label="Fee collection"
              value={
                fees.total > 0
                  ? (number(fees.paid) / fees.total) * 100
                  : 0
              }
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Recent Activity"
        description="Latest actions on this student record"
        icon={Activity}
      >
        {safeArray(student.activity).length ? (
          <ActivityTimeline
            activities={safeArray(student.activity).slice(0, 6)}
          />
        ) : (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Student activity will appear here as actions are performed."
          />
        )}
      </SectionCard>
    </div>
  );

  const renderPersonal = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard
        title="Personal Information"
        description="Basic student information"
        icon={User}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoItem label="First Name" value={student.firstName} />
          <InfoItem label="Middle Name" value={student.middleName} />
          <InfoItem label="Last Name" value={student.lastName} />
          <InfoItem
            label="Date of Birth"
            value={formatDate(student.dateOfBirth)}
          />
          <InfoItem label="Gender" value={student.gender} />
          <InfoItem
            label="Nationality"
            value={student.nationality}
          />
          <InfoItem label="State" value={student.state} />
          <InfoItem label="LGA" value={student.lga} />
          <InfoItem label="Religion" value={student.religion} />
          <InfoItem
            label="Blood Group"
            value={student.bloodGroup}
          />
          <InfoItem label="Genotype" value={student.genotype} />
          <InfoItem label="Phone" value={student.phone} />
          <InfoItem label="Email" value={student.email} />
          <InfoItem
            label="Address"
            value={student.address}
            icon={MapPin}
          />
        </div>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard
          title="Guardian Information"
          description="Parent and emergency contact information"
          icon={UserCheck}
        >
          <div className="space-y-3">
            <InfoItem
              label="Father"
              value={student.fatherName}
            />

            <InfoItem
              label="Mother"
              value={student.motherName}
            />

            <InfoItem
              label="Guardian"
              value={student.guardianName}
            />

            <InfoItem
              label="Relationship"
              value={student.guardianRelationship}
            />

            <InfoItem
              label="Guardian Phone"
              value={student.guardianPhone}
              icon={Phone}
            />

            <InfoItem
              label="Guardian Email"
              value={student.guardianEmail}
              icon={Mail}
            />

            <InfoItem
              label="Occupation"
              value={student.guardianOccupation}
            />

            <InfoItem
              label="Address"
              value={student.guardianAddress}
              icon={MapPin}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Medical Information"
          description="Sensitive information should be permission-controlled in production"
          icon={HeartPulse}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem
              label="Blood Group"
              value={
                student.medical?.bloodGroup ||
                student.bloodGroup
              }
            />

            <InfoItem
              label="Genotype"
              value={
                student.medical?.genotype ||
                student.genotype
              }
            />

            <InfoItem
              label="Allergies"
              value={student.medical?.allergies}
            />

            <InfoItem
              label="Medical Conditions"
              value={student.medical?.medicalConditions}
            />

            <InfoItem
              label="Emergency Contact"
              value={student.medical?.emergencyContact}
            />

            <InfoItem
              label="Hospital"
              value={student.medical?.hospital}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );

  const renderAcademic = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Average"
          value={`${calculated.average.toFixed(1)}%`}
          subtitle={performance.label}
          icon={TrendingUp}
          iconClass="bg-sky-50 text-sky-600"
        />

        <StatCard
          title="Class Average"
          value={`${number(
            student.academic?.classAverage
          ).toFixed(1)}%`}
          subtitle="Current class"
          icon={BarChart3}
          iconClass="bg-violet-50 text-violet-600"
        />

        <StatCard
          title="Position"
          value={student.academic?.position || "—"}
          subtitle="Current position"
          icon={Award}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Subjects"
          value={calculated.subjectResults.length}
          subtitle="Recorded subjects"
          icon={BookOpen}
          iconClass="bg-emerald-50 text-emerald-600"
        />
      </div>

      <SectionCard
        title="Subject Performance"
        description="Detailed performance by subject"
        icon={GraduationCap}
      >
        {calculated.subjectResults.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Performance</th>
                  <th className="px-4 py-3">Progress</th>
                </tr>
              </thead>

              <tbody>
                {calculated.subjectResults.map((result) => (
                  <tr
                    key={result.id}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {result.subject}
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-900">
                      {number(result.score).toFixed(1)}%
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-800">
                        {result.grade}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {getGradeDescription(result.score)}
                    </td>

                    <td className="w-48 px-4 py-4">
                      <ProgressBar
                        value={result.score}
                        showValue={false}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="No results available"
            description="Academic results will appear after the student's scores are recorded."
          />
        )}
      </SectionCard>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Attendance"
          value={`${attendance.percentage}%`}
          icon={CalendarDays}
          iconClass="bg-sky-50 text-sky-600"
        />

        <StatCard
          title="Present"
          value={attendance.present}
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Absent"
          value={attendance.absent}
          icon={X}
          iconClass="bg-red-50 text-red-600"
        />

        <StatCard
          title="Late"
          value={attendance.late}
          icon={Clock3}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Excused"
          value={attendance.excused}
          icon={ShieldCheck}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Attendance Progress"
          description="Current attendance percentage"
          icon={CalendarDays}
        >
          <div className="flex flex-col items-center py-8">
            <div className="flex h-48 w-48 items-center justify-center rounded-full border-[20px] border-sky-100">
              <div className="text-center">
                <p className="text-4xl font-black text-slate-900">
                  {attendance.percentage}%
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Attendance
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-md text-center text-sm leading-6 text-slate-500">
              Attendance is calculated from present, absent, late,
              and excused records available for this student.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="Attendance Breakdown"
          description="Detailed attendance counts"
          icon={BarChart3}
        >
          <div className="space-y-6">
            <ProgressBar
              label="Present"
              value={
                attendance.total
                  ? (attendance.present /
                      attendance.total) *
                    100
                  : 0
              }
            />

            <ProgressBar
              label="Absent"
              value={
                attendance.total
                  ? (attendance.absent /
                      attendance.total) *
                    100
                  : 0
              }
            />

            <ProgressBar
              label="Late"
              value={
                attendance.total
                  ? (attendance.late /
                      attendance.total) *
                    100
                  : 0
              }
            />

            <ProgressBar
              label="Excused"
              value={
                attendance.total
                  ? (attendance.excused /
                      attendance.total) *
                    100
                  : 0
              }
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );

  const renderResults = () => (
    <SectionCard
      title="Student Results"
      description="Recorded academic results"
      icon={Award}
    >
      {calculated.subjectResults.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">CA 1</th>
                <th className="px-4 py-3">CA 2</th>
                <th className="px-4 py-3">Exam</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Grade</th>
              </tr>
            </thead>

            <tbody>
              {calculated.subjectResults.map((result) => (
                <tr
                  key={result.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {result.subject}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {result.ca1 ?? result.CA1 ?? "—"}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {result.ca2 ?? result.CA2 ?? "—"}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {result.exam ?? result.examScore ?? "—"}
                  </td>

                  <td className="px-4 py-4 font-bold text-slate-900">
                    {number(result.score).toFixed(1)}
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-800">
                      {result.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="No results recorded"
          description="Once results are entered for this student, they will appear here."
        />
      )}
    </SectionCard>
  );

  const renderAssignments = () => {
    const assignments = safeArray(student.assignments);

    return (
      <SectionCard
        title="Assignments"
        description="Student assignment activity"
        icon={BookOpen}
      >
        {assignments.length ? (
          <div className="space-y-3">
            {assignments.map((assignment, index) => (
              <div
                key={assignment.id || index}
                className="rounded-2xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {assignment.title ||
                        assignment.name ||
                        `Assignment ${index + 1}`}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {assignment.subject || "No subject"}{" "}
                      {assignment.dueDate
                        ? `• Due ${formatDate(
                            assignment.dueDate
                          )}`
                        : ""}
                    </p>
                  </div>

                  <StatusBadge className="w-fit border-slate-200 bg-slate-50 text-slate-700">
                    {assignment.status || "Pending"}
                  </StatusBadge>
                </div>

                {assignment.score !== undefined && (
                  <div className="mt-4">
                    <ProgressBar
                      label="Score"
                      value={assignment.score}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No assignments"
            description="Assignments submitted or assigned to this student will appear here."
          />
        )}
      </SectionCard>
    );
  };

  const renderFees = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Fees"
          value={money(fees.total)}
          icon={Receipt}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Amount Paid"
          value={money(fees.paid)}
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Outstanding"
          value={money(fees.balance)}
          icon={Wallet}
          iconClass="bg-red-50 text-red-600"
        />
      </div>

      <SectionCard
        title="Fee Breakdown"
        description="Current financial record"
        icon={CreditCard}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Registration Fee", fees.registrationFee],
            ["Tuition Fee", fees.tuitionFee],
            ["Books Fee", fees.booksFee],
            ["Uniform Fee", fees.uniformFee],
            ["Transport Fee", fees.transportFee],
            ["Other Fee", fees.otherFee],
            ["Discount", -number(fees.discount)],
            ["Scholarship", -number(fees.scholarship)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4"
            >
              <span className="text-sm text-slate-600">
                {label}
              </span>

              <span className="font-bold text-slate-900">
                {money(value)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Payment status
              </p>

              <div className="mt-2">
                <StatusBadge
                  className={getPaymentClasses(
                    fees.paymentStatus
                  )}
                >
                  {fees.paymentStatus || "Pending"}
                </StatusBadge>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-400">Balance</p>
              <p className="text-2xl font-black text-slate-900">
                {money(fees.balance)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <ProgressBar
              label="Payment completion"
              value={
                fees.total > 0
                  ? (number(fees.paid) / fees.total) * 100
                  : 0
              }
            />
          </div>
        </div>

        {student.payment?.amount > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <InfoItem
              label="Last Payment"
              value={money(student.payment.amount)}
            />

            <InfoItem
              label="Payment Method"
              value={student.payment.method}
            />

            <InfoItem
              label="Payment Date"
              value={formatDate(student.payment.date)}
            />
          </div>
        )}
      </SectionCard>
    </div>
  );

  const renderDocuments = () => {
    const documents = safeArray(student.documents);

    return (
      <SectionCard
        title="Student Documents"
        description="Uploaded registration and student documents"
        icon={FileText}
        action={
          <button
            type="button"
            onClick={() =>
              notify(
                "Document upload can be connected to your document module."
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
        }
      >
        {documents.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {documents.map((document, index) => (
              <div
                key={document.id || index}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {document.name ||
                      document.title ||
                      `Document ${index + 1}`}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {document.type ||
                      document.mimeType ||
                      "Document"}
                  </p>
                </div>

                {document.url && (
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No documents"
            description="Student documents uploaded during registration will appear here."
          />
        )}
      </SectionCard>
    );
  };

  const renderMessages = () => {
    const messages = safeArray(student.messages);

    return (
      <SectionCard
        title="Messages"
        description="Communication related to this student"
        icon={MessageSquare}
        action={
          <button
            type="button"
            onClick={() =>
              notify(
                "Message composer can be connected to the messaging module."
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Mail className="h-4 w-4" />
            New Message
          </button>
        }
      >
        {messages.length ? (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className="rounded-2xl border border-slate-100 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {message.subject ||
                        message.title ||
                        "Message"}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(
                        message.date ||
                          message.createdAt
                      )}
                    </p>
                  </div>

                  <StatusBadge className="border-blue-200 bg-blue-50 text-blue-700">
                    {message.status || "Message"}
                  </StatusBadge>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {message.message ||
                    message.body ||
                    message.content ||
                    "No message content."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No messages"
            description="Messages and parent communication related to this student will appear here."
          />
        )}
      </SectionCard>
    );
  };

  const renderActivity = () => {
    const activities = safeArray(student.activity);

    return (
      <SectionCard
        title="Activity Timeline"
        description="Complete record of recent student actions"
        icon={Activity}
      >
        {activities.length ? (
          <ActivityTimeline activities={activities} />
        ) : (
          <EmptyState
            icon={Activity}
            title="No activity"
            description="Actions involving this student will appear in this timeline."
          />
        )}
      </SectionCard>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return renderPersonal();

      case "academic":
        return renderAcademic();

      case "attendance":
        return renderAttendance();

      case "results":
        return renderResults();

      case "assignments":
        return renderAssignments();

      case "fees":
        return renderFees();

      case "documents":
        return renderDocuments();

      case "messages":
        return renderMessages();

      case "activity":
        return renderActivity();

      case "overview":
      default:
        return renderOverview();
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-[100] max-w-sm animate-in slide-in-from-right">
          <div
            className={`flex items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-2xl ${
              toast.type === "error"
                ? "border-red-200"
                : "border-emerald-200"
            }`}
          >
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                toast.type === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {toast.type === "error" ? (
                <X className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </div>

            <p className="pt-1 text-sm font-semibold text-slate-700">
              {toast.message}
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1500px] p-4 sm:p-6">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/students")}
          className="mb-4 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Students
        </button>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.20),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_35%)]" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {/* Avatar */}
                <div className="relative shrink-0">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.fullName}
                      className="h-28 w-28 rounded-[1.75rem] border-4 border-white/10 object-cover shadow-xl"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-[1.75rem] border-4 border-white/10 bg-white/10 text-3xl font-black shadow-xl backdrop-blur">
                      {initials(student.fullName)}
                    </div>
                  )}

                  <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-slate-950 bg-emerald-500">
                    <UserCheck className="h-4 w-4 text-white" />
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      className={getStatusClasses(
                        student.status
                      )}
                    >
                      {student.status}
                    </StatusBadge>

                    {student.studentType && (
                      <StatusBadge className="border-white/10 bg-white/10 text-white">
                        {student.studentType}
                      </StatusBadge>
                    )}
                  </div>

                  <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                    {student.fullName}
                  </h1>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
                    <span>
                      Admission:{" "}
                      <strong className="text-white">
                        {student.admissionNo || "—"}
                      </strong>
                    </span>

                    <span>
                      Class:{" "}
                      <strong className="text-white">
                        {student.className || "—"}
                      </strong>
                    </span>

                    <span>
                      Session:{" "}
                      <strong className="text-white">
                        {student.session || "—"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/students/${student.id}/edit`)
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={printProfile}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/students/${student.id}/report`)
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  <FileText className="h-4 w-4" />
                  Report Card
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMenu((value) => !value)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white backdrop-blur transition hover:bg-white/15"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          exportProfile();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Download className="h-4 w-4" />
                        Export Profile
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setShowPrintModal(true);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Printer className="h-4 w-4" />
                        Print Options
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          notify(
                            "Message composer can be connected to the messaging module."
                          );
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Message Guardian
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hero bottom details */}
            <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Admission Date
                </p>
                <p className="mt-1 font-bold">
                  {formatDate(student.admissionDate)}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Section
                </p>
                <p className="mt-1 font-bold">
                  {student.section || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Term
                </p>
                <p className="mt-1 font-bold">
                  {student.term || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Guardian
                </p>
                <p className="mt-1 truncate font-bold">
                  {guardianName}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TABS */}
        <div className="sticky top-0 z-30 -mx-4 mt-5 overflow-x-auto border-y border-slate-200 bg-slate-50/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex min-w-max gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-6">{renderTabContent()}</div>
      </main>

      {/* PRINT OPTIONS MODAL */}
      {showPrintModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={() => setShowPrintModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Print Options
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose what you want to print.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setShowPrintModal(false);
                  printProfile();
                }}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <User className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Student Profile
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Print complete student information.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPrintModal(false);
                  navigate(`/students/${student.id}/report`);
                }}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Award className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Report Card
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Open the student's academic report.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ACTIVITY TIMELINE
========================================================= */

function ActivityTimeline({ activities }) {
  return (
    <div className="relative">
      <div className="absolute bottom-0 left-5 top-0 w-px bg-slate-200" />

      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div
            key={activity.id || index}
            className="relative flex gap-4"
          >
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white bg-slate-100 text-slate-600 shadow-sm">
              {activity.type === "registration" ? (
                <UserCheck className="h-4 w-4" />
              ) : activity.type === "payment" ? (
                <Wallet className="h-4 w-4" />
              ) : activity.type === "result" ? (
                <Award className="h-4 w-4" />
              ) : activity.type === "attendance" ? (
                <CalendarDays className="h-4 w-4" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {activity.title ||
                      activity.action ||
                      "Activity"}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {activity.description ||
                      activity.details ||
                      ""}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-slate-400">
                  {formatDateTime(
                    activity.date ||
                      activity.createdAt ||
                      activity.timestamp
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}