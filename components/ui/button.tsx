import {
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
  PressableProps,
  ViewStyle,
  TextStyle,
} from "react-native"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"

type ButtonVariant = "primary" | "secondary" | "destructive" | "success" | "outline"
type ButtonSize = "sm" | "md" | "lg"

type ButtonProps = PressableProps & {
  title: string
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]

  const getBackgroundColor = (): string => {
    if (disabled) return colors.secondaryBackground
    switch (variant) {
      case "primary":
        return colors.tint
      case "secondary":
        return colors.secondaryBackground
      case "destructive":
        return colors.danger
      case "success":
        return colors.success
      case "outline":
        return "transparent"
      default:
        return colors.tint
    }
  }

  const getTextColor = (): string => {
    if (disabled) return colors.secondary
    switch (variant) {
      case "primary":
      case "destructive":
      case "success":
        return "#fff"
      case "secondary":
        return colors.text
      case "outline":
        return colors.tint
      default:
        return "#fff"
    }
  }

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case "sm":
        return {
          container: { paddingVertical: 8, paddingHorizontal: 12 },
          text: { fontSize: 14 },
        }
      case "lg":
        return {
          container: { paddingVertical: 16, paddingHorizontal: 24 },
          text: { fontSize: 18 },
        }
      default:
        return {
          container: { paddingVertical: 12, paddingHorizontal: 16 },
          text: { fontSize: 16 },
        }
    }
  }

  const sizeStyles = getSizeStyles()

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        sizeStyles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity: pressed ? 0.8 : 1,
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: variant === "outline" ? colors.tint : undefined,
        },
        fullWidth && styles.fullWidth,
        style as ViewStyle,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          style={[styles.text, sizeStyles.text, { color: getTextColor() }]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontWeight: "600",
  },
  fullWidth: {
    width: "100%",
  },
})
