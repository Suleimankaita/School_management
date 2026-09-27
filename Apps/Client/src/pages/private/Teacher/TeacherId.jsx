import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowLeft,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Contact,
  Download,
  Edit3,
  FileText,
  GraduationCap,
  Heart,
  History,
  IdCard,
  Layers3,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Printer,
  RefreshCcw,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEYS = {
  teachers: "school_teachers",
  students: "school_students",
  results: "school_results",
  attendance: "school_teacher_attendance",
  audit: "school_audit_logs",
};

/* =========================================================
   CONSTANTS
========================================================= */

const ROLE_OPTIONS = [
  "Teacher",
  "Subject Teacher",
  "Form Master",
  "Staff",
  "Head Teacher",
  "Senior Teacher",
  "Coordinator",
];

const STATUS_OPTIONS = [
  "Active",
  "On Leave",
  "Inactive",
  "Archived",
];

const EMPLOYMENT_OPTIONS = [
  "Full Time",
  "Part Time",
  "Contract",
  "Intern",
  "Volunteer",
];

const DEPARTMENTS = [
  "Nursery",
  "Primary",
  "Junior Secondary",
  "Senior Secondary",
  "Science",
  "Arts",
  "Commercial",
  "Languages",
  "Mathematics",
  "ICT",
  "Administration",
  "Student Affairs",
  "Sports",
];

const SUBJECT_OPTIONS = [
  "English Language",
  "Mathematics",
  "Basic Science",
  "Basic Technology",
  "Computer Studies",
  "ICT",
  "Physics",
  "Chemistry",
  "Biology",
  "Agricultural Science",
  "Geography",
  "Government",
  "Economics",
  "Commerce",
  "Accounting",
  "Literature",
  "Civic Education",
  "Social Studies",
  "Islamic Studies",
  "Christian Religious Studies",
  "French",
  "Physical Education",
];

const CLASS_OPTIONS = [
  "Nursery 1",
  "Nursery 2",
  "Nursery 3",
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1A",
  "JSS 1B",
  "JSS 2A",
  "JSS 2B",
  "JSS 3A",
  "JSS 3B",
  "SS 1A",
  "SS 1B",
  "SS 2A",
  "SS 2B",
  "SS 3A",
  "SS 3B",
];

const ATTENDANCE_STATUSES = [
  "Present",
  "Late",
  "Absent",
  "Leave",
];

const TABS = [
  { id: "overview", label: "Overview", icon: UserRound },
  { id: "academic", label: "Academic", icon: GraduationCap },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "performance", label: "Performance", icon: BarChart3 },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "documents", label: "Documents", icon: FileText },
];

/* =========================================================
   HELPERS
========================================================= */

const uid = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const readJSON = (key, fallback) => {
  try {
    if (typeof window === "undefined") return fallback;

    const value = window.localStorage.getItem(key);

    if (!value) return fallback;

    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Ignore storage errors.
  }
};

const todayISO = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const initials = (name = "") => {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "T";

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const normalizeArray = (value) => {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.filter(Boolean))];
};

const inferRole = (teacher = {}) => {
  const roleText = `${teacher.role || ""} ${teacher.position || ""}`.toLowerCase();

  if (roleText.includes("form")) return "Form Master";
  if (roleText.includes("subject")) return "Subject Teacher";
  if (roleText.includes("head")) return "Head Teacher";
  if (roleText.includes("senior")) return "Senior Teacher";
  if (roleText.includes("coordinator")) return "Coordinator";
  if (roleText.includes("staff")) return "Staff";

  return "Teacher";
};

const roleDescription = (role) => {
  const descriptions = {
    Teacher:
      "Responsible for classroom teaching, lesson delivery, student support and assessment.",
    "Subject Teacher":
      "Specializes in assigned subjects and manages teaching, assessments and student performance for those subjects.",
    "Form Master":
      "Responsible for the daily management, welfare, attendance and academic coordination of an assigned class.",
    Staff:
      "Supports the school through administrative, operational, student-support or departmental responsibilities.",
    "Head Teacher":
      "Provides academic and operational leadership within the assigned school section.",
    "Senior Teacher":
      "Supports teaching quality, mentoring and academic coordination across assigned classes or subjects.",
    Coordinator:
      "Coordinates academic, departmental, extracurricular or operational activities.",
  };

  return descriptions[role] || descriptions.Teacher;
};

const normalizeTeacher = (teacher = {}) => {
  const firstName = teacher.firstName || "";
  const middleName = teacher.middleName || "";
  const lastName = teacher.lastName || "";

  const generatedName = [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ");

  return {
    ...teacher,

    id: teacher.id || uid(),

    staffId:
      teacher.staffId ||
      `STF-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 9000 + 1000
      )}`,

    fullName:
      teacher.fullName ||
      generatedName ||
      teacher.name ||
      "Unnamed Teacher",

    firstName,
    middleName,
    lastName,

    gender: teacher.gender || "",

    dateOfBirth: teacher.dateOfBirth || "",

    email: teacher.email || "",

    phone: teacher.phone || "",

    address: teacher.address || "",

    photo: teacher.photo || "",

    department: teacher.department || "General",

    position:
      teacher.position ||
      teacher.role ||
      "Teacher",

    role: teacher.role || inferRole(teacher),

    employmentType:
      teacher.employmentType ||
      teacher.employment ||
      "Full Time",

    qualification:
      teacher.qualification ||
      teacher.education ||
      "",

    specialization:
      teacher.specialization ||
      teacher.speciality ||
      "",

    yearsExperience:
      teacher.yearsExperience ||
      teacher.experience ||
      0,

    dateJoined:
      teacher.dateJoined ||
      teacher.joiningDate ||
      "",

    status: teacher.status || "Active",

    subjects: normalizeArray(teacher.subjects),

    classes: normalizeArray(teacher.classes),

    classTeacherOf:
      teacher.classTeacherOf ||
      teacher.formClass ||
      "",

    emergencyContact: {
      name: teacher.emergencyContact?.name || "",
      relationship:
        teacher.emergencyContact?.relationship || "",
      phone: teacher.emergencyContact?.phone || "",
      alternativePhone:
        teacher.emergencyContact?.alternativePhone || "",
      address: teacher.emergencyContact?.address || "",
    },

    attendance: {
      present: safeNumber(teacher.attendance?.present),
      absent: safeNumber(teacher.attendance?.absent),
      late: safeNumber(teacher.attendance?.late),
      leave: safeNumber(teacher.attendance?.leave),
      total: safeNumber(teacher.attendance?.total),
      percentage: safeNumber(teacher.attendance?.percentage),
    },

    performance: {
      average: safeNumber(teacher.performance?.average),
      resultsSubmitted: safeNumber(
        teacher.performance?.resultsSubmitted
      ),
      assignmentsCreated: safeNumber(
        teacher.performance?.assignmentsCreated
      ),
      classesManaged: safeNumber(
        teacher.performance?.classesManaged
      ),
    },

    activity: Array.isArray(teacher.activity)
      ? teacher.activity
      : [],

    documents: Array.isArray(teacher.documents)
      ? teacher.documents
      : [],

    notes: teacher.notes || "",

    createdAt: teacher.createdAt || new Date().toISOString(),

    updatedAt: teacher.updatedAt || new Date().toISOString(),
  };
};

const createActivity = ({
  type = "system",
  title,
  description = "",
}) => ({
  id: uid(),
  type,
  title,
  description,
  createdAt: new Date().toISOString(),
});

const csvEscape = (value) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

const downloadCSV = (filename, rows) => {
  const csv = rows
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
};

/* =========================================================
   SEED DATA
========================================================= */

const SEED_TEACHERS = [
  {
    id: "teacher-001",
    staffId: "STF-2026-1001",
    fullName: "Amina Yusuf",
    firstName: "Amina",
    lastName: "Yusuf",
    gender: "Female",
    email: "amina.yusuf@school.edu",
    phone: "08031234567",
    address: "Katsina, Nigeria",
    department: "Languages",
    position: "English Teacher",
    role: "Subject Teacher",
    employmentType: "Full Time",
    qualification: "B.Ed English",
    specialization: "English Language",
    yearsExperience: 6,
    dateJoined: "2022-09-05",
    status: "Active",
    subjects: ["English Language", "Literature"],
    classes: ["JSS 1A", "JSS 2A", "SS 1A"],
    classTeacherOf: "",
    emergencyContact: {
      name: "Yusuf Abdullahi",
      relationship: "Brother",
      phone: "08030000001",
      alternativePhone: "",
      address: "Katsina",
    },
    notes:
      "Experienced English teacher responsible for junior and senior secondary English classes.",
    documents: [],
    activity: [
      createActivity({
        type: "academic",
        title: "English results submitted",
        description: "Submitted the latest English assessment results.",
      }),
    ],
  },

  {
    id: "teacher-002",
    staffId: "STF-2026-1002",
    fullName: "Musa Ibrahim",
    firstName: "Musa",
    lastName: "Ibrahim",
    gender: "Male",
    email: "musa.ibrahim@school.edu",
    phone: "08032345678",
    address: "Katsina, Nigeria",
    department: "Mathematics",
    position: "Mathematics Teacher",
    role: "Form Master",
    employmentType: "Full Time",
    qualification: "B.Sc Mathematics",
    specialization: "Mathematics",
    yearsExperience: 8,
    dateJoined: "2020-01-13",
    status: "Active",
    subjects: ["Mathematics", "Basic Technology"],
    classes: ["JSS 1B", "JSS 2B"],
    classTeacherOf: "JSS 1B",
    emergencyContact: {
      name: "Maryam Ibrahim",
      relationship: "Wife",
      phone: "08031111111",
      alternativePhone: "",
      address: "Katsina",
    },
    notes:
      "Form Master for JSS 1B with Mathematics teaching responsibility.",
    documents: [],
    activity: [],
  },

  {
    id: "teacher-003",
    staffId: "STF-2026-1003",
    fullName: "Fatima Sani",
    firstName: "Fatima",
    lastName: "Sani",
    gender: "Female",
    email: "fatima.sani@school.edu",
    phone: "08033456789",
    address: "Katsina, Nigeria",
    department: "Science",
    position: "Science Teacher",
    role: "Teacher",
    employmentType: "Full Time",
    qualification: "B.Sc Biology",
    specialization: "Biology",
    yearsExperience: 5,
    dateJoined: "2023-01-09",
    status: "Active",
    subjects: ["Biology", "Basic Science"],
    classes: ["JSS 2A", "SS 1B", "SS 2A"],
    classTeacherOf: "",
    emergencyContact: {
      name: "Sani Musa",
      relationship: "Brother",
      phone: "08032222222",
      alternativePhone: "",
      address: "Katsina",
    },
    notes: "",
    documents: [],
    activity: [],
  },

  {
    id: "teacher-004",
    staffId: "STF-2026-1004",
    fullName: "Sadiq Umar",
    firstName: "Sadiq",
    lastName: "Umar",
    gender: "Male",
    email: "sadiq.umar@school.edu",
    phone: "08034567890",
    address: "Katsina, Nigeria",
    department: "Administration",
    position: "Administrative Staff",
    role: "Staff",
    employmentType: "Full Time",
    qualification: "NCE",
    specialization: "School Administration",
    yearsExperience: 4,
    dateJoined: "2024-02-12",
    status: "Active",
    subjects: [],
    classes: [],
    classTeacherOf: "",
    emergencyContact: {
      name: "Umar Bello",
      relationship: "Father",
      phone: "08033333333",
      alternativePhone: "",
      address: "Katsina",
    },
    notes:
      "Supports daily administrative operations and student records.",
    documents: [],
    activity: [],
  },
];

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const Avatar = ({
  name,
  photo,
  size = "lg",
  className = "",
}) => {
  const [failed, setFailed] = useState(false);

  const sizeClasses = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-24 w-24 text-2xl",
    xl: "h-32 w-32 text-3xl",
  };

  return (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-800 to-cyan-500 font-bold text-white shadow-xl",
        sizeClasses[size] || sizeClasses.lg,
        className,
      ].join(" ")}
    >
      {photo && !failed ? (
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials(name)
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Active:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    "On Leave":
      "bg-amber-50 text-amber-700 border-amber-200",
    Inactive:
      "bg-slate-100 text-slate-600 border-slate-200",
    Archived:
      "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || styles.Inactive
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};

const RoleBadge = ({ role }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
    <ShieldCheck size={13} />
    {role}
  </span>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
  progress,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg ${
      onClick ? "cursor-pointer" : "cursor-default"
    }`}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-2 text-2xl font-bold text-slate-900">
          {value}
        </p>

        {description && (
          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>

      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
        <Icon size={19} />
      </div>
    </div>

    {typeof progress === "number" && (
      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all"
            style={{
              width: `${Math.max(0, Math.min(100, progress))}%`,
            }}
          />
        </div>
      </div>
    )}
  </button>
);

const SectionHeader = ({
  icon: Icon,
  title,
  description,
  action,
}) => (
  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
        <Icon size={19} />
      </div>

      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>

        {description && (
          <p className="mt-0.5 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>

    {action}
  </div>
);

const EmptyState = ({
  icon: Icon = FileText,
  title,
  description,
}) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-10 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
      <Icon size={22} />
    </div>

    <h3 className="font-semibold text-slate-800">
      {title}
    </h3>

    <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
      {description}
    </p>
  </div>
);

const Modal = ({
  open,
  title,
  description,
  children,
  onClose,
  width = "max-w-3xl",
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div
        className={`flex max-h-[92vh] w-full ${width} flex-col overflow-hidden rounded-3xl bg-white shadow-2xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [attendanceStore, setAttendanceStore] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("overview");

  const [showEdit, setShowEdit] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showDocumentModal, setShowDocumentModal] =
    useState(false);

  const [editForm, setEditForm] = useState(null);

  const [attendanceForm, setAttendanceForm] = useState({
    date: todayISO(),
    status: "Present",
    note: "",
  });

  const [documentForm, setDocumentForm] = useState({
    name: "",
    type: "Certificate",
    url: "",
  });

  const [toast, setToast] = useState(null);

  const photoInputRef = useRef(null);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    setLoading(true);

    let storedTeachers = readJSON(
      STORAGE_KEYS.teachers,
      null
    );

    if (!Array.isArray(storedTeachers) || !storedTeachers.length) {
      storedTeachers = SEED_TEACHERS;

      writeJSON(
        STORAGE_KEYS.teachers,
        storedTeachers
      );
    }

    const normalizedTeachers =
      storedTeachers.map(normalizeTeacher);

    setTeachers(normalizedTeachers);

    setStudents(
      readJSON(STORAGE_KEYS.students, [])
    );

    setResults(
      readJSON(STORAGE_KEYS.results, [])
    );

    setAttendanceStore(
      readJSON(STORAGE_KEYS.attendance, {})
    );

    setAuditLogs(
      readJSON(STORAGE_KEYS.audit, [])
    );

    setLoading(false);
  }, []);

  /* =======================================================
     TEACHER
  ======================================================= */

  const teacher = useMemo(() => {
    return teachers.find(
      (item) => String(item.id) === String(id)
    );
  }, [teachers, id]);

  /* =======================================================
     DERIVED RESULTS
  ======================================================= */

  const teacherResults = useMemo(() => {
    if (!teacher) return [];

    return results
      .filter((result) => {
        const resultTeacherId =
          result.teacherId ??
          result.teacher?.id ??
          result.staffId;

        const resultTeacherName =
          result.teacherName ??
          result.teacher?.name ??
          result.teacher?.fullName;

        return (
          String(resultTeacherId || "") ===
            String(teacher.id) ||
          String(resultTeacherId || "") ===
            String(teacher.staffId) ||
          String(resultTeacherName || "").toLowerCase() ===
            String(teacher.fullName || "").toLowerCase()
        );
      })
      .sort(
        (a, b) =>
          new Date(
            b.updatedAt ||
              b.createdAt ||
              b.submittedAt ||
              0
          ) -
          new Date(
            a.updatedAt ||
              a.createdAt ||
              a.submittedAt ||
              0
          )
      );
  }, [results, teacher]);

  const resultAverage = useMemo(() => {
    if (!teacherResults.length) {
      return safeNumber(teacher?.performance?.average);
    }

    const scores = teacherResults
      .map((result) =>
        safeNumber(
          result.total ??
            result.score ??
            result.average ??
            result.percentage
        )
      )
      .filter((value) => value > 0);

    if (!scores.length) return 0;

    return (
      scores.reduce((sum, value) => sum + value, 0) /
      scores.length
    );
  }, [teacherResults, teacher]);

  /* =======================================================
     ATTENDANCE
  ======================================================= */

  const teacherAttendanceRecords = useMemo(() => {
    if (!teacher) return [];

    const records = [];

    if (Array.isArray(attendanceStore)) {
      attendanceStore.forEach((item) => {
        const itemTeacherId =
          item.teacherId ??
          item.staffId;

        if (
          String(itemTeacherId || "") ===
            String(teacher.id) ||
          String(itemTeacherId || "") ===
            String(teacher.staffId)
        ) {
          records.push({
            ...item,
            date: item.date || item.createdAt,
          });
        }
      });
    } else if (
      attendanceStore &&
      typeof attendanceStore === "object"
    ) {
      Object.entries(attendanceStore).forEach(
        ([dateKey, day]) => {
          if (!day) return;

          if (day.records) {
            const record =
              day.records[teacher.id] ||
              day.records[String(teacher.id)] ||
              day.records[teacher.staffId];

            if (record) {
              records.push({
                ...record,
                date: record.date || day.date || dateKey,
              });
            }
          } else {
            const itemTeacherId =
              day.teacherId ??
              day.staffId;

            if (
              String(itemTeacherId || "") ===
                String(teacher.id) ||
              String(itemTeacherId || "") ===
                String(teacher.staffId)
            ) {
              records.push({
                ...day,
                date: day.date || dateKey,
              });
            }
          }
        }
      );
    }

    return records.sort(
      (a, b) =>
        new Date(b.date || 0) -
        new Date(a.date || 0)
    );
  }, [attendanceStore, teacher]);

  const attendanceSummary = useMemo(() => {
    if (!teacher) {
      return {
        present: 0,
        late: 0,
        absent: 0,
        leave: 0,
        total: 0,
        percentage: 0,
      };
    }

    if (teacherAttendanceRecords.length) {
      const summary = {
        present: 0,
        late: 0,
        absent: 0,
        leave: 0,
        total: teacherAttendanceRecords.length,
        percentage: 0,
      };

      teacherAttendanceRecords.forEach((record) => {
        const status = String(
          record.status || ""
        ).toLowerCase();

        if (status === "present") summary.present++;
        else if (status === "late") summary.late++;
        else if (status === "absent") summary.absent++;
        else if (status === "leave") summary.leave++;
      });

      summary.percentage =
        summary.total > 0
          ? ((summary.present + summary.late) /
              summary.total) *
            100
          : 0;

      return summary;
    }

    return {
      ...teacher.attendance,
      percentage:
        teacher.attendance.percentage ||
        (teacher.attendance.total
          ? ((teacher.attendance.present +
              teacher.attendance.late) /
              teacher.attendance.total) *
            100
          : 0),
    };
  }, [teacher, teacherAttendanceRecords]);

  /* =======================================================
     STUDENTS
  ======================================================= */

  const assignedClassNames = useMemo(() => {
    if (!teacher) return [];

    return normalizeArray([
      ...(teacher.classes || []),
      teacher.classTeacherOf,
    ]);
  }, [teacher]);

  const assignedStudents = useMemo(() => {
    if (!teacher) return [];

    if (!students.length) return [];

    return students.filter((student) => {
      const studentClass =
        student.className ||
        student.class ||
        student.currentClass ||
        student.formClass ||
        student.classLevel;

      return assignedClassNames.includes(
        studentClass
      );
    });
  }, [students, assignedClassNames, teacher]);

  /* =======================================================
     SUBJECT PERFORMANCE
  ======================================================= */

  const subjectPerformance = useMemo(() => {
    const grouped = {};

    teacherResults.forEach((result) => {
      const subject =
        result.subject ||
        result.subjectName ||
        result.course ||
        "General";

      const score = safeNumber(
        result.total ??
          result.score ??
          result.average ??
          result.percentage
      );

      if (!grouped[subject]) {
        grouped[subject] = {
          subject,
          scores: [],
          average: 0,
        };
      }

      if (score > 0) {
        grouped[subject].scores.push(score);
      }
    });

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        average: item.scores.length
          ? item.scores.reduce(
              (sum, value) => sum + value,
              0
            ) / item.scores.length
          : 0,
      }))
      .sort((a, b) => b.average - a.average);
  }, [teacherResults]);

  /* =======================================================
     ACTIVITY
  ======================================================= */

  const activityFeed = useMemo(() => {
    if (!teacher) return [];

    const activities = [];

    (teacher.activity || []).forEach((item) => {
      activities.push({
        ...item,
        source: "profile",
      });
    });

    teacherResults.slice(0, 10).forEach((result) => {
      activities.push({
        id: `result-${result.id || uid()}`,
        type: "academic",
        title: "Result activity",
        description:
          result.subject ||
          result.subjectName ||
          "Student result updated",
        createdAt:
          result.updatedAt ||
          result.createdAt ||
          result.submittedAt,
        source: "result",
      });
    });

    teacherAttendanceRecords
      .slice(0, 10)
      .forEach((record, index) => {
        activities.push({
          id: `attendance-${index}-${record.date}`,
          type: "attendance",
          title: `Attendance marked: ${
            record.status || "Unknown"
          }`,
          description:
            record.note ||
            "Teacher attendance record",
          createdAt: record.date,
          source: "attendance",
        });
      });

    auditLogs
      .filter((log) => {
        const target =
          log.teacherId ??
          log.entityId ??
          log.targetId ??
          log.userId;

        return (
          String(target || "") ===
            String(teacher.id) ||
          String(target || "") ===
            String(teacher.staffId)
        );
      })
      .slice(0, 15)
      .forEach((log) => {
        activities.push({
          id: log.id || uid(),
          type: "system",
          title:
            log.action ||
            log.title ||
            "System activity",
          description:
            log.description ||
            log.details ||
            "",
          createdAt:
            log.createdAt ||
            log.timestamp,
          source: "audit",
        });
      });

    return activities
      .filter((item) => item.createdAt)
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 30);
  }, [
    teacher,
    teacherResults,
    teacherAttendanceRecords,
    auditLogs,
  ]);

  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      id: uid(),
      message,
      type,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  /* =======================================================
     AUDIT
  ======================================================= */

  const addAuditLog = ({
    action,
    description,
  }) => {
    if (!teacher) return;

    const logs = Array.isArray(auditLogs)
      ? auditLogs
      : [];

    const newLog = {
      id: uid(),
      teacherId: teacher.id,
      staffId: teacher.staffId,
      entity: "teacher",
      action,
      description,
      createdAt: new Date().toISOString(),
    };

    const next = [newLog, ...logs].slice(
      0,
      500
    );

    setAuditLogs(next);

    writeJSON(
      STORAGE_KEYS.audit,
      next
    );
  };

  /* =======================================================
     EDIT FORM
  ======================================================= */

  const buildEditForm = (item) => {
    return {
      firstName: item.firstName || "",
      middleName: item.middleName || "",
      lastName: item.lastName || "",
      fullName: item.fullName || "",
      gender: item.gender || "",
      dateOfBirth: item.dateOfBirth || "",
      email: item.email || "",
      phone: item.phone || "",
      address: item.address || "",

      photo: item.photo || "",

      staffId: item.staffId || "",

      role: item.role || "Teacher",

      position: item.position || "",

      department:
        item.department || "General",

      employmentType:
        item.employmentType || "Full Time",

      qualification:
        item.qualification || "",

      specialization:
        item.specialization || "",

      yearsExperience:
        item.yearsExperience || 0,

      dateJoined:
        item.dateJoined || "",

      status:
        item.status || "Active",

      subjects: normalizeArray(
        item.subjects
      ),

      classes: normalizeArray(
        item.classes
      ),

      classTeacherOf:
        item.classTeacherOf || "",

      emergencyName:
        item.emergencyContact?.name || "",

      emergencyRelationship:
        item.emergencyContact?.relationship ||
        "",

      emergencyPhone:
        item.emergencyContact?.phone || "",

      emergencyAlternativePhone:
        item.emergencyContact?.alternativePhone ||
        "",

      emergencyAddress:
        item.emergencyContact?.address || "",

      notes: item.notes || "",
    };
  };

  const openEdit = () => {
    if (!teacher) return;

    setEditForm(buildEditForm(teacher));

    setShowEdit(true);
  };

  /* =======================================================
     EDIT FORM CHANGES
  ======================================================= */

  const updateEditField = (field, value) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleEditArrayValue = (
    field,
    value
  ) => {
    setEditForm((previous) => {
      const current = previous[field] || [];

      return {
        ...previous,
        [field]: current.includes(value)
          ? current.filter(
              (item) => item !== value
            )
          : [...current, value],
      };
    });
  };

  /* =======================================================
     PHOTO UPLOAD
  ======================================================= */

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(
        "Please select a valid image file.",
        "error"
      );

      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast(
        "Photo must be smaller than 3MB.",
        "error"
      );

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateEditField(
        "photo",
        reader.result
      );
    };

    reader.readAsDataURL(file);
  };

  /* =======================================================
     SAVE TEACHER
  ======================================================= */

  const saveTeacher = () => {
    if (!teacher || !editForm) return;

    const fullName =
      editForm.fullName ||
      [
        editForm.firstName,
        editForm.middleName,
        editForm.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

    if (!fullName) {
      showToast(
        "Teacher name is required.",
        "error"
      );

      return;
    }

    if (
      editForm.role === "Form Master" &&
      !editForm.classTeacherOf
    ) {
      showToast(
        "Select the class this Form Master manages.",
        "error"
      );

      return;
    }

    let nextTeachers = [...teachers];

    const existingFormMaster =
      editForm.role === "Form Master" &&
      editForm.classTeacherOf
        ? teachers.find(
            (item) =>
              String(item.id) !==
                String(teacher.id) &&
              item.classTeacherOf ===
                editForm.classTeacherOf &&
              item.status !== "Archived"
          )
        : null;

    if (existingFormMaster) {
      const confirmed = window.confirm(
        `${existingFormMaster.fullName} is already assigned as Form Master of ${editForm.classTeacherOf}.\n\nDo you want to move that responsibility to this teacher?`
      );

      if (!confirmed) return;

      nextTeachers = nextTeachers.map(
        (item) => {
          if (
            String(item.id) ===
            String(existingFormMaster.id)
          ) {
            return {
              ...item,
              classTeacherOf: "",
              updatedAt:
                new Date().toISOString(),
              activity: [
                createActivity({
                  type: "role",
                  title:
                    "Form Master responsibility reassigned",
                  description: `${editForm.classTeacherOf} was reassigned to another teacher.`,
                }),
                ...(item.activity || []),
              ].slice(0, 50),
            };
          }

          return item;
        }
      );
    }

    const oldRole = teacher.role;
    const oldStatus = teacher.status;
    const oldClass = teacher.classTeacherOf;

    const updatedTeacher = normalizeTeacher({
      ...teacher,

      ...teacher,

      id: teacher.id,

      staffId:
        editForm.staffId ||
        teacher.staffId,

      fullName,

      firstName:
        editForm.firstName,

      middleName:
        editForm.middleName,

      lastName:
        editForm.lastName,

      gender:
        editForm.gender,

      dateOfBirth:
        editForm.dateOfBirth,

      email:
        editForm.email,

      phone:
        editForm.phone,

      address:
        editForm.address,

      photo:
        editForm.photo,

      role:
        editForm.role,

      position:
        editForm.position,

      department:
        editForm.department,

      employmentType:
        editForm.employmentType,

      qualification:
        editForm.qualification,

      specialization:
        editForm.specialization,

      yearsExperience:
        safeNumber(
          editForm.yearsExperience
        ),

      dateJoined:
        editForm.dateJoined,

      status:
        editForm.status,

      subjects:
        normalizeArray(
          editForm.subjects
        ),

      classes:
        normalizeArray(
          editForm.classes
        ),

      classTeacherOf:
        editForm.classTeacherOf,

      emergencyContact: {
        name:
          editForm.emergencyName,

        relationship:
          editForm.emergencyRelationship,

        phone:
          editForm.emergencyPhone,

        alternativePhone:
          editForm.emergencyAlternativePhone,

        address:
          editForm.emergencyAddress,
      },

      notes:
        editForm.notes,

      updatedAt:
        new Date().toISOString(),

      activity: [
        createActivity({
          type: "profile",
          title:
            "Teacher profile updated",
          description:
            "Personal, professional or assignment information was updated.",
        }),
        ...(oldRole !== editForm.role
          ? [
              createActivity({
                type: "role",
                title:
                  "Teacher role changed",
                description: `${oldRole} → ${editForm.role}`,
              }),
            ]
          : []),
        ...(oldStatus !== editForm.status
          ? [
              createActivity({
                type: "status",
                title:
                  "Employment status changed",
                description: `${oldStatus} → ${editForm.status}`,
              }),
            ]
          : []),
        ...(oldClass !==
        editForm.classTeacherOf
          ? [
              createActivity({
                type: "academic",
                title:
                  "Class responsibility changed",
                description:
                  editForm.classTeacherOf
                    ? `Now responsible for ${editForm.classTeacherOf}.`
                    : "Form Master responsibility removed.",
              }),
            ]
          : []),
        ...(teacher.activity || []),
      ].slice(0, 100),
    });

    nextTeachers = nextTeachers.map(
      (item) =>
        String(item.id) ===
        String(teacher.id)
          ? updatedTeacher
          : item
    );

    setTeachers(nextTeachers);

    writeJSON(
      STORAGE_KEYS.teachers,
      nextTeachers
    );

    setShowEdit(false);

    addAuditLog({
      action: "Teacher profile updated",
      description: `Updated profile information for ${updatedTeacher.fullName}.`,
    });

    showToast(
      "Teacher profile updated successfully."
    );
  };

  /* =======================================================
     ATTENDANCE
  ======================================================= */

  const openAttendance = (
    status = "Present"
  ) => {
    const existing =
      teacherAttendanceRecords.find(
        (record) =>
          record.date === todayISO()
      );

    setAttendanceForm({
      date: todayISO(),
      status:
        existing?.status || status,
      note:
        existing?.note || "",
    });

    setShowAttendance(true);
  };

  const saveAttendance = () => {
    if (!teacher) return;

    const {
      date,
      status,
      note,
    } = attendanceForm;

    if (!date || !status) {
      showToast(
        "Attendance date and status are required.",
        "error"
      );

      return;
    }

    let nextStore = Array.isArray(
      attendanceStore
    )
      ? [...attendanceStore]
      : {
          ...(attendanceStore || {}),
        };

    if (Array.isArray(nextStore)) {
      const existingIndex =
        nextStore.findIndex(
          (item) =>
            String(
              item.teacherId ||
                item.staffId
            ) === String(teacher.id) &&
            item.date === date
        );

      const record = {
        id:
          existingIndex >= 0
            ? nextStore[existingIndex].id
            : uid(),

        teacherId: teacher.id,

        staffId: teacher.staffId,

        teacherName: teacher.fullName,

        date,

        status,

        note,

        updatedAt:
          new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        nextStore[existingIndex] =
          record;
      } else {
        nextStore.unshift(record);
      }
    } else {
      const day =
        nextStore[date] || {
          date,
          records: {},
        };

      nextStore[date] = {
        ...day,
        date,
        records: {
          ...(day.records || {}),
          [teacher.id]: {
            id:
              day.records?.[teacher.id]
                ?.id || uid(),
            teacherId: teacher.id,
            staffId: teacher.staffId,
            teacherName:
              teacher.fullName,
            date,
            status,
            note,
            updatedAt:
              new Date().toISOString(),
          },
        },
      };
    }

    setAttendanceStore(nextStore);

    writeJSON(
      STORAGE_KEYS.attendance,
      nextStore
    );

    setShowAttendance(false);

    addAuditLog({
      action: "Teacher attendance recorded",
      description: `${teacher.fullName} was marked ${status} for ${formatDate(
        date
      )}.`,
    });

    showToast(
      `Attendance marked ${status}.`
    );
  };

  /* =======================================================
     DOCUMENTS
  ======================================================= */

  const addDocument = () => {
    if (!teacher) return;

    if (!documentForm.name.trim()) {
      showToast(
        "Document name is required.",
        "error"
      );

      return;
    }

    const document = {
      id: uid(),
      name: documentForm.name.trim(),
      type: documentForm.type,
      url: documentForm.url.trim(),
      createdAt:
        new Date().toISOString(),
    };

    const nextTeachers =
      teachers.map((item) =>
        String(item.id) ===
        String(teacher.id)
          ? {
              ...item,
              documents: [
                document,
                ...(item.documents || []),
              ],
              updatedAt:
                new Date().toISOString(),
              activity: [
                createActivity({
                  type: "document",
                  title:
                    "Document added",
                  description:
                    document.name,
                }),
                ...(item.activity || []),
              ].slice(0, 100),
            }
          : item
      );

    setTeachers(nextTeachers);

    writeJSON(
      STORAGE_KEYS.teachers,
      nextTeachers
    );

    setDocumentForm({
      name: "",
      type: "Certificate",
      url: "",
    });

    setShowDocumentModal(false);

    addAuditLog({
      action: "Teacher document added",
      description: document.name,
    });

    showToast(
      "Document added successfully."
    );
  };

  const deleteDocument = (documentId) => {
    if (!teacher) return;

    const confirmed = window.confirm(
      "Delete this document?"
    );

    if (!confirmed) return;

    const nextTeachers =
      teachers.map((item) =>
        String(item.id) ===
        String(teacher.id)
          ? {
              ...item,
              documents: (
                item.documents || []
              ).filter(
                (document) =>
                  String(document.id) !==
                  String(documentId)
              ),
              updatedAt:
                new Date().toISOString(),
            }
          : item
      );

    setTeachers(nextTeachers);

    writeJSON(
      STORAGE_KEYS.teachers,
      nextTeachers
    );

    showToast(
      "Document removed."
    );
  };

  /* =======================================================
     ARCHIVE / RESTORE
  ======================================================= */

  const archiveTeacher = () => {
    if (!teacher) return;

    const confirmed = window.confirm(
      `Archive ${teacher.fullName}?\n\nThe teacher will remain in the system but will no longer be treated as an active staff member.`
    );

    if (!confirmed) return;

    const nextTeachers =
      teachers.map((item) =>
        String(item.id) ===
        String(teacher.id)
          ? {
              ...item,
              status: "Archived",
              updatedAt:
                new Date().toISOString(),
              activity: [
                createActivity({
                  type: "status",
                  title:
                    "Teacher archived",
                  description:
                    "Teacher profile was archived.",
                }),
                ...(item.activity || []),
              ].slice(0, 100),
            }
          : item
      );

    setTeachers(nextTeachers);

    writeJSON(
      STORAGE_KEYS.teachers,
      nextTeachers
    );

    addAuditLog({
      action: "Teacher archived",
      description: `${teacher.fullName} was archived.`,
    });

    showToast(
      "Teacher archived successfully."
    );
  };

  const restoreTeacher = () => {
    if (!teacher) return;

    const nextTeachers =
      teachers.map((item) =>
        String(item.id) ===
        String(teacher.id)
          ? {
              ...item,
              status: "Active",
              updatedAt:
                new Date().toISOString(),
              activity: [
                createActivity({
                  type: "status",
                  title:
                    "Teacher restored",
                  description:
                    "Teacher profile was restored to active status.",
                }),
                ...(item.activity || []),
              ].slice(0, 100),
            }
          : item
      );

    setTeachers(nextTeachers);

    writeJSON(
      STORAGE_KEYS.teachers,
      nextTeachers
    );

    addAuditLog({
      action: "Teacher restored",
      description: `${teacher.fullName} was restored.`,
    });

    showToast(
      "Teacher restored successfully."
    );
  };

  /* =======================================================
     EXPORT
  ======================================================= */

  const exportTeacher = () => {
    if (!teacher) return;

    const rows = [
      ["Teacher Profile"],
      [],
      ["Field", "Value"],
      ["Full Name", teacher.fullName],
      ["Staff ID", teacher.staffId],
      ["Role", teacher.role],
      ["Position", teacher.position],
      ["Department", teacher.department],
      [
        "Employment Type",
        teacher.employmentType,
      ],
      ["Status", teacher.status],
      ["Gender", teacher.gender],
      ["Date of Birth", teacher.dateOfBirth],
      ["Email", teacher.email],
      ["Phone", teacher.phone],
      ["Address", teacher.address],
      ["Qualification", teacher.qualification],
      [
        "Specialization",
        teacher.specialization,
      ],
      [
        "Years Experience",
        teacher.yearsExperience,
      ],
      ["Date Joined", teacher.dateJoined],
      [
        "Subjects",
        teacher.subjects.join("; "),
      ],
      [
        "Classes",
        teacher.classes.join("; "),
      ],
      [
        "Form Class",
        teacher.classTeacherOf,
      ],
      [
        "Students",
        assignedStudents.length,
      ],
      [
        "Attendance",
        `${attendanceSummary.percentage.toFixed(
          1
        )}%`,
      ],
      [
        "Results Submitted",
        teacherResults.length ||
          teacher.performance.resultsSubmitted,
      ],
      [
        "Performance Average",
        resultAverage.toFixed(1),
      ],
      [],
      ["Emergency Contact"],
      [
        "Name",
        teacher.emergencyContact.name,
      ],
      [
        "Relationship",
        teacher.emergencyContact.relationship,
      ],
      [
        "Phone",
        teacher.emergencyContact.phone,
      ],
      [
        "Alternative Phone",
        teacher.emergencyContact
          .alternativePhone,
      ],
      [
        "Address",
        teacher.emergencyContact.address,
      ],
    ];

    downloadCSV(
      `${teacher.fullName
        .replace(/\s+/g, "-")
        .toLowerCase()}-profile.csv`,
      rows
    );

    showToast(
      "Teacher profile exported."
    );
  };

  /* =======================================================
     PRINT
  ======================================================= */

  const printProfile = () => {
    window.print();
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading teacher profile...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!teacher) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle size={30} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Teacher not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The teacher profile you are looking for
              does not exist or may have been removed.
            </p>

            <button
              type="button"
              onClick={() => navigate("/teachers")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <ArrowLeft size={17} />
              Back to Teachers
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  const studentCount =
    assignedStudents.length ||
    teacher.performance?.students ||
    0;

  const classCount =
    assignedClassNames.length;

  const subjectCount =
    teacher.subjects.length;

  const resultsCount =
    teacherResults.length ||
    teacher.performance.resultsSubmitted ||
    0;

  return (
    <>
      <style>
        {`
          @keyframes profileFadeUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .profile-fade-up {
            animation: profileFadeUp .45s ease-out both;
          }

          @media print {
            body {
              background: white !important;
            }

            .print-hidden {
              display: none !important;
            }

            .teacher-profile-print {
              display: block !important;
              width: 100% !important;
              max-width: none !important;
            }

            .shadow-sm,
            .shadow-md,
            .shadow-lg,
            .shadow-xl,
            .shadow-2xl {
              box-shadow: none !important;
            }

            button {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="teacher-profile-print min-h-screen bg-slate-50 pb-12">
        {/* =================================================
            TOP NAVIGATION
        ================================================= */}

        <div className="print-hidden sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() =>
                navigate("/teachers")
              }
              className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft
                size={17}
                className="transition group-hover:-translate-x-0.5"
              />
              Teachers
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportTeacher}
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 sm:flex"
              >
                <Download size={16} />
                Export
              </button>

              <button
                type="button"
                onClick={printProfile}
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 md:flex"
              >
                <Printer size={16} />
                Print
              </button>

              <button
                type="button"
                onClick={openEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-8">
          {/* =================================================
              HERO
          ================================================= */}

          <section className="profile-fade-up overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-32 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-800 sm:h-40">
              <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

              <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.12),transparent_28%)]" />
            </div>

            <div className="relative px-5 pb-6 sm:px-8">
              <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="rounded-[28px] bg-white p-2 shadow-xl">
                    <Avatar
                      name={teacher.fullName}
                      photo={teacher.photo}
                      size="xl"
                    />
                  </div>

                  <div className="pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        {teacher.fullName}
                      </h1>

                      {teacher.status ===
                      "Active" ? (
                        <CheckCircle2
                          size={20}
                          className="text-emerald-500"
                        />
                      ) : null}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <RoleBadge
                        role={teacher.role}
                      />

                      <StatusBadge
                        status={
                          teacher.status
                        }
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <IdCard size={15} />
                        {teacher.staffId}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase size={15} />
                        {teacher.position}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Layers3 size={15} />
                        {teacher.department}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="print-hidden flex flex-wrap gap-2 lg:pb-1">
                  <button
                    type="button"
                    onClick={() =>
                      openAttendance(
                        "Present"
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    <CalendarCheck
                      size={16}
                    />
                    Mark Attendance
                  </button>

                  {teacher.status ===
                  "Archived" ? (
                    <button
                      type="button"
                      onClick={
                        restoreTeacher
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <RotateCcw
                        size={16}
                      />
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={
                        archiveTeacher
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <Archive size={16} />
                      Archive
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-7 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                    <Mail size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Email
                    </p>

                    <p className="truncate text-sm font-medium text-slate-700">
                      {teacher.email ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                    <Phone size={17} />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Phone
                    </p>

                    <p className="text-sm font-medium text-slate-700">
                      {teacher.phone ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                    <GraduationCap
                      size={17}
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Qualification
                    </p>

                    <p className="text-sm font-medium text-slate-700">
                      {teacher.qualification ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                    <CalendarDays
                      size={17}
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Joined
                    </p>

                    <p className="text-sm font-medium text-slate-700">
                      {formatDate(
                        teacher.dateJoined
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              STATS
          ================================================= */}

          <section className="profile-fade-up mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard
              icon={Users}
              label="Students"
              value={studentCount}
              description="Assigned students"
              onClick={() =>
                setActiveTab("academic")
              }
            />

            <StatCard
              icon={BookOpen}
              label="Subjects"
              value={subjectCount}
              description="Teaching subjects"
              onClick={() =>
                setActiveTab("academic")
              }
            />

            <StatCard
              icon={Layers3}
              label="Classes"
              value={classCount}
              description="Assigned classes"
              onClick={() =>
                setActiveTab("academic")
              }
            />

            <StatCard
              icon={CalendarCheck}
              label="Attendance"
              value={`${attendanceSummary.percentage.toFixed(
                1
              )}%`}
              description={`${attendanceSummary.present} present`}
              progress={
                attendanceSummary.percentage
              }
              onClick={() =>
                setActiveTab("attendance")
              }
            />

            <StatCard
              icon={BarChart3}
              label="Results"
              value={resultsCount}
              description={`Avg ${resultAverage.toFixed(
                1
              )}`}
              onClick={() =>
                setActiveTab("performance")
              }
            />
          </section>

          {/* =================================================
              TABS
          ================================================= */}

          <section className="print-hidden mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex min-w-max">
              {TABS.map((tab) => {
                const Icon = tab.icon;

                const active =
                  activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab.id)
                    }
                    className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold transition ${
                      active
                        ? "text-blue-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    <Icon size={17} />
                    {tab.label}

                    {active && (
                      <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="mt-6">
            {/* =================================================
                OVERVIEW
            ================================================= */}

            {activeTab === "overview" && (
              <div className="profile-fade-up grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-6">
                  {/* Role */}
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <SectionHeader
                      icon={ShieldCheck}
                      title="Role & Responsibilities"
                      description="Current responsibility profile for this staff member."
                    />

                    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-900">
                              {teacher.role}
                            </h3>

                            <RoleBadge
                              role={
                                teacher.role
                              }
                            />
                          </div>

                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            {roleDescription(
                              teacher.role
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={openEdit}
                          className="print-hidden inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-600 hover:text-white"
                        >
                          <Edit3 size={15} />
                          Change Role
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-400">
                          Position
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {teacher.position}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-400">
                          Department
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {teacher.department}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-400">
                          Employment
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {teacher.employmentType}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Academic snapshot */}
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <SectionHeader
                      icon={GraduationCap}
                      title="Academic Assignment"
                      description="Subjects, classes and responsibilities currently assigned."
                    />

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-800">
                            Subjects
                          </h3>

                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {subjectCount}
                          </span>
                        </div>

                        {teacher.subjects.length ? (
                          <div className="flex flex-wrap gap-2">
                            {teacher.subjects.map(
                              (subject) => (
                                <span
                                  key={
                                    subject
                                  }
                                  className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                                >
                                  {subject}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">
                            No subjects assigned.
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-800">
                            Classes
                          </h3>

                          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                            {classCount}
                          </span>
                        </div>

                        {assignedClassNames.length ? (
                          <div className="flex flex-wrap gap-2">
                            {assignedClassNames.map(
                              (className) => (
                                <span
                                  key={
                                    className
                                  }
                                  className="rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700"
                                >
                                  {className}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">
                            No classes assigned.
                          </p>
                        )}
                      </div>
                    </div>

                    {teacher.classTeacherOf && (
                      <div className="mt-6 flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-white p-2.5 text-emerald-600 shadow-sm">
                            <UserCheck
                              size={18}
                            />
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                              Form Master
                            </p>

                            <p className="mt-0.5 font-bold text-slate-900">
                              {teacher.classTeacherOf}
                            </p>
                          </div>
                        </div>

                        <CheckCircle2
                          className="text-emerald-600"
                          size={21}
                        />
                      </div>
                    )}
                  </section>

                  {/* Notes */}
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <SectionHeader
                      icon={FileText}
                      title="Professional Notes"
                      description="Internal notes about this teacher."
                    />

                    {teacher.notes ? (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                        {teacher.notes}
                      </div>
                    ) : (
                      <EmptyState
                        icon={FileText}
                        title="No notes yet"
                        description="Add professional notes from the Edit Profile section."
                      />
                    )}
                  </section>
                </div>

                <aside className="space-y-6">
                  {/* Quick actions */}
                  <section className="print-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionHeader
                      icon={Activity}
                      title="Quick Actions"
                      description="Frequently used teacher actions."
                    />

                    <div className="grid gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openAttendance(
                            "Present"
                          )
                        }
                        className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
                      >
                        <span className="flex items-center gap-3">
                          <CalendarCheck
                            size={17}
                            className="text-emerald-600"
                          />
                          <span className="text-sm font-semibold text-slate-700">
                            Record Attendance
                          </span>
                        </span>

                        <ChevronRight
                          size={16}
                          className="text-slate-400"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={openEdit}
                        className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <span className="flex items-center gap-3">
                          <Edit3
                            size={17}
                            className="text-blue-600"
                          />
                          <span className="text-sm font-semibold text-slate-700">
                            Edit Teacher
                          </span>
                        </span>

                        <ChevronRight
                          size={16}
                          className="text-slate-400"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveTab(
                            "performance"
                          )
                        }
                        className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-left transition hover:border-violet-200 hover:bg-violet-50"
                      >
                        <span className="flex items-center gap-3">
                          <BarChart3
                            size={17}
                            className="text-violet-600"
                          />
                          <span className="text-sm font-semibold text-slate-700">
                            View Performance
                          </span>
                        </span>

                        <ChevronRight
                          size={16}
                          className="text-slate-400"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={exportTeacher}
                        className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-left transition hover:border-amber-200 hover:bg-amber-50"
                      >
                        <span className="flex items-center gap-3">
                          <Download
                            size={17}
                            className="text-amber-600"
                          />
                          <span className="text-sm font-semibold text-slate-700">
                            Export Profile
                          </span>
                        </span>

                        <ChevronRight
                          size={16}
                          className="text-slate-400"
                        />
                      </button>
                    </div>
                  </section>

                  {/* Contact */}
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionHeader
                      icon={Contact}
                      title="Contact"
                    />

                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Mail
                          size={17}
                          className="mt-0.5 text-blue-600"
                        />

                        <div>
                          <p className="text-xs text-slate-400">
                            Email
                          </p>

                          <p className="mt-0.5 break-all text-sm font-medium text-slate-700">
                            {teacher.email ||
                              "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Phone
                          size={17}
                          className="mt-0.5 text-emerald-600"
                        />

                        <div>
                          <p className="text-xs text-slate-400">
                            Phone
                          </p>

                          <p className="mt-0.5 text-sm font-medium text-slate-700">
                            {teacher.phone ||
                              "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <MapPin
                          size={17}
                          className="mt-0.5 text-red-500"
                        />

                        <div>
                          <p className="text-xs text-slate-400">
                            Address
                          </p>

                          <p className="mt-0.5 text-sm font-medium leading-6 text-slate-700">
                            {teacher.address ||
                              "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Emergency */}
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionHeader
                      icon={Heart}
                      title="Emergency Contact"
                    />

                    {teacher.emergencyContact
                      .name ? (
                      <div className="rounded-2xl bg-red-50 p-4">
                        <p className="font-bold text-slate-900">
                          {
                            teacher
                              .emergencyContact
                              .name
                          }
                        </p>

                        <p className="mt-1 text-xs font-medium text-red-600">
                          {
                            teacher
                              .emergencyContact
                              .relationship
                          }
                        </p>

                        <div className="mt-4 space-y-2 text-sm text-slate-600">
                          <p className="flex items-center gap-2">
                            <Phone size={14} />
                            {
                              teacher
                                .emergencyContact
                                .phone
                            }
                          </p>

                          {teacher
                            .emergencyContact
                            .address && (
                            <p className="flex items-start gap-2">
                              <MapPin
                                size={14}
                                className="mt-1 shrink-0"
                              />
                              {
                                teacher
                                  .emergencyContact
                                  .address
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        icon={Heart}
                        title="No emergency contact"
                        description="Add an emergency contact through Edit Profile."
                      />
                    )}
                  </section>
                </aside>
              </div>
            )}

            {/* =================================================
                ACADEMIC
            ================================================= */}

            {activeTab === "academic" && (
              <div className="profile-fade-up space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionHeader
                    icon={GraduationCap}
                    title="Teaching Workload"
                    description="Complete academic assignment for this teacher."
                    action={
                      <button
                        type="button"
                        onClick={openEdit}
                        className="print-hidden inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600"
                      >
                        <Edit3 size={14} />
                        Manage Assignment
                      </button>
                    }
                  />

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl bg-blue-50 p-5">
                      <BookOpen
                        size={22}
                        className="text-blue-600"
                      />

                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-blue-500">
                        Subjects
                      </p>

                      <p className="mt-1 text-3xl font-bold text-slate-900">
                        {subjectCount}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-violet-50 p-5">
                      <Layers3
                        size={22}
                        className="text-violet-600"
                      />

                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-violet-500">
                        Classes
                      </p>

                      <p className="mt-1 text-3xl font-bold text-slate-900">
                        {classCount}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 p-5">
                      <Users
                        size={22}
                        className="text-emerald-600"
                      />

                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-emerald-500">
                        Students
                      </p>

                      <p className="mt-1 text-3xl font-bold text-slate-900">
                        {studentCount}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-amber-50 p-5">
                      <UserCheck
                        size={22}
                        className="text-amber-600"
                      />

                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-amber-500">
                        Form Class
                      </p>

                      <p className="mt-1 truncate text-xl font-bold text-slate-900">
                        {teacher.classTeacherOf ||
                          "None"}
                      </p>
                    </div>
                  </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <SectionHeader
                      icon={BookOpen}
                      title="Assigned Subjects"
                    />

                    {teacher.subjects.length ? (
                      <div className="space-y-2">
                        {teacher.subjects.map(
                          (
                            subject,
                            index
                          ) => (
                            <div
                              key={
                                subject
                              }
                              className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition hover:border-blue-100 hover:bg-blue-50/50"
                            >
                              <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                                  {index +
                                    1}
                                </span>

                                <span className="text-sm font-semibold text-slate-700">
                                  {subject}
                                </span>
                              </div>

                              <ChevronRight
                                size={15}
                                className="text-slate-300"
                              />
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <EmptyState
                        icon={BookOpen}
                        title="No subjects assigned"
                        description="Edit this teacher profile to assign subjects."
                      />
                    )}
                  </section>

                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <SectionHeader
                      icon={Layers3}
                      title="Assigned Classes"
                    />

                    {assignedClassNames.length ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {assignedClassNames.map(
                          (className) => {
                            const count =
                              students.filter(
                                (student) => {
                                  const value =
                                    student.className ||
                                    student.class ||
                                    student.currentClass ||
                                    student.formClass ||
                                    student.classLevel;

                                  return (
                                    value ===
                                    className
                                  );
                                }
                              ).length;

                            return (
                              <div
                                key={
                                  className
                                }
                                className="rounded-2xl border border-slate-100 p-4"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                                      <Layers3
                                        size={
                                          16
                                        }
                                      />
                                    </div>

                                    <span className="font-bold text-slate-800">
                                      {
                                        className
                                      }
                                    </span>
                                  </div>

                                  {className ===
                                    teacher.classTeacherOf && (
                                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                                      FORM
                                    </span>
                                  )}
                                </div>

                                <p className="mt-3 text-xs text-slate-400">
                                  Students
                                </p>

                                <p className="mt-1 text-xl font-bold text-slate-900">
                                  {count}
                                </p>
                              </div>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Layers3}
                        title="No classes assigned"
                        description="Assign classes to this teacher from Edit Profile."
                      />
                    )}
                  </section>
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionHeader
                    icon={Users}
                    title="Students Under Responsibility"
                    description={`${studentCount} students found across assigned classes.`}
                  />

                  {assignedStudents.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[650px] text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                            <th className="px-4 py-3 font-semibold">
                              Student
                            </th>

                            <th className="px-4 py-3 font-semibold">
                              Class
                            </th>

                            <th className="px-4 py-3 font-semibold">
                              Gender
                            </th>

                            <th className="px-4 py-3 font-semibold">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {assignedStudents
                            .slice(0, 20)
                            .map(
                              (
                                student,
                                index
                              ) => {
                                const studentName =
                                  student.fullName ||
                                  student.name ||
                                  [
                                    student.firstName,
                                    student.lastName,
                                  ]
                                    .filter(
                                      Boolean
                                    )
                                    .join(
                                      " "
                                    );

                                const studentClass =
                                  student.className ||
                                  student.class ||
                                  student.currentClass ||
                                  student.formClass ||
                                  student.classLevel;

                                return (
                                  <tr
                                    key={
                                      student.id ||
                                      index
                                    }
                                    className="border-b border-slate-50 last:border-0"
                                  >
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <Avatar
                                          name={
                                            studentName
                                          }
                                          photo={
                                            student.photo
                                          }
                                          size="sm"
                                        />

                                        <div>
                                          <p className="text-sm font-semibold text-slate-800">
                                            {
                                              studentName
                                            }
                                          </p>

                                          <p className="text-xs text-slate-400">
                                            {student.admissionNumber ||
                                              student.studentId ||
                                              "Student"}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    <td className="px-4 py-3 text-sm text-slate-600">
                                      {
                                        studentClass
                                      }
                                    </td>

                                    <td className="px-4 py-3 text-sm text-slate-600">
                                      {student.gender ||
                                        "—"}
                                    </td>

                                    <td className="px-4 py-3">
                                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                        {student.status ||
                                          "Active"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      icon={Users}
                      title="No student records found"
                      description="Student records will appear here when they are assigned to one of this teacher's classes."
                    />
                  )}
                </section>
              </div>
            )}

            {/* =================================================
                ATTENDANCE
            ================================================= */}

            {activeTab === "attendance" && (
              <div className="profile-fade-up space-y-6">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                  <StatCard
                    icon={CheckCircle2}
                    label="Present"
                    value={
                      attendanceSummary.present
                    }
                    description="Days present"
                  />

                  <StatCard
                    icon={Clock}
                    label="Late"
                    value={
                      attendanceSummary.late
                    }
                    description="Late arrivals"
                  />

                  <StatCard
                    icon={XCircle}
                    label="Absent"
                    value={
                      attendanceSummary.absent
                    }
                    description="Absent days"
                  />

                  <StatCard
                    icon={Calendar}
                    label="Leave"
                    value={
                      attendanceSummary.leave
                    }
                    description="Leave days"
                  />

                  <StatCard
                    icon={TrendingUp}
                    label="Rate"
                    value={`${attendanceSummary.percentage.toFixed(
                      1
                    )}%`}
                    description="Attendance rate"
                    progress={
                      attendanceSummary.percentage
                    }
                  />
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionHeader
                    icon={CalendarCheck}
                    title="Attendance History"
                    description="Daily attendance records for this teacher."
                    action={
                      <button
                        type="button"
                        onClick={() =>
                          openAttendance(
                            "Present"
                          )
                        }
                        className="print-hidden inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <CalendarCheck
                          size={14}
                        />
                        Record Attendance
                      </button>
                    }
                  />

                  {teacherAttendanceRecords.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                            <th className="px-4 py-3">
                              Date
                            </th>

                            <th className="px-4 py-3">
                              Status
                            </th>

                            <th className="px-4 py-3">
                              Note
                            </th>

                            <th className="px-4 py-3">
                              Updated
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {teacherAttendanceRecords.map(
                            (
                              record,
                              index
                            ) => {
                              const status =
                                String(
                                  record.status ||
                                    ""
                                );

                              const statusStyle =
                                {
                                  Present:
                                    "bg-emerald-50 text-emerald-700",
                                  Late:
                                    "bg-amber-50 text-amber-700",
                                  Absent:
                                    "bg-red-50 text-red-700",
                                  Leave:
                                    "bg-violet-50 text-violet-700",
                                };

                              return (
                                <tr
                                  key={
                                    record.id ||
                                    index
                                  }
                                  className="border-b border-slate-50 last:border-0"
                                >
                                  <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                                    {formatDate(
                                      record.date
                                    )}
                                  </td>

                                  <td className="px-4 py-4">
                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        statusStyle[
                                          status
                                        ] ||
                                        "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {status ||
                                        "Unknown"}
                                    </span>
                                  </td>

                                  <td className="max-w-[300px] px-4 py-4 text-sm text-slate-500">
                                    {record.note ||
                                      "—"}
                                  </td>

                                  <td className="px-4 py-4 text-xs text-slate-400">
                                    {formatDateTime(
                                      record.updatedAt ||
                                        record.createdAt ||
                                        record.date
                                    )}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      icon={CalendarCheck}
                      title="No attendance records"
                      description="Use Record Attendance to begin tracking this teacher."
                    />
                  )}
                </section>
              </div>
            )}

            {/* =================================================
                PERFORMANCE
            ================================================= */}

            {activeTab === "performance" && (
              <div className="profile-fade-up space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    icon={BarChart3}
                    label="Average Score"
                    value={resultAverage.toFixed(
                      1
                    )}
                    description="Based on available results"
                    progress={Math.min(
                      100,
                      resultAverage
                    )}
                  />

                  <StatCard
                    icon={ClipboardCheck}
                    label="Results"
                    value={resultsCount}
                    description="Results associated with teacher"
                  />

                  <StatCard
                    icon={Award}
                    label="Subjects"
                    value={
                      subjectPerformance.length
                    }
                    description="Subjects with result data"
                  />

                  <StatCard
                    icon={TrendingUp}
                    label="Classes"
                    value={classCount}
                    description="Academic classes"
                  />
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionHeader
                    icon={BarChart3}
                    title="Subject Performance"
                    description="Average performance across subjects with available result data."
                  />

                  {subjectPerformance.length ? (
                    <div className="space-y-5">
                      {subjectPerformance.map(
                        (item) => (
                          <div
                            key={
                              item.subject
                            }
                          >
                            <div className="mb-2 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <BookOpen
                                  size={15}
                                  className="text-blue-600"
                                />

                                <span className="text-sm font-semibold text-slate-700">
                                  {
                                    item.subject
                                  }
                                </span>
                              </div>

                              <span className="text-sm font-bold text-slate-900">
                                {item.average.toFixed(
                                  1
                                )}
                              </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-all"
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

                            <p className="mt-1 text-xs text-slate-400">
                              {
                                item
                                  .scores
                                  .length
                              }{" "}
                              result
                              {item
                                .scores
                                .length !==
                              1
                                ? "s"
                                : ""}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={BarChart3}
                      title="No performance data"
                      description="Results connected to this teacher will appear here automatically."
                    />
                  )}
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionHeader
                    icon={ClipboardCheck}
                    title="Recent Results"
                    description="Recently recorded or updated result information."
                  />

                  {teacherResults.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                            <th className="px-4 py-3">
                              Student
                            </th>

                            <th className="px-4 py-3">
                              Subject
                            </th>

                            <th className="px-4 py-3">
                              Score
                            </th>

                            <th className="px-4 py-3">
                              Status
                            </th>

                            <th className="px-4 py-3">
                              Date
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {teacherResults
                            .slice(0, 25)
                            .map(
                              (
                                result,
                                index
                              ) => {
                                const score =
                                  safeNumber(
                                    result.total ??
                                      result.score ??
                                      result.average ??
                                      result.percentage
                                  );

                                return (
                                  <tr
                                    key={
                                      result.id ||
                                      index
                                    }
                                    className="border-b border-slate-50 last:border-0"
                                  >
                                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                      {result.studentName ||
                                        result.student?.name ||
                                        result.student?.fullName ||
                                        "Student"}
                                    </td>

                                    <td className="px-4 py-3 text-sm text-slate-600">
                                      {result.subject ||
                                        result.subjectName ||
                                        "General"}
                                    </td>

                                    <td className="px-4 py-3">
                                      <span className="font-bold text-slate-900">
                                        {score.toFixed(
                                          1
                                        )}
                                      </span>
                                    </td>

                                    <td className="px-4 py-3">
                                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                        {result.status ||
                                          "Recorded"}
                                      </span>
                                    </td>

                                    <td className="px-4 py-3 text-xs text-slate-400">
                                      {formatDate(
                                        result.updatedAt ||
                                          result.createdAt ||
                                          result.submittedAt
                                      )}
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      icon={ClipboardCheck}
                      title="No results found"
                      description="Student results associated with this teacher will appear here."
                    />
                  )}
                </section>
              </div>
            )}

            {/* =================================================
                ACTIVITY
            ================================================= */}

            {activeTab === "activity" && (
              <div className="profile-fade-up grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionHeader
                    icon={History}
                    title="Activity Timeline"
                    description="Recent activity associated with this teacher."
                  />

                  {activityFeed.length ? (
                    <div className="relative ml-3 border-l border-slate-200 pl-7">
                      {activityFeed.map(
                        (item, index) => {
                          const activityIcon =
                            item.type ===
                            "attendance"
                              ? CalendarCheck
                              : item.type ===
                                "academic"
                              ? GraduationCap
                              : item.type ===
                                "document"
                              ? FileText
                              : item.type ===
                                "role"
                              ? ShieldCheck
                              : Activity;

                          const Icon =
                            activityIcon;

                          return (
                            <div
                              key={
                                item.id ||
                                index
                              }
                              className="relative pb-8 last:pb-0"
                            >
                              <div className="absolute -left-[42px] flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-blue-600 shadow-sm">
                                <Icon
                                  size={13}
                                />
                              </div>

                              <div className="rounded-2xl border border-slate-100 p-4 transition hover:border-blue-100 hover:bg-blue-50/30">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                  <h3 className="font-semibold text-slate-800">
                                    {item.title}
                                  </h3>

                                  <span className="text-xs text-slate-400">
                                    {formatDateTime(
                                      item.createdAt
                                    )}
                                  </span>
                                </div>

                                {item.description && (
                                  <p className="mt-1 text-sm leading-6 text-slate-500">
                                    {
                                      item.description
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Activity}
                      title="No activity yet"
                      description="Teacher activities will appear here as actions are performed."
                    />
                  )}
                </section>

                <aside className="space-y-6">
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionHeader
                      icon={History}
                      title="System Information"
                    />

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-400">
                          Profile created
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatDateTime(
                            teacher.createdAt
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Last updated
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatDateTime(
                            teacher.updatedAt
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Staff ID
                        </p>

                        <p className="mt-1 font-mono text-sm font-bold text-slate-700">
                          {teacher.staffId}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Profile status
                        </p>

                        <div className="mt-2">
                          <StatusBadge
                            status={
                              teacher.status
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </aside>
              </div>
            )}

            {/* =================================================
                DOCUMENTS
            ================================================= */}

            {activeTab === "documents" && (
              <div className="profile-fade-up space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionHeader
                    icon={FileText}
                    title="Teacher Documents"
                    description="Certificates, qualifications and employment documents."
                    action={
                      <button
                        type="button"
                        onClick={() =>
                          setShowDocumentModal(
                            true
                          )
                        }
                        className="print-hidden inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Upload size={14} />
                        Add Document
                      </button>
                    }
                  />

                  {teacher.documents.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {teacher.documents.map(
                        (document) => (
                          <div
                            key={
                              document.id
                            }
                            className="group rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                          >
                            <div className="flex items-start justify-between">
                              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                <FileText
                                  size={21}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteDocument(
                                    document.id
                                  )
                                }
                                className="print-hidden rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2
                                  size={15}
                                />
                              </button>
                            </div>

                            <h3 className="mt-4 truncate font-bold text-slate-800">
                              {
                                document.name
                              }
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                              {
                                document.type
                              }
                            </p>

                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-xs text-slate-400">
                                {formatDate(
                                  document.createdAt
                                )}
                              </span>

                              {document.url && (
                                <a
                                  href={
                                    document.url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="print-hidden inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                                >
                                  View
                                  <ChevronRight
                                    size={
                                      13
                                    }
                                  />
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={FileText}
                      title="No documents uploaded"
                      description="Add certificates, qualifications or employment documents for this teacher."
                    />
                  )}
                </section>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Teacher Profile"
        description="Update personal information, role, academic assignments and responsibilities."
        width="max-w-5xl"
      >
        {editForm && (
          <div className="p-5 sm:p-6">
            {/* Photo */}
            <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center">
              <div className="relative">
                <Avatar
                  name={
                    editForm.fullName ||
                    [
                      editForm.firstName,
                      editForm.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ")
                  }
                  photo={editForm.photo}
                  size="lg"
                />

                <button
                  type="button"
                  onClick={() =>
                    photoInputRef.current?.click()
                  }
                  className="absolute -bottom-1 -right-1 rounded-xl border-2 border-white bg-slate-900 p-2 text-white shadow-md transition hover:bg-blue-600"
                >
                  <Camera size={14} />
                </button>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={
                    handlePhotoUpload
                  }
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Profile Photo
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Upload a clear staff photo. Maximum
                  recommended size is 3MB.
                </p>
              </div>
            </div>

            {/* Personal */}
            <div className="space-y-8">
              <section>
                <SectionHeader
                  icon={UserRound}
                  title="Personal Information"
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField
                    label="First Name"
                    value={
                      editForm.firstName
                    }
                    onChange={(value) =>
                      updateEditField(
                        "firstName",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Middle Name"
                    value={
                      editForm.middleName
                    }
                    onChange={(value) =>
                      updateEditField(
                        "middleName",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Last Name"
                    value={
                      editForm.lastName
                    }
                    onChange={(value) =>
                      updateEditField(
                        "lastName",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Display / Full Name"
                    value={
                      editForm.fullName
                    }
                    onChange={(value) =>
                      updateEditField(
                        "fullName",
                        value
                      )
                    }
                  />

                  <SelectField
                    label="Gender"
                    value={
                      editForm.gender
                    }
                    onChange={(value) =>
                      updateEditField(
                        "gender",
                        value
                      )
                    }
                    options={[
                      "",
                      "Male",
                      "Female",
                    ]}
                  />

                  <InputField
                    label="Date of Birth"
                    type="date"
                    value={
                      editForm.dateOfBirth
                    }
                    onChange={(value) =>
                      updateEditField(
                        "dateOfBirth",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Email"
                    type="email"
                    value={
                      editForm.email
                    }
                    onChange={(value) =>
                      updateEditField(
                        "email",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Phone"
                    value={
                      editForm.phone
                    }
                    onChange={(value) =>
                      updateEditField(
                        "phone",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Address"
                    value={
                      editForm.address
                    }
                    onChange={(value) =>
                      updateEditField(
                        "address",
                        value
                      )
                    }
                    className="sm:col-span-2 lg:col-span-3"
                  />
                </div>
              </section>

              {/* Professional */}
              <section>
                <SectionHeader
                  icon={Briefcase}
                  title="Professional Information"
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField
                    label="Staff ID"
                    value={
                      editForm.staffId
                    }
                    onChange={(value) =>
                      updateEditField(
                        "staffId",
                        value
                      )
                    }
                  />

                  <SelectField
                    label="Role / Responsibility"
                    value={
                      editForm.role
                    }
                    onChange={(value) =>
                      updateEditField(
                        "role",
                        value
                      )
                    }
                    options={
                      ROLE_OPTIONS
                    }
                  />

                  <InputField
                    label="Position"
                    value={
                      editForm.position
                    }
                    onChange={(value) =>
                      updateEditField(
                        "position",
                        value
                      )
                    }
                  />

                  <SelectField
                    label="Department"
                    value={
                      editForm.department
                    }
                    onChange={(value) =>
                      updateEditField(
                        "department",
                        value
                      )
                    }
                    options={
                      DEPARTMENTS
                    }
                  />

                  <SelectField
                    label="Employment Type"
                    value={
                      editForm.employmentType
                    }
                    onChange={(value) =>
                      updateEditField(
                        "employmentType",
                        value
                      )
                    }
                    options={
                      EMPLOYMENT_OPTIONS
                    }
                  />

                  <SelectField
                    label="Employment Status"
                    value={
                      editForm.status
                    }
                    onChange={(value) =>
                      updateEditField(
                        "status",
                        value
                      )
                    }
                    options={
                      STATUS_OPTIONS
                    }
                  />

                  <InputField
                    label="Qualification"
                    value={
                      editForm.qualification
                    }
                    onChange={(value) =>
                      updateEditField(
                        "qualification",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Specialization"
                    value={
                      editForm.specialization
                    }
                    onChange={(value) =>
                      updateEditField(
                        "specialization",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Years of Experience"
                    type="number"
                    min="0"
                    value={
                      editForm.yearsExperience
                    }
                    onChange={(value) =>
                      updateEditField(
                        "yearsExperience",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Date Joined"
                    type="date"
                    value={
                      editForm.dateJoined
                    }
                    onChange={(value) =>
                      updateEditField(
                        "dateJoined",
                        value
                      )
                    }
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={19}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>
                      <p className="text-sm font-bold text-blue-900">
                        {editForm.role}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-700">
                        {roleDescription(
                          editForm.role
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Subjects */}
              <section>
                <SectionHeader
                  icon={BookOpen}
                  title="Subject Assignment"
                  description="Select all subjects this teacher teaches."
                />

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {SUBJECT_OPTIONS.map(
                    (subject) => {
                      const selected =
                        editForm.subjects.includes(
                          subject
                        );

                      return (
                        <label
                          key={subject}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                            selected
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-100 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selected
                            }
                            onChange={() =>
                              toggleEditArrayValue(
                                "subjects",
                                subject
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />

                          <span className="font-medium">
                            {subject}
                          </span>
                        </label>
                      );
                    }
                  )}
                </div>
              </section>

              {/* Classes */}
              <section>
                <SectionHeader
                  icon={Layers3}
                  title="Class Assignment"
                  description="Select classes this teacher handles."
                />

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {CLASS_OPTIONS.map(
                    (className) => {
                      const selected =
                        editForm.classes.includes(
                          className
                        );

                      return (
                        <label
                          key={
                            className
                          }
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                            selected
                              ? "border-violet-200 bg-violet-50 text-violet-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-violet-100 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selected
                            }
                            onChange={() =>
                              toggleEditArrayValue(
                                "classes",
                                className
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          />

                          <span className="font-medium">
                            {className}
                          </span>
                        </label>
                      );
                    }
                  )}
                </div>

                <div className="mt-5">
                  <SelectField
                    label="Form Master / Class Teacher Of"
                    value={
                      editForm.classTeacherOf
                    }
                    onChange={(value) =>
                      updateEditField(
                        "classTeacherOf",
                        value
                      )
                    }
                    options={[
                      "",
                      ...CLASS_OPTIONS,
                    ]}
                  />

                  {editForm.role ===
                    "Form Master" && (
                    <p className="mt-2 text-xs font-medium text-amber-600">
                      A Form Master should have a
                      designated class.
                    </p>
                  )}
                </div>
              </section>

              {/* Emergency */}
              <section>
                <SectionHeader
                  icon={Heart}
                  title="Emergency Contact"
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField
                    label="Contact Name"
                    value={
                      editForm.emergencyName
                    }
                    onChange={(value) =>
                      updateEditField(
                        "emergencyName",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Relationship"
                    value={
                      editForm.emergencyRelationship
                    }
                    onChange={(value) =>
                      updateEditField(
                        "emergencyRelationship",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Phone"
                    value={
                      editForm.emergencyPhone
                    }
                    onChange={(value) =>
                      updateEditField(
                        "emergencyPhone",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Alternative Phone"
                    value={
                      editForm.emergencyAlternativePhone
                    }
                    onChange={(value) =>
                      updateEditField(
                        "emergencyAlternativePhone",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Address"
                    value={
                      editForm.emergencyAddress
                    }
                    onChange={(value) =>
                      updateEditField(
                        "emergencyAddress",
                        value
                      )
                    }
                    className="sm:col-span-2 lg:col-span-3"
                  />
                </div>
              </section>

              {/* Notes */}
              <section>
                <SectionHeader
                  icon={FileText}
                  title="Professional Notes"
                />

                <textarea
                  value={editForm.notes}
                  onChange={(event) =>
                    updateEditField(
                      "notes",
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder="Add professional notes, responsibilities, achievements or other internal information..."
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </section>
            </div>

            {/* Footer */}
            <div className="print-hidden mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowEdit(false)
                }
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveTeacher}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Save size={16} />
                Save Teacher Profile
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* =====================================================
          ATTENDANCE MODAL
      ===================================================== */}

      <Modal
        open={showAttendance}
        onClose={() =>
          setShowAttendance(false)
        }
        title="Record Teacher Attendance"
        description={`Attendance record for ${teacher.fullName}.`}
        width="max-w-lg"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
            <Avatar
              name={teacher.fullName}
              photo={teacher.photo}
              size="md"
            />

            <div>
              <p className="font-bold text-slate-900">
                {teacher.fullName}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {teacher.staffId} •{" "}
                {teacher.role}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <InputField
              label="Date"
              type="date"
              value={
                attendanceForm.date
              }
              onChange={(value) =>
                setAttendanceForm(
                  (previous) => ({
                    ...previous,
                    date: value,
                  })
                )
              }
            />

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Attendance Status
              </label>

              <div className="grid grid-cols-2 gap-2">
                {ATTENDANCE_STATUSES.map(
                  (status) => {
                    const selected =
                      attendanceForm.status ===
                      status;

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setAttendanceForm(
                            (
                              previous
                            ) => ({
                              ...previous,
                              status,
                            })
                          )
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          selected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Note
              </label>

              <textarea
                value={
                  attendanceForm.note
                }
                onChange={(event) =>
                  setAttendanceForm(
                    (previous) => ({
                      ...previous,
                      note:
                        event.target.value,
                    })
                  )
                }
                rows={4}
                placeholder="Optional attendance note..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() =>
                setShowAttendance(false)
              }
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveAttendance}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Save Attendance
            </button>
          </div>
        </div>
      </Modal>

      {/* =====================================================
          DOCUMENT MODAL
      ===================================================== */}

      <Modal
        open={showDocumentModal}
        onClose={() =>
          setShowDocumentModal(false)
        }
        title="Add Teacher Document"
        description="Add a certificate, qualification or employment document."
        width="max-w-lg"
      >
        <div className="p-5 sm:p-6">
          <div className="space-y-5">
            <InputField
              label="Document Name"
              value={
                documentForm.name
              }
              onChange={(value) =>
                setDocumentForm(
                  (previous) => ({
                    ...previous,
                    name: value,
                  })
                )
              }
              placeholder="e.g. B.Ed Certificate"
            />

            <SelectField
              label="Document Type"
              value={
                documentForm.type
              }
              onChange={(value) =>
                setDocumentForm(
                  (previous) => ({
                    ...previous,
                    type: value,
                  })
                )
              }
              options={[
                "Certificate",
                "Qualification",
                "CV",
                "Employment Document",
                "Identity Document",
                "Training",
                "Other",
              ]}
            />

            <InputField
              label="Document URL"
              value={
                documentForm.url
              }
              onChange={(value) =>
                setDocumentForm(
                  (previous) => ({
                    ...previous,
                    url: value,
                  })
                )
              }
              placeholder="https://..."
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() =>
                setShowDocumentModal(
                  false
                )
              }
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={addDocument}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Add Document
            </button>
          </div>
        </div>
      </Modal>

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div className="print-hidden fixed bottom-5 right-5 z-[200] max-w-sm">
          <div
            className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${
              toast.type === "error"
                ? "border-red-200"
                : "border-emerald-200"
            }`}
          >
            <div
              className={`rounded-xl p-2 ${
                toast.type === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {toast.type ===
              "error" ? (
                <AlertTriangle
                  size={17}
                />
              ) : (
                <CheckCircle2
                  size={17}
                />
              )}
            </div>

            <div className="pt-1">
              <p className="text-sm font-semibold text-slate-800">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setToast(null)
              }
              className="ml-auto rounded-lg p-1 text-slate-300 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   FORM COMPONENTS
========================================================= */

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  min,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <input
        type={type}
        value={value ?? ""}
        min={min}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options = [],
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      >
        {options.map((option) => (
          <option
            key={option || "empty"}
            value={option}
          >
            {option || "Select..."}
          </option>
        ))}
      </select>
    </div>
  );
}