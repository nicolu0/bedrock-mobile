import { useState } from "react"
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native"
import { ThemedText } from "@/components/themed-text"
import { IconSymbol } from "@/components/ui/icon-symbol"
import { CheckmarkIcon } from "@/components/ui/checkmark-icon"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"

export type DropdownOption = {
  label: string
  value: string
  count?: number
}

export type DropdownProps = {
  label: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  placeholder?: string
}

export function Dropdown({ label, value, options, onChange, placeholder }: DropdownProps) {
  const [visible, setVisible] = useState(false)
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]

  const selectedOption = options.find((opt) => opt.value === value)
  const displayText = selectedOption?.label || placeholder || "Select..."

  return (
    <>
      <View style={styles.container}>
        <ThemedText style={[styles.label, { color: colors.label }]}>{label}</ThemedText>
        <Pressable
          style={[styles.trigger, { backgroundColor: colors.secondaryBackground, borderColor: colors.cardBorder }]}
          onPress={() => setVisible(true)}
        >
          <ThemedText style={styles.triggerText}>{displayText}</ThemedText>
          <IconSymbol name="chevron.down" size={16} color={colors.secondary} />
        </Pressable>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">{label}</ThemedText>
              <Pressable onPress={() => setVisible(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.secondary} />
              </Pressable>
            </View>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const isSelected = option.value === value
                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.option,
                      {
                        backgroundColor: isSelected
                          ? colors.secondaryBackground
                          : "transparent",
                      },
                    ]}
                    onPress={() => {
                      onChange(option.value)
                      setVisible(false)
                    }}
                  >
                    <View style={styles.optionContent}>
                      <ThemedText style={styles.optionLabel}>
                        {option.label}
                        {option.count !== undefined && (
                          <ThemedText style={[styles.optionCount, { color: colors.secondary }]}>
                            {" "}({option.count})
                          </ThemedText>
                        )}
                      </ThemedText>
                      {isSelected && (
                        <CheckmarkIcon size={20} color={colors.tint} />
                      )}
                    </View>
                  </Pressable>
                )
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3.5,
    marginBottom: 8,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  triggerText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLabel: {
    fontSize: 16,
    flex: 1,
  },
  optionCount: {
    fontSize: 14,
  },
})
