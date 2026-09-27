import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Archive,
  Award,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
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
  FileText,
  Filter,
  GraduationCap,
  Grid2X2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";

const STORAGE_KEY = "school_teachers";
const STUDENTS_KEY = "school_students";

const CURRENT_SESSION = "2026/2027";

const TEACHER_ROLES = [
  "Teacher",
  "Subject Teacher",
  "Form Master",
  "Form Mistress",
  "Class Teacher",
  "Head of Department",
  "Vice Principal",
  "Principal",
  "Staff",
  "Administrator",
];

const EMPLOYMENT_TYPES = [
  "Full Time",
  "Part Time",
  "Contract",
  "Temporary",
  "Volunteer",
];

const TEACHER_STATUSES = [
  "Active",
  "On Leave",
  "Inactive",
  "Archived",
];

const DEPARTMENTS = [
  "Science",
  "Arts",
  "Commercial",
  "ICT",
  "Languages",
  "Humanities",
  "Administration",
  "Primary",
  "Nursery",
  "Sports",
];

const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Basic Science",
  "Basic Technology",
  "Computer Studies",
  "Civic Education",
  "Agricultural Science",
  "Geography",
  "Biology",
  "Chemistry",
  "Physics",
  "Economics",
  "Government",
  "Literature in English",
  "Islamic Religious Studies",
  "Christian Religious Studies",
  "Physical & Health Education",
];

const CLASSES = [
  "Nursery 1",
  "Nursery 2",
  "Nursery 3",
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
];

const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "ST";

const getTeacherPhoto = (teacher) =>
  teacher?.photo ||
  teacher?.photoUrl ||
  teacher?.image ||
  teacher?.avatar ||
  "";

const createTeacherId = () =>
  `TCH-${new Date().getFullYear()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

const DEMO_TEACHERS = [
  {
    id: "teacher-001",
    staffId: "TCH-2026-1001",
    firstName: "Amina",
    middleName: "Abdullahi",
    lastName: "Musa",
    fullName: "Amina Abdullahi Musa",
    gender: "Female",
    phone: "08031234567",
    email: "amina.musa@school.edu.ng",
    address: "Katsina, Nigeria",
    role: "Form Mistress",
    department: "Science",
    employmentType: "Full Time",
    status: "Active",
    qualification: "B.Sc Mathematics",
    experience: "6 years",
    subjects: ["Mathematics", "Basic Science"],
    classes: ["JSS 2", "JSS 3"],
    classTeacherOf: "JSS 2",
    session: CURRENT_SESSION,
    joiningDate: "2021-09-13",
    attendancePercentage: 96,
    performance: 94,
    photo: "https://i.pravatar.cc/200?img=47",
    emergencyContact: {
      name: "Abdullahi Musa",
      phone: "08039876543",
      relationship: "Brother",
    },
    activity: [
      {
        id: uid(),
        title: "Submitted Mathematics results",
        description: "JSS 2 First Term",
        date: "2026-09-25",
      },
      {
        id: uid(),
        title: "Marked attendance",
        description: "JSS 2",
        date: "2026-09-26",
      },
    ],
  },
  {
    id: "teacher-002",
    staffId: "TCH-2026-1002",
    firstName: "Ibrahim",
    middleName: "Yusuf",
    lastName: "Abubakar",
    fullName: "Ibrahim Yusuf Abubakar",
    gender: "Male",
    phone: "08032345678",
    email: "ibrahim.abubakar@school.edu.ng",
    address: "Katsina, Nigeria",
    role: "Subject Teacher",
    department: "Languages",
    employmentType: "Full Time",
    status: "Active",
    qualification: "B.A English",
    experience: "5 years",
    subjects: ["English Language", "Literature in English"],
    classes: ["JSS 1", "JSS 2", "SS 1"],
    classTeacherOf: "",
    session: CURRENT_SESSION,
    joiningDate: "2022-01-10",
    attendancePercentage: 92,
    performance: 89,
    photo: "https://i.pravatar.cc/200?img=12",
    emergencyContact: {
      name: "Fatima Abubakar",
      phone: "08033456789",
      relationship: "Wife",
    },
    activity: [
      {
        id: uid(),
        title: "Created assignment",
        description: "English Language — JSS 2",
        date: "2026-09-24",
      },
    ],
  },
  {
    id: "teacher-003",
    staffId: "TCH-2026-1003",
    firstName: "Fatima",
    middleName: "Sani",
    lastName: "Garba",
    fullName: "Fatima Sani Garba",
    gender: "Female",
    phone: "08033456789",
    email: "fatima.garba@school.edu.ng",
    address: "Katsina, Nigeria",
    role: "Head of Department",
    department: "Humanities",
    employmentType: "Full Time",
    status: "Active",
    qualification: "B.Ed Social Studies",
    experience: "8 years",
    subjects: ["Civic Education", "Geography", "Government"],
    classes: ["JSS 3", "SS 1", "SS 2"],
    classTeacherOf: "SS 1",
    session: CURRENT_SESSION,
    joiningDate: "2018-09-05",
    attendancePercentage: 97,
    performance: 96,
    photo: "https://i.pravatar.cc/200?img=44",
    emergencyContact: {
      name: "Sani Garba",
      phone: "08034567890",
      relationship: "Husband",
    },
    activity: [
      {
        id: uid(),
        title: "Approved departmental results",
        description: "Humanities Department",
        date: "2026-09-23",
      },
    ],
  },
  {
    id: "teacher-004",
    staffId: "TCH-2026-1004",
    firstName: "Usman",
    middleName: "Musa",
    lastName: "Shehu",
    fullName: "Usman Musa Shehu",
    gender: "Male",
    phone: "08034567890",
    email: "usman.shehu@school.edu.ng",
    address: "Katsina, Nigeria",
    role: "Teacher",
    department: "Science",
    employmentType: "Full Time",
    status: "Active",
    qualification: "B.Sc Physics",
    experience: "4 years",
    subjects: ["Physics", "Basic Technology"],
    classes: ["SS 1", "SS 2", "SS 3"],
    classTeacherOf: "",
    session: CURRENT_SESSION,
    joiningDate: "2023-01-12",
    attendancePercentage: 90,
    performance: 87,
    photo: "https://i.pravatar.cc/200?img=68",
    emergencyContact: {
      name: "Musa Shehu",
      phone: "08035678901",
      relationship: "Brother",
    },
    activity: [],
  },
  {
    id: "teacher-005",
    staffId: "TCH-2026-1005",
    firstName: "Maryam",
    middleName: "Ali",
    lastName: "Sani",
    fullName: "Maryam Ali Sani",
    gender: "Female",
    phone: "08035678901",
    email: "maryam.sani@school.edu.ng",
    address: "Katsina, Nigeria",
    role: "Staff",
    department: "Administration",
    employmentType: "Full Time",
    status: "Active",
    qualification: "ND Office Technology",
    experience: "3 years",
    subjects: [],
    classes: [],
    classTeacherOf: "",
    session: CURRENT_SESSION,
    joiningDate: "2024-02-01",
    attendancePercentage: 95,
    performance: 88,
    photo: "https://i.pravatar.cc/200?img=49",
    emergencyContact: {
      name: "Ali Sani",
      phone: "08036789012",
      relationship: "Father",
    },
    activity: [],
  },
  {
    id: "teacher-006",
    staffId: "TCH-2026-1006",
    firstName: "Abdullahi",
    middleName: "Nasir",
    lastName: "Ahmed",
    fullName: "Abdullahi Nasir Ahmed",
    gender: "Male",
    phone: "08036789012",
    email: "abdullahi.ahmed@school.edu.ng",
    address: "Katsina, Nigeria",
    role: "Class Teacher",
    department: "Primary",
    employmentType: "Full Time",
    status: "On Leave",
    qualification: "NCE Primary Education",
    experience: "7 years",
    subjects: ["English Language", "Mathematics"],
    classes: ["Primary 5"],
    classTeacherOf: "Primary 5",
    session: CURRENT_SESSION,
    joiningDate: "2019-09-10",
    attendancePercentage: 84,
    performance: 91,
    photo: "https://i.pravatar.cc/200?img=11",
    emergencyContact: {
      name: "Nasir Ahmed",
      phone: "08037890123",
      relationship: "Brother",
    },
    activity: [],
  },
];

const EMPTY_FORM = {
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "Male",
  phone: "",
  email: "",
  address: "",
  role: "Teacher",
  department: "Science",
  employmentType: "Full Time",
  status: "Active",
  qualification: "",
  experience: "",
  subjects: [],
  classes: [],
  classTeacherOf: "",
  joiningDate: new Date().toISOString().slice(0, 10),
  photo: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelationship: "",
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "On Leave": "bg-amber-50 text-amber-700 border-amber-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-200",
  Archived: "bg-rose-50 text-rose-700 border-rose-200",
};

const roleStyles = {
  Principal: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Vice Principal": "bg-violet-50 text-violet-700 border-violet-200",
  "Head of Department": "bg-blue-50 text-blue-700 border-blue-200",
  "Form Master": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Form Mistress": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Class Teacher": "bg-sky-50 text-sky-700 border-sky-200",
  "Subject Teacher": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Teacher: "bg-slate-100 text-slate-700 border-slate-200",
  Staff: "bg-orange-50 text-orange-700 border-orange-200",
  Administrator: "bg-purple-50 text-purple-700 border-purple-200",
};

function Avatar({ teacher, size = "md" }) {
  const [failed, setFailed] = useState(false);

  const dimensions =
    size === "lg"
      ? "h-20 w-20 text-xl"
      : size === "sm"
      ? "h-9 w-9 text-xs"
      : "h-12 w-12 text-sm";

  const photo = getTeacherPhoto(teacher);

  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt={teacher?.fullName || "Teacher"}
        className={`${dimensions} rounded-2xl object-cover border border-slate-200 shadow-sm`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${dimensions} flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 font-bold text-white shadow-sm`}
    >
      {initials(teacher?.fullName)}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, subtitle, iconClass }) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function Modal({ children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div
        className={`relative max-h-[92vh] w-full overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl ${
          wide ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
        >
          <X size={18} />
        </button>

        {children}
      </div>
    </div>
  );
}

export default function Teachers() {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [employmentFilter, setEmploymentFilter] = useState("All");

  const [viewMode, setViewMode] = useState("table");
  const [selectedIds, setSelectedIds] = useState([]);

  const [showFilters, setShowFilters] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const [editingTeacher, setEditingTeacher] = useState(null);
  const [profileTeacher, setProfileTeacher] = useState(null);
  const [deleteTeacher, setDeleteTeacher] = useState(null);
  const [roleTeacher, setRoleTeacher] = useState(null);
  const [activityTeacher, setActivityTeacher] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    const storedTeachers = localStorage.getItem(STORAGE_KEY);
    const storedStudents = localStorage.getItem(STUDENTS_KEY);

    if (storedTeachers) {
      try {
        const parsed = JSON.parse(storedTeachers);
        setTeachers(Array.isArray(parsed) ? parsed : DEMO_TEACHERS);
      } catch {
        setTeachers(DEMO_TEACHERS);
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_TEACHERS));
      setTeachers(DEMO_TEACHERS);
    }

    if (storedStudents) {
      try {
        const parsed = JSON.parse(storedStudents);
        setStudents(Array.isArray(parsed) ? parsed : []);
      } catch {
        setStudents([]);
      }
    }
  }, []);

  useEffect(() => {
    if (teachers.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
    }
  }, [teachers]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3200);

    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teachers
      .filter((teacher) => {
        const matchesSearch =
          !query ||
          [
            teacher.fullName,
            teacher.staffId,
            teacher.email,
            teacher.phone,
            teacher.role,
            teacher.department,
            ...(teacher.subjects || []),
            ...(teacher.classes || []),
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);

        const matchesRole =
          roleFilter === "All" || teacher.role === roleFilter;

        const matchesDepartment =
          departmentFilter === "All" ||
          teacher.department === departmentFilter;

        const matchesStatus =
          statusFilter === "All" || teacher.status === statusFilter;

        const matchesEmployment =
          employmentFilter === "All" ||
          teacher.employmentType === employmentFilter;

        return (
          matchesSearch &&
          matchesRole &&
          matchesDepartment &&
          matchesStatus &&
          matchesEmployment
        );
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [
    teachers,
    search,
    roleFilter,
    departmentFilter,
    statusFilter,
    employmentFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTeachers.length / pageSize)
  );

  const paginatedTeachers = filteredTeachers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const activeTeachers = teachers.filter(
    (teacher) => teacher.status === "Active"
  );

  const leaveTeachers = teachers.filter(
    (teacher) => teacher.status === "On Leave"
  );

  const archivedTeachers = teachers.filter(
    (teacher) => teacher.status === "Archived"
  );

  const averageAttendance = teachers.length
    ? Math.round(
        teachers.reduce(
          (sum, teacher) => sum + Number(teacher.attendancePercentage || 0),
          0
        ) / teachers.length
      )
    : 0;

  const averagePerformance = teachers.length
    ? Math.round(
        teachers.reduce(
          (sum, teacher) => sum + Number(teacher.performance || 0),
          0
        ) / teachers.length
      )
    : 0;

  const departmentCounts = useMemo(() => {
    const counts = {};

    teachers.forEach((teacher) => {
      const department = teacher.department || "Other";
      counts[department] = (counts[department] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [teachers]);

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleArrayValue = (field, value) => {
    setForm((prev) => {
      const current = prev[field] || [];

      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
      joiningDate: new Date().toISOString().slice(0, 10),
    });
  };

  const openAddTeacher = () => {
    setEditingTeacher(null);
    resetForm();
    setShowTeacherModal(true);
  };

  const openEditTeacher = (teacher) => {
    setEditingTeacher(teacher);

    setForm({
      firstName: teacher.firstName || "",
      middleName: teacher.middleName || "",
      lastName: teacher.lastName || "",
      gender: teacher.gender || "Male",
      phone: teacher.phone || "",
      email: teacher.email || "",
      address: teacher.address || "",
      role: teacher.role || "Teacher",
      department: teacher.department || "Science",
      employmentType: teacher.employmentType || "Full Time",
      status: teacher.status || "Active",
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
      subjects: teacher.subjects || [],
      classes: teacher.classes || [],
      classTeacherOf: teacher.classTeacherOf || "",
      joiningDate:
        teacher.joiningDate ||
        new Date().toISOString().slice(0, 10),
      photo: teacher.photo || "",
      emergencyName: teacher.emergencyContact?.name || "",
      emergencyPhone: teacher.emergencyContact?.phone || "",
      emergencyRelationship:
        teacher.emergencyContact?.relationship || "",
    });

    setShowTeacherModal(true);
    setOpenMenu(null);
  };

  const saveTeacher = (event) => {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      showToast("First name and last name are required.", "error");
      return;
    }

    if (!form.phone.trim()) {
      showToast("Teacher phone number is required.", "error");
      return;
    }

    const fullName = [
      form.firstName,
      form.middleName,
      form.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    const teacherData = {
      ...(editingTeacher || {}),
      id: editingTeacher?.id || uid(),
      staffId:
        editingTeacher?.staffId ||
        createTeacherId(),
      ...form,
      fullName,
      emergencyContact: {
        name: form.emergencyName,
        phone: form.emergencyPhone,
        relationship: form.emergencyRelationship,
      },
      attendancePercentage:
        editingTeacher?.attendancePercentage || 100,
      performance: editingTeacher?.performance || 0,
      activity: [
        ...(editingTeacher?.activity || []),
        {
          id: uid(),
          title: editingTeacher
            ? "Teacher profile updated"
            : "Teacher profile created",
          description: `${form.role} • ${form.department}`,
          date: new Date().toISOString(),
        },
      ],
    };

    if (editingTeacher) {
      setTeachers((prev) =>
        prev.map((teacher) =>
          teacher.id === editingTeacher.id
            ? teacherData
            : teacher
        )
      );

      showToast("Teacher profile updated successfully.");
    } else {
      setTeachers((prev) => [teacherData, ...prev]);
      showToast("Teacher added successfully.");
    }

    setShowTeacherModal(false);
    resetForm();
  };

  const changeTeacherRole = () => {
    if (!roleTeacher) return;

    setTeachers((prev) =>
      prev.map((teacher) =>
        teacher.id === roleTeacher.id
          ? {
              ...teacher,
              role: form.role,
              activity: [
                ...(teacher.activity || []),
                {
                  id: uid(),
                  title: "Role changed",
                  description: `Role changed to ${form.role}`,
                  date: new Date().toISOString(),
                },
              ],
            }
          : teacher
      )
    );

    showToast(
      `${roleTeacher.fullName} is now ${form.role}.`
    );

    setShowRoleModal(false);
    setRoleTeacher(null);
  };

  const openRoleEditor = (teacher) => {
    setRoleTeacher(teacher);
    setForm((prev) => ({
      ...prev,
      role: teacher.role || "Teacher",
    }));
    setShowRoleModal(true);
    setOpenMenu(null);
  };

  const updateTeacherStatus = (teacherId, status) => {
    setTeachers((prev) =>
      prev.map((teacher) =>
        teacher.id === teacherId
          ? {
              ...teacher,
              status,
              activity: [
                ...(teacher.activity || []),
                {
                  id: uid(),
                  title: `Status changed to ${status}`,
                  description: "Staff management",
                  date: new Date().toISOString(),
                },
              ],
            }
          : teacher
      )
    );

    showToast(`Teacher status changed to ${status}.`);
    setOpenMenu(null);
  };

  const confirmDelete = () => {
    if (!deleteTeacher) return;

    setTeachers((prev) =>
      prev.map((teacher) =>
        teacher.id === deleteTeacher.id
          ? {
              ...teacher,
              status: "Archived",
              activity: [
                ...(teacher.activity || []),
                {
                  id: uid(),
                  title: "Teacher archived",
                  description: "Teacher moved to archive",
                  date: new Date().toISOString(),
                },
              ],
            }
          : teacher
      )
    );

    showToast(`${deleteTeacher.fullName} has been archived.`);

    setShowDeleteModal(false);
    setDeleteTeacher(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedTeachers.map((teacher) => teacher.id);

    const allSelected = pageIds.every((id) =>
      selectedIds.includes(id)
    );

    if (allSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !pageIds.includes(id))
      );
    } else {
      setSelectedIds((prev) => [
        ...new Set([...prev, ...pageIds]),
      ]);
    }
  };

  const bulkStatusChange = (status) => {
    if (!selectedIds.length) {
      showToast("Select at least one teacher first.", "error");
      return;
    }

    setTeachers((prev) =>
      prev.map((teacher) =>
        selectedIds.includes(teacher.id)
          ? {
              ...teacher,
              status,
              activity: [
                ...(teacher.activity || []),
                {
                  id: uid(),
                  title: `Bulk status update`,
                  description: `Status changed to ${status}`,
                  date: new Date().toISOString(),
                },
              ],
            }
          : teacher
      )
    );

    setSelectedIds([]);
    showToast(`${selectedIds.length} teacher(s) updated.`);
  };

  const exportCSV = () => {
    const headers = [
      "Staff ID",
      "Name",
      "Role",
      "Department",
      "Employment",
      "Status",
      "Phone",
      "Email",
      "Qualification",
      "Experience",
      "Subjects",
      "Classes",
      "Attendance %",
      "Performance %",
    ];

    const rows = filteredTeachers.map((teacher) => [
      teacher.staffId,
      teacher.fullName,
      teacher.role,
      teacher.department,
      teacher.employmentType,
      teacher.status,
      teacher.phone,
      teacher.email,
      teacher.qualification,
      teacher.experience,
      (teacher.subjects || []).join("; "),
      (teacher.classes || []).join("; "),
      teacher.attendancePercentage,
      teacher.performance,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "school-teachers.csv";
    link.click();

    URL.revokeObjectURL(url);

    showToast("Teacher CSV exported successfully.");
  };

  const printTeachers = () => {
    window.print();
  };

  const openProfile = (teacher) => {
    setProfileTeacher(teacher);
    setShowProfileModal(true);
    setOpenMenu(null);
  };

  const openActivity = (teacher) => {
    setActivityTeacher(teacher);
    setShowActivityModal(true);
    setOpenMenu(null);
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setDepartmentFilter("All");
    setStatusFilter("All");
    setEmploymentFilter("All");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
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

        .animate-fade-up {
          animation: fadeUp .45s ease-out both;
        }

        .animate-scale-in {
          animation: scaleIn .25s ease-out both;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .print-area {
            box-shadow: none !important;
            border: 0 !important;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="animate-fade-up">
              <div className="mb-3 flex items-center gap-2 text-sm text-sky-300">
                <Users size={17} />
                Staff Management
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Teachers & Staff
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Manage teachers, staff roles, subjects, classes,
                attendance, workload and academic responsibilities
                from one central workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 no-print">
              <button
                type="button"
                onClick={exportCSV}
                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur transition hover:bg-white/15"
              >
                <Download size={17} />
                Export
              </button>

              <button
                type="button"
                onClick={openAddTeacher}
                className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-sky-50"
              >
                <Plus size={18} />
                Add Teacher
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* KPI */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            title="Total Staff"
            value={teachers.length}
            subtitle="All registered staff"
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            icon={UserCheck}
            title="Active Teachers"
            value={activeTeachers.length}
            subtitle="Currently active"
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            icon={CalendarDays}
            title="On Leave"
            value={leaveTeachers.length}
            subtitle="Currently away"
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            icon={Award}
            title="Avg. Performance"
            value={`${averagePerformance}%`}
            subtitle={`Attendance average ${averageAttendance}%`}
            iconClass="bg-sky-50 text-sky-600"
          />
        </div>

        {/* INSIGHTS */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <BriefcaseBusiness size={20} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Department Distribution
                </p>
                <p className="text-xs text-slate-500">
                  Staff allocation
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {departmentCounts.slice(0, 4).map(([department, count]) => (
                <div key={department}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-600">
                      {department}
                    </span>
                    <span className="font-bold text-slate-900">
                      {count}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: `${Math.max(
                          8,
                          (count / Math.max(teachers.length, 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <GraduationCap size={20} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Academic Coverage
                </p>
                <p className="text-xs text-slate-500">
                  Teaching workload
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Subjects</p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {
                    new Set(
                      teachers.flatMap(
                        (teacher) => teacher.subjects || []
                      )
                    ).size
                  }
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Classes</p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {
                    new Set(
                      teachers.flatMap(
                        (teacher) => teacher.classes || []
                      )
                    ).size
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Activity size={20} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Staff Status
                </p>
                <p className="text-xs text-slate-500">
                  Current workforce
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                ["Active", activeTeachers.length, "bg-emerald-500"],
                ["On Leave", leaveTeachers.length, "bg-amber-500"],
                ["Archived", archivedTeachers.length, "bg-rose-500"],
              ].map(([label, count, color]) => (
                <div
                  key={label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${color}`}
                    />
                    <span className="text-sm text-slate-600">
                      {label}
                    </span>
                  </div>

                  <span className="font-bold text-slate-900">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, staff ID, subject, class, email..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  showFilters
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter size={17} />
                Filters
              </button>

              <button
                type="button"
                onClick={printTeachers}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <Printer size={17} />
                Print
              </button>

              <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`rounded-xl p-2 ${
                    viewMode === "table"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-400"
                  }`}
                >
                  <FileText size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-xl p-2 ${
                    viewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-400"
                  }`}
                >
                  <Grid2X2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="border-t border-slate-100 bg-slate-50/70 p-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FilterSelect
                  label="Role"
                  value={roleFilter}
                  onChange={setRoleFilter}
                  options={["All", ...TEACHER_ROLES]}
                />

                <FilterSelect
                  label="Department"
                  value={departmentFilter}
                  onChange={setDepartmentFilter}
                  options={["All", ...DEPARTMENTS]}
                />

                <FilterSelect
                  label="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={["All", ...TEACHER_STATUSES]}
                />

                <FilterSelect
                  label="Employment"
                  value={employmentFilter}
                  onChange={setEmploymentFilter}
                  options={["All", ...EMPLOYMENT_TYPES]}
                />
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <RefreshCcw size={15} />
                Clear all filters
              </button>
            </div>
          )}
        </section>

        {/* BULK BAR */}
        {selectedIds.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-indigo-200 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-indigo-900">
                {selectedIds.length} teacher
                {selectedIds.length > 1 ? "s" : ""} selected
              </p>
              <p className="text-xs text-indigo-600">
                Apply a staff-wide action.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => bulkStatusChange("Active")}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
              >
                Activate
              </button>

              <button
                type="button"
                onClick={() => bulkStatusChange("On Leave")}
                className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white"
              >
                On Leave
              </button>

              <button
                type="button"
                onClick={() => bulkStatusChange("Inactive")}
                className="rounded-xl bg-slate-700 px-3 py-2 text-xs font-bold text-white"
              >
                Deactivate
              </button>

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        <section className="print-area mt-6">
          {viewMode === "table" ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="w-12 px-5 py-4">
                        <input
                          type="checkbox"
                          checked={
                            paginatedTeachers.length > 0 &&
                            paginatedTeachers.every((teacher) =>
                              selectedIds.includes(teacher.id)
                            )
                          }
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Teacher
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Role
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Subjects
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Classes
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Attendance
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedTeachers.map((teacher) => (
                      <tr
                        key={teacher.id}
                        className="group transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(teacher.id)}
                            onChange={() =>
                              toggleSelect(teacher.id)
                            }
                            className="h-4 w-4 rounded border-slate-300"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar teacher={teacher} />

                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() =>
                                  openProfile(teacher)
                                }
                                className="truncate text-sm font-bold text-slate-900 hover:text-indigo-600"
                              >
                                {teacher.fullName}
                              </button>

                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                                <span>{teacher.staffId}</span>
                                <span>•</span>
                                <span>
                                  {teacher.department}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              openRoleEditor(teacher)
                            }
                            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                              roleStyles[teacher.role] ||
                              "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {teacher.role}
                          </button>
                        </td>

                        <td className="max-w-[220px] px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(teacher.subjects || [])
                              .slice(0, 3)
                              .map((subject) => (
                                <span
                                  key={subject}
                                  className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600"
                                >
                                  {subject}
                                </span>
                              ))}

                            {(teacher.subjects || []).length >
                              3 && (
                              <span className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-600">
                                +
                                {(teacher.subjects || [])
                                  .length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <BookOpen
                              size={15}
                              className="text-indigo-500"
                            />
                            {(teacher.classes || []).length}
                            <span className="text-xs font-normal text-slate-400">
                              classes
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="w-28">
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="font-bold text-slate-700">
                                {teacher.attendancePercentage ||
                                  0}
                                %
                              </span>

                              <span className="text-slate-400">
                                attendance
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    teacher.attendancePercentage ||
                                      0
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                              statusStyles[teacher.status] ||
                              statusStyles.Inactive
                            }`}
                          >
                            {teacher.status}
                          </span>
                        </td>

                        <td className="relative px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenu(
                                openMenu === teacher.id
                                  ? null
                                  : teacher.id
                              )
                            }
                            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <MoreHorizontal size={19} />
                          </button>

                          {openMenu === teacher.id && (
                            <div className="absolute right-5 top-14 z-30 w-52 rounded-2xl border border-slate-200 bg-white p-2 text-left shadow-xl">
                              <MenuButton
                                icon={Eye}
                                label="View profile"
                                onClick={() =>
                                  openProfile(teacher)
                                }
                              />

                              <MenuButton
                                icon={Edit3}
                                label="Edit teacher"
                                onClick={() =>
                                  openEditTeacher(teacher)
                                }
                              />

                              <MenuButton
                                icon={ShieldCheck}
                                label="Change role"
                                onClick={() =>
                                  openRoleEditor(teacher)
                                }
                              />

                              <MenuButton
                                icon={Activity}
                                label="View activity"
                                onClick={() =>
                                  openActivity(teacher)
                                }
                              />

                              <MenuButton
                                icon={CalendarDays}
                                label="Attendance"
                                onClick={() => {
                                  navigate(
                                    `/teachers/${teacher.id}/attendance`
                                  );
                                  setOpenMenu(null);
                                }}
                              />

                              <MenuButton
                                icon={BookOpen}
                                label="Teaching assignments"
                                onClick={() => {
                                  navigate(
                                    `/teachers/${teacher.id}/assignments`
                                  );
                                  setOpenMenu(null);
                                }}
                              />

                              <div className="my-1 border-t border-slate-100" />

                              {teacher.status !== "Active" && (
                                <MenuButton
                                  icon={CheckCircle2}
                                  label="Activate"
                                  onClick={() =>
                                    updateTeacherStatus(
                                      teacher.id,
                                      "Active"
                                    )
                                  }
                                />
                              )}

                              {teacher.status === "Active" && (
                                <MenuButton
                                  icon={Clock3}
                                  label="Put on leave"
                                  onClick={() =>
                                    updateTeacherStatus(
                                      teacher.id,
                                      "On Leave"
                                    )
                                  }
                                />
                              )}

                              <MenuButton
                                danger
                                icon={Archive}
                                label="Archive teacher"
                                onClick={() => {
                                  setDeleteTeacher(teacher);
                                  setShowDeleteModal(true);
                                  setOpenMenu(null);
                                }}
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!paginatedTeachers.length && (
                <EmptyState onReset={clearFilters} />
              )}

              {/* PAGINATION */}
              {filteredTeachers.length > 0 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={filteredTeachers.length}
                  pageSize={pageSize}
                  onPrevious={() =>
                    setPage((value) => Math.max(1, value - 1))
                  }
                  onNext={() =>
                    setPage((value) =>
                      Math.min(totalPages, value + 1)
                    )
                  }
                />
              )}
            </div>
          ) : (
            <>
              {paginatedTeachers.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedTeachers.map((teacher) => (
                    <TeacherCard
                      key={teacher.id}
                      teacher={teacher}
                      selected={selectedIds.includes(
                        teacher.id
                      )}
                      onSelect={() =>
                        toggleSelect(teacher.id)
                      }
                      onView={() => openProfile(teacher)}
                      onEdit={() =>
                        openEditTeacher(teacher)
                      }
                      onRole={() =>
                        openRoleEditor(teacher)
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState onReset={clearFilters} />
              )}

              {filteredTeachers.length > 0 && (
                <div className="mt-4">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={filteredTeachers.length}
                    pageSize={pageSize}
                    onPrevious={() =>
                      setPage((value) =>
                        Math.max(1, value - 1)
                      )
                    }
                    onNext={() =>
                      setPage((value) =>
                        Math.min(totalPages, value + 1)
                      )
                    }
                  />
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* ADD / EDIT MODAL */}
      {showTeacherModal && (
        <Modal
          onClose={() => setShowTeacherModal(false)}
          wide
        >
          <form
            onSubmit={saveTeacher}
            className="max-h-[92vh] overflow-y-auto"
          >
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  {editingTeacher ? (
                    <Edit3 size={21} />
                  ) : (
                    <UserPlus size={21} />
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {editingTeacher
                      ? "Edit Teacher"
                      : "Add New Teacher"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Configure personal information, role,
                    subjects, classes and employment details.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-7 p-6 sm:p-8">
              {/* PERSONAL */}
              <FormSection
                icon={Users}
                title="Personal Information"
                description="Basic staff identity and contact information."
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    label="First Name"
                    value={form.firstName}
                    onChange={(value) =>
                      updateForm("firstName", value)
                    }
                    required
                  />

                  <Input
                    label="Middle Name"
                    value={form.middleName}
                    onChange={(value) =>
                      updateForm("middleName", value)
                    }
                  />

                  <Input
                    label="Last Name"
                    value={form.lastName}
                    onChange={(value) =>
                      updateForm("lastName", value)
                    }
                    required
                  />

                  <Select
                    label="Gender"
                    value={form.gender}
                    onChange={(value) =>
                      updateForm("gender", value)
                    }
                    options={["Male", "Female"]}
                  />

                  <Input
                    label="Phone"
                    value={form.phone}
                    onChange={(value) =>
                      updateForm("phone", value)
                    }
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) =>
                      updateForm("email", value)
                    }
                  />

                  <div className="md:col-span-3">
                    <Input
                      label="Address"
                      value={form.address}
                      onChange={(value) =>
                        updateForm("address", value)
                      }
                    />
                  </div>
                </div>
              </FormSection>

              {/* ROLE */}
              <FormSection
                icon={ShieldCheck}
                title="Role & Employment"
                description="A teacher can change roles without creating another staff record."
              >
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Select
                    label="Staff Role"
                    value={form.role}
                    onChange={(value) =>
                      updateForm("role", value)
                    }
                    options={TEACHER_ROLES}
                  />

                  <Select
                    label="Department"
                    value={form.department}
                    onChange={(value) =>
                      updateForm("department", value)
                    }
                    options={DEPARTMENTS}
                  />

                  <Select
                    label="Employment Type"
                    value={form.employmentType}
                    onChange={(value) =>
                      updateForm("employmentType", value)
                    }
                    options={EMPLOYMENT_TYPES}
                  />

                  <Select
                    label="Status"
                    value={form.status}
                    onChange={(value) =>
                      updateForm("status", value)
                    }
                    options={TEACHER_STATUSES}
                  />

                  <Input
                    label="Qualification"
                    value={form.qualification}
                    onChange={(value) =>
                      updateForm("qualification", value)
                    }
                  />

                  <Input
                    label="Experience"
                    value={form.experience}
                    onChange={(value) =>
                      updateForm("experience", value)
                    }
                    placeholder="e.g. 5 years"
                  />

                  <Input
                    label="Joining Date"
                    type="date"
                    value={form.joiningDate}
                    onChange={(value) =>
                      updateForm("joiningDate", value)
                    }
                  />

                  <Input
                    label="Photo URL"
                    value={form.photo}
                    onChange={(value) =>
                      updateForm("photo", value)
                    }
                    placeholder="https://..."
                  />
                </div>
              </FormSection>

              {/* SUBJECTS */}
              <FormSection
                icon={BookOpen}
                title="Subjects"
                description="Select the subjects this teacher is responsible for."
              >
                <MultiSelectGrid
                  items={SUBJECTS}
                  selected={form.subjects}
                  onToggle={(value) =>
                    toggleArrayValue("subjects", value)
                  }
                />
              </FormSection>

              {/* CLASSES */}
              <FormSection
                icon={GraduationCap}
                title="Classes"
                description="Assign one or multiple classes."
              >
                <MultiSelectGrid
                  items={CLASSES}
                  selected={form.classes}
                  onToggle={(value) =>
                    toggleArrayValue("classes", value)
                  }
                />

                <div className="mt-5 max-w-md">
                  <Select
                    label="Form/Class Master"
                    value={form.classTeacherOf}
                    onChange={(value) =>
                      updateForm("classTeacherOf", value)
                    }
                    options={["", ...form.classes]}
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Select the class this teacher manages as
                    Form Master/Form Mistress/Class Teacher.
                  </p>
                </div>
              </FormSection>

              {/* EMERGENCY */}
              <FormSection
                icon={Phone}
                title="Emergency Contact"
                description="Contact information for emergencies."
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    label="Name"
                    value={form.emergencyName}
                    onChange={(value) =>
                      updateForm("emergencyName", value)
                    }
                  />

                  <Input
                    label="Phone"
                    value={form.emergencyPhone}
                    onChange={(value) =>
                      updateForm("emergencyPhone", value)
                    }
                  />

                  <Input
                    label="Relationship"
                    value={form.emergencyRelationship}
                    onChange={(value) =>
                      updateForm(
                        "emergencyRelationship",
                        value
                      )
                    }
                  />
                </div>
              </FormSection>

              {/* PREVIEW */}
              <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-sky-50 p-5">
                <div className="flex items-center gap-4">
                  <Avatar
                    teacher={{
                      ...form,
                      fullName: [
                        form.firstName,
                        form.middleName,
                        form.lastName,
                      ]
                        .filter(Boolean)
                        .join(" "),
                    }}
                    size="lg"
                  />

                  <div>
                    <p className="text-xl font-black text-slate-900">
                      {[
                        form.firstName,
                        form.middleName,
                        form.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") || "Teacher Name"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {form.role} • {form.department}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.subjects.slice(0, 4).map(
                        (subject) => (
                          <span
                            key={subject}
                            className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-600"
                          >
                            {subject}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowTeacherModal(false)
                }
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700"
              >
                <Check size={17} />
                {editingTeacher
                  ? "Save Changes"
                  : "Create Teacher"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && profileTeacher && (
        <Modal
          onClose={() => setShowProfileModal(false)}
          wide
        >
          <div className="max-h-[92vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-7 text-white sm:p-9">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <Avatar teacher={profileTeacher} size="lg" />

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-3xl font-black">
                      {profileTeacher.fullName}
                    </h2>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${
                        roleStyles[profileTeacher.role] ||
                        "bg-white/10 text-white border-white/20"
                      }`}
                    >
                      {profileTeacher.role}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-300">
                    {profileTeacher.staffId} •{" "}
                    {profileTeacher.department}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">
                      {profileTeacher.employmentType}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">
                      {profileTeacher.qualification}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">
                      {profileTeacher.experience}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openEditTeacher(profileTeacher)
                  }
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contact
                </p>

                <div className="mt-4 space-y-4">
                  <InfoRow
                    icon={Phone}
                    label="Phone"
                    value={profileTeacher.phone}
                  />

                  <InfoRow
                    icon={Mail}
                    label="Email"
                    value={profileTeacher.email}
                  />

                  <InfoRow
                    icon={MapPin}
                    label="Address"
                    value={profileTeacher.address}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Academic Assignment
                </p>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-500">
                    Subjects
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {(profileTeacher.subjects || []).map(
                      (subject) => (
                        <span
                          key={subject}
                          className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700"
                        >
                          {subject}
                        </span>
                      )
                    )}
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Classes
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {(profileTeacher.classes || []).map(
                      (className) => (
                        <span
                          key={className}
                          className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700"
                        >
                          {className}
                        </span>
                      )
                    )}
                  </div>

                  {profileTeacher.classTeacherOf && (
                    <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs text-emerald-600">
                        Form/Class responsibility
                      </p>

                      <p className="mt-1 font-black text-emerald-800">
                        {profileTeacher.classTeacherOf}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Performance
                </p>

                <div className="mt-5">
                  <PerformanceMetric
                    label="Attendance"
                    value={
                      profileTeacher.attendancePercentage || 0
                    }
                  />

                  <PerformanceMetric
                    label="Performance"
                    value={profileTeacher.performance || 0}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 pb-8 sm:px-8">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900">
                      Recent Activity
                    </h3>
                    <p className="text-xs text-slate-500">
                      Latest actions performed by this staff
                      member.
                    </p>
                  </div>

                  <Activity
                    size={20}
                    className="text-indigo-500"
                  />
                </div>

                <div className="mt-5 space-y-3">
                  {(profileTeacher.activity || [])
                    .slice(-5)
                    .reverse()
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 rounded-2xl bg-white p-4"
                      >
                        <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />

                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.description}
                          </p>

                          <p className="mt-2 text-[11px] text-slate-400">
                            {formatDate(item.date)}
                          </p>
                        </div>
                      </div>
                    ))}

                  {!profileTeacher.activity?.length && (
                    <p className="py-5 text-center text-sm text-slate-400">
                      No recent activity.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ROLE MODAL */}
      {showRoleModal && roleTeacher && (
        <Modal
          onClose={() => setShowRoleModal(false)}
        >
          <div className="p-7 sm:p-8">
            <div className="flex items-center gap-4">
              <Avatar teacher={roleTeacher} />

              <div>
                <p className="text-xl font-black text-slate-900">
                  Change Staff Role
                </p>

                <p className="text-sm text-slate-500">
                  {roleTeacher.fullName}
                </p>
              </div>
            </div>

            <div className="mt-7">
              <label className="text-sm font-bold text-slate-700">
                New Role
              </label>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {TEACHER_ROLES.map((role) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        role,
                      }))
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      form.role === role
                        ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-500/10"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">
                        {role}
                      </span>

                      {form.role === role && (
                        <Check
                          size={17}
                          className="text-indigo-600"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
              Changing the role does not create a new teacher.
              The same staff profile remains connected to their
              existing attendance, results, timetable and
              activity history.
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowRoleModal(false)
                }
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={changeTeacherRole}
                className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold text-white"
              >
                Save Role
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE / ARCHIVE */}
      {showDeleteModal && deleteTeacher && (
        <Modal
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="p-7 text-center sm:p-9">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600">
              <Archive size={27} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              Archive Teacher?
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              This will move{" "}
              <strong>{deleteTeacher.fullName}</strong> to
              archived staff. Historical records will remain
              available.
            </p>

            <div className="mt-7 flex justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowDeleteModal(false)
                }
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white"
              >
                Archive Teacher
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ACTIVITY */}
      {showActivityModal && activityTeacher && (
        <Modal
          onClose={() => setShowActivityModal(false)}
        >
          <div className="p-7 sm:p-8">
            <div className="flex items-center gap-4">
              <Avatar teacher={activityTeacher} />

              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Staff Activity
                </h2>

                <p className="text-sm text-slate-500">
                  {activityTeacher.fullName}
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {(activityTeacher.activity || [])
                .slice()
                .reverse()
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Activity size={18} />
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">
                        {item.title}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.description}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                ))}

              {!activityTeacher.activity?.length && (
                <div className="py-10 text-center">
                  <Activity
                    size={30}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm text-slate-400">
                    No activity recorded yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[200] animate-fade-up">
          <div
            className={`flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl ${
              toast.type === "error"
                ? "border-rose-200 bg-white text-rose-700"
                : "border-emerald-200 bg-white text-emerald-700"
            }`}
          >
            {toast.type === "error" ? (
              <XCircle size={19} />
            ) : (
              <CheckCircle2 size={19} />
            )}

            <p className="text-sm font-bold">
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   COMPONENTS
------------------------------------------------------- */

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-500">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </label>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={18} />
        </div>

        <div>
          <h3 className="font-black text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">
        {label}
        {required && (
          <span className="ml-1 text-rose-500">*</span>
        )}
      </span>

      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option || "None"}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </label>
  );
}

function MultiSelectGrid({
  items,
  selected,
  onToggle,
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const active = selected.includes(item);

        return (
          <button
            type="button"
            key={item}
            onClick={() => onToggle(item)}
            className={`flex items-center justify-between rounded-2xl border p-3 text-left transition ${
              active
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className="text-xs font-bold">
              {item}
            </span>

            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-300"
              }`}
            >
              <Check size={12} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TeacherCard({
  teacher,
  selected,
  onSelect,
  onView,
  onEdit,
  onRole,
}) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar teacher={teacher} />

          <div>
            <button
              type="button"
              onClick={onView}
              className="text-left text-sm font-black text-slate-900 hover:text-indigo-600"
            >
              {teacher.fullName}
            </button>

            <p className="mt-1 text-xs text-slate-400">
              {teacher.staffId}
            </p>
          </div>
        </div>

        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="h-4 w-4 rounded border-slate-300"
        />
      </div>

      <button
        type="button"
        onClick={onRole}
        className={`mt-4 rounded-full border px-3 py-1.5 text-xs font-bold ${
          roleStyles[teacher.role] ||
          "bg-slate-100 text-slate-600 border-slate-200"
        }`}
      >
        {teacher.role}
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[11px] text-slate-400">
            Subjects
          </p>

          <p className="mt-1 text-xl font-black text-slate-900">
            {(teacher.subjects || []).length}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[11px] text-slate-400">
            Classes
          </p>

          <p className="mt-1 text-xl font-black text-slate-900">
            {(teacher.classes || []).length}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-slate-500">
            Attendance
          </span>

          <span className="font-black text-slate-900">
            {teacher.attendancePercentage || 0}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{
              width: `${teacher.attendancePercentage || 0}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={onView}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
        >
          <Eye size={15} />
          Profile
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="flex items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-600 transition hover:bg-slate-50"
        >
          <Edit3 size={15} />
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function PerformanceMetric({ label, value }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex justify-between">
        <span className="text-sm font-semibold text-slate-600">
          {label}
        </span>

        <span className="text-sm font-black text-slate-900">
          {value}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{
            width: `${Math.min(100, value)}%`,
          }}
        />
      </div>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
        <Users size={28} />
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-900">
        No teachers found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Try changing your search or filters, or add a new
        teacher to the school.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
      >
        Clear Filters
      </button>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPrevious,
  onNext,
}) {
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-bold text-slate-800">
          {start}
        </span>{" "}
        to{" "}
        <span className="font-bold text-slate-800">
          {end}
        </span>{" "}
        of{" "}
        <span className="font-bold text-slate-800">
          {total}
        </span>{" "}
        teachers
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrevious}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={17} />
        </button>

        <span className="min-w-20 text-center text-xs font-bold text-slate-600">
          Page {page} / {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={onNext}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}