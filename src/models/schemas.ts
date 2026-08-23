/**
 * Runtime validation of API request payloads.
 *
 * These schemas are the single source of truth for payload contracts:
 * - feature forms validate user input against them
 * - the mock server validates incoming requests with the exact same rules
 *
 * A real backend should enforce equivalent constraints server-side.
 */
import { z } from 'zod'
import { INVOICE_STATUSES } from '@/models/Invoice'
import { ORDER_PAYMENT_STATUSES, ORDER_STATUSES } from '@/models/Order'
import { PRODUCT_CATEGORIES, PRODUCT_STATUSES } from '@/models/Product'
import { PROJECT_STATUSES } from '@/models/Project'
import { USER_ROLES, USER_STATUSES } from '@/models/User'

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginPayload = z.infer<typeof loginSchema>

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.email('Enter a valid email address'),
})

export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.email('Enter a valid email address'),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES).optional(),
})

export const updateUserSchema = createUserSchema.partial()

export type CreateUserPayload = z.infer<typeof createUserSchema>
export type UpdateUserPayload = z.infer<typeof updateUserSchema>

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  description: z
    .string()
    .trim()
    .max(280, 'Keep the description under 280 characters')
    .nullable()
    .optional(),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.coerce
    .number('Enter a valid price')
    .positive('Price must be greater than zero')
    .max(1_000_000, 'Price looks unrealistic'),
  inventory: z.coerce
    .number('Enter a valid quantity')
    .int('Inventory must be a whole number')
    .min(0, 'Inventory cannot be negative')
    .max(1_000_000),
  status: z.enum(PRODUCT_STATUSES).optional(),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductPayload = z.infer<typeof createProductSchema>
export type UpdateProductPayload = z.infer<typeof updateProductSchema>

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const updateOrderSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(ORDER_PAYMENT_STATUSES).optional(),
})

export type UpdateOrderPayload = z.infer<typeof updateOrderSchema>

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  client: z.string().trim().min(2, 'Client must be at least 2 characters').max(80),
  ownerName: z
    .string()
    .trim()
    .min(2, 'Owner must be at least 2 characters')
    .max(80)
    .optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  progress: z.coerce
    .number('Enter a valid progress value')
    .int('Progress must be a whole number')
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100')
    .optional(),
  /** ISO date string (YYYY-MM-DD); omitted when unscheduled. */
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date picker')
    .optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

export type CreateProjectPayload = z.infer<typeof createProjectSchema>
export type UpdateProjectPayload = z.infer<typeof updateProjectSchema>

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export const updateInvoiceSchema = z.object({
  status: z.enum(INVOICE_STATUSES),
})

export type UpdateInvoicePayload = z.infer<typeof updateInvoiceSchema>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flatten a ZodError into the `fields` record used by the API error contract. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !fields[key]) {
      fields[key] = issue.message
    }
  }
  return fields
}
