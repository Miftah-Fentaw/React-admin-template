import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Feedback'
import type { User } from '@/models/User'
import { getUserMessage } from '@/lib/errors'
import { useToast } from '@/components/feedback/ToastProvider'
import { useDeleteUser } from '../hooks/use-users'

export interface DeleteUserDialogProps {
  user: User | null
  onClose: () => void
}

/** Destructive-action confirmation with explicit consequence copy. */
export function DeleteUserDialog({ user, onClose }: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (user) setServerError(null)
  }, [user])

  const handleConfirm = async () => {
    if (!user) return
    try {
      await deleteUser.mutateAsync(user.id)
      toast.success('User deleted', `${user.name} no longer has access.`)
      onClose()
    } catch (error) {
      setServerError(getUserMessage(error))
    }
  }

  return (
    <Dialog
      open={user !== null}
      onClose={onClose}
      title="Delete this user?"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={deleteUser.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => void handleConfirm()}
            isLoading={deleteUser.isPending}
          >
            Delete permanently
          </Button>
        </>
      }
    >
      {serverError && <Alert tone="destructive">{serverError}</Alert>}
      <p style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
        <strong>{user?.name}</strong> ({user?.email}) will lose access immediately. This
        action cannot be undone.
      </p>
      <Alert tone="warning" title="Consider suspending instead">
        Suspended accounts keep their history but can no longer sign in.
      </Alert>
    </Dialog>
  )
}
