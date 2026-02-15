import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Button } from "@/components/ui/button"
import { AnimatedBottomSheet } from "@/components/ui/animated-bottom-sheet"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"
import { approveRequest, denyRequest } from "@/lib/approval-actions"

type ApprovalActionsProps = {
  approvalId: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

type ActionType = "approve" | "deny" | null

export function ApprovalActions({
  approvalId,
  onSuccess,
  onError,
}: ApprovalActionsProps) {
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]

  const [modalVisible, setModalVisible] = useState(false)
  const [actionType, setActionType] = useState<ActionType>(null)
  const [loading, setLoading] = useState(false)

  const handleAction = (type: ActionType) => {
    setActionType(type)
    setModalVisible(true)
  }

  const handleConfirm = async () => {
    if (!actionType) return

    setLoading(true)
    try {
      const result =
        actionType === "approve"
          ? await approveRequest(approvalId)
          : await denyRequest(approvalId)

      if (result.success) {
        setModalVisible(false)
        onSuccess?.()
      } else {
        onError?.(result.error ?? "Unknown error")
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setModalVisible(false)
    setActionType(null)
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.cardBorder }]}>
      <View style={styles.buttonRow}>
        <View style={styles.buttonWrapper}>
          <Button
            title="Deny"
            variant="destructive"
            size="lg"
            fullWidth
            onPress={() => handleAction("deny")}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="Approve"
            variant="success"
            size="lg"
            fullWidth
            onPress={() => handleAction("approve")}
          />
        </View>
      </View>

      <AnimatedBottomSheet
        visible={modalVisible}
        onClose={handleCancel}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {actionType === "approve" ? "Approve Request" : "Deny Request"}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.secondary }]}>
              {actionType === "approve"
                ? "Confirm approval of this AI recommendation. The vendor will be dispatched."
                : "Deny this recommendation. The AI will propose an alternative."}
            </Text>

            <View style={styles.modalButtonRow}>
              <View style={styles.modalButtonWrapper}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onPress={handleCancel}
                  disabled={loading}
                />
              </View>
              <View style={styles.modalButtonWrapper}>
                <Button
                  title={actionType === "approve" ? "Confirm Approval" : "Confirm Deny"}
                  variant={actionType === "approve" ? "success" : "destructive"}
                  size="lg"
                  fullWidth
                  onPress={handleConfirm}
                  loading={loading}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </AnimatedBottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 32,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalButtonWrapper: {
    flex: 1,
  },
})
