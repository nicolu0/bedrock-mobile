import { View, StyleSheet, ScrollView, Alert } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { ThemedView } from "@/components/themed-view"
import { ThemedText } from "@/components/themed-text"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Colors } from "@/constants/theme"
import { useColorScheme } from "@/hooks/use-color-scheme"
import { useAuth } from "@/hooks/use-auth"
import { IconSymbol } from "@/components/ui/icon-symbol"

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme() ?? "light"
  const colors = Colors[colorScheme]
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            const { error } = await signOut()
            if (error) {
              Alert.alert("Error", error.message)
            } else {
              router.replace("/sign-in")
            }
          },
        },
      ]
    )
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Settings</ThemedText>
        </View>

        <Card style={styles.card}>
          <CardHeader>
            <ThemedText type="subtitle">Account</ThemedText>
          </CardHeader>
          <CardContent>
            <View style={styles.infoRow}>
              <IconSymbol name="person.circle" size={20} color={colors.secondary} />
              <View style={styles.infoContent}>
                <ThemedText style={[styles.infoLabel, { color: colors.secondary }]}>
                  Email
                </ThemedText>
                <ThemedText>{user?.email}</ThemedText>
              </View>
            </View>
            <View style={styles.infoRow}>
              <IconSymbol name="key.fill" size={20} color={colors.secondary} />
              <View style={styles.infoContent}>
                <ThemedText style={[styles.infoLabel, { color: colors.secondary }]}>
                  User ID
                </ThemedText>
                <ThemedText numberOfLines={1} style={styles.userId}>
                  {user?.id}
                </ThemedText>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader>
            <ThemedText type="subtitle">About</ThemedText>
          </CardHeader>
          <CardContent>
            <View style={styles.infoRow}>
              <IconSymbol name="building.2" size={20} color={colors.secondary} />
              <View style={styles.infoContent}>
                <ThemedText style={[styles.infoLabel, { color: colors.secondary }]}>
                  App Version
                </ThemedText>
                <ThemedText>1.0.0</ThemedText>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader>
            <ThemedText type="subtitle">AI Maintenance System</ThemedText>
          </CardHeader>
          <CardContent>
            <ThemedText style={{ color: colors.secondary }}>
              This app helps property managers review and approve AI-recommended actions for
              maintenance issues. Review pending approvals, make decisions, and track the
              history of all AI actions.
            </ThemedText>
          </CardContent>
        </Card>

        <View style={styles.signOutContainer}>
          <Button
            title="Sign Out"
            variant="destructive"
            size="lg"
            fullWidth
            onPress={handleSignOut}
          />
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  userId: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  signOutContainer: {
    marginTop: 16,
  },
})
