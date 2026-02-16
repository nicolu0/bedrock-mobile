import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

type Building = {
  id: string
  name: string
}

type UseBuildingsReturn = {
  buildings: Building[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useBuildings(): UseBuildingsReturn {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBuildings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("buildings")
        .select("id, name")
        .order("name")

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setBuildings(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch buildings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBuildings()
  }, [fetchBuildings])

  return {
    buildings,
    loading,
    error,
    refresh: fetchBuildings,
  }
}
