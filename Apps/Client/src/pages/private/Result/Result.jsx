import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Copy,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Medal,
  MoreHorizontal,
  Pencil,
  Printer,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings2,
  Sparkles,
  Split,
  Trophy,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   STORAGE
========================================================= */

const STUDENTS_KEY = "school_students";
const RESULTS_KEY = "school_results";

/* =========================================================
   SCHOOL CONFIGURATION
========================================================= */

const SESSION = "2026/2027";
const TERM = "First Term";

const ASSESSMENT = {
  ca1Max: 20,
  ca2Max: 20,
  examMax: 60,
  rewardMax: 5,
  totalMax: 100,
};

/* =========================================================
   SUBJECTS
========================================================= */

const SUBJECTS = [
  {
    code: "MATH",
    name: "Mathematics",
    short: "Mathematics",
  },
  {
    code: "ENG",
    name: "English Language",
    short: "English",
  },
  {
    code: "BSC",
    name: "Basic Science",
    short: "Basic Science",
  },
  {
    code: "CIV",
    name: "Civic Education",
    short: "Civic Education",
  },
  {
    code: "ICT",
    name: "Computer Studies",
    short: "Computer",
  },
  {
    code: "AGR",
    name: "Agricultural Science",
    short: "Agric. Science",
  },
  {
    code: "SOC",
    name: "Social Studies",
    short: "Social Studies",
  },
  {
    code: "BST",
    name: "Basic Technology",
    short: "Basic Technology",
  },
];

/* =========================================================
   REALISTIC DEMO STUDENTS
========================================================= */

const DEMO_STUDENTS = [
  {
    id: "STU-001",
    admissionNo: "ADM-2026-0001",
    fullName: "Aisha Mohammed",
    firstName: "Aisha",
    lastName: "Mohammed",
    gender: "Female",
    className: "Primary 5",
    section: "Primary",
    status: "Active",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  },

  {
    id: "STU-002",
    admissionNo: "ADM-2026-0002",
    fullName: "Abdullahi Yusuf",
    firstName: "Abdullahi",
    lastName: "Yusuf",
    gender: "Male",
    className: "Primary 5",
    section: "Primary",
    status: "Active",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },

  {
    id: "STU-003",
    admissionNo: "ADM-2026-0003",
    fullName: "Fatima Ali",
    firstName: "Fatima",
    lastName: "Ali",
    gender: "Female",
    className: "Primary 5",
    section: "Primary",
    status: "Active",
    photo:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=80",
  },

  {
    id: "STU-004",
    admissionNo: "ADM-2026-0004",
    fullName: "Ibrahim Musa",
    firstName: "Ibrahim",
    lastName: "Musa",
    gender: "Male",
    className: "Primary 5",
    section: "Primary",
    status: "Active",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },

  {
    id: "STU-005",
    admissionNo: "ADM-2026-0005",
    fullName: "Maryam Sani",
    firstName: "Maryam",
    lastName: "Sani",
    gender: "Female",
    className: "Primary 5",
    section: "Primary",
    status: "Active",
    photo:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80",
  },

  {
    id: "STU-006",
    admissionNo: "ADM-2026-0006",
    fullName: "Usman Ahmed",
    firstName: "Usman",
    lastName: "Ahmed",
    gender: "Male",
    className: "Primary 5",
    section: "Primary",
    status: "Active",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
  },

  {
    id: "STU-007",
    admissionNo: "ADM-2026-0007",
    fullName: "Zainab Garba",
    firstName: "Zainab",
    lastName: "Garba",
    gender: "Female",
    className: "Primary 5",
    status: "Active",
    photo:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80",
  },

  {
    id: "STU-008",
    admissionNo: "ADM-2026-0008",
    fullName: "Musa Abdullahi",
    firstName: "Musa",
    lastName: "Abdullahi",
    gender: "Male",
    className: "Primary 5",
    status: "Active",
    photo:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
  },

  {
    id: "STU-009",
    admissionNo: "ADM-2026-0009",
    fullName: "Hauwa Bello",
    firstName: "Hauwa",
    lastName: "Bello",
    gender: "Female",
    className: "Primary 5",
    status: "Active",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },

  {
    id: "STU-010",
    admissionNo: "ADM-2026-0010",
    fullName: "Sadiq Ibrahim",
    firstName: "Sadiq",
    lastName: "Ibrahim",
    gender: "Male",
    className: "Primary 5",
    status: "Active",
    photo:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
  },
];

/* =========================================================
   DEMO MARKS
========================================================= */

const DEMO_MARKS = {
  "STU-001": {
    MATH: { ca1: 19, ca2: 18, exam: 57, reward: 3 },
    ENG: { ca1: 18, ca2: 19, exam: 55, reward: 3 },
    BSC: { ca1: 18, ca2: 17, exam: 54, reward: 3 },
    CIV: { ca1: 19, ca2: 18, exam: 56, reward: 2 },
    ICT: { ca1: 20, ca2: 18, exam: 58, reward: 3 },
    AGR: { ca1: 17, ca2: 18, exam: 54, reward: 2 },
    SOC: { ca1: 18, ca2: 18, exam: 55, reward: 2 },
    BST: { ca1: 17, ca2: 18, exam: 54, reward: 2 },
  },

  "STU-002": {
    MATH: { ca1: 18, ca2: 17, exam: 54, reward: 2 },
    ENG: { ca1: 17, ca2: 18, exam: 53, reward: 2 },
    BSC: { ca1: 17, ca2: 17, exam: 52, reward: 2 },
    CIV: { ca1: 18, ca2: 17, exam: 53, reward: 2 },
    ICT: { ca1: 18, ca2: 18, exam: 55, reward: 2 },
    AGR: { ca1: 17, ca2: 17, exam: 51, reward: 2 },
    SOC: { ca1: 18, ca2: 17, exam: 53, reward: 2 },
    BST: { ca1: 17, ca2: 17, exam: 52, reward: 2 },
  },

  "STU-003": {
    MATH: { ca1: 17, ca2: 17, exam: 52, reward: 2 },
    ENG: { ca1: 18, ca2: 17, exam: 54, reward: 2 },
    BSC: { ca1: 16, ca2: 17, exam: 51, reward: 2 },
    CIV: { ca1: 17, ca2: 17, exam: 52, reward: 2 },
    ICT: { ca1: 18, ca2: 17, exam: 53, reward: 2 },
    AGR: { ca1: 16, ca2: 16, exam: 50, reward: 2 },
    SOC: { ca1: 17, ca2: 17, exam: 51, reward: 2 },
    BST: { ca1: 16, ca2: 17, exam: 50, reward: 2 },
  },

  "STU-004": {
    MATH: { ca1: 16, ca2: 16, exam: 50, reward: 2 },
    ENG: { ca1: 16, ca2: 17, exam: 49, reward: 2 },
    BSC: { ca1: 16, ca2: 16, exam: 49, reward: 2 },
    CIV: { ca1: 16, ca2: 16, exam: 50, reward: 2 },
    ICT: { ca1: 17, ca2: 16, exam: 51, reward: 2 },
    AGR: { ca1: 15, ca2: 16, exam: 48, reward: 2 },
    SOC: { ca1: 16, ca2: 16, exam: 49, reward: 2 },
    BST: { ca1: 15, ca2: 16, exam: 48, reward: 2 },
  },

  "STU-005": {
    MATH: { ca1: 15, ca2: 15, exam: 47, reward: 1 },
    ENG: { ca1: 16, ca2: 15, exam: 48, reward: 1 },
    BSC: { ca1: 15, ca2: 15, exam: 47, reward: 1 },
    CIV: { ca1: 15, ca2: 16, exam: 48, reward: 1 },
    ICT: { ca1: 16, ca2: 15, exam: 49, reward: 1 },
    AGR: { ca1: 14, ca2: 15, exam: 45, reward: 1 },
    SOC: { ca1: 15, ca2: 15, exam: 46, reward: 1 },
    BST: { ca1: 14, ca2: 15, exam: 46, reward: 1 },
  },

  "STU-006": {
    MATH: { ca1: 15, ca2: 15, exam: 45, reward: 1 },
    ENG: { ca1: 15, ca2: 15, exam: 46, reward: 1 },
    BSC: { ca1: 14, ca2: 15, exam: 45, reward: 1 },
    CIV: { ca1: 15, ca2: 14, exam: 45, reward: 1 },
    ICT: { ca1: 16, ca2: 15, exam: 46, reward: 1 },
    AGR: { ca1: 14, ca2: 14, exam: 44, reward: 1 },
    SOC: { ca1: 15, ca2: 14, exam: 45, reward: 1 },
    BST: { ca1: 14, ca2: 14, exam: 44, reward: 1 },
  },

  "STU-007": {
    MATH: { ca1: 13, ca2: 14, exam: 42, reward: 1 },
    ENG: { ca1: 14, ca2: 14, exam: 44, reward: 1 },
    BSC: { ca1: 13, ca2: 14, exam: 42, reward: 1 },
    CIV: { ca1: 14, ca2: 13, exam: 43, reward: 1 },
    ICT: { ca1: 15, ca2: 14, exam: 44, reward: 1 },
    AGR: { ca1: 13, ca2: 13, exam: 41, reward: 1 },
    SOC: { ca1: 14, ca2: 13, exam: 42, reward: 1 },
    BST: { ca1: 13, ca2: 13, exam: 42, reward: 1 },
  },

  "STU-008": {
    MATH: { ca1: 12, ca2: 13, exam: 40, reward: 1 },
    ENG: { ca1: 13, ca2: 13, exam: 41, reward: 1 },
    BSC: { ca1: 12, ca2: 13, exam: 40, reward: 1 },
    CIV: { ca1: 13, ca2: 13, exam: 41, reward: 1 },
    ICT: { ca1: 14, ca2: 13, exam: 42, reward: 1 },
    AGR: { ca1: 12, ca2: 12, exam: 39, reward: 1 },
    SOC: { ca1: 13, ca2: 12, exam: 40, reward: 1 },
    BST: { ca1: 12, ca2: 13, exam: 39, reward: 1 },
  },

  "STU-009": {
    MATH: { ca1: 11, ca2: 12, exam: 37, reward: 1 },
    ENG: { ca1: 12, ca2: 12, exam: 39, reward: 1 },
    BSC: { ca1: 11, ca2: 12, exam: 38, reward: 1 },
    CIV: { ca1: 12, ca2: 11, exam: 38, reward: 1 },
    ICT: { ca1: 13, ca2: 12, exam: 40, reward: 1 },
    AGR: { ca1: 11, ca2: 11, exam: 37, reward: 1 },
    SOC: { ca1: 12, ca2: 11, exam: 38, reward: 1 },
    BST: { ca1: 11, ca2: 12, exam: 37, reward: 1 },
  },

  "STU-010": {
    MATH: { ca1: 9, ca2: 10, exam: 33, reward: 1 },
    ENG: { ca1: 10, ca2: 11, exam: 35, reward: 1 },
    BSC: { ca1: 10, ca2: 10, exam: 34, reward: 1 },
    CIV: { ca1: 11, ca2: 10, exam: 36, reward: 1 },
    ICT: { ca1: 12, ca2: 10, exam: 37, reward: 1 },
    AGR: { ca1: 9, ca2: 10, exam: 32, reward: 1 },
    SOC: { ca1: 10, ca2: 10, exam: 34, reward: 1 },
    BST: { ca1: 9, ca2: 10, exam: 33, reward: 1 },
  },
};

/* =========================================================
   HELPERS
========================================================= */

const number = (value) => {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const ordinal = (position) => {
  if (!position) return "—";

  if (
    position % 100 >= 11 &&
    position % 100 <= 13
  ) {
    return `${position}th`;
  }

  if (position % 10 === 1)
    return `${position}st`;

  if (position % 10 === 2)
    return `${position}nd`;

  if (position % 10 === 3)
    return `${position}rd`;

  return `${position}th`;
};

const gradeFromScore = (score) => {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  if (score >= 45) return "E";
  return "F";
};

const gradePoint = (grade) => {
  const points = {
    A: 4,
    B: 3,
    C: 2,
    D: 1,
    E: 0.5,
    F: 0,
  };

  return points[grade] ?? 0;
};

const calculateMark = (marks) => {
  const ca1 = Math.min(
    ASSESSMENT.ca1Max,
    Math.max(0, number(marks.ca1))
  );

  const ca2 = Math.min(
    ASSESSMENT.ca2Max,
    Math.max(0, number(marks.ca2))
  );

  const exam = Math.min(
    ASSESSMENT.examMax,
    Math.max(0, number(marks.exam))
  );

  const reward = Math.min(
    ASSESSMENT.rewardMax,
    Math.max(0, number(marks.reward))
  );

  const total = Math.min(
    100,
    ca1 + ca2 + exam + reward
  );

  const grade = gradeFromScore(total);

  return {
    ca1,
    ca2,
    exam,
    reward,
    total,
    grade,
    gradePoint: gradePoint(grade),
  };
};

const emptyMark = () => ({
  ca1: "",
  ca2: "",
  exam: "",
  reward: "",
  total: 0,
  grade: "",
  gradePoint: 0,
});

const complete = (mark) => {
  return (
    mark &&
    mark.ca1 !== "" &&
    mark.ca2 !== "" &&
    mark.exam !== ""
  );
};

const createInitialMatrix = () => {
  const matrix = {};

  DEMO_STUDENTS.forEach((student) => {
    matrix[student.id] = {};

    SUBJECTS.forEach((subject) => {
      const marks =
        DEMO_MARKS[student.id]?.[
          subject.code
        ] || emptyMark();

      matrix[student.id][subject.code] =
        marks.ca1 === ""
          ? marks
          : calculateMark(marks);
    });
  });

  return matrix;
};

const rank = (items, getScore) => {
  const sorted = [...items].sort(
    (a, b) =>
      getScore(b) - getScore(a)
  );

  let currentRank = 0;
  let previousScore = null;

  return sorted.map((item, index) => {
    const score = getScore(item);

    if (
      previousScore === null ||
      score !== previousScore
    ) {
      currentRank = index + 1;
    }

    previousScore = score;

    return {
      ...item,
      position: currentRank,
    };
  });
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Results() {
  const [students, setStudents] =
    useState(DEMO_STUDENTS);

  const [matrix, setMatrix] = useState(
    createInitialMatrix()
  );

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [subjectIndex, setSubjectIndex] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [toast, setToast] =
    useState(null);

  const [showFilters, setShowFilters] =
    useState(false);

  const [showSettings, setShowSettings] =
    useState(false);

  const [status, setStatus] =
    useState("Draft");

  /* =======================================================
     LOAD / SEED STUDENTS
  ======================================================= */

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(
          STUDENTS_KEY
        ) || "null"
      );

      if (
        Array.isArray(stored) &&
        stored.length > 0
      ) {
        const primary5 =
          stored.filter(
            (student) =>
              student.className ===
              "Primary 5"
          );

        if (primary5.length > 0) {
          setStudents(primary5);
          return;
        }
      }

      localStorage.setItem(
        STUDENTS_KEY,
        JSON.stringify(DEMO_STUDENTS)
      );

      setStudents(DEMO_STUDENTS);
    } catch {
      setStudents(DEMO_STUDENTS);
    }
  }, []);

  /* =======================================================
     LOAD / SEED RESULTS
  ======================================================= */

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(
          RESULTS_KEY
        ) || "null"
      );

      if (
        Array.isArray(stored) &&
        stored.length > 0
      ) {
        const loaded = {};

        students.forEach((student) => {
          loaded[student.id] = {};

          SUBJECTS.forEach((subject) => {
            loaded[student.id][
              subject.code
            ] = emptyMark();
          });
        });

        stored
          .filter(
            (result) =>
              result.session === SESSION &&
              result.term === TERM &&
              result.className ===
                "Primary 5"
          )
          .forEach((result) => {
            if (!loaded[result.studentId]) {
              loaded[result.studentId] = {};
            }

            loaded[result.studentId][
              result.subjectCode
            ] = calculateMark(result);
          });

        const hasAny =
          Object.values(loaded).some(
            (subjects) =>
              Object.values(subjects).some(
                (mark) =>
                  mark.ca1 !== ""
              )
          );

        if (hasAny) {
          setMatrix(loaded);
          return;
        }
      }

      const initial =
        createInitialMatrix();

      setMatrix(initial);

      /* Seed school_results too */

      const seeded = [];

      students.forEach((student) => {
        SUBJECTS.forEach((subject) => {
          const mark =
            initial[student.id][
              subject.code
            ];

          seeded.push({
            id: `${student.id}-${subject.code}`,
            studentId: student.id,
            studentName:
              student.fullName,
            admissionNo:
              student.admissionNo,
            className: "Primary 5",
            section: "Primary",
            session: SESSION,
            term: TERM,
            subject:
              subject.name,
            subjectCode:
              subject.code,
            ca1: mark.ca1,
            ca2: mark.ca2,
            exam: mark.exam,
            reward: mark.reward,
            total: mark.total,
            grade: mark.grade,
            gradePoint:
              mark.gradePoint,
            status: "Complete",
            updatedAt:
              new Date().toISOString(),
          });
        });
      });

      localStorage.setItem(
        RESULTS_KEY,
        JSON.stringify(seeded)
      );
    } catch (error) {
      console.error(error);
    }
  }, [students]);

  /* =======================================================
     TOAST
  ======================================================= */

  const notify = (
    message,
    type = "success"
  ) => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  /* =======================================================
     STUDENT SUMMARIES
  ======================================================= */

  const summaries = useMemo(() => {
    const list = students.map((student) => {
      const subjectResults =
        SUBJECTS.map((subject) => {
          const mark =
            matrix[student.id]?.[
              subject.code
            ] || emptyMark();

          const calculated =
            mark.ca1 === ""
              ? mark
              : calculateMark(mark);

          return {
            subject,
            mark: calculated,
            complete:
              complete(calculated),
          };
        });

      const completed =
        subjectResults.filter(
          (item) => item.complete
        );

      const total = completed.reduce(
        (sum, item) =>
          sum + number(item.mark.total),
        0
      );

      const average =
        completed.length > 0
          ? total / completed.length
          : 0;

      const passed =
        completed.filter(
          (item) =>
            item.mark.total >= 50
        ).length;

      const failed =
        completed.filter(
          (item) =>
            item.mark.total < 50
        ).length;

      return {
        student,
        subjectResults,
        completedSubjects:
          completed.length,
        total,
        average,
        passed,
        failed,
        isComplete:
          completed.length ===
          SUBJECTS.length,
      };
    });

    const completeStudents =
      list.filter(
        (item) => item.isComplete
      );

    const ranked = rank(
      completeStudents,
      (item) => item.average
    );

    const positionMap = {};

    ranked.forEach((item) => {
      positionMap[item.student.id] =
        item.position;
    });

    return list.map((item) => ({
      ...item,
      position:
        positionMap[item.student.id] ||
        null,
    }));
  }, [students, matrix]);

  /* =======================================================
     SUBJECT POSITIONS
  ======================================================= */

  const subjectPositions = useMemo(() => {
    const result = {};

    SUBJECTS.forEach((subject) => {
      const entries = students
        .map((student) => {
          const mark =
            matrix[student.id]?.[
              subject.code
            ];

          if (!complete(mark)) {
            return null;
          }

          return {
            studentId: student.id,
            total: number(mark.total),
          };
        })
        .filter(Boolean);

      const ranked = rank(
        entries,
        (item) => item.total
      );

      result[subject.code] = {};

      ranked.forEach((item) => {
        result[subject.code][
          item.studentId
        ] = item.position;
      });
    });

    return result;
  }, [students, matrix]);

  /* =======================================================
     FILTERED STUDENTS
  ======================================================= */

  const filteredStudents = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return summaries
      .filter((item) => {
        const name =
          item.student.fullName
            ?.toLowerCase() || "";

        const admission =
          item.student.admissionNo
            ?.toLowerCase() || "";

        const matchesSearch =
          !query ||
          name.includes(query) ||
          admission.includes(query);

        if (!matchesSearch) {
          return false;
        }

        if (filter === "Complete") {
          return item.isComplete;
        }

        if (filter === "Incomplete") {
          return !item.isComplete;
        }

        if (filter === "Passed") {
          return (
            item.average >= 50
          );
        }

        if (filter === "Failed") {
          return (
            item.average > 0 &&
            item.average < 50
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (
          a.position &&
          b.position
        ) {
          return (
            a.position - b.position
          );
        }

        if (a.position) return -1;
        if (b.position) return 1;

        return (
          b.average - a.average
        );
      });
  }, [
    summaries,
    search,
    filter,
  ]);

  /* =======================================================
     CLASS STATS
  ======================================================= */

  const stats = useMemo(() => {
    const completeStudents =
      summaries.filter(
        (item) => item.isComplete
      );

    const average =
      completeStudents.length
        ? completeStudents.reduce(
            (sum, item) =>
              sum + item.average,
            0
          ) /
          completeStudents.length
        : 0;

    const passed =
      completeStudents.filter(
        (item) =>
          item.average >= 50
      ).length;

    const passRate =
      completeStudents.length
        ? (passed /
            completeStudents.length) *
          100
        : 0;

    const totalRecords =
      students.length *
      SUBJECTS.length;

    const enteredRecords =
      summaries.reduce(
        (sum, item) =>
          sum +
          item.completedSubjects,
        0
      );

    const completionRate =
      totalRecords
        ? (enteredRecords /
            totalRecords) *
          100
        : 0;

    return {
      students:
        students.length,
      complete:
        completeStudents.length,
      incomplete:
        students.length -
        completeStudents.length,
      average,
      passRate,
      completionRate,
    };
  }, [summaries, students]);

  /* =======================================================
     CURRENT MODAL DATA
  ======================================================= */

  const currentSubject =
    SUBJECTS[subjectIndex];

  const currentMark =
    selectedStudent
      ? matrix[selectedStudent.id]?.[
          currentSubject.code
        ] || emptyMark()
      : emptyMark();

  const currentStudentSummary =
    selectedStudent
      ? summaries.find(
          (item) =>
            item.student.id ===
            selectedStudent.id
        )
      : null;

  const currentSubjectPosition =
    selectedStudent
      ? subjectPositions[
          currentSubject.code
        ]?.[selectedStudent.id]
      : null;

  /* =======================================================
     OPEN MODAL
  ======================================================= */

  const openStudent = (student) => {
    setSelectedStudent(student);
    setSubjectIndex(0);
  };

  const closeStudent = () => {
    setSelectedStudent(null);
  };

  /* =======================================================
     UPDATE MARK
  ======================================================= */

  const updateMark = (
    studentId,
    subjectCode,
    field,
    value
  ) => {
    setMatrix((previous) => {
      const studentMarks =
        previous[studentId] || {};

      const current =
        studentMarks[subjectCode] ||
        emptyMark();

      const updated = {
        ...current,
        [field]:
          value === ""
            ? ""
            : Number(value),
      };

      const calculated =
        updated.ca1 === ""
          ? updated
          : calculateMark(
              updated
            );

      return {
        ...previous,

        [studentId]: {
          ...studentMarks,

          [subjectCode]:
            calculated,
        },
      };
    });
  };

  /* =======================================================
     COPY CA1 TO CA2
  ======================================================= */

  const copyCA1 = () => {
    if (!selectedStudent) return;

    const value = Math.min(
      ASSESSMENT.ca2Max,
      number(currentMark.ca1)
    );

    updateMark(
      selectedStudent.id,
      currentSubject.code,
      "ca2",
      value
    );

    notify(
      `CA1 copied to CA2 for ${currentSubject.name}`
    );
  };

  /* =======================================================
     SPLIT CA
  ======================================================= */

  const splitCA = () => {
    if (!selectedStudent) return;

    const totalCA = Math.min(
      ASSESSMENT.ca1Max +
        ASSESSMENT.ca2Max,
      number(currentMark.ca1) +
        number(currentMark.ca2)
    );

    const first = Number(
      (totalCA / 2).toFixed(2)
    );

    const second = Number(
      (totalCA - first).toFixed(2)
    );

    setMatrix((previous) => ({
      ...previous,

      [selectedStudent.id]: {
        ...previous[
          selectedStudent.id
        ],

        [currentSubject.code]:
          calculateMark({
            ...currentMark,
            ca1: first,
            ca2: second,
          }),
      },
    }));

    notify(
      `CA marks split equally for ${currentSubject.name}`
    );
  };

  /* =======================================================
     SAVE RESULTS
  ======================================================= */

  const saveResults = () => {
    try {
      const oldResults =
        JSON.parse(
          localStorage.getItem(
            RESULTS_KEY
          ) || "[]"
        );

      const currentResults = [];

      students.forEach((student) => {
        SUBJECTS.forEach((subject) => {
          const mark =
            matrix[student.id]?.[
              subject.code
            ];

          if (!mark) return;

          const calculated =
            mark.ca1 === ""
              ? mark
              : calculateMark(mark);

          currentResults.push({
            id: `${student.id}-${SESSION}-${TERM}-${subject.code}`,

            studentId:
              student.id,

            studentName:
              student.fullName,

            admissionNo:
              student.admissionNo,

            className:
              student.className,

            section:
              student.section,

            session: SESSION,

            term: TERM,

            subject:
              subject.name,

            subjectCode:
              subject.code,

            ca1:
              calculated.ca1,

            ca2:
              calculated.ca2,

            exam:
              calculated.exam,

            reward:
              calculated.reward,

            total:
              calculated.total,

            grade:
              calculated.grade,

            gradePoint:
              calculated.gradePoint,

            position:
              subjectPositions[
                subject.code
              ]?.[student.id] ||
              null,

            status:
              complete(calculated)
                ? "Complete"
                : "Draft",

            teacherName:
              "Class Teacher",

            updatedAt:
              new Date().toISOString(),
          });
        });
      });

      const otherResults =
        Array.isArray(oldResults)
          ? oldResults.filter(
              (result) =>
                !(
                  result.session ===
                    SESSION &&
                  result.term === TERM &&
                  result.className ===
                    "Primary 5"
                )
            )
          : [];

      const merged = [
        ...otherResults,
        ...currentResults,
      ];

      localStorage.setItem(
        RESULTS_KEY,
        JSON.stringify(merged)
      );

      /* Update student academic data */

      const storedStudents =
        JSON.parse(
          localStorage.getItem(
            STUDENTS_KEY
          ) || "[]"
        );

      if (Array.isArray(storedStudents)) {
        const updatedStudents =
          storedStudents.map(
            (student) => {
              const summary =
                summaries.find(
                  (item) =>
                    item.student.id ===
                    student.id
                );

              if (!summary) {
                return student;
              }

              const resultSubjects =
                SUBJECTS.map(
                  (subject) => {
                    const mark =
                      matrix[
                        student.id
                      ]?.[
                        subject.code
                      ];

                    if (!mark) {
                      return null;
                    }

                    const calculated =
                      mark.ca1 === ""
                        ? mark
                        : calculateMark(
                            mark
                          );

                    return {
                      subject:
                        subject.name,

                      code:
                        subject.code,

                      ca1:
                        calculated.ca1,

                      ca2:
                        calculated.ca2,

                      exam:
                        calculated.exam,

                      reward:
                        calculated.reward,

                      total:
                        calculated.total,

                      grade:
                        calculated.grade,

                      gradePoint:
                        calculated.gradePoint,

                      position:
                        subjectPositions[
                          subject.code
                        ]?.[
                          student.id
                        ] || null,
                    };
                  }
                ).filter(Boolean);

              return {
                ...student,

                academic: {
                  ...(student.academic ||
                    {}),

                  average:
                    summary.average,

                  position:
                    summary.position
                      ? ordinal(
                          summary.position
                        )
                      : "—",

                  classAverage:
                    stats.average,

                  subjects:
                    resultSubjects,
                },

                results:
                  resultSubjects,
              };
            }
          );

        localStorage.setItem(
          STUDENTS_KEY,
          JSON.stringify(
            updatedStudents
          )
        );
      }

      notify(
        "All student results saved successfully"
      );
    } catch (error) {
      console.error(error);

      notify(
        "Failed to save results",
        "error"
      );
    }
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const submitResults = () => {
    if (stats.incomplete > 0) {
      notify(
        `${stats.incomplete} student result(s) are incomplete`,
        "error"
      );
      return;
    }

    saveResults();
    setStatus("Submitted");

    notify(
      "Results submitted for academic review"
    );
  };

  /* =======================================================
     PUBLISH
  ======================================================= */

  const publishResults = () => {
    if (stats.incomplete > 0) {
      notify(
        "Complete all student results before publishing",
        "error"
      );
      return;
    }

    saveResults();
    setStatus("Published");

    notify(
      "Results published successfully"
    );
  };

  /* =======================================================
     CSV
  ======================================================= */

  const exportCSV = () => {
    const headers = [
      "Position",
      "Student",
      "Admission No",
      "Class",
      "Average",
      "Passed",
      "Failed",
      "Status",
    ];

    const rows =
      filteredStudents.map(
        (item) => [
          item.position
            ? ordinal(
                item.position
              )
            : "—",

          item.student.fullName,

          item.student.admissionNo,

          item.student.className,

          item.average.toFixed(2),

          item.passed,

          item.failed,

          item.isComplete
            ? "Complete"
            : "Incomplete",
        ]
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? ""
              ).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      "Primary-5-First-Term-Results.csv";

    anchor.click();

    URL.revokeObjectURL(url);

    notify(
      "Results exported to CSV"
    );
  };

  /* =======================================================
     PRINT
  ======================================================= */

  const printResults = () => {
    window.print();
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .results-fade {
          animation: fadeUp .45s ease both;
        }

        .results-scale {
          animation: scaleIn .25s ease both;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .print-card {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div className="no-print fixed right-5 top-5 z-[200] results-scale">
          <div
            className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-2xl ${
              toast.type === "error"
                ? "border-red-200 text-red-600"
                : "border-emerald-200 text-emerald-600"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}

            <span className="text-sm font-bold">
              {toast.message}
            </span>

            <button
              onClick={() =>
                setToast(null)
              }
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#07111f]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,.18),transparent_35%)]" />

        <div className="relative mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="results-fade">
              <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-sky-400">
                <ClipboardCheck size={16} />
                Academic Results
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Results Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Enter, calculate, review, rank and
                publish the complete academic performance
                of your students.
              </p>
            </div>

            <div className="no-print flex flex-wrap gap-2">
              <button
                onClick={saveResults}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/15"
              >
                <Save size={16} />
                Save
              </button>

              <button
                onClick={submitResults}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-sm font-black text-amber-300 transition hover:bg-amber-400/20"
              >
                <Send size={16} />
                Submit
              </button>

              <button
                onClick={publishResults}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-400"
              >
                <Award size={16} />
                Publish
              </button>
            </div>
          </div>

          {/* =================================================
              CONTEXT
          ================================================= */}

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <ContextCard
              label="Academic Session"
              value={SESSION}
              icon={GraduationCap}
            />

            <ContextCard
              label="Current Term"
              value={TERM}
              icon={BookOpen}
            />

            <button
              onClick={() =>
                setShowSettings(
                  !showSettings
                )
              }
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Assessment
                  </p>

                  <p className="mt-1 text-sm font-black text-white">
                    CA 40 + Exam 60
                  </p>
                </div>

                <Settings2
                  size={19}
                  className="text-sky-400"
                />
              </div>
            </button>
          </div>

          {showSettings && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="grid gap-4 sm:grid-cols-4">
                <AssessmentInfo
                  label="CA1"
                  value="20"
                />

                <AssessmentInfo
                  label="CA2"
                  value="20"
                />

                <AssessmentInfo
                  label="Exam"
                  value="60"
                />

                <AssessmentInfo
                  label="Reward"
                  value="5"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Stat
            icon={Users}
            title="Students"
            value={stats.students}
            subtitle="Class register"
          />

          <Stat
            icon={CheckCircle2}
            title="Completed"
            value={stats.complete}
            subtitle={`${stats.incomplete} incomplete`}
            iconBox="bg-emerald-50 text-emerald-600"
          />

          <Stat
            icon={BarChart3}
            title="Class Average"
            value={`${stats.average.toFixed(
              1
            )}%`}
            subtitle="Overall performance"
            iconBox="bg-sky-50 text-sky-600"
          />

          <Stat
            icon={Trophy}
            title="Pass Rate"
            value={`${stats.passRate.toFixed(
              0
            )}%`}
            subtitle="Students above 50%"
            iconBox="bg-amber-50 text-amber-600"
          />

          <Stat
            icon={ClipboardCheck}
            title="Completion"
            value={`${stats.completionRate.toFixed(
              0
            )}%`}
            subtitle="Marks entered"
            iconBox="bg-violet-50 text-violet-600"
          />
        </div>

        {/* =================================================
            TOP INFORMATION
        ================================================= */}

        <div className="mt-6 rounded-3xl border border-sky-100 bg-sky-50 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-3">
              <div className="rounded-2xl bg-white p-3 text-sky-500 shadow-sm">
                <Sparkles size={20} />
              </div>

              <div>
                <h2 className="font-black text-slate-900">
                  Primary 5 — First Term Results
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Students are automatically sorted by
                  overall average. Equal averages receive
                  the same position.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge
                status={status}
              />

              {stats.incomplete > 0 && (
                <span className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-black text-amber-700">
                  {stats.incomplete} incomplete
                </span>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            RESULT REGISTER
        ================================================= */}

        <section className="print-card mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* TOOLBAR */}

          <div className="no-print border-b border-slate-100 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Student Result Register
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Click “Enter Marks” to open the complete
                  subject-by-subject marks workspace.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search student..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-400 focus:bg-white sm:w-64"
                  />
                </div>

                <button
                  onClick={() =>
                    setShowFilters(
                      !showFilters
                    )
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black ${
                    showFilters
                      ? "border-sky-200 bg-sky-50 text-sky-600"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <Filter size={16} />
                  Filters
                </button>

                <button
                  onClick={exportCSV}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50"
                >
                  <Download size={16} />
                  CSV
                </button>

                <button
                  onClick={printResults}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50"
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {[
                  "All",
                  "Complete",
                  "Incomplete",
                  "Passed",
                  "Failed",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setFilter(item)
                    }
                    className={`rounded-xl px-4 py-2 text-xs font-black ${
                      filter === item
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1250px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Position
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Student
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Average
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Performance
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Passed
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Failed
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Completion
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Activity
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(
                  (item) => (
                    <DesktopStudentRow
                      key={
                        item.student.id
                      }
                      item={item}
                      onEdit={
                        openStudent
                      }
                    />
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================
              MOBILE
          ================================================= */}

          <div className="space-y-3 p-4 lg:hidden">
            {filteredStudents.map(
              (item) => (
                <MobileStudentCard
                  key={item.student.id}
                  item={item}
                  onEdit={openStudent}
                />
              )
            )}
          </div>

          {filteredStudents.length ===
            0 && (
            <div className="p-16 text-center">
              <Users
                size={34}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-black text-slate-700">
                No students found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Change your search or filter.
              </p>
            </div>
          )}

          <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-400">
            Showing{" "}
            <strong className="text-slate-700">
              {filteredStudents.length}
            </strong>{" "}
            students
          </div>
        </section>

        {/* =================================================
            SUBJECT ANALYTICS
        ================================================= */}

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <SubjectAnalytics
            students={students}
            matrix={matrix}
          />

          <PerformancePanel
            summaries={summaries}
          />
        </section>
      </main>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {selectedStudent && (
        <MarksModal
          student={selectedStudent}
          summary={
            currentStudentSummary
          }
          subject={currentSubject}
          subjectIndex={subjectIndex}
          mark={currentMark}
          subjectPosition={
            currentSubjectPosition
          }
          onClose={closeStudent}
          onPrevious={() =>
            setSubjectIndex(
              Math.max(
                0,
                subjectIndex - 1
              )
            )
          }
          onNext={() =>
            setSubjectIndex(
              Math.min(
                SUBJECTS.length - 1,
                subjectIndex + 1
              )
            )
          }
          onSelectSubject={
            setSubjectIndex
          }
          onChange={(
            field,
            value
          ) =>
            updateMark(
              selectedStudent.id,
              currentSubject.code,
              field,
              value
            )
          }
          onCopyCA1={copyCA1}
          onSplitCA={splitCA}
          onSave={() =>
            notify(
              `${currentSubject.name} marks saved`
            )
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   CONTEXT CARD
========================================================= */

function ContextCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/10 p-2 text-sky-400">
          <Icon size={18} />
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-sm font-black text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ASSESSMENT INFO
========================================================= */

function AssessmentInfo({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="text-[10px] font-black uppercase text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-white">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  icon: Icon,
  title,
  value,
  subtitle,
  iconBox = "bg-slate-100 text-slate-600",
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <div
          className={`h-fit rounded-2xl p-3 ${iconBox}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const styles = {
    Draft:
      "bg-slate-100 text-slate-600",
    Submitted:
      "bg-amber-100 text-amber-700",
    Published:
      "bg-emerald-100 text-emerald-700",
  };

  return (
    <span
      className={`rounded-xl px-3 py-2 text-xs font-black ${
        styles[status] ||
        styles.Draft
      }`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   DESKTOP ROW
========================================================= */

function DesktopStudentRow({
  item,
  onEdit,
}) {
  const student = item.student;

  const percentage =
    (item.completedSubjects /
      SUBJECTS.length) *
    100;

  return (
    <tr className="group transition hover:bg-slate-50">
      {/* POSITION */}

      <td className="px-5 py-4">
        {item.position ? (
          <PositionBadge
            position={item.position}
          />
        ) : (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-400">
            —
          </span>
        )}
      </td>

      {/* STUDENT */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <StudentAvatar
            student={student}
          />

          <div>
            <p className="text-sm font-black text-slate-900">
              {student.fullName}
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400">
                {student.admissionNo}
              </span>

              <span className="h-1 w-1 rounded-full bg-slate-300" />

              <span className="text-[10px] font-bold text-slate-400">
                {student.className}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* AVERAGE */}

      <td className="px-5 py-4">
        <p className="text-lg font-black text-slate-900">
          {item.average.toFixed(2)}%
        </p>

        <p className="mt-1 text-[10px] font-black uppercase text-slate-400">
          {item.completedSubjects}/
          {SUBJECTS.length} subjects
        </p>
      </td>

      {/* PERFORMANCE */}

      <td className="px-5 py-4">
        <PerformanceBadge
          average={item.average}
        />
      </td>

      {/* PASSED */}

      <td className="px-5 py-4">
        <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600">
          {item.passed}
        </span>
      </td>

      {/* FAILED */}

      <td className="px-5 py-4">
        <span
          className={`rounded-lg px-3 py-1.5 text-xs font-black ${
            item.failed
              ? "bg-red-50 text-red-600"
              : "bg-slate-50 text-slate-400"
          }`}
        >
          {item.failed}
        </span>
      </td>

      {/* COMPLETION */}

      <td className="px-5 py-4">
        <div className="w-28">
          <div className="mb-1 flex justify-between">
            <span className="text-[10px] font-bold text-slate-400">
              {item.completedSubjects}/
              {SUBJECTS.length}
            </span>

            <span className="text-[10px] font-bold text-slate-400">
              {Math.round(
                percentage
              )}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                item.isComplete
                  ? "bg-emerald-500"
                  : "bg-sky-500"
              }`}
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>
      </td>

      {/* ACTIVITY */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          {item.isComplete ? (
            <CheckCircle2
              size={16}
              className="text-emerald-500"
            />
          ) : (
            <Clock3
              size={16}
              className="text-amber-500"
            />
          )}

          <span className="text-xs font-semibold text-slate-500">
            {item.isComplete
              ? "Result ready"
              : "Marks pending"}
          </span>
        </div>
      </td>

      {/* ACTION */}

      <td className="px-5 py-4 text-right">
        <button
          onClick={() =>
            onEdit(student)
          }
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-sky-600"
        >
          <Edit3 size={14} />

          {item.completedSubjects
            ? "Edit Marks"
            : "Enter Marks"}
        </button>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function MobileStudentCard({
  item,
  onEdit,
}) {
  const percentage =
    (item.completedSubjects /
      SUBJECTS.length) *
    100;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <StudentAvatar
            student={item.student}
          />

          <div>
            <p className="text-sm font-black text-slate-900">
              {item.student.fullName}
            </p>

            <p className="mt-1 text-[10px] font-bold text-slate-400">
              {item.student.admissionNo}
            </p>
          </div>
        </div>

        {item.position && (
          <PositionBadge
            position={item.position}
          />
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniStat
          label="Average"
          value={`${item.average.toFixed(
            2
          )}%`}
        />

        <MiniStat
          label="Passed"
          value={item.passed}
        />

        <MiniStat
          label="Failed"
          value={item.failed}
        />

        <MiniStat
          label="Subjects"
          value={`${item.completedSubjects}/${SUBJECTS.length}`}
        />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[10px] font-bold text-slate-400">
          <span>Result Completion</span>

          <span>
            {Math.round(
              percentage
            )}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-sky-500"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>

      <button
        onClick={() =>
          onEdit(item.student)
        }
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-xs font-black text-white"
      >
        <Edit3 size={14} />
        Enter / Edit Marks
      </button>
    </div>
  );
}

/* =========================================================
   STUDENT AVATAR
========================================================= */

function StudentAvatar({
  student,
}) {
  const [failed, setFailed] =
    useState(false);

  if (
    student.photo &&
    !failed
  ) {
    return (
      <img
        src={student.photo}
        alt={student.fullName}
        onError={() =>
          setFailed(true)
        }
        className="h-12 w-12 rounded-2xl object-cover shadow-sm ring-2 ring-white"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-xs font-black text-sky-600">
      {initials(
        student.fullName
      )}
    </div>
  );
}

/* =========================================================
   POSITION
========================================================= */

function PositionBadge({
  position,
}) {
  let classes =
    "bg-slate-100 text-slate-600";

  if (position === 1) {
    classes =
      "bg-amber-100 text-amber-700";
  }

  if (position === 2) {
    classes =
      "bg-slate-200 text-slate-700";
  }

  if (position === 3) {
    classes =
      "bg-orange-100 text-orange-700";
  }

  return (
    <div
      className={`flex h-10 min-w-10 items-center justify-center gap-1 rounded-xl px-2 text-xs font-black ${classes}`}
    >
      {position <= 3 && (
        <Medal size={14} />
      )}

      {ordinal(position)}
    </div>
  );
}

/* =========================================================
   PERFORMANCE
========================================================= */

function PerformanceBadge({
  average,
}) {
  let label = "Needs Review";
  let classes =
    "bg-slate-100 text-slate-500";

  if (average >= 80) {
    label = "Excellent";
    classes =
      "bg-emerald-50 text-emerald-600";
  } else if (average >= 70) {
    label = "Very Good";
    classes =
      "bg-sky-50 text-sky-600";
  } else if (average >= 60) {
    label = "Good";
    classes =
      "bg-indigo-50 text-indigo-600";
  } else if (average >= 50) {
    label = "Pass";
    classes =
      "bg-amber-50 text-amber-600";
  } else if (average > 0) {
    label = "Needs Improvement";
    classes =
      "bg-red-50 text-red-600";
  }

  return (
    <span
      className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase ${classes}`}
    >
      {label}
    </span>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[9px] font-black uppercase text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SUBJECT ANALYTICS
========================================================= */

function SubjectAnalytics({
  students,
  matrix,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900">
            Subject Performance
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Average performance across all subjects.
          </p>
        </div>

        <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
          <BarChart3 size={19} />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {SUBJECTS.map(
          (subject) => {
            const values =
              students
                .map(
                  (student) =>
                    matrix[
                      student.id
                    ]?.[
                      subject.code
                    ]
                )
                .filter(
                  (mark) =>
                    complete(mark)
                )
                .map(
                  (mark) =>
                    number(
                      mark.total
                    )
                );

            const average =
              values.length
                ? values.reduce(
                    (sum, value) =>
                      sum + value,
                    0
                  ) /
                  values.length
                : 0;

            return (
              <div
                key={subject.code}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-700">
                      {subject.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {values.length}/
                      {students.length} recorded
                    </p>
                  </div>

                  <span className="text-sm font-black text-slate-900">
                    {average.toFixed(1)}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      average >= 70
                        ? "bg-emerald-500"
                        : average >= 50
                        ? "bg-sky-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        average
                      )}%`,
                    }}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PERFORMANCE PANEL
========================================================= */

function PerformancePanel({
  summaries,
}) {
  const excellent =
    summaries.filter(
      (item) =>
        item.average >= 80
    ).length;

  const veryGood =
    summaries.filter(
      (item) =>
        item.average >= 70 &&
        item.average < 80
    ).length;

  const pass =
    summaries.filter(
      (item) =>
        item.average >= 50 &&
        item.average < 70
    ).length;

  const needs =
    summaries.filter(
      (item) =>
        item.average > 0 &&
        item.average < 50
    ).length;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-black text-slate-900">
          Class Performance
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Student performance distribution.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <PerformanceDistribution
          label="Excellent"
          value={excellent}
          total={summaries.length}
          color="bg-emerald-500"
        />

        <PerformanceDistribution
          label="Very Good"
          value={veryGood}
          total={summaries.length}
          color="bg-sky-500"
        />

        <PerformanceDistribution
          label="Pass"
          value={pass}
          total={summaries.length}
          color="bg-amber-500"
        />

        <PerformanceDistribution
          label="Needs Improvement"
          value={needs}
          total={summaries.length}
          color="bg-red-500"
        />
      </div>

      <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
        <div className="flex items-center gap-3">
          <Trophy
            size={21}
            className="text-amber-400"
          />

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
              Top Student
            </p>

            <p className="mt-1 text-sm font-black">
              {summaries[0]?.student
                ?.fullName ||
                "No result"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {summaries[0]?.average
                ? `${summaries[0].average.toFixed(
                    2
                  )}% average`
                : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PERFORMANCE DISTRIBUTION
========================================================= */

function PerformanceDistribution({
  label,
  value,
  total,
  color,
}) {
  const percentage = total
    ? (value / total) * 100
    : 0;

  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span className="text-xs font-bold text-slate-600">
          {label}
        </span>

        <span className="text-xs font-black text-slate-800">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   MARKS MODAL
========================================================= */

function MarksModal({
  student,
  summary,
  subject,
  subjectIndex,
  mark,
  subjectPosition,
  onClose,
  onPrevious,
  onNext,
  onSelectSubject,
  onChange,
  onCopyCA1,
  onSplitCA,
  onSave,
}) {
  const isComplete =
    complete(mark);

  return (
    <div className="no-print fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] bg-white shadow-2xl">
        {/* HEADER */}

        <div className="bg-slate-950 p-5 text-white sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StudentAvatar
                student={student}
              />

              <div>
                <p className="text-lg font-black">
                  {student.fullName}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {student.admissionNo} ·{" "}
                  {student.className}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl bg-white/10 p-2 text-slate-300 hover:bg-white/15 hover:text-white"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* SUBJECT NAVIGATION */}

        <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
          <div className="flex gap-2 overflow-x-auto">
            {SUBJECTS.map(
              (item, index) => {
                const itemMark =
                  summary?.subjectResults?.find(
                    (result) =>
                      result.subject
                        .code ===
                      item.code
                  )?.mark;

                const done =
                  complete(itemMark);

                return (
                  <button
                    key={item.code}
                    onClick={() =>
                      onSelectSubject(
                        index
                      )
                    }
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black transition ${
                      subjectIndex ===
                      index
                        ? "bg-slate-950 text-white"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {done && (
                      <Check
                        size={12}
                        className={
                          subjectIndex ===
                          index
                            ? "text-emerald-400"
                            : "text-emerald-500"
                        }
                      />
                    )}

                    {item.short}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* BODY */}

        <div className="overflow-y-auto p-5 sm:p-7">
          <div className="grid gap-7 lg:grid-cols-[1fr_300px]">
            {/* LEFT */}

            <div>
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.18em] text-sky-500">
                    Subject{" "}
                    {subjectIndex + 1} of{" "}
                    {SUBJECTS.length}
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    {subject.name}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Enter and review marks for this
                    subject.
                  </p>
                </div>

                {isComplete && (
                  <span className="hidden items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-600 sm:flex">
                    <CheckCircle2 size={15} />
                    Complete
                  </span>
                )}
              </div>

              {/* MARK INPUTS */}

              <div className="grid gap-4 sm:grid-cols-2">
                <MarkInput
                  label="CA 1"
                  helper="Continuous Assessment"
                  value={mark.ca1}
                  max={20}
                  onChange={(value) =>
                    onChange(
                      "ca1",
                      value
                    )
                  }
                />

                <MarkInput
                  label="CA 2"
                  helper="Continuous Assessment"
                  value={mark.ca2}
                  max={20}
                  onChange={(value) =>
                    onChange(
                      "ca2",
                      value
                    )
                  }
                />

                <MarkInput
                  label="Exam"
                  helper="Final Examination"
                  value={mark.exam}
                  max={60}
                  onChange={(value) =>
                    onChange(
                      "exam",
                      value
                    )
                  }
                />

                <MarkInput
                  label="Reward"
                  helper="Bonus / Behaviour / Merit"
                  value={mark.reward}
                  max={5}
                  onChange={(value) =>
                    onChange(
                      "reward",
                      value
                    )
                  }
                />
              </div>

              {/* CA TOOLS */}

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-800">
                      Continuous Assessment Tools
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Quickly distribute marks when only
                      one CA has been entered.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={onCopyCA1}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[11px] font-black text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
                    >
                      <Copy size={14} />
                      Copy CA1 → CA2
                    </button>

                    <button
                      onClick={onSplitCA}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[11px] font-black text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
                    >
                      <Split size={14} />
                      Split CA Equally
                    </button>
                  </div>
                </div>
              </div>

              {/* CALCULATION */}

              <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                      Automatic Calculation
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      CA1 + CA2 + Exam + Reward
                    </p>
                  </div>

                  <Calculator
                    size={20}
                    className="text-sky-400"
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Calc
                    label="CA Total"
                    value={`${(
                      number(
                        mark.ca1
                      ) +
                      number(
                        mark.ca2
                      )
                    ).toFixed(2)}`}
                  />

                  <Calc
                    label="Exam"
                    value={`${number(
                      mark.exam
                    ).toFixed(2)}`}
                  />

                  <Calc
                    label="Reward"
                    value={`${number(
                      mark.reward
                    ).toFixed(2)}`}
                  />

                  <Calc
                    label="Total"
                    value={`${number(
                      mark.total
                    ).toFixed(2)}/100`}
                    highlight
                  />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Calc
                    label="Grade"
                    value={
                      mark.grade ||
                      "—"
                    }
                  />

                  <Calc
                    label="GP"
                    value={
                      mark.grade
                        ? mark.gradePoint
                        : "—"
                    }
                  />

                  <Calc
                    label="Subject Position"
                    value={
                      subjectPosition
                        ? ordinal(
                            subjectPosition
                          )
                        : "—"
                    }
                  />
                </div>
              </div>

              {/* NAV */}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between">
                <button
                  disabled={
                    subjectIndex === 0
                  }
                  onClick={
                    onPrevious
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-600 disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  onClick={onSave}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-sky-500/20"
                >
                  <Save size={15} />
                  Save Subject
                </button>

                <button
                  disabled={
                    subjectIndex ===
                    SUBJECTS.length - 1
                  }
                  onClick={onNext}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-600 disabled:opacity-30"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* RIGHT SUMMARY */}

            <aside>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Student Performance
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <StudentAvatar
                    student={student}
                  />

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {student.fullName}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {student.className}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <Summary
                    label="Average"
                    value={
                      summary
                        ? `${summary.average.toFixed(
                            2
                          )}%`
                        : "—"
                    }
                  />

                  <Summary
                    label="Overall Position"
                    value={
                      summary?.position
                        ? ordinal(
                            summary.position
                          )
                        : "—"
                    }
                  />

                  <Summary
                    label="Subjects Passed"
                    value={
                      summary?.passed ??
                      0
                    }
                  />

                  <Summary
                    label="Subjects Failed"
                    value={
                      summary?.failed ??
                      0
                    }
                  />

                  <Summary
                    label="Subjects Complete"
                    value={
                      summary
                        ? `${summary.completedSubjects}/${SUBJECTS.length}`
                        : "0"
                    }
                  />
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-sky-100 bg-sky-50 p-5">
                <div className="flex gap-3">
                  <Zap
                    size={18}
                    className="mt-0.5 shrink-0 text-sky-500"
                  />

                  <div>
                    <p className="text-xs font-black text-slate-800">
                      Automatic ranking
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      The student's subject position
                      updates automatically when the score
                      changes.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* FOOTER */}

        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:justify-between">
            <span>
              Changes are calculated immediately.
            </span>

            <span>
              {SESSION} · {TERM}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MARK INPUT
========================================================= */

function MarkInput({
  label,
  helper,
  value,
  max,
  onChange,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-black text-slate-800">
            {label}
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            {helper}
          </p>
        </div>

        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">
          Max {max}
        </span>
      </div>

      <input
        type="number"
        min="0"
        max={max}
        step="0.01"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder="Enter score"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-black text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
      />
    </div>
  );
}

/* =========================================================
   CALC
========================================================= */

function Calc({
  label,
  value,
  highlight = false,
}) {
  return (
    <div
      className={`rounded-2xl p-3 ${
        highlight
          ? "bg-sky-500"
          : "bg-white/5"
      }`}
    >
      <p
        className={`text-[9px] font-black uppercase tracking-wider ${
          highlight
            ? "text-sky-100"
            : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-white">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function Summary({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
      <span className="text-xs font-semibold text-slate-500">
        {label}
      </span>

      <span className="text-sm font-black text-slate-900">
        {value}
      </span>
    </div>
  );
}