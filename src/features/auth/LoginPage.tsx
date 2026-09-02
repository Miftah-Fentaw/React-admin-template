import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, Database, Eye, EyeOff, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { appConfig } from '@/config/app'
import { loginSchema } from '@/models/schemas'
import { useForm, validate } from '@/hooks/use-form'
import { useAuth } from '@/app/providers/AuthProvider'
import { getUserMessage } from '@/lib/errors'
import { Button } from '@/components/ui/Button'
import { Checkbox, Field, Input } from '@/components/ui/Input'

interface LoginValues {
  email: string
  password: string
}

const PANEL_POINTS = [
  {
    icon: LayoutDashboard,
    title: 'Working dashboard',
    body: 'KPIs, charts, and lists run against the bundled mock API.',
  },
  {
    icon: Database,
    title: 'Swap the backend later',
    body: 'Every feature talks HTTP only through its service module.',
  },
  {
    icon: ShieldCheck,
    title: 'Auth you can replace',
    body: 'This page is the template. Point login at your identity provider.',
  },
  {
    icon: BarChart3,
    title: 'Ready-made screens',
    body: 'Users, products, orders, invoices, and analytics ship complete.',
  },
] as const

/**
 * Public sign-in page. Credentials are validated with the same Zod schema the
 * mock server enforces. Replace `authService.login` to wire real providers.
 */
export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [resetHint, setResetHint] = useState(false)

  const form = useForm<LoginValues, { email?: string; password?: string }>({
    email: '',
    password: '',
  })

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const result = validate(loginSchema, form.values)
    if (!result.ok) {
      form.setErrors(result.fieldErrors)
      return
    }

    form.setSubmitting(true)
    try {
      await login(result.data)
      const target = (location.state as { from?: string } | null)?.from ?? '/dashboard'
      navigate(target, { replace: true })
    } catch (error) {
      setFormError(getUserMessage(error))
    } finally {
      form.setSubmitting(false)
    }
  }

  const fillDemo = (email: string, password: string) => {
    form.setValues({ email, password })
    form.setErrors({})
    setFormError(null)
  }

  return (
    <div className="login-page">
      <div className="login-page__left">
        <div className="login-card">
          <Link to="/" className="login-card__back">
            <ArrowLeft size={14} aria-hidden="true" />
            Back to landing
          </Link>

          <div className="login-card__brand">
            <span className="login-card__mark" aria-hidden="true">
              V
            </span>
            <span className="login-card__text-logo" aria-label="Vital Admin">
              <span className="login-card__text-logo-brand">Vital</span>{' '}
              <span className="login-card__text-logo-sub">Admin</span>
            </span>
          </div>

          <h1 className="login-card__title">Sign in to your workspace</h1>
          <p className="login-card__subtitle">
            Template auth screen — use a demo account, or connect your own
            provider in <code>auth.service.ts</code>.
          </p>

          {formError && (
            <div role="alert" className="alert alert--destructive login-error">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="login-form">
            <Field id="email" label="Email" error={form.errors.email} required>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={form.values.email}
                invalid={Boolean(form.errors.email)}
                aria-describedby={form.errors.email ? 'email-error' : undefined}
                onChange={(event) => {
                  form.setField('email', event.target.value)
                  form.clearError('email')
                }}
              />
            </Field>

            <Field id="password" label="Password" error={form.errors.password} required>
              <span className="login-password">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.values.password}
                  invalid={Boolean(form.errors.password)}
                  aria-describedby={form.errors.password ? 'password-error' : undefined}
                  onChange={(event) => {
                    form.setField('password', event.target.value)
                    form.clearError('password')
                  }}
                />
                <button
                  type="button"
                  className="icon-btn login-password__toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? (
                    <EyeOff size={15} aria-hidden="true" />
                  ) : (
                    <Eye size={15} aria-hidden="true" />
                  )}
                </button>
              </span>
            </Field>

            <div className="login-form__footer">
              <Checkbox
                id="remember"
                name="remember"
                label="Remember me"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <button
                type="button"
                className="login-forgot"
                onClick={() => setResetHint(true)}
              >
                Forgot password?
              </button>
            </div>

            {resetHint && (
              <p className="login-reset-hint" role="status">
                Password reset is a stub in this template. Wire it to your identity provider.
              </p>
            )}

            <Button type="submit" variant="primary" isLoading={form.submitting}>
              Sign in
            </Button>
          </form>

          {appConfig.enableMockApi && (
            <div className="login-demo">
              <p className="login-demo__title">Try a demo account</p>
              <div className="login-demo__grid">
                {appConfig.demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    className="login-demo__card"
                    onClick={() => fillDemo(account.email, account.password)}
                  >
                    <span className="login-demo__role">{account.role}</span>
                    <span className="login-demo__credentials">{account.email}</span>
                    <span className="login-demo__hint">Click to fill</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="login-card__skip">
            Exploring the template?{' '}
            <Link to="/dashboard">Continue to dashboard</Link>
          </p>
        </div>
      </div>

      <aside className="login-page__right" aria-label="Why Vital Admin">
        <div className="login-page__panel">
          <p className="login-page__eyebrow">Open-source admin template</p>
          <h2 className="login-page__overlay-title">Ship a real dashboard, then swap the API.</h2>
          <p className="login-page__overlay-desc">
            Sign-in, session restore, and every management screen already talk to a
            mock backend. Keep the UI. Replace the last hop.
          </p>
          <ul className="login-page__features">
            {PANEL_POINTS.map((point) => (
              <li key={point.title} className="login-page__feature">
                <span className="login-page__feature-icon">
                  <point.icon size={18} aria-hidden="true" />
                </span>
                <span>
                  <strong>{point.title}</strong>
                  <span>{point.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
