import { useCallback, useState, useMemo, useRef, useEffect } from "react"
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from "react-native"

const SCREEN_WIDTH = Dimensions.get("window").width
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { ThemedView } from "@/components/themed-view"
import { ThemedText } from "@/components/themed-text"
import { ApprovalCard } from "@/components/approval/approval-card"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dropdown, DropdownOption } from "@/components/ui/dropdown"
import { AnimatedBottomSheet } from "@/components/ui/animated-bottom-sheet"
import { useApprovals } from "@/hooks/use-approvals"
import { useRealtimeApprovals } from "@/hooks/use-realtime-approvals"
import { useAuth } from "@/hooks/use-auth"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"
import { ActionWithDetails } from "@/types/database"
import { IconSymbol } from "@/components/ui/icon-symbol"
import { CheckmarkIcon } from "@/components/ui/checkmark-icon"

type FilterOption = "pending" | "approved" | "denied" | "all"
type SortOption = "newest" | "oldest" | "urgency"
type ActionTypeFilter = "all_types" | "triage_issue" | "schedule_vendor"
type BuildingFilter = string | "all_buildings"
type UrgencyFilter = "high" | "medium" | "low" | "all_urgencies"
type VendorTradeFilter = string | "all_trades"

export default function ApprovalsScreen() {
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]
  const router = useRouter()
  const { user, signOut } = useAuth()

  const [filter, setFilter] = useState<FilterOption>("pending")
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [sort, setSort] = useState<SortOption>("newest")
  const [actionTypeFilter, setActionTypeFilter] = useState<ActionTypeFilter>("all_types")
  const [buildingFilter, setBuildingFilter] = useState<BuildingFilter>("all_buildings")
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("all_urgencies")
  const [vendorTradeFilter, setVendorTradeFilter] = useState<VendorTradeFilter>("all_trades")
  const [filterSheetVisible, setFilterSheetVisible] = useState(false)
  const [activePickerView, setActivePickerView] = useState<"filters" | "property" | "trade">("filters")
  const pickerSlideAnim = useRef(new Animated.Value(0)).current

  const { approvals: allApprovals, loading, error, refresh } = useApprovals({ status: "all" })

  // Animate picker view transitions
  useEffect(() => {
    Animated.timing(pickerSlideAnim, {
      toValue: activePickerView === "filters" ? 0 : -SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [activePickerView, pickerSlideAnim])

  const openPropertyPicker = () => setActivePickerView("property")
  const openTradePicker = () => setActivePickerView("trade")
  const closePickerView = () => setActivePickerView("filters")

  // Reset picker view when modal closes
  useEffect(() => {
    if (!filterSheetVisible) {
      setActivePickerView("filters")
      pickerSlideAnim.setValue(0)
    }
  }, [filterSheetVisible])

  // Extract unique buildings with counts
  const uniqueBuildings = useMemo(() => {
    const buildingMap = new Map<string, { id: string; name: string; count: number }>()
    allApprovals.forEach((approval) => {
      if (approval.issue?.unit?.building) {
        const building = approval.issue.unit.building
        const existing = buildingMap.get(building.id)
        if (existing) {
          existing.count++
        } else {
          buildingMap.set(building.id, { id: building.id, name: building.name, count: 1 })
        }
      }
    })
    return Array.from(buildingMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [allApprovals])

  // Extract unique urgencies with counts
  const uniqueUrgencies = useMemo(() => {
    const urgencyMap = new Map<string, number>()
    allApprovals.forEach((approval) => {
      if (approval.issue?.urgency) {
        const urgency = approval.issue.urgency
        urgencyMap.set(urgency, (urgencyMap.get(urgency) || 0) + 1)
      }
    })
    return Array.from(urgencyMap.entries())
      .map(([urgency, count]) => ({ urgency, count }))
      .sort((a, b) => {
        const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
        return (order[a.urgency] ?? 3) - (order[b.urgency] ?? 3)
      })
  }, [allApprovals])

  // Extract unique vendor trades with counts
  const uniqueTrades = useMemo(() => {
    const tradeMap = new Map<string, number>()
    allApprovals.forEach((approval) => {
      const trade = approval.issue?.vendor?.trade || approval.issue?.suggested_vendor?.trade
      if (trade) {
        tradeMap.set(trade, (tradeMap.get(trade) || 0) + 1)
      }
    })
    return Array.from(tradeMap.entries())
      .map(([trade, count]) => ({ trade, count }))
      .sort((a, b) => a.trade.localeCompare(b.trade))
  }, [allApprovals])

  // Filter approvals based on selected filter
  const approvals = useMemo(() => {
    let result = allApprovals

    // Status filter
    if (filter !== "all") {
      result = result.filter((a) => a.status === filter)
    }

    // Action type filter
    if (actionTypeFilter !== "all_types") {
      result = result.filter((a) => a.action_type === actionTypeFilter)
    }

    // Building filter
    if (buildingFilter !== "all_buildings") {
      result = result.filter((a) => a.issue?.unit?.building?.id === buildingFilter)
    }

    // Urgency filter
    if (urgencyFilter !== "all_urgencies") {
      result = result.filter((a) => a.issue?.urgency === urgencyFilter)
    }

    // Vendor trade filter
    if (vendorTradeFilter !== "all_trades") {
      result = result.filter((a) => {
        const trade = a.issue?.vendor?.trade || a.issue?.suggested_vendor?.trade
        return trade === vendorTradeFilter
      })
    }

    // Sort
    const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "urgency": {
          const aUrg = a.issue ? (urgencyOrder[a.issue.urgency] ?? 3) : 3
          const bUrg = b.issue ? (urgencyOrder[b.issue.urgency] ?? 3) : 3
          if (aUrg !== bUrg) return aUrg - bUrg
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return result
  }, [allApprovals, filter, actionTypeFilter, buildingFilter, urgencyFilter, vendorTradeFilter, sort])

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

    const emptyMessages = {
      pending: {
        icon: "checkmark.circle" as const,
        weight: "thin" as const,
        color: colors.success,
        title: "All Caught Up!",
        text: "No pending approvals at the moment. New requests will appear here automatically.",
      },
      approved: {
        icon: "checkmark.circle" as const,
        weight: "thin" as const,
        color: colors.success,
        title: "No Approved Items",
        text: "Approved requests will appear here.",
      },
      denied: {
        icon: "xmark.circle" as const,
        weight: "thin" as const,
        color: colors.danger,
        title: "No Denied Items",
        text: "Denied requests will appear here.",
      },
      all: {
        icon: "tray" as const,
        weight: "thin" as const,
        color: colors.secondary,
        title: "No Requests Yet",
        text: "All requests will appear here.",
      },
    }

    const message = emptyMessages[filter]

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          {message.icon === "checkmark.circle" ? (
            <CheckmarkIcon size={56} color={message.color} />
          ) : (
            <IconSymbol name={message.icon} size={56} color={message.color} weight={message.weight} />
          )}
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            {message.title}
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: colors.secondary }]}>
            {message.text}
          </ThemedText>
        </View>
      </View>
    )
  }

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          const { error } = await signOut()
          if (error) {
            Alert.alert("Error", error.message)
          } else {
            setSettingsVisible(false)
            router.replace("/sign-in")
          }
        },
      },
    ])
  }

  const FilterButton = ({ label, value }: { label: string; value: FilterOption }) => (
    <Pressable
      style={[
        styles.filterButton,
        {
          backgroundColor: filter === value ? colors.tint : colors.secondaryBackground,
        },
      ]}
      onPress={() => setFilter(value)}
    >
      <ThemedText
        style={[
          styles.filterButtonText,
          { color: filter === value ? "#fff" : colors.text },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <ThemedText type="title">Approvals</ThemedText>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setSettingsVisible(true)}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: colors.secondaryBackground, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <IconSymbol name="gearshape.fill" size={20} color={colors.tint} />
          </Pressable>
        </View>
      </View>
      <View style={styles.filterRow}>
        <FilterButton label="Pending" value="pending" />
        <FilterButton label="Approved" value="approved" />
        <FilterButton label="Denied" value="denied" />
        <FilterButton label="All" value="all" />
      </View>
      <ThemedText style={[styles.subtitle, { color: colors.secondary }]}>
        {(() => {
          const parts: string[] = [`${approvals.length} request${approvals.length !== 1 ? "s" : ""}`]

          // Always show current sort
          const sortLabel = sort === "newest" ? "Newest" : sort === "oldest" ? "Oldest" : "Urgency"
          parts.push(`Sorted by ${sortLabel}`)

          // Show building filter
          if (buildingFilter !== "all_buildings") {
            const building = uniqueBuildings.find((b) => b.id === buildingFilter)
            if (building) parts.push(building.name)
          }

          // Show urgency filter
          if (urgencyFilter !== "all_urgencies") {
            parts.push(`${urgencyFilter.charAt(0).toUpperCase() + urgencyFilter.slice(1)} Urgency`)
          }

          // Show action type filter
          if (actionTypeFilter !== "all_types") {
            parts.push(actionTypeFilter === "triage_issue" ? "Triage" : "Schedule")
          }

          // Show vendor trade filter
          if (vendorTradeFilter !== "all_trades") {
            parts.push(vendorTradeFilter)
          }

          return parts.join(" · ")
        })()}
      </ThemedText>
    </View>
  )

  if (error) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.fixedHeader}>{renderHeader()}</View>
        <View style={styles.errorContainer}>
          <View style={styles.emptyContent}>
            <IconSymbol name="exclamationmark.triangle" size={56} color={colors.danger} weight="thin" />
            <ThemedText type="subtitle" style={styles.errorTitle}>
              Something went wrong
            </ThemedText>
            <ThemedText style={[styles.errorText, { color: colors.secondary }]}>
              {error}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.fixedHeader}>{renderHeader()}</View>
      <FlatList
        data={approvals}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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

      {/* Floating Filter Button */}
      <Pressable
        style={[
          styles.floatingFilterButton,
          {
            backgroundColor: colors.tint,
            bottom: insets.bottom + 16,
          },
        ]}
        onPress={() => setFilterSheetVisible(true)}
      >
        <IconSymbol name="line.3.horizontal.decrease" size={24} color="#fff" />
      </Pressable>

      {/* Settings Modal */}
      <AnimatedBottomSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.swipeIndicatorContainer}>
            <View style={styles.swipeIndicator} />
          </View>
          <ScrollView
		  	style={{ flexGrow: 0 }}
		  	contentContainerStyle={[styles.settingsContent, { flexGrow: 1, paddingBottom: 24 }]}
		  >
            <Card style={styles.settingsCard}>
              <CardHeader>
                <ThemedText type="subtitle">Account</ThemedText>
              </CardHeader>
              <CardContent>
                <View style={styles.infoRow}>
                  <IconSymbol name="person.circle" size={20} color={colors.secondary} />
                  <View style={styles.infoContent}>
                    <ThemedText style={[styles.infoLabel, { color: colors.secondary }]}>
                      Email
                    </ThemedText>
                    <ThemedText>{user?.email}</ThemedText>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <IconSymbol name="key.fill" size={20} color={colors.secondary} />
                  <View style={styles.infoContent}>
                    <ThemedText style={[styles.infoLabel, { color: colors.secondary }]}>
                      User ID
                    </ThemedText>
                    <ThemedText numberOfLines={1} style={styles.userId}>
                      {user?.id}
                    </ThemedText>
                  </View>
                </View>
              </CardContent>
            </Card>

            <View style={styles.signOutContainer}>
              <Button
                title="Sign Out"
                variant="destructive"
                size="lg"
                fullWidth
                onPress={handleSignOut}
              />
            </View>
          </ScrollView>
        </View>
      </AnimatedBottomSheet>

      {/* Filter/Sort Bottom Sheet */}
      <AnimatedBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.swipeIndicatorContainer}>
            <View style={styles.swipeIndicator} />
          </View>

          <View style={{ overflow: "hidden", minHeight: 400 }}>
            <Animated.View
              style={{
                flexDirection: "row",
                width: SCREEN_WIDTH * 2,
                transform: [{ translateX: pickerSlideAnim }],
              }}
            >
              {/* Filters View */}
              <View style={{ width: SCREEN_WIDTH }}>
                <ScrollView
                  style={styles.filterSheetContent}
                  contentContainerStyle={{ paddingBottom: 32 }}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Sort By Section */}
                  <View style={styles.filterSection}>
                    <ThemedText style={[styles.filterSectionLabel, { color: colors.label }]}>
                      SORT BY
                    </ThemedText>
                    <View style={styles.sortChipsContainer}>
                      <Pressable
                        style={[
                          styles.sortChip,
                          sort === "newest" && [styles.sortChipSelected, { backgroundColor: colors.tint }],
                          sort !== "newest" && { borderColor: colors.cardBorder },
                        ]}
                        onPress={() => setSort("newest")}
                      >
                        <ThemedText
                          style={[
                            styles.sortChipText,
                            sort === "newest" && styles.sortChipTextSelected,
                          ]}
                        >
                          Newest
                        </ThemedText>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.sortChip,
                          sort === "oldest" && [styles.sortChipSelected, { backgroundColor: colors.tint }],
                          sort !== "oldest" && { borderColor: colors.cardBorder },
                        ]}
                        onPress={() => setSort("oldest")}
                      >
                        <ThemedText
                          style={[
                            styles.sortChipText,
                            sort === "oldest" && styles.sortChipTextSelected,
                          ]}
                        >
                          Oldest
                        </ThemedText>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.sortChip,
                          sort === "urgency" && [styles.sortChipSelected, { backgroundColor: colors.tint }],
                          sort !== "urgency" && { borderColor: colors.cardBorder },
                        ]}
                        onPress={() => setSort("urgency")}
                      >
                        <ThemedText
                          style={[
                            styles.sortChipText,
                            sort === "urgency" && styles.sortChipTextSelected,
                          ]}
                        >
                          Urgency
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>

                  {/* Filter By Section */}
                  <View style={styles.filterSection}>
                    <ThemedText style={[styles.filterSectionLabel, { color: colors.label }]}>
                      FILTER BY
                    </ThemedText>

                    {/* Property Row */}
                    <Pressable
                      style={styles.filterRow}
                      onPress={openPropertyPicker}
                    >
                      <ThemedText style={styles.filterRowLabel}>Property</ThemedText>
                      <View style={styles.filterRowValue}>
                        <ThemedText style={[styles.filterRowValueText, { color: colors.secondary }]}>
                          {buildingFilter === "all_buildings"
                            ? "All Properties"
                            : uniqueBuildings.find((b) => b.id === buildingFilter)?.name || "All Properties"}
                        </ThemedText>
                        <IconSymbol
                          name="chevron.right"
                          size={16}
                          color={colors.secondary}
                        />
                      </View>
                    </Pressable>

                    {/* Trade Row */}
                    <Pressable
                      style={styles.filterRow}
                      onPress={openTradePicker}
                    >
                      <ThemedText style={styles.filterRowLabel}>Trade</ThemedText>
                      <View style={styles.filterRowValue}>
                        <ThemedText style={[styles.filterRowValueText, { color: colors.secondary }]}>
                          {vendorTradeFilter === "all_trades" ? "All Trades" : vendorTradeFilter}
                        </ThemedText>
                        <IconSymbol
                          name="chevron.right"
                          size={16}
                          color={colors.secondary}
                        />
                      </View>
                    </Pressable>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.filterActionsRow}>
                    <Pressable
                      style={[styles.resetButton, { borderColor: colors.cardBorder }]}
                      onPress={() => {
                        setSort("newest")
                        setBuildingFilter("all_buildings")
                        setVendorTradeFilter("all_trades")
                      }}
                    >
                      <ThemedText style={[styles.resetButtonText, { color: colors.text }]}>
                        Reset
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={[styles.doneButton, { backgroundColor: colors.tint }]}
                      onPress={() => setFilterSheetVisible(false)}
                    >
                      <ThemedText style={styles.doneButtonText}>
                        Done
                      </ThemedText>
                    </Pressable>
                  </View>
                </ScrollView>
              </View>

              {/* Picker View */}
              <View style={{ width: SCREEN_WIDTH }}>
                <View style={[styles.pickerFullHeader, { borderBottomColor: colors.cardBorder }]}>
                  <Pressable onPress={closePickerView}>
                    <IconSymbol name="chevron.left" size={24} color={colors.tint} />
                  </Pressable>
                  <ThemedText type="subtitle">
                    {activePickerView === "property" ? "Select Property" : "Select Trade"}
                  </ThemedText>
                  <View style={{ width: 24 }} />
                </View>
                <ScrollView style={styles.pickerFullList} contentContainerStyle={{ paddingBottom: insets.bottom }}>
                  {activePickerView === "property" || activePickerView === "filters" ? (
                    <>
                      <Pressable
                        style={styles.pickerOption}
                        onPress={() => {
                          setBuildingFilter("all_buildings")
                          closePickerView()
                        }}
                      >
                        <ThemedText style={styles.pickerOptionText}>All Properties</ThemedText>
                        {buildingFilter === "all_buildings" && (
                          <IconSymbol name="checkmark" size={20} color={colors.tint} />
                        )}
                      </Pressable>
                      {uniqueBuildings.map((building) => (
                        <Pressable
                          key={building.id}
                          style={styles.pickerOption}
                          onPress={() => {
                            setBuildingFilter(building.id)
                            closePickerView()
                          }}
                        >
                          <ThemedText style={styles.pickerOptionText}>{building.name}</ThemedText>
                          {buildingFilter === building.id && (
                            <IconSymbol name="checkmark" size={20} color={colors.tint} />
                          )}
                        </Pressable>
                      ))}
                    </>
                  ) : (
                    <>
                      <Pressable
                        style={styles.pickerOption}
                        onPress={() => {
                          setVendorTradeFilter("all_trades")
                          closePickerView()
                        }}
                      >
                        <ThemedText style={styles.pickerOptionText}>All Trades</ThemedText>
                        {vendorTradeFilter === "all_trades" && (
                          <IconSymbol name="checkmark" size={20} color={colors.tint} />
                        )}
                      </Pressable>
                      {uniqueTrades.map((trade) => (
                        <Pressable
                          key={trade.trade}
                          style={styles.pickerOption}
                          onPress={() => {
                            setVendorTradeFilter(trade.trade)
                            closePickerView()
                          }}
                        >
                          <ThemedText style={styles.pickerOptionText}>{trade.trade}</ThemedText>
                          {vendorTradeFilter === trade.trade && (
                            <IconSymbol name="checkmark" size={20} color={colors.tint} />
                          )}
                        </Pressable>
                      ))}
                    </>
                  )}
                </ScrollView>
              </View>
            </Animated.View>
          </View>
        </View>
      </AnimatedBottomSheet>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
    flexGrow: 1,
  },
  header: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
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
  subtitle: {
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: "center",
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
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
    backgroundColor: "rgba(246,245,243,0.8)",
  },
  modalContent: {
  },
  swipeIndicatorContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: "center",
  },
  swipeIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d4d4d4',
  },
  settingsContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  settingsCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  userId: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  signOutContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  floatingFilterButton: {
    position: "absolute",
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  filterSheetContent: {
    padding: 16,
    paddingBottom: 16,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3.5,
    marginBottom: 16,
  },
  sortChipsContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  sortChipSelected: {
    borderWidth: 0,
  },
  sortChipText: {
    fontSize: 15,
    fontWeight: "500",
  },
  sortChipTextSelected: {
    color: "#fff",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  filterRowLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  filterRowValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterRowValueText: {
    fontSize: 15,
  },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  pickerFullHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  pickerFullList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterOptionsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterOptionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  resetButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  doneButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})
