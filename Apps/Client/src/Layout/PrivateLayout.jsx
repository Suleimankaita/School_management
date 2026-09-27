import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  User,
  Users,
  UserRoundCog,
  X,
  FileText,
  WalletCards,
  BarChart3,
  ClipboardList,
  BookMarked,
} from "lucide-react";

export default function PrivateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const location = useLocation();

  const navigation = [
    {
      title: "Overview",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },

    {
      title: "School Management",
      items: [
        {
          name: "Students",
          path: "/students",
          icon: Users,
        },
        {
          name: "Teachers",
          path: "/teachers",
          icon: UserRoundCog,
        },
        {
          name: "Classes",
          path: "/classes",
          icon: BookOpen,
        },
        {
          name: "Subjects",
          path: "/subjects",
          icon: BookMarked,
        },
      ],
    },

    {
      title: "Academics",
      items: [
        {
          name: "Attendance",
          path: "/attendance",
          icon: ClipboardCheck,
        },
        {
          name: "Assignments",
          path: "/assignments",
          icon: ClipboardList,
        },
        {
          name: "Examinations",
          path: "/exams",
          icon: FileText,
        },
        {
          name: "Results",
          path: "/results",
          icon: BarChart3,
        },
        {
          name: "Timetable",
          path: "/timetable",
          icon: CalendarDays,
        },
      ],
    },

    {
      title: "Administration",
      items: [
        {
          name: "Fees",
          path: "/fees",
          icon: WalletCards,
        },
        {
          name: "Reports",
          path: "/reports",
          icon: BarChart3,
        },
        {
          name: "Announcements",
          path: "/announcements",
          icon: Bell,
        },
        {
          name: "Messages",
          path: "/messages",
          icon: MessageSquare,
        },
      ],
    },
  ];

  const currentPage = getCurrentPage(navigation, location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          border-r border-slate-200 bg-white
          transition-all duration-300
          
          ${sidebarCollapsed ? "lg:w-[82px]" : "lg:w-[270px]"}
          
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }

          w-[280px]
        `}
      >

        {/* Logo */}

        <div
          className={`
            flex h-[76px] shrink-0 items-center border-b border-slate-100
            ${sidebarCollapsed ? "justify-center px-3" : "px-5"}
          `}
        >

          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
              <GraduationCap size={24} />
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0">

                <p className="truncate text-sm font-bold text-slate-900">
                  School Management
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Private Portal
                </p>

              </div>
            )}

          </Link>

          {/* Mobile close */}

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>

        </div>

        {/* =================================================
            USER MINI PROFILE
        ================================================== */}

        <div
          className={`
            border-b border-slate-100
            ${sidebarCollapsed ? "px-3 py-4" : "px-4 py-4"}
          `}
        >

          <div
            className={`
              flex items-center rounded-2xl bg-slate-50
              ${sidebarCollapsed ? "justify-center p-2" : "gap-3 p-3"}
            `}
          >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              SY
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-slate-800">
                  School Admin
                </p>

                <div className="mt-1 flex items-center gap-1.5">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <span className="text-[11px] text-slate-400">
                    Administrator
                  </span>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            NAVIGATION
        ================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin">

          {navigation.map((section) => (
            <div
              key={section.title}
              className="mb-6 last:mb-0"
            >

              {!sidebarCollapsed && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">

                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      title={sidebarCollapsed ? item.name : undefined}
                      className={({ isActive }) =>
                        `
                        group relative flex items-center rounded-xl
                        text-sm font-medium transition-all duration-200
                        ${
                          sidebarCollapsed
                            ? "justify-center px-3 py-3"
                            : "gap-3 px-3 py-2.5"
                        }

                        ${
                          isActive
                            ? "bg-sky-50 text-sky-700"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }
                        `
                      }
                    >

                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sky-500" />
                          )}

                          <Icon
                            size={19}
                            strokeWidth={isActive ? 2.2 : 1.8}
                            className={
                              isActive
                                ? "text-sky-600"
                                : "text-slate-400 group-hover:text-slate-700"
                            }
                          />

                          {!sidebarCollapsed && (
                            <span>{item.name}</span>
                          )}

                        </>
                      )}

                    </NavLink>
                  );
                })}

              </div>

            </div>
          ))}

        </nav>

        {/* =================================================
            SIDEBAR BOTTOM
        ================================================== */}

        <div className="border-t border-slate-100 p-3">

          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            title={sidebarCollapsed ? "Settings" : undefined}
            className={({ isActive }) =>
              `
              flex items-center rounded-xl py-2.5 text-sm font-medium
              ${
                sidebarCollapsed
                  ? "justify-center px-3"
                  : "gap-3 px-3"
              }

              ${
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }
              `
            }
          >
            <Settings size={19} />
            {!sidebarCollapsed && <span>Settings</span>}
          </NavLink>

          {!sidebarCollapsed && (
            <div className="mt-3 rounded-2xl bg-slate-950 p-4">

              <p className="text-xs font-semibold text-white">
                Need assistance?
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-400">
                Contact the school administration for support.
              </p>

              <button
                type="button"
                className="mt-3 w-full rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                Get Support
              </button>

            </div>
          )}

        </div>

      </aside>

      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <div
        className={`
          min-h-screen transition-all duration-300
          ${sidebarCollapsed ? "lg:pl-[82px]" : "lg:pl-[270px]"}
        `}
      >

        {/* =================================================
            TOP BAR
        ================================================== */}

        <header className="sticky top-0 z-30 h-[76px] border-b border-slate-200 bg-white/90 backdrop-blur-xl">

          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">

            {/* Left */}

            <div className="flex min-w-0 items-center gap-3">

              {/* Mobile menu */}

              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={21} />
              </button>

              {/* Desktop collapse */}

              <button
                type="button"
                onClick={() =>
                  setSidebarCollapsed((previous) => !previous)
                }
                className="hidden rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 lg:block"
                aria-label="Toggle sidebar"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen size={20} />
                ) : (
                  <PanelLeftClose size={20} />
                )}
              </button>

              <div className="hidden min-w-0 sm:block">

                <p className="truncate text-sm font-semibold text-slate-800">
                  {currentPage}
                </p>

                <p className="truncate text-xs text-slate-400">
                  School Management System
                </p>

              </div>

            </div>

            {/* Right */}

            <div className="flex items-center gap-1 sm:gap-2">

              {/* Search */}

              <button
                type="button"
                className="hidden rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 md:block"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Notifications */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setNotificationOpen((previous) => !previous)
                  }
                  className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100"
                  aria-label="Notifications"
                >

                  <Bell size={20} />

                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />

                </button>

                {notificationOpen && (
                  <NotificationDropdown
                    onClose={() => setNotificationOpen(false)}
                  />
                )}

              </div>

              {/* Divider */}

              <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

              {/* Profile */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen((previous) => !previous)
                  }
                  className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100 sm:pr-2"
                >

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                    SY
                  </div>

                  <div className="hidden text-left sm:block">

                    <p className="max-w-[120px] truncate text-xs font-semibold text-slate-700">
                      School Admin
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Administrator
                    </p>

                  </div>

                  <ChevronDown
                    size={15}
                    className="hidden text-slate-400 sm:block"
                  />

                </button>

                {profileOpen && (
                  <ProfileDropdown
                    onClose={() => setProfileOpen(false)}
                  />
                )}

              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================== */}

        <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">

          {/* Breadcrumb */}

          <div className="mb-6 hidden items-center gap-2 text-xs text-slate-400 md:flex">

            <Link
              to="/dashboard"
              className="transition hover:text-sky-600"
            >
              Home
            </Link>

            <span>/</span>

            <span className="font-medium text-slate-600">
              {currentPage}
            </span>

          </div>

          <Outlet />

        </main>

      </div>

    </div>
  );
}

/* =============================================================
   NOTIFICATION DROPDOWN
============================================================= */

function NotificationDropdown({ onClose }) {
  return (
    <div className="absolute right-0 top-14 z-50 w-[330px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

        <div>
          <p className="text-sm font-bold text-slate-800">
            Notifications
          </p>

          <p className="text-[11px] text-slate-400">
            3 unread notifications
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
        >
          <X size={16} />
        </button>

      </div>

      <div className="max-h-[360px] overflow-y-auto">

        <NotificationItem
          icon={<Users size={17} />}
          title="New student registered"
          description="A new student has been added to JSS 2."
          time="10 minutes ago"
          unread
        />

        <NotificationItem
          icon={<ClipboardCheck size={17} />}
          title="Attendance needs review"
          description="Some classes have incomplete attendance."
          time="1 hour ago"
          unread
        />

        <NotificationItem
          icon={<CalendarDays size={17} />}
          title="Upcoming school event"
          description="Parent-teacher meeting is scheduled."
          time="Yesterday"
        />

      </div>

      <div className="border-t border-slate-100 p-3">

        <button
          type="button"
          className="w-full rounded-xl py-2 text-xs font-semibold text-sky-600 transition hover:bg-sky-50"
        >
          View all notifications
        </button>

      </div>

    </div>
  );
}

function NotificationItem({
  icon,
  title,
  description,
  time,
  unread,
}) {
  return (
    <div className="flex gap-3 border-b border-slate-50 px-4 py-4 transition hover:bg-slate-50">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-start justify-between gap-2">

          <p className="text-xs font-semibold text-slate-700">
            {title}
          </p>

          {unread && (
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
          )}

        </div>

        <p className="mt-1 text-[11px] leading-5 text-slate-400">
          {description}
        </p>

        <p className="mt-1 text-[10px] text-slate-400">
          {time}
        </p>

      </div>

    </div>
  );
}

/* =============================================================
   PROFILE DROPDOWN
============================================================= */

function ProfileDropdown({ onClose }) {
  return (
    <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

      <div className="border-b border-slate-100 p-4">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            SY
          </div>

          <div className="min-w-0">

            <p className="truncate text-sm font-bold text-slate-800">
              School Admin
            </p>

            <p className="truncate text-xs text-slate-400">
              admin@school.edu
            </p>

          </div>

        </div>

      </div>

      <div className="p-2">

        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <User size={18} />
          My Profile
        </Link>

        <Link
          to="/settings"
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <Settings size={18} />
          Settings
        </Link>

      </div>

      <div className="border-t border-slate-100 p-2">

        <button
          type="button"
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50"
        >
          <LogOut size={18} />
          Sign out
        </button>

      </div>

    </div>
  );
}

/* =============================================================
   HELPERS
============================================================= */

function getCurrentPage(navigation, pathname) {
  for (const section of navigation) {
    const item = section.items.find(
      (item) =>
        pathname === item.path ||
        pathname.startsWith(`${item.path}/`)
    );

    if (item) {
      return item.name;
    }
  }

  if (pathname === "/profile") {
    return "My Profile";
  }

  if (pathname === "/settings") {
    return "Settings";
  }

  return "Dashboard";
}