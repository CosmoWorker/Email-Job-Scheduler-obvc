import { Clock, Send, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Tab = 'scheduled' | 'sent'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onCompose: () => void
  scheduledCount: number
  sentCount: number
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function NavItem({ icon, label, count, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <span className="flex items-center gap-2.5">{icon}{label}</span>
      <span className={cn('text-xs font-semibold', active ? 'text-primary' : 'text-muted-foreground')}>
        {count}
      </span>
    </button>
  )
}

export function Sidebar({ activeTab, onTabChange, onCompose, scheduledCount, sentCount }: SidebarProps) {
  const user = { name: 'Oliver Brown', email: 'oliver.brown@domain.io' }
  const initials = user.name.split(' ').map(p => p[0]).join('')

  return (
    <aside className="w-60 shrink-0 h-screen border-r bg-background flex flex-col">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <span className="font-bold text-xl tracking-tight">OBVC</span>
      </div>

      {/* User card */}
      <div className="px-3 pb-4">
        <Button variant="ghost" className="w-full h-auto px-2 py-2 justify-start gap-2.5">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <ChevronDown size={14} className="text-muted-foreground shrink-0" />
        </Button>
      </div>

      {/* Compose */}
      <div className="px-3 pb-5">
        <Button variant="outline" className="w-full rounded-full text-primary border-primary hover:bg-primary/5" onClick={onCompose}>
          Compose
        </Button>
      </div>

      {/* Nav */}
      <nav className="px-3 flex-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Core</p>
        <div className="space-y-0.5">
          <NavItem icon={<Clock size={16} />} label="Scheduled" count={scheduledCount} active={activeTab === 'scheduled'} onClick={() => onTabChange('scheduled')} />
          <NavItem icon={<Send size={16} />} label="Sent" count={sentCount} active={activeTab === 'sent'} onClick={() => onTabChange('sent')} />
        </div>
      </nav>
    </aside>
  )
}
