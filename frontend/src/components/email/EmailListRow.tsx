import { Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import type { EmailJobWithSender } from '@/types'

interface EmailListRowProps {
  item: EmailJobWithSender
}

export function EmailListRow({ item }: EmailListRowProps) {
  const { email_job, sender } = item
  const preview = email_job.body.length > 80 ? email_job.body.slice(0, 80) + '…' : email_job.body
  const initials = sender?.name
    ? sender.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : email_job.recipient[0].toUpperCase()

  return (
    <div className="flex items-center gap-4 px-6 py-3 border-b hover:bg-muted/40 transition-colors cursor-pointer group">
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Recipient */}
      <span className="text-sm font-semibold w-28 shrink-0 truncate">
        To: {email_job.recipient.split('@')[0]}
      </span>

      {/* Badge + subject + preview */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <StatusBadge status={email_job.status} scheduledAt={email_job.scheduledAt} />
        <span className="text-sm font-semibold truncate">{email_job.subject}</span>
        <span className="text-muted-foreground text-sm hidden sm:inline">·</span>
        <span className="text-sm text-muted-foreground truncate hidden sm:inline">{preview}</span>
      </div>

      {/* Star */}
      <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7">
        <Star size={15} />
      </Button>
    </div>
  )
}
