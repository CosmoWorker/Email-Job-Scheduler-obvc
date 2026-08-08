import { useState, useRef, type KeyboardEvent } from 'react'
import { X, Upload } from 'lucide-react'

interface RecipientInputProps {
  recipients: string[]
  onChange: (recipients: string[]) => void
}

export function RecipientInput({ recipients, onChange }: RecipientInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addRecipient(email: string) {
    const trimmed = email.trim()
    if (trimmed && !recipients.includes(trimmed)) onChange([...recipients, trimmed])
    setInputValue('')
  }

  function removeRecipient(email: string) {
    onChange(recipients.filter(r => r !== email))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault()
      addRecipient(inputValue)
    }
    if (e.key === 'Backspace' && inputValue === '' && recipients.length > 0) {
      onChange(recipients.slice(0, -1))
    }
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const emails = (ev.target?.result as string)
        .split(/[\n,]/)
        .map(s => s.trim())
        .filter(s => s.includes('@'))
      onChange([...new Set([...recipients, ...emails])])
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const visibleChips = recipients.slice(0, 3)
  const overflow = recipients.length - 3

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 min-h-[36px] focus-within:border-primary transition-colors py-1"
      onClick={() => inputRef.current?.focus()}
    >
      {visibleChips.map(email => (
        <span key={email} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-primary/60 text-primary bg-primary/5 text-xs font-medium">
          {email}
          <button type="button" onClick={e => { e.stopPropagation(); removeRecipient(email) }} className="hover:text-primary/70">
            <X size={10} />
          </button>
        </span>
      ))}
      {overflow > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-primary/60 text-primary bg-primary/5 text-xs font-medium">+{overflow}</span>
      )}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (inputValue) addRecipient(inputValue) }}
        placeholder={recipients.length === 0 ? 'recipient@example.com' : ''}
        className="flex-1 min-w-[160px] bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
      />
      <label className="ml-auto flex items-center gap-1 text-xs text-primary font-medium cursor-pointer hover:text-primary/80 shrink-0">
        <Upload size={13} />
        Upload List
        <input type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvUpload} />
      </label>
    </div>
  )
}
