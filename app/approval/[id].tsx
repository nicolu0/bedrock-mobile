import { View, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ThemedView } from "@/components/themed-view"
import { ThemedText } from "@/components/themed-text"
import { ApprovalDetail } from "@/components/approval/approval-detail"
import { ApprovalActions } from "@/components/approval/approval-actions"
import { useApproval } from "@/hooks/use-approval"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"
import { IconSymbol } from "@/components/ui/icon-symbol"

export default function ApprovalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]

  const insets = useSafeAreaInsets()
  const { approval, loading, error, refresh } = useApproval(id)

  const handleSuccess = () => {
    Alert.alert(
      "Success",
      "Your decision has been recorded.",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    )
  }

  const handleError = (errorMessage: string) => {
    Alert.alert("Error", errorMessage)
  }

  const headerTitle = loading ? "Loading..." : error || !approval ? "Error" : approval.issue.name

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.cardBorder }]}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <IconSymbol name="chevron.left" size={15} color={colors.tint} />
        <ThemedText style={{ fontSize: 17, color: colors.tint }}>Back</ThemedText>
      </Pressable>
      <ThemedText numberOfLines={1} style={styles.headerTitle}>
        {headerTitle}
      </ThemedText>
      <View style={styles.headerSpacer} />
    </View>
  )

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        {header}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </ThemedView>
    )
  }

  if (error || !approval) {
    return (
      <ThemedView style={styles.container}>
        {header}
        <View style={styles.centered}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={colors.danger} />
          <ThemedText type="subtitle" style={styles.errorTitle}>
            Could not load approval
          </ThemedText>
          <ThemedText style={[styles.errorText, { color: colors.secondary }]}>
            {error ?? "Approval not found"}
          </ThemedText>
        </View>
      </ThemedView>
    )
  }

  const isPending = approval.status === "pending"

  return (
    <ThemedView style={styles.container}>
      {header}
      <ApprovalDetail approval={approval} />
      {isPending && (
        <ApprovalActions
          approvalId={approval.id}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 80,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 21,
    fontWeight: "600",
  },
  headerSpacer: {
    minWidth: 80,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginTop: 16,
    textAlign: "center",
  },
  errorText: {
    marginTop: 8,
    textAlign: "center",
  },
})
