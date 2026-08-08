import { Inbox } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmailListRow } from './EmailListRow'
import type { EmailJobWithSender } from '@/types'

interface EmailListProps {
  items: EmailJobWithSender[]
  loading: boolean
  error: string | null
  emptyMessage?: string
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-3 border-b">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <Skeleton className="h-4 w-24 shrink-0" />
      <div className="flex items-center gap-2 flex-1">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  )
}

export function EmailList({ items, loading, error, emptyMessage = 'No emails here yet.' }: EmailListProps) {
  if (loading) {
    return (
      <div>
        {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2 text-muted-foreground">
        <p className="text-sm">Could not load emails — is the backend running?</p>
        <p className="text-xs text-muted-foreground/60">{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <Inbox size={36} className="opacity-30" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div>
      {items.map(item => <EmailListRow key={item.email_job.id} item={item} />)}
    </div>
  )
}
