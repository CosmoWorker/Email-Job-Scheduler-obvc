import { useState } from 'react'
import { Search, Filter, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sidebar } from '@/components/layout/Sidebar'
import { EmailList } from '@/components/email/EmailList'
import { useEmailJobs } from '@/hooks/useEmailJobs'
import type { EmailJobWithSender } from '@/types'

type Tab = 'scheduled' | 'sent'

interface DashboardPageProps {
  onCompose: () => void
}

export function DashboardPage({ onCompose }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('scheduled')
  const [search, setSearch] = useState('')
  const { scheduled, sent, loading, error, refetch } = useEmailJobs()

  function filterItems(items: EmailJobWithSender[]) {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(({ email_job, sender }) =>
      email_job.subject.toLowerCase().includes(q) ||
      email_job.recipient.toLowerCase().includes(q) ||
      sender?.name.toLowerCase().includes(q)
    )
  }

  const displayItems = activeTab === 'scheduled' ? filterItems(scheduled) : filterItems(sent)

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCompose={onCompose}
        scheduledCount={scheduled.length}
        sentCount={sent.length}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="pl-9 rounded-full"
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => {}}>
            <Filter size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={refetch}>
            <RefreshCw size={16} />
          </Button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          <EmailList
            items={displayItems}
            loading={loading}
            error={error}
            emptyMessage={activeTab === 'scheduled' ? 'No scheduled emails. Hit Compose to get started!' : 'No sent emails yet.'}
          />
        </div>
      </main>
    </div>
  )
}
