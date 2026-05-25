import EditScreenInfo from '@/components/EditScreenInfo';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Show, useUser } from '@clerk/expo'
import { useClerk } from '@clerk/expo'
import { Link } from 'expo-router'
import { VStack } from '@/components/ui/vstack';

export default function Tab2() {
  const { user } = useUser()
  const { signOut } = useClerk()

  return (
    <Center className="flex-1 bg-background-50 px-4 py-6">
      <Box className="w-full md:w-2/3 xl:w-1/3">
        <VStack
          space="lg"
          className="items-center rounded-3xl border border-outline-100 bg-background-0 px-5 py-6 shadow-sm"
        >
          <Heading className="text-center font-bold text-2xl">Expo - Tab 1</Heading>
          <Divider className="w-full" />
          <Text className="text-center text-typography-600">
            Example below to use gluestack-ui components.
          </Text>
          <EditScreenInfo path="app/(app)/(tabs)/tab1.tsx" />
          <Text>Welcome!</Text>
          <Show when="signed-out">
            <VStack space="sm" className="w-full">
              <Link href="/(auth)/sign-in" asChild>
                <Button size="lg">
                  <ButtonText>Sign in</ButtonText>
                </Button>
              </Link>
              <Link href="/(auth)/sign-up" asChild>
                <Button size="lg" variant="outline" action="primary">
                  <ButtonText>Sign up</ButtonText>
                </Button>
              </Link>
            </VStack>
          </Show>
          <Show when="signed-in">
            <VStack space="sm" className="w-full items-center">
              <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
              <Button
                size="lg"
                variant="outline"
                action="primary"
                onPress={() => signOut()}
              >
                <ButtonText>Sign out</ButtonText>
              </Button>
            </VStack>
          </Show>
        </VStack>
      </Box>
    </Center>
  );
}
