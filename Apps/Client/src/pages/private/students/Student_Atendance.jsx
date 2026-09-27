import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  Info,
  Medal,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserRound,
  UserX,
  X,
  XCircle,
} from "lucide-react";

/* =========================================================
   STUDENT ATTENDANCE + PERFORMANCE CENTER
   =========================================================

   LocalStorage:
   - school_students
   - school_attendance
   - school_results (optional/future compatible)

   Existing attendance structure:

   school_attendance = {
     "2026-09-27": {
       date: "2026-09-27",
       records: {
         "student-id": {
           studentId,
           studentName,
           admissionNo,
           className,
           status: "Present",
           note: "",
           markedAt: "..."
         }
       }
     }
   }

   Student results can currently live inside:
   student.results = [...]

   This component also supports:
   school_results = [...]
   ========================================================= */


/* =========================================================
   CONSTANTS
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
    color: "emerald",
    dot: "bg-emerald-500",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    ring: "ring-emerald-500/20",
    icon: CheckCircle2,
  },

  Absent: {
    label: "Absent",
    color: "red",
    dot: "bg-red-500",
    soft: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    ring: "ring-red-500/20",
    icon: XCircle,
  },

  Late: {
    label: "Late",
    color: "amber",
    dot: "bg-amber-500",
    soft: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    ring: "ring-amber-500/20",
    icon: Clock3,
  },

  Excused: {
    label: "Excused",
    color: "sky",
    dot: "bg-sky-500",
    soft: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    ring: "ring-sky-500/20",
    icon: ShieldCheck,
  },
};


/* =========================================================
   HELPERS
========================================================= */

const pad = (value) => String(value).padStart(2, "0");

const formatDateKey = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
};

const parseDateKey = (key) => {
  if (!key) return null;

  const [year, month, day] = String(key)
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
};

const getMonthKey = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
};

const getDaysInMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate();
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

const formatMonthTitle = (date) => {
  return date.toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });
};

const calculatePercentage = (present, late, total) => {
  if (!total) return 0;

  return Math.round(((present + late) / total) * 100);
};

const getGrade = (score) => {
  const value = Number(score || 0);

  if (value >= 80) return "A";
  if (value >= 70) return "B";
  if (value >= 60) return "C";
  if (value >= 50) return "D";
  if (value >= 45) return "E";

  return "F";
};

const getGradeColor = (grade) => {
  switch (grade) {
    case "A":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "B":
      return "bg-sky-50 text-sky-700 border-sky-200";

    case "C":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "D":
    case "E":
      return "bg-orange-50 text-orange-700 border-orange-200";

    case "F":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const getPerformanceLabel = (average) => {
  const value = Number(average || 0);

  if (value >= 80) {
    return {
      label: "Excellent",
      description:
        "Outstanding academic performance with consistently strong results.",
      className: "text-emerald-600",
      bg: "bg-emerald-50",
    };
  }

  if (value >= 70) {
    return {
      label: "Very Good",
      description:
        "Strong academic performance with good subject consistency.",
      className: "text-sky-600",
      bg: "bg-sky-50",
    };
  }

  if (value >= 60) {
    return {
      label: "Good",
      description:
        "Good academic performance with room for further improvement.",
      className: "text-indigo-600",
      bg: "bg-indigo-50",
    };
  }

  if (value >= 50) {
    return {
      label: "Satisfactory",
      description:
        "The student is meeting the basic academic requirement.",
      className: "text-amber-600",
      bg: "bg-amber-50",
    };
  }

  if (value > 0) {
    return {
      label: "Needs Improvement",
      description:
        "Additional academic support and monitoring may be useful.",
      className: "text-red-600",
      bg: "bg-red-50",
    };
  }

  return {
    label: "No Results",
    description: "Academic results have not been entered yet.",
    className: "text-slate-500",
    bg: "bg-slate-50",
  };
};

const getTermLabel = (term) => {
  const value = String(term || "").toLowerCase();

  if (value.includes("first")) return "First Term";
  if (value.includes("second")) return "Second Term";
  if (value.includes("third")) return "Third Term";

  if (value.includes("1st")) return "First Term";
  if (value.includes("2nd")) return "Second Term";
  if (value.includes("3rd")) return "Third Term";

  return term || "Term";
};

const getTermOrder = (term) => {
  switch (getTermLabel(term)) {
    case "First Term":
      return 1;

    case "Second Term":
      return 2;

    case "Third Term":
      return 3;

    default:
      return 99;
  }
};

const escapeCSV = (value) => {
  const text = String(value ?? "");

  return `"${text.replace(/"/g, '""')}"`;
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function StudentAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* =======================================================
     STATE
  ======================================================= */

  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [externalResults, setExternalResults] = useState([]);

  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(
    new Date()
  );

  const [selectedTerm, setSelectedTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);

  const [activePerformanceView, setActivePerformanceView] =
    useState("subjects");

  /* =======================================================
     LOAD STUDENT + ATTENDANCE + OPTIONAL RESULTS
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

      const resultData = JSON.parse(
        localStorage.getItem("school_results") || "[]"
      );

      const foundStudent = students.find(
        (item) => String(item.id) === String(id)
      );

      setStudent(foundStudent || null);
      setAttendance(
        attendanceData && typeof attendanceData === "object"
          ? attendanceData
          : {}
      );

      setExternalResults(
        Array.isArray(resultData) ? resultData : []
      );
    } catch (error) {
      console.error(
        "Failed to load student performance:",
        error
      );

      setStudent(null);
      setAttendance({});
      setExternalResults([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* =======================================================
     STUDENT NAME
  ======================================================= */

  const studentName = useMemo(() => {
    if (!student) return "Unnamed Student";

    return (
      student.fullName ||
      [
        student.firstName,
        student.middleName,
        student.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      "Unnamed Student"
    );
  }, [student]);

  /* =======================================================
     AVATAR
  ======================================================= */

  const avatar = useMemo(() => {
    if (student?.photo) return student.photo;

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      studentName
    )}&background=0f172a&color=fff&bold=true`;
  }, [student, studentName]);

  /* =======================================================
     NORMALIZE RESULTS
  ======================================================= */

  const normalizedResults = useMemo(() => {
    if (!student) return [];

    const studentResults = Array.isArray(student.results)
      ? student.results
      : [];

    /*
      Future-compatible structure:

      school_results could contain:
      {
        studentId,
        session,
        term,
        subjects: [...]
      }
    */

    const matchingExternalResults = externalResults.filter(
      (result) =>
        String(result.studentId) === String(student.id)
    );

    const combined = [
      ...studentResults,
      ...matchingExternalResults,
    ];

    /*
      Prevent duplicate result records when the same result
      has been copied to both places.
    */

    const seen = new Set();

    return combined
      .map((result, index) => {
        if (!result) return null;

        const subjects = Array.isArray(result.subjects)
          ? result.subjects
          : [];

        const normalizedSubjects = subjects.map(
          (subject) => {
            const ca1 = Number(subject.ca1 || 0);
            const ca2 = Number(subject.ca2 || 0);
            const exam = Number(subject.exam || 0);

            const calculatedTotal =
              subject.total !== undefined
                ? Number(subject.total || 0)
                : ca1 + ca2 + exam;

            return {
              ...subject,
              subject:
                subject.subject ||
                subject.name ||
                "Unnamed Subject",

              code: subject.code || "",

              ca1,
              ca2,
              exam,

              total: calculatedTotal,

              grade:
                subject.grade ||
                getGrade(calculatedTotal),

              gradePoint:
                subject.gradePoint !== undefined
                  ? subject.gradePoint
                  : null,

              position:
                subject.position !== undefined
                  ? subject.position
                  : "—",

              classAverage:
                subject.classAverage !== undefined
                  ? Number(subject.classAverage || 0)
                  : 0,
            };
          }
        );

        const calculatedAverage =
          normalizedSubjects.length > 0
            ? Math.round(
                normalizedSubjects.reduce(
                  (sum, subject) =>
                    sum + Number(subject.total || 0),
                  0
                ) / normalizedSubjects.length
              )
            : 0;

        const normalized = {
          ...result,

          id:
            result.id ||
            `${result.session || "session"}-${
              result.term || "term"
            }-${index}`,

          session:
            result.session ||
            student.session ||
            "Current Session",

          term: getTermLabel(result.term),

          subjects: normalizedSubjects,

          average:
            result.average !== undefined
              ? Number(result.average || 0)
              : calculatedAverage,

          position:
            result.position !== undefined
              ? result.position
              : "—",

          classSize:
            result.classSize !== undefined
              ? Number(result.classSize || 0)
              : 0,

          classAverage:
            result.classAverage !== undefined
              ? Number(result.classAverage || 0)
              : 0,

          attendance:
            result.attendance !== undefined
              ? Number(result.attendance || 0)
              : 0,

          teacherRemark:
            result.teacherRemark ||
            result.remark ||
            "",

          principalRemark:
            result.principalRemark || "",
        };

        const uniqueKey = `${normalized.session}-${normalized.term}`;

        if (seen.has(uniqueKey)) {
          return null;
        }

        seen.add(uniqueKey);

        return normalized;
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          getTermOrder(a.term) -
          getTermOrder(b.term)
      );
  }, [student, externalResults]);

  /* =======================================================
     AVAILABLE TERMS
  ======================================================= */

  const availableTerms = useMemo(() => {
    return normalizedResults.map((result) => result.term);
  }, [normalizedResults]);

  /* =======================================================
     DEFAULT TERM
  ======================================================= */

  useEffect(() => {
    if (!normalizedResults.length) {
      setSelectedTerm("");
      return;
    }

    const stillExists = normalizedResults.some(
      (result) => result.term === selectedTerm
    );

    if (!selectedTerm || !stillExists) {
      setSelectedTerm(
        normalizedResults[normalizedResults.length - 1].term
      );
    }
  }, [normalizedResults, selectedTerm]);

  /* =======================================================
     SELECTED RESULT
  ======================================================= */

  const selectedResult = useMemo(() => {
    if (!selectedTerm) return null;

    return (
      normalizedResults.find(
        (result) => result.term === selectedTerm
      ) || null
    );
  }, [normalizedResults, selectedTerm]);

  /* =======================================================
     ATTENDANCE RECORDS
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
     OVERALL ATTENDANCE STATISTICS
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
      if (record.status === STATUS.PRESENT) {
        result.present++;
      }

      if (record.status === STATUS.ABSENT) {
        result.absent++;
      }

      if (record.status === STATUS.LATE) {
        result.late++;
      }

      if (record.status === STATUS.EXCUSED) {
        result.excused++;
      }
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
     MONTHLY ATTENDANCE
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
      if (record.status === STATUS.PRESENT) {
        result.present++;
      }

      if (record.status === STATUS.ABSENT) {
        result.absent++;
      }

      if (record.status === STATUS.LATE) {
        result.late++;
      }

      if (record.status === STATUS.EXCUSED) {
        result.excused++;
      }
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
     FILTERED ATTENDANCE HISTORY
  ======================================================= */

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      const matchesSearch =
        !query ||
        record.date.toLowerCase().includes(query) ||
        record.status?.toLowerCase().includes(query) ||
        record.note?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [records, statusFilter, search]);

  /* =======================================================
     ATTENDANCE CALENDAR
  ======================================================= */

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);

    const startingDay = firstDay.getDay();

    const daysInMonth = getDaysInMonth(
      year,
      month
    );

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

      const record =
        attendance[key]?.records?.[student?.id];

      cells.push({
        empty: false,
        day,
        key,
        record,
      });
    }

    return cells;
  }, [
    currentMonth,
    attendance,
    student,
  ]);

  /* =======================================================
     SUBJECT ANALYSIS
  ======================================================= */

  const subjectAnalysis = useMemo(() => {
    if (!selectedResult?.subjects?.length) {
      return {
        strongest: null,
        weakest: null,
        passed: 0,
        failed: 0,
        average: 0,
      };
    }

    const subjects = selectedResult.subjects;

    const sorted = [...subjects].sort(
      (a, b) =>
        Number(b.total || 0) -
        Number(a.total || 0)
    );

    const passed = subjects.filter(
      (subject) =>
        Number(subject.total || 0) >= 50
    ).length;

    const failed =
      subjects.length - passed;

    const average = Math.round(
      subjects.reduce(
        (sum, subject) =>
          sum + Number(subject.total || 0),
        0
      ) / subjects.length
    );

    return {
      strongest: sorted[0] || null,
      weakest:
        sorted[sorted.length - 1] || null,
      passed,
      failed,
      average,
    };
  }, [selectedResult]);

  /* =======================================================
     PERFORMANCE LABEL
  ======================================================= */

  const performance = useMemo(() => {
    return getPerformanceLabel(
      selectedResult?.average || 0
    );
  }, [selectedResult]);

  /* =======================================================
     PERFORMANCE CHANGE
  ======================================================= */

  const performanceChange = useMemo(() => {
    if (!selectedResult) return null;

    const index = normalizedResults.findIndex(
      (result) =>
        result.term === selectedResult.term
    );

    if (index <= 0) return null;

    const previous =
      normalizedResults[index - 1];

    const currentAverage = Number(
      selectedResult.average || 0
    );

    const previousAverage = Number(
      previous.average || 0
    );

    const difference =
      currentAverage - previousAverage;

    return {
      difference,
      previous: previousAverage,
    };
  }, [
    normalizedResults,
    selectedResult,
  ]);

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
     CSV EXPORT
  ======================================================= */

  const exportAttendanceCSV = () => {
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

    const rows = filteredRecords.map(
      (record) => [
        record.date,
        studentName,
        student.admissionNo || "",
        student.className || "",
        record.status || "",
        record.note || "",
        record.markedAt || "",
      ]
    );

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) =>
        row.map(escapeCSV).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `${studentName
      .replace(/\s+/g, "-")
      .toLowerCase()}-attendance.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     PRINT
  ======================================================= */

  const printPage = () => {
    window.print();
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative mx-auto h-14 w-14">
            <div className="absolute inset-0 animate-ping rounded-2xl bg-sky-500/20" />

            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl">
              <GraduationCap size={25} />
            </div>
          </div>

          <p className="mt-5 text-sm font-bold text-slate-600">
            Loading student performance...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Preparing attendance and academic analytics
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     STUDENT NOT FOUND
  ======================================================= */

  if (!student) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <UserX size={30} />
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-900">
            Student Not Found
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            The requested student record could not be found.
          </p>

          <button
            onClick={() => navigate("/students")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <ArrowLeft size={17} />
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 pb-16 print:bg-white">

      {/* ===================================================
          PRINT HEADER
      =================================================== */}

      <div className="hidden print:block">
        <div className="border-b border-slate-300 pb-5">
          <h1 className="text-2xl font-black">
            Student Performance & Attendance Report
          </h1>

          <p className="mt-2 text-sm">
            {studentName}
          </p>

          <p className="mt-1 text-xs">
            {student.admissionNo || "No admission number"} ·{" "}
            {student.className || "Class not assigned"} ·{" "}
            {student.session || "Current Session"}
          </p>
        </div>
      </div>


      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden bg-slate-950 text-white print:hidden">

        {/* Decorative backgrounds */}

        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

          {/* Back */}

          <button
            onClick={() =>
              navigate(`/students/${student.id}`)
            }
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Student Profile
          </button>


          <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">

            {/* Student identity */}

            <div className="flex items-center gap-4 sm:gap-5">

              <div className="relative shrink-0">

                <div className="absolute -inset-1 rounded-[22px] bg-gradient-to-r from-sky-500 to-indigo-500 opacity-60 blur-sm" />

                <img
                  src={avatar}
                  alt={studentName}
                  className="relative h-20 w-20 rounded-[20px] border border-white/20 object-cover shadow-2xl sm:h-24 sm:w-24"
                />

              </div>


              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-300">
                    Student Performance Center
                  </span>

                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                    {student.status || "Active"}
                  </span>

                </div>


                <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                  {studentName}
                </h1>


                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-400">

                  <span>
                    {student.admissionNo ||
                      "No admission number"}
                  </span>

                  <span>
                    {student.className ||
                      "Class not assigned"}
                  </span>

                  {student.section && (
                    <span>
                      {student.section}
                    </span>
                  )}

                  <span>
                    {student.session ||
                      "Current Session"}
                  </span>

                </div>

              </div>

            </div>


            {/* Hero actions */}

            <div className="flex flex-wrap gap-2">

              <button
                onClick={exportAttendanceCSV}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <Download size={16} />
                Export
              </button>

              <button
                onClick={printPage}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                <Printer size={16} />
                Print Report
              </button>

            </div>

          </div>


          {/* Identity pills */}

          <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Class
              </p>

              <p className="mt-1 text-sm font-bold text-white">
                {student.className || "Not assigned"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Section
              </p>

              <p className="mt-1 text-sm font-bold text-white">
                {student.section || "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Session
              </p>

              <p className="mt-1 text-sm font-bold text-white">
                {student.session || "Current Session"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Current Term
              </p>

              <p className="mt-1 text-sm font-bold text-white">
                {selectedTerm || "No result"}
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">


        {/* =================================================
            TOP ATTENDANCE KPIs
        ================================================= */}

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">

          {/* Overall */}

          <div className="group relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-sky-400/10 blur-xl transition group-hover:scale-150" />

            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-sky-600">
                Attendance
              </p>

              <p className="mt-3 text-3xl font-black text-slate-900">
                {statistics.percentage}%
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Effective attendance
              </p>
            </div>

          </div>


          {/* Present */}

          <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="relative">

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
                Present
              </p>

              <p className="mt-3 text-3xl font-black text-slate-900">
                {statistics.present}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Days attended
              </p>

            </div>

          </div>


          {/* Absent */}

          <div className="group relative overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="relative">

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-600">
                Absent
              </p>

              <p className="mt-3 text-3xl font-black text-slate-900">
                {statistics.absent}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Unexcused absence
              </p>

            </div>

          </div>


          {/* Late */}

          <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="relative">

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-600">
                Late
              </p>

              <p className="mt-3 text-3xl font-black text-slate-900">
                {statistics.late}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Late arrivals
              </p>

            </div>

          </div>


          {/* Excused */}

          <div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="relative">

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
                Excused
              </p>

              <p className="mt-3 text-3xl font-black text-slate-900">
                {statistics.excused}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Approved absence
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            ACADEMIC TERM SELECTOR
        ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <GraduationCap size={20} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Academic Session
                  </p>

                  <h2 className="text-xl font-black text-slate-900">
                    Academic Performance
                  </h2>
                </div>

              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Review the student's results, position, subject
                performance and academic progression across terms.
              </p>

            </div>


            <div className="flex flex-wrap gap-2">

              {availableTerms.length === 0 ? (

                <span className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-500">
                  No results available
                </span>

              ) : (

                availableTerms.map((term) => (

                  <button
                    key={term}
                    onClick={() =>
                      setSelectedTerm(term)
                    }
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                      selectedTerm === term
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20"
                        : "border border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                    }`}
                  >
                    {term}
                  </button>

                ))

              )}

            </div>

          </div>


          {selectedResult && (

            <div className="mt-5 flex flex-wrap gap-2">

              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                Session: {selectedResult.session}
              </span>

              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                Class:{" "}
                {student.className ||
                  "Not assigned"}
              </span>

              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                Position:{" "}
                {selectedResult.position}
              </span>

              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                Class size:{" "}
                {selectedResult.classSize ||
                  "—"}
              </span>

            </div>

          )}

        </section>


        {/* =================================================
            ACADEMIC OVERVIEW
        ================================================= */}

        {selectedResult ? (

          <>
            {/* ---------------------------------------------
                MAIN ACADEMIC HERO
            --------------------------------------------- */}

            <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-2xl sm:p-8">

              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

              <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

                <div>

                  <div className="flex items-center gap-2">

                    <Sparkles
                      size={17}
                      className="text-sky-300"
                    />

                    <span className="text-xs font-black uppercase tracking-[0.16em] text-sky-300">
                      {selectedResult.term}
                    </span>

                  </div>

                  <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                    Academic Performance
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                    {performance.description}
                  </p>


                  {/* Performance badge */}

                  <div className="mt-6 flex flex-wrap items-center gap-3">

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-black ${performance.bg} ${performance.className}`}
                    >
                      {performance.label}
                    </span>


                    {performanceChange && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold ${
                          performanceChange.difference >= 0
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border-red-400/20 bg-red-400/10 text-red-300"
                        }`}
                      >
                        {performanceChange.difference >=
                        0 ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}

                        {performanceChange.difference >=
                        0
                          ? "+"
                          : ""}
                        {performanceChange.difference}
                        % from previous term
                      </span>
                    )}

                  </div>

                </div>


                {/* Average */}

                <div className="relative flex items-center justify-center">

                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[14px] border-white/5">

                    <div
                      className="absolute inset-[-14px] rounded-full border-[14px] border-sky-500 transition-all duration-1000"
                      style={{
                        clipPath: `polygon(
                          0 0,
                          100% 0,
                          100% 100%,
                          0 100%
                        )`,
                        opacity:
                          Number(
                            selectedResult.average || 0
                          ) > 0
                            ? 1
                            : 0,
                      }}
                    />

                    <div className="text-center">

                      <p className="text-5xl font-black">
                        {selectedResult.average || 0}
                        <span className="text-2xl">
                          %
                        </span>
                      </p>

                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Overall Average
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </section>


            {/* ---------------------------------------------
                ACADEMIC KPI CARDS
            --------------------------------------------- */}

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">

              {/* Average */}

              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-indigo-600">
                  Average
                </p>

                <p className="mt-3 text-3xl font-black text-slate-900">
                  {selectedResult.average || 0}%
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Overall term score
                </p>

              </div>


              {/* Position */}

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 p-5 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl">

                <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-white/10 blur-xl" />

                <div className="relative">

                  <p className="text-[10px] font-black uppercase tracking-[0.13em] text-white/60">
                    Class Position
                  </p>

                  <div className="mt-2 flex items-end gap-1">

                    <p className="text-4xl font-black">
                      {selectedResult.position ||
                        "—"}
                    </p>

                    {selectedResult.classSize > 0 && (
                      <p className="mb-1 text-sm font-bold text-white/60">
                        /{" "}
                        {selectedResult.classSize}
                      </p>
                    )}

                  </div>

                  <p className="mt-1 text-xs font-medium text-white/70">
                    Current class ranking
                  </p>

                </div>

              </div>


              {/* Class Average */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                  Class Average
                </p>

                <p className="mt-3 text-3xl font-black text-slate-900">
                  {selectedResult.classAverage ||
                    0}
                  %
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Class benchmark
                </p>

              </div>


              {/* Subjects Passed */}

              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-emerald-600">
                  Subjects Passed
                </p>

                <p className="mt-3 text-3xl font-black text-slate-900">

                  {subjectAnalysis.passed}

                  <span className="text-base font-bold text-slate-400">
                    {" "}
                    /{" "}
                    {selectedResult.subjects.length}
                  </span>

                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  {selectedResult.subjects.length
                    ? Math.round(
                        (subjectAnalysis.passed /
                          selectedResult.subjects
                            .length) *
                          100
                      )
                    : 0}
                  % pass rate
                </p>

              </div>


              {/* Term Attendance */}

              <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-sky-600">
                  Term Attendance
                </p>

                <p className="mt-3 text-3xl font-black text-slate-900">
                  {selectedResult.attendance ||
                    monthlyStats.percentage}
                  %
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Academic term
                </p>

              </div>

            </section>


            {/* ---------------------------------------------
                TERM PERFORMANCE ANALYSIS
            --------------------------------------------- */}

            <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

              {/* Term bars */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Academic Progress
                    </p>

                    <h3 className="mt-1 text-xl font-black text-slate-900">
                      Term Performance
                    </h3>

                  </div>

                  <BarChart3
                    size={22}
                    className="text-sky-500"
                  />

                </div>


                <div className="mt-8 space-y-6">

                  {normalizedResults.map(
                    (result, index) => {

                      const score = Math.min(
                        Number(
                          result.average || 0
                        ),
                        100
                      );

                      const isSelected =
                        result.term ===
                        selectedTerm;

                      return (
                        <button
                          key={`${result.session}-${result.term}`}
                          onClick={() =>
                            setSelectedTerm(
                              result.term
                            )
                          }
                          className="group block w-full text-left"
                        >

                          <div className="mb-2 flex items-center justify-between gap-4">

                            <div className="flex items-center gap-3">

                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${
                                  isSelected
                                    ? "bg-slate-950 text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {index + 1}
                              </span>

                              <div>

                                <p className="text-sm font-black text-slate-800">
                                  {result.term}
                                </p>

                                <p className="text-[10px] font-semibold text-slate-400">
                                  Position{" "}
                                  {result.position}
                                </p>

                              </div>

                            </div>


                            <span className="text-sm font-black text-slate-900">
                              {result.average ||
                                0}
                              %
                            </span>

                          </div>


                          <div className="relative h-4 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className={`h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 transition-all duration-1000 ease-out ${
                                isSelected
                                  ? "shadow-lg shadow-sky-500/20"
                                  : ""
                              }`}
                              style={{
                                width: `${score}%`,
                                transitionDelay: `${
                                  index * 150
                                }ms`,
                              }}
                            />

                          </div>


                          <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-400">

                            <span>
                              Class average{" "}
                              {result.classAverage ||
                                0}
                              %
                            </span>

                            <span>
                              {Number(
                                result.average ||
                                  0
                              ) >=
                              Number(
                                result.classAverage ||
                                  0
                              )
                                ? "Above benchmark"
                                : "Below benchmark"}
                            </span>

                          </div>

                        </button>
                      );
                    }
                  )}

                  {!normalizedResults.length && (

                    <div className="rounded-2xl bg-slate-50 p-10 text-center">

                      <GraduationCap
                        size={30}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm font-bold text-slate-500">
                        No academic results available.
                      </p>

                    </div>

                  )}

                </div>

              </div>


              {/* Position analysis */}

              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 p-6 text-white shadow-xl">

                <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

                <div className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/60">
                        Ranking
                      </p>

                      <h3 className="mt-1 text-xl font-black">
                        Class Position
                      </h3>

                    </div>

                    <Medal size={24} />

                  </div>


                  <div className="mt-8 text-center">

                    <div className="inline-flex h-32 w-32 items-center justify-center rounded-full border-8 border-white/10 bg-white/10 backdrop-blur">

                      <div>

                        <p className="text-5xl font-black">
                          {selectedResult.position ||
                            "—"}
                        </p>

                        <p className="mt-1 text-xs font-bold text-white/60">
                          position
                        </p>

                      </div>

                    </div>


                    <p className="mt-5 text-sm font-semibold text-white/70">
                      Out of{" "}
                      <strong className="text-white">
                        {selectedResult.classSize ||
                          "—"}
                      </strong>{" "}
                      students
                    </p>

                  </div>


                  <div className="mt-7 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-white/10 p-4">

                      <p className="text-[10px] font-black uppercase tracking-wider text-white/50">
                        Student
                      </p>

                      <p className="mt-1 text-xl font-black">
                        {selectedResult.average ||
                          0}
                        %
                      </p>

                    </div>


                    <div className="rounded-2xl bg-white/10 p-4">

                      <p className="text-[10px] font-black uppercase tracking-wider text-white/50">
                        Class
                      </p>

                      <p className="mt-1 text-xl font-black">
                        {selectedResult.classAverage ||
                          0}
                        %
                      </p>

                    </div>

                  </div>


                  <div className="mt-4 rounded-2xl bg-white/10 p-4">

                    <p className="text-[10px] font-black uppercase tracking-wider text-white/50">
                      Performance comparison
                    </p>

                    <p className="mt-2 text-sm font-bold">

                      {Number(
                        selectedResult.average ||
                          0
                      ) >=
                      Number(
                        selectedResult.classAverage ||
                          0
                      )
                        ? "The student's average is above the class average."
                        : "The student's average is below the class average."}

                    </p>

                  </div>

                </div>

              </div>

            </section>


            {/* ---------------------------------------------
                SUBJECT PERFORMANCE / INSIGHTS
            --------------------------------------------- */}

            <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">

              {/* Subject analysis */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Subject Analysis
                    </p>

                    <h3 className="mt-1 text-xl font-black text-slate-900">
                      Performance by Subject
                    </h3>

                  </div>


                  <div className="flex rounded-xl bg-slate-100 p-1">

                    <button
                      onClick={() =>
                        setActivePerformanceView(
                          "subjects"
                        )
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                        activePerformanceView ===
                        "subjects"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Scores
                    </button>

                    <button
                      onClick={() =>
                        setActivePerformanceView(
                          "analysis"
                        )
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                        activePerformanceView ===
                        "analysis"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Analysis
                    </button>

                  </div>

                </div>


                {activePerformanceView ===
                "subjects" ? (

                  <div className="mt-7 space-y-5">

                    {selectedResult.subjects.length ===
                    0 ? (

                      <div className="rounded-2xl bg-slate-50 p-10 text-center">

                        <BarChart3
                          size={30}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm font-bold text-slate-500">
                          No subject scores available.
                        </p>

                      </div>

                    ) : (

                      selectedResult.subjects.map(
                        (subject, index) => {

                          const score = Math.min(
                            Number(
                              subject.total || 0
                            ),
                            100
                          );

                          const grade =
                            subject.grade ||
                            getGrade(score);

                          return (
                            <div
                              key={`${subject.subject}-${index}`}
                              className="group"
                            >

                              <div className="mb-2 flex items-center justify-between gap-4">

                                <div className="flex min-w-0 items-center gap-3">

                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-500 transition group-hover:bg-sky-50 group-hover:text-sky-600">
                                    {index + 1}
                                  </div>

                                  <div className="min-w-0">

                                    <p className="truncate text-sm font-black text-slate-800">
                                      {subject.subject}
                                    </p>

                                    {subject.code && (
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {subject.code}
                                      </p>
                                    )}

                                  </div>

                                </div>


                                <div className="flex shrink-0 items-center gap-2">

                                  <span
                                    className={`rounded-lg border px-2 py-1 text-[10px] font-black ${getGradeColor(
                                      grade
                                    )}`}
                                  >
                                    {grade}
                                  </span>

                                  <span className="text-sm font-black text-slate-900">
                                    {score}%
                                  </span>

                                </div>

                              </div>


                              <div className="ml-12 h-3 overflow-hidden rounded-full bg-slate-100">

                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-1000 ease-out"
                                  style={{
                                    width: `${score}%`,
                                    transitionDelay: `${
                                      index * 100
                                    }ms`,
                                  }}
                                />

                              </div>

                            </div>
                          );
                        }
                      )

                    )}

                  </div>

                ) : (

                  <div className="mt-7 grid gap-4 sm:grid-cols-2">

                    {/* Strongest */}

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">

                      <div className="flex items-center justify-between">

                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                          Strongest Subject
                        </p>

                        <Award
                          size={19}
                          className="text-emerald-500"
                        />

                      </div>

                      <p className="mt-4 text-xl font-black text-emerald-950">
                        {subjectAnalysis.strongest
                          ?.subject ||
                          "—"}
                      </p>

                      <p className="mt-1 text-sm font-bold text-emerald-700">
                        {subjectAnalysis.strongest
                          ?.total ?? "—"}
                        % · Grade{" "}
                        {subjectAnalysis.strongest
                          ?.grade ||
                          getGrade(
                            subjectAnalysis
                              .strongest
                              ?.total
                          )}
                      </p>

                    </div>


                    {/* Weakest */}

                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">

                      <div className="flex items-center justify-between">

                        <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                          Needs Attention
                        </p>

                        <TrendingDown
                          size={19}
                          className="text-amber-500"
                        />

                      </div>

                      <p className="mt-4 text-xl font-black text-amber-950">
                        {subjectAnalysis.weakest
                          ?.subject ||
                          "—"}
                      </p>

                      <p className="mt-1 text-sm font-bold text-amber-700">
                        {subjectAnalysis.weakest
                          ?.total ?? "—"}
                        % · Grade{" "}
                        {subjectAnalysis.weakest
                          ?.grade ||
                          getGrade(
                            subjectAnalysis
                              .weakest
                              ?.total
                          )}
                      </p>

                    </div>


                    {/* Pass rate */}

                    <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">

                      <p className="text-[10px] font-black uppercase tracking-wider text-sky-600">
                        Pass Rate
                      </p>

                      <p className="mt-4 text-3xl font-black text-sky-950">
                        {selectedResult.subjects
                          .length
                          ? Math.round(
                              (subjectAnalysis.passed /
                                selectedResult
                                  .subjects
                                  .length) *
                                100
                            )
                          : 0}
                        %
                      </p>

                      <p className="mt-1 text-sm font-semibold text-sky-700">
                        {subjectAnalysis.passed} passed ·{" "}
                        {subjectAnalysis.failed} failed
                      </p>

                    </div>


                    {/* Subject average */}

                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

                      <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                        Subject Average
                      </p>

                      <p className="mt-4 text-3xl font-black text-indigo-950">
                        {subjectAnalysis.average}%
                      </p>

                      <p className="mt-1 text-sm font-semibold text-indigo-700">
                        Average across all subjects
                      </p>

                    </div>

                  </div>

                )}

              </div>


              {/* Performance summary */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Academic Summary
                    </p>

                    <h3 className="mt-1 text-xl font-black text-slate-900">
                      Teacher & School Remarks
                    </h3>

                  </div>

                  <FileText
                    size={22}
                    className="text-sky-500"
                  />

                </div>


                <div className="mt-6 space-y-4">

                  <div className="rounded-2xl bg-slate-50 p-4">

                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Teacher Remark
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">

                      {selectedResult.teacherRemark ||
                        "No teacher remark has been entered for this term."}

                    </p>

                  </div>


                  <div className="rounded-2xl bg-slate-50 p-4">

                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Principal Remark
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">

                      {selectedResult.principalRemark ||
                        "No principal remark has been entered for this term."}

                    </p>

                  </div>


                  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">

                    <div className="flex gap-3">

                      <Info
                        size={18}
                        className="mt-0.5 shrink-0 text-sky-500"
                      />

                      <p className="text-xs leading-5 text-sky-800">

                        This performance dashboard combines
                        the student's subject scores, term
                        average, class benchmark, position and
                        attendance information.

                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </section>


            {/* ---------------------------------------------
                DETAILED SUBJECT TABLE
            --------------------------------------------- */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 p-6">

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Detailed Scores
                    </p>

                    <h3 className="mt-1 text-xl font-black text-slate-900">
                      {selectedResult.term} Subject Results
                    </h3>

                  </div>

                  <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                    {selectedResult.subjects.length} subjects
                  </span>

                </div>

              </div>


              {selectedResult.subjects.length ===
              0 ? (

                <div className="p-12 text-center">

                  <BarChart3
                    size={30}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-bold text-slate-500">
                    No subject results have been entered.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1000px]">

                    <thead>

                      <tr className="bg-slate-50 text-left">

                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Subject
                        </th>

                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          CA 1
                        </th>

                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          CA 2
                        </th>

                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Exam
                        </th>

                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Total
                        </th>

                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Grade
                        </th>

                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Grade Point
                        </th>

                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Position
                        </th>

                      </tr>

                    </thead>


                    <tbody className="divide-y divide-slate-100">

                      {selectedResult.subjects.map(
                        (subject, index) => {

                          const grade =
                            subject.grade ||
                            getGrade(
                              subject.total
                            );

                          return (

                            <tr
                              key={`${subject.subject}-${index}`}
                              className="group transition hover:bg-slate-50"
                            >

                              <td className="px-5 py-4">

                                <div className="flex items-center gap-3">

                                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-500 transition group-hover:bg-sky-50 group-hover:text-sky-600">
                                    {index + 1}
                                  </div>

                                  <div>

                                    <p className="font-bold text-slate-800">
                                      {subject.subject}
                                    </p>

                                    {subject.code && (
                                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {subject.code}
                                      </p>
                                    )}

                                  </div>

                                </div>

                              </td>


                              <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                                {subject.ca1 ?? "—"}
                              </td>

                              <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                                {subject.ca2 ?? "—"}
                              </td>

                              <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                                {subject.exam ?? "—"}
                              </td>


                              <td className="px-5 py-4">

                                <span className="text-base font-black text-slate-900">
                                  {subject.total ??
                                    "—"}
                                </span>

                              </td>


                              <td className="px-5 py-4">

                                <span
                                  className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-black ${getGradeColor(
                                    grade
                                  )}`}
                                >
                                  {grade}
                                </span>

                              </td>


                              <td className="px-5 py-4 text-sm font-bold text-slate-700">
                                {subject.gradePoint ??
                                  "—"}
                              </td>


                              <td className="px-5 py-4">

                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">

                                  <Medal
                                    size={12}
                                  />

                                  {subject.position ??
                                    "—"}

                                </span>

                              </td>

                            </tr>

                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

          </>

        ) : (

          /* =================================================
             NO RESULTS
          ================================================= */

          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">

              <GraduationCap size={30} />

            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900">
              No Academic Results Yet
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Once teachers enter and publish this student's
              results, the student's term average, subjects,
              grades, position and academic analysis will appear
              here.
            </p>

          </section>

        )}


        {/* =================================================
            ATTENDANCE OVERVIEW
        ================================================= */}

        <section className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">

          {/* Ring */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Attendance Overview
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Attendance Health
                </h2>

              </div>

              <UserCheck
                size={22}
                className="text-emerald-500"
              />

            </div>


            <div className="mt-7 flex flex-col items-center">

              <div className="relative h-52 w-52">

                <svg
                  viewBox="0 0 160 160"
                  className="h-full w-full -rotate-90"
                >

                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-slate-100"
                  />

                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeLinecap="round"
                    className="text-sky-500 transition-all duration-1000 ease-out"
                    strokeDasharray={
                      2 * Math.PI * 62
                    }
                    strokeDashoffset={
                      2 *
                        Math.PI *
                        62 -
                      (statistics.percentage /
                        100) *
                        2 *
                        Math.PI *
                        62
                    }
                  />

                </svg>


                <div className="absolute inset-0 flex flex-col items-center justify-center">

                  <span className="text-4xl font-black text-slate-900">
                    {statistics.percentage}%
                  </span>

                  <span className="mt-1 text-xs font-bold text-slate-400">
                    Attendance
                  </span>

                </div>

              </div>


              <p className="mt-5 max-w-sm text-center text-sm leading-6 text-slate-500">
                Effective attendance counts both Present
                and Late days as attended days.
              </p>

            </div>

          </div>


          {/* Monthly */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Monthly Analysis
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {formatMonthTitle(currentMonth)}
                </h2>

              </div>


              <button
                onClick={goToCurrentMonth}
                className="self-start rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Current Month
              </button>

            </div>


            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">

              <div className="rounded-2xl bg-emerald-50 p-4">

                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  Present
                </p>

                <p className="mt-2 text-2xl font-black text-emerald-700">
                  {monthlyStats.present}
                </p>

              </div>


              <div className="rounded-2xl bg-red-50 p-4">

                <p className="text-[10px] font-black uppercase tracking-wider text-red-600">
                  Absent
                </p>

                <p className="mt-2 text-2xl font-black text-red-700">
                  {monthlyStats.absent}
                </p>

              </div>


              <div className="rounded-2xl bg-amber-50 p-4">

                <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                  Late
                </p>

                <p className="mt-2 text-2xl font-black text-amber-700">
                  {monthlyStats.late}
                </p>

              </div>


              <div className="rounded-2xl bg-sky-50 p-4">

                <p className="text-[10px] font-black uppercase tracking-wider text-sky-600">
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


              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-1000"
                  style={{
                    width: `${monthlyStats.percentage}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            ATTENDANCE CALENDAR
        ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <CalendarDays size={21} />
              </div>

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                  Attendance Calendar
                </p>

                <h2 className="text-xl font-black text-slate-900">
                  {formatMonthTitle(currentMonth)}
                </h2>

              </div>

            </div>


            <div className="flex items-center gap-2">

              <button
                onClick={previousMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={nextMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <ChevronRight size={18} />
              </button>

            </div>

          </div>


          {/* Legend */}

          <div className="mt-5 flex flex-wrap gap-3 border-b border-slate-100 pb-5">

            {Object.entries(STATUS_META).map(
              ([status, meta]) => (

                <div
                  key={status}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-500"
                >

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${meta.dot}`}
                  />

                  {status}

                </div>

              )
            )}

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
                    className="min-h-[65px] rounded-xl sm:min-h-[92px]"
                  />
                );

              }


              const status =
                cell.record?.status;

              const meta =
                status
                  ? STATUS_META[status]
                  : null;

              const isToday =
                cell.key ===
                formatDateKey(
                  new Date()
                );


              return (

                <button
                  key={cell.key}
                  onClick={() => {

                    if (!cell.record)
                      return;

                    setSelectedDate(
                      cell.key
                    );

                    setShowDateModal(
                      true
                    );

                  }}
                  className={`group relative min-h-[65px] rounded-xl border p-2 text-left transition-all duration-200 sm:min-h-[92px] ${
                    status
                      ? `${meta.soft} ${meta.border} hover:-translate-y-0.5 hover:shadow-md`
                      : "border-slate-100 bg-slate-50/50 hover:bg-slate-100"
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <span
                      className={`text-xs font-black ${
                        isToday
                          ? "flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white"
                          : status
                          ? meta.text
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

                      <p
                        className={`text-[10px] font-black uppercase tracking-wide ${meta.text}`}
                      >
                        {status}
                      </p>

                      {status ===
                        STATUS.EXCUSED &&
                        cell.record
                          ?.note && (

                          <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">
                            {
                              cell.record
                                .note
                            }
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

                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
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
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search records..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 sm:w-56"
                  />

                </div>


                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-sky-400"
                >

                  <option value="All">
                    All statuses
                  </option>

                  <option value="Present">
                    Present
                  </option>

                  <option value="Absent">
                    Absent
                  </option>

                  <option value="Late">
                    Late
                  </option>

                  <option value="Excused">
                    Excused
                  </option>

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
                Attendance records matching your filters
                will appear here.
              </p>

            </div>

          ) : (

            <>

              {/* Desktop */}

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Date
                      </th>

                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Reason / Note
                      </th>

                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Marked At
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Details
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100">

                    {filteredRecords.map(
                      (record) => (

                        <tr
                          key={record.date}
                          className="transition hover:bg-slate-50"
                        >

                          <td className="px-6 py-4">

                            <p className="text-sm font-bold text-slate-800">
                              {formatLongDate(
                                record.date
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {record.date}
                            </p>

                          </td>


                          <td className="px-6 py-4">

                            {(() => {

                              const meta =
                                STATUS_META[
                                  record.status
                                ];

                              const Icon =
                                meta?.icon;

                              return (

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
                                    meta
                                      ? `${meta.soft} ${meta.text} ${meta.border}`
                                      : "border-slate-200 bg-slate-50 text-slate-500"
                                  }`}
                                >

                                  {Icon && (
                                    <Icon
                                      size={13}
                                    />
                                  )}

                                  {record.status ||
                                    "Not marked"}

                                </span>

                              );

                            })()}

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
                                ).toLocaleString(
                                  "en-NG"
                                )
                              : "-"}

                          </td>


                          <td className="px-6 py-4 text-right">

                            <button
                              onClick={() => {

                                setSelectedDate(
                                  record.date
                                );

                                setShowDateModal(
                                  true
                                );

                              }}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                              View
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>


              {/* Mobile */}

              <div className="space-y-3 p-4 md:hidden">

                {filteredRecords.map(
                  (record) => {

                    const meta =
                      STATUS_META[
                        record.status
                      ];

                    return (

                      <button
                        key={record.date}
                        onClick={() => {

                          setSelectedDate(
                            record.date
                          );

                          setShowDateModal(
                            true
                          );

                        }}
                        className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-sky-200 hover:bg-sky-50/30"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            <p className="text-sm font-black text-slate-800">
                              {formatShortDate(
                                record.date
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {record.date}
                            </p>

                          </div>


                          <span
                            className={`rounded-full border px-2 py-1 text-[10px] font-black ${
                              meta
                                ? `${meta.soft} ${meta.text} ${meta.border}`
                                : "border-slate-200 bg-slate-50 text-slate-500"
                            }`}
                          >
                            {record.status ||
                              "Not marked"}
                          </span>

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

                    );

                  }
                )}

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

              <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                Documentation
              </p>

              <h2 className="text-xl font-black text-slate-900">
                Excused Absences
              </h2>

            </div>

          </div>


          {records.filter(
            (record) =>
              record.status ===
              STATUS.EXCUSED
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
                    record.status ===
                    STATUS.EXCUSED
                )
                .map((record) => (

                  <div
                    key={record.date}
                    className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="text-sm font-black text-slate-800">
                          {formatShortDate(
                            record.date
                          )}
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

      {showDateModal && selectedDate && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() =>
            setShowDateModal(false)
          }
        >

          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >

            {(() => {

              const record =
                attendance[
                  selectedDate
                ]?.records?.[
                  student.id
                ];

              if (!record) return null;

              const meta =
                STATUS_META[
                  record.status
                ];

              const Icon =
                meta?.icon;

              return (

                <>

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Attendance Detail
                      </p>

                      <h3 className="mt-1 text-xl font-black text-slate-900">
                        {formatLongDate(
                          selectedDate
                        )}
                      </h3>

                    </div>


                    <button
                      onClick={() =>
                        setShowDateModal(
                          false
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                    >
                      <X size={18} />
                    </button>

                  </div>


                  <div
                    className={`mt-6 flex items-center justify-between rounded-2xl border p-4 ${
                      meta
                        ? `${meta.soft} ${meta.border}`
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >

                    <span className="text-sm font-bold text-slate-600">
                      Attendance Status
                    </span>


                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${
                        meta
                          ? `${meta.soft} ${meta.text} ${meta.border}`
                          : "border-slate-200 bg-white text-slate-500"
                      }`}
                    >

                      {Icon && (
                        <Icon size={13} />
                      )}

                      {record.status ||
                        "Not marked"}

                    </span>

                  </div>


                  {record.status ===
                    STATUS.EXCUSED && (

                    <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4">

                      <p className="text-[10px] font-black uppercase tracking-wider text-sky-600">
                        Excuse Reason
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {record.note ||
                          "No reason was provided."}
                      </p>

                    </div>

                  )}


                  {record.status !==
                    STATUS.EXCUSED &&
                    record.note && (

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">

                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
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
                        ).toLocaleString(
                          "en-NG"
                        )
                      : "Unknown"}

                  </div>


                  <button
                    onClick={() =>
                      setShowDateModal(
                        false
                      )
                    }
                    className="mt-6 w-full rounded-xl bg-slate-950 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
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