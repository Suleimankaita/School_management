import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  HeartPulse,
  IdCard,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Paperclip,
  Pencil,
  Phone,
  Printer,
  Receipt,
  RefreshCcw,
  Save,
  School,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const DRAFT_KEY = "school_student_registration_draft";
const STUDENTS_KEY = "school_students";
const ADMISSION_SEQUENCE_KEY = "school_admission_sequence";
const RECEIPT_SEQUENCE_KEY = "school_receipt_sequence";

const SCHOOL = {
  name: "YS International Academy",
  motto: "Knowledge • Character • Excellence",
  address: "Katsina, Katsina State, Nigeria",
  phone: "+234 800 000 0000",
  email: "info@ysacademy.edu.ng",
  website: "www.ysacademy.edu.ng",
};

const STEPS = [
  {
    id: 1,
    title: "Personal",
    description: "Basic student information",
    icon: User,
  },
  {
    id: 2,
    title: "Academic",
    description: "Class and admission details",
    icon: GraduationCap,
  },
  {
    id: 3,
    title: "Guardian",
    description: "Parent and guardian details",
    icon: Users,
  },
  {
    id: 4,
    title: "Medical",
    description: "Health and emergency details",
    icon: HeartPulse,
  },
  {
    id: 5,
    title: "Documents",
    description: "Required documents",
    icon: FileText,
  },
  {
    id: 6,
    title: "Fees",
    description: "Fees and payment",
    icon: Wallet,
  },
  {
    id: 7,
    title: "Review",
    description: "Verify and register",
    icon: ClipboardList,
  },
];

const initialForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "Nigerian",
  stateOfOrigin: "",
  lga: "",
  religion: "",
  bloodGroup: "",
  genotype: "",
  address: "",
  phone: "",
  email: "",

  admissionNumber: "",
  admissionDate: new Date().toISOString().slice(0, 10),
  section: "",
  className: "",
  previousSchool: "",
  previousClass: "",
  session: "2026/2027",
  term: "First Term",
  studentType: "New Student",

  fatherName: "",
  fatherPhone: "",
  fatherEmail: "",
  fatherOccupation: "",

  motherName: "",
  motherPhone: "",
  motherEmail: "",
  motherOccupation: "",

  guardianName: "",
  guardianRelationship: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianAddress: "",

  allergies: "",
  medicalConditions: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  doctorName: "",
  hospitalName: "",

  registrationFee: 10000,
  tuitionFee: 50000,
  booksFee: 10000,
  uniformFee: 15000,
  transportFee: 0,
  otherFee: 0,

  discount: 0,
  scholarship: 0,

  paymentAmount: 0,
  paymentMethod: "Cash",
  paymentReference: "",
  paymentNotes: "",
};

/* =========================================================
   HELPERS
========================================================= */

function createId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function generateAdmissionNumber() {
  const currentYear = new Date().getFullYear();

  const currentSequence = Number(
    localStorage.getItem(ADMISSION_SEQUENCE_KEY) || 0
  );

  const nextSequence = currentSequence + 1;

  localStorage.setItem(
    ADMISSION_SEQUENCE_KEY,
    String(nextSequence)
  );

  return `ADM-${currentYear}-${String(nextSequence).padStart(4, "0")}`;
}

function generateReceiptNumber() {
  const currentYear = new Date().getFullYear();

  const currentSequence = Number(
    localStorage.getItem(RECEIPT_SEQUENCE_KEY) || 0
  );

  const nextSequence = currentSequence + 1;

  localStorage.setItem(
    RECEIPT_SEQUENCE_KEY,
    String(nextSequence)
  );

  return `RCT-${currentYear}-${String(nextSequence).padStart(5, "0")}`;
}

/* =========================================================
   PRINT SYSTEM
========================================================= */

function printDocument(title, content) {
  const printWindow = window.open(
    "",
    "_blank",
    "width=1000,height=850"
  );

  if (!printWindow) {
    alert(
      "The print window was blocked by your browser. Please allow popups for this website."
    );
    return;
  }

  printWindow.document.open();

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>

        <meta charset="UTF-8" />

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 30px;
            background: #f1f5f9;
            color: #0f172a;
            font-family:
              Inter,
              Arial,
              Helvetica,
              sans-serif;
          }

          .page {
            width: 210mm;
            min-height: 297mm;
            margin: auto;
            background: white;
            padding: 18mm;
            box-shadow: 0 10px 40px rgba(15, 23, 42, 0.12);
          }

          .school-header {
            display: flex;
            align-items: center;
            gap: 18px;
            padding-bottom: 18px;
            border-bottom: 3px solid #0f172a;
          }

          .school-logo {
            width: 70px;
            height: 70px;
            border-radius: 16px;
            background: #0f172a;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 25px;
            font-weight: 800;
          }

          .school-name {
            margin: 0;
            font-size: 25px;
            font-weight: 800;
          }

          .motto {
            margin: 4px 0;
            font-size: 13px;
            color: #475569;
          }

          .school-contact {
            font-size: 11px;
            color: #64748b;
            line-height: 1.6;
          }

          .document-title {
            text-align: center;
            margin: 30px 0 25px;
          }

          .document-title h1 {
            margin: 0;
            font-size: 22px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .document-title p {
            margin-top: 7px;
            color: #64748b;
            font-size: 12px;
          }

          .section {
            margin-top: 24px;
          }

          .section-title {
            background: #f8fafc;
            border-left: 4px solid #0f172a;
            padding: 9px 12px;
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .4px;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-top: 12px;
          }

          .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-top: 12px;
          }

          .field {
            border: 1px solid #e2e8f0;
            padding: 10px;
            border-radius: 8px;
          }

          .label {
            font-size: 10px;
            color: #64748b;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: .4px;
          }

          .value {
            font-size: 12px;
            font-weight: 600;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }

          th,
          td {
            border: 1px solid #e2e8f0;
            padding: 9px;
            text-align: left;
            font-size: 11px;
          }

          th {
            background: #f8fafc;
            font-weight: 800;
          }

          .total-row td {
            font-weight: 800;
            background: #f8fafc;
          }

          .text {
            font-size: 12px;
            line-height: 1.8;
          }

          .signature-area {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            margin-top: 60px;
          }

          .signature {
            border-top: 1px solid #0f172a;
            padding-top: 8px;
            font-size: 11px;
            text-align: center;
          }

          .stamp {
            width: 100px;
            height: 100px;
            border: 2px dashed #94a3b8;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            font-size: 10px;
            text-align: center;
            margin: 25px auto;
          }

          .footer {
            margin-top: 45px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 10px;
          }

          .profile-photo {
            width: 105px;
            height: 125px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
          }

          .profile-header {
            display: flex;
            gap: 20px;
            align-items: flex-start;
          }

          .receipt {
            max-width: 720px;
            margin: auto;
          }

          .receipt-number {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
          }

          .amount-box {
            margin-top: 20px;
            padding: 18px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
          }

          .amount-box .amount {
            font-size: 26px;
            font-weight: 900;
          }

          .notice {
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
            font-size: 11px;
            line-height: 1.7;
          }

          @page {
            size: A4;
            margin: 10mm;
          }

          @media print {
            body {
              padding: 0;
              background: white;
            }

            .page {
              width: auto;
              min-height: auto;
              padding: 0;
              box-shadow: none;
            }

            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>

      <body>
        ${content}

        <script>
          window.onload = function () {
            setTimeout(function () {
              window.print();
            }, 400);
          };

          window.onafterprint = function () {
            window.close();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

function schoolHeader() {
  return `
    <div class="school-header">
      <div class="school-logo">YS</div>

      <div>
        <h1 class="school-name">
          ${escapeHtml(SCHOOL.name)}
        </h1>

        <div class="motto">
          ${escapeHtml(SCHOOL.motto)}
        </div>

        <div class="school-contact">
          ${escapeHtml(SCHOOL.address)}<br />
          ${escapeHtml(SCHOOL.phone)} ·
          ${escapeHtml(SCHOOL.email)} ·
          ${escapeHtml(SCHOOL.website)}
        </div>
      </div>
    </div>
  `;
}

function fieldHtml(label, value) {
  return `
    <div class="field">
      <div class="label">${escapeHtml(label)}</div>
      <div class="value">${escapeHtml(value || "—")}</div>
    </div>
  `;
}

/* =========================================================
   DOCUMENT PRINT FUNCTIONS
========================================================= */

function printAdmissionLetter(student) {
  const content = `
    <div class="page">

      ${schoolHeader()}

      <div class="document-title">
        <h1>Admission Letter</h1>
        <p>
          Admission No: ${escapeHtml(student.admissionNumber)}
        </p>
      </div>

      <div class="text">
        <strong>Date:</strong>
        ${escapeHtml(formatDate(student.admissionDate))}
      </div>

      <div class="section">
        <div class="section-title">
          Admission Details
        </div>

        <div class="grid">
          ${fieldHtml("Student Name", student.fullName)}
          ${fieldHtml("Admission Number", student.admissionNumber)}
          ${fieldHtml("Section", student.section)}
          ${fieldHtml("Class", student.className)}
          ${fieldHtml("Academic Session", student.session)}
          ${fieldHtml("Term", student.term)}
        </div>
      </div>

      <div class="section">

        <p class="text">
          Dear Parent/Guardian,
        </p>

        <p class="text">
          We are pleased to inform you that
          <strong>${escapeHtml(student.fullName)}</strong>
          has been offered admission into
          <strong>${escapeHtml(student.className)}</strong>
          at ${escapeHtml(SCHOOL.name)}
          for the ${escapeHtml(student.session)} academic session.
        </p>

        <p class="text">
          The school expects every student to uphold the values of
          discipline, respect, academic excellence and good character.
          Parents and guardians are encouraged to maintain regular
          communication with the school and support the student's
          academic and personal development.
        </p>

        <p class="text">
          Please retain this admission letter for your records and
          present it when requested by the school administration.
        </p>

      </div>

      <div class="notice">
        <strong>Important:</strong>
        Admission remains subject to completion of all required
        registration documents and applicable school fees.
      </div>

      <div class="signature-area">

        <div>
          <div style="height:45px"></div>
          <div class="signature">
            Principal / Head of School
          </div>
        </div>

        <div>
          <div class="stamp">
            SCHOOL<br />STAMP
          </div>
        </div>

      </div>

      <div class="footer">
        Official admission document · ${escapeHtml(SCHOOL.name)}
      </div>

    </div>
  `;

  printDocument("Admission Letter", content);
}

function printStudentProfile(student) {
  const photo = student.photo
    ? `
      <img
        src="${student.photo}"
        class="profile-photo"
        alt="Student"
      />
    `
    : `
      <div class="profile-photo"
        style="
          display:flex;
          align-items:center;
          justify-content:center;
          background:#f8fafc;
          color:#94a3b8;
          font-size:11px;
        "
      >
        NO PHOTO
      </div>
    `;

  const content = `
    <div class="page">

      ${schoolHeader()}

      <div class="document-title">
        <h1>Student Profile</h1>
        <p>
          Official Student Information Record
        </p>
      </div>

      <div class="profile-header">

        ${photo}

        <div style="flex:1">
          <div class="grid" style="margin-top:0">
            ${fieldHtml("Full Name", student.fullName)}
            ${fieldHtml("Admission No.", student.admissionNumber)}
            ${fieldHtml("Class", student.className)}
            ${fieldHtml("Section", student.section)}
          </div>
        </div>

      </div>

      <div class="section">
        <div class="section-title">
          Personal Information
        </div>

        <div class="grid">
          ${fieldHtml("Date of Birth", formatDate(student.dateOfBirth))}
          ${fieldHtml("Gender", student.gender)}
          ${fieldHtml("Nationality", student.nationality)}
          ${fieldHtml("State of Origin", student.stateOfOrigin)}
          ${fieldHtml("LGA", student.lga)}
          ${fieldHtml("Religion", student.religion)}
          ${fieldHtml("Phone", student.phone)}
          ${fieldHtml("Email", student.email)}
        </div>

        ${fieldHtml("Address", student.address)}
      </div>

      <div class="section">
        <div class="section-title">
          Academic Information
        </div>

        <div class="grid">
          ${fieldHtml("Academic Session", student.session)}
          ${fieldHtml("Current Term", student.term)}
          ${fieldHtml("Admission Date", formatDate(student.admissionDate))}
          ${fieldHtml("Student Type", student.studentType)}
          ${fieldHtml("Previous School", student.previousSchool)}
          ${fieldHtml("Previous Class", student.previousClass)}
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          Parent / Guardian Information
        </div>

        <div class="grid">
          ${fieldHtml("Father", student.fatherName)}
          ${fieldHtml("Father Phone", student.fatherPhone)}
          ${fieldHtml("Mother", student.motherName)}
          ${fieldHtml("Mother Phone", student.motherPhone)}
          ${fieldHtml("Guardian", student.guardianName)}
          ${fieldHtml("Relationship", student.guardianRelationship)}
          ${fieldHtml("Guardian Phone", student.guardianPhone)}
          ${fieldHtml("Guardian Email", student.guardianEmail)}
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          Medical Information
        </div>

        <div class="grid">
          ${fieldHtml("Blood Group", student.bloodGroup)}
          ${fieldHtml("Genotype", student.genotype)}
          ${fieldHtml("Allergies", student.allergies)}
          ${fieldHtml("Medical Conditions", student.medicalConditions)}
          ${fieldHtml("Emergency Contact", student.emergencyContactName)}
          ${fieldHtml("Emergency Phone", student.emergencyContactPhone)}
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          Financial Summary
        </div>

        <table>
          <tr>
            <th>Item</th>
            <th>Amount</th>
          </tr>

          <tr>
            <td>Registration Fee</td>
            <td>${money(student.fees.registrationFee)}</td>
          </tr>

          <tr>
            <td>Tuition Fee</td>
            <td>${money(student.fees.tuitionFee)}</td>
          </tr>

          <tr>
            <td>Books</td>
            <td>${money(student.fees.booksFee)}</td>
          </tr>

          <tr>
            <td>Uniform</td>
            <td>${money(student.fees.uniformFee)}</td>
          </tr>

          <tr>
            <td>Transport</td>
            <td>${money(student.fees.transportFee)}</td>
          </tr>

          <tr>
            <td>Other</td>
            <td>${money(student.fees.otherFee)}</td>
          </tr>

          <tr>
            <td>Discount / Scholarship</td>
            <td>-${money(student.fees.discount + student.fees.scholarship)}</td>
          </tr>

          <tr class="total-row">
            <td>Total</td>
            <td>${money(student.fees.total)}</td>
          </tr>

          <tr>
            <td>Paid</td>
            <td>${money(student.fees.paid)}</td>
          </tr>

          <tr class="total-row">
            <td>Balance</td>
            <td>${money(student.fees.balance)}</td>
          </tr>
        </table>
      </div>

      <div class="signature-area">
        <div>
          <div style="height:45px"></div>
          <div class="signature">
            Authorized Officer
          </div>
        </div>

        <div>
          <div style="height:45px"></div>
          <div class="signature">
            Principal / Head of School
          </div>
        </div>
      </div>

      <div class="footer">
        Printed on ${escapeHtml(formatDate(new Date()))}
      </div>

    </div>
  `;

  printDocument("Student Profile", content);
}

function printReceipt(student) {
  if (!student.payment || Number(student.payment.amount) <= 0) {
    alert("No payment was recorded for this student.");
    return;
  }

  const content = `
    <div class="page">

      <div class="receipt">

        ${schoolHeader()}

        <div class="document-title">
          <h1>Official Payment Receipt</h1>
          <p>
            School Finance Department
          </p>
        </div>

        <div class="grid">
          ${fieldHtml("Receipt Number", student.payment.receiptNumber)}
          ${fieldHtml("Payment Date", formatDate(student.payment.date))}
          ${fieldHtml("Student", student.fullName)}
          ${fieldHtml("Admission Number", student.admissionNumber)}
          ${fieldHtml("Class", student.className)}
          ${fieldHtml("Payment Method", student.payment.method)}
        </div>

        <div class="amount-box">
          <div class="label">Amount Received</div>
          <div class="amount">
            ${money(student.payment.amount)}
          </div>
        </div>

        <div class="section">

          <div class="section-title">
            Payment Details
          </div>

          <table>

            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>

            <tr>
              <td>Registration Fee</td>
              <td>${money(student.fees.registrationFee)}</td>
            </tr>

            <tr>
              <td>Tuition Fee</td>
              <td>${money(student.fees.tuitionFee)}</td>
            </tr>

            <tr>
              <td>Books</td>
              <td>${money(student.fees.booksFee)}</td>
            </tr>

            <tr>
              <td>Uniform</td>
              <td>${money(student.fees.uniformFee)}</td>
            </tr>

            <tr>
              <td>Transport</td>
              <td>${money(student.fees.transportFee)}</td>
            </tr>

            <tr>
              <td>Other Fees</td>
              <td>${money(student.fees.otherFee)}</td>
            </tr>

            <tr>
              <td>Discount / Scholarship</td>
              <td>
                -${money(
                  student.fees.discount +
                    student.fees.scholarship
                )}
              </td>
            </tr>

            <tr class="total-row">
              <td>Total Fees</td>
              <td>${money(student.fees.total)}</td>
            </tr>

            <tr>
              <td>Total Paid</td>
              <td>${money(student.fees.paid)}</td>
            </tr>

            <tr class="total-row">
              <td>Outstanding Balance</td>
              <td>${money(student.fees.balance)}</td>
            </tr>

          </table>

        </div>

        <div class="section">
          ${fieldHtml(
            "Payment Reference",
            student.payment.reference
          )}

          ${fieldHtml(
            "Payment Notes",
            student.payment.notes
          )}
        </div>

        <div class="signature-area">

          <div>
            <div style="height:45px"></div>
            <div class="signature">
              Cashier / Finance Officer
            </div>
          </div>

          <div>
            <div style="height:45px"></div>
            <div class="signature">
              Authorized Signature
            </div>
          </div>

        </div>

        <div class="footer">
          This receipt is system-generated and should be retained
          for future reference.
        </div>

      </div>

    </div>
  `;

  printDocument("Payment Receipt", content);
}

function printRegistrationSummary(student) {
  const content = `
    <div class="page">

      ${schoolHeader()}

      <div class="document-title">
        <h1>Registration Summary</h1>
        <p>
          Student registration record
        </p>
      </div>

      <div class="section">
        <div class="section-title">
          Student
        </div>

        <div class="grid">
          ${fieldHtml("Full Name", student.fullName)}
          ${fieldHtml("Admission Number", student.admissionNumber)}
          ${fieldHtml("Class", student.className)}
          ${fieldHtml("Section", student.section)}
          ${fieldHtml("Session", student.session)}
          ${fieldHtml("Term", student.term)}
          ${fieldHtml("Admission Date", formatDate(student.admissionDate))}
          ${fieldHtml("Status", student.status)}
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          Guardian
        </div>

        <div class="grid">
          ${fieldHtml("Father", student.fatherName)}
          ${fieldHtml("Father Phone", student.fatherPhone)}
          ${fieldHtml("Mother", student.motherName)}
          ${fieldHtml("Mother Phone", student.motherPhone)}
          ${fieldHtml("Guardian", student.guardianName)}
          ${fieldHtml(
            "Guardian Phone",
            student.guardianPhone
          )}
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          Documents
        </div>

        <div class="grid">
          ${fieldHtml(
            "Passport Photo",
            student.photo ? "Uploaded" : "Not uploaded"
          )}

          ${fieldHtml(
            "Documents Uploaded",
            `${student.documents?.length || 0}`
          )}
        </div>
      </div>

      <div class="section">

        <div class="section-title">
          Fees
        </div>

        <table>
          <tr>
            <th>Item</th>
            <th>Amount</th>
          </tr>

          <tr>
            <td>Total Fees</td>
            <td>${money(student.fees.total)}</td>
          </tr>

          <tr>
            <td>Paid</td>
            <td>${money(student.fees.paid)}</td>
          </tr>

          <tr class="total-row">
            <td>Balance</td>
            <td>${money(student.fees.balance)}</td>
          </tr>

          <tr>
            <td>Payment Status</td>
            <td>${escapeHtml(student.fees.paymentStatus)}</td>
          </tr>
        </table>

      </div>

      <div class="signature-area">

        <div>
          <div style="height:45px"></div>
          <div class="signature">
            Registration Officer
          </div>
        </div>

        <div>
          <div style="height:45px"></div>
          <div class="signature">
            Principal / Head of School
          </div>
        </div>

      </div>

      <div class="footer">
        Registration completed on ${escapeHtml(
          formatDate(student.registrationDate)
        )}
      </div>

    </div>
  `;

  printDocument("Registration Summary", content);
}

function printAllDocuments(student) {
  printAdmissionLetter(student);

  setTimeout(() => {
    printStudentProfile(student);
  }, 1000);

  setTimeout(() => {
    if (student.payment?.amount > 0) {
      printReceipt(student);
    }
  }, 2000);

  setTimeout(() => {
    printRegistrationSummary(student);
  }, 3000);
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function StudentRegistration() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState(() => {
    const saved = safeParse(
      localStorage.getItem(DRAFT_KEY),
      null
    );

    return saved
      ? { ...initialForm, ...saved }
      : initialForm;
  });

  const [errors, setErrors] = useState({});
  const [documents, setDocuments] = useState([]);
  const [photo, setPhoto] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredStudent, setRegisteredStudent] =
    useState(null);
  const [toast, setToast] = useState(null);

  const photoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  /* =======================================================
     AUTO SAVE
  ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify(form)
        );

        setLastSaved(new Date());
      } catch (error) {
        console.error("Draft save failed:", error);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [form]);

  /* =======================================================
     TOAST
  ======================================================= */

  function showToast(message, type = "success") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  /* =======================================================
     FORM HANDLING
  ======================================================= */

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateStep(step) {
    const nextErrors = {};

    if (step === 1) {
      if (!form.firstName.trim()) {
        nextErrors.firstName = "First name is required.";
      }

      if (!form.lastName.trim()) {
        nextErrors.lastName = "Last name is required.";
      }

      if (!form.dateOfBirth) {
        nextErrors.dateOfBirth =
          "Date of birth is required.";
      }

      if (!form.gender) {
        nextErrors.gender = "Select gender.";
      }

      if (!form.phone.trim()) {
        nextErrors.phone = "Phone number is required.";
      }

      if (!form.address.trim()) {
        nextErrors.address = "Address is required.";
      }
    }

    if (step === 2) {
      if (!form.section) {
        nextErrors.section = "Select a section.";
      }

      if (!form.className) {
        nextErrors.className = "Select a class.";
      }

      if (!form.session) {
        nextErrors.session =
          "Academic session is required.";
      }

      if (!form.term) {
        nextErrors.term = "Term is required.";
      }
    }

    if (step === 3) {
      if (
        !form.fatherName.trim() &&
        !form.motherName.trim() &&
        !form.guardianName.trim()
      ) {
        nextErrors.guardianName =
          "Provide at least one parent or guardian.";
      }

      if (
        !form.fatherPhone.trim() &&
        !form.motherPhone.trim() &&
        !form.guardianPhone.trim()
      ) {
        nextErrors.guardianPhone =
          "Provide at least one parent/guardian phone number.";
      }
    }

    if (step === 4) {
      if (!form.bloodGroup) {
        nextErrors.bloodGroup =
          "Select blood group.";
      }

      if (!form.genotype) {
        nextErrors.genotype = "Select genotype.";
      }

      if (!form.emergencyContactName.trim()) {
        nextErrors.emergencyContactName =
          "Emergency contact is required.";
      }

      if (!form.emergencyContactPhone.trim()) {
        nextErrors.emergencyContactPhone =
          "Emergency phone is required.";
      }
    }

    if (step === 5) {
      // Documents are optional at registration.
    }

    if (step === 6) {
      const total = calculateTotal();

      if (Number(form.paymentAmount) > total) {
        nextErrors.paymentAmount =
          "Payment cannot exceed the total fees.";
      }

      if (
        Number(form.paymentAmount) > 0 &&
        !form.paymentMethod
      ) {
        nextErrors.paymentMethod =
          "Select a payment method.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function validateAllSteps() {
    for (let step = 1; step <= 6; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return false;
      }
    }

    return true;
  }

  function nextStep() {
    if (!validateStep(currentStep)) {
      showToast(
        "Please correct the highlighted fields.",
        "error"
      );
      return;
    }

    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  function jumpToStep(step) {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  }

  /* =======================================================
     PHOTO
  ======================================================= */

  function handlePhotoUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "error");
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
      setPhoto(reader.result);
    };

    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhoto("");
  }

  /* =======================================================
     DOCUMENTS
  ======================================================= */

  function handleDocumentUpload(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const newDocuments = files.map((file) => ({
      id: createId("doc"),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }));

    setDocuments((prev) => [
      ...prev,
      ...newDocuments,
    ]);

    showToast(
      `${newDocuments.length} document${
        newDocuments.length > 1 ? "s" : ""
      } added.`
    );

    event.target.value = "";
  }

  function removeDocument(id) {
    setDocuments((prev) =>
      prev.filter((document) => document.id !== id)
    );
  }

  /* =======================================================
     FEES
  ======================================================= */

  const feeSubtotal = useMemo(() => {
    return (
      Number(form.registrationFee || 0) +
      Number(form.tuitionFee || 0) +
      Number(form.booksFee || 0) +
      Number(form.uniformFee || 0) +
      Number(form.transportFee || 0) +
      Number(form.otherFee || 0)
    );
  }, [form]);

  const feeReduction = useMemo(() => {
    return (
      Number(form.discount || 0) +
      Number(form.scholarship || 0)
    );
  }, [form]);

  const feeTotal = useMemo(() => {
    return Math.max(0, feeSubtotal - feeReduction);
  }, [feeSubtotal, feeReduction]);

  const feePaid = Number(form.paymentAmount || 0);

  const feeBalance = Math.max(0, feeTotal - feePaid);

  function calculateTotal() {
    const subtotal =
      Number(form.registrationFee || 0) +
      Number(form.tuitionFee || 0) +
      Number(form.booksFee || 0) +
      Number(form.uniformFee || 0) +
      Number(form.transportFee || 0) +
      Number(form.otherFee || 0);

    const reductions =
      Number(form.discount || 0) +
      Number(form.scholarship || 0);

    return Math.max(0, subtotal - reductions);
  }

  /* =======================================================
     FINAL REGISTRATION
  ======================================================= */

  function openRegistrationConfirmation() {
    if (!validateAllSteps()) {
      showToast(
        "Please complete the required information.",
        "error"
      );
      return;
    }

    setShowConfirm(true);
  }

  function registerStudent() {
    setShowConfirm(false);
    setIsSaving(true);

    setTimeout(() => {
      const admissionNumber =
        form.admissionNumber ||
        generateAdmissionNumber();

      const paymentAmount = Number(
        form.paymentAmount || 0
      );

      let payment = null;

      if (paymentAmount > 0) {
        payment = {
          id: createId("payment"),
          receiptNumber: generateReceiptNumber(),
          amount: paymentAmount,
          method: form.paymentMethod,
          reference: form.paymentReference,
          notes: form.paymentNotes,
          date: new Date().toISOString(),
        };
      }

      const paymentStatus =
        feeBalance <= 0
          ? "Paid"
          : feePaid > 0
          ? "Partial"
          : "Pending";

      const student = {
        id: createId("student"),

        fullName: [
          form.firstName,
          form.middleName,
          form.lastName,
        ]
          .filter(Boolean)
          .join(" "),

        admissionNumber,
        registrationDate:
          new Date().toISOString(),

        status: "Active",

        photo,

        documents,

        ...form,

        fees: {
          registrationFee: Number(
            form.registrationFee || 0
          ),
          tuitionFee: Number(form.tuitionFee || 0),
          booksFee: Number(form.booksFee || 0),
          uniformFee: Number(
            form.uniformFee || 0
          ),
          transportFee: Number(
            form.transportFee || 0
          ),
          otherFee: Number(
            form.otherFee || 0
          ),
          discount: Number(form.discount || 0),
          scholarship: Number(
            form.scholarship || 0
          ),
          subtotal: feeSubtotal,
          total: feeTotal,
          paid: feePaid,
          balance: feeBalance,
          paymentStatus,
        },

        payment,

        invoice: {
          id: createId("invoice"),
          invoiceNumber: `INV-${new Date().getFullYear()}-${Date.now()
            .toString()
            .slice(-6)}`,
          total: feeTotal,
          paid: feePaid,
          balance: feeBalance,
          status: paymentStatus,
          createdAt: new Date().toISOString(),
        },

        attendance: {
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          percentage: 0,
        },

        academic: {
          subjects: [],
          average: 0,
          position: null,
        },

        activity: [
          {
            id: createId("activity"),
            type: "registration",
            description:
              "Student registration completed.",
            date: new Date().toISOString(),
          },
        ],
      };

      const existingStudents = safeParse(
        localStorage.getItem(STUDENTS_KEY),
        []
      );

      localStorage.setItem(
        STUDENTS_KEY,
        JSON.stringify([
          student,
          ...existingStudents,
        ])
      );

      localStorage.removeItem(DRAFT_KEY);

      setRegisteredStudent(student);
      setShowSuccess(true);
      setIsSaving(false);

      showToast(
        "Student successfully registered."
      );
    }, 900);
  }

  /* =======================================================
     RESET
  ======================================================= */

  function registerAnotherStudent() {
    localStorage.removeItem(DRAFT_KEY);

    setForm({
      ...initialForm,
      admissionDate: new Date()
        .toISOString()
        .slice(0, 10),
    });

    setDocuments([]);
    setPhoto("");
    setErrors({});
    setCurrentStep(1);
    setRegisteredStudent(null);
    setShowSuccess(false);
  }

  function saveDraft() {
    setIsSaving(true);

    setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify(form)
      );

      setLastSaved(new Date());
      setIsSaving(false);

      showToast("Registration draft saved.");
    }, 400);
  }

  function saveAndExit() {
    saveDraft();
    setTimeout(() => {
      navigate("/students");
    }, 500);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50 pb-10">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex min-w-0 items-center gap-3">

            <button
              onClick={() => navigate("/students")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:-translate-x-0.5 hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                  Register Student
                </h1>

                <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 sm:inline-flex">
                  New Admission
                </span>
              </div>

              <p className="hidden text-xs text-slate-500 sm:block">
                Create a complete student admission record
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2">

            <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex">
              {isSaving ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle2
                    size={14}
                    className="text-emerald-500"
                  />
                  Draft saved
                </>
              ) : (
                <>
                  <Save size={14} />
                  Auto-save enabled
                </>
              )}
            </div>

            <button
              onClick={saveDraft}
              disabled={isSaving}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:flex"
            >
              <Save size={16} />
              Save Draft
            </button>

            <button
              onClick={saveAndExit}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Save & Exit
            </button>

          </div>

        </div>

      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-8">

        {/* Progress */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="hidden lg:flex">

            {STEPS.map((step) => {
              const Icon = step.icon;

              const active =
                currentStep === step.id;

              const completed =
                currentStep > step.id;

              return (
                <button
                  key={step.id}
                  onClick={() =>
                    jumpToStep(step.id)
                  }
                  className={`group relative flex flex-1 items-center gap-3 border-r border-slate-100 px-5 py-4 text-left transition last:border-r-0 ${
                    active
                      ? "bg-slate-900 text-white"
                      : completed
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      active
                        ? "bg-white/10 text-white"
                        : completed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {completed ? (
                      <Check size={17} />
                    ) : (
                      <Icon size={17} />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      {step.title}
                    </p>

                    <p
                      className={`mt-0.5 text-[11px] ${
                        active
                          ? "text-slate-300"
                          : "text-slate-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>

                </button>
              );
            })}

          </div>

          {/* Mobile progress */}

          <div className="p-4 lg:hidden">

            <div className="mb-3 flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step {currentStep} of {STEPS.length}
                </p>

                <h2 className="mt-1 text-base font-bold text-slate-900">
                  {STEPS[currentStep - 1].title}
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                {currentStep}
              </div>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-slate-900 transition-all duration-500"
                style={{
                  width: `${
                    (currentStep / STEPS.length) * 100
                  }%`,
                }}
              />

            </div>

          </div>

        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">

          {/* MAIN FORM */}

          <div className="min-w-0">

            <div
              key={currentStep}
              className="animate-[fadeUp_.35s_ease-out]"
            >

              {currentStep === 1 && (
                <PersonalStep
                  form={form}
                  errors={errors}
                  updateField={updateField}
                  photo={photo}
                  photoInputRef={photoInputRef}
                  handlePhotoUpload={handlePhotoUpload}
                  removePhoto={removePhoto}
                />
              )}

              {currentStep === 2 && (
                <AcademicStep
                  form={form}
                  errors={errors}
                  updateField={updateField}
                />
              )}

              {currentStep === 3 && (
                <GuardianStep
                  form={form}
                  errors={errors}
                  updateField={updateField}
                />
              )}

              {currentStep === 4 && (
                <MedicalStep
                  form={form}
                  errors={errors}
                  updateField={updateField}
                />
              )}

              {currentStep === 5 && (
                <DocumentsStep
                  documents={documents}
                  documentInputRef={documentInputRef}
                  handleDocumentUpload={
                    handleDocumentUpload
                  }
                  removeDocument={removeDocument}
                />
              )}

              {currentStep === 6 && (
                <FeesStep
                  form={form}
                  errors={errors}
                  updateField={updateField}
                  subtotal={feeSubtotal}
                  reduction={feeReduction}
                  total={feeTotal}
                  paid={feePaid}
                  balance={feeBalance}
                />
              )}

              {currentStep === 7 && (
                <ReviewStep
                  form={form}
                  photo={photo}
                  documents={documents}
                  subtotal={feeSubtotal}
                  total={feeTotal}
                  paid={feePaid}
                  balance={feeBalance}
                  onEditStep={jumpToStep}
                />
              )}

            </div>

            {/* Bottom actions */}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

              <button
                onClick={previousStep}
                disabled={currentStep === 1}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={17} />
                Previous
              </button>

              {currentStep < STEPS.length ? (
                <button
                  onClick={nextStep}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Continue
                  <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  onClick={
                    openRegistrationConfirmation
                  }
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Registering...
                    </>
                  ) : (
                    <>
                      <BadgeCheck size={17} />
                      Complete Registration
                    </>
                  )}
                </button>
              )}

            </div>

          </div>

          {/* =================================================
              SUMMARY SIDEBAR
          ================================================= */}

          <aside className="hidden xl:block">

            <div className="sticky top-24 space-y-4">

              <RegistrationSummary
                form={form}
                photo={photo}
                documents={documents}
                total={feeTotal}
                paid={feePaid}
                balance={feeBalance}
              />

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Registration protection
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your progress is automatically saved
                      locally while completing this form.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>

      {/* ===================================================
          CONFIRMATION MODAL
      =================================================== */}

      {showConfirm && (
        <Modal
          onClose={() => setShowConfirm(false)}
        >

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <BadgeCheck size={32} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Complete Student Registration?
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              This will create the student record,
              admission number, fee invoice and payment
              receipt where applicable.
            </p>

            <div className="mt-5 grid gap-2 text-left">

              <ConfirmationRow
                label="Student"
                value={
                  [
                    form.firstName,
                    form.middleName,
                    form.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
              />

              <ConfirmationRow
                label="Class"
                value={form.className}
              />

              <ConfirmationRow
                label="Session"
                value={form.session}
              />

              <ConfirmationRow
                label="Total fees"
                value={money(feeTotal)}
              />

              <ConfirmationRow
                label="Payment"
                value={money(feePaid)}
              />

            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">

              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Go Back
              </button>

              <button
                onClick={registerStudent}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Confirm Registration
              </button>

            </div>

          </div>

        </Modal>
      )}

      {/* ===================================================
          SUCCESS MODAL
      =================================================== */}

      {showSuccess && registeredStudent && (
        <Modal
          large
          onClose={() => setShowSuccess(false)}
        >

          <div className="text-center">

            <div className="mx-auto flex h-20 w-20 animate-[scaleIn_.3s_ease-out] items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check size={38} />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-widest text-emerald-600">
              Registration Completed
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-900">
              Student Registered Successfully
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              The student record has been created successfully.
              You can now print the admission letter, student
              profile, registration summary and payment receipt.
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">

              <div className="flex items-center gap-4">

                {registeredStudent.photo ? (
                  <img
                    src={registeredStudent.photo}
                    alt={registeredStudent.fullName}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
                    {registeredStudent.fullName
                      .split(" ")
                      .map((name) => name[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                )}

                <div>
                  <p className="font-bold text-slate-900">
                    {registeredStudent.fullName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {registeredStudent.className}
                  </p>

                  <p className="mt-1 text-xs font-bold text-emerald-600">
                    {registeredStudent.admissionNumber}
                  </p>
                </div>

              </div>

            </div>

            {/* Print actions */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <ActionButton
                icon={Printer}
                title="Print Admission"
                description="Admission letter"
                onClick={() =>
                  printAdmissionLetter(
                    registeredStudent
                  )
                }
              />

              <ActionButton
                icon={IdCard}
                title="Print Profile"
                description="Complete student profile"
                onClick={() =>
                  printStudentProfile(
                    registeredStudent
                  )
                }
              />

              <ActionButton
                icon={Receipt}
                title="Print Receipt"
                description={
                  registeredStudent.payment
                    ? "Payment receipt"
                    : "No payment recorded"
                }
                disabled={
                  !registeredStudent.payment
                }
                onClick={() =>
                  printReceipt(
                    registeredStudent
                  )
                }
              />

              <ActionButton
                icon={FileCheck2}
                title="Print Summary"
                description="Registration summary"
                onClick={() =>
                  printRegistrationSummary(
                    registeredStudent
                  )
                }
              />

            </div>

            <button
              onClick={() =>
                printAllDocuments(
                  registeredStudent
                )
              }
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Printer size={17} />
              Print All Available Documents
            </button>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">

              <button
                onClick={() =>
                  navigate(
                    `/students/${registeredStudent.id}`
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                View Profile
              </button>

              <button
                onClick={registerAnotherStudent}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCcw size={15} />
                Register Another
              </button>

              <button
                onClick={() => navigate("/students")}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Students
              </button>

            </div>

          </div>

        </Modal>
      )}

      {/* ===================================================
          TOAST
      =================================================== */}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-32px)] max-w-md -translate-x-1/2 animate-[fadeUp_.25s_ease-out]">

          <div
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
              toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >

            {toast.type === "error" ? (
              <X size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}

            <p className="text-sm font-semibold">
              {toast.message}
            </p>

          </div>

        </div>
      )}

      {/* Tailwind arbitrary animation fallback */}

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
            transform: scale(.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

    </div>
  );
}

/* =========================================================
   PERSONAL STEP
========================================================= */

function PersonalStep({
  form,
  errors,
  updateField,
  photo,
  photoInputRef,
  handlePhotoUpload,
  removePhoto,
}) {
  return (
    <FormCard
      icon={User}
      title="Personal Information"
      description="Enter the student's basic identity and contact information."
    >

      <div className="mb-7 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">

        <div className="relative shrink-0">

          {photo ? (
            <img
              src={photo}
              alt="Student preview"
              className="h-28 w-24 rounded-2xl border-2 border-white object-cover shadow-md"
            />
          ) : (
            <div className="flex h-28 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white text-slate-400">
              <Camera size={25} />
            </div>
          )}

          {photo && (
            <button
              onClick={removePhoto}
              type="button"
              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700"
            >
              <X size={14} />
            </button>
          )}

        </div>

        <div>

          <h3 className="text-sm font-bold text-slate-900">
            Student Passport Photograph
          </h3>

          <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
            Upload a clear passport-style photograph.
            JPG and PNG images up to 3MB are supported.
          </p>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() =>
              photoInputRef.current?.click()
            }
            className="mt-3 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            <Upload size={15} />
            {photo ? "Change Photo" : "Upload Photo"}
          </button>

        </div>

      </div>

      <SectionHeader
        icon={User}
        title="Identity"
      />

      <div className="grid gap-4 md:grid-cols-3">

        <Input
          label="First Name"
          required
          value={form.firstName}
          error={errors.firstName}
          onChange={(value) =>
            updateField("firstName", value)
          }
          placeholder="e.g. Aisha"
        />

        <Input
          label="Middle Name"
          value={form.middleName}
          onChange={(value) =>
            updateField("middleName", value)
          }
          placeholder="Optional"
        />

        <Input
          label="Last Name"
          required
          value={form.lastName}
          error={errors.lastName}
          onChange={(value) =>
            updateField("lastName", value)
          }
          placeholder="e.g. Mohammed"
        />

        <Input
          label="Date of Birth"
          type="date"
          required
          value={form.dateOfBirth}
          error={errors.dateOfBirth}
          onChange={(value) =>
            updateField("dateOfBirth", value)
          }
        />

        <Select
          label="Gender"
          required
          value={form.gender}
          error={errors.gender}
          onChange={(value) =>
            updateField("gender", value)
          }
          options={[
            ["", "Select gender"],
            ["Male", "Male"],
            ["Female", "Female"],
          ]}
        />

        <Select
          label="Nationality"
          value={form.nationality}
          onChange={(value) =>
            updateField("nationality", value)
          }
          options={[
            ["Nigerian", "Nigerian"],
            ["Other", "Other"],
          ]}
        />

        <Input
          label="State of Origin"
          value={form.stateOfOrigin}
          onChange={(value) =>
            updateField("stateOfOrigin", value)
          }
          placeholder="e.g. Katsina"
        />

        <Input
          label="LGA"
          value={form.lga}
          onChange={(value) =>
            updateField("lga", value)
          }
          placeholder="Local Government"
        />

        <Select
          label="Religion"
          value={form.religion}
          onChange={(value) =>
            updateField("religion", value)
          }
          options={[
            ["", "Select religion"],
            ["Islam", "Islam"],
            ["Christianity", "Christianity"],
            ["Other", "Other"],
          ]}
        />

      </div>

      <SectionHeader
        icon={Phone}
        title="Contact Information"
        className="mt-8"
      />

      <div className="grid gap-4 md:grid-cols-2">

        <Input
          label="Phone Number"
          required
          value={form.phone}
          error={errors.phone}
          onChange={(value) =>
            updateField("phone", value)
          }
          placeholder="+234..."
        />

        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(value) =>
            updateField("email", value)
          }
          placeholder="student@example.com"
        />

        <div className="md:col-span-2">

          <Textarea
            label="Residential Address"
            required
            value={form.address}
            error={errors.address}
            onChange={(value) =>
              updateField("address", value)
            }
            placeholder="Enter full residential address"
          />

        </div>

      </div>

      <SectionHeader
        icon={HeartPulse}
        title="Basic Health Information"
        className="mt-8"
      />

      <div className="grid gap-4 md:grid-cols-2">

        <Select
          label="Blood Group"
          value={form.bloodGroup}
          onChange={(value) =>
            updateField("bloodGroup", value)
          }
          options={[
            ["", "Select blood group"],
            ["A+", "A+"],
            ["A-", "A-"],
            ["B+", "B+"],
            ["B-", "B-"],
            ["AB+", "AB+"],
            ["AB-", "AB-"],
            ["O+", "O+"],
            ["O-", "O-"],
          ]}
        />

        <Select
          label="Genotype"
          value={form.genotype}
          onChange={(value) =>
            updateField("genotype", value)
          }
          options={[
            ["", "Select genotype"],
            ["AA", "AA"],
            ["AS", "AS"],
            ["SS", "SS"],
            ["AC", "AC"],
            ["SC", "SC"],
          ]}
        />

      </div>

    </FormCard>
  );
}

/* =========================================================
   ACADEMIC STEP
========================================================= */

function AcademicStep({
  form,
  errors,
  updateField,
}) {
  return (
    <FormCard
      icon={GraduationCap}
      title="Academic Information"
      description="Assign the student to the appropriate school section, class and academic session."
    >

      <SectionHeader
        icon={School}
        title="Admission Details"
      />

      <div className="grid gap-4 md:grid-cols-2">

        <Input
          label="Admission Number"
          value={form.admissionNumber}
          onChange={(value) =>
            updateField(
              "admissionNumber",
              value
            )
          }
          placeholder="Leave blank to auto-generate"
          helper="The system automatically generates this if left empty."
        />

        <Input
          label="Admission Date"
          type="date"
          value={form.admissionDate}
          onChange={(value) =>
            updateField(
              "admissionDate",
              value
            )
          }
        />

        <Select
          label="School Section"
          required
          value={form.section}
          error={errors.section}
          onChange={(value) =>
            updateField("section", value)
          }
          options={[
            ["", "Select section"],
            ["Nursery", "Nursery"],
            ["Primary", "Primary"],
            ["JSS", "Junior Secondary School"],
            ["SS", "Senior Secondary School"],
          ]}
        />

        <Select
          label="Class"
          required
          value={form.className}
          error={errors.className}
          onChange={(value) =>
            updateField("className", value)
          }
          options={[
            ["", "Select class"],
            ["Nursery 1", "Nursery 1"],
            ["Nursery 2", "Nursery 2"],
            ["Nursery 3", "Nursery 3"],
            ["Primary 1", "Primary 1"],
            ["Primary 2", "Primary 2"],
            ["Primary 3", "Primary 3"],
            ["Primary 4", "Primary 4"],
            ["Primary 5", "Primary 5"],
            ["Primary 6", "Primary 6"],
            ["JSS 1", "JSS 1"],
            ["JSS 2", "JSS 2"],
            ["JSS 3", "JSS 3"],
            ["SS 1", "SS 1"],
            ["SS 2", "SS 2"],
            ["SS 3", "SS 3"],
          ]}
        />

        <Select
          label="Academic Session"
          required
          value={form.session}
          error={errors.session}
          onChange={(value) =>
            updateField("session", value)
          }
          options={[
            ["2026/2027", "2026/2027"],
            ["2027/2028", "2027/2028"],
            ["2028/2029", "2028/2029"],
          ]}
        />

        <Select
          label="Term"
          required
          value={form.term}
          error={errors.term}
          onChange={(value) =>
            updateField("term", value)
          }
          options={[
            ["First Term", "First Term"],
            ["Second Term", "Second Term"],
            ["Third Term", "Third Term"],
          ]}
        />

        <Select
          label="Student Type"
          value={form.studentType}
          onChange={(value) =>
            updateField("studentType", value)
          }
          options={[
            ["New Student", "New Student"],
            ["Returning Student", "Returning Student"],
            ["Transfer Student", "Transfer Student"],
          ]}
        />

      </div>

      <SectionHeader
        icon={BookOpen}
        title="Previous Education"
        className="mt-8"
      />

      <div className="grid gap-4 md:grid-cols-2">

        <Input
          label="Previous School"
          value={form.previousSchool}
          onChange={(value) =>
            updateField(
              "previousSchool",
              value
            )
          }
          placeholder="School previously attended"
        />

        <Input
          label="Previous Class"
          value={form.previousClass}
          onChange={(value) =>
            updateField(
              "previousClass",
              value
            )
          }
          placeholder="e.g. Primary 5"
        />

      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">

        <div className="mt-0.5 text-blue-600">
          <GraduationCap size={18} />
        </div>

        <div>
          <p className="text-sm font-bold text-blue-900">
            Academic assignment
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            The selected section and class will determine
            which subjects, teachers, attendance records,
            assignments and examination results are associated
            with this student.
          </p>
        </div>

      </div>

    </FormCard>
  );
}

/* =========================================================
   GUARDIAN STEP
========================================================= */

function GuardianStep({
  form,
  errors,
  updateField,
}) {
  return (
    <FormCard
      icon={Users}
      title="Parent & Guardian Information"
      description="Add reliable parent or guardian information for communication and emergencies."
    >

      <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">

        <div className="flex items-start gap-3">

          <Users
            size={19}
            className="mt-0.5 text-amber-600"
          />

          <p className="text-xs leading-5 text-amber-800">
            At least one parent or guardian and one valid
            phone number are required.
          </p>

        </div>

      </div>

      <SectionHeader
        icon={User}
        title="Father's Information"
      />

      <div className="grid gap-4 md:grid-cols-2">

        <Input
          label="Father's Full Name"
          value={form.fatherName}
          onChange={(value) =>
            updateField("fatherName", value)
          }
          placeholder="Full name"
        />

        <Input
          label="Phone Number"
          value={form.fatherPhone}
          onChange={(value) =>
            updateField("fatherPhone", value)
          }
          placeholder="+234..."
        />

        <Input
          label="Email"
          type="email"
          value={form.fatherEmail}
          onChange={(value) =>
            updateField("fatherEmail", value)
          }
          placeholder="father@example.com"
        />

        <Input
          label="Occupation"
          value={form.fatherOccupation}
          onChange={(value) =>
            updateField(
              "fatherOccupation",
              value
            )
          }
          placeholder="Occupation"
        />

      </div>

      <SectionHeader
        icon={User}
        title="Mother's Information"
        className="mt-8"
      />

      <div className="grid gap-4 md:grid-cols-2">

        <Input
          label="Mother's Full Name"
          value={form.motherName}
          onChange={(value) =>
            updateField("motherName", value)
          }
          placeholder="Full name"
        />

        <Input
          label="Phone Number"
          value={form.motherPhone}
          onChange={(value) =>
            updateField("motherPhone", value)
          }
          placeholder="+234..."
        />

        <Input
          label="Email"
          type="email"
          value={form.motherEmail}
          onChange={(value) =>
            updateField("motherEmail", value)
          }
          placeholder="mother@example.com"
        />

        <Input
          label="Occupation"
          value={form.motherOccupation}
          onChange={(value) =>
            updateField(
              "motherOccupation",
              value
            )
          }
          placeholder="Occupation"
        />

      </div>

      <SectionHeader
        icon={Users}
        title="Guardian Information"
        className="mt-8"
      />

      <div className="grid gap-4 md:grid-cols-2">

        <Input
          label="Guardian Name"
          value={form.guardianName}
          error={errors.guardianName}
          onChange={(value) =>
            updateField(
              "guardianName",
              value
            )
          }
          placeholder="Guardian full name"
        />

        <Input
          label="Relationship"
          value={form.guardianRelationship}
          onChange={(value) =>
            updateField(
              "guardianRelationship",
              value
            )
          }
          placeholder="e.g. Uncle"
        />

        <Input
          label="Guardian Phone"
          value={form.guardianPhone}
          error={errors.guardianPhone}
          onChange={(value) =>
            updateField(
              "guardianPhone",
              value
            )
          }
          placeholder="+234..."
        />

        <Input
          label="Guardian Email"
          type="email"
          value={form.guardianEmail}
          onChange={(value) =>
            updateField(
              "guardianEmail",
              value
            )
          }
          placeholder="guardian@example.com"
        />

        <div className="md:col-span-2">

          <Textarea
            label="Guardian Address"
            value={form.guardianAddress}
            onChange={(value) =>
              updateField(
                "guardianAddress",
                value
              )
            }
            placeholder="Full address"
          />

        </div>

      </div>

    </FormCard>
  );
}

/* =========================================================
   MEDICAL STEP
========================================================= */

function MedicalStep({
  form,
  errors,
  updateField,
}) {
  return (
    <FormCard
      icon={HeartPulse}
      title="Medical & Emergency Information"
      description="Record information that can help the school respond appropriately to medical emergencies."
    >

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">

        <HeartPulse
          size={19}
          className="mt-0.5 text-red-600"
        />

        <div>
          <p className="text-sm font-bold text-red-900">
            Sensitive information
          </p>

          <p className="mt-1 text-xs leading-5 text-red-700">
            Medical information should be restricted to
            authorized school personnel in the production
            system.
          </p>
        </div>

      </div>

      <SectionHeader
        icon={HeartPulse}
        title="Health Information"
      />

      <div className="grid gap-4 md:grid-cols-2">

        <Select
          label="Blood Group"
          required
          value={form.bloodGroup}
          error={errors.bloodGroup}
          onChange={(value) =>
            updateField(
              "bloodGroup",
              value
            )
          }
          options={[
            ["", "Select blood group"],
            ["A+", "A+"],
            ["A-", "A-"],
            ["B+", "B+"],
            ["B-", "B-"],
            ["AB+", "AB+"],
            ["AB-", "AB-"],
            ["O+", "O+"],
            ["O-", "O-"],
          ]}
        />

        <Select
          label="Genotype"
          required
          value={form.genotype}
          error={errors.genotype}
          onChange={(value) =>
            updateField(
              "genotype",
              value
            )
          }
          options={[
            ["", "Select genotype"],
            ["AA", "AA"],
            ["AS", "AS"],
            ["SS", "SS"],
            ["AC", "AC"],
            ["SC", "SC"],
          ]}
        />

        <Textarea
          label="Allergies"
          value={form.allergies}
          onChange={(value) =>
            updateField(
              "allergies",
              value
            )
          }
          placeholder="List known allergies or write None"
        />

        <Textarea
          label="Medical Conditions"
          value={form.medicalConditions}
          onChange={(value) =>
            updateField(
              "medicalConditions",
              value
            )
          }
          placeholder="Known medical conditions"
        />

      </div>

      <SectionHeader
        icon={Phone}
        title="Emergency Contact"
        className="mt-8"
      />

      <div className="grid gap-4 md:grid-cols-2">

        <Input
          label="Contact Name"
          required
          value={form.emergencyContactName}
          error={errors.emergencyContactName}
          onChange={(value) =>
            updateField(
              "emergencyContactName",
              value
            )
          }
          placeholder="Emergency contact"
        />

        <Input
          label="Contact Phone"
          required
          value={form.emergencyContactPhone}
          error={errors.emergencyContactPhone}
          onChange={(value) =>
            updateField(
              "emergencyContactPhone",
              value
            )
          }
          placeholder="+234..."
        />

        <Input
          label="Doctor Name"
          value={form.doctorName}
          onChange={(value) =>
            updateField(
              "doctorName",
              value
            )
          }
          placeholder="Family doctor"
        />

        <Input
          label="Preferred Hospital"
          value={form.hospitalName}
          onChange={(value) =>
            updateField(
              "hospitalName",
              value
            )
          }
          placeholder="Hospital / clinic"
        />

      </div>

    </FormCard>
  );
}

/* =========================================================
   DOCUMENTS STEP
========================================================= */

function DocumentsStep({
  documents,
  documentInputRef,
  handleDocumentUpload,
  removeDocument,
}) {
  return (
    <FormCard
      icon={FileText}
      title="Student Documents"
      description="Upload supporting documents associated with the student's admission."
    >

      <input
        ref={documentInputRef}
        type="file"
        multiple
        onChange={handleDocumentUpload}
        className="hidden"
      />

      <button
        type="button"
        onClick={() =>
          documentInputRef.current?.click()
        }
        className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-slate-400 hover:bg-slate-100"
      >

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition group-hover:scale-105">
          <Upload size={23} />
        </div>

        <h3 className="mt-4 text-sm font-bold text-slate-900">
          Upload student documents
        </h3>

        <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
          Add birth certificate, previous results,
          transfer certificate, medical documents or
          other supporting files.
        </p>

        <span className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">
          Choose Files
        </span>

      </button>

      {documents.length > 0 && (
        <div className="mt-6 space-y-3">

          <div className="flex items-center justify-between">

            <h3 className="text-sm font-bold text-slate-900">
              Uploaded Documents
            </h3>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {documents.length}
            </span>

          </div>

          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
            >

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Paperclip size={17} />
                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-slate-800">
                    {document.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {(document.size / 1024 / 1024).toFixed(
                      2
                    )}{" "}
                    MB
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  removeDocument(document.id)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-red-500 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>

            </div>
          ))}

        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">

        {[
          ["Birth Certificate", "Recommended"],
          ["Previous Result", "Recommended"],
          ["Transfer Certificate", "If applicable"],
          ["Medical Record", "Optional"],
        ].map(([title, status]) => (
          <div
            key={title}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">

              <FileCheck2
                size={17}
                className="text-slate-400"
              />

              <span className="text-xs font-semibold text-slate-700">
                {title}
              </span>

            </div>

            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {status}
            </span>
          </div>
        ))}

      </div>

    </FormCard>
  );
}

/* =========================================================
   FEES STEP
========================================================= */

function FeesStep({
  form,
  errors,
  updateField,
  subtotal,
  reduction,
  total,
  paid,
  balance,
}) {
  return (
    <FormCard
      icon={Wallet}
      title="Fees & Initial Payment"
      description="Set the student's applicable fees, discounts and initial payment."
    >

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <MoneyInput
          label="Registration Fee"
          value={form.registrationFee}
          onChange={(value) =>
            updateField(
              "registrationFee",
              value
            )
          }
        />

        <MoneyInput
          label="Tuition Fee"
          value={form.tuitionFee}
          onChange={(value) =>
            updateField(
              "tuitionFee",
              value
            )
          }
        />

        <MoneyInput
          label="Books"
          value={form.booksFee}
          onChange={(value) =>
            updateField("booksFee", value)
          }
        />

        <MoneyInput
          label="Uniform"
          value={form.uniformFee}
          onChange={(value) =>
            updateField(
              "uniformFee",
              value
            )
          }
        />

        <MoneyInput
          label="Transport"
          value={form.transportFee}
          onChange={(value) =>
            updateField(
              "transportFee",
              value
            )
          }
        />

        <MoneyInput
          label="Other"
          value={form.otherFee}
          onChange={(value) =>
            updateField("otherFee", value)
          }
        />

      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">

        <MoneyInput
          label="Discount"
          value={form.discount}
          onChange={(value) =>
            updateField("discount", value)
          }
        />

        <MoneyInput
          label="Scholarship"
          value={form.scholarship}
          onChange={(value) =>
            updateField(
              "scholarship",
              value
            )
          }
        />

      </div>

      {/* Fee calculation */}

      <div className="mt-7 rounded-2xl bg-slate-900 p-5 text-white">

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <AmountCard
            label="Subtotal"
            value={money(subtotal)}
          />

          <AmountCard
            label="Discount"
            value={`-${money(reduction)}`}
          />

          <AmountCard
            label="Total"
            value={money(total)}
            highlight
          />

          <AmountCard
            label="Balance"
            value={money(balance)}
          />

        </div>

      </div>

      <SectionHeader
        icon={CreditCard}
        title="Initial Payment"
        className="mt-8"
      />

      <div className="grid gap-4 md:grid-cols-2">

        <MoneyInput
          label="Payment Amount"
          value={form.paymentAmount}
          error={errors.paymentAmount}
          onChange={(value) =>
            updateField(
              "paymentAmount",
              value
            )
          }
        />

        <Select
          label="Payment Method"
          value={form.paymentMethod}
          error={errors.paymentMethod}
          onChange={(value) =>
            updateField(
              "paymentMethod",
              value
            )
          }
          options={[
            ["Cash", "Cash"],
            ["Bank Transfer", "Bank Transfer"],
            ["POS", "POS"],
            ["Online", "Online Payment"],
          ]}
        />

        <Input
          label="Payment Reference"
          value={form.paymentReference}
          onChange={(value) =>
            updateField(
              "paymentReference",
              value
            )
          }
          placeholder="Transaction/reference number"
        />

        <Input
          label="Payment Notes"
          value={form.paymentNotes}
          onChange={(value) =>
            updateField(
              "paymentNotes",
              value
            )
          }
          placeholder="Optional notes"
        />

      </div>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">

        <div className="flex items-center justify-between gap-4">

          <div>

            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Payment status
            </p>

            <p className="mt-1 text-lg font-black text-emerald-900">
              {balance <= 0
                ? "Paid"
                : paid > 0
                ? "Partial Payment"
                : "Pending"}
            </p>

          </div>

          <Wallet
            size={27}
            className="text-emerald-500"
          />

        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">

          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${
                total > 0
                  ? Math.min(
                      100,
                      (paid / total) * 100
                    )
                  : 0
              }%`,
            }}
          />

        </div>

      </div>

    </FormCard>
  );
}

/* =========================================================
   REVIEW STEP
========================================================= */

function ReviewStep({
  form,
  photo,
  documents,
  subtotal,
  total,
  paid,
  balance,
  onEditStep,
}) {
  const fullName = [
    form.firstName,
    form.middleName,
    form.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <FormCard
      icon={ClipboardList}
      title="Review Registration"
      description="Review all information carefully before completing registration."
    >

      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row">

        {photo ? (
          <img
            src={photo}
            alt={fullName}
            className="h-28 w-24 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-black text-white">
            {fullName
              .split(" ")
              .map((x) => x[0])
              .slice(0, 2)
              .join("")}
          </div>
        )}

        <div>

          <p className="text-xl font-black text-slate-900">
            {fullName || "Unnamed Student"}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
              {form.className || "No class"}
            </span>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
              {form.section || "No section"}
            </span>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
              {form.session}
            </span>

          </div>

        </div>

      </div>

      <ReviewSection
        title="Personal Information"
        onEdit={() => onEditStep(1)}
        items={[
          ["Full Name", fullName],
          ["Date of Birth", formatDate(form.dateOfBirth)],
          ["Gender", form.gender],
          ["Nationality", form.nationality],
          ["State", form.stateOfOrigin],
          ["LGA", form.lga],
          ["Phone", form.phone],
          ["Email", form.email],
          ["Address", form.address],
        ]}
      />

      <ReviewSection
        title="Academic Information"
        onEdit={() => onEditStep(2)}
        items={[
          ["Admission No.", form.admissionNumber || "Auto-generated"],
          ["Section", form.section],
          ["Class", form.className],
          ["Session", form.session],
          ["Term", form.term],
          ["Student Type", form.studentType],
          ["Previous School", form.previousSchool],
          ["Previous Class", form.previousClass],
        ]}
      />

      <ReviewSection
        title="Parent / Guardian"
        onEdit={() => onEditStep(3)}
        items={[
          ["Father", form.fatherName],
          ["Father Phone", form.fatherPhone],
          ["Mother", form.motherName],
          ["Mother Phone", form.motherPhone],
          ["Guardian", form.guardianName],
          ["Relationship", form.guardianRelationship],
          ["Guardian Phone", form.guardianPhone],
        ]}
      />

      <ReviewSection
        title="Medical"
        onEdit={() => onEditStep(4)}
        items={[
          ["Blood Group", form.bloodGroup],
          ["Genotype", form.genotype],
          ["Allergies", form.allergies],
          ["Medical Conditions", form.medicalConditions],
          [
            "Emergency Contact",
            form.emergencyContactName,
          ],
          [
            "Emergency Phone",
            form.emergencyContactPhone,
          ],
        ]}
      />

      <ReviewSection
        title="Documents"
        onEdit={() => onEditStep(5)}
        items={[
          [
            "Passport Photo",
            photo ? "Uploaded" : "Not uploaded",
          ],
          [
            "Supporting Documents",
            `${documents.length} uploaded`,
          ],
        ]}
      />

      <ReviewSection
        title="Fees"
        onEdit={() => onEditStep(6)}
        items={[
          ["Subtotal", money(subtotal)],
          [
            "Discount",
            money(
              Number(form.discount || 0) +
                Number(form.scholarship || 0)
            ),
          ],
          ["Total", money(total)],
          ["Paid", money(paid)],
          ["Balance", money(balance)],
          [
            "Status",
            balance <= 0
              ? "Paid"
              : paid > 0
              ? "Partial"
              : "Pending",
          ],
        ]}
      />

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">

        <ShieldCheck
          size={20}
          className="mt-0.5 shrink-0 text-blue-600"
        />

        <div>
          <p className="text-sm font-bold text-blue-900">
            Final registration
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            After registration, the system will create the
            student record and make the admission letter,
            student profile, registration summary and payment
            receipt available for printing.
          </p>
        </div>

      </div>

    </FormCard>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function RegistrationSummary({
  form,
  photo,
  documents,
  total,
  paid,
  balance,
}) {
  const fullName = [
    form.firstName,
    form.middleName,
    form.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="bg-slate-900 p-5 text-white">

        <div className="flex items-center gap-3">

          {photo ? (
            <img
              src={photo}
              alt={fullName}
              className="h-14 w-14 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-lg font-black">
              {fullName
                ? fullName
                    .split(" ")
                    .map((x) => x[0])
                    .slice(0, 2)
                    .join("")
                : "ST"}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {fullName || "New Student"}
            </p>

            <p className="mt-1 text-xs text-slate-300">
              {form.className || "Class not selected"}
            </p>
          </div>

        </div>

      </div>

      <div className="space-y-4 p-5">

        <SummaryLine
          icon={GraduationCap}
          label="Section"
          value={form.section || "—"}
        />

        <SummaryLine
          icon={CalendarDays}
          label="Session"
          value={form.session || "—"}
        />

        <SummaryLine
          icon={FileText}
          label="Documents"
          value={`${documents.length} uploaded`}
        />

        <div className="border-t border-slate-100 pt-4">

          <div className="flex items-center justify-between">

            <span className="text-xs text-slate-500">
              Total Fees
            </span>

            <span className="text-sm font-bold text-slate-900">
              {money(total)}
            </span>

          </div>

          <div className="mt-2 flex items-center justify-between">

            <span className="text-xs text-slate-500">
              Paid
            </span>

            <span className="text-sm font-bold text-emerald-600">
              {money(paid)}
            </span>

          </div>

          <div className="mt-2 flex items-center justify-between">

            <span className="text-xs text-slate-500">
              Balance
            </span>

            <span className="text-sm font-bold text-amber-600">
              {money(balance)}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   REUSABLE UI
========================================================= */

function FormCard({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

      <div className="mb-7 flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="text-lg font-black text-slate-900">
            {title}
          </h2>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

      </div>

      {children}

    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  className = "",
}) {
  return (
    <div
      className={`mb-4 flex items-center gap-2 ${className}`}
    >

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={15} />
      </div>

      <h3 className="text-sm font-bold text-slate-900">
        {title}
      </h3>

    </div>
  );
}

function Input({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  helper,
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-bold text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
          error
            ? "border-red-300 ring-2 ring-red-100"
            : "border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        }`}
      />

      {error ? (
        <p className="mt-1.5 text-[11px] font-medium text-red-600">
          {error}
        </p>
      ) : helper ? (
        <p className="mt-1.5 text-[11px] text-slate-400">
          {helper}
        </p>
      ) : null}

    </div>
  );
}

function MoneyInput({
  label,
  value,
  onChange,
  error,
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-bold text-slate-700">
        {label}
      </label>

      <div
        className={`flex overflow-hidden rounded-xl border bg-white ${
          error
            ? "border-red-300 ring-2 ring-red-100"
            : "border-slate-200 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100"
        }`}
      >

        <span className="flex items-center border-r border-slate-100 bg-slate-50 px-3 text-sm font-bold text-slate-500">
          ₦
        </span>

        <input
          type="number"
          min="0"
          value={value ?? 0}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="min-w-0 flex-1 px-3.5 py-3 text-sm text-slate-900 outline-none"
        />

      </div>

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-red-600">
          {error}
        </p>
      )}

    </div>
  );
}

function Select({
  label,
  required = false,
  value,
  onChange,
  options,
  error,
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-bold text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition ${
          error
            ? "border-red-300 ring-2 ring-red-100"
            : "border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        }`}
      >

        {options.map(([optionValue, optionLabel]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {optionLabel}
          </option>
        ))}

      </select>

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-red-600">
          {error}
        </p>
      )}

    </div>
  );
}

function Textarea({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  error,
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-bold text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <textarea
        rows={4}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className={`w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
          error
            ? "border-red-300 ring-2 ring-red-100"
            : "border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        }`}
      />

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-red-600">
          {error}
        </p>
      )}

    </div>
  );
}

function SummaryLine({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-3">

      <div className="flex items-center gap-2">

        <Icon
          size={15}
          className="text-slate-400"
        />

        <span className="text-xs text-slate-500">
          {label}
        </span>

      </div>

      <span className="max-w-[150px] truncate text-xs font-bold text-slate-800">
        {value}
      </span>

    </div>
  );
}

function AmountCard({
  label,
  value,
  highlight = false,
}) {
  return (
    <div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-lg font-black ${
          highlight
            ? "text-white"
            : "text-slate-200"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

function ReviewSection({
  title,
  items,
  onEdit,
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">

      <div className="flex items-center justify-between bg-slate-50 px-4 py-3">

        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
          {title}
        </h3>

        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <Pencil size={13} />
          Edit
        </button>

      </div>

      <div className="grid gap-x-5 gap-y-4 p-4 sm:grid-cols-2">

        {items.map(([label, value]) => (
          <div key={label}>

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {label}
            </p>

            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
              {value || "—"}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}

function ConfirmationRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">

      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right text-xs font-bold text-slate-800">
        {value || "—"}
      </span>

    </div>
  );
}

function ActionButton({
  icon: Icon,
  title,
  description,
  onClick,
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
        <Icon size={17} />
      </div>

      <div className="min-w-0">

        <p className="text-sm font-bold text-slate-900">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {description}
        </p>

      </div>

      <ChevronRight
        size={16}
        className="ml-auto shrink-0 text-slate-300"
      />

    </button>
  );
}

function Modal({
  children,
  onClose,
  large = false,
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">

      <div
        className={`relative my-auto w-full animate-[scaleIn_.25s_ease-out] rounded-3xl bg-white p-5 shadow-2xl sm:p-7 ${
          large
            ? "max-w-3xl"
            : "max-w-xl"
        }`}
      >

        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={18} />
        </button>

        {children}

      </div>

    </div>
  );
}