import type {
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
  ref?: Ref<HTMLInputElement>
}

export function Input({ invalid, className, ...rest }: InputProps) {
  return (
    <input
      className={cn('input', invalid && 'input--invalid', className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}

// ---------------------------------------------------------------------------
// Textarea
// ---------------------------------------------------------------------------

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
  ref?: Ref<HTMLTextAreaElement>
}

export function Textarea({ invalid, className, rows = 3, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn('input', 'textarea', invalid && 'input--invalid', className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}

// ---------------------------------------------------------------------------
// Select — native element, styled. Chosen over a custom listbox on purpose:
// it is fully accessible, keyboard-complete and mobile-friendly for free.
// ---------------------------------------------------------------------------

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'children'
> {
  options: SelectOption[]
  placeholder?: string
  ref?: Ref<HTMLSelectElement>
}

export function Select({ options, placeholder, className, ...rest }: SelectProps) {
  const showPlaceholder = placeholder !== undefined && rest.value === ''
  return (
    <span className="select__wrapper">
      <select
        className={cn(
          'input',
          'select',
          showPlaceholder && 'select--placeholder',
          className,
        )}
        {...rest}
      >
        {placeholder !== undefined && (
          <option value="" disabled={rest.required}>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="select__chevron" size={16} aria-hidden="true" />
    </span>
  )
}

// ---------------------------------------------------------------------------
// Field — label + control + error/hint wiring for accessible forms
// ---------------------------------------------------------------------------

export interface FieldProps {
  id: string
  label?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function Field({
  id,
  label,
  error,
  hint,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn('field', className)}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
          {required && (
            <span className="field__required" aria-hidden="true">
              {' *'}
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Checkbox
// ---------------------------------------------------------------------------

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  ref?: Ref<HTMLInputElement>
}

export function Checkbox({ label, className, id, ...rest }: CheckboxProps) {
  const inputId = id ?? rest.name ?? undefined
  return (
    <span className={cn('checkbox', className)}>
      <input id={inputId} type="checkbox" className="checkbox__input" {...rest} />
      <span className="checkbox__box" aria-hidden="true" />
      {label && (
        <label className="checkbox__label" htmlFor={inputId}>
          {label}
        </label>
      )}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Switch
// ---------------------------------------------------------------------------

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  name?: string
  disabled?: boolean
}

/** Accessible switch built on a native checkbox — no ARIA gymnastics needed. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  name,
  disabled,
}: SwitchProps) {
  return (
    <label className={cn('switch', disabled && 'switch--disabled')}>
      <input
        type="checkbox"
        name={name}
        role="switch"
        className="switch__input"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="switch__track" aria-hidden="true">
        <span className="switch__thumb" />
      </span>
      <span className="switch__text">
        <span className="switch__label">{label}</span>
        {description && <span className="switch__description">{description}</span>}
      </span>
    </label>
  )
}
