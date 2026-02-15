import { useEffect, useRef, useState } from "react"
import { View, StyleSheet, Modal, Pressable, Animated, Dimensions, Easing, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type AnimatedBottomSheetProps = {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window")
const ANIMATION_DURATION = 300

export function AnimatedBottomSheet({ visible, onClose, children }: AnimatedBottomSheetProps) {
  const insets = useSafeAreaInsets()
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current
  const [modalVisible, setModalVisible] = useState(false)
  const prevVisible = useRef(false)

  useEffect(() => {
    if (visible && !prevVisible.current) {
      setModalVisible(true)
      backdropOpacity.setValue(0)
      translateY.setValue(SCREEN_HEIGHT)

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start()
    } else if (!visible && prevVisible.current) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => setModalVisible(false))
    }

    prevVisible.current = visible
  }, [visible, backdropOpacity, translateY])

  if (!modalVisible) return null

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === "android"}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              // lift sheet above home indicator; NOT both padding+margin unless desired
              transform: [{ translateY }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    width: "100%",
    maxHeight: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
})
