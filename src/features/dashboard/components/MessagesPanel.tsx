import { Plus } from 'lucide-react'
import type { DashboardMessage } from '@/models/Dashboard'
import { formatRelativeTime, initials } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/Feedback'
import { useToast } from '@/components/feedback/ToastProvider'

interface MessagesPanelProps {
  messages: DashboardMessage[] | undefined
}

export function MessagesPanel({ messages }: MessagesPanelProps) {
  const toast = useToast()

  function handleAddMessage() {
    toast.success('Coming soon', 'Message composer will be available in a future update.')
  }

  return (
    <div className="messages-panel">
      <div className="messages-panel__header">
        <Button
          variant="primary"
          size="sm"
          iconLeft={<Plus size={13} aria-hidden="true" />}
          onClick={handleAddMessage}
        >
          Add Message
        </Button>
      </div>

      {!messages ? (
        <div className="messages-panel__list">
          {[0, 1, 2].map((i) => (
            <div key={i} className="messages-panel__item messages-panel__item--skeleton">
              <Skeleton style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Skeleton style={{ width: '60%' }} />
                <Skeleton style={{ width: '85%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          compact
          icon={<span style={{ fontSize: 18 }}>💬</span>}
          title="No messages"
          description="Messages from staff and parents will appear here."
        />
      ) : (
        <ol className="messages-panel__list">
          {messages.map((msg) => (
            <li key={msg.id} className="messages-panel__item">
              <span className="messages-panel__avatar" aria-hidden="true">
                {initials(msg.senderName)}
              </span>
              <div className="messages-panel__body">
                <div className="messages-panel__meta">
                  <span className="messages-panel__sender">{msg.senderName}</span>
                  <time
                    className="messages-panel__time"
                    dateTime={msg.timestamp}
                  >
                    {formatRelativeTime(msg.timestamp)}
                  </time>
                </div>
                <p className="messages-panel__preview">{msg.preview}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
