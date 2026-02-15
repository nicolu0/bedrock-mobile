import { View, StyleSheet } from "react-native"

type CheckmarkIconProps = {
  size?: number
  color?: string
}

export function CheckmarkIcon({ size = 20, color = "#000" }: CheckmarkIconProps) {
  // Calculate dimensions for the checkmark lines
  const leftLegHeight = size * 0.4
  const rightLegHeight = size * 0.7
  const strokeWidth = Math.max(2, size * 0.1)

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Left leg (shorter, bottom-left to center) */}
      <View
        style={[
          styles.leg,
          {
            width: strokeWidth,
            height: leftLegHeight,
            backgroundColor: color,
            bottom: size * 0.15,
            left: size * 0.15,
            transform: [{ rotate: "-45deg" }],
          },
        ]}
      />
      {/* Right leg (longer, center to top-right) */}
      <View
        style={[
          styles.leg,
          {
            width: strokeWidth,
            height: rightLegHeight,
            backgroundColor: color,
            bottom: size * 0.15,
            left: size * 0.3,
            transform: [{ rotate: "45deg" }],
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  leg: {
    position: "absolute",
    borderRadius: 1,
  },
})
