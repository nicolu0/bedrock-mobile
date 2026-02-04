import { useState, useCallback } from "react"
import {
  View,
  Text,
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
import { useApprovals } from "@/hooks/use-approvals"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"
import { ActionWithDetails, ActionStatus } from "@/types/database"
import { IconSymbol } from "@/components/ui/icon-symbol"

type FilterOption = "all" | "approved" | "denied"

export default function HistoryScreen() {
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]

  const [filter, setFilter] = useState<FilterOption>("all")

  // Fetch all non-pending approvals
  const { approvals: allApprovals, loading, error, refresh } = useApprovals({
    status: "all",
  })

  // Filter out pending and apply local filter
  const approvals = allApprovals.filter((a) => {
    if (a.status === "pending") return false
    if (filter === "all") return true
    return a.status === filter
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
        <IconSymbol name="clock.arrow.circlepath" size={64} color={colors.secondary} />
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          No History Yet
        </ThemedText>
        <ThemedText style={[styles.emptyText, { color: colors.secondary }]}>
          Your approved and denied requests will appear here.
        </ThemedText>
      </View>
    )
  }

  const FilterButton = ({
    label,
    value,
  }: {
    label: string
    value: FilterOption
  }) => (
    <Pressable
      style={[
        styles.filterButton,
        {
          backgroundColor:
            filter === value ? colors.tint : colors.secondaryBackground,
        },
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          { color: filter === value ? "#fff" : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText type="title">History</ThemedText>
      <View style={styles.filterRow}>
        <FilterButton label="All" value="all" />
        <FilterButton label="Approved" value="approved" />
        <FilterButton label="Denied" value="denied" />
      </View>
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
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
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
