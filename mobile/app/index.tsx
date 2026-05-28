import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useRouter } from 'expo-router'

export default function Home() {
  const router = useRouter()

  return (
    <Box className="flex-1 items-center justify-center bg-background-0 px-6">
      <Box className="w-full max-w-[420px]">
        <Text className="text-center text-3xl font-semibold">
          PilloVan
        </Text>
        <Text className="mt-3 text-center text-typography-600">
          Plan better trips, connect with trusted operators, and keep your travel workflow in one place.
        </Text>

        <Box className="mt-8 gap-3">
          <Button
            size="lg"

            onPress={() => router.push('/(auth)/sign-up')}
          >
            <ButtonText>Create account</ButtonText>
          </Button>

          <Button
            action="secondary"
            variant="outline"
            size="lg"
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <ButtonText>Sign in</ButtonText>
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
