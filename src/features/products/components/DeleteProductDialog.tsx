import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Feedback'
import type { Product } from '@/models/Product'
import { getUserMessage } from '@/lib/errors'
import { useToast } from '@/components/feedback/ToastProvider'
import { useDeleteProduct } from '../hooks/use-products'

export interface DeleteProductDialogProps {
  product: Product | null
  onClose: () => void
}

export function DeleteProductDialog({ product, onClose }: DeleteProductDialogProps) {
  const deleteProduct = useDeleteProduct()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (product) setServerError(null)
  }, [product])

  const handleConfirm = async () => {
    if (!product) return
    try {
      await deleteProduct.mutateAsync(product.id)
      toast.success('Product deleted', `${product.name} was removed from the catalog.`)
      onClose()
    } catch (error) {
      setServerError(getUserMessage(error))
    }
  }

  return (
    <Dialog
      open={product !== null}
      onClose={onClose}
      title="Delete this product?"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={deleteProduct.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => void handleConfirm()}
            isLoading={deleteProduct.isPending}
          >
            Delete permanently
          </Button>
        </>
      }
    >
      {serverError && <Alert tone="destructive">{serverError}</Alert>}
      <p style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
        <strong>{product?.name}</strong> ({product?.sku}) will be removed from the
        catalog. Past orders that reference it are unaffected. This action cannot be
        undone.
      </p>
    </Dialog>
  )
}
