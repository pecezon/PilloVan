import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { useCurrentUser, type CurrentUserState } from '@/components/lib/useCurrentUser';
import { ThemeModeFab, ThemeModeProvider } from '@/components/ThemeModeFab';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

type AppRouteState = Exclude<CurrentUserState["state"], "loading">

const AUTH_ROUTES = {
  signedOut: {
    allowedGroups: [undefined, "(auth)"],
    defaultRoute: "/",
  },
  needsOnboarding: {
    allowedGroups: ["(onboarding)"],
    defaultRoute: "/welcome",
  },
  onboarded: {
    allowedGroups: ["(app)"],
    defaultRoute: "/home",
  },
} as const satisfies Record<AppRouteState, {
  allowedGroups: readonly (string | undefined)[]
  defaultRoute: string
}>

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

  if (!publishableKey) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
  }

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <RootLayoutNav fontsLoaded={loaded} />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

function RootLayoutNav({ fontsLoaded }: { fontsLoaded: boolean }) {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const systemColorScheme = useColorScheme();
  const currentUser = useCurrentUser();
  const hasHiddenSplashRef = useRef(false);
  const [mode, setMode] = useState<'system' | 'light' | 'dark'>('system');

  const effectiveColorScheme = mode === 'system'
    ? (systemColorScheme ?? 'light')
    : mode;
  const navigationBackground = effectiveColorScheme === 'dark'
    ? '#171717'
    : '#ffffff';
  const navigationThemeBase = effectiveColorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...navigationThemeBase,
    colors: {
      ...navigationThemeBase.colors,
      background: navigationBackground,
      card: navigationBackground,
    },
  };
  const themeColors = {
    fabIcon: effectiveColorScheme === 'dark' ? '#171717' : '#ffffff',
    mutedIcon: effectiveColorScheme === 'dark' ? '#a3a3a3' : '#737373',
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.style.backgroundColor = navigationBackground;
    document.body.style.backgroundColor = navigationBackground;
  }, [navigationBackground]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(navigationBackground);
  }, [navigationBackground]);

  useEffect(() => {
    if (!fontsLoaded || currentUser.isLoading || currentUser.state === "loading") return;

    const route = AUTH_ROUTES[currentUser.state];
    const currentGroup = segments[0];
    const allowedGroups: readonly (string | undefined)[] = route.allowedGroups;

    if (!allowedGroups.includes(currentGroup)) {
      router.replace(route.defaultRoute);
      return;
    }

    if (!hasHiddenSplashRef.current) {
      hasHiddenSplashRef.current = true;
      void SplashScreen.hideAsync();
    }
  }, [currentUser.isLoading, currentUser.state, fontsLoaded, router, segments]);

  const handleToggleTheme = () => {
    if (mode === 'system') {
      setMode('light');
    } else if (mode === 'light') {
      setMode('dark');
    } else {
      setMode('system');
    }
  };

  if (!fontsLoaded || currentUser.isLoading) {
    return (
      <GluestackUIProvider mode={effectiveColorScheme}>
        <View style={{ flex: 1, backgroundColor: navigationBackground }} />
      </GluestackUIProvider>
    );
  }

  return (
    <GluestackUIProvider mode={effectiveColorScheme}>
      <ThemeModeProvider
        value={{
          mode,
          effectiveColorScheme,
          cycleMode: handleToggleTheme,
          colors: themeColors,
        }}
      >
        <ThemeProvider value={navigationTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: navigationBackground },
              navigationBarColor: navigationBackground,
            }}
          >
            <Stack.Protected guard={currentUser.state === "signedOut"}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
            </Stack.Protected>

            <Stack.Protected guard={currentUser.state === "needsOnboarding"}>
              <Stack.Screen name="(onboarding)" />
            </Stack.Protected>

            <Stack.Protected guard={currentUser.state === "onboarded"}>
              <Stack.Screen name="(app)" />
            </Stack.Protected>
          </Stack>
          {pathname === '/' && (
            <ThemeModeFab
              mode={mode}
              effectiveColorScheme={effectiveColorScheme}
              onPress={handleToggleTheme}
            />
          )}
        </ThemeProvider>
      </ThemeModeProvider>
    </GluestackUIProvider>
  );
}
