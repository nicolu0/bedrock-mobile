import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Action } from "@/types/database"
import { RealtimeChannel } from "@supabase/supabase-js"

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE"

type UseRealtimeApprovalsOptions = {
  onInsert?: (action: Action) => void
  onUpdate?: (action: Action) => void
  onDelete?: (action: Action) => void
  onChange?: (event: RealtimeEvent, action: Action) => void
}

export function useRealtimeApprovals(options: UseRealtimeApprovalsOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    const channel = supabase
      .channel("actions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "actions",
        },
        (payload) => {
          const event = payload.eventType as RealtimeEvent
          const action = (payload.new || payload.old) as Action

          console.log("[Realtime] Action event:", event, action?.title)

          optionsRef.current.onChange?.(event, action)

          switch (event) {
            case "INSERT":
              optionsRef.current.onInsert?.(action)
              break
            case "UPDATE":
              optionsRef.current.onUpdate?.(action)
              break
            case "DELETE":
              optionsRef.current.onDelete?.(action)
              break
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])
}
