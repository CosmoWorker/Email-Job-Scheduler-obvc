import { Calendar } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { addDays, setHours, setMinutes, setSeconds, format } from 'date-fns'

function quickDate(hour: number): Date {
  return setSeconds(setMinutes(setHours(addDays(new Date(), 1), hour), 0), 0)
}

const QUICK_PICKS = [
  { label: 'Tomorrow', date: () => setSeconds(setMinutes(setHours(addDays(new Date(), 1), 9), 0), 0) },
  { label: 'Tomorrow, 10:00 AM', date: () => quickDate(10) },
  { label: 'Tomorrow, 11:00 AM', date: () => quickDate(11) },
  { label: 'Tomorrow, 3:00 PM', date: () => quickDate(15) },
]

interface Props {
  onConfirm: (isoDate: string) => void
  selectedDate: string | null
  onDateChange: (val: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: React.ReactElement
}

export function SendLaterPopover({ onConfirm, selectedDate, onDateChange, open, onOpenChange, trigger }: Props) {
  function handleDone() {
    if (selectedDate) {
      onConfirm(new Date(selectedDate).toISOString())
      onOpenChange(false)
    }
  }

  function handleQuickPick(date: Date) {
    const localStr = format(date, "yyyy-MM-dd'T'HH:mm")
    onDateChange(localStr)
    onConfirm(date.toISOString())
    onOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger render={trigger} />
      <PopoverContent side="bottom" align="end" className="w-72 p-4">
        <p className="text-sm font-semibold mb-3">Send Later</p>

        <div className="relative mb-3">
          <input
            id="send-later-dt"
            type="datetime-local"
            value={selectedDate ?? ''}
            onChange={e => onDateChange(e.target.value)}
            className="w-full rounded-2xl border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        <div className="space-y-0.5 mb-4">
          {QUICK_PICKS.map(({ label, date }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleQuickPick(date())}
              className="w-full text-left text-sm px-2 py-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="outline" size="sm" type="button" onClick={handleDone} disabled={!selectedDate}>Done</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
