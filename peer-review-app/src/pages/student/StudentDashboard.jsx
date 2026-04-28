import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Clock3, Sparkles, HeartPulse, DownloadCloud } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getPlatformState, refreshPlatformState } from '../../services/platformStore'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { downloadSimplePdf } from '../../utils/pdfExport'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(() => getPlatformState())

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const latest = await refreshPlatformState()
        if (active) setData(latest)
      } catch {
        if (active) setData(getPlatformState())
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const myProjects = data.projects.filter((p) => p.author === user?.name)
  const myReviewsGiven = data.reviews.filter((r) => r.reviewer === user?.name)
  const assignedCount = Object.values(data.assignments).filter((reviewers) =>
    (reviewers || []).includes(user?.name),
  ).length
  const expectedReviews = assignedCount || myProjects.length * 2
  const myReviewsPending = Math.max(0, expectedReviews - myReviewsGiven.length)

  const averageRating = useMemo(() => {
    const ratings = myProjects.map((p) => p.rating).filter((r) => r != null)
    if (!ratings.length) return 0
    return Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10
  }, [myProjects])

  const collaborationScore = Math.min(100, myReviewsGiven.length * 15 + myProjects.length * 10)

  const stats = [
    { label: 'Projects Uploaded', value: myProjects.length, icon: BookOpen, bgClass: 'bg-sky-100 dark:bg-cyan-900/30', iconClass: 'text-sky-600 dark:text-cyan-300' },
    { label: 'Reviews Pending', value: myReviewsPending, icon: Clock3, bgClass: 'bg-amber-100 dark:bg-orange-900/30', iconClass: 'text-amber-600 dark:text-orange-300' },
    { label: 'Average Rating', value: averageRating || '-', icon: Sparkles, bgClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', iconClass: 'text-fuchsia-600 dark:text-fuchsia-300' },
    { label: 'Collaboration Score', value: `${collaborationScore}%`, icon: HeartPulse, bgClass: 'bg-emerald-100 dark:bg-emerald-900/30', iconClass: 'text-emerald-600 dark:text-emerald-300' },
  ]

  const chartData = [
    { week: 'W1', reviews: Math.max(0, myReviewsGiven.length - 3) },
    { week: 'W2', reviews: Math.max(0, myReviewsGiven.length - 2) },
    { week: 'W3', reviews: Math.max(0, myReviewsGiven.length - 1) },
    { week: 'W4', reviews: myReviewsGiven.length },
  ]

  const completionPct = expectedReviews ? Math.min(100, Math.round((myReviewsGiven.length / expectedReviews) * 100)) : 0

  const onDownloadReport = () => {
    const projectLines = myProjects.flatMap((p) => {
      const files = p.files || []
      const summary = `- ${p.title} | Status: ${p.status.replace('_', ' ')} | Rating: ${p.rating ?? '-'} | Teacher Score: ${p.finalScore ?? '-'} | Completion: ${p.completionPercentage ?? '-'}% | Files: ${files.length}`
      const fileLines = files.length
        ? files.map((f) => `    * ${f.name} (${Math.max(1, Math.round((f.size || 0) / 1024))} KB)`)
        : ['    * No files attached']
      return [summary, ...fileLines]
    })

    const lines = [
      'Student Peer Review Report',
      `Student: ${user?.name || 'Student'}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Projects Uploaded: ${myProjects.length}`,
      `Reviews Given: ${myReviewsGiven.length}`,
      `Average Rating: ${averageRating || '-'}`,
      '',
      'Project Summary:',
      ...projectLines,
    ]
    downloadSimplePdf({
      filename: `peer-review-report-${Date.now()}.pdf`,
      lines,
    })
  }

  const historyItems = data.activityTimeline
    .filter((item) => item.studentName === user?.name || item.actorName === user?.name)
    .slice(0, 15)

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
      <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Overview of your peer review activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, bgClass, iconClass }) => (
          <div
            key={label}
            className="bg-slate-950/5 dark:bg-slate-900/90 rounded-3xl p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)] ring-1 ring-slate-200/60 dark:ring-slate-700/60 hover:-translate-y-1 transition-transform"
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-3xl flex items-center justify-center ${bgClass}`}>
                <Icon className={`w-7 h-7 ${iconClass}`} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{label}</p>
                <p className="text-3xl font-semibold text-slate-900 dark:text-white mt-3">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-slate-950/5 to-slate-50 dark:from-slate-900/80 dark:to-slate-800/80 rounded-3xl p-6 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/60 dark:ring-slate-700/60">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Review Completion</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Progress toward your next milestone</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300 px-3 py-1 text-xs font-semibold">
              <Sparkles className="w-4 h-4" /> Goal tracking
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400">Current assignment</span>
                <span className="font-medium text-slate-900 dark:text-white">{completionPct}%</span>
              </div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-full transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{myReviewsGiven.length} completed reviews out of {expectedReviews} expected</p>
          </div>
        </div>

        <div className="bg-slate-950/5 dark:bg-slate-900/90 rounded-3xl border border-slate-200/70 dark:border-slate-700/70 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your latest project interactions</p>
            </div>
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Live feed</span>
          </div>
          <div className="space-y-4">
            {data.activityTimeline.slice(0, 4).map((item, i) => (
              <div key={item.id} className="rounded-3xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-950/80 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-300 font-semibold">{i + 1}</div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.action}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.detail}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-950/5 dark:bg-slate-900/90 rounded-3xl p-6 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/60 dark:ring-slate-700/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Weekly Review Activity</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Trends over your recent review work</p>
          </div>
          <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-3 py-1 text-xs font-semibold">{myReviewsGiven.length} reviews</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="4 4" stroke="#cbd5e1" opacity={0.25} />
              <XAxis dataKey="week" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#f8fafc' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="reviews" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 5 }} activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70 dark:ring-slate-700/70">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Download Feedback Report</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Export your peer review performance and project activity in one click.</p>
          </div>
          <button
            onClick={onDownloadReport}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-2xl shadow-lg shadow-cyan-500/20 hover:from-cyan-600 hover:to-violet-600 transition-colors"
          >
            <DownloadCloud className="w-5 h-5" />
            Download Report
          </button>
        </div>
      </div>
      </div>
      <aside className="bg-slate-950/5 dark:bg-slate-900/90 rounded-3xl p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70 dark:ring-slate-700/70 h-fit xl:sticky xl:top-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My History</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Uploads, reviews, and teacher decisions</p>
          </div>
          <span className="rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 text-xs font-semibold">Recent</span>
        </div>
        <div className="mt-4 space-y-3 max-h-[75vh] overflow-y-auto pr-1">
          {historyItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-950/80 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.projectTitle || item.action}</p>
                <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{item.time}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1">Student: {item.studentName || '-'}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1">By: {item.actorName || '-'}</span>
              </div>
            </div>
          ))}
          {historyItems.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No history yet.</p>}
        </div>
      </aside>
    </div>
  )
}
