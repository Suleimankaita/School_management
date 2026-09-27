import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
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
  Clock3,
  Download,
  Edit3,
  FileText,
  GraduationCap,
  History,
  LayoutDashboard,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Printer,
  RefreshCcw,
  RotateCcw,
  Save,
  School,
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
  AlertTriangle,
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
  "Administrator",
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
];

const DEPARTMENTS = [
  "Sciences",
  "Mathematics",
  "Languages",
  "Humanities",
  "Commercial",
  "Arts",
  "ICT",
  "Primary",
  "Nursery",
  "Administration",
  "Sports",
  "General Studies",
];

const SUBJECT_OPTIONS = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "ICT",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Geography",
  "Government",
  "Economics",
  "Commerce",
  "Accounting",
  "Literature",
  "Agricultural Science",
  "Civic Education",
  "Islamic Studies",
  "Christian Religious Studies",
  "Physical Education",
  "French",
];

const CLASS_OPTIONS = [
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "Nursery 1",
  "Nursery 2",
  "Nursery 3",
];

const ATTENDANCE_STATUSES = [
  "Present",
  "Late",
  "Absent",
  "Leave",
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

const nowISO = () => new Date().toISOString();

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
    if (typeof window === "undefined") return;

    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key}`, error);
  }
};

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatDate = (value, fallback = "Not available") => {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const todayString = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const initials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "T";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const unique = (items = []) => [...new Set(items.filter(Boolean))];

const inferRole = (teacher) => {
  const text = `${teacher?.role || ""} ${teacher?.position || ""}`.toLowerCase();

  if (text.includes("form master") || text.includes("formmaster")) {
    return "Form Master";
  }

  if (text.includes("subject teacher")) {
    return "Subject Teacher";
  }

  if (text.includes("head teacher")) {
    return "Head Teacher";
  }

  if (text.includes("senior teacher")) {
    return "Senior Teacher";
  }

  if (text.includes("coordinator")) {
    return "Coordinator";
  }

  if (text.includes("administrator")) {
    return "Administrator";
  }

  if (text.includes("staff")) {
    return "Staff";
  }

  return "Teacher";
};

const normalizeTeacher = (teacher = {}) => {
  const fullName =
    teacher.fullName ||
    [
      teacher.firstName,
      teacher.middleName,
      teacher.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Unnamed Teacher";

  return {
    ...teacher,

    id: teacher.id || uid(),

    staffId:
      teacher.staffId ||
      `STF-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,

    fullName,

    firstName:
      teacher.firstName ||
      fullName.split(" ")[0] ||
      "",

    middleName: teacher.middleName || "",

    lastName:
      teacher.lastName ||
      fullName.split(" ").slice(-1)[0] ||
      "",

    gender: teacher.gender || "Not specified",

    dateOfBirth: teacher.dateOfBirth || "",

    email: teacher.email || "",

    phone: teacher.phone || "",

    address: teacher.address || "",

    photo: teacher.photo || "",

    department: teacher.department || "General Studies",

    position: teacher.position || "Teacher",

    role: teacher.role || inferRole(teacher),

    employmentType:
      teacher.employmentType || "Full Time",

    qualification:
      teacher.qualification || "Not specified",

    specialization:
      teacher.specialization || "",

    yearsExperience:
      safeNumber(teacher.yearsExperience),

    dateJoined: teacher.dateJoined || "",

    status: teacher.status || "Active",

    subjects: Array.isArray(teacher.subjects)
      ? teacher.subjects
      : [],

    classes: Array.isArray(teacher.classes)
      ? teacher.classes
      : [],

    classTeacherOf:
      teacher.classTeacherOf || "",

    emergencyContact: {
      name: teacher.emergencyContact?.name || "",
      relationship:
        teacher.emergencyContact?.relationship || "",
      phone: teacher.emergencyContact?.phone || "",
    },

    notes: teacher.notes || "",

    documents: Array.isArray(teacher.documents)
      ? teacher.documents
      : [],

    activity: Array.isArray(teacher.activity)
      ? teacher.activity
      : [],

    attendance: {
      present: safeNumber(teacher.attendance?.present),
      absent: safeNumber(teacher.attendance?.absent),
      late: safeNumber(teacher.attendance?.late),
      leave: safeNumber(teacher.attendance?.leave),
      total: safeNumber(teacher.attendance?.total),
      percentage: safeNumber(
        teacher.attendance?.percentage
      ),
    },

    performance: {
      average: safeNumber(
        teacher.performance?.average
      ),
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

    createdAt: teacher.createdAt || nowISO(),

    updatedAt: teacher.updatedAt || nowISO(),
  };
};

const createActivity = (
  title,
  description,
  type = "system"
) => ({
  id: uid(),
  title,
  description,
  type,
  timestamp: nowISO(),
});

const getStudentClass = (student) =>
  student?.className ||
  student?.class ||
  student?.currentClass ||
  student?.classLevel ||
  "";

const getResultTeacherId = (result) =>
  result?.teacherId ||
  result?.teacher_id ||
  result?.submittedBy ||
  "";

const getResultTeacherName = (result) =>
  result?.teacherName ||
  result?.teacher ||
  result?.submittedByName ||
  "";

const getResultSubject = (result) =>
  result?.subject ||
  result?.subjectName ||
  result?.course ||
  "Unknown Subject";

const getResultScore = (result) =>
  safeNumber(
    result?.total ??
      result?.score ??
      result?.percentage ??
      result?.mark
  );

/* =========================================================
   OPTIONAL DEMO DATA
========================================================= */

const DEMO_TEACHERS = [
  {
    id: "teacher-001",
    staffId: "STF-2026-1001",
    fullName: "Amina Yusuf",
    firstName: "Amina",
    lastName: "Yusuf",
    gender: "Female",
    email: "amina.yusuf@school.edu.ng",
    phone: "08030000001",
    address: "Katsina, Nigeria",
    department: "Sciences",
    position: "Senior Science Teacher",
    role: "Subject Teacher",
    employmentType: "Full Time",
    qualification: "B.Sc. Biology",
    specialization: "Biology & Basic Science",
    yearsExperience: 7,
    dateJoined: "2022-09-01",
    status: "Active",
    subjects: ["Biology", "Basic Science"],
    classes: ["SS 1", "SS 2", "SS 3"],
    classTeacherOf: "",
    photo: "https://i.pravatar.cc/300?img=47",
    emergencyContact: {
      name: "Yusuf Ibrahim",
      relationship: "Brother",
      phone: "08030000091",
    },
    notes:
      "Responsible for senior secondary biology and science laboratory coordination.",
  },

  {
    id: "teacher-002",
    staffId: "STF-2026-1002",
    fullName: "Musa Abdullahi",
    firstName: "Musa",
    lastName: "Abdullahi",
    gender: "Male",
    email: "musa.abdullahi@school.edu.ng",
    phone: "08030000002",
    address: "Katsina, Nigeria",
    department: "Mathematics",
    position: "Form Master",
    role: "Form Master",
    employmentType: "Full Time",
    qualification: "B.Sc. Mathematics",
    specialization: "Mathematics",
    yearsExperience: 8,
    dateJoined: "2021-09-01",
    status: "Active",
    subjects: ["Mathematics"],
    classes: ["JSS 3", "SS 1"],
    classTeacherOf: "JSS 3",
    photo: "https://i.pravatar.cc/300?img=12",
    emergencyContact: {
      name: "Fatima Abdullahi",
      relationship: "Wife",
      phone: "08030000092",
    },
    notes:
      "Form Master for JSS 3. Coordinates attendance, discipline and class communication.",
  },

  {
    id: "teacher-003",
    staffId: "STF-2026-1003",
    fullName: "Maryam Ibrahim",
    firstName: "Maryam",
    lastName: "Ibrahim",
    gender: "Female",
    email: "maryam.ibrahim@school.edu.ng",
    phone: "08030000003",
    address: "Katsina, Nigeria",
    department: "Languages",
    position: "English Teacher",
    role: "Teacher",
    employmentType: "Full Time",
    qualification: "B.A. English",
    specialization: "English Language",
    yearsExperience: 5,
    dateJoined: "2023-01-10",
    status: "Active",
    subjects: ["English Language", "Literature"],
    classes: ["JSS 1", "JSS 2", "SS 1"],
    classTeacherOf: "",
    photo: "https://i.pravatar.cc/300?img=44",
    emergencyContact: {
      name: "Ibrahim Musa",
      relationship: "Brother",
      phone: "08030000093",
    },
  },

  {
    id: "teacher-004",
    staffId: "STF-2026-1004",
    fullName: "Sadiq Umar",
    firstName: "Sadiq",
    lastName: "Umar",
    gender: "Male",
    email: "sadiq.umar@school.edu.ng",
    phone: "08030000004",
    address: "Katsina, Nigeria",
    department: "Administration",
    position: "Administrative Staff",
    role: "Staff",
    employmentType: "Full Time",
    qualification: "HND Business Administration",
    specialization: "School Administration",
    yearsExperience: 4,
    dateJoined: "2024-02-01",
    status: "Active",
    subjects: [],
    classes: [],
    classTeacherOf: "",
    photo: "https://i.pravatar.cc/300?img=68",
    emergencyContact: {
      name: "Hauwa Umar",
      relationship: "Sister",
      phone: "08030000094",
    },
  },
];

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function StatusBadge({ status }) {
  const styles = {
    Active:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    "On Leave":
      "bg-amber-50 text-amber-700 border-amber-200",
    Inactive:
      "bg-slate-100 text-slate-600 border-slate-200",
    Archived:
      "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
        styles[status] ||
        "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "Unknown"}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
      <ShieldCheck size={13} />
      {role || "Teacher"}
    </span>
  );
}

function Avatar({
  teacher,
  size = "lg",
  editable = false,
  onUpload,
}) {
  const sizes = {
    sm: "h-12 w-12 text-sm",
    md: "h-16 w-16 text-lg",
    lg: "h-28 w-28 text-3xl",
    xl: "h-36 w-36 text-4xl",
  };

  return (
    <div className="relative inline-block">
      <div
        className={`${sizes[size]} overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 shadow-xl`}
      >
        {teacher?.photo ? (
          <img
            src={teacher.photo}
            alt={teacher.fullName}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-black text-white">
            {initials(teacher?.fullName)}
          </div>
        )}
      </div>

      {editable && (
        <label className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-4 border-white bg-slate-900 text-white shadow-lg transition hover:scale-105 hover:bg-blue-600">
          <Camera size={17} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUpload}
          />
        </label>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  iconClass = "bg-blue-50 text-blue-600",
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs font-medium text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass} transition group-hover:scale-110`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = "",
}) {
  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Icon size={19} />
            </div>
          )}

          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-slate-900">
              {title}
            </h3>

            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-6">{children}</div>
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
        <Icon size={24} />
      </div>

      <h4 className="mt-4 text-sm font-black text-slate-700">
        {title}
      </h4>

      <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function Modal({ open, title, subtitle, onClose, children, width = "max-w-3xl" }) {
  useEffect(() => {
    if (!open) return;

    const handler = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);

    return () =>
      window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <div
        className={`flex max-h-[94vh] w-full ${width} flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);

  const [ready, setReady] = useState(false);

  const [activeTab, setActiveTab] =
    useState("overview");

  const [showEdit, setShowEdit] =
    useState(false);

  const [showAttendance, setShowAttendance] =
    useState(false);

  const [showMenu, setShowMenu] =
    useState(false);

  const [searchActivity, setSearchActivity] =
    useState("");

  const [toast, setToast] = useState(null);

  const [attendanceForm, setAttendanceForm] =
    useState({
      date: todayString(),
      status: "Present",
      note: "",
    });

  const [editForm, setEditForm] =
    useState(null);

  const fileReaderRef = useRef(null);

  /* =====================================================
     LOAD DATA
  ===================================================== */

  useEffect(() => {
    let storedTeachers = readJSON(
      STORAGE_KEYS.teachers,
      null
    );

    if (
      !Array.isArray(storedTeachers) ||
      storedTeachers.length === 0
    ) {
      storedTeachers = DEMO_TEACHERS;
      writeJSON(
        STORAGE_KEYS.teachers,
        storedTeachers
      );
    }

    setTeachers(
      storedTeachers.map(normalizeTeacher)
    );

    const storedStudents = readJSON(
      STORAGE_KEYS.students,
      []
    );

    const storedResults = readJSON(
      STORAGE_KEYS.results,
      []
    );

    const storedAttendance = readJSON(
      STORAGE_KEYS.attendance,
      {}
    );

    const storedAudit = readJSON(
      STORAGE_KEYS.audit,
      []
    );

    setStudents(
      Array.isArray(storedStudents)
        ? storedStudents
        : []
    );

    setResults(
      Array.isArray(storedResults)
        ? storedResults
        : []
    );

    setAttendanceData(storedAttendance || {});

    setAuditLogs(
      Array.isArray(storedAudit)
        ? storedAudit
        : []
    );

    setReady(true);
  }, []);

  /* =====================================================
     TEACHER
  ===================================================== */

  const teacher = useMemo(() => {
    return teachers.find(
      (item) => String(item.id) === String(id)
    );
  }, [teachers, id]);

  /* =====================================================
     RESULTS
  ===================================================== */

  const teacherResults = useMemo(() => {
    if (!teacher) return [];

    return results.filter((result) => {
      const resultTeacherId =
        getResultTeacherId(result);

      const resultTeacherName =
        getResultTeacherName(result);

      return (
        String(resultTeacherId) ===
          String(teacher.id) ||
        String(resultTeacherName).toLowerCase() ===
          String(teacher.fullName).toLowerCase()
      );
    });
  }, [results, teacher]);

  /* =====================================================
     ATTENDANCE
  ===================================================== */

  const teacherAttendanceRecords = useMemo(() => {
    if (!teacher) return [];

    const records = [];

    if (Array.isArray(attendanceData)) {
      attendanceData.forEach((item) => {
        if (
          String(
            item.teacherId || item.teacher_id
          ) === String(teacher.id)
        ) {
          records.push({
            ...item,
            date:
              item.date ||
              item.attendanceDate,
          });
        }
      });
    } else if (
      attendanceData &&
      typeof attendanceData === "object"
    ) {
      Object.entries(attendanceData).forEach(
        ([dateKey, day]) => {
          if (!day) return;

          const record =
            day?.records?.[teacher.id] ||
            day?.records?.[String(teacher.id)];

          if (record) {
            records.push({
              ...record,
              date:
                record.date ||
                day.date ||
                dateKey,
            });
          }
        }
      );
    }

    return records
      .filter((item) => item.date)
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );
  }, [attendanceData, teacher]);

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
        total: 0,
        percentage: 0,
      };

      teacherAttendanceRecords.forEach(
        (record) => {
          const status =
            String(record.status || "").toLowerCase();

          if (status === "present")
            summary.present++;

          else if (status === "late")
            summary.late++;

          else if (status === "absent")
            summary.absent++;

          else if (status === "leave")
            summary.leave++;

          summary.total++;
        }
      );

      summary.percentage = summary.total
        ? Math.round(
            ((summary.present + summary.late) /
              summary.total) *
              100
          )
        : 0;

      return summary;
    }

    return teacher.attendance;
  }, [
    teacher,
    teacherAttendanceRecords,
  ]);

  /* =====================================================
     CLASSES / STUDENTS
  ===================================================== */

  const assignedClasses = useMemo(() => {
    if (!teacher) return [];

    return unique([
      ...(teacher.classes || []),
      teacher.classTeacherOf,
    ]);
  }, [teacher]);

  const assignedStudents = useMemo(() => {
    if (!teacher) return [];

    if (!students.length) return [];

    return students.filter((student) => {
      const className = getStudentClass(student);

      return assignedClasses.includes(className);
    });
  }, [
    students,
    assignedClasses,
    teacher,
  ]);

  const studentsByClass = useMemo(() => {
    const result = {};

    assignedClasses.forEach((className) => {
      result[className] =
        assignedStudents.filter(
          (student) =>
            getStudentClass(student) ===
            className
        ).length;
    });

    return result;
  }, [
    assignedClasses,
    assignedStudents,
  ]);

  /* =====================================================
     PERFORMANCE
  ===================================================== */

  const performance = useMemo(() => {
    const scores = teacherResults
      .map(getResultScore)
      .filter((score) => score >= 0);

    const average = scores.length
      ? Math.round(
          scores.reduce(
            (sum, score) => sum + score,
            0
          ) / scores.length
        )
      : safeNumber(
          teacher?.performance?.average
        );

    const subjectMap = {};

    teacherResults.forEach((result) => {
      const subject =
        getResultSubject(result);

      if (!subjectMap[subject]) {
        subjectMap[subject] = {
          subject,
          count: 0,
          total: 0,
        };
      }

      subjectMap[subject].count++;
      subjectMap[subject].total +=
        getResultScore(result);
    });

    const subjects = Object.values(
      subjectMap
    )
      .map((item) => ({
        ...item,
        average: item.count
          ? Math.round(
              item.total / item.count
            )
          : 0,
      }))
      .sort(
        (a, b) => b.average - a.average
      );

    return {
      average,
      submitted: teacherResults.length,
      subjects,
    };
  }, [teacherResults, teacher]);

  /* =====================================================
     ACTIVITY
  ===================================================== */

  const activityFeed = useMemo(() => {
    if (!teacher) return [];

    const activities = [];

    (teacher.activity || []).forEach(
      (item) => {
        activities.push({
          ...item,
          timestamp:
            item.timestamp ||
            item.createdAt ||
            teacher.updatedAt,
        });
      }
    );

    auditLogs
      .filter((log) => {
        return (
          String(
            log.teacherId ||
              log.entityId ||
              log.targetId
          ) === String(teacher.id)
        );
      })
      .forEach((log) => {
        activities.push({
          id: log.id || uid(),
          title:
            log.action ||
            log.title ||
            "System activity",
          description:
            log.description ||
            log.details ||
            "",
          type: "audit",
          timestamp:
            log.timestamp ||
            log.createdAt ||
            teacher.updatedAt,
        });
      });

    teacherResults.slice(0, 20).forEach(
      (result) => {
        activities.push({
          id:
            `result-${result.id || uid()}`,
          title: "Result submitted",
          description: `${getResultSubject(
            result
          )} result was recorded.`,
          type: "result",
          timestamp:
            result.submittedAt ||
            result.updatedAt ||
            result.createdAt,
        });
      }
    );

    teacherAttendanceRecords
      .slice(0, 20)
      .forEach((record) => {
        activities.push({
          id:
            `attendance-${record.date}-${record.status}`,
          title: `Attendance: ${
            record.status || "Recorded"
          }`,
          description:
            record.note ||
            `Attendance recorded for ${formatDate(
              record.date
            )}.`,
          type: "attendance",
          timestamp: record.date,
        });
      });

    const seen = new Set();

    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp || 0) -
          new Date(a.timestamp || 0)
      )
      .filter((item) => {
        const key = `${item.title}-${item.timestamp}-${item.description}`;

        if (seen.has(key)) return false;

        seen.add(key);

        return true;
      });
  }, [
    teacher,
    auditLogs,
    teacherResults,
    teacherAttendanceRecords,
  ]);

  const filteredActivity = useMemo(() => {
    const search =
      searchActivity.trim().toLowerCase();

    if (!search) {
      return activityFeed;
    }

    return activityFeed.filter((item) =>
      `${item.title} ${item.description}`
        .toLowerCase()
        .includes(search)
    );
  }, [activityFeed, searchActivity]);

  /* =====================================================
     ROLE DESCRIPTION
  ===================================================== */

  const roleDescription = useMemo(() => {
    const descriptions = {
      Teacher:
        "Responsible for classroom teaching, lesson delivery, student support and academic development.",

      "Subject Teacher":
        "Specializes in assigned subjects and manages lesson delivery, assessments and academic results.",

      "Form Master":
        "Responsible for the assigned class, including attendance, discipline, communication and student welfare.",

      Staff:
        "Provides administrative, operational or school support services.",

      "Head Teacher":
        "Provides academic and operational leadership for the assigned school section.",

      "Senior Teacher":
        "Supports teaching quality, mentoring and academic coordination.",

      Coordinator:
        "Coordinates an academic department, program or school activity.",

      Administrator:
        "Handles school administration, records, coordination and operational responsibilities.",
    };

    return (
      descriptions[teacher?.role] ||
      descriptions.Teacher
    );
  }, [teacher]);

  /* =====================================================
     TOAST
  ===================================================== */

  const showToast = (message, type = "success") => {
    setToast({
      id: uid(),
      message,
      type,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  /* =====================================================
     EDIT FORM
  ===================================================== */

  const createEditForm = (item) => ({
    ...item,

    subjects: [...(item.subjects || [])],

    classes: [...(item.classes || [])],

    emergencyContact: {
      ...(item.emergencyContact || {}),
    },
  });

  const openEdit = () => {
    if (!teacher) return;

    setEditForm(createEditForm(teacher));

    setShowEdit(true);

    setShowMenu(false);
  };

  const updateEditField = (field, value) => {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleEditArray = (
    field,
    value
  ) => {
    setEditForm((current) => {
      const values = Array.isArray(
        current[field]
      )
        ? current[field]
        : [];

      const exists = values.includes(value);

      return {
        ...current,
        [field]: exists
          ? values.filter(
              (item) => item !== value
            )
          : [...values, value],
      };
    });
  };

  const updateEmergency = (
    field,
    value
  ) => {
    setEditForm((current) => ({
      ...current,
      emergencyContact: {
        ...(current.emergencyContact || {}),
        [field]: value,
      },
    }));
  };

  /* =====================================================
     PHOTO
  ===================================================== */

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(
        "Please select an image file.",
        "error"
      );

      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      showToast(
        "Image must be smaller than 4MB.",
        "error"
      );

      return;
    }

    const reader = new FileReader();

    fileReaderRef.current = reader;

    reader.onload = () => {
      updateEditField(
        "photo",
        reader.result
      );
    };

    reader.readAsDataURL(file);
  };

  /* =====================================================
     SAVE TEACHER
  ===================================================== */

  const saveTeacher = () => {
    if (!teacher || !editForm) return;

    if (!editForm.fullName?.trim()) {
      showToast(
        "Teacher name is required.",
        "error"
      );

      return;
    }

    if (!editForm.role) {
      showToast(
        "Please select a teacher role.",
        "error"
      );

      return;
    }

    if (
      editForm.role === "Form Master" &&
      !editForm.classTeacherOf
    ) {
      showToast(
        "Select the class assigned to this Form Master.",
        "error"
      );

      return;
    }

    const conflict =
      editForm.role === "Form Master" &&
      editForm.classTeacherOf
        ? teachers.find(
            (item) =>
              String(item.id) !==
                String(teacher.id) &&
              item.status !== "Archived" &&
              item.classTeacherOf ===
                editForm.classTeacherOf
          )
        : null;

    if (conflict) {
      const proceed = window.confirm(
        `${conflict.fullName} is already the Form Master for ${editForm.classTeacherOf}. Do you want to reassign the class?`
      );

      if (!proceed) return;
    }

    const updatedTeacher = normalizeTeacher({
      ...teacher,
      ...editForm,

      fullName:
        editForm.fullName.trim(),

      updatedAt: nowISO(),

      activity: [
        createActivity(
          "Teacher profile updated",
          `Profile information and responsibilities were updated. Role: ${editForm.role}.`,
          "profile"
        ),
        ...(teacher.activity || []),
      ],
    });

    let nextTeachers = teachers.map(
      (item) =>
        String(item.id) ===
        String(teacher.id)
          ? updatedTeacher
          : item
    );

    if (conflict) {
      nextTeachers = nextTeachers.map(
        (item) => {
          if (
            String(item.id) !==
            String(conflict.id)
          ) {
            return item;
          }

          return normalizeTeacher({
            ...item,

            classTeacherOf: "",

            activity: [
              createActivity(
                "Class reassigned",
                `${editForm.classTeacherOf} was reassigned to another Form Master.`,
                "profile"
              ),
              ...(item.activity || []),
            ],

            updatedAt: nowISO(),
          });
        }
      );
    }

    writeJSON(
      STORAGE_KEYS.teachers,
      nextTeachers
    );

    setTeachers(nextTeachers);

    const nextAudit = [
      {
        id: uid(),
        teacherId: teacher.id,
        action: "Teacher profile updated",
        description: `${teacher.fullName}'s profile was updated.`,
        timestamp: nowISO(),
      },
      ...auditLogs,
    ];

    setAuditLogs(nextAudit);

    writeJSON(
      STORAGE_KEYS.audit,
      nextAudit
    );

    setShowEdit(false);

    showToast(
      "Teacher profile updated successfully."
    );
  };

  /* =====================================================
     ATTENDANCE
  ===================================================== */

  const openAttendance = () => {
    if (!teacher) return;

    const todayRecord =
      teacherAttendanceRecords.find(
        (item) =>
          String(item.date).slice(0, 10) ===
          todayString()
      );

    setAttendanceForm({
      date: todayString(),

      status:
        todayRecord?.status ||
        "Present",

      note:
        todayRecord?.note || "",
    });

    setShowAttendance(true);
  };

  const saveAttendance = () => {
    if (!teacher) return;

    const date =
      attendanceForm.date;

    if (!date) {
      showToast(
        "Attendance date is required.",
        "error"
      );

      return;
    }

    const record = {
      teacherId: teacher.id,
      teacherName: teacher.fullName,
      date,
      status: attendanceForm.status,
      note: attendanceForm.note,
      updatedAt: nowISO(),
    };

    let nextAttendance;

    if (
      Array.isArray(attendanceData)
    ) {
      const filtered =
        attendanceData.filter(
          (item) =>
            !(
              String(
                item.teacherId ||
                  item.teacher_id
              ) ===
                String(teacher.id) &&
              String(
                item.date
              ).slice(0, 10) ===
                String(date).slice(0, 10)
            )
        );

      nextAttendance = [
        record,
        ...filtered,
      ];
    } else {
      nextAttendance = {
        ...(attendanceData || {}),
        [date]: {
          ...(
            attendanceData?.[date] ||
            {}
          ),

          date,

          records: {
            ...(
              attendanceData?.[date]
                ?.records || {}
            ),

            [teacher.id]: record,
          },
        },
      };
    }

    writeJSON(
      STORAGE_KEYS.attendance,
      nextAttendance
    );

    setAttendanceData(nextAttendance);

    const activity = createActivity(
      "Attendance recorded",
      `${attendanceForm.status} attendance recorded for ${formatDate(
        date
      )}.`,
      "attendance"
    );

    const nextTeachers =
      teachers.map((item) => {
        if (
          String(item.id) !==
          String(teacher.id)
        ) {
          return item;
        }

        return normalizeTeacher({
          ...item,

          activity: [
            activity,
            ...(item.activity || []),
          ],

          updatedAt: nowISO(),
        });
      });

    setTeachers(nextTeachers);

    writeJSON(
      STORAGE_KEYS.teachers,
      nextTeachers
    );

    setShowAttendance(false);

    showToast(
      "Attendance recorded successfully."
    );
  };

  /* =====================================================
     ARCHIVE / RESTORE
  ===================================================== */

  const archiveTeacher = () => {
    if (!teacher) return;

    const proceed = window.confirm(
      `Archive ${teacher.fullName}? The teacher will remain in the system but will no longer be active.`
    );

    if (!proceed) return;

    const updated = normalizeTeacher({
      ...teacher,

      status: "Archived",

      activity: [
        createActivity(
          "Teacher archived",
          "The teacher profile was archived.",
          "system"
        ),
        ...(teacher.activity || []),
      ],

      updatedAt: nowISO(),
    });

    const nextTeachers =
      teachers.map((item) =>
        String(item.id) ===
        String(teacher.id)
          ? updated
          : item
      );

    setTeachers(nextTeachers);

    writeJSON(
      STORAGE_KEYS.teachers,
      nextTeachers
    );

    setShowMenu(false);

    showToast(
      "Teacher profile archived."
    );
  };

  const restoreTeacher = () => {
    if (!teacher) return;

    const updated = normalizeTeacher({
      ...teacher,

      status: "Active",

      activity: [
        createActivity(
          "Teacher restored",
          "The teacher profile was restored to active status.",
          "system"
        ),
        ...(teacher.activity || []),
      ],

      updatedAt: nowISO(),
    });

    const nextTeachers =
      teachers.map((item) =>
        String(item.id) ===
        String(teacher.id)
          ? updated
          : item
      );

    setTeachers(nextTeachers);

    writeJSON(
      STORAGE_KEYS.teachers,
      nextTeachers
    );

    setShowMenu(false);

    showToast(
      "Teacher restored successfully."
    );
  };

  /* =====================================================
     EXPORT
  ===================================================== */

  const exportProfile = () => {
    if (!teacher) return;

    const data = {
      teacher: {
        name: teacher.fullName,
        staffId: teacher.staffId,
        role: teacher.role,
        position: teacher.position,
        department: teacher.department,
        employmentType:
          teacher.employmentType,
        status: teacher.status,
        qualification:
          teacher.qualification,
        specialization:
          teacher.specialization,
        yearsExperience:
          teacher.yearsExperience,
        email: teacher.email,
        phone: teacher.phone,
        address: teacher.address,
        dateJoined:
          teacher.dateJoined,
        subjects:
          teacher.subjects,
        classes:
          assignedClasses,
        formMasterOf:
          teacher.classTeacherOf,
        students:
          assignedStudents.length,
        attendance:
          attendanceSummary,
        performance,
      },

      exportedAt: nowISO(),
    };

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download = `${teacher.fullName
      .replace(/\s+/g, "-")
      .toLowerCase()}-profile.json`;

    anchor.click();

    URL.revokeObjectURL(url);

    setShowMenu(false);

    showToast(
      "Teacher profile exported."
    );
  };

  /* =====================================================
     PRINT
  ===================================================== */

  const printProfile = () => {
    setShowMenu(false);

    window.setTimeout(() => {
      window.print();
    }, 100);
  };

  /* =====================================================
     LOADING / NOT FOUND
  ===================================================== */

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <UserRound size={25} />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-600">
            Loading teacher profile...
          </p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <UserRound size={28} />
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-900">
            Teacher not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            The teacher profile you are trying to access
            does not exist or has been removed.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/teachers")
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Teachers
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "academic",
      label: "Academic",
      icon: BookOpen,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: CalendarCheck,
    },
    {
      id: "performance",
      label: "Performance",
      icon: BarChart3,
    },
    {
      id: "activity",
      label: "Activity",
      icon: History,
    },
  ];

  return (
    <>
      <div
        id="teacher-profile"
        className="min-h-screen bg-[#f6f8fc] text-slate-900"
      >
        {/* =================================================
            BACKGROUND DECORATION
        ================================================= */}

        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-100/40 blur-3xl" />
        </div>

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="no-print sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate("/teachers")
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="hidden min-w-0 sm:block">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <span>School</span>
                  <ChevronRight size={13} />
                  <span>Teachers</span>
                  <ChevronRight size={13} />
                  <span className="truncate text-slate-600">
                    Profile
                  </span>
                </div>

                <h1 className="mt-0.5 truncate text-sm font-black text-slate-900">
                  Teacher Profile
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openAttendance}
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 md:flex"
              >
                <CalendarCheck size={17} />
                Attendance
              </button>

              <button
                type="button"
                onClick={openEdit}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-600"
              >
                <Edit3 size={16} />
                <span className="hidden sm:inline">
                  Edit Profile
                </span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowMenu((value) => !value)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                >
                  <MoreHorizontal size={19} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                    <button
                      type="button"
                      onClick={printProfile}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Printer size={16} />
                      Print profile
                    </button>

                    <button
                      type="button"
                      onClick={exportProfile}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Download size={16} />
                      Export profile
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    {teacher.status ===
                    "Archived" ? (
                      <button
                        type="button"
                        onClick={restoreTeacher}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                      >
                        <RotateCcw size={16} />
                        Restore teacher
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={archiveTeacher}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                        Archive teacher
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {/* =================================================
              PROFILE HERO
          ================================================= */}

          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6 text-white shadow-2xl sm:p-8 lg:p-10">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <div className="flex justify-center lg:block">
                <Avatar
                  teacher={teacher}
                  size="xl"
                />
              </div>

              <div className="min-w-0 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  <StatusBadge
                    status={teacher.status}
                  />

                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white/90">
                    {teacher.staffId}
                  </span>
                </div>

                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                  {teacher.fullName}
                </h2>

                <p className="mt-2 text-sm font-medium text-blue-100 sm:text-base">
                  {teacher.position ||
                    teacher.role}
                  {teacher.department
                    ? ` • ${teacher.department}`
                    : ""}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/90">
                    <ShieldCheck size={14} />
                    {teacher.role}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/90">
                    <Briefcase size={14} />
                    {teacher.employmentType}
                  </span>

                  {teacher.classTeacherOf && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-200">
                      <School size={14} />
                      Form Master •{" "}
                      {teacher.classTeacherOf}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs text-blue-100/80 lg:justify-start">
                  {teacher.email && (
                    <a
                      href={`mailto:${teacher.email}`}
                      className="inline-flex items-center gap-2 transition hover:text-white"
                    >
                      <Mail size={14} />
                      {teacher.email}
                    </a>
                  )}

                  {teacher.phone && (
                    <a
                      href={`tel:${teacher.phone}`}
                      className="inline-flex items-center gap-2 transition hover:text-white"
                    >
                      <Phone size={14} />
                      {teacher.phone}
                    </a>
                  )}

                  {teacher.address && (
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={14} />
                      {teacher.address}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 lg:w-48 lg:flex-col">
                <button
                  type="button"
                  onClick={openEdit}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-900 transition hover:bg-blue-50"
                >
                  <Edit3 size={16} />
                  Edit profile
                </button>

                <button
                  type="button"
                  onClick={openAttendance}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  <CalendarCheck size={16} />
                  Record attendance
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              KPI GRID
          ================================================= */}

          <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              icon={BookOpen}
              label="Subjects"
              value={
                teacher.subjects?.length || 0
              }
              subtitle="Assigned subjects"
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              icon={School}
              label="Classes"
              value={assignedClasses.length}
              subtitle="Teaching assignments"
              iconClass="bg-violet-50 text-violet-600"
            />

            <StatCard
              icon={Users}
              label="Students"
              value={assignedStudents.length}
              subtitle="Across assigned classes"
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              icon={CalendarCheck}
              label="Attendance"
              value={`${attendanceSummary.percentage || 0}%`}
              subtitle={`${attendanceSummary.present} present`}
              iconClass="bg-amber-50 text-amber-600"
            />

            <StatCard
              icon={TrendingUp}
              label="Results"
              value={`${performance.average || 0}%`}
              subtitle={`${performance.submitted} submitted`}
              iconClass="bg-indigo-50 text-indigo-600"
            />
          </section>

          {/* =================================================
              TABS
          ================================================= */}

          <div className="no-print mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
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
                      setActiveTab(tab.id)
                    }
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
            <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
              <div className="space-y-5">
                <SectionCard
                  title="Professional profile"
                  subtitle="Teacher information and responsibilities"
                  icon={UserCheck}
                  action={
                    <button
                      type="button"
                      onClick={openEdit}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  }
                >
                  <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                    <InfoItem
                      label="Role"
                      value={teacher.role}
                      icon={ShieldCheck}
                    />

                    <InfoItem
                      label="Position"
                      value={teacher.position}
                      icon={Briefcase}
                    />

                    <InfoItem
                      label="Department"
                      value={teacher.department}
                      icon={School}
                    />

                    <InfoItem
                      label="Employment"
                      value={
                        teacher.employmentType
                      }
                      icon={Briefcase}
                    />

                    <InfoItem
                      label="Qualification"
                      value={
                        teacher.qualification
                      }
                      icon={GraduationCap}
                    />

                    <InfoItem
                      label="Specialization"
                      value={
                        teacher.specialization ||
                        "Not specified"
                      }
                      icon={Star}
                    />

                    <InfoItem
                      label="Experience"
                      value={`${teacher.yearsExperience || 0} years`}
                      icon={Award}
                    />

                    <InfoItem
                      label="Joined school"
                      value={formatDate(
                        teacher.dateJoined
                      )}
                      icon={CalendarDays}
                    />
                  </div>

                  <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <ShieldCheck size={17} />
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-blue-950">
                          Role responsibility
                        </h4>

                        <p className="mt-1 text-sm leading-6 text-blue-900/70">
                          {roleDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Teaching assignments"
                  subtitle="Subjects and classes currently assigned"
                  icon={BookOpen}
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
                        Subjects
                      </p>

                      {teacher.subjects?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {teacher.subjects.map(
                            (subject) => (
                              <span
                                key={subject}
                                className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
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
                      <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
                        Classes
                      </p>

                      {assignedClasses.length ? (
                        <div className="space-y-2">
                          {assignedClasses.map(
                            (className) => (
                              <div
                                key={className}
                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                              >
                                <div className="flex items-center gap-2">
                                  <School
                                    size={16}
                                    className="text-slate-400"
                                  />

                                  <span className="text-sm font-bold text-slate-700">
                                    {className}
                                  </span>

                                  {teacher.classTeacherOf ===
                                    className && (
                                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700">
                                      FORM MASTER
                                    </span>
                                  )}
                                </div>

                                <span className="text-xs font-black text-slate-500">
                                  {studentsByClass[
                                    className
                                  ] || 0}{" "}
                                  students
                                </span>
                              </div>
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
                </SectionCard>

                <SectionCard
                  title="Recent activity"
                  subtitle="Latest teacher-related events"
                  icon={History}
                  action={
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab("activity")
                      }
                      className="text-xs font-bold text-blue-600"
                    >
                      View all
                    </button>
                  }
                >
                  <ActivityList
                    activities={activityFeed.slice(
                      0,
                      5
                    )}
                  />
                </SectionCard>
              </div>

              <div className="space-y-5">
                <SectionCard
                  title="Attendance overview"
                  subtitle="Current attendance record"
                  icon={CalendarCheck}
                  action={
                    <button
                      type="button"
                      onClick={openAttendance}
                      className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                    >
                      Record
                    </button>
                  }
                >
                  <div className="flex items-center gap-5">
                    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white shadow-sm">
                        <span className="text-2xl font-black text-slate-900">
                          {attendanceSummary.percentage ||
                            0}
                          %
                        </span>

                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Attendance
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <AttendanceMini
                        label="Present"
                        value={
                          attendanceSummary.present
                        }
                        className="text-emerald-600"
                      />

                      <AttendanceMini
                        label="Late"
                        value={
                          attendanceSummary.late
                        }
                        className="text-amber-600"
                      />

                      <AttendanceMini
                        label="Absent"
                        value={
                          attendanceSummary.absent
                        }
                        className="text-rose-600"
                      />

                      <AttendanceMini
                        label="Leave"
                        value={
                          attendanceSummary.leave
                        }
                        className="text-blue-600"
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Emergency contact"
                  subtitle="Contact used in urgent situations"
                  icon={Phone}
                >
                  {teacher.emergencyContact?.name ? (
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                          <UserRound size={20} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-black text-slate-900">
                            {
                              teacher
                                .emergencyContact
                                .name
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {
                              teacher
                                .emergencyContact
                                .relationship
                            }
                          </p>
                        </div>
                      </div>

                      <a
                        href={`tel:${teacher.emergencyContact.phone}`}
                        className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
                      >
                        <Phone size={16} />
                        {
                          teacher.emergencyContact
                            .phone
                        }
                      </a>
                    </div>
                  ) : (
                    <EmptyState
                      icon={Phone}
                      title="No emergency contact"
                      description="Add an emergency contact to make this teacher's profile complete."
                    />
                  )}
                </SectionCard>

                <SectionCard
                  title="Notes"
                  subtitle="Internal teacher notes"
                  icon={FileText}
                >
                  {teacher.notes ? (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-amber-950/80">
                        {teacher.notes}
                      </p>
                    </div>
                  ) : (
                    <EmptyState
                      icon={FileText}
                      title="No notes added"
                      description="Use the Edit Profile action to add internal notes."
                    />
                  )}
                </SectionCard>
              </div>
            </div>
          )}

          {/* =================================================
              ACADEMIC
          ================================================= */}

          {activeTab === "academic" && (
            <div className="mt-5 space-y-5">
              <SectionCard
                title="Academic workload"
                subtitle="Detailed teaching responsibilities"
                icon={BookOpen}
              >
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <WorkloadCard
                    icon={BookOpen}
                    label="Subjects"
                    value={
                      teacher.subjects?.length || 0
                    }
                  />

                  <WorkloadCard
                    icon={School}
                    label="Classes"
                    value={assignedClasses.length}
                  />

                  <WorkloadCard
                    icon={Users}
                    label="Students"
                    value={assignedStudents.length}
                  />

                  <WorkloadCard
                    icon={ClipboardCheck}
                    label="Results"
                    value={performance.submitted}
                  />
                </div>
              </SectionCard>

              <div className="grid gap-5 lg:grid-cols-2">
                <SectionCard
                  title="Subject assignments"
                  subtitle="Subjects handled by this teacher"
                  icon={BookOpen}
                >
                  {teacher.subjects?.length ? (
                    <div className="space-y-3">
                      {teacher.subjects.map(
                        (subject, index) => (
                          <div
                            key={subject}
                            className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-700">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-black text-slate-800">
                                {subject}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Assigned teaching subject
                              </p>
                            </div>

                            <CheckCircle2
                              size={18}
                              className="text-emerald-500"
                            />
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={BookOpen}
                      title="No subjects assigned"
                      description="This teacher currently has no subject assignment."
                    />
                  )}
                </SectionCard>

                <SectionCard
                  title="Class assignments"
                  subtitle="Students grouped by class"
                  icon={School}
                >
                  {assignedClasses.length ? (
                    <div className="space-y-3">
                      {assignedClasses.map(
                        (className) => {
                          const count =
                            studentsByClass[
                              className
                            ] || 0;

                          const isFormMaster =
                            teacher.classTeacherOf ===
                            className;

                          return (
                            <div
                              key={className}
                              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                                    <School
                                      size={18}
                                    />
                                  </div>

                                  <div>
                                    <p className="text-sm font-black text-slate-800">
                                      {className}
                                    </p>

                                    {isFormMaster && (
                                      <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">
                                        Form Master
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-lg font-black text-slate-900">
                                    {count}
                                  </p>

                                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                    Students
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                                  style={{
                                    width: `${Math.min(
                                      count * 2,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={School}
                      title="No classes assigned"
                      description="Assign classes to this teacher from the Edit Profile section."
                    />
                  )}
                </SectionCard>
              </div>
            </div>
          )}

          {/* =================================================
              ATTENDANCE
          ================================================= */}

          {activeTab === "attendance" && (
            <div className="mt-5 space-y-5">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <StatCard
                  icon={CheckCircle2}
                  label="Present"
                  value={
                    attendanceSummary.present
                  }
                  iconClass="bg-emerald-50 text-emerald-600"
                />

                <StatCard
                  icon={Clock3}
                  label="Late"
                  value={
                    attendanceSummary.late
                  }
                  iconClass="bg-amber-50 text-amber-600"
                />

                <StatCard
                  icon={XCircle}
                  label="Absent"
                  value={
                    attendanceSummary.absent
                  }
                  iconClass="bg-rose-50 text-rose-600"
                />

                <StatCard
                  icon={Calendar}
                  label="Leave"
                  value={
                    attendanceSummary.leave
                  }
                  iconClass="bg-blue-50 text-blue-600"
                />

                <StatCard
                  icon={TrendingUp}
                  label="Rate"
                  value={`${attendanceSummary.percentage || 0}%`}
                  iconClass="bg-indigo-50 text-indigo-600"
                />
              </div>

              <SectionCard
                title="Attendance history"
                subtitle="Daily attendance records for this teacher"
                icon={CalendarCheck}
                action={
                  <button
                    type="button"
                    onClick={openAttendance}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                  >
                    <CalendarCheck size={15} />
                    Record attendance
                  </button>
                }
              >
                {teacherAttendanceRecords.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-left">
                          <th className="pb-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Date
                          </th>

                          <th className="pb-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Status
                          </th>

                          <th className="pb-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Note
                          </th>

                          <th className="pb-4 text-right text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Recorded
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {teacherAttendanceRecords
                          .slice(0, 50)
                          .map((record, index) => (
                            <tr
                              key={`${record.date}-${index}`}
                              className="border-b border-slate-50 last:border-0"
                            >
                              <td className="py-4 text-sm font-bold text-slate-700">
                                {formatDate(
                                  record.date
                                )}
                              </td>

                              <td className="py-4">
                                <AttendanceBadge
                                  status={
                                    record.status
                                  }
                                />
                              </td>

                              <td className="max-w-sm py-4 text-sm text-slate-500">
                                {record.note ||
                                  "No note"}
                              </td>

                              <td className="py-4 text-right text-xs font-medium text-slate-400">
                                {formatDateTime(
                                  record.updatedAt ||
                                    record.date
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={CalendarCheck}
                    title="No attendance records"
                    description="Start recording attendance for this teacher to build their attendance history."
                  />
                )}
              </SectionCard>
            </div>
          )}

          {/* =================================================
              PERFORMANCE
          ================================================= */}

          {activeTab === "performance" && (
            <div className="mt-5 space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  icon={BarChart3}
                  label="Average score"
                  value={`${performance.average || 0}%`}
                  subtitle="Across recorded results"
                  iconClass="bg-blue-50 text-blue-600"
                />

                <StatCard
                  icon={ClipboardCheck}
                  label="Results submitted"
                  value={
                    performance.submitted
                  }
                  subtitle="Recorded results"
                  iconClass="bg-emerald-50 text-emerald-600"
                />

                <StatCard
                  icon={Award}
                  label="Subjects measured"
                  value={
                    performance.subjects.length
                  }
                  subtitle="With result records"
                  iconClass="bg-violet-50 text-violet-600"
                />
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <SectionCard
                  title="Subject performance"
                  subtitle="Average results by subject"
                  icon={BarChart3}
                >
                  {performance.subjects.length ? (
                    <div className="space-y-5">
                      {performance.subjects.map(
                        (subject) => (
                          <div
                            key={subject.subject}
                          >
                            <div className="mb-2 flex items-center justify-between gap-4">
                              <span className="text-sm font-bold text-slate-700">
                                {subject.subject}
                              </span>

                              <span className="text-sm font-black text-slate-900">
                                {subject.average}%
                              </span>
                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700"
                                style={{
                                  width: `${Math.min(
                                    Math.max(
                                      subject.average,
                                      0
                                    ),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>

                            <p className="mt-1 text-[11px] text-slate-400">
                              {subject.count} result
                              {subject.count !==
                              1
                                ? "s"
                                : ""}{" "}
                              recorded
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={BarChart3}
                      title="No performance data"
                      description="Results submitted by this teacher will appear here."
                    />
                  )}
                </SectionCard>

                <SectionCard
                  title="Result records"
                  subtitle="Latest academic results"
                  icon={ClipboardCheck}
                >
                  {teacherResults.length ? (
                    <div className="space-y-3">
                      {teacherResults
                        .slice(0, 10)
                        .map(
                          (
                            result,
                            index
                          ) => {
                            const score =
                              getResultScore(
                                result
                              );

                            return (
                              <div
                                key={
                                  result.id ||
                                  index
                                }
                                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                    <FileText
                                      size={17}
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-slate-800">
                                      {getResultSubject(
                                        result
                                      )}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                      {formatDate(
                                        result.submittedAt ||
                                          result.createdAt
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-lg font-black text-slate-900">
                                    {score}%
                                  </p>

                                  <p className="text-[10px] font-bold uppercase text-slate-400">
                                    Score
                                  </p>
                                </div>
                              </div>
                            );
                          }
                        )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={ClipboardCheck}
                      title="No result records"
                      description="There are currently no result submissions associated with this teacher."
                    />
                  )}
                </SectionCard>
              </div>
            </div>
          )}

          {/* =================================================
              ACTIVITY
          ================================================= */}

          {activeTab === "activity" && (
            <div className="mt-5">
              <SectionCard
                title="Activity timeline"
                subtitle="Complete history of important teacher events"
                icon={History}
                action={
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={searchActivity}
                      onChange={(event) =>
                        setSearchActivity(
                          event.target.value
                        )
                      }
                      placeholder="Search activity..."
                      className="w-44 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none transition focus:border-blue-300 focus:bg-white sm:w-56"
                    />
                  </div>
                }
              >
                <ActivityList
                  activities={filteredActivity}
                  detailed
                />
              </SectionCard>
            </div>
          )}
        </main>
      </div>

      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit teacher profile"
        subtitle="Update identity, role, assignments and responsibilities."
        width="max-w-5xl"
      >
        {editForm && (
          <div className="space-y-7 p-5 sm:p-7">
            {/* Profile photo */}
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6 sm:flex-row">
              <Avatar
                teacher={editForm}
                size="lg"
                editable
                onUpload={
                  handlePhotoUpload
                }
              />

              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Profile photo
                </h3>

                <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                  Upload a professional photo. JPG, PNG and
                  other common image formats are supported.
                </p>
              </div>
            </div>

            {/* Identity */}
            <FormSection
              title="Personal information"
              icon={UserRound}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field
                  label="Full name"
                  required
                  value={editForm.fullName}
                  onChange={(value) =>
                    updateEditField(
                      "fullName",
                      value
                    )
                  }
                />

                <Field
                  label="Staff ID"
                  value={editForm.staffId}
                  onChange={(value) =>
                    updateEditField(
                      "staffId",
                      value
                    )
                  }
                />

                <SelectField
                  label="Gender"
                  value={editForm.gender}
                  options={[
                    "Male",
                    "Female",
                    "Other",
                    "Not specified",
                  ]}
                  onChange={(value) =>
                    updateEditField(
                      "gender",
                      value
                    )
                  }
                />

                <Field
                  label="Email"
                  type="email"
                  value={editForm.email}
                  onChange={(value) =>
                    updateEditField(
                      "email",
                      value
                    )
                  }
                />

                <Field
                  label="Phone"
                  value={editForm.phone}
                  onChange={(value) =>
                    updateEditField(
                      "phone",
                      value
                    )
                  }
                />

                <Field
                  label="Date of birth"
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(value) =>
                    updateEditField(
                      "dateOfBirth",
                      value
                    )
                  }
                />

                <div className="sm:col-span-2 lg:col-span-3">
                  <Field
                    label="Address"
                    value={editForm.address}
                    onChange={(value) =>
                      updateEditField(
                        "address",
                        value
                      )
                    }
                  />
                </div>
              </div>
            </FormSection>

            {/* Role */}
            <FormSection
              title="Role & employment"
              subtitle="This controls what responsibility is displayed on the teacher profile."
              icon={ShieldCheck}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SelectField
                  label="Teacher role"
                  required
                  value={editForm.role}
                  options={ROLE_OPTIONS}
                  onChange={(value) =>
                    updateEditField(
                      "role",
                      value
                    )
                  }
                />

                <Field
                  label="Position"
                  value={editForm.position}
                  onChange={(value) =>
                    updateEditField(
                      "position",
                      value
                    )
                  }
                />

                <SelectField
                  label="Status"
                  value={editForm.status}
                  options={STATUS_OPTIONS}
                  onChange={(value) =>
                    updateEditField(
                      "status",
                      value
                    )
                  }
                />

                <SelectField
                  label="Department"
                  value={editForm.department}
                  options={DEPARTMENTS}
                  onChange={(value) =>
                    updateEditField(
                      "department",
                      value
                    )
                  }
                />

                <SelectField
                  label="Employment type"
                  value={
                    editForm.employmentType
                  }
                  options={EMPLOYMENT_OPTIONS}
                  onChange={(value) =>
                    updateEditField(
                      "employmentType",
                      value
                    )
                  }
                />

                <Field
                  label="Date joined"
                  type="date"
                  value={editForm.dateJoined}
                  onChange={(value) =>
                    updateEditField(
                      "dateJoined",
                      value
                    )
                  }
                />

                <Field
                  label="Years of experience"
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

                <Field
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

                <Field
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
              </div>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>
                    <p className="text-xs font-black text-blue-900">
                      Selected role
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-800/70">
                      {
                        {
                          Teacher:
                            "General classroom teacher responsibilities.",
                          "Subject Teacher":
                            "Responsible for specific subjects and their academic results.",
                          "Form Master":
                            "Responsible for a specific class and its student welfare.",
                          Staff:
                            "School support or administrative responsibility.",
                          "Head Teacher":
                            "Leadership responsibilities for a school section.",
                          "Senior Teacher":
                            "Senior teaching, mentoring and academic responsibilities.",
                          Coordinator:
                            "Coordinates an academic department or school program.",
                          Administrator:
                            "Administrative and operational responsibilities.",
                        }[
                          editForm.role
                        ]
                      }
                    </p>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Subjects */}
            <FormSection
              title="Subject assignments"
              subtitle="Select all subjects this teacher handles."
              icon={BookOpen}
            >
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {SUBJECT_OPTIONS.map(
                  (subject) => {
                    const checked =
                      editForm.subjects?.includes(
                        subject
                      );

                    return (
                      <button
                        type="button"
                        key={subject}
                        onClick={() =>
                          toggleEditArray(
                            "subjects",
                            subject
                          )
                        }
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left text-xs font-bold transition ${
                          checked
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            checked
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {checked && (
                            <Check
                              size={13}
                              strokeWidth={3}
                            />
                          )}
                        </span>

                        {subject}
                      </button>
                    );
                  }
                )}
              </div>
            </FormSection>

            {/* Classes */}
            <FormSection
              title="Class assignments"
              subtitle="Select classes handled by this teacher."
              icon={School}
            >
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {CLASS_OPTIONS.map(
                  (className) => {
                    const checked =
                      editForm.classes?.includes(
                        className
                      );

                    return (
                      <button
                        type="button"
                        key={className}
                        onClick={() =>
                          toggleEditArray(
                            "classes",
                            className
                          )
                        }
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left text-xs font-bold transition ${
                          checked
                            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            checked
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {checked && (
                            <Check
                              size={13}
                              strokeWidth={3}
                            />
                          )}
                        </span>

                        {className}
                      </button>
                    );
                  }
                )}
              </div>

              <div className="mt-5">
                <SelectField
                  label="Form Master / Class Teacher of"
                  value={
                    editForm.classTeacherOf
                  }
                  options={[
                    "",
                    ...CLASS_OPTIONS,
                  ]}
                  onChange={(value) =>
                    updateEditField(
                      "classTeacherOf",
                      value
                    )
                  }
                />

                {editForm.role ===
                  "Form Master" && (
                  <p className="mt-2 text-xs font-medium text-amber-600">
                    A Form Master should have a class
                    assigned here.
                  </p>
                )}
              </div>
            </FormSection>

            {/* Emergency */}
            <FormSection
              title="Emergency contact"
              icon={Phone}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Contact name"
                  value={
                    editForm
                      .emergencyContact
                      ?.name || ""
                  }
                  onChange={(value) =>
                    updateEmergency(
                      "name",
                      value
                    )
                  }
                />

                <Field
                  label="Relationship"
                  value={
                    editForm
                      .emergencyContact
                      ?.relationship || ""
                  }
                  onChange={(value) =>
                    updateEmergency(
                      "relationship",
                      value
                    )
                  }
                />

                <Field
                  label="Phone"
                  value={
                    editForm
                      .emergencyContact
                      ?.phone || ""
                  }
                  onChange={(value) =>
                    updateEmergency(
                      "phone",
                      value
                    )
                  }
                />
              </div>
            </FormSection>

            {/* Notes */}
            <FormSection
              title="Internal notes"
              icon={FileText}
            >
              <textarea
                value={editForm.notes || ""}
                onChange={(event) =>
                  updateEditField(
                    "notes",
                    event.target.value
                  )
                }
                rows={5}
                placeholder="Add private administrative notes about this teacher..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </FormSection>

            {/* Actions */}
            <div className="sticky bottom-0 -mx-5 -mb-5 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/95 p-5 backdrop-blur sm:-mx-7 sm:-mb-7 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={() =>
                  setShowEdit(false)
                }
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveTeacher}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-blue-600"
              >
                <Save size={17} />
                Save changes
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
        title="Record teacher attendance"
        subtitle={`Attendance for ${teacher.fullName}`}
        width="max-w-lg"
      >
        <div className="space-y-6 p-6">
          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
            <Avatar
              teacher={teacher}
              size="md"
            />

            <div>
              <p className="font-black text-slate-900">
                {teacher.fullName}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {teacher.staffId} •{" "}
                {teacher.role}
              </p>
            </div>
          </div>

          <Field
            label="Date"
            type="date"
            value={attendanceForm.date}
            onChange={(value) =>
              setAttendanceForm(
                (current) => ({
                  ...current,
                  date: value,
                })
              )
            }
          />

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
              Attendance status
            </label>

            <div className="grid grid-cols-2 gap-2">
              {ATTENDANCE_STATUSES.map(
                (status) => {
                  const active =
                    attendanceForm.status ===
                    status;

                  return (
                    <button
                      type="button"
                      key={status}
                      onClick={() =>
                        setAttendanceForm(
                          (current) => ({
                            ...current,
                            status,
                          })
                        )
                      }
                      className={`rounded-xl border px-4 py-3 text-sm font-black transition ${
                        active
                          ? status ===
                            "Present"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : status ===
                              "Late"
                            ? "border-amber-300 bg-amber-50 text-amber-700"
                            : status ===
                              "Absent"
                            ? "border-rose-300 bg-rose-50 text-rose-700"
                            : "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
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
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
              Note
            </label>

            <textarea
              value={attendanceForm.note}
              onChange={(event) =>
                setAttendanceForm(
                  (current) => ({
                    ...current,
                    note: event.target.value,
                  })
                )
              }
              rows={4}
              placeholder="Optional attendance note..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                setShowAttendance(false)
              }
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveAttendance}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
            >
              <CheckCircle2 size={17} />
              Save attendance
            </button>
          </div>
        </div>
      </Modal>

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div className="no-print fixed bottom-5 right-5 z-[200] max-w-sm animate-[slideIn_.3s_ease-out]">
          <div
            className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${
              toast.type === "error"
                ? "border-rose-200"
                : "border-emerald-200"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                toast.type === "error"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {toast.type === "error" ? (
                <AlertTriangle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-slate-700"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          PRINT / ANIMATION CSS
      ===================================================== */}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(12px) translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(0);
          }
        }

        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          #teacher-profile {
            background: white !important;
          }

          #teacher-profile main {
            max-width: none !important;
            padding: 0 !important;
          }

          #teacher-profile section {
            box-shadow: none !important;
            break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}

/* =========================================================
   INFO COMPONENTS
========================================================= */

function InfoItem({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-bold text-slate-800">
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
}

function AttendanceMini({
  label,
  value,
  className,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-semibold text-slate-500">
        {label}
      </span>

      <span
        className={`text-sm font-black ${className}`}
      >
        {value}
      </span>
    </div>
  );
}

function AttendanceBadge({ status }) {
  const styles = {
    Present:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    Late:
      "bg-amber-50 text-amber-700 border-amber-200",
    Absent:
      "bg-rose-50 text-rose-700 border-rose-200",
    Leave:
      "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${
        styles[status] ||
        "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function WorkloadCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon size={19} />
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ActivityList({
  activities = [],
  detailed = false,
}) {
  if (!activities.length) {
    return (
      <EmptyState
        icon={History}
        title="No activity yet"
        description="Important teacher actions and academic events will appear here."
      />
    );
  }

  return (
    <div className="relative">
      <div className="absolute bottom-5 left-5 top-5 w-px bg-slate-100" />

      <div className="space-y-1">
        {activities.map(
          (activity, index) => (
            <div
              key={
                activity.id ||
                `${activity.title}-${index}`
              }
              className="relative flex gap-4 rounded-2xl p-3 transition hover:bg-slate-50"
            >
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-blue-50 text-blue-600 shadow-sm">
                {activity.type ===
                "attendance" ? (
                  <CalendarCheck size={15} />
                ) : activity.type ===
                  "result" ? (
                  <ClipboardCheck size={15} />
                ) : activity.type ===
                  "profile" ? (
                  <UserCheck size={15} />
                ) : (
                  <History size={15} />
                )}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-black text-slate-800">
                    {activity.title}
                  </p>

                  <span className="text-[10px] font-semibold text-slate-400">
                    {formatDateTime(
                      activity.timestamp
                    )}
                  </span>
                </div>

                <p
                  className={`mt-1 text-xs leading-5 text-slate-500 ${
                    detailed
                      ? "max-w-3xl"
                      : ""
                  }`}
                >
                  {activity.description ||
                    "No additional details."}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   FORM COMPONENTS
========================================================= */

function FormSection({
  title,
  subtitle,
  icon: Icon,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Icon size={17} />
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900">
              {title}
            </h3>

            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
        {label}
        {required && (
          <span className="ml-1 text-rose-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        min={min}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={
          placeholder || `Enter ${label.toLowerCase()}`
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

function SelectField({
  label,
  required = false,
  value,
  options,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
        {label}
        {required && (
          <span className="ml-1 text-rose-500">
            *
          </span>
        )}
      </label>

      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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