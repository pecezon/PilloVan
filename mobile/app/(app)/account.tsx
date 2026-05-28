import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ThemeModeControl } from "@/components/ThemeModeFab";
import { useCurrentUser } from "@/components/lib/useCurrentUser";
import { useClerk } from "@clerk/expo";
import { BadgeCheck, Mail, ShieldCheck } from "lucide-react-native";

export default function AccountPage() {
  const { signOut } = useClerk();
  const currentUser = useCurrentUser();
  const user = currentUser.state === "onboarded" ? currentUser.user : undefined;
  const email = user?.email ?? "traveler@example.com";
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "PilloVan traveler";

  return (
    <Box className="flex-1 items-center bg-background-0 px-6 py-safe">
      <Box className="w-full max-w-[420px] flex-1 justify-center">
        <VStack space="xl">
          <VStack space="xs" className="items-center">
            <Text className="text-center text-3xl font-semibold text-typography-900">Account</Text>
            <Text className="text-center text-sm text-typography-500">
              Profile, preferences, and session controls.
            </Text>
          </VStack>

          <Box className="items-center rounded-3xl bg-background-50 px-5 py-6">
            <Avatar size="xl">
              <AvatarFallbackText>{displayName}</AvatarFallbackText>
            </Avatar>

            <Text className="mt-4 text-center text-xl font-semibold text-typography-900">
              {displayName}
            </Text>
            <HStack className="mt-2 items-center gap-2">
              <Icon as={Mail} size="sm" className="text-typography-500" />
              <Text className="text-sm text-typography-500">{email}</Text>
            </HStack>
          </Box>

          <VStack space="sm">
            <HStack className="items-center justify-between rounded-2xl border border-outline-100 bg-background-0 px-4 py-3">
              <HStack className="items-center gap-3">
                <Icon as={BadgeCheck} className="text-typography-600" />
                <VStack>
                  <Text className="font-medium text-typography-900">Account status</Text>
                  <Text className="text-sm text-typography-500">Ready for bookings</Text>
                </VStack>
              </HStack>
              <Text className="text-xs font-medium uppercase text-typography-500">Active</Text>
            </HStack>

            <HStack className="items-center justify-between rounded-2xl border border-outline-100 bg-background-0 px-4 py-3">
              <HStack className="items-center gap-3">
                <Icon as={ShieldCheck} className="text-typography-600" />
                <VStack>
                  <Text className="font-medium text-typography-900">Role</Text>
                  <Text className="text-sm text-typography-500">
                    {user?.roles.join(", ") ?? "TOURIST"}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            <ThemeModeControl />
          </VStack>

          <Button size="lg" variant="outline" action="negative" onPress={() => void signOut()}>
            <ButtonText>Sign out</ButtonText>
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
