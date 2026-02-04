import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { ActionWithDetails } from "@/types/database"

type UseApprovalReturn = {
  approval: ActionWithDetails | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useApproval(id: string | undefined): UseApprovalReturn {
  const [approval, setApproval] = useState<ActionWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApproval = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("actions")
        .select(`
          *,
          issue:issues (
            *,
            unit:units (
              *,
              building:buildings (*)
            ),
            tenant:tenants (*)
          ),
          proposed_vendor:vendors (*)
        `)
        .eq("id", id)
        .single()

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setApproval(data as unknown as ActionWithDetails)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch approval")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchApproval()
  }, [fetchApproval])

  return {
    approval,
    loading,
    error,
    refresh: fetchApproval,
  }
}
