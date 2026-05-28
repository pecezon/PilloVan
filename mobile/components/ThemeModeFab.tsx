import { Fab } from "@/components/ui/fab";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Monitor, Moon, Sun } from "lucide-react-native";
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

type ThemeMode = "system" | "light" | "dark";
type EffectiveColorScheme = "light" | "dark";

type ThemeModeContextValue = {
  mode: ThemeMode;
  effectiveColorScheme: EffectiveColorScheme;
  cycleMode: () => void;
  colors: {
    fabIcon: string;
    mutedIcon: string;
  };
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ThemeModeContextValue;
}) {
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const value = useContext(ThemeModeContext);
  if (!value) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return value;
}

type ThemeModeFabProps = {
  mode: ThemeMode;
  effectiveColorScheme: EffectiveColorScheme;
  onPress: () => void;
};

function getThemeIcon(mode: ThemeMode, effectiveColorScheme: EffectiveColorScheme) {
  if (mode === "system") return Monitor;
  return effectiveColorScheme === "dark" ? Moon : Sun;
}

function getThemeLabel(mode: ThemeMode) {
  if (mode === "system") return "System";
  if (mode === "dark") return "Dark";
  return "Light";
}

export function ThemeModeFab({ mode, effectiveColorScheme, onPress }: ThemeModeFabProps) {
  const ThemeIcon = getThemeIcon(mode, effectiveColorScheme);
  const { colors } = useThemeMode();

  return (
    <Fab onPress={onPress} className="m-6 items-center justify-center" size="lg">
      <ThemeIcon size={24} color={colors.fabIcon} strokeWidth={2.25} />
    </Fab>
  );
}

export function ThemeModeControl() {
  const { mode, effectiveColorScheme, cycleMode, colors } = useThemeMode();
  const ThemeIcon = getThemeIcon(mode, effectiveColorScheme);

  return (
    <HStack className="items-center justify-between rounded-2xl border border-outline-100 bg-background-50 px-4 py-3">
      <HStack className="items-center gap-3">
        <ThemeIcon size={20} color={colors.mutedIcon} strokeWidth={2.25} />
        <VStack>
          <Text className="font-medium text-typography-900">Theme</Text>
          <Text className="text-sm text-typography-500">{getThemeLabel(mode)}</Text>
        </VStack>
      </HStack>

      <Button size="sm" variant="outline" action="secondary" onPress={cycleMode}>
        <ThemeIcon size={16} color={colors.mutedIcon} strokeWidth={2.25} />
        <ButtonText>Change</ButtonText>
      </Button>
    </HStack>
  );
}
