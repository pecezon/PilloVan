import { useThemeMode } from "@/components/ThemeModeFab";
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  const { effectiveColorScheme } = useThemeMode();
  const backgroundColor = effectiveColorScheme === "dark" ? "#171717" : "#ffffff";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor },
        navigationBarColor: backgroundColor,
      }}
    />
  );
}
