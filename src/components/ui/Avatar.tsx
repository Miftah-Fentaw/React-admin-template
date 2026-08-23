import { useState } from 'react'
import { cn } from '@/lib/cn'
import { initials as computeInitials } from '@/lib/format'

export interface AvatarProps {
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/** Avatar with graceful initials fallback (no broken images, no network). */
export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImage = src !== null && src !== undefined && !failed

  return (
    <span className={cn('avatar', `avatar--${size}`, className)}>
      {showImage ? (
        <img src={src} alt="" onError={() => setFailed(true)} loading="lazy" />
      ) : (
        <span aria-hidden="true">{computeInitials(name)}</span>
      )}
    </span>
  )
}
