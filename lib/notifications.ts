import * as Device from "expo-device"
import * as Notifications from "expo-notifications"
import Constants from "expo-constants"
import { Platform } from "react-native"
import { supabase } from "./supabase"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device")
    return null
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  // Request permissions if not already granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permissions not granted")
    return null
  }

  // Get the Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    })

    // Configure Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("approvals", {
        name: "Approval Requests",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0a7ea4",
      })
    }

    return token.data
  } catch (error) {
    console.error("Error getting push token:", error)
    return null
  }
}

export async function savePushToken(userId: string, token: string): Promise<boolean> {
  try {
    // This would save to a user_push_tokens table
    // For now, we'll store it in the user's metadata or a separate table
    const { error } = await supabase
      .from("users")
      .update({ push_token: token } as any)
      .eq("id", userId)

    if (error) {
      console.error("Error saving push token:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error saving push token:", error)
    return false
  }
}

export function addNotificationListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback)
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback)
}

export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count)
}
