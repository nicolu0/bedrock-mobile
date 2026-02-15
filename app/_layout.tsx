import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useAuth } from '@/hooks/use-auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

const BedrockTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f6f5f3',
    card: '#ffffff',
    text: '#171717',
    border: '#e5e5e5',
    primary: '#171717',
  },
};

export const unstable_settings = {
  initialRouteName: 'sign-in',
};

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'approval';

    if (!user && inAuthGroup) {
      // Redirect to sign-in if not authenticated
      router.replace('/sign-in');
    } else if (user && !inAuthGroup) {
      // Redirect to app if authenticated
      router.replace('/(tabs)/approvals');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="approval/[id]"
        options={{
          title: 'Approval Details',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={BedrockTheme}>
      <RootLayoutNav />
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f5f3',
  },
});
