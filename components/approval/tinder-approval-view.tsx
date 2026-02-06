import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Animated, Pressable } from "react-native"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { UrgencyBadge } from "./urgency-badge"
import { StatusBadge } from "./status-badge"
import { ApprovalActions } from "./approval-actions"
import { IconSymbol } from "@/components/ui/icon-symbol"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"
import { ActionWithDetails } from "@/types/database"

type TinderApprovalViewProps = {
  approvals: ActionWithDetails[]
  onComplete: () => void
  onRefresh: () => void
}

export function TinderApprovalView({
  approvals,
  onComplete,
  onRefresh,
}: TinderApprovalViewProps) {
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeAnim] = useState(new Animated.Value(1))

  // Clamp index if realtime updates remove items
  useEffect(() => {
    if (approvals.length > 0 && currentIndex >= approvals.length) {
      setCurrentIndex(Math.max(0, approvals.length - 1))
    }
  }, [approvals.length, currentIndex])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const handleSuccess = () => {
    // Animate out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Move to next
      const nextIndex = currentIndex + 1
      if (nextIndex >= approvals.length) {
        // All done - stay on completion state
        setCurrentIndex(nextIndex)
      } else {
        setCurrentIndex(nextIndex)
      }
      // Animate in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    })
  }

  // Show completion state
  if (currentIndex >= approvals.length || approvals.length === 0) {
    return (
      <View style={styles.completionContainer}>
        <IconSymbol name="checkmark.circle" size={80} color={colors.success} />
        <Text style={[styles.completionTitle, { color: colors.text }]}>
          All Caught Up!
        </Text>
        <Text style={[styles.completionSubtitle, { color: colors.secondary }]}>
          You have processed all pending approvals.
        </Text>
        <Pressable
          style={[styles.switchButton, { backgroundColor: colors.tint }]}
          onPress={onComplete}
        >
          <Text style={styles.switchButtonText}>Switch to List View</Text>
        </Pressable>
      </View>
    )
  }

  const approval = approvals[currentIndex]

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.secondary }]}>
            {currentIndex + 1} of {approvals.length}
          </Text>
        </View>

        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.badgeRow}>
              {approval.issue && <UrgencyBadge urgency={approval.issue.urgency} />}
              <StatusBadge status={approval.status} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {approval.title}
            </Text>
          </CardHeader>
          <CardContent>
            {approval.detail && (
              <Text style={[styles.detail, { color: colors.secondary }]}>
                {approval.detail}
              </Text>
            )}

            {/* Issue Info */}
            {approval.issue && (
              <View style={[styles.issueSection, { borderTopColor: colors.cardBorder }]}>
                <Text style={[styles.issueName, { color: colors.text }]}>
                  {approval.issue.name}
                </Text>
                {approval.issue.description && (
                  <Text style={[styles.issueDescription, { color: colors.secondary }]}>
                    {approval.issue.description}
                  </Text>
                )}
                <View style={styles.infoRow}>
                  <IconSymbol name="building.2" size={16} color={colors.secondary} />
                  <Text style={[styles.infoText, { color: colors.secondary }]}>
                    {approval.issue.unit.building.name} - Unit {approval.issue.unit.name}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <IconSymbol name="person" size={16} color={colors.secondary} />
                  <Text style={[styles.infoText, { color: colors.secondary }]}>
                    {approval.issue.tenant.name} ({approval.issue.tenant.email})
                  </Text>
                </View>
              </View>
            )}

            {/* Timestamp */}
            <View style={[styles.timestampRow, { borderTopColor: colors.cardBorder }]}>
              <Text style={[styles.timestampLabel, { color: colors.secondary }]}>
                Created
              </Text>
              <Text style={[styles.timestampValue, { color: colors.text }]}>
                {formatDate(approval.created_at)}
              </Text>
            </View>
          </CardContent>
        </Card>
      </Animated.View>

      <ApprovalActions
        approvalId={approval.id}
        onSuccess={handleSuccess}
        onError={(error) => console.error("Approval error:", error)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "500",
  },
  card: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  detail: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  issueSection: {
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
  },
  issueName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
  },
  timestampRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
  },
  timestampLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  timestampValue: {
    fontSize: 14,
  },
  completionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
    textAlign: "center",
  },
  completionSubtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 24,
  },
  switchButton: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  switchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
