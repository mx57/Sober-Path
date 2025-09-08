import { Stack } from 'expo-router';
import { RecoveryProvider } from '../contexts/RecoveryContext';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      <RecoveryProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="emergency" />
        </Stack>
      </RecoveryProvider>
    </PaperProvider>
  );
}