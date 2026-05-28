import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useRouter } from 'expo-router'
import { Bus, CalendarDays, MapPin, Plus } from 'lucide-react-native'
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet'
import { Badge, BadgeText } from '@/components/ui/badge'
import { Box } from '@/components/ui/box'
import { Fab, FabIcon } from '@/components/ui/fab'
import { HStack } from '@/components/ui/hstack'
import { Heading } from '@/components/ui/heading'
import { Icon, ChevronDownIcon } from '@/components/ui/icon'
import { Pressable } from '@/components/ui/pressable'
import { ScrollView } from '@/components/ui/scroll-view'
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast'
import { VStack } from '@/components/ui/vstack'
import { useCurrentUser } from '@/components/lib/useCurrentUser'
import { api } from '@/convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import type { Id } from '@/convex/_generated/dataModel'
import type { TripStatus, UserRoles } from '@/shared/enums'

type TripItem = FunctionReturnType<typeof api.trips.listMyTrips>[number]

const ACTIVE_STATUSES: TripStatus[] = ['PENDING', 'IN_PROGRESS']

const statusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
] as const satisfies readonly { label: string; value: TripStatus }[]

const statusAction: Record<
  TripStatus,
  'success' | 'error' | 'warning' | 'info'
> = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
}

function formatPickupTime(pickupTime: number) {
  return new Date(pickupTime).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function TripStatusBadge({ status }: { status: TripStatus }) {
  const label = statusOptions.find((option) => option.value === status)?.label ?? status
  return (
    <Badge action={statusAction[status]} variant="solid">
      <BadgeText>{label}</BadgeText>
    </Badge>
  )
}

function TripCard({ trip, onPress }: { trip: TripItem; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Box className="rounded-2xl border border-outline-100 bg-background-0 px-4 py-4">
        <HStack className="items-start justify-between gap-3">
          <VStack className="flex-1">
            <Text className="font-medium text-typography-900">
              {trip.tour?.name ?? 'Trip'}
            </Text>
            <HStack className="mt-2 items-center gap-2">
              <Icon as={MapPin} size="sm" className="text-typography-500" />
              <Text className="text-sm text-typography-500">
                {trip.pickupLocation} → {trip.dropoffLocation}
              </Text>
            </HStack>
            <HStack className="mt-1 items-center gap-2">
              <Icon as={CalendarDays} size="sm" className="text-typography-500" />
              <Text className="text-sm text-typography-500">
                {formatPickupTime(trip.pickupTime)}
              </Text>
            </HStack>
          </VStack>
          <TripStatusBadge status={trip.status} />
        </HStack>
      </Box>
    </Pressable>
  )
}

export default function TripsPage() {
  const router = useRouter()
  const currentUser = useCurrentUser()
  const roles: UserRoles[] = currentUser.roles
  const canManage = roles.includes('COMPANY') || roles.includes('ADMIN')

  const trips = useQuery(api.trips.listMyTrips, {})
  const updateTripStatus = useMutation(api.trips.updateTripStatus)
  const toast = useToast()

  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null)

  const activeTrips = trips?.filter((trip) => ACTIVE_STATUSES.includes(trip.status)) ?? []
  const pastTrips = trips?.filter((trip) => !ACTIVE_STATUSES.includes(trip.status)) ?? []

  const handleStatusChange = async (tripId: Id<'trips'>, status: TripStatus) => {
    try {
      await updateTripStatus({ tripId, status })
      setSelectedTrip((current) =>
        current && current._id === tripId ? { ...current, status } : current
      )
    } catch (error) {
      const message =
        error instanceof ConvexError ? String(error.data) : 'Could not update status.'
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>Couldn&apos;t update</ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        ),
      })
    }
  }

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView
        className="flex-1"
        contentContainerClassName="items-center px-6 py-safe"
      >
        <Box className="w-full max-w-[420px]">
          <VStack space="xl">
            <VStack space="xs" className="items-center">
              <Heading className="text-center text-3xl font-semibold text-typography-900">
                Trips
              </Heading>
              <Text className="text-center text-sm text-typography-500">
                Upcoming routes and reservations.
              </Text>
            </VStack>

            {trips === undefined ? (
              <Box className="items-center py-12">
                <Spinner />
              </Box>
            ) : trips.length === 0 ? (
              <Box className="items-center rounded-3xl bg-background-50 px-5 py-10">
                <Icon as={Bus} size="xl" className="text-typography-400" />
                <Text className="mt-4 text-center text-typography-500">
                  No trips yet.
                  {canManage ? ' Tap + to create one.' : ' Your trips will appear here.'}
                </Text>
              </Box>
            ) : (
              <VStack space="xl">
                {activeTrips.length > 0 && (
                  <VStack space="sm">
                    <Text className="text-sm font-semibold uppercase text-typography-500">
                      Active
                    </Text>
                    {activeTrips.map((trip) => (
                      <TripCard
                        key={trip._id}
                        trip={trip}
                        onPress={() => setSelectedTrip(trip)}
                      />
                    ))}
                  </VStack>
                )}

                {pastTrips.length > 0 && (
                  <VStack space="sm">
                    <Text className="text-sm font-semibold uppercase text-typography-500">
                      Past
                    </Text>
                    {pastTrips.map((trip) => (
                      <TripCard
                        key={trip._id}
                        trip={trip}
                        onPress={() => setSelectedTrip(trip)}
                      />
                    ))}
                  </VStack>
                )}
              </VStack>
            )}
          </VStack>
        </Box>
      </ScrollView>

      {canManage && (
        <Fab size="lg" placement="bottom right" onPress={() => setShowCreateMenu(true)}>
          <FabIcon as={Plus} />
        </Fab>
      )}

      <Actionsheet isOpen={showCreateMenu} onClose={() => setShowCreateMenu(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ActionsheetItem
            onPress={() => {
              setShowCreateMenu(false)
              router.push('/create-trip')
            }}
          >
            <ActionsheetItemText>Create trip</ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem
            onPress={() => {
              setShowCreateMenu(false)
              router.push('/create-tour')
            }}
          >
            <ActionsheetItemText>Create tour</ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>

      <Actionsheet isOpen={selectedTrip !== null} onClose={() => setSelectedTrip(null)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {selectedTrip && (
            <Box className="w-full px-4 py-2">
              <VStack space="md">
                <VStack space="xs">
                  <Heading size="lg" className="text-typography-900">
                    {selectedTrip.tour?.name ?? 'Trip'}
                  </Heading>
                  {selectedTrip.tour?.place ? (
                    <Text className="text-sm text-typography-500">
                      {selectedTrip.tour.place}
                    </Text>
                  ) : null}
                </VStack>

                <VStack space="xs">
                  <HStack className="items-center gap-2">
                    <Icon as={MapPin} size="sm" className="text-typography-500" />
                    <Text className="text-sm text-typography-600">
                      {selectedTrip.pickupLocation} → {selectedTrip.dropoffLocation}
                    </Text>
                  </HStack>
                  <HStack className="items-center gap-2">
                    <Icon as={CalendarDays} size="sm" className="text-typography-500" />
                    <Text className="text-sm text-typography-600">
                      {formatPickupTime(selectedTrip.pickupTime)}
                    </Text>
                  </HStack>
                  <Text className="text-sm text-typography-600">
                    Party size: {selectedTrip.partySize}
                  </Text>
                </VStack>

                {canManage ? (
                  <VStack space="xs">
                    <Text className="text-sm font-medium text-typography-700">
                      Status
                    </Text>
                    <Select
                      selectedValue={selectedTrip.status}
                      onValueChange={(value) =>
                        void handleStatusChange(selectedTrip._id, value as TripStatus)
                      }
                    >
                      <SelectTrigger size="lg" variant="outline">
                        <SelectInput />
                        <SelectIcon as={ChevronDownIcon} className="mr-3" />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          {statusOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              label={option.label}
                              value={option.value}
                            />
                          ))}
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  </VStack>
                ) : (
                  <HStack className="items-center gap-2">
                    <Text className="text-sm font-medium text-typography-700">
                      Status
                    </Text>
                    <TripStatusBadge status={selectedTrip.status} />
                  </HStack>
                )}
              </VStack>
            </Box>
          )}
        </ActionsheetContent>
      </Actionsheet>
    </Box>
  )
}
