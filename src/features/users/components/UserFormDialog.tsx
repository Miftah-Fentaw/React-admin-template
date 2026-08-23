import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Feedback'
import { useForm, validate } from '@/hooks/use-form'
import { getUserMessage } from '@/lib/errors'
import { USER_ROLES, USER_STATUSES, type User } from '@/models/User'
import type { CreateUserPayload, UpdateUserPayload } from '@/models/schemas'
import { createUserSchema, updateUserSchema } from '@/models/schemas'
import { useToast } from '@/components/feedback/ToastProvider'
import { useCreateUser, useUpdateUser } from '../hooks/use-users'

const ROLE_OPTIONS = USER_ROLES.map((role) => ({
  value: role,
  label: role.charAt(0).toUpperCase() + role.slice(1),
}))

const STATUS_OPTIONS = USER_STATUSES.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}))

export interface UserFormDialogProps {
  open: boolean
  onClose: () => void
  /** When provided the dialog edits this user; otherwise it creates one. */
  user?: User
}

interface FormValues {
  name: string
  email: string
  role: string
  status: string
}

/**
 * Create/edit user dialog.
 *
 * Validation runs against the shared API schema on the client; when the
 * server rejects a payload (e.g. duplicate email) its per-field messages are
 * merged into the same error display.
 */
export function UserFormDialog({ open, onClose, user }: UserFormDialogProps) {
  const isEdit = user !== undefined
  const toast = useToast()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const [serverError, setServerError] = useState<string | null>(null)

  const isSubmitting = createUser.isPending || updateUser.isPending

  const form = useForm<FormValues, Record<string, string>>({
    name: '',
    email: '',
    role: 'member',
    status: 'invited',
  })

  // Re-seed values whenever the dialog opens for a different target.
  useEffect(() => {
    if (!open) return
    form.setValues({
      name: user?.name ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'member',
      status: user?.status ?? 'invited',
    })
    form.setErrors({})
    setServerError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id])

  const applyServerFields = (fields: Record<string, string> | undefined) => {
    if (fields && Object.keys(fields).length > 0) {
      form.setErrors(fields as Partial<Record<keyof FormValues, string>>)
      setServerError(null)
    }
  }

  const handleSubmit = async () => {
    setServerError(null)
    form.setErrors({})

    const schema = isEdit ? updateUserSchema : createUserSchema
    const result = validate(schema, form.values)
    if (!result.ok) {
      form.setErrors(result.fieldErrors)
      return
    }

    try {
      if (isEdit && user) {
        await updateUser.mutateAsync({
          id: user.id,
          input: result.data as UpdateUserPayload,
        })
        toast.success('Changes saved', `${result.data.name}'s profile was updated.`)
      } else {
        await createUser.mutateAsync(result.data as CreateUserPayload)
        toast.success(
          'Invitation sent',
          `${result.data.name} was added as ${result.data.role}.`,
        )
      }
      onClose()
    } catch (error) {
      applyServerFields((error as { fields?: Record<string, string> }).fields)
      if ((error as { fields?: Record<string, string> }).fields === undefined) {
        setServerError(getUserMessage(error))
      }
    }
  }

  const title = isEdit ? `Edit ${user?.name}` : 'Invite a new user'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={
        isEdit
          ? 'Update the member’s profile, role and access status.'
          : 'They will receive an invitation by email once created.'
      }
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Send invite'}
          </Button>
        </>
      }
    >
      {serverError && <Alert tone="destructive">{serverError}</Alert>}

      <Field id="user-name" label="Full name" required error={form.errors.name}>
        <Input
          id="user-name"
          value={form.values.name}
          invalid={Boolean(form.errors.name)}
          aria-describedby={form.errors.name ? 'user-name-error' : undefined}
          onChange={(event) => {
            form.setField('name', event.target.value)
            form.clearError('name')
          }}
        />
      </Field>

      <Field id="user-email" label="Email" required error={form.errors.email}>
        <Input
          id="user-email"
          type="email"
          autoComplete="off"
          value={form.values.email}
          invalid={Boolean(form.errors.email)}
          aria-describedby={form.errors.email ? 'user-email-error' : undefined}
          onChange={(event) => {
            form.setField('email', event.target.value)
            form.clearError('email')
          }}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field id="user-role" label="Role" required>
          <Select
            id="user-role"
            options={ROLE_OPTIONS}
            value={form.values.role}
            onChange={(event) => form.setField('role', event.target.value)}
          />
        </Field>

        <Field id="user-status" label="Status" required>
          <Select
            id="user-status"
            options={STATUS_OPTIONS}
            value={form.values.status}
            onChange={(event) => form.setField('status', event.target.value)}
          />
        </Field>
      </div>
    </Dialog>
  )
}
