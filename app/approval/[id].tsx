import { View, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { useLocalSearchParams, useRouter, Stack } from "expo-router"
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

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: "Loading..." }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </ThemedView>
    )
  }

  if (error || !approval) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: "Error" }} />
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
      <Stack.Screen
        options={{
          title: approval.issue.name,
          headerBackTitle: "Back",
        }}
      />
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
