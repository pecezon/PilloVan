import { Icon } from '@/components/ui/icon'
import { useThemeMode } from '@/components/ThemeModeFab'
import { Tabs } from 'expo-router'
import { Bus, UserRound } from 'lucide-react-native'
import type { ComponentProps } from 'react'

function TabIcon({
  as,
  color,
}: {
  as: ComponentProps<typeof Icon>['as']
  color: string
}) {
  return <Icon as={as} size="lg" style={{ color }} />
}

export default function AppTabsLayout() {
  const { effectiveColorScheme } = useThemeMode()
  const tabBackground = effectiveColorScheme === 'dark' ? '#171717' : '#ffffff'

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: tabBackground },
        tabBarActiveTintColor: '#0f766e',
        tabBarInactiveTintColor: '#737373',
        tabBarStyle: {
          backgroundColor: tabBackground,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color }) => <TabIcon as={Bus} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <TabIcon as={UserRound} color={color} />,
        }}
      />
    </Tabs>
  )
}
