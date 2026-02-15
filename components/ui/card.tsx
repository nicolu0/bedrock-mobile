import { View, StyleSheet, ViewProps } from "react-native"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"

type CardProps = ViewProps & {
  variant?: "default" | "outline"
}

export function Card({ children, variant = "default", style, ...props }: CardProps) {
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: variant === "default" ? colors.card : "transparent",
          borderColor: colors.cardBorder,
          borderWidth: 1,
          shadowColor: '#000',
          shadowOpacity: 0.02,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}

export function CardHeader({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  )
}

export function CardContent({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  )
}

export function CardFooter({ children, style, ...props }: ViewProps) {
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]

  return (
    <View
      style={[styles.footer, { borderTopColor: colors.cardBorder }, style]}
      {...props}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
})
