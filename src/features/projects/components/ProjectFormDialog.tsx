import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Feedback'
import { useForm, validate } from '@/hooks/use-form'
import { getUserMessage } from '@/lib/errors'
import { PROJECT_STATUSES, type Project } from '@/models/Project'
import type { CreateProjectPayload, UpdateProjectPayload } from '@/models/schemas'
import { createProjectSchema, updateProjectSchema } from '@/models/schemas'
import { useToast } from '@/components/feedback/ToastProvider'
import { useCreateProject, useUpdateProject } from '../hooks/use-projects'

const STATUS_OPTIONS = PROJECT_STATUSES.map((status) => ({
  value: status,
  label: (status.charAt(0).toUpperCase() + status.slice(1)).replace('_', ' '),
}))

export interface ProjectFormDialogProps {
  open: boolean
  onClose: () => void
  /** When provided the dialog edits this project; otherwise it creates one. */
  project?: Project
}

interface FormValues {
  name: string
  client: string
  ownerName: string
  status: string
  progress: string
  dueDate: string
}

/**
 * Create/edit project dialog.
 *
 * Validation runs against the shared API schema on the client; when the
 * server rejects a payload (e.g. duplicate name per client) its per-field
 * messages are merged into the same error display.
 */
export function ProjectFormDialog({ open, onClose, project }: ProjectFormDialogProps) {
  const isEdit = project !== undefined
  const toast = useToast()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const [serverError, setServerError] = useState<string | null>(null)

  const isSubmitting = createProject.isPending || updateProject.isPending

  const form = useForm<FormValues, Record<string, string>>({
    name: '',
    client: '',
    ownerName: '',
    status: 'planning',
    progress: '0',
    dueDate: '',
  })

  // Re-seed values whenever the dialog opens for a different target.
  useEffect(() => {
    if (!open) return
    form.setValues({
      name: project?.name ?? '',
      client: project?.client ?? '',
      ownerName: project?.ownerName ?? '',
      status: project?.status ?? 'planning',
      progress: String(project?.progress ?? 0),
      dueDate: project?.dueDate ?? '',
    })
    form.setErrors({})
    setServerError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project?.id])

  const applyServerFields = (fields: Record<string, string> | undefined) => {
    if (fields && Object.keys(fields).length > 0) {
      form.setErrors(fields as Partial<Record<keyof FormValues, string>>)
      setServerError(null)
    }
  }

  const handleSubmit = async () => {
    setServerError(null)
    form.setErrors({})

    const schema = isEdit ? updateProjectSchema : createProjectSchema
    const result = validate(schema, {
      ...form.values,
      ownerName: form.values.ownerName || undefined,
      dueDate: form.values.dueDate || undefined,
    })
    if (!result.ok) {
      form.setErrors(result.fieldErrors)
      return
    }

    try {
      if (isEdit && project) {
        await updateProject.mutateAsync({
          id: project.id,
          input: result.data as UpdateProjectPayload,
        })
        toast.success('Changes saved', `“${result.data.name}” was updated.`)
      } else {
        await createProject.mutateAsync(result.data as CreateProjectPayload)
        toast.success(
          'Project created',
          `“${result.data.name}” was added for ${result.data.client}.`,
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

  const title = isEdit ? `Edit ${project?.name}` : 'New project'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={
        isEdit
          ? 'Update the project details, owner and delivery status.'
          : 'Set up a new piece of client work to start tracking.'
      }
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      {serverError && <Alert tone="destructive">{serverError}</Alert>}

      <Field id="project-name" label="Project name" required error={form.errors.name}>
        <Input
          id="project-name"
          value={form.values.name}
          invalid={Boolean(form.errors.name)}
          onChange={(event) => {
            form.setField('name', event.target.value)
            form.clearError('name')
          }}
        />
      </Field>

      <Field id="project-client" label="Client" required error={form.errors.client}>
        <Input
          id="project-client"
          value={form.values.client}
          invalid={Boolean(form.errors.client)}
          onChange={(event) => {
            form.setField('client', event.target.value)
            form.clearError('client')
          }}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field id="project-owner" label="Owner" error={form.errors.ownerName}>
          <Input
            id="project-owner"
            placeholder="Unassigned"
            value={form.values.ownerName}
            invalid={Boolean(form.errors.ownerName)}
            onChange={(event) => {
              form.setField('ownerName', event.target.value)
              form.clearError('ownerName')
            }}
          />
        </Field>

        <Field id="project-status" label="Status" required>
          <Select
            id="project-status"
            options={STATUS_OPTIONS}
            value={form.values.status}
            onChange={(event) => form.setField('status', event.target.value)}
          />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field
          id="project-progress"
          label="Progress (%)"
          required
          error={form.errors.progress}
        >
          <Input
            id="project-progress"
            type="number"
            min={0}
            max={100}
            value={form.values.progress}
            invalid={Boolean(form.errors.progress)}
            onChange={(event) => {
              form.setField('progress', event.target.value)
              form.clearError('progress')
            }}
          />
        </Field>

        <Field id="project-due" label="Due date" error={form.errors.dueDate}>
          <Input
            id="project-due"
            type="date"
            value={form.values.dueDate}
            invalid={Boolean(form.errors.dueDate)}
            onChange={(event) => {
              form.setField('dueDate', event.target.value)
              form.clearError('dueDate')
            }}
          />
        </Field>
      </div>
    </Dialog>
  )
}
