import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Feedback'
import { useForm, validate } from '@/hooks/use-form'
import { getUserMessage } from '@/lib/errors'
import { PRODUCT_CATEGORIES, PRODUCT_STATUSES, type Product } from '@/models/Product'
import type { CreateProductPayload } from '@/models/schemas'
import { createProductSchema, updateProductSchema } from '@/models/schemas'
import { useToast } from '@/components/feedback/ToastProvider'
import { useCreateProduct, useUpdateProduct } from '../hooks/use-products'

const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.map((category) => ({
  value: category,
  label: category.charAt(0).toUpperCase() + category.slice(1),
}))

const STATUS_OPTIONS = PRODUCT_STATUSES.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}))

export interface ProductFormDialogProps {
  open: boolean
  onClose: () => void
  product?: Product
}

interface FormValues {
  name: string
  description: string
  category: string
  price: string
  inventory: string
  status: string
}

/** Create/edit product dialog with shared-schema validation. */
export function ProductFormDialog({ open, onClose, product }: ProductFormDialogProps) {
  const isEdit = product !== undefined
  const toast = useToast()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const [serverError, setServerError] = useState<string | null>(null)

  const isSubmitting = createProduct.isPending || updateProduct.isPending

  const form = useForm<FormValues, Record<string, string>>({
    name: '',
    description: '',
    category: 'electronics',
    price: '',
    inventory: '0',
    status: 'draft',
  })

  useEffect(() => {
    if (!open) return
    form.setValues({
      name: product?.name ?? '',
      description: product?.description ?? '',
      category: product?.category ?? 'electronics',
      price: product !== undefined ? String(product.price) : '',
      inventory: product !== undefined ? String(product.inventory) : '0',
      status: product?.status ?? 'draft',
    })
    form.setErrors({})
    setServerError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id])

  const handleSubmit = async () => {
    setServerError(null)
    form.setErrors({})

    const schema = isEdit ? updateProductSchema : createProductSchema
    const result = validate(schema, form.values)
    if (!result.ok) {
      form.setErrors(result.fieldErrors)
      return
    }

    try {
      if (isEdit && product) {
        await updateProduct.mutateAsync({ id: product.id, input: result.data })
        toast.success('Changes saved', `${result.data.name} was updated.`)
      } else {
        await createProduct.mutateAsync(result.data as CreateProductPayload)
        toast.success('Product created', `${result.data.name} is now in the catalog.`)
      }
      onClose()
    } catch (error) {
      const fields = (error as { fields?: Record<string, string> }).fields
      if (fields && Object.keys(fields).length > 0) {
        form.setErrors(fields)
      } else {
        setServerError(getUserMessage(error))
      }
    }
  }

  const title = isEdit ? `Edit ${product?.name}` : 'New product'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={
        isEdit
          ? 'Update catalog details for this product.'
          : 'Add an item to your product catalog.'
      }
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
        </>
      }
    >
      {serverError && <Alert tone="destructive">{serverError}</Alert>}

      <Field id="product-name" label="Name" required error={form.errors.name}>
        <Input
          id="product-name"
          value={form.values.name}
          invalid={Boolean(form.errors.name)}
          onChange={(event) => {
            form.setField('name', event.target.value)
            form.clearError('name')
          }}
        />
      </Field>

      <Field
        id="product-description"
        label="Description"
        hint="Optional — shown on the product detail page."
        error={form.errors.description}
      >
        <Textarea
          id="product-description"
          value={form.values.description}
          invalid={Boolean(form.errors.description)}
          onChange={(event) => {
            form.setField('description', event.target.value)
            form.clearError('description')
          }}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field id="product-category" label="Category" required>
          <Select
            id="product-category"
            options={CATEGORY_OPTIONS}
            value={form.values.category}
            onChange={(event) => form.setField('category', event.target.value)}
          />
        </Field>

        <Field id="product-price" label="Price ($)" required error={form.errors.price}>
          <Input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.values.price}
            invalid={Boolean(form.errors.price)}
            onChange={(event) => {
              form.setField('price', event.target.value)
              form.clearError('price')
            }}
          />
        </Field>

        <Field
          id="product-inventory"
          label="Inventory"
          required
          error={form.errors.inventory}
        >
          <Input
            id="product-inventory"
            type="number"
            min="0"
            step="1"
            value={form.values.inventory}
            invalid={Boolean(form.errors.inventory)}
            onChange={(event) => {
              form.setField('inventory', event.target.value)
              form.clearError('inventory')
            }}
          />
        </Field>
      </div>

      <Field id="product-status" label="Status" required>
        <Select
          id="product-status"
          options={STATUS_OPTIONS}
          value={form.values.status}
          onChange={(event) => form.setField('status', event.target.value)}
        />
      </Field>
    </Dialog>
  )
}
