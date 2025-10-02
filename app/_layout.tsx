import { Stack } from 'expo-router';
import { RecoveryProvider } from '../contexts/RecoveryContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <RecoveryProvider>
          <AnalyticsProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="emergency" />
              <Stack.Screen name="analytics" />
            </Stack>
          </AnalyticsProvider>
        </RecoveryProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}