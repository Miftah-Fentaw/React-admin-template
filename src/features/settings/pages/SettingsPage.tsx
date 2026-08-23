import { useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import type { AuthUser } from '@/models/User'
import { updateProfileSchema } from '@/models/schemas'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Feedback'
import { useAuth } from '@/app/providers/AuthProvider'
import { useTheme } from '@/app/providers/ThemeProvider'
import type { ThemePreference } from '@/app/providers/ThemeProvider'
import { authService } from '@/services/auth/auth.service'
import { getUserMessage } from '@/lib/errors'
import { useToast } from '@/components/feedback/ToastProvider'
import { appConfig } from '@/config/app'
import { useForm, validate } from '@/hooks/use-form'

const THEME_OPTIONS: ReadonlyArray<{
  value: ThemePreference
  label: string
  previewClass: string
  icon: typeof Sun
}> = [
  {
    value: 'light',
    label: 'Light',
    previewClass: 'theme-option__preview--light',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    previewClass: 'theme-option__preview--dark',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    previewClass: 'theme-option__preview--system',
    icon: Monitor,
  },
]

interface ProfileValues {
  name: string
  email: string
}

/**
 * Account settings: profile details (persisted through the auth API) and
 * appearance preferences. A template example of a simple settings page.
 */
export function SettingsPage() {
  const { user } = useAuth()

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile and application preferences."
      />

      <div className="settings-layout">
        {user ? <ProfileCard user={user} /> : null}

        <AppearanceCard />

        <Card>
          <CardHeader>
            <div>
              <CardTitle>About</CardTitle>
              <CardDescription>Template information.</CardDescription>
            </div>
          </CardHeader>
          <CardContent style={{ paddingTop: 8 }}>
            <p className="text-sm text-muted">
              {appConfig.name} v{appConfig.version} — a React admin template with a mock
              API, theming and role-based access. Swap the mock services for your backend
              to ship.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function ProfileCard({ user }: { user: AuthUser }) {
  const { setUser } = useAuth()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<ProfileValues, Record<string, string>>({
    name: user?.name ?? '',
    email: user?.email ?? '',
  })
  const isDirty =
    form.values.name !== (user?.name ?? '') || form.values.email !== (user?.email ?? '')

  const handleSubmit = async () => {
    setServerError(null)
    form.setErrors({})

    const result = validate(updateProfileSchema, form.values)
    if (!result.ok) {
      form.setErrors(result.fieldErrors)
      return
    }

    form.setSubmitting(true)
    try {
      const updated = await authService.updateProfile(result.data)
      setUser(updated)
      toast.success('Profile updated')
    } catch (error) {
      applyServerFields((error as { fields?: Record<string, string> }).fields)
      if ((error as { fields?: Record<string, string> }).fields === undefined) {
        setServerError(getUserMessage(error))
      }
    } finally {
      form.setSubmitting(false)
    }
  }

  const applyServerFields = (fields: Record<string, string> | undefined) => {
    if (fields && Object.keys(fields).length > 0) {
      form.setErrors(fields as Partial<Record<keyof ProfileValues, string>>)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            How your account appears across the workspace.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent style={{ paddingTop: 8 }}>
        {serverError && (
          <div style={{ marginBottom: 14 }}>
            <Alert tone="destructive">{serverError}</Alert>
          </div>
        )}

        <Field id="profile-name" label="Full name" required error={form.errors.name}>
          <Input
            id="profile-name"
            autoComplete="name"
            value={form.values.name}
            invalid={Boolean(form.errors.name)}
            onChange={(event) => {
              form.setField('name', event.target.value)
              form.clearError('name')
            }}
          />
        </Field>

        <Field id="profile-email" label="Email" required error={form.errors.email}>
          <Input
            id="profile-email"
            type="email"
            autoComplete="email"
            value={form.values.email}
            invalid={Boolean(form.errors.email)}
            onChange={(event) => {
              form.setField('email', event.target.value)
              form.clearError('email')
            }}
          />
        </Field>
      </CardContent>

      <CardFooter style={{ justifyContent: 'flex-end' }}>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={form.submitting}
          disabled={!isDirty || form.submitting}
        >
          Save changes
        </Button>
      </CardFooter>
    </Card>
  )
}

function AppearanceCard() {
  const { preference, resolvedTheme, setPreference } = useTheme()

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Currently rendering in {resolvedTheme} mode. "System" follows your OS setting.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="settings-section__body" style={{ paddingTop: 8 }}>
        <span className="text-sm text-muted">Theme</span>
        <div className="theme-options" role="radiogroup" aria-label="Theme">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon
            const selected = preference === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`theme-option ${selected ? 'theme-option--selected' : ''}`}
                onClick={() => setPreference(option.value)}
              >
                <span
                  className={`theme-option__preview ${option.previewClass}`}
                  aria-hidden="true"
                />
                <Icon size={14} aria-hidden="true" />
                {option.label}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
