import { Clock, AlertCircle, Send } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

type Status = 'pending' | 'scheduled' | 'sent' | 'failed'

interface StatusBadgeProps {
  status: Status
  scheduledAt?: string
}

export function StatusBadge({ status, scheduledAt }: StatusBadgeProps) {
  if (status === 'scheduled' || status === 'pending') {
    const label = scheduledAt
      ? format(new Date(scheduledAt), 'EEE h:mm:ss a')
      : 'Pending'
    return (
      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 gap-1 font-medium whitespace-nowrap">
        <Clock size={11} />
        {label}
      </Badge>
    )
  }

  if (status === 'failed') {
    return (
      <Badge variant="destructive" className="gap-1 font-medium whitespace-nowrap">
        <AlertCircle size={11} />
        Failed
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className="gap-1 font-medium whitespace-nowrap text-gray-600">
      <Send size={11} />
      Sent
    </Badge>
  )
}
