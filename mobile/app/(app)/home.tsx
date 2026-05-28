import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Bus, CalendarDays, MapPin } from 'lucide-react-native'

const trips = [
  {
    title: 'Playa del Carmen shuttle',
    date: 'Today, 2:30 PM',
    route: 'Cancun Airport to Centro',
    status: 'Confirmed',
  },
  {
    title: 'Tulum day route',
    date: 'Tomorrow, 8:00 AM',
    route: 'Hotel Zone to Tulum Ruins',
    status: 'Pending',
  },
]

export default function TripsPage() {
  return (
    <Box className="flex-1 items-center bg-background-0 px-6 py-safe">
      <Box className="w-full max-w-[420px] flex-1 justify-center">
        <VStack space="xl">
          <VStack space="xs" className="items-center">
            <Text className="text-center text-3xl font-semibold text-typography-900">
              Trips
            </Text>
            <Text className="text-center text-sm text-typography-500">
              A lightweight view of upcoming routes and reservations.
            </Text>
          </VStack>

          <Box className="rounded-3xl bg-background-50 p-5">
            <HStack className="items-center gap-3">
              <Box className="items-center justify-center rounded-2xl bg-background-0 p-3">
                <Icon as={Bus} size="xl" className="text-typography-700" />
              </Box>
              <VStack className="flex-1">
                <Text className="font-semibold text-typography-900">
                  Next pickup
                </Text>
                <Text className="text-sm text-typography-500">
                  Cancun Airport, Terminal 3
                </Text>
              </VStack>
            </HStack>

            <HStack className="mt-5 items-center justify-between rounded-2xl bg-background-0 px-4 py-3">
              <HStack className="items-center gap-2">
                <Icon as={CalendarDays} className="text-typography-500" />
                <Text className="text-sm text-typography-600">Today</Text>
              </HStack>
              <Text className="font-medium text-typography-900">2:30 PM</Text>
            </HStack>
          </Box>

          <VStack space="sm">
            {trips.map((trip) => (
              <Box
                key={trip.title}
                className="rounded-2xl border border-outline-100 bg-background-0 px-4 py-4"
              >
                <HStack className="items-start justify-between gap-3">
                  <VStack className="flex-1">
                    <Text className="font-medium text-typography-900">
                      {trip.title}
                    </Text>
                    <HStack className="mt-2 items-center gap-2">
                      <Icon as={MapPin} size="sm" className="text-typography-500" />
                      <Text className="text-sm text-typography-500">
                        {trip.route}
                      </Text>
                    </HStack>
                    <Text className="mt-1 text-sm text-typography-500">
                      {trip.date}
                    </Text>
                  </VStack>
                  <Text className="text-xs font-medium uppercase text-typography-500">
                    {trip.status}
                  </Text>
                </HStack>
              </Box>
            ))}
          </VStack>

          <Button size="lg">
            <ButtonText>Plan a trip</ButtonText>
          </Button>
        </VStack>
      </Box>
    </Box>
  )
}
