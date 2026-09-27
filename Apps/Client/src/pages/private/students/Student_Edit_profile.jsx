import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Save,
  User,
  GraduationCap,
  Users,
  HeartPulse,
  Wallet,
  FileText,
  Camera,
  Upload,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  CreditCard,
  UserRound,
  FileCheck2,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

/* =========================================================
   CONSTANTS
========================================================= */

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

/* =========================================================
   HELPERS
========================================================= */

const createId = (prefix = "id") => {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

const money = (value) => {
  const amount = Number(value) || 0;

  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const normalizeStudent = (student) => {
  if (!student) return null;

  return {
    ...student,

    fullName:
      student.fullName ||
      [
        student.firstName,
        student.middleName,
        student.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      "Unnamed Student",

    status: student.status || "Active",

    attendance: {
      ...EMPTY_ATTENDANCE,
      ...(student.attendance || {}),
    },

    academic: {
      ...EMPTY_ACADEMIC,
      ...(student.academic || {}),
    },

    fees: {
      ...EMPTY_FEES,
      ...(student.fees || {}),
    },

    medical: {
      bloodGroup: "",
      genotype: "",
      allergies: "",
      medicalConditions: "",
      emergencyContact: "",
      doctor: "",
      hospital: "",
      ...(student.medical || {}),
    },

    payment: {
      amount: 0,
      method: "",
      reference: "",
      date: "",
      ...(student.payment || {}),
    },

    documents: Array.isArray(student.documents)
      ? student.documents
      : [],

    results: Array.isArray(student.results)
      ? student.results
      : [],

    assignments: Array.isArray(student.assignments)
      ? student.assignments
      : [],

    activity: Array.isArray(student.activity)
      ? student.activity
      : [],

    messages: Array.isArray(student.messages)
      ? student.messages
      : [],
  };
};

const getInitialForm = (student) => {
  return {
    /* Personal */
    firstName: student?.firstName || "",
    middleName: student?.middleName || "",
    lastName: student?.lastName || "",
    dateOfBirth: student?.dateOfBirth || "",
    gender: student?.gender || "",
    nationality: student?.nationality || "Nigerian",
    state: student?.state || "",
    lga: student?.lga || "",
    religion: student?.religion || "",
    bloodGroup:
      student?.bloodGroup ||
      student?.medical?.bloodGroup ||
      "",
    genotype:
      student?.genotype ||
      student?.medical?.genotype ||
      "",
    address: student?.address || "",
    phone: student?.phone || "",
    email: student?.email || "",

    /* Academic */
    section: student?.section || "",
    className: student?.className || "",
    session: student?.session || "2026/2027",
    term: student?.term || "First Term",
    admissionDate: student?.admissionDate || "",
    studentType: student?.studentType || "New Student",

    /* Guardian */
    fatherName: student?.fatherName || "",
    motherName: student?.motherName || "",
    guardianName: student?.guardianName || "",
    guardianRelationship:
      student?.guardianRelationship || "",
    guardianPhone: student?.guardianPhone || "",
    guardianEmail: student?.guardianEmail || "",
    guardianAddress: student?.guardianAddress || "",
    guardianOccupation:
      student?.guardianOccupation || "",

    /* Medical */
    allergies: student?.medical?.allergies || "",
    medicalConditions:
      student?.medical?.medicalConditions || "",
    emergencyContact:
      student?.medical?.emergencyContact || "",
    doctor: student?.medical?.doctor || "",
    hospital: student?.medical?.hospital || "",

    /* Fees */
    registrationFee:
      student?.fees?.registrationFee || 0,
    tuitionFee: student?.fees?.tuitionFee || 0,
    booksFee: student?.fees?.booksFee || 0,
    uniformFee: student?.fees?.uniformFee || 0,
    transportFee: student?.fees?.transportFee || 0,
    otherFee: student?.fees?.otherFee || 0,
    discount: student?.fees?.discount || 0,
    scholarship: student?.fees?.scholarship || 0,
    paid: student?.fees?.paid || 0,
    paymentMethod:
      student?.payment?.method || "",
    paymentReference:
      student?.payment?.reference || "",
  };
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div
      className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm"
      style={{
        animation:
          "toastEnter .4s cubic-bezier(.16,1,.3,1) both",
      }}
    >
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
          isError
            ? "border-red-200 bg-white"
            : "border-emerald-200 bg-white"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isError
              ? "bg-red-50 text-red-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {isError ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">
            {toast.title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  number,
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
          <Icon className="h-5 w-5" />
        </div>

        {number && (
          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-sky-500 text-[10px] font-black text-white">
            {number}
          </span>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h2>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon: Icon,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}

        <input
          type={type}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 ${
            Icon ? "pl-10" : ""
          }`}
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value="">Select...</option>

          {options.map((option) => (
            <option
              key={
                typeof option === "string"
                  ? option
                  : option.value
              }
              value={
                typeof option === "string"
                  ? option
                  : option.value
              }
            >
              {typeof option === "string"
                ? option
                : option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <textarea
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
      />
    </label>
  );
}

function MoneyField({
  label,
  value,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
          ₦
        </span>

        <input
          type="number"
          min="0"
          value={value ?? 0}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        />
      </div>
    </label>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({});
  const [documents, setDocuments] = useState([]);
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeSection, setActiveSection] =
    useState("personal");

  const [errors, setErrors] = useState({});

  /* =====================================================
     LOAD STUDENT
  ===================================================== */

  useEffect(() => {
    setLoading(true);

    try {
      const students = JSON.parse(
        localStorage.getItem("school_students") || "[]"
      );

      const found = students.find(
        (item) => String(item.id) === String(id)
      );

      if (found) {
        const normalized = normalizeStudent(found);

        setStudent(normalized);
        setForm(getInitialForm(normalized));
        setDocuments(normalized.documents || []);
        setPhoto(normalized.photo || "");
      } else {
        setStudent(null);
      }
    } catch (error) {
      console.error("Failed to load student:", error);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* =====================================================
     DIRTY STATE
  ===================================================== */

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!dirty) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [dirty]);

  /* =====================================================
     FORM UPDATE
  ===================================================== */

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setDirty(true);

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }
  };

  /* =====================================================
     PHOTO
  ===================================================== */

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(
        "error",
        "Invalid photo",
        "Please select a valid image file."
      );

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast(
        "error",
        "Image too large",
        "Please choose an image smaller than 5MB."
      );

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(reader.result);
      setDirty(true);
    };

    reader.readAsDataURL(file);
  };

  /* =====================================================
     DOCUMENTS
  ===================================================== */

  const handleDocumentUpload = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const newDocuments = files.map((file) => ({
      id: createId("doc"),
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: "Uploaded",
    }));

    setDocuments((previous) => [
      ...previous,
      ...newDocuments,
    ]);

    setDirty(true);

    event.target.value = "";
  };

  const removeDocument = (documentId) => {
    setDocuments((previous) =>
      previous.filter(
        (document) => document.id !== documentId
      )
    );

    setDirty(true);
  };

  /* =====================================================
     FEES CALCULATION
  ===================================================== */

  const feeSummary = useMemo(() => {
    const subtotal =
      Number(form.registrationFee || 0) +
      Number(form.tuitionFee || 0) +
      Number(form.booksFee || 0) +
      Number(form.uniformFee || 0) +
      Number(form.transportFee || 0) +
      Number(form.otherFee || 0);

    const discount = Number(form.discount || 0);
    const scholarship = Number(
      form.scholarship || 0
    );

    const total = Math.max(
      0,
      subtotal - discount - scholarship
    );

    const paid = Math.max(
      0,
      Number(form.paid || 0)
    );

    const balance = Math.max(
      0,
      total - paid
    );

    let paymentStatus = "Pending";

    if (balance <= 0 && total > 0) {
      paymentStatus = "Paid";
    } else if (paid > 0) {
      paymentStatus = "Partial";
    }

    return {
      subtotal,
      discount,
      scholarship,
      total,
      paid,
      balance,
      paymentStatus,
    };
  }, [form]);

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    const nextErrors = {};

    if (!form.firstName?.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!form.lastName?.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!form.gender) {
      nextErrors.gender = "Gender is required.";
    }

    if (!form.dateOfBirth) {
      nextErrors.dateOfBirth =
        "Date of birth is required.";
    }

    if (!form.section) {
      nextErrors.section = "Section is required.";
    }

    if (!form.className) {
      nextErrors.className = "Class is required.";
    }

    if (!form.session) {
      nextErrors.session = "Session is required.";
    }

    if (!form.guardianName?.trim()) {
      nextErrors.guardianName =
        "Guardian name is required.";
    }

    if (!form.guardianPhone?.trim()) {
      nextErrors.guardianPhone =
        "Guardian phone is required.";
    }

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (
      form.guardianEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.guardianEmail
      )
    ) {
      nextErrors.guardianEmail =
        "Enter a valid guardian email.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* =====================================================
     TOAST
  ===================================================== */

  const showToast = (
    type,
    title,
    message
  ) => {
    setToast({
      type,
      title,
      message,
    });

    window.clearTimeout(
      showToast.timeoutId
    );

    showToast.timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = async () => {
    if (!validateForm()) {
      showToast(
        "error",
        "Check the form",
        "Please correct the highlighted fields before saving."
      );

      const firstError = Object.keys(
        errors
      )[0];

      if (firstError) {
        if (
          [
            "firstName",
            "lastName",
            "gender",
            "dateOfBirth",
            "email",
          ].includes(firstError)
        ) {
          setActiveSection("personal");
        } else if (
          [
            "section",
            "className",
            "session",
          ].includes(firstError)
        ) {
          setActiveSection("academic");
        } else {
          setActiveSection("guardian");
        }
      }

      return;
    }

    setSaving(true);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 650)
      );

      const students = JSON.parse(
        localStorage.getItem("school_students") || "[]"
      );

      const index = students.findIndex(
        (item) =>
          String(item.id) === String(id)
      );

      if (index === -1) {
        throw new Error(
          "Student record no longer exists."
        );
      }

      const existingStudent =
        normalizeStudent(students[index]);

      const fullName = [
        form.firstName,
        form.middleName,
        form.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      const updatedStudent = {
        ...existingStudent,

        /* Personal */
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        fullName,

        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        nationality: form.nationality,
        state: form.state,
        lga: form.lga,
        religion: form.religion,
        bloodGroup: form.bloodGroup,
        genotype: form.genotype,
        address: form.address,
        phone: form.phone,
        email: form.email,

        /* Academic */
        section: form.section,
        className: form.className,
        session: form.session,
        term: form.term,
        admissionDate: form.admissionDate,
        studentType: form.studentType,

        /* Guardian */
        fatherName: form.fatherName,
        motherName: form.motherName,
        guardianName: form.guardianName,
        guardianRelationship:
          form.guardianRelationship,
        guardianPhone: form.guardianPhone,
        guardianEmail: form.guardianEmail,
        guardianAddress: form.guardianAddress,
        guardianOccupation:
          form.guardianOccupation,

        /* Medical */
        medical: {
          ...(existingStudent.medical || {}),
          bloodGroup: form.bloodGroup,
          genotype: form.genotype,
          allergies: form.allergies,
          medicalConditions:
            form.medicalConditions,
          emergencyContact:
            form.emergencyContact,
          doctor: form.doctor,
          hospital: form.hospital,
        },

        /* Photo */
        photo,

        /* Documents */
        documents,

        /* Fees */
        fees: {
          ...(existingStudent.fees || {}),
          registrationFee:
            Number(form.registrationFee) || 0,
          tuitionFee:
            Number(form.tuitionFee) || 0,
          booksFee:
            Number(form.booksFee) || 0,
          uniformFee:
            Number(form.uniformFee) || 0,
          transportFee:
            Number(form.transportFee) || 0,
          otherFee:
            Number(form.otherFee) || 0,
          discount:
            Number(form.discount) || 0,
          scholarship:
            Number(form.scholarship) || 0,
          subtotal:
            feeSummary.subtotal,
          total:
            feeSummary.total,
          paid:
            feeSummary.paid,
          balance:
            feeSummary.balance,
          paymentStatus:
            feeSummary.paymentStatus,
        },

        /* Payment */
        payment: {
          ...(existingStudent.payment || {}),
          amount: feeSummary.paid,
          method: form.paymentMethod,
          reference:
            form.paymentReference,
          date:
            feeSummary.paid > 0
              ? existingStudent.payment
                  ?.date ||
                new Date().toISOString()
              : "",
        },

        /* Metadata */
        updatedAt:
          new Date().toISOString(),

        activity: [
          {
            id: createId("activity"),
            type: "profile_update",
            title:
              "Student profile updated",
            description:
              "Student information was updated from the student profile editor.",
            date:
              new Date().toISOString(),
          },
          ...(existingStudent.activity ||
            []),
        ],
      };

      students[index] = updatedStudent;

      localStorage.setItem(
        "school_students",
        JSON.stringify(students)
      );

      setStudent(
        normalizeStudent(updatedStudent)
      );

      setDirty(false);

      showToast(
        "success",
        "Changes saved",
        `${fullName}'s profile has been updated successfully.`
      );

      setTimeout(() => {
        navigate(`/students/${id}`);
      }, 900);
    } catch (error) {
      console.error(error);

      showToast(
        "error",
        "Save failed",
        error.message ||
          "Something went wrong while saving the student."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     CANCEL
  ===================================================== */

  const handleCancel = () => {
    if (dirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave this page?"
      );

      if (!confirmed) return;
    }

    navigate(`/students/${id}`);
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <>
        <style>{`
          @keyframes editPageEnter {
            from {
              opacity: 0;
              transform: translateY(14px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .edit-loading {
            animation: editPageEnter .45s ease-out both;
          }
        `}</style>

        <div className="min-h-screen bg-slate-50 p-6">
          <div className="edit-loading mx-auto max-w-7xl">
            <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />

            <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
              <div className="h-96 animate-pulse rounded-3xl bg-white" />

              <div className="space-y-6">
                <div className="h-64 animate-pulse rounded-3xl bg-white" />
                <div className="h-64 animate-pulse rounded-3xl bg-white" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* =====================================================
     NOT FOUND
  ===================================================== */

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
            <UserRound className="h-10 w-10 text-slate-400" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Student not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            The student record may have been removed,
            the registration may not have completed, or
            the student ID is invalid.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/students")
            }
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  const navItems = [
    {
      id: "personal",
      label: "Personal",
      icon: User,
    },
    {
      id: "academic",
      label: "Academic",
      icon: GraduationCap,
    },
    {
      id: "guardian",
      label: "Guardian",
      icon: Users,
    },
    {
      id: "medical",
      label: "Medical",
      icon: HeartPulse,
    },
    {
      id: "fees",
      label: "Fees",
      icon: Wallet,
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
    },
  ];

  return (
    <>
      <style>{`
        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes toastEnter {
          from {
            opacity: 0;
            transform: translateY(-15px) scale(.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes floating {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-4px);
          }
        }

        .edit-page {
          animation: pageEnter .5s ease-out both;
        }

        .edit-card {
          animation: cardEnter .55s ease-out both;
        }

        .edit-floating {
          animation: floating 3s ease-in-out infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        @media (prefers-reduced-motion: reduce) {
          .edit-page,
          .edit-card,
          .edit-floating {
            animation: none !important;
          }
        }
      `}</style>

      <div className="edit-page min-h-screen bg-slate-50 pb-32">
        {/* =================================================
            HERO
        ================================================= */}

        <div className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Top actions */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Back to Profile
                </span>
                <span className="sm:hidden">
                  Back
                </span>
              </button>

              {dirty && (
                <div className="flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                  Unsaved changes
                </div>
              )}
            </div>

            {/* Student hero */}
            <div className="mt-8 flex flex-col gap-6 pb-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="edit-floating relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl">
                  {photo ? (
                    <img
                      src={photo}
                      alt={student.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white">
                      {student.fullName
                        .split(" ")
                        .map((name) =>
                          name[0]
                        )
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                    Edit Student
                  </p>

                  <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {student.fullName}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>
                      {student.admissionNo ||
                        "No admission number"}
                    </span>

                    <span className="h-1 w-1 rounded-full bg-slate-600" />

                    <span>
                      {student.className ||
                        "Class not assigned"}
                    </span>

                    <span className="h-1 w-1 rounded-full bg-slate-600" />

                    <span>
                      {student.section ||
                        "Section not assigned"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
            {/* =================================================
                SIDE NAV
            ================================================= */}

            <aside className="lg:sticky lg:top-6 lg:h-fit">
              <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="px-3 pb-3 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Edit Sections
                </p>

                <nav className="space-y-1">
                  {navItems.map(
                    (item, index) => {
                      const Icon = item.icon;
                      const active =
                        activeSection === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setActiveSection(
                              item.id
                            )
                          }
                          className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                            active
                              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                              active
                                ? "bg-white/10 text-sky-300"
                                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold">
                              {item.label}
                            </p>

                            <p
                              className={`text-[10px] ${
                                active
                                  ? "text-slate-400"
                                  : "text-slate-400"
                              }`}
                            >
                              Section {index + 1}
                            </p>
                          </div>
                        </button>
                      );
                    }
                  )}
                </nav>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />

                    <span className="text-xs font-bold text-slate-700">
                      Profile protection
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] leading-5 text-slate-500">
                    Existing academic records,
                    results, attendance and
                    activity history are preserved
                    when you save.
                  </p>
                </div>
              </div>
            </aside>

            {/* =================================================
                FORMS
            ================================================= */}

            <main className="min-w-0 space-y-6">
              {/* =================================================
                  PERSONAL
              ================================================= */}

              <section
                id="personal"
                className="edit-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                style={{
                  animationDelay: "80ms",
                }}
              >
                <SectionHeader
                  icon={User}
                  number="1"
                  title="Personal Information"
                  description="Update the student's identity, contact information and personal details."
                />

                {/* Photo */}
                <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-slate-200 shadow-md">
                      {photo ? (
                        <img
                          src={photo}
                          alt="Student"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-900 text-xl font-black text-white">
                          {student.fullName
                            .split(" ")
                            .map(
                              (name) =>
                                name[0]
                            )
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}

                      <label className="absolute bottom-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-white text-slate-700 shadow-lg transition hover:scale-105">
                        <Camera className="h-4 w-4" />

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={
                            handlePhotoChange
                          }
                        />
                      </label>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Student photograph
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Use a clear passport-style
                        photograph. Maximum file size:
                        5MB.
                      </p>

                      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-600">
                        <Upload className="h-3.5 w-3.5" />
                        Change Photo

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={
                            handlePhotoChange
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <InputField
                    label="First Name"
                    required
                    value={form.firstName}
                    onChange={(value) =>
                      updateField(
                        "firstName",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Middle Name"
                    value={form.middleName}
                    onChange={(value) =>
                      updateField(
                        "middleName",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Last Name"
                    required
                    value={form.lastName}
                    onChange={(value) =>
                      updateField(
                        "lastName",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Date of Birth"
                    required
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(value) =>
                      updateField(
                        "dateOfBirth",
                        value
                      )
                    }
                    icon={CalendarDays}
                  />

                  <SelectField
                    label="Gender"
                    required
                    value={form.gender}
                    onChange={(value) =>
                      updateField(
                        "gender",
                        value
                      )
                    }
                    options={[
                      "Male",
                      "Female",
                    ]}
                  />

                  <InputField
                    label="Nationality"
                    value={form.nationality}
                    onChange={(value) =>
                      updateField(
                        "nationality",
                        value
                      )
                    }
                  />

                  <InputField
                    label="State of Origin"
                    value={form.state}
                    onChange={(value) =>
                      updateField(
                        "state",
                        value
                      )
                    }
                  />

                  <InputField
                    label="LGA"
                    value={form.lga}
                    onChange={(value) =>
                      updateField(
                        "lga",
                        value
                      )
                    }
                  />

                  <SelectField
                    label="Religion"
                    value={form.religion}
                    onChange={(value) =>
                      updateField(
                        "religion",
                        value
                      )
                    }
                    options={[
                      "Islam",
                      "Christianity",
                      "Traditional",
                      "Other",
                    ]}
                  />

                  <SelectField
                    label="Blood Group"
                    value={form.bloodGroup}
                    onChange={(value) =>
                      updateField(
                        "bloodGroup",
                        value
                      )
                    }
                    options={[
                      "A+",
                      "A-",
                      "B+",
                      "B-",
                      "AB+",
                      "AB-",
                      "O+",
                      "O-",
                    ]}
                  />

                  <SelectField
                    label="Genotype"
                    value={form.genotype}
                    onChange={(value) =>
                      updateField(
                        "genotype",
                        value
                      )
                    }
                    options={[
                      "AA",
                      "AS",
                      "SS",
                      "AC",
                      "SC",
                    ]}
                  />

                  <InputField
                    label="Phone"
                    value={form.phone}
                    onChange={(value) =>
                      updateField(
                        "phone",
                        value
                      )
                    }
                    icon={Phone}
                  />

                  <InputField
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) =>
                      updateField(
                        "email",
                        value
                      )
                    }
                    icon={Mail}
                  />

                  <div className="md:col-span-2 xl:col-span-3">
                    <TextAreaField
                      label="Residential Address"
                      value={form.address}
                      onChange={(value) =>
                        updateField(
                          "address",
                          value
                        )
                      }
                      placeholder="Enter student's residential address..."
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  ACADEMIC
              ================================================= */}

              <section
                id="academic"
                className="edit-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                style={{
                  animationDelay: "140ms",
                }}
              >
                <SectionHeader
                  icon={GraduationCap}
                  number="2"
                  title="Academic & Enrollment"
                  description="Manage the student's school section, class placement, session and enrollment information."
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <SelectField
                    label="Section"
                    required
                    value={form.section}
                    onChange={(value) =>
                      updateField(
                        "section",
                        value
                      )
                    }
                    options={[
                      "Nursery",
                      "Primary",
                      "Secondary",
                    ]}
                  />

                  <SelectField
                    label="Class"
                    required
                    value={form.className}
                    onChange={(value) =>
                      updateField(
                        "className",
                        value
                      )
                    }
                    options={[
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
                    ]}
                  />

                  <SelectField
                    label="Session"
                    required
                    value={form.session}
                    onChange={(value) =>
                      updateField(
                        "session",
                        value
                      )
                    }
                    options={[
                      "2025/2026",
                      "2026/2027",
                      "2027/2028",
                    ]}
                  />

                  <SelectField
                    label="Current Term"
                    value={form.term}
                    onChange={(value) =>
                      updateField(
                        "term",
                        value
                      )
                    }
                    options={[
                      "First Term",
                      "Second Term",
                      "Third Term",
                    ]}
                  />

                  <SelectField
                    label="Student Type"
                    value={form.studentType}
                    onChange={(value) =>
                      updateField(
                        "studentType",
                        value
                      )
                    }
                    options={[
                      "New Student",
                      "Returning Student",
                      "Transfer Student",
                    ]}
                  />

                  <InputField
                    label="Admission Date"
                    type="date"
                    value={form.admissionDate}
                    onChange={(value) =>
                      updateField(
                        "admissionDate",
                        value
                      )
                    }
                    icon={CalendarDays}
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <div className="flex items-start gap-3">
                    <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />

                    <div>
                      <p className="text-sm font-bold text-sky-900">
                        Academic records are preserved
                      </p>

                      <p className="mt-1 text-xs leading-5 text-sky-700">
                        Changing the student's class or
                        session here does not delete their
                        previous results, assignments,
                        attendance or academic history.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  GUARDIAN
              ================================================= */}

              <section
                id="guardian"
                className="edit-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                style={{
                  animationDelay: "200ms",
                }}
              >
                <SectionHeader
                  icon={Users}
                  number="3"
                  title="Parent & Guardian"
                  description="Maintain the contact information used for parent communication, emergencies and school notifications."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Father's Name"
                    value={form.fatherName}
                    onChange={(value) =>
                      updateField(
                        "fatherName",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Mother's Name"
                    value={form.motherName}
                    onChange={(value) =>
                      updateField(
                        "motherName",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Primary Guardian"
                    required
                    value={form.guardianName}
                    onChange={(value) =>
                      updateField(
                        "guardianName",
                        value
                      )
                    }
                    icon={UserRound}
                  />

                  <SelectField
                    label="Relationship"
                    value={
                      form.guardianRelationship
                    }
                    onChange={(value) =>
                      updateField(
                        "guardianRelationship",
                        value
                      )
                    }
                    options={[
                      "Father",
                      "Mother",
                      "Uncle",
                      "Aunt",
                      "Brother",
                      "Sister",
                      "Grandfather",
                      "Grandmother",
                      "Legal Guardian",
                      "Other",
                    ]}
                  />

                  <InputField
                    label="Guardian Phone"
                    required
                    value={form.guardianPhone}
                    onChange={(value) =>
                      updateField(
                        "guardianPhone",
                        value
                      )
                    }
                    icon={Phone}
                  />

                  <InputField
                    label="Guardian Email"
                    type="email"
                    value={form.guardianEmail}
                    onChange={(value) =>
                      updateField(
                        "guardianEmail",
                        value
                      )
                    }
                    icon={Mail}
                  />

                  <InputField
                    label="Occupation"
                    value={
                      form.guardianOccupation
                    }
                    onChange={(value) =>
                      updateField(
                        "guardianOccupation",
                        value
                      )
                    }
                  />

                  <div />

                  <div className="md:col-span-2">
                    <TextAreaField
                      label="Guardian Address"
                      value={form.guardianAddress}
                      onChange={(value) =>
                        updateField(
                          "guardianAddress",
                          value
                        )
                      }
                      placeholder="Enter guardian's residential or contact address..."
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  MEDICAL
              ================================================= */}

              <section
                id="medical"
                className="edit-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                style={{
                  animationDelay: "260ms",
                }}
              >
                <SectionHeader
                  icon={HeartPulse}
                  number="4"
                  title="Medical Information"
                  description="Maintain important health and emergency information for authorized school staff."
                />

                <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                    <div>
                      <p className="text-sm font-bold text-amber-900">
                        Restricted information
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-700">
                        Medical information should only be
                        accessible to authorized staff.
                        Backend permissions should enforce
                        this in the production system.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <TextAreaField
                    label="Allergies"
                    value={form.allergies}
                    onChange={(value) =>
                      updateField(
                        "allergies",
                        value
                      )
                    }
                    placeholder="Known allergies..."
                  />

                  <TextAreaField
                    label="Medical Conditions"
                    value={
                      form.medicalConditions
                    }
                    onChange={(value) =>
                      updateField(
                        "medicalConditions",
                        value
                      )
                    }
                    placeholder="Existing medical conditions..."
                  />

                  <InputField
                    label="Emergency Contact"
                    value={
                      form.emergencyContact
                    }
                    onChange={(value) =>
                      updateField(
                        "emergencyContact",
                        value
                      )
                    }
                    icon={Phone}
                  />

                  <InputField
                    label="Doctor"
                    value={form.doctor}
                    onChange={(value) =>
                      updateField(
                        "doctor",
                        value
                      )
                    }
                  />

                  <div className="md:col-span-2">
                    <InputField
                      label="Preferred Hospital / Clinic"
                      value={form.hospital}
                      onChange={(value) =>
                        updateField(
                          "hospital",
                          value
                        )
                      }
                      icon={HeartPulse}
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  FEES
              ================================================= */}

              <section
                id="fees"
                className="edit-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                style={{
                  animationDelay: "320ms",
                }}
              >
                <SectionHeader
                  icon={Wallet}
                  number="5"
                  title="Fees & Payment"
                  description="Review the student's fee structure, discounts, scholarship and payment information."
                />

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <MoneyField
                    label="Registration Fee"
                    value={
                      form.registrationFee
                    }
                    onChange={(value) =>
                      updateField(
                        "registrationFee",
                        value
                      )
                    }
                  />

                  <MoneyField
                    label="Tuition Fee"
                    value={form.tuitionFee}
                    onChange={(value) =>
                      updateField(
                        "tuitionFee",
                        value
                      )
                    }
                  />

                  <MoneyField
                    label="Books Fee"
                    value={form.booksFee}
                    onChange={(value) =>
                      updateField(
                        "booksFee",
                        value
                      )
                    }
                  />

                  <MoneyField
                    label="Uniform Fee"
                    value={form.uniformFee}
                    onChange={(value) =>
                      updateField(
                        "uniformFee",
                        value
                      )
                    }
                  />

                  <MoneyField
                    label="Transport Fee"
                    value={form.transportFee}
                    onChange={(value) =>
                      updateField(
                        "transportFee",
                        value
                      )
                    }
                  />

                  <MoneyField
                    label="Other Fee"
                    value={form.otherFee}
                    onChange={(value) =>
                      updateField(
                        "otherFee",
                        value
                      )
                    }
                  />

                  <MoneyField
                    label="Discount"
                    value={form.discount}
                    onChange={(value) =>
                      updateField(
                        "discount",
                        value
                      )
                    }
                  />

                  <MoneyField
                    label="Scholarship"
                    value={form.scholarship}
                    onChange={(value) =>
                      updateField(
                        "scholarship",
                        value
                      )
                    }
                  />

                  <MoneyField
                    label="Amount Paid"
                    value={form.paid}
                    onChange={(value) =>
                      updateField(
                        "paid",
                        value
                      )
                    }
                  />
                </div>

                {/* Fee summary */}
                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold text-slate-500">
                      Subtotal
                    </p>

                    <p className="mt-2 text-xl font-black text-slate-900">
                      {money(
                        feeSummary.subtotal
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold text-slate-500">
                      Adjustments
                    </p>

                    <p className="mt-2 text-xl font-black text-slate-900">
                      {money(
                        feeSummary.discount +
                          feeSummary.scholarship
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                    <p className="text-xs font-bold text-sky-600">
                      Total Due
                    </p>

                    <p className="mt-2 text-xl font-black text-sky-900">
                      {money(
                        feeSummary.total
                      )}
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 ${
                      feeSummary.balance <= 0
                        ? "border-emerald-100 bg-emerald-50"
                        : "border-amber-100 bg-amber-50"
                    }`}
                  >
                    <p
                      className={`text-xs font-bold ${
                        feeSummary.balance <=
                        0
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      Balance
                    </p>

                    <p
                      className={`mt-2 text-xl font-black ${
                        feeSummary.balance <=
                        0
                          ? "text-emerald-900"
                          : "text-amber-900"
                      }`}
                    >
                      {money(
                        feeSummary.balance
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="Payment Method"
                    value={
                      form.paymentMethod
                    }
                    onChange={(value) =>
                      updateField(
                        "paymentMethod",
                        value
                      )
                    }
                    options={[
                      "Cash",
                      "Bank Transfer",
                      "POS",
                      "Online Payment",
                      "Cheque",
                    ]}
                  />

                  <InputField
                    label="Payment Reference"
                    value={
                      form.paymentReference
                    }
                    onChange={(value) =>
                      updateField(
                        "paymentReference",
                        value
                      )
                    }
                    icon={CreditCard}
                  />
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      feeSummary.paymentStatus ===
                      "Paid"
                        ? "bg-emerald-50 text-emerald-600"
                        : feeSummary.paymentStatus ===
                          "Partial"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Payment status
                    </p>

                    <p className="text-xs text-slate-500">
                      {feeSummary.paymentStatus}
                    </p>
                  </div>
                </div>
              </section>

              {/* =================================================
                  DOCUMENTS
              ================================================= */}

              <section
                id="documents"
                className="edit-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                style={{
                  animationDelay: "380ms",
                }}
              >
                <SectionHeader
                  icon={FileText}
                  number="6"
                  title="Student Documents"
                  description="Manage documents attached to the student's school record."
                />

                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition hover:border-sky-300 hover:bg-sky-50/50">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-500 shadow-sm transition group-hover:-translate-y-1">
                    <Upload className="h-6 w-6" />
                  </div>

                  <p className="mt-4 text-sm font-bold text-slate-900">
                    Upload documents
                  </p>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                    Add birth certificates, previous
                    school records, identification,
                    medical records or other required
                    documents.
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition group-hover:bg-sky-600">
                    <Plus className="h-4 w-4" />
                    Choose Files
                  </span>

                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={
                      handleDocumentUpload
                    }
                  />
                </label>

                <div className="mt-6 space-y-3">
                  {documents.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                      <FileText className="mx-auto h-8 w-8 text-slate-300" />

                      <p className="mt-3 text-sm font-bold text-slate-700">
                        No documents attached
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Uploaded documents will appear
                        here.
                      </p>
                    </div>
                  ) : (
                    documents.map(
                      (document) => (
                        <div
                          key={document.id}
                          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                            <FileCheck2 className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {document.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {document.status ||
                                "Uploaded"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeDocument(
                                document.id
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Remove document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    )
                  )}
                </div>
              </section>
            </main>
          </div>
        </div>

        {/* =================================================
            STICKY SAVE BAR
        ================================================= */}

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-10px_30px_rgba(15,23,42,.08)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="hidden items-center gap-3 sm:flex">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  dirty
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {dirty ? (
                  <RefreshCw className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900">
                  {dirty
                    ? "Unsaved changes"
                    : "All changes saved"}
                </p>

                <p className="text-[11px] text-slate-400">
                  {dirty
                    ? "Save your changes before leaving."
                    : "Student profile is up to date."}
                </p>
              </div>
            </div>

            <div className="ml-auto flex w-full gap-3 sm:w-auto">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <Toast
          toast={toast}
          onClose={() => setToast(null)}
        />
      </div>
    </>
  );
}