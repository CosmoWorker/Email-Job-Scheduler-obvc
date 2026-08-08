import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { EmailJobWithSender } from '@/types'

interface UseEmailJobsResult {
  scheduled: EmailJobWithSender[]
  sent: EmailJobWithSender[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useEmailJobs(): UseEmailJobsResult {
  const [scheduled, setScheduled] = useState<EmailJobWithSender[]>([])
  const [sent, setSent] = useState<EmailJobWithSender[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [scheduledData, sentData] = await Promise.all([
        api.getScheduled(),
        api.getSent(),
      ])
      setScheduled(scheduledData)
      setSent(sentData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emails')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { scheduled, sent, loading, error, refetch: fetchAll }
}
