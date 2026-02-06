import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { useRouter } from "expo-router"
import { ThemedView } from "@/components/themed-view"
import { ThemedText } from "@/components/themed-text"
import { Button } from "@/components/ui/button"
import { Colors } from "@/constants/theme"
import { useAuth } from "@/hooks/use-auth"
import { IconSymbol } from "@/components/ui/icon-symbol"

export default function SignInScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password")
      return
    }

    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      Alert.alert("Sign In Failed", error.message)
    } else {
      router.replace("/(tabs)/approvals")
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <IconSymbol name="building.2" size={64} color={Colors.light.tint} />
            <ThemedText type="title" style={styles.title}>
              Bedrock
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: Colors.light.secondary }]}>
              AI Maintenance Workflow
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.light.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors.light.text,
                    backgroundColor: Colors.light.card,
                    borderColor: Colors.light.cardBorder,
                  },
                ]}
                placeholder="your@email.com"
                placeholderTextColor={Colors.light.secondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.light.text }]}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors.light.text,
                    backgroundColor: Colors.light.card,
                    borderColor: Colors.light.cardBorder,
                  },
                ]}
                placeholder="••••••••"
                placeholderTextColor={Colors.light.secondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
              />
            </View>

            <Button
              title="Sign In"
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleSignIn}
              loading={loading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
})
