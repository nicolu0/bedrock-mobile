import { View, Text, StyleSheet, ScrollView } from "react-native"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { UrgencyBadge } from "./urgency-badge"
import { StatusBadge } from "./status-badge"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"
import { ActionWithDetails } from "@/types/database"
import { IconSymbol } from "@/components/ui/icon-symbol"

type ApprovalDetailProps = {
  approval: ActionWithDetails
}

export function ApprovalDetail({ approval }: ApprovalDetailProps) {
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Action Details */}
      <Card style={styles.section}>
        <CardHeader>
          <View style={styles.headerRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Action Details</Text>
            <StatusBadge status={approval.status} />
          </View>
        </CardHeader>
        <CardContent>
          <Text style={[styles.actionTitle, { color: colors.text }]}>
            {approval.title}
          </Text>
          {approval.detail && (
            <Text style={[styles.detail, { color: colors.secondary }]}>
              {approval.detail}
            </Text>
          )}
          <View style={[styles.timestampRow, { borderTopColor: colors.cardBorder }]}>
            <Text style={[styles.timestampLabel, { color: colors.secondary }]}>Created</Text>
            <Text style={[styles.timestampValue, { color: colors.text }]}>
              {formatDate(approval.created_at)}
            </Text>
          </View>
          {approval.status !== "pending" && (
            <View style={styles.updatedRow}>
              <Text style={[styles.timestampLabel, { color: colors.secondary }]}>Updated</Text>
              <Text style={[styles.timestampValue, { color: colors.text }]}>
                {formatDate(approval.updated_at)}
              </Text>
            </View>
          )}
        </CardContent>
      </Card>

      {/* Issue Info (only if linked to an issue) */}
      {approval.issue && (
        <Card style={styles.section}>
          <CardHeader>
            <View style={styles.headerRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Related Issue</Text>
              <UrgencyBadge urgency={approval.issue.urgency} />
            </View>
          </CardHeader>
          <CardContent>
            <Text style={[styles.issueName, { color: colors.text }]}>
              {approval.issue.name}
            </Text>
            {approval.issue.description && (
              <Text style={[styles.description, { color: colors.secondary }]}>
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
          </CardContent>
        </Card>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  detail: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  timestampRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  updatedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  timestampLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  timestampValue: {
    fontSize: 14,
  },
  issueName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
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
})
