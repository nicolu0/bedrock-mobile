import { View, Text, StyleSheet } from "react-native"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"

type StatusBadgeProps = {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]

  const getColors = (): { bg: string; text: string } => {
    switch (status.toLowerCase()) {
      case "approved":
        return { bg: colors.successBackground, text: colors.success }
      case "denied":
        return { bg: colors.dangerBackground, text: colors.danger }
      case "pending":
        return { bg: colors.warningBackground, text: colors.warning }
      default:
        return { bg: colors.secondaryBackground, text: colors.secondary }
    }
  }

  const { bg, text } = getColors()

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
})
