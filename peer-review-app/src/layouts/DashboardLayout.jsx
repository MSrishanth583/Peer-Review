import { useEffect, useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getPlatformState, markNotificationRead, refreshPlatformState } from '../services/platformStore'
import {
  LayoutDashboard,
  CloudUpload,
  FolderOpen,
  ClipboardList,
  CheckSquare,
  ShieldCheck,
  UserCog,
  Users,
  Bell,
  Sun,
  Moon,
  Search,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

const studentNav = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/upload', icon: CloudUpload, label: 'Upload Project' },
  { to: '/student/reviews', icon: ClipboardList, label: 'Peer Reviews' },
  { to: '/student/activity', icon: Bell, label: 'Activity' },
]

const teacherNav = [
  { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/projects', icon: FolderOpen, label: 'All Projects' },
  { to: '/teacher/assign', icon: Users, label: 'Assign Reviewers' },
  { to: '/teacher/approvals', icon: CheckSquare, label: 'Approvals' },
]

const adminNav = [
  { to: '/admin/dashboard', icon: ShieldCheck, label: 'Admin Dashboard' },
  { to: '/admin/dashboard#users', icon: UserCog, label: 'All Users' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  )
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [platformState, setPlatformState] = useState(() => getPlatformState())

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const latest = await refreshPlatformState()
        if (active) setPlatformState(latest)
      } catch {
        if (active) setPlatformState(getPlatformState())
      }
    }
    load()
    return () => {
      active = false
    }
  }, [location.pathname])
  const dashboardNotifications =
    user?.role === 'teacher'
      ? platformState.projects.slice(0, 4).map((p) => ({
          id: `project-${p.id}`,
          message: `Project status: ${p.title} is ${p.status.replace('_', ' ')}`,
          time: p.submittedAt,
          read: p.status === 'approved',
        }))
      : user?.role === 'admin'
        ? platformState.activityTimeline.slice(0, 8).map((item) => ({
            id: `activity-${item.id}`,
            message: `${item.actorName || 'System'}: ${item.detail}`,
            time: item.time,
            read: true,
          }))
      : platformState.notifications.slice(0, 6)

  const nav =
    user?.role === 'teacher'
      ? teacherNav
      : user?.role === 'admin'
        ? adminNav
        : studentNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-slate-950/95 dark:bg-slate-900 border-r border-slate-800 z-50 transform transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white text-sm font-extrabold tracking-[0.2em]">PR</div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Peer Review</p>
            <p className="text-xs text-slate-400">Student workspace</p>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-300 shadow-lg shadow-cyan-200/20'
                    : 'text-slate-300 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-100 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={sidebarOpen ? 'lg:pl-64' : ''}>
        {/* Top navbar */}
        <header className="sticky top-0 z-20 h-16 bg-white/85 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-400"
            title="Toggle menu"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="search"
                placeholder="Search projects, reviews..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <p className="px-4 py-2 font-medium text-slate-800 dark:text-white">Notifications</p>
                  <div className="max-h-64 overflow-y-auto">
                    {dashboardNotifications.length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No notifications yet</div>
                    )}
                    {dashboardNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={async () => {
                          if (user?.role === 'student') {
                            await markNotificationRead(n.id)
                            setPlatformState(getPlatformState())
                          }
                        }}
                        className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer ${
                          !n.read ? 'border-l-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{n.message}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.[0] || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <p className="px-4 py-2 text-sm font-medium text-slate-800 dark:text-white">{user?.name}</p>
                  <p className="px-4 text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
