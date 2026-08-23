import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Feedback'
import type { Project } from '@/models/Project'
import { getUserMessage } from '@/lib/errors'
import { useToast } from '@/components/feedback/ToastProvider'
import { useDeleteProject } from '../hooks/use-projects'

export interface DeleteProjectDialogProps {
  project: Project | null
  onClose: () => void
}

/** Destructive-action confirmation with explicit consequence copy. */
export function DeleteProjectDialog({ project, onClose }: DeleteProjectDialogProps) {
  const deleteProject = useDeleteProject()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (project) setServerError(null)
  }, [project])

  const handleConfirm = async () => {
    if (!project) return
    try {
      await deleteProject.mutateAsync(project.id)
      toast.success('Project deleted', `“${project.name}” was removed.`)
      onClose()
    } catch (error) {
      setServerError(getUserMessage(error))
    }
  }

  return (
    <Dialog
      open={project !== null}
      onClose={onClose}
      title="Delete this project?"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={deleteProject.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => void handleConfirm()}
            isLoading={deleteProject.isPending}
          >
            Delete permanently
          </Button>
        </>
      }
    >
      {serverError && <Alert tone="destructive">{serverError}</Alert>}
      <p style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
        <strong>{project?.name}</strong> for {project?.client} and its tracking history
        will be removed. This action cannot be undone.
      </p>
      <Alert tone="warning" title="Consider archiving instead">
        Archived projects stay visible in filters so historical reporting is preserved.
      </Alert>
    </Dialog>
  )
}
