import { Stack } from 'expo-router';
import { RecoveryProvider } from '../contexts/RecoveryContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      <RecoveryProvider>
        <AnalyticsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="emergency" />
          </Stack>
        </AnalyticsProvider>
      </RecoveryProvider>
    </PaperProvider>
  );
}