import { View, Text, StyleSheet, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { UrgencyBadge } from "./urgency-badge"
import { StatusBadge } from "./status-badge"
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
            <View style={styles.badgeRow}>
              {approval.issue && <UrgencyBadge urgency={approval.issue.urgency} />}
              <StatusBadge status={approval.status} />
            </View>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {approval.title}
          </Text>
        </CardHeader>
        <CardContent>
          {approval.detail && (
            <Text style={[styles.detail, { color: colors.secondary }]} numberOfLines={2}>
              {approval.detail}
            </Text>
          )}
          <View style={styles.footer}>
            <Text style={[styles.date, { color: colors.secondary }]}>
              {formatDate(approval.created_at)}
            </Text>
          </View>
          {approval.issue && (
            <View style={styles.locationRow}>
              <Text style={[styles.location, { color: colors.secondary }]}>
                {approval.issue.unit.building.name} - {approval.issue.unit.name}
              </Text>
            </View>
          )}
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
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  detail: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
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
