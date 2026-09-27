import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock,
  CircleDollarSign,
  Database,
  Download,
  Eye,
  ExternalLink,
  FileBarChart,
  FileText,
  Filter,
  GraduationCap,
  History,
  Info,
  Layers,
  LineChart,
  PieChart,
  Printer,
  RefreshCcw,
  Search,
  School,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

/* =========================================================
   STORAGE KEYS
========================================================= */

const STORAGE_KEYS = {
  students: "school_students",
  teachers: "school_teachers",
  results: "school_results",
  studentAttendance: "school_student_attendance",
  teacherAttendance: "school_teacher_attendance",
  fees: "school_fees",
  expenses: "school_expenses",
  auditLogs: "school_audit_logs",
  reportHistory: "school_report_history",
};

/* =========================================================
   HELPERS
========================================================= */

const safeArray = (value) => {
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.records)) return value.records;
    if (Array.isArray(value.items)) return value.items;
    if (Array.isArray(value.results)) return value.results;
    if (Array.isArray(value.students)) return value.students;
    if (Array.isArray(value.attendance)) return value.attendance;

    return Object.entries(value).map(([key, item]) => {
      if (item && typeof item === "object") {
        return {
          ...item,
          __storageKey: key,
        };
      }

      return {
        value: item,
        __storageKey: key,
      };
    });
  }

  return [];
};

const readStorage = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    console.error(`Failed to read ${key}`, error);
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));

    window.dispatchEvent(
      new CustomEvent("school:data-updated", {
        detail: { key },
      })
    );

    return true;
  } catch (error) {
    console.error(`Failed to write ${key}`, error);
    return false;
  }
};

const uid = (prefix = "id") => {
  const uuid = window.crypto?.randomUUID?.();

  if (uuid) {
    return `${prefix}-${uuid}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

const numberValue = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;

    const number = Number(
      String(value).replace(/[₦,$,\s]/g, "")
    );

    if (!Number.isNaN(number)) return number;
  }

  return 0;
};

const formatCurrency = (value) => {
  return `₦${numberValue(value).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatNumber = (value, digits = 0) => {
  return numberValue(value).toLocaleString("en-NG", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

const formatPercent = (value) => {
  return `${numberValue(value).toFixed(1)}%`;
};

const average = (values) => {
  const valid = values
    .map(Number)
    .filter((value) => !Number.isNaN(value));

  if (!valid.length) return 0;

  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
};

const normalizeDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
};

const dateOnly = (value) => {
  const date = normalizeDate(value);

  if (!date) return "";

  return date.toISOString().slice(0, 10);
};

const formatDate = (value) => {
  const date = normalizeDate(value);

  if (!date) return "—";

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  const date = normalizeDate(value);

  if (!date) return "—";

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const escapeCSV = (value) => {
  if (value === null || value === undefined) return "";

  const text = String(value)
    .replace(/\r?\n|\r/g, " ")
    .trim();

  if (/[",]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

const downloadFile = (content, filename, type = "text/plain") => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
};

const downloadCSV = (sections, filename) => {
  const lines = [];

  sections.forEach((section) => {
    if (!section) return;

    if (section.title) {
      lines.push(escapeCSV(section.title));
    }

    if (section.headers?.length) {
      lines.push(section.headers.map(escapeCSV).join(","));
    }

    if (section.rows?.length) {
      section.rows.forEach((row) => {
        lines.push(row.map(escapeCSV).join(","));
      });
    }

    lines.push("");
  });

  downloadFile(
    lines.join("\n"),
    filename,
    "text/csv;charset=utf-8;"
  );
};

const getFirst = (object, keys, fallback = "") => {
  if (!object || typeof object !== "object") return fallback;

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }

  return fallback;
};

/* =========================================================
   NORMALIZERS
========================================================= */

const normalizeStudent = (student = {}) => {
  return {
    ...student,
    id: getFirst(student, [
      "id",
      "_id",
      "studentId",
      "studentID",
    ]),
    admissionNumber: getFirst(student, [
      "admissionNumber",
      "admissionNo",
      "admission",
      "studentNumber",
      "studentId",
    ]),
    name:
      getFirst(student, [
        "fullName",
        "name",
        "studentName",
        "displayName",
      ]) ||
      `${getFirst(student, ["firstName"], "")} ${getFirst(
        student,
        ["lastName"],
        ""
      )}`.trim() ||
      "Unknown Student",
    className: getFirst(student, [
      "className",
      "class",
      "currentClass",
      "grade",
      "level",
    ]),
    gender: getFirst(student, ["gender", "sex"]),
    session: getFirst(student, [
      "session",
      "academicSession",
      "schoolSession",
    ]),
    term: getFirst(student, ["term", "currentTerm"]),
    phone: getFirst(student, ["phone", "phoneNumber"]),
    email: getFirst(student, ["email"]),
    dateOfBirth: getFirst(student, [
      "dateOfBirth",
      "dob",
      "birthDate",
    ]),
    status: getFirst(student, ["status"], "Active"),
  };
};

const normalizeTeacher = (teacher = {}) => {
  return {
    ...teacher,
    id: getFirst(teacher, [
      "id",
      "_id",
      "teacherId",
      "staffId",
      "employeeId",
    ]),
    name:
      getFirst(teacher, [
        "fullName",
        "name",
        "teacherName",
        "displayName",
      ]) ||
      `${getFirst(teacher, ["firstName"], "")} ${getFirst(
        teacher,
        ["lastName"],
        ""
      )}`.trim() ||
      "Unknown Teacher",
    role: getFirst(teacher, [
      "role",
      "position",
      "designation",
      "jobTitle",
    ]),
    department: getFirst(teacher, [
      "department",
      "subject",
      "departmentName",
    ]),
    email: getFirst(teacher, ["email"]),
    phone: getFirst(teacher, ["phone", "phoneNumber"]),
    className: getFirst(teacher, [
      "className",
      "class",
      "assignedClass",
    ]),
    status: getFirst(teacher, ["status"], "Active"),
  };
};

const normalizeResult = (result = {}, studentMap = {}) => {
  const studentId = getFirst(result, [
    "studentId",
    "studentID",
    "student_id",
    "learnerId",
    "pupilId",
  ]);

  const admissionNumber = getFirst(result, [
    "admissionNumber",
    "admissionNo",
    "admission",
  ]);

  const student =
    studentMap[String(studentId)] ||
    studentMap[String(admissionNumber)];

  const score = numberValue(
    result.score,
    result.mark,
    result.marks,
    result.total,
    result.percentage,
    result.value
  );

  return {
    ...result,
    id: getFirst(result, [
      "id",
      "_id",
      "resultId",
    ]),
    studentId:
      studentId ||
      student?.id ||
      student?.admissionNumber ||
      "",
    admissionNumber:
      admissionNumber ||
      student?.admissionNumber ||
      "",
    studentName:
      getFirst(result, [
        "studentName",
        "name",
        "fullName",
      ]) ||
      student?.name ||
      "Unknown Student",
    className:
      getFirst(result, [
        "className",
        "class",
        "studentClass",
      ]) ||
      student?.className ||
      "",
    subject: getFirst(result, [
      "subject",
      "subjectName",
      "course",
    ]),
    score,
    grade: getFirst(result, ["grade", "letterGrade"]),
    session: getFirst(result, [
      "session",
      "academicSession",
    ]) || student?.session,
    term: getFirst(result, ["term"]) || student?.term,
    date: getFirst(result, [
      "date",
      "createdAt",
      "updatedAt",
      "examDate",
    ]),
    teacherId: getFirst(result, [
      "teacherId",
      "teacherID",
    ]),
    teacherName: getFirst(result, [
      "teacherName",
    ]),
  };
};

const normalizeFee = (fee = {}, studentMap = {}) => {
  const studentId = getFirst(fee, [
    "studentId",
    "studentID",
    "student_id",
    "admissionNumber",
    "admissionNo",
  ]);

  const student =
    studentMap[String(studentId)] ||
    studentMap[String(getFirst(fee, [
      "admissionNumber",
      "admissionNo",
    ]))];

  const expected = numberValue(
    fee.expected,
    fee.total,
    fee.amountDue,
    fee.amount,
    fee.feeAmount,
    fee.expectedAmount
  );

  const paid = numberValue(
    fee.paid,
    fee.amountPaid,
    fee.paidAmount,
    fee.payment,
    fee.totalPaid
  );

  const outstanding = Math.max(
    0,
    numberValue(
      fee.outstanding,
      fee.balance,
      fee.remaining
    ) || expected - paid
  );

  return {
    ...fee,
    id: getFirst(fee, ["id", "_id", "feeId"]),
    studentId:
      studentId ||
      student?.id ||
      student?.admissionNumber ||
      "",
    admissionNumber:
      getFirst(fee, [
        "admissionNumber",
        "admissionNo",
      ]) ||
      student?.admissionNumber ||
      "",
    studentName:
      getFirst(fee, [
        "studentName",
        "name",
        "fullName",
      ]) ||
      student?.name ||
      "Unknown Student",
    className:
      getFirst(fee, [
        "className",
        "class",
        "studentClass",
      ]) ||
      student?.className ||
      "",
    expected,
    paid,
    outstanding,
    status:
      getFirst(fee, ["status"]) ||
      (outstanding <= 0
        ? "Paid"
        : paid > 0
        ? "Partial"
        : "Pending"),
    session:
      getFirst(fee, [
        "session",
        "academicSession",
      ]) || student?.session,
    term:
      getFirst(fee, ["term"]) ||
      student?.term,
    date: getFirst(fee, [
      "date",
      "createdAt",
      "updatedAt",
      "paymentDate",
    ]),
    category: getFirst(fee, [
      "category",
      "feeType",
      "type",
    ]),
  };
};

const normalizeAttendanceRecord = (
  record = {},
  studentMap = {}
) => {
  const studentId = getFirst(record, [
    "studentId",
    "studentID",
    "student_id",
    "learnerId",
    "pupilId",
    "id",
  ]);

  const admissionNumber = getFirst(record, [
    "admissionNumber",
    "admissionNo",
  ]);

  const student =
    studentMap[String(studentId)] ||
    studentMap[String(admissionNumber)];

  const rawStatus = String(
    getFirst(record, [
      "status",
      "attendance",
      "state",
      "value",
    ])
  ).toLowerCase();

  let status = "Present";

  if (
    rawStatus.includes("absent") ||
    rawStatus === "a"
  ) {
    status = "Absent";
  } else if (
    rawStatus.includes("late") ||
    rawStatus === "l"
  ) {
    status = "Late";
  } else if (
    rawStatus.includes("excused") ||
    rawStatus === "e"
  ) {
    status = "Excused";
  } else if (
    rawStatus.includes("present") ||
    rawStatus === "p"
  ) {
    status = "Present";
  }

  return {
    ...record,
    id: getFirst(record, [
      "id",
      "_id",
      "attendanceId",
    ]),
    studentId:
      studentId ||
      student?.id ||
      student?.admissionNumber ||
      "",
    admissionNumber:
      admissionNumber ||
      student?.admissionNumber ||
      "",
    studentName:
      getFirst(record, [
        "studentName",
        "name",
        "fullName",
      ]) ||
      student?.name ||
      "Unknown Student",
    className:
      getFirst(record, [
        "className",
        "class",
        "studentClass",
      ]) ||
      student?.className ||
      "",
    session:
      getFirst(record, [
        "session",
        "academicSession",
      ]) || student?.session,
    term:
      getFirst(record, ["term"]) ||
      student?.term,
    date: getFirst(record, [
      "date",
      "attendanceDate",
      "createdAt",
    ]),
    status,
  };
};

const flattenAttendance = (
  rawAttendance,
  studentMap
) => {
  if (!rawAttendance) return [];

  if (Array.isArray(rawAttendance)) {
    return rawAttendance.map((item) =>
      normalizeAttendanceRecord(item, studentMap)
    );
  }

  if (
    rawAttendance &&
    typeof rawAttendance === "object"
  ) {
    if (Array.isArray(rawAttendance.records)) {
      return rawAttendance.records.map((item) =>
        normalizeAttendanceRecord(item, studentMap)
      );
    }

    if (Array.isArray(rawAttendance.attendance)) {
      return rawAttendance.attendance.map((item) =>
        normalizeAttendanceRecord(item, studentMap)
      );
    }

    const rows = [];

    Object.entries(rawAttendance).forEach(
      ([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            rows.push(
              normalizeAttendanceRecord(
                {
                  ...item,
                  studentId:
                    item.studentId || key,
                },
                studentMap
              )
            );
          });

          return;
        }

        if (
          value &&
          typeof value === "object"
        ) {
          rows.push(
            normalizeAttendanceRecord(
              {
                ...value,
                studentId:
                  value.studentId || key,
              },
              studentMap
            )
          );
        }
      }
    );

    return rows;
  }

  return [];
};

/* =========================================================
   GRADE
========================================================= */

const getGrade = (score) => {
  const value = numberValue(score);

  if (value >= 80) return "A";
  if (value >= 70) return "B";
  if (value >= 60) return "C";
  if (value >= 50) return "D";
  if (value >= 40) return "E";

  return "F";
};

const getGradeLabel = (grade) => {
  switch (String(grade).toUpperCase()) {
    case "A":
      return "Excellent";
    case "B":
      return "Very Good";
    case "C":
      return "Good";
    case "D":
      return "Pass";
    case "E":
      return "Weak Pass";
    case "F":
      return "Fail";
    default:
      return "Not graded";
  }
};

const getGradeClass = (score) => {
  const value = numberValue(score);

  if (value >= 70)
    return "bg-emerald-50 text-emerald-700";
  if (value >= 60)
    return "bg-blue-50 text-blue-700";
  if (value >= 50)
    return "bg-amber-50 text-amber-700";
  if (value >= 40)
    return "bg-orange-50 text-orange-700";

  return "bg-red-50 text-red-700";
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const Button = ({
  children,
  icon: Icon,
  variant = "secondary",
  className = "",
  ...props
}) => {
  const styles = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    blue:
      "bg-blue-600 text-white hover:bg-blue-700",
    danger:
      "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
    ghost:
      "text-slate-600 hover:bg-slate-100",
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const Pill = ({
  children,
  tone = "slate",
}) => {
  const tones = {
    slate:
      "bg-slate-100 text-slate-700",
    blue:
      "bg-blue-50 text-blue-700",
    green:
      "bg-emerald-50 text-emerald-700",
    red:
      "bg-red-50 text-red-700",
    amber:
      "bg-amber-50 text-amber-700",
    purple:
      "bg-purple-50 text-purple-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
  trend,
  trendType = "up",
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all ${
        onClick
          ? "cursor-pointer hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
          : "cursor-default"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={21} />
          </div>

          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>

          {description && (
            <p className="mt-1 text-xs text-slate-400">
              {description}
            </p>
          )}
        </div>

        {onClick && (
          <ChevronRight
            size={18}
            className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500"
          />
        )}
      </div>

      {trend !== undefined && (
        <div
          className={`mt-4 flex items-center gap-1 text-xs font-semibold ${
            trendType === "down"
              ? "text-red-600"
              : "text-emerald-600"
          }`}
        >
          {trendType === "down" ? (
            <TrendingDown size={14} />
          ) : (
            <TrendingUp size={14} />
          )}
          {trend}
        </div>
      )}
    </button>
  );
};

const EmptyState = ({
  icon: Icon = FileBarChart,
  title = "No data available",
  description = "There is no data matching the current filters.",
}) => {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <Icon size={25} />
      </div>

      <h3 className="font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
};

const SectionCard = ({
  title,
  description,
  icon: Icon,
  actions,
  children,
}) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Icon size={17} />
            </div>
          )}

          <div>
            <h2 className="font-semibold text-slate-900">
              {title}
            </h2>

            {description && (
              <p className="mt-0.5 text-xs text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions}
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
};

const Modal = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  actions,
  size = "xl",
}) => {
  useEffect(() => {
    if (!open) return;

    const handler = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    md: "max-w-lg",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    "2xl": "max-w-7xl",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative flex max-h-[92vh] w-full ${sizes[size]} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {children}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

const MiniMetric = ({
  label,
  value,
  icon: Icon,
}) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
      {Icon && <Icon size={14} />}
      {label}
    </div>
    <p className="mt-1 text-lg font-bold text-slate-900">
      {value}
    </p>
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Reports() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [results, setResults] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [teacherAttendance, setTeacherAttendance] =
    useState([]);
  const [fees, setFees] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(
    new Date()
  );

  const [sessionFilter, setSessionFilter] =
    useState("all");
  const [termFilter, setTermFilter] = useState("all");
  const [classFilter, setClassFilter] =
    useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  /* =====================================================
     TOAST
  ===================================================== */

  const showToast = useCallback(
    (message, type = "success") => {
      setToast({
        message,
        type,
      });

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      toastTimerRef.current = setTimeout(() => {
        setToast(null);
      }, 3500);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadData = useCallback(
    (showLoading = false) => {
      if (showLoading) {
        setRefreshing(true);
      }

      const rawStudents = safeArray(
        readStorage(
          STORAGE_KEYS.students,
          []
        )
      );

      const normalizedStudents =
        rawStudents.map(normalizeStudent);

      const studentMap = {};

      normalizedStudents.forEach((student) => {
        if (student.id !== undefined) {
          studentMap[String(student.id)] =
            student;
        }

        if (student.admissionNumber) {
          studentMap[
            String(student.admissionNumber)
          ] = student;
        }
      });

      const rawTeachers = safeArray(
        readStorage(
          STORAGE_KEYS.teachers,
          []
        )
      );

      const normalizedTeachers =
        rawTeachers.map(normalizeTeacher);

      const rawResults = safeArray(
        readStorage(
          STORAGE_KEYS.results,
          []
        )
      );

      const normalizedResults =
        rawResults.map((item) =>
          normalizeResult(item, studentMap)
        );

      const rawAttendance = readStorage(
        STORAGE_KEYS.studentAttendance,
        []
      );

      const normalizedAttendance =
        flattenAttendance(
          rawAttendance,
          studentMap
        );

      const rawTeacherAttendance =
        readStorage(
          STORAGE_KEYS.teacherAttendance,
          []
        );

      const normalizedTeacherAttendance =
        safeArray(rawTeacherAttendance);

      const rawFees = safeArray(
        readStorage(
          STORAGE_KEYS.fees,
          []
        )
      );

      const normalizedFees = rawFees.map((item) =>
        normalizeFee(item, studentMap)
      );

      const normalizedExpenses = safeArray(
        readStorage(
          STORAGE_KEYS.expenses,
          []
        )
      );

      const history = safeArray(
        readStorage(
          STORAGE_KEYS.reportHistory,
          []
        )
      );

      setStudents(normalizedStudents);
      setTeachers(normalizedTeachers);
      setResults(normalizedResults);
      setAttendance(normalizedAttendance);
      setTeacherAttendance(
        normalizedTeacherAttendance
      );
      setFees(normalizedFees);
      setExpenses(normalizedExpenses);
      setReportHistory(history);
      setLastUpdated(new Date());
      setLoading(false);
      setRefreshing(false);
    },
    []
  );

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  /*
   * localStorage's native "storage" event does not fire
   * inside the same browser tab that made the change.
   *
   * Therefore we use:
   * 1. custom school:data-updated event
   * 2. native storage event
   * 3. polling fallback
   */
  useEffect(() => {
    const handleUpdate = () => {
      loadData(false);
    };

    window.addEventListener(
      "school:data-updated",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    const interval = setInterval(() => {
      loadData(false);
    }, 2500);

    return () => {
      window.removeEventListener(
        "school:data-updated",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );

      clearInterval(interval);
    };
  }, [loadData]);

  /* =====================================================
     MAPS
  ===================================================== */

  const studentMap = useMemo(() => {
    const map = {};

    students.forEach((student) => {
      if (student.id !== undefined) {
        map[String(student.id)] = student;
      }

      if (student.admissionNumber) {
        map[String(student.admissionNumber)] =
          student;
      }
    });

    return map;
  }, [students]);

  const teacherMap = useMemo(() => {
    const map = {};

    teachers.forEach((teacher) => {
      if (teacher.id !== undefined) {
        map[String(teacher.id)] = teacher;
      }
    });

    return map;
  }, [teachers]);

  /* =====================================================
     FILTER OPTIONS
  ===================================================== */

  const sessions = useMemo(() => {
    const values = new Set();

    students.forEach((item) => {
      if (item.session) values.add(item.session);
    });

    results.forEach((item) => {
      if (item.session) values.add(item.session);
    });

    fees.forEach((item) => {
      if (item.session) values.add(item.session);
    });

    attendance.forEach((item) => {
      if (item.session) values.add(item.session);
    });

    return Array.from(values).sort().reverse();
  }, [students, results, fees, attendance]);

  const terms = useMemo(() => {
    const values = new Set();

    students.forEach((item) => {
      if (item.term) values.add(item.term);
    });

    results.forEach((item) => {
      if (item.term) values.add(item.term);
    });

    fees.forEach((item) => {
      if (item.term) values.add(item.term);
    });

    attendance.forEach((item) => {
      if (item.term) values.add(item.term);
    });

    return Array.from(values);
  }, [students, results, fees, attendance]);

  const classes = useMemo(() => {
    const values = new Set();

    students.forEach((item) => {
      if (item.className) values.add(item.className);
    });

    results.forEach((item) => {
      if (item.className) values.add(item.className);
    });

    fees.forEach((item) => {
      if (item.className) values.add(item.className);
    });

    attendance.forEach((item) => {
      if (item.className) values.add(item.className);
    });

    return Array.from(values).sort();
  }, [students, results, fees, attendance]);

  /* =====================================================
     FILTER HELPERS
  ===================================================== */

  const matchesFilters = useCallback(
    (item, options = {}) => {
      const {
        allowSearch = true,
        dateField = "date",
      } = options;

      if (
        sessionFilter !== "all" &&
        item.session &&
        String(item.session) !==
          String(sessionFilter)
      ) {
        return false;
      }

      if (
        sessionFilter !== "all" &&
        !item.session
      ) {
        const relatedStudent =
          studentMap[String(item.studentId)] ||
          studentMap[
            String(item.admissionNumber)
          ];

        if (
          relatedStudent?.session &&
          String(relatedStudent.session) !==
            String(sessionFilter)
        ) {
          return false;
        }
      }

      if (
        termFilter !== "all" &&
        item.term &&
        String(item.term) !==
          String(termFilter)
      ) {
        return false;
      }

      if (
        classFilter !== "all" &&
        item.className &&
        String(item.className) !==
          String(classFilter)
      ) {
        return false;
      }

      if (
        classFilter !== "all" &&
        !item.className
      ) {
        const relatedStudent =
          studentMap[String(item.studentId)] ||
          studentMap[
            String(item.admissionNumber)
          ];

        if (
          relatedStudent?.className &&
          String(relatedStudent.className) !==
            String(classFilter)
        ) {
          return false;
        }
      }

      const itemDate = item[dateField];

      if (startDate && itemDate) {
        if (dateOnly(itemDate) < startDate) {
          return false;
        }
      }

      if (endDate && itemDate) {
        if (dateOnly(itemDate) > endDate) {
          return false;
        }
      }

      if (
        allowSearch &&
        search.trim()
      ) {
        const query =
          search.trim().toLowerCase();

        const haystack = Object.values(
          item
        )
          .filter(
            (value) =>
              value !== null &&
              value !== undefined
          )
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(query)) {
          return false;
        }
      }

      return true;
    },
    [
      sessionFilter,
      termFilter,
      classFilter,
      startDate,
      endDate,
      search,
      studentMap,
    ]
  );

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      matchesFilters(student, {
        dateField: "createdAt",
      })
    );
  }, [students, matchesFilters]);

  const filteredResults = useMemo(() => {
    return results.filter((result) =>
      matchesFilters(result)
    );
  }, [results, matchesFilters]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) =>
      matchesFilters(item)
    );
  }, [attendance, matchesFilters]);

  const filteredFees = useMemo(() => {
    return fees.filter((item) =>
      matchesFilters(item)
    );
  }, [fees, matchesFilters]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) =>
      matchesFilters(item)
    );
  }, [expenses, matchesFilters]);

  /* =====================================================
     KPI DATA
  ===================================================== */

  const activeStudents = filteredStudents.filter(
    (student) =>
      String(student.status).toLowerCase() !==
      "inactive"
  ).length;

  const performanceAverage = average(
    filteredResults.map(
      (result) => result.score
    )
  );

  const attendancePresent =
    filteredAttendance.filter(
      (item) => item.status === "Present"
    ).length;

  const attendanceRate = filteredAttendance.length
    ? (attendancePresent /
        filteredAttendance.length) *
      100
    : 0;

  const expectedFees = filteredFees.reduce(
    (sum, fee) => sum + fee.expected,
    0
  );

  const collectedFees = filteredFees.reduce(
    (sum, fee) => sum + fee.paid,
    0
  );

  const outstandingFees = filteredFees.reduce(
    (sum, fee) => sum + fee.outstanding,
    0
  );

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) =>
      sum +
      numberValue(
        expense.amount,
        expense.total,
        expense.value,
        expense.cost
      ),
    0
  );

  const netFinance =
    collectedFees - totalExpenses;

  /* =====================================================
     ACADEMIC REPORT DATA
  ===================================================== */

  const studentPerformance = useMemo(() => {
    const map = {};

    filteredResults.forEach((result) => {
      const key =
        String(
          result.studentId ||
            result.admissionNumber ||
            result.studentName
        );

      if (!map[key]) {
        map[key] = {
          key,
          studentId: result.studentId,
          admissionNumber:
            result.admissionNumber,
          studentName:
            result.studentName,
          className: result.className,
          scores: [],
          subjects: [],
          records: [],
        };
      }

      map[key].scores.push(result.score);

      map[key].subjects.push(
        result.subject || "Unknown"
      );

      map[key].records.push(result);
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        average: average(item.scores),
        grade: getGrade(
          average(item.scores)
        ),
      }))
      .sort((a, b) => b.average - a.average);
  }, [filteredResults]);

  const subjectPerformance = useMemo(() => {
    const map = {};

    filteredResults.forEach((result) => {
      const subject =
        result.subject || "Unknown Subject";

      if (!map[subject]) {
        map[subject] = {
          subject,
          scores: [],
          students: new Set(),
        };
      }

      map[subject].scores.push(result.score);

      map[subject].students.add(
        result.studentId ||
          result.admissionNumber ||
          result.studentName
      );
    });

    return Object.values(map)
      .map((item) => ({
        subject: item.subject,
        average: average(item.scores),
        count: item.scores.length,
        students: item.students.size,
      }))
      .sort((a, b) => b.average - a.average);
  }, [filteredResults]);

  const classPerformance = useMemo(() => {
    const map = {};

    filteredResults.forEach((result) => {
      const className =
        result.className || "Unassigned";

      if (!map[className]) {
        map[className] = {
          className,
          scores: [],
          students: new Set(),
        };
      }

      map[className].scores.push(result.score);

      map[className].students.add(
        result.studentId ||
          result.admissionNumber ||
          result.studentName
      );
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        average: average(item.scores),
        studentCount: item.students.size,
      }))
      .sort((a, b) => b.average - a.average);
  }, [filteredResults]);

  const gradeDistribution = useMemo(() => {
    const distribution = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
    };

    filteredResults.forEach((result) => {
      const grade =
        String(
          result.grade ||
            getGrade(result.score)
        ).toUpperCase();

      if (distribution[grade] !== undefined) {
        distribution[grade] += 1;
      }
    });

    return distribution;
  }, [filteredResults]);

  /* =====================================================
     ATTENDANCE DATA
  ===================================================== */

  const attendanceSummary = useMemo(() => {
    const summary = {
      Present: 0,
      Absent: 0,
      Late: 0,
      Excused: 0,
    };

    filteredAttendance.forEach((item) => {
      if (summary[item.status] !== undefined) {
        summary[item.status] += 1;
      }
    });

    return summary;
  }, [filteredAttendance]);

  const classAttendance = useMemo(() => {
    const map = {};

    filteredAttendance.forEach((item) => {
      const className =
        item.className || "Unassigned";

      if (!map[className]) {
        map[className] = {
          className,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          students: new Set(),
        };
      }

      map[className].total += 1;

      if (item.status === "Present") {
        map[className].present += 1;
      }

      if (item.status === "Absent") {
        map[className].absent += 1;
      }

      if (item.status === "Late") {
        map[className].late += 1;
      }

      if (item.status === "Excused") {
        map[className].excused += 1;
      }

      map[className].students.add(
        item.studentId ||
          item.admissionNumber ||
          item.studentName
      );
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        studentCount: item.students.size,
        rate: item.total
          ? (item.present / item.total) * 100
          : 0,
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [filteredAttendance]);

  const attendanceTrend = useMemo(() => {
    const map = {};

    filteredAttendance.forEach((item) => {
      const date = dateOnly(item.date);

      if (!date) return;

      if (!map[date]) {
        map[date] = {
          date,
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
        };
      }

      map[date].total += 1;

      if (item.status === "Present")
        map[date].present += 1;

      if (item.status === "Absent")
        map[date].absent += 1;

      if (item.status === "Late")
        map[date].late += 1;
    });

    return Object.values(map)
      .sort((a, b) =>
        a.date.localeCompare(b.date)
      )
      .slice(-14);
  }, [filteredAttendance]);

  /* =====================================================
     FINANCE DATA
  ===================================================== */

  const feeStatus = useMemo(() => {
    return {
      paid: filteredFees.filter(
        (fee) =>
          String(fee.status).toLowerCase() ===
          "paid"
      ).length,

      partial: filteredFees.filter(
        (fee) =>
          String(fee.status).toLowerCase() ===
          "partial"
      ).length,

      pending: filteredFees.filter(
        (fee) =>
          String(fee.status).toLowerCase() ===
          "pending"
      ).length,
    };
  }, [filteredFees]);

  const feesByClass = useMemo(() => {
    const map = {};

    filteredFees.forEach((fee) => {
      const className =
        fee.className || "Unassigned";

      if (!map[className]) {
        map[className] = {
          className,
          expected: 0,
          paid: 0,
          outstanding: 0,
        };
      }

      map[className].expected += fee.expected;
      map[className].paid += fee.paid;
      map[className].outstanding +=
        fee.outstanding;
    });

    return Object.values(map).sort(
      (a, b) => b.paid - a.paid
    );
  }, [filteredFees]);

  /* =====================================================
     TEACHER REPORT
  ===================================================== */

  const teacherReport = useMemo(() => {
    return teachers
      .filter((teacher) => {
        if (search.trim()) {
          const query =
            search.trim().toLowerCase();

          const haystack = [
            teacher.name,
            teacher.role,
            teacher.department,
            teacher.className,
            teacher.email,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!haystack.includes(query)) {
            return false;
          }
        }

        if (
          classFilter !== "all" &&
          teacher.className &&
          teacher.className !== classFilter
        ) {
          return false;
        }

        return true;
      })
      .map((teacher) => {
        const teacherResults =
          filteredResults.filter(
            (result) =>
              String(result.teacherId) ===
                String(teacher.id) ||
              String(result.teacherName)
                .toLowerCase() ===
                String(teacher.name)
                  .toLowerCase()
          );

        const teacherAttendanceRows =
          teacherAttendance.filter((row) => {
            const teacherId = getFirst(row, [
              "teacherId",
              "teacherID",
              "staffId",
              "employeeId",
            ]);

            return (
              String(teacherId) ===
              String(teacher.id)
            );
          });

        const present =
          teacherAttendanceRows.filter(
            (row) =>
              String(
                getFirst(row, [
                  "status",
                  "attendance",
                ])
              ).toLowerCase() ===
              "present"
          ).length;

        return {
          ...teacher,
          resultCount: teacherResults.length,
          average: average(
            teacherResults.map(
              (result) => result.score
            )
          ),
          attendanceRate:
            teacherAttendanceRows.length
              ? (present /
                  teacherAttendanceRows.length) *
                100
              : 0,
          classes: Array.from(
            new Set(
              teacherResults
                .map(
                  (result) =>
                    result.className
                )
                .filter(Boolean)
            )
          ),
        };
      });
  }, [
    teachers,
    search,
    classFilter,
    filteredResults,
    teacherAttendance,
  ]);

  /* =====================================================
     CLASS REPORT
  ===================================================== */

  const classReport = useMemo(() => {
    const classNames = new Set([
      ...students
        .map((student) => student.className)
        .filter(Boolean),

      ...classPerformance.map(
        (item) => item.className
      ),

      ...classAttendance.map(
        (item) => item.className
      ),

      ...feesByClass.map(
        (item) => item.className
      ),
    ]);

    return Array.from(classNames)
      .filter((className) => {
        if (classFilter !== "all") {
          return className === classFilter;
        }

        if (search.trim()) {
          return className
            .toLowerCase()
            .includes(
              search.trim().toLowerCase()
            );
        }

        return true;
      })
      .map((className) => {
        const classStudents =
          filteredStudents.filter(
            (student) =>
              student.className === className
          );

        const performance =
          classPerformance.find(
            (item) =>
              item.className === className
          );

        const attendanceInfo =
          classAttendance.find(
            (item) =>
              item.className === className
          );

        const feesInfo = feesByClass.find(
          (item) =>
            item.className === className
        );

        return {
          className,
          students: classStudents.length,
          male: classStudents.filter(
            (student) =>
              String(student.gender).toLowerCase() ===
              "male"
          ).length,
          female: classStudents.filter(
            (student) =>
              String(student.gender).toLowerCase() ===
              "female"
          ).length,
          average: performance?.average || 0,
          attendance:
            attendanceInfo?.rate || 0,
          expected:
            feesInfo?.expected || 0,
          paid:
            feesInfo?.paid || 0,
          outstanding:
            feesInfo?.outstanding || 0,
        };
      })
      .sort((a, b) =>
        a.className.localeCompare(b.className)
      );
  }, [
    students,
    filteredStudents,
    classPerformance,
    classAttendance,
    feesByClass,
    classFilter,
    search,
  ]);

  /* =====================================================
     FILTER RESET
  ===================================================== */

  const clearFilters = () => {
    setSessionFilter("all");
    setTermFilter("all");
    setClassFilter("all");
    setStartDate("");
    setEndDate("");
    setSearch("");

    showToast(
      "All report filters have been cleared."
    );
  };

  /* =====================================================
     AUDIT LOG
  ===================================================== */

  const appendAuditLog = useCallback(
    ({
      action,
      description,
      entityId,
      metadata = {},
    }) => {
      const existing = safeArray(
        readStorage(
          STORAGE_KEYS.auditLogs,
          []
        )
      );

      const entry = {
        id: uid("audit"),
        action,
        entity: "report",
        entityId:
          entityId || null,
        description,
        metadata,
        createdAt:
          new Date().toISOString(),
      };

      writeStorage(
        STORAGE_KEYS.auditLogs,
        [entry, ...existing].slice(0, 500)
      );
    },
    []
  );

  /* =====================================================
     FILTER SNAPSHOT
  ===================================================== */

  const getFilterSnapshot = () => ({
    session:
      sessionFilter === "all"
        ? "All sessions"
        : sessionFilter,

    term:
      termFilter === "all"
        ? "All terms"
        : termFilter,

    className:
      classFilter === "all"
        ? "All classes"
        : classFilter,

    startDate:
      startDate || "Any date",

    endDate:
      endDate || "Any date",

    search:
      search.trim() || "No search",
  });

  /* =====================================================
     REPORT SNAPSHOT DATA
  ===================================================== */

  const getCurrentReportData = useCallback(() => {
    switch (activeTab) {
      case "academic":
        return {
          title: "Academic Performance Report",
          summary: {
            averagePerformance:
              performanceAverage,
            totalResults:
              filteredResults.length,
            students:
              studentPerformance.length,
            subjects:
              subjectPerformance.length,
          },
          rows: studentPerformance
            .slice(0, 200)
            .map((item) => ({
              studentName:
                item.studentName,
              admissionNumber:
                item.admissionNumber,
              className:
                item.className,
              average:
                Number(item.average.toFixed(2)),
              grade: item.grade,
              subjects:
                item.subjects.length,
            })),
        };

      case "attendance":
        return {
          title: "Student Attendance Report",
          summary: {
            attendanceRate,
            totalRecords:
              filteredAttendance.length,
            present:
              attendanceSummary.Present,
            absent:
              attendanceSummary.Absent,
            late:
              attendanceSummary.Late,
          },
          rows: filteredAttendance
            .slice(0, 200)
            .map((item) => ({
              studentName:
                item.studentName,
              admissionNumber:
                item.admissionNumber,
              className:
                item.className,
              date: dateOnly(item.date),
              status: item.status,
              session:
                item.session || "",
              term: item.term || "",
            })),
        };

      case "finance":
        return {
          title: "Finance & Fees Report",
          summary: {
            expectedFees,
            collectedFees,
            outstandingFees,
            totalExpenses,
            netFinance,
          },
          rows: filteredFees
            .slice(0, 200)
            .map((item) => ({
              studentName:
                item.studentName,
              admissionNumber:
                item.admissionNumber,
              className:
                item.className,
              expected:
                item.expected,
              paid: item.paid,
              outstanding:
                item.outstanding,
              status: item.status,
              date:
                dateOnly(item.date),
            })),
        };

      case "teachers":
        return {
          title: "Teacher Report",
          summary: {
            teachers:
              teacherReport.length,
            active:
              teacherReport.filter(
                (teacher) =>
                  String(
                    teacher.status
                  ).toLowerCase() !==
                  "inactive"
              ).length,
          },
          rows: teacherReport
            .slice(0, 200)
            .map((teacher) => ({
              name: teacher.name,
              role: teacher.role,
              department:
                teacher.department,
              className:
                teacher.className,
              resultCount:
                teacher.resultCount,
              average:
                Number(
                  teacher.average.toFixed(2)
                ),
              attendanceRate:
                Number(
                  teacher.attendanceRate.toFixed(
                    2
                  )
                ),
            })),
        };

      case "classes":
        return {
          title: "Class Report",
          summary: {
            classes:
              classReport.length,
            students:
              filteredStudents.length,
            average:
              average(
                classReport.map(
                  (item) =>
                    item.average
                )
              ),
          },
          rows: classReport
            .slice(0, 200)
            .map((item) => ({
              className:
                item.className,
              students:
                item.students,
              male: item.male,
              female: item.female,
              average:
                Number(
                  item.average.toFixed(2)
                ),
              attendance:
                Number(
                  item.attendance.toFixed(2)
                ),
              outstanding:
                item.outstanding,
            })),
        };

      default:
        return {
          title: "School Overview Report",
          summary: {
            students: activeStudents,
            teachers: teachers.length,
            performance:
              performanceAverage,
            attendance:
              attendanceRate,
            collectedFees,
            outstandingFees,
            netFinance,
          },
          rows: classReport
            .slice(0, 200)
            .map((item) => ({
              className:
                item.className,
              students:
                item.students,
              average:
                Number(
                  item.average.toFixed(2)
                ),
              attendance:
                Number(
                  item.attendance.toFixed(2)
                ),
              paid: item.paid,
              outstanding:
                item.outstanding,
            })),
        };
    }
  }, [
    activeTab,
    performanceAverage,
    filteredResults,
    studentPerformance,
    subjectPerformance,
    attendanceRate,
    filteredAttendance,
    attendanceSummary,
    expectedFees,
    collectedFees,
    outstandingFees,
    totalExpenses,
    netFinance,
    teacherReport,
    classReport,
    filteredStudents.length,
    activeStudents,
    teachers.length,
  ]);

  /* =====================================================
     GENERATE REPORT
  ===================================================== */

  const generateReport = () => {
    const reportData =
      getCurrentReportData();

    const snapshot = {
      id: uid("report"),
      type: activeTab,
      title: reportData.title,
      generatedAt:
        new Date().toISOString(),
      filters: getFilterSnapshot(),
      summary: reportData.summary,
      rows: reportData.rows,
    };

    const updatedHistory = [
      snapshot,
      ...reportHistory,
    ].slice(0, 30);

    writeStorage(
      STORAGE_KEYS.reportHistory,
      updatedHistory
    );

    setReportHistory(updatedHistory);

    appendAuditLog({
      action: "Generated report",
      description: `Generated ${reportData.title}`,
      entityId: snapshot.id,
      metadata: {
        type: activeTab,
        filters: snapshot.filters,
      },
    });

    showToast(
      `${reportData.title} generated successfully.`
    );

    setModal({
      type: "history-detail",
      data: snapshot,
    });
  };

  /* =====================================================
     EXPORT CURRENT REPORT
  ===================================================== */

  const exportCurrentReport = () => {
    let sections = [];

    if (activeTab === "overview") {
      sections = [
        {
          title: "School Overview",
          headers: ["Metric", "Value"],
          rows: [
            ["Active Students", activeStudents],
            ["Teachers", teachers.length],
            [
              "Average Performance",
              formatPercent(performanceAverage),
            ],
            [
              "Attendance Rate",
              formatPercent(attendanceRate),
            ],
            [
              "Expected Fees",
              formatCurrency(expectedFees),
            ],
            [
              "Collected Fees",
              formatCurrency(collectedFees),
            ],
            [
              "Outstanding Fees",
              formatCurrency(outstandingFees),
            ],
            [
              "Total Expenses",
              formatCurrency(totalExpenses),
            ],
            [
              "Net Finance",
              formatCurrency(netFinance),
            ],
          ],
        },

        {
          title: "Class Overview",
          headers: [
            "Class",
            "Students",
            "Average",
            "Attendance",
            "Paid",
            "Outstanding",
          ],
          rows: classReport.map((item) => [
            item.className,
            item.students,
            item.average.toFixed(2),
            formatPercent(item.attendance),
            item.paid,
            item.outstanding,
          ]),
        },
      ];
    }

    if (activeTab === "academic") {
      sections = [
        {
          title:
            "Student Academic Performance",
          headers: [
            "Student",
            "Admission Number",
            "Class",
            "Average",
            "Grade",
            "Subjects",
          ],
          rows: studentPerformance.map(
            (item) => [
              item.studentName,
              item.admissionNumber,
              item.className,
              item.average.toFixed(2),
              item.grade,
              item.subjects.length,
            ]
          ),
        },

        {
          title: "Subject Performance",
          headers: [
            "Subject",
            "Average",
            "Records",
            "Students",
          ],
          rows: subjectPerformance.map(
            (item) => [
              item.subject,
              item.average.toFixed(2),
              item.count,
              item.students,
            ]
          ),
        },
      ];
    }

    if (activeTab === "attendance") {
      sections = [
        {
          title: "Attendance Summary",
          headers: ["Status", "Count"],
          rows: Object.entries(
            attendanceSummary
          ).map(([status, count]) => [
            status,
            count,
          ]),
        },

        {
          title: "Attendance Records",
          headers: [
            "Student",
            "Admission Number",
            "Class",
            "Date",
            "Status",
          ],
          rows: filteredAttendance.map(
            (item) => [
              item.studentName,
              item.admissionNumber,
              item.className,
              dateOnly(item.date),
              item.status,
            ]
          ),
        },
      ];
    }

    if (activeTab === "finance") {
      sections = [
        {
          title: "Finance Summary",
          headers: ["Metric", "Value"],
          rows: [
            [
              "Expected Fees",
              formatCurrency(expectedFees),
            ],
            [
              "Collected Fees",
              formatCurrency(collectedFees),
            ],
            [
              "Outstanding Fees",
              formatCurrency(outstandingFees),
            ],
            [
              "Expenses",
              formatCurrency(totalExpenses),
            ],
            [
              "Net Finance",
              formatCurrency(netFinance),
            ],
          ],
        },

        {
          title: "Fee Records",
          headers: [
            "Student",
            "Admission Number",
            "Class",
            "Expected",
            "Paid",
            "Outstanding",
            "Status",
            "Date",
          ],
          rows: filteredFees.map((item) => [
            item.studentName,
            item.admissionNumber,
            item.className,
            item.expected,
            item.paid,
            item.outstanding,
            item.status,
            dateOnly(item.date),
          ]),
        },
      ];
    }

    if (activeTab === "teachers") {
      sections = [
        {
          title: "Teacher Report",
          headers: [
            "Name",
            "Role",
            "Department",
            "Class",
            "Results",
            "Average",
            "Attendance",
          ],
          rows: teacherReport.map(
            (teacher) => [
              teacher.name,
              teacher.role,
              teacher.department,
              teacher.className,
              teacher.resultCount,
              teacher.average.toFixed(2),
              formatPercent(
                teacher.attendanceRate
              ),
            ]
          ),
        },
      ];
    }

    if (activeTab === "classes") {
      sections = [
        {
          title: "Class Report",
          headers: [
            "Class",
            "Students",
            "Male",
            "Female",
            "Average",
            "Attendance",
            "Expected",
            "Paid",
            "Outstanding",
          ],
          rows: classReport.map((item) => [
            item.className,
            item.students,
            item.male,
            item.female,
            item.average.toFixed(2),
            formatPercent(item.attendance),
            item.expected,
            item.paid,
            item.outstanding,
          ]),
        },
      ];
    }

    downloadCSV(
      sections,
      `school-${activeTab}-report-${dateOnly(
        new Date()
      )}.csv`
    );

    appendAuditLog({
      action: "Exported report",
      description: `Exported ${activeTab} report as CSV`,
      metadata: {
        type: activeTab,
        filters: getFilterSnapshot(),
      },
    });

    showToast("Report exported as CSV.");
  };

  /* =====================================================
     PRINT
  ===================================================== */

  const printReport = () => {
    appendAuditLog({
      action: "Printed report",
      description: `Printed ${activeTab} report`,
      metadata: {
        type: activeTab,
        filters: getFilterSnapshot(),
      },
    });

    window.print();
  };

  /* =====================================================
     REPORT HISTORY
  ===================================================== */

  const openHistory = () => {
    setModal({
      type: "history",
    });
  };

  const deleteHistoryItem = (id) => {
    const updated =
      reportHistory.filter(
        (item) => item.id !== id
      );

    writeStorage(
      STORAGE_KEYS.reportHistory,
      updated
    );

    setReportHistory(updated);

    showToast("Report history item deleted.");
  };

  const exportSnapshot = (snapshot) => {
    if (!snapshot) return;

    const rows = snapshot.rows || [];

    if (!rows.length) {
      showToast(
        "This report does not contain exportable rows.",
        "error"
      );
      return;
    }

    const headers = Object.keys(
      rows[0]
    );

    downloadCSV(
      [
        {
          title: snapshot.title,
          headers,
          rows: rows.map((row) =>
            headers.map(
              (header) => row[header]
            )
          ),
        },
      ],
      `${snapshot.type}-report-${dateOnly(
        snapshot.generatedAt
      )}.csv`
    );

    appendAuditLog({
      action: "Exported saved report",
      description: `Exported saved report ${snapshot.title}`,
      entityId: snapshot.id,
    });

    showToast("Saved report exported.");
  };

  /* =====================================================
     DRILL DOWN
  ===================================================== */

  const openStudentDetails = (studentData) => {
    const student =
      students.find(
        (item) =>
          String(item.id) ===
          String(studentData.studentId)
      ) ||
      students.find(
        (item) =>
          String(item.admissionNumber) ===
          String(
            studentData.admissionNumber
          )
      );

    const records =
      filteredResults.filter(
        (result) =>
          String(result.studentId) ===
            String(
              studentData.studentId
            ) ||
          String(
            result.admissionNumber
          ) ===
            String(
              studentData.admissionNumber
            ) ||
          String(result.studentName)
            .toLowerCase() ===
            String(
              studentData.studentName
            ).toLowerCase()
      );

    const attendanceRows =
      filteredAttendance.filter(
        (item) =>
          String(item.studentId) ===
            String(
              studentData.studentId
            ) ||
          String(
            item.admissionNumber
          ) ===
            String(
              studentData.admissionNumber
            )
      );

    const feeRows =
      filteredFees.filter(
        (item) =>
          String(item.studentId) ===
            String(
              studentData.studentId
            ) ||
          String(
            item.admissionNumber
          ) ===
            String(
              studentData.admissionNumber
            )
      );

    setModal({
      type: "student",
      data: {
        student,
        performance: studentData,
        results: records,
        attendance: attendanceRows,
        fees: feeRows,
      },
    });
  };

  const openSubjectDetails = (subject) => {
    const rows =
      filteredResults.filter(
        (result) =>
          String(result.subject)
            .toLowerCase() ===
          String(subject.subject)
            .toLowerCase()
      );

    setModal({
      type: "subject",
      data: {
        subject: subject.subject,
        rows,
      },
    });
  };

  const openClassDetails = (className) => {
    const classStudents =
      filteredStudents.filter(
        (student) =>
          student.className === className
      );

    const classResults =
      filteredResults.filter(
        (result) =>
          result.className === className
      );

    const classAttendanceRows =
      filteredAttendance.filter(
        (item) =>
          item.className === className
      );

    const classFees =
      filteredFees.filter(
        (item) =>
          item.className === className
      );

    setModal({
      type: "class",
      data: {
        className,
        students: classStudents,
        results: classResults,
        attendance: classAttendanceRows,
        fees: classFees,
      },
    });
  };

  const openAttendanceDetails = (record) => {
    const rows =
      filteredAttendance.filter(
        (item) =>
          String(item.studentId) ===
            String(record.studentId) ||
          String(
            item.admissionNumber
          ) ===
            String(
              record.admissionNumber
            )
      );

    setModal({
      type: "attendance",
      data: {
        record,
        rows,
      },
    });
  };

  const openFeeDetails = (fee) => {
    const rows =
      filteredFees.filter(
        (item) =>
          String(item.studentId) ===
            String(fee.studentId) ||
          String(
            item.admissionNumber
          ) ===
            String(fee.admissionNumber)
      );

    setModal({
      type: "fee",
      data: {
        fee,
        rows,
      },
    });
  };

  const openTeacherDetails = (teacher) => {
    const teacherResults =
      filteredResults.filter(
        (result) =>
          String(result.teacherId) ===
            String(teacher.id) ||
          String(
            result.teacherName
          ).toLowerCase() ===
            String(
              teacher.name
            ).toLowerCase()
      );

    const teacherAttendanceRows =
      teacherAttendance.filter(
        (row) =>
          String(
            getFirst(row, [
              "teacherId",
              "teacherID",
              "staffId",
              "employeeId",
            ])
          ) === String(teacher.id)
      );

    setModal({
      type: "teacher",
      data: {
        teacher,
        results: teacherResults,
        attendance:
          teacherAttendanceRows,
      },
    });
  };

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const goToTab = (tab) => {
    setActiveTab(tab);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     TABS
  ===================================================== */

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
    },
    {
      id: "academic",
      label: "Academic",
      icon: GraduationCap,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: ClipboardCheck,
    },
    {
      id: "finance",
      label: "Finance",
      icon: Wallet,
    },
    {
      id: "teachers",
      label: "Teachers",
      icon: Users,
    },
    {
      id: "classes",
      label: "Classes",
      icon: School,
    },
  ];

  /* =====================================================
     RENDER
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <FileBarChart size={27} />
          </div>

          <h2 className="font-semibold text-slate-900">
            Loading reports...
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Preparing school analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .reports-no-print {
            display: none !important;
          }

          .reports-print-only {
            display: block !important;
          }

          body {
            background: white !important;
          }

          .reports-page {
            padding: 0 !important;
            background: white !important;
          }

          .reports-card {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
          }

          table {
            break-inside: auto;
          }

          tr {
            break-inside: avoid;
            break-after: auto;
          }
        }

        .reports-print-only {
          display: none;
        }
      `}</style>

      <div className="reports-page min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-7">
        {/* PRINT HEADER */}

        <div className="reports-print-only mb-6">
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  School Management System
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                  {tabs.find(
                    (tab) =>
                      tab.id === activeTab
                  )?.label}{" "}
                  Report
                </p>
              </div>

              <div className="text-right text-xs text-slate-500">
                <p>
                  Generated:{" "}
                  {formatDateTime(
                    new Date()
                  )}
                </p>

                <p>
                  Session:{" "}
                  {sessionFilter === "all"
                    ? "All"
                    : sessionFilter}
                </p>

                <p>
                  Term:{" "}
                  {termFilter === "all"
                    ? "All"
                    : termFilter}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* HEADER */}

        <div className="reports-no-print mx-auto mb-5 max-w-[1600px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <FileBarChart size={24} />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      Reports & Analytics
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                      Monitor academic performance,
                      attendance, finance, teachers,
                      students and classes from one
                      operational reporting center.
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Database size={13} />
                    Live local data
                  </span>

                  <span>•</span>

                  <span>
                    Updated{" "}
                    {formatDateTime(
                      lastUpdated
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  icon={History}
                  onClick={openHistory}
                >
                  History
                </Button>

                <Button
                  icon={Download}
                  onClick={
                    exportCurrentReport
                  }
                >
                  Export
                </Button>

                <Button
                  icon={Printer}
                  onClick={printReport}
                >
                  Print
                </Button>

                <Button
                  icon={FileBarChart}
                  variant="blue"
                  onClick={generateReport}
                >
                  Generate Report
                </Button>

                <Button
                  icon={RefreshCcw}
                  onClick={() =>
                    loadData(true)
                  }
                  disabled={refreshing}
                >
                  {refreshing
                    ? "Refreshing..."
                    : "Refresh"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-[1600px]">
          {/* FILTERS */}

          <div className="reports-no-print mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter
                  size={17}
                  className="text-blue-600"
                />

                <h2 className="font-semibold text-slate-900">
                  Report Filters
                </h2>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                  Academic Session
                </span>

                <select
                  value={sessionFilter}
                  onChange={(event) =>
                    setSessionFilter(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">
                    All Sessions
                  </option>

                  {sessions.map(
                    (session) => (
                      <option
                        key={session}
                        value={session}
                      >
                        {session}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                  Term
                </span>

                <select
                  value={termFilter}
                  onChange={(event) =>
                    setTermFilter(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">
                    All Terms
                  </option>

                  {terms.map((term) => (
                    <option
                      key={term}
                      value={term}
                    >
                      {term}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                  Class
                </span>

                <select
                  value={classFilter}
                  onChange={(event) =>
                    setClassFilter(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">
                    All Classes
                  </option>

                  {classes.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                  Start Date
                </span>

                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) =>
                      setStartDate(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                  End Date
                </span>

                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) =>
                      setEndDate(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                  Search
                </span>

                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Student, class, subject..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </label>
            </div>
          </div>

          {/* TABS */}

          <div className="reports-no-print mb-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <div className="flex min-w-max gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active =
                  activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      goToTab(tab.id)
                    }
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
              OVERVIEW
          ================================================= */}

          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={Users}
                  label="Active Students"
                  value={formatNumber(
                    activeStudents
                  )}
                  description="Students matching filters"
                  onClick={() =>
                    goToTab("classes")
                  }
                />

                <StatCard
                  icon={GraduationCap}
                  label="Teachers"
                  value={formatNumber(
                    teachers.length
                  )}
                  description="Teaching staff"
                  onClick={() =>
                    goToTab("teachers")
                  }
                />

                <StatCard
                  icon={Award}
                  label="Average Performance"
                  value={formatPercent(
                    performanceAverage
                  )}
                  description="Average result score"
                  onClick={() =>
                    goToTab("academic")
                  }
                />

                <StatCard
                  icon={ClipboardCheck}
                  label="Attendance"
                  value={formatPercent(
                    attendanceRate
                  )}
                  description="Student attendance rate"
                  onClick={() =>
                    goToTab("attendance")
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <StatCard
                  icon={CircleDollarSign}
                  label="Fees Collected"
                  value={formatCurrency(
                    collectedFees
                  )}
                  description={`Expected ${formatCurrency(
                    expectedFees
                  )}`}
                  onClick={() =>
                    goToTab("finance")
                  }
                />

                <StatCard
                  icon={AlertCircle}
                  label="Outstanding Fees"
                  value={formatCurrency(
                    outstandingFees
                  )}
                  description="Outstanding student balances"
                  onClick={() =>
                    goToTab("finance")
                  }
                />

                <StatCard
                  icon={Wallet}
                  label="Net Finance"
                  value={formatCurrency(
                    netFinance
                  )}
                  description={`After ${formatCurrency(
                    totalExpenses
                  )} expenses`}
                  onClick={() =>
                    goToTab("finance")
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <SectionCard
                  title="Class Performance"
                  description="Average academic performance by class"
                  icon={BarChart3}
                >
                  {classReport.length ? (
                    <div className="space-y-4">
                      {classReport
                        .slice(0, 8)
                        .map((item) => (
                          <button
                            type="button"
                            key={
                              item.className
                            }
                            onClick={() =>
                              openClassDetails(
                                item.className
                              )
                            }
                            className="group w-full text-left"
                          >
                            <div className="mb-1.5 flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-700">
                                {item.className}
                              </span>

                              <span className="text-sm font-bold text-slate-900">
                                {item.average.toFixed(
                                  1
                                )}
                                %
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-600 transition-all group-hover:bg-blue-700"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      item.average
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </SectionCard>

                <SectionCard
                  title="Grade Distribution"
                  description="Distribution of academic grades"
                  icon={PieChart}
                >
                  {filteredResults.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {Object.entries(
                        gradeDistribution
                      ).map(
                        ([grade, count]) => (
                          <div
                            key={grade}
                            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`flex h-9 w-9 items-center justify-center rounded-lg font-bold ${getGradeClass(
                                  grade ===
                                    "A"
                                    ? 90
                                    : grade ===
                                      "B"
                                    ? 75
                                    : grade ===
                                      "C"
                                    ? 65
                                    : grade ===
                                      "D"
                                    ? 55
                                    : grade ===
                                      "E"
                                    ? 45
                                    : 20
                                )}`}
                              >
                                {grade}
                              </span>

                              <span className="text-xl font-bold text-slate-900">
                                {count}
                              </span>
                            </div>

                            <p className="mt-3 text-xs text-slate-500">
                              {getGradeLabel(
                                grade
                              )}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </SectionCard>
              </div>

              <SectionCard
                title="Finance Overview"
                description="Current fee collection and expenditure position"
                icon={Wallet}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <MiniMetric
                    label="Expected"
                    value={formatCurrency(
                      expectedFees
                    )}
                    icon={CircleDollarSign}
                  />

                  <MiniMetric
                    label="Collected"
                    value={formatCurrency(
                      collectedFees
                    )}
                    icon={CheckCircle2}
                  />

                  <MiniMetric
                    label="Outstanding"
                    value={formatCurrency(
                      outstandingFees
                    )}
                    icon={AlertCircle}
                  />

                  <MiniMetric
                    label="Expenses"
                    value={formatCurrency(
                      totalExpenses
                    )}
                    icon={ArrowDown}
                  />
                </div>
              </SectionCard>
            </div>
          )}

          {/* =================================================
              ACADEMIC
          ================================================= */}

          {activeTab === "academic" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={Award}
                  label="Average Score"
                  value={formatPercent(
                    performanceAverage
                  )}
                  description="Across filtered results"
                />

                <StatCard
                  icon={FileText}
                  label="Results"
                  value={formatNumber(
                    filteredResults.length
                  )}
                  description="Result records"
                />

                <StatCard
                  icon={Users}
                  label="Students Assessed"
                  value={formatNumber(
                    studentPerformance.length
                  )}
                  description="Unique students"
                />

                <StatCard
                  icon={BookOpen}
                  label="Subjects"
                  value={formatNumber(
                    subjectPerformance.length
                  )}
                  description="Subjects with results"
                />
              </div>

              <SectionCard
                title="Student Performance"
                description="Click a student to inspect subject-level results."
                icon={GraduationCap}
              >
                {studentPerformance.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                          <th className="px-3 py-3">
                            Student
                          </th>
                          <th className="px-3 py-3">
                            Admission
                          </th>
                          <th className="px-3 py-3">
                            Class
                          </th>
                          <th className="px-3 py-3">
                            Subjects
                          </th>
                          <th className="px-3 py-3">
                            Average
                          </th>
                          <th className="px-3 py-3">
                            Grade
                          </th>
                          <th className="px-3 py-3 text-right">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {studentPerformance
                          .slice(0, 100)
                          .map((item) => (
                            <tr
                              key={item.key}
                              className="transition hover:bg-slate-50"
                            >
                              <td className="px-3 py-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openStudentDetails(
                                      item
                                    )
                                  }
                                  className="text-left font-semibold text-slate-800 hover:text-blue-600"
                                >
                                  {
                                    item.studentName
                                  }
                                </button>
                              </td>

                              <td className="px-3 py-3 text-sm text-slate-500">
                                {item.admissionNumber ||
                                  "—"}
                              </td>

                              <td className="px-3 py-3">
                                <Pill tone="blue">
                                  {item.className ||
                                    "Unassigned"}
                                </Pill>
                              </td>

                              <td className="px-3 py-3 text-sm text-slate-600">
                                {
                                  item.subjects
                                    .length
                                }
                              </td>

                              <td className="px-3 py-3 font-bold text-slate-900">
                                {item.average.toFixed(
                                  1
                                )}
                                %
                              </td>

                              <td className="px-3 py-3">
                                <span
                                  className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${getGradeClass(
                                    item.average
                                  )}`}
                                >
                                  {item.grade}
                                </span>
                              </td>

                              <td className="px-3 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openStudentDetails(
                                      item
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                >
                                  <Eye
                                    size={14}
                                  />
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={GraduationCap}
                    title="No academic records"
                    description="Result records matching the selected filters will appear here."
                  />
                )}
              </SectionCard>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <SectionCard
                  title="Subject Performance"
                  description="Average score by subject"
                  icon={BookOpen}
                >
                  {subjectPerformance.length ? (
                    <div className="space-y-3">
                      {subjectPerformance
                        .slice(0, 10)
                        .map((item) => (
                          <button
                            key={item.subject}
                            type="button"
                            onClick={() =>
                              openSubjectDetails(
                                item
                              )
                            }
                            className="group w-full rounded-xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/30"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {item.subject}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {item.students}{" "}
                                  students •{" "}
                                  {item.count}{" "}
                                  records
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="font-bold text-slate-900">
                                  {item.average.toFixed(
                                    1
                                  )}
                                  %
                                </p>

                                <ChevronRight
                                  size={15}
                                  className="ml-auto mt-1 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500"
                                />
                              </div>
                            </div>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    item.average
                                  )}%`,
                                }}
                              />
                            </div>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </SectionCard>

                <SectionCard
                  title="Class Academic Performance"
                  description="Compare class-level academic averages."
                  icon={School}
                >
                  {classPerformance.length ? (
                    <div className="space-y-3">
                      {classPerformance
                        .slice(0, 10)
                        .map((item) => (
                          <button
                            key={
                              item.className
                            }
                            type="button"
                            onClick={() =>
                              openClassDetails(
                                item.className
                              )
                            }
                            className="group w-full rounded-xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/30"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {
                                    item.className
                                  }
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {
                                    item.studentCount
                                  }{" "}
                                  students
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">
                                  {item.average.toFixed(
                                    1
                                  )}
                                  %
                                </span>

                                <ChevronRight
                                  size={16}
                                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500"
                                />
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </SectionCard>
              </div>
            </div>
          )}

          {/* =================================================
              ATTENDANCE
          ================================================= */}

          {activeTab === "attendance" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                  icon={CheckCircle2}
                  label="Present"
                  value={formatNumber(
                    attendanceSummary.Present
                  )}
                  description="Present records"
                />

                <StatCard
                  icon={XCircle}
                  label="Absent"
                  value={formatNumber(
                    attendanceSummary.Absent
                  )}
                  description="Absent records"
                />

                <StatCard
                  icon={Clock}
                  label="Late"
                  value={formatNumber(
                    attendanceSummary.Late
                  )}
                  description="Late records"
                />

                <StatCard
                  icon={ClipboardCheck}
                  label="Attendance Rate"
                  value={formatPercent(
                    attendanceRate
                  )}
                  description="Overall attendance"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <SectionCard
                  title="Attendance by Class"
                  description="Click a class for detailed attendance."
                  icon={School}
                >
                  {classAttendance.length ? (
                    <div className="space-y-3">
                      {classAttendance.map(
                        (item) => (
                          <button
                            key={
                              item.className
                            }
                            type="button"
                            onClick={() =>
                              openClassDetails(
                                item.className
                              )
                            }
                            className="group w-full rounded-xl border border-slate-100 p-3 text-left hover:border-blue-200 hover:bg-blue-50/30"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {
                                    item.className
                                  }
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {
                                    item.studentCount
                                  }{" "}
                                  students •{" "}
                                  {item.total}{" "}
                                  records
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-bold ${
                                    item.rate >=
                                    80
                                      ? "text-emerald-600"
                                      : item.rate >=
                                        60
                                      ? "text-amber-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {item.rate.toFixed(
                                    1
                                  )}
                                  %
                                </span>

                                <ChevronRight
                                  size={16}
                                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500"
                                />
                              </div>
                            </div>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    item.rate
                                  )}%`,
                                }}
                              />
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={ClipboardCheck}
                    />
                  )}
                </SectionCard>

                <SectionCard
                  title="Attendance Trend"
                  description="Recent attendance records over time."
                  icon={LineChart}
                >
                  {attendanceTrend.length ? (
                    <div className="space-y-3">
                      {attendanceTrend.map(
                        (item) => {
                          const rate =
                            item.total
                              ? (item.present /
                                  item.total) *
                                100
                              : 0;

                          return (
                            <div
                              key={item.date}
                              className="flex items-center gap-3"
                            >
                              <span className="w-20 text-xs text-slate-500">
                                {formatDate(
                                  item.date
                                )}
                              </span>

                              <div className="flex-1">
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-blue-600"
                                    style={{
                                      width: `${rate}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              <span className="w-14 text-right text-xs font-bold text-slate-700">
                                {rate.toFixed(
                                  0
                                )}
                                %
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </SectionCard>
              </div>

              <SectionCard
                title="Attendance Records"
                description="Click any record to view the student's attendance history."
                icon={ClipboardCheck}
              >
                {filteredAttendance.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                          <th className="px-3 py-3">
                            Student
                          </th>
                          <th className="px-3 py-3">
                            Class
                          </th>
                          <th className="px-3 py-3">
                            Date
                          </th>
                          <th className="px-3 py-3">
                            Session
                          </th>
                          <th className="px-3 py-3">
                            Term
                          </th>
                          <th className="px-3 py-3">
                            Status
                          </th>
                          <th className="px-3 py-3 text-right">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredAttendance
                          .slice(0, 150)
                          .map(
                            (
                              record,
                              index
                            ) => (
                              <tr
                                key={
                                  record.id ||
                                  `${record.studentId}-${record.date}-${index}`
                                }
                                className="hover:bg-slate-50"
                              >
                                <td className="px-3 py-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openAttendanceDetails(
                                        record
                                      )
                                    }
                                    className="font-semibold text-slate-800 hover:text-blue-600"
                                  >
                                    {
                                      record.studentName
                                    }
                                  </button>
                                </td>

                                <td className="px-3 py-3 text-sm text-slate-500">
                                  {record.className ||
                                    "—"}
                                </td>

                                <td className="px-3 py-3 text-sm text-slate-500">
                                  {formatDate(
                                    record.date
                                  )}
                                </td>

                                <td className="px-3 py-3 text-sm text-slate-500">
                                  {record.session ||
                                    "—"}
                                </td>

                                <td className="px-3 py-3 text-sm text-slate-500">
                                  {record.term ||
                                    "—"}
                                </td>

                                <td className="px-3 py-3">
                                  <Pill
                                    tone={
                                      record.status ===
                                      "Present"
                                        ? "green"
                                        : record.status ===
                                          "Absent"
                                        ? "red"
                                        : "amber"
                                    }
                                  >
                                    {
                                      record.status
                                    }
                                  </Pill>
                                </td>

                                <td className="px-3 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openAttendanceDetails(
                                        record
                                      )
                                    }
                                    className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <Eye
                                      size={
                                        16
                                      }
                                    />
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={ClipboardCheck}
                  />
                )}
              </SectionCard>
            </div>
          )}

          {/* =================================================
              FINANCE
          ================================================= */}

          {activeTab === "finance" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard
                  icon={CircleDollarSign}
                  label="Expected"
                  value={formatCurrency(
                    expectedFees
                  )}
                />

                <StatCard
                  icon={CheckCircle2}
                  label="Collected"
                  value={formatCurrency(
                    collectedFees
                  )}
                />

                <StatCard
                  icon={AlertCircle}
                  label="Outstanding"
                  value={formatCurrency(
                    outstandingFees
                  )}
                />

                <StatCard
                  icon={ArrowDown}
                  label="Expenses"
                  value={formatCurrency(
                    totalExpenses
                  )}
                />

                <StatCard
                  icon={
                    netFinance >= 0
                      ? ArrowUp
                      : ArrowDown
                  }
                  label="Net Finance"
                  value={formatCurrency(
                    netFinance
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <SectionCard
                  title="Fee Status"
                  description="Current payment status across filtered records."
                  icon={Wallet}
                >
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-emerald-50 p-4">
                      <p className="text-xs font-semibold text-emerald-600">
                        Paid
                      </p>
                      <p className="mt-1 text-2xl font-bold text-emerald-700">
                        {feeStatus.paid}
                      </p>
                    </div>

                    <div className="rounded-xl bg-amber-50 p-4">
                      <p className="text-xs font-semibold text-amber-600">
                        Partial
                      </p>
                      <p className="mt-1 text-2xl font-bold text-amber-700">
                        {feeStatus.partial}
                      </p>
                    </div>

                    <div className="rounded-xl bg-red-50 p-4">
                      <p className="text-xs font-semibold text-red-600">
                        Pending
                      </p>
                      <p className="mt-1 text-2xl font-bold text-red-700">
                        {feeStatus.pending}
                      </p>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Collection by Class"
                  description="Expected, collected and outstanding balances."
                  icon={Building2}
                >
                  {feesByClass.length ? (
                    <div className="space-y-3">
                      {feesByClass
                        .slice(0, 8)
                        .map((item) => {
                          const collectionRate =
                            item.expected
                              ? (item.paid /
                                  item.expected) *
                                100
                              : 0;

                          return (
                            <button
                              key={
                                item.className
                              }
                              type="button"
                              onClick={() =>
                                openClassDetails(
                                  item.className
                                )
                              }
                              className="group w-full rounded-xl border border-slate-100 p-3 text-left hover:border-blue-200 hover:bg-blue-50/30"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">
                                  {
                                    item.className
                                  }
                                </span>

                                <span className="font-bold text-slate-900">
                                  {collectionRate.toFixed(
                                    0
                                  )}
                                  %
                                </span>
                              </div>

                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      collectionRate
                                    )}%`,
                                  }}
                                />
                              </div>

                              <div className="mt-2 flex justify-between text-xs text-slate-400">
                                <span>
                                  Paid{" "}
                                  {formatCurrency(
                                    item.paid
                                  )}
                                </span>

                                <span>
                                  Outstanding{" "}
                                  {formatCurrency(
                                    item.outstanding
                                  )}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Wallet}
                    />
                  )}
                </SectionCard>
              </div>

              <SectionCard
                title="Fee Records"
                description="Click a payment record to inspect the student's financial history."
                icon={CircleDollarSign}
              >
                {filteredFees.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                          <th className="px-3 py-3">
                            Student
                          </th>
                          <th className="px-3 py-3">
                            Class
                          </th>
                          <th className="px-3 py-3">
                            Expected
                          </th>
                          <th className="px-3 py-3">
                            Paid
                          </th>
                          <th className="px-3 py-3">
                            Outstanding
                          </th>
                          <th className="px-3 py-3">
                            Status
                          </th>
                          <th className="px-3 py-3">
                            Date
                          </th>
                          <th className="px-3 py-3 text-right">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredFees
                          .slice(0, 150)
                          .map(
                            (
                              fee,
                              index
                            ) => (
                              <tr
                                key={
                                  fee.id ||
                                  `${fee.studentId}-${fee.date}-${index}`
                                }
                                className="hover:bg-slate-50"
                              >
                                <td className="px-3 py-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openFeeDetails(
                                        fee
                                      )
                                    }
                                    className="font-semibold text-slate-800 hover:text-blue-600"
                                  >
                                    {
                                      fee.studentName
                                    }
                                  </button>
                                </td>

                                <td className="px-3 py-3 text-sm text-slate-500">
                                  {fee.className ||
                                    "—"}
                                </td>

                                <td className="px-3 py-3 text-sm font-medium text-slate-700">
                                  {formatCurrency(
                                    fee.expected
                                  )}
                                </td>

                                <td className="px-3 py-3 text-sm font-semibold text-emerald-600">
                                  {formatCurrency(
                                    fee.paid
                                  )}
                                </td>

                                <td className="px-3 py-3 text-sm font-semibold text-red-600">
                                  {formatCurrency(
                                    fee.outstanding
                                  )}
                                </td>

                                <td className="px-3 py-3">
                                  <Pill
                                    tone={
                                      fee.status ===
                                      "Paid"
                                        ? "green"
                                        : fee.status ===
                                          "Partial"
                                        ? "amber"
                                        : "red"
                                    }
                                  >
                                    {
                                      fee.status
                                    }
                                  </Pill>
                                </td>

                                <td className="px-3 py-3 text-sm text-slate-500">
                                  {formatDate(
                                    fee.date
                                  )}
                                </td>

                                <td className="px-3 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openFeeDetails(
                                        fee
                                      )
                                    }
                                    className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <Eye
                                      size={
                                        16
                                      }
                                    />
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={Wallet}
                  />
                )}
              </SectionCard>
            </div>
          )}

          {/* =================================================
              TEACHERS
          ================================================= */}

          {activeTab === "teachers" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  icon={Users}
                  label="Teachers"
                  value={teacherReport.length}
                  description="Matching teachers"
                />

                <StatCard
                  icon={CheckCircle2}
                  label="Active"
                  value={
                    teacherReport.filter(
                      (teacher) =>
                        String(
                          teacher.status
                        ).toLowerCase() !==
                        "inactive"
                    ).length
                  }
                  description="Active staff"
                />

                <StatCard
                  icon={Award}
                  label="Average"
                  value={formatPercent(
                    average(
                      teacherReport.map(
                        (teacher) =>
                          teacher.average
                      )
                    )
                  )}
                  description="Average result performance"
                />
              </div>

              <SectionCard
                title="Teacher Performance"
                description="Click a teacher to inspect teaching activity."
                icon={Users}
              >
                {teacherReport.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                          <th className="px-3 py-3">
                            Teacher
                          </th>
                          <th className="px-3 py-3">
                            Role
                          </th>
                          <th className="px-3 py-3">
                            Department
                          </th>
                          <th className="px-3 py-3">
                            Class
                          </th>
                          <th className="px-3 py-3">
                            Results
                          </th>
                          <th className="px-3 py-3">
                            Average
                          </th>
                          <th className="px-3 py-3">
                            Attendance
                          </th>
                          <th className="px-3 py-3 text-right">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {teacherReport.map(
                          (teacher) => (
                            <tr
                              key={
                                teacher.id ||
                                teacher.name
                              }
                              className="hover:bg-slate-50"
                            >
                              <td className="px-3 py-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openTeacherDetails(
                                      teacher
                                    )
                                  }
                                  className="flex items-center gap-3 text-left"
                                >
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                                    {teacher.name
                                      ?.charAt(
                                        0
                                      )
                                      ?.toUpperCase()}
                                  </div>

                                  <div>
                                    <p className="font-semibold text-slate-800 hover:text-blue-600">
                                      {
                                        teacher.name
                                      }
                                    </p>

                                    <p className="text-xs text-slate-400">
                                      {teacher.email ||
                                        "No email"}
                                    </p>
                                  </div>
                                </button>
                              </td>

                              <td className="px-3 py-3 text-sm text-slate-600">
                                {teacher.role ||
                                  "Teacher"}
                              </td>

                              <td className="px-3 py-3 text-sm text-slate-600">
                                {teacher.department ||
                                  "—"}
                              </td>

                              <td className="px-3 py-3">
                                {teacher.className ? (
                                  <Pill tone="blue">
                                    {
                                      teacher.className
                                    }
                                  </Pill>
                                ) : (
                                  "—"
                                )}
                              </td>

                              <td className="px-3 py-3 text-sm text-slate-600">
                                {
                                  teacher.resultCount
                                }
                              </td>

                              <td className="px-3 py-3 font-bold text-slate-900">
                                {teacher.average.toFixed(
                                  1
                                )}
                                %
                              </td>

                              <td className="px-3 py-3 font-semibold text-slate-700">
                                {teacher.attendanceRate
                                  ? `${teacher.attendanceRate.toFixed(
                                      1
                                    )}%`
                                  : "—"}
                              </td>

                              <td className="px-3 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openTeacherDetails(
                                      teacher
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                >
                                  <Eye
                                    size={
                                      14
                                    }
                                  />
                                  View
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No teacher data"
                    description="Teachers matching your search and class filters will appear here."
                  />
                )}
              </SectionCard>
            </div>
          )}

          {/* =================================================
              CLASSES
          ================================================= */}

          {activeTab === "classes" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  icon={School}
                  label="Classes"
                  value={classReport.length}
                  description="Classes in current report"
                />

                <StatCard
                  icon={Users}
                  label="Students"
                  value={formatNumber(
                    filteredStudents.length
                  )}
                  description="Students in current filters"
                />

                <StatCard
                  icon={Award}
                  label="Average"
                  value={formatPercent(
                    average(
                      classReport.map(
                        (item) =>
                          item.average
                      )
                    )
                  )}
                  description="Class performance average"
                />
              </div>

              <SectionCard
                title="Class Overview"
                description="Click any class to inspect students, results, attendance and fees."
                icon={School}
              >
                {classReport.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                          <th className="px-3 py-3">
                            Class
                          </th>
                          <th className="px-3 py-3">
                            Students
                          </th>
                          <th className="px-3 py-3">
                            Male
                          </th>
                          <th className="px-3 py-3">
                            Female
                          </th>
                          <th className="px-3 py-3">
                            Average
                          </th>
                          <th className="px-3 py-3">
                            Attendance
                          </th>
                          <th className="px-3 py-3">
                            Paid
                          </th>
                          <th className="px-3 py-3">
                            Outstanding
                          </th>
                          <th className="px-3 py-3 text-right">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {classReport.map(
                          (item) => (
                            <tr
                              key={
                                item.className
                              }
                              className="hover:bg-slate-50"
                            >
                              <td className="px-3 py-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openClassDetails(
                                      item.className
                                    )
                                  }
                                  className="font-semibold text-slate-800 hover:text-blue-600"
                                >
                                  {
                                    item.className
                                  }
                                </button>
                              </td>

                              <td className="px-3 py-3 font-semibold text-slate-700">
                                {item.students}
                              </td>

                              <td className="px-3 py-3 text-sm text-slate-500">
                                {item.male}
                              </td>

                              <td className="px-3 py-3 text-sm text-slate-500">
                                {item.female}
                              </td>

                              <td className="px-3 py-3 font-bold text-slate-900">
                                {item.average.toFixed(
                                  1
                                )}
                                %
                              </td>

                              <td className="px-3 py-3">
                                <Pill
                                  tone={
                                    item.attendance >=
                                    80
                                      ? "green"
                                      : item.attendance >=
                                        60
                                      ? "amber"
                                      : "red"
                                  }
                                >
                                  {item.attendance.toFixed(
                                    1
                                  )}
                                  %
                                </Pill>
                              </td>

                              <td className="px-3 py-3 font-semibold text-emerald-600">
                                {formatCurrency(
                                  item.paid
                                )}
                              </td>

                              <td className="px-3 py-3 font-semibold text-red-600">
                                {formatCurrency(
                                  item.outstanding
                                )}
                              </td>

                              <td className="px-3 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openClassDetails(
                                      item.className
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                >
                                  <Eye
                                    size={
                                      14
                                    }
                                  />
                                  Details
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={School}
                    title="No classes found"
                    description="Class information will appear when students or report records contain class information."
                  />
                )}
              </SectionCard>
            </div>
          )}
        </main>

        {/* =================================================
            MODALS
        ================================================= */}

        {/* STUDENT MODAL */}

        <Modal
          open={modal?.type === "student"}
          title={
            modal?.data?.student?.name ||
            modal?.data?.performance
              ?.studentName ||
            "Student Details"
          }
          subtitle="Academic, attendance and finance overview"
          onClose={() => setModal(null)}
          size="2xl"
          actions={
            <>
              {modal?.data?.student?.id && (
                <Button
                  icon={ExternalLink}
                  onClick={() =>
                    navigate(
                      `/students/${modal.data.student.id}`
                    )
                  }
                >
                  Open Student Profile
                </Button>
              )}

              <Button
                icon={Printer}
                onClick={() =>
                  window.print()
                }
              >
                Print
              </Button>

              <Button
                onClick={() =>
                  setModal(null)
                }
              >
                Close
              </Button>
            </>
          }
        >
          {modal?.data && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MiniMetric
                  label="Class"
                  value={
                    modal.data.student
                      ?.className ||
                    modal.data.performance
                      ?.className ||
                    "—"
                  }
                  icon={School}
                />

                <MiniMetric
                  label="Average"
                  value={`${modal.data.performance?.average?.toFixed(
                    1
                  ) || "0.0"}%`}
                  icon={Award}
                />

                <MiniMetric
                  label="Grade"
                  value={
                    modal.data.performance
                      ?.grade || "—"
                  }
                  icon={GraduationCap}
                />

                <MiniMetric
                  label="Attendance"
                  value={formatPercent(
                    modal.data.attendance
                      ?.length
                      ? (modal.data.attendance.filter(
                          (item) =>
                            item.status ===
                            "Present"
                        ).length /
                          modal.data.attendance
                            .length) *
                          100
                      : 0
                  )}
                  icon={ClipboardCheck}
                />
              </div>

              <SectionCard
                title="Student Information"
                icon={User}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      Admission Number
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {modal.data.student
                        ?.admissionNumber ||
                        modal.data.performance
                          ?.admissionNumber ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Session
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {modal.data.student
                        ?.session || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Term
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {modal.data.student
                        ?.term || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Gender
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {modal.data.student
                        ?.gender || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Phone
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {modal.data.student
                        ?.phone || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Email
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {modal.data.student
                        ?.email || "—"}
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Subject Results"
                description="All matching academic records"
                icon={BookOpen}
              >
                {modal.data.results?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                          <th className="px-3 py-3">
                            Subject
                          </th>
                          <th className="px-3 py-3">
                            Score
                          </th>
                          <th className="px-3 py-3">
                            Grade
                          </th>
                          <th className="px-3 py-3">
                            Term
                          </th>
                          <th className="px-3 py-3">
                            Date
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {modal.data.results.map(
                          (
                            result,
                            index
                          ) => (
                            <tr
                              key={
                                result.id ||
                                `${result.subject}-${index}`
                              }
                            >
                              <td className="px-3 py-3 font-semibold text-slate-800">
                                {
                                  result.subject
                                }
                              </td>

                              <td className="px-3 py-3 font-bold text-slate-900">
                                {result.score}
                                %
                              </td>

                              <td className="px-3 py-3">
                                <Pill
                                  tone={
                                    result.score >=
                                    70
                                      ? "green"
                                      : result.score >=
                                        50
                                      ? "amber"
                                      : "red"
                                  }
                                >
                                  {result.grade ||
                                    getGrade(
                                      result.score
                                    )}
                                </Pill>
                              </td>

                              <td className="px-3 py-3 text-sm text-slate-500">
                                {result.term ||
                                  "—"}
                              </td>

                              <td className="px-3 py-3 text-sm text-slate-500">
                                {formatDate(
                                  result.date
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={BookOpen}
                  />
                )}
              </SectionCard>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <SectionCard
                  title="Attendance"
                  icon={ClipboardCheck}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <MiniMetric
                      label="Present"
                      value={
                        modal.data.attendance?.filter(
                          (item) =>
                            item.status ===
                            "Present"
                        ).length || 0
                      }
                    />

                    <MiniMetric
                      label="Absent"
                      value={
                        modal.data.attendance?.filter(
                          (item) =>
                            item.status ===
                            "Absent"
                        ).length || 0
                      }
                    />

                    <MiniMetric
                      label="Late"
                      value={
                        modal.data.attendance?.filter(
                          (item) =>
                            item.status ===
                            "Late"
                        ).length || 0
                      }
                    />

                    <MiniMetric
                      label="Total"
                      value={
                        modal.data.attendance
                          ?.length || 0
                      }
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  title="Finance"
                  icon={Wallet}
                >
                  <div className="space-y-3">
                    <MiniMetric
                      label="Expected"
                      value={formatCurrency(
                        modal.data.fees?.reduce(
                          (
                            sum,
                            fee
                          ) =>
                            sum +
                            fee.expected,
                          0
                        ) || 0
                      )}
                    />

                    <MiniMetric
                      label="Paid"
                      value={formatCurrency(
                        modal.data.fees?.reduce(
                          (
                            sum,
                            fee
                          ) =>
                            sum +
                            fee.paid,
                          0
                        ) || 0
                      )}
                    />

                    <MiniMetric
                      label="Outstanding"
                      value={formatCurrency(
                        modal.data.fees?.reduce(
                          (
                            sum,
                            fee
                          ) =>
                            sum +
                            fee.outstanding,
                          0
                        ) || 0
                      )}
                    />
                  </div>
                </SectionCard>
              </div>
            </div>
          )}
        </Modal>

        {/* SUBJECT MODAL */}

        <Modal
          open={modal?.type === "subject"}
          title={modal?.data?.subject}
          subtitle="Detailed subject performance"
          onClose={() => setModal(null)}
          size="xl"
          actions={
            <Button
              onClick={() =>
                setModal(null)
              }
            >
              Close
            </Button>
          }
        >
          {modal?.data && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MiniMetric
                  label="Average"
                  value={formatPercent(
                    average(
                      modal.data.rows.map(
                        (row) =>
                          row.score
                      )
                    )
                  )}
                  icon={Award}
                />

                <MiniMetric
                  label="Records"
                  value={
                    modal.data.rows.length
                  }
                  icon={FileText}
                />

                <MiniMetric
                  label="Students"
                  value={
                    new Set(
                      modal.data.rows.map(
                        (row) =>
                          row.studentId ||
                          row.admissionNumber ||
                          row.studentName
                      )
                    ).size
                  }
                  icon={Users}
                />
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full min-w-[700px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-400">
                      <th className="px-3 py-3">
                        Student
                      </th>
                      <th className="px-3 py-3">
                        Class
                      </th>
                      <th className="px-3 py-3">
                        Score
                      </th>
                      <th className="px-3 py-3">
                        Grade
                      </th>
                      <th className="px-3 py-3">
                        Term
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {modal.data.rows.map(
                      (row, index) => (
                        <tr
                          key={
                            row.id ||
                            `${row.studentName}-${index}`
                          }
                        >
                          <td className="px-3 py-3 font-semibold text-slate-800">
                            {
                              row.studentName
                            }
                          </td>

                          <td className="px-3 py-3 text-sm text-slate-500">
                            {row.className ||
                              "—"}
                          </td>

                          <td className="px-3 py-3 font-bold">
                            {row.score}%
                          </td>

                          <td className="px-3 py-3">
                            <Pill
                              tone={
                                row.score >=
                                70
                                  ? "green"
                                  : row.score >=
                                    50
                                  ? "amber"
                                  : "red"
                              }
                            >
                              {row.grade ||
                                getGrade(
                                  row.score
                                )}
                            </Pill>
                          </td>

                          <td className="px-3 py-3 text-sm text-slate-500">
                            {row.term ||
                              "—"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal>

        {/* CLASS MODAL */}

        <Modal
          open={modal?.type === "class"}
          title={`${modal?.data?.className || ""} Details`}
          subtitle="Class academic, attendance and financial overview"
          onClose={() => setModal(null)}
          size="2xl"
          actions={
            <Button
              onClick={() =>
                setModal(null)
              }
            >
              Close
            </Button>
          }
        >
          {modal?.data && (
            <div className="space-y-5">
              {(() => {
                const classStudents =
                  modal.data.students ||
                  [];

                const classResults =
                  modal.data.results ||
                  [];

                const classAttendanceRows =
                  modal.data.attendance ||
                  [];

                const classFees =
                  modal.data.fees || [];

                const avg =
                  average(
                    classResults.map(
                      (row) =>
                        row.score
                    )
                  );

                const attendanceRate =
                  classAttendanceRows.length
                    ? (classAttendanceRows.filter(
                        (row) =>
                          row.status ===
                          "Present"
                      ).length /
                        classAttendanceRows.length) *
                      100
                    : 0;

                return (
                  <>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                      <MiniMetric
                        label="Students"
                        value={
                          classStudents.length
                        }
                        icon={Users}
                      />

                      <MiniMetric
                        label="Average"
                        value={`${avg.toFixed(
                          1
                        )}%`}
                        icon={Award}
                      />

                      <MiniMetric
                        label="Attendance"
                        value={formatPercent(
                          attendanceRate
                        )}
                        icon={
                          ClipboardCheck
                        }
                      />

                      <MiniMetric
                        label="Paid"
                        value={formatCurrency(
                          classFees.reduce(
                            (
                              sum,
                              fee
                            ) =>
                              sum +
                              fee.paid,
                            0
                          )
                        )}
                        icon={
                          CheckCircle2
                        }
                      />

                      <MiniMetric
                        label="Outstanding"
                        value={formatCurrency(
                          classFees.reduce(
                            (
                              sum,
                              fee
                            ) =>
                              sum +
                              fee.outstanding,
                            0
                          )
                        )}
                        icon={
                          AlertCircle
                        }
                      />
                    </div>

                    <SectionCard
                      title="Students"
                      icon={Users}
                    >
                      {classStudents.length ? (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {classStudents.map(
                            (
                              student
                            ) => {
                              const performance =
                                studentPerformance.find(
                                  (
                                    item
                                  ) =>
                                    String(
                                      item.studentId
                                    ) ===
                                      String(
                                        student.id
                                      ) ||
                                    String(
                                      item.admissionNumber
                                    ) ===
                                      String(
                                        student.admissionNumber
                                      )
                                );

                              return (
                                <button
                                  type="button"
                                  key={
                                    student.id ||
                                    student.admissionNumber ||
                                    student.name
                                  }
                                  onClick={() =>
                                    performance
                                      ? openStudentDetails(
                                          performance
                                        )
                                      : null
                                  }
                                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/30"
                                >
                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {
                                        student.name
                                      }
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                      {
                                        student.admissionNumber
                                      }
                                    </p>
                                  </div>

                                  {performance ? (
                                    <div className="text-right">
                                      <p className="font-bold text-slate-900">
                                        {performance.average.toFixed(
                                          1
                                        )}
                                        %
                                      </p>

                                      <p className="text-xs text-slate-400">
                                        {
                                          performance.grade
                                        }
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400">
                                      No results
                                    </span>
                                  )}
                                </button>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <EmptyState
                          icon={Users}
                        />
                      )}
                    </SectionCard>

                    <SectionCard
                      title="Financial Position"
                      icon={Wallet}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <MiniMetric
                          label="Expected"
                          value={formatCurrency(
                            classFees.reduce(
                              (
                                sum,
                                fee
                              ) =>
                                sum +
                                fee.expected,
                              0
                            )
                          )}
                        />

                        <MiniMetric
                          label="Paid"
                          value={formatCurrency(
                            classFees.reduce(
                              (
                                sum,
                                fee
                              ) =>
                                sum +
                                fee.paid,
                              0
                            )
                          )}
                        />

                        <MiniMetric
                          label="Outstanding"
                          value={formatCurrency(
                            classFees.reduce(
                              (
                                sum,
                                fee
                              ) =>
                                sum +
                                fee.outstanding,
                              0
                            )
                          )}
                        />
                      </div>
                    </SectionCard>
                  </>
                );
              })()}
            </div>
          )}
        </Modal>

        {/* ATTENDANCE MODAL */}

        <Modal
          open={
            modal?.type === "attendance"
          }
          title={
            modal?.data?.record
              ?.studentName ||
            "Attendance Details"
          }
          subtitle="Student attendance history"
          onClose={() => setModal(null)}
          size="xl"
          actions={
            <Button
              onClick={() =>
                setModal(null)
              }
            >
              Close
            </Button>
          }
        >
          {modal?.data && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {["Present", "Absent", "Late", "Excused"].map(
                  (status) => (
                    <MiniMetric
                      key={status}
                      label={status}
                      value={
                        modal.data.rows.filter(
                          (row) =>
                            row.status ===
                            status
                        ).length
                      }
                    />
                  )
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full min-w-[600px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-400">
                      <th className="px-3 py-3">
                        Date
                      </th>
                      <th className="px-3 py-3">
                        Class
                      </th>
                      <th className="px-3 py-3">
                        Session
                      </th>
                      <th className="px-3 py-3">
                        Term
                      </th>
                      <th className="px-3 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {modal.data.rows.map(
                      (row, index) => (
                        <tr
                          key={
                            row.id ||
                            `${row.date}-${index}`
                          }
                        >
                          <td className="px-3 py-3 text-sm text-slate-600">
                            {formatDate(
                              row.date
                            )}
                          </td>

                          <td className="px-3 py-3 text-sm text-slate-600">
                            {row.className ||
                              "—"}
                          </td>

                          <td className="px-3 py-3 text-sm text-slate-600">
                            {row.session ||
                              "—"}
                          </td>

                          <td className="px-3 py-3 text-sm text-slate-600">
                            {row.term ||
                              "—"}
                          </td>

                          <td className="px-3 py-3">
                            <Pill
                              tone={
                                row.status ===
                                "Present"
                                  ? "green"
                                  : row.status ===
                                    "Absent"
                                  ? "red"
                                  : "amber"
                              }
                            >
                              {row.status}
                            </Pill>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal>

        {/* FEE MODAL */}

        <Modal
          open={modal?.type === "fee"}
          title={
            modal?.data?.fee
              ?.studentName ||
            "Fee Details"
          }
          subtitle="Student payment history"
          onClose={() => setModal(null)}
          size="xl"
          actions={
            <Button
              onClick={() =>
                setModal(null)
              }
            >
              Close
            </Button>
          }
        >
          {modal?.data && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MiniMetric
                  label="Expected"
                  value={formatCurrency(
                    modal.data.rows.reduce(
                      (sum, fee) =>
                        sum + fee.expected,
                      0
                    )
                  )}
                  icon={CircleDollarSign}
                />

                <MiniMetric
                  label="Paid"
                  value={formatCurrency(
                    modal.data.rows.reduce(
                      (sum, fee) =>
                        sum + fee.paid,
                      0
                    )
                  )}
                  icon={CheckCircle2}
                />

                <MiniMetric
                  label="Outstanding"
                  value={formatCurrency(
                    modal.data.rows.reduce(
                      (sum, fee) =>
                        sum +
                        fee.outstanding,
                      0
                    )
                  )}
                  icon={AlertCircle}
                />
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full min-w-[700px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-400">
                      <th className="px-3 py-3">
                        Category
                      </th>
                      <th className="px-3 py-3">
                        Expected
                      </th>
                      <th className="px-3 py-3">
                        Paid
                      </th>
                      <th className="px-3 py-3">
                        Outstanding
                      </th>
                      <th className="px-3 py-3">
                        Status
                      </th>
                      <th className="px-3 py-3">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {modal.data.rows.map(
                      (row, index) => (
                        <tr
                          key={
                            row.id ||
                            `${row.category}-${index}`
                          }
                        >
                          <td className="px-3 py-3 font-semibold text-slate-800">
                            {row.category ||
                              "School Fees"}
                          </td>

                          <td className="px-3 py-3">
                            {formatCurrency(
                              row.expected
                            )}
                          </td>

                          <td className="px-3 py-3 font-semibold text-emerald-600">
                            {formatCurrency(
                              row.paid
                            )}
                          </td>

                          <td className="px-3 py-3 font-semibold text-red-600">
                            {formatCurrency(
                              row.outstanding
                            )}
                          </td>

                          <td className="px-3 py-3">
                            <Pill
                              tone={
                                row.status ===
                                "Paid"
                                  ? "green"
                                  : row.status ===
                                    "Partial"
                                  ? "amber"
                                  : "red"
                              }
                            >
                              {row.status}
                            </Pill>
                          </td>

                          <td className="px-3 py-3 text-sm text-slate-500">
                            {formatDate(
                              row.date
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal>

        {/* TEACHER MODAL */}

        <Modal
          open={
            modal?.type === "teacher"
          }
          title={
            modal?.data?.teacher?.name ||
            "Teacher Details"
          }
          subtitle="Teacher activity and performance"
          onClose={() => setModal(null)}
          size="xl"
          actions={
            <>
              {modal?.data?.teacher?.id && (
                <Button
                  icon={ExternalLink}
                  onClick={() =>
                    navigate(
                      `/teachers/${modal.data.teacher.id}`
                    )
                  }
                >
                  Open Teacher Profile
                </Button>
              )}

              <Button
                onClick={() =>
                  setModal(null)
                }
              >
                Close
              </Button>
            </>
          }
        >
          {modal?.data && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MiniMetric
                  label="Role"
                  value={
                    modal.data.teacher
                      ?.role || "Teacher"
                  }
                  icon={User}
                />

                <MiniMetric
                  label="Department"
                  value={
                    modal.data.teacher
                      ?.department || "—"
                  }
                  icon={Building2}
                />

                <MiniMetric
                  label="Results"
                  value={
                    modal.data.results
                      ?.length || 0
                  }
                  icon={FileText}
                />

                <MiniMetric
                  label="Average"
                  value={formatPercent(
                    average(
                      modal.data.results?.map(
                        (row) =>
                          row.score
                      ) || []
                    )
                  )}
                  icon={Award}
                />
              </div>

              <SectionCard
                title="Teaching Results"
                icon={BookOpen}
              >
                {modal.data.results?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                          <th className="px-3 py-3">
                            Student
                          </th>
                          <th className="px-3 py-3">
                            Subject
                          </th>
                          <th className="px-3 py-3">
                            Class
                          </th>
                          <th className="px-3 py-3">
                            Score
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {modal.data.results
                          .slice(0, 100)
                          .map(
                            (
                              result,
                              index
                            ) => (
                              <tr
                                key={
                                  result.id ||
                                  index
                                }
                              >
                                <td className="px-3 py-3 font-semibold text-slate-800">
                                  {
                                    result.studentName
                                  }
                                </td>

                                <td className="px-3 py-3 text-sm text-slate-600">
                                  {
                                    result.subject
                                  }
                                </td>

                                <td className="px-3 py-3 text-sm text-slate-600">
                                  {
                                    result.className
                                  }
                                </td>

                                <td className="px-3 py-3 font-bold">
                                  {
                                    result.score
                                  }
                                  %
                                </td>
                              </tr>
                            )
                          )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={BookOpen}
                  />
                )}
              </SectionCard>
            </div>
          )}
        </Modal>

        {/* REPORT HISTORY */}

        <Modal
          open={modal?.type === "history"}
          title="Report History"
          subtitle="Previously generated report snapshots"
          onClose={() => setModal(null)}
          size="xl"
          actions={
            <Button
              onClick={() =>
                setModal(null)
              }
            >
              Close
            </Button>
          }
        >
          {reportHistory.length ? (
            <div className="space-y-3">
              {reportHistory.map(
                (snapshot) => (
                  <div
                    key={snapshot.id}
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/20"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {snapshot.title}
                          </h3>

                          <Pill tone="blue">
                            {snapshot.type}
                          </Pill>
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          Generated{" "}
                          {formatDateTime(
                            snapshot.generatedAt
                          )}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <Pill>
                            {
                              snapshot.filters
                                ?.session
                            }
                          </Pill>

                          <Pill>
                            {
                              snapshot.filters
                                ?.term
                            }
                          </Pill>

                          <Pill>
                            {
                              snapshot.filters
                                ?.className
                            }
                          </Pill>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          icon={Eye}
                          onClick={() =>
                            setModal({
                              type: "history-detail",
                              data: snapshot,
                            })
                          }
                        >
                          View
                        </Button>

                        <Button
                          icon={Download}
                          onClick={() =>
                            exportSnapshot(
                              snapshot
                            )
                          }
                        >
                          Export
                        </Button>

                        <Button
                          icon={Trash2}
                          variant="danger"
                          onClick={() =>
                            deleteHistoryItem(
                              snapshot.id
                            )
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <EmptyState
              icon={History}
              title="No generated reports"
              description="Generate a report and it will be stored here for later review and export."
            />
          )}
        </Modal>

        {/* HISTORY DETAIL */}

        <Modal
          open={
            modal?.type ===
            "history-detail"
          }
          title={
            modal?.data?.title ||
            "Saved Report"
          }
          subtitle={
            modal?.data?.generatedAt
              ? `Generated ${formatDateTime(
                  modal.data
                    .generatedAt
                )}`
              : ""
          }
          onClose={() => setModal(null)}
          size="2xl"
          actions={
            <>
              <Button
                icon={Download}
                onClick={() =>
                  exportSnapshot(
                    modal.data
                  )
                }
              >
                Export CSV
              </Button>

              <Button
                icon={Printer}
                onClick={() =>
                  window.print()
                }
              >
                Print
              </Button>

              <Button
                onClick={() =>
                  setModal(null)
                }
              >
                Close
              </Button>
            </>
          }
        >
          {modal?.data && (
            <div className="space-y-5">
              <SectionCard
                title="Report Filters"
                icon={Filter}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(
                    modal.data.filters ||
                      {}
                  ).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="rounded-xl bg-slate-50 p-3"
                      >
                        <p className="text-xs capitalize text-slate-400">
                          {key}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {value}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </SectionCard>

              <SectionCard
                title="Summary"
                icon={BarChart3}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(
                    modal.data.summary ||
                      {}
                  ).map(
                    ([key, value]) => (
                      <MiniMetric
                        key={key}
                        label={key
                          .replace(
                            /([A-Z])/g,
                            " $1"
                          )
                          .replace(
                            /^./,
                            (letter) =>
                              letter.toUpperCase()
                          )}
                        value={
                          typeof value ===
                          "number"
                            ? formatNumber(
                                value,
                                Number.isInteger(
                                  value
                                )
                                  ? 0
                                  : 1
                              )
                            : value
                        }
                      />
                    )
                  )}
                </div>
              </SectionCard>

              <SectionCard
                title="Saved Data"
                icon={Database}
              >
                {modal.data.rows?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-400">
                          {Object.keys(
                            modal.data
                              .rows[0]
                          ).map(
                            (key) => (
                              <th
                                key={key}
                                className="px-3 py-3"
                              >
                                {key}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {modal.data.rows
                          .slice(0, 100)
                          .map(
                            (
                              row,
                              index
                            ) => (
                              <tr
                                key={
                                  index
                                }
                              >
                                {Object.keys(
                                  modal.data
                                    .rows[0]
                                ).map(
                                  (key) => (
                                    <td
                                      key={
                                        key
                                      }
                                      className="px-3 py-3 text-sm text-slate-600"
                                    >
                                      {typeof row[
                                        key
                                      ] ===
                                      "number"
                                        ? formatNumber(
                                            row[
                                              key
                                            ]
                                          )
                                        : String(
                                            row[
                                              key
                                            ] ??
                                              "—"
                                          )}
                                    </td>
                                  )
                                )}
                              </tr>
                            )
                          )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState />
                )}
              </SectionCard>
            </div>
          )}
        </Modal>

        {/* TOAST */}

        {toast && (
          <div className="reports-no-print fixed bottom-5 right-5 z-[200] max-w-sm animate-[slideIn_0.2s_ease-out]">
            <div
              className={`flex items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-2xl ${
                toast.type === "error"
                  ? "border-red-200"
                  : "border-emerald-200"
              }`}
            >
              {toast.type === "error" ? (
                <XCircle
                  size={19}
                  className="mt-0.5 text-red-600"
                />
              ) : (
                <CheckCircle2
                  size={19}
                  className="mt-0.5 text-emerald-600"
                />
              )}

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {toast.type === "error"
                    ? "Something went wrong"
                    : "Success"}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setToast(null)
                }
                className="ml-2 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}