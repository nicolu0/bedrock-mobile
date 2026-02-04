import { View, Text, StyleSheet, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { UrgencyBadge } from "./urgency-badge"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"
import { ActionWithDetails } from "@/types/database"

type ApprovalCardProps = {
  approval: ActionWithDetails
}

export function ApprovalCard({ approval }: ApprovalCardProps) {
  const router = useRouter()
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]

  const formatCost = (cost: number | null) => {
    if (!cost) return null
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cost)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <Pressable
      onPress={() => router.push(`/approval/${approval.id}`)}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
    >
      <Card style={styles.card}>
        <CardHeader>
          <View style={styles.headerRow}>
            <UrgencyBadge urgency={approval.issue.urgency} />
          </View>
          <Text style={[styles.issueName, { color: colors.text }]}>
            {approval.issue.name}
          </Text>
        </CardHeader>
        <CardContent>
          <Text style={[styles.recommendation, { color: colors.secondary }]} numberOfLines={2}>
            {approval.recommendation}
          </Text>
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              {approval.estimated_cost && (
                <Text style={[styles.cost, { color: colors.text }]}>
                  {formatCost(approval.estimated_cost)}
                </Text>
              )}
              {approval.proposed_vendor && (
                <Text style={[styles.vendor, { color: colors.secondary }]}>
                  {approval.proposed_vendor.name}
                </Text>
              )}
            </View>
            <Text style={[styles.date, { color: colors.secondary }]}>
              {formatDate(approval.created_at)}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={[styles.location, { color: colors.secondary }]}>
              {approval.issue.unit.building.name} - {approval.issue.unit.name}
            </Text>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  type: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  issueName: {
    fontSize: 18,
    fontWeight: "600",
  },
  recommendation: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cost: {
    fontSize: 16,
    fontWeight: "700",
  },
  vendor: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
  },
  locationRow: {
    marginTop: 8,
  },
  location: {
    fontSize: 12,
  },
})
