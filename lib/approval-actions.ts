import { supabase } from "./supabase"
import { Action } from "@/types/database"

export type ApproveResult = {
  success: boolean
  error?: string
}

export async function approveRequest(
  id: string,
  notes?: string
): Promise<ApproveResult> {
  try {
    // Get the action to find the issue and vendor
    const { data: action, error: fetchError } = await supabase
      .from("actions")
      .select("*, issue:issues(*)")
      .eq("id", id)
      .single()

    if (fetchError || !action) {
      return { success: false, error: fetchError?.message ?? "Action not found" }
    }

    // Update the action status
    const { error: actionError } = await supabase
      .from("actions")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (actionError) {
      return { success: false, error: actionError.message }
    }

    // Update the issue status to 'in progress' and assign vendor if applicable
    const issueUpdate: { status: string; vendor_id?: string } = {
      status: "in progress",
    }

    if (action.proposed_vendor_id) {
      issueUpdate.vendor_id = action.proposed_vendor_id
    }

    const { error: issueError } = await supabase
      .from("issues")
      .update(issueUpdate)
      .eq("id", action.issue_id)

    if (issueError) {
      return { success: false, error: issueError.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function denyRequest(
  id: string,
  notes?: string
): Promise<ApproveResult> {
  try {
    // Get the action to find the issue
    const { data: action, error: fetchError } = await supabase
      .from("actions")
      .select("issue_id")
      .eq("id", id)
      .single()

    if (fetchError || !action) {
      return { success: false, error: fetchError?.message ?? "Action not found" }
    }

    // Update the action status
    const { error: actionError } = await supabase
      .from("actions")
      .update({
        status: "denied",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (actionError) {
      return { success: false, error: actionError.message }
    }

    // Set issue back to 'in progress' so AI can propose alternative
    const { error: issueError } = await supabase
      .from("issues")
      .update({ status: "in progress" })
      .eq("id", action.issue_id)

    if (issueError) {
      return { success: false, error: issueError.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
