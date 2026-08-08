import { useState } from 'react'
import { ArrowLeft, Paperclip, Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RecipientInput } from './RecipientInput'
import { SendLaterPopover } from './SendLaterPopover'
import { api } from '@/lib/api'
import { format } from 'date-fns'

const schema = z.object({
  senderName: z.string().min(1, 'Required'),
  senderEmail: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Required'),
  body: z.string().min(1, 'Required'),
  minDelayMs: z.number().min(0).optional(),
  maxEmailsPerHour: z.number().min(1).optional(),
})

type FormValues = z.infer<typeof schema>

interface ComposePageProps {
  onBack: () => void
}

export function ComposePage({ onBack }: ComposePageProps) {
  const [recipients, setRecipients] = useState<string[]>([])
  const [scheduledAt, setScheduledAt] = useState<string | null>(null)
  const [pickerValue, setPickerValue] = useState<string>('')
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { senderName: 'Angelina Rolfson', senderEmail: 'angelina.rolfson25@ethereal.email' },
  })

  async function onSubmit(data: FormValues) {
    if (recipients.length === 0) { setErrorMsg('Add at least one recipient'); return }
    if (!scheduledAt) { setErrorMsg('Pick a time using the clock icon'); return }
    setSubmitting(true)
    setErrorMsg(null)
    try {
      await Promise.all(
        recipients.map(recipient =>
          api.scheduleJob({ ...data, recipient, scheduledAt })
        )
      )
      setSuccessMsg(`Scheduled ${recipients.length} email(s)!`)
      setTimeout(onBack, 1500)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to schedule')
    } finally {
      setSubmitting(false)
    }
  }

  const formattedTime = scheduledAt ? format(new Date(scheduledAt), 'MMM d, h:mm a') : null

  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" type="button" onClick={onBack}>
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-base font-semibold">Compose New Email</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" type="button">
            <Paperclip size={18} />
          </Button>
          <SendLaterPopover
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            selectedDate={pickerValue}
            onDateChange={setPickerValue}
            onConfirm={iso => setScheduledAt(iso)}
            trigger={
              <Button variant="ghost" size="icon" type="button" className={scheduledAt ? 'text-primary' : ''}>
                <Clock size={18} />
              </Button>
            }
          />
          <Button
            variant="outline"
            type="button"
            className="text-primary border-primary hover:bg-primary/5 rounded-full"
            onClick={handleSubmit(onSubmit)}
            disabled={submitting}
          >
            {submitting ? 'Scheduling…' : scheduledAt ? `Send Later · ${formattedTime}` : 'Send Later'}
          </Button>
        </div>
      </div>

      {/* Form body */}
      <form className="flex-1 flex flex-col overflow-y-auto">
        {/* From */}
        <div className="flex items-center gap-4 px-6 py-3 border-b">
          <Label className="text-muted-foreground w-16 shrink-0">From</Label>
          <Input {...register('senderEmail')} className="max-w-xs border-0 bg-muted/60 text-sm" />
          {errors.senderEmail && <p className="text-xs text-destructive">{errors.senderEmail.message}</p>}
          <input type="hidden" {...register('senderName')} />
        </div>

        {/* To */}
        <div className="flex items-start gap-4 px-6 py-2 border-b">
          <Label className="text-muted-foreground w-16 shrink-0 mt-2">To</Label>
          <div className="flex-1">
            <RecipientInput recipients={recipients} onChange={setRecipients} />
          </div>
        </div>

        {/* Subject */}
        <div className="flex items-center gap-4 px-6 py-3 border-b">
          <Label className="text-muted-foreground w-16 shrink-0">Subject</Label>
          <input
            {...register('subject')}
            placeholder="Subject"
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
        </div>

        {/* Delay + limit */}
        <div className="flex items-center gap-6 px-6 py-3 border-b">
          <div className="flex items-center gap-2">
            <Label className="text-muted-foreground whitespace-nowrap text-sm">Delay between 2 emails</Label>
            <Input type="number" placeholder="00" className="w-20 text-center" {...register('minDelayMs', { valueAsNumber: true })} />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-muted-foreground text-sm">Hourly Limit</Label>
            <Input type="number" placeholder="00" className="w-20 text-center" {...register('maxEmailsPerHour', { valueAsNumber: true })} />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col px-6 py-4 gap-2">
          <Textarea
            {...register('body')}
            placeholder="Type Your Reply..."
            className="flex-1 min-h-[280px] resize-none bg-muted/40 border-0 text-sm focus-visible:ring-1"
          />
          {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
          {/* Static toolbar row */}
          <div className="flex items-center gap-0.5 border-t pt-2 text-muted-foreground">
            {['B', 'I', 'U', '≡', '1.', '•', '❝', 'S̶'].map(icon => (
              <button key={icon} type="button" className="w-7 h-7 flex items-center justify-center rounded text-xs hover:bg-muted hover:text-foreground transition-colors">
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        {(errorMsg || successMsg) && (
          <div className={`mx-6 mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${successMsg ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
            {successMsg ?? errorMsg}
          </div>
        )}
      </form>
    </div>
  )
}
