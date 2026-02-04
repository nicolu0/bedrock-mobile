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

          options.onChange?.(event, action)

          switch (event) {
            case "INSERT":
              options.onInsert?.(action)
              break
            case "UPDATE":
              options.onUpdate?.(action)
              break
            case "DELETE":
              options.onDelete?.(action)
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
  }, [options.onInsert, options.onUpdate, options.onDelete, options.onChange])
}
