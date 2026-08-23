import { useCallback, useState } from 'react'
import type { z } from 'zod'

type FieldErrors<S> = Partial<Record<keyof S & string, string>>

export interface FormApi<Values, Schema> {
  values: Values
  /** Merge a partial patch into the form values. */
  setValues: React.Dispatch<React.SetStateAction<Values>>
  setField: <K extends keyof Values>(field: K, value: Values[K]) => void
  errors: FieldErrors<Schema>
  setErrors: React.Dispatch<React.SetStateAction<FieldErrors<Schema>>>
  clearError: (field: keyof Values) => void
  submitting: boolean
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * Minimal form state helper.
 *
 * Deliberately tiny: local state + Zod validation at submit time covers the
 * needs of this template without pulling in a forms library. Validation runs
 * against the shared API schemas (`src/models/schemas.ts`).
 */
export function useForm<Values extends object, Schema extends Record<string, string>>(
  initialValues: Values,
): FormApi<Values, Schema> {
  const [values, setValues] = useState<Values>(initialValues)
  const [errors, setErrors] = useState<FieldErrors<Schema>>({})
  const [submitting, setSubmitting] = useState(false)

  const setField = useCallback(<K extends keyof Values>(field: K, value: Values[K]) => {
    setValues((previous) => ({ ...previous, [field]: value }))
  }, [])

  const clearError = useCallback((field: keyof Values) => {
    setErrors((previous) => ({ ...previous, [field as string]: undefined }))
  }, [])

  return {
    values,
    setValues,
    setField,
    errors,
    setErrors,
    clearError,
    submitting,
    setSubmitting,
  }
}

/** Validate `payload` and either surface field errors or hand back parsed data. */
export function validate<S extends z.ZodType>(
  schema: S,
  payload: unknown,
): { ok: true; data: z.output<S> } | { ok: false; fieldErrors: Record<string, string> } {
  const result = schema.safeParse(payload)
  if (result.success) return { ok: true, data: result.data }

  const fieldErrors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message
  }
  return { ok: false, fieldErrors }
}
