import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Mail, Lock, Shield } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [captchaInput, setCaptchaInput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showRegisterPopup, setShowRegisterPopup] = useState(false)
  const canvasRef = useRef(null)

  const generateValidationCode = useCallback(() => {
    return String(Math.floor(1000 + Math.random() * 9000))
  }, [])
  const [validationCode, setValidationCode] = useState(() => generateValidationCode())

  const refreshValidationCode = () => {
    setValidationCode(generateValidationCode())
    setCaptchaInput('')
  }

  const handleRoleChange = (nextRole) => {
    setRole(nextRole)
    if (nextRole === 'admin') {
      setMode('login')
      setName('')
    }
    setValidationCode(generateValidationCode())
    setCaptchaInput('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email || !password) {
      setError('Please enter email and password')
      refreshValidationCode()
      return
    }
    if (captchaInput.trim() !== validationCode) {
      setError('Captcha value is incorrect')
      refreshValidationCode()
      return
    }
    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name')
        refreshValidationCode()
        return
      }

      const reg = await register({ email, password, name, role })
      if (reg.success) {
        setMode('login')
        const successMessage = reg.message || 'Successfully registered. Please login with the same credentials.'
        setSuccess(successMessage)
        setShowRegisterPopup(true)
        setName('')
      } else {
        setError(reg.error || 'Registration failed')
        refreshValidationCode()
      }
    } else {
      const res = await login(email, password, role, rememberMe)
      if (res.success) {
        const targetRole = res.role || role
        setTimeout(() => {
          navigate(
            targetRole === 'teacher'
              ? '/teacher/dashboard'
              : targetRole === 'admin'
                ? '/admin/dashboard'
                : '/student/dashboard',
            { replace: true },
          )
        }, 0)
      } else {
        setError(res.error || 'Login failed')
        refreshValidationCode()
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let particles = []
    let rafId = 0
    const dpr = window.devicePixelRatio || 1
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (prefersReduced) return

    const initParticles = () => {
      const count = Math.min(90, Math.floor((w * h) / 20000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.35 + 0.15,
      }))
    }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initParticles()
    }

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(140, 180, 255, 0.35)'

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        ctx.globalAlpha = p.alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      rafId = window.requestAnimationFrame(tick)
    }

    resize()
    tick()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="login-bg" aria-hidden="true">
        <div className="login-blob login-blob-1" />
        <div className="login-blob login-blob-2" />
        <div className="login-blob login-blob-3" />
      </div>
      <canvas ref={canvasRef} className="login-particles" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 opacity-90" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <div className="mb-10 text-center text-slate-50">
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide text-cyan-200 shadow-sm shadow-cyan-500/10 backdrop-blur-sm">
              <GraduationCap className="w-5 h-5 text-cyan-200" />
              Peer Review Platform
            </div>
            <h1 className="mt-8 text-4xl sm:text-5xl font-semibold tracking-tight text-white">
              Collaborate. Review. Improve.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
              Join thousands of students who enhance their learning through peer feedback and collaborative projects.
            </p>
          </div>

          <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/15 bg-slate-900/65 p-8 shadow-[0_40px_100px_-40px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
            <div className="mb-8 text-center">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{mode === 'login' ? 'Login' : 'Register'}</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-100">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
              <p className="mt-3 text-sm text-slate-300">
                {role === 'admin'
                  ? 'Sign in with the fixed admin credentials to open the admin dashboard'
                  : mode === 'login'
                    ? 'Sign in to continue to your dashboard'
                    : 'Register first, then login'}
              </p>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  mode === 'login'
                    ? 'bg-slate-800/90 text-white border-cyan-400/30 shadow-lg shadow-cyan-500/15'
                    : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/15 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  mode === 'register'
                    ? 'bg-slate-800/90 text-white border-cyan-400/30 shadow-lg shadow-cyan-500/15'
                    : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/15 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6 rounded-2xl border border-white/10 bg-white/10 p-1 shadow-sm shadow-slate-950/10 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`rounded-2xl py-3 text-sm font-medium transition-colors duration-200 ${
                  role === 'student'
                    ? 'bg-slate-800/90 text-white shadow-sm shadow-cyan-500/10'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('teacher')}
                className={`rounded-2xl py-3 text-sm font-medium transition-colors duration-200 ${
                  role === 'teacher'
                    ? 'bg-slate-800/90 text-white shadow-sm shadow-cyan-500/10'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`rounded-2xl py-3 text-sm font-medium transition-colors duration-200 ${
                  role === 'admin'
                    ? 'bg-slate-800/90 text-white shadow-sm shadow-cyan-500/10'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-slate-700 bg-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'admin' ? 'admin@example.com' : 'you@university.edu'}
                    className="w-full rounded-2xl border border-slate-700 bg-white/10 px-4 py-3 pl-12 text-slate-100 placeholder-slate-400 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={role === 'admin' ? 'Admin password' : '••••••••'}
                    className="w-full rounded-2xl border border-slate-700 bg-white/10 px-4 py-3 pl-12 text-slate-100 placeholder-slate-400 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Captcha*</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center justify-center min-w-[120px] h-14 rounded-[1.75rem] bg-gradient-to-br from-indigo-500 via-cyan-400 to-violet-600 px-4 text-lg font-semibold tracking-[0.28em] text-white shadow-xl shadow-cyan-500/20 ring-1 ring-white/15">
                    {validationCode}
                  </div>
                  <button
                    type="button"
                    onClick={refreshValidationCode}
                    className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-slate-200 transition hover:bg-slate-900 hover:text-white"
                    title="Refresh captcha"
                  >
                    <Shield className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      spellCheck="false"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="Enter captcha"
                      className="w-full rounded-2xl border border-slate-700 bg-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-emerald-500">{success}</p>}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                  />
                  Remember me
                </label>
                <a href="#" className="text-sm text-cyan-500 hover:underline">Forgot password?</a>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-sky-500 px-5 py-3 text-base font-semibold text-white shadow-xl shadow-cyan-500/25 transition duration-200 ease-out hover:shadow-2xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950 active:translate-y-0.5 active:shadow-lg"
              >
                {role === 'admin' || mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showRegisterPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-slate-100">Registration Successful</h3>
            <p className="mt-3 text-sm text-slate-300">
              Successfully registered. Please login with the same email and credentials.
            </p>
            <button
              type="button"
              onClick={() => setShowRegisterPopup(false)}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-cyan-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-indigo-500 hover:via-cyan-400 hover:to-violet-400"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
