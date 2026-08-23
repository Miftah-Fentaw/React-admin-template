import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

type Tone = 'info' | 'success' | 'warning' | 'error'

interface ToastItem {
  id: number
  tone: Tone
  title: string
  description?: string
}

export interface ToastApi {
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const TONE_ICONS: Record<Tone, ReactNode> = {
  info: <Info size={16} aria-hidden="true" />,
  success: <CheckCircle2 size={16} aria-hidden="true" />,
  warning: <AlertTriangle size={16} aria-hidden="true" />,
  error: <XCircle size={16} aria-hidden="true" />,
}

const AUTO_DISMISS_MS = 5000

/**
 * Global toast notifications. Mount once near the app root; call via
 * `const toast = useToast()` from anywhere.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
  }, [])

  const show = useCallback(
    (tone: Tone, title: string, description?: string) => {
      const id = nextId.current++
      setToasts((current) => [...current.slice(-4), { id, tone, title, description }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS),
      )
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, description) => show('success', title, description),
      error: (title, description) => show('error', title, description),
      info: (title, description) => show('info', title, description),
      warning: (title, description) => show('warning', title, description),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="toast-region" aria-label="Notifications">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="status"
              className={cn('toast', `toast--${toast.tone}`)}
            >
              <span className="toast__icon">{TONE_ICONS[toast.tone]}</span>
              <div className="toast__body">
                <p className="toast__title">{toast.title}</p>
                {toast.description && (
                  <p className="toast__description">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                className="icon-btn"
                aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
