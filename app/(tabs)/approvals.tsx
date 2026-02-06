import { useCallback, useState, useMemo } from "react"
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ThemedView } from "@/components/themed-view"
import { ThemedText } from "@/components/themed-text"
import { ApprovalCard } from "@/components/approval/approval-card"
import { TinderApprovalView } from "@/components/approval/tinder-approval-view"
import { useApprovals } from "@/hooks/use-approvals"
import { useRealtimeApprovals } from "@/hooks/use-realtime-approvals"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"
import { ActionWithDetails } from "@/types/database"
import { IconSymbol } from "@/components/ui/icon-symbol"

export default function ApprovalsScreen() {
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]

  const [viewMode, setViewMode] = useState<"list" | "tinder">("list")
  const { approvals, loading, error, refresh } = useApprovals({ status: "pending" })

  // Reverse for oldest-first in Tinder view
  const tinderApprovals = useMemo(() => [...approvals].reverse(), [approvals])

  // Real-time updates
  useRealtimeApprovals({
    onChange: () => {
      refresh()
    },
  })

  const renderItem = useCallback(
    ({ item }: { item: ActionWithDetails }) => (
      <ApprovalCard approval={item} />
    ),
    []
  )

  const renderEmpty = () => {
    if (loading) return null

    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name="checkmark.circle" size={64} color={colors.success} />
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          All Caught Up!
        </ThemedText>
        <ThemedText style={[styles.emptyText, { color: colors.secondary }]}>
          No pending approvals at the moment. New requests will appear here automatically.
        </ThemedText>
      </View>
    )
  }

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "list" ? "tinder" : "list"))
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <ThemedText type="title">Approvals</ThemedText>
        <Pressable
          onPress={toggleViewMode}
          style={({ pressed }) => [
            styles.toggleButton,
            { backgroundColor: colors.secondaryBackground, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <IconSymbol
            name={viewMode === "list" ? "rectangle.stack" : "list.bullet"}
            size={20}
            color={colors.tint}
          />
        </Pressable>
      </View>
      <ThemedText style={[styles.subtitle, { color: colors.secondary }]}>
        {approvals.length} pending request{approvals.length !== 1 ? "s" : ""}
      </ThemedText>
    </View>
  )

  if (error) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={colors.danger} />
          <ThemedText type="subtitle" style={styles.errorTitle}>
            Something went wrong
          </ThemedText>
          <ThemedText style={[styles.errorText, { color: colors.secondary }]}>
            {error}
          </ThemedText>
        </View>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {viewMode === "list" ? (
        <FlatList
          data={approvals}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor={colors.tint}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <>
          <View style={styles.tinderHeader}>{renderHeader()}</View>
          <TinderApprovalView
            approvals={tinderApprovals}
            onComplete={() => setViewMode("list")}
            onRefresh={refresh}
          />
        </>
      )}
      {loading && approvals.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  header: {
    marginBottom: 20,
  },
  tinderHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
  },
  subtitle: {
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: "center",
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  errorContainer: {
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
})
