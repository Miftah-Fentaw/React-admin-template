import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { appConfig } from '@/config/app'
import { loginSchema } from '@/models/schemas'
import { useForm, validate } from '@/hooks/use-form'
import { useAuth } from '@/app/providers/AuthProvider'
import { getUserMessage } from '@/lib/errors'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'

interface LoginValues {
  email: string
  password: string
}

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
      const target = (location.state as { from?: string } | null)?.from ?? '/'
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
      <div className="login-card">
        <div className="login-card__brand">
          <span className="login-card__logo" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path
                d="M9 20.5 16 8.5l7 12"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="21.5" r="1.9" fill="currentColor" />
            </svg>
          </span>
          <div>
            <p className="login-card__name">{appConfig.name}</p>
            <p className="login-card__tagline">Admin workspace</p>
          </div>
        </div>

        <h1 className="login-card__title">Sign in</h1>
        <p className="login-card__subtitle">
          Access your workspace dashboard, reports and settings.
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
            <span style={{ position: 'relative', display: 'block' }}>
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
                style={{ paddingRight: 38 }}
              />
              <button
                type="button"
                className="icon-btn"
                style={{ position: 'absolute', right: 4, top: 2 }}
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

          <Button type="submit" variant="primary" isLoading={form.submitting}>
            Sign in
          </Button>
        </form>

        {appConfig.enableMockApi && (
          <div className="login-demo">
            <p className="login-demo__title">Demo accounts (mock API)</p>
            {appConfig.demoAccounts.map((account) => (
              <div key={account.email} className="login-demo__row">
                <span className="login-demo__credentials">
                  {account.email} / {account.password}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fillDemo(account.email, account.password)}
                >
                  Use {account.role}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
