import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'

export default function OnboardingWelcome() {
  return (
    <Box className="flex-1 items-center justify-center bg-background-0 px-6">
      <Box className="w-full max-w-[420px]">
        <Text className="text-center text-2xl font-semibold">
          Complete your profile
        </Text>
        <Text className="mt-3 text-center text-typography-600">
          Onboarding starts here.
        </Text>
      </Box>
    </Box>
  )
}
