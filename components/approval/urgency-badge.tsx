import { View, Text, StyleSheet } from "react-native"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"

type UrgencyLevel = "high" | "medium" | "low"

type UrgencyBadgeProps = {
  urgency: UrgencyLevel | string
}

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]

  const getColors = (): { bg: string; text: string } => {
    switch (urgency.toLowerCase()) {
      case "high":
        return { bg: colors.dangerBackground, text: colors.danger }
      case "medium":
        return { bg: colors.warningBackground, text: colors.warning }
      case "low":
      default:
        return { bg: colors.successBackground, text: colors.success }
    }
  }

  const { bg, text } = getColors()

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
})
