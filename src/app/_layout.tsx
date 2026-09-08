import { colors } from '@/styles/global';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name='index' options={{ headerShown: false, title: 'Home' }} />
      <Stack.Screen options={{ title: 'Meals' }} name='meals' />
    </Stack>
  );
}