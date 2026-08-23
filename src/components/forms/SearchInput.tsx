import { Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Input } from '../ui/Input'

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Accessible name; visible labels are provided by the surrounding toolbar. */
  label?: string
  className?: string
}

/** Debounced by the consumer (see `useDebouncedValue`); this is purely visual. */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  label = 'Search',
  className,
}: SearchInputProps) {
  return (
    <span className={cn('search-input', className)}>
      <Search size={15} className="search-input__icon" aria-hidden="true" />
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="search-input__field"
      />
      {value !== '' && (
        <button
          type="button"
          className="icon-btn search-input__clear"
          aria-label="Clear search"
          onClick={() => onChange('')}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </span>
  )
}
