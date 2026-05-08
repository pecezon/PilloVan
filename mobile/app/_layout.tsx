import { Stack, Redirect } from 'expo-router';
import 'react-native-reanimated';
import '../global.css';

import { AuthProvider } from '../src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(app)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="index" />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
