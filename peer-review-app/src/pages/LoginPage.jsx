```jsx
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

  const generateCaptcha = useCallback(() => {
    const a = Math.floor(Math.random() * 9) + 1
    const b = Math.floor(Math.random() * 9) + 1
    return { a, b, sum: a + b }
  }, [])
  const [captcha, setCaptcha] = useState(() => generateCaptcha())

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha())
    setCaptchaInput('')
  }

  const handleRoleChange = (nextRole) => {
    setRole(nextRole)
    if (nextRole === 'admin') {
      setMode('login')
      setName('')
    }
    setCaptcha(generateCaptcha())
    setCaptchaInput('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email || !password) {
      setError('Please enter email and password')
      refreshCaptcha()
      return
    }
    if (Number(captchaInput) !== captcha.sum) {
      setError('Captcha answer is incorrect')
      refreshCaptcha()
      return
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name')
        refreshCaptcha()
        return
      }

      const reg = await register({ email, password, name, role })
      if (reg.success) {
        setMode('login')
        setSuccess('Successfully registered. Please login.')
        setShowRegisterPopup(true)
        setName('')
      } else {
        setError(reg.error || 'Registration failed')
        refreshCaptcha()
      }
    } else {
      const res = await login(email, password, role, rememberMe)
      if (res.success) {
        navigate(
          role === 'teacher'
            ? '/teacher/dashboard'
            : role === 'admin'
            ? '/admin/dashboard'
            : '/student/dashboard'
        )
      } else {
        setError(res.error || 'Login failed')
        refreshCaptcha()
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-100 via-white to-gray-100 p-12 flex-col justify-between border-r border-gray-200">
        <div className="flex items-center gap-2 text-gray-800">
          <GraduationCap className="w-10 h-10" />
          <span className="text-xl font-bold">Peer Review Platform</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Collaborate. Review. Improve.
          </h1>
          <p className="text-gray-600 mt-4">
            Enhance learning through peer feedback.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-600 text-sm">Illustration placeholder</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>

          <p className="text-gray-600 mb-6">
            {mode === 'login' ? 'Login to continue' : 'Register first'}
          </p>

          {/* LOGIN / REGISTER */}
          <div className="flex gap-2 p-1 bg-gray-200 rounded-lg mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded ${
                mode === 'login'
                  ? 'bg-white text-blue-600 shadow border'
                  : 'text-gray-600'
              }`}
            >
              Login
            </button>

            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded ${
                mode === 'register'
                  ? 'bg-white text-blue-600 shadow border'
                  : 'text-gray-600'
              }`}
            >
              Register
            </button>
          </div>

          {/* ROLE */}
          <div className="flex gap-2 p-1 bg-gray-200 rounded-lg mb-6">
            {['student', 'teacher', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`flex-1 py-2 rounded ${
                  role === r
                    ? 'bg-white text-blue-600 border'
                    : 'text-gray-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
            />

            {/* CAPTCHA */}
            <div className="flex gap-2 items-center">
              <div className="bg-gray-200 px-4 py-2 rounded">
                {captcha.a} + {captcha.b}
              </div>
              <input
                type="number"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="flex-1 p-2 bg-gray-100 border border-gray-300 rounded"
              />
            </div>

            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            <button className="w-full bg-blue-600 text-white py-2 rounded">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
```
