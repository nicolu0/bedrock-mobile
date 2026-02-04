import { View, Text, StyleSheet, ScrollView } from "react-native"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { UrgencyBadge } from "./urgency-badge"
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

  const formatCost = (cost: number | null) => {
    if (!cost) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cost)
  }

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
      {/* Issue Info */}
      <Card style={styles.section}>
        <CardHeader>
          <View style={styles.headerRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Issue Details</Text>
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

      {/* AI Recommendation */}
      <Card style={styles.section}>
        <CardHeader>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Recommendation</Text>
        </CardHeader>
        <CardContent>
          <Text style={[styles.recommendation, { color: colors.text }]}>
            {approval.recommendation}
          </Text>
          {approval.reasoning && (
            <View style={[styles.reasoningBox, { backgroundColor: colors.secondaryBackground }]}>
              <Text style={[styles.reasoningLabel, { color: colors.secondary }]}>
                Reasoning
              </Text>
              <Text style={[styles.reasoning, { color: colors.text }]}>
                {approval.reasoning}
              </Text>
            </View>
          )}
        </CardContent>
      </Card>

      {/* Cost & Vendor */}
      {(approval.estimated_cost || approval.proposed_vendor) && (
        <Card style={styles.section}>
          <CardHeader>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Cost & Vendor</Text>
          </CardHeader>
          <CardContent>
            {approval.estimated_cost && (
              <View style={styles.costRow}>
                <Text style={[styles.costLabel, { color: colors.secondary }]}>
                  Estimated Cost
                </Text>
                <Text style={[styles.costValue, { color: colors.text }]}>
                  {formatCost(approval.estimated_cost)}
                </Text>
              </View>
            )}
            {approval.proposed_vendor && (
              <View style={[styles.vendorBox, { borderColor: colors.cardBorder }]}>
                <Text style={[styles.vendorLabel, { color: colors.secondary }]}>
                  Proposed Vendor
                </Text>
                <Text style={[styles.vendorName, { color: colors.text }]}>
                  {approval.proposed_vendor.name}
                </Text>
                {approval.proposed_vendor.trade && (
                  <Text style={[styles.vendorTrade, { color: colors.secondary }]}>
                    {approval.proposed_vendor.trade}
                  </Text>
                )}
                {approval.proposed_vendor.email && (
                  <Text style={[styles.vendorContact, { color: colors.secondary }]}>
                    {approval.proposed_vendor.email}
                  </Text>
                )}
                {approval.proposed_vendor.phone && (
                  <Text style={[styles.vendorContact, { color: colors.secondary }]}>
                    {approval.proposed_vendor.phone}
                  </Text>
                )}
              </View>
            )}
          </CardContent>
        </Card>
      )}

      {/* Decision Info (for history view) */}
      {approval.status !== "pending" && (
        <Card style={styles.section}>
          <CardHeader>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Decision</Text>
          </CardHeader>
          <CardContent>
            <View style={styles.decisionRow}>
              <Text style={[styles.decisionLabel, { color: colors.secondary }]}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      approval.status === "approved"
                        ? colors.successBackground
                        : colors.dangerBackground,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        approval.status === "approved" ? colors.success : colors.danger,
                    },
                  ]}
                >
                  {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.decisionRow}>
              <Text style={[styles.decisionLabel, { color: colors.secondary }]}>
                Updated At
              </Text>
              <Text style={[styles.decisionValue, { color: colors.text }]}>
                {formatDate(approval.updated_at)}
              </Text>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Timestamp */}
      <Text style={[styles.timestamp, { color: colors.secondary }]}>
        Created {formatDate(approval.created_at)}
      </Text>
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
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
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
  recommendation: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  reasoningBox: {
    padding: 12,
    borderRadius: 8,
  },
  reasoningLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  reasoning: {
    fontSize: 14,
    lineHeight: 20,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  costLabel: {
    fontSize: 14,
  },
  costValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  vendorBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  vendorLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "600",
  },
  vendorTrade: {
    fontSize: 14,
    marginTop: 2,
  },
  vendorContact: {
    fontSize: 14,
    marginTop: 4,
  },
  decisionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  decisionLabel: {
    fontSize: 14,
  },
  decisionValue: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  notesBox: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
})
