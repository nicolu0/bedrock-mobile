import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { ActionWithDetails, ActionStatus } from "@/types/database"

type UseApprovalsOptions = {
  status?: ActionStatus | "all"
}

type UseApprovalsReturn = {
  approvals: ActionWithDetails[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useApprovals(
  options: UseApprovalsOptions = { status: "pending" }
): UseApprovalsReturn {
  const [approvals, setApprovals] = useState<ActionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Debug: Check current session
      const { data: { session } } = await supabase.auth.getSession()
      console.log("[useApprovals] Current user:", session?.user?.email ?? "NOT LOGGED IN")

      let query = supabase
        .from("actions")
        .select(`
          *,
          issue:issues (
            *,
            unit:units (
              *,
              building:buildings (*)
            ),
            tenant:tenants (*),
            vendor:vendors!issues_vendor_id_fkey (*),
            suggested_vendor:vendors!issues_suggested_vendor_id_fkey (*)
          )
        `)
        .order("created_at", { ascending: false })

      if (options.status && options.status !== "all") {
        query = query.eq("status", options.status)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.log("[useApprovals] Error:", fetchError.message)
        setError(fetchError.message)
        return
      }

      console.log("[useApprovals] Fetched approvals:", data?.length ?? 0)
      setApprovals((data as unknown as ActionWithDetails[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch approvals")
    } finally {
      setLoading(false)
    }
  }, [options.status])

  useEffect(() => {
    fetchApprovals()
  }, [fetchApprovals])

  return {
    approvals,
    loading,
    error,
    refresh: fetchApprovals,
  }
}
